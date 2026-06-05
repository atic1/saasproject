const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');

class EsewaProvider extends PaymentProvider {
  constructor() {
    super();
    this.sandboxFormUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    this.productionFormUrl = 'https://epay.esewa.com.np/api/epay/main/v2/form';
    this.sandboxStatusUrl = 'https://rc.esewa.com.np/api/epay/transaction/status/';
    this.productionStatusUrl = 'https://esewa.com.np/api/epay/transaction/status/';
  }

  /**
   * Helper to retrieve eSewa credentials (either from Business settings or env fallbacks)
   */
  getCredentials(business) {
    const isProd = process.env.NODE_ENV === 'production';
    const settings = business?.paymentGateways?.esewa || {};
    
    // Standard sandbox credentials
    const defaultProduct = 'EPAYTEST';
    const defaultSecret = '8g8M8t3H8M80.q';

    return {
      productCode: settings.merchantId || process.env.ESEWA_PRODUCT_CODE || defaultProduct,
      secretKey: settings.secretKey || process.env.ESEWA_SECRET_KEY || defaultSecret,
      isEnabled: settings.enabled !== undefined ? settings.enabled : false,
      isProd: isProd && settings.enabled
    };
  }

  async initiatePayment({ payment, invoice, business }) {
    const { productCode, secretKey, isProd } = this.getCredentials(business);
    const formUrl = isProd ? this.productionFormUrl : this.sandboxFormUrl;

    const subtotal = Number(payment.amount.subtotal || payment.amount.total).toFixed(2);
    const tax = Number(payment.amount.tax || 0).toFixed(2);
    const total = Number(payment.amount.total).toFixed(2);

    const successUrl = process.env.ESEWA_SUCCESS_URL || `http://localhost:5000/api/payments/callback/esewa/success`;
    const failureUrl = process.env.ESEWA_FAILURE_URL || `http://localhost:5000/api/payments/callback/esewa/failure`;

    // Construct signature message
    const message = `total_amount=${total},transaction_uuid=${payment.transaction_uuid},product_code=${productCode}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64');

    return {
      type: 'form',
      url: formUrl,
      method: 'POST',
      fields: {
        amount: subtotal,
        tax_amount: tax,
        total_amount: total,
        transaction_uuid: payment.transaction_uuid,
        product_code: productCode,
        success_url: successUrl,
        failure_url: failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature
      }
    };
  }

  async verifyPayment({ payment, callbackData }) {
    // Perform server-to-server status check
    const business = payment.businessId ? await require('../../models/business').findById(payment.businessId) : null;
    const { productCode, isProd } = this.getCredentials(business);
    const statusUrl = isProd ? this.productionStatusUrl : this.sandboxStatusUrl;

    const total = Number(payment.amount.total).toFixed(2);
    const queryUrl = `${statusUrl}?product_code=${productCode}&total_amount=${total}&transaction_uuid=${payment.transaction_uuid}`;

    try {
      const res = await fetch(queryUrl);
      if (!res.ok) {
        throw new Error(`eSewa status check failed with code ${res.status}`);
      }
      const data = await res.json();
      
      const isSuccess = data.status === 'COMPLETE';
      return {
        status: isSuccess ? 'completed' : 'failed',
        transactionId: data.transaction_code || null,
        amount: Number(data.total_amount) || payment.amount.total,
        rawResponse: data
      };
    } catch (err) {
      console.error('eSewa Server-to-Server Verification Error:', err.message);
      // Fallback: if server check fails but signature was validated, return pending_verification
      return {
        status: 'pending_verification',
        transactionId: null,
        amount: payment.amount.total,
        error: err.message
      };
    }
  }

  async handleCallback(req) {
    const { data } = req.query || req.body;
    if (!data) {
      throw new Error('Callback data missing');
    }

    // Decode base64 response
    const decodedString = Buffer.from(data, 'base64').toString('ascii');
    const decodedData = JSON.parse(decodedString);

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    } = decodedData;

    // Resolve the payment record to fetch the business details (tenant isolation)
    const Payment = require('../../models/payment');
    const payment = await Payment.findOne({ transaction_uuid });
    if (!payment) {
      throw new Error(`Payment not found for UUID: ${transaction_uuid}`);
    }

    const Business = require('../../models/business');
    const business = await Business.findById(payment.businessId);
    const { secretKey } = this.getCredentials(business);

    // Reconstruct and verify signature
    const signedFields = signed_field_names.split(',');
    const signatureMessage = signedFields
      .map(field => `${field}=${decodedData[field]}`)
      .join(',');

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureMessage)
      .digest('base64');

    if (signature !== expectedSignature) {
      throw new Error('Callback signature verification failed');
    }

    return {
      transaction_uuid,
      status: status === 'COMPLETE' ? 'completed' : 'failed',
      transactionId: transaction_code,
      amount: Number(total_amount),
      callbackData: decodedData
    };
  }
}

module.exports = EsewaProvider;
