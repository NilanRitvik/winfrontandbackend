const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const crypto = require('crypto');

// Create Ticket
router.post('/create', async (req, res) => {
    try {
        const { userId, type, details } = req.body;
        const ticketId = 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const ticket = new Ticket({
            userId,
            ticketId,
            type,
            details,
            messages: [{ sender: 'system', text: `Ticket created. Reference: ${ticketId}` }]
        });

        await ticket.save();
        res.json({ success: true, ticketId, msg: 'Ticket raised successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
