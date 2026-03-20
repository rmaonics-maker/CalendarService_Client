const BOOKING_API_BASE = import.meta.env.VITE_BOOKING_API_URL || 'http://localhost:5001/api/v1';

export const bookingsApi = {
    createBooking: async (data: CreateBookingRequest): Promise<BookingDto> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BOOKING_API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if(!response.ok) throw new Error('Failed to create booking');
        return response.json();
    },

    getMyBookings: async (): Promise<BookingDto[]> => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BOOKING_API_BASE}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}`}
        });

        if (!response.ok) throw new Error('Failed to fetch bookings');
        return response.json();
    }
};