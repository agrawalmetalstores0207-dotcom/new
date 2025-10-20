from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from .models import PurchaseEntry, PurchaseEntryCreate
import os
import random

router = APIRouter(prefix="/erp/purchases", tags=["ERP-Purchase"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("/", response_model=PurchaseEntry)
async def create_purchase(purchase_data: PurchaseEntryCreate):
    subtotal = sum(item.amount for item in purchase_data.items)
    tax_amount = subtotal * (purchase_data.tax_percentage / 100)
    total_amount = subtotal + tax_amount
    
    bill_number = f"BILL{random.randint(1000, 9999)}"
    
    purchase = PurchaseEntry(
        bill_number=bill_number,
        supplier_name=purchase_data.supplier_name,
        supplier_id=purchase_data.supplier_id,
        items=[item.model_dump() for item in purchase_data.items],
        subtotal=subtotal,
        tax_percentage=purchase_data.tax_percentage,
        tax_amount=tax_amount,
        total_amount=total_amount,
        notes=purchase_data.notes
    )
    
    purchase_doc = purchase.model_dump()
    purchase_doc['date'] = purchase_doc['date'].isoformat()
    purchase_doc['created_at'] = purchase_doc['created_at'].isoformat()
    
    await db.erp_purchases.insert_one(purchase_doc)
    
    # Update stock
    for item in purchase_data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": item.quantity}}
        )
    
    return purchase

@router.get("/", response_model=list[PurchaseEntry])
async def get_purchases(limit: int = 50):
    purchases = await db.erp_purchases.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for purchase in purchases:
        if isinstance(purchase.get('date'), str):
            purchase['date'] = datetime.fromisoformat(purchase['date'])
        if isinstance(purchase.get('created_at'), str):
            purchase['created_at'] = datetime.fromisoformat(purchase['created_at'])
    
    return purchases

@router.get("/{purchase_id}", response_model=PurchaseEntry)
async def get_purchase(purchase_id: str):
    purchase = await db.erp_purchases.find_one({"id": purchase_id}, {"_id": 0})
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
    
    if isinstance(purchase.get('date'), str):
        purchase['date'] = datetime.fromisoformat(purchase['date'])
    if isinstance(purchase.get('created_at'), str):
        purchase['created_at'] = datetime.fromisoformat(purchase['created_at'])
    
    return PurchaseEntry(**purchase)
