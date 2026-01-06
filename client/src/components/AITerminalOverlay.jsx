import { useEffect, useState, useRef } from 'react';

const AITerminalOverlay = ({ poolNumbers }) => {
    const [lines, setLines] = useState([]);
    const [matrixStream, setMatrixStream] = useState('');
    const [combinations, setCombinations] = useState(0);
    const [currentScan, setCurrentScan] = useState(0);
    const [serverStatus, setServerStatus] = useState("CONNECTING...");

    // Detailed "Hacker" Logs
    const logSequence = [
        "INITIALIZING NEURAL INTERFACE...",
        "BYPASSING SECURITY PROTOCOLS...",
        "CONNECTING TO EVOLUTION GAMING CLOUD...",
        "ACCESSING PLAYTECH SECURE SERVERS...",
        "IMPORTING PRAGMATIC PLAY ALGORITHMS...",
        "DECRYPTING SSL/TLS PACKETS...",
        "INTERCEPTING RNG SEED VAULT...",
        "EXTRACTING LIVE DATA STREAM...",
        "ANALYZING BALLISTIC TRAJECTORIES...",
        "RUNNING PREDICTIVE MODELS (v2.4.9)...",
        "FILTERING ANOMALIES...",
        "SYNCHRONIZING WITH SERVER TIME...",
        "FINALIZING PREDICTION VECTORS..."
    ];

    // Effect: Matrix Stream & Counters
    useEffect(() => {
        // 1. Matrix / Code Rain Effect
        const chars = "0123456789ABCDEF@#$%&∑∏∆Ω√∫µ¥£€¢§";
        const matrixInterval = setInterval(() => {
            let str = "";
            // Create a dense block of chaotic data
            for (let i = 0; i < 40; i++) {
                let line = "";
                for (let j = 0; j < 60; j++) {
                    line += chars[Math.floor(Math.random() * chars.length)];
                }
                str += line + "\n";
            }
            setMatrixStream(str);
        }, 50);

        // 2. Combinations Counter (Millions)
        const comboInterval = setInterval(() => {
            setCombinations(prev => prev + Math.floor(Math.random() * 1543210));
        }, 30);

        // 3. Pool Number Scanning
        const scanInterval = setInterval(() => {
            if (poolNumbers && poolNumbers.length > 0) {
                const randomIdx = Math.floor(Math.random() * poolNumbers.length);
                setCurrentScan(poolNumbers[randomIdx]);
            } else {
                setCurrentScan(Math.floor(Math.random() * 37));
            }
        }, 40);

        // 4. Sequential Logs
        let logIndex = 0;
        const logTimer = setInterval(() => {
            if (logIndex < logSequence.length) {
                setLines(prev => [...prev.slice(-8), logSequence[logIndex]]);
                if (logIndex === 2) setServerStatus("CONNECTED: EVO-GAMING");
                if (logIndex === 5) setServerStatus("DECRYPTING...");
                if (logIndex === 8) setServerStatus("CALCULATING...");
                logIndex++;
            }
        }, 600);

        return () => {
            clearInterval(matrixInterval);
            clearInterval(comboInterval);
            clearInterval(scanInterval);
            clearInterval(logTimer);
        };
    }, [poolNumbers]);

    return (
        <div className="fixed inset-0 z-[100] bg-black font-mono overflow-hidden flex flex-col items-center justify-center">

            {/* Background Layer: Fast Moving Matrix/Formulas */}
            <div className="absolute inset-0 opacity-20 text-[#0f0] text-[10px] leading-3 whitespace-pre font-bold select-none pointer-events-none blur-[0.5px] overflow-hidden p-2">
                {matrixStream}
            </div>

            {/* Central Terminal Container */}
            <div className="relative z-10 w-full max-w-4xl bg-black/90 border-y-2 border-[#d4af37] shadow-[0_0_100px_rgba(212,175,55,0.15)] flex flex-col md:flex-row h-[70vh] backdrop-blur-sm">

                {/* Left Panel: Server & Algorithmic Process */}
                <div className="flex-1 p-6 border-r border-[#d4af37]/20 flex flex-col">
                    <div className="border-b border-gray-800 pb-2 mb-4 flex justify-between items-center">
                        <span className="text-[#d4af37] font-bold tracking-widest text-sm">WIN365 AI CORE</span>
                        <span className="text-[10px] text-green-500 animate-pulse">● LIVE</span>
                    </div>

                    {/* Log Output */}
                    <div className="flex-1 overflow-hidden font-mono text-xs md:text-sm space-y-1">
                        {lines.map((line, i) => (
                            <div key={i} className="text-green-400">
                                <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                                <span className="mr-2 text-[#d4af37]">{`>>`}</span>
                                {line}
                            </div>
                        ))}
                        <div className="animate-pulse text-green-500">_</div>
                    </div>

                    {/* Combinations Counter */}
                    <div className="mt-6 bg-[#001100] border border-green-900 p-3 rounded">
                        <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Combinations Analyzed</div>
                        <div className="text-2xl text-green-400 font-bold tabular-nums tracking-widest">
                            {combinations.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Data Extraction Visualization */}
                <div className="w-full md:w-1/3 bg-[#050505] p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,128,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,128,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                    {/* Connecting Status */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] font-bold">
                        <span className="text-gray-500">SERVER STATUS:</span>
                        <span className={`${serverStatus.includes("CONNECTED") ? "text-green-500" : "text-yellow-500"}`}>{serverStatus}</span>
                    </div>

                    {/* Central Spinner / Number Extractor */}
                    <div className="relative z-10 w-40 h-40 flex items-center justify-center mt-4">
                        <div className="absolute inset-0 border-4 border-[#d4af37]/10 rounded-full animate-[spin_4s_linear_infinite]"></div>
                        <div className="absolute inset-0 border-t-4 border-[#d4af37] rounded-full animate-[spin_1s_linear_infinite]"></div>
                        <div className="absolute inset-4 border border-green-500/30 rounded-full animate-ping"></div>

                        <div className="text-center">
                            <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                                {currentScan}
                            </div>
                            <div className="text-[10px] text-[#d4af37] mt-1 tracking-widest animate-pulse">EXTRACTING</div>
                        </div>
                    </div>

                    {/* Raw Data Stream Box */}
                    <div className="mt-8 w-full h-32 bg-black border border-gray-800 p-2 overflow-hidden relative">
                        <div className="text-[8px] text-green-800 leading-tight break-all font-mono opacity-60">
                            {matrixStream}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Warning */}
            <div className="mt-4 text-[#d4af37] text-xs uppercase tracking-[0.3em] animate-pulse">
                DO NOT CLOSE WINDOW - DECRYPTION IN PROGRESS
            </div>
        </div>
    );
};

export default AITerminalOverlay;
