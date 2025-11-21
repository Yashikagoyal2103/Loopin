import mongoose from 'mongoose';

const storySchema= new mongoose.Schema({
    user: {type:String, ref:'User', required:true},
    content:{type:String, required:true},
    media_urls:{type:String, default:""},
    views_counts: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    media_type: { type:String, enum:['text', 'image', 'text_with_image'], required:true },
    background_color: { type: String, default: "" },
},{timestamps:true, minimize:true})

const Story = mongoose.model('Story', storySchema);

export default Story;