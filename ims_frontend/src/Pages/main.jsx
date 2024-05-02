import React from 'react';
import ReactDOM from 'react-dom/client';
import { Container, Row, Col } from 'react-bootstrap';
import { App } from './App';
import 'styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Container fluid>
            <Row>
                <Col>
                    <App />
                </Col>
            </Row>
        </Container>
    </React.StrictMode>,
)