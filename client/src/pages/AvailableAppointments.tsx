import React, { useState, useEffect } from 'react';
import { appointmentApi, Appointment } from '../api/appointment.api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const AvailableAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await appointmentApi.getAvailableSlots();
            setAppointments(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleBook = async (appointmentId: string) => {
        setBookingId(appointmentId);
        setError('');
        setSuccessMessage('');

        try {
            await appointmentApi.bookAppointment(appointmentId);
            setSuccessMessage('Appointment booked successfully!');
            // Refresh the list
            await fetchAppointments();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setBookingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container">
            <h1>Available Appointment Slots</h1>

            {error && <ErrorMessage message={error} />}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {appointments.length === 0 ? (
                <p className="no-data">No available appointments at the moment.</p>
            ) : (
                <div className="appointments-grid">
                    {appointments.map((appointment) => (
                        <div key={appointment._id} className="appointment-card">
                            <div className="appointment-date">{formatDate(appointment.date)}</div>
                            <div className="appointment-time">
                                {appointment.startTime} - {appointment.endTime}
                            </div>
                            <button
                                onClick={() => handleBook(appointment._id)}
                                className="btn btn-primary"
                                disabled={bookingId === appointment._id}
                            >
                                {bookingId === appointment._id ? 'Booking...' : 'Book'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableAppointments;
