const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paidById: {
    type: DataTypes.UUID,
    allowNull: false
  },
  splitType: {
    type: DataTypes.ENUM('EQUAL', 'EXACT', 'PERCENTAGE'),
    allowNull: false
  }
});

module.exports = Expense;