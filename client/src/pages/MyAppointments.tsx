import React, { useState, useEffect } from 'react';
import { appointmentApi, Appointment } from '../api/appointment.api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MyAppointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await appointmentApi.getUserAppointments();
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

    const canCancel = (appointment: Appointment): boolean => {
        const now = new Date();
        const appointmentDate = new Date(appointment.date);
        const [hours, minutes] = appointment.startTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const hoursDifference = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursDifference >= 24;
    };

    const handleCancel = async (appointmentId: string) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        setCancellingId(appointmentId);
        setError('');
        setSuccessMessage('');

        try {
            await appointmentApi.cancelAppointment(appointmentId);
            setSuccessMessage('Appointment cancelled successfully!');
            // Refresh the list
            await fetchAppointments();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel appointment');
        } finally {
            setCancellingId(null);
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
            <h1>My Appointments</h1>

            {error && <ErrorMessage message={error} />}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {appointments.length === 0 ? (
                <p className="no-data">You don't have any appointments yet.</p>
            ) : (
                <div className="appointments-grid">
                    {appointments.map((appointment) => {
                        const cancellable = canCancel(appointment);
                        return (
                            <div key={appointment._id} className="appointment-card">
                                <div className="appointment-date">{formatDate(appointment.date)}</div>
                                <div className="appointment-time">
                                    {appointment.startTime} - {appointment.endTime}
                                </div>
                                <div className="appointment-status">
                                    <span className="status-badge">Booked</span>
                                </div>
                                <button
                                    onClick={() => handleCancel(appointment._id)}
                                    className="btn btn-danger"
                                    disabled={!cancellable || cancellingId === appointment._id}
                                    title={
                                        !cancellable
                                            ? 'Cannot cancel appointments less than 24 hours before start time'
                                            : ''
                                    }
                                >
                                    {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel'}
                                </button>
                                {!cancellable && (
                                    <p className="cancel-warning">
                                        Cannot cancel (less than 24 hours before start)
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
