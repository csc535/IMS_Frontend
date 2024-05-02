import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Header } from 'components/Header';
import { Message } from 'components/Message';
import { DataReports } from './DataReports';
import { ApiService } from 'services/ApiService'
export function LandingPage() {
    const Mode = {
        WAREHOUSE: 'Warehouse',
        STORE: 'Store',
    };
    const [currentMode, setCurrentMode] = useState(Mode.WAREHOUSE);
    const navigate = useNavigate();
    const [error, setError] = useState(null);


    useEffect(() => {
        const isAuthenticated = checkAuthFromStorage();
        if (!isAuthenticated) {
            navigate('/login');
        }
        else {
            const fetchUser = async () => {
                setError(null);

                try {
                    const response = await ApiService.get('/api/v2/user/');
                    if (response?.status === 200) {
                        const isAdmin = response.data?.isAdmin;                        
                        let authData = JSON.parse(sessionStorage.getItem('authData'));
                        authData.isAdmin = isAdmin;
                        sessionStorage.setItem('authData', JSON.stringify(authData));

                    }
                } catch (error) {
                    setError(error);
                }
            };
            fetchUser();
        }
    }, []);

    function checkAuthFromStorage() {
        const authData = JSON.parse(sessionStorage.getItem('authData'));
        return authData && authData.isAuthenticated;
    }

    const toggleCaption = () => {
        setError(null);
        setCurrentMode(prevState => (prevState === Mode.WAREHOUSE ? Mode.STORE : Mode.WAREHOUSE));
    };

    return (
        <>
            <Row>
                <Header
                    setError={setError}
                    mode={currentMode}
                    onModeChange={toggleCaption} />
            </Row>
            {error &&
                <Row>
                    <Message error={error} />
                </Row>
            }
            <Row>
                <Col style={{ backgroundColor: 'white' }}>
                    <DataReports
                        setError={setError}
                        modes={Mode}
                        currentMode={currentMode}
                    />
                </Col>
            </Row>
        </>
    );
}