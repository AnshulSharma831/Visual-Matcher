const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Product = require('../models/Product');
const { 
    extractColorFeatures, 
    extractFeaturesFromUrl, 
    findSimilarProducts 
} = require('../utils/imageProcessor');

const router = express.Router();

// Debug environment variables
console.log('Environment variables check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not set');

// Configure Cloudinary with explicit error checking
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Cloudinary configuration missing! Please check your .env file');
    console.log('Required variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✅ Cloudinary configured successfully');
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// POST /api/upload - Handle image upload and find similar products
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('📝 Upload request received');
        console.log('File:', req.file ? 'Present' : 'Not present');
        console.log('URL:', req.body.imageUrl ? 'Present' : 'Not present');

        let uploadedImageUrl;
        let imageFeatures;

        // Handle file upload
        if (req.file) {
            console.log('🔄 Processing file upload...');
            
            // Check Cloudinary config again
            if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                throw new Error('Cloudinary configuration is missing. Please check your .env file.');
            }

            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'uploads'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            console.log('✅ Cloudinary upload successful');
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            });

            uploadedImageUrl = uploadResult.secure_url;
            console.log('📸 Image uploaded to:', uploadedImageUrl);
            
            // Extract features from uploaded image
            console.log('🎨 Extracting color features...');
            imageFeatures = await extractColorFeatures(req.file.buffer);
        }
        // Handle URL upload
        else if (req.body.imageUrl) {
            console.log('🔗 Processing URL upload...');
            uploadedImageUrl = req.body.imageUrl;
            
            // Extract features from URL image
            console.log('🎨 Extracting color features from URL...');
            imageFeatures = await extractFeaturesFromUrl(req.body.imageUrl);
        }
        else {
            return res.status(400).json({ error: 'No image file or URL provided' });
        }

        console.log('🔍 Finding similar products...');
        
        // Get all products from database
        const allProducts = await Product.find({});
        console.log(`📦 Found ${allProducts.length} products in database`);
        
        if (allProducts.length === 0) {
            return res.status(404).json({ 
                error: 'No products found in database. Please seed the database first.' 
            });
        }

        // Find similar products
        const similarProducts = findSimilarProducts(imageFeatures, allProducts, 10);
        console.log(`✨ Found ${similarProducts.length} similar products`);

        res.json({
            success: true,
            uploadedImageUrl: uploadedImageUrl,
            similarProducts: similarProducts,
            totalProducts: allProducts.length,
            message: `Found ${similarProducts.length} similar products`
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        res.status(500).json({ 
            error: 'Failed to process image',
            details: error.message 
        });
    }
});

// GET /api/products - Get all products (for testing)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({
            success: true,
            products: products,
            count: products.length
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

// GET /api/upload - Info endpoint (since you were trying to GET this)
router.get('/upload', (req, res) => {
    res.json({
        message: 'Upload endpoint is ready. Use POST method to upload images.',
        endpoints: {
            'POST /api/upload': 'Upload image file or URL to find similar products',
            'GET /api/products': 'Get all products in database'
        }
    });
});

module.exports = router;