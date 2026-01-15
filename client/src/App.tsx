import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AvailableAppointments from './pages/AvailableAppointments';
import MyAppointments from './pages/MyAppointments';

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <div className="app">
                    <Navbar />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/appointments"
                                element={
                                    <ProtectedRoute>
                                        <AvailableAppointments />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/my-appointments"
                                element={
                                    <ProtectedRoute>
                                        <MyAppointments />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
        </Router>
    );
};

export default App;
