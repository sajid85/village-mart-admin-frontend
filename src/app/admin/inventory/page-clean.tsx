'use client';

import { useState, useEffect } from 'react';

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Inventory page loaded');
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Loading Inventory...</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Inventory Management</h1>
      <p className="text-gray-600">Clean inventory page is working! Now I'll add full functionality.</p>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Page Status</h2>
        <p className="text-green-600">✅ Component is rendering successfully!</p>
        <p>Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
