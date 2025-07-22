import React from 'react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-[#F2F2F2] shadow-xl">
      <header className="px-4 py-3 bg-blue-600 text-white flex items-center justify-center text-lg font-semibold h-14 relative">
        Iris Bitcoin Scanner
      </header>
      
      <main className="flex-1 p-4 overflow-y-auto bg-gray-200">
        {children}
      </main>

      <div className="px-4 py-2 bg-slate-100 text-xs text-slate-500 text-center">
        Powered by Internet Computer
      </div>
    </div>
  );
};

export default Layout;