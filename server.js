const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ==========================================
// CORS CONFIGURATION
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
const dbURI = process.env.MONGODB_URI || 'mongodb+srv://testuser:TestPassword123@cluster0.fdrt8rk.mongodb.net/?appName=Cluster0';

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

// -------- ORDER SCHEMA --------
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  customerAddress: { type: String, required: true },
  items: [{
    productId: { type: String, default: '' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, default: '' }
  }],
  subtotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, default: 'PENDING' },
  notes: { type: String, default: '' },
  whatsappSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders');

// -------- CUSTOMER SCHEMA --------
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: null },
  firstOrderDate: { type: Date, default: null },
  status: { type: String, enum: ['NEW', 'REGULAR', 'VIP'], default: 'NEW' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema, 'customers');

// ==========================================
// 3. API ROUTES - PRODUCTS
// ==========================================

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching all products...');
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${products.length} products`);
    
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
// 4. API ROUTES - CATEGORIES
// ==========================================

app.get('/api/categories', async (req, res) => {
  try {
    console.log('📦 Fetching all categories...');
    const categories = await Category.find().sort({ createdAt: -1 });
    
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
    console.log('📦 Fetching hero slides...');
    const slides = await HeroSlide.find().sort({ order: 1 });
    
    const formattedSlides = slides.map(s => ({
      _id: s._id,
      id: s._id,
      order: s.order || 1,
      title: s.title || '',
      subtitle: s.subtitle || '',
      buttonText: s.buttonText || 'Shop Now',
      buttonLink: s.buttonLink || '/shop',
      image: s.image || '',
      status: s.status || 'ACTIVE',
      createdAt: s.createdAt
    }));
    
    console.log(`✅ Found ${formattedSlides.length} hero slides`);
    res.json(formattedSlides);
  } catch (err) {
    console.error('Error fetching slides:', err);
    res.status(500).json({ error: 'Failed to fetch slides' });
  }
});

app.post('/api/slides', async (req, res) => {
  try {
    console.log('📝 Received slide data:', req.body);
    
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
    
    res.status(201).json({
      _id: newSlide._id,
      id: newSlide._id,
      order: newSlide.order,
      title: newSlide.title,
      subtitle: newSlide.subtitle,
      buttonText: newSlide.buttonText,
      buttonLink: newSlide.buttonLink,
      image: newSlide.image,
      status: newSlide.status,
      createdAt: newSlide.createdAt
    });
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
    console.log('🗑️ Hero slide deleted:', deleted.title);
    res.json({ success: true, message: 'Slide deleted successfully' });
  } catch (err) {
    console.error('Error deleting slide:', err);
    res.status(500).json({ error: 'Failed to delete hero slide' });
  }
});

app.put('/api/slides/:id', async (req, res) => {
  try {
    const { order, title, subtitle, buttonText, buttonLink, image, status } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    
    const updated = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      {
        order: order ? Number(order) : 1,
        title: title.trim(),
        subtitle: subtitle ? subtitle.trim() : '',
        buttonText: buttonText ? buttonText.trim() : 'Shop Now',
        buttonLink: buttonLink ? buttonLink.trim() : '/shop',
        image: image ? image.trim() : '',
        status: status || 'ACTIVE'
      },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    console.log('✏️ Hero slide updated:', updated.title);
    res.json({
      _id: updated._id,
      id: updated._id,
      order: updated.order,
      title: updated.title,
      subtitle: updated.subtitle,
      buttonText: updated.buttonText,
      buttonLink: updated.buttonLink,
      image: updated.image,
      status: updated.status,
      createdAt: updated.createdAt
    });
  } catch (err) {
    console.error('Error updating hero slide:', err);
    res.status(500).json({ error: 'Failed to update hero slide' });
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
    console.log('📦 Fetching gallery images...');
    const images = await Gallery.find().sort({ createdAt: -1 });
    
    const formattedImages = images.map(img => ({
      _id: img._id,
      id: img._id,
      title: img.title || '',
      imageUrl: img.imageUrl || '',
      createdAt: img.createdAt
    }));
    
    console.log(`✅ Found ${formattedImages.length} gallery images`);
    res.json(formattedImages);
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

app.post('/api/gallery', async (req, res) => {
  try {
    console.log('📝 Received gallery image data:', req.body);
    
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
    
    res.status(201).json({
      _id: newImage._id,
      id: newImage._id,
      title: newImage.title,
      imageUrl: newImage.imageUrl,
      createdAt: newImage.createdAt
    });
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
    console.log('🗑️ Gallery image deleted');
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting gallery image:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==========================================
// 8. API ROUTES - ORDERS
// ==========================================

// GET all orders
app.get('/api/orders', async (req, res) => {
  try {
    console.log('📦 Fetching all orders...');
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST new order (with auto-customer creation)
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📝 Received order data:', req.body);
    
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      customerAddress, 
      items, 
      subtotal, 
      deliveryCharge, 
      total,
      paymentMethod,
      notes 
    } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const newOrder = new Order({
      orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : '',
      customerAddress: customerAddress.trim(),
      items: items.map(item => ({
        productId: item.productId || '',
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        image: item.image || ''
      })),
      subtotal: Number(subtotal),
      deliveryCharge: Number(deliveryCharge) || 0,
      total: Number(total),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      notes: notes ? notes.trim() : '',
      status: 'PENDING',
      whatsappSent: false
    });

    await newOrder.save();
    console.log('✅ Order saved successfully:', newOrder.orderId);

    // ==========================================
    // AUTO-CREATE/UPDATE CUSTOMER
    // ==========================================
    try {
      let customer = await Customer.findOne({ phone: customerPhone });
      
      if (customer) {
        customer.totalOrders += 1;
        customer.totalSpent += Number(total);
        customer.lastOrderDate = new Date();
        customer.name = customerName.trim();
        if (customerEmail) customer.email = customerEmail.trim();
        if (customerAddress) customer.address = customerAddress.trim();
        
        if (customer.totalOrders >= 5) {
          customer.status = 'VIP';
        } else if (customer.totalOrders >= 2) {
          customer.status = 'REGULAR';
        } else {
          customer.status = 'NEW';
        }
        
        customer.updatedAt = new Date();
        await customer.save();
        console.log('✅ Customer updated:', customer.phone, 'Orders:', customer.totalOrders);
      } else {
        const newCustomer = new Customer({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail ? customerEmail.trim() : '',
          address: customerAddress.trim(),
          totalOrders: 1,
          totalSpent: Number(total),
          lastOrderDate: new Date(),
          firstOrderDate: new Date(),
          status: 'NEW',
          notes: ''
        });
        await newCustomer.save();
        console.log('✅ New customer created:', newCustomer.phone);
      }
    } catch (customerErr) {
      console.error('Error updating customer:', customerErr);
    }
    
    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully!'
    });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ error: 'Failed to save order to database.' });
  }
});

// UPDATE order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { status, paymentStatus, notes } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        paymentStatus, 
        notes,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log('✏️ Order updated:', updated.orderId, 'Status:', status);
    res.json(updated);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found' });
    }
    console.log('🗑️ Order deleted:', deleted.orderId);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// UPDATE whatsapp sent status
app.put('/api/orders/:id/whatsapp', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { whatsappSent: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({ success: true, message: 'WhatsApp status updated' });
  } catch (err) {
    console.error('Error updating WhatsApp status:', err);
    res.status(500).json({ error: 'Failed to update WhatsApp status' });
  }
});

// ==========================================
// 9. API ROUTES - CUSTOMERS
// ==========================================

// GET all customers
app.get('/api/customers', async (req, res) => {
  try {
    console.log('📦 Fetching all customers...');
    const customers = await Customer.find().sort({ totalOrders: -1 });
    console.log(`✅ Found ${customers.length} customers`);
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer by phone
app.get('/api/customers/:phone', async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    console.error('Error fetching customer:', err);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// GET customer orders
app.get('/api/customers/:phone/orders', async (req, res) => {
  try {
    const orders = await Order.find({ customerPhone: req.params.phone }).sort({ createdAt: -1 });
    if (orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this customer' });
    }
    res.json(orders);
  } catch (err) {
    console.error('Error fetching customer orders:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// UPDATE customer
app.put('/api/customers/:phone', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await Customer.findOneAndUpdate(
      { phone: req.params.phone },
      { 
        status, 
        notes,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    console.log('✏️ Customer updated:', updated.phone);
    res.json(updated);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// ==========================================
// 10. DEFAULT ROUTE - Serve index.html
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// 11. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Admin Panel: http://localhost:${PORT}/admin/dashboard.html`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api/products`);
});
