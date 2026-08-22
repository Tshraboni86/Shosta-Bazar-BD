const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================
// Replace this URI string with your actual connection string from MongoDB Atlas!
const dbURI = 'mongodb+srv://testuser:TestPassword123@cluster0.fdrt8rk.mongodb.net/?appName=Cluster0';

mongoose.connect(dbURI)
  .then(() => console.log('✅ Successfully connected to MongoDB Cloud Database!'))
  .catch((err) => console.error('❌ Database connection failed:', err));

// ==========================================
// 2. SCHEMAS & MODELS
// ==========================================

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' }
}, { timestamps: true });

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, default: '' }
}, { timestamps: true });

// Hero Slider Schema
const heroSliderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '#' }
}, { timestamps: true });

// Offer Schema
const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  discountPercent: { type: Number, required: true },
  code: { type: String, default: '' },
  expiryDate: { type: String, default: '' }
}, { timestamps: true });

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true }
}, { timestamps: true });

// Create Models
const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);
const HeroSlider = mongoose.model('HeroSlider', heroSliderSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);

// ==========================================
// 3. API ROUTES
// ==========================================

// ------------ PRODUCTS ------------
// GET: Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, category, image, description } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required fields.' });
    }
    const newProduct = new Product({ name, price, category, image, description });
    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully!', data: newProduct });
  } catch (err) {
    console.error('Product save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ------------ CATEGORIES ------------
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const newCategory = new Category({ name });
    await newCategory.save();
    res.status(201).json({ message: 'Category added successfully!', data: newCategory });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ------------ HERO SLIDERS ------------
app.get('/api/hero-sliders', async (req, res) => {
  const sliders = await HeroSlider.find();
  res.json(sliders);
});

app.post('/api/hero-sliders', async (req, res) => {
  const newSlider = new HeroSlider(req.body);
  await newSlider.save();
  res.json({ message: 'Hero slide added successfully!', data: newSlider });
});

// ------------ OFFERS ------------
app.get('/api/offers', async (req, res) => {
  const offers = await Offer.find();
  res.json(offers);
});

app.post('/api/offers', async (req, res) => {
  const newOffer = new Offer(req.body);
  await newOffer.save();
  res.json({ message: 'Offer added successfully!', data: newOffer });
});

// ------------ GALLERY ------------
app.get('/api/gallery', async (req, res) => {
  const images = await Gallery.find();
  res.json(images);
});

app.post('/api/gallery', async (req, res) => {
  const newImage = new Gallery(req.body);
  await newImage.save();
  res.json({ message: 'Gallery image added successfully!', data: newImage });
});

// ==========================================
// 4. START SERVER
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});