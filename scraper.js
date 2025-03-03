const axios = require('axios');
const productCache = require('./cache');

/**
 * Mock product data from RecoverFit.co.uk for demo purposes
 * In a real implementation, this would come from an API or web scraping
 */
const MOCK_PRODUCTS = {
  'knee brace': [
    {
      title: 'Knee Sleeve for Sports and Daily Wear',
      image: 'https://recoverfit.co.uk/cdn/shop/files/Knee-sleeve-pair-web_540x.jpg',
      url: 'https://recoverfit.co.uk/products/recoverfit-knee-sleeve',
      price: 25.99,
      rating: 4.9,
      store: 'RecoverFit'
    },
    {
      title: 'Adjustable Knee Support Brace',
      image: 'https://recoverfit.co.uk/cdn/shop/products/knee-brace-velcro-closed_540x.jpg',
      url: 'https://recoverfit.co.uk/products/adjustable-knitted-knee-brace',
      price: 34.99,
      rating: 4.7,
      store: 'RecoverFit'
    },
    {
      title: 'Patella Stabilizing Knee Brace',
      image: 'https://recoverfit.co.uk/cdn/shop/products/patella-stabilising-front_540x.jpg',
      url: 'https://recoverfit.co.uk/products/knee-brace-with-patella-stabiliser',
      price: 39.99,
      rating: 4.8,
      store: 'RecoverFit'
    }
  ],
  'compression therapy': [
    {
      title: 'Compression Arm Sleeves',
      image: 'https://recoverfit.co.uk/cdn/shop/products/Arm-compression-sleeve-camo_540x.jpg',
      url: 'https://recoverfit.co.uk/products/compression-arm-sleeves',
      price: 19.99,
      rating: 4.6,
      store: 'RecoverFit'
    },
    {
      title: 'Compression Calf Sleeves',
      image: 'https://recoverfit.co.uk/cdn/shop/products/black-calf-compression-sleeve_540x.jpg',
      url: 'https://recoverfit.co.uk/products/compression-calf-sleeves',
      price: 19.99,
      rating: 4.7,
      store: 'RecoverFit'
    }
  ],
  'massage': [
    {
      title: 'Percussion Massage Gun',
      image: 'https://recoverfit.co.uk/cdn/shop/products/Massage-gun-main_540x.jpg',
      url: 'https://recoverfit.co.uk/products/recoverfit-percussion-massage-gun',
      price: 129.99,
      rating: 4.9,
      store: 'RecoverFit'
    },
    {
      title: 'Massage Roller Ball',
      image: 'https://recoverfit.co.uk/cdn/shop/products/massage-ball-set_540x.jpg',
      url: 'https://recoverfit.co.uk/products/massage-ball-set',
      price: 19.99,
      rating: 4.7,
      store: 'RecoverFit'
    }
  ],
  'wrist support': [
    {
      title: 'Adjustable Wrist Support',
      image: 'https://recoverfit.co.uk/cdn/shop/products/wrist-support-close_540x.jpg',
      url: 'https://recoverfit.co.uk/products/adjustable-wrist-support',
      price: 14.99,
      rating: 4.5,
      store: 'RecoverFit'
    },
    {
      title: 'Wrist and Thumb Support',
      image: 'https://recoverfit.co.uk/cdn/shop/products/wrist-thumb-support-front_540x.jpg',
      url: 'https://recoverfit.co.uk/products/wrist-and-thumb-support',
      price: 19.99,
      rating: 4.6,
      store: 'RecoverFit'
    }
  ],
  'back': [
    {
      title: 'Back Brace Support Belt',
      image: 'https://recoverfit.co.uk/cdn/shop/products/back-brace-front_540x.jpg',
      url: 'https://recoverfit.co.uk/products/back-brace-support-belt',
      price: 39.99,
      rating: 4.8,
      store: 'RecoverFit'
    },
    {
      title: 'Posture Corrector',
      image: 'https://recoverfit.co.uk/cdn/shop/products/Clavicle-brace-front_540x.jpg',
      url: 'https://recoverfit.co.uk/products/posture-corrector',
      price: 24.99,
      rating: 4.5,
      store: 'RecoverFit'
    }
  ],
  'ankle': [
    {
      title: 'Ankle Support Brace',
      image: 'https://recoverfit.co.uk/cdn/shop/products/ankle-support-black-front_540x.jpg',
      url: 'https://recoverfit.co.uk/products/ankle-support-brace',
      price: 19.99,
      rating: 4.6,
      store: 'RecoverFit'
    },
    {
      title: 'Adjustable Ankle Stabilizer',
      image: 'https://recoverfit.co.uk/cdn/shop/products/ankle-brace-strap_540x.jpg',
      url: 'https://recoverfit.co.uk/products/adjustable-ankle-stabilizer',
      price: 29.99,
      rating: 4.7,
      store: 'RecoverFit'
    }
  ]
};

/**
 * Scrape products based on search query
 * @param {Object} params - Search parameters
 * @param {string} params.query - The search query
 * @param {number} params.limit - Maximum number of products to return
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
    // In a real implementation, this would be a scrape of RecoverFit.co.uk
    let results = [];
    
    // Match the query against our mock data keys
    for (const [key, products] of Object.entries(MOCK_PRODUCTS)) {
      if (query.toLowerCase().includes(key) || key.includes(query.toLowerCase())) {
        results = [...results, ...products];
      }
    }
    
    // If no direct match, return products from first category as fallback
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
      text: "Sorry, I couldn't find any products matching your query on RecoverFit.co.uk.",
      products: []
    };
  }
  
  // Create the main text response
  const productCount = products.length;
  let mainText = `I found ${productCount} products on RecoverFit.co.uk that might be what you're looking for:`;
  
  // Format the product data
  const formattedProducts = products.map(product => {
    return {
      imageUrl: product.image || '',
      productName: product.title || 'Product',
      productUrl: product.url || '#',
      price: product.price ? `£${product.price}` : 'Price not available',
      rating: product.rating || null,
      source: product.store || 'RecoverFit'
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
