'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';

export default function SettingsPage() {
  const [isLoading] = useState(false);

  // Admin info state
  const [admin, setAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : { firstName: '', lastName: '', email: '' };
    }
    return { firstName: '', lastName: '', email: '' };
  });
  const [adminEdit, setAdminEdit] = useState(admin);
  const [adminSaveStatus, setAdminSaveStatus] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);
  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwStatus, setPwStatus] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSaveStatus(null);
    setAdminError(null);
    try {
      const res = await api.patch('/admin/profile', {
        firstName: adminEdit.firstName,
        lastName: adminEdit.lastName,
        email: adminEdit.email,
      });
      setAdmin(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setAdminSaveStatus('Profile updated successfully!');
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    setPwError(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      await api.patch('/admin/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwStatus('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full text-green-600 text-2xl font-bold">
        {/* A funny vegetable-themed loading indicator */}
        🥕 Loading... Peeling Back Layers 🧅
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      {/* Admin Info Card */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Info</h2>
        <form onSubmit={handleAdminSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500" value={adminEdit.firstName} onChange={e => setAdminEdit((a: typeof adminEdit) => ({ ...a, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500" value={adminEdit.lastName} onChange={e => setAdminEdit((a: typeof adminEdit) => ({ ...a, lastName: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500" value={adminEdit.email} onChange={e => setAdminEdit((a: typeof adminEdit) => ({ ...a, email: e.target.value }))} required />
            </div>
          </div>
          {adminSaveStatus && <div className="text-green-700 text-sm">{adminSaveStatus}</div>}
          {adminError && <div className="text-red-700 text-sm">{adminError}</div>}
          <div className="flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Save Profile</button>
          </div>
        </form>
      </div>
      {/* Change Password Card */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-900 placeholder-gray-500" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
            </div>
          </div>
          {pwStatus && <div className="text-green-700 text-sm">{pwStatus}</div>}
          {pwError && <div className="text-red-700 text-sm">{pwError}</div>}
          <div className="flex justify-end">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Change Password</button>
          </div>
        </form>
      </div>
    </div>
  );
} 