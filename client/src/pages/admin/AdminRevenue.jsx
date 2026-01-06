import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { TrendingUp, Users, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AdminRevenue = () => {
    const { token } = useContext(AuthContext);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeUsers: [],
        inactiveUsers: [],
        newUsersLastWeek: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Parallel data fetching for efficiency
            const [usersRes, paymentsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/auth/users`, { headers: { 'x-auth-token': token } }),
                axios.get(`${API_BASE_URL}/payment/admin/history`, { headers: { 'x-auth-token': token } })
            ]);

            const users = usersRes.data;
            const payments = paymentsRes.data;

            // Calculate Revenue
            const revenue = payments
                .filter(p => p.status === 'approved')
                .reduce((sum, p) => {
                    // Remove non-numeric chars (like ₹ or text) except dot
                    const cleanAmount = String(p.amount).replace(/[^0-9.]/g, '');
                    return sum + (Number(cleanAmount) || 0);
                }, 0);

            // Calculate Active/Inactive Lists
            const now = new Date();
            const activeList = users.filter(u => u.subscriptionEnd && new Date(u.subscriptionEnd) > now);
            const inactiveList = users.filter(u => !u.subscriptionEnd || new Date(u.subscriptionEnd) <= now);

            // Calculate New Users (Last 7 Days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const newUsers = users.filter(u => new Date(u.createdAt) > oneWeekAgo);

            setStats({
                totalRevenue: revenue,
                activeUsers: activeList,
                inactiveUsers: inactiveList,
                newUsersLastWeek: newUsers
            });
            setLoading(false);

        } catch (err) {
            console.error("Error fetching admin stats", err);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Stats...</div>;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121212] border border-gray-800 p-6 rounded-lg shadow-xl relative overflow-hidden group h-96 flex flex-col justify-between">
                    <div>
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={64} className="text-[#d4af37]" />
                        </div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Revenue</h3>
                        <p className="text-3xl font-bold text-[#d4af37]">₹ {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Active Users Card with List */}
                <div className="bg-[#121212] border border-gray-800 p-6 rounded-lg shadow-xl relative overflow-hidden group h-96 flex flex-col">
                    <div className="flex-shrink-0 mb-4">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} className="text-green-500" />
                        </div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Active Subscribers</h3>
                        <p className="text-3xl font-bold text-white">{stats.activeUsers.length}</p>
                        <p className="text-xs text-green-500">Currently Active</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent border-t border-gray-800 pt-3">
                        {stats.activeUsers.length === 0 ? (
                            <p className="text-gray-600 text-xs italic">No active users.</p>
                        ) : (
                            stats.activeUsers.map(u => (
                                <div key={u._id} className="text-xs bg-green-900/10 p-2 rounded border border-green-900/20 text-gray-300 flex justify-between items-center hover:bg-green-900/20 transition-colors">
                                    <span className="font-bold">{u.username}</span>
                                    <span className="text-[10px] text-green-600 font-mono">{new Date(u.subscriptionEnd).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Inactive Users Card with List */}
                <div className="bg-[#121212] border border-gray-800 p-6 rounded-lg shadow-xl relative overflow-hidden group h-96 flex flex-col">
                    <div className="flex-shrink-0 mb-4">
                        <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} className="text-gray-500" />
                        </div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Inactive Users</h3>
                        <p className="text-3xl font-bold text-gray-400">{stats.inactiveUsers.length}</p>
                        <p className="text-xs text-gray-600">Free / Expired</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent border-t border-gray-800 pt-3">
                        {stats.inactiveUsers.length === 0 ? (
                            <p className="text-gray-600 text-xs italic">No inactive users.</p>
                        ) : (
                            stats.inactiveUsers.map(u => (
                                <div key={u._id} className="text-xs bg-white/5 p-2 rounded border border-white/10 text-gray-400 flex justify-between items-center hover:bg-white/10 transition-colors">
                                    <span>{u.username}</span>
                                    <span className="text-[10px] text-gray-600 font-mono">Inactive</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* New Users List */}
            <div className="bg-[#121212] border border-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    <UserPlus className="text-blue-500" />
                    New Users (Last 7 Days)
                </h2>

                {stats.newUsersLastWeek.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 italic">No new users this week.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.newUsersLastWeek.map(user => (
                            <div key={user._id} className="bg-white/5 p-4 rounded border border-white/10 flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white text-sm">{user.username}</div>
                                    <div className="text-gray-500 text-xs">{new Date(user.createdAt).toLocaleDateString()}</div>
                                </div>
                                <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-900/30 text-blue-400 border border-blue-900/50">NEW</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRevenue;
