const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const path = require('path');
const { scrapeProducts, getCacheStats, clearCache } = require('./scraper');
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

// Cache management endpoints
app.get('/api/cache/stats', (req, res) => {
    res.json(getCacheStats());
});

app.post('/api/cache/clear', (req, res) => {
    res.json(clearCache());
});

// New product search endpoint using demo data
app.post('/api/products/search', async (req, res) => {
    console.log('Received product search request');
    try {
        const { query, limit = 5, useCache = true } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'No search query provided' });
        }
        
        console.log(`Searching for products: "${query}"`);
        
        const results = await scrapeProducts({
            query,
            limit,
            useCache
        });
        
        res.json(results);
    } catch (error) {
        console.error('Product search error:', error);
        res.status(500).json({ error: error.message });
    }
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

// New hybrid endpoint that uses OpenAI to understand the query then searches products
app.post('/api/assistant/products', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }
        
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // First, use OpenAI to understand the query and extract search parameters
        console.log('Analyzing query with OpenAI:', message);
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a product recommendation specialist. Extract search parameters from user queries. Return ONLY a JSON object with these fields: query (search string), category (optional), priceRange (optional), keyFeatures (array, optional), sortBy (optional). Nothing else."
                },
                { role: "user", content: message }
            ],
            response_format: { type: "json_object" }
        });
        
        // Parse the search parameters from the OpenAI response
        const searchParams = JSON.parse(completion.choices[0].message.content);
        console.log('Extracted search parameters:', searchParams);
        
        // Use the extracted query to search for products
        const searchQuery = searchParams.query;
        
        // Stream a message that we're searching
        res.write(`data: ${JSON.stringify({ content: `Searching for "${searchQuery}"...` })}\n\n`);
        
        // Search for products using our scraper
        const products = await scrapeProducts({
            query: searchQuery,
            limit: 5
        });
        
        // Send the final response
        res.write(`data: ${JSON.stringify({ content: products.text })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        
    } catch (error) {
        console.error('Hybrid search error:', error);
        res.write(`data: ${JSON.stringify({ content: `Sorry, I encountered an error: ${error.message}` })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

// Original Assistant chat endpoint (keep for backward compatibility)
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        openaiKeyPresent: !!process.env.OPENAI_API_KEY,
        cacheStats: getCacheStats()
    });
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