import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import * as L from '../utils/rouletteLogic';
import * as math from 'mathjs'; // Direct mathjs import if needed for complex stuff not in L
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Bookmark, X, Cpu, LogOut } from 'lucide-react';

// Import Background Images
import bg1 from '../assets/age-of-the-gods-bonus-roulette-tile.avif';
import bg2 from '../assets/beautiful-woman-sitting-roulette-table-casino_846334-1729.avif';
import bg3 from '../assets/pngtree-girl-is-sitting-in-front-of-a-roulette-wheel-picture-image_2645959.jpg';
import bg4 from '../assets/roulette_pay.jpg';
import bg5 from '../assets/pay7.jpg';
import mainLogo from '../assets/logo1.png';
import personIcon from '../assets/pers.png';
import chipsound from '../assets/chipsound.mp3';
import progressSoundFile from '../assets/progress.mp3';
import timerSoundFile from '../assets/timer-sound-426781.mp3';
import ProgressBarModal from '../components/ProgressBarModal';
import AITerminalOverlay from '../components/AITerminalOverlay';
import t1 from '../assets/t1.jpeg';
import t2 from '../assets/t2.jpeg';
import t3 from '../assets/t3.jpeg';
import AboutUsModal from '../components/AboutUsModal';

const CASINO_LIST = [
    "1xBet", "10Cric", "4Rabet", "888casino", "BC.Game", "Bet365", "Betway", "Betwinner",
    "Bitcasino.io", "BK8", "Bwin", "Casumo", "Cloudbet", "Crickex", "Dafabet", "IndigoBet",
    "Kindred Group", "Ladbrokes", "LeoVegas", "Maxim88", "MD88", "Megapari", "Mostbet",
    "MrQ Casino", "Parimatch", "PartyCasino", "Pin-Up Casino", "PokerStars Casino",
    "Rajabets", "Roobet", "Royal Panda", "Sportsbet.io", "Stake", "UEA8", "UMG8",
    "Unibet", "Vegas11", "Videoslots", "William Hill", "winstarexch365", "Yolo247"
];

const ROULETTE_TYPES = [
    "Xxxtreme Lightning Roulette", "Hindi Lightning Roulette", "Thunder Roulette", "Galaxy Roulette",
    "Speed Roulette", "Fast Roulette", "Oracle Roulette", "Dragon Roulette", "Fire Ball Roulette",
    "Diamond Roulette", "Red Door Roulette", "Turkey Lightning Roulette", "Auto Roulette",
    "Instant Roulette", "Double Ball Roulette", "Dynasty Lightning Roulette", "Gold Vault Roulette",
    "Lightning Roulette", "Dragonara Roulette", "Football Studio Roulette", "Immersive Roulette",
    "VIP Roulette", "Salon Privé Roulette", "Marina Casino Roulette", "Prestige Auto Roulette",
    "Porto Maso Roulette"
];

const bgImages = [bg1, bg2, bg3, bg4, bg5];

const RouletteGame = () => {
    const { user, logout } = useContext(AuthContext);
    // Background Slideshow State
    const [bgIndex, setBgIndex] = useState(0);
    const navigate = useNavigate();
    // Wait, simple import is better. I see imports at top but not useNavigate properly in scope of file view.
    // Let me check imports. 'react' is there. I will just rely on AuthContext causing the logout for now, 
    // OR add a manual check here using window.location if navigate isn't available easily.
    // Ideally I should import useNavigate.

    // Actually, since I modified AuthContext to logout globally on load if expired, 
    // ANY page load will trigger AuthContext -> checkSubscriptionStatus -> Logout.
    // So RouletteGame doesn't strictly need its own check IF and ONLY IF AuthContext runs.
    // AuthContext runs on app mount.

    // However, to be safe:
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            if (!user.subscriptionEnd || new Date(user.subscriptionEnd) <= new Date()) {
                // Double check? AuthContext handles it, but let's be sure.
                navigate('/paywall');
            }
        }
    }, [user, navigate]);

    // 3 Separate file states
    const [fileNumbers, setFileNumbers] = useState(null);
    const [fileDozen, setFileDozen] = useState(null);
    const [fileHotCold, setFileHotCold] = useState(null);

    // 3 Separate extracted data states
    const [extractedNumbers, setExtractedNumbers] = useState([]);
    const [extractedDozen, setExtractedDozen] = useState([]);
    const [extractedHotCold, setExtractedHotCold] = useState([]);

    const [predictions, setPredictions] = useState({});
    const [bestSets, setBestSets] = useState({}); // { 4:[], 8:[], 10:[], 15:[] }
    const [top20List, setTop20List] = useState([]);
    const [loading, setLoading] = useState(false);
    const [manualInput, setManualInput] = useState("");
    const [lightning, setLightning] = useState({ hot: [], cold: [] });
    // State to highlight table cells
    const [highlighted, setHighlighted] = useState([]);

    // Live Users State
    const [liveUsers, setLiveUsers] = useState(342);

    // Live Users Fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveUsers(prev => {
                // Fluctuate randomly between -5 and +8 to simulate gradual movement
                const change = Math.floor(Math.random() * 14) - 5;
                let next = prev + change;
                // Clamp between 323 and 457
                if (next > 457) next = 457;
                if (next < 323) next = 323;
                return next;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // UI States
    const [showRules, setShowRules] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // seconds
    const [showTimePopup, setShowTimePopup] = useState(false);
    const [predictionsVisible, setPredictionsVisible] = useState(true);

    // Progress Bar State
    const [progressState, setProgressState] = useState({ visible: false, type: 'extract' }); // type: 'extract' | 'predict' | 'update'
    const [animationActive, setAnimationActive] = useState(false);

    // Progress Sound Logic
    const [progressAudio] = useState(new Audio(progressSoundFile));
    useEffect(() => {
        if (progressState.visible) {
            progressAudio.loop = true; // Loop sound while progress is active
            progressAudio.volume = 0.6;
            progressAudio.play().catch(() => { });
        } else {
            progressAudio.pause();
            progressAudio.currentTime = 0;
        }
        return () => {
            progressAudio.pause();
        };
    }, [progressState.visible]);

    // Set Selection State
    const [selectedSetCount, setSelectedSetCount] = useState(25);
    const [showSetOptions, setShowSetOptions] = useState(false);

    const highlightTable = (nums) => {
        setHighlighted(nums);
    };

    // AI Prediction State
    const [aiData, setAiData] = useState({ numbers: [], series: '', line: '' });
    const [aiPrediction, setAiPrediction] = useState([]);
    const [showLosingRule, setShowLosingRule] = useState(false);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    // Server Selection State
    const [serverMode, setServerMode] = useState('universal');
    const [selectedCasino, setSelectedCasino] = useState('');
    const [selectedRouletteType, setSelectedRouletteType] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    // Fetch AI Data
    useEffect(() => {
        const fetchAI = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/admin-ai/latest`);
                if (res.data) setAiData(res.data);
            } catch (err) {
                console.error("Failed to fetch AI data", err);
            }
        };
        fetchAI();
    }, []);

    const handleGenerateAI = () => {
        // Check if data has been extracted (implies files uploaded + extraction run)
        if (extractedNumbers.length === 0 && extractedDozen.length === 0 && extractedHotCold.length === 0) {
            toast.error("Please Upload Files & Extract Data first!");
            return;
        }

        if (!aiData.numbers || aiData.numbers.length === 0) {
            toast.error("No AI Data Available / Not Set by Admin");
            return;
        }
        // Start Processing
        setIsAiProcessing(true);
        setAiPrediction([]); // Clear previous

        // Play calculation sound loop
        const processAudio = new Audio(progressSoundFile);
        processAudio.loop = true;
        processAudio.volume = 0.4;
        processAudio.play().catch(() => { });

        // 8 Second Delay
        setTimeout(() => {
            processAudio.pause();
            processAudio.currentTime = 0;

            // Shuffle and pick 15
            const shuffled = [...aiData.numbers].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 15);
            setAiPrediction(selected);
            setIsAiProcessing(false);
            toast.success("AI Prediction Generated!");

            // Play chip sound
            const audio = new Audio(chipsound);
            audio.play().catch(() => { });
        }, 8000);
    };

    // Background Slideshow Timer
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null) return;

        // Play Alert at 30 seconds
        if (timeLeft === 30) {
            const alertAudio = new Audio(timerSoundFile);
            alertAudio.play().catch(e => console.log("Timer sound failed", e));
            toast("30 Seconds Left!", { icon: '⏰', style: { border: '1px solid #d4af37', background: '#333', color: '#fff' } });
        }

        if (timeLeft <= 0) {
            setShowTimePopup(true);
            setTimeLeft(null); // Stop
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(t => t - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (s) => {
        if (s === null) return "--:--";
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const runOCR = async (f) => {
        if (!f) return [];
        const { data } = await Tesseract.recognize(f, "eng");
        // STRICT extraction: match all numbers, preserve order, allow duplicates
        return (data.text.match(/\d+/g) || [])
            .map(Number)
            .filter(n => !isNaN(n) && n >= 0 && n <= 36);
    };



    const startExtraction = (autoRun = false) => {
        if (!fileNumbers && !fileDozen && !fileHotCold) {
            toast.error("Upload at least one image");
            return;
        }
        setProgressState({ visible: true, type: 'extract', autoRun });
    };

    const handleExtractionComplete = async () => {
        const shouldAutoRun = progressState.autoRun;
        setProgressState({ ...progressState, visible: false });
        await extractNumbers(); // Run the actual extraction logic

        if (shouldAutoRun) {
            // Wait a tick for state updates if needed, then run prediction bypassing the empty check
            // (The check will fail because extractedNumbers isn't updated in this closure yet, but runPredictions will read fresh state later)
            startPrediction(true);
        }
    };

    const extractNumbers = async () => {
        setLoading(true);
        try {
            // Run OCR in parallel but set states individually
            const [nums, doz, hotCold] = await Promise.all([
                runOCR(fileNumbers),
                runOCR(fileDozen),
                runOCR(fileHotCold)
            ]);

            setExtractedNumbers(nums);
            setExtractedDozen(doz);
            setExtractedHotCold(hotCold);

            if (nums.length === 0 && doz.length === 0 && hotCold.length === 0) {
                toast.error("No numbers found in uploaded images.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to run OCR. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const startPrediction = (force = false) => {
        if (!force && !extractedNumbers.length && !extractedDozen.length && !extractedHotCold.length && !manualInput) return;

        if (serverMode === 'specific') {
            if (!selectedCasino) {
                toast.error("Please select a Casino Platform first");
                return;
            }
            // Start Connection Sim with exact 2s delay
            setIsConnecting(true);
            setTimeout(() => {
                setIsConnecting(false);
                setProgressState({ visible: true, type: 'predict' });
                toast.success(`Connected to ${selectedCasino} Server!`);
            }, 2000); // Changed to 2000ms (2 seconds) as requested
            return;
        }

        setProgressState({ visible: true, type: 'predict' });
    };

    const handlePredictionComplete = () => {
        setProgressState({ ...progressState, visible: false });
        runPredictions();
    };

    const handleSetUpdate = (count) => {
        setSelectedSetCount(count);
        setProgressState({ visible: true, type: 'update' });
    };

    const handleUpdateComplete = () => {
        setProgressState({ ...progressState, visible: false });
        // Update table chips
        const newSet = bestSets[selectedSetCount] || [];
        animateTable(newSet);
    };

    const animateTable = (numbers) => {
        // Sequentially highlight numbers over 4 seconds
        // 25 numbers over 4000ms = 160ms per number
        setAnimationActive(true);
        setHighlighted([]); // Clear initially
        setShowSetOptions(false); // Hide during animation

        let i = 0;
        const interval = setInterval(() => {
            if (i >= numbers.length) {
                clearInterval(interval);
                setAnimationActive(false);
                setHighlighted(numbers); // Ensure all are highlighted at end
                setShowSetOptions(true); // Show options after animation
                return;
            }
            // Add next number to highlighted list
            const numToHighlight = numbers[i];
            setHighlighted(prev => [...prev, numToHighlight]);

            // Play Sound for chip placement
            const audio = new Audio(chipsound);
            audio.volume = 0.4;
            audio.play().catch(() => { });

            i++;
        }, 160);
    };

    const runPredictions = () => {
        const manualNums = (manualInput || "")
            .split(/[,\s]+/)
            .map(t => parseInt(t, 10))
            .filter(n => !isNaN(n) && n >= 0 && n <= 36);

        // Combine all sources: Numbers -> Dozen -> HotCold -> Manual
        // User requested strict order from screenshots.
        // We assume the user uploads them in logical order or we just concat them.
        const history = [...extractedNumbers, ...extractedDozen, ...extractedHotCold, ...manualNums];

        if (!history.length) {
            toast.error("No numbers to process");
            return;
        }

        // Start Timer (15 mins = 900s)
        setTimeLeft(900);
        setShowTimePopup(false);

        const lastNum = history[history.length - 1];

        // --- Core Helpers ---
        const hot = L.topFrequent(history, 5);
        const cold = L.leastFrequent(history, 5);
        const avg = L.mean(history);
        const mid = L.median(history);
        const mod = L.mode(history);
        const std = L.stdDev(history);
        const pairsMap = L.findFrequentPairs(history);
        const neighbors = L.getNeighbors(lastNum);
        const patternNext = L.detectPattern(history);
        const wheel = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
        const sum10 = history.slice(-10).reduce((a, b) => a + b, 0);


        // --- 28 Distinct Strategies ---
        // Each MUST use a unique logic.
        // Return type: number OR [number, number] (we will normalize later)

        // Return type: number OR [number, number] (we will normalize later)

        const algos = {};

        // Helper for robust modulo
        const mod37 = (n) => ((Math.round(n) % 37) + 37) % 37;

        // 1. Monte Carlo: Weighted Probability
        // Logic: Return top 2 most frequent numbers (Probability ~ Frequency)
        algos["Monte Carlo Prediction"] = [hot[0] || 0, hot[1] || 0];

        // 2. Bayesian: MAP Estimate (Mode)
        // Logic: Primary Mode and Secondary Mode (if exists, else mean)
        algos["Bayesian Probability Prediction"] = [mod, Math.round(avg)];

        // 3. Fibonacci: Golden Ratio Projection
        // Logic: (Last + 5) and (Last + 8)
        algos["Fibonacci Betting Prediction"] = [mod37(lastNum + 5), mod37(lastNum + 8)];

        // 4. 1M Combination: Aggregate Metrics
        // Logic: (Avg + Mode + Last)/3, (Avg + Median + Last)/3
        algos["1M Combination Prediction"] = [mod37((avg + mod + lastNum) / 3), mod37((avg + mid + lastNum) / 3)];

        // 5. Expected & Unexpected: Color Balance
        // Logic: If Red dominant recently, predict Black (Balance), else Red.
        const redCount = history.slice(-10).filter(n => L.isRed(n)).length;
        algos["Expected & Unexpected Number Analysis"] = redCount > 5
            ? [L.getColdest(history, L.isBlack) || 2, L.getHottest(history, L.isBlack) || 4]
            : [L.getColdest(history, L.isRed) || 1, L.getHottest(history, L.isRed) || 3];

        // 6. Math & Random Pattern (Chaos): Entropy
        // Logic: Last * Variance, Lookback * StdDev
        algos["Mathematical & Random Pattern Analysis"] = [mod37(lastNum * (std || 1) + 7), mod37(sum10 * 0.618)];

        // 7. Martingale: Streak Continuation vs Reversal
        // Logic: Predict Last (Streak) and Opposite Color of Last (Reversal)
        algos["Martingale Betting Strategy"] = [lastNum, L.isRed(lastNum) ? 11 : 32]; // 11=Black, 32=Red roughly opp

        // 8. Labouchere: Cancellation Logic
        // Logic: First + Last, Second + SecondLast
        algos["Labouchere Betting Strategy"] = [
            mod37(history[0] + history[history.length - 1]),
            mod37((history[1] || 0) + (history[history.length - 2] || 0))
        ];

        // 9. Frequent Pairs: Markov Chain
        // Logic: Best 2 followers of current number
        const followers = pairsMap[lastNum] || [];
        const topFollowers = L.topFrequent(followers, 2);
        algos["Frequent Number Pairs"] = [topFollowers[0] || hot[0], topFollowers[1] || hot[1]];

        // 10. ChatGPT AI: Statistical Bounds
        // Logic: Mean + 2*StdDev, Mean - 2*StdDev
        algos["ChatGPT AI Prediction"] = [mod37(avg + 2 * std), mod37(avg - 2 * std)];

        // 11. Random: Entropy Hash (No Math.random)
        // Logic: Sum of all numbers * last number
        const entropy = history.reduce((a, b) => a + b, 0) * (lastNum + 1);
        algos["Random Prediction"] = [mod37(entropy), mod37(entropy * 1.618)];

        // 12. Mathematical: Deviation Correction
        // Logic: Last + (Last - Avg), Last + (Last - Mode)
        algos["Mathematical Prediction"] = [mod37(lastNum + (lastNum - avg)), mod37(lastNum + (lastNum - mod))];

        // 13. Statistical: Moving Median
        // Logic: Median of last 5, Median of last 10
        algos["Statistical Prediction"] = [L.median(history.slice(-5)), L.median(history.slice(-10))];

        // 14. Cold & Hot: Extremes
        // Logic: Coldest, 2nd Coldest
        algos["Cold and Hot Number Prediction"] = [cold[0] || 0, cold[1] || 0];

        // 15. Pattern: Mirror Wheel
        // Logic: Opposite on Wheel, +18 slots on Wheel
        const lastWheelIdx = wheel.indexOf(lastNum);
        algos["Pattern Prediction"] = [
            wheel[(lastWheelIdx + 18) % 37], // Opposite
            wheel[(lastWheelIdx + 9) % 37]   // Quarter
        ];

        // 16. Line Based: Transposition
        // Logic: Last + 3, Last - 3 (Vertical lines on board)
        algos["Line Based Prediction"] = [mod37(lastNum + 3), mod37(lastNum - 3)];

        // 17. Column Based: Column Completion
        // Logic: If Col 1 hits, predict Col 2 & 3 representatives (Hot)
        const nextCol1 = (L.getColumn(lastNum) % 3) + 1;
        const nextCol2 = (nextCol1 % 3) + 1;
        algos["Column Based Prediction"] = [
            L.getHottest(history, n => L.getColumn(n) === nextCol1) || nextCol1,
            L.getHottest(history, n => L.getColumn(n) === nextCol2) || nextCol2
        ];

        // 18. Odd/Even: Oscillation
        // Logic: If last was Odd, predict Even (Hot), else Odd (Hot)
        algos["Odd/Even Predictions"] = (lastNum % 2 !== 0)
            ? [L.getHottest(history, n => n % 2 === 0) || 2, 22]
            : [L.getHottest(history, n => n % 2 !== 0) || 1, 11];

        // 19. Dozen: Dozen Jump
        // Logic: Dozen + 1, Dozen + 2
        const d = L.getDozen(lastNum);
        const d1 = (d % 3) + 1;
        const d2 = (d1 % 3) + 1;
        algos["Dozen Based Prediction"] = [
            L.getHottest(history, n => L.getDozen(n) === d1) || (d1 - 1) * 12 + 1,
            L.getHottest(history, n => L.getDozen(n) === d2) || (d2 - 1) * 12 + 1
        ];

        // 20. Neighbor: Wheel Neighbors
        // Logic: Immediate Left, Immediate Right
        algos["Neighbor Prediction"] = [neighbors[0] || 0, neighbors[1] || 0];

        // 21. Inside/Outside: Board Proximity
        // Logic: Corner 1, Corner 2
        const corners = L.getCorner(lastNum);
        algos["Inside/Outside Prediction"] = [corners[0] || lastNum, corners[1] || lastNum];

        // 22. Street: Horizontal Flow
        // Logic: Last + 1, Last - 1
        algos["Street Prediction"] = [mod37(lastNum + 1), mod37(lastNum - 1)];

        // 23. Split: Vertical Flow
        // Logic: Split Above, Split Below
        const splits = L.getSplit(lastNum);
        algos["Split Prediction"] = [splits[0] || lastNum, splits[1] || lastNum];

        // 24. Frequency: 2nd Tier Hot
        // Logic: 2nd Hot, 3rd Hot
        algos["Frequency Based Prediction"] = [hot[1] || hot[0], hot[2] || hot[0]];

        // 25. Prev & Next: Temporal Average
        // Logic: (Prev+Next)/2, (First+Last)/2
        const prev = history[history.length - 2] || 0;
        algos["Previous and Next Prediction"] = [
            mod37((prev + hot[0]) / 2),
            mod37((history[0] + lastNum) / 2)
        ];

        // 26. Prev 10: Summation
        // Logic: Sum Last 10 % 37, Sum Last 5 % 37
        const sum5 = history.slice(-5).reduce((a, b) => a + b, 0);
        algos["Previous 10 Predictions"] = [sum10 % 37, sum5 % 37];

        // 27. High/Low: Pivot
        // Logic: 36-Last (Inversion), 18+Last (Shift)
        algos["High/Low Predictions"] = [mod37(36 - lastNum), mod37(18 + lastNum)];

        // 28. Red/Black: Color Flow
        // Logic: Last Red -> Hottest Red, Last Black -> Hottest Black
        algos["Red/Black Predictions"] = L.isRed(lastNum)
            ? [L.getHottest(history, L.isRed) || 1, L.getHottest(history, L.isRed, 2) || 3] // Hottest Red 1 & 2
            : [L.getHottest(history, L.isBlack) || 2, L.getHottest(history, L.isBlack, 2) || 4];

        // 29. System Random Number Predictor: Linear Congruential Generator
        // Logic: Pseudo-random based on history seed
        const seed = history.length * lastNum + sum10;
        const prng1 = (seed * 9301 + 49297) % 233280;
        const prng2 = (seed * 49297 + 9301) % 233280;
        algos["System Random Number Predictor"] = [Math.floor(prng1 % 37), Math.floor(prng2 % 37)];


        // --- Aggregation & Normalization ---
        const final = {};
        const predictionCounts = {};

        Object.entries(algos).forEach(([strategy, val]) => {
            // val is now [num1, num2]
            const [raw1, raw2] = val;

            const num1 = mod37(raw1);
            const num2 = mod37(raw2);

            final[strategy] = [num1, num2];

            // Counting for lightning/highlight
            [num1, num2].forEach(n => {
                predictionCounts[n] = (predictionCounts[n] || 0) + 1;
            });
        });

        // Lightning Numbers (3 Hot, 3 Cold selected from history)
        const lightningHot = hot.slice(0, 3);
        const lightningCold = cold.slice(0, 3);
        const lightningSet = new Set([...lightningHot, ...lightningCold]);

        // Strategy Predictions sorted by frequency
        const strategypredictions = Object.entries(predictionCounts)
            .sort((a, b) => b[1] - a[1] || Number(b[0]) - Number(a[0]))
            .map(([n]) => Number(n));

        // Start Top 25 strictly with the 6 Lightning Numbers
        const finalTop25 = [...lightningHot, ...lightningCold];

        // Fill remaining slots from best strategy predictions
        for (let n of strategypredictions) {
            if (finalTop25.length >= 25) break;
            if (!lightningSet.has(n)) {
                finalTop25.push(n);
                lightningSet.add(n);
            }
        }

        setTop20List(finalTop25); // Using same state name for now, but holds 25

        // Best Sets Logic (5, 10, 15, 20, 25)
        setBestSets({
            5: finalTop25.slice(0, 5),
            10: finalTop25.slice(0, 10),
            15: finalTop25.slice(0, 15),
            20: finalTop25.slice(0, 20),
            25: finalTop25.slice(0, 25)
        });

        setLightning({ hot: lightningHot, cold: lightningCold });
        setPredictions(final);

        // Trigger Animation
        animateTable(finalTop25);
    };

    return (
        <div className="relative min-h-screen text-gray-100 font-sans overflow-x-hidden">
            {/* Background Slideshow */}
            <div className="fixed inset-0 z-0">
                {bgImages.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
                        style={{ backgroundImage: `url(${img})` }}
                    />
                ))}
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 z-10"></div>
            </div>

            {/* AI Terminal Overlay */}
            {isAiProcessing && <AITerminalOverlay poolNumbers={aiData.numbers} />}

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setZoomedImage(null)}>
                    <img src={zoomedImage} alt="Reference Zoom" className="max-w-full max-h-[90vh] rounded-lg border-2 border-[#d4af37] shadow-[0_0_50px_rgba(212,175,55,0.3)] transform transition-transform scale-100" />
                    <button className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors">
                        <X size={32} />
                    </button>
                </div>
            )}

            {/* Connection Modal */}
            {isConnecting && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative w-32 h-32 mb-8">
                            {/* Spinning Rings */}
                            <div className="absolute inset-0 border-4 border-[#d4af37]/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute inset-2 border-4 border-[#d4af37]/50 rounded-full border-t-transparent animate-[spin_2s_linear_infinite_reverse]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Cpu size={48} className="text-[#d4af37] animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-[#d4af37] mb-2 uppercase tracking-widest">Establising Connection</h2>
                        <p className="text-gray-400 font-mono text-sm mb-6">Connecting to <span className="text-white font-bold">{selectedCasino}</span> Secure Server...</p>

                        {/* Fake Terminal Lines */}
                        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-xs text-left w-64 space-y-1 text-green-500/80 overflow-hidden">
                            <div className="whitespace-nowrap overflow-hidden w-full">Resolving DNS... OK</div>
                            <div className="whitespace-nowrap overflow-hidden w-full delay-75">Handshake... OK</div>
                            <div className="whitespace-nowrap overflow-hidden w-full delay-150">Verifying Keys... OK</div>
                            <div className="whitespace-nowrap overflow-hidden w-full delay-300">Bypassing Firewall... 100%</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Modal */}
            {showRules && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1f2937] border border-[#d4af37] p-8 rounded-lg max-w-lg w-full relative">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowRules(false)}>&times;</button>
                        <h2 className="text-2xl text-[#d4af37] font-serif mb-4">Rules</h2>
                        <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                            <li>Upload all three required screenshots.</li>
                            <li>Manually enter the last 20 Lightning numbers, including at least 15 winning Lightning numbers.</li>
                            <li>If there are two consecutive losses, rerun the prediction.</li>
                            <li>Ensure screenshots display only the numbers — exclude bonus or power values.</li>
                        </ol>
                    </div>
                </div>
            )}

            {/* Losing Rule Floating Bookmark */}
            {/* Losing Rule Floating Bookmark */}
            <button
                onClick={() => setShowLosingRule(true)}
                className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-red-900 via-red-700 to-red-900 text-white rounded-l-xl shadow-[0_0_20px_rgba(220,38,38,0.6)] z-40 hover:pr-3 transition-all w-12 h-48 flex items-center justify-center border-l-2 border-y border-red-400/50 backdrop-blur-md group hover:shadow-[0_0_30px_rgba(220,38,38,0.8)]"
                title="View Losing Rule"
            >
                <div className="transform -rotate-90 whitespace-nowrap font-bold tracking-[0.2em] text-xs flex items-center gap-3 text-red-100 group-hover:text-white transition-colors">
                    <Bookmark size={16} className="transform rotate-90 text-[#d4af37]" />
                    <span className="uppercase text-shadow-sm">Losing Rule</span>
                </div>
            </button>

            {/* Losing Rule Modal */}
            {
                showLosingRule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
                        <div className="bg-[#121212] border border-red-500 p-8 rounded-xl max-w-md w-full relative shadow-[0_0_50px_rgba(220,38,38,0.3)]">
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowLosingRule(false)}>
                                <X size={24} />
                            </button>
                            <h3 className="text-2xl text-red-500 font-bold mb-6 uppercase tracking-widest border-b border-red-500/30 pb-4">Losing Rule</h3>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                If there are <strong className="text-white">two consecutive losses</strong>, pick those two numbers and add them in the <strong>manual entry</strong> field, then <strong className="text-[#d4af37]">re-run the prediction</strong>.
                            </p>
                        </div>
                    </div>
                )
            }

            {/* Progress Bar Modal */}
            <ProgressBarModal
                isOpen={progressState.visible}
                type={progressState.type}
                duration={progressState.type === 'extract' ? 4 : 3}
                onComplete={
                    progressState.type === 'extract' ? handleExtractionComplete :
                        progressState.type === 'predict' ? handlePredictionComplete :
                            handleUpdateComplete
                }
            />

            {/* Time Up Popup */}
            {
                showTimePopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#1f2937] border-2 border-red-500 p-8 rounded-lg max-w-md w-full text-center">
                            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowTimePopup(false)}>&times;</button>
                            <h2 className="text-2xl text-red-500 font-bold mb-4">Time to Run New Prediction!</h2>
                            <p className="text-white mb-6">15 minutes have passed.</p>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded" onClick={() => setShowTimePopup(false)}>OK</button>
                        </div>
                    </div>
                )
            }

            {/* Main Content */}
            <div className="container relative z-20 mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <button className="text-sm font-medium text-gray-400 cursor-pointer hover:text-[#d4af37] tracking-wider uppercase focus:outline-none" onClick={() => setShowRules(true)}>Rules</button>
                        <button className="text-sm font-medium text-gray-400 cursor-pointer hover:text-[#d4af37] tracking-wider uppercase focus:outline-none" onClick={() => setIsAboutOpen(true)}>About</button>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Live User Bar */}
                        <div className="hidden md:flex items-center gap-3 bg-[#121212]/80 px-4 py-1.5 rounded-full border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)] backdrop-blur-md">
                            <div className="relative flex items-center justify-center">
                                <img src={personIcon} alt="Live Users" className="w-5 h-5 object-contain opacity-90" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                            </div>
                            <span className="text-xs text-green-400 font-mono tracking-widest uppercase flex items-center">
                                Live: <span className="text-white font-bold text-sm ml-2">{liveUsers}</span>
                            </span>
                        </div>

                        {/* User Profile & Logout */}
                        <div className="flex items-center gap-3 bg-black/60 p-1.5 pr-4 rounded-full border border-gray-700 backdrop-blur-md shadow-lg">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d4af37] to-[#8a6c18] flex items-center justify-center text-black font-bold shadow-inner text-lg border border-[#f3d058]">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col -space-y-0.5 mr-2">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Player</span>
                                <span className="text-sm font-bold text-white tracking-wide">{user?.username}</span>
                            </div>
                            <div className="h-6 w-px bg-gray-700 mx-1"></div>
                            <button
                                onClick={logout}
                                className="group flex items-center gap-2 px-2 py-1 rounded hover:bg-red-500/10 transition-all text-[10px] md:text-xs font-bold text-gray-400 hover:text-red-500 tracking-wider uppercase"
                                title="Logout"
                            >
                                LOGOUT <LogOut size={14} className="transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-6 text-center relative z-20">
                    <img src={mainLogo} alt="Win365 Logo" className="h-20 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-fade-in" />
                    <h1 className="text-3xl md:text-4xl font-serif text-[#d4af37] mb-2 drop-shadow-lg tracking-wider">
                        Roulette Prediction System <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.5 rounded ml-2 font-bold align-middle">PRO</span>
                    </h1>

                    {timeLeft !== null && (
                        <div className="text-xl font-mono text-[#d4af37] mb-2 font-bold border border-[#d4af37]/50 inline-block px-3 py-0.5 rounded bg-black/50">
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    <div className="bg-black/40 inline-block px-4 py-2 rounded border border-[#d4af37]/30 backdrop-blur-sm">
                        <span className="text-gray-300 text-sm">Validity:</span> <span className="text-white text-sm font-medium ml-2">Predictions are valid for 10 - 12 games.</span>
                    </div>
                </div>



                {/* Upload Section */}
                <p className="mb-6 text-gray-300 font-medium text-center">Upload the 3 required images to analyze the full board state.</p>
                <div className="grid grid-cols-2 gap-4 md:gap-6 mb-10">
                    {/* Box 1 (Numbers) */}
                    <div className="flex flex-col gap-2 group/ref1">
                        <div className="upload-box relative group !p-0 overflow-hidden flex flex-row border border-[#d4af37]/30 shadow-lg h-32 md:h-40">
                            <div className="w-1/2 h-full bg-black relative cursor-zoom-in overflow-hidden border-r border-[#d4af37]/20" onClick={() => setZoomedImage(t1)}>
                                <img src={t1} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-[#d4af37] text-[8px] md:text-[10px] px-1.5 py-0.5 rounded border border-[#d4af37]/30 uppercase tracking-widest shadow-md">Example</div>
                            </div>
                            <div className="w-1/2 p-2 md:p-4 bg-[#4a0404]/90 flex flex-col justify-center backdrop-blur-sm">
                                <label htmlFor="file-numbers" className="text-[#d4af37] font-bold mb-1 md:mb-2 cursor-pointer uppercase tracking-wide text-[10px] md:text-sm truncate">Numbers Analysis</label>
                                <input id="file-numbers" type="file" accept="image/*" className="hidden" onChange={e => setFileNumbers(e.target.files && e.target.files[0])} />
                                <label htmlFor="file-numbers" className="cursor-pointer text-[10px] md:text-xs text-gray-400 group-hover:text-white transition-colors border border-gray-700/50 rounded p-2 text-center bg-black/40 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30 truncate block border-dashed">
                                    {fileNumbers ? fileNumbers.name : "Click to Upload"}
                                </label>
                                {extractedNumbers.length > 0 && <div className="text-[10px] text-[#fbbf24] mt-1 md:mt-2 text-center animate-pulse">{extractedNumbers.length} numbers detected</div>}
                            </div>
                        </div>
                        <p onClick={() => setZoomedImage(t1)} className="text-xs md:text-sm text-gray-400 text-center cursor-pointer hover:text-[#d4af37] uppercase tracking-wider transition-colors pt-2 font-medium">
                            Click here to view reference image for upload
                        </p>
                    </div>

                    {/* Box 2 (Dozen) */}
                    <div className="flex flex-col gap-2 group/ref2">
                        <div className="upload-box relative group !p-0 overflow-hidden flex flex-row border border-[#d4af37]/30 shadow-lg h-32 md:h-40">
                            <div className="w-1/2 h-full bg-black relative cursor-zoom-in overflow-hidden border-r border-[#d4af37]/20" onClick={() => setZoomedImage(t2)}>
                                <img src={t2} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-[#d4af37] text-[8px] md:text-[10px] px-1.5 py-0.5 rounded border border-[#d4af37]/30 uppercase tracking-widest shadow-md">Example</div>
                            </div>
                            <div className="w-1/2 p-2 md:p-4 bg-[#4a0404]/90 flex flex-col justify-center backdrop-blur-sm">
                                <label htmlFor="file-dozen" className="text-[#d4af37] font-bold mb-1 md:mb-2 cursor-pointer uppercase tracking-wide text-[10px] md:text-sm truncate">Dozen/Odd-Even</label>
                                <input id="file-dozen" type="file" accept="image/*" className="hidden" onChange={e => setFileDozen(e.target.files && e.target.files[0])} />
                                <label htmlFor="file-dozen" className="cursor-pointer text-[10px] md:text-xs text-gray-400 group-hover:text-white transition-colors border border-gray-700/50 rounded p-2 text-center bg-black/40 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30 truncate block border-dashed">
                                    {fileDozen ? fileDozen.name : "Click to Upload"}
                                </label>
                                {extractedDozen.length > 0 && <div className="text-[10px] text-[#fbbf24] mt-1 md:mt-2 text-center animate-pulse">{extractedDozen.length} points detected</div>}
                            </div>
                        </div>
                        <p onClick={() => setZoomedImage(t2)} className="text-xs md:text-sm text-gray-400 text-center cursor-pointer hover:text-[#d4af37] uppercase tracking-wider transition-colors pt-2 font-medium">
                            Click here to view reference image for upload
                        </p>
                    </div>

                    {/* Box 3 (HotCold) */}
                    <div className="flex flex-col gap-2 group/ref3">
                        <div className="upload-box relative group !p-0 overflow-hidden flex flex-row border border-[#d4af37]/30 shadow-lg h-32 md:h-40">
                            <div className="w-1/2 h-full bg-black relative cursor-zoom-in overflow-hidden border-r border-[#d4af37]/20" onClick={() => setZoomedImage(t3)}>
                                <img src={t3} alt="Reference" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/70 text-[#d4af37] text-[8px] md:text-[10px] px-1.5 py-0.5 rounded border border-[#d4af37]/30 uppercase tracking-widest shadow-md">Example</div>
                            </div>
                            <div className="w-1/2 p-2 md:p-4 bg-[#4a0404]/90 flex flex-col justify-center backdrop-blur-sm">
                                <label htmlFor="file-hotcold" className="text-[#d4af37] font-bold mb-1 md:mb-2 cursor-pointer uppercase tracking-wide text-[10px] md:text-sm truncate">Hot & Cold Stats</label>
                                <input id="file-hotcold" type="file" accept="image/*" className="hidden" onChange={e => setFileHotCold(e.target.files && e.target.files[0])} />
                                <label htmlFor="file-hotcold" className="cursor-pointer text-[10px] md:text-xs text-gray-400 group-hover:text-white transition-colors border border-gray-700/50 rounded p-2 text-center bg-black/40 hover:bg-[#d4af37]/10 hover:border-[#d4af37]/30 truncate block border-dashed">
                                    {fileHotCold ? fileHotCold.name : "Click to Upload"}
                                </label>
                                {extractedHotCold.length > 0 && <div className="text-[10px] text-[#fbbf24] mt-1 md:mt-2 text-center animate-pulse">{extractedHotCold.length} stats detected</div>}
                            </div>
                        </div>
                        <p onClick={() => setZoomedImage(t3)} className="text-xs md:text-sm text-gray-400 text-center cursor-pointer hover:text-[#d4af37] uppercase tracking-wider transition-colors pt-2 font-medium">
                            Click here to view reference image for upload
                        </p>
                    </div>

                    {/* Server Configuration (Moved Here) */}
                    <div className="flex flex-col gap-2 relative">
                        {/* Server Config within Grid Cell matching the spacing of image grid */}
                        <div className="relative group bg-[#4a0404]/85 border border-[#d4af37]/30 rounded-xl p-2 backdrop-blur-md shadow-2xl h-32 md:h-40 flex flex-col justify-center items-center">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-50"></div>

                            {/* Server Title removed to save space or kept minimal? Moving to simplified layout for grid cell */}
                            <h3 className="text-[#d4af37] font-serif text-[10px] md:text-xs mb-2 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                                <Cpu size={14} /> Server & Table Config
                            </h3>

                            <div className="flex flex-row items-center justify-center gap-2 w-full px-2">
                                {/* Toggle Switch */}
                                <div className="flex bg-black/60 rounded-full p-1 gap-1 border border-gray-700 shadow-inner h-10 items-center shrink-0">
                                    <button
                                        onClick={() => setServerMode('universal')}
                                        className={`px-3 h-full rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 uppercase tracking-wide flex items-center ${serverMode === 'universal' ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Universal
                                    </button>
                                    <button
                                        onClick={() => setServerMode('specific')}
                                        className={`px-3 h-full rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 uppercase tracking-wide flex items-center ${serverMode === 'specific' ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Specific
                                    </button>
                                </div>

                                {/* Dropdown */}
                                <div className={`transition-all duration-500 overflow-hidden ${serverMode === 'specific' ? 'w-40 opacity-100' : 'w-0 opacity-0'}`}>
                                    <div className="relative h-10">
                                        <select
                                            value={selectedCasino}
                                            onChange={(e) => setSelectedCasino(e.target.value)}
                                            className="w-full h-full appearance-none bg-[#0a0a0a] border border-[#d4af37]/50 text-white rounded-lg pl-3 pr-8 focus:outline-none focus:border-[#d4af37] text-[10px] shadow-inner transition-colors whitespace-nowrap"
                                        >
                                            <option value="" disabled>Select Casino</option>
                                            {CASINO_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#d4af37]">
                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Roulette Type Selection */}
                            <div className="flex flex-row items-center justify-center gap-2 w-full px-2 mt-2">
                                <div className="h-8 bg-black/60 rounded-full border border-gray-700 shadow-inner px-3 flex items-center justify-center shrink-0">
                                    <span className="text-[#d4af37] text-[8px] md:text-[10px] font-bold uppercase tracking-wide">Table</span>
                                </div>
                                <div className="relative h-8 flex-grow max-w-[180px]">
                                    <select
                                        value={selectedRouletteType}
                                        onChange={(e) => setSelectedRouletteType(e.target.value)}
                                        className="w-full h-full appearance-none bg-[#0a0a0a] border border-[#d4af37]/50 text-white rounded-lg pl-3 pr-6 focus:outline-none focus:border-[#d4af37] text-[9px] shadow-inner transition-colors whitespace-nowrap truncate"
                                    >
                                        <option value="" disabled>Select Roulette Table</option>
                                        {ROULETTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#d4af37]">
                                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 h-4 text-center w-full">
                                {serverMode === 'universal' && (
                                    <div className="text-[10px] md:text-xs text-green-400 font-bold font-mono tracking-wider uppercase flex items-center justify-center gap-1 opacity-100 truncate animate-pulse">
                                        ✅ CONNECTED TO UNIVERSAL SERVER
                                    </div>
                                )}
                                {serverMode === 'specific' && selectedCasino && (
                                    <div className="text-[10px] md:text-xs text-green-400 font-bold font-mono tracking-wider uppercase flex items-center justify-center gap-1 opacity-100 truncate animate-pulse">
                                        🎯 {selectedCasino}: TARGETING SPECIFIC LOGIC METHOD
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Spacer for alignment to match other inputs "Click here to view reference..." text height if needed */}
                        <div className="h-4 md:h-5"></div>
                    </div>
                </div>

                <div className="mb-8">
                    <label htmlFor="manual-input" className="block text-gray-400 mb-2 ml-1">Manual numbers (optional, comma-separated 0-36):</label>
                    <input
                        id="manual-input"
                        type="text"
                        value={manualInput}
                        onChange={e => setManualInput(e.target.value)}
                        placeholder="e.g. 7, 12, 19, 0, 35"
                        className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white focus:border-[#d4af37] focus:outline-none transition-colors"
                    />
                </div>

                {/* Buttons Container */}
                <div className="flex justify-center mb-12">
                    <button
                        onClick={() => {
                            if (extractedNumbers.length || extractedDozen.length || extractedHotCold.length || manualInput) {
                                startPrediction();
                            } else {
                                startExtraction(true);
                            }
                        }}
                        disabled={loading}
                        className="casino-btn px-10 py-4 text-base md:text-lg bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transform hover:-translate-y-1 transition duration-200 uppercase font-black tracking-widest flex items-center gap-3 rounded-full border border-yellow-200/50"
                    >
                        {loading && <span className="inline-block w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin"></span>}
                        {(extractedNumbers.length || extractedDozen.length || extractedHotCold.length || manualInput) ? "Run Prediction Algorithm" : "Extract & Run Prediction"}
                    </button>
                </div>

                <p className="text-center text-gray-400 text-sm mb-8">
                    <strong className="text-[#d4af37]">Total Data Points:</strong> {extractedNumbers.length + extractedDozen.length + extractedHotCold.length} detected |
                    <strong className="text-[#d4af37]"> Top 20:</strong> {top20List.length}
                </p>

                {/* Lightning Box */}
                {/* Lightning Box (Hidden) */}
                {/* 
                <div className="casino-card p-6 mb-10 flex flex-col md:flex-row justify-around items-center text-center">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-[#d4af37] uppercase tracking-widest text-sm mb-2 font-bold">Lightning Numbers</h3>
                    </div>
                    <div className="flex gap-8 md:gap-16">
                        <div>
                            <span className="block text-gray-400 text-xs uppercase mb-1">Hot</span>
                            {lightning.hot.length ? <span className="text-xl text-red-500 font-bold">{lightning.hot.join(", ")}</span> : <span className="text-gray-600">—</span>}
                        </div>
                        <div className="w-px bg-gray-700 h-10 hidden md:block"></div>
                        <div>
                            <span className="block text-gray-400 text-xs uppercase mb-1">Cold</span>
                            {lightning.cold.length ? <span className="text-xl text-blue-400 font-bold">{lightning.cold.join(", ")}</span> : <span className="text-gray-600">—</span>}
                        </div>
                    </div>
                </div>
                */}

                {/* Table Section & AI Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-stretch mb-16">
                    {/* Left: Table */}
                    <div className="casino-card p-4 overflow-hidden shadow-2xl border-emerald-500/20 flex flex-col justify-center relative">
                        <div className="absolute top-3 left-0 right-0 text-center z-10">
                            <span className="text-lg md:text-xl text-[#d4af37] font-bold uppercase tracking-[0.1em] drop-shadow-md shadow-black">PREDICTED BY STRATEGY</span>
                        </div>
                        <div className="mt-8 w-full h-full flex items-center">
                            <table id="roulette-table" className="w-full h-full border-collapse table-fixed">
                                <tbody>
                                    <tr>
                                        <td colSpan={12} className="green-cell">
                                            {highlighted.includes(0) ? (
                                                <div className={`chip chip-green relative ${aiPrediction.includes(0) ? "border-2 border-[#00ff00]" : ""}`} style={{ margin: '0 auto', transform: 'scale(1.4)' }}>
                                                    0
                                                    {aiPrediction.includes(0) && <span className="absolute -top-2 -right-3 bg-green-500 text-black text-[8px] font-bold px-1 rounded-full border border-white z-10">AI</span>}
                                                </div>
                                            ) : 0}
                                        </td>
                                    </tr>
                                    <tr>
                                        {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map(n => (
                                            <td key={`r1-${n}`} className={L.isRed(n) ? 'red-cell' : 'black-cell'}>
                                                {highlighted.includes(n) ? (
                                                    <div className={`chip ${L.isRed(n) ? "chip-red" : "chip-black"} relative ${aiPrediction.includes(n) ? "border-2 border-[#00ff00]" : ""}`} style={{ margin: '0 auto', transform: 'scale(1.2)' }}>
                                                        {n}
                                                        {aiPrediction.includes(n) && <span className="absolute -top-2 -right-2 bg-green-500 text-black text-[8px] font-bold px-1 rounded-full border border-white z-10">AI</span>}
                                                    </div>
                                                ) : n}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map(n => (
                                            <td key={`r2-${n}`} className={L.isRed(n) ? 'red-cell' : 'black-cell'}>
                                                {highlighted.includes(n) ? (
                                                    <div className={`chip ${L.isRed(n) ? "chip-red" : "chip-black"} relative ${aiPrediction.includes(n) ? "border-2 border-[#00ff00]" : ""}`} style={{ margin: '0 auto', transform: 'scale(1.2)' }}>
                                                        {n}
                                                        {aiPrediction.includes(n) && <span className="absolute -top-2 -right-2 bg-green-500 text-black text-[8px] font-bold px-1 rounded-full border border-white z-10">AI</span>}
                                                    </div>
                                                ) : n}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map(n => (
                                            <td key={`r3-${n}`} className={L.isRed(n) ? 'red-cell' : 'black-cell'}>
                                                {highlighted.includes(n) ? (
                                                    <div className={`chip ${L.isRed(n) ? "chip-red" : "chip-black"} relative ${aiPrediction.includes(n) ? "border-2 border-[#00ff00]" : ""}`} style={{ margin: '0 auto', transform: 'scale(1.2)' }}>
                                                        {n}
                                                        {aiPrediction.includes(n) && <span className="absolute -top-2 -right-2 bg-green-500 text-black text-[8px] font-bold px-1 rounded-full border border-white z-10">AI</span>}
                                                    </div>
                                                ) : n}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Win365 AI Section */}
                    <div className="casino-card p-8 flex flex-col items-center justify-center border-[#d4af37] bg-gradient-to-br from-[#121212] to-[#d4af37]/5 relative overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                        <div className="absolute top-4 left-0 right-0 text-center z-10">
                            <span className="text-lg md:text-xl text-[#d4af37] font-bold uppercase tracking-[0.1em] drop-shadow-md shadow-black">PREDICTED BY WIN365 AI</span>
                        </div>
                        <Cpu className="w-24 h-24 text-[#d4af37] opacity-10 absolute top-[-20px] right-[-20px] animate-pulse" />

                        <div className="flex flex-col items-center mb-8">
                            <img src={mainLogo} alt="Engine Logo" className="h-16 mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                            <h3 className="text-xl font-serif text-[#d4af37] uppercase tracking-[0.2em] text-center drop-shadow-md border-b border-[#d4af37]/30 pb-2">
                                WIN365 AI AGENT ENGINE
                            </h3>
                        </div>

                        <button
                            onClick={handleGenerateAI}
                            className="mb-8 px-8 py-4 bg-gradient-to-r from-[#d4af37] via-[#f3d058] to-[#b48d28] text-black font-extrabold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all uppercase tracking-widest flex items-center gap-3 active:scale-95"
                        >
                            <Cpu size={22} /> Generate AI Prediction
                        </button>

                        {aiPrediction.length > 0 ? (
                            <div className="w-full animate-fade-in flex flex-col items-center">
                                <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-md">
                                    {aiPrediction.map((n, idx) => (
                                        <div key={`ai-${idx}`} className={`chip ${L.isRed(n) ? "chip-red" : n === 0 ? "chip-green" : "chip-black"} animate-pop-in shadow-lg`} style={{ width: '42px', height: '42px', fontSize: '1.1rem', animationDelay: `${idx * 50}ms` }}>
                                            {n}
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                                    <div className="bg-black/60 p-4 rounded-lg border border-[#d4af37]/30 text-center backdrop-blur-sm">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Target Series</span>
                                        <span className="text-[#d4af37] font-bold text-lg">{aiData.series}</span>
                                    </div>
                                    <div className="bg-black/60 p-4 rounded-lg border border-[#d4af37]/30 text-center backdrop-blur-sm">
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Target Line</span>
                                        <span className="text-[#d4af37] font-bold text-lg">{aiData.line}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg">
                                <p className="text-gray-500 text-sm italic mb-2">AI System Ready.</p>
                                <p className="text-gray-600 text-xs">Click generate to view today's optimization.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* List of Top 25 & Selection */}
                {top20List.length > 0 && showSetOptions && (
                    <div className="mb-8 animate-fade-in">
                        <h3 className="text-center text-[#d4af37] font-bold mb-6 text-xl uppercase tracking-widest">
                            Refine Betting Strategy
                        </h3>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {[5, 10, 15, 20, 25].map(count => (
                                <button
                                    key={count}
                                    onClick={() => handleSetUpdate(count)}
                                    className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all border border-[#d4af37] ${selectedSetCount === count ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.6)]' : 'bg-transparent text-[#d4af37] hover:bg-[#d4af37]/20'}`}
                                >
                                    Top {count}
                                </button>
                            ))}
                        </div>

                        {/* Selected Set Display */}
                        <div className="casino-card p-6 border-[#d4af37]/50 max-w-4xl mx-auto shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <div className="text-center mb-4 text-gray-400 text-sm">
                                Currently displaying the <span className="text-white font-bold">Top {selectedSetCount}</span> most likely numbers.
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                                {bestSets[selectedSetCount] && bestSets[selectedSetCount].map(n => (
                                    <span key={n} className={`chip ${L.isRed(n) ? "chip-red" : n === 0 ? "chip-green" : "chip-black"} animate-pop-in`} style={{ fontSize: '1.2rem', width: '45px', height: '45px' }}>
                                        {n}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Predictions Toggle */}
                <div className="mt-8 border-t border-white/10 pt-8">
                    <button
                        onClick={() => setPredictionsVisible(!predictionsVisible)}
                        className="w-full text-left flex justify-between items-center mb-6 focus:outline-none group mb-8"
                    >
                        <h2 className="text-2xl font-serif text-[#d4af37] uppercase tracking-wider group-hover:text-[#f3d058] transition-colors">
                            Prediction Results (29 Strategies)
                        </h2>
                        <span className="text-[#d4af37] text-sm px-4 py-2 border border-[#d4af37] rounded-full group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                            {predictionsVisible ? 'HIDE ▼' : 'SHOW ▲'}
                        </span>
                    </button>

                    {predictionsVisible && (
                        <div className="predictions animate-fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(predictions).length === 0 ? (
                                <p className="text-gray-500 italic col-span-full text-center py-10">Run predictions to see suggested bets.</p>
                            ) : (
                                Object.entries(predictions).map(([k, v]) => (
                                    <div key={k} className="bg-black/40 border border-gray-700/50 rounded p-4 hover:border-[#d4af37]/50 transition-colors">
                                        <span className="block text-gray-400 text-xs uppercase mb-3 text-center h-8 flex items-center justify-center">{k}</span>
                                        <div className="flex justify-center gap-2">
                                            {v.map((num, i) => (
                                                <div key={i} className={`chip ${L.isRed(num) ? "chip-red" : num === 0 ? "chip-green" : "chip-black"}`} style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                    {num}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <AboutUsModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </div >
    );
};

export default RouletteGame;


