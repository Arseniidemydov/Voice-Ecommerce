# Voice-Ecommerce: Real-time Voice Product Recommendations

A real-time voice assistant for product recommendations from RecoverFit.co.uk, featuring a hybrid approach that combines GPT-4's language understanding with live web scraping.

## Features

- 🎤 **Voice Recognition** with automatic silence detection
- 🔍 **Real-time Web Scraping** of RecoverFit.co.uk products
- 🧠 **Hybrid Intelligence** using GPT-4 for query understanding
- 🔊 **Text-to-Speech** for natural spoken responses
- 📱 **Mobile-responsive UI** with product grid display
- 📊 **Follow-up Suggestions** for interactive conversations
- 💾 **Smart Caching** to improve performance and reduce redundant scraping

## How It Works

The application uses a hybrid approach:

1. **Voice Input**: The user speaks a product query via their microphone
2. **Language Processing**: The application determines if this is a product query 
3. **Query Analysis**: GPT-4 extracts structured search parameters from natural language
4. **Web Scraping**: The application scrapes RecoverFit.co.uk for matching products
5. **Response Generation**: Results are formatted in a consistent structure
6. **Voice Output**: The response is spoken aloud via text-to-speech

## Scraping Architecture

The scraping system has several features:

1. **Multi-Method Scraping**: Uses both Axios/Cheerio and Puppeteer approaches
   - Tries simple Axios/Cheerio scraping first for speed
   - Falls back to Puppeteer (headless browser) if needed for more complex pages
   
2. **Fallback System**: Includes pre-defined product data as a fallback
   - Ensures users always get product recommendations, even if scraping fails
   - Categories fallback products to match search intent

3. **Error Handling**: Robust error handling with timeouts
   - Sets 25-second timeout to prevent long-running scrapes
   - Provides graceful degradation with user-friendly messages

4. **Caching**: Implements in-memory caching for performance
   - Stores recent search results to reduce redundant scraping
   - Configurable TTL (Time-To-Live) and cache size

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Arseniidemydov/Voice-Ecommerce.git
cd Voice-Ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the server:
```bash
npm start
```

5. Navigate to `http://localhost:3000` in your web browser

## API Endpoints

- **/api/assistant/products**: Hybrid endpoint that uses GPT to analyze the query and searches RecoverFit.co.uk
- **/api/products/search**: Direct product search endpoint that scrapes RecoverFit.co.uk
- **/api/assistant/chat**: Original OpenAI Assistant endpoint (for non-product queries)
- **/api/openai/audio/speech**: Text-to-speech conversion
- **/api/cache/stats**: Get cache statistics
- **/api/cache/clear**: Clear the cache
- **/api/health**: Health check endpoint

## Project Structure

- **server.js**: Main Express server with API endpoints
- **scraper.js**: Real-time scraping logic for RecoverFit.co.uk
- **cache.js**: In-memory caching system for product searches
- **public/index.html**: Front-end interface with voice recognition
- **public/styles/main.css**: Styling for the UI

## Product Response Format

The application returns product data in this format:

```
Main text first.

Images:
[image_url_1]
Product: [Product Name 1]
URL: [product_url_1]
[image_url_2]
Product: [Product Name 2]
URL: [product_url_2]
```

## Integration with GPT Assistant

To integrate with a GPT Assistant, add a function with this definition:

```json
{
  "name": "searchRecoverFitProducts",
  "description": "Search for products available on the RecoverFit.co.uk website based on user requirements",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "The product search query extracted from user's question"
      },
      "limit": {
        "type": "integer",
        "description": "Maximum number of products to return (default: 5)",
        "default": 5
      }
    },
    "required": ["query"]
  }
}
```

The function implementation should call your deployed API:

```javascript
// Implementation for searchRecoverFitProducts function
const response = await fetch('https://voice-ecommerce.onrender.com/api/products/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: arguments.query,
    limit: arguments.limit || 5
  })
});

// Parse response
const data = await response.json();

// Return the results
return data;
```

## Future Improvements

- Support for product filtering by price, category, etc.
- User personalization based on past searches
- More sophisticated scraping with price comparison
- Product reviews integration
- Rich media support (videos, 3D models)

## License

ISC
