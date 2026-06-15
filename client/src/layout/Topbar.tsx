import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/dashboard';

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 bg-gradient-to-r from-[#fff5f5] via-[#fffae6] to-[#ebf4ff]">
      {/* Left - Breadcrumb & Search */}
      <div className="flex items-center gap-4 md:gap-6">
        <button onClick={onMenuClick} className="md:hidden text-gray-500 hover:text-gray-700">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          {isHome ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          ) : (
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
          )}
          <span className="text-gray-700">{isHome ? 'Home' : 'Products'}</span>
        </div>

        {!isHome && (

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-72">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Services, Products"
                className="bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400 w-full"
              />
            </div>
        )}
      </div>


      {/* Right - User avatar */}
      <div className="flex items-center gap-2 cursor-pointer ml-auto" onClick={() => navigate('/profile')}>
        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
          <img src="/avatar.png" alt="Avatar" className="w-full h-full object-cover" onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E";
          }} />
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </header>
  );
};

export default Topbar;
