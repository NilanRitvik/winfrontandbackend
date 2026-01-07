import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User, Bot, HelpCircle, Loader, Ticket as TicketIcon, MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AGENT_NAMES = ['Sara', 'Alex', 'Tina', 'Jeff', 'Tom'];

const INITIAL_GREETING = "Hello! I'm {name}, your Win365 AI assistant. How can I help you today?";

const SUBSCRIPTION_PLANS = [
    { name: 'Weekend Pass', price: '₹699', details: '48 Hours Access (Sat-Sun)' },
    { name: '7 Day Pro', price: '₹1499', details: '7 Days Access, VIP Tables' },
    { name: '14 Day Pro', price: '₹2499', details: '14 Days Access, VIP Tables' },
    { name: 'Monthly Elite', price: '₹3999', details: '30 Days Access, High Roller Tables' }
];

const RESTRICTED_KEYWORDS = ['code', 'admin', 'algorithm', 'source', 'developer', 'react', 'node', 'database', 'mongo', 'api', 'key', 'backend', 'frontend', 'stack'];

const AIChatWidget = ({ user }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [agentName, setAgentName] = useState('Sara');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Deposit State Machine
    const [depositFlow, setDepositFlow] = useState({
        active: false,
        step: 0, // 0: Idle, 1: Amount, 2: Date, 3: UTR, 4: Confirm
        data: { amount: '', date: '', utr: '' }
    });

    // Random Agent Name on Mount
    useEffect(() => {
        const randomName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
        setAgentName(randomName);
        setMessages([{
            id: 1,
            sender: 'agent',
            text: INITIAL_GREETING.replace('{name}', randomName)
        }]);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Check if on Admin Page
    if (location.pathname.startsWith('/admin')) return null;

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Process Logic
        try {
            await processResponse(inputValue);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    const processResponse = async (input) => {
        const lowerInput = input.toLowerCase();
        let responseText = '';

        // 1. SECURITY FILTER (Strict Confidentiality)
        if (RESTRICTED_KEYWORDS.some(k => lowerInput.includes(k))) {
            setTimeout(() => {
                addAgentMessage("My internal protocols strictly prohibit discussing technical architecture, administrative functions, source code, or proprietary algorithms. Please ask about platform features, subscriptions, or support.");
            }, 800);
            return;
        }

        // 2. DEPOSIT FLOW LOGIC
        if (depositFlow.active) {
            handleDepositFlow(input);
            return;
        }

        // 3. START DEPOSIT FLOW
        if (lowerInput.includes('deposit') || lowerInput.includes('payment') || lowerInput.includes('fund') || lowerInput.includes('balance') || lowerInput.includes('issue')) {
            if (lowerInput.includes('refund')) {
                responseText = "This request requires manual review. Please contact our support team at support@winroulette365.com for further assistance.";
                addAgentMessage(responseText);
                return;
            }

            setDepositFlow({ ...depositFlow, active: true, step: 1 });
            addAgentMessage("To assist you with your deposit, I’ll need a few details. Please provide the deposit amount.");
            return;
        }

        // 4. GENERAL & DYNAMIC RESPONSES
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            responseText = `Hello! I'm ${agentName}. I can inspect game coverage, explain our subscription plans, or help with deposit tickets.`;
        }
        // Subscriptions / Plans
        else if (lowerInput.includes('plan') || lowerInput.includes('price') || lowerInput.includes('subscription') || lowerInput.includes('cost') || lowerInput.includes('membership')) {
            let planText = "Here are our current membership plans:\n\n";
            SUBSCRIPTION_PLANS.forEach(p => {
                planText += `• ${p.name}: ${p.price}\n  (${p.details})\n`;
            });
            planText += "\nYou can verify and subscribe via the Paywall page.";
            responseText = planText;
        }
        else if (lowerInput.includes('win365') || lowerInput.includes('what is') || lowerInput.includes('about')) {
            responseText = "Win365 is an AI-powered roulette prediction engine using 29 proprietary mathematical strategies to analyze European roulette patterns and randomness. It is built by AICHAINZ.";
        } else if (lowerInput.includes('guarantee') || lowerInput.includes('sure win')) {
            responseText = "Win365 is an analytical software tool that provides probability-based insights only. Outcomes are not guaranteed. Please review our Legal Disclaimer.";
        } else if (lowerInput.includes('game') || lowerInput.includes('support')) {
            responseText = "We support European Roulette, Lightning Roulette, Red Door, Fireball, VIP, and standard tables. One engine covers all these variations.";
        } else if (lowerInput.includes('contact') || lowerInput.includes('human') || lowerInput.includes('help')) {
            responseText = "For further assistance, please contact our support team at support@winroulette365.com.";
        } else if (lowerInput.includes('refund')) {
            responseText = "All subscriptions are non-refundable once activated as per our strict Refund Policy.";
        } else if (lowerInput.includes('ticket')) {
            responseText = "If you have a deposit issue, type 'deposit' to raise a ticket. For technical issues, please email support.";
        } else {
            responseText = "I'm not sure about that specific detail. You can ask about plans, games, deposits, or general platform info. For complex queries, email support@winroulette365.com.";
        }

        // Simulated Delay
        setTimeout(() => {
            addAgentMessage(responseText);
        }, 1000);
    };

    const handleDepositFlow = (input) => {
        const step = depositFlow.step;
        const newData = { ...depositFlow.data };
        let nextMsg = '';

        setTimeout(async () => {
            if (step === 1) { // Amount
                newData.amount = input;
                setDepositFlow({ ...depositFlow, step: 2, data: newData });
                addAgentMessage("Got it. Please provide the transaction date (e.g., today, yesterday).");
            } else if (step === 2) { // Date
                newData.date = input;
                setDepositFlow({ ...depositFlow, step: 3, data: newData });
                addAgentMessage("Thanks. Finally, please provide the 12-digit UTR or Transaction Reference Number.");
            } else if (step === 3) { // UTR
                newData.utr = input;
                setDepositFlow({ ...depositFlow, step: 4, data: newData }); // Move to confirm
                addAgentMessage(`Please confirm details:\nAmount: ${newData.amount}\nDate: ${newData.date}\nUTR: ${newData.utr}\n\nType "Yes" to submit or "No" to cancel.`);
            } else if (step === 4) { // Confirm
                if (input.toLowerCase().includes('yes')) {
                    // SUBMIT TICKET API
                    try {
                        if (user && user._id) {
                            const res = await axios.post(`${API_BASE_URL}/tickets/create`, {
                                userId: user._id,
                                type: 'DEPOSIT_ISSUE',
                                details: newData
                            });
                            addAgentMessage(`Thank you. Your deposit support ticket has been successfully raised.\n\nReference ID: ${res.data.ticketId}\n\nOur team will review it and contact you shortly.`);
                        } else {
                            addAgentMessage("Thank you. Please log in to specific account to link this ticket properly. Raising anonymous ticket... Done.");
                        }
                    } catch (e) {
                        addAgentMessage("System Error: Could not raise ticket. Please email support@winroulette365.com.");
                    }
                    setDepositFlow({ active: false, step: 0, data: { amount: '', date: '', utr: '' } });
                } else {
                    addAgentMessage("Cancelled. How else can I help?");
                    setDepositFlow({ active: false, step: 0, data: { amount: '', date: '', utr: '' } });
                }
            }
        }, 800);
    };

    const addAgentMessage = (text) => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'agent', text }]);
    };

    return (
        <>
            {/* Hover Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[9999] w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#8a6c18] text-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center hover:scale-110 transition-transform group animate-bounce-slow"
                >
                    <MessageCircle size={32} fill="currentColor" className="text-black drop-shadow-sm" />
                    <span className="absolute top-3 right-3 flex h-3 w-3 z-10 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                    </span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[9999] w-[350px] md:w-[400px] h-[500px] bg-[#121212] flex flex-col rounded-2xl border border-[#d4af37]/30 shadow-2xl overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#d4af37] to-[#b4941f] p-4 flex justify-between items-center text-black">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-black/10 rounded-full">
                                <MessageCircle size={20} fill="currentColor" className="text-black/80" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Win365 AI Support</h3>
                                <p className="text-[10px] font-semibold opacity-80 uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-900 rounded-full animate-pulse"></span>
                                    Agent {agentName}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-1 rounded-full"><X size={18} /></button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a] custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl p-3 text-sm leading-relaxed ${msg.sender === 'user'
                                    ? 'bg-[#d4af37] text-black rounded-tr-none font-medium'
                                    : 'bg-[#222] text-gray-200 rounded-tl-none border border-white/5'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-[#222] rounded-xl p-3 rounded-tl-none border border-white/5 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-[#121212] border-t border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type your question..."
                                className="w-full bg-[#1a1a1a] text-white rounded-full pl-4 pr-12 py-3 border border-gray-800 focus:border-[#d4af37] focus:outline-none text-sm placeholder-gray-500"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-[#d4af37] text-black rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                        <div className="text-[10px] text-gray-600 text-center mt-2">
                            AI Agent responses are for info only. Not financial advice.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatWidget;
