const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    // Legacy color features (keep for backward compatibility)
    colorFeatures: {
        type: [Number],
        default: []
    },
    // NEW: Enhanced features for better AI matching
    enhancedFeatures: {
        colorHistogram: {
            type: [Number],
            default: []
        },
        dominantColors: {
            type: [[Number]],
            default: []
        },
        textureFeatures: {
            type: [Number],
            default: []
        },
        brightnessContrast: {
            type: [Number],
            default: []
        },
        hsvFeatures: {
            type: [Number],
            default: []
        },
        shapeFeatures: {
            type: [Number],
            default: []
        },
        imageStats: {
            width: Number,
            height: Number,
            channels: Number,
            density: Number
        }
    },
    description: {
        type: String,
        trim: true
    },
    // NEW: Additional fields for better matching
    tags: {
        type: [String],
        default: []
    },
    brand: {
        type: String,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },
    color: {
        type: String,
        trim: true
    },
    lastFeatureUpdate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Enhanced indexes for faster searches
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ color: 1 });
productSchema.index({ 'enhancedFeatures.colorHistogram': 1 });

// Pre-save middleware to auto-generate tags
productSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('name') || this.isModified('description') || this.isModified('category')) {
        // Auto-generate search tags from name, description, and category
        const text = `${this.name} ${this.description} ${this.category}`.toLowerCase();
        const words = text.match(/\b\w+\b/g) || [];
        
        // Filter meaningful words (exclude common words)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        this.tags = [...new Set(words.filter(word => 
            word.length > 2 && !stopWords.includes(word)
        ))];
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;