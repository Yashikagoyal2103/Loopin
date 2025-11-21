import mongoose from 'mongoose';

const PostSchema= new mongoose.Schema({
    user: {type:String, ref:'User', required:true},
    content:{type:String, required:true},
    image_urls:{type:String, default:""},
    likes_counts: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    post_type: { type:String, enum:['text', 'image', 'text_with_image'], required:true },
},{timestamps:true, minimize:true})

const Post = mongoose.model('Post', PostSchema);

export default Post;