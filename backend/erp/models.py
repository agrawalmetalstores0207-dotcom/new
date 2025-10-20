from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# Sales Models
class SaleItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    rate: float
    amount: float
    
class SaleEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    party_name: str
    party_id: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    items: List[SaleItem]
    subtotal: float
    tax_percentage: float = 0
    tax_amount: float = 0
    total_amount: float
    payment_status: str = "unpaid"  # unpaid, partial, paid
    paid_amount: float = 0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SaleEntryCreate(BaseModel):
    party_name: str
    party_id: Optional[str] = None
    items: List[SaleItem]
    tax_percentage: float = 0
    notes: Optional[str] = None

# Purchase Models
class PurchaseItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    rate: float
    amount: float

class PurchaseEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bill_number: str
    supplier_name: str
    supplier_id: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    items: List[PurchaseItem]
    subtotal: float
    tax_percentage: float = 0
    tax_amount: float = 0
    total_amount: float
    payment_status: str = "unpaid"
    paid_amount: float = 0
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PurchaseEntryCreate(BaseModel):
    supplier_name: str
    supplier_id: Optional[str] = None
    items: List[PurchaseItem]
    tax_percentage: float = 0
    notes: Optional[str] = None

# Payment Models
class PaymentEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_type: str  # payment_in, payment_out
    party_name: str
    party_id: Optional[str] = None
    amount: float
    payment_mode: str  # cash, bank, upi, card
    reference_number: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PaymentEntryCreate(BaseModel):
    payment_type: str
    party_name: str
    party_id: Optional[str] = None
    amount: float
    payment_mode: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

# Party/Customer Models
class Party(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    party_type: str  # customer, supplier, both
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    opening_balance: float = 0
    balance_type: str = "debit"  # debit (receivable), credit (payable)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PartyCreate(BaseModel):
    name: str
    party_type: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gstin: Optional[str] = None
    opening_balance: float = 0
    balance_type: str = "debit"

# Stock/Inventory Models
class StockItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    product_name: str
    current_stock: int
    reorder_level: int = 10
    unit: str = "pcs"
    avg_purchase_rate: float = 0
    last_purchase_rate: float = 0
    last_sale_rate: float = 0
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
