import mongoose from 'mongoose';
import slugify from 'slugify';
import mongoosePaginate from 'mongoose-paginate-v2';

const shopSchema = new mongoose.Schema(
{
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

    description: String,

    logo: { 
        type: String, 
        default: null 
    },

    banner: { 
        type: String, 
        default: null 
    },

    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    phone: String,

    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },

    status: {
        type: String,
        enum: ['pending', 'approved'],
        default: 'pending'
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

shopSchema.pre('validate', function () {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

shopSchema.plugin(mongoosePaginate);

shopSchema.index({ vendorId: 1, name: 1 }, { unique: true });



const Shop = mongoose.model('Shop', shopSchema);
export default Shop;
