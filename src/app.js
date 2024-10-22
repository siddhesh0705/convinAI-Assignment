const express = require('express');
const router = express.Router();
const expenseController = require('../src/controllers/expenseController');
const { validateExpense } = require('../src/middleware/validate');
const auth = require('../src/middleware/auth');
require('./models')

const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());

// Routes
app.use('/api', userRoutes);
app.use('/api', expenseRoutes);

// Database sync and server start
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer();

module.exports = app;