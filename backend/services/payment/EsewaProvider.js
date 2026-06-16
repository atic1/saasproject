const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');
const Business = require('../../models/business');
const Payment = require('../../models/payment');

class EsewaProvider extends PaymentProvider {
  constructor() {
    super();

    this.sandboxFormUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
    this.productionFormUrl = 'https://epay.esewa.com.np/api/epay/main/v2/form';

    this.sandboxStatusUrl = 'https://rc.esewa.com.np/api/epay/transaction/status/';
    this.productionStatusUrl = 'https://esewa.com.np/api/epay/transaction/status/';
  }

  getCredentials(business) {
    const isProd = process.env.NODE_ENV === 'production';
    const settings = business?.paymentGateways?.esewa || {};

    const defaultProduct = 'EPAYTEST';
    const defaultSecret = '8gBm/:&EnhH.1/q(';

    return {
      productCode:
        settings.merchantId ||
        process.env.ESEWA_PRODUCT_CODE ||
        defaultProduct,

      secretKey:
        settings.secretKey ||
        process.env.ESEWA_SECRET_KEY ||
        defaultSecret,

      isProd: isProd && settings.enabled
    };
  }

  async initiatePayment({ payment, invoice, business }) {
    const { productCode, secretKey, isProd } = this.getCredentials(business);

    const formUrl = isProd
      ? this.productionFormUrl
      : this.sandboxFormUrl;

    const total = String(payment.amount.total);
    const tax = String(payment.amount.tax || 0);
    const serviceCharge = '0';
    const deliveryCharge = '0';
    const amount = String(Number(total) - Number(tax) - Number(serviceCharge) - Number(deliveryCharge));

    const transactionUuid = payment.transaction_uuid;

    const successUrl =
      process.env.ESEWA_SUCCESS_URL ||
      `http://localhost:5000/api/payments/callback/esewa/success`;

    const failureUrl =
      process.env.ESEWA_FAILURE_URL ||
      `http://localhost:5000/api/payments/callback/esewa/failure`;

    // =========================
    // SIGNATURE STRING (STRICT)
    // =========================
    const message =
      `total_amount=${total},` +
      `transaction_uuid=${transactionUuid},` +
      `product_code=${productCode}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('base64');

    // =========================
    // DEBUG LOGS (SAFE)
    // =========================
    console.log("=== ESEWA INIT DEBUG ===");
    console.log({ productCode, transactionUuid });
    console.log("SIGN STRING:", message);
    console.log("SIGNATURE:", signature);

    const fields = {
      amount,
      tax_amount: tax,
      product_service_charge: serviceCharge,
      product_delivery_charge: deliveryCharge,
      total_amount: total,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature
    };

    console.log("=== FINAL ESEWA PAYLOAD SENT TO GATEWAY ===");
    console.log(JSON.stringify(fields, null, 2));

    return {
      type: 'form',
      url: formUrl,
      method: 'POST',
      fields
    };
  }

  async verifyPayment({ payment }) {
    const business = payment.businessId
      ? await Business.findById(payment.businessId)
      : null;

    const { productCode, isProd } = this.getCredentials(business);

    const statusUrl = isProd
      ? this.productionStatusUrl
      : this.sandboxStatusUrl;

    const total = String(payment.amount.total);

    const queryUrl =
      `${statusUrl}?product_code=${productCode}` +
      `&total_amount=${total}` +
      `&transaction_uuid=${payment.transaction_uuid}`;

    try {
      const res = await fetch(queryUrl);
      const data = await res.json();

      console.log("ESEWA VERIFY RESPONSE:", data);

      const isSuccess = data.status === 'COMPLETE';

      return {
        status: isSuccess ? 'completed' : 'failed',
        transactionId: data.transaction_code || null,
        amount: Number(data.total_amount) || payment.amount.total,
        rawResponse: data
      };
    } catch (err) {
      console.error('eSewa verification error:', err.message);

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

    const decodedString = Buffer.from(data, 'base64').toString('utf-8');
    const decodedData = JSON.parse(decodedString);

    console.log("ESEWA CALLBACK DATA:", decodedData);

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      signed_field_names,
      signature
    } = decodedData;

    const payment = await Payment.findOne({ transaction_uuid });

    if (!payment) {
      throw new Error(`Payment not found: ${transaction_uuid}`);
    }

    const business = await Business.findById(payment.businessId);
    const { secretKey } = this.getCredentials(business);

    // FIXED: correct reconstruction logic
    const signatureMessage = signed_field_names
      .split(',')
      .map(key => `${key}=${decodedData[key]}`)
      .join(',');

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(signatureMessage)
      .digest('base64');

    console.log("CALLBACK SIGN CHECK:");
    console.log("EXPECTED:", expectedSignature);
    console.log("RECEIVED:", signature);

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