import {  Heart, MessageCircle, Share2 } from "lucide-react"
import moment from "moment"
import { useState } from "react";
import { type Post, type Comment } from "../assets/assets"; 
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import api from "../api/axios";
import toast from "react-hot-toast";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
   const navigate = useNavigate()
   const safeUser = post.user || {
    _id: "",
    full_name: "Unknown user",
    username: "unknown",
    profile_picture: "/default-avatar.png"
   };
   const safeContent = post.content || "";
   const safeImageUrls = Array.isArray(post.image_urls)
    ? post.image_urls
    : (post.image_urls ? [post.image_urls as unknown as string] : []);
   const postWithHashTags = safeContent.replace(/(#\w+)/g, '<span class="text-blue-500">$1</span>');
   const normalizeIds = (arr: any[] = []) => arr.map((id) => id?.toString());
   const [likes, setLikes] = useState<string[]>(normalizeIds(post.likes_count || []));
   const [comments, setComments] = useState<Comment[]>(post.comments || []);
   const [shares, setShares] = useState<number>(post.shares_count || 0);
   const [showComments, setShowComments] = useState(false);
   const [newComment, setNewComment] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isLoadingComments, setIsLoadingComments] = useState(false);
   const currentUser = useSelector((state: RootState) => state.user.value);

   // Load comments when clicking on comments button
   const loadComments = async () => {
       if (comments.length > 0) {
           setShowComments(!showComments);
           return;
       }
       
       setIsLoadingComments(true);
       try {
           const { data } = await api.get(`/api/post/comments/${post._id}`);
           if (data.success) {
               setComments(data.comments);
               setShowComments(true);
           }
       } catch (error) {
           console.error('Error fetching comments:', error);
           toast.error('Failed to load comments');
       } finally {
           setIsLoadingComments(false);
       }
   };

   // Handle like
   const handleLike = async () => {
       if (!currentUser?._id) {
           toast.error('Please log in to like posts');
           return;
       }
       try {
           const { data } = await api.post('/api/post/like', { postId: post._id });
           if (data.success) {
               setLikes(prev => {
                   if (prev.includes(currentUser._id)) {
                       return prev.filter(id => id !== currentUser._id);
                   } else {
                       return [...prev, currentUser._id];
                   }
               });
           } else {
               toast.error(data.message);
           }
       } catch (error: unknown) {
           toast.error((error as Error).message);
       }
   };

   // Handle comment
   const handleComment = async () => {
       if (!currentUser?._id) {
           toast.error('Please log in to comment');
           return;
       }
       if (!newComment.trim()) {
           toast.error('Please enter a comment');
           return;
       }
       
       setIsSubmitting(true);
       try {
           const { data } = await api.post('/api/post/comment', {
               postId: post._id,
               content: newComment.trim()
           });
           
           if (data.success) {
               // Add new comment to the list
               setComments(prev => [data.comment, ...prev]);
               setNewComment("");
               toast.success('Comment added!');
           } else {
               toast.error(data.message);
           }
       } catch (error: unknown) {
           toast.error((error as Error).message);
       } finally {
           setIsSubmitting(false);
       }
   };

   // Handle share
   const handleShare = async () => {
       if (!currentUser?._id) {
           toast.error('Please log in to share posts');
           return;
       }
       
       try {
           const { data } = await api.post('/api/post/share', { postId: post._id });
           if (data.success) {
               setShares(prev => prev + 1);
               toast.success('Post shared!');
           } else {
               toast.error(data.message);
           }
       } catch (error: unknown) {
           toast.error((error as Error).message);
       }
   };

   return (
       <div className="w-full max-w-2xl space-y-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:space-y-4 sm:p-4 dark:border-slate-700 dark:bg-slate-900">
           {/* User info */}
           <div onClick={() => safeUser._id && navigate('/profile/' + safeUser._id)} className="cursor-pointer">
               <div className="flex items-start justify-between gap-2">
                   <div className="flex min-w-0 items-center gap-3">
                       <img 
                           src={safeUser.profile_picture || '/default-avatar.png'} 
                           alt="User" 
                           className="size-11 shrink-0 rounded-full object-cover shadow sm:size-10" 
                       />
                       <div className="min-w-0">
                           <div className="flex items-center gap-1">
                               <span className="truncate font-semibold text-gray-900 dark:text-slate-100">{safeUser.full_name}</span>
                           </div>
                           <div className="truncate text-sm text-gray-500 dark:text-slate-400">
                               @{safeUser.username}
                           </div>
                       </div>
                   </div>
                   <div className="shrink-0 text-xs text-gray-400 dark:text-slate-500">
                       {moment(post.createdAt).fromNow()}
                   </div>
               </div>
           </div>
           
           {/* Content */}
           {safeContent && (
               <div 
                   className="whitespace-pre-line text-base text-gray-800 sm:text-sm dark:text-slate-200"
                   dangerouslySetInnerHTML={{__html: postWithHashTags}}
               />
           )}

           {/* Images */}
           {safeImageUrls.length > 0 && (
               <div className={`grid gap-2 ${safeImageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                   {safeImageUrls.map((img, index) => (
                       <img 
                           src={img} 
                           key={index} 
                           alt='' 
                           className={`w-full ${safeImageUrls.length === 1 ? 'max-h-[min(70vh,520px)] h-auto' : 'h-40 sm:h-48'} rounded-lg object-cover`}
                       />
                   ))}
               </div>
           )}

           {/* Actions */}
           <div className="flex items-center gap-1 border-t border-gray-200 pt-2 text-gray-600 dark:border-slate-700 dark:text-slate-300 sm:gap-4">
               <button 
                   type="button"
                   className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-xl px-2 text-sm hover:text-red-500 sm:min-h-0 sm:min-w-0 sm:px-0"
                   onClick={handleLike}
               >
                   <Heart 
                       className={`h-6 w-6 sm:h-5 sm:w-5 ${currentUser?._id && likes.includes(currentUser._id) ? 'fill-red-500 text-red-500' : ''}`} 
                   />
                   <span className="text-sm tabular-nums">{likes.length}</span>
               </button>
               
               <button 
                   type="button"
                   className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-xl px-2 text-sm hover:text-blue-500 sm:min-h-0 sm:min-w-0 sm:px-0"
                   onClick={loadComments}
                   disabled={isLoadingComments}
               >
                   <MessageCircle className="h-6 w-6 sm:h-5 sm:w-5" />
                   <span className="text-sm tabular-nums">{comments.length}</span>
               </button>
               
               <button 
                   type="button"
                   className="inline-flex min-h-11 min-w-11 items-center gap-1.5 rounded-xl px-2 text-sm hover:text-green-500 sm:min-h-0 sm:min-w-0 sm:px-0"
                   onClick={handleShare}
               >
                   <Share2 className="h-6 w-6 sm:h-5 sm:w-5" />
                   <span className="text-sm tabular-nums">{shares}</span>
               </button>
           </div>

           {/* Comments Section */}
           {showComments && (
               <div className="border-t border-gray-200 pt-4 space-y-4">
                   {/* Add Comment Input */}
                   <div className="flex gap-2">
                       <img 
                           src={currentUser?.profile_picture || '/default-avatar.png'} 
                           alt="Your avatar" 
                           className="w-8 h-8 rounded-full object-cover"
                       />
                       <div className="flex-1 flex gap-2">
                           <input
                               type="text"
                               value={newComment}
                               onChange={(e) => setNewComment(e.target.value)}
                               placeholder="Write a comment..."
                               className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                               onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                           />
                           <button
                               onClick={handleComment}
                               disabled={isSubmitting}
                               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                           >
                               {isSubmitting ? 'Posting...' : 'Post'}
                           </button>
                       </div>
                   </div>

                   {/* Comments List */}
                   <div className="space-y-3 max-h-96 overflow-y-auto">
                       {comments.length === 0 ? (
                           <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                       ) : (
                           comments.map((comment) => (
                               <div key={comment._id} className="flex gap-2">
                                   <img 
                                       src={comment.user?.profile_picture || '/default-avatar.png'} 
                                       alt={comment.user?.full_name} 
                                       className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                               onClick={() => comment.user?._id && navigate('/profile/' + comment.user._id)}
                                   />
                                   <div className="flex-1">
                                       <div className="bg-gray-50 rounded-lg p-2">
                                           <div className="flex items-center gap-2">
                                               <span 
                                                   className="font-semibold text-sm cursor-pointer hover:underline"
                                       onClick={() => comment.user?._id && navigate('/profile/' + comment.user._id)}
                                               >
                                                   {comment.user?.full_name || 'Unknown user'}
                                               </span>
                                               <span className="text-xs text-gray-500">
                                                   {moment(comment.createdAt).fromNow()}
                                               </span>
                                           </div>
                                           <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                                       </div>
                                   </div>
                               </div>
                           ))
                       )}
                   </div>
               </div>
           )}
       </div>
   );
};

export default PostCard;