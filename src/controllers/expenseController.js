const {User , Expense , ExpenseShare} = require('../models');
const PDFDocument = require('pdfkit');
const sequelize = require('../config/database');

const expenseController = {
  async addExpense(req, res) {
    const t = await sequelize.transaction();
    try {
      const { description, amount, splitType, shares } = req.body;

      // Validate total shares/percentages
      if (splitType === 'PERCENTAGE') {
        const totalPercentage = shares.reduce((sum, share) => sum + share.percentage, 0);
        if (totalPercentage !== 100) {
          throw new Error('Percentages must add up to 100');
        }
      } else if (splitType === 'EXACT') {
        const totalShares = shares.reduce((sum, share) => sum + share.share, 0);
        if (totalShares !== amount) {
          throw new Error('Shares must add up to total amount');
        }
      }

      // Create expense
      const expense = await Expense.create({
        description,
        amount,
        paidById: req.user.id,
        splitType
      }, { transaction: t });

      // Create expense shares
      const expenseShares = shares.map(share => ({
        expenseId: expense.id,
        userId: share.userId,
        share: splitType === 'EQUAL' ? amount / shares.length :
               splitType === 'EXACT' ? share.share :
               (amount * share.percentage) / 100,
        percentage: splitType === 'PERCENTAGE' ? share.percentage : null
      }));

      await ExpenseShare.bulkCreate(expenseShares, { transaction: t });
      await t.commit();

      res.status(201).json({ expense, shares: expenseShares });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ error: error.message });
    }
  },

  async getUserExpenses(req, res) {
    try {
      const expenses = await ExpenseShare.findAll({
        where: { userId: req.params.userId },
        include: [{
          model: Expense,
          include: [{
            model: User,
            as: 'paidBy'
          }]
        }]
      });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllExpenses(req, res) {
    try {
      const expenses = await Expense.findAll({
        include: [{
          model: ExpenseShare,
          include: [{
            model: User
          }]
        }, {
          model: User,
          as: 'paidBy'
        }]
      });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async downloadBalanceSheet(req, res) {
    try {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=balance-sheet.pdf');
      doc.pipe(res);

      // Get all expenses for user
      const expenses = await ExpenseShare.findAll({
        where: { userId: req.user.id },
        include: [{
          model: Expense,
          include: [{
            model: User,
            as: 'paidBy'
          }]
        }]
      });

      doc.fontSize(20).text('Balance Sheet', { align: 'center' });
      doc.moveDown();

      expenses.forEach(expense => {
        doc.fontSize(14).text(`Expense: ${expense.Expense.description}`);
        doc.fontSize(12).text(`Amount: ${expense.share}`);
        doc.fontSize(12).text(`Paid by: ${expense.Expense.paidBy.name}`);
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = expenseController;
