import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock } from 'lucide-react';
import SplitAuthLayout from '../components/SplitAuthLayout';
import { API_BASE_URL } from '../config';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/auth/register`, formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <SplitAuthLayout title="Join the Club" subtitle="Start your winning journey with AI-powered predictions.">
            {error && (
                <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-sm p-3 rounded mb-6 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                    <label className="text-xs uppercase text-[#d4af37] tracking-wider font-bold ml-1">Player Name</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="username"
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-gray-600 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                            placeholder="Choose your alias"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs uppercase text-[#d4af37] tracking-wider font-bold ml-1">Email</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            onChange={handleChange}
                            className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-gray-600 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                            placeholder="VIP contact email"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1">
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
                            placeholder="Create a password"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#b4941f] text-black font-bold uppercase tracking-wider rounded-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:-translate-y-0.5 mt-2"
                >
                    Register
                </button>

                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <p className="text-gray-400 text-xs">Already a member?</p>
                    <Link to="/login" className="text-[#d4af37] hover:text-white text-sm font-bold uppercase tracking-wider hover:underline transition-all mt-2 inline-block">
                        Login Here
                    </Link>
                </div>
            </form>
        </SplitAuthLayout>
    );
};

export default Register;
