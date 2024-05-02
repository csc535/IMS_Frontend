import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Form } from 'react-bootstrap';
import { ApiService } from 'services/ApiService.jsx'

export const ChangePasswordModal = ({ show, onHide }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState(null); // To store API errors

    // Reset form state on modal open (using useEffect)
    useEffect(() => {
        if (show) {
            setCurrentPassword('');
            setNewPassword('');
            setError(null); // Clear previous errors as well
            // Get UserName from SessionStorage
            const storedAuthData = sessionStorage.getItem('authData');
            if (storedAuthData) {
                const parsedAuthData = JSON.parse(storedAuthData);
                if (parsedAuthData.username) {
                    setUserName(parsedAuthData.username);
                }
            }
        }
    }, [show]); // Dependency array: reset on show state change

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        if (newPassword == currentPassword) {
            setError('New password must be different than current password!');
            return;
        }

        try {
            const data = {
                old_password: currentPassword.trim(),
                new_password: newPassword.trim(),
                username: userName
            };

            // Call API to change password.
            const response = await ApiService.patch(`/api/v2/change-password/${userName}/`, data);

            if (response && response.data && response.data.password === "CHANGED") {
                if (!response.statusText === "OK") {
                    setError(response.data.message || 'An error occurred.'); // Handle API errors
                } else {
                    onHide(); // Close modal on success
                    sessionStorage.clear();
                    navigate('/login');
                }
            } else {
                setError(response.data.message || 'An error occurred.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Modal size="sm" show={show} onHide={onHide} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <Form.Group className="mb-3">
                        <Form.Control type="password"
                            placeholder="Current Password"
                            id="currentPassword"
                            name="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Control type="password"
                            placeholder="New Password"
                            id="newPassword"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="submit" variant="primary">
                        Change Password
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};