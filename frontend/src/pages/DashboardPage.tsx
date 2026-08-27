import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}</h1>
      <p className="text-gray-500 mb-8">
        Roles: {user.roles.join(', ')}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/pets?mine=true"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 transition"
        >
          <div className="text-2xl mb-2">🐕</div>
          <h3 className="font-semibold">My Pets</h3>
          <p className="text-sm text-gray-500 mt-1">Manage pet profiles and health records</p>
        </Link>

        <Link
          to="/auctions"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 transition"
        >
          <div className="text-2xl mb-2">🔨</div>
          <h3 className="font-semibold">Auctions</h3>
          <p className="text-sm text-gray-500 mt-1">Browse and bid on pets</p>
        </Link>

        <Link
          to="/marketplace"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 transition"
        >
          <div className="text-2xl mb-2">🛒</div>
          <h3 className="font-semibold">Marketplace</h3>
          <p className="text-sm text-gray-500 mt-1">Shop pet essentials</p>
        </Link>

        <Link
          to="/services"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 transition"
        >
          <div className="text-2xl mb-2">🏨</div>
          <h3 className="font-semibold">Services</h3>
          <p className="text-sm text-gray-500 mt-1">Book grooming, boarding & more</p>
        </Link>

        {user.roles.includes('ADMIN') && (
          <Link
            to="/admin"
            className="bg-white p-6 rounded-xl shadow-sm border border-primary-200 hover:border-primary-400 transition"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold text-primary-700">Admin Panel</h3>
            <p className="text-sm text-gray-500 mt-1">Platform management & analytics</p>
          </Link>
        )}
      </div>
    </div>
  );
}
