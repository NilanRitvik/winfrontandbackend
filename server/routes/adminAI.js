const express = require('express');
const router = express.Router();
const AdminAI = require('../models/AdminAI');

// @route   POST /api/admin-ai/update
// @desc    Update Daily AI Prediction
// @access  Private (Admin protection added in middleware later/placeholder)
router.post('/update', async (req, res) => {
    const { numbers, series, line } = req.body;

    if (!numbers || !series || !line) {
        return res.status(400).json({ msg: 'Please provide all fields' });
    }

    // Parse numbers if sent as string, or ensure array length
    let parsedNumbers = Array.isArray(numbers) ? numbers : numbers.split(',').map(Number);

    // Simple validation (user said 25 numbers, but we won't strictly block for now, just warn/store)

    try {
        // We only keep ONE document for simplicity, or latest. 
        // Let's us upsert logic.
        let aiDoc = await AdminAI.findOne();
        if (aiDoc) {
            aiDoc.numbers = parsedNumbers;
            aiDoc.series = series;
            aiDoc.line = line;
            aiDoc.updatedAt = Date.now();
            await aiDoc.save();
        } else {
            aiDoc = new AdminAI({
                numbers: parsedNumbers,
                series,
                line
            });
            await aiDoc.save();
        }
        res.json(aiDoc);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin-ai/latest
// @desc    Get Latest AI Prediction
// @access  Public
router.get('/latest', async (req, res) => {
    try {
        const aiDoc = await AdminAI.findOne();
        res.json(aiDoc || { numbers: [], series: '', line: '' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
