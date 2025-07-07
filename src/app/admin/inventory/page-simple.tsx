'use client';

import { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Inventory page component mounted');
    setLoading(false);
  }, []);

  console.log('Inventory page rendering, loading:', loading, 'error:', error);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Loading Inventory...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>
      <p className="text-gray-600">This is a simplified inventory page for debugging.</p>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <p>Component is rendering successfully!</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
