const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Speech synthesis endpoint
app.post('/api/openai/audio/speech', async (req, res) => {
    console.log('Received speech request');
    try {
        if (!req.body || !req.body.input) {
            throw new Error('No input text provided');
        }

        console.log('Creating speech with text:', req.body.input);
        
        const response = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy',
            input: req.body.input,
        });

        if (!response) {
            throw new Error('No response from OpenAI');
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
        });

        res.send(buffer);
    } catch (error) {
        console.error('Speech error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Assistant chat endpoint
app.post('/api/assistant/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const assistantId = 'asst_CDvFyzLG7KL7aRuTymxyrY9W';

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const thread = await openai.beta.threads.create();

        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message
        });

        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId
        });

        while (true) {
            const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            
            if (runStatus.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(thread.id);
                const response = messages.data[0].content[0].text.value;
                res.write(`data: ${JSON.stringify({ content: response })}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
                break;
            } else if (runStatus.status === 'failed') {
                throw new Error('Assistant run failed');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});

// Handle 404
app.use((req, res) => {
    console.log('404 for', req.path);
    res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
});