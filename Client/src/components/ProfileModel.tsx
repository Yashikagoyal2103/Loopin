// import { useState } from 'react'
// import { Pencil } from 'lucide-react'
// import { useDispatch, useSelector } from 'react-redux'
// import type { AppDispatch, RootState } from '../app/store'
// import { updateUser } from '../features/user/userSlice';
// import toast from 'react-hot-toast';

// interface form {
//     username: string;
//     bio: string;
//     location: string;
//     profile_picture: File |null;
//     cover_photo: File | null;
//     full_name: string
// }

// interface Props {
//     setShowEdit: (show: boolean) => void;
// }

// const ProfileModel = ({setShowEdit}:Props) => {

//     const dispatch = useDispatch<AppDispatch>();
//     const user = useSelector((state: RootState) => state.user.value);

//     const [editForm, setEditForm] = useState<form>({
//     username: user?.username || '',      
//     bio: user?.bio || '',                
//     location: user?.location || '',      
//     profile_picture: null,
//     cover_photo: null,
//     full_name: user?.full_name || '',    
// });

//     const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         try{

//             const userData = new FormData();
//             const { full_name, username , bio, location, profile_picture , cover_photo } = editForm

//             userData.append('username', username);
//             userData.append('bio', bio);
//             userData.append('location',location);
//             userData.append('full_name', full_name);
//              if (profile_picture) {
//                 userData.append('profile_picture', profile_picture);
//             }
//             if (cover_photo) {
//                 userData.append('cover_photo', cover_photo);
//             }

//              console.log('Sending FormData:', {
//                 full_name,
//                 username,
//                 bio,
//                 location,
//                 hasProfilePic: !!profile_picture,
//                 hasCoverPhoto: !!cover_photo
//             });

//             // dispatch(updateUser({ userData }))
//             const result = await dispatch(updateUser({ userData })).unwrap();
            
//             if (result) {
//                 toast.success('Profile updated successfully!');
//                 setShowEdit(false);
//             }

//             // setShowEdit(false)
//         }catch(error :unknown){
//             toast.error((error as Error).message)
//         }
//     }
    


//   return (
//     <div className='fixed z-110 h-screen bg-black/50 overflow-y-scroll top-0 right-0 left-0 bottom-0'>
//         <div className='mx-auto max-w-2xl sm:py-6'>
//             <div className='bg-white rounded-lg shadow p-6'>
//                 <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>

//                 <form onSubmit={e=> toast.promise(
//                     handleSaveProfile(e), {loading :'Saving...'}
//                 )} className='space-y-4'>
//                     {/* Profile Picture */}
//                     <div className='flex flex-col items-start gap-3'>
//                         <label htmlFor="Profile_picture" className='block text-sm mb-1 text-gray-700 font-medium' >
//                             Profile Picture
//                             <input hidden type='file' accept="image/*" id="profile_picture" className='w-full p-3 border border-gray-200 rounded-lg'
//                             // onChange={(e) =>setEditForm({...editForm , profile_picture:e.target.files[0]})} 
//                             onChange={(e) => {
//                             if (e.target.files && e.target.files[0]) {
//                             setEditForm({ ...editForm, profile_picture: e.target.files[0] })
//                             }}} />

//                             <div className='group/profile relative'>
//                                 <img src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user?.profile_picture} 
//                                 alt='profile_picture' className='w-24 -24 rounded-full object-cover mt-2'/>

//                                 <div className='absolute hidden group-hover/profile:flex bg-black/20 rounded-full items-center justify-center top-0 botton-0 right-0 left-0'>
//                                     <Pencil className='text-white h-5 w-5'/>
//                                 </div>

//                             </div>
//                         </label>
//                     </div>

//                     {/* Cover Photo */}
//                     <div className='flex  flex-col items-start gap-3'>
//                         <label htmlFor='cover_photo' className='block text-sm font-medium text-gray-700 mb-1'>
//                             Cover Photo
//                             <input hidden type='file' accept="image/*" id="cover_photo" className='w-full p-3 border border-gray-200 rounded-lg'
//                             onChange={(e) => {
//                             if (e.target.files && e.target.files[0]) {
//                             setEditForm({ ...editForm, cover_photo: e.target.files[0] })
//                             }}} />
//                             <div className='group/cover relative'>
//                                 <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user?.cover_photo} 
//                                 alt='cover_photo' className='w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2'/>

//                                 <div className='absolute hidden group-hover/profile:flex bg-black/20 rounded-full items-center justify-center top-0 botton-0 right-0 left-0'>
//                                     <Pencil className='text-white h-5 w-5'/>
//                                 </div>
//                             </div>
                            
//                         </label>
//                     </div>

//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>
//                             Name
//                         </label>
//                         <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' 
//                         placeholder='Please enter your full name' value={editForm.full_name} 
//                         onChange={(e) => setEditForm({...editForm, full_name:e.target.value})} />
//                     </div>
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>
//                             Username
//                         </label>
//                         <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' 
//                         placeholder='Please enter your username' value={editForm.username} 
//                         onChange={(e) => setEditForm({...editForm, username:e.target.value})} />
//                     </div>
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>
//                             bio
//                         </label>
//                         <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' 
//                         placeholder='Please write a short bio' value={editForm.bio} 
//                         onChange={(e) => setEditForm({...editForm, bio:e.target.value})} />
//                     </div>
//                     <div>
//                         <label className='block text-sm font-medium text-gray-700 mb-1'>
//                             Location
//                         </label>
//                         <input type='text' className='w-full p-3 border border-gray-200 rounded-lg' 
//                         placeholder='Please enter your location' value={editForm.location} 
//                         onChange={(e) => setEditForm({...editForm, location:e.target.value})} />
//                     </div>

//                     <div className='flex justify-end space-x-3 pt-6'>
//                         <button onClick={()=> setShowEdit(false)} type='button' className='px-4 py-2 border border-gray-300 rounded-lg 
//                         text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer '>Cancel</button>
//                         <button type='submit' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg
//                         hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer'>Save Changes</button>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     </div>
//   )
// }

// export default ProfileModel

import { useState, useEffect } from 'react'
import { Pencil, X } from 'lucide-react'
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

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            if (previewProfile) URL.revokeObjectURL(previewProfile);
            if (previewCover) URL.revokeObjectURL(previewCover);
        };
    }, [previewProfile, previewCover]);

    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Profile picture must be less than 5MB');
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            
            setEditForm({ ...editForm, profile_picture: file });
            // Clean up old preview
            if (previewProfile) URL.revokeObjectURL(previewProfile);
            setPreviewProfile(URL.createObjectURL(file));
        }
    };

    const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Cover photo must be less than 10MB');
                return;
            }
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }
            
            setEditForm({ ...editForm, cover_photo: file });
            // Clean up old preview
            if (previewCover) URL.revokeObjectURL(previewCover);
            setPreviewCover(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            const userData = new FormData();
            const { full_name, username, bio, location, profile_picture, cover_photo } = editForm;

            // Append text fields
            userData.append('username', username);
            userData.append('bio', bio);
            userData.append('location', location);
            userData.append('full_name', full_name);
            
            // Append files only if they exist
            if (profile_picture) {
                userData.append('profile', profile_picture);
                console.log('Profile picture appended:', profile_picture.name, profile_picture.size);
            }
            if (cover_photo) {
                userData.append('cover', cover_photo);
                console.log('Cover photo appended:', cover_photo.name, cover_photo.size);
            }

            // Log all FormData entries for debugging
            console.log('FormData entries being sent:');
            for (const pair of userData.entries()) {
                if (pair[1] instanceof File) {
                    console.log(pair[0], 'File:', pair[1].name, pair[1].size, pair[1].type);
                } else {
                    console.log(pair[0], pair[1]);
                }
            }

            const result = await dispatch(updateUser({ userData })).unwrap();
            
            if (result) {
                toast.success('Profile updated successfully!');
                setShowEdit(false);
            }
        } catch (error: unknown) {
            console.error('Update error:', error);
            toast.error((error as Error)?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='fixed inset-0 z-50 bg-black/50 overflow-y-auto'>
            <div className='min-h-screen px-4 py-6 flex items-center justify-center'>
                <div className='bg-white rounded-lg shadow-xl max-w-2xl w-full p-6'>
                    <div className='flex justify-between items-center mb-6'>
                        <h1 className='text-2xl font-bold text-gray-900'>Edit Profile</h1>
                        <button title='Close'
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
                                    onChange={handleProfilePictureChange} 
                                />
                                <label 
                                    htmlFor="profile_picture_input"
                                    className='group relative block cursor-pointer'
                                >
                                    <img 
                                        src={previewProfile || user?.profile_picture || '/default-avatar.png'} 
                                        alt='profile_picture' 
                                        className='w-24 h-24 rounded-full object-cover border-2 border-gray-200'
                                        onError={(e) => {
                                            e.currentTarget.src = '/default-avatar.png';
                                        }}
                                    />
                                    <div className='absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                        <Pencil className='text-white h-5 w-5'/>
                                    </div>
                                </label>
                            </div>
                            {editForm.profile_picture && (
                                <p className='text-xs text-green-600'>
                                    New profile picture selected: {editForm.profile_picture.name}
                                </p>
                            )}
                        </div>

                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label className='block text-sm font-medium text-gray-700'>
                                Cover Photo
                            </label>
                            <div className='relative'>
                                <input 
                                    hidden 
                                    type='file' 
                                    accept="image/*" 
                                    id="cover_photo_input"
                                    onChange={handleCoverPhotoChange} 
                                />
                                <label 
                                    htmlFor="cover_photo_input"
                                    className='group relative block cursor-pointer'
                                >
                                    <img 
                                        src={previewCover || user?.cover_photo || '/default-cover.jpg'} 
                                        alt='cover_photo' 
                                        className='w-80 h-40 rounded-lg object-cover bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200'
                                        onError={(e) => {
                                            e.currentTarget.src = '/default-cover.jpg';
                                        }}
                                    />
                                    <div className='absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                        <Pencil className='text-white h-5 w-5'/>
                                    </div>
                                </label>
                            </div>
                            {editForm.cover_photo && (
                                <p className='text-xs text-green-600'>
                                    New cover photo selected: {editForm.cover_photo.name}
                                </p>
                            )}
                        </div>

                        {/* Rest of the form fields remain the same */}
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
    )
}

export default ProfileModel