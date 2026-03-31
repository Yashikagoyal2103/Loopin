import mongoose from 'mongoose';

const storySchema= new mongoose.Schema({
    user: {type:String, ref:'User', required:true},
    content:{type:String, default:""},
    media_url:{type:String, default:""},
    views_counts: { type: [String], default: [] },
    media_type: { type:String, enum:['text', 'image', 'video'], required:true },
    background_color: { type: String, default: "" },
},{timestamps:true, minimize:true})

const Story = mongoose.model('Story', storySchema);

export default Story;