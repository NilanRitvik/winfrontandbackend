
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, Check, Crown, X, Smartphone, Mail, CreditCard, LogOut, ChevronDown, Copy, RefreshCcw } from 'lucide-react';

import axios from 'axios';
import toast from 'react-hot-toast';
import qr1 from '../assets/gpay1.jpg';
import qr2 from '../assets/gpay2.jpg'; // We can use one of these or fallback
import pokerChip from '../assets/poker-chip.png';
import bg1 from '../assets/bg1.png';
import pay2 from '../assets/pay2.jpg';
import pay4 from '../assets/pay4.jpg';
import cry1 from '../assets/cry1.jpg';
import cry2 from '../assets/cry2.jpg';
import cry3 from '../assets/cry3.jpg';
import cry4 from '../assets/cry4.jpg';
import cry5 from '../assets/cry5.jpg';
import cry6 from '../assets/cry6.jpg';
import chipsound from '../assets/chipsound.mp3';
import { API_BASE_URL } from '../config';
import AboutUsModal from '../components/AboutUsModal';

const cryptoOptions = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', network: 'BTC', img: cry1, address: '1KvWp3sHYh3PNEd9vvhCrAL2A2rPZ73x5j' },
    { id: 'tether', name: 'USDT (BEP20)', symbol: 'USDT', network: 'BEP20', img: cry2, address: '0x677d689122b4f25e275b2e8c0ea390c1aee1447c' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB', network: 'BNB-BEP20', img: cry3, address: '0x677d689122b4f25e275b2e8c0ea390c1aee1447c' },
    { id: 'tether', name: 'USDT (TRC20)', symbol: 'USDT', network: 'TRC20', img: cry4, address: 'TUo8zjEBd58XzucYgRFeaSPaDG4oxBti1A' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', network: 'SOL', img: cry5, address: '6WayXgxEYtznqGyJsey9pJ81iSnmUnY81H5snEjC5J2H' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', network: 'ETH-ERC20', img: cry6, address: '0x677d689122b4f25e275b2e8c0ea390c1aee1447c' },
];

const Paywall = () => {
    const { user, token, refreshUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // State
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Crypto'
    const [qrCode, setQrCode] = useState(qr1); // For UPI
    const [selectedCrypto, setSelectedCrypto] = useState(cryptoOptions[0]);
    const [cryptoAmount, setCryptoAmount] = useState(null);
    const [cryptoLoading, setCryptoLoading] = useState(false);
    const [exchangeRate, setExchangeRate] = useState(null);
    const [showCryptoDropdown, setShowCryptoDropdown] = useState(false);

    const [formData, setFormData] = useState({
        utr: '',
        mobile: '',
        email: ''
    });

    // Background Slideshow State
    const [bgIndex, setBgIndex] = useState(0);
    const bgImages = [bg1, pay2, pay4];

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Fetch Crypto Price


    const fetchCryptoPrice = async () => {
        setCryptoLoading(true);
        try {
            // Using CoinGecko Simple Price API with cache buster
            const res = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto.id}&vs_currencies=inr&include_last_updated_at=true&_=${Date.now()}`);
            const rate = res.data[selectedCrypto.id]?.inr;
            console.log(`Fetched Rate for ${selectedCrypto.id}: ₹${rate}`);

            if (rate) {
                setExchangeRate(rate);
                // Remove any non-numeric chars except dot
                const cleanPrice = selectedPlan.price.toString().replace(/[^0-9.]/g, '');
                const inrAmount = parseFloat(cleanPrice);

                // Calculate amount
                const amount = (inrAmount / rate).toFixed(8);

                console.log(`Plan: ${inrAmount} INR, Rate: ${rate}, Crypto: ${amount}`);

                setCryptoAmount(amount);
            }
        } catch (error) {
            console.error("Crypto Fetch Error", error);
        } finally {
            setCryptoLoading(false);
        }
    };

    // Check existing request status on load and auto-redirect if subscribed
    useEffect(() => {
        // 1. First check if we are ALREADY subscribed from the cached user
        if (user?.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
            console.log("Valid subscription found, redirecting...");
            navigate('/roulette');
            return;
        }

        // 2. Poll for status (Every 5 seconds)
        const intervalId = setInterval(async () => {
            if (user?._id) {
                try {
                    // Check Request Status
                    const res = await axios.get(`${API_BASE_URL}/payment/status/${user._id}`);
                    const status = res.data?.status;

                    if (status === 'approved') {
                        console.log("Payment Approved! Refreshing user profile...");
                        const updatedUser = await refreshUser();
                        if (updatedUser?.subscriptionEnd && new Date(updatedUser.subscriptionEnd) > new Date()) {
                            alert("Membership Activated! Redirecting to Lounge...");
                            navigate('/roulette');
                        }
                    } else if (status === 'pending') {
                        setPaymentStatus('pending');
                    }
                } catch (err) {
                    // console.error("Error checking status", err);
                }
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(intervalId);
    }, [user, navigate, refreshUser]);


    // Plans
    const plans = [
        // Special Weekend Plan
        {
            id: 'weekend-pass',
            name: 'Weekend Pass',
            price: '₹999',
            duration: 172800000, // 48 hours (Sat + Sun coverage)
            type: 'Special',
            features: ['Active Sat-Sun Only', 'Weekend Special Access', 'Standard Tables']
        },
        // Pro Plans
        {
            id: 'pro-7d',
            name: '7 Day Pro',
            price: '₹1999',
            duration: 604800000, // 7 days
            type: 'Pro',
            isPopular: true,
            features: ['Access for 7 Days', 'VIP Tables', 'Priority Support']
        },
        {
            id: 'pro-14d',
            name: '14 Day Pro',
            price: '₹2699',
            duration: 1209600000, // 14 days
            type: 'Pro',
            features: ['Access for 14 Days', 'VIP Tables', 'Priority Support']
        },
        {
            id: 'pro-1m',
            name: 'Monthly Elite',
            price: '₹3999',
            duration: 2592000000, // 30 days
            type: 'Pro',
            features: ['Access for 30 Days', 'High Roller Tables', '24/7 Dedicated Host']
        },
    ];

    const handleSelectPlan = (plan) => {
        if (paymentStatus === 'pending') return;

        // Weekend Pass Logic
        if (plan.id === 'weekend-pass') {
            const now = new Date();
            const day = now.getDay(); // 0 = Sun, 6 = Sat
            // Check if it is currently Saturday or Sunday
            if (day !== 6 && day !== 0) {
                toast.error("UNAVAILABLE: This plan works only on Saturday and Sunday.\nNot available on weekdays.", { duration: 4000 });
                return;
            }
        }

        // Play Sound
        const audio = new Audio(chipsound);
        audio.play().catch(e => console.error("Audio error:", e));

        setSelectedPlan(plan);
        // Reset state
        setPaymentMethod('UPI');
        setQrCode(Math.random() > 0.5 ? qr1 : qr2);
        setShowPaymentModal(true);
    };

    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!user) {
            toast.error("Please log in first!");
            setLoading(false);
            return;
        }

        // VALIDATION
        const mobileRegex = /^[0-9]{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!mobileRegex.test(formData.mobile)) {
            toast.error("Please enter a valid 10-digit Mobile Number.");
            setLoading(false);
            return;
        }

        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid Email Address.");
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/payment/request`, {
                userId: user._id || user.id,
                username: user.username,
                planId: selectedPlan.id,
                planName: selectedPlan.name,
                amount: selectedPlan.price,
                paymentMethod: paymentMethod, // 'UPI' or 'Crypto'
                cryptoCoin: paymentMethod === 'Crypto' ? selectedCrypto.symbol : undefined,
                cryptoAmount: paymentMethod === 'Crypto' ? cryptoAmount : undefined,
                utr: formData.utr, // Stores UTR or Transaction Hash
                mobile: formData.mobile,
                email: formData.email
            });

            setPaymentStatus('pending');
            setShowPaymentModal(false);
            toast.success("Payment Request Submitted! Please wait for Admin approval.");
        } catch (err) {
            console.error("Payment Submission Error:", err);
            const errorMsg = err.response?.data?.msg || err.message || "Payment submission failed";
            toast.error(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };


    if (paymentStatus === 'pending') {
        return <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50">
            <div className="bg-[#121212] border border-[#d4af37]/30 p-8 rounded-xl max-w-md w-full text-center">
                <Clock size={48} className="text-[#d4af37] mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-serif text-[#d4af37] mb-2">Payment Pending</h2>
                <p className="text-gray-400 mb-6 text-sm">
                    Your payment request is currently under review by the administrator.
                    Access will be granted automatically upon approval.
                </p>
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-white/10 mb-6 text-xs text-gray-400 text-left">
                    <p className="mb-2 font-bold text-[#d4af37]">Having trouble?</p>
                    <p>If you experience any delay or issue, please contact:</p>
                    <a href="mailto:support@winroulette365.com" className="text-white hover:underline block my-1 font-mono">support@winroulette365.com</a>
                    <p className="mt-2 text-gray-500 italic">Tip: Try re-logging in if approval is confirmed.</p>
                </div>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#d4af37] text-black font-bold rounded hover:bg-[#b5952f] transition-colors text-sm"
                    >
                        Check Status
                    </button>
                    <button
                        onClick={() => setPaymentStatus(null)}
                        className="px-6 py-2 bg-gray-800 text-gray-400 font-bold rounded hover:bg-gray-700 transition-colors text-sm"
                    >
                        Close
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-4">Auto-refreshing every 5 seconds...</p>
            </div>
        </div>;
    }


    return (
        <div className="min-h-screen text-white p-4 md:p-8 relative flex flex-col items-center justify-start overflow-x-hidden">
            {/* FIXED Background Slideshow */}
            <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden">
                {bgImages.map((img, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-[4000ms] ease-in-out bg-cover bg-center bg-no-repeat ${idx === bgIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}

                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
            </div>
            {/* User Header */}
            <div className="absolute top-0 left-0 w-full z-50 flex justify-between items-center p-6 md:p-8 bg-gradient-to-b from-black/90 to-transparent">
                <div className="flex items-center gap-3">
                    <Crown className="text-[#d4af37] w-6 h-6" />
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Logged in as</p>
                        <p className="text-white font-bold">{user?.username || 'Guest'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAboutOpen(true)}
                        className="text-[#d4af37] text-xs md:text-sm uppercase tracking-wider font-bold hover:scale-105 transition-transform"
                    >
                        About Us
                    </button>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600 hover:text-white transition-all text-sm font-bold border border-red-600/30"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">LOGOUT</span>
                    </button>
                </div>
            </div>

            <div className="relative z-10 max-w-6xl w-full mx-auto mt-24">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif font-bold casino-text-gold tracking-widest mb-4">SELECT YOUR MEMBERSHIP</h1>
                    <div className="h-1 w-32 bg-[#d4af37] mx-auto rounded-full mb-8"></div>
                </div>

                {/* POKER CHIP PLANS */}
                <div className="flex flex-wrap justify-center gap-10 mb-16 px-4">
                    {plans.map((plan, index) => {
                        // Define Hue Rotation for each plan based on the original RED chip
                        let hueRotate = '0deg';
                        let shadowColor = 'shadow-red-900/50 hover:shadow-red-600/80';

                        switch (index) {
                            case 0: // 1 Hour (Red - Original)
                                hueRotate = '0deg';
                                shadowColor = 'shadow-red-900/50 hover:shadow-red-600/80';
                                break;
                            case 1: // 6 Hour (Blue)
                                hueRotate = '220deg'; // Red -> Blue
                                shadowColor = 'shadow-blue-900/50 hover:shadow-blue-600/80';
                                break;
                            case 2: // 7 Day (Green)
                                hueRotate = '100deg'; // Red -> Green
                                shadowColor = 'shadow-green-900/50 hover:shadow-green-600/80';
                                break;
                            case 3: // 14 Day (Purple)
                                hueRotate = '280deg'; // Red -> Purple
                                shadowColor = 'shadow-purple-900/50 hover:shadow-purple-600/80';
                                break;
                            case 4: // Monthly (Gold/Yellow)
                                hueRotate = '45deg'; // Red -> Orange/Gold
                                shadowColor = 'shadow-yellow-900/50 hover:shadow-yellow-600/80';
                                break;
                            default:
                                hueRotate = '0deg';
                        }

                        return (
                            <div
                                key={plan.id}
                                onClick={() => handleSelectPlan(plan)}
                                className={`group relative w-64 h-64 flex-shrink-0 rounded-full flex flex-col items-center justify-center text-center cursor-pointer transition-transform duration-300 hover:scale-105 shadow-2xl ${shadowColor}`}
                            >
                                {/* Chip Texture (Front) */}
                                <div
                                    className="absolute inset-0 rounded-full bg-center bg-no-repeat bg-contain border-0"
                                    style={{
                                        backgroundImage: `url(${pokerChip})`,
                                        backgroundSize: '145%', // Aggressive zoom to crop checkerboard edges
                                        filter: `hue-rotate(${hueRotate}) brightness(1.1) saturate(1.2)`, // Use local hueRotate variable
                                        transform: 'translateZ(0px)'
                                    }}
                                ></div>
                                {/* Dark Overlay for Text Readability */}
                                <div className="absolute inset-4 rounded-full bg-black/40 z-10 backdrop-blur-[1px]"></div>

                                {/* Popular Badge */}
                                {plan.isPopular && (
                                    <div className="absolute -top-3 z-30">
                                        <span className="bg-[#d4af37] text-black text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white animate-pulse">
                                            Best Value
                                        </span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="relative z-20 p-4 flex flex-col items-center gap-0.5 mt-2">
                                    <div className="bg-black/50 p-1.5 rounded-full backdrop-blur-md mb-1 border border-white/10 shadow-lg">
                                        {index > 2 ? <Crown size={18} className="text-white" /> : <Clock size={18} className="text-white" />}
                                    </div>
                                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">{plan.name}</h3>
                                    <div className="text-2xl font-serif font-black text-white drop-shadow-[0_3px_3px_rgba(0,0,0,1)] py-0.5">{plan.price}</div>

                                    {/* Features Compact */}
                                    <div className="mt-1 text-[8px] uppercase tracking-wide opacity-90 text-white font-bold bg-black/60 px-2 py-0.5 rounded shadow-sm">
                                        {plan.features[0]}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>



            </div >

            {/* Manual Payment QR Modal */}
            {
                showPaymentModal && selectedPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="casino-card max-w-4xl w-full grid md:grid-cols-2 gap-0 overflow-hidden shadow-2xl relative">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Left Panel: Payment Method & QR */}
                            <div className="bg-white px-8 py-6 flex flex-col items-center border-r border-[#d4af37]/20 h-full">
                                <h3 className="text-black font-bold text-xl mb-4 font-serif">CHOOSE METHOD</h3>

                                {/* Toggle Switch */}
                                <div className="flex bg-gray-200 p-1 rounded-full w-full max-w-xs mb-6 shadow-inner">
                                    <button
                                        onClick={() => setPaymentMethod('UPI')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${paymentMethod === 'UPI' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        UPI
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('Crypto')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${paymentMethod === 'Crypto' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        CRYPTO
                                    </button>
                                </div>

                                {/* Dynamic Content Area */}
                                <div className="flex-1 flex flex-col items-center justify-center w-full">
                                    {paymentMethod === 'UPI' ? (
                                        <>
                                            <div className="bg-white p-2 border-4 border-black rounded-lg shadow-lg mb-4">
                                                <img src={qrCode} alt="UPI QR" className="w-56 h-56 object-contain" />
                                            </div>
                                            <span className="text-xs uppercase font-bold text-black bg-[#d4af37]/20 px-2 py-1 rounded">SCAN TO PAY UPI</span>
                                        </>
                                    ) : (
                                        <>
                                            {/* Crypto Selector */}
                                            <div className="w-full relative mb-4">
                                                <button
                                                    onClick={() => setShowCryptoDropdown(!showCryptoDropdown)}
                                                    className="w-full bg-gray-100 border border-gray-300 text-gray-800 font-bold py-2 px-4 rounded flex justify-between items-center hover:bg-gray-200"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        {selectedCrypto.name} ({selectedCrypto.symbol})
                                                    </span>
                                                    <ChevronDown size={16} />
                                                </button>
                                                {showCryptoDropdown && (
                                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded mt-1 shadow-xl z-20 max-h-40 overflow-y-auto">
                                                        {cryptoOptions.map(opt => (
                                                            <div
                                                                key={opt.id}
                                                                onClick={() => {
                                                                    setSelectedCrypto(opt);
                                                                    setShowCryptoDropdown(false);
                                                                }}
                                                                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-black text-sm"
                                                            >
                                                                {opt.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Crypto QR */}
                                            <div className="bg-white p-2 border-4 border-black rounded-lg shadow-lg mb-2">
                                                <img src={selectedCrypto.img} alt={`${selectedCrypto.name} QR`} className="w-48 h-48 object-contain" />
                                            </div>

                                            <div className="w-full text-center mb-4 px-2">
                                                <p className="text-xs text-black font-bold mb-1">Network: <span className="text-[#d4af37] uppercase">{selectedCrypto.network}</span></p>
                                                <div className="bg-gray-100 p-2 rounded flex items-center justify-between border border-gray-300 relative group cursor-pointer active:scale-95 transition-transform" onClick={() => navigator.clipboard.writeText(selectedCrypto.address)}>
                                                    <span className="text-[10px] text-gray-800 font-mono text-left break-all leading-tight pr-2">{selectedCrypto.address}</span>
                                                    <Copy size={12} className="text-gray-500 group-hover:text-[#d4af37] flex-shrink-0" />
                                                </div>
                                                <p className="text-[9px] text-gray-500 mt-1">Click address to copy</p>
                                            </div>

                                            <span className="text-xs uppercase font-bold text-black bg-[#d4af37]/20 px-2 py-1 rounded mb-4">SCAN {selectedCrypto.symbol} QR</span>
                                        </>
                                    )}
                                </div>

                                {/* Amount Display */}
                                <div className="text-center text-gray-800 w-full bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-wide mb-1 px-2">
                                        <span>Plan Amount</span>
                                    </div>
                                    <p className="font-black text-3xl text-black">{selectedPlan.price}</p>

                                    {paymentMethod === 'Crypto' && (
                                        <p className="text-[10px] text-red-600 font-bold mt-2 leading-tight uppercase border-t border-gray-200 pt-2 px-1">
                                            PLEASE TRANSFER THE CRYPTO VALUE CONVERTING AS PER YOUR PLAN. LESSER OR INCORRECT AMOUNT MAY BE REJECTED.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel: Form */}
                            <div className="px-8 py-6 flex flex-col justify-center bg-[#1a1a1a] h-full overflow-y-auto">
                                <h3 className="text-[#d4af37] font-serif text-2xl mb-6 tracking-wide text-center">CONFIRM DETAILS</h3>

                                <form onSubmit={handleSubmitPayment} className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">
                                            {paymentMethod === 'UPI' ? 'UTR / Ref No.' : 'Transaction Hash'}
                                        </label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-3 text-[#d4af37]" size={18} />
                                            <input
                                                type="text"
                                                name="utr"
                                                value={formData.utr}
                                                onChange={handleInput}
                                                required
                                                placeholder={paymentMethod === 'UPI' ? "Enter 12-digit UTR" : "Enter Transaction Hash"}
                                                className="w-full bg-black/50 border border-gray-700 rounded p-3 pl-10 text-white focus:border-[#d4af37] focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Registered Mobile</label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-3 text-[#d4af37]" size={18} />
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleInput}
                                                required
                                                placeholder="Your Phone Number"
                                                className="w-full bg-black/50 border border-gray-700 rounded p-3 pl-10 text-white focus:border-[#d4af37] focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 text-[#d4af37]" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInput}
                                                required
                                                placeholder="Receive confirmation"
                                                className="w-full bg-black/50 border border-gray-700 rounded p-3 pl-10 text-white focus:border-[#d4af37] focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>



                                    <button
                                        type="submit"
                                        disabled={loading || (paymentMethod === 'Crypto' && cryptoLoading)}
                                        className={`w-full py-4 mt-2 rounded font-bold uppercase tracking-widest transition-all ${loading ? 'bg-gray-600 cursor-not-allowed' : 'casino-btn'}`}
                                    >
                                        {loading ? 'Submitting...' : 'Submit Payment Details'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            <AboutUsModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div >
    );
};
export default Paywall;

