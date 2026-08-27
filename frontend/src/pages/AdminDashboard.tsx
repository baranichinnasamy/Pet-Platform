import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/api';
import type { DashboardStats } from '../types';

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data.data as DashboardStats),
  });

  const { data: pendingListings } = useQuery({
    queryKey: ['pending-listings'],
    queryFn: () => adminApi.getPendingListings().then((r) => r.data.data),
  });

  if (isLoading) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  const stats = data!;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} icon="👥" />
        <StatCard label="Active Pets" value={stats.activePets} icon="🐾" />
        <StatCard label="Active Auctions" value={stats.activeAuctions} icon="🔨" />
        <StatCard label="Completed Auctions" value={stats.completedAuctions} icon="✅" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon="📦" />
        <StatCard label="Service Bookings" value={stats.totalBookings} icon="🏨" />
        <StatCard label="Pending Listings" value={stats.pendingListings} icon="📋" />
        <StatCard label="Revenue (₹)" value={Number(stats.revenue).toLocaleString('en-IN')} icon="💰" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-semibold mb-4">Pending Listing Approvals</h2>
        {!pendingListings?.length ? (
          <p className="text-gray-500 text-sm">No listings pending approval</p>
        ) : (
          <div className="space-y-3">
            {pendingListings.map((listing: { id: string; title: string; seller: { name: string } }) => (
              <div key={listing.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{listing.title}</p>
                  <p className="text-sm text-gray-500">Seller: {listing.seller.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
