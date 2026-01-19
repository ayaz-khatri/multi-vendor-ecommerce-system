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
        required: true,
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
        url: { type: String, default: null },
        publicId: { type: String, default: null}
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

categorySchema.pre('validate', async function () {
    if (!this.name) return next();

    const currentSlug = slugify(this.name, { lower: true, strict: true });

    if (!this.parentCategory) {
        // Top-level category
        this.slug = currentSlug;
        return;
    }

    // Sub-category: prepend parent slug
    const parent = await this.constructor.findById(this.parentCategory);

    if (!parent) {
        return next(new Error('Invalid parent category'));
    }

    this.slug = `${parent.slug}/${currentSlug}`;
});


categorySchema.index({ parentCategory: 1 });
categorySchema.index({ slug: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
