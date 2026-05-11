#!/usr/bin/env python3
"""
Paybill Commission Tracker

A standalone tool to track paybill transactions and calculate commissions
for Hyrise Crown (Registration No. BN-EZC3Z67A).

This script can be run independently from the main system to:
1. Record transactions manually
2. Calculate commissions based on transaction type
3. Generate reports for bank reconciliation
4. Export data for accounting purposes
"""

import csv
import datetime
import os
import json
import uuid
from typing import Dict, List, Optional, Tuple, Union

# Configuration
PAYBILL_NUMBER = "6061123"  # New paybill number
MERCHANT_NAME = "Kisumu Hyrise Crown Restaurant"
MERCHANT_ACCOUNT = "01521209171200" 
BANK_NAME = "National Bank Kisumu Kenya"

# Commission rates (as decimal values)
COMMISSION_RATES = {
    "TOP_UP": 0.015,  # 1.5% for account top-ups
    "AIRTIME_PURCHASE": 0.025,  # 2.5% for airtime purchases
    "SERVICE_PAYMENT": 0.02,  # 2% for service payments
}

# File paths
DATA_DIR = "data"
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "manual_paybill_transactions.csv")
COMMISSIONS_FILE = os.path.join(DATA_DIR, "manual_paybill_commissions.csv")
SUMMARY_FILE = os.path.join(DATA_DIR, "commission_summary.json")


class Transaction:
    """Class to represent a paybill transaction."""
    
    def __init__(
        self,
        phone_number: str,
        amount: float,
        transaction_type: str,
        description: str,
        mpesa_receipt: str = None,
        transaction_id: str = None,
        date: str = None,
    ):
        self.transaction_id = transaction_id or str(uuid.uuid4())
        self.phone_number = phone_number
        self.amount = amount
        self.transaction_type = transaction_type
        self.description = description
        self.paybill_number = PAYBILL_NUMBER
        self.date = date or datetime.datetime.now().isoformat()
        self.mpesa_receipt = mpesa_receipt
    
    def to_dict(self) -> Dict:
        """Convert transaction to dictionary."""
        return {
            "transaction_id": self.transaction_id,
            "phone_number": self.phone_number,
            "amount": self.amount,
            "transaction_type": self.transaction_type,
            "description": self.description,
            "paybill_number": self.paybill_number,
            "date": self.date,
            "mpesa_receipt": self.mpesa_receipt,
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Transaction':
        """Create transaction from dictionary."""
        return cls(
            transaction_id=data.get("transaction_id"),
            phone_number=data.get("phone_number"),
            amount=data.get("amount"),
            transaction_type=data.get("transaction_type"),
            description=data.get("description"),
            date=data.get("date"),
            mpesa_receipt=data.get("mpesa_receipt"),
        )


class Commission:
    """Class to represent a commission from a transaction."""
    
    def __init__(
        self,
        transaction_id: str,
        transaction_type: str,
        amount: float,
        commission_amount: float,
        processed: bool = False,
        commission_id: str = None,
        date: str = None,
        processed_date: str = None,
        transfer_id: str = None,
    ):
        self.commission_id = commission_id or str(uuid.uuid4())
        self.transaction_id = transaction_id
        self.transaction_type = transaction_type
        self.amount = amount
        self.commission_amount = commission_amount
        self.processed = processed
        self.date = date or datetime.datetime.now().isoformat()
        self.processed_date = processed_date
        self.transfer_id = transfer_id
    
    def to_dict(self) -> Dict:
        """Convert commission to dictionary."""
        return {
            "commission_id": self.commission_id,
            "transaction_id": self.transaction_id,
            "transaction_type": self.transaction_type,
            "amount": self.amount,
            "commission_amount": self.commission_amount,
            "processed": self.processed,
            "date": self.date,
            "processed_date": self.processed_date,
            "transfer_id": self.transfer_id,
            "processing_details": {
                "merchantName": MERCHANT_NAME,
                "merchantAccount": MERCHANT_ACCOUNT,
                "bank": BANK_NAME,
                "systemType": "Commission-Based Payment Aggregator"
            }
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Commission':
        """Create commission from dictionary."""
        return cls(
            commission_id=data.get("commission_id"),
            transaction_id=data.get("transaction_id"),
            transaction_type=data.get("transaction_type"),
            amount=data.get("amount"),
            commission_amount=data.get("commission_amount"),
            processed=data.get("processed", False),
            date=data.get("date"),
            processed_date=data.get("processed_date"),
            transfer_id=data.get("transfer_id"),
        )


class PaybillCommissionTracker:
    """Main class to track paybill transactions and commissions."""
    
    def __init__(self):
        """Initialize the tracker."""
        self.ensure_data_directory()
        self.transactions = self.load_transactions()
        self.commissions = self.load_commissions()
    
    def ensure_data_directory(self) -> None:
        """Ensure the data directory exists."""
        if not os.path.exists(DATA_DIR):
            os.makedirs(DATA_DIR)
    
    def load_transactions(self) -> List[Transaction]:
        """Load transactions from CSV file."""
        transactions = []
        if not os.path.exists(TRANSACTIONS_FILE):
            # Create the file with headers if it doesn't exist
            with open(TRANSACTIONS_FILE, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    "transaction_id", "phone_number", "amount", "transaction_type",
                    "description", "paybill_number", "date", "mpesa_receipt"
                ])
            return transactions
        
        with open(TRANSACTIONS_FILE, 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert amount to float
                row["amount"] = float(row["amount"])
                transactions.append(Transaction.from_dict(row))
        
        return transactions
    
    def load_commissions(self) -> List[Commission]:
        """Load commissions from CSV file."""
        commissions = []
        if not os.path.exists(COMMISSIONS_FILE):
            # Create the file with headers if it doesn't exist
            with open(COMMISSIONS_FILE, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([
                    "commission_id", "transaction_id", "transaction_type", "amount",
                    "commission_amount", "processed", "date", "processed_date", "transfer_id"
                ])
            return commissions
        
        with open(COMMISSIONS_FILE, 'r', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Convert numeric fields
                row["amount"] = float(row["amount"])
                row["commission_amount"] = float(row["commission_amount"])
                row["processed"] = row["processed"].lower() == "true"
                commissions.append(Commission.from_dict(row))
        
        return commissions
    
    def save_transactions(self) -> None:
        """Save transactions to CSV file."""
        with open(TRANSACTIONS_FILE, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "transaction_id", "phone_number", "amount", "transaction_type",
                "description", "paybill_number", "date", "mpesa_receipt"
            ])
            writer.writeheader()
            for transaction in self.transactions:
                writer.writerow(transaction.to_dict())
    
    def save_commissions(self) -> None:
        """Save commissions to CSV file."""
        with open(COMMISSIONS_FILE, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=[
                "commission_id", "transaction_id", "transaction_type", "amount",
                "commission_amount", "processed", "date", "processed_date", "transfer_id"
            ])
            writer.writeheader()
            for commission in self.commissions:
                row = commission.to_dict()
                # Remove the processing_details for CSV storage
                row.pop("processing_details", None)
                writer.writerow(row)
    
    def save_summary(self) -> None:
        """Save summary to JSON file."""
        summary = self.get_commission_summary()
        with open(SUMMARY_FILE, 'w') as f:
            json.dump(summary, f, indent=2)
    
    def add_transaction(
        self,
        phone_number: str,
        amount: float,
        transaction_type: str,
        description: str,
        mpesa_receipt: str = None,
    ) -> Transaction:
        """Add a new transaction and calculate commission."""
        # Validate transaction type
        if transaction_type not in COMMISSION_RATES:
            valid_types = ", ".join(COMMISSION_RATES.keys())
            raise ValueError(
                f"Invalid transaction type: {transaction_type}. "
                f"Valid types are: {valid_types}"
            )
        
        # Create transaction
        transaction = Transaction(
            phone_number=phone_number,
            amount=amount,
            transaction_type=transaction_type,
            description=description,
            mpesa_receipt=mpesa_receipt,
        )
        
        # Add to transactions list
        self.transactions.append(transaction)
        
        # Calculate and record commission
        self.record_commission(transaction)
        
        # Save to files
        self.save_transactions()
        self.save_commissions()
        self.save_summary()
        
        return transaction
    
    def record_commission(self, transaction: Transaction) -> Commission:
        """Record commission for a transaction."""
        commission_rate = COMMISSION_RATES[transaction.transaction_type]
        commission_amount = transaction.amount * commission_rate
        
        commission = Commission(
            transaction_id=transaction.transaction_id,
            transaction_type=transaction.transaction_type,
            amount=transaction.amount,
            commission_amount=commission_amount,
        )
        
        self.commissions.append(commission)
        return commission
    
    def mark_commission_as_processed(
        self,
        commission_id: str,
        transfer_id: str = None,
    ) -> Optional[Commission]:
        """Mark a commission as processed."""
        for commission in self.commissions:
            if commission.commission_id == commission_id:
                commission.processed = True
                commission.processed_date = datetime.datetime.now().isoformat()
                commission.transfer_id = transfer_id or f"TRANSFER-{uuid.uuid4()}"
                self.save_commissions()
                self.save_summary()
                return commission
        
        return None
    
    def get_commission_summary(self) -> Dict:
        """Get summary of commissions."""
        total_commission = sum(c.commission_amount for c in self.commissions)
        pending_commission = sum(
            c.commission_amount for c in self.commissions if not c.processed
        )
        processed_commission = total_commission - pending_commission
        
        # Calculate commissions by type
        commissions_by_type = {t: 0 for t in COMMISSION_RATES}
        for commission in self.commissions:
            commissions_by_type[commission.transaction_type] += commission.commission_amount
        
        # Get recent commissions (last 10)
        recent_commissions = sorted(
            self.commissions,
            key=lambda c: c.date,
            reverse=True,
        )[:10]
        
        return {
            "totalCommission": total_commission,
            "pendingCommission": pending_commission,
            "processedCommission": processed_commission,
            "commissionsByType": commissions_by_type,
            "recentCommissions": [c.to_dict() for c in recent_commissions],
            "merchantName": MERCHANT_NAME,
            "merchantAccount": MERCHANT_ACCOUNT,
            "bankName": BANK_NAME,
            "paybillNumber": PAYBILL_NUMBER,
            "lastUpdated": datetime.datetime.now().isoformat(),
        }
    
    def generate_reconciliation_report(self, start_date: str, end_date: str) -> Dict:
        """Generate a reconciliation report for a date range."""
        # Parse dates
        start = datetime.datetime.fromisoformat(start_date)
        end = datetime.datetime.fromisoformat(end_date)
        
        # Filter transactions and commissions
        transactions_in_range = [
            t for t in self.transactions
            if start <= datetime.datetime.fromisoformat(t.date) <= end
        ]
        
        commissions_in_range = [
            c for c in self.commissions
            if start <= datetime.datetime.fromisoformat(c.date) <= end
        ]
        
        # Calculate totals
        total_transaction_amount = sum(t.amount for t in transactions_in_range)
        total_commission_amount = sum(c.commission_amount for c in commissions_in_range)
        pending_commission_amount = sum(
            c.commission_amount for c in commissions_in_range if not c.processed
        )
        processed_commission_amount = total_commission_amount - pending_commission_amount
        
        # Group by transaction type
        transactions_by_type = {}
        for t in transactions_in_range:
            if t.transaction_type not in transactions_by_type:
                transactions_by_type[t.transaction_type] = []
            transactions_by_type[t.transaction_type].append(t.to_dict())
        
        # Build report
        report = {
            "startDate": start_date,
            "endDate": end_date,
            "totalTransactions": len(transactions_in_range),
            "totalTransactionAmount": total_transaction_amount,
            "totalCommissionAmount": total_commission_amount,
            "pendingCommissionAmount": pending_commission_amount,
            "processedCommissionAmount": processed_commission_amount,
            "transactionsByType": {
                t_type: {
                    "count": len(transactions),
                    "totalAmount": sum(t["amount"] for t in transactions),
                    "commissionRate": COMMISSION_RATES[t_type],
                    "commissionAmount": sum(t["amount"] for t in transactions) * COMMISSION_RATES[t_type],
                }
                for t_type, transactions in transactions_by_type.items()
            },
            "merchantDetails": {
                "name": MERCHANT_NAME,
                "account": MERCHANT_ACCOUNT,
                "bank": BANK_NAME,
                "paybill": PAYBILL_NUMBER,
            },
            "generatedAt": datetime.datetime.now().isoformat(),
        }
        
        return report
    
    def export_to_excel(self, filename: str) -> bool:
        """Export data to Excel (CSV format)."""
        try:
            # Export transactions
            transactions_file = f"{filename}_transactions.csv"
            with open(transactions_file, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    "transaction_id", "phone_number", "amount", "transaction_type",
                    "description", "paybill_number", "date", "mpesa_receipt"
                ])
                writer.writeheader()
                for transaction in self.transactions:
                    writer.writerow(transaction.to_dict())
            
            # Export commissions
            commissions_file = f"{filename}_commissions.csv"
            with open(commissions_file, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    "commission_id", "transaction_id", "transaction_type", "amount",
                    "commission_amount", "processed", "date", "processed_date", "transfer_id"
                ])
                writer.writeheader()
                for commission in self.commissions:
                    row = commission.to_dict()
                    # Remove the processing_details for CSV storage
                    row.pop("processing_details", None)
                    writer.writerow(row)
            
            # Export summary
            summary_file = f"{filename}_summary.json"
            with open(summary_file, 'w') as f:
                json.dump(self.get_commission_summary(), f, indent=2)
            
            return True
        except Exception as e:
            print(f"Error exporting to Excel: {e}")
            return False


def print_menu() -> None:
    """Print the main menu."""
    print("\n" + "=" * 50)
    print(f"PAYBILL COMMISSION TRACKER - {PAYBILL_NUMBER}")
    print("=" * 50)
    print("1. Record new transaction")
    print("2. View recent transactions")
    print("3. View commission summary")
    print("4. Mark commission as processed")
    print("5. Generate reconciliation report")
    print("6. Export data to CSV")
    print("0. Exit")
    print("=" * 50)


def get_input(prompt: str, input_type: type = str) -> any:
    """Get user input with validation."""
    while True:
        try:
            value = input(prompt)
            if input_type == bool:
                if value.lower() in ('y', 'yes', 'true', '1'):
                    return True
                elif value.lower() in ('n', 'no', 'false', '0'):
                    return False
                else:
                    raise ValueError("Invalid boolean value")
            return input_type(value)
        except ValueError:
            print(f"Invalid input. Please enter a valid {input_type.__name__}")


def record_transaction(tracker: PaybillCommissionTracker) -> None:
    """Record a new transaction."""
    print("\n--- Record New Transaction ---")
    phone_number = get_input("Phone Number: ")
    amount = get_input("Amount: ", float)
    
    print("\nTransaction Types:")
    for i, t_type in enumerate(COMMISSION_RATES.keys(), 1):
        rate = COMMISSION_RATES[t_type] * 100
        print(f"{i}. {t_type} ({rate:.1f}% commission)")
    
    while True:
        type_choice = get_input("Select transaction type (1-3): ", int)
        if 1 <= type_choice <= len(COMMISSION_RATES):
            transaction_type = list(COMMISSION_RATES.keys())[type_choice - 1]
            break
        print("Invalid choice. Please try again.")
    
    description = get_input("Description: ")
    mpesa_receipt = get_input("M-PESA Receipt Number (optional): ")
    
    if not mpesa_receipt:
        mpesa_receipt = None
    
    transaction = tracker.add_transaction(
        phone_number=phone_number,
        amount=amount,
        transaction_type=transaction_type,
        description=description,
        mpesa_receipt=mpesa_receipt,
    )
    
    print("\nTransaction recorded successfully!")
    print(f"Transaction ID: {transaction.transaction_id}")
    print(f"Commission Amount: {COMMISSION_RATES[transaction_type] * amount:.2f}")


def view_recent_transactions(tracker: PaybillCommissionTracker) -> None:
    """View recent transactions."""
    print("\n--- Recent Transactions ---")
    
    if not tracker.transactions:
        print("No transactions recorded yet.")
        return
    
    # Sort transactions by date (newest first)
    sorted_transactions = sorted(
        tracker.transactions,
        key=lambda t: t.date,
        reverse=True,
    )
    
    # Show last 10 transactions
    for i, transaction in enumerate(sorted_transactions[:10], 1):
        date = datetime.datetime.fromisoformat(transaction.date)
        formatted_date = date.strftime("%Y-%m-%d %H:%M:%S")
        print(f"{i}. {formatted_date} - {transaction.transaction_type}")
        print(f"   Amount: {transaction.amount:.2f}")
        print(f"   Phone: {transaction.phone_number}")
        print(f"   Description: {transaction.description}")
        if transaction.mpesa_receipt:
            print(f"   M-PESA Receipt: {transaction.mpesa_receipt}")
        print(f"   Transaction ID: {transaction.transaction_id}")
        
        # Find corresponding commission
        commission = next(
            (c for c in tracker.commissions if c.transaction_id == transaction.transaction_id),
            None,
        )
        
        if commission:
            print(f"   Commission: {commission.commission_amount:.2f}")
            print(f"   Processed: {'Yes' if commission.processed else 'No'}")
        
        print()


def view_commission_summary(tracker: PaybillCommissionTracker) -> None:
    """View commission summary."""
    print("\n--- Commission Summary ---")
    
    summary = tracker.get_commission_summary()
    
    print(f"Merchant: {summary['merchantName']}")
    print(f"Bank Account: {summary['bankName']} - {summary['merchantAccount']}")
    print(f"Paybill Number: {summary['paybillNumber']}")
    print("\nCommission Totals:")
    print(f"Total Commissions: {summary['totalCommission']:.2f}")
    print(f"Pending Commissions: {summary['pendingCommission']:.2f}")
    print(f"Processed Commissions: {summary['processedCommission']:.2f}")
    
    print("\nCommissions by Type:")
    for t_type, amount in summary['commissionsByType'].items():
        if amount > 0:
            rate = COMMISSION_RATES[t_type] * 100
            print(f"{t_type} ({rate:.1f}%): {amount:.2f}")
    
    print("\nRecent Commissions:")
    for i, commission in enumerate(summary['recentCommissions'], 1):
        date = datetime.datetime.fromisoformat(commission['date']).strftime("%Y-%m-%d")
        status = "Processed" if commission['processed'] else "Pending"
        print(f"{i}. {date} - {commission['transaction_type']} - {commission['commission_amount']:.2f} - {status}")


def mark_commission_as_processed(tracker: PaybillCommissionTracker) -> None:
    """Mark a commission as processed."""
    print("\n--- Mark Commission as Processed ---")
    
    # Get pending commissions
    pending_commissions = [
        c for c in tracker.commissions if not c.processed
    ]
    
    if not pending_commissions:
        print("No pending commissions to process.")
        return
    
    # Display pending commissions
    print("Pending Commissions:")
    for i, commission in enumerate(pending_commissions, 1):
        date = datetime.datetime.fromisoformat(commission.date).strftime("%Y-%m-%d")
        print(f"{i}. {date} - {commission.transaction_type} - {commission.commission_amount:.2f}")
    
    # Get user choice
    while True:
        choice = get_input("\nSelect commission to mark as processed (0 to cancel): ", int)
        
        if choice == 0:
            return
        
        if 1 <= choice <= len(pending_commissions):
            selected_commission = pending_commissions[choice - 1]
            break
        
        print("Invalid choice. Please try again.")
    
    # Get transfer ID
    transfer_id = get_input("Transfer ID (optional): ")
    
    if not transfer_id:
        transfer_id = f"TRANSFER-{datetime.datetime.now().strftime('%Y%m%d')}"
    
    # Mark as processed
    tracker.mark_commission_as_processed(
        selected_commission.commission_id,
        transfer_id,
    )
    
    print(f"\nCommission {selected_commission.commission_id} marked as processed.")
    print(f"Transfer ID: {transfer_id}")


def generate_reconciliation_report(tracker: PaybillCommissionTracker) -> None:
    """Generate a reconciliation report."""
    print("\n--- Generate Reconciliation Report ---")
    
    # Get date range
    today = datetime.datetime.now().date()
    start_date_str = get_input(
        f"Start date (YYYY-MM-DD, default: {today.replace(day=1)}): "
    )
    end_date_str = get_input(
        f"End date (YYYY-MM-DD, default: {today}): "
    )
    
    # Use defaults if empty
    if not start_date_str:
        start_date = datetime.datetime.combine(
            today.replace(day=1),
            datetime.time.min,
        )
    else:
        start_date = datetime.datetime.combine(
            datetime.date.fromisoformat(start_date_str),
            datetime.time.min,
        )
    
    if not end_date_str:
        end_date = datetime.datetime.combine(
            today,
            datetime.time.max,
        )
    else:
        end_date = datetime.datetime.combine(
            datetime.date.fromisoformat(end_date_str),
            datetime.time.max,
        )
    
    # Generate report
    report = tracker.generate_reconciliation_report(
        start_date.isoformat(),
        end_date.isoformat(),
    )
    
    # Save report to file
    report_file = os.path.join(
        DATA_DIR,
        f"reconciliation_{start_date.strftime('%Y%m%d')}_{end_date.strftime('%Y%m%d')}.json",
    )
    
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    # Display report summary
    print(f"\nReport generated and saved to {report_file}")
    print(f"Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print(f"Total Transactions: {report['totalTransactions']}")
    print(f"Total Transaction Amount: {report['totalTransactionAmount']:.2f}")
    print(f"Total Commission Amount: {report['totalCommissionAmount']:.2f}")
    print(f"Pending Commission Amount: {report['pendingCommissionAmount']:.2f}")
    print(f"Processed Commission Amount: {report['processedCommissionAmount']:.2f}")
    
    print("\nTransactions by Type:")
    for t_type, data in report['transactionsByType'].items():
        print(f"{t_type}: {data['count']} transactions, {data['totalAmount']:.2f} amount, {data['commissionAmount']:.2f} commission")


def export_data(tracker: PaybillCommissionTracker) -> None:
    """Export data to CSV."""
    print("\n--- Export Data to CSV ---")
    
    # Get filename
    filename = get_input(
        f"Export filename prefix (default: paybill_export_{datetime.datetime.now().strftime('%Y%m%d')}): "
    )
    
    if not filename:
        filename = f"paybill_export_{datetime.datetime.now().strftime('%Y%m%d')}"
    
    # Export data
    success = tracker.export_to_excel(filename)
    
    if success:
        print(f"\nData exported successfully to:")
        print(f"- {filename}_transactions.csv")
        print(f"- {filename}_commissions.csv")
        print(f"- {filename}_summary.json")
    else:
        print("\nFailed to export data.")


def main() -> None:
    """Main function."""
    tracker = PaybillCommissionTracker()
    
    while True:
        print_menu()
        choice = get_input("Enter your choice: ", int)
        
        if choice == 0:
            print("\nExiting... Thank you for using Paybill Commission Tracker!")
            break
        elif choice == 1:
            record_transaction(tracker)
        elif choice == 2:
            view_recent_transactions(tracker)
        elif choice == 3:
            view_commission_summary(tracker)
        elif choice == 4:
            mark_commission_as_processed(tracker)
        elif choice == 5:
            generate_reconciliation_report(tracker)
        elif choice == 6:
            export_data(tracker)
        else:
            print("Invalid choice. Please try again.")
        
        # Wait for user to continue
        input("\nPress Enter to continue...")


if __name__ == "__main__":
    main()