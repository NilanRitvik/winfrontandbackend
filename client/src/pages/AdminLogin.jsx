import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, EyeOff } from 'lucide-react';
import SplitAuthLayout from '../components/SplitAuthLayout';
import { API_BASE_URL } from '../config';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/admin-login`, formData);
            if (res.data.user.role === 'admin') {
                login(res.data.token, res.data.user);
                navigate('/admin-dashboard');
            } else {
                setError('Access Denied');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Login Failed');
        }
    };

    return (
        <SplitAuthLayout title="House Admin" subtitle="Restricted Access. Authorized Personnel Only.">
            {error && (
                <div className="bg-red-950/50 border border-red-600 text-red-400 text-sm p-3 rounded mb-6 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                    <label className="text-xs uppercase text-red-700 tracking-wider font-bold ml-1">Admin ID</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <EyeOff className="h-5 w-5 text-red-900/50 group-focus-within:text-red-600 transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="email"
                            onChange={handleChange}
                            className="w-full bg-[#1a0505] border border-red-900/30 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-red-900/30 text-white focus:outline-none focus:border-red-600 focus:shadow-[0_0_10px_rgba(220,38,38,0.3)] transition-all"
                            placeholder="Admin Email"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs uppercase text-red-700 tracking-wider font-bold ml-1">Security Code</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-red-900/50 group-focus-within:text-red-600 transition-colors" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            className="w-full bg-[#1a0505] border border-red-900/30 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-red-900/30 text-white focus:outline-none focus:border-red-600 focus:shadow-[0_0_10px_rgba(220,38,38,0.3)] transition-all"
                            placeholder="Key"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 rounded-lg mt-4 text-sm font-bold uppercase tracking-widest bg-gradient-to-r from-red-900 to-red-600 text-white hover:from-red-800 hover:to-red-500 shadow-[0_4px_15px_rgba(220,38,38,0.4)] transition-all transform hover:-translate-y-1"
                >
                    Authenticate
                </button>

                <div className="mt-6 text-center text-xs text-red-900/50">
                    All attempts are logged.
                </div>
            </form>
        </SplitAuthLayout>
    );
};

export default AdminLogin;
