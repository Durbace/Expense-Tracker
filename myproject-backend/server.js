const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const User = require('./models/User'); 
const Expense = require('./models/Expense'); 
const Budget = require('./models/Budget'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; 
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));

    app.use(cors({
        origin: 'http://localhost:4200', 
        credentials: true, 
      }));
app.use(bodyParser.json());
app.use(cookieParser());

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true, 
            maxAge: 3600000 // 1 ora
        });

        res.status(200).json({
            success: true,
            message: 'User logged in successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

app.get('/protected-route', authenticateToken, (req, res) => {
    res.status(200).json({ success: true, message: 'Access granted', userId: req.user.userId });
});

app.get('/check-auth', authenticateToken, (req, res) => {
    res.status(200).json({ success: true, userId: req.user.userId.toString() });
});

app.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

app.post('/expenses', async (req, res) => {
    const { userId, day, category, amount } = req.body;
    try {
        const expense = new Expense({ user: userId, day, category, amount });
        await expense.save();
        res.status(201).json({ success: true, message: 'Expense added successfully', expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/expenses/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const expenses = await Expense.find({ user: userId });
        const formattedExpenses = expenses.map(expense => ({
            id: expense._id,
            day: expense.day,
            category: expense.category,
            amount: expense.amount,
        }));
        res.status(200).json({ success: true, expenses: formattedExpenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    try {
        await Expense.findByIdAndDelete(expenseId);
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    const { category, amount } = req.body;
    try {
        const expense = await Expense.findByIdAndUpdate(
            expenseId,
            { category, amount },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Expense updated successfully', expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/expenses/calculate/weekly-total/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const expenses = await Expense.find({ user: userId });
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        res.status(200).json({ success: true, total });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/expenses/reset/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await Expense.deleteMany({ user: userId });
        res.status(200).json({ success: true, message: 'Weekly expenses reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/budgets', async (req, res) => {
    try {
        console.log('Received request body:', JSON.stringify(req.body, null, 2));

        const { userId, weekNumber, budget, expenses } = req.body;

        // Validare userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const savings = budget - expenses;

        const budgetEntry = await Budget.findOneAndUpdate(
            { user: new mongoose.Types.ObjectId(userId), weekNumber },
            { budget, expenses, savings },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, budget: budgetEntry });
    } catch (error) {
        console.error('Error saving budget:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

  
app.get('/budgets/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const budgets = await Budget.find({ user: userId });
        res.status(200).json({ success: true, budgets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/budgets/current/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const currentBudget = await Budget.findOne({ user: userId }).sort({ weekNumber: -1 });
        res.status(200).json({ success: true, currentBudget });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/budgets/reset/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        await Budget.deleteMany({ user: userId });
        res.status(200).json({ success: true, message: 'Budgets reset successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
