// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { UserIcon, MailIcon, PhoneIcon, BuildingOfficeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { ErrorMessage } from '@hookform/error-message';
import { toast } from 'react-hot-toast';

// Form validation schema
const profileSchema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  phone: yup
    .string()
    .matches(
      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      'Please enter a valid phone number'
    )
    .nullable(),
  company: yup.string().nullable(),
  jobTitle: yup.string().nullable(),
});

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setError: setFormError,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
    },
  });

  // Load user data into form
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        company: currentUser.company || '',
        jobTitle: currentUser.jobTitle || '',
      });
      
      if (currentUser.avatar) {
        setAvatarPreview(currentUser.avatar);
      }
    }
  }, [currentUser, reset]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or GIF)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const onSubmit = async (data) => {
    if (!isDirty && !avatarFile) {
      toast('No changes detected', { icon: 'ℹ️' });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Only append changed fields
      if (data.name !== currentUser.name) formData.append('name', data.name);
      if (data.email !== currentUser.email) formData.append('email', data.email);
      if (data.phone !== currentUser.phone) formData.append('phone', data.phone);
      if (data.company !== currentUser.company) formData.append('company', data.company);
      if (data.jobTitle !== currentUser.jobTitle) formData.append('jobTitle', data.jobTitle);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { success, error } = await updateProfile(formData);
      
      if (success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setAvatarFile(null);
      } else {
        toast.error(error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      company: currentUser?.company || '',
      jobTitle: currentUser?.jobTitle || '',
    });
    setAvatarPreview(currentUser?.avatar || null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Profile</h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-200 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading || (!isDirty && !avatarFile)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    (isLoading || (!isDirty && !avatarFile)) ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full bg-gray-700 overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-600 text-gray-300">
                        <UserIcon className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer p-2 bg-gray-800 bg-opacity-80 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <p className="mt-2 text-xs text-gray-400">
                    Click on the avatar to upload a new photo (max 2MB)
                  </p>
                )}
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      disabled={!isEditing}
                      className={`bg-gray-700 text-white border ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 rounded-md ${
                        !isEditing ? 'bg-gray-700/50 cursor-not-allowed' : ''
                      }`}
                      {...register('name')}
                    />
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="name"
                    render={({ message }) => (
                      <p className="mt-1 text-sm text-red-400">{message}</p>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MailIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      disabled={!isEditing}
                      className={`bg-gray-700 text-white border ${
                        errors.email ? 'border-red-500' : 'border-gray-600'
                      } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 rounded-md ${
                        !isEditing ? 'bg-gray-700/50 cursor-not-allowed' : ''
                      }`}
                      {...register('email')}
                    />
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="email"
                    render={({ message }) => (
                      <p className="mt-1 text-sm text-red-400">{message}</p>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PhoneIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      disabled={!isEditing}
                      className={`bg-gray-700 text-white border ${
                        errors.phone ? 'border-red-500' : 'border-gray-600'
                      } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 rounded-md ${
                        !isEditing ? 'bg-gray-700/50 cursor-not-allowed' : ''
                      }`}
                      placeholder="(123) 456-7890"
                      {...register('phone')}
                    />
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="phone"
                    render={({ message }) => (
                      <p className="mt-1 text-sm text-red-400">{message}</p>
                    )}
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="company" className="block text-sm font-medium text-gray-300">
                    Company
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingOfficeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      id="company"
                      disabled={!isEditing}
                      className={`bg-gray-700 text-white border ${
                        errors.company ? 'border-red-500' : 'border-gray-600'
                      } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 rounded-md ${
                        !isEditing ? 'bg-gray-700/50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your company"
                      {...register('company')}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-300">
                    Job title
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdentificationIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      id="jobTitle"
                      disabled={!isEditing}
                      className={`bg-gray-700 text-white border ${
                        errors.jobTitle ? 'border-red-500' : 'border-gray-600'
                      } focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 rounded-md ${
                        !isEditing ? 'bg-gray-700/50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Your job title"
                      {...register('jobTitle')}
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="pt-5 border-t border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-white">Account Information</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Manage your account settings and security preferences.
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Email verified</h4>
                      <p className="text-sm text-gray-400">
                        {currentUser.emailVerified
                          ? 'Your email is verified.'
                          : 'Please verify your email address.'}
                      </p>
                    </div>
                    {!currentUser.emailVerified && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Resend Verification
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Two-factor authentication</h4>
                      <p className="text-sm text-gray-400">
                        {currentUser.twoFactorEnabled
                          ? 'Two-factor authentication is enabled.'
                          : 'Add an extra layer of security.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      {currentUser.twoFactorEnabled ? 'Manage' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-5 border-t border-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-red-400">Danger Zone</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    These actions are irreversible. Proceed with caution.
                  </p>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-300">Delete account</h4>
                      <p className="text-sm text-gray-400">
                        Permanently delete your account and all associated data.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
