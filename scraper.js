const axios = require('axios');
const productCache = require('./cache');

/**
 * Mock product data for demo purposes
 * In a real implementation, this would come from an API or web scraping
 */
const MOCK_PRODUCTS = {
  'knee brace': [
    {
      title: 'Premium Knee Brace Support',
      image: 'https://m.media-amazon.com/images/I/71kT6C5wdtL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B09MTFVH1H',
      price: 29.99,
      rating: 4.5,
      store: 'Amazon'
    },
    {
      title: 'Knee Compression Sleeve',
      image: 'https://m.media-amazon.com/images/I/61N3XjyCLCL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B075447CL9',
      price: 19.97,
      rating: 4.3,
      store: 'Amazon'
    },
    {
      title: 'Hinged Knee Brace for ACL',
      image: 'https://m.media-amazon.com/images/I/71iUVvQGFzL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B08L7FS623',
      price: 39.99,
      rating: 4.7,
      store: 'Amazon'
    }
  ],
  'compression therapy': [
    {
      title: 'Professional Compression Leg Sleeves',
      image: 'https://m.media-amazon.com/images/I/71HpVet24JL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B07QLVMZ2W',
      price: 24.99,
      rating: 4.6,
      store: 'Amazon'
    },
    {
      title: 'Sequential Compression Device',
      image: 'https://m.media-amazon.com/images/I/61kEBXGBdWL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B07JVDXNSD',
      price: 149.99,
      rating: 4.5,
      store: 'Amazon'
    }
  ],
  'massage gun': [
    {
      title: 'Professional Deep Tissue Massage Gun',
      image: 'https://m.media-amazon.com/images/I/71oiA8OHFqL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B07ZBHQNWT',
      price: 79.99,
      rating: 4.8,
      store: 'Amazon'
    },
    {
      title: 'Percussion Massage Device',
      image: 'https://m.media-amazon.com/images/I/71IjVnwJvuL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B08BFX7LXC',
      price: 119.99,
      rating: 4.7,
      store: 'Amazon'
    }
  ],
  'joint inflammation': [
    {
      title: 'Natural Joint Support Supplement',
      image: 'https://m.media-amazon.com/images/I/61DWa-0K1FL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com/dp/B0821W4H2H',
      price: 34.99,
      rating: 4.4,
      store: 'Amazon'
    },
    {
      title: 'Anti-Inflammatory Topical Cream',
      image: 'https://m.media-amazon.com/images/I/71ZV9IOdp-L._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B07H95GD9C',
      price: 19.99,
      rating: 4.2,
      store: 'Amazon'
    }
  ],
  'recovery': [
    {
      title: 'Electric Muscle Stimulator',
      image: 'https://m.media-amazon.com/images/I/61thRmYtxnL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B07V5HP9Y6',
      price: 49.99,
      rating: 4.3,
      store: 'Amazon'
    },
    {
      title: 'Foam Roller for Muscle Recovery',
      image: 'https://m.media-amazon.com/images/I/71IUzT-k0yL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B078W5DBFL',
      price: 29.99,
      rating: 4.6,
      store: 'Amazon'
    }
  ],
  'sleep': [
    {
      title: 'Weighted Blanket for Better Sleep',
      image: 'https://m.media-amazon.com/images/I/71-QEI7-hiL._AC_SL1500_.jpg',
      url: 'https://www.amazon.com/dp/B073429DV2',
      price: 59.99,
      rating: 4.5,
      store: 'Amazon'
    },
    {
      title: 'Natural Sleep Aid Supplement',
      image: 'https://m.media-amazon.com/images/I/61lVbn8-JOL._AC_SL1000_.jpg',
      url: 'https://www.amazon.com/dp/B0943N8VXM',
      price: 24.99,
      rating: 4.4,
      store: 'Amazon'
    }
  ]
};

/**
 * Scrape products based on search query
 * @param {Object} params - Search parameters
 * @param {string} params.query - The search query
 * @param {number} params.limit - Maximum number of products to return
 * @param {string} params.sortBy - Sort order (optional)
 * @param {Array} params.websites - Specific websites to search (optional)
 * @param {boolean} params.useCache - Whether to use cache (default: true)
 * @returns {Promise<Object>} - Formatted product results
 */
async function scrapeProducts(params) {
  try {
    const { 
      query, 
      limit = 5, 
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
    
    console.log(`Searching for products: "${query}"`);
    
    // Find relevant results from our mock data
    // In a real implementation, this would be an API call to a scraping service
    let results = [];
    
    // Match the query against our mock data keys
    for (const [key, products] of Object.entries(MOCK_PRODUCTS)) {
      if (query.toLowerCase().includes(key) || key.includes(query.toLowerCase())) {
        results = [...results, ...products];
      }
    }
    
    // If no direct match, use the first category as a fallback
    if (results.length === 0 && Object.keys(MOCK_PRODUCTS).length > 0) {
      const firstCategory = Object.keys(MOCK_PRODUCTS)[0];
      results = MOCK_PRODUCTS[firstCategory];
    }
    
    // Limit the number of results
    results = results.slice(0, limit);
    
    console.log(`Found ${results.length} results for query: "${query}"`);
    
    // Format the results
    const formattedResults = formatProductResults(results);
    
    // Cache the results if caching is enabled
    if (useCache) {
      productCache.set(query, formattedResults);
    }
    
    return formattedResults;
  } catch (error) {
    console.error('Product search error:', error);
    throw new Error(`Product search failed: ${error.message}`);
  }
}

/**
 * Format product results to match the expected format for the UI
 * @param {Array} products - Raw products
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
      imageUrl: product.image || '',
      productName: product.title || 'Product',
      productUrl: product.url || '#',
      price: product.price ? `$${product.price}` : 'Price not available',
      rating: product.rating || null,
      source: product.store || 'Online store'
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
