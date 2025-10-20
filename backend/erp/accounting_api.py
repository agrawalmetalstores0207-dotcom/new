"""
Accounting System APIs - Chart of Accounts, Items, Parties
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from erp.accounting_models import (
    Account, AccountCreate, Item, ItemCreate, ItemUnit, ItemCategory,
    Party, PartyCreate
)
from server import get_current_admin, User, db

router = APIRouter()

# ==================== CHART OF ACCOUNTS ====================

@router.post("/erp/accounts", response_model=Account)
async def create_account(account: AccountCreate, current_user: User = Depends(get_current_admin)):
    """Create new account in chart of accounts"""
    # Check if account code already exists
    existing = await db.accounts.find_one({"code": account.code})
    if existing:
        raise HTTPException(status_code=400, detail="Account code already exists")
    
    account_data = Account(**account.model_dump())
    account_data.current_balance = account_data.opening_balance
    
    account_dict = account_data.model_dump()
    account_dict['created_at'] = account_dict['created_at'].isoformat()
    
    await db.accounts.insert_one(account_dict)
    return account_data

@router.get("/erp/accounts", response_model=List[Account])
async def get_accounts(current_user: User = Depends(get_current_admin)):
    """Get all accounts"""
    accounts = await db.accounts.find({}, {"_id": 0}).sort("code", 1).to_list(1000)
    for acc in accounts:
        if isinstance(acc.get('created_at'), str):
            acc['created_at'] = datetime.fromisoformat(acc['created_at'])
    return accounts

@router.get("/erp/accounts/{account_id}", response_model=Account)
async def get_account(account_id: str, current_user: User = Depends(get_current_admin)):
    """Get account by ID"""
    account = await db.accounts.find_one({"id": account_id}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if isinstance(account.get('created_at'), str):
        account['created_at'] = datetime.fromisoformat(account['created_at'])
    return account

@router.put("/erp/accounts/{account_id}", response_model=Account)
async def update_account(account_id: str, account: AccountCreate, current_user: User = Depends(get_current_admin)):
    """Update account"""
    existing = await db.accounts.find_one({"id": account_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = account.model_dump()
    update_data['current_balance'] = existing.get('current_balance', update_data['opening_balance'])
    
    await db.accounts.update_one({"id": account_id}, {"$set": update_data})
    
    updated = await db.accounts.find_one({"id": account_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Account(**updated)

@router.delete("/erp/accounts/{account_id}")
async def delete_account(account_id: str, current_user: User = Depends(get_current_admin)):
    """Delete account"""
    account = await db.accounts.find_one({"id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.get('is_system'):
        raise HTTPException(status_code=400, detail="Cannot delete system account")
    
    await db.accounts.delete_one({"id": account_id})
    return {"message": "Account deleted successfully"}

# ==================== ITEMS/INVENTORY ====================

@router.post("/erp/items/units", response_model=ItemUnit)
async def create_item_unit(unit: ItemUnit, current_user: User = Depends(get_current_admin)):
    """Create item unit"""
    unit_dict = unit.model_dump()
    await db.item_units.insert_one(unit_dict)
    return unit

@router.get("/erp/items/units", response_model=List[ItemUnit])
async def get_item_units(current_user: User = Depends(get_current_admin)):
    """Get all item units"""
    units = await db.item_units.find({}, {"_id": 0}).to_list(100)
    return units

@router.post("/erp/items/categories", response_model=ItemCategory)
async def create_item_category(category: ItemCategory, current_user: User = Depends(get_current_admin)):
    """Create item category"""
    category_dict = category.model_dump()
    await db.item_categories.insert_one(category_dict)
    return category

@router.get("/erp/items/categories", response_model=List[ItemCategory])
async def get_item_categories(current_user: User = Depends(get_current_admin)):
    """Get all item categories"""
    categories = await db.item_categories.find({}, {"_id": 0}).to_list(100)
    return categories

@router.post("/erp/items", response_model=Item)
async def create_item(item: ItemCreate, current_user: User = Depends(get_current_admin)):
    """Create inventory item"""
    # Check if item code already exists
    existing = await db.items.find_one({"code": item.code})
    if existing:
        raise HTTPException(status_code=400, detail="Item code already exists")
    
    item_data = Item(**item.model_dump())
    item_data.current_stock = item_data.opening_stock
    
    item_dict = item_data.model_dump()
    item_dict['created_at'] = item_dict['created_at'].isoformat()
    item_dict['updated_at'] = item_dict['updated_at'].isoformat()
    
    await db.items.insert_one(item_dict)
    return item_data

@router.get("/erp/items", response_model=List[Item])
async def get_items(current_user: User = Depends(get_current_admin)):
    """Get all items"""
    items = await db.items.find({}, {"_id": 0}).sort("name", 1).to_list(1000)
    for item in items:
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item.get('updated_at'), str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return items

@router.get("/erp/items/{item_id}", response_model=Item)
async def get_item(item_id: str, current_user: User = Depends(get_current_admin)):
    """Get item by ID"""
    item = await db.items.find_one({"id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    if isinstance(item.get('updated_at'), str):
        item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    return item

@router.put("/erp/items/{item_id}", response_model=Item)
async def update_item(item_id: str, item: ItemCreate, current_user: User = Depends(get_current_admin)):
    """Update item"""
    existing = await db.items.find_one({"id": item_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump()
    update_data['current_stock'] = existing.get('current_stock', update_data['opening_stock'])
    update_data['updated_at'] = datetime.now().isoformat()
    
    await db.items.update_one({"id": item_id}, {"$set": update_data})
    
    updated = await db.items.find_one({"id": item_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    return Item(**updated)

@router.delete("/erp/items/{item_id}")
async def delete_item(item_id: str, current_user: User = Depends(get_current_admin)):
    """Delete item"""
    item = await db.items.find_one({"id": item_id})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.items.delete_one({"id": item_id})
    return {"message": "Item deleted successfully"}

# ==================== PARTIES (Customers/Suppliers) ====================

@router.post("/erp/parties", response_model=Party)
async def create_party(party: PartyCreate, current_user: User = Depends(get_current_admin)):
    """Create customer or supplier"""
    # Check if party code already exists
    existing = await db.parties.find_one({"code": party.code, "party_type": party.party_type})
    if existing:
        raise HTTPException(status_code=400, detail="Party code already exists")
    
    party_data = Party(**party.model_dump())
    
    party_dict = party_data.model_dump()
    party_dict['created_at'] = party_dict['created_at'].isoformat()
    
    await db.parties.insert_one(party_dict)
    return party_data

@router.get("/erp/parties", response_model=List[Party])
async def get_parties(party_type: str = None, current_user: User = Depends(get_current_admin)):
    """Get all parties (optionally filter by type)"""
    query = {"party_type": party_type} if party_type else {}
    parties = await db.parties.find(query, {"_id": 0}).sort("name", 1).to_list(1000)
    for party in parties:
        if isinstance(party.get('created_at'), str):
            party['created_at'] = datetime.fromisoformat(party['created_at'])
    return parties

@router.get("/erp/parties/{party_id}", response_model=Party)
async def get_party(party_id: str, current_user: User = Depends(get_current_admin)):
    """Get party by ID"""
    party = await db.parties.find_one({"id": party_id}, {"_id": 0})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    if isinstance(party.get('created_at'), str):
        party['created_at'] = datetime.fromisoformat(party['created_at'])
    return party

@router.put("/erp/parties/{party_id}", response_model=Party)
async def update_party(party_id: str, party: PartyCreate, current_user: User = Depends(get_current_admin)):
    """Update party"""
    existing = await db.parties.find_one({"id": party_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Party not found")
    
    update_data = party.model_dump()
    
    await db.parties.update_one({"id": party_id}, {"$set": update_data})
    
    updated = await db.parties.find_one({"id": party_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return Party(**updated)

@router.delete("/erp/parties/{party_id}")
async def delete_party(party_id: str, current_user: User = Depends(get_current_admin)):
    """Delete party"""
    party = await db.parties.find_one({"id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    await db.parties.delete_one({"id": party_id})
    return {"message": "Party deleted successfully"}
