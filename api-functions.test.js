// Jest tests for API functions
const { sendToAPI, showError, showSuccess, hideMessages } = require('./api-functions');

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM elements
const mockElements = {
    jsonOutput: { textContent: '' },
    sendApiBtn: { 
        textContent: 'Send to API', 
        disabled: false, 
        style: { background: '#007bff' } 
    },
    errorMessage: { 
        textContent: '', 
        classList: { 
            remove: jest.fn(), 
            add: jest.fn() 
        } 
    },
    successMessage: { 
        textContent: '', 
        classList: { 
            remove: jest.fn(), 
            add: jest.fn() 
        } 
    }
};

// Mock document.getElementById
global.document = {
    getElementById: jest.fn((id) => {
        return mockElements[id] || {};
    })
};

// Mock console
global.console = {
    error: jest.fn(),
    log: jest.fn()
};

// Mock setTimeout to execute immediately
global.setTimeout = jest.fn((callback, delay) => {
    callback();
    return 1;
});

describe('API Functions', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        fetch.mockClear();
        
        // Reset mock elements
        mockElements.jsonOutput.value = '';
        mockElements.sendApiBtn.textContent = 'Send to API';
        mockElements.sendApiBtn.disabled = false;
        mockElements.sendApiBtn.style.background = '#007bff';
        mockElements.errorMessage.textContent = '';
        mockElements.successMessage.textContent = '';
    });

    describe('sendToAPI', () => {
        test('should make successful API call with correct parameters', async () => {
            // Setup
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({ success: true, message: 'Items moved successfully' })
            };
            fetch.mockResolvedValueOnce(mockResponse);
            
            mockElements.jsonOutput.value = JSON.stringify({
                force: false,
                moves: [
                    { sku: "197801171173", skuToReplace: "197801171173-DUPLICATE-1", retainSku: "sku" }
                ]
            });

            // Execute
            await sendToAPI();

            // Verify fetch was called with correct parameters
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(
                'https://goodday-app-prod.uc.r.appspot.com/api/items/move',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goodday-api-key': 'ABC123'
                    },
                    body: JSON.stringify({
                        force: false,
                        moves: [
                            { sku: "197801171173", skuToReplace: "197801171173-DUPLICATE-1", retainSku: "sku" }
                        ]
                    })
                }
            );

            // Verify button state changes (after async operations complete)
            expect(mockElements.sendApiBtn.textContent).toBe('Send to API');
            expect(mockElements.sendApiBtn.disabled).toBe(false);
            expect(mockElements.sendApiBtn.style.background).toBe('#007bff');
        });

        test('should handle API error response', async () => {
            // Setup
            const mockResponse = {
                ok: false,
                status: 400,
                text: jest.fn().mockResolvedValue('Bad Request: Invalid SKU format')
            };
            fetch.mockResolvedValueOnce(mockResponse);
            
            mockElements.jsonOutput.value = JSON.stringify({
                force: false,
                moves: [
                    { sku: "invalid-sku", skuToReplace: "invalid-sku-DUPLICATE-1", retainSku: "sku" }
                ]
            });

            // Execute
            await sendToAPI();

            // Verify error handling
            expect(mockElements.sendApiBtn.textContent).toBe('Send to API');
            expect(mockElements.sendApiBtn.style.background).toBe('#007bff');
            expect(console.error).toHaveBeenCalledWith('API call failed:', expect.any(Error));
        });

        test('should handle network error', async () => {
            // Setup
            fetch.mockRejectedValueOnce(new Error('Network error'));
            
            mockElements.jsonOutput.value = JSON.stringify({
                force: false,
                moves: [
                    { sku: "197801171173", skuToReplace: "197801171173-DUPLICATE-1", retainSku: "sku" }
                ]
            });

            // Execute
            await sendToAPI();

            // Verify error handling
            expect(mockElements.sendApiBtn.textContent).toBe('Send to API');
            expect(mockElements.sendApiBtn.style.background).toBe('#007bff');
            expect(console.error).toHaveBeenCalledWith('API call failed:', expect.any(Error));
        });

        test('should handle missing JSON data', async () => {
            // Setup
            mockElements.jsonOutput.value = '';

            // Execute
            await sendToAPI();

            // Verify error message
            expect(mockElements.errorMessage.textContent).toBe('No JSON data to send. Please upload a CSV file first.');
            expect(fetch).not.toHaveBeenCalled();
        });

        test('should handle invalid JSON data', async () => {
            // Setup
            mockElements.jsonOutput.value = 'invalid json data';

            // Execute
            await sendToAPI();

            // Verify error handling
            expect(mockElements.sendApiBtn.textContent).toBe('Send to API');
            expect(mockElements.sendApiBtn.style.background).toBe('#007bff');
            expect(console.error).toHaveBeenCalledWith('API call failed:', expect.any(Error));
        });

        test('should verify API call structure', async () => {
            // Setup
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({ success: true })
            };
            fetch.mockResolvedValueOnce(mockResponse);
            
            mockElements.jsonOutput.value = JSON.stringify({
                force: false,
                moves: [{ sku: "test", skuToReplace: "test-dup", retainSku: "sku" }]
            });

            // Execute
            await sendToAPI();

            // Verify API call structure
            expect(fetch).toHaveBeenCalledWith(
                'https://goodday-app-prod.uc.r.appspot.com/api/items/move',
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goodday-api-key': 'ABC123'
                    },
                    body: expect.stringContaining('"force":false')
                })
            );
        });
    });

    describe('showError', () => {
        test('should display error message and hide other messages', () => {
            // Execute
            showError('Test error message');

            // Verify
            expect(mockElements.errorMessage.textContent).toBe('Test error message');
            expect(mockElements.errorMessage.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockElements.successMessage.classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('showSuccess', () => {
        test('should display success message and hide other messages', () => {
            // Execute
            showSuccess('Test success message');

            // Verify
            expect(mockElements.successMessage.textContent).toBe('Test success message');
            expect(mockElements.successMessage.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockElements.errorMessage.classList.add).toHaveBeenCalledWith('hidden');
        });
    });

    describe('hideMessages', () => {
        test('should hide both error and success messages', () => {
            // Execute
            hideMessages();

            // Verify
            expect(mockElements.errorMessage.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockElements.successMessage.classList.add).toHaveBeenCalledWith('hidden');
        });
    });
});
