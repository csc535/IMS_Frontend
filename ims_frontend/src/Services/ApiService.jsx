import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_API_ROUTE,
});

const getNestedErrorMessage = (data) => {
    // Check for various data types
    if (Array.isArray(data)) {
        // If array, loop and recursively call for nested messages
        return data.map(getNestedErrorMessage).join('\n');
    } else if (typeof data === 'object') {
        // If object, iterate through properties and check for messages
        const messages = [];
        for (const key in data) {
            if (key === 'message') { // Check for direct message property
                messages.push(data[key]);
            } else {
                // Recursively call for nested messages in object properties (optional)
                const nestedMessages = getNestedErrorMessage(data[key]);
                if (nestedMessages) {
                    messages.push(nestedMessages);
                }
            }
        }
        return messages.length > 0 ? messages.join('\n') : null;
    } else if (typeof data === 'string') {
        // Handle single string as error message
        return data;
    } else {
        // Fallback for unexpected data format
        return 'An unknown error occurred.';
    }
};

const handleError = (error) => {
    let errorMessage = '';
    // Handle errors here
    console.error('Error:', error);  // Log the error

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls outside the range of 2xx
        // Handle errors based on status code
        const { status, data } = error.response || {}; // Destructure response properties

        switch (status) {
            case 400:
                const message = getNestedErrorMessage(data);
                if (message) {
                    errorMessage = message; // Use the extracted message directly
                    console.error('Bad request:', errorMessage); // Log the specific error message                   
                } else {
                    console.error('Bad request:', data.message || 'Unknown error');
                    errorMessage = "Invalid data provided. Please check your request.";
                }
                break;
            case 401:
                console.error('Unauthorized:', data.message || 'Unauthorized access');
                errorMessage = "Unauthorized access. Please check your credentials.";
                break;
            case 403:
                console.error('Forbidden:', data.message || 'Forbidden access');
                errorMessage = "You do not have permission to perform this action.";
                break;
            case 404:
                console.error('Not found:', data.message || 'Resource not found');
                errorMessage = "The requested resource could not be found.";
                break;
            case 500:
                console.error('Internal server error:', data.message || 'Server error');
                errorMessage = "Internal server error. Please try again later.";
                break;
            default:
                console.error('Unknown error:', error);
                errorMessage = `Unexpected error: ${error}`;
        }
    } else if (error.request) {
        // The request was made but no response was received
        console.error('Request failed:', error.request);
        errorMessage = "Network error. Please check your internet connection.";
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        errorMessage = 'An unknown error occurred.';
    }

    //Re-throw the error for component handling
    throw new Error(errorMessage);
}

// Response interceptor
api.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
        handleError(error);
        return Promise.reject(error); // Re-throw the error for further handling
    }
);

// Request interceptor
api.interceptors.request.use(config => {
    // Build headers object
    const headers = {
        'Content-Type': 'application/json', // Set default Content-Type
    };

    // Retrieve authorization token from storage
    const authData = JSON.parse(sessionStorage.getItem('authData'));
    if (authData && authData.token) {
        headers.Authorization = `Token ${authData.token}`;
    }

    // Include X-CSRF-TOKEN header if provided in config
    if (config.csrfToken) {
        headers['X-CSRF-TOKEN'] = config.csrfToken;
    }

    // Add CancelToken for request cancellation (optional)
    const CancelToken = axios.CancelToken;
    if (config.cancelToken) {
        config.cancelToken = CancelToken.source(config.cancelToken).token; // Handle potential pre-existing cancelToken
    } else {
        config.cancelToken = CancelToken.source().token;
    }

    // Merge headers with existing config headers (if any)
    config.headers = { ...config.headers, ...headers };

    return config;
}, error => {
    return Promise.reject(error);
});

const fetchData = async (method, url, data = null, config = {}) => {
    const response = await api[method](url, data, config);
    return response;
};

export const ApiService = {

    get: (url, params = {}, config = {}) => fetchData('get', url, params, config),
    post: (url, data, config = {}) => fetchData('post', url, data, config),
    put: (url, data, config = {}) => fetchData('put', url, data, config),
    delete: (url, config = {}) => fetchData('delete', url, null, config),
    patch: (url, data, config = {}) => fetchData('patch', url, data, config),
};