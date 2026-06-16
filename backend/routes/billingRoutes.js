const express = require('express');
const router = express.Router();

const Business = require('../models/business');
const Subscription = require('../models/subscription');
const { protect } = require('../middleware/authMiddleware');
const { enforceTenant } = require('../middleware/tenantIsolation');
const { requirePermission, requireRole } = require('../middleware/rbac');
const { PLAN_DEFINITIONS, getPlanDefinition } = require('../config/planDefinitions');

router.get(
  '/subscription',
  protect,
  enforceTenant,
  requirePermission('billing.read'),
  async (req, res) => {
    try {
      const subscription = await Subscription.findOne({ businessId: req.activeBusinessId });

      res.json({
        subscription: subscription || req.activeBusiness.subscription,
        plan: getPlanDefinition(subscription?.plan || req.activeBusiness.subscription?.plan),
        plans: PLAN_DEFINITIONS
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

router.put(
  '/subscription',
  protect,
  enforceTenant,
  requireRole(['owner']),
  async (req, res) => {
    try {
      const { plan, status = 'active', currentPeriodEnd } = req.body;

      if (!PLAN_DEFINITIONS[plan]) {
        return res.status(400).json({ message: 'Invalid plan' });
      }

      const definition = getPlanDefinition(plan);
      const periodEnd = currentPeriodEnd
        ? new Date(currentPeriodEnd)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const subscription = await Subscription.findOneAndUpdate(
        { businessId: req.activeBusinessId },
        {
          $set: {
            plan,
            status,
            limits: definition.limits,
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd
          }
        },
        { new: true, upsert: true, runValidators: true }
      );

      await Business.findOneAndUpdate(
        { _id: req.activeBusinessId },
        {
          $set: {
            'subscription.plan': plan,
            'subscription.status': status,
            'subscription.currentPeriodStart': subscription.currentPeriodStart,
            'subscription.currentPeriodEnd': subscription.currentPeriodEnd,
            updatedAt: new Date()
          }
        }
      );

      res.json({
        subscription,
        plan: definition
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

module.exports = router;
