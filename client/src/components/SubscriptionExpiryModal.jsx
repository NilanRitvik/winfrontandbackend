import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CreditCard, LogOut } from 'lucide-react';

const SubscriptionExpiryModal = ({ isOpen, onClose, logout }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleRenew = () => {
        onClose();
        navigate('/paywall');
    };

    const handleLogout = () => {
        if (logout) logout();
        onClose();
        navigate('/login');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[#1a1a1a] border border-red-500/30 rounded-lg max-w-md w-full p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-6 border border-red-500/20">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-2xl font-serif font-bold text-white mb-2 uppercase tracking-wide">Subscription Expired</h2>
                <div className="h-0.5 w-16 bg-red-500/50 mx-auto mb-4"></div>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    Your VIP access has ended. <br />
                    <span className="text-white font-medium">Renew your plan</span> to continue accessing the premium tables and predictions.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={handleRenew}
                        className="w-full py-3.5 bg-gradient-to-r from-[#d4af37] to-[#b4941f] text-black font-bold uppercase tracking-wider rounded hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 group"
                    >
                        <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Renew Membership
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-transparent border border-gray-700 text-gray-500 font-bold uppercase tracking-wider rounded hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionExpiryModal;
