import React, { useState } from 'react';
import { X, ShieldCheck, Cpu, Database, PlayCircle, Lock, Target } from 'lucide-react';
import win365Logo from '../assets/logo1.png';

const AboutUsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-[#d4af37]/30 shadow-[0_0_50px_rgba(212,175,55,0.1)] flex flex-col relative overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-black via-[#111] to-black">
                    <div className="flex items-center gap-3">
                        <img src={win365Logo} alt="Win365" className="h-10 w-auto" />
                        <div>
                            <h2 className="text-xl md:text-2xl font-serif text-[#d4af37]">About Win365</h2>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Advanced AI Prediction Engine</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <X className="text-gray-400 group-hover:text-white" size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 custom-scrollbar text-gray-300 leading-relaxed">

                    {/* Intro */}
                    <section>
                        <h3 className="text-3xl font-serif text-white mb-6">Advanced AI-Powered Roulette Prediction Engine</h3>
                        <p className="mb-4">
                            <span className="text-[#d4af37] font-bold">Win365</span> is a premium, subscription-based Roulette Prediction AI Engine, built using advanced Artificial Intelligence and <span className="text-white font-medium">29 proprietary mathematical strategies</span>, designed to analyze and interpret European Roulette games with exceptional depth, accuracy, and intelligence.
                        </p>
                        <p>
                            Win365 is engineered for users who demand data-driven insights, advanced probability modeling, and AI-powered pattern analysis across multiple roulette environments.
                        </p>
                    </section>

                    {/* Universal Coverage */}
                    <section className="bg-white/5 p-6 rounded-xl border border-white/5">
                        <h4 className="text-xl text-[#d4af37] mb-4 flex items-center gap-2">
                            <Target size={20} /> One AI Engine. Universal Roulette Coverage.
                        </h4>
                        <p className="mb-4">Win365 supports a wide range of European roulette game formats, including:</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {['European Roulette', 'Lightning Roulette', 'Red Door Roulette', 'Fireball Roulette', 'Normal Betting Roulette', 'VIP Roulette', 'Premium Roulette Tables'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-white">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]"></span> {item}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-sm text-gray-400">The system is designed for universal access, allowing users to analyze multiple roulette variations through one powerful AI-driven platform.</p>
                    </section>

                    {/* Strategies */}
                    <section>
                        <h4 className="text-xl text-white mb-4 flex items-center gap-2">
                            Powered by 29 Advanced Mathematical Strategies
                        </h4>
                        <p className="mb-4">At the core of Win365 lies a multi-layered analytical framework, combining:</p>
                        <ul className="space-y-2 mb-4">
                            {[
                                "29 advanced mathematical and statistical strategies",
                                "Probability-weighted calculation models",
                                "Pattern and sequence recognition",
                                "Hot & Cold number analysis",
                                "Outcome frequency and distribution tracking",
                                "Randomness behavior evaluation"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1.5"><div className="w-1.5 h-1.5 bg-[#d4af37] rotate-45"></div></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-sm italic text-gray-400 border-l-2 border-[#d4af37] pl-4">
                            Each strategy operates both independently and collaboratively, enabling cross-verification of results and reducing analytical noise for more refined predictions.
                        </p>
                    </section>

                    {/* AI Scale */}
                    <section className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-xl border border-[#d4af37]/20">
                        <h4 className="text-xl text-[#d4af37] mb-4 flex items-center gap-2">
                            <Cpu size={20} /> Artificial Intelligence at Scale
                        </h4>
                        <p className="mb-4">Win365 is built on a high-performance Artificial Intelligence architecture, capable of:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Massive Processing", desc: "Processing millions to billions of possible number combinations." },
                                { title: "Adaptive Learning", desc: "Learning from historical and real-time data." },
                                { title: "Micro-Pattern Detection", desc: "Detecting micro-patterns invisible to human analysis." },
                                { title: "Dynamic Logic", desc: "Adapting prediction logic dynamically based on evolving data." }
                            ].map((card, i) => (
                                <div key={i} className="bg-black/40 p-4 rounded-lg border border-white/5">
                                    <h5 className="text-white font-medium mb-1">{card.title}</h5>
                                    <p className="text-xs text-gray-400">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Screenshot Analysis */}
                    <section>
                        <h4 className="text-xl text-white mb-4">Screenshot-Based Intelligent Analysis</h4>
                        <p className="mb-4">Win365 supports screenshot-based data analysis, enabling the AI engine to:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2">
                            <li>Interpret visual roulette outcomes</li>
                            <li>Extract numerical sequences automatically</li>
                            <li>Analyze trends, repetitions, and deviations</li>
                            <li>Apply AI-driven prediction logic instantly</li>
                        </ul>
                    </section>

                    {/* Randomness */}
                    <section>
                        <h4 className="text-xl text-white mb-4">Randomness Prediction & Pattern Intelligence</h4>
                        <p className="mb-4">Roulette is designed to be random — and Win365 is built specifically to analyze that randomness. Rather than relying on assumptions, Win365 focuses on:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {["Randomness distribution behavior", "Statistical deviation detection", "Pattern density", "Probability imbalance analysis"].map(tag => (
                                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-xs border border-white/10 text-[#d4af37]">{tag}</span>
                            ))}
                        </div>
                        <p>By combining ArtificiaI Intelligence, advanced mathematics, and randomness interpretation, Win365 delivers intelligent predictive insights, not guarantees.</p>
                    </section>

                    {/* Target Audience */}
                    <section className="bg-[#111] p-6 rounded-xl">
                        <h4 className="text-xl text-white mb-4">Designed for Professionals & Enthusiasts</h4>
                        <p className="mb-2">Win365 is designed for:</p>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                            <li>• Strategy-focused users</li>
                            <li>• Data-driven decision makers</li>
                            <li>• Analytical thinkers</li>
                            <li>• Users seeking AI-powered roulette insights</li>
                        </ul>
                    </section>

                    {/* Developer Info */}
                    <section className="border-t border-white/10 pt-8">
                        <h4 className="text-xl text-[#d4af37] mb-2">Built by AICHAINZ</h4>
                        <p className="mb-4">The Win365 platform is designed and developed by AICHAINZ, a technology-driven organization specializing in Artificial Intelligence, advanced analytics, and intelligent systems.</p>
                        <div className="flex flex-col md:flex-row gap-6 text-sm">
                            <a href="https://www.aichainzom" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#d4af37] hover:underline">
                                <span>🌐</span> Developer Website: www.aichainzom
                            </a>
                            <a href="mailto:support@winroulette365.com" className="flex items-center gap-2 text-[#d4af37] hover:underline">
                                <span>📧</span> support@winroulette365.com
                            </a>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section>
                        <h4 className="text-2xl font-serif text-white mb-6">Q&A – Frequently Asked Questions</h4>
                        <div className="space-y-6">
                            {[
                                { q: "What is Win365?", a: "Win365 is a subscription-based AI-powered roulette prediction and analysis platform for European roulette games." },
                                { q: "How does the Win365 prediction engine work?", a: "It uses 29 advanced mathematical strategies combined with Artificial Intelligence to analyze probability, patterns, and randomness behavior." },
                                { q: "Which roulette games are supported?", a: "European Roulette, Lightning Roulette, Red Door Roulette, Fireball Roulette, normal betting roulette, VIP, and premium roulette tables." },
                                { q: "Is Win365 purely AI-based?", a: "Yes. The core system is built on Artificial Intelligence enhanced with advanced mathematical and statistical models." },
                                { q: "Does Win365 analyze screenshots?", a: "Yes. The platform supports screenshot-based intelligent analysis to extract and process roulette data." },
                                { q: "Does Win365 guarantee winnings?", a: "No. Win365 provides analytical insights and probability-based predictions. Outcomes are not guaranteed." },
                                { q: "How many algorithms are used?", a: "Win365 operates using 29 independent and collaborative AI-driven mathematical algorithms." },
                                { q: "Is Win365 suitable for beginners?", a: "Yes. The platform is designed for universal access, while offering advanced insights for experienced users." },
                                { q: "Is Win365 a one-time purchase?", a: "No. Win365 is a subscription-based software with continuous updates and AI improvements." },
                                { q: "Who developed Win365?", a: "Win365 is developed by AICHAINZ, a company focused on AI-powered intelligent systems." }
                            ].map((faq, i) => (
                                <div key={i} className="border-l-2 border-[#d4af37]/30 pl-4 py-1">
                                    <h5 className="text-white font-medium mb-1 question">{i + 1}. {faq.q}</h5>
                                    <p className="text-sm text-gray-400">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black flex justify-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-[#d4af37] text-black font-bold uppercase tracking-wider rounded text-sm hover:bg-[#f3d058] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AboutUsModal;
