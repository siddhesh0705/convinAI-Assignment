// src/models/index.js
const User = require('./User');
const Expense = require('./Expense');
const ExpenseShare = require('./expenseShare');

// User associations
User.hasMany(Expense, { foreignKey: 'paidById', as: 'paidExpenses' });
User.hasMany(ExpenseShare, { foreignKey: 'userId' });

// Expense associations
Expense.belongsTo(User, { foreignKey: 'paidById', as: 'paidBy' });
Expense.hasMany(ExpenseShare, { foreignKey: 'expenseId' });

// ExpenseShare associations
ExpenseShare.belongsTo(User, { foreignKey: 'userId' });
ExpenseShare.belongsTo(Expense, { foreignKey: 'expenseId' });

module.exports = {
  User,
  Expense,
  ExpenseShare
};