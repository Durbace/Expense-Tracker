const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    amount: Number,
    day: String
});

module.exports = mongoose.model('Expense', expenseSchema);
