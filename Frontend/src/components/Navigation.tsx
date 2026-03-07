import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Activity, Droplets, Truck, LogOut } from 'lucide-react';

// Added 'default' keyword here
export default function Navigation() {
  const { role, logout } = useAuth();
  const location = useLocation();

  const roleLinks: Record<string, { name: string; path: string; icon: any }[]> = {
    MCE_COMMANDER: [{ name: 'War Room', path: '/war-room', icon: Activity }],
    HOSPITAL_ADMIN: [{ name: 'Overview', path: '/hospital/dashboard', icon: LayoutDashboard }],
    COURIER: [{ name: 'Deliveries', path: '/courier/dashboard', icon: Truck }],
    BANK_ADMIN: [{ name: 'Inventory', path: '/bloodbank/dashboard', icon: Droplets }],
  };

  const links = role ? roleLinks[role] || [] : [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      <div className="p-6 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tighter italic">
          Hemo<span className="text-rose-500">Globe.</span>
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} /> 
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={logout} 
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-medium"
        >
          <LogOut size={20} /> 
          Sign Out
        </button>
      </div>
    </aside>
  );
}