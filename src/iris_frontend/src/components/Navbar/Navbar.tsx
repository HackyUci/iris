import { Home, User, QrCode, Scan } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ userRole }: { userRole: 'Customer' | 'Merchant' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/merchant' || path === '/customer') return 'home';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const handleHomeClick = () => {
    if (userRole === 'Merchant') {
      navigate('/merchant');
    } else {
      navigate('/customer');
    }
  };

  const handleCenterButtonClick = () => {
    if (userRole === 'Merchant') {
      navigate('/generate');
    } else {
      navigate('/scan');
    }
  };

  const handleProfileClick = () => {
    if (userRole === 'Merchant') {
      navigate('/merchant-profile');
    } else {
      navigate('/customer-profile');
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <button
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
            getActiveTab() === 'home' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1 font-medium">Home</span>
        </button>

        <button
          onClick={handleCenterButtonClick}
          className="relative flex flex-col items-center justify-center p-4 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          {userRole === 'Merchant' ? (
            <>
              <QrCode size={28} className="text-white" />
              <span className="text-xs mt-1 font-semibold text-white">Generate</span>
            </>
          ) : (
            <>
              <Scan size={28} className="text-white" />
              <span className="text-xs mt-1 font-semibold text-white">Scan</span>
            </>
          )}
        </button>

        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
            getActiveTab() === 'profile' ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1 font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;