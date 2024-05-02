import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Col, Row } from 'react-bootstrap';
import { ApiService } from 'services/ApiService'

export const AddItemModal = ({ show, onHide, onAddItem, modes, currentMode, setError }) => {
    const [itemData, setItemData] = useState({
        sku: '',
        description: '',
        quantity: 0,
        unitPrice: 0.0,
        sellPrice: 0.0,
    });

    useEffect(() => {
        if (show) {
            setItemData({
                sku: '',
                description: '',
                quantity: 0,
                unitPrice: 0.0,
                sellPrice: 0.0,
            });
        }
    }, [show]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null); // Clear any previous errors

        try {
            let response = '';
            if (currentMode === modes.WAREHOUSE) {
                let data = {
                    sku: itemData.sku.trim(),
                    desc: itemData.description.trim(),
                    units_total: itemData.quantity,
                    unit_price: itemData.unitPrice,
                };

                response = await ApiService.post('/api/v2/stock/', data);
            }
            if (currentMode === modes.STORE) {
                let data = {
                    sku: itemData.sku.trim(),
                    desc: itemData.description.trim(),
                    units_total: itemData.quantity,
                    xfer_price: itemData.unitPrice,
                    selling_price: itemData.sellPrice,
                };

                response = await ApiService.post('/api/v2/accounts/stock/', data);
            }

            if (response?.status === 201) {
                onAddItem(); // Call function to handle successful addition (e.g., refresh data)  
                setError(`Records successfully added!`);            
            }
        } catch (error) {            
            setError(`Error adding item: ${ error.message }`);
        }
        finally {
            onHide(); // Close the modal
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setItemData({ ...itemData, [name]: value }); // Update specific property
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Stock Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            SKU
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="text" name="sku" value={itemData.sku} onChange={handleChange} required />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Description
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="text" name="description" value={itemData.description} onChange={handleChange} required />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Quantity
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="number" name="quantity" min={0} value={itemData.quantity} onChange={handleChange} required />
                        </Col>
                    </Form.Group>                    
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Unit Price
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="number" name="unitPrice" min={0.0} step={0.01} value={itemData.unitPrice} onChange={handleChange} required />
                        </Col>
                    </Form.Group>
                    {currentMode === modes.STORE && (
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Sell Price
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="number" name="sellPrice" min={0.0} step={0.01} value={itemData.sellPrice} onChange={handleChange} required />
                        </Col>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        Add Item
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};