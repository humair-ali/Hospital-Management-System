'use client';
import { useState, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { FaCamera, FaSpinner, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function ProfileImageUpload({ size = 'lg', showEditButton = true }) {
    const { user, updateProfileImage, updateUser } = useUser();
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);
    
    const sizeClasses = {
        sm: 'h-10 w-10',
        md: 'h-16 w-16',
        lg: 'h-24 w-24'
    };
    
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file (JPG, PNG, GIF, etc.)');
            return;
        }
        
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }
        
        setUploading(true);
        setSuccess(false);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Authentication required. Please log in again.');
                setUploading(false);
                return;
            }
            
            const formData = new FormData();
            formData.append('profile_image', file);
            
            const response = await fetch('http://localhost:5000/api/profile/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                updateProfileImage(data.url);
                if (data.user) updateUser(data.user);
                setSuccess(true);
                toast.success('Profile picture updated successfully!');
                setTimeout(() => setSuccess(false), 2000);
                
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                const errorMsg = data.error || 'Failed to upload image';
                toast.error(errorMsg);
                console.error('Upload error:', data);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed: ' + (error.message || 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };
    return (
        <div className="relative group">
            {}
            <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[3px] shadow-lg`}>
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user?.profile_image ? (
                        <img
                            src={user.profile_image}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-blue-600 font-bold text-xl">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    )}
                </div>
            </div>
            {}
            {showEditButton && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                    {uploading ? (
                        <FaSpinner className="animate-spin text-white text-xl" />
                    ) : success ? (
                        <FaCheck className="text-green-400 text-xl" />
                    ) : (
                        <FaCamera className="text-white text-xl" />
                    )}
                </button>
            )}
            {}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}