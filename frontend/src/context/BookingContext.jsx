import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from 'react';

import {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
  rescheduleBooking,
  getBookingsByDay,
  getBookingsByWeek
} from '../api/bookingApi';

import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const { activeBusiness } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch bookings
   */
  const fetchBookings = useCallback(async () => {
    if (!activeBusiness?.businessId) return;

    const token = localStorage.getItem('saas_token');

    setLoading(true);
    setError(null);

    try {
      const data = await getBookings(
        token,
        activeBusiness.businessId
      );

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeBusiness]);

  /**
   * Create booking
   */
  const addBooking = useCallback(
    async (payload) => {
      if (!activeBusiness?.businessId) {
        return {
          success: false,
          error: 'No active business selected'
        };
      }

      const token = localStorage.getItem('saas_token');

      try {
        setError(null);

        const booking = await createBooking(
          token,
          activeBusiness.businessId,
          payload
        );

        setBookings(prev => [booking, ...prev]);

        return {
          success: true,
          booking
        };
      } catch (err) {
        console.error(err);

        const message =
          err.message || 'Failed to create booking';

        setError(message);

        return {
          success: false,
          error: message
        };
      }
    },
    [activeBusiness]
  );

  /**
   * Change booking status
   */
  const changeStatus = useCallback(
    async (id, status) => {
      if (!activeBusiness?.businessId) {
        return {
          success: false,
          error: 'No active business selected'
        };
      }

      const token = localStorage.getItem('saas_token');

      try {
        setError(null);

        const updated = await updateBookingStatus(
          token,
          activeBusiness.businessId,
          id,
          status
        );

        setBookings(prev =>
          prev.map(b =>
            b._id === id ? updated : b
          )
        );

        return {
          success: true,
          booking: updated
        };
      } catch (err) {
        console.error(err);

        const message =
          err.message || 'Failed to update booking';

        setError(message);

        return {
          success: false,
          error: message
        };
      }
    },
    [activeBusiness]
  );

  /**
   * Reschedule booking
   */
  const reschedule = useCallback(
    async (
      id,
      newDate,
      newStartTime,
      newEndTime
    ) => {
      if (!activeBusiness?.businessId) {
        return {
          success: false,
          error: 'No active business selected'
        };
      }

      const token = localStorage.getItem('saas_token');

      try {
        setError(null);

        const updated = await rescheduleBooking(
          token,
          activeBusiness.businessId,
          id,
          newDate,
          newStartTime,
          newEndTime
        );

        setBookings(prev =>
          prev.map(b =>
            b._id === id ? updated : b
          )
        );

        return {
          success: true,
          booking: updated
        };
      } catch (err) {
        console.error(err);

        const message =
          err.message || 'Failed to reschedule booking';

        setError(message);

        return {
          success: false,
          error: message
        };
      }
    },
    [activeBusiness]
  );

  /**
   * Soft delete booking
   */
  const removeBooking = useCallback(
    async (id) => {
      if (!activeBusiness?.businessId) {
        return {
          success: false,
          error: 'No active business selected'
        };
      }

      const token = localStorage.getItem('saas_token');

      try {
        setError(null);

        await deleteBooking(
          token,
          activeBusiness.businessId,
          id
        );

        setBookings(prev =>
          prev.filter(b => b._id !== id)
        );

        return {
          success: true
        };
      } catch (err) {
        console.error(err);

        const message =
          err.message || 'Failed to delete booking';

        setError(message);

        return {
          success: false,
          error: message
        };
      }
    },
    [activeBusiness]
  );

  /**
   * Calendar Day View
   */
  const fetchBookingsByDay = useCallback(
    async (date, staffId = null) => {
      if (!activeBusiness?.businessId) return null;

      const token = localStorage.getItem('saas_token');

      try {
        return await getBookingsByDay(
          token,
          activeBusiness.businessId,
          date,
          staffId
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
        return null;
      }
    },
    [activeBusiness]
  );

  /**
   * Calendar Week View
   */
  const fetchBookingsByWeek = useCallback(
    async (startDate, staffId = null) => {
      if (!activeBusiness?.businessId) return null;

      const token = localStorage.getItem('saas_token');

      try {
        return await getBookingsByWeek(
          token,
          activeBusiness.businessId,
          startDate,
          staffId
        );
      } catch (err) {
        console.error(err);
        setError(err.message);
        return null;
      }
    },
    [activeBusiness]
  );

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,

        fetchBookings,
        addBooking,
        changeStatus,
        removeBooking,
        reschedule,

        fetchBookingsByDay,
        fetchBookingsByWeek
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error(
      'useBookings must be used inside BookingProvider'
    );
  }

  return context;
};