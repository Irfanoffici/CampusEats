'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Edit3, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      fetchProfile()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          fullName: data.fullName || '',
          username: data.username || '',
          phoneNumber: data.phoneNumber || '',
        })
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
        toast.success('Profile updated successfully')
        
        // Update session with new profile data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedProfile.fullName,
          }
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <X className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Profile not found</h3>
          <p className="mt-1 text-gray-500">There was an error loading your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.fullName?.charAt(0) || 'U'}
                </div>
                <div className="ml-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profile.fullName || 'User'}
                  </h1>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.username && (
                    <p className="text-gray-500">@{profile.username}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => setEditing(!editing)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  {editing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.fullName || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile.username ? `@${profile.username}` : 'Not set'}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phoneNumber || 'Not set'}</p>
                  )}
                </div>
                
                {profile.role === 'STUDENT' && profile.rfidNumber && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RFID Number
                    </label>
                    <p className="text-gray-900 font-mono">{profile.rfidNumber}</p>
                  </div>
                )}
                
                {profile.role === 'STUDENT' && profile.rfidBalance !== null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RFID Balance
                    </label>
                    <p className="text-gray-900">₹{profile.rfidBalance.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              {editing && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}