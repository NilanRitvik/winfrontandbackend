import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock } from 'lucide-react';
import SplitAuthLayout from '../components/SplitAuthLayout';
import { API_BASE_URL } from '../config';

const Login = () => {
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
            const res = await axios.post(`${API_BASE_URL}/auth/login`, formData);
            login(res.data.token, res.data.user);

            // Check subscription and route accordingly
            const user = res.data.user;
            if (user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
                navigate('/roulette');
            } else {
                navigate('/paywall');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid credentials');
        }
    };

    return (
        <SplitAuthLayout title="Welcome Back" subtitle="Enter your credentials to access the exclusive lounge.">

            {/* Version Marker Removed */}


            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-sm p-3 rounded mb-6 text-center shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase text-[#d4af37] tracking-wider font-bold ml-1">Email / Username</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-gray-600 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                            placeholder="Enter your credentials"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase text-[#d4af37] tracking-wider font-bold ml-1">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-gray-600 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                            placeholder="Enter your secret key"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b4941f] text-black font-bold uppercase tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5"
                >
                    Access Account
                </button>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-gray-400 text-xs">New to the club?</p>
                    <Link to="/register" className="text-[#d4af37] hover:text-white text-sm font-bold uppercase tracking-wider hover:underline transition-all mt-2 inline-block">
                        Apply for Membership
                    </Link>

                    <div className="mt-6 pt-4 border-t border-white/5">
                        <Link to="/admin-login" className="text-[10px] text-gray-700 hover:text-red-500 uppercase tracking-widest transition-colors">
                            House Access
                        </Link>
                    </div>
                </div>

            </form>
        </SplitAuthLayout>
    );
};

export default Login;
