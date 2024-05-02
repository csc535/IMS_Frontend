import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'react-bootstrap';
import 'styles/DeleteItem.css';

export const DeleteItemModal = ({ show, handleClose, onDelete, item }) => {
    const getItemValue = (item) => {
        return item.unit_price !== undefined ? item.unit_price : item.selling_price;
    };

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static">
            <ModalHeader closeButton>
                <Modal.Title>Delete Item</Modal.Title>
            </ModalHeader>
            <ModalBody>
                <p>Confirm permanent deletion of this item?</p>                
                {item && (
                    <>
                        <div className="detail">
                            <span className="detail-label">SKU:</span>
                            <span className="detail-value">{item.sku}</span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Name:</span>
                            <span className="detail-value">{item.desc}</span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Quantity:</span>
                            <span className="detail-value">{item.units_total}</span>
                        </div>
                        <div className="detail">
                            <span className="detail-label">Unit Price:</span>
                            <span className="detail-value">{getItemValue(item)}</span>
                        </div>
                    </>
                )}
            </ModalBody>
            <ModalFooter>
                <Button variant="danger" onClick={() => onDelete(item)}>
                    Delete
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
};