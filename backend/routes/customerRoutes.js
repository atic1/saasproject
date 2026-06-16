const express = require('express');
const router = express.Router();

const Customer = require('../models/customer');
const Booking = require('../models/booking');

const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission } = require('../middleware/rbac');
const { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');

//
// GET ALL CUSTOMERS
//
router.get(
  '/',
  protect,
  enforceTenant,
  requirePermission('customer.read'),
  async (req, res) => {
    try {
      const customers = await Customer.find({
        businessId: req.activeBusinessId
      }).sort({ createdAt: -1 });

      res.json(customers);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Server Error'
      });
    }
  }
);

//
// GET SINGLE CUSTOMER
//
router.get(
  '/:id',
  protect,
  enforceTenant,
  requirePermission('customer.read'),
  async (req, res) => {
    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        businessId: req.activeBusinessId
      });

      if (!customer) {
        return res.status(404).json({
          message: 'Customer not found'
        });
      }

      res.json(customer);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Server Error'
      });
    }
  }
);

//
// GET CUSTOMER BOOKINGS HISTORY
//
router.get(
  '/:id/bookings',
  protect,
  enforceTenant,
  requirePermission('booking.read'),
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        customerId: req.params.id,
        businessId: req.activeBusinessId
      }).sort({ date: -1, startTime: 1 });

      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Server Error'
      });
    }
  }
);

//
// CREATE CUSTOMER
//
router.post(
  '/',
  protect,
  enforceTenant,
  requireActiveSubscription,
  requirePermission('customer.create'),
  async (req, res) => {
    try {
      const customer = await Customer.create({
        ...req.body,
        businessId: req.activeBusinessId
      });

      res.status(201).json(customer);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: error.message
      });
    }
  }
);

//
// UPDATE CUSTOMER
//
router.put(
  '/:id',
  protect,
  enforceTenant,
  requireActiveSubscription,
  requirePermission('customer.update'),
  async (req, res) => {
    try {
      const customer = await Customer.findOneAndUpdate(
        {
          _id: req.params.id,
          businessId: req.activeBusinessId
        },
        req.body,
        {
          new: true
        }
      );

      if (!customer) {
        return res.status(404).json({
          message: 'Customer not found'
        });
      }

      res.json(customer);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Server Error'
      });
    }
  }
);

//
// DELETE CUSTOMER
//
router.delete(
  '/:id',
  protect,
  enforceTenant,
  requireActiveSubscription,
  requirePermission('customer.delete'),
  async (req, res) => {
    try {
      const customer = await Customer.findOneAndDelete({
        _id: req.params.id,
        businessId: req.activeBusinessId
      });

      if (!customer) {
        return res.status(404).json({
          message: 'Customer not found'
        });
      }

      res.json({
        message: 'Customer deleted'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Server Error'
      });
    }
  }
);

module.exports = router;