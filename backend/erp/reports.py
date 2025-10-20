from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import os

router = APIRouter(prefix="/erp/reports", tags=["ERP-Reports"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.get("/sales-summary")
async def get_sales_summary(start_date: str = None, end_date: str = None):
    query = {}
    
    sales = await db.erp_sales.find(query, {"_id": 0}).to_list(1000)
    
    total_sales = sum(sale.get('total_amount', 0) for sale in sales)
    total_tax = sum(sale.get('tax_amount', 0) for sale in sales)
    paid_amount = sum(sale.get('paid_amount', 0) for sale in sales)
    pending_amount = total_sales - paid_amount
    
    return {
        "total_sales": total_sales,
        "total_tax": total_tax,
        "paid_amount": paid_amount,
        "pending_amount": pending_amount,
        "number_of_invoices": len(sales)
    }

@router.get("/purchase-summary")
async def get_purchase_summary():
    purchases = await db.erp_purchases.find({}, {"_id": 0}).to_list(1000)
    
    total_purchases = sum(purchase.get('total_amount', 0) for purchase in purchases)
    total_tax = sum(purchase.get('tax_amount', 0) for purchase in purchases)
    paid_amount = sum(purchase.get('paid_amount', 0) for purchase in purchases)
    pending_amount = total_purchases - paid_amount
    
    return {
        "total_purchases": total_purchases,
        "total_tax": total_tax,
        "paid_amount": paid_amount,
        "pending_amount": pending_amount,
        "number_of_bills": len(purchases)
    }

@router.get("/stock-summary")
async def get_stock_summary():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    
    total_items = len(products)
    low_stock_items = [p for p in products if p.get('stock', 0) < 10]
    out_of_stock = [p for p in products if p.get('stock', 0) == 0]
    
    total_stock_value = sum(p.get('price', 0) * p.get('stock', 0) for p in products)
    
    return {
        "total_items": total_items,
        "low_stock_items": len(low_stock_items),
        "out_of_stock": len(out_of_stock),
        "total_stock_value": total_stock_value,
        "low_stock_products": [{
            "id": p['id'],
            "name": p['name'],
            "stock": p.get('stock', 0)
        } for p in low_stock_items]
    }

@router.get("/party-outstanding")
async def get_party_outstanding():
    parties = await db.erp_parties.find({}, {"_id": 0}).to_list(100)
    
    outstanding = []
    for party in parties:
        party_id = party['id']
        
        # Get sales
        sales = await db.erp_sales.find({"party_id": party_id}, {"_id": 0}).to_list(100)
        total_sales = sum(sale.get('total_amount', 0) for sale in sales)
        paid_sales = sum(sale.get('paid_amount', 0) for sale in sales)
        
        # Get purchases
        purchases = await db.erp_purchases.find({"supplier_id": party_id}, {"_id": 0}).to_list(100)
        total_purchases = sum(purchase.get('total_amount', 0) for purchase in purchases)
        paid_purchases = sum(purchase.get('paid_amount', 0) for purchase in purchases)
        
        receivable = total_sales - paid_sales
        payable = total_purchases - paid_purchases
        
        if receivable > 0 or payable > 0:
            outstanding.append({
                "party_id": party_id,
                "party_name": party['name'],
                "party_type": party['party_type'],
                "receivable": receivable,
                "payable": payable
            })
    
    return outstanding
