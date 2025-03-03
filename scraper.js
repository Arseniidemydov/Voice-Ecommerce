const { FireCrawl } = require('@brightdata/firecrawl');
const productCache = require('./cache');

// Initialize FireCrawl with your API key
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const firecrawl = new FireCrawl(FIRECRAWL_API_KEY);

/**
 * Scrape products based on search query
 * @param {Object} params - Search parameters
 * @param {string} params.query - The search query
 * @param {number} params.limit - Maximum number of products to return
 * @param {string} params.sortBy - Sort order (optional)
 * @param {Array} params.websites - Specific websites to search (optional)
 * @param {boolean} params.useCache - Whether to use cache (default: true)
 * @returns {Promise<Array>} - Array of formatted product objects
 */
async function scrapeProducts(params) {
  try {
    const { 
      query, 
      limit = 5, 
      sortBy = 'relevance', 
      websites = ['amazon', 'walmart'],
      useCache = true 
    } = params;
    
    // Check cache first if enabled
    if (useCache) {
      const cachedResults = productCache.get(query);
      if (cachedResults) {
        console.log(`Returning cached results for query: "${query}"`);
        return cachedResults;
      }
    }
    
    // Configure the crawl job
    const jobConfig = {
      target: 'search-product',
      query: query,
      maxResults: limit,
      stores: websites,
      sort: sortBy,
    };
    
    console.log(`Starting FireCrawl job with query: ${query}`);
    
    // Execute the crawl
    const results = await firecrawl.fetch(jobConfig);
    
    console.log(`Received ${results.length} results from FireCrawl`);
    
    // Format the results to match the expected format for the UI
    const formattedResults = formatProductResults(results);
    
    // Cache the results if caching is enabled
    if (useCache) {
      productCache.set(query, formattedResults);
    }
    
    return formattedResults;
  } catch (error) {
    console.error('FireCrawl scraping error:', error);
    throw new Error(`Scraping failed: ${error.message}`);
  }
}

/**
 * Format product results to match the expected format for the UI
 * @param {Array} products - Raw scraped products
 * @returns {Object} - Formatted response object
 */
function formatProductResults(products) {
  // First, make sure we have valid products
  if (!products || !Array.isArray(products) || products.length === 0) {
    return { 
      text: "Sorry, I couldn't find any products matching your query.",
      products: []
    };
  }
  
  // Create the main text response
  const productCount = products.length;
  let mainText = `I found ${productCount} products that might be what you're looking for:`;
  
  // Format the product data
  const formattedProducts = products.map(product => {
    return {
      imageUrl: product.image || product.imageUrl || '',
      productName: product.title || product.name || 'Product',
      productUrl: product.url || '#',
      price: product.price ? `$${product.price}` : 'Price not available',
      rating: product.rating || null,
      source: product.source || product.store || 'Online store'
    };
  });
  
  // Generate the response in the expected format
  let responseText = mainText + "\n\nImages:";
  formattedProducts.forEach(product => {
    responseText += `\n${product.imageUrl}\nProduct: ${product.productName}\nURL: ${product.productUrl}\n`;
  });
  
  return {
    text: responseText,
    products: formattedProducts
  };
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
function getCacheStats() {
  return productCache.getStats();
}

/**
 * Clear the cache
 */
function clearCache() {
  productCache.cleanup();
  return { message: 'Cache cleared successfully' };
}

module.exports = {
  scrapeProducts,
  getCacheStats,
  clearCache
};
