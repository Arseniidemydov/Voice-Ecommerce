# Voice-Ecommerce: Real-time Voice Product Recommendations

A real-time voice assistant for product recommendations, featuring a hybrid approach that combines GPT-4's language understanding with on-demand product scraping.

## Features

- 🎤 **Voice Recognition** with automatic silence detection
- 🔍 **Real-time Product Scraping** via Bright Data's FireCrawl
- 🧠 **Hybrid Intelligence** using both GPT-4 and custom scraping
- 🔊 **Text-to-Speech** for natural spoken responses
- 📱 **Mobile-responsive UI** with product grid display
- 📊 **Follow-up Suggestions** for interactive conversations

## How It Works

The application uses a hybrid approach:

1. **Voice Input**: The user speaks a product query via their microphone
2. **Language Processing**: The application determines if this is a product query 
3. **Query Analysis**: GPT-4 extracts structured search parameters from natural language
4. **Product Scraping**: FireCrawl searches across e-commerce sites for matching products
5. **Response Generation**: Results are formatted in a consistent structure
6. **Voice Output**: The response is spoken aloud via text-to-speech

This approach offers the best of both worlds: GPT's language understanding with real-time product data.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- OpenAI API key
- Bright Data FireCrawl API key

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
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

4. Start the server:
```bash
npm start
```

5. Navigate to `http://localhost:3000` in your web browser

## API Endpoints

- **/api/assistant/products**: Hybrid endpoint that uses GPT to analyze the query and FireCrawl to search for products
- **/api/products/search**: Direct product search using FireCrawl
- **/api/assistant/chat**: Original OpenAI Assistant endpoint (for non-product queries)
- **/api/openai/audio/speech**: Text-to-speech conversion

## Project Structure

- **server.js**: Main Express server with API endpoints
- **scraper.js**: FireCrawl integration for product scraping
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

## Future Improvements

- Caching for frequently searched products
- User preferences and personalized recommendations
- Product filtering by price, ratings, etc.
- Integration with specific e-commerce platforms
- Advanced voice commands for filtering and sorting

## License

ISC
