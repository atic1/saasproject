const express = require('express');
const router = express.Router();

const Customer = require('../models/customer');

const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');

//
// GET ALL CUSTOMERS
//
router.get(
  '/',
  protect,
  enforceTenant,
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
// CREATE CUSTOMER
//
router.post(
  '/',
  protect,
  enforceTenant,
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