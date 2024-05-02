import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { ApiService } from 'services/ApiService'
import 'styles/Login.css';

export const Login = (props) => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        navigate('/');
    };

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleError = (error) => {
        setHasError(true);
        setErrorMessage(error);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const Username = username.trim();
        const Password = password.trim();

        if (Username === '' || Password === '') {
            handleError('Username and password are required.');
            return;
        }
        setIsLoading(true);
        setErrorMessage('');

        try {
            const data = {
                username: Username,
                password: Password
            };
            const response = await ApiService.post('/api/api-token-auth/', data);
            
                if (response && response.data && response.data.token) {
                    // Store authentication data in SessionStorage
                    sessionStorage.setItem('authData', JSON.stringify({
                        username: Username,
                        isAuthenticated: true,
                        token: response.data.token
                    }));
                    handleLoginSuccess();
                } else {
                    handleError(response.data.message || 'Invalid credentials.');
                }
            
        } catch (error) {
            handleError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <React.Fragment>
            <div className="alert-container">
                {hasError && (
                    <Alert variant="danger" dismissible onClose={() => setHasError(false)}>
                        <Alert.Heading>Error!</Alert.Heading>
                        <p>{errorMessage}</p>
                    </Alert>
                )}
            </div>
            <Row>
                <Col md={{ span: 4, offset: 4 }}>
                    <React.Fragment>
                        <Form onSubmit={handleSubmit}>
                            <Card border="primary">
                                <Card.Header>
                                    <Card.Title>
                                        Inventory Management System
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body style={{ padding: '50px' }}>
                                    <Card.Text style={{ fontWeight: 'bold' }}>Sign in to your account</Card.Text>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="text" placeholder="User Name" id="username" name="username" value={username} onChange={handleUsernameChange} required />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Control type="password" placeholder="Password" id="password" name="password" value={password} onChange={handlePasswordChange} required />
                                    </Form.Group>
                                </Card.Body>
                                <Card.Footer>
                                    <Button variant="primary" type="submit" disabled={isLoading}>
                                        {isLoading ? 'Loading...' : 'Login'}
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Form>
                    </React.Fragment>
                </Col>
            </Row>
        </React.Fragment>
    );
}