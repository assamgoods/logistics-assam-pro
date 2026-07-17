#!/usr/bin/env python3
"""
Backend API Test Suite for ASSAM GOODS CARRIER Transport Management System
Focus: Branch Shipment Transfer Module
"""

import requests
import json
from datetime import datetime

# Base URL from environment
BASE_URL = "https://logistics-assam-pro.preview.emergentagent.com/api"
ADMIN_PASSWORD = "assam123"

# Test data storage
test_data = {
    "admin_token": None,
    "branch_token": None,
    "branches": [],
    "users": [],
    "lr_number": None,
    "transfers": [],
}

def log(msg, status="INFO"):
    """Log test messages"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{status}] {msg}")

def test_health():
    """Test 1: GET /api/health"""
    try:
        log("Testing GET /api/health")
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        log("✅ Health check passed", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Health check failed: {str(e)}", "ERROR")
        return False

def test_admin_login():
    """Test 2: POST /api/admin/login"""
    try:
        log("Testing POST /api/admin/login")
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "token" in data, "Expected token in response"
        test_data["admin_token"] = data["token"]
        log(f"✅ Admin login successful, token: {data['token'][:20]}...", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Admin login failed: {str(e)}", "ERROR")
        return False

def test_create_branches():
    """Test 3: POST /api/branches - create 4 branches"""
    try:
        log("Testing POST /api/branches - creating 4 branches")
        branches_to_create = [
            {"code": "GHY01", "name": "Guwahati Branch", "city": "Guwahati", "state": "Assam", "phone": "9876543210", "address": "Guwahati Hub"},
            {"code": "DBR01", "name": "Dibrugarh Branch", "city": "Dibrugarh", "state": "Assam", "phone": "9876543211", "address": "Dibrugarh Hub"},
            {"code": "SIL01", "name": "Silchar Branch", "city": "Silchar", "state": "Assam", "phone": "9876543212", "address": "Silchar Hub"},
            {"code": "TZP01", "name": "Tezpur Branch", "city": "Tezpur", "state": "Assam", "phone": "9876543213", "address": "Tezpur Hub"},
        ]
        
        for branch in branches_to_create:
            response = requests.post(
                f"{BASE_URL}/branches",
                json=branch,
                headers={"Authorization": f"Bearer {test_data['admin_token']}"},
                timeout=10
            )
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            data = response.json()
            assert data.get("ok") == True, "Expected ok:true"
            test_data["branches"].append(data["branch"])
            log(f"  ✓ Created branch: {branch['code']} - {branch['name']}")
        
        log(f"✅ All 4 branches created successfully", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Branch creation failed: {str(e)}", "ERROR")
        return False

def test_get_branches():
    """Test 4: GET /api/branches"""
    try:
        log("Testing GET /api/branches")
        response = requests.get(
            f"{BASE_URL}/branches",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Expected items in response"
        assert len(data["items"]) >= 4, f"Expected at least 4 branches, got {len(data['items'])}"
        log(f"✅ Retrieved {len(data['items'])} branches", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get branches failed: {str(e)}", "ERROR")
        return False

def test_create_branch_user():
    """Test 5: POST /api/users - create branch user"""
    try:
        log("Testing POST /api/users - creating branch user")
        user_data = {
            "name": "Ravi Kumar",
            "role": "branch",
            "code": "GHY01",
            "password": "ghy123",
            "phone": "9876543220"
        }
        response = requests.post(
            f"{BASE_URL}/users",
            json=user_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        test_data["users"].append(data["user"])
        log(f"✅ Branch user created: {user_data['name']} (code: {user_data['code']})", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ User creation failed: {str(e)}", "ERROR")
        return False

def test_branch_login():
    """Test 6: POST /api/branch/login"""
    try:
        log("Testing POST /api/branch/login")
        response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"code": "GHY01", "password": "ghy123"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "token" in data, "Expected token in response"
        assert data.get("role") == "branch", "Expected role:branch"
        test_data["branch_token"] = data["token"]
        log(f"✅ Branch login successful, role: {data['role']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Branch login failed: {str(e)}", "ERROR")
        return False

def test_create_booking():
    """Test 7: POST /api/bookings - create a booking"""
    try:
        log("Testing POST /api/bookings - creating booking")
        booking_data = {
            "senderName": "Rajesh Sharma",
            "senderPhone": "9876501234",
            "senderGst": "22AAAAA0000A1Z5",
            "pickupAddress": "Fancy Bazar, Guwahati",
            "receiverName": "Priya Das",
            "receiverPhone": "9876502345",
            "deliveryAddress": "Silchar Main Road",
            "origin": "Guwahati",
            "destination": "Silchar",
            "packages": 2,
            "actualWeight": 50,
            "chargeableWeight": 50,
            "freightRate": 18,
            "biltyCharge": 100,
            "doorDeliveryCharge": 50,
            "insurance": 100,
            "loadingUnloading": 50,
            "otherCharges": 0,
            "totalAmount": 1200,
            "branchCode": "GHY01",
            "paymentStatus": "PENDING",
            "paymentMode": "CASH"
        }
        response = requests.post(
            f"{BASE_URL}/bookings",
            json=booking_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "booking" in data, "Expected booking in response"
        lr_number = data["booking"]["lrNumber"]
        assert lr_number.startswith("AGC-"), f"Expected LR to start with AGC-, got {lr_number}"
        test_data["lr_number"] = lr_number
        log(f"✅ Booking created with LR: {lr_number}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Booking creation failed: {str(e)}", "ERROR")
        return False

def test_get_booking():
    """Test 8: GET /api/bookings/{lr}"""
    try:
        log(f"Testing GET /api/bookings/{test_data['lr_number']}")
        response = requests.get(
            f"{BASE_URL}/bookings/{test_data['lr_number']}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "booking" in data, "Expected booking in response"
        assert data["booking"]["lrNumber"] == test_data["lr_number"], "LR number mismatch"
        log(f"✅ Retrieved booking: {test_data['lr_number']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get booking failed: {str(e)}", "ERROR")
        return False

def test_track_booking():
    """Test 9: GET /api/track/{lr}"""
    try:
        log(f"Testing GET /api/track/{test_data['lr_number']}")
        response = requests.get(
            f"{BASE_URL}/track/{test_data['lr_number']}",
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "timeline" in data, "Expected timeline in response"
        assert "stages" in data, "Expected stages in response"
        log(f"✅ Tracking info retrieved with {len(data['timeline'])} timeline entries", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Track booking failed: {str(e)}", "ERROR")
        return False

def test_update_booking_status():
    """Test 10: POST /api/bookings/{lr}/status"""
    try:
        log(f"Testing POST /api/bookings/{test_data['lr_number']}/status")
        status_data = {
            "status": "PICKED_UP",
            "location": "Guwahati Hub",
            "note": "Picked up from sender"
        }
        response = requests.post(
            f"{BASE_URL}/bookings/{test_data['lr_number']}/status",
            json=status_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        log(f"✅ Booking status updated to PICKED_UP", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Update booking status failed: {str(e)}", "ERROR")
        return False

def test_get_stats():
    """Test 11: GET /api/stats"""
    try:
        log("Testing GET /api/stats")
        response = requests.get(
            f"{BASE_URL}/stats",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "totalBookings" in data, "Expected totalBookings in response"
        assert "totalRevenue" in data, "Expected totalRevenue in response"
        log(f"✅ Stats retrieved: {data['totalBookings']} bookings, ₹{data['totalRevenue']} revenue", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get stats failed: {str(e)}", "ERROR")
        return False

def test_create_transfer():
    """Test 12: POST /api/transfers - create transfer GHY01→DBR01"""
    try:
        log("Testing POST /api/transfers - creating transfer GHY01→DBR01")
        transfer_data = {
            "lrNumber": test_data["lr_number"],
            "fromBranch": "GHY01",
            "toBranch": "DBR01",
            "remarks": "Loaded on TR-01",
            "vehicleNumber": "AS01AB1234",
            "driverName": "Kabir Ahmed"
        }
        response = requests.post(
            f"{BASE_URL}/transfers",
            json=transfer_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "transfer" in data, "Expected transfer in response"
        transfer_id = data["transfer"]["transferId"]
        assert transfer_id.startswith("TXF-"), f"Expected transfer ID to start with TXF-, got {transfer_id}"
        assert data["transfer"]["status"] == "IN_TRANSIT", "Expected status IN_TRANSIT"
        test_data["transfers"].append(data["transfer"])
        log(f"✅ Transfer created: {transfer_id} (GHY01→DBR01)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Create transfer failed: {str(e)}", "ERROR")
        return False

def test_create_transfer_same_branch():
    """Test 13: POST /api/transfers with same from/to - should return 400"""
    try:
        log("Testing POST /api/transfers with same from/to (should fail)")
        transfer_data = {
            "lrNumber": test_data["lr_number"],
            "fromBranch": "GHY01",
            "toBranch": "GHY01",
            "remarks": "Invalid transfer"
        }
        response = requests.post(
            f"{BASE_URL}/transfers",
            json=transfer_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == False, "Expected ok:false"
        log(f"✅ Same branch transfer correctly rejected with 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Same branch transfer test failed: {str(e)}", "ERROR")
        return False

def test_create_transfer_fake_lr():
    """Test 14: POST /api/transfers with fake LR - should return 404"""
    try:
        log("Testing POST /api/transfers with fake LR (should fail)")
        transfer_data = {
            "lrNumber": "AGC-999999-9999",
            "fromBranch": "GHY01",
            "toBranch": "DBR01",
            "remarks": "Invalid LR"
        }
        response = requests.post(
            f"{BASE_URL}/transfers",
            json=transfer_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == False, "Expected ok:false"
        log(f"✅ Fake LR transfer correctly rejected with 404", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Fake LR transfer test failed: {str(e)}", "ERROR")
        return False

def test_get_all_transfers():
    """Test 15: GET /api/transfers"""
    try:
        log("Testing GET /api/transfers")
        response = requests.get(
            f"{BASE_URL}/transfers",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Expected items in response"
        assert len(data["items"]) >= 1, f"Expected at least 1 transfer, got {len(data['items'])}"
        log(f"✅ Retrieved {len(data['items'])} transfers", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get all transfers failed: {str(e)}", "ERROR")
        return False

def test_get_transfers_filter_from():
    """Test 16: GET /api/transfers?from=GHY01"""
    try:
        log("Testing GET /api/transfers?from=GHY01")
        response = requests.get(
            f"{BASE_URL}/transfers?from=GHY01",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Expected items in response"
        for item in data["items"]:
            assert item["fromBranch"] == "GHY01", f"Expected fromBranch=GHY01, got {item['fromBranch']}"
        log(f"✅ Filter by from=GHY01 works, found {len(data['items'])} transfers", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Filter by from failed: {str(e)}", "ERROR")
        return False

def test_get_transfers_filter_to_status():
    """Test 17: GET /api/transfers?to=DBR01&status=IN_TRANSIT"""
    try:
        log("Testing GET /api/transfers?to=DBR01&status=IN_TRANSIT")
        response = requests.get(
            f"{BASE_URL}/transfers?to=DBR01&status=IN_TRANSIT",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Expected items in response"
        for item in data["items"]:
            assert item["toBranch"] == "DBR01", f"Expected toBranch=DBR01, got {item['toBranch']}"
            assert item["status"] == "IN_TRANSIT", f"Expected status=IN_TRANSIT, got {item['status']}"
        log(f"✅ Filter by to=DBR01&status=IN_TRANSIT works, found {len(data['items'])} transfers", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Filter by to and status failed: {str(e)}", "ERROR")
        return False

def test_get_single_transfer():
    """Test 18: GET /api/transfers/{transferId}"""
    try:
        transfer_id = test_data["transfers"][0]["transferId"]
        log(f"Testing GET /api/transfers/{transfer_id}")
        response = requests.get(
            f"{BASE_URL}/transfers/{transfer_id}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "transfer" in data, "Expected transfer in response"
        assert data["transfer"]["transferId"] == transfer_id, "Transfer ID mismatch"
        log(f"✅ Retrieved single transfer: {transfer_id}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get single transfer failed: {str(e)}", "ERROR")
        return False

def test_receive_transfer():
    """Test 19: POST /api/transfers/{transferId}/receive"""
    try:
        transfer_id = test_data["transfers"][0]["transferId"]
        log(f"Testing POST /api/transfers/{transfer_id}/receive")
        receive_data = {
            "receivedBy": "Branch Manager",
            "remarks": "Received in good condition"
        }
        response = requests.post(
            f"{BASE_URL}/transfers/{transfer_id}/receive",
            json=receive_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert data["transfer"]["status"] == "RECEIVED", "Expected status RECEIVED"
        assert data["transfer"]["receivedBy"] == "Branch Manager", "receivedBy mismatch"
        log(f"✅ Transfer received successfully: {transfer_id}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Receive transfer failed: {str(e)}", "ERROR")
        return False

def test_receive_transfer_duplicate():
    """Test 20: POST /api/transfers/{transferId}/receive again - should return 400"""
    try:
        transfer_id = test_data["transfers"][0]["transferId"]
        log(f"Testing POST /api/transfers/{transfer_id}/receive again (should fail)")
        receive_data = {
            "receivedBy": "Another Manager",
            "remarks": "Duplicate receive"
        }
        response = requests.post(
            f"{BASE_URL}/transfers/{transfer_id}/receive",
            json=receive_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == False, "Expected ok:false"
        log(f"✅ Duplicate receive correctly rejected with 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Duplicate receive test failed: {str(e)}", "ERROR")
        return False

def test_multi_hop_transfers():
    """Test 21: Create multi-hop transfers DBR01→SIL01, then SIL01→TZP01"""
    try:
        log("Testing multi-hop transfers: DBR01→SIL01→TZP01")
        
        # Transfer 2: DBR01→SIL01
        transfer_data_2 = {
            "lrNumber": test_data["lr_number"],
            "fromBranch": "DBR01",
            "toBranch": "SIL01",
            "remarks": "Second hop",
            "vehicleNumber": "AS02CD5678",
            "driverName": "Rahul Singh"
        }
        response = requests.post(
            f"{BASE_URL}/transfers",
            json=transfer_data_2,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200 for transfer 2, got {response.status_code}"
        data = response.json()
        transfer_id_2 = data["transfer"]["transferId"]
        test_data["transfers"].append(data["transfer"])
        log(f"  ✓ Transfer 2 created: {transfer_id_2} (DBR01→SIL01)")
        
        # Receive transfer 2
        response = requests.post(
            f"{BASE_URL}/transfers/{transfer_id_2}/receive",
            json={"receivedBy": "SIL Manager", "remarks": "OK"},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200 for receive 2, got {response.status_code}"
        log(f"  ✓ Transfer 2 received at SIL01")
        
        # Transfer 3: SIL01→TZP01
        transfer_data_3 = {
            "lrNumber": test_data["lr_number"],
            "fromBranch": "SIL01",
            "toBranch": "TZP01",
            "remarks": "Third hop",
            "vehicleNumber": "AS03EF9012",
            "driverName": "Amit Das"
        }
        response = requests.post(
            f"{BASE_URL}/transfers",
            json=transfer_data_3,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200 for transfer 3, got {response.status_code}"
        data = response.json()
        transfer_id_3 = data["transfer"]["transferId"]
        test_data["transfers"].append(data["transfer"])
        log(f"  ✓ Transfer 3 created: {transfer_id_3} (SIL01→TZP01)")
        
        log(f"✅ Multi-hop transfers created successfully", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Multi-hop transfers failed: {str(e)}", "ERROR")
        return False

def test_get_booking_transfers():
    """Test 22: GET /api/bookings/{lr}/transfers"""
    try:
        log(f"Testing GET /api/bookings/{test_data['lr_number']}/transfers")
        response = requests.get(
            f"{BASE_URL}/bookings/{test_data['lr_number']}/transfers",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Expected items in response"
        assert len(data["items"]) >= 3, f"Expected at least 3 transfers, got {len(data['items'])}"
        # Verify chronological order
        for i in range(len(data["items"]) - 1):
            assert data["items"][i]["createdAt"] <= data["items"][i+1]["createdAt"], "Transfers not in chronological order"
        log(f"✅ Retrieved {len(data['items'])} transfers for LR in chronological order", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get booking transfers failed: {str(e)}", "ERROR")
        return False

def test_track_with_transfers():
    """Test 23: GET /api/track/{lr} - verify timeline contains transfer events"""
    try:
        log(f"Testing GET /api/track/{test_data['lr_number']} - verifying transfer events in timeline")
        response = requests.get(
            f"{BASE_URL}/track/{test_data['lr_number']}",
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "timeline" in data, "Expected timeline in response"
        
        # Check for transfer-related events
        timeline = data["timeline"]
        transfer_events = [e for e in timeline if "Transfer" in e.get("label", "") or "Received" in e.get("label", "")]
        assert len(transfer_events) >= 3, f"Expected at least 3 transfer events, got {len(transfer_events)}"
        
        # Verify currentLocation reflects latest transfer
        assert "currentLocation" in data, "Expected currentLocation in response"
        log(f"  Current location: {data['currentLocation']}")
        
        log(f"✅ Timeline contains {len(transfer_events)} transfer events, current location: {data['currentLocation']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Track with transfers failed: {str(e)}", "ERROR")
        return False

def test_create_rate():
    """Test 24: POST /api/rates"""
    try:
        log("Testing POST /api/rates")
        rate_data = {
            "fromState": "Assam",
            "toState": "Assam",
            "fromCity": "Guwahati",
            "toCity": "Silchar",
            "ratePerKg": 18,
            "minBilty": 500,
            "biltyCharge": 100,
            "doorCharge": 50,
            "insurancePct": 2,
            "fuelSurcharge": 5,
            "gst": 18
        }
        response = requests.post(
            f"{BASE_URL}/rates",
            json=rate_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("ok") == True, "Expected ok:true"
        log(f"✅ Rate created: Guwahati→Silchar @ ₹{rate_data['ratePerKg']}/kg", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Create rate failed: {str(e)}", "ERROR")
        return False

def test_get_rates():
    """Test 25: GET /api/rates"""
    try:
        log("Testing GET /api/rates")
        response = requests.get(
            f"{BASE_URL}/rates",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "items" in data, "Expected items in response"
        log(f"✅ Retrieved {len(data['items'])} rates", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Get rates failed: {str(e)}", "ERROR")
        return False

def test_daily_report():
    """Test 26: GET /api/reports/daily"""
    try:
        today = datetime.now().strftime("%Y-%m-%d")
        log(f"Testing GET /api/reports/daily?date={today}")
        response = requests.get(
            f"{BASE_URL}/reports/daily?date={today}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "date" in data, "Expected date in response"
        assert "count" in data, "Expected count in response"
        assert "total" in data, "Expected total in response"
        log(f"✅ Daily report: {data['count']} bookings, ₹{data['total']} total", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Daily report failed: {str(e)}", "ERROR")
        return False

def test_outstanding_report():
    """Test 27: GET /api/reports/outstanding"""
    try:
        log("Testing GET /api/reports/outstanding")
        response = requests.get(
            f"{BASE_URL}/reports/outstanding",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "count" in data, "Expected count in response"
        assert "total" in data, "Expected total in response"
        log(f"✅ Outstanding report: {data['count']} bookings, ₹{data['total']} outstanding", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ Outstanding report failed: {str(e)}", "ERROR")
        return False

def main():
    """Run all tests"""
    log("=" * 80)
    log("ASSAM GOODS CARRIER - Backend API Test Suite")
    log("Focus: Branch Shipment Transfer Module")
    log("=" * 80)
    
    tests = [
        ("Health Check", test_health),
        ("Admin Login", test_admin_login),
        ("Create Branches", test_create_branches),
        ("Get Branches", test_get_branches),
        ("Create Branch User", test_create_branch_user),
        ("Branch Login", test_branch_login),
        ("Create Booking", test_create_booking),
        ("Get Booking", test_get_booking),
        ("Track Booking", test_track_booking),
        ("Update Booking Status", test_update_booking_status),
        ("Get Stats", test_get_stats),
        ("Create Transfer", test_create_transfer),
        ("Create Transfer (Same Branch - Should Fail)", test_create_transfer_same_branch),
        ("Create Transfer (Fake LR - Should Fail)", test_create_transfer_fake_lr),
        ("Get All Transfers", test_get_all_transfers),
        ("Get Transfers (Filter by From)", test_get_transfers_filter_from),
        ("Get Transfers (Filter by To & Status)", test_get_transfers_filter_to_status),
        ("Get Single Transfer", test_get_single_transfer),
        ("Receive Transfer", test_receive_transfer),
        ("Receive Transfer (Duplicate - Should Fail)", test_receive_transfer_duplicate),
        ("Multi-hop Transfers", test_multi_hop_transfers),
        ("Get Booking Transfers", test_get_booking_transfers),
        ("Track with Transfers", test_track_with_transfers),
        ("Create Rate", test_create_rate),
        ("Get Rates", test_get_rates),
        ("Daily Report", test_daily_report),
        ("Outstanding Report", test_outstanding_report),
    ]
    
    results = []
    for name, test_func in tests:
        log(f"\n{'='*80}")
        log(f"Running: {name}")
        log(f"{'='*80}")
        result = test_func()
        results.append((name, result))
    
    # Summary
    log("\n" + "=" * 80)
    log("TEST SUMMARY")
    log("=" * 80)
    passed = sum(1 for _, r in results if r)
    failed = sum(1 for _, r in results if not r)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        log(f"{status}: {name}")
    
    log(f"\nTotal: {len(results)} tests")
    log(f"Passed: {passed}")
    log(f"Failed: {failed}")
    log(f"Success Rate: {(passed/len(results)*100):.1f}%")
    log("=" * 80)

if __name__ == "__main__":
    main()
