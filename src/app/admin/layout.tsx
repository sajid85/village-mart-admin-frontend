'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Products', href: '/admin/products', icon: '🏷️' },
  { name: 'Categories', href: '/admin/categories', icon: '🗂️' },
  { name: 'Orders', href: '/admin/orders', icon: '📋' },
  { name: 'Customers', href: '/admin/customers', icon: '👥' },
  { name: 'Inventory', href: '/admin/inventory', icon: '📦' },
  { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, keep sidebar open by default, on mobile keep it closed
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isSidebarOpen]);

  useEffect(() => {
    const checkAdminAccess = () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!token || !userStr) {
          router.push('/login');
          return;
        }
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Admin access check failed:', error);
        router.push('/login');
      }
    };
    checkAdminAccess();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isSidebarOpen ? (isMobile ? 'translate-x-0' : 'w-64') : (isMobile ? '-translate-x-full' : 'w-16')}
        ${isMobile ? 'w-64 h-full z-50' : ''}
        bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col
        ${isMobile ? '' : 'min-h-screen'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center">
            <div className="text-xl lg:text-2xl font-bold text-green-600">
              {isSidebarOpen ? 'Village Mart' : 'VM'}
            </div>
            {isSidebarOpen && (
              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                Admin Panel
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-green-100 to-blue-100 text-green-700 shadow-sm border-l-4 border-green-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }`}
                  >
                    <span className={`text-lg transition-transform duration-200 ${!isSidebarOpen ? 'scale-110' : ''} ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && (
                      <span className="ml-3 transition-all duration-200">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">🚪</span>
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 lg:p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            
            {/* Breadcrumb or page title for mobile */}
            <div className="lg:hidden">
              <h1 className="text-lg font-semibold text-gray-900 capitalize">
                {pathname?.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
            
            <div className="hidden lg:block"></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 