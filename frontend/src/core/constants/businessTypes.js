export const BUSINESS_TYPES = {
  GYM: 'gym',
  SALON: 'salon',
  CLINIC: 'clinic',
};

export const BUSINESS_LABELS = {
  gym: 'Gym',
  salon: 'Salon',
  clinic: 'Clinic',
};

// Terminology changes per business type
export const BUSINESS_TERMINOLOGY = {
  gym: {
    customer: 'Member',
    customers: 'Members',
    booking: 'Session',
    bookings: 'Sessions',
    staff: 'Trainer',
  },
  salon: {
    customer: 'Client',
    customers: 'Clients',
    booking: 'Appointment',
    bookings: 'Appointments',
    staff: 'Stylist',
  },
  clinic: {
    customer: 'Patient',
    customers: 'Patients',
    booking: 'Consultation',
    bookings: 'Consultations',
    staff: 'Doctor',
  },
};