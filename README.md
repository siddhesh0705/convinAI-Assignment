# Expense Sharing Application

A backend REST API for managing shared expenses between users. The application allows users to add expenses and split them using different methods: equal splits, exact amounts, and percentages.

## Features

- User Management
  - User registration and authentication
  - JWT-based authentication
  - User profile management

- Expense Management
  - Create expenses with multiple splitting options
  - Equal splits
  - Exact amount splits
  - Percentage-based splits
  - View individual expenses
  - View group expenses
  - Generate expense reports

- Split Methods
  1. Equal Split: Amount divided equally among participants
  2. Exact Split: Specify exact amount for each participant
  3. Percentage Split: Split based on specified percentages

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JSON Web Tokens (JWT)
- PDFKit (for report generation)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm/yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/expense-sharing-app.git
cd expense-sharing-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE expense_sharing;
```

4. Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/expense_sharing
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

5. Run database migrations:
```bash
npm run migrate
```

6. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### User Management

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobileNumber": "1234567890"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Details
```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Expense Management

#### Create Expense with Equal Split
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Dinner",
  "amount": 3000,
  "splitType": "EQUAL",
  "shares": [
    {"userId": "user_id_1"},
    {"userId": "user_id_2"},
    {"userId": "user_id_3"}
  ]
}
```

#### Create Expense with Exact Split
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Shopping",
  "amount": 4299,
  "splitType": "EXACT",
  "shares": [
    {"userId": "user_id_1", "share": 1500},
    {"userId": "user_id_2", "share": 799},
    {"userId": "user_id_3", "share": 2000}
  ]
}
```

#### Create Expense with Percentage Split
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Party",
  "amount": 1000,
  "splitType": "PERCENTAGE",
  "shares": [
    {"userId": "user_id_1", "percentage": 50},
    {"userId": "user_id_2", "percentage": 25},
    {"userId": "user_id_3", "percentage": 25}
  ]
}
```

#### Get User Expenses
```http
GET /api/expenses/user/:userId
Authorization: Bearer <token>
```

#### Get All Expenses
```http
GET /api/expenses
Authorization: Bearer <token>
```

#### Download Balance Sheet
```http
GET /api/expenses/balance-sheet
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- id (UUID, Primary Key)
- name (String)
- email (String, Unique)
- password (String, Hashed)
- mobileNumber (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Expenses Table
- id (UUID, Primary Key)
- description (String)
- amount (Decimal)
- paidById (UUID, Foreign Key)
- splitType (Enum: EQUAL, EXACT, PERCENTAGE)
- createdAt (DateTime)
- updatedAt (DateTime)

### ExpenseShares Table
- id (UUID, Primary Key)
- expenseId (UUID, Foreign Key)
- userId (UUID, Foreign Key)
- share (Decimal)
- percentage (Decimal, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

## Running Tests

1. Create a test database:
```sql
CREATE DATABASE expense_sharing_test;
```

2. Run tests:
```bash
npm test
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email techsupport@example.com or create an issue in the repository.
