const express = require('express');
const router = express.Router();

const Invoice = require('../models/invoice');
const Payment = require('../models/payment');
const Customer = require('../models/customer');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');

// GET /api/invoices — Fetch all invoices for active tenant
router.get('/', protect, enforceTenant, requirePermission('billing.read'), async (req, res) => {
  try {
    const invoices = await Invoice.find({ businessId: req.activeBusinessId })
      .populate('customerId', 'name phone email')
      .populate('bookingId', 'serviceName date startTime status')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// GET /api/invoices/:id — Fetch single invoice
router.get('/:id', protect, enforceTenant, requirePermission('billing.read'), async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      businessId: req.activeBusinessId
    })
      .populate('customerId', 'name phone email')
      .populate('bookingId', 'serviceName date startTime status');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const payments = await Payment.find({
      invoiceId: invoice._id,
      businessId: req.activeBusinessId
    }).sort({ createdAt: -1 });

    res.json({ invoice, payments });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
});

// POST /api/invoices — Create a new invoice (POS Checkout / Billing)
router.post('/', protect, enforceTenant, async (req, res) => {
  try {
    const { customerId, amount, tax = 0, discount = 0, paymentMethod = 'cash', status = 'paid' } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Auto-generate Invoice Number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const numAmount = Number(amount);
    const numTax = Number(tax) || 0;
    const numDiscount = Number(discount) || 0;
    const total = numAmount + numTax - numDiscount;

    let targetCustomerId = customerId;
    if (!targetCustomerId || !/^[0-9a-fA-F]{24}$/.test(targetCustomerId)) {
      // Find or create default walk-in customer
      let defaultCust = await Customer.findOne({ businessId: req.activeBusinessId, name: 'Walk-in Customer' });
      if (!defaultCust) {
        defaultCust = await Customer.create({
          businessId: req.activeBusinessId,
          name: 'Walk-in Customer',
          phone: '9800000000',
          email: 'walkin@biznepal.com'
        });
      }
      targetCustomerId = defaultCust._id;
    }

    const invoice = await Invoice.create({
      businessId: req.activeBusinessId,
      customerId: targetCustomerId,
      invoiceNumber,
      amount: numAmount,
      tax: numTax,
      discount: numDiscount,
      total,
      paymentMethod,
      status,
      dueDate: new Date(),
      paidAt: status === 'paid' ? new Date() : null
    });

    const populated = await Invoice.findById(invoice._id).populate('customerId', 'name phone email');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Failed to create invoice', error: error.message });
  }
});

// PUT /api/invoices/:id/status — Update status
router.put('/:id/status', protect, enforceTenant, async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    if (status === 'paid') updateData.paidAt = new Date();

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, businessId: req.activeBusinessId },
      { $set: updateData },
      { new: true }
    ).populate('customerId', 'name phone email');

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
});

module.exports = router;
