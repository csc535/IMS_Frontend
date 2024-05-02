import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRotateRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, Row, Col, Table, InputGroup, FormControl } from 'react-bootstrap';
import moment from 'moment-timezone';
import { Paginate } from 'components/Paginate';
import { ApiService } from 'services/ApiService'
import { AddItemModal } from 'components/AddItemModal';
import { EditItemModal } from 'components/EditItemModal';
import { DeleteItemModal } from 'components/DeleteItemModal';

export const DataReports = ({ setError, modes, currentMode }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(import.meta.env.VITE_APP_ROWS_PER_TABLE); // Items per page
    const [totalCount, setTotalCount] = useState(0); // Total number of items    
    const [searchFilter, setSearchFilter] = useState('');
    const isAdmin = JSON.parse(sessionStorage.getItem('authData'))?.isAdmin ?? false;
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelected] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);


    //const fetchData = async (page, currentMode) => {
    //    setIsLoading(true);
    //    try {
    //        let response = '';
    //        if (currentMode === modes.WAREHOUSE) {
    //            response = await ApiService.get(`/api/v2/stock/?limit=${pageSize}&offset=${(page - 1) * pageSize}`);
    //        }

    //        if (currentMode === modes.STORE) {
    //            response = await ApiService.get(`/api/v2/accounts/stock/?limit=${pageSize}&offset=${(page - 1) * pageSize}`);
    //        }

    //        if (response?.status === 200) {
    //            setData(response.data.results);
    //            setTotalCount(response.data.count);
    //        }
    //    } catch (error) {
    //        console.error('Error fetching data:', error);
    //        setError(error.message);
    //    } finally {
    //        setIsLoading(false);
    //    }
    //};

    //useEffect(() => {
    //    fetchData(currentPage, currentMode);
    //}, [currentPage, currentMode]);

    useEffect(() => {
        const fetchData = async (page = currentPage, mode = currentMode) => {
            setIsLoading(true);
            try {
                let response = '';
                if (mode === modes.WAREHOUSE) {
                    response = await ApiService.get(`/api/v2/stock/?limit=${pageSize}&offset=${(page - 1) * pageSize}`);
                }

                if (mode === modes.STORE) {
                    response = await ApiService.get(`/api/v2/accounts/stock/?limit=${pageSize}&offset=${(page - 1) * pageSize}`);
                }

                if (response?.status === 200) {
                    setData(response.data.results);
                    setTotalCount(response.data.count);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData(currentPage, currentMode);
    }, [currentPage, currentMode]);

    const handleRefresh = (page = 1) => {
        setError(null);
        // Update currentPage to trigger useEffect for data refresh
        setCurrentPage(page);  // Reset to page 1 for refresh        
    };

    const handleFilter = (event) => {
        setSearchFilter(event.target.value);
    };

    const filteredData = data.filter((item) =>
        item.desc.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.sku.toString().toLowerCase().includes(searchFilter.toLowerCase())
    );

    const convertToLocalTime = (utcDatetime) => {
        return utcDatetime ? `${moment.utc(utcDatetime).local()
            .format('MM/DD/YYYY h:mm A')} ${moment.tz(moment.tz.guess()).zoneAbbr()}`
            : null;
    };

    //const handleRefresh = (page = currentPage) => {
    //    setError(null);
    //    setCurrentPage(page);
    //    fetchData(page, currentMode);
    //};    

    const handleEditClick = (item) => {
        setSelected(item);
    };

    const handleDeleteClick = (item) => {
        setError(null);
        setSelectedItemToDelete(item);
        setShowDeleteModal(true);
    };

    const handleDeleteItem = async (item) => {
        try {
            let response = '';
            if (currentMode === modes.WAREHOUSE) {
                // Implement API call to delete the item
                response = await ApiService.delete(`api/v2/stock/${item.id}`);
            }
            if (currentMode === modes.STORE) {
                response = await ApiService.delete(`api/v2/accounts/stock/${item.id}`);
            }

            if (response?.status === 204) {
                // Success: close modal and refresh data
                setShowDeleteModal(false);
                setSelectedItemToDelete(null);
                handleRefresh();
                setError("Record deleted!");
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(error.message);
        }
    };

    const getColumnCount = () => {
        let count = 5; // Base columns (SKU, Description, Item In Stock, Record Updated)
        if (currentMode === modes.STORE) {
            count += 3; // Add Item Shrinkage and Item Sold for STORE mode
        }
        if (isAdmin) {
            count += 1; // Add Action column if isAdmin is true
        }
        return count;
    };

    return (
        <>
            {isLoading && <p>Loading data...</p>}
            <Row style={{ padding: '15px 5px 0px 5px' }} >
                <Col md="auto" className="colPadding">
                    <Button variant="primary" type="submit" onClick={() => handleRefresh()} disabled={isLoading}>
                        <FontAwesomeIcon icon={faArrowRotateRight} />
                    </Button>
                </Col>
                {isAdmin && (
                    <Col md="auto" className="colPadding">
                        <Button variant="primary" type="submit" onClick={() => setShowModal(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                        </Button>
                        <AddItemModal
                            show={showModal}
                            onHide={() => setShowModal(false)}
                            onAddItem={() => handleRefresh()}
                            modes={modes}
                            currentMode={currentMode}
                            setError={setError}
                        />
                    </Col>
                )}
                <Col>
                    <InputGroup className="mb-2">
                        <FormControl
                            style={{ width: "200px" }}
                            className="form-control mb-2"
                            placeholder="Search"
                            value={searchFilter}
                            onChange={handleFilter}
                        />
                    </InputGroup>
                </Col>
                <Col style={{ display: 'flex', justifyContent: 'flex-end' }} >
                    {filteredData.length > 0 &&
                        <Paginate
                            itemsCount={totalCount}
                            itemsPerPage={pageSize}
                            currentPage={parseInt(currentPage)}
                            setCurrentPage={setCurrentPage}
                            alwaysShown={true}
                        />
                    }
                </Col>
            </Row>
            <Table striped bordered hover className="custom-table" >
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Description</th>
                        <th>Item In Stock</th>
                        {currentMode === modes.STORE && (
                            <th>Item Shrinkage</th>
                        )}
                        {currentMode === modes.STORE && (
                            <th>Item Sold</th>
                        )}
                        <th>Unit Price</th>
                        {currentMode === modes.STORE && (
                            <th>Sell Price</th>
                        )}
                        <th>Record Updated</th>
                        {isAdmin && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredData.length > 0 ? (
                        filteredData.map((item) => (
                            <tr key={item.id}>
                                <td>{item.sku}</td>
                                <td>{item.desc}</td>
                                <td>{item.units_total}</td>
                                {currentMode === modes.STORE && (
                                    <td>{item.shrinkage}</td>
                                )}
                                {currentMode === modes.STORE && (
                                    <td>{item.sold_units}</td>
                                )}
                                {currentMode === modes.WAREHOUSE ? (
                                    <td>{item.unit_price}</td>
                                ) : (
                                    <td>{item.selling_price}</td>
                                )}
                                {currentMode === modes.STORE && (
                                    <td>{item.xfer_price}</td>
                                )}
                                <td>{convertToLocalTime(item.record_updated)}</td>
                                {isAdmin && (
                                    <td>
                                        <Button style={{ marginRight: '10px' }} variant="primary" size="sm" onClick={() => handleEditClick(item)}>
                                            Edit
                                        </Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteClick(item)}>
                                            Delete
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={getColumnCount()}>No data found</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <EditItemModal
                show={selectedItem !== null} // Show modal only if an item is selected
                onHide={() => setSelected(null)} // Close modal on cancel
                item={selectedItem} // Pass the selected item for editing
                currentPage={currentPage} // Pass the current page as a prop
                onEditItem={() => handleRefresh(currentPage)} // Callback function for successful edit
                modes={modes}
                currentMode={currentMode}
                setError={setError}
            />
            <DeleteItemModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                onDelete={handleDeleteItem}
                item={selectedItemToDelete}
            />
        </>
    );
};