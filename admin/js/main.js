const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  // Load dynamic data on public pages
  fetchPublicProducts();
  fetchPublicHeroSlides();
  fetchPublicOffers();
});

// 1. Fetch & Render Products on Public Shop Page
async function fetchPublicProducts() {
  const container = document.getElementById('productContainer') || document.querySelector('.product-grid');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const products = await res.json();

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = '<p style="text-align:center;">No products available at the moment.</p>';
      return;
    }

    // Filter only ACTIVE products for customers
    const activeProducts = products.filter(p => p.status !== 'INACTIVE');

    container.innerHTML = activeProducts.map(prod => `
      <div class="product-card">
        <div class="product-image">
          <img src="${prod.image || 'images/placeholder.jpg'}" alt="${prod.name}" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="product-info">
          <span class="category">${prod.category}</span>
          <h3 class="product-title">${prod.name}</h3>
          <div class="price">
            <span class="current-price">৳${prod.price}</span>
            ${prod.oldPrice ? `<span class="old-price">৳${prod.oldPrice}</span>` : ''}
          </div>
          <button class="add-to-cart-btn" onclick="addToCart('${prod._id}')">Add to Cart</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load products on main website:', err);
  }
}

// 2. Fetch & Render Hero Slides on Main Website
async function fetchPublicHeroSlides() {
  const sliderContainer = document.getElementById('heroSlider') || document.querySelector('.hero-slider');
  if (!sliderContainer) return;

  try {
    const res = await fetch(`${API_BASE_URL}/slides`);
    const slides = await res.json();

    if (!Array.isArray(slides) || slides.length === 0) return;

    sliderContainer.innerHTML = slides.map((slide, index) => `
      <div class="slide ${index === 0 ? 'active' : ''}" style="background-image: url('${slide.image}')">
        <div class="slide-content">
          <h4>${slide.subtitle || ''}</h4>
          <h2>${slide.title}</h2>
          <a href="${slide.buttonLink || '#'}" class="btn-primary">${slide.buttonText || 'Shop Now'}</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load hero slides:', err);
  }
}

// 3. Fetch & Render Promotional Offers Banner
async function fetchPublicOffers() {
  const offerBanner = document.getElementById('offerBanner');
  if (!offerBanner) return;

  try {
    const res = await fetch(`${API_BASE_URL}/offers`);
    const offers = await res.json();

    const activeOffer = offers.find(o => o.status === 'ACTIVE');
    if (activeOffer) {
      offerBanner.innerHTML = `
        <div class="promo-bar">
          🎉 <strong>${activeOffer.title}</strong> - Get <strong>${activeOffer.discount}</strong> OFF on ${activeOffer.category}!
        </div>
      `;
    }
  } catch (err) {
    console.error('Failed to load offers:', err);
  }
}