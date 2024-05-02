import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Col, Row } from 'react-bootstrap';
import { ApiService } from 'services/ApiService'

export const EditItemModal = ({ show, onHide, item, currentPage, onEditItem, modes, currentMode, setError }) => {
    const [itemData, setItemData] = useState({
        id: 0,
        sku: '',
        description: '',
        quantity: 0,
        unitPrice: 0.0,
        sellPrice: 0.0,
        soldItem: 0,
        shrinkageItem: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false); // Track if any field has been edited

    // Identify the appropriate property names based on the selected item
    const getItemProperties = (item) => {
        return {
            id: item.id,
            sku: item.sku,
            description: item.desc,
            quantity: item.units_total,
            unitPrice: currentMode === modes.STORE ? item.selling_price : item.unit_price,
            sellPrice: currentMode === modes.STORE ? item.xfer_price : 0,
            soldItem: 0,
            shrinkageItem: 0,
        };
    };

    useEffect(() => {
        if (item) {
            setItemData(getItemProperties(item));
            setIsDirty(false); // Reset dirty flag
        }
    }, [item]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setItemData({ ...itemData, [name]: value }); // Update specific property     
        setIsDirty(true); // Set dirty flag when any field is edited
    };

    const handleEditSuccess = async () => {
        onEditItem(currentPage);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        if (!isDirty) {
            console.error('No changes detected to update data saving.');
            onHide();
            return;
        }

        setIsLoading(true);

        try {
            let response = '';
            if (currentMode === modes.WAREHOUSE) {
                let data = {
                    records: [
                        {
                            id: itemData.id,
                            sku: itemData.sku.trim(),
                            desc: itemData.description.trim(),
                            units_total: itemData.quantity,
                            unit_price: itemData.unitPrice
                        }
                    ]
                };
                response = await ApiService.patch('/api/v2/stock/', data);
            }

            if (currentMode === modes.STORE) {
                let data = {
                    id: itemData.id,
                    sku: itemData.sku.trim(),
                    desc: itemData.description.trim(),
                    units_total: itemData.quantity,
                    xfer_price: itemData.sellPrice,
                    selling_price: itemData.unitPrice,
                    sold_units: parseInt(itemData.soldItem),
                    shrinkage: parseInt(itemData.shrinkageItem)
                };
                response = await ApiService.patch(`/api/v2/accounts/stock/${itemData.id}/`, data);
            }

            if (response?.status === 200) {
                onEditItem();
                handleEditSuccess();
                setError("Records successfully updated!");
            }

        } catch (error) {
            console.error('Error updating item:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
            setIsDirty(false);
            onHide(); // Close modal on success
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Stock Item</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            SKU
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="text" value={itemData.sku} disabled />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Description
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="text" value={itemData.description} onChange={handleChange} name="description" required />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Quantity
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="number" value={itemData.quantity} onChange={handleChange} name="quantity" required disabled={currentMode === modes.STORE} />
                        </Col>
                    </Form.Group>
                    {currentMode === modes.STORE && (
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>
                                Shrink Qty
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control type="number" value={itemData.shrinkageItem === 0 ? '' : itemData.shrinkageItem} onChange={handleChange} name="shrinkageItem" />
                            </Col>
                        </Form.Group>
                    )}
                    {currentMode === modes.STORE && (
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>
                                Sold Quantity
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control type="number" value={itemData.soldItem === 0 ? '' : itemData.soldItem} onChange={handleChange} name="soldItem" />
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>
                            Unit Price
                        </Form.Label>
                        <Col sm={8}>
                            <Form.Control type="number" value={itemData.unitPrice} onChange={handleChange} name="unitPrice" required disabled={currentMode === modes.STORE} />
                        </Col>
                    </Form.Group>
                    {currentMode === modes.STORE && (
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>
                                Sell Price
                            </Form.Label>
                            <Col sm={8}>
                                <Form.Control type="number" value={itemData.sellPrice} onChange={handleChange} name="sellPrice" required />
                            </Col>
                        </Form.Group>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};