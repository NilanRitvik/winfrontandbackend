const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ticketId: { type: String, unique: true },
    type: { type: String, required: true }, // e.g., 'DEPOSIT_ISSUE', 'GENERAL'
    status: { type: String, default: 'open' }, // open, in_progress, resolved
    details: {
        amount: String,
        date: String,
        utr: String,
        method: String,
        description: String
    },
    messages: [{
        sender: { type: String, enum: ['user', 'agent', 'system'] },
        text: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);
