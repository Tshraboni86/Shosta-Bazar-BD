const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ==========================================
// FIXED CORS CONFIGURATION
// ==========================================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// SERVE STATIC FILES
// ==========================================
app.use(express.static(__dirname));
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
const dbURI = 'mongodb+srv://testuser:TestPassword123@cluster0.fdrt8rk.mongodb.net/?appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => console.log('✅ Successfully connected to MongoDB Cloud Database!'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// ==========================================
// 2. SCHEMAS & MODELS
// ==========================================

// -------- PRODUCT SCHEMA --------
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  oldPrice: { type: Number, default: 0 },
  status: { type: String, default: 'ACTIVE' }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'products');

// -------- CATEGORY SCHEMA --------
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, default: '' },
  image: { type: String, default: '' },
  designsCount: { type: String, default: '0 Designs' },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema, 'categories');

// -------- HERO SLIDER SCHEMA --------
const heroSliderSchema = new mongoose.Schema({
  order: { type: Number, default: 1 },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  buttonText: { type: String, default: 'Shop Now' },
  buttonLink: { type: String, default: '/shop' },
  image: { type: String, default: '' },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

const HeroSlide = mongoose.models.HeroSlide || mongoose.model('HeroSlide', heroSliderSchema, 'heroslides');

// -------- OFFER SCHEMA --------
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discount: { type: String, required: true },
  discountPercent: { type: Number, default: 0 },
  code: { type: String, default: '' },
  expiryDate: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  category: { type: String, default: 'All Categories' },
  status: { type: String, default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});

const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema, 'offers');

// -------- GALLERY SCHEMA --------
const gallerySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema, 'gallery');

// ==========================================
// 3. API ROUTES - PRODUCTS
// ==========================================

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching all products...');
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${products.length} products`);
    
    // Format products for frontend
    const formattedProducts = products.map(p => ({
      _id: p._id,
      id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      image: p.image || '',
      description: p.description || '',
      oldPrice: p.oldPrice || 0,
      status: p.status || 'ACTIVE',
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));
    
    res.json(formattedProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({
      _id: product._id,
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image || '',
      description: product.description || '',
      oldPrice: product.oldPrice || 0,
      status: product.status || 'ACTIVE'
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  try {
    console.log('📝 Received product data:', req.body);
    
    const { name, category, price, oldPrice, image, description, status } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Product Name and Price are required.' });
    }

    const newProduct = new Product({
      name: name.trim(),
      category: category || 'General',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : 0,
      image: image ? image.trim() : '',
      description: description ? description.trim() : '',
      status: status || 'ACTIVE'
    });

    await newProduct.save();
    console.log('✅ Product saved successfully:', newProduct.name);
    
    // Return formatted product
    const savedProduct = newProduct.toJSON();
    res.status(201).json({
      _id: savedProduct._id,
      id: savedProduct._id,
      name: savedProduct.name,
      price: savedProduct.price,
      category: savedProduct.category,
      image: savedProduct.image || '',
      description: savedProduct.description || '',
      oldPrice: savedProduct.oldPrice || 0,
      status: savedProduct.status || 'ACTIVE'
    });
  } catch (err) {
    console.error('Error saving product:', err);
    res.status(500).json({ error: 'Failed to save product to database.' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('🗑️ Product deleted:', deleted.name);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { name, category, price, oldPrice, image, description, status } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        category: category || 'General',
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : 0,
        image: image ? image.trim() : '',
        description: description ? description.trim() : '',
        status: status || 'ACTIVE'
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    console.log('✏️ Product updated:', updated.name);
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// ==========================================
// 4. API ROUTES - CATEGORIES (UPDATED)
// ==========================================

// GET all categories (Website & Admin)
app.get('/api/categories', async (req, res) => {
  try {
    console.log('📦 Fetching all categories...');
    const categories = await Category.find().sort({ createdAt: -1 });
    
    // Format categories with proper _id
    const formattedCategories = categories.map(c => ({
      _id: c._id,
      id: c._id,
      name: c.name,
      slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: c.image || '',
      designsCount: c.designsCount || '0 Designs',
      status: c.status || 'ACTIVE',
      createdAt: c.createdAt
    }));
    
    console.log(`✅ Found ${formattedCategories.length} categories`);
    res.json(formattedCategories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST new category
app.post('/api/categories', async (req, res) => {
  try {
    console.log('📝 Received category data:', req.body);
    
    const { name, image, designsCount, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newCategory = new Category({
      name: name.trim(),
      slug: slug,
      image: image || '',
      designsCount: designsCount || '0 Designs',
      status: status || 'ACTIVE'
    });

    await newCategory.save();
    console.log('✅ Category saved:', newCategory.name);
    
    // Return formatted category
    res.status(201).json({
      _id: newCategory._id,
      id: newCategory._id,
      name: newCategory.name,
      slug: newCategory.slug,
      image: newCategory.image || '',
      designsCount: newCategory.designsCount || '0 Designs',
      status: newCategory.status || 'ACTIVE',
      createdAt: newCategory.createdAt
    });
  } catch (err) {
    console.error('Error saving category:', err);
    res.status(500).json({ error: err.message || 'Failed to save category to database.' });
  }
});

// DELETE category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.log('🗑️ Category deleted:', deleted.name);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// UPDATE category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, image, designsCount, status } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        slug: slug,
        image: image || '',
        designsCount: designsCount || '0 Designs',
        status: status || 'ACTIVE'
      },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    console.log('✏️ Category updated:', updated.name);
    res.json({
      _id: updated._id,
      id: updated._id,
      name: updated.name,
      slug: updated.slug,
      image: updated.image || '',
      designsCount: updated.designsCount || '0 Designs',
      status: updated.status || 'ACTIVE',
      createdAt: updated.createdAt
    });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});
// ==========================================
// 5. API ROUTES - HERO SLIDES
// ==========================================

app.get('/api/slides', async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (err) {
    console.error('Error fetching slides:', err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

app.post('/api/slides', async (req, res) => {
  try {
    const { order, title, subtitle, buttonText, buttonLink, image, status } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const newSlide = new HeroSlide({
      order: order ? Number(order) : 1,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : '',
      buttonText: buttonText ? buttonText.trim() : 'Shop Now',
      buttonLink: buttonLink ? buttonLink.trim() : '/shop',
      image: image ? image.trim() : '',
      status: status || 'ACTIVE'
    });

    await newSlide.save();
    console.log('✅ Hero slide saved:', newSlide.title);
    res.status(201).json(newSlide);
  } catch (err) {
    console.error('Error saving hero slide:', err);
    res.status(500).json({ error: 'Failed to save hero slide' });
  }
});

app.delete('/api/slides/:id', async (req, res) => {
  try {
    const deleted = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    res.json({ success: true, message: 'Slide deleted successfully' });
  } catch (err) {
    console.error('Error deleting slide:', err);
    res.status(500).json({ error: 'Failed to delete hero slide' });
  }
});

// ==========================================
// 6. API ROUTES - OFFERS
// ==========================================

app.get('/api/offers', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const { title, discount, discountPercent, code, expiryDate, startDate, endDate, category, status } = req.body;
    if (!title || !discount) {
      return res.status(400).json({ error: 'Title and discount are required.' });
    }

    const newOffer = new Offer({
      title: title.trim(),
      discount: discount.trim(),
      discountPercent: discountPercent || 0,
      code: code || '',
      expiryDate: expiryDate || '',
      startDate: startDate || '',
      endDate: endDate || '',
      category: category || 'All Categories',
      status: status || 'ACTIVE'
    });

    await newOffer.save();
    console.log('✅ Offer saved:', newOffer.title);
    res.status(201).json(newOffer);
  } catch (err) {
    console.error('Error saving offer:', err);
    res.status(500).json({ error: 'Failed to save offer' });
  }
});

app.delete('/api/offers/:id', async (req, res) => {
  try {
    const deleted = await Offer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});

// ==========================================
// 7. API ROUTES - GALLERY
// ==========================================

app.get('/api/gallery', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

app.post('/api/gallery', async (req, res) => {
  try {
    const { title, imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const newImage = new Gallery({ 
      title: title || '', 
      imageUrl: imageUrl.trim() 
    });
    await newImage.save();
    console.log('✅ Gallery image saved');
    res.status(201).json(newImage);
  } catch (err) {
    console.error('Error saving gallery image:', err);
    res.status(500).json({ error: 'Failed to save gallery image' });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting gallery image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==========================================
// 8. DEFAULT ROUTE - Serve index.html
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// 9. START SERVER
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Admin Panel: http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/products`);
});