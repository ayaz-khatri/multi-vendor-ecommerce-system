import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
{
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

    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },

    description: String,

    icon: { 
        type: String, 
        default: null 
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

categorySchema.pre('validate', function () {
    if (!this.slug && this.name) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
});

categorySchema.index({ parentCategory: 1 });
categorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
