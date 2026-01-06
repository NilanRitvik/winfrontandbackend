import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Check, X, Clock, Search, LogOut, Shield, LayoutDashboard, Users, TrendingUp, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import AdminUsers from './admin/AdminUsers';
import AdminRevenue from './admin/AdminRevenue';
import AdminAIPage from './admin/AdminAIPage';

const AdminDashboard = () => {
    const { token, logout, user } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [history, setHistory] = useState([]); // Transaction Logs
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'revenue'
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchData();
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            const reqRes = await axios.get(`${API_BASE_URL}/payment/admin/requests`, {
                headers: { 'x-auth-token': token }
            });
            setRequests(reqRes.data);

            const userRes = await axios.get(`${API_BASE_URL}/auth/users`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(userRes.data);

            const historyRes = await axios.get(`${API_BASE_URL}/payment/admin/history`, {
                headers: { 'x-auth-token': token }
            });
            setHistory(historyRes.data);

            setLoading(false);
        } catch (err) {
            console.error("Error fetching data", err);
            setLoading(false);
        }
    };

    const handleApprove = async (reqId, duration) => {
        try {
            await axios.post(`${API_BASE_URL}/payment/admin/approve`,
                { requestId: reqId, duration },
                { headers: { 'x-auth-token': token } }
            );
            alert("Request Approved and Subscription Activated!");
            fetchData(); // Refresh
        } catch (err) {
            console.error("Approve failed", err);
            const errorMsg = err.response?.data?.msg || err.message || "Approval Failed";
            alert(`Error: ${errorMsg}`);
        }
    };

    const handleReject = async (reqId) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            await axios.post(`${API_BASE_URL}/payment/admin/reject`,
                { requestId: reqId },
                { headers: { 'x-auth-token': token } }
            );
            fetchData();
        } catch (err) {
            console.error("Reject failed", err);
        }
    };

    if (loading && activeTab === 'dashboard') return <div className="min-h-screen bg-black text-white flex justify-center items-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans p-6">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-800 gap-6">
                <div className="flex items-center gap-4">
                    <Shield className="text-red-600 w-8 h-8" />
                    <h1 className="text-3xl font-serif font-bold text-white tracking-widest">ADMIN DASHBOARD</h1>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-[#121212] p-1 rounded-lg border border-gray-800">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <LayoutDashboard size={16} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'users' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Users size={16} /> Users
                    </button>
                    <button
                        onClick={() => setActiveTab('revenue')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'revenue' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <TrendingUp size={16} /> Revenue
                    </button>
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'ai' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Cpu size={16} /> Admin AI
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 hidden md:block">Logged in as {user?.username}</span>
                    <button onClick={() => { logout(); navigate('/admin-login'); }} className="flex items-center gap-2 text-red-500 hover:text-red-400 uppercase text-xs font-bold tracking-wider border border-red-900/30 px-4 py-2 rounded hover:bg-red-900/10 transition-colors">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && (
                    <>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-xl font-bold text-[#d4af37] flex items-center gap-2">
                                <Clock size={20} />
                                Pending Payment Requests
                            </h2>
                            <div className="text-sm text-gray-500">Total Pending: {requests.length}</div>
                        </div>

                        <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Plan</th>
                                        <th className="p-4 font-medium">Amount</th>
                                        <th className="p-4 font-medium">UTR (Ref No.)</th>
                                        <th className="p-4 font-medium">Contact</th>
                                        <th className="p-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-10 text-center text-gray-600 italic">No pending requests found.</td>
                                        </tr>
                                    ) : (
                                        requests.map(req => (
                                            <tr key={req._id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-sm text-gray-400">{new Date(req.createdAt).toLocaleDateString()} <br /> {new Date(req.createdAt).toLocaleTimeString()}</td>
                                                <td className="p-4">
                                                    <div className="font-bold text-white">{req.username}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{req.userId}</div>
                                                </td>
                                                <td className="p-4 text-[#d4af37] font-medium">{req.planName}</td>
                                                <td className="p-4 font-bold text-white">{req.amount}</td>
                                                <td className="p-4 font-mono text-blue-300">{req.utr}</td>
                                                <td className="p-4 text-sm">
                                                    <div><span className="text-gray-500">Mo:</span> {req.mobile}</div>
                                                    <div><span className="text-gray-500">Em:</span> {req.email}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                // Determine duration based on planName match or fetch from a config. 
                                                                // Ideally backend handles this logic or we pass it. 
                                                                // Just defaulting to regex detection for now as a quick fix or passing standard durations.
                                                                let duration = 0;
                                                                if (req.planName.includes('1 Hour')) duration = 3600000;
                                                                else if (req.planName.includes('6 Hour')) duration = 21600000;
                                                                else if (req.planName.includes('7 Day')) duration = 604800000;
                                                                else if (req.planName.includes('14 Day')) duration = 1209600000;
                                                                else if (req.planName.includes('Month')) duration = 2592000000;

                                                                handleApprove(req._id, duration);
                                                            }}
                                                            className="p-2 bg-green-600/20 text-green-500 rounded hover:bg-green-600 hover:text-white transition-colors border border-green-600/30"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req._id)}
                                                            className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors border border-red-600/30"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-end mb-6 mt-12">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Shield size={20} className="text-blue-500" />
                                Registered Users & Subscribers
                            </h2>
                            <div className="text-sm text-gray-500">Total Users: {users.length}</div>
                        </div>

                        <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-2xl mb-12">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                                        <th className="p-4 font-medium">User Details</th>
                                        <th className="p-4 font-medium">Current Plan</th>
                                        <th className="p-4 font-medium">Subscription Status</th>
                                        <th className="p-4 font-medium">Expires On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-10 text-center text-gray-600 italic">No users found.</td>
                                        </tr>
                                    ) : (
                                        users.map(u => {
                                            const isSubscribed = u.subscriptionEnd && new Date(u.subscriptionEnd) > new Date();
                                            return (
                                                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4">
                                                        <div className="font-bold text-white">{u.username}</div>
                                                        <div className="text-xs text-gray-500">{u.email}</div>
                                                        <div className="text-[10px] text-gray-600 font-mono">{u._id}</div>
                                                    </td>
                                                    <td className="p-4 text-[#d4af37] font-medium">{u.plan || 'Free / None'}</td>
                                                    <td className="p-4">
                                                        {isSubscribed ? (
                                                            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-600/30">ACTIVE</span>
                                                        ) : (
                                                            <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs font-bold border border-gray-700">INACTIVE</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-300">
                                                        {u.subscriptionEnd ? new Date(u.subscriptionEnd).toLocaleString() : '-'}
                                                        {isSubscribed && (
                                                            <div className="text-xs text-green-500 mt-1">
                                                                Time Left: <LiveTimer targetDate={u.subscriptionEnd} />
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Transaction History Section */}
                        <div className="max-w-7xl mx-auto mt-16 mb-20">
                            <div className="flex justify-between items-end mb-6">
                                <h2 className="text-xl font-bold text-gray-400 flex items-center gap-2">
                                    <Clock size={20} />
                                    Transaction History (Logs)
                                </h2>
                                <div className="text-sm text-gray-600">Total Records: {history.length}</div>
                            </div>

                            <div className="bg-[#121212] border border-gray-800 rounded-lg overflow-hidden shadow-2xl opacity-75 hover:opacity-100 transition-opacity">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1a1a1a] text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                                            <th className="p-4 font-medium">Date Processed</th>
                                            <th className="p-4 font-medium">User</th>
                                            <th className="p-4 font-medium">Plan</th>
                                            <th className="p-4 font-medium">Amount</th>
                                            <th className="p-4 font-medium">UTR</th>
                                            <th className="p-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800 text-gray-400 text-sm">
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="p-8 text-center text-gray-600 italic">
                                                    No transaction history found.
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((req) => (
                                                <tr key={req._id} className="hover:bg-[#151515] transition-colors">
                                                    <td className="p-4">
                                                        {new Date(req.updatedAt).toLocaleString()}
                                                        <div className="text-xs text-gray-600">Created: {new Date(req.createdAt).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-gray-300">{req.username}</div>
                                                    </td>
                                                    <td className="p-4">{req.planName}</td>
                                                    <td className="p-4">₹{req.amount}</td>
                                                    <td className="p-4 font-mono text-gray-500">{req.utr}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${req.status === 'approved' ? 'bg-green-900/30 text-green-500 border border-green-900/50' : 'bg-red-900/30 text-red-500 border border-red-900/50'}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'users' && <AdminUsers />}
                {activeTab === 'revenue' && <AdminRevenue />}
                {activeTab === 'ai' && <AdminAIPage />}

            </div>
        </div >
    );
};

const LiveTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const end = new Date(targetDate);
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('Expired');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            let timeString = '';
            if (days > 0) timeString += `${days}d `;
            timeString += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

            setTimeLeft(timeString);
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    return <span className="font-mono text-xs text-green-400">{timeLeft}</span>;
};

export default AdminDashboard;
