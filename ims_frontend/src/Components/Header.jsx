import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import { Button, Card, Container, Row, Col, Image } from 'react-bootstrap';
import { ChangePasswordModal } from 'components/ChangePasswordModal';
import { HeaderCaption } from 'components/HeaderCaption';
import { ApiService } from 'services/ApiService'
import 'styles/Header.css';
import LogOff from 'images/sign-out.png';

export const Header = ({ setError, mode, onModeChange }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);    
    

    useEffect(() => {       
        const storedAuthData = sessionStorage.getItem('authData');
        if (storedAuthData) {
            const parsedAuthData = JSON.parse(storedAuthData);
            if (parsedAuthData.username) {
                setUserName(parsedAuthData.username);
            }
        }
    }, []);    

    const handleOpenChangePasswordModal = () => {
        setShowChangePasswordModal(true);
    };

    const handleCloseChangePasswordModal = () => {
        setShowChangePasswordModal(false);
    };

    const handleLogout = async () => {
        try {
            const response = await ApiService.post('/api/v2/logout/'); 
            if (response.data.success) { // Check for success response
                sessionStorage.removeItem('authData'); // Clear session storage
                navigate('/login'); // Navigate to login page
            } else {
                setError(response.data.error || 'Logout failed.'); // Handle errors
            }
        } catch (error) {
            console.error('Logout API error:', error);
            setError('An unexpected error occurred during logout.'); 
        }
    };

    return (
        <>
            <Card>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col className="header-left-content">
                                <Card.Title>
                                    {import.meta.env.VITE_APP_NAME_TITLE}
                                </Card.Title>
                                <HeaderCaption mode={mode} />
                            </Col>
                            <Col>
                                <Row className="noWrap">
                                    <Col style={{ textAlign: 'right', alignContent: 'center' }} className="colPadding">Welcome {userName}!</Col>
                                    <Col md="auto" className="colPadding">
                                        <Button variant="primary" type="submit" className="ButtonWrap" onClick={handleOpenChangePasswordModal}>
                                            Change Password
                                        </Button>
                                        <ChangePasswordModal
                                            show={showChangePasswordModal}
                                            onHide={handleCloseChangePasswordModal}                                            
                                        />
                                    </Col>
                                    <Col md="auto" className="colPadding">
                                        <Button variant="primary" type="submit" onClick={onModeChange}>
                                            <FontAwesomeIcon icon={faUser} />
                                        </Button>                                       
                                    </Col>
                                    <Col xs md lg="1" className="colPadding">
                                        <Button variant="outline-primary" size="sm" onClick={handleLogout}>
                                            <Image src={LogOff} className="logOut" />
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Container>
                </Card.Body >
            </Card >
        </>
    );
}