const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const productCache = require('./cache');

/**
 * Fallback mock product data from RecoverFit.co.uk 
 * Used when scraping fails or for search terms with no results
 */
const FALLBACK_PRODUCTS = {
  'knee': [
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
      title: 'Hyperice Venom Back',
      image: 'https://recoverfit.co.uk/cdn/shop/products/VENOM2BACK_1280x1280.png?v=1677587160',
      url: 'https://recoverfit.co.uk/products/venom-back',
      price: 249.99,
      rating: 4.9,
      store: 'RecoverFit'
    }
  ],
  'massage': [
    {
      title: 'Theragun PRO Plus',
      image: 'https://recoverfit.co.uk/cdn/shop/files/ProductTemplate_4_fb1f2fdb-c88b-44f4-8a9a-077620b24eef_1080x1080.png?v=1710256805',
      url: 'https://recoverfit.co.uk/products/theragun-pro',
      price: 549.99,
      rating: 5.0,
      store: 'RecoverFit'
    },
    {
      title: 'Theragun Mini',
      image: 'https://recoverfit.co.uk/cdn/shop/products/Theragun-mini-Black-Carousel-05_600x600.webp?v=1691506967',
      url: 'https://recoverfit.co.uk/products/theragun-mini',
      price: 175.00,
      rating: 4.7,
      store: 'RecoverFit'
    }
  ]
};

/**
 * Scrape RecoverFit.co.uk for products matching the search query
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of product objects
 */
async function scrapeRecoverFitUsingAxios(query) {
  try {
    console.log(`Scraping RecoverFit.co.uk with axios for: "${query}"`);
    
    // Create search URL
    const searchUrl = `https://recoverfit.co.uk/search?q=${encodeURIComponent(query)}`;
    
    // Fetch the search results page
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    const products = [];
    
    // Extract product information from the search results
    $('.product-card').each((index, element) => {
      try {
        // Extract product details
        const productUrl = 'https://recoverfit.co.uk' + $(element).find('a').attr('href');
        const title = $(element).find('.product-card__title').text().trim();
        let image = $(element).find('img').attr('src');
        
        // Fix image URL if needed
        if (image && image.startsWith('//')) {
          image = 'https:' + image;
        }
        
        // Extract price
        let price = $(element).find('.price__regular .price-item').text().trim();
        price = price.replace(/[^0-9.]/g, '');
        price = parseFloat(price);
        
        // Only add if we have the basic info
        if (title && image && productUrl) {
          products.push({
            title,
            image,
            url: productUrl,
            price: price || null,
            rating: 4.5, // Default rating as the site doesn't show ratings
            store: 'RecoverFit'
          });
        }
      } catch (err) {
        console.error('Error parsing product element:', err);
      }
    });
    
    console.log(`Found ${products.length} products using axios scraping`);
    return products;
  } catch (error) {
    console.error('Axios scraping error:', error);
    return [];
  }
}

/**
 * Scrape RecoverFit.co.uk using Puppeteer (headless browser)
 * This is used as a fallback when simpler scraping fails
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of product objects
 */
async function scrapeRecoverFitUsingPuppeteer(query) {
  let browser = null;
  
  try {
    console.log(`Scraping RecoverFit.co.uk with puppeteer for: "${query}"`);
    
    // Launch browser - use minimal args for compatibility with Render
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to search page
    const searchUrl = `https://recoverfit.co.uk/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for products to load
    await page.waitForSelector('.product-card', { timeout: 5000 }).catch(() => {
      console.log('No product cards found');
    });
    
    // Extract products from the page
    const products = await page.evaluate(() => {
      const items = [];
      
      document.querySelectorAll('.product-card').forEach(card => {
        try {
          const titleElement = card.querySelector('.product-card__title');
          const linkElement = card.querySelector('a');
          const imgElement = card.querySelector('img');
          const priceElement = card.querySelector('.price__regular .price-item');
          
          if (titleElement && linkElement && imgElement) {
            let price = priceElement ? priceElement.textContent.trim() : '';
            price = price.replace(/[^0-9.]/g, '');
            
            let imgSrc = imgElement.getAttribute('src');
            if (imgSrc && imgSrc.startsWith('//')) {
              imgSrc = 'https:' + imgSrc;
            }
            
            items.push({
              title: titleElement.textContent.trim(),
              url: 'https://recoverfit.co.uk' + linkElement.getAttribute('href'),
              image: imgSrc,
              price: price ? parseFloat(price) : null,
              rating: 4.5, // Default rating
              store: 'RecoverFit'
            });
          }
        } catch (err) {
          console.error('Error extracting product data:', err);
        }
      });
      
      return items;
    });
    
    console.log(`Found ${products.length} products using puppeteer scraping`);
    return products;
  } catch (error) {
    console.error('Puppeteer scraping error:', error);
    return [];
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

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
    
    // Try scraping with axios/cheerio first
    let products = await scrapeRecoverFitUsingAxios(query);
    
    // If that fails, try puppeteer as a fallback
    if (products.length === 0) {
      console.log('Axios scraping yielded no results, trying puppeteer...');
      products = await scrapeRecoverFitUsingPuppeteer(query);
    }
    
    // If both scraping methods fail, use fallback data
    if (products.length === 0) {
      console.log('Both scraping methods failed, using fallback data...');
      
      // Find best matching category in fallback data
      let bestCategory = '';
      let bestMatchScore = 0;
      
      for (const category of Object.keys(FALLBACK_PRODUCTS)) {
        if (query.toLowerCase().includes(category)) {
          // Prioritize exact matches
          if (category.length > bestMatchScore) {
            bestCategory = category;
            bestMatchScore = category.length;
          }
        }
      }
      
      // If no direct match, use first category
      if (!bestCategory && Object.keys(FALLBACK_PRODUCTS).length > 0) {
        bestCategory = Object.keys(FALLBACK_PRODUCTS)[0];
      }
      
      products = bestCategory ? FALLBACK_PRODUCTS[bestCategory] : [];
    }
    
    // Limit the number of results
    products = products.slice(0, limit);
    
    console.log(`Returning ${products.length} results for query: "${query}"`);
    
    // Format the results
    const formattedResults = formatProductResults(products);
    
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
