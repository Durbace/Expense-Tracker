const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    amount: Number,
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
