const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weekNumber: { type: Number, required: true },
    budget: { type: Number, required: true },
    expenses: { type: Number, required: true },
    savings: { type: Number, required: true }
});

module.exports = mongoose.model('Budget', budgetSchema);
