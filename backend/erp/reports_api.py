"""
Reports APIs - Ledgers, Outstanding, P&L, Balance Sheet
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, date
from erp.accounting_models import (
    LedgerEntry, OutstandingReport, ProfitLossStatement, BalanceSheet
)
from server import get_current_admin, User, db

router = APIRouter()

# ==================== LEDGERS ====================

@router.get("/erp/ledgers/account/{account_id}", response_model=List[LedgerEntry])
async def get_account_ledger(
    account_id: str,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    """Get account ledger"""
    query = {"account_id": account_id}
    
    if from_date:
        query["date"] = {"$gte": from_date}
    if to_date:
        if "date" in query:
            query["date"]["$lte"] = to_date
        else:
            query["date"] = {"$lte": to_date}
    
    entries = await db.ledger_entries.find(query, {"_id": 0}).sort("date", 1).to_list(1000)
    
    # Calculate running balance
    balance = 0.0
    for entry in entries:
        if isinstance(entry.get('date'), str):
            entry['date'] = date.fromisoformat(entry['date'])
        if isinstance(entry.get('created_at'), str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
        
        balance += entry.get('debit', 0.0) - entry.get('credit', 0.0)
        entry['balance'] = balance
    
    return entries

@router.get("/erp/ledgers/party/{party_id}", response_model=List[LedgerEntry])
async def get_party_ledger(
    party_id: str,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    """Get party ledger (customer/supplier)"""
    query = {"party_id": party_id}
    
    if from_date:
        query["date"] = {"$gte": from_date}
    if to_date:
        if "date" in query:
            query["date"]["$lte"] = to_date
        else:
            query["date"] = {"$lte": to_date}
    
    entries = await db.ledger_entries.find(query, {"_id": 0}).sort("date", 1).to_list(1000)
    
    # Calculate running balance
    balance = 0.0
    for entry in entries:
        if isinstance(entry.get('date'), str):
            entry['date'] = date.fromisoformat(entry['date'])
        if isinstance(entry.get('created_at'), str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
        
        balance += entry.get('debit', 0.0) - entry.get('credit', 0.0)
        entry['balance'] = balance
    
    return entries

@router.get("/erp/ledgers/item/{item_id}", response_model=List[LedgerEntry])
async def get_item_ledger(
    item_id: str,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user: User = Depends(get_current_admin)
):
    """Get item ledger (stock movement)"""
    query = {"item_id": item_id}
    
    if from_date:
        query["date"] = {"$gte": from_date}
    if to_date:
        if "date" in query:
            query["date"]["$lte"] = to_date
        else:
            query["date"] = {"$lte": to_date}
    
    entries = await db.ledger_entries.find(query, {"_id": 0}).sort("date", 1).to_list(1000)
    
    # Calculate running stock balance
    balance = 0.0
    for entry in entries:
        if isinstance(entry.get('date'), str):
            entry['date'] = date.fromisoformat(entry['date'])
        if isinstance(entry.get('created_at'), str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
        
        balance += entry.get('quantity_in', 0.0) - entry.get('quantity_out', 0.0)
        entry['balance'] = balance
    
    return entries

# ==================== OUTSTANDING REPORTS ====================

@router.get("/erp/reports/outstanding/receivables", response_model=List[OutstandingReport])
async def get_receivables_report(current_user: User = Depends(get_current_admin)):
    """Get outstanding receivables (customer-wise)"""
    customers = await db.parties.find({"party_type": "customer"}, {"_id": 0}).to_list(1000)
    
    report = []
    for customer in customers:
        # Get all sales
        sales = await db.sales_vouchers.find({"customer_id": customer['id']}, {"_id": 0}).to_list(1000)
        total_amount = sum(s.get('total_amount', 0.0) for s in sales)
        paid_amount = sum(s.get('paid_amount', 0.0) for s in sales)
        
        # Get all receipts
        receipts = await db.receipt_vouchers.find(
            {"party_id": customer['id'], "party_type": "customer"}, 
            {"_id": 0}
        ).to_list(1000)
        paid_amount += sum(r.get('amount', 0.0) for r in receipts)
        
        outstanding = total_amount - paid_amount
        
        if outstanding > 0:  # Only show parties with outstanding
            report.append(OutstandingReport(
                party_id=customer['id'],
                party_name=customer['name'],
                party_type="customer",
                total_amount=total_amount,
                paid_amount=paid_amount,
                outstanding=outstanding
            ))
    
    return sorted(report, key=lambda x: x.outstanding, reverse=True)

@router.get("/erp/reports/outstanding/payables", response_model=List[OutstandingReport])
async def get_payables_report(current_user: User = Depends(get_current_admin)):
    """Get outstanding payables (supplier-wise)"""
    suppliers = await db.parties.find({"party_type": "supplier"}, {"_id": 0}).to_list(1000)
    
    report = []
    for supplier in suppliers:
        # Get all purchases
        purchases = await db.purchase_vouchers.find({"supplier_id": supplier['id']}, {"_id": 0}).to_list(1000)
        total_amount = sum(p.get('total_amount', 0.0) for p in purchases)
        paid_amount = sum(p.get('paid_amount', 0.0) for p in purchases)
        
        # Get all payments
        payments = await db.payment_vouchers.find(
            {"party_id": supplier['id'], "party_type": "supplier"}, 
            {"_id": 0}
        ).to_list(1000)
        paid_amount += sum(p.get('amount', 0.0) for p in payments)
        
        outstanding = total_amount - paid_amount
        
        if outstanding > 0:
            report.append(OutstandingReport(
                party_id=supplier['id'],
                party_name=supplier['name'],
                party_type="supplier",
                total_amount=total_amount,
                paid_amount=paid_amount,
                outstanding=outstanding
            ))
    
    return sorted(report, key=lambda x: x.outstanding, reverse=True)

# ==================== PROFIT & LOSS STATEMENT ====================

@router.get("/erp/reports/profit-loss", response_model=ProfitLossStatement)
async def get_profit_loss_statement(
    from_date: str = Query(...),
    to_date: str = Query(...),
    current_user: User = Depends(get_current_admin)
):
    """Get Profit & Loss statement"""
    
    # Get all income accounts
    income_accounts = await db.accounts.find({"account_type": "income"}, {"_id": 0}).to_list(100)
    income_list = []
    total_income = 0.0
    
    for account in income_accounts:
        # Get ledger entries for this account
        entries = await db.ledger_entries.find({
            "account_id": account['id'],
            "date": {"$gte": from_date, "$lte": to_date}
        }, {"_id": 0}).to_list(1000)
        
        account_total = sum(e.get('credit', 0.0) - e.get('debit', 0.0) for e in entries)
        if account_total > 0:
            income_list.append({
                "account_name": account['name'],
                "amount": account_total
            })
            total_income += account_total
    
    # Get all expense accounts
    expense_accounts = await db.accounts.find({"account_type": "expense"}, {"_id": 0}).to_list(100)
    expense_list = []
    total_expenses = 0.0
    
    for account in expense_accounts:
        entries = await db.ledger_entries.find({
            "account_id": account['id'],
            "date": {"$gte": from_date, "$lte": to_date}
        }, {"_id": 0}).to_list(1000)
        
        account_total = sum(e.get('debit', 0.0) - e.get('credit', 0.0) for e in entries)
        if account_total > 0:
            expense_list.append({
                "account_name": account['name'],
                "amount": account_total
            })
            total_expenses += account_total
    
    # Calculate COGS (Cost of Goods Sold)
    purchases = await db.purchase_vouchers.find({
        "voucher_date": {"$gte": from_date, "$lte": to_date}
    }, {"_id": 0}).to_list(1000)
    cost_of_goods_sold = sum(p.get('subtotal', 0.0) for p in purchases)
    
    # Calculate profits
    gross_profit = total_income - cost_of_goods_sold
    net_profit = gross_profit - total_expenses
    
    return ProfitLossStatement(
        period_from=date.fromisoformat(from_date),
        period_to=date.fromisoformat(to_date),
        total_income=total_income,
        total_expenses=total_expenses,
        cost_of_goods_sold=cost_of_goods_sold,
        gross_profit=gross_profit,
        net_profit=net_profit,
        income_accounts=income_list,
        expense_accounts=expense_list
    )

# ==================== BALANCE SHEET ====================

@router.get("/erp/reports/balance-sheet", response_model=BalanceSheet)
async def get_balance_sheet(
    as_on_date: str = Query(...),
    current_user: User = Depends(get_current_admin)
):
    """Get Balance Sheet"""
    
    # Get all asset accounts
    asset_accounts = await db.accounts.find({"account_type": "asset"}, {"_id": 0}).to_list(100)
    assets_list = []
    total_assets = 0.0
    
    for account in asset_accounts:
        balance = account.get('current_balance', 0.0)
        if balance != 0:
            assets_list.append({
                "account_name": account['name'],
                "amount": balance
            })
            total_assets += balance
    
    # Get all liability accounts
    liability_accounts = await db.accounts.find({"account_type": "liability"}, {"_id": 0}).to_list(100)
    liabilities_list = []
    total_liabilities = 0.0
    
    for account in liability_accounts:
        balance = account.get('current_balance', 0.0)
        if balance != 0:
            liabilities_list.append({
                "account_name": account['name'],
                "amount": balance
            })
            total_liabilities += balance
    
    # Get all capital accounts
    capital_accounts = await db.accounts.find({"account_type": "capital"}, {"_id": 0}).to_list(100)
    capital_list = []
    total_capital = 0.0
    
    for account in capital_accounts:
        balance = account.get('current_balance', 0.0)
        if balance != 0:
            capital_list.append({
                "account_name": account['name'],
                "amount": balance
            })
            total_capital += balance
    
    return BalanceSheet(
        as_on_date=date.fromisoformat(as_on_date),
        assets=assets_list,
        liabilities=liabilities_list,
        capital=capital_list,
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        total_capital=total_capital
    )

# ==================== STOCK REPORT ====================

@router.get("/erp/reports/stock")
async def get_stock_report(current_user: User = Depends(get_current_admin)):
    """Get current stock report"""
    items = await db.items.find({}, {"_id": 0}).sort("name", 1).to_list(1000)
    
    report = []
    for item in items:
        # Get category and unit names
        category = await db.item_categories.find_one({"id": item.get('category_id')}, {"_id": 0})
        unit = await db.item_units.find_one({"id": item.get('unit_id')}, {"_id": 0})
        
        report.append({
            "item_code": item.get('code'),
            "item_name": item.get('name'),
            "category": category.get('name') if category else "N/A",
            "unit": unit.get('symbol') if unit else "N/A",
            "current_stock": item.get('current_stock', 0.0),
            "reorder_level": item.get('reorder_level', 0.0),
            "purchase_rate": item.get('purchase_rate', 0.0),
            "sale_rate": item.get('sale_rate', 0.0),
            "stock_value": item.get('current_stock', 0.0) * item.get('purchase_rate', 0.0),
            "alert": item.get('current_stock', 0.0) <= item.get('reorder_level', 0.0)
        })
    
    return report

# ==================== GST REPORT ====================

@router.get("/erp/reports/gst")
async def get_gst_report(
    from_date: str = Query(...),
    to_date: str = Query(...),
    current_user: User = Depends(get_current_admin)
):
    """Get GST report"""
    
    # Sales with GST
    sales = await db.sales_vouchers.find({
        "voucher_date": {"$gte": from_date, "$lte": to_date}
    }, {"_id": 0}).to_list(1000)
    
    # Purchases with GST
    purchases = await db.purchase_vouchers.find({
        "voucher_date": {"$gte": from_date, "$lte": to_date}
    }, {"_id": 0}).to_list(1000)
    
    total_output_gst = sum(s.get('tax_amount', 0.0) for s in sales)
    total_input_gst = sum(p.get('tax_amount', 0.0) for p in purchases)
    net_gst_payable = total_output_gst - total_input_gst
    
    return {
        "period_from": from_date,
        "period_to": to_date,
        "total_sales": sum(s.get('total_amount', 0.0) for s in sales),
        "output_gst": total_output_gst,
        "total_purchases": sum(p.get('total_amount', 0.0) for p in purchases),
        "input_gst": total_input_gst,
        "net_gst_payable": net_gst_payable,
        "sales_invoices": len(sales),
        "purchase_bills": len(purchases)
    }
