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

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        let uploadedImageUrl;
        let imageFeatures;

        // Handle file upload
        if (req.file) {
            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'uploads'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });

            uploadedImageUrl = uploadResult.secure_url;
            
            // Extract features from uploaded image
            imageFeatures = await extractColorFeatures(req.file.buffer);
        }
        // Handle URL upload
        else if (req.body.imageUrl) {
            uploadedImageUrl = req.body.imageUrl;
            
            // Extract features from URL image
            imageFeatures = await extractFeaturesFromUrl(req.body.imageUrl);
        }
        else {
            return res.status(400).json({ error: 'No image file or URL provided' });
        }

        // Get all products from database
        const allProducts = await Product.find({});
        
        if (allProducts.length === 0) {
            return res.status(404).json({ 
                error: 'No products found in database. Please seed the database first.' 
            });
        }

        // Find similar products
        const similarProducts = findSimilarProducts(imageFeatures, allProducts, 10);

        res.json({
            success: true,
            uploadedImageUrl: uploadedImageUrl,
            similarProducts: similarProducts,
            totalProducts: allProducts.length
        });

    } catch (error) {
        console.error('Upload error:', error);
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

module.exports = router;