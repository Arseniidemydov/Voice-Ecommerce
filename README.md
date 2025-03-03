# Voice-Ecommerce: Real-time Voice Product Recommendations

A real-time voice assistant for product recommendations, featuring a hybrid approach that combines GPT-4's language understanding with product data.

## Features

- 🎤 **Voice Recognition** with automatic silence detection
- 🔍 **Product Recommendations** with structured search
- 🧠 **Hybrid Intelligence** using GPT-4 for query understanding
- 🔊 **Text-to-Speech** for natural spoken responses
- 📱 **Mobile-responsive UI** with product grid display
- 📊 **Follow-up Suggestions** for interactive conversations

## How It Works

The application uses a hybrid approach:

1. **Voice Input**: The user speaks a product query via their microphone
2. **Language Processing**: The application determines if this is a product query 
3. **Query Analysis**: GPT-4 extracts structured search parameters from natural language
4. **Product Search**: Demo data is searched for matching products (can be replaced with real scraping)
5. **Response Generation**: Results are formatted in a consistent structure
6. **Voice Output**: The response is spoken aloud via text-to-speech

This approach offers the best of both worlds: GPT's language understanding with formatted product data.

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

- **/api/assistant/products**: Hybrid endpoint that uses GPT to analyze the query and searches for products
- **/api/products/search**: Direct product search endpoint
- **/api/assistant/chat**: Original OpenAI Assistant endpoint (for non-product queries)
- **/api/openai/audio/speech**: Text-to-speech conversion
- **/api/cache/stats**: Get cache statistics
- **/api/cache/clear**: Clear the cache
- **/api/health**: Health check endpoint

## Project Structure

- **server.js**: Main Express server with API endpoints
- **scraper.js**: Product data handling (currently using mock data)
- **cache.js**: In-memory caching system for product searches
- **public/index.html**: Front-end interface with voice recognition
- **public/styles/main.css**: Styling for the UI

## Product Response Format

The application expects product data in this format:

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
  "name": "searchProducts",
  "description": "Search for products based on user query",
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

The function should call your deployed API at `/api/products/search`.

## Future Improvements

- Integration with real product data APIs
- User preferences and personalized recommendations
- Product filtering by price, ratings, etc.
- Integration with specific e-commerce platforms
- Advanced voice commands for filtering and sorting

## License

ISC
