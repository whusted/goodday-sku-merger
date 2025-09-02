// Standalone script to send data to API (for testing purposes)
const fetch = require('node-fetch');

async function sendToAPI(jsonData) {
    try {
        console.log('Sending data to Goodday API:', jsonData);
        
        const response = await fetch('https://goodday-app-prod.uc.r.appspot.com/api/items/move', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-goodday-api-key': 'ABC123'
            },
            body: JSON.stringify(jsonData)
        });
        
        const responseData = await response.text();
        
        if (response.ok) {
            console.log('Success! Response:', responseData);
            return { success: true, data: responseData };
        } else {
            console.error(`API Error ${response.status}:`, responseData);
            return { success: false, error: `API Error ${response.status}: ${responseData}` };
        }
        
    } catch (error) {
        console.error('Request failed:', error);
        return { success: false, error: error.message };
    }
}

// Example usage
if (require.main === module) {
    const sampleData = [
        {
            "sku": "SKU001",
            "skuToReplace": "SKU002", 
            "retainSku": "sku"
        }
    ];
    
    sendToAPI(sampleData).then(result => {
        console.log('Final result:', result);
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = { sendToAPI }; 