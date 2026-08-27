import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="font-bold text-xl text-primary-700">PetLife</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/pets" className="text-gray-600 hover:text-primary-600 transition">
                Pets
              </Link>
              <Link to="/auctions" className="text-gray-600 hover:text-primary-600 transition">
                Auctions
              </Link>
              <Link to="/marketplace" className="text-gray-600 hover:text-primary-600 transition">
                Marketplace
              </Link>
              <Link to="/services" className="text-gray-600 hover:text-primary-600 transition">
                Services
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {hasRole('ADMIN') && (
                    <Link
                      to="/admin"
                      className="text-sm px-3 py-1.5 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition"
                    >
                      Admin
                    </Link>
                  )}
                  <Link to="/dashboard" className="text-sm text-gray-600 hover:text-primary-600">
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">Pet Auction & Pet Care Platform — Discover → Own → Care → Thrive</p>
        </div>
      </footer>
    </div>
  );
}
