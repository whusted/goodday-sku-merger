const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Root route - serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Move endpoint - proxy to GoodDay API
app.put('/move', async (req, res) => {
    try {
        console.log('Received request to move items:', req.body);
        
        // Get the API key from the request header
        const apiKey = req.headers['x-api-key'];
        
        if (!apiKey) {
            return res.status(400).json({ 
                error: 'API key is required. Please enter your API key.' 
            });
        }
        
        // Make the API call to our server's /move endpoint
        const response = await fetch('/move', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey
            },
            body: JSON.stringify(req.body)
        });
        
        const responseData = await response.text();
        
        if (response.ok) {
            try {
                const jsonData = JSON.parse(responseData);
                res.json(jsonData);
            } catch (e) {
                res.json({ message: responseData });
            }
        } else {
            res.status(response.status).json({ 
                error: `API Error ${response.status}: ${responseData}` 
            });
        }
        
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: `Server error: ${error.message}` 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
}); 