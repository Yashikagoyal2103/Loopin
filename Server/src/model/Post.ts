import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        default: ""
    },
    image_urls: [{
        type: String
    }],
    likes_count: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Backward compatibility for older seeded data.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    shares_count: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
const Post = mongoose.model('Post', PostSchema);
export default Post;