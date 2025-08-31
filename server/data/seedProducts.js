const mongoose = require('mongoose');
const Product = require('../models/Product');
const { extractFeaturesFromUrl } = require('../utils/imageProcessor');
const dotenv = require('dotenv');

dotenv.config();

// Sample products with real image URLs
const sampleProducts = [
    // Electronics
    { name: 'iPhone 15 Pro', category: 'Electronics', price: 999, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Latest smartphone' },
    { name: 'MacBook Air', category: 'Electronics', price: 1299, imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', description: 'Lightweight laptop' },
    { name: 'iPad Pro', category: 'Electronics', price: 799, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', description: 'Professional tablet' },
    { name: 'AirPods Pro', category: 'Electronics', price: 249, imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500', description: 'Wireless earbuds' },
    { name: 'Apple Watch', category: 'Electronics', price: 399, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', description: 'Smart watch' },
    
    // Fashion - Shoes
    { name: 'Nike Air Max', category: 'Fashion', price: 120, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Running shoes' },
    { name: 'Adidas Sneakers', category: 'Fashion', price: 90, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500', description: 'Casual sneakers' },
    { name: 'Converse Chuck Taylor', category: 'Fashion', price: 60, imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500', description: 'Classic sneakers' },
    { name: 'Boots', category: 'Fashion', price: 150, imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', description: 'Leather boots' },
    { name: 'Sandals', category: 'Fashion', price: 45, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', description: 'Summer sandals' },
    
    // Fashion - Clothing
    { name: 'Denim Jacket', category: 'Fashion', price: 80, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', description: 'Classic denim jacket' },
    { name: 'White T-Shirt', category: 'Fashion', price: 25, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', description: 'Basic white tee' },
    { name: 'Black Hoodie', category: 'Fashion', price: 55, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', description: 'Comfortable hoodie' },
    { name: 'Jeans', category: 'Fashion', price: 70, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', description: 'Blue jeans' },
    { name: 'Dress Shirt', category: 'Fashion', price: 65, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', description: 'Formal shirt' },
    
    // Home & Garden
    { name: 'Coffee Mug', category: 'Home', price: 15, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', description: 'Ceramic mug' },
    { name: 'Table Lamp', category: 'Home', price: 85, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', description: 'Modern table lamp' },
    { name: 'Throw Pillow', category: 'Home', price: 30, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Decorative pillow' },
    { name: 'Plant Pot', category: 'Home', price: 25, imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', description: 'Ceramic plant pot' },
    { name: 'Wall Clock', category: 'Home', price: 45, imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500', description: 'Modern wall clock' },
    
    // Books & Media
    { name: 'Programming Book', category: 'Books', price: 35, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500', description: 'Tech book' },
    { name: 'Notebook', category: 'Books', price: 12, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', description: 'Spiral notebook' },
    { name: 'Magazine', category: 'Books', price: 8, imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500', description: 'Fashion magazine' },
    
    // Sports & Outdoors
    { name: 'Basketball', category: 'Sports', price: 25, imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500', description: 'Official basketball' },
    { name: 'Tennis Racket', category: 'Sports', price: 120, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', description: 'Professional racket' },
    { name: 'Yoga Mat', category: 'Sports', price: 40, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Exercise mat' },
    
    // Accessories
    { name: 'Sunglasses', category: 'Accessories', price: 150, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', description: 'Designer sunglasses' },
    { name: 'Wrist Watch', category: 'Accessories', price: 200, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500', description: 'Analog watch' },
    { name: 'Backpack', category: 'Accessories', price: 75, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Travel backpack' },
    { name: 'Baseball Cap', category: 'Accessories', price: 28, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', description: 'Casual cap' },
    { name: 'Leather Wallet', category: 'Accessories', price: 65, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', description: 'Genuine leather' },
    
    // Beauty & Health
    { name: 'Perfume Bottle', category: 'Beauty', price: 85, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', description: 'Designer fragrance' },
    { name: 'Lipstick', category: 'Beauty', price: 22, imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500', description: 'Matte lipstick' },
    
    // Kitchen & Dining
    { name: 'Coffee Maker', category: 'Kitchen', price: 150, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500', description: 'Automatic coffee maker' },
    { name: 'Wine Glass', category: 'Kitchen', price: 18, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500', description: 'Crystal wine glass' },
    { name: 'Cutting Board', category: 'Kitchen', price: 35, imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c9a3633c4b?w=500', description: 'Wooden cutting board' },
    
    // Toys & Games
    { name: 'Rubiks Cube', category: 'Toys', price: 12, imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500', description: 'Classic puzzle cube' },
    { name: 'Board Game', category: 'Toys', price: 45, imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500', description: 'Strategy board game' },
    
    // Art & Craft
    { name: 'Paint Brush Set', category: 'Art', price: 25, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Artist brushes' },
    { name: 'Canvas', category: 'Art', price: 15, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Blank canvas' },
    
    // Additional items to reach 50+
    { name: 'Smartphone Case', category: 'Electronics', price: 20, imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500', description: 'Protective case' },
    { name: 'Wireless Mouse', category: 'Electronics', price: 35, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', description: 'Bluetooth mouse' },
    { name: 'Keyboard', category: 'Electronics', price: 80, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', description: 'Mechanical keyboard' },
    { name: 'Monitor', category: 'Electronics', price: 250, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', description: '24-inch monitor' },
    
    { name: 'Red Sneakers', category: 'Fashion', price: 110, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', description: 'Red athletic shoes' },
    { name: 'Blue Jeans', category: 'Fashion', price: 85, imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500', description: 'Classic blue denim' },
    { name: 'Black Dress', category: 'Fashion', price: 120, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', description: 'Little black dress' },
    { name: 'Leather Jacket', category: 'Fashion', price: 200, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', description: 'Black leather jacket' },
    
    { name: 'Ceramic Vase', category: 'Home', price: 40, imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500', description: 'Decorative vase' },
    { name: 'Candle', category: 'Home', price: 18, imageUrl: 'https://images.unsplash.com/photo-1602874801006-94c8746073a0?w=500', description: 'Scented candle' },
    { name: 'Picture Frame', category: 'Home', price: 22, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Wooden frame' },
    { name: 'Mirror', category: 'Home', price: 60, imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500', description: 'Round mirror' },
    
    { name: 'Handbag', category: 'Accessories', price: 95, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', description: 'Designer handbag' },
    { name: 'Belt', category: 'Accessories', price: 35, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Leather belt' },
    { name: 'Scarf', category: 'Accessories', price: 28, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500', description: 'Silk scarf' },
    { name: 'Ring', category: 'Accessories', price: 180, imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', description: 'Gold ring' }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        // Process each product
        const processedProducts = [];
        
        for (let i = 0; i < sampleProducts.length; i++) {
            const product = sampleProducts[i];
            console.log(`Processing product ${i + 1}/${sampleProducts.length}: ${product.name}`);
            
            try {
                // Extract color features from image URL
                const colorFeatures = await extractFeaturesFromUrl(product.imageUrl);
                
                // Create product with features
                const productData = {
                    ...product,
                    cloudinaryId: `sample_${i}`, // Mock cloudinary ID for seeded products
                    colorFeatures: colorFeatures
                };
                
                processedProducts.push(productData);
                
                // Add small delay to avoid overwhelming the image processing
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`Error processing ${product.name}:`, error.message);
                // Skip this product if image processing fails
            }
        }
        
        // Insert all processed products
        if (processedProducts.length > 0) {
            await Product.insertMany(processedProducts);
            console.log(`Successfully seeded ${processedProducts.length} products`);
        } else {
            console.log('No products were successfully processed');
        }
        
    } catch (error) {
        console.error('Seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('Database connection closed');
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };