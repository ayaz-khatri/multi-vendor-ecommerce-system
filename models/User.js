import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    phone: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['admin', 'vendor', 'customer'],
        default: 'customer'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastLogin: {
        type: Date
    }
},
{
    timestamps: true
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);
export default User;
