const API_URL = 'http://localhost:5000/api/bookings';

export const getBookings = async (token, businessId) => {
  const res = await fetch(API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    }
  });
  return res.json();
};

export const createBooking = async (token, businessId, data) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateBookingStatus = async (token, businessId, id, status) => {
  const res = await fetch(`${API_URL}/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const deleteBooking = async (token, businessId, id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    }
  });
  return res.json();
};

export const rescheduleBooking = async (token, businessId, id, newDate, newStartTime, newEndTime) => {
  const res = await fetch(`${API_URL}/${id}/reschedule`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    },
    body: JSON.stringify({
      newDate,
      newStartTime,
      newEndTime
    })
  });
  return res.json();
};

export const getBookingsByDay = async (token, businessId, date, staffId = null) => {
  let url = `${API_URL}/calendar/day?date=${date}`;
  if (staffId) url += `&staffId=${staffId}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    }
  });
  return res.json();
};

export const getBookingsByWeek = async (token, businessId, startDate, staffId = null) => {
  let url = `${API_URL}/calendar/week?startDate=${startDate}`;
  if (staffId) url += `&staffId=${staffId}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Business-Id': businessId
    }
  });
  return res.json();
};