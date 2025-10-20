"""
Initialize Default Chart of Accounts and Master Data
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
import uuid

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/emergent_db')

async def init_chart_of_accounts():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_database()
    
    print("Initializing Chart of Accounts...")
    
    # Check if accounts already exist
    existing_count = await db.accounts.count_documents({})
    if existing_count > 0:
        print(f"Accounts already exist ({existing_count} accounts). Skipping initialization.")
        return
    
    accounts = [
        # ASSETS (1000-1999)
        {"id": str(uuid.uuid4()), "code": "1001", "name": "Cash in Hand", "group_id": "assets", "account_type": "asset", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "1002", "name": "Bank Account", "group_id": "assets", "account_type": "asset", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "1003", "name": "Inventory/Stock", "group_id": "assets", "account_type": "asset", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "1004", "name": "Furniture & Fixtures", "group_id": "assets", "account_type": "asset", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "1005", "name": "Equipment", "group_id": "assets", "account_type": "asset", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "1006", "name": "GST Input (Receivable)", "group_id": "assets", "account_type": "asset", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        
        # LIABILITIES (2000-2999)
        {"id": str(uuid.uuid4()), "code": "2001", "name": "Sundry Creditors", "group_id": "liabilities", "account_type": "liability", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "2002", "name": "Bank Loan", "group_id": "liabilities", "account_type": "liability", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "2003", "name": "Credit Card", "group_id": "liabilities", "account_type": "liability", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "2005", "name": "GST Output (Payable)", "group_id": "liabilities", "account_type": "liability", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        
        # CAPITAL (3000-3999)
        {"id": str(uuid.uuid4()), "code": "3001", "name": "Owner's Capital", "group_id": "capital", "account_type": "capital", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "3002", "name": "Retained Earnings", "group_id": "capital", "account_type": "capital", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        
        # INCOME (4000-4999)
        {"id": str(uuid.uuid4()), "code": "4001", "name": "Sales Revenue", "group_id": "income", "account_type": "income", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "4002", "name": "Other Income", "group_id": "income", "account_type": "income", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "4003", "name": "Interest Income", "group_id": "income", "account_type": "income", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        
        # EXPENSES (5000-5999)
        {"id": str(uuid.uuid4()), "code": "5001", "name": "Purchase", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": True},
        {"id": str(uuid.uuid4()), "code": "5002", "name": "Rent Expense", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5003", "name": "Salary & Wages", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5004", "name": "Electricity Expense", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5005", "name": "Transport & Travel", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5006", "name": "Telephone Expense", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5007", "name": "Maintenance & Repairs", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5008", "name": "Printing & Stationery", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5009", "name": "Marketing & Advertising", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5010", "name": "Bank Charges", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5011", "name": "Interest Expense", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5012", "name": "Depreciation", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5013", "name": "Insurance", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
        {"id": str(uuid.uuid4()), "code": "5099", "name": "Miscellaneous Expenses", "group_id": "expenses", "account_type": "expense", "opening_balance": 0.0, "current_balance": 0.0, "is_system": False},
    ]
    
    from datetime import datetime
    for account in accounts:
        account['created_at'] = datetime.now().isoformat()
    
    await db.accounts.insert_many(accounts)
    print(f"✅ Created {len(accounts)} default accounts")
    
    # Initialize default units
    print("\nInitializing Item Units...")
    existing_units = await db.item_units.count_documents({})
    if existing_units == 0:
        units = [
            {"id": str(uuid.uuid4()), "name": "Piece", "symbol": "Pcs"},
            {"id": str(uuid.uuid4()), "name": "Kilogram", "symbol": "Kg"},
            {"id": str(uuid.uuid4()), "name": "Gram", "symbol": "g"},
            {"id": str(uuid.uuid4()), "name": "Meter", "symbol": "M"},
            {"id": str(uuid.uuid4()), "name": "Liter", "symbol": "L"},
            {"id": str(uuid.uuid4()), "name": "Box", "symbol": "Box"},
            {"id": str(uuid.uuid4()), "name": "Set", "symbol": "Set"},
        ]
        await db.item_units.insert_many(units)
        print(f"✅ Created {len(units)} item units")
    else:
        print(f"Units already exist ({existing_units} units). Skipping.")
    
    # Initialize default categories
    print("\nInitializing Item Categories...")
    existing_categories = await db.item_categories.count_documents({})
    if existing_categories == 0:
        categories = [
            {"id": str(uuid.uuid4()), "name": "Saree", "description": "Traditional sarees"},
            {"id": str(uuid.uuid4()), "name": "Kurti", "description": "Kurtis and kurta sets"},
            {"id": str(uuid.uuid4()), "name": "Dress Material", "description": "Dress materials and fabrics"},
            {"id": str(uuid.uuid4()), "name": "Cotton Set", "description": "Cotton clothing sets"},
            {"id": str(uuid.uuid4()), "name": "Accessories", "description": "Fashion accessories"},
        ]
        await db.item_categories.insert_many(categories)
        print(f"✅ Created {len(categories)} item categories")
    else:
        print(f"Categories already exist ({existing_categories} categories). Skipping.")
    
    print("\n✅ Chart of Accounts initialization complete!")
    client.close()

if __name__ == "__main__":
    asyncio.run(init_chart_of_accounts())
