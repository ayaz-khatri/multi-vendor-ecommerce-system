import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
{
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discountPrice: {
        type: Number,
        validate: {
            validator: function (value) {
                return value < this.price;
            },
            message: 'Discount price must be less than original price'
        }
    },

    stock: {
        type: Number,
        required: true,
        min: 0
    },

    sku: {
        type: String,
        unique: true
    },

    images: {
        type: [String],
        default: []
    },

    attributes: [
        {
            key: String,     // e.g. Color
            value: String    // e.g. Red
        }
    ],

    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },
},
{
    timestamps: true
});

productSchema.pre('validate', function (next) {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true  });
    }
    next();
});

productSchema.index({ shopId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ vendorId: 1 });
productSchema.index({ name: 1, shopId: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
