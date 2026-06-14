const express = require('express');
const router = express.Router();

const Invoice = require('../models/invoice');
const Payment = require('../models/payment');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');

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

module.exports = router;
