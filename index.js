const express = require('express');
const app = express();
const port = 3000;

// Middleware to serve static files (optional)
app.use(express.static('public'));

// SSE endpoint
app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow cross-origin if needed
    
    // Function to send data to the client every 3 seconds
    const sendEvent = () => {
        const randomHeartRate = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Random heart rate between 60 and 100
        const eventData = {
            message: randomHeartRate,
        };
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);  // Send event
    };

    // Send data every 3 seconds
    const intervalId = setInterval(sendEvent, 500);

    // Clear interval when connection is closed
    req.on('close', () => {
        clearInterval(intervalId);
    });
});

// Basic route to serve a static HTML page (optional)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
