# Fatima Collection - Complete ERP E-commerce Platform
## Localhost Setup Guide

### Prerequisites
1. **Node.js** (v16 or higher) - https://nodejs.org/
2. **Python** (v3.8 or higher) - https://www.python.org/
3. **MongoDB** (v4.4 or higher) - https://www.mongodb.com/try/download/community
4. **Yarn** package manager - `npm install -g yarn`

---

## Installation Steps

### 1. Extract the Project
```bash
# Extract fatima-collection.zip to your desired location
# Navigate to the project directory
cd fatima-collection
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (if not exists)
# Copy the following content to backend/.env:
```

**backend/.env file:**
```env
MONGO_URL=mongodb://localhost:27017/fatima_db
DB_NAME=fatima_db
JWT_SECRET=your-secret-key-change-this-in-production
UNSPLASH_ACCESS_KEY=your-unsplash-key-optional
```

```bash
# Initialize database with default accounts and seed data
python seed_data.py
python erp/init_accounts.py

# Start the backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Backend will run on: http://localhost:8001**

---

### 3. Frontend Setup

Open a **NEW TERMINAL** and:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Create .env file (if not exists)
# Copy the following content to frontend/.env:
```

**frontend/.env file:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

```bash
# Start the frontend development server
yarn start
```

**Frontend will run on: http://localhost:3000**

---

## Default Admin Credentials

After running seed_data.py, use these credentials:

- **Email:** admin@fatimaCollection.com
- **Password:** admin123
- **Mobile:** 8999967710

---

## Admin Settings

After login as admin, go to:
**Profile Menu → Settings**

You can update:
- Username
- Mobile Number  
- Facebook Page Link
- Instagram Page Link
- Password

---

## Key Features

### E-commerce Features:
- Product catalog with 3D viewer
- Shopping cart & checkout
- Order management

### ERP Features:
- Double-entry accounting system
- Chart of Accounts (29 accounts)
- Items & Inventory management
- Parties (Customers & Suppliers)
- Sales Invoice (multi-line)
- Purchase Bill (multi-line)
- Expense Vouchers
- GST compliance
- Outstanding Reports
- Profit & Loss Statement
- Balance Sheet
- Stock Reports

### Marketing Features:
- Canva-like designer
- Unsplash image integration
- Design templates

---

## Support
- Phone: 8999967710
