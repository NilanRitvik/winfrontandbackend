import React, { useEffect, useState } from 'react';

const ProgressBarModal = ({ isOpen, type, duration, onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setProgress(0);
            return;
        }

        const intervalTime = 50; // Update every 50ms
        const steps = (duration * 1000) / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + increment;
            });
        }, intervalTime);

        // Auto-complete timeout
        const completeTimer = setTimeout(() => {
            onComplete();
        }, duration * 1000);

        return () => {
            clearInterval(timer);
            clearTimeout(completeTimer);
        };
    }, [isOpen, duration]); // Rely on isOpen to reset

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-md p-8 text-center">
                <h3 className="text-2xl font-serif text-[#d4af37] mb-6 tracking-widest uppercase animate-pulse">
                    {type === 'extract' ? 'Analyzing Board State...' : 'Calculating Strategy...'}
                </h3>

                <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <div
                        className="h-full bg-gradient-to-r from-[#8a6e1c] via-[#d4af37] to-[#fbf5b6] transition-all ease-linear"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="mt-4 flex justify-between text-xs text-gray-400 font-mono">
                    <span>PROCESSING</span>
                    <span>{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressBarModal;
