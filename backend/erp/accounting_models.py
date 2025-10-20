"""
Complete Accounting Models for ERP System
Includes Chart of Accounts, Vouchers, Ledgers, and Tax Management
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
import uuid

# ==================== CHART OF ACCOUNTS ====================

class AccountGroup(BaseModel):
    """Account groups for organizing chart of accounts"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Assets, Liabilities, Capital, Income, Expenses
    parent_id: Optional[str] = None
    level: int  # 0=main group, 1=sub-group
    account_type: str  # asset, liability, capital, income, expense

class Account(BaseModel):
    """Individual account in chart of accounts"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str  # Account code (e.g., "1001", "2001")
    name: str  # Account name
    group_id: str  # Links to AccountGroup
    account_type: str  # asset, liability, capital, income, expense
    opening_balance: float = 0.0
    current_balance: float = 0.0
    is_system: bool = False  # System accounts (Cash, Bank, etc.)
    created_at: datetime = Field(default_factory=datetime.now)

class AccountCreate(BaseModel):
    code: str
    name: str
    group_id: str
    account_type: str
    opening_balance: float = 0.0

# ==================== ITEMS/INVENTORY ====================

class ItemUnit(BaseModel):
    """Units of measurement"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Piece, Kg, Meter, etc.
    symbol: str  # Pcs, Kg, M

class ItemCategory(BaseModel):
    """Item categories"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None

class Item(BaseModel):
    """Inventory item master"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str  # Item code
    name: str
    description: Optional[str] = None
    category_id: str
    unit_id: str
    purchase_rate: float = 0.0
    sale_rate: float = 0.0
    opening_stock: float = 0.0
    current_stock: float = 0.0
    reorder_level: float = 0.0
    hsn_code: Optional[str] = None  # For GST
    gst_rate: float = 0.0  # GST percentage
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class ItemCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    category_id: str
    unit_id: str
    purchase_rate: float
    sale_rate: float
    opening_stock: float = 0.0
    reorder_level: float = 0.0
    hsn_code: Optional[str] = None
    gst_rate: float = 0.0

# ==================== PARTIES (Customers/Suppliers) ====================

class Party(BaseModel):
    """Customer or Supplier"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    party_type: str  # customer, supplier
    code: str
    name: str
    contact_person: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None  # GST number
    opening_balance: float = 0.0
    balance_type: str = "credit"  # debit or credit
    created_at: datetime = Field(default_factory=datetime.now)

class PartyCreate(BaseModel):
    party_type: str
    code: str
    name: str
    contact_person: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gstin: Optional[str] = None
    opening_balance: float = 0.0
    balance_type: str = "credit"

# ==================== VOUCHER LINE ITEMS ====================

class VoucherItem(BaseModel):
    """Line item in a voucher"""
    item_id: str
    item_name: str
    quantity: float
    rate: float
    amount: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float

# ==================== JOURNAL ENTRIES ====================

class JournalLine(BaseModel):
    """Individual line in journal entry"""
    account_id: str
    account_name: str
    debit: float = 0.0
    credit: float = 0.0
    narration: Optional[str] = None

class JournalEntry(BaseModel):
    """Journal entry for double-entry accounting"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_id: str  # Links to the parent voucher
    voucher_type: str  # sale, purchase, payment, receipt, journal, contra, expense
    entry_date: date
    lines: List[JournalLine]
    created_at: datetime = Field(default_factory=datetime.now)

# ==================== VOUCHERS ====================

class SalesVoucher(BaseModel):
    """Sales Invoice"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    customer_id: str
    customer_name: str
    items: List[VoucherItem]
    subtotal: float
    tax_amount: float
    discount: float = 0.0
    total_amount: float
    payment_status: str = "pending"  # pending, partial, paid
    paid_amount: float = 0.0
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class SalesVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str  # YYYY-MM-DD
    customer_id: str
    customer_name: str
    items: List[VoucherItem]
    subtotal: float
    tax_amount: float
    discount: float = 0.0
    total_amount: float
    notes: Optional[str] = None

class PurchaseVoucher(BaseModel):
    """Purchase Bill"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    supplier_id: str
    supplier_name: str
    items: List[VoucherItem]
    subtotal: float
    tax_amount: float
    discount: float = 0.0
    total_amount: float
    payment_status: str = "pending"
    paid_amount: float = 0.0
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class PurchaseVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str
    supplier_id: str
    supplier_name: str
    items: List[VoucherItem]
    subtotal: float
    tax_amount: float
    discount: float = 0.0
    total_amount: float
    notes: Optional[str] = None

class PaymentVoucher(BaseModel):
    """Payment made"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    party_id: str
    party_name: str
    party_type: str  # customer, supplier
    amount: float
    payment_mode: str  # cash, bank, upi, cheque
    reference: Optional[str] = None  # Cheque no, transaction id
    account_id: str  # Cash/Bank account
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class PaymentVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str
    party_id: str
    party_name: str
    party_type: str
    amount: float
    payment_mode: str
    reference: Optional[str] = None
    account_id: str
    notes: Optional[str] = None

class ReceiptVoucher(BaseModel):
    """Receipt received"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    party_id: str
    party_name: str
    party_type: str
    amount: float
    payment_mode: str
    reference: Optional[str] = None
    account_id: str
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class ReceiptVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str
    party_id: str
    party_name: str
    party_type: str
    amount: float
    payment_mode: str
    reference: Optional[str] = None
    account_id: str
    notes: Optional[str] = None

class ExpenseVoucher(BaseModel):
    """Expense Entry"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    expense_account_id: str  # Rent, Salary, Transport, etc.
    expense_account_name: str
    amount: float
    payment_mode: str
    paid_from_account_id: str  # Cash/Bank
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class ExpenseVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str
    expense_account_id: str
    expense_account_name: str
    amount: float
    payment_mode: str
    paid_from_account_id: str
    notes: Optional[str] = None

class JournalVoucher(BaseModel):
    """Journal Entry"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    lines: List[JournalLine]
    total_debit: float
    total_credit: float
    narration: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class JournalVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str
    lines: List[JournalLine]
    narration: Optional[str] = None

class ContraVoucher(BaseModel):
    """Contra Entry (Cash to Bank or Bank to Cash)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    voucher_number: str
    voucher_date: date
    from_account_id: str
    from_account_name: str
    to_account_id: str
    to_account_name: str
    amount: float
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)

class ContraVoucherCreate(BaseModel):
    voucher_number: str
    voucher_date: str
    from_account_id: str
    from_account_name: str
    to_account_id: str
    to_account_name: str
    amount: float
    reference: Optional[str] = None
    notes: Optional[str] = None

# ==================== LEDGER ====================

class LedgerEntry(BaseModel):
    """Ledger entry for accounts and parties"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: date
    account_id: Optional[str] = None  # For account ledger
    party_id: Optional[str] = None  # For party ledger
    item_id: Optional[str] = None  # For item ledger
    voucher_type: str
    voucher_number: str
    particulars: str
    debit: float = 0.0
    credit: float = 0.0
    quantity_in: float = 0.0  # For item ledger
    quantity_out: float = 0.0  # For item ledger
    balance: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)

# ==================== REPORTS ====================

class OutstandingReport(BaseModel):
    """Outstanding receivables/payables"""
    party_id: str
    party_name: str
    party_type: str
    total_amount: float
    paid_amount: float
    outstanding: float

class ProfitLossStatement(BaseModel):
    """P&L Statement"""
    period_from: date
    period_to: date
    total_income: float
    total_expenses: float
    cost_of_goods_sold: float
    gross_profit: float
    net_profit: float
    income_accounts: List[dict]
    expense_accounts: List[dict]

class BalanceSheet(BaseModel):
    """Balance Sheet"""
    as_on_date: date
    assets: List[dict]
    liabilities: List[dict]
    capital: List[dict]
    total_assets: float
    total_liabilities: float
    total_capital: float
