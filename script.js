// CSV to JSON Transformer
class CSVTransformer {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadSection = document.getElementById('uploadSection');

        // File input change event
        fileInput.addEventListener('change', (e) => {
            this.handleFile(e.target.files[0]);
        });

        // Drag and drop events
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });

        uploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
        });

        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'text/csv') {
                this.handleFile(file);
            } else {
                this.showError('Please upload a valid CSV file.');
            }
        });
    }

    handleFile(file) {
        if (!file) return;

        // Show file info
        this.showFileInfo(file);

        // Read and process the file
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvContent = e.target.result;
                this.currentCSVContent = csvContent; // Store for regeneration
                const jsonResult = this.transformCSVToJSON(csvContent);
                this.displayResult(jsonResult);
            } catch (error) {
        const apiResponseSection = document.getElementById('apiResponseSection');
        const apiResponse = document.getElementById('apiResponse');
        apiResponse.value = `Network Error: ${error.message}`;
        apiResponseSection.style.display = 'block';
                this.showError('Error processing CSV: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    transformCSVToJSON(csvContent) {
        const lines = csvContent.trim().split('\n');
        
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        // Parse header
        const headers = this.parseCSVLine(lines[0]);
        
        // Validate headers
        const requiredHeaders = ['sku', 'skuToReplace', 'retainSku'];
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }

        // Get column indices
        const skuIndex = headers.indexOf('sku');
        const skuToReplaceIndex = headers.indexOf('skuToReplace');
        const retainSkuIndex = headers.indexOf('retainSku');

        // Parse data rows
        const moves = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            
            if (values.length !== headers.length) {
                throw new Error(`Row ${i + 1} has ${values.length} columns but expected ${headers.length}`);
            }

            const sku = values[skuIndex]?.trim();
            const skuToReplace = values[skuToReplaceIndex]?.trim();
            const retainSku = values[retainSkuIndex]?.trim();

            if (!sku || !skuToReplace || !retainSku) {
                throw new Error(`Row ${i + 1} has empty values in required columns`);
            }

            const retainSkuValue = (retainSku === sku) ? "sku" : retainSku;

            moves.push({
                sku: sku,
                skuToReplace: skuToReplace,
                retainSku: retainSkuValue
            });
        }

        // Get the force checkbox value
        const forceCheckbox = document.getElementById('forceCheckbox');
        const forceValue = forceCheckbox ? forceCheckbox.checked : false;

        return {
            force: forceValue,
            moves: moves
        };
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    displayResult(jsonResult) {
        const outputSection = document.getElementById('outputSection');
        const jsonOutput = document.getElementById('jsonOutput');
        
        jsonOutput.value = JSON.stringify(jsonResult, null, 2);
        outputSection.style.display = 'block';
        
        // Store the result for copying
        this.currentResult = jsonResult;
        
        // Check if merge button should be enabled
        checkMergeButtonState();
    }

    // Method to regenerate JSON when force checkbox changes
    regenerateJSON() {
        if (this.currentCSVContent) {
            try {
                const jsonResult = this.transformCSVToJSON(this.currentCSVContent);
                this.displayResult(jsonResult);
            } catch (error) {
                this.showError('Error processing CSV: ' + error.message);
            }
        }
    }

    showFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        fileInfo.innerHTML = `
            <strong>Selected file:</strong> ${file.name}<br>
            <strong>Size:</strong> ${this.formatFileSize(file.size)}<br>
            <strong>Type:</strong> ${file.type}
        `;
        fileInfo.style.display = 'block';
    }

    showError(message) {
        this.hideMessages();
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    showSuccess(message) {
        this.hideMessages();
        const successDiv = document.getElementById('successMessage');
        successDiv.textContent = message;
        successDiv.classList.remove('hidden');
    }

    hideMessages() {
        document.getElementById('errorMessage').classList.add('hidden');
        document.getElementById('successMessage').classList.add('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Copy to clipboard function
function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput');
    const text = jsonOutput.value;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Function to check if merge button should be enabled
function checkMergeButtonState() {
    const jsonOutput = document.getElementById('jsonOutput');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const sendApiBtn = document.getElementById('sendApiBtn');
    
    const hasJsonData = jsonOutput.value.trim() !== '';
    const hasApiKey = apiKeyInput.value.trim() !== '';
    
    if (hasJsonData && hasApiKey) {
        sendApiBtn.disabled = false;
        sendApiBtn.style.opacity = '1';
        sendApiBtn.style.cursor = 'pointer';
    } else {
        sendApiBtn.disabled = true;
        sendApiBtn.style.opacity = '0.6';
        sendApiBtn.style.cursor = 'not-allowed';
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const csvTransformer = new CSVTransformer();
    
    // Add event listener for API key input
    const apiKeyInput = document.getElementById('apiKeyInput');
    apiKeyInput.addEventListener('input', checkMergeButtonState);
    
    // Add event listener for force checkbox
    const forceCheckbox = document.getElementById('forceCheckbox');
    forceCheckbox.addEventListener('change', () => {
        csvTransformer.regenerateJSON();
    });
    
    // Initial check of merge button state
    checkMergeButtonState();
});

// Merge SKUs function
async function sendToAPI() {
    const jsonOutput = document.getElementById('jsonOutput');
    const sendApiBtn = document.getElementById('sendApiBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    if (!jsonOutput.value) {
        showError('No JSON data to send. Please upload a CSV file first.');
        return;
    }
    
    if (!apiKeyInput.value.trim()) {
        showError('Please enter your API key before merging SKUs.');
        return;
    }

    try {
        // Parse the JSON to validate it
        const jsonData = JSON.parse(jsonOutput.value);
        
        // Update button state
        const originalText = sendApiBtn.textContent;
        sendApiBtn.textContent = 'Merging...';
        sendApiBtn.disabled = true;
        sendApiBtn.style.background = '#6c757d';
        
        // Make the API call to our local server's /move endpoint
        const response = await fetch('http://localhost:3001/move', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKeyInput.value
            },
            body: JSON.stringify(jsonData)
        });
        
        if (response.ok) {
            // Try to parse as JSON, but handle non-JSON responses gracefully
            let result;
            let responseText;
            
            try {
                result = await response.json();
                responseText = JSON.stringify(result, null, 2); // Pretty formatted JSON
            } catch (parseError) {
                // If response is not JSON, get as text
                responseText = await response.text();
                // Try to format as JSON if it looks like JSON
                try {
                    const parsed = JSON.parse(responseText);
                    responseText = JSON.stringify(parsed, null, 2);
                } catch (e) {
                    // Keep as plain text if not valid JSON
                    responseText = responseText;
                }
            }
            
            // Display the response in the copy-able API response section
            const apiResponseSection = document.getElementById('apiResponseSection');
            const apiResponse = document.getElementById('apiResponse');
            apiResponse.value = responseText;
            apiResponseSection.style.display = 'block';
            
            sendApiBtn.textContent = 'Merged!';
            sendApiBtn.style.background = '#10b981';
        } else {
            // Handle error responses - also display them in the copy-able section
            let errorText;
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData, null, 2);
            } catch (e) {
                errorText = await response.text();
            }
            
            // Display the error response in the copy-able API response section
            const apiResponseSection = document.getElementById('apiResponseSection');
            const apiResponse = document.getElementById('apiResponse');
            apiResponse.value = errorText;
            apiResponseSection.style.display = 'block';
            
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
    } catch (error) {
        console.error('API call failed:', error);
        showError(`Failed to merge SKUs: ${error.message}`);
        sendApiBtn.textContent = originalText;
        sendApiBtn.style.background = '#3b82f6';
    } finally {
        sendApiBtn.disabled = false;
        
        // Reset button after 3 seconds and check state
        setTimeout(() => {
            sendApiBtn.textContent = 'Merge SKUs';
            sendApiBtn.style.background = '#3b82f6';
            checkMergeButtonState();
        }, 3000);
    }
}

// Helper function to show error messages
function showError(message) {
    hideMessages();
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

// Helper function to show success messages
function showSuccess(message) {
    hideMessages();
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
}

// Helper function to hide messages
function hideMessages() {
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('successMessage').classList.add('hidden');
}

// Copy API response to clipboard function
function copyApiResponse() {
    const apiResponse = document.getElementById('apiResponse');
    const text = apiResponse.value;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyResponseBtn = document.getElementById('copyResponseBtn');
        const originalText = copyResponseBtn.textContent;
        copyResponseBtn.textContent = 'Copied!';
        copyResponseBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyResponseBtn.textContent = originalText;
            copyResponseBtn.style.background = '#17a2b8';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy API response: ', err);
        alert('Failed to copy API response to clipboard');
    });
}

// Download sample CSV file
function downloadSampleFile() {
    const sampleCSV = `sku,skuToReplace,retainSku
197801171173,197801171173-DUPLICATE-1,197801171173
FL-PE-BASE-105,FL-PE-BASE-105-DUPLICATE-1,FL-PE-BASE-75
FL-PE-COLM-105,FL-PE-COLM-105-DUPLICATE-1,FL-PE-COLM-75
FL-PE-MERA-105,FL-PE-MERA-105-DUPLICATE-1,FL-PE-MERA-75
FL-PE-REMY-105,FL-PE-REMY-105-DUPLICATE-1,FL-PE-REMY-75
FL-PE-UMBR-105,FL-PE-UMBR-105-DUPLICATE-1,FL-PE-UMBR-75`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // Show success message
    showSuccess('Sample CSV file downloaded!');
}

// Update API key status when input changes
document.addEventListener('DOMContentLoaded', function() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    
    function updateApiKeyStatus() {
        if (apiKeyInput.value.trim()) {
            apiKeyStatus.textContent = 'Key Entered';
            apiKeyStatus.className = 'api-key-status valid';
        } else {
            apiKeyStatus.textContent = 'No Key';
            apiKeyStatus.className = 'api-key-status empty';
        }
    }
    
    // Update status on input change
    apiKeyInput.addEventListener('input', updateApiKeyStatus);
    
    // Initial status check
    updateApiKeyStatus();
});
