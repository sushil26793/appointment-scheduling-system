import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
    const { token } = useAuth();

    return (
        <div className="container home-container">
            <div className="home-content">
                <h1>Welcome to Appointment Scheduler</h1>
                <p className="home-description">
                    Manage your appointments efficiently with our smart scheduling system.
                </p>

                {token ? (
                    <div className="home-actions">
                        <Link to="/appointments" className="btn btn-primary btn-large">
                            View Available Slots
                        </Link>
                        <Link to="/my-appointments" className="btn btn-secondary btn-large">
                            My Appointments
                        </Link>
                    </div>
                ) : (
                    <div className="home-actions">
                        <Link to="/register" className="btn btn-primary btn-large">
                            Get Started
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-large">
                            Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
