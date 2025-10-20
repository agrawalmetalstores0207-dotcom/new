from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from .models import SaleEntry, SaleEntryCreate, SaleItem
import os
import random

router = APIRouter(prefix="/erp/sales", tags=["ERP-Sales"])

# Get DB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("/", response_model=SaleEntry)
async def create_sale(sale_data: SaleEntryCreate):
    # Calculate amounts
    subtotal = sum(item.amount for item in sale_data.items)
    tax_amount = subtotal * (sale_data.tax_percentage / 100)
    total_amount = subtotal + tax_amount
    
    # Generate invoice number
    invoice_number = f"INV{random.randint(1000, 9999)}"
    
    sale = SaleEntry(
        invoice_number=invoice_number,
        party_name=sale_data.party_name,
        party_id=sale_data.party_id,
        items=[item.model_dump() for item in sale_data.items],
        subtotal=subtotal,
        tax_percentage=sale_data.tax_percentage,
        tax_amount=tax_amount,
        total_amount=total_amount,
        notes=sale_data.notes
    )
    
    # Save to database
    sale_doc = sale.model_dump()
    sale_doc['date'] = sale_doc['date'].isoformat()
    sale_doc['created_at'] = sale_doc['created_at'].isoformat()
    
    await db.erp_sales.insert_one(sale_doc)
    
    # Update stock
    for item in sale_data.items:
        await db.products.update_one(
            {"id": item.product_id},
            {"$inc": {"stock": -item.quantity}}
        )
    
    return sale

@router.get("/", response_model=list[SaleEntry])
async def get_sales(limit: int = 50):
    sales = await db.erp_sales.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for sale in sales:
        if isinstance(sale.get('date'), str):
            sale['date'] = datetime.fromisoformat(sale['date'])
        if isinstance(sale.get('created_at'), str):
            sale['created_at'] = datetime.fromisoformat(sale['created_at'])
    
    return sales

@router.get("/{sale_id}", response_model=SaleEntry)
async def get_sale(sale_id: str):
    sale = await db.erp_sales.find_one({"id": sale_id}, {"_id": 0})
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    if isinstance(sale.get('date'), str):
        sale['date'] = datetime.fromisoformat(sale['date'])
    if isinstance(sale.get('created_at'), str):
        sale['created_at'] = datetime.fromisoformat(sale['created_at'])
    
    return SaleEntry(**sale)

@router.patch("/{sale_id}/payment")
async def update_payment(sale_id: str, paid_amount: float):
    sale = await db.erp_sales.find_one({"id": sale_id}, {"_id": 0})
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    new_paid = sale.get('paid_amount', 0) + paid_amount
    total = sale['total_amount']
    
    payment_status = "unpaid"
    if new_paid >= total:
        payment_status = "paid"
    elif new_paid > 0:
        payment_status = "partial"
    
    await db.erp_sales.update_one(
        {"id": sale_id},
        {"$set": {"paid_amount": new_paid, "payment_status": payment_status}}
    )
    
    return {"message": "Payment updated", "paid_amount": new_paid, "payment_status": payment_status}
