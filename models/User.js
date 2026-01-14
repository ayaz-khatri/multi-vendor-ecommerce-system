import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import mongoosePaginate from 'mongoose-paginate-v2';

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
        required: function () {
            return this.authProvider === 'local';
        }
    },

    phone: {
        type: String
    },

    googleId: {
        type: String,
        default: null
    },

    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },

    role: {
        type: String,
        enum: ['admin', 'vendor', 'customer'],
        default: 'customer'
    },

    profilePic: { 
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

    lastLogin: {
        type: Date
    },

    isEmailVerified: {
        type: Boolean,
        default: true
    },

    emailVerificationToken: {
        type: String
    },

    emailVerificationExpires: {
        type: Date
    },

    resetPasswordToken: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    }

},
{
    timestamps: true
});

userSchema.pre('save', async function () {
    if (!this.password || !this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.plugin(mongoosePaginate);


const User = mongoose.model('User', userSchema);
export default User;
