import React, { ReactNode } from 'react';
import Navbar from './components/Navbar/Navbar';

interface LayoutProps {
  children: ReactNode;
  userRole: 'Customer' | 'Merchant' | null;
  isAuthenticated: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, userRole, isAuthenticated }) => {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-[#F2F2F2] shadow-xl">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
       {isAuthenticated && userRole && <Navbar userRole={userRole} />}
    </div>
  );
};

export default Layout;