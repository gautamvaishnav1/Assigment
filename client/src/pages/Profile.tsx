import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
      <div className="px-6 md:px-8 pt-16 pb-8 relative flex flex-col items-center md:items-start text-center md:text-left">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-white p-1 border-4 border-white shadow-lg absolute -top-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0">
          <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>

        {/* User Info */}
        <div className="w-full mt-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || 'User Profile'}</h1>
          <p className="text-gray-500 mb-6">{user?.email || 'user@example.com'}</p>

          <div className="border-t border-gray-100 pt-6">
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
