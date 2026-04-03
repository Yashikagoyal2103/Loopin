import { useState, useEffect } from 'react'
import { Pencil, X, Clipboard } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '../app/store'
import { updateUser } from '../features/user/userSlice';
import toast from 'react-hot-toast';

interface form {
    username: string;
    bio: string;
    location: string;
    profile_picture: File | null;
    cover_photo: File | null;
    full_name: string
}

interface Props {
    setShowEdit: (show: boolean) => void;
}

const ProfileModel = ({ setShowEdit }: Props) => {

    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.user.value);

    const [editForm, setEditForm] = useState<form>({
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        profile_picture: null,
        cover_photo: null,
        full_name: user?.full_name || '',
    });

    const [previewProfile, setPreviewProfile] = useState<string | null>(null);
    const [previewCover, setPreviewCover] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageError, setImageError] = useState({ profile: false, cover: false });
    const [pasteTarget, setPasteTarget] = useState<'profile' | 'cover' | null>(null);
    const [isDragging, setIsDragging] = useState({ profile: false, cover: false });

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            if (previewProfile) URL.revokeObjectURL(previewProfile);
            if (previewCover) URL.revokeObjectURL(previewCover);
        };
    }, [previewProfile, previewCover]);

    // Handle paste event
    useEffect(() => {
        if (pasteTarget) {
            const handlePaste = async (e: ClipboardEvent) => {
                e.preventDefault();
                const items = e.clipboardData?.items;
                
                if (!items) {
                    toast.error('Clipboard is empty');
                    setPasteTarget(null);
                    return;
                }
                
                let imageFound = false;
                
                for (const item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        if (file) {
                            imageFound = true;
                            if (pasteTarget === 'profile') {
                                await handleProfilePictureChange(file);
                                toast.success('Profile picture pasted successfully!');
                            } else {
                                handleCoverPhotoChange(file);
                                toast.success('Cover photo pasted successfully!');
                            }
                            break;
                        }
                    }
                }
                
                if (!imageFound) {
                    toast.error('No image found in clipboard. Please copy an image first.');
                }
                
                setPasteTarget(null);
            };
            
            document.addEventListener('paste', handlePaste);
            return () => {
                document.removeEventListener('paste', handlePaste);
            };
        }
    }, [pasteTarget]);

    // Function to resize and crop image to perfect circle
    const processProfileImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const targetSize = 200;
                canvas.width = targetSize;
                canvas.height = targetSize;
                
                if (ctx) {
                    const size = Math.min(img.width, img.height);
                    const sourceX = (img.width - size) / 2;
                    const sourceY = (img.height - size) / 2;
                    
                    ctx.save();
                    ctx.clearRect(0, 0, targetSize, targetSize);
                    ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, targetSize, targetSize);
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.beginPath();
                    ctx.arc(targetSize / 2, targetSize / 2, targetSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    
                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(url);
                        if (blob) {
                            const processedFile = new File([blob], 'profile_circle.png', { type: 'image/png' });
                            resolve(processedFile);
                        } else {
                            reject(new Error('Failed to process image'));
                        }
                    }, 'image/png', 1);
                } else {
                    reject(new Error('Canvas context not available'));
                }
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    };

    const handleProfilePictureChange = async (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Profile picture must be less than 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        
        try {
            toast.loading('Processing image...', { id: 'processing' });
            const processedFile = await processProfileImage(file);
            setEditForm({ ...editForm, profile_picture: processedFile });
            if (previewProfile) URL.revokeObjectURL(previewProfile);
            setPreviewProfile(URL.createObjectURL(processedFile));
            setImageError(prev => ({ ...prev, profile: false }));
            toast.success('Image processed!', { id: 'processing' });
        } catch (error : unknown) {
            toast.error('Failed to process image', { id: 'processing' });
            console.error('Image processing error:', error);
        }
    };

    const handleCoverPhotoChange = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Cover photo must be less than 10MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        
        setEditForm({ ...editForm, cover_photo: file });
        if (previewCover) URL.revokeObjectURL(previewCover);
        setPreviewCover(URL.createObjectURL(file));
        setImageError(prev => ({ ...prev, cover: false }));
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent, type: 'profile' | 'cover') => {
        e.preventDefault();
        setIsDragging(prev => ({ ...prev, [type]: true }));
    };

    const handleDragLeave = (e: React.DragEvent, type: 'profile' | 'cover') => {
        e.preventDefault();
        setIsDragging(prev => ({ ...prev, [type]: false }));
    };

    const handleDrop = (e: React.DragEvent, type: 'profile' | 'cover') => {
        e.preventDefault();
        setIsDragging(prev => ({ ...prev, [type]: false }));
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            if (type === 'profile') {
                handleProfilePictureChange(file);
            } else {
                handleCoverPhotoChange(file);
            }
            toast.success('Image dropped successfully!');
        } else {
            toast.error('Please drop an image file');
        }
    };

    const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            const userData = new FormData();
            const { full_name, username, bio, location, profile_picture, cover_photo } = editForm;

            userData.append('username', username);
            userData.append('bio', bio);
            userData.append('location', location);
            userData.append('full_name', full_name);
            
            if (profile_picture) {
                userData.append('profile', profile_picture);
            }
            if (cover_photo) {
                userData.append('cover', cover_photo);
            }

            const result = await dispatch(updateUser({ userData })).unwrap();
            
            if (result) {
                toast.success('Profile updated successfully!');
                setShowEdit(false);
            }
        } catch (error: unknown) {
            toast.error((error as Error)?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getImageSrc = (type: 'profile' | 'cover') => {
        if (type === 'profile') {
            if (previewProfile) return previewProfile;
            if (user?.profile_picture && !imageError.profile) return user.profile_picture;
            return '/default-avatar.png';
        } else {
            if (previewCover) return previewCover;
            if (user?.cover_photo && !imageError.cover) return user.cover_photo;
            return '/default-cover.jpg';
        }
    };

    return (
        <div className='fixed inset-0 z-50 bg-black/50 overflow-y-auto'>
            <div className='min-h-screen px-4 py-6 flex items-center justify-center'>
                <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h1 className='text-2xl font-bold text-gray-900'>Edit Profile</h1>
                        <button title="close"
                            onClick={() => setShowEdit(false)}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                        >
                            <X className='w-5 h-5 text-gray-500' />
                        </button>
                    </div>

                    <form onSubmit={handleSaveProfile} className='space-y-4'>
                        {/* Profile Picture */}
                        <div className='flex flex-col items-start gap-3'>
                            <label className='block text-sm font-medium text-gray-700'>
                                Profile Picture
                            </label>
                            <div className='relative'>
                                <input 
                                    hidden 
                                    type='file' 
                                    accept="image/*" 
                                    id="profile_picture_input"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleProfilePictureChange(e.target.files[0]);
                                        }
                                    }}
                                />
                                <div
                                    className={`group relative block cursor-pointer transition-all ${
                                        isDragging.profile ? 'ring-2 ring-indigo-500 scale-105' : ''
                                    }`}
                                    onDragOver={(e) => handleDragOver(e, 'profile')}
                                    onDragLeave={(e) => handleDragLeave(e, 'profile')}
                                    onDrop={(e) => handleDrop(e, 'profile')}
                                >
                                    <div className='w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100'>
                                        <img 
                                            src={getImageSrc('profile')}
                                            alt='profile_picture' 
                                            className='w-full h-full object-cover'
                                            onError={() => setImageError(prev => ({ ...prev, profile: true }))}
                                        />
                                    </div>
                                    <div className='absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                                        <Pencil className='text-white h-5 w-5'/>
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-2 mt-2'>
                                <label htmlFor="profile_picture_input" className='text-xs bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200'>
                                    📁 Upload
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setPasteTarget('profile')}
                                    className='text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 flex items-center gap-1'
                                >
                                    <Clipboard className='w-3 h-3' />
                                    📋 Paste Image
                                </button>
                            </div>
                            {pasteTarget === 'profile' && (
                                <p className='text-xs text-indigo-600 animate-pulse'>
                                    ⏐ Press Ctrl+V (or Cmd+V) to paste your copied image
                                </p>
                            )}
                        </div>

                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label className='block text-sm font-medium text-gray-700'>
                                Cover Photo
                            </label>
                            <div className='relative w-full'>
                                <input 
                                    hidden 
                                    type='file' 
                                    accept="image/*" 
                                    id="cover_photo_input"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleCoverPhotoChange(e.target.files[0]);
                                        }
                                    }}
                                />
                                <div
                                    className={`group relative block cursor-pointer transition-all w-full ${
                                        isDragging.cover ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                                    onDragOver={(e) => handleDragOver(e, 'cover')}
                                    onDragLeave={(e) => handleDragLeave(e, 'cover')}
                                    onDrop={(e) => handleDrop(e, 'cover')}
                                >
                                    <div className='w-full h-32 rounded-lg overflow-hidden bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'>
                                        <img 
                                            src={getImageSrc('cover')}
                                            alt='cover_photo' 
                                            className='w-full h-full object-cover'
                                            onError={() => setImageError(prev => ({ ...prev, cover: true }))}
                                        />
                                    </div>
                                    <div className='absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                                        <Pencil className='text-white h-5 w-5'/>
                                        <span className='text-white text-xs'>Click, drag, or paste</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex gap-2 mt-2'>
                                <label htmlFor="cover_photo_input" className='text-xs bg-gray-100 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-200'>
                                    📁 Upload
                                </label>
                                <button 
                                    type="button"
                                    onClick={() => setPasteTarget('cover')}
                                    className='text-xs bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 flex items-center gap-1'
                                >
                                    <Clipboard className='w-3 h-3' />
                                    📋 Paste Image
                                </button>
                            </div>
                            {pasteTarget === 'cover' && (
                                <p className='text-xs text-indigo-600 animate-pulse'>
                                    ⏐ Press Ctrl+V (or Cmd+V) to paste your copied image
                                </p>
                            )}
                            {editForm.cover_photo && (
                                <p className='text-xs text-green-600'>
                                    ✓ New cover photo selected: {editForm.cover_photo.name}
                                </p>
                            )}
                        </div>

                        {/* Rest of the form fields */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Full Name
                            </label>
                            <input 
                                type='text' 
                                className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                                placeholder='Please enter your full name' 
                                value={editForm.full_name} 
                                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} 
                                required
                            />
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Username
                            </label>
                            <input 
                                type='text' 
                                className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                                placeholder='Please enter your username' 
                                value={editForm.username} 
                                onChange={(e) => setEditForm({...editForm, username: e.target.value})} 
                                required
                            />
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Bio
                            </label>
                            <textarea 
                                rows={3} 
                                className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                                placeholder='Please write a short bio' 
                                value={editForm.bio} 
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                            />
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Location
                            </label>
                            <input 
                                type='text' 
                                className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent' 
                                placeholder='Please enter your location' 
                                value={editForm.location} 
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
                            />
                        </div>

                        <div className='flex justify-end space-x-3 pt-6'>
                            <button 
                                onClick={() => setShowEdit(false)} 
                                type='button' 
                                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer'
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type='submit' 
                                className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModel;
