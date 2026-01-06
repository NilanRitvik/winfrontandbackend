import React from 'react';
import { Gem, Brain, Cpu, BarChart2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import loginVideo from '../assets/loginp1.mp4';
import win365Logo from '../assets/logo1.png';
import AboutUsModal from './AboutUsModal';
import LegalPolicyModal from './LegalPolicyModal';
import { useState } from 'react';

const SplitAuthLayout = ({ children, title, subtitle }) => {
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);
    return (
        <div className="min-h-screen relative flex bg-black overflow-hidden">
            {/* BACKGROUND VIDEO (Covers Whole Page) */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={loginVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Heavy Gradient Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 backdrop-blur-[2px]"></div>

                {/* Additional Decorative Gradients */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d4af37]/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 mix-blend-screen"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -ml-40 -mb-40 mix-blend-screen"></div>
            </div>

            {/* CONTENT WRAPPER */}
            <div className="relative z-10 w-full flex flex-col lg:flex-row">

                {/* LEFT SIDE: Marketing & Info */}
                <div className="hidden lg:flex w-1/2 flex-col p-12 justify-between border-r border-white/5 bg-transparent">
                    {/* Logo Area */}
                    <Link to="/" className="flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
                        <img src={win365Logo} alt="Win365 Logo" className="w-12 h-12 object-contain" />
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-white tracking-widest">WIN365</h1>
                            <p className="text-[#d4af37] text-xs uppercase tracking-[0.3em]">AI Prediction Engine</p>
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="space-y-8 max-w-lg mt-10">
                        <div>
                            <h2 className="text-5xl font-bold text-white font-serif leading-tight mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                Revolutionizing Roulette with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#fbf5b6]">Artificial Intelligence</span>
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed drop-shadow-md border-l-2 border-[#d4af37] pl-4">
                                Win365 is the world’s first roulette predictor built entirely on advanced AI, analyzing roulette outcomes at a level never seen before.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Brain, title: "AI Core", desc: "Learns patterns instantly." },
                                { icon: Cpu, title: "29+ Algos", desc: "Multi-layered verification." },
                                { icon: Zap, title: "Fast Analysis", desc: "Real-time processing." },
                                { icon: BarChart2, title: "Data Driven", desc: "Millions of data points." }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-black/50 p-4 rounded-xl border border-white/10 backdrop-blur-md hover:bg-black/70 hover:border-[#d4af37]/50 transition-all group">
                                    <item.icon className="text-[#d4af37] mb-2 group-hover:scale-110 transition-transform" size={24} />
                                    <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                                    <p className="text-gray-400 text-xs">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                        <div className="text-gray-500 text-[10px] uppercase tracking-wider leading-relaxed text-justify opacity-70">
                            © 2026 Win365. All rights reserved. All content, software, Artificial Intelligence models, algorithms, analytical systems, designs, text, graphics, logos, and intellectual property associated with the Win365 platform are the exclusive property of Win365 and its developer AICHAINZ.
                        </div>
                        <button onClick={() => setIsLegalOpen(true)} className="text-[#d4af37] text-[10px] uppercase tracking-wider hover:underline font-bold transition-all hover:text-white text-left">
                            Legal Disclaimer, Compliance & Usage Policy of WIN365
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE: Auth Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                    {/* Mobile Logo */}
                    <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
                        <img src={win365Logo} alt="Win365 Logo" className="w-8 h-8 object-contain" />
                        <span className="text-white font-bold tracking-widest text-sm">WIN365</span>
                    </div>

                    <div className="max-w-[440px] w-full bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-serif font-bold text-white mb-2">{title}</h2>
                            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mx-auto mb-4"></div>
                            <p className="text-gray-400 text-sm">{subtitle}</p>
                        </div>

                        {children}

                        <div className="mt-6 text-center border-t border-white/5 pt-4">
                            <button onClick={() => setIsAboutOpen(true)} className="text-[#d4af37] text-xs uppercase tracking-wider hover:underline font-bold transition-all hover:scale-105">
                                About Us
                            </button>
                            <span className="text-gray-600 mx-2">|</span>
                            <button onClick={() => setIsLegalOpen(true)} className="text-[#d4af37] text-xs uppercase tracking-wider hover:underline font-bold transition-all hover:scale-105">
                                Legal
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <AboutUsModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
            <LegalPolicyModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
        </div>
    );
};

export default SplitAuthLayout;
