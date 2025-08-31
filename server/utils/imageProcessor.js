const sharp = require('sharp');
const axios = require('axios');

// Enhanced feature extraction with multiple techniques
const extractEnhancedFeatures = async (imageBuffer) => {
    try {
        // Get image metadata and stats
        const metadata = await sharp(imageBuffer).metadata();
        const stats = await sharp(imageBuffer).stats();
        
        // 1. Color Histogram (improved with more bins)
        const colorHistogram = await extractColorHistogram(imageBuffer);
        
        // 2. Dominant Colors (top 5 colors)
        const dominantColors = await extractDominantColors(imageBuffer);
        
        // 3. Texture Features (edge detection and patterns)
        const textureFeatures = await extractTextureFeatures(imageBuffer);
        
        // 4. Brightness and Contrast Features
        const brightnessContrast = await extractBrightnessContrast(imageBuffer);
        
        // 5. HSV Color Space Features
        const hsvFeatures = await extractHSVFeatures(imageBuffer);
        
        // 6. Shape and Edge Features
        const shapeFeatures = await extractShapeFeatures(imageBuffer);
        
        // Combine all features into a comprehensive feature vector
        return {
            colorHistogram: colorHistogram,
            dominantColors: dominantColors,
            textureFeatures: textureFeatures,
            brightnessContrast: brightnessContrast,
            hsvFeatures: hsvFeatures,
            shapeFeatures: shapeFeatures,
            imageStats: {
                width: metadata.width,
                height: metadata.height,
                channels: metadata.channels,
                density: metadata.density || 72
            }
        };
    } catch (error) {
        console.error('Error extracting enhanced features:', error);
        throw error;
    }
};

// 1. Enhanced Color Histogram with more precision
const extractColorHistogram = async (imageBuffer) => {
    try {
        // Resize to 128x128 for better feature resolution
        const resizedBuffer = await sharp(imageBuffer)
            .resize(128, 128)
            .raw()
            .toBuffer();

        const pixels = [];
        for (let i = 0; i < resizedBuffer.length; i += 3) {
            const r = resizedBuffer[i];
            const g = resizedBuffer[i + 1];
            const b = resizedBuffer[i + 2];
            pixels.push([r, g, b]);
        }

        // Create more detailed histogram (16x16x16 = 4096 bins)
        const colorBins = 16;
        const binSize = 256 / colorBins;
        const histogram = new Array(colorBins * colorBins * colorBins).fill(0);

        pixels.forEach(([r, g, b]) => {
            const rBin = Math.min(Math.floor(r / binSize), colorBins - 1);
            const gBin = Math.min(Math.floor(g / binSize), colorBins - 1);
            const bBin = Math.min(Math.floor(b / binSize), colorBins - 1);
            const index = rBin * colorBins * colorBins + gBin * colorBins + bBin;
            histogram[index]++;
        });

        const totalPixels = pixels.length;
        return histogram.map(count => count / totalPixels);
    } catch (error) {
        console.error('Error in color histogram:', error);
        return [];
    }
};

// 2. Extract Dominant Colors using K-means clustering
const extractDominantColors = async (imageBuffer) => {
    try {
        const resizedBuffer = await sharp(imageBuffer)
            .resize(64, 64)
            .raw()
            .toBuffer();

        const pixels = [];
        for (let i = 0; i < resizedBuffer.length; i += 3) {
            pixels.push([resizedBuffer[i], resizedBuffer[i + 1], resizedBuffer[i + 2]]);
        }

        // Simple K-means for 5 dominant colors
        const k = 5;
        const maxIterations = 10;
        
        // Initialize centroids randomly
        let centroids = [];
        for (let i = 0; i < k; i++) {
            const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
            centroids.push([...randomPixel]);
        }

        // K-means iterations
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const clusters = Array(k).fill().map(() => []);
            
            // Assign pixels to nearest centroid
            pixels.forEach(pixel => {
                let minDistance = Infinity;
                let closestCentroid = 0;
                
                centroids.forEach((centroid, index) => {
                    const distance = Math.sqrt(
                        Math.pow(pixel[0] - centroid[0], 2) +
                        Math.pow(pixel[1] - centroid[1], 2) +
                        Math.pow(pixel[2] - centroid[2], 2)
                    );
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = index;
                    }
                });
                
                clusters[closestCentroid].push(pixel);
            });
            
            // Update centroids
            centroids = clusters.map(cluster => {
                if (cluster.length === 0) return centroids[0]; // Fallback
                
                const avgR = cluster.reduce((sum, pixel) => sum + pixel[0], 0) / cluster.length;
                const avgG = cluster.reduce((sum, pixel) => sum + pixel[1], 0) / cluster.length;
                const avgB = cluster.reduce((sum, pixel) => sum + pixel[2], 0) / cluster.length;
                
                return [Math.round(avgR), Math.round(avgG), Math.round(avgB)];
            });
        }

        // Normalize and return dominant colors
        return centroids.map(color => color.map(c => c / 255));
    } catch (error) {
        console.error('Error extracting dominant colors:', error);
        return [];
    }
};

// 3. Extract Texture Features using edge detection
const extractTextureFeatures = async (imageBuffer) => {
    try {
        // Convert to grayscale and apply edge detection
        const edges = await sharp(imageBuffer)
            .resize(64, 64)
            .grayscale()
            .convolve({
                width: 3,
                height: 3,
                kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] // Edge detection kernel
            })
            .raw()
            .toBuffer();

        // Calculate texture statistics
        const edgeValues = Array.from(edges);
        const mean = edgeValues.reduce((sum, val) => sum + val, 0) / edgeValues.length;
        const variance = edgeValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / edgeValues.length;
        const entropy = calculateEntropy(edgeValues);
        
        // Local Binary Pattern (simplified)
        const lbpFeatures = calculateLBP(edges, 64);
        
        return [
            mean / 255,
            Math.sqrt(variance) / 255,
            entropy,
            ...lbpFeatures
        ];
    } catch (error) {
        console.error('Error extracting texture features:', error);
        return [];
    }
};

// 4. Extract Brightness and Contrast
const extractBrightnessContrast = async (imageBuffer) => {
    try {
        const stats = await sharp(imageBuffer).stats();
        
        const features = [];
        stats.channels.forEach(channel => {
            features.push(
                channel.mean / 255,      // Brightness
                channel.stdev / 255,     // Contrast (standard deviation)
                channel.min / 255,       // Minimum value
                channel.max / 255        // Maximum value
            );
        });
        
        return features;
    } catch (error) {
        console.error('Error extracting brightness/contrast:', error);
        return [];
    }
};

// 5. Extract HSV Features
const extractHSVFeatures = async (imageBuffer) => {
    try {
        const resizedBuffer = await sharp(imageBuffer)
            .resize(64, 64)
            .raw()
            .toBuffer();

        const hsvValues = [];
        for (let i = 0; i < resizedBuffer.length; i += 3) {
            const r = resizedBuffer[i] / 255;
            const g = resizedBuffer[i + 1] / 255;
            const b = resizedBuffer[i + 2] / 255;
            
            const hsv = rgbToHsv(r, g, b);
            hsvValues.push(hsv);
        }

        // Calculate HSV histograms
        const hueHist = new Array(36).fill(0);    // 36 bins for hue (0-360 degrees)
        const satHist = new Array(10).fill(0);    // 10 bins for saturation
        const valHist = new Array(10).fill(0);    // 10 bins for value

        hsvValues.forEach(([h, s, v]) => {
            const hBin = Math.min(Math.floor(h * 36), 35);
            const sBin = Math.min(Math.floor(s * 10), 9);
            const vBin = Math.min(Math.floor(v * 10), 9);
            
            hueHist[hBin]++;
            satHist[sBin]++;
            valHist[vBin]++;
        });

        const totalPixels = hsvValues.length;
        return [
            ...hueHist.map(count => count / totalPixels),
            ...satHist.map(count => count / totalPixels),
            ...valHist.map(count => count / totalPixels)
        ];
    } catch (error) {
        console.error('Error extracting HSV features:', error);
        return [];
    }
};

// 6. Extract Shape and Edge Features
const extractShapeFeatures = async (imageBuffer) => {
    try {
        // Apply different edge detection kernels
        const sobelX = await sharp(imageBuffer)
            .resize(64, 64)
            .grayscale()
            .convolve({
                width: 3,
                height: 3,
                kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1] // Sobel X
            })
            .raw()
            .toBuffer();

        const sobelY = await sharp(imageBuffer)
            .resize(64, 64)
            .grayscale()
            .convolve({
                width: 3,
                height: 3,
                kernel: [-1, -2, -1, 0, 0, 0, 1, 2, 1] // Sobel Y
            })
            .raw()
            .toBuffer();

        // Calculate edge magnitude and direction
        const edgeMagnitudes = [];
        const edgeDirections = [];
        
        for (let i = 0; i < sobelX.length; i++) {
            const gx = sobelX[i];
            const gy = sobelY[i];
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const direction = Math.atan2(gy, gx);
            
            edgeMagnitudes.push(magnitude);
            edgeDirections.push(direction);
        }

        // Calculate shape statistics
        const avgMagnitude = edgeMagnitudes.reduce((sum, val) => sum + val, 0) / edgeMagnitudes.length;
        const edgePixels = edgeMagnitudes.filter(mag => mag > avgMagnitude * 0.5).length;
        const edgeDensity = edgePixels / edgeMagnitudes.length;

        // Direction histogram (8 bins for 8 main directions)
        const directionHist = new Array(8).fill(0);
        edgeDirections.forEach(dir => {
            const bin = Math.floor(((dir + Math.PI) / (2 * Math.PI)) * 8) % 8;
            directionHist[bin]++;
        });

        const totalEdges = edgeDirections.length;
        return [
            avgMagnitude / 255,
            edgeDensity,
            ...directionHist.map(count => count / totalEdges)
        ];
    } catch (error) {
        console.error('Error extracting shape features:', error);
        return [];
    }
};

// Helper function: Calculate entropy
const calculateEntropy = (values) => {
    const histogram = new Array(256).fill(0);
    values.forEach(val => histogram[Math.min(Math.floor(val), 255)]++);
    
    const total = values.length;
    let entropy = 0;
    
    histogram.forEach(count => {
        if (count > 0) {
            const probability = count / total;
            entropy -= probability * Math.log2(probability);
        }
    });
    
    return entropy / 8; // Normalize
};

// Helper function: Local Binary Pattern (simplified)
const calculateLBP = (grayBuffer, width) => {
    const height = grayBuffer.length / width;
    const lbpHist = new Array(256).fill(0);
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const center = grayBuffer[y * width + x];
            let lbpValue = 0;
            
            // Check 8 neighbors
            const neighbors = [
                grayBuffer[(y-1) * width + (x-1)], // Top-left
                grayBuffer[(y-1) * width + x],     // Top
                grayBuffer[(y-1) * width + (x+1)], // Top-right
                grayBuffer[y * width + (x+1)],     // Right
                grayBuffer[(y+1) * width + (x+1)], // Bottom-right
                grayBuffer[(y+1) * width + x],     // Bottom
                grayBuffer[(y+1) * width + (x-1)], // Bottom-left
                grayBuffer[y * width + (x-1)]      // Left
            ];
            
            neighbors.forEach((neighbor, i) => {
                if (neighbor >= center) {
                    lbpValue |= (1 << i);
                }
            });
            
            lbpHist[lbpValue]++;
        }
    }
    
    // Return normalized top 8 LBP patterns
    const total = lbpHist.reduce((sum, count) => sum + count, 0);
    return lbpHist.slice(0, 8).map(count => count / total);
};

// Helper function: RGB to HSV conversion
const rgbToHsv = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
        if (max === r) h = ((g - b) / diff) % 6;
        else if (max === g) h = (b - r) / diff + 2;
        else h = (r - g) / diff + 4;
    }
    h = h / 6;
    if (h < 0) h += 1;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return [h, s, v];
};

// Enhanced similarity calculation with weighted features
const calculateEnhancedSimilarity = (features1, features2) => {
    if (!features1 || !features2) return 0;

    try {
        // Different weights for different feature types
        const weights = {
            colorHistogram: 0.25,
            dominantColors: 0.20,
            textureFeatures: 0.15,
            brightnessContrast: 0.15,
            hsvFeatures: 0.15,
            shapeFeatures: 0.10
        };

        let totalSimilarity = 0;
        let totalWeight = 0;

        // Calculate similarity for each feature type
        Object.keys(weights).forEach(featureType => {
            if (features1[featureType] && features2[featureType]) {
                const similarity = calculateCosineSimilarity(features1[featureType], features2[featureType]);
                totalSimilarity += similarity * weights[featureType];
                totalWeight += weights[featureType];
            }
        });

        // Category bonus: give extra points for same category
        let categoryBonus = 0;
        if (features1.category && features2.category && features1.category === features2.category) {
            categoryBonus = 0.1; // 10% bonus for same category
        }

        return totalWeight > 0 ? (totalSimilarity / totalWeight) + categoryBonus : 0;
    } catch (error) {
        console.error('Error calculating enhanced similarity:', error);
        return 0;
    }
};

// Cosine similarity for feature vectors
const calculateCosineSimilarity = (vec1, vec2) => {
    if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Backward compatibility: Extract basic color features
const extractColorFeatures = async (imageBuffer) => {
    try {
        const enhancedFeatures = await extractEnhancedFeatures(imageBuffer);
        return enhancedFeatures.colorHistogram;
    } catch (error) {
        console.error('Error in backward compatibility function:', error);
        return [];
    }
};

// Download image from URL and extract enhanced features
const extractFeaturesFromUrl = async (imageUrl) => {
    try {
        console.log(`🔄 Downloading image from: ${imageUrl}`);
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'arraybuffer',
            timeout: 10000, // 10 second timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const imageBuffer = Buffer.from(response.data);
        console.log(`📏 Image size: ${imageBuffer.length} bytes`);
        
        return await extractEnhancedFeatures(imageBuffer);
    } catch (error) {
        console.error('Error downloading image from URL:', error);
        // Return basic features as fallback
        return {
            colorHistogram: [],
            dominantColors: [],
            textureFeatures: [],
            brightnessContrast: [],
            hsvFeatures: [],
            shapeFeatures: []
        };
    }
};

// Enhanced product similarity finder with multiple algorithms
const findSimilarProducts = (uploadedFeatures, products, limit = 10) => {
    console.log(`🔍 Analyzing ${products.length} products for similarity...`);
    
    const similarities = products.map(product => {
        let similarity = 0;
        
        // Use enhanced similarity if both images have enhanced features
        if (uploadedFeatures.colorHistogram && product.enhancedFeatures) {
            similarity = calculateEnhancedSimilarity(uploadedFeatures, product.enhancedFeatures);
        }
        // Fallback to basic color similarity
        else if (uploadedFeatures.colorHistogram && product.colorFeatures) {
            similarity = calculateCosineSimilarity(uploadedFeatures.colorHistogram, product.colorFeatures);
        }
        // Legacy support
        else if (uploadedFeatures.length && product.colorFeatures) {
            similarity = calculateCosineSimilarity(uploadedFeatures, product.colorFeatures);
        }

        return {
            ...product.toObject(),
            similarity: similarity,
            enhancedMatch: uploadedFeatures.colorHistogram && product.enhancedFeatures
        };
    });

    // Sort by similarity and apply intelligent filtering
    const sortedProducts = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .filter(product => product.similarity > 0.05); // Lower threshold for more results

    // Apply category clustering - prioritize variety
    const categoryGroups = {};
    sortedProducts.forEach(product => {
        if (!categoryGroups[product.category]) {
            categoryGroups[product.category] = [];
        }
        categoryGroups[product.category].push(product);
    });

    // Get diverse results: max 3 from each category
    const diverseResults = [];
    const maxPerCategory = 3;
    
    Object.values(categoryGroups).forEach(categoryProducts => {
        diverseResults.push(...categoryProducts.slice(0, maxPerCategory));
    });

    // Sort again and return top results
    const finalResults = diverseResults
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    console.log(`✨ Found ${finalResults.length} similar products`);
    console.log(`📊 Top similarity scores: ${finalResults.slice(0, 3).map(p => p.similarity.toFixed(3)).join(', ')}`);
    
    return finalResults;
};

// Update existing products with enhanced features (migration function)
const updateProductsWithEnhancedFeatures = async () => {
    const Product = require('../models/Product');
    
    try {
        const products = await Product.find({ enhancedFeatures: { $exists: false } });
        console.log(`🔄 Updating ${products.length} products with enhanced features...`);
        
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            console.log(`⏳ Processing ${i + 1}/${products.length}: ${product.name}`);
            
            try {
                const enhancedFeatures = await extractFeaturesFromUrl(product.imageUrl);
                
                await Product.updateOne(
                    { _id: product._id },
                    { 
                        $set: { 
                            enhancedFeatures: enhancedFeatures,
                            lastFeatureUpdate: new Date()
                        }
                    }
                );
                
                console.log(`✅ Updated: ${product.name}`);
                
                // Small delay to avoid overwhelming
                await new Promise(resolve => setTimeout(resolve, 200));
                
            } catch (error) {
                console.error(`❌ Failed to update ${product.name}:`, error.message);
            }
        }
        
        console.log('🎉 Enhanced features update completed!');
    } catch (error) {
        console.error('Error updating products:', error);
    }
};

module.exports = {
    extractColorFeatures,
    extractEnhancedFeatures,
    extractFeaturesFromUrl,
    calculateCosineSimilarity,
    calculateEnhancedSimilarity,
    findSimilarProducts,
    updateProductsWithEnhancedFeatures
};