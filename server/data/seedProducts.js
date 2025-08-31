const mongoose = require('mongoose');
const Product = require('../models/Product');
const { extractFeaturesFromUrl } = require('../utils/imageProcessor');
const dotenv = require('dotenv');

dotenv.config();

// Expanded sample products with daily life items
const sampleProducts = [
    // Electronics & Tech
    { name: 'iPhone 15 Pro', category: 'Electronics', price: 999, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Latest smartphone with advanced features' },
    { name: 'MacBook Air', category: 'Electronics', price: 1299, imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', description: 'Lightweight laptop for productivity' },
    { name: 'iPad Pro', category: 'Electronics', price: 799, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', description: 'Professional tablet for creative work' },
    { name: 'AirPods Pro', category: 'Electronics', price: 249, imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500', description: 'Wireless earbuds with noise cancellation' },
    { name: 'Apple Watch', category: 'Electronics', price: 399, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', description: 'Smart watch for health and fitness' },
    { name: 'Wireless Headphones', category: 'Electronics', price: 199, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', description: 'Over-ear wireless headphones' },
    { name: 'Gaming Mouse', category: 'Electronics', price: 79, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', description: 'High-precision gaming mouse' },
    { name: 'Mechanical Keyboard', category: 'Electronics', price: 129, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', description: 'RGB mechanical gaming keyboard' },
    { name: 'Smartphone Charger', category: 'Electronics', price: 25, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: 'Fast charging USB-C cable' },
    { name: 'Portable Speaker', category: 'Electronics', price: 89, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', description: 'Bluetooth portable speaker' },
    
    // Shoes & Footwear
    { name: 'Nike Air Max 270', category: 'Shoes', price: 150, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', description: 'Comfortable running shoes' },
    { name: 'Adidas Ultraboost', category: 'Shoes', price: 180, imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500', description: 'Premium running sneakers' },
    { name: 'Converse Chuck Taylor', category: 'Shoes', price: 65, imageUrl: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500', description: 'Classic canvas sneakers' },
    { name: 'Leather Dress Shoes', category: 'Shoes', price: 200, imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', description: 'Formal leather oxfords' },
    { name: 'Combat Boots', category: 'Shoes', price: 160, imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', description: 'Durable military-style boots' },
    { name: 'Flip Flops', category: 'Shoes', price: 25, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', description: 'Casual beach sandals' },
    { name: 'High Heels', category: 'Shoes', price: 120, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', description: 'Elegant formal heels' },
    { name: 'Basketball Shoes', category: 'Shoes', price: 140, imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500', description: 'High-top basketball sneakers' },
    { name: 'Hiking Boots', category: 'Shoes', price: 185, imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', description: 'Waterproof hiking boots' },
    { name: 'Slippers', category: 'Shoes', price: 35, imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500', description: 'Comfortable house slippers' },
    
    // Fashion & Clothing
    { name: 'Denim Jacket', category: 'Fashion', price: 89, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', description: 'Classic blue denim jacket' },
    { name: 'White T-Shirt', category: 'Fashion', price: 25, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', description: 'Basic cotton white tee' },
    { name: 'Black Hoodie', category: 'Fashion', price: 65, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', description: 'Comfortable pullover hoodie' },
    { name: 'Blue Jeans', category: 'Fashion', price: 75, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', description: 'Classic straight-leg jeans' },
    { name: 'Formal Shirt', category: 'Fashion', price: 68, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', description: 'Crisp white dress shirt' },
    { name: 'Leather Jacket', category: 'Fashion', price: 220, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', description: 'Premium black leather jacket' },
    { name: 'Summer Dress', category: 'Fashion', price: 85, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', description: 'Floral summer dress' },
    { name: 'Wool Sweater', category: 'Fashion', price: 95, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', description: 'Cozy wool knit sweater' },
    { name: 'Track Pants', category: 'Fashion', price: 45, imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500', description: 'Athletic jogger pants' },
    { name: 'Winter Coat', category: 'Fashion', price: 180, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', description: 'Warm winter puffer coat' },
    
    // Accessories & Personal Items
    { name: 'Ray-Ban Sunglasses', category: 'Accessories', price: 180, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', description: 'Classic aviator sunglasses' },
    { name: 'Rolex Watch', category: 'Accessories', price: 350, imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500', description: 'Luxury analog wristwatch' },
    { name: 'Travel Backpack', category: 'Accessories', price: 85, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Durable travel backpack' },
    { name: 'Baseball Cap', category: 'Accessories', price: 32, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', description: 'Adjustable baseball cap' },
    { name: 'Leather Wallet', category: 'Accessories', price: 75, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', description: 'Genuine leather bifold wallet' },
    { name: 'Designer Handbag', category: 'Accessories', price: 145, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', description: 'Luxury designer handbag' },
    { name: 'Silk Scarf', category: 'Accessories', price: 48, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500', description: 'Premium silk scarf' },
    { name: 'Leather Belt', category: 'Accessories', price: 42, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Classic brown leather belt' },
    { name: 'Gold Ring', category: 'Accessories', price: 220, imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', description: '14k gold wedding ring' },
    { name: 'Pearl Necklace', category: 'Accessories', price: 185, imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', description: 'Elegant pearl necklace' },
    
    // Home & Kitchen Items
    { name: 'Coffee Maker', category: 'Kitchen', price: 159, imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500', description: 'Automatic drip coffee maker' },
    { name: 'Blender', category: 'Kitchen', price: 89, imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500', description: 'High-speed smoothie blender' },
    { name: 'Toaster', category: 'Kitchen', price: 45, imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0d7853d7d0d?w=500', description: '2-slice stainless steel toaster' },
    { name: 'Microwave Oven', category: 'Kitchen', price: 120, imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0d7853d7d0d?w=500', description: 'Compact microwave oven' },
    { name: 'Non-stick Pan', category: 'Kitchen', price: 38, imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', description: 'Non-stick frying pan' },
    { name: 'Chef Knife', category: 'Kitchen', price: 65, imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500', description: 'Professional chef knife' },
    { name: 'Cutting Board', category: 'Kitchen', price: 28, imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c9a3633c4b?w=500', description: 'Bamboo cutting board' },
    { name: 'Wine Glasses Set', category: 'Kitchen', price: 45, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500', description: 'Set of 4 wine glasses' },
    { name: 'Coffee Mug', category: 'Kitchen', price: 18, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', description: 'Ceramic coffee mug' },
    { name: 'Dinner Plates Set', category: 'Kitchen', price: 55, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Set of 6 ceramic dinner plates' },
    
    // Home Decor & Furniture
    { name: 'Table Lamp', category: 'Home', price: 95, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', description: 'Modern LED table lamp' },
    { name: 'Throw Pillow', category: 'Home', price: 35, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Decorative throw pillow' },
    { name: 'Wall Clock', category: 'Home', price: 52, imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500', description: 'Minimalist wall clock' },
    { name: 'Picture Frame', category: 'Home', price: 28, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Wooden photo frame' },
    { name: 'Ceramic Vase', category: 'Home', price: 48, imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500', description: 'Decorative ceramic vase' },
    { name: 'Scented Candle', category: 'Home', price: 24, imageUrl: 'https://images.unsplash.com/photo-1602874801006-94c8746073a0?w=500', description: 'Vanilla scented candle' },
    { name: 'Round Mirror', category: 'Home', price: 68, imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=500', description: 'Modern round wall mirror' },
    { name: 'Plant Pot', category: 'Home', price: 32, imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', description: 'Ceramic plant pot with drainage' },
    { name: 'Desk Chair', category: 'Furniture', price: 199, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Ergonomic office chair' },
    { name: 'Coffee Table', category: 'Furniture', price: 285, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Modern glass coffee table' },
    
    // Personal Care & Beauty
    { name: 'Electric Toothbrush', category: 'Personal Care', price: 85, imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500', description: 'Rechargeable electric toothbrush' },
    { name: 'Hair Dryer', category: 'Personal Care', price: 75, imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500', description: 'Professional hair dryer' },
    { name: 'Perfume', category: 'Beauty', price: 95, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500', description: 'Designer fragrance bottle' },
    { name: 'Lipstick', category: 'Beauty', price: 28, imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500', description: 'Matte finish lipstick' },
    { name: 'Shaving Razor', category: 'Personal Care', price: 45, imageUrl: 'https://images.unsplash.com/photo-1503652601-557d07733ddc?w=500', description: 'Safety razor with blades' },
    { name: 'Moisturizer', category: 'Beauty', price: 38, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', description: 'Daily face moisturizer' },
    { name: 'Shampoo Bottle', category: 'Personal Care', price: 22, imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500', description: 'Organic shampoo bottle' },
    
    // Sports & Fitness
    { name: 'Basketball', category: 'Sports', price: 29, imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500', description: 'Official size basketball' },
    { name: 'Tennis Racket', category: 'Sports', price: 135, imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500', description: 'Professional tennis racket' },
    { name: 'Yoga Mat', category: 'Sports', price: 45, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Non-slip yoga exercise mat' },
    { name: 'Dumbbells Set', category: 'Sports', price: 120, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Adjustable dumbbells set' },
    { name: 'Water Bottle', category: 'Sports', price: 25, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', description: 'Stainless steel water bottle' },
    { name: 'Soccer Ball', category: 'Sports', price: 35, imageUrl: 'https://images.unsplash.com/photo-1614632537190-23e4b8f0296d?w=500', description: 'FIFA approved soccer ball' },
    { name: 'Gym Bag', category: 'Sports', price: 65, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Durable sports gym bag' },
    
    // Books & Education
    { name: 'Programming Book', category: 'Books', price: 42, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500', description: 'Learn Python programming' },
    { name: 'Notebook', category: 'Books', price: 15, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', description: 'Spiral bound notebook' },
    { name: 'Pen Set', category: 'Books', price: 28, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Premium ballpoint pen set' },
    { name: 'Calculator', category: 'Books', price: 35, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Scientific calculator' },
    
    // Food & Beverages (Daily consumables)
    { name: 'Coffee Beans', category: 'Food', price: 18, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', description: 'Premium arabica coffee beans' },
    { name: 'Green Tea', category: 'Food', price: 12, imageUrl: 'https://images.unsplash.com/photo-1594631661960-35ceab24e5ac?w=500', description: 'Organic green tea bags' },
    { name: 'Honey Jar', category: 'Food', price: 14, imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500', description: 'Pure wildflower honey' },
    { name: 'Olive Oil', category: 'Food', price: 22, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', description: 'Extra virgin olive oil' },
    
    // Automotive & Transport
    { name: 'Car Phone Mount', category: 'Automotive', price: 25, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: 'Dashboard phone holder' },
    { name: 'Car Air Freshener', category: 'Automotive', price: 8, imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500', description: 'Vanilla car air freshener' },
    { name: 'Bicycle Helmet', category: 'Automotive', price: 65, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Safety cycling helmet' },
    
    // Tools & Hardware
    { name: 'Screwdriver Set', category: 'Tools', price: 35, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'Multi-bit screwdriver set' },
    { name: 'Hammer', category: 'Tools', price: 28, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'Claw hammer with grip' },
    { name: 'Measuring Tape', category: 'Tools', price: 18, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: '25ft measuring tape' },
    
    // Pet Supplies
    { name: 'Dog Collar', category: 'Pet Supplies', price: 22, imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500', description: 'Adjustable dog collar' },
    { name: 'Cat Toy', category: 'Pet Supplies', price: 12, imageUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500', description: 'Interactive cat toy' },
    { name: 'Pet Food Bowl', category: 'Pet Supplies', price: 16, imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500', description: 'Stainless steel pet bowl' },
    
    // Toys & Games
    { name: 'Rubiks Cube', category: 'Toys', price: 15, imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500', description: 'Original 3x3 puzzle cube' },
    { name: 'Chess Set', category: 'Toys', price: 58, imageUrl: 'https://images.unsplash.com/photo-1528819622765-d6bcf132ac11?w=500', description: 'Wooden chess set with board' },
    { name: 'Playing Cards', category: 'Toys', price: 8, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Standard deck of cards' },
    { name: 'Board Game', category: 'Toys', price: 45, imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500', description: 'Family strategy board game' },
    { name: 'LEGO Set', category: 'Toys', price: 89, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Building blocks set' },
    
    // Office Supplies
    { name: 'Stapler', category: 'Office', price: 18, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Heavy-duty office stapler' },
    { name: 'Desk Organizer', category: 'Office', price: 32, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Bamboo desk organizer' },
    { name: 'Paper Clips', category: 'Office', price: 5, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Pack of 100 paper clips' },
    { name: 'Sticky Notes', category: 'Office', price: 8, imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', description: 'Colorful sticky note pads' },
    
    // Garden & Outdoor
    { name: 'Garden Gloves', category: 'Garden', price: 15, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', description: 'Waterproof gardening gloves' },
    { name: 'Watering Can', category: 'Garden', price: 28, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', description: 'Metal watering can' },
    { name: 'Garden Shovel', category: 'Garden', price: 35, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', description: 'Stainless steel garden spade' },
    { name: 'Flower Seeds', category: 'Garden', price: 8, imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', description: 'Mixed flower seed packet' },
    
    // Health & Wellness
    { name: 'Vitamins', category: 'Health', price: 25, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', description: 'Daily multivitamin supplement' },
    { name: 'Thermometer', category: 'Health', price: 35, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', description: 'Digital infrared thermometer' },
    { name: 'First Aid Kit', category: 'Health', price: 45, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', description: 'Complete first aid kit' },
    
    // Baby & Kids
    { name: 'Baby Bottle', category: 'Baby', price: 18, imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500', description: 'BPA-free baby bottle' },
    { name: 'Stuffed Animal', category: 'Baby', price: 25, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Soft teddy bear' },
    { name: 'Diaper Bag', category: 'Baby', price: 65, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Organized diaper bag' },
    
    // Cleaning Supplies
    { name: 'Vacuum Cleaner', category: 'Cleaning', price: 199, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Cordless stick vacuum' },
    { name: 'Mop and Bucket', category: 'Cleaning', price: 35, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Spin mop with bucket' },
    { name: 'Cleaning Spray', category: 'Cleaning', price: 12, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'All-purpose cleaner spray' },
    { name: 'Microfiber Cloths', category: 'Cleaning', price: 18, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Pack of microfiber cloths' },
    
    // Bathroom Items
    { name: 'Shower Curtain', category: 'Bathroom', price: 25, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Waterproof shower curtain' },
    { name: 'Bath Towel', category: 'Bathroom', price: 32, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Soft cotton bath towel' },
    { name: 'Toilet Paper', category: 'Bathroom', price: 15, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: '12-pack toilet paper rolls' },
    { name: 'Soap Dispenser', category: 'Bathroom', price: 22, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Automatic soap dispenser' },
    
    // Bedroom Items
    { name: 'Bed Sheets', category: 'Bedroom', price: 45, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Cotton bed sheet set' },
    { name: 'Memory Foam Pillow', category: 'Bedroom', price: 55, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Ergonomic memory foam pillow' },
    { name: 'Alarm Clock', category: 'Bedroom', price: 28, imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500', description: 'Digital alarm clock with radio' },
    { name: 'Bedside Lamp', category: 'Bedroom', price: 65, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500', description: 'Touch control bedside lamp' },
    
    // Outdoor & Travel
    { name: 'Camping Tent', category: 'Outdoor', price: 180, imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500', description: '4-person camping tent' },
    { name: 'Sleeping Bag', category: 'Outdoor', price: 85, imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500', description: 'Insulated sleeping bag' },
    { name: 'Hiking Backpack', category: 'Outdoor', price: 120, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: '40L hiking backpack' },
    { name: 'Travel Suitcase', category: 'Travel', price: 150, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', description: 'Hard-shell travel suitcase' },
    { name: 'Travel Pillow', category: 'Travel', price: 25, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Memory foam travel pillow' },
    
    // Musical Instruments
    { name: 'Acoustic Guitar', category: 'Music', price: 250, imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500', description: 'Steel-string acoustic guitar' },
    { name: 'Piano Keyboard', category: 'Music', price: 180, imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500', description: '61-key digital piano' },
    { name: 'Drum Sticks', category: 'Music', price: 15, imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500', description: 'Wooden drumsticks pair' },
    
    // Art & Craft Supplies
    { name: 'Paint Brush Set', category: 'Art', price: 32, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Professional artist brushes' },
    { name: 'Canvas Board', category: 'Art', price: 18, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Blank canvas for painting' },
    { name: 'Colored Pencils', category: 'Art', price: 25, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: '48-color pencil set' },
    { name: 'Craft Scissors', category: 'Art', price: 12, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Precision craft scissors' },
    
    // Party & Events
    { name: 'Birthday Candles', category: 'Party', price: 8, imageUrl: 'https://images.unsplash.com/photo-1602874801006-94c8746073a0?w=500', description: 'Colorful birthday candles' },
    { name: 'Party Balloons', category: 'Party', price: 12, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', description: 'Pack of latex balloons' },
    { name: 'Gift Wrapping Paper', category: 'Party', price: 15, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Decorative wrapping paper rolls' },
    
    // Seasonal Items
    { name: 'Winter Gloves', category: 'Seasonal', price: 28, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Warm winter gloves' },
    { name: 'Summer Hat', category: 'Seasonal', price: 35, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', description: 'Wide-brim sun hat' },
    { name: 'Umbrella', category: 'Seasonal', price: 25, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Compact folding umbrella' },
    { name: 'Sunscreen', category: 'Seasonal', price: 18, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', description: 'SPF 50 sunscreen lotion' },
    
    // Gaming & Entertainment
    { name: 'Gaming Controller', category: 'Gaming', price: 65, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Wireless gaming controller' },
    { name: 'VR Headset', category: 'Gaming', price: 299, imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', description: 'Virtual reality headset' },
    { name: 'Gaming Chair', category: 'Gaming', price: 250, imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', description: 'Ergonomic gaming chair' },
    
    // Stationery & Writing
    { name: 'Fountain Pen', category: 'Stationery', price: 45, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Elegant fountain pen' },
    { name: 'Highlighter Set', category: 'Stationery', price: 12, imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500', description: 'Fluorescent highlighter markers' },
    { name: 'Diary Journal', category: 'Stationery', price: 22, imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', description: 'Leather-bound diary' },
    
    // Beverages & Drinkware
    { name: 'Travel Mug', category: 'Drinkware', price: 28, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', description: 'Insulated travel coffee mug' },
    { name: 'Wine Bottle', category: 'Beverages', price: 35, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500', description: 'Premium red wine' },
    { name: 'Beer Mug', category: 'Drinkware', price: 22, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=500', description: 'Glass beer mug' },
    { name: 'Cocktail Shaker', category: 'Drinkware', price: 45, imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500', description: 'Stainless steel cocktail shaker' },
    
    // Tech Accessories
    { name: 'Phone Case', category: 'Tech Accessories', price: 25, imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500', description: 'Protective phone case' },
    { name: 'Power Bank', category: 'Tech Accessories', price: 45, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: '10000mAh portable charger' },
    { name: 'USB Cable', category: 'Tech Accessories', price: 15, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: 'USB-C charging cable' },
    { name: 'Screen Protector', category: 'Tech Accessories', price: 18, imageUrl: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500', description: 'Tempered glass screen protector' },
    { name: 'Car Charger', category: 'Tech Accessories', price: 20, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: 'Dual USB car charger' },
    
    // Food Storage & Containers
    { name: 'Food Storage Containers', category: 'Kitchen Storage', price: 35, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Set of glass food containers' },
    { name: 'Water Filter', category: 'Kitchen', price: 65, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', description: 'Countertop water filter' },
    { name: 'Lunch Box', category: 'Kitchen Storage', price: 22, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Insulated lunch container' },
    { name: 'Thermos Flask', category: 'Drinkware', price: 38, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', description: 'Stainless steel thermos' },
    
    // Emergency & Safety
    { name: 'Flashlight', category: 'Safety', price: 25, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'LED tactical flashlight' },
    { name: 'Smoke Detector', category: 'Safety', price: 35, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Battery-powered smoke alarm' },
    { name: 'Fire Extinguisher', category: 'Safety', price: 45, imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500', description: 'Portable fire extinguisher' },
    
    // Laundry & Clothing Care
    { name: 'Laundry Detergent', category: 'Laundry', price: 18, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Concentrated laundry detergent' },
    { name: 'Fabric Softener', category: 'Laundry', price: 12, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Fresh scent fabric softener' },
    { name: 'Iron', category: 'Laundry', price: 65, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', description: 'Steam iron for clothes' },
    { name: 'Laundry Basket', category: 'Laundry', price: 28, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Woven laundry hamper' },
    
    // Computer Accessories
    { name: 'Computer Monitor', category: 'Computer', price: 280, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', description: '24-inch LED monitor' },
    { name: 'Webcam', category: 'Computer', price: 85, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500', description: '1080p HD webcam' },
    { name: 'USB Hub', category: 'Computer', price: 35, imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', description: '7-port USB 3.0 hub' },
    { name: 'Mouse Pad', category: 'Computer', price: 15, imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', description: 'Gaming mouse pad' },
    
    // Health & Fitness Equipment
    { name: 'Resistance Bands', category: 'Fitness', price: 25, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Set of resistance bands' },
    { name: 'Protein Shaker', category: 'Fitness', price: 18, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', description: 'Protein powder shaker bottle' },
    { name: 'Fitness Tracker', category: 'Fitness', price: 120, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500', description: 'Heart rate fitness tracker' },
    { name: 'Exercise Ball', category: 'Fitness', price: 35, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', description: 'Stability exercise ball' },
    
    // Winter & Cold Weather Items
    { name: 'Winter Scarf', category: 'Winter', price: 38, imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500', description: 'Wool winter scarf' },
    { name: 'Snow Boots', category: 'Winter', price: 140, imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500', description: 'Waterproof snow boots' },
    { name: 'Hand Warmers', category: 'Winter', price: 12, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Disposable hand warmers' },
    
    // Summer & Hot Weather Items
    { name: 'Beach Towel', category: 'Summer', price: 25, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Large beach towel' },
    { name: 'Swimwear', category: 'Summer', price: 45, imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', description: 'One-piece swimsuit' },
    { name: 'Beach Ball', category: 'Summer', price: 8, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500', description: 'Inflatable beach ball' },
    { name: 'Cooler Box', category: 'Summer', price: 85, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', description: 'Insulated cooler box' },
    
    // Additional Daily Essentials
    { name: 'Tissues Box', category: 'Daily Essentials', price: 8, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Soft facial tissues' },
    { name: 'Hand Sanitizer', category: 'Daily Essentials', price: 6, imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500', description: 'Antibacterial hand sanitizer' },
    { name: 'Face Mask', category: 'Daily Essentials', price: 15, imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500', description: 'Pack of disposable face masks' },
    { name: 'Trash Bags', category: 'Daily Essentials', price: 12, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Heavy-duty trash bags' },
    { name: 'Paper Towels', category: 'Daily Essentials', price: 18, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', description: 'Absorbent paper towel rolls' }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');
        
        // Process each product
        const processedProducts = [];
        
        console.log(`📦 Processing ${sampleProducts.length} products...`);
        
        for (let i = 0; i < sampleProducts.length; i++) {
            const product = sampleProducts[i];
            console.log(`⏳ Processing ${i + 1}/${sampleProducts.length}: ${product.name}`);
            
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
                console.log(`✅ Successfully processed: ${product.name}`);
                
                // Add small delay to avoid overwhelming the image processing
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`❌ Error processing ${product.name}:`, error.message);
                // Skip this product if image processing fails but continue with others
            }
        }
        
        // Insert all processed products
        if (processedProducts.length > 0) {
            await Product.insertMany(processedProducts);
            console.log(`🎉 Successfully seeded ${processedProducts.length} products!`);
            console.log(`📊 Categories added:`);
            
            // Show category breakdown
            const categories = {};
            processedProducts.forEach(product => {
                categories[product.category] = (categories[product.category] || 0) + 1;
            });
            
            Object.entries(categories).forEach(([category, count]) => {
                console.log(`   ${category}: ${count} products`);
            });
            
        } else {
            console.log('❌ No products were successfully processed');
        }
        
    } catch (error) {
        console.error('💥 Seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔐 Database connection closed');
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    console.log('🌱 Starting database seeding process...');
    seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };