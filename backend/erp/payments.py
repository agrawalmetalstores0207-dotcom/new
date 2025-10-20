from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from .models import PaymentEntry, PaymentEntryCreate, Party, PartyCreate
import os

router = APIRouter(prefix="/erp/payments", tags=["ERP-Payments"])

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

@router.post("/", response_model=PaymentEntry)
async def create_payment(payment_data: PaymentEntryCreate):
    payment = PaymentEntry(**payment_data.model_dump())
    
    payment_doc = payment.model_dump()
    payment_doc['date'] = payment_doc['date'].isoformat()
    payment_doc['created_at'] = payment_doc['created_at'].isoformat()
    
    await db.erp_payments.insert_one(payment_doc)
    
    return payment

@router.get("/", response_model=list[PaymentEntry])
async def get_payments(payment_type: str = None, limit: int = 50):
    query = {}
    if payment_type:
        query['payment_type'] = payment_type
    
    payments = await db.erp_payments.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    for payment in payments:
        if isinstance(payment.get('date'), str):
            payment['date'] = datetime.fromisoformat(payment['date'])
        if isinstance(payment.get('created_at'), str):
            payment['created_at'] = datetime.fromisoformat(payment['created_at'])
    
    return payments

# Party/Customer Management
party_router = APIRouter(prefix="/erp/parties", tags=["ERP-Parties"])

@party_router.post("/", response_model=Party)
async def create_party(party_data: PartyCreate):
    party = Party(**party_data.model_dump())
    
    party_doc = party.model_dump()
    party_doc['created_at'] = party_doc['created_at'].isoformat()
    
    await db.erp_parties.insert_one(party_doc)
    
    return party

@party_router.get("/", response_model=list[Party])
async def get_parties(party_type: str = None):
    query = {}
    if party_type:
        query['party_type'] = party_type
    
    parties = await db.erp_parties.find(query, {"_id": 0}).to_list(100)
    
    for party in parties:
        if isinstance(party.get('created_at'), str):
            party['created_at'] = datetime.fromisoformat(party['created_at'])
    
    return parties

@party_router.get("/{party_id}/ledger")
async def get_party_ledger(party_id: str):
    party = await db.erp_parties.find_one({"id": party_id}, {"_id": 0})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    # Get sales
    sales = await db.erp_sales.find({"party_id": party_id}, {"_id": 0}).to_list(100)
    
    # Get purchases
    purchases = await db.erp_purchases.find({"supplier_id": party_id}, {"_id": 0}).to_list(100)
    
    # Get payments
    payments = await db.erp_payments.find({"party_id": party_id}, {"_id": 0}).to_list(100)
    
    return {
        "party": party,
        "sales": sales,
        "purchases": purchases,
        "payments": payments
    }
