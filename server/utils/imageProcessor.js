const sharp = require('sharp');
const axios = require('axios');

// Extract dominant colors from image buffer
const extractColorFeatures = async (imageBuffer) => {
    try {
        // Resize image to 64x64 for faster processing
        const resizedBuffer = await sharp(imageBuffer)
            .resize(64, 64)
            .raw()
            .toBuffer();

        // Extract RGB values
        const pixels = [];
        for (let i = 0; i < resizedBuffer.length; i += 3) {
            const r = resizedBuffer[i];
            const g = resizedBuffer[i + 1];
            const b = resizedBuffer[i + 2];
            pixels.push([r, g, b]);
        }

        // Calculate color histogram (simplified)
        const colorBins = 8; // Reduce colors to 8x8x8 = 512 bins
        const binSize = 256 / colorBins;
        const histogram = new Array(colorBins * colorBins * colorBins).fill(0);

        pixels.forEach(([r, g, b]) => {
            const rBin = Math.min(Math.floor(r / binSize), colorBins - 1);
            const gBin = Math.min(Math.floor(g / binSize), colorBins - 1);
            const bBin = Math.min(Math.floor(b / binSize), colorBins - 1);
            const index = rBin * colorBins * colorBins + gBin * colorBins + bBin;
            histogram[index]++;
        });

        // Normalize histogram
        const totalPixels = pixels.length;
        return histogram.map(count => count / totalPixels);
    } catch (error) {
        console.error('Error extracting color features:', error);
        throw error;
    }
};

// Download image from URL and extract features
const extractFeaturesFromUrl = async (imageUrl) => {
    try {
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'arraybuffer'
        });
        
        const imageBuffer = Buffer.from(response.data);
        return await extractColorFeatures(imageBuffer);
    } catch (error) {
        console.error('Error downloading image from URL:', error);
        throw error;
    }
};

// Calculate cosine similarity between two feature vectors
const calculateSimilarity = (features1, features2) => {
    if (!features1 || !features2 || features1.length !== features2.length) {
        return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
        dotProduct += features1[i] * features2[i];
        norm1 += features1[i] * features1[i];
        norm2 += features2[i] * features2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
};

// Find similar products based on image features
const findSimilarProducts = (uploadedFeatures, products, limit = 10) => {
    const similarities = products.map(product => ({
        ...product.toObject(),
        similarity: calculateSimilarity(uploadedFeatures, product.colorFeatures)
    }));

    // Sort by similarity (highest first) and return top results
    return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .filter(product => product.similarity > 0.1); // Minimum similarity threshold
};

module.exports = {
    extractColorFeatures,
    extractFeaturesFromUrl,
    calculateSimilarity,
    findSimilarProducts
};