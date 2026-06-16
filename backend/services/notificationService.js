const Notification = require('../models/notification');

const TYPE_BY_EVENT = {
  created: 'booking_created',
  updated: 'booking_updated',
  cancelled: 'booking_cancelled'
};

const buildBookingMessage = (booking, event) => {
  const action = event === 'created' ? 'created' : event === 'cancelled' ? 'cancelled' : 'updated';
  return `Booking ${action}: ${booking.serviceName || booking.type} on ${new Date(booking.date).toLocaleDateString()} at ${booking.startTime}.`;
};

const queueBookingNotification = async ({ businessId, booking, event }) => {
  const type = TYPE_BY_EVENT[event];
  if (!type || !businessId || !booking) {
    return [];
  }

  const message = buildBookingMessage(booking, event);
  const basePayload = {
    businessId,
    recipientType: 'customer',
    recipientId: booking.customerId,
    type,
    title: `Booking ${event}`,
    message,
    template: `mock_${type}`,
    status: 'sent',
    sentAt: new Date(),
    referenceType: 'booking',
    referenceId: booking._id
  };

  const notifications = [];

  if (booking.customerPhone) {
    notifications.push({
      ...basePayload,
      channel: 'sms',
      recipientPhone: booking.customerPhone
    });
  }

  if (booking.customerEmail) {
    notifications.push({
      ...basePayload,
      channel: 'email',
      recipientEmail: booking.customerEmail
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      ...basePayload,
      channel: 'email'
    });
  }

  return Notification.insertMany(notifications);
};

module.exports = {
  queueBookingNotification
};
