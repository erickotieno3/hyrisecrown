#!/usr/bin/env python3
"""
Simplified Paybill Commission Tracker for Hyrise Crown

A lightweight version that combines SQLite database with easy-to-use functions
while maintaining the correct commission rates and merchant information.
"""

import sqlite3
import csv
from datetime import datetime
import os

# Business details
MERCHANT_NAME = "Kisumu Hyrise Crown Restaurant"
PAYBILL_NUMBER = "6061123"  # New paybill number
BANK_ACCOUNT = "01521209171200"
BANK_NAME = "National Bank Kisumu Kenya"

# Commission rates (these match your system's rates)
COMMISSION_RATES = {
    "TOP_UP": 0.015,         # 1.5% for account top-ups
    "AIRTIME_PURCHASE": 0.025, # 2.5% for airtime purchases
    "SERVICE_PAYMENT": 0.02   # 2% for service payments
}

# Database setup
DB_FILE = "hyrise_commissions.db"

def setup_database():
    """Create the SQLite database and tables if they don't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create transactions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        description TEXT,
        mpesa_receipt TEXT,
        paybill_number TEXT NOT NULL,
        date TEXT NOT NULL
    )
    """)
    
    # Create commissions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS commissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        commission_amount REAL NOT NULL,
        transaction_type TEXT NOT NULL,
        processed INTEGER NOT NULL DEFAULT 0,
        date TEXT NOT NULL,
        processed_date TEXT,
        transfer_id TEXT,
        FOREIGN KEY (transaction_id) REFERENCES transactions (id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("✅ Database and tables ready.")

def record_transaction(phone_number, amount, transaction_type, description="", mpesa_receipt=None):
    """Record a transaction and calculate commission."""
    # Validate transaction type
    if transaction_type not in COMMISSION_RATES:
        valid_types = ", ".join(COMMISSION_RATES.keys())
        print(f"❌ Invalid transaction type. Valid types: {valid_types}")
        return False
    
    # Calculate commission
    commission_rate = COMMISSION_RATES[transaction_type]
    commission_amount = round(amount * commission_rate, 2)
    
    # Get current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Connect to database
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Insert transaction
        cursor.execute("""
        INSERT INTO transactions 
        (phone_number, amount, transaction_type, description, mpesa_receipt, paybill_number, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (phone_number, amount, transaction_type, description, mpesa_receipt, PAYBILL_NUMBER, timestamp))
        
        # Get the transaction ID
        transaction_id = cursor.lastrowid
        
        # Insert commission
        cursor.execute("""
        INSERT INTO commissions
        (transaction_id, amount, commission_amount, transaction_type, processed, date)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (transaction_id, amount, commission_amount, transaction_type, 0, timestamp))
        
        conn.commit()
        
        # Print success message
        print(f"✅ Transaction recorded successfully:")
        print(f"   Customer: {phone_number}")
        print(f"   Amount: KES {amount}")
        print(f"   Type: {transaction_type}")
        print(f"   Commission Rate: {commission_rate*100}%")
        print(f"   Commission Earned: KES {commission_amount}")
        if mpesa_receipt:
            print(f"   M-PESA Receipt: {mpesa_receipt}")
        print(f"   Merchant: {MERCHANT_NAME}")
        print(f"   Paybill: {PAYBILL_NUMBER}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error recording transaction: {e}")
        conn.rollback()
        return False
    
    finally:
        conn.close()

def view_transactions(limit=10):
    """View recent transactions."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT t.id, t.phone_number, t.amount, t.transaction_type, 
           t.description, t.mpesa_receipt, t.date,
           c.commission_amount, c.processed
    FROM transactions t
    JOIN commissions c ON t.id = c.transaction_id
    ORDER BY t.date DESC
    LIMIT ?
    """, (limit,))
    
    records = cursor.fetchall()
    
    if not records:
        print("No transactions found.")
    else:
        print("\n===== RECENT TRANSACTIONS =====")
        for row in records:
            (id, phone, amount, type, desc, receipt, date, commission, processed) = row
            print(f"\nTransaction #{id} - {date}")
            print(f"Phone: {phone}")
            print(f"Amount: KES {amount}")
            print(f"Type: {type}")
            print(f"Description: {desc}")
            if receipt:
                print(f"M-PESA Receipt: {receipt}")
            print(f"Commission: KES {commission} {'(Processed)' if processed else '(Pending)'}")
    
    conn.close()

def get_commission_summary():
    """Get summary of commissions."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Get totals
    cursor.execute("""
    SELECT 
        SUM(commission_amount) as total,
        SUM(CASE WHEN processed = 0 THEN commission_amount ELSE 0 END) as pending,
        SUM(CASE WHEN processed = 1 THEN commission_amount ELSE 0 END) as processed
    FROM commissions
    """)
    
    totals = cursor.fetchone()
    
    # Get by type
    cursor.execute("""
    SELECT 
        transaction_type,
        SUM(commission_amount) as total
    FROM commissions
    GROUP BY transaction_type
    """)
    
    by_type = cursor.fetchall()
    
    conn.close()
    
    # Format and display summary
    total, pending, processed = totals if totals[0] else (0, 0, 0)
    
    print("\n===== COMMISSION SUMMARY =====")
    print(f"Merchant: {MERCHANT_NAME}")
    print(f"Paybill: {PAYBILL_NUMBER}")
    print(f"Bank Account: {BANK_NAME} - {BANK_ACCOUNT}")
    print("\nTotals:")
    print(f"Total Commission: KES {total or 0:.2f}")
    print(f"Pending Commission: KES {pending or 0:.2f}")
    print(f"Processed Commission: KES {processed or 0:.2f}")
    
    print("\nBy Transaction Type:")
    for type_row in by_type:
        t_type, amount = type_row
        rate = COMMISSION_RATES[t_type] * 100
        print(f"{t_type} ({rate:.1f}%): KES {amount:.2f}")

def mark_commission_processed(transaction_id, transfer_id=None):
    """Mark a commission as processed."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Check if transaction exists
        cursor.execute("SELECT id FROM transactions WHERE id = ?", (transaction_id,))
        if not cursor.fetchone():
            print(f"❌ Transaction #{transaction_id} not found.")
            return False
        
        # Check if commission is already processed
        cursor.execute("SELECT processed FROM commissions WHERE transaction_id = ?", (transaction_id,))
        result = cursor.fetchone()
        if not result:
            print(f"❌ No commission found for transaction #{transaction_id}.")
            return False
        
        if result[0] == 1:
            print(f"⚠️ Commission for transaction #{transaction_id} is already processed.")
            return False
        
        # Generate transfer ID if not provided
        if not transfer_id:
            transfer_id = f"TRANSFER-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Mark as processed
        processed_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
        UPDATE commissions
        SET processed = 1, processed_date = ?, transfer_id = ?
        WHERE transaction_id = ?
        """, (processed_date, transfer_id, transaction_id))
        
        conn.commit()
        print(f"✅ Commission for transaction #{transaction_id} marked as processed.")
        print(f"   Transfer ID: {transfer_id}")
        print(f"   Processed Date: {processed_date}")
        return True
    
    except Exception as e:
        print(f"❌ Error marking commission as processed: {e}")
        conn.rollback()
        return False
    
    finally:
        conn.close()

def export_to_csv():
    """Export all data to CSV files."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create export directory
    if not os.path.exists("exports"):
        os.makedirs("exports")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Export transactions
    transactions_file = f"exports/transactions_{timestamp}.csv"
    cursor.execute("SELECT * FROM transactions")
    transactions = cursor.fetchall()
    
    with open(transactions_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Phone", "Amount", "Type", "Description", "M-PESA Receipt", "Paybill", "Date"])
        writer.writerows(transactions)
    
    # Export commissions
    commissions_file = f"exports/commissions_{timestamp}.csv"
    cursor.execute("SELECT * FROM commissions")
    commissions = cursor.fetchall()
    
    with open(commissions_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Transaction ID", "Amount", "Commission Amount", 
                        "Type", "Processed", "Date", "Processed Date", "Transfer ID"])
        writer.writerows(commissions)
    
    conn.close()
    
    print(f"✅ Data exported to:")
    print(f"   - {transactions_file}")
    print(f"   - {commissions_file}")

def interactive_menu():
    """Display an interactive menu for the user."""
    setup_database()
    
    while True:
        print("\n" + "=" * 40)
        print(f"PAYBILL COMMISSION TRACKER - {PAYBILL_NUMBER}")
        print("=" * 40)
        print("1. Record new transaction")
        print("2. View recent transactions")
        print("3. View commission summary")
        print("4. Mark commission as processed")
        print("5. Export data to CSV")
        print("0. Exit")
        print("=" * 40)
        
        choice = input("Enter your choice: ")
        
        if choice == "1":
            phone = input("Phone number: ")
            
            try:
                amount = float(input("Amount: "))
            except ValueError:
                print("❌ Invalid amount. Please enter a number.")
                continue
            
            print("\nTransaction Types:")
            for i, t_type in enumerate(COMMISSION_RATES.keys(), 1):
                rate = COMMISSION_RATES[t_type] * 100
                print(f"{i}. {t_type} ({rate:.1f}% commission)")
            
            try:
                type_choice = int(input("Select transaction type (1-3): "))
                if type_choice < 1 or type_choice > len(COMMISSION_RATES):
                    print("❌ Invalid choice.")
                    continue
                
                transaction_type = list(COMMISSION_RATES.keys())[type_choice - 1]
            except ValueError:
                print("❌ Invalid choice. Please enter a number.")
                continue
            
            description = input("Description: ")
            mpesa_receipt = input("M-PESA Receipt (optional): ").strip() or None
            
            record_transaction(phone, amount, transaction_type, description, mpesa_receipt)
        
        elif choice == "2":
            view_transactions()
        
        elif choice == "3":
            get_commission_summary()
        
        elif choice == "4":
            try:
                transaction_id = int(input("Enter transaction ID to mark as processed: "))
                transfer_id = input("Transfer ID (optional): ").strip() or None
                mark_commission_processed(transaction_id, transfer_id)
            except ValueError:
                print("❌ Invalid transaction ID. Please enter a number.")
        
        elif choice == "5":
            export_to_csv()
        
        elif choice == "0":
            print("Exiting. Thank you for using Paybill Commission Tracker!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    # Run the interactive menu
    interactive_menu()
    
    # Or use the functions directly in your code:
    # setup_database()
    # record_transaction("0712345678", 1000, "TOP_UP", "Account top-up", "QK7HR45XZM")
    # view_transactions()
    # get_commission_summary()