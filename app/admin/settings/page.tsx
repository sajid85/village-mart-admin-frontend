'use client';

import React, { useState, useEffect } from 'react';

interface SiteAppearanceSettings {
  themeMode: 'light' | 'dark';
}

interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteAppearanceSettings>({
    themeMode: 'light',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings/appearance', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch settings with status:', response.status);
        setSettings({ themeMode: 'light' });
        return;
      }

      const result: ApiResponse<SiteAppearanceSettings> = await response.json();
      if (result.data && (result.data.themeMode === 'light' || result.data.themeMode === 'dark')) {
        setSettings({ themeMode: result.data.themeMode });
      } else {
        setSettings({ themeMode: 'light' });
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setSettings({ themeMode: 'light' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ themeMode: e.target.value as 'light' | 'dark' });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(null);

    try {
      const response = await fetch('/api/admin/settings/appearance', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ themeMode: settings.themeMode }),
      });

      if (!response.ok) {
        console.error('Failed to save settings with status:', response.status);
        setSaveSuccess('Failed to save settings.');
      } else {
        const result: ApiResponse<SiteAppearanceSettings> = await response.json();
        if (result.data && (result.data.themeMode === 'light' || result.data.themeMode === 'dark')) {
          setSettings({ themeMode: result.data.themeMode });
          setSaveSuccess('Settings saved successfully!');
        } else {
          setSaveSuccess('Settings saved, but received unexpected data.');
        }
      }

      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveSuccess('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Theme Settings</h1>

      {saveSuccess && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{saveSuccess}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-white shadow overflow-hidden sm:rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Theme Mode</label>
          <div className="mt-1 flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="themeMode"
                value="light"
                checked={settings.themeMode === 'light'}
                onChange={handleInputChange}
                className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Light Mode</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="themeMode"
                value="dark"
                checked={settings.themeMode === 'dark'}
                onChange={handleInputChange}
                className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Dark Mode</span>
            </label>
          </div>
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 