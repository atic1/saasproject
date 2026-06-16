const Booking = require('../models/booking');
const Customer = require('../models/customer');
const User = require('../models/user');
const { queueBookingNotification } = require('../services/notificationService');

const notifyBookingEvent = (businessId, booking, event) => {
  const source = typeof booking.toObject === 'function' ? booking.toObject() : booking;

  queueBookingNotification({
    businessId,
    event,
    booking: {
      ...source,
      customerEmail: source.customerEmail || source.customerId?.email,
      customerPhone: source.customerPhone || source.customerId?.phone
    }
  }).catch(error => {
    console.error('Booking notification failed:', error.message);
  });
};

/**
 * Helper: Check if two time slots overlap
 * Format: "09:00" to "10:00"
 */
const timesOverlap = (slot1Start, slot1End, slot2Start, slot2End) => {
  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const s1 = timeToMinutes(slot1Start);
  const e1 = timeToMinutes(slot1End);
  const s2 = timeToMinutes(slot2Start);
  const e2 = timeToMinutes(slot2End);

  return s1 < e2 && s2 < e1; // Overlap if one starts before the other ends
};

/**
 * Helper: Check for booking conflicts
 * A new booking conflicts if:
 * - Another booking exists for same businessId/date/time slot (excluding cancelled/no_show)
 * - OR same staffId exists for that time (if staffId assigned)
 */
const checkConflict = async (
  businessId,
  { date, startTime, endTime, staffId, serviceId, serviceCapacity = 1 },
  excludeBookingId = null
) => {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    businessId,
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $nin: ['cancelled', 'no_show'] }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflicts = await Booking.find(query);
  const requestedStaff = staffId ? staffId.toString() : null;
  const requestedService = serviceId ? serviceId.toString() : null;
  let overlappingSameService = 0;

  for (const existing of conflicts) {
    const overlaps = timesOverlap(existing.startTime, existing.endTime, startTime, endTime);
    if (!overlaps) {
      continue;
    }

    const existingStaff = existing.staffId ? existing.staffId.toString() : null;
    if (requestedStaff && existingStaff === requestedStaff) {
      return {
        conflict: true,
        reason: `Staff member is already booked during ${startTime}-${endTime}`
      };
    }

    if (requestedService && existing.serviceId?.toString() === requestedService) {
      overlappingSameService++;
    }

    if (!requestedStaff && !requestedService) {
        return {
          conflict: true,
          reason: `Time slot ${startTime}-${endTime} overlaps with an existing booking`
        };
    }
  }

if (requestedService && Number(serviceCapacity || 1) >= 1 && overlappingSameService >= Number(serviceCapacity)) {
      return {
        conflict: true,
        reason: `Service capacity is full for ${startTime}-${endTime}`
      };
    }

    return { conflict: false };
};

exports.checkConflict = checkConflict;

const checkStaffAvailability = async (businessId, { date, startTime, endTime, staffId }) => {
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayOfWeek = days[targetDate.getDay()];

  const Availability = require('../models/availability');

  // 1. Check for specific date override first
  let schedule = await Availability.findOne({
    businessId,
    staffId: staffId || null,
    dateOverride: { $gte: startOfDay, $lte: endOfDay }
  });

  // 2. If no date override, check default day of week schedule
  if (!schedule) {
    schedule = await Availability.findOne({
      businessId,
      staffId: staffId || null,
      dayOfWeek,
      dateOverride: null
    });
  }

  // 3. If no specific staff schedule, fall back to general business schedule
  if (!schedule && staffId) {
    schedule = await Availability.findOne({
      businessId,
      staffId: null,
      dayOfWeek,
      dateOverride: null
    });
  }

  // If still no schedule defined, default to business open timings from Business model
  if (!schedule) {
    const Business = require('../models/business');
    const business = await Business.findById(businessId);
    if (business && business.timings && business.timings.schedule && business.timings.schedule.length > 0) {
      const daySchedule = business.timings.schedule.find(s => s.day === dayOfWeek);
      if (daySchedule) {
        if (daySchedule.isOpen) {
          const withinHours = startTime >= (daySchedule.open || "09:00") && endTime <= (daySchedule.close || "17:00");
          if (!withinHours) {
            return {
              available: false,
              reason: `Requested time ${startTime}-${endTime} is outside business hours (${daySchedule.open}-${daySchedule.close})`
            };
          }
          return { available: true };
        } else {
          return {
            available: false,
            reason: `Business is closed on ${dayOfWeek.toUpperCase()}`
          };
        }
      }
    }
    // Fallback default timings
    const defaultOpen = "09:00";
    const defaultClose = "17:00";
    const withinDefault = startTime >= defaultOpen && endTime <= defaultClose;
    if (!withinDefault) {
      return {
        available: false,
        reason: `Requested time ${startTime}-${endTime} is outside default hours (${defaultOpen}-${defaultClose})`
      };
    }
    return { available: true };
  }

  if (!schedule.isAvailable) {
    return {
      available: false,
      reason: `Staff/Business is marked as unavailable on this date`
    };
  }

  const timeToMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const reqStart = timeToMinutes(startTime);
  const reqEnd = timeToMinutes(endTime);

  const isWithinSlot = schedule.slots.some(slot => {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);
    return reqStart >= slotStart && reqEnd <= slotEnd;
  });

  if (!isWithinSlot) {
    const slotList = schedule.slots.map(s => `${s.startTime}-${s.endTime}`).join(', ');
    return {
      available: false,
      reason: `Requested slot is outside available hours: ${slotList || 'No slots defined'}`
    };
  }

  return { available: true };
};

exports.checkStaffAvailability = checkStaffAvailability;

/**
 * Valid Status Transitions:
 * pending → confirmed → checked_in → completed
 * pending → cancelled
 * confirmed → no_show
 */
const isValidStatusTransition = (currentStatus, newStatus) => {
  const transitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['checked_in', 'no_show', 'cancelled'],
    checked_in: ['completed', 'cancelled'],
    completed: [], // Immutable
    cancelled: [],
    no_show: []
  };

  return transitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Check role permission for status change
 */
const canChangeStatus = (userRole, currentStatus, newStatus) => {
  // Admin/Owner/Manager can do anything
  if (['super_admin', 'owner', 'manager', 'receptionist'].includes(userRole)) {
    return true;
  }

  // Staff can only check-in
  if (['staff', 'trainer', 'doctor', 'stylist'].includes(userRole)) {
    return (
      (currentStatus === 'confirmed' && newStatus === 'checked_in') ||
      (currentStatus === 'checked_in' && newStatus === 'completed')
    );
  }

  return false;
};

/**
 * GET /api/bookings
 * Fetch all bookings for active business (tenant-scoped)
 */
exports.getBookings = async (req, res) => {
  try {
    const { status, staffId, customerId } = req.query;

    const query = {
      businessId: req.activeBusinessId
    };

    if (status) query.status = status;
    if (staffId) query.staffId = staffId;
    if (customerId) query.customerId = customerId;

    const bookings = await Booking.find(query)
      .sort({ date: -1, startTime: 1 })
      .populate('customerId', 'name phone email')
      .populate('staffId', 'name email')
      .lean();

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

/**
 * GET /api/bookings/:id
 * Fetch single booking with tenant validation
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      businessId: req.activeBusinessId
    })
      .populate('customerId')
      .populate('staffId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or access denied' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error fetching booking' });
  }
};

/**
 * POST /api/bookings
 * Create new booking with conflict prevention
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      type,
      serviceId,
      serviceName,
      staffId,
      staffName,
      date,
      startTime,
      endTime: requestedEndTime,
      duration,
      customerNotes,
      advancePayment
    } = req.body;

    let endTime = requestedEndTime;
    let resolvedType = type;
    let resolvedServiceName = serviceName;
    let resolvedDuration = duration;
    let price = 1000;
    let serviceCapacity = 1;

    // Validation
    if (!customerId || !date || !startTime || (!endTime && !serviceId)) {
      return res.status(400).json({
        message: 'Missing required fields: customerId, date, startTime, and either serviceId or endTime'
      });
    }

      // Validate time format
    if (!/^\d{2}:\d{2}$/.test(startTime) || (!serviceId && endTime && !/^\d{2}:\d{2}$/.test(endTime))) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
    }

    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);

    const tenantCustomer = await Customer.findOne({
      _id: customerId,
      businessId: req.activeBusinessId
    });

    if (!tenantCustomer) {
      return res.status(404).json({ message: 'Customer not found for active business' });
    }

    if (serviceId) {
      const Service = require('../models/service');
      const service = await Service.findOne({ _id: serviceId, businessId: req.activeBusinessId });
      if (!service) {
        return res.status(404).json({ message: 'Service not found for active business' });
      }

      price = service.price;
      resolvedServiceName = service.name;
      resolvedDuration = service.duration;
      serviceCapacity = service.capacity || 1;
      resolvedType = resolvedType || (service.type === 'gym_class' ? 'class' : 'appointment');

      const endMinutesFromService = startMinutes + service.duration;
      const h = Math.floor(endMinutesFromService / 60).toString().padStart(2, '0');
      const m = (endMinutesFromService % 60).toString().padStart(2, '0');
      endTime = `${h}:${m}`;
    }

    if (!resolvedType || !endTime) {
      return res.status(400).json({ message: 'Booking type and endTime are required when no service is selected' });
    }

    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({ message: 'startTime must be before endTime' });
    }

    // Check for conflicts
    const conflictCheck = await checkConflict(req.activeBusinessId, {
      date,
      startTime,
      endTime,
      staffId,
      serviceId,
      serviceCapacity
    });

    if (conflictCheck.conflict) {
      return res.status(409).json({
        message: 'Booking conflict',
        reason: conflictCheck.reason
      });
    }

    // Check for availability
    const availabilityCheck = await checkStaffAvailability(req.activeBusinessId, {
      date,
      startTime,
      endTime,
      staffId
    });

    if (!availabilityCheck.available) {
      return res.status(400).json({
        message: 'Availability validation failed',
        reason: availabilityCheck.reason
      });
    }

    // Calculate duration if not provided
    const calculatedDuration = resolvedDuration || (endMinutes - startMinutes);

    // Create booking
    const booking = new Booking({
      businessId: req.activeBusinessId,
      customerId,
      customerName: customerName || tenantCustomer.name,
      customerPhone: customerPhone || tenantCustomer.phone,
      type: resolvedType,
      serviceId,
      serviceName: resolvedServiceName,
      staffId,
      staffName,
      date: new Date(date),
      startTime,
      endTime,
      duration: calculatedDuration,
      customerNotes,
      advancePayment,
      createdBy: req.user._id,
      status: 'pending'
    });

    await booking.save();

    // Generate Invoice
    let invoice = null;
    try {
      const Invoice = require('../models/invoice');
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      invoice = new Invoice({
        businessId: req.activeBusinessId,
        customerId,
        bookingId: booking._id,
        invoiceNumber,
        amount: price,
        tax: 0,
        discount: 0,
        total: price,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      await invoice.save();
    } catch (err) {
      console.error('Invoice generation failed:', err.message);
    }

    // Populate before returning
    await booking.populate('customerId', 'name phone email');
    await booking.populate('staffId', 'name email');

    notifyBookingEvent(req.activeBusinessId, booking, 'created');

    const resultBooking = booking.toObject();
    if (invoice) {
      resultBooking.invoice = invoice.toObject();
    }

    res.status(201).json(resultBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
};

/**
 * PUT /api/bookings/:id/status
 * Update booking status with state machine validation
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      businessId: req.activeBusinessId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if current status is immutable
    if (booking.status === 'completed') {
      return res.status(409).json({
        message: 'Cannot modify completed bookings'
      });
    }

    // Validate state transition
    if (!isValidStatusTransition(booking.status, status)) {
      return res.status(400).json({
        message: `Invalid status transition: ${booking.status} → ${status}`,
        validTransitions: ['confirmed', 'cancelled']
      });
    }

    // Check role permission
    if (!canChangeStatus(req.role, booking.status, status)) {
      return res.status(403).json({
        message: `Role '${req.role}' cannot perform this status change`
      });
    }

    // Handle cancellation
    if (status === 'cancelled') {
      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
    } else {
      booking.status = status;
    }

    booking.updatedAt = new Date();
    await booking.save();

    await booking.populate('customerId', 'name phone email');
    await booking.populate('staffId', 'name email');

    notifyBookingEvent(
      req.activeBusinessId,
      booking,
      status === 'cancelled' ? 'cancelled' : 'updated'
    );

    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

/**
 * PUT /api/bookings/:id/reschedule
 * Reschedule booking to new date/time
 */
exports.rescheduleBooking = async (req, res) => {
  try {
    const { newDate, newStartTime, newEndTime } = req.body;

    if (!newDate || !newStartTime || !newEndTime) {
      return res.status(400).json({
        message: 'Missing required fields: newDate, newStartTime, newEndTime'
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      businessId: req.activeBusinessId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Cannot reschedule completed/cancelled bookings
    if (['completed', 'cancelled', 'no_show'].includes(booking.status)) {
      return res.status(400).json({
        message: `Cannot reschedule a ${booking.status} booking`
      });
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(newStartTime) || !/^\d{2}:\d{2}$/.test(newEndTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:MM' });
    }

    // Validate time range
    const startMinutes = parseInt(newStartTime.split(':')[0]) * 60 + parseInt(newStartTime.split(':')[1]);
    const endMinutes = parseInt(newEndTime.split(':')[0]) * 60 + parseInt(newEndTime.split(':')[1]);

    if (startMinutes >= endMinutes) {
      return res.status(400).json({ message: 'newStartTime must be before newEndTime' });
    }

    // Check for conflicts on new date/time
    const conflictCheck = await checkConflict(
      req.activeBusinessId,
      {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        staffId: booking.staffId
      },
      req.params.id // Exclude current booking
    );

    if (conflictCheck.conflict) {
      return res.status(409).json({
        message: 'New time slot has a conflict',
        reason: conflictCheck.reason
      });
    }

    // Check for availability on new date/time
    const availabilityCheck = await checkStaffAvailability(
      req.activeBusinessId,
      {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        staffId: booking.staffId
      }
    );

    if (!availabilityCheck.available) {
      return res.status(400).json({
        message: 'Availability validation failed for new time slot',
        reason: availabilityCheck.reason
      });
    }

    // Update booking
    booking.date = new Date(newDate);
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    booking.updatedAt = new Date();

    // Reset status to pending if moved to future
    if (new Date(newDate) > new Date()) {
      booking.status = 'pending';
    }

    await booking.save();

    await booking.populate('customerId', 'name phone email');
    await booking.populate('staffId', 'name email');

    notifyBookingEvent(req.activeBusinessId, booking, 'updated');

    res.json(booking);
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ message: 'Server error rescheduling booking' });
  }
};

/**
 * DELETE /api/bookings/:id
 * Soft delete booking (mark as cancelled rather than removing)
 */
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      businessId: req.activeBusinessId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Cannot delete completed bookings
    if (booking.status === 'completed') {
      return res.status(400).json({
        message: 'Cannot delete completed bookings. Mark as cancelled instead.'
      });
    }

    // Soft delete
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Deleted by user';
    booking.updatedAt = new Date();

    await booking.save();

    notifyBookingEvent(req.activeBusinessId, booking, 'cancelled');

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Server error deleting booking' });
  }
};

/**
 * GET /api/bookings/calendar/day
 * Get bookings grouped by time for a specific day (calendar view)
 */
exports.getBookingsByDay = async (req, res) => {
  try {
    const { date, staffId } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      businessId: req.activeBusinessId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'no_show'] }
    };

    if (staffId) {
      query.staffId = staffId;
    }

    const bookings = await Booking.find(query)
      .sort({ startTime: 1 })
      .populate('customerId', 'name phone email')
      .populate('staffId', 'name email');

    // Group by time slots
    const grouped = {};
    bookings.forEach(booking => {
      const key = booking.startTime;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(booking);
    });

    res.json({
      date,
      bookings: grouped,
      total: bookings.length
    });
  } catch (error) {
    console.error('Error fetching day bookings:', error);
    res.status(500).json({ message: 'Server error fetching day bookings' });
  }
};

/**
 * GET /api/bookings/calendar/week
 * Get bookings grouped by day for a week (calendar view)
 */
exports.getBookingsByWeek = async (req, res) => {
  try {
    const { startDate, staffId } = req.query;

    if (!startDate) {
      return res.status(400).json({ message: 'startDate is required' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const query = {
      businessId: req.activeBusinessId,
      date: { $gte: start, $lte: end },
      status: { $nin: ['cancelled', 'no_show'] }
    };

    if (staffId) {
      query.staffId = staffId;
    }

    const bookings = await Booking.find(query)
      .sort({ date: 1, startTime: 1 })
      .populate('customerId', 'name phone email')
      .populate('staffId', 'name email');

    // Group by date
    const grouped = {};
    bookings.forEach(booking => {
      const dateKey = booking.date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(booking);
    });

    res.json({
      startDate,
      endDate: end.toISOString(),
      bookings: grouped,
      total: bookings.length
    });
  } catch (error) {
    console.error('Error fetching week bookings:', error);
    res.status(500).json({ message: 'Server error fetching week bookings' });
  }
};
