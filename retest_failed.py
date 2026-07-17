#!/usr/bin/env python3
"""
Re-test the failed tests after server restart
"""

import requests
import json
from datetime import datetime

BASE_URL = "https://logistics-assam-pro.preview.emergentagent.com/api"
ADMIN_PASSWORD = "assam123"

def log(msg, status="INFO"):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{status}] {msg}")

# First, get admin token and create test data
log("Setting up test data...")
response = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
admin_token = response.json()["token"]
log(f"Admin token: {admin_token[:20]}...")

# Get existing bookings to find an LR
response = requests.get(f"{BASE_URL}/bookings", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
bookings = response.json()["items"]
if bookings:
    lr_number = bookings[0]["lrNumber"]
    log(f"Using existing LR: {lr_number}")
else:
    log("No bookings found, creating one...")
    booking_data = {
        "senderName": "Test Sender",
        "senderPhone": "9876543210",
        "receiverName": "Test Receiver",
        "receiverPhone": "9876543211",
        "origin": "Guwahati",
        "destination": "Silchar",
        "packages": 1,
        "actualWeight": 10,
        "chargeableWeight": 10,
        "freightRate": 18,
        "biltyCharge": 100,
        "totalAmount": 280,
        "branchCode": "GHY01",
        "paymentStatus": "PENDING"
    }
    response = requests.post(f"{BASE_URL}/bookings", json=booking_data, headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    lr_number = response.json()["booking"]["lrNumber"]
    log(f"Created new booking: {lr_number}")

# Test 21: Multi-hop Transfers
log("\n" + "="*80)
log("Test 21: Multi-hop Transfers (DBR01→SIL01→TZP01)")
log("="*80)

try:
    # Transfer 1: DBR01→SIL01
    transfer_data_1 = {
        "lrNumber": lr_number,
        "fromBranch": "DBR01",
        "toBranch": "SIL01",
        "remarks": "Second hop",
        "vehicleNumber": "AS02CD5678",
        "driverName": "Rahul Singh"
    }
    response = requests.post(f"{BASE_URL}/transfers", json=transfer_data_1, headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    if response.status_code == 200:
        transfer_id_1 = response.json()["transfer"]["transferId"]
        log(f"✓ Transfer 1 created: {transfer_id_1} (DBR01→SIL01)")
        
        # Receive transfer 1
        response = requests.post(f"{BASE_URL}/transfers/{transfer_id_1}/receive", json={"receivedBy": "SIL Manager", "remarks": "OK"}, headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
        if response.status_code == 200:
            log(f"✓ Transfer 1 received at SIL01")
        else:
            log(f"✗ Failed to receive transfer 1: {response.status_code}", "ERROR")
    else:
        log(f"✗ Failed to create transfer 1: {response.status_code} - {response.text}", "ERROR")
    
    # Transfer 2: SIL01→TZP01
    transfer_data_2 = {
        "lrNumber": lr_number,
        "fromBranch": "SIL01",
        "toBranch": "TZP01",
        "remarks": "Third hop",
        "vehicleNumber": "AS03EF9012",
        "driverName": "Amit Das"
    }
    response = requests.post(f"{BASE_URL}/transfers", json=transfer_data_2, headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    if response.status_code == 200:
        transfer_id_2 = response.json()["transfer"]["transferId"]
        log(f"✓ Transfer 2 created: {transfer_id_2} (SIL01→TZP01)")
        log("✅ Multi-hop transfers test PASSED", "SUCCESS")
    else:
        log(f"✗ Failed to create transfer 2: {response.status_code} - {response.text}", "ERROR")
        log("❌ Multi-hop transfers test FAILED", "ERROR")
except Exception as e:
    log(f"❌ Multi-hop transfers test FAILED: {str(e)}", "ERROR")

# Test 22: Get Booking Transfers
log("\n" + "="*80)
log("Test 22: GET /api/bookings/{lr}/transfers")
log("="*80)

try:
    response = requests.get(f"{BASE_URL}/bookings/{lr_number}/transfers", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    if response.status_code == 200:
        data = response.json()
        log(f"✓ Retrieved {len(data['items'])} transfers for LR {lr_number}")
        log("✅ Get booking transfers test PASSED", "SUCCESS")
    else:
        log(f"✗ Failed: {response.status_code} - {response.text}", "ERROR")
        log("❌ Get booking transfers test FAILED", "ERROR")
except Exception as e:
    log(f"❌ Get booking transfers test FAILED: {str(e)}", "ERROR")

# Test 23: Track with Transfers
log("\n" + "="*80)
log("Test 23: GET /api/track/{lr} - verify timeline contains transfer events")
log("="*80)

try:
    response = requests.get(f"{BASE_URL}/track/{lr_number}", timeout=10)
    if response.status_code == 200:
        data = response.json()
        timeline = data.get("timeline", [])
        transfer_events = [e for e in timeline if "Transfer" in e.get("label", "") or "Received" in e.get("label", "")]
        log(f"✓ Timeline has {len(timeline)} total events, {len(transfer_events)} transfer-related events")
        log(f"✓ Current location: {data.get('currentLocation', 'N/A')}")
        log("✅ Track with transfers test PASSED", "SUCCESS")
    else:
        log(f"✗ Failed: {response.status_code} - {response.text}", "ERROR")
        log("❌ Track with transfers test FAILED", "ERROR")
except Exception as e:
    log(f"❌ Track with transfers test FAILED: {str(e)}", "ERROR")

log("\n" + "="*80)
log("Re-test Complete")
log("="*80)
