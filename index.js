const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
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

// ------------------------------------------------------------------------------------------------------------

// Basic route to serve a static HTML page (optional)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// -------------------------------------------------------------------------------------------------------------

app.post('/upload', upload.single('document'), (req, res) => {
    // req.file contains the file info
    if (!req.file) {
        return res.status(400).json({
            message: 'No file uploaded',
            code: '400',
            errors: ['File is required']
        });
    }

    const { referenceNo } = req.body;  // example string value
    console.log(referenceNo);
    console.log('Received file info:');
    console.log('Original name:', req.file.originalname);
    console.log('MIME type:', req.file.mimetype);
    console.log('Size (bytes):', req.file.size);

    res.json({ 
        message: 'SUCCESS! File info received.',
        code: '200',
        fileInfo: {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            referenceNo: referenceNo || 'N/A',  // Include reference number if provided
        },
        errors: null,
    });
});

//-------------------------------------------------------------------------------------------------------------
// Make sure uploads directory exists
fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
app.use('/binary-upload', express.raw({ type: '*/*', limit: '10mb' }));
app.put('/binary-upload', (req, res) => {
    console.log('Received binary data of length:', req.body.length);
    const outputPath = path.join(__dirname, 'uploads', `file_${Date.now()}`);

    fs.writeFile(outputPath, req.body, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error saving file' });
        }
        return res.json({ message: 'Binary file saved successfully', path: outputPath });
    });


    // return res.json({ message: 'Binary file saved successfully', path: '' });
});

// -------------------------------------------------------------------------------------------------------------

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
