# 🎨 Fatima Collection - Complete Setup Guide

## 📦 Project Files

**Archive:** `fatima-collection.tar.gz` (5.5 MB)
**Includes:** Complete backend & frontend source code

---

## 🚀 Quick Start (Hindi/English)

### Prerequisites (Pehle Ye Install Karein)

1. **Node.js** (v16+) - https://nodejs.org/
   - Download karein aur install karein
   - Verify: Terminal me `node --version` run karein

2. **Python** (v3.8+) - https://www.python.org/
   - Download karein aur install karein
   - Verify: `python --version` run karein

3. **MongoDB** (v4.4+) - https://www.mongodb.com/try/download/community
   - Download karein aur install karein
   - Windows: MongoDB service start karein
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

4. **Yarn** - `npm install -g yarn`
   - Terminal me ye command run karein

---

## 📂 Step-by-Step Installation

### Step 1: Extract Files
```bash
# Archive ko extract karein
tar -xzf fatima-collection.tar.gz
cd fatima-collection
```

### Step 2: Backend Setup

```bash
# Backend folder me jaaye
cd backend

# Virtual environment banaye (optional but recommended)
python -m venv venv

# Virtual environment activate karein
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Dependencies install karein
pip install -r requirements.txt

# .env file banaye
# Ye content copy karke backend/.env file me paste karein:
```

**backend/.env file:**
```env
MONGO_URL=mongodb://localhost:27017/fatima_db
DB_NAME=fatima_db
JWT_SECRET=your-secret-key-change-in-production
UNSPLASH_ACCESS_KEY=your-unsplash-key-optional
```

```bash
# Database initialize karein
python seed_data.py
python erp/init_accounts.py

# Backend start karein
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

✅ **Backend ab http://localhost:8001 par chal raha hai**

---

### Step 3: Frontend Setup (NAYA TERMINAL KHOLEIN)

```bash
# Frontend folder me jaaye
cd frontend

# Dependencies install karein
yarn install

# .env file banaye
# Ye content copy karke frontend/.env file me paste karein:
```

**frontend/.env file:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

```bash
# Frontend start karein
yarn start
```

✅ **Frontend ab http://localhost:3000 par khul jayega**

---

## 🔑 Default Admin Login

- **Email:** admin@fatimaCollection.com
- **Password:** admin123
- **Mobile:** 8999967710

---

## 📁 Project Structure

```
fatima-collection/
├── backend/                    # FastAPI Backend
│   ├── erp/                   # ERP Module
│   │   ├── accounting_models.py
│   │   ├── accounting_api.py
│   │   ├── vouchers_api.py
│   │   ├── reports_api.py
│   │   ├── init_accounts.py
│   │   └── ...
│   ├── uploads/               # Uploaded files folder
│   ├── server.py              # Main FastAPI app
│   ├── seed_data.py           # Database seed script
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (CREATE THIS)
│
└── frontend/                  # React Frontend
    ├── src/
    │   ├── components/        # UI components
    │   ├── pages/
    │   │   ├── admin/        # Admin pages
    │   │   ├── erp/          # ERP pages
    │   │   └── marketing/    # Designer pages
    │   ├── context/          # React contexts
    │   ├── App.js            # Main app
    │   └── index.js          # Entry point
    ├── public/
    ├── package.json          # Dependencies
    └── .env                  # Environment variables (CREATE THIS)
```

---

## 🔧 Common Issues & Solutions

### Issue 1: MongoDB Connection Error
**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# MongoDB service start karein
# Windows: Services app me MongoDB service start karein
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Verify MongoDB chal raha hai:
# Mac/Linux: sudo systemctl status mongod
```

### Issue 2: Port Already in Use
**Error:** `Port 8001/3000 already in use`

**Solution:**
```bash
# Backend ke liye (port 8001):
# Windows: netstat -ano | findstr :8001
# Mac/Linux: lsof -ti:8001 | xargs kill

# Frontend ke liye (port 3000):
# Press Y when asked to use different port
```

### Issue 3: Module Not Found
**Backend Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend Error:** `Module not found: Can't resolve`

**Solution:**
```bash
cd frontend
rm -rf node_modules yarn.lock
yarn install
```

### Issue 4: Python Command Not Found
**Windows:** Use `python` instead of `python3`
**Mac/Linux:** Use `python3` instead of `python`

```bash
# Check which works:
python --version
python3 --version
```

---

## 📱 Features Included

### ✅ E-commerce
- Product catalog with 3D viewer
- Shopping cart & checkout
- Order management
- Customer authentication

### ✅ Complete ERP System
- Double-entry accounting
- Chart of Accounts (29 accounts)
- Items & Inventory
- Parties (Customers/Suppliers)
- Sales Invoices (multi-line)
- Purchase Bills (multi-line)
- Expense Vouchers
- Payment/Receipt Vouchers
- GST compliance
- Outstanding Reports
- Profit & Loss Statement
- Balance Sheet
- Stock Reports

### ✅ Professional Designer
- CorelDraw-like text editing
- 8 ready templates
- Image upload & editing
- Text effects (Bold, Italic, Shadow)
- Social media sharing
- Unsplash image library

### ✅ Admin Features
- Product management
- Order management
- Dashboard analytics
- Settings (Logo, Social links, Password)

---

## 🌐 URLs After Setup

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

---

## 🎯 Quick Test

After setup, test karein:

1. **Frontend kholo:** http://localhost:3000
2. **Login karein** admin credentials se
3. **Admin Dashboard** me jaaye
4. **Professional Designer** kholo
5. Template select karein
6. Text add karein
7. Design save karein

---

## 📊 Database Initialization

`seed_data.py` automatically create karega:
- Admin user (admin@fatimaCollection.com)
- Sample products
- Sample customer

`init_accounts.py` automatically create karega:
- 29 default accounts
- 7 item units
- 5 item categories

---

## 🔄 Restart Commands

**Backend restart:**
```bash
# Stop: Ctrl + C
# Start:
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend restart:**
```bash
# Stop: Ctrl + C
# Start:
cd frontend
yarn start
```

---

## 🛠️ Development Commands

**Backend:**
```bash
# Install new package:
pip install package_name
pip freeze > requirements.txt

# Database reset:
# Drop database from MongoDB and run seed_data.py again
```

**Frontend:**
```bash
# Install new package:
yarn add package_name

# Build for production:
yarn build

# Clear cache:
yarn cache clean
```

---

## 📞 Support

Mobile: 8999967710

---

## ✅ Checklist Before Starting

- [ ] Node.js installed
- [ ] Python installed
- [ ] MongoDB installed & running
- [ ] Yarn installed
- [ ] Archive extracted
- [ ] Backend .env file created
- [ ] Frontend .env file created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Database initialized (seed_data.py)
- [ ] Chart of accounts initialized (init_accounts.py)
- [ ] Backend running on port 8001
- [ ] Frontend running on port 3000
- [ ] Can login as admin

---

## 🎉 You're Ready!

Agar sab steps follow kiye to aapka app localhost:3000 par chal raha hoga!

**Next Steps:**
1. Logo upload karein (Settings me)
2. Facebook/Instagram links add karein
3. Products add karein
4. Designs banaye
5. ERP use karein

---

**Version:** 1.0.0  
**Last Updated:** October 2024
