const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const FormData = require('form-data');
require('dotenv').config();

const app = express();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Handle audio transcription
app.post('/api/openai/audio/transcriptions', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'audio.webm',
            contentType: req.file.mimetype,
        });
        formData.append('model', 'whisper-1');

        const response = await axios.post(
            'https://api.openai.com/v1/audio/transcriptions',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Transcription error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

// Handle thread creation
app.post('/api/openai/threads', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/threads',
            {},
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Thread creation error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

// Handle messages in threads
app.post('/api/openai/threads/:threadId/messages', async (req, res) => {
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/threads/${req.params.threadId}/messages`,
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Message creation error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

// Handle runs in threads
app.post('/api/openai/threads/:threadId/runs', async (req, res) => {
    try {
        const response = await axios.post(
            `https://api.openai.com/v1/threads/${req.params.threadId}/runs`,
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Run creation error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

// Get run status
app.get('/api/openai/threads/:threadId/runs/:runId', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/threads/${req.params.threadId}/runs/${req.params.runId}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Run status error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages from thread
app.get('/api/openai/threads/:threadId/messages', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.openai.com/v1/threads/${req.params.threadId}/messages`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Messages retrieval error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

// Handle text-to-speech
app.post('/api/openai/audio/speech', async (req, res) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/audio/speech',
            req.body,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );
        res.set('Content-Type', 'audio/mpeg');
        res.send(response.data);
    } catch (error) {
        console.error('Text-to-speech error:', error.response?.data || error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Key present: ${!!process.env.OPENAI_API_KEY}`);
});