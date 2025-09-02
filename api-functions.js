// API functions for CSV to JSON Transformer
// This module contains the functions we want to test

// Helper functions
function showError(message) {
    hideMessages();
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function showSuccess(message) {
    hideMessages();
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.classList.remove('hidden');
}

function hideMessages() {
    document.getElementById('errorMessage').classList.add('hidden');
    document.getElementById('successMessage').classList.add('hidden');
}

// Main API function
async function sendToAPI() {
    const jsonOutput = document.getElementById('jsonOutput');
    const sendApiBtn = document.getElementById('sendApiBtn');
    
    if (!jsonOutput.value) {
        showError('No JSON data to send. Please upload a CSV file first.');
        return;
    }

    try {
        // Parse the JSON to validate it
        const jsonData = JSON.parse(jsonOutput.value);
        
        // Update button state
        const originalText = sendApiBtn.textContent;
        sendApiBtn.textContent = 'Sending...';
        sendApiBtn.disabled = true;
        sendApiBtn.style.background = '#6c757d';
        
        // Make the API call to our local server (which will proxy to Goodday)
        const response = await fetch('http://localhost:3001/api/items/move', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess(`Successfully sent to API! Response: ${JSON.stringify(result)}`);
            sendApiBtn.textContent = 'Sent!';
            sendApiBtn.style.background = '#28a745';
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || `API Error ${response.status}`);
        }
        
    } catch (error) {
        console.error('API call failed:', error);
        showError(`Failed to send to API: ${error.message}`);
        sendApiBtn.textContent = "Send to API";
        sendApiBtn.style.background = '#007bff';
    } finally {
        sendApiBtn.disabled = false;
        
        // Reset button after 3 seconds
        setTimeout(() => {
            sendApiBtn.textContent = 'Send to API';
            sendApiBtn.style.background = '#007bff';
        }, 3000);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendToAPI,
        showError,
        showSuccess,
        hideMessages
    };
}
