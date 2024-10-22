const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { validateExpense } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/expenses', auth, validateExpense, expenseController.addExpense);
router.get('/expenses/user/:userId', auth, expenseController.getUserExpenses);
router.get('/expenses', auth, expenseController.getAllExpenses);
router.get('/expenses/balance-sheet', auth, expenseController.downloadBalanceSheet);

module.exports = router;