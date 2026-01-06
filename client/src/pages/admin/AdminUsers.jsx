import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Download, Search, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config';

const AdminUsers = () => {
    const { token } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/auth/users`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
            setFilteredUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users", err);
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user._id.includes(term)
        );
        setFilteredUsers(filtered);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(users.map(user => ({
            ID: user._id,
            Username: user.username,
            Email: user.email,
            Mobile: user.mobile || 'N/A',
            Role: user.role,
            Plan: user.plan || 'Free',
            SubscriptionEnd: user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleString() : 'N/A',
            Status: user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date() ? 'Active' : 'Inactive'
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, "Win365_Users.xlsx");
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Users...</div>;

    return (
        <div className="bg-[#121212] border border-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-[#d4af37]" />
                    User Management
                </h2>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-500 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full bg-black/40 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:border-[#d4af37] focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="flex items-center gap-2 bg-green-600/20 text-green-500 border border-green-600/30 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition-all text-sm font-bold"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                            <th className="p-4">User Details</th>
                            <th className="p-4">Plan</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Expires</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-600">No users found.</td></tr>
                        ) : (
                            filteredUsers.map(user => {
                                const isSubscribed = user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date();
                                return (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-white">{user.username}</div>
                                            <div className="text-gray-400 text-xs">{user.email}</div>
                                            <div className="text-[#d4af37] text-xs font-mono pt-1">
                                                {user.mobile || 'No Mobile'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-[#d4af37]">{user.plan || 'Free'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${isSubscribed ? 'bg-green-900/30 text-green-500' : 'bg-gray-800 text-gray-500'}`}>
                                                {isSubscribed ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
