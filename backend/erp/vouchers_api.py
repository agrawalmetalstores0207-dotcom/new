"""
Voucher APIs with Double-Entry Accounting Integration
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, date
from erp.accounting_models import (
    SalesVoucher, SalesVoucherCreate,
    PurchaseVoucher, PurchaseVoucherCreate,
    PaymentVoucher, PaymentVoucherCreate,
    ReceiptVoucher, ReceiptVoucherCreate,
    ExpenseVoucher, ExpenseVoucherCreate,
    JournalVoucher, JournalVoucherCreate,
    ContraVoucher, ContraVoucherCreate,
    JournalEntry, JournalLine, LedgerEntry
)
from server import get_current_admin, User, db

router = APIRouter()

# ==================== HELPER FUNCTIONS ====================

async def create_ledger_entry(entry_data: dict):
    """Create ledger entry"""
    entry_data['created_at'] = entry_data.get('created_at', datetime.now()).isoformat()
    await db.ledger_entries.insert_one(entry_data)

async def update_account_balance(account_id: str, debit: float = 0.0, credit: float = 0.0):
    """Update account balance"""
    account = await db.accounts.find_one({"id": account_id})
    if not account:
        return
    
    account_type = account.get('account_type')
    current_balance = account.get('current_balance', 0.0)
    
    # For assets and expenses: debit increases, credit decreases
    # For liabilities, capital, and income: credit increases, debit decreases
    if account_type in ['asset', 'expense']:
        new_balance = current_balance + debit - credit
    else:  # liability, capital, income
        new_balance = current_balance + credit - debit
    
    await db.accounts.update_one({"id": account_id}, {"$set": {"current_balance": new_balance}})

async def update_item_stock(item_id: str, quantity_in: float = 0.0, quantity_out: float = 0.0):
    """Update item stock"""
    item = await db.items.find_one({"id": item_id})
    if not item:
        return
    
    current_stock = item.get('current_stock', 0.0)
    new_stock = current_stock + quantity_in - quantity_out
    
    await db.items.update_one(
        {"id": item_id}, 
        {"$set": {"current_stock": new_stock, "updated_at": datetime.now().isoformat()}}
    )

# ==================== SALES VOUCHER ====================

@router.post("/erp/vouchers/sales", response_model=SalesVoucher)
async def create_sales_voucher(voucher: SalesVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create sales invoice with accounting integration"""
    
    # Check if voucher number already exists
    existing = await db.sales_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    # Create sales voucher
    voucher_data = SalesVoucher(**voucher.model_dump(), created_by=current_user.id)
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.sales_vouchers.insert_one(voucher_dict)
    
    # Update item stock (reduce)
    for item in voucher.items:
        await update_item_stock(item.item_id, quantity_out=item.quantity)
        
        # Create item ledger entry
        await create_ledger_entry({
            "date": voucher.voucher_date,
            "item_id": item.item_id,
            "voucher_type": "sales",
            "voucher_number": voucher.voucher_number,
            "particulars": f"Sales to {voucher.customer_name}",
            "quantity_out": item.quantity,
            "balance": 0.0  # Will be calculated
        })
    
    # Create journal entries (Double-entry)
    journal_lines = []
    
    # Debit: Customer Account (Sundry Debtors) or Cash if paid
    journal_lines.append(JournalLine(
        account_id=voucher.customer_id,
        account_name=voucher.customer_name,
        debit=voucher.total_amount,
        credit=0.0,
        narration="Sales invoice"
    ))
    
    # Credit: Sales Account
    sales_account = await db.accounts.find_one({"code": "4001"})  # Sales account
    if sales_account:
        journal_lines.append(JournalLine(
            account_id=sales_account['id'],
            account_name=sales_account['name'],
            debit=0.0,
            credit=voucher.subtotal,
            narration="Sales revenue"
        ))
        await update_account_balance(sales_account['id'], credit=voucher.subtotal)
    
    # Credit: Tax Account (if applicable)
    if voucher.tax_amount > 0:
        tax_account = await db.accounts.find_one({"code": "2005"})  # GST Payable
        if tax_account:
            journal_lines.append(JournalLine(
                account_id=tax_account['id'],
                account_name=tax_account['name'],
                debit=0.0,
                credit=voucher.tax_amount,
                narration="GST collected"
            ))
            await update_account_balance(tax_account['id'], credit=voucher.tax_amount)
    
    # Save journal entry
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="sales",
        entry_date=voucher_data.voucher_date,
        lines=journal_lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    # Create customer ledger entry
    await create_ledger_entry({
        "date": voucher.voucher_date,
        "party_id": voucher.customer_id,
        "voucher_type": "sales",
        "voucher_number": voucher.voucher_number,
        "particulars": "Sales invoice",
        "debit": voucher.total_amount,
        "credit": 0.0,
        "balance": 0.0
    })
    
    return voucher_data

@router.get("/erp/vouchers/sales", response_model=List[SalesVoucher])
async def get_sales_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all sales vouchers"""
    vouchers = await db.sales_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers

# ==================== PURCHASE VOUCHER ====================

@router.post("/erp/vouchers/purchase", response_model=PurchaseVoucher)
async def create_purchase_voucher(voucher: PurchaseVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create purchase bill with accounting integration"""
    
    existing = await db.purchase_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    voucher_data = PurchaseVoucher(**voucher.model_dump(), created_by=current_user.id)
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.purchase_vouchers.insert_one(voucher_dict)
    
    # Update item stock (increase)
    for item in voucher.items:
        await update_item_stock(item.item_id, quantity_in=item.quantity)
        
        await create_ledger_entry({
            "date": voucher.voucher_date,
            "item_id": item.item_id,
            "voucher_type": "purchase",
            "voucher_number": voucher.voucher_number,
            "particulars": f"Purchase from {voucher.supplier_name}",
            "quantity_in": item.quantity,
            "balance": 0.0
        })
    
    # Create journal entries
    journal_lines = []
    
    # Debit: Purchase Account
    purchase_account = await db.accounts.find_one({"code": "5001"})  # Purchase account
    if purchase_account:
        journal_lines.append(JournalLine(
            account_id=purchase_account['id'],
            account_name=purchase_account['name'],
            debit=voucher.subtotal,
            credit=0.0,
            narration="Purchase of goods"
        ))
        await update_account_balance(purchase_account['id'], debit=voucher.subtotal)
    
    # Debit: Tax Account (if applicable)
    if voucher.tax_amount > 0:
        tax_account = await db.accounts.find_one({"code": "1006"})  # GST Receivable
        if tax_account:
            journal_lines.append(JournalLine(
                account_id=tax_account['id'],
                account_name=tax_account['name'],
                debit=voucher.tax_amount,
                credit=0.0,
                narration="GST paid"
            ))
            await update_account_balance(tax_account['id'], debit=voucher.tax_amount)
    
    # Credit: Supplier Account (Sundry Creditors)
    journal_lines.append(JournalLine(
        account_id=voucher.supplier_id,
        account_name=voucher.supplier_name,
        debit=0.0,
        credit=voucher.total_amount,
        narration="Purchase bill"
    ))
    
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="purchase",
        entry_date=voucher_data.voucher_date,
        lines=journal_lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    # Create supplier ledger entry
    await create_ledger_entry({
        "date": voucher.voucher_date,
        "party_id": voucher.supplier_id,
        "voucher_type": "purchase",
        "voucher_number": voucher.voucher_number,
        "particulars": "Purchase bill",
        "debit": 0.0,
        "credit": voucher.total_amount,
        "balance": 0.0
    })
    
    return voucher_data

@router.get("/erp/vouchers/purchase", response_model=List[PurchaseVoucher])
async def get_purchase_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all purchase vouchers"""
    vouchers = await db.purchase_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers

# ==================== PAYMENT VOUCHER ====================

@router.post("/erp/vouchers/payment", response_model=PaymentVoucher)
async def create_payment_voucher(voucher: PaymentVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create payment voucher"""
    
    existing = await db.payment_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    voucher_data = PaymentVoucher(**voucher.model_dump(), created_by=current_user.id)
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.payment_vouchers.insert_one(voucher_dict)
    
    # Create journal entries
    journal_lines = []
    
    # Debit: Party Account
    journal_lines.append(JournalLine(
        account_id=voucher.party_id,
        account_name=voucher.party_name,
        debit=voucher.amount,
        credit=0.0,
        narration=f"Payment made"
    ))
    
    # Credit: Cash/Bank Account
    journal_lines.append(JournalLine(
        account_id=voucher.account_id,
        account_name="Cash/Bank",
        debit=0.0,
        credit=voucher.amount,
        narration="Payment"
    ))
    await update_account_balance(voucher.account_id, credit=voucher.amount)
    
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="payment",
        entry_date=voucher_data.voucher_date,
        lines=journal_lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    # Create party ledger entry
    await create_ledger_entry({
        "date": voucher.voucher_date,
        "party_id": voucher.party_id,
        "voucher_type": "payment",
        "voucher_number": voucher.voucher_number,
        "particulars": "Payment made",
        "debit": voucher.amount,
        "credit": 0.0,
        "balance": 0.0
    })
    
    return voucher_data

@router.get("/erp/vouchers/payment", response_model=List[PaymentVoucher])
async def get_payment_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all payment vouchers"""
    vouchers = await db.payment_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers

# ==================== RECEIPT VOUCHER ====================

@router.post("/erp/vouchers/receipt", response_model=ReceiptVoucher)
async def create_receipt_voucher(voucher: ReceiptVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create receipt voucher"""
    
    existing = await db.receipt_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    voucher_data = ReceiptVoucher(**voucher.model_dump(), created_by=current_user.id)
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.receipt_vouchers.insert_one(voucher_dict)
    
    # Create journal entries
    journal_lines = []
    
    # Debit: Cash/Bank Account
    journal_lines.append(JournalLine(
        account_id=voucher.account_id,
        account_name="Cash/Bank",
        debit=voucher.amount,
        credit=0.0,
        narration="Receipt"
    ))
    await update_account_balance(voucher.account_id, debit=voucher.amount)
    
    # Credit: Party Account
    journal_lines.append(JournalLine(
        account_id=voucher.party_id,
        account_name=voucher.party_name,
        debit=0.0,
        credit=voucher.amount,
        narration="Receipt received"
    ))
    
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="receipt",
        entry_date=voucher_data.voucher_date,
        lines=journal_lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    # Create party ledger entry
    await create_ledger_entry({
        "date": voucher.voucher_date,
        "party_id": voucher.party_id,
        "voucher_type": "receipt",
        "voucher_number": voucher.voucher_number,
        "particulars": "Receipt received",
        "debit": 0.0,
        "credit": voucher.amount,
        "balance": 0.0
    })
    
    return voucher_data

@router.get("/erp/vouchers/receipt", response_model=List[ReceiptVoucher])
async def get_receipt_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all receipt vouchers"""
    vouchers = await db.receipt_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers

# ==================== EXPENSE VOUCHER ====================

@router.post("/erp/vouchers/expense", response_model=ExpenseVoucher)
async def create_expense_voucher(voucher: ExpenseVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create expense voucher"""
    
    existing = await db.expense_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    voucher_data = ExpenseVoucher(**voucher.model_dump(), created_by=current_user.id)
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.expense_vouchers.insert_one(voucher_dict)
    
    # Create journal entries
    journal_lines = []
    
    # Debit: Expense Account
    journal_lines.append(JournalLine(
        account_id=voucher.expense_account_id,
        account_name=voucher.expense_account_name,
        debit=voucher.amount,
        credit=0.0,
        narration="Expense"
    ))
    await update_account_balance(voucher.expense_account_id, debit=voucher.amount)
    
    # Credit: Cash/Bank Account
    journal_lines.append(JournalLine(
        account_id=voucher.paid_from_account_id,
        account_name="Cash/Bank",
        debit=0.0,
        credit=voucher.amount,
        narration="Expense payment"
    ))
    await update_account_balance(voucher.paid_from_account_id, credit=voucher.amount)
    
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="expense",
        entry_date=voucher_data.voucher_date,
        lines=journal_lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    return voucher_data

@router.get("/erp/vouchers/expense", response_model=List[ExpenseVoucher])
async def get_expense_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all expense vouchers"""
    vouchers = await db.expense_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers

# ==================== JOURNAL VOUCHER ====================

@router.post("/erp/vouchers/journal", response_model=JournalVoucher)
async def create_journal_voucher(voucher: JournalVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create journal voucher"""
    
    # Validate debit = credit
    total_debit = sum(line.debit for line in voucher.lines)
    total_credit = sum(line.credit for line in voucher.lines)
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(status_code=400, detail="Total debit must equal total credit")
    
    existing = await db.journal_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    voucher_data = JournalVoucher(
        **voucher.model_dump(), 
        total_debit=total_debit,
        total_credit=total_credit,
        created_by=current_user.id
    )
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.journal_vouchers.insert_one(voucher_dict)
    
    # Update account balances
    for line in voucher.lines:
        await update_account_balance(line.account_id, debit=line.debit, credit=line.credit)
    
    # Create journal entry
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="journal",
        entry_date=voucher_data.voucher_date,
        lines=voucher.lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    return voucher_data

@router.get("/erp/vouchers/journal", response_model=List[JournalVoucher])
async def get_journal_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all journal vouchers"""
    vouchers = await db.journal_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers

# ==================== CONTRA VOUCHER ====================

@router.post("/erp/vouchers/contra", response_model=ContraVoucher)
async def create_contra_voucher(voucher: ContraVoucherCreate, current_user: User = Depends(get_current_admin)):
    """Create contra voucher (Cash to Bank or Bank to Cash)"""
    
    existing = await db.contra_vouchers.find_one({"voucher_number": voucher.voucher_number})
    if existing:
        raise HTTPException(status_code=400, detail="Voucher number already exists")
    
    voucher_data = ContraVoucher(**voucher.model_dump(), created_by=current_user.id)
    voucher_data.voucher_date = date.fromisoformat(voucher.voucher_date)
    
    voucher_dict = voucher_data.model_dump()
    voucher_dict['voucher_date'] = voucher_dict['voucher_date'].isoformat()
    voucher_dict['created_at'] = voucher_dict['created_at'].isoformat()
    
    await db.contra_vouchers.insert_one(voucher_dict)
    
    # Create journal entries
    journal_lines = [
        JournalLine(
            account_id=voucher.to_account_id,
            account_name=voucher.to_account_name,
            debit=voucher.amount,
            credit=0.0,
            narration="Contra entry"
        ),
        JournalLine(
            account_id=voucher.from_account_id,
            account_name=voucher.from_account_name,
            debit=0.0,
            credit=voucher.amount,
            narration="Contra entry"
        )
    ]
    
    # Update balances
    await update_account_balance(voucher.to_account_id, debit=voucher.amount)
    await update_account_balance(voucher.from_account_id, credit=voucher.amount)
    
    journal_entry = JournalEntry(
        voucher_id=voucher_data.id,
        voucher_type="contra",
        entry_date=voucher_data.voucher_date,
        lines=journal_lines
    )
    journal_dict = journal_entry.model_dump()
    journal_dict['entry_date'] = journal_dict['entry_date'].isoformat()
    journal_dict['created_at'] = journal_dict['created_at'].isoformat()
    await db.journal_entries.insert_one(journal_dict)
    
    return voucher_data

@router.get("/erp/vouchers/contra", response_model=List[ContraVoucher])
async def get_contra_vouchers(current_user: User = Depends(get_current_admin)):
    """Get all contra vouchers"""
    vouchers = await db.contra_vouchers.find({}, {"_id": 0}).sort("voucher_date", -1).to_list(1000)
    for v in vouchers:
        if isinstance(v.get('voucher_date'), str):
            v['voucher_date'] = date.fromisoformat(v['voucher_date'])
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    return vouchers
