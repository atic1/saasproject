const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const Invoice = require('../models/invoice');
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const Business = require('../models/business');
const Customer = require('../models/customer');
const { protect } = require('../middleware/authMiddleware');
const providerRegistry = require('../services/payment/ProviderRegistry');

/**
 * Helper to process paid invoices: confirms bookings or activates membership plans
 */
const handlePaidInvoice = async (invoice, paymentMethod, transactionId) => {
  invoice.status = 'paid';
  invoice.paidAt = new Date();
  invoice.paymentMethod = paymentMethod;
  await invoice.save();

  // 1. If bookingId is present, confirm the booking
  if (invoice.bookingId) {
    const Booking = require('../models/booking');
    const booking = await Booking.findById(invoice.bookingId);
    if (booking) {
      booking.status = 'confirmed';
      booking.payment = {
        amount: invoice.total,
        status: 'paid',
        method: paymentMethod,
        transactionId: transactionId,
        paidAt: new Date()
      };
      await booking.save();
    }
  }

  // 2. If planId is present, activate the membership in the Customer record
  if (invoice.planId) {
    const Plan = require('../models/plan');
    const plan = await Plan.findById(invoice.planId);
    if (plan) {
      // Calculate expiration date based on plan duration
      let durationMs = 30 * 24 * 60 * 60 * 1000; // default 30 days
      if (plan.duration && plan.duration.value) {
        const value = plan.duration.value;
        const unit = plan.duration.unit || 'month';
        if (unit === 'day') durationMs = value * 24 * 60 * 60 * 1000;
        else if (unit === 'week') durationMs = value * 7 * 24 * 60 * 60 * 1000;
        else if (unit === 'month') durationMs = value * 30 * 24 * 60 * 60 * 1000;
        else if (unit === 'year') durationMs = value * 365 * 24 * 60 * 60 * 1000;
      }

      const Customer = require('../models/customer');
      const customer = await Customer.findById(invoice.customerId);
      if (customer) {
        customer.membership = {
          planId: plan._id,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + durationMs)
        };
        await customer.save();
      }
    }
  }
};

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate a payment transaction for an Invoice
 * @access  Private
 */
router.post('/initiate', protect, async (req, res) => {
  try {
    const { invoiceId, method } = req.body;

    if (!invoiceId || !method) {
      return res.status(400).json({ message: 'invoiceId and payment method are required.' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found.' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid.' });
    }

    const business = await Business.findById(invoice.businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    const customer = await Customer.findById(invoice.customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const operatorMembership = req.memberships.find(
      m => m.businessId?._id?.toString() === invoice.businessId.toString()
    );

    if (req.user.platformrole !== 'super_admin' && !operatorMembership) {
      if (!customer.userId || customer.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You do not own this invoice.' });
      }
    }

    const transactionUuid = `tx-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;

    // Create Payment record in DB
    const payment = new Payment({
      businessId: invoice.businessId,
      transactionId: transactionUuid, // generate temporary unique transaction ID
      transaction_uuid: transactionUuid,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      customerName: customer.name,
      customerPhone: customer.phone,
      type: invoice.bookingId ? 'booking' : 'service',
      referenceId: invoice.bookingId,
      referenceType: invoice.bookingId ? 'Booking' : undefined,
      description: `Payment for Invoice #${invoice.invoiceNumber}`,
      amount: {
          subtotal: String(invoice.amount),
          tax: String(invoice.tax || 0),
          discount: String(invoice.discount || 0),
          total: String(invoice.total),
          currency: 'NPR'
        },
      method: method,
      provider: method === 'cash' ? 'cash' : method,
      status: method === 'cash' ? 'completed' : 'pending',
      collectedBy: req.user._id
    });
    console.log("=== PAYMENT INIT DEBUG ===");
    console.log("invoice.total:", invoice.total);
    console.log("invoice.tax:", invoice.tax);
    console.log("invoice.amount:", invoice.amount);
    console.log("transaction_uuid:", transactionUuid);

    if (method === 'cash') {
      // Direct Cash Flow (completed immediately)
      payment.completedAt = new Date();
      await payment.save();

      // Process paid invoice
      await handlePaidInvoice(invoice, 'cash', transactionUuid);

      return res.status(201).json({
        message: 'Payment completed via Cash.',
        payment,
        type: 'cash'
      });
    }

    // Provider Flow (eSewa or Mock)
    await payment.save();

    const provider = providerRegistry.resolve(method);
    
    const checkoutData = await provider.initiatePayment({ payment, invoice, business });

    console.log("=== FINAL PAYMENT PAYLOAD SENT TO ESEWA ===");
    console.log(checkoutData);

    return res.status(200).json({
      message: 'Payment initiated.',
      payment,
      checkout: checkoutData
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Failed to initiate payment.', error: error.message });
  }
});

/**
 * @route   GET /api/payments/callback/esewa/success
 * @desc    eSewa success callback redirection endpoint
 * @access  Public
 */
router.get('/callback/esewa/success', async (req, res) => {
  try {
    const esewa = providerRegistry.resolve('esewa');
    
    // Validate signature and parse callback payload
    const result = await esewa.handleCallback(req);

    const payment = await Payment.findOne({ transaction_uuid: result.transaction_uuid });
    if (!payment) {
      return res.status(404).send('Payment record not found.');
    }

    if (payment.status === 'completed') {
      return res.redirect(`http://localhost:5173/payment-success?uuid=${result.transaction_uuid}`);
    }

    // Enforce Tenant Isolation verification
    if (payment.amount.total !== result.amount) {
      return res.status(400).send('Payment amount mismatch.');
    }

    // Verify status with eSewa API (Server-to-Server)
    const verification = await esewa.verifyPayment({ payment, callbackData: result.callbackData });

    payment.status = verification.status;
    payment.provider_status = result.status;
    payment.callback_data = result.callbackData;
    payment.verified_at = new Date();

    if (verification.status === 'completed') {
      payment.transactionId = result.transactionId;
      payment.completedAt = new Date();
      await payment.save();

      // Update Invoice
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        await handlePaidInvoice(invoice, 'esewa', result.transactionId);
      }
      
      res.redirect(`http://localhost:5173/payment-success?uuid=${result.transaction_uuid}`);
    } else if (verification.status === 'pending_verification') {
      await payment.save();
      res.redirect(`http://localhost:5173/payment-pending?uuid=${result.transaction_uuid}`);
    } else {
      payment.status = 'failed';
      await payment.save();
      res.redirect(`http://localhost:5173/payment-failed?uuid=${result.transaction_uuid}`);
    }

  } catch (error) {
    console.error('eSewa Success Callback Error:', error.message);
    res.status(400).send(`eSewa callback verification error: ${error.message}`);
  }
});

/**
 * @route   GET /api/payments/callback/esewa/failure
 * @desc    eSewa failure callback redirection endpoint
 * @access  Public
 */
router.get('/callback/esewa/failure', async (req, res) => {
  try {
    const { pid } = req.query; // eSewa may pass order ID/UUID as query parameter
    if (pid) {
      const payment = await Payment.findOne({ transaction_uuid: pid });
      if (payment) {
        payment.status = 'failed';
        await payment.save();
      }
    }
    res.redirect(`http://localhost:5173/payment-failed`);
  } catch (error) {
    console.error('eSewa Failure Callback Error:', error);
    res.redirect(`http://localhost:5173/payment-failed`);
  }
});

/**
 * @route   GET /api/payments/callback/mock
 * @desc    Mock callback redirection for sandbox testing
 * @access  Public
 */
router.get('/callback/mock', async (req, res) => {
  try {
    const mock = providerRegistry.resolve('mock');
    const result = await mock.handleCallback(req);

    const payment = await Payment.findOne({ transaction_uuid: result.transaction_uuid });
    if (!payment) {
      return res.status(404).send('Payment record not found.');
    }

    if (payment.status === 'completed') {
      return res.redirect(`http://localhost:5173/payment-success?uuid=${result.transaction_uuid}`);
    }

    payment.status = result.status;
    payment.transactionId = result.transactionId;
    payment.completedAt = new Date();
    payment.callback_data = result.callbackData;
    payment.verified_at = new Date();
    await payment.save();

    const invoice = await Invoice.findById(payment.invoiceId);
    if (invoice) {
      await handlePaidInvoice(invoice, 'mock', result.transactionId);
    }

    res.redirect(`http://localhost:5173/payment-success?uuid=${result.transaction_uuid}`);

  } catch (error) {
    console.error('Mock Callback Error:', error);
    res.status(400).send(`Mock callback error: ${error.message}`);
  }
});

module.exports = router;
