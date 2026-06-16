

export const dummyBusinesses = [
  {
    id: "b1",
    name: "FitZone Gym",
    type: "gym",
    status: "active",
    plan: "pro",
    members: 120,
    revenue: 50000,
  },
  {
    id: "b2",
    name: "Smile Dental Clinic",
    type: "clinic",
    status: "active",
    plan: "growth",
    members: 450,
    revenue: 120000,
  },
  {
    id: "b3",
    name: "Glow Beauty Salon",
    type: "salon",
    status: "active",
    plan: "starter",
    members: 80,
    revenue: 30000,
  }
];

export const dummyBookings = [
  { id: "bk1", businessId: "b2", customer: "John Doe", type: "appointment", date: "2026-05-04", time: "10:00 AM", status: "confirmed" },
  { id: "bk2", businessId: "b3", customer: "Jane Smith", type: "service", date: "2026-05-04", time: "02:00 PM", status: "pending" },
  { id: "bk3", businessId: "b1", customer: "Mike Ross", type: "class", date: "2026-05-05", time: "06:00 AM", status: "confirmed" },
];

export const dummyPlatformStats = {
  totalBusinesses: 3,
  totalUsers: 154,
  monthlyRecurringRevenue: 200000,
  activeSubscriptions: 3
};
