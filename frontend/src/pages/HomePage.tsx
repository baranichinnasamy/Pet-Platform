import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              Your Pet&apos;s Complete Lifecycle Platform
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              Discover pets, participate in live auctions, shop essentials, book grooming & boarding,
              and track vaccinations — all in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              {user ? (
                <>
                  <Link
                    to="/pets"
                    className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition"
                  >
                    My Pets
                  </Link>
                  <Link
                    to="/auctions"
                    className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                  >
                    Browse Auctions
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">Everything Your Pet Needs</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '🔨', title: 'Live Auctions', desc: 'Real-time bidding on pets with secure transactions' },
            { icon: '🛒', title: 'Marketplace', desc: 'Food, toys, beds, and grooming essentials' },
            { icon: '🏨', title: 'Pet Services', desc: 'Boarding, daycare, grooming, and training' },
            { icon: '💉', title: 'Health Tracking', desc: 'Vaccination records and due-date reminders' },
          ].map((feature) => (
            <div key={feature.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
