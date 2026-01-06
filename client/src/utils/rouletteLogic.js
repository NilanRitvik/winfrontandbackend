import { create, all } from 'mathjs';

const math = create(all);

export const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export const isRed = n => redNumbers.includes(n);
export const isBlack = n => blackNumbers.includes(n);
export const clamp = n => Math.max(0, Math.min(36, Math.round(n)));

// Helpers using MathJS
export const mean = nums => nums.length ? Math.round(math.mean(nums)) : 0;
export const median = nums => nums.length ? Math.round(math.median(nums)) : 0;
export const stdDev = nums => nums.length ? math.std(nums) : 0;
export const variance = nums => nums.length ? math.variance(nums) : 0;

export const freqMap = nums => {
    const m = {};
    nums.forEach(n => {
        m[n] = (m[n] || 0) + 1;
    });
    return m;
};

export const mode = nums => {
    if (!nums.length) return 0;
    const entries = Object.entries(freqMap(nums));
    // Sort by frequency desc, then by number desc to break ties consistently
    const sorted = entries.sort((a, b) => b[1] - a[1] || b[0] - a[0]);
    return Number(sorted[0][0]);
};

// Get top N most frequent numbers
export const topFrequent = (nums, count) => {
    const freq = freqMap(nums);
    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([n]) => Number(n));
};

// Get least frequent numbers
export const leastFrequent = (nums, count) => {
    const freq = freqMap(nums);
    return Object.entries(freq)
        .sort((a, b) => a[1] - b[1])
        .slice(0, count)
        .map(([n]) => Number(n));
};

// Suggest the "hottest" number that fits a predicate
// Suggest the "hottest" number that fits a predicate
// e.g., getHottest(nums, n => isRed(n), 2) for 2nd hottest
export const getHottest = (nums, predicate, rank = 1) => {
    const valid = nums.filter(predicate);
    if (!valid.length) return null;

    // Get frequency map of valid numbers
    const freq = freqMap(valid);
    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1] || b[0] - a[0]) // Descending freq
        .map(([n]) => Number(n));

    return sorted[rank - 1] !== undefined ? sorted[rank - 1] : sorted[0];
};

// Suggest the "due" number (least frequent) that fits a predicate
export const getColdest = (nums, predicate) => {
    const valid = nums.filter(predicate);
    if (!valid.length) return null;
    const freq = freqMap(nums);
    // Sort logic: if n is in freq, use count, else 0. Sort asc.
    const sorted = [...new Set(valid)].sort((a, b) => (freq[a] || 0) - (freq[b] || 0));
    return sorted[0];
};

export const findFrequentPairs = nums => {
    const pairs = {};
    for (let i = 0; i < nums.length - 1; i++) {
        // looking for direct followers
        const key = nums[i];
        const next = nums[i + 1];
        if (!pairs[key]) pairs[key] = [];
        pairs[key].push(next);
    }
    // This map stores "after X, [y, z, ...]"
    // We want to return the most common 'next' for the *last* number in sequence
    return pairs;
};

// Detect patterns (repeating sequences)
export const detectPattern = nums => {
    if (nums.length < 5) return null;
    // Simple check for A-B-A-B -> A
    const last = nums[nums.length - 1];
    const prev = nums[nums.length - 2];
    if (nums[nums.length - 3] === last && nums[nums.length - 4] === prev) {
        return last; // Expect sequence to repeat result
    }
    return null;
};

// Roulette neighbors (numbers adjacent on wheel) - Complete European Wheel
export const getNeighbors = n => {
    // 0-32-15-19-4-21-2-25-17-34-6-27-13-36-11-30-8-23-10-5-24-16-33-1-20-14-31-9-22-18-29-7-28-12-35-3-26
    const wheel = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
    const idx = wheel.indexOf(n);
    if (idx === -1) return [];
    // 2 left, 2 right
    const result = [];
    result.push(wheel[(idx - 1 + wheel.length) % wheel.length]);
    result.push(wheel[(idx + 1) % wheel.length]);
    result.push(wheel[(idx - 2 + wheel.length) % wheel.length]);
    result.push(wheel[(idx + 2) % wheel.length]);
    return result;
};

// Get Sector/Dozen/Column helpers
export const getDozen = n => {
    if (n >= 1 && n <= 12) return 1;
    if (n >= 13 && n <= 24) return 2;
    if (n >= 25 && n <= 36) return 3;
    return 0;
}
export const getColumn = n => {
    if (n === 0) return 0;
    return (n - 1) % 3 + 1; // 1, 2, or 3
}

export const getStreetNumbers = n => {
    if (n === 0) return [0];
    const rowStart = Math.floor((n - 1) / 3) * 3 + 1;
    return [rowStart, rowStart + 1, rowStart + 2];
};

export const getSplit = n => {
    // Splits: Horizontal and Vertical adjacency on the board
    // 0 shares with 1, 2, 3
    if (n === 0) return [1, 2, 3];
    const splits = [];
    // Horizontal (n-1 if not col 1, n+1 if not col 3)
    const col = getColumn(n);
    if (col > 1) splits.push(n - 1);
    if (col < 3) splits.push(n + 1);
    // Vertical (n-3 if >3, n+3 if <34)
    if (n > 3) splits.push(n - 3);
    if (n < 34) splits.push(n + 3);
    return splits;
};

export const getCorner = n => {
    // Corners: numbers sharing a corner.
    // Simplified: return diagonal neighbors + vertical/horizontal pairs
    // For simplicity, just return neighbors +/- 4, +/- 2 if valid
    const corners = [];
    const candidates = [n - 4, n - 2, n + 2, n + 4];
    candidates.forEach(c => {
        if (c > 0 && c <= 36) corners.push(c);
    });
    return corners;
};
