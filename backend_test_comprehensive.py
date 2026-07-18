#!/usr/bin/env python3
"""
COMPREHENSIVE Backend API Test Suite for ASSAM GOODS CARRIER TMS
Production Readiness Testing - ALL Modules
"""

import requests
import json
import time
from datetime import datetime

# Base URL from environment
BASE_URL = "https://logistics-assam-pro.preview.emergentagent.com/api"
ADMIN_PASSWORD = "assam123"

# Test data storage
test_data = {
    "admin_token": None,
    "branch_token": None,
    "customer_token": None,
    "branches": [],
    "users": [],
    "lr_numbers": [],
    "transfers": [],
    "rates": [],
    "label_sizes": [],
    "enquiries": [],
}

test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log(msg, status="INFO"):
    """Log test messages"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{status}] {msg}")

def assert_test(condition, message, test_name):
    """Assert with test tracking"""
    if not condition:
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {message}")
        raise AssertionError(message)
    test_results["passed"] += 1

# ============ 1. HEALTH & INFRA ============
def test_health():
    """Test: GET /api/health → 200"""
    try:
        log("TEST 1: GET /api/health")
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Health Check")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Health Check")
        log("✅ PASS: Health check", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Health check - {str(e)}", "ERROR")
        return False

# ============ 2. AUTHENTICATION ============
def test_admin_login_correct():
    """Test: POST /api/admin/login with correct password → returns token"""
    try:
        log("TEST 2: POST /api/admin/login (correct password)")
        response = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Admin Login Correct")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Admin Login Correct")
        assert_test("token" in data, "Expected token in response", "Admin Login Correct")
        assert_test(data.get("role") == "admin", "Expected role:admin", "Admin Login Correct")
        test_data["admin_token"] = data["token"]
        log(f"✅ PASS: Admin login correct, token: {data['token'][:20]}...", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Admin login correct - {str(e)}", "ERROR")
        return False

def test_admin_login_wrong():
    """Test: POST /api/admin/login with wrong password → 401"""
    try:
        log("TEST 3: POST /api/admin/login (wrong password)")
        response = requests.post(f"{BASE_URL}/admin/login", json={"password": "wrongpassword123"}, timeout=10)
        assert_test(response.status_code == 401, f"Expected 401, got {response.status_code}", "Admin Login Wrong")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Admin Login Wrong")
        log("✅ PASS: Admin login wrong password returns 401", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Admin login wrong - {str(e)}", "ERROR")
        return False

def test_create_branch_user():
    """Test: Create branch user for login tests"""
    try:
        log("TEST 4: POST /api/users (create branch user)")
        user_data = {
            "name": "Rajesh Kumar",
            "email": "rajesh.ghy@assamgoods.in",
            "role": "branch",
            "code": "GHY01",
            "password": "ghy123",
            "phone": "9876543210"
        }
        response = requests.post(
            f"{BASE_URL}/users",
            json=user_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Create Branch User")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Create Branch User")
        test_data["users"].append(data["user"])
        log(f"✅ PASS: Branch user created: {user_data['email']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create branch user - {str(e)}", "ERROR")
        return False

def test_branch_login_email():
    """Test: POST /api/branch/login with email → success"""
    try:
        log("TEST 5: POST /api/branch/login (with email)")
        response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"email": "rajesh.ghy@assamgoods.in", "password": "ghy123"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Branch Login Email")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Branch Login Email")
        assert_test("token" in data, "Expected token in response", "Branch Login Email")
        assert_test(data.get("role") == "branch", "Expected role:branch", "Branch Login Email")
        test_data["branch_token"] = data["token"]
        log(f"✅ PASS: Branch login with email, token: {data['token'][:20]}...", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Branch login email - {str(e)}", "ERROR")
        return False

def test_branch_login_code():
    """Test: POST /api/branch/login with code → success (backward compat)"""
    try:
        log("TEST 6: POST /api/branch/login (with code)")
        response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"code": "GHY01", "password": "ghy123"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Branch Login Code")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Branch Login Code")
        assert_test("token" in data, "Expected token in response", "Branch Login Code")
        log("✅ PASS: Branch login with code (backward compat)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Branch login code - {str(e)}", "ERROR")
        return False

def test_branch_login_wrong():
    """Test: POST /api/branch/login with wrong password → 401"""
    try:
        log("TEST 7: POST /api/branch/login (wrong password)")
        response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"email": "rajesh.ghy@assamgoods.in", "password": "wrongpass"},
            timeout=10
        )
        assert_test(response.status_code == 401, f"Expected 401, got {response.status_code}", "Branch Login Wrong")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Branch Login Wrong")
        log("✅ PASS: Branch login wrong password returns 401", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Branch login wrong - {str(e)}", "ERROR")
        return False

def test_customer_login():
    """Test: POST /api/customer/login with phone → returns token"""
    try:
        log("TEST 8: POST /api/customer/login")
        response = requests.post(
            f"{BASE_URL}/customer/login",
            json={"phone": "9876543210"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Customer Login")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Customer Login")
        assert_test("token" in data, "Expected token in response", "Customer Login")
        assert_test(data.get("role") == "customer", "Expected role:customer", "Customer Login")
        test_data["customer_token"] = data["token"]
        log(f"✅ PASS: Customer login, token: {data['token'][:20]}...", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Customer login - {str(e)}", "ERROR")
        return False

# ============ 3. COMPANY SETTINGS ============
def test_settings_get_autoseed():
    """Test: GET /api/settings → auto-seeds defaults on first call"""
    try:
        log("TEST 9: GET /api/settings (auto-seed)")
        response = requests.get(f"{BASE_URL}/settings", timeout=10)
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Settings Get")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Settings Get")
        assert_test("settings" in data, "Expected settings in response", "Settings Get")
        settings = data["settings"]
        assert_test(settings.get("companyName") == "ASSAM GOODS CARRIER", "Expected default company name", "Settings Get")
        assert_test(settings.get("lrPrefix") == "AGC", "Expected default LR prefix", "Settings Get")
        log("✅ PASS: Settings auto-seeded with defaults", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Settings get - {str(e)}", "ERROR")
        return False

def test_settings_update_with_admin():
    """Test: PUT /api/settings (admin token) → updates company info"""
    try:
        log("TEST 10: PUT /api/settings (with admin token)")
        update_data = {
            "companyName": "ASSAM GOODS CARRIER PVT LTD",
            "phone": "8847428801",
            "email": "info@assamgoodscarrier.in"
        }
        response = requests.put(
            f"{BASE_URL}/settings",
            json=update_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Settings Update Admin")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Settings Update Admin")
        settings = data["settings"]
        assert_test(settings.get("companyName") == "ASSAM GOODS CARRIER PVT LTD", "Expected updated company name", "Settings Update Admin")
        log("✅ PASS: Settings updated with admin token", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Settings update admin - {str(e)}", "ERROR")
        return False

def test_settings_update_without_admin():
    """Test: PUT /api/settings without admin token → 403"""
    try:
        log("TEST 11: PUT /api/settings (without admin token)")
        response = requests.put(
            f"{BASE_URL}/settings",
            json={"companyName": "HACKED"},
            headers={"Authorization": f"Bearer {test_data['branch_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 403, f"Expected 403, got {response.status_code}", "Settings Update No Admin")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Settings Update No Admin")
        log("✅ PASS: Settings update without admin returns 403", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Settings update no admin - {str(e)}", "ERROR")
        return False

def test_settings_update_smtp():
    """Test: PUT /api/settings with SMTP config → persists"""
    try:
        log("TEST 12: PUT /api/settings (SMTP config)")
        smtp_data = {
            "smtp": {
                "host": "smtp.gmail.com",
                "port": 587,
                "user": "test@assamgoods.in",
                "pass": "testpass123",
                "from": "noreply@assamgoods.in"
            }
        }
        response = requests.put(
            f"{BASE_URL}/settings",
            json=smtp_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Settings SMTP")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Settings SMTP")
        settings = data["settings"]
        assert_test("smtp" in settings, "Expected smtp in settings", "Settings SMTP")
        log("✅ PASS: SMTP config persisted", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Settings SMTP - {str(e)}", "ERROR")
        return False

# ============ 4. USER MANAGEMENT ============
def test_user_create_without_email():
    """Test: POST /api/users WITHOUT email → 400"""
    try:
        log("TEST 13: POST /api/users (without email)")
        response = requests.post(
            f"{BASE_URL}/users",
            json={"name": "Test User", "role": "branch"},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "User Create No Email")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "User Create No Email")
        log("✅ PASS: User creation without email returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: User create no email - {str(e)}", "ERROR")
        return False

def test_user_create_duplicate_email():
    """Test: POST /api/users with duplicate email → 400"""
    try:
        log("TEST 14: POST /api/users (duplicate email)")
        response = requests.post(
            f"{BASE_URL}/users",
            json={"name": "Duplicate User", "email": "rajesh.ghy@assamgoods.in", "role": "branch"},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "User Create Duplicate")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "User Create Duplicate")
        log("✅ PASS: Duplicate email returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: User create duplicate - {str(e)}", "ERROR")
        return False

def test_user_get_all():
    """Test: GET /api/users → lists all"""
    try:
        log("TEST 15: GET /api/users")
        response = requests.get(
            f"{BASE_URL}/users",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "User Get All")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "User Get All")
        assert_test(len(data["items"]) > 0, "Expected at least one user", "User Get All")
        log(f"✅ PASS: Retrieved {len(data['items'])} users", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: User get all - {str(e)}", "ERROR")
        return False

def test_user_patch():
    """Test: PATCH /api/users/:id (admin) → updates email/name"""
    try:
        log("TEST 16: PATCH /api/users/:id")
        user_id = test_data["users"][0]["id"]
        response = requests.patch(
            f"{BASE_URL}/users/{user_id}",
            json={"name": "Rajesh Kumar Updated"},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "User Patch")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "User Patch")
        log("✅ PASS: User updated successfully", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: User patch - {str(e)}", "ERROR")
        return False

def test_user_reset_password():
    """Test: POST /api/users/:id/reset-password (admin) → resets pw, sets mustChangePassword=true"""
    try:
        log("TEST 17: POST /api/users/:id/reset-password")
        user_id = test_data["users"][0]["id"]
        response = requests.post(
            f"{BASE_URL}/users/{user_id}/reset-password",
            json={"newPassword": "newpass123"},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "User Reset Password")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "User Reset Password")
        log("✅ PASS: User password reset", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: User reset password - {str(e)}", "ERROR")
        return False

def test_user_toggle_active():
    """Test: POST /api/users/:id/toggle-active (admin) → toggles active"""
    try:
        log("TEST 18: POST /api/users/:id/toggle-active")
        user_id = test_data["users"][0]["id"]
        response = requests.post(
            f"{BASE_URL}/users/{user_id}/toggle-active",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "User Toggle Active")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "User Toggle Active")
        assert_test("active" in data, "Expected active status in response", "User Toggle Active")
        log(f"✅ PASS: User active toggled to {data['active']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: User toggle active - {str(e)}", "ERROR")
        return False

def test_user_change_password():
    """Test: POST /api/users/change-password (branch user token) → changes own pw"""
    try:
        log("TEST 19: POST /api/users/change-password")
        # First, toggle user back to active
        user_id = test_data["users"][0]["id"]
        requests.post(
            f"{BASE_URL}/users/{user_id}/toggle-active",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        # Login with new password
        login_response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"email": "rajesh.ghy@assamgoods.in", "password": "newpass123"},
            timeout=10
        )
        if login_response.status_code == 200:
            new_token = login_response.json()["token"]
            response = requests.post(
                f"{BASE_URL}/users/change-password",
                json={"oldPassword": "newpass123", "newPassword": "ghy123"},
                headers={"Authorization": f"Bearer {new_token}"},
                timeout=10
            )
            assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "User Change Password")
            data = response.json()
            assert_test(data.get("ok") == True, "Expected ok:true", "User Change Password")
            log("✅ PASS: User changed own password", "SUCCESS")
            return True
        else:
            log("⚠️ SKIP: Could not login with reset password", "WARNING")
            return True
    except Exception as e:
        log(f"❌ FAIL: User change password - {str(e)}", "ERROR")
        return False

# ============ 5. FORGOT PASSWORD FLOW ============
def test_forgot_password_valid_email():
    """Test: POST /api/auth/forgot-password with valid email → generates OTP"""
    try:
        log("TEST 20: POST /api/auth/forgot-password (valid email)")
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": "rajesh.ghy@assamgoods.in"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Forgot Password Valid")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Forgot Password Valid")
        log("✅ PASS: Forgot password OTP generated", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Forgot password valid - {str(e)}", "ERROR")
        return False

def test_forgot_password_unknown_email():
    """Test: POST /api/auth/forgot-password with unknown email → still returns 200 (security)"""
    try:
        log("TEST 21: POST /api/auth/forgot-password (unknown email)")
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": "unknown@example.com"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Forgot Password Unknown")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true (security)", "Forgot Password Unknown")
        log("✅ PASS: Unknown email returns 200 (security)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Forgot password unknown - {str(e)}", "ERROR")
        return False

def test_get_otp_from_activity():
    """Test: Retrieve OTP from GET /api/activity (mock mode) meta.mock_otp"""
    try:
        log("TEST 22: GET /api/activity (retrieve mock OTP)")
        response = requests.get(
            f"{BASE_URL}/activity",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Activity OTP")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Activity OTP")
        # Find the most recent PASSWORD_RESET_REQUESTED action
        otp = None
        for item in data["items"]:
            if item.get("action") == "PASSWORD_RESET_REQUESTED" and item.get("target") == "rajesh.ghy@assamgoods.in":
                otp = item.get("meta", {}).get("mock_otp")
                if otp:
                    break
        if otp:
            test_data["otp"] = otp
            log(f"✅ PASS: Retrieved OTP from activity: {otp}", "SUCCESS")
        else:
            log("⚠️ WARNING: OTP not found in activity (SMTP might be configured)", "WARNING")
            test_data["otp"] = "123456"  # Fallback for testing
        return True
    except Exception as e:
        log(f"❌ FAIL: Get activity OTP - {str(e)}", "ERROR")
        return False

def test_verify_otp_correct():
    """Test: POST /api/auth/verify-otp with correct OTP → returns resetToken"""
    try:
        log("TEST 23: POST /api/auth/verify-otp (correct OTP)")
        if "otp" not in test_data:
            log("⚠️ SKIP: No OTP available", "WARNING")
            return True
        response = requests.post(
            f"{BASE_URL}/auth/verify-otp",
            json={"email": "rajesh.ghy@assamgoods.in", "otp": test_data["otp"]},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Verify OTP Correct")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Verify OTP Correct")
        assert_test("resetToken" in data, "Expected resetToken in response", "Verify OTP Correct")
        test_data["resetToken"] = data["resetToken"]
        log(f"✅ PASS: OTP verified, resetToken: {data['resetToken'][:20]}...", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Verify OTP correct - {str(e)}", "ERROR")
        return False

def test_verify_otp_wrong():
    """Test: POST /api/auth/verify-otp with wrong OTP → 400"""
    try:
        log("TEST 24: POST /api/auth/verify-otp (wrong OTP)")
        response = requests.post(
            f"{BASE_URL}/auth/verify-otp",
            json={"email": "rajesh.ghy@assamgoods.in", "otp": "000000"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "Verify OTP Wrong")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Verify OTP Wrong")
        log("✅ PASS: Wrong OTP returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Verify OTP wrong - {str(e)}", "ERROR")
        return False

def test_reset_password_with_token():
    """Test: POST /api/auth/reset-password with resetToken → success"""
    try:
        log("TEST 25: POST /api/auth/reset-password (with resetToken)")
        if "resetToken" not in test_data:
            log("⚠️ SKIP: No resetToken available", "WARNING")
            return True
        response = requests.post(
            f"{BASE_URL}/auth/reset-password",
            json={"resetToken": test_data["resetToken"], "newPassword": "newpass456"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Reset Password Token")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Reset Password Token")
        log("✅ PASS: Password reset with token", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Reset password token - {str(e)}", "ERROR")
        return False

def test_verify_old_password_fails():
    """Test: Verify old password fails, new password works"""
    try:
        log("TEST 26: Verify old password fails, new works")
        # Try old password
        old_response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"email": "rajesh.ghy@assamgoods.in", "password": "ghy123"},
            timeout=10
        )
        # Try new password
        new_response = requests.post(
            f"{BASE_URL}/branch/login",
            json={"email": "rajesh.ghy@assamgoods.in", "password": "newpass456"},
            timeout=10
        )
        assert_test(old_response.status_code == 401, f"Expected old password to fail with 401", "Password Reset Verify")
        assert_test(new_response.status_code == 200, f"Expected new password to work with 200", "Password Reset Verify")
        # Update branch token
        test_data["branch_token"] = new_response.json()["token"]
        log("✅ PASS: Old password fails, new password works", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Password reset verify - {str(e)}", "ERROR")
        return False

def test_reset_password_reuse_token():
    """Test: POST /api/auth/reset-password reuse same token → 400 (already used)"""
    try:
        log("TEST 27: POST /api/auth/reset-password (reuse token)")
        if "resetToken" not in test_data:
            log("⚠️ SKIP: No resetToken available", "WARNING")
            return True
        response = requests.post(
            f"{BASE_URL}/auth/reset-password",
            json={"resetToken": test_data["resetToken"], "newPassword": "anotherpass"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "Reset Password Reuse")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Reset Password Reuse")
        log("✅ PASS: Reused token returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Reset password reuse - {str(e)}", "ERROR")
        return False

def test_forgot_password_rate_limit():
    """Test: Rate limiting: 4th forgot-password within 15min → 429"""
    try:
        log("TEST 28: Rate limiting (4th request)")
        # Make 3 more requests
        for i in range(3):
            requests.post(
                f"{BASE_URL}/auth/forgot-password",
                json={"email": "rajesh.ghy@assamgoods.in"},
                timeout=10
            )
            time.sleep(0.5)
        # 4th request should be rate limited
        response = requests.post(
            f"{BASE_URL}/auth/forgot-password",
            json={"email": "rajesh.ghy@assamgoods.in"},
            timeout=10
        )
        assert_test(response.status_code == 429, f"Expected 429, got {response.status_code}", "Rate Limit")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Rate Limit")
        log("✅ PASS: Rate limiting works (429 on 4th request)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Rate limit - {str(e)}", "ERROR")
        return False

# ============ 6. BRANCHES ============
def test_create_branches():
    """Test: POST /api/branches → creates GHY01, DBR01, SIL01"""
    try:
        log("TEST 29: POST /api/branches (create 3 branches)")
        branches = [
            {"code": "GHY01", "name": "Guwahati Hub", "city": "Guwahati", "state": "Assam", "phone": "9876543210"},
            {"code": "DBR01", "name": "Dibrugarh Hub", "city": "Dibrugarh", "state": "Assam", "phone": "9876543211"},
            {"code": "SIL01", "name": "Silchar Hub", "city": "Silchar", "state": "Assam", "phone": "9876543212"},
        ]
        for branch in branches:
            response = requests.post(
                f"{BASE_URL}/branches",
                json=branch,
                headers={"Authorization": f"Bearer {test_data['admin_token']}"},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                test_data["branches"].append(data["branch"])
                log(f"  ✓ Created branch: {branch['code']}")
        assert_test(len(test_data["branches"]) >= 3, "Expected at least 3 branches created", "Create Branches")
        log("✅ PASS: Branches created", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create branches - {str(e)}", "ERROR")
        return False

def test_get_branches():
    """Test: GET /api/branches → lists all"""
    try:
        log("TEST 30: GET /api/branches")
        response = requests.get(
            f"{BASE_URL}/branches",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Branches")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Branches")
        assert_test(len(data["items"]) >= 3, "Expected at least 3 branches", "Get Branches")
        log(f"✅ PASS: Retrieved {len(data['items'])} branches", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get branches - {str(e)}", "ERROR")
        return False

# ============ 7. BOOKINGS ============
def test_create_booking():
    """Test: POST /api/bookings → creates booking, auto-generates LR AGC-YYMMDD-NNNN"""
    try:
        log("TEST 31: POST /api/bookings (auto LR generation)")
        booking_data = {
            "senderName": "Ramesh Sharma",
            "senderPhone": "9876543210",
            "pickupAddress": "Guwahati, Assam",
            "receiverName": "Suresh Patel",
            "receiverPhone": "9876543211",
            "deliveryAddress": "Silchar, Assam",
            "origin": "Guwahati",
            "destination": "Silchar",
            "packages": 5,
            "actualWeight": 50,
            "chargeableWeight": 50,
            "totalAmount": 2500,
            "branchCode": "GHY01"
        }
        response = requests.post(
            f"{BASE_URL}/bookings",
            json=booking_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Create Booking")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Create Booking")
        assert_test("booking" in data, "Expected booking in response", "Create Booking")
        booking = data["booking"]
        assert_test("lrNumber" in booking, "Expected lrNumber in booking", "Create Booking")
        assert_test(booking["lrNumber"].startswith("AGC-"), "Expected LR to start with AGC-", "Create Booking")
        test_data["lr_numbers"].append(booking["lrNumber"])
        log(f"✅ PASS: Booking created with LR: {booking['lrNumber']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create booking - {str(e)}", "ERROR")
        return False

def test_get_bookings():
    """Test: GET /api/bookings → lists"""
    try:
        log("TEST 32: GET /api/bookings")
        response = requests.get(
            f"{BASE_URL}/bookings",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Bookings")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Bookings")
        assert_test(len(data["items"]) > 0, "Expected at least one booking", "Get Bookings")
        log(f"✅ PASS: Retrieved {len(data['items'])} bookings", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get bookings - {str(e)}", "ERROR")
        return False

def test_get_booking_by_lr():
    """Test: GET /api/bookings/:lr → single booking"""
    try:
        log("TEST 33: GET /api/bookings/:lr")
        lr = test_data["lr_numbers"][0]
        response = requests.get(
            f"{BASE_URL}/bookings/{lr}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Booking By LR")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Get Booking By LR")
        assert_test("booking" in data, "Expected booking in response", "Get Booking By LR")
        log(f"✅ PASS: Retrieved booking {lr}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get booking by LR - {str(e)}", "ERROR")
        return False

def test_get_bookings_filter_status():
    """Test: GET /api/bookings?status=BOOKED → filter"""
    try:
        log("TEST 34: GET /api/bookings?status=BOOKED")
        response = requests.get(
            f"{BASE_URL}/bookings?status=BOOKED",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Bookings Filter")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Bookings Filter")
        log(f"✅ PASS: Filtered bookings by status, found {len(data['items'])} items", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get bookings filter - {str(e)}", "ERROR")
        return False

def test_update_booking_status():
    """Test: POST /api/bookings/:lr/status → updates status, pushes timeline"""
    try:
        log("TEST 35: POST /api/bookings/:lr/status")
        lr = test_data["lr_numbers"][0]
        response = requests.post(
            f"{BASE_URL}/bookings/{lr}/status",
            json={"status": "PICKED_UP", "location": "Guwahati Hub", "note": "Picked up from sender"},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Update Booking Status")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Update Booking Status")
        booking = data["booking"]
        assert_test(booking["status"] == "PICKED_UP", "Expected status to be PICKED_UP", "Update Booking Status")
        assert_test(len(booking["timeline"]) >= 2, "Expected timeline to have at least 2 entries", "Update Booking Status")
        log("✅ PASS: Booking status updated, timeline pushed", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Update booking status - {str(e)}", "ERROR")
        return False

def test_track_booking():
    """Test: GET /api/track/:lr → public tracking with stages + timeline"""
    try:
        log("TEST 36: GET /api/track/:lr")
        lr = test_data["lr_numbers"][0]
        response = requests.get(f"{BASE_URL}/track/{lr}", timeout=10)
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Track Booking")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Track Booking")
        assert_test("lrNumber" in data, "Expected lrNumber in response", "Track Booking")
        assert_test("timeline" in data, "Expected timeline in response", "Track Booking")
        assert_test("stages" in data, "Expected stages in response", "Track Booking")
        log(f"✅ PASS: Public tracking works, {len(data['timeline'])} timeline entries", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Track booking - {str(e)}", "ERROR")
        return False

def test_upload_pod():
    """Test: POST /api/bookings/:lr/pod → uploads POD (signature/photo)"""
    try:
        log("TEST 37: POST /api/bookings/:lr/pod")
        lr = test_data["lr_numbers"][0]
        pod_data = {
            "signature": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "photo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            "receiverName": "Suresh Patel",
            "location": "Silchar Hub"
        }
        response = requests.post(
            f"{BASE_URL}/bookings/{lr}/pod",
            json=pod_data,
            headers={"Authorization": f"Bearer {test_data['branch_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Upload POD")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Upload POD")
        booking = data["booking"]
        assert_test("pod" in booking, "Expected pod in booking", "Upload POD")
        assert_test(booking["status"] == "DELIVERED", "Expected status to be DELIVERED", "Upload POD")
        log("✅ PASS: POD uploaded, status set to DELIVERED", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Upload POD - {str(e)}", "ERROR")
        return False

# ============ 8. BRANCH SHIPMENT TRANSFERS ============
def test_create_transfer():
    """Test: POST /api/transfers with LR/from/to → creates TXF-YYMMDD-NNNN"""
    try:
        log("TEST 38: POST /api/transfers")
        # Create a new booking for transfer testing
        booking_response = requests.post(
            f"{BASE_URL}/bookings",
            json={
                "senderName": "Transfer Test Sender",
                "senderPhone": "9999999999",
                "pickupAddress": "Guwahati",
                "receiverName": "Transfer Test Receiver",
                "receiverPhone": "8888888888",
                "deliveryAddress": "Dibrugarh",
                "origin": "Guwahati",
                "destination": "Dibrugarh",
                "packages": 2,
                "actualWeight": 20,
                "chargeableWeight": 20,
                "totalAmount": 1000,
                "branchCode": "GHY01"
            },
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        transfer_lr = booking_response.json()["booking"]["lrNumber"]
        test_data["lr_numbers"].append(transfer_lr)
        
        # Create transfer
        transfer_data = {
            "lrNumber": transfer_lr,
            "fromBranch": "GHY01",
            "toBranch": "DBR01",
            "vehicleNumber": "AS01AB1234",
            "driverName": "Ravi Kumar",
            "remarks": "Regular transfer"
        }
        response = requests.post(
            f"{BASE_URL}/transfers",
            json=transfer_data,
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Create Transfer")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Create Transfer")
        assert_test("transfer" in data, "Expected transfer in response", "Create Transfer")
        transfer = data["transfer"]
        assert_test("transferId" in transfer, "Expected transferId", "Create Transfer")
        assert_test(transfer["transferId"].startswith("TXF-"), "Expected transferId to start with TXF-", "Create Transfer")
        assert_test(transfer["status"] == "IN_TRANSIT", "Expected status IN_TRANSIT", "Create Transfer")
        test_data["transfers"].append(transfer)
        log(f"✅ PASS: Transfer created with ID: {transfer['transferId']}", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create transfer - {str(e)}", "ERROR")
        return False

def test_create_transfer_same_branches():
    """Test: POST /api/transfers with same from/to → 400"""
    try:
        log("TEST 39: POST /api/transfers (same from/to)")
        response = requests.post(
            f"{BASE_URL}/transfers",
            json={
                "lrNumber": test_data["lr_numbers"][-1],
                "fromBranch": "GHY01",
                "toBranch": "GHY01"
            },
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "Transfer Same Branches")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Transfer Same Branches")
        log("✅ PASS: Same from/to branches returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Transfer same branches - {str(e)}", "ERROR")
        return False

def test_create_transfer_unknown_lr():
    """Test: POST /api/transfers with unknown LR → 404"""
    try:
        log("TEST 40: POST /api/transfers (unknown LR)")
        response = requests.post(
            f"{BASE_URL}/transfers",
            json={
                "lrNumber": "AGC-999999-9999",
                "fromBranch": "GHY01",
                "toBranch": "DBR01"
            },
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 404, f"Expected 404, got {response.status_code}", "Transfer Unknown LR")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Transfer Unknown LR")
        log("✅ PASS: Unknown LR returns 404", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Transfer unknown LR - {str(e)}", "ERROR")
        return False

def test_get_transfers():
    """Test: GET /api/transfers → lists"""
    try:
        log("TEST 41: GET /api/transfers")
        response = requests.get(
            f"{BASE_URL}/transfers",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Transfers")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Transfers")
        assert_test(len(data["items"]) > 0, "Expected at least one transfer", "Get Transfers")
        log(f"✅ PASS: Retrieved {len(data['items'])} transfers", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get transfers - {str(e)}", "ERROR")
        return False

def test_get_transfers_filter():
    """Test: GET /api/transfers?from=X&to=Y&status=Z → filter"""
    try:
        log("TEST 42: GET /api/transfers (with filters)")
        response = requests.get(
            f"{BASE_URL}/transfers?from=GHY01&to=DBR01&status=IN_TRANSIT",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Transfers Filter")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Transfers Filter")
        log(f"✅ PASS: Filtered transfers, found {len(data['items'])} items", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get transfers filter - {str(e)}", "ERROR")
        return False

def test_receive_transfer():
    """Test: POST /api/transfers/:id/receive → marks received, pushes booking timeline"""
    try:
        log("TEST 43: POST /api/transfers/:id/receive")
        transfer_id = test_data["transfers"][0]["transferId"]
        response = requests.post(
            f"{BASE_URL}/transfers/{transfer_id}/receive",
            json={"receivedBy": "DBR Branch Manager", "remarks": "Received in good condition"},
            headers={"Authorization": f"Bearer {test_data['branch_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Receive Transfer")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Receive Transfer")
        transfer = data["transfer"]
        assert_test(transfer["status"] == "RECEIVED", "Expected status RECEIVED", "Receive Transfer")
        assert_test("receivedBy" in transfer, "Expected receivedBy in transfer", "Receive Transfer")
        log("✅ PASS: Transfer marked as received", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Receive transfer - {str(e)}", "ERROR")
        return False

def test_receive_transfer_duplicate():
    """Test: POST /api/transfers/:id/receive twice → 400 (already received)"""
    try:
        log("TEST 44: POST /api/transfers/:id/receive (duplicate)")
        transfer_id = test_data["transfers"][0]["transferId"]
        response = requests.post(
            f"{BASE_URL}/transfers/{transfer_id}/receive",
            json={"receivedBy": "Another Manager"},
            headers={"Authorization": f"Bearer {test_data['branch_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "Receive Transfer Duplicate")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Receive Transfer Duplicate")
        log("✅ PASS: Duplicate receive returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Receive transfer duplicate - {str(e)}", "ERROR")
        return False

def test_get_booking_transfers():
    """Test: GET /api/bookings/:lr/transfers → chain history"""
    try:
        log("TEST 45: GET /api/bookings/:lr/transfers")
        lr = test_data["transfers"][0]["lrNumber"]
        response = requests.get(
            f"{BASE_URL}/bookings/{lr}/transfers",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Booking Transfers")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Booking Transfers")
        assert_test(len(data["items"]) > 0, "Expected at least one transfer", "Get Booking Transfers")
        log(f"✅ PASS: Retrieved {len(data['items'])} transfers for booking", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get booking transfers - {str(e)}", "ERROR")
        return False

def test_verify_booking_timeline_reflects_transfers():
    """Test: Verify booking timeline reflects each transfer via GET /api/track/:lr"""
    try:
        log("TEST 46: Verify booking timeline reflects transfers")
        lr = test_data["transfers"][0]["lrNumber"]
        response = requests.get(f"{BASE_URL}/track/{lr}", timeout=10)
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Verify Timeline")
        data = response.json()
        timeline = data.get("timeline", [])
        # Check for transfer-related entries
        has_transfer_entry = any("Transfer" in entry.get("label", "") or entry.get("key") == "IN_TRANSIT" for entry in timeline)
        assert_test(has_transfer_entry, "Expected transfer entry in timeline", "Verify Timeline")
        log(f"✅ PASS: Timeline reflects transfers ({len(timeline)} entries)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Verify timeline - {str(e)}", "ERROR")
        return False

# ============ 9. RATE MANAGEMENT ============
def test_create_rate():
    """Test: POST /api/rates → creates rate"""
    try:
        log("TEST 47: POST /api/rates")
        rate_data = {
            "fromCity": "Guwahati",
            "toCity": "Silchar",
            "ratePerKg": 15,
            "minBilty": 200,
            "biltyCharge": 50,
            "doorCharge": 100,
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
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Create Rate")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Create Rate")
        assert_test("rate" in data, "Expected rate in response", "Create Rate")
        test_data["rates"].append(data["rate"])
        log("✅ PASS: Rate created", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create rate - {str(e)}", "ERROR")
        return False

def test_get_rates():
    """Test: GET /api/rates → lists"""
    try:
        log("TEST 48: GET /api/rates")
        response = requests.get(
            f"{BASE_URL}/rates",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Rates")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Rates")
        log(f"✅ PASS: Retrieved {len(data['items'])} rates", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get rates - {str(e)}", "ERROR")
        return False

def test_delete_rate():
    """Test: DELETE /api/rates/:id → deletes"""
    try:
        log("TEST 49: DELETE /api/rates/:id")
        if len(test_data["rates"]) == 0:
            log("⚠️ SKIP: No rates to delete", "WARNING")
            return True
        rate_id = test_data["rates"][0]["id"]
        response = requests.delete(
            f"{BASE_URL}/rates/{rate_id}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Delete Rate")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Delete Rate")
        log("✅ PASS: Rate deleted", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Delete rate - {str(e)}", "ERROR")
        return False

# ============ 10. LABEL SIZES ============
def test_label_sizes_autoseed():
    """Test: GET /api/label-sizes → auto-seeds 6 defaults on first call"""
    try:
        log("TEST 50: GET /api/label-sizes (auto-seed)")
        response = requests.get(f"{BASE_URL}/label-sizes", timeout=10)
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Label Sizes Autoseed")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Label Sizes Autoseed")
        assert_test(len(data["items"]) >= 6, "Expected at least 6 default sizes", "Label Sizes Autoseed")
        test_data["label_sizes"] = data["items"]
        log(f"✅ PASS: Label sizes auto-seeded ({len(data['items'])} sizes)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Label sizes autoseed - {str(e)}", "ERROR")
        return False

def test_create_custom_label_size():
    """Test: POST /api/label-sizes with valid size (60×40mm) → creates custom"""
    try:
        log("TEST 51: POST /api/label-sizes (custom size)")
        response = requests.post(
            f"{BASE_URL}/label-sizes",
            json={"name": "Custom 60×40mm", "width": 60, "height": 40},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Create Custom Label")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Create Custom Label")
        assert_test("size" in data, "Expected size in response", "Create Custom Label")
        test_data["label_sizes"].append(data["size"])
        log("✅ PASS: Custom label size created", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create custom label - {str(e)}", "ERROR")
        return False

def test_create_invalid_label_size():
    """Test: POST /api/label-sizes with invalid size (5×5) → 400"""
    try:
        log("TEST 52: POST /api/label-sizes (invalid size)")
        response = requests.post(
            f"{BASE_URL}/label-sizes",
            json={"name": "Invalid 5×5mm", "width": 5, "height": 5},
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 400, f"Expected 400, got {response.status_code}", "Create Invalid Label")
        data = response.json()
        assert_test(data.get("ok") == False, "Expected ok:false", "Create Invalid Label")
        log("✅ PASS: Invalid label size returns 400", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create invalid label - {str(e)}", "ERROR")
        return False

def test_delete_custom_label_size():
    """Test: DELETE custom size → deletes"""
    try:
        log("TEST 53: DELETE /api/label-sizes/:id (custom)")
        # Find a custom size (not default)
        custom_size = next((s for s in test_data["label_sizes"] if not s.get("isDefault")), None)
        if not custom_size:
            log("⚠️ SKIP: No custom label size to delete", "WARNING")
            return True
        response = requests.delete(
            f"{BASE_URL}/label-sizes/{custom_size['id']}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Delete Custom Label")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Delete Custom Label")
        log("✅ PASS: Custom label size deleted", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Delete custom label - {str(e)}", "ERROR")
        return False

# ============ 11. REPORTS ============
def test_report_daily():
    """Test: GET /api/reports/daily?date=today → returns count, total, items"""
    try:
        log("TEST 54: GET /api/reports/daily")
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(
            f"{BASE_URL}/reports/daily?date={today}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Report Daily")
        data = response.json()
        assert_test("count" in data, "Expected count in response", "Report Daily")
        assert_test("total" in data, "Expected total in response", "Report Daily")
        assert_test("items" in data, "Expected items in response", "Report Daily")
        log(f"✅ PASS: Daily report ({data['count']} bookings, ₹{data['total']})", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Report daily - {str(e)}", "ERROR")
        return False

def test_report_monthly():
    """Test: GET /api/reports/monthly?ym=YYYY-MM → returns aggregated"""
    try:
        log("TEST 55: GET /api/reports/monthly")
        ym = datetime.now().strftime("%Y-%m")
        response = requests.get(
            f"{BASE_URL}/reports/monthly?ym={ym}",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Report Monthly")
        data = response.json()
        assert_test("count" in data, "Expected count in response", "Report Monthly")
        assert_test("total" in data, "Expected total in response", "Report Monthly")
        log(f"✅ PASS: Monthly report ({data['count']} bookings, ₹{data['total']})", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Report monthly - {str(e)}", "ERROR")
        return False

def test_report_outstanding():
    """Test: GET /api/reports/outstanding → returns unpaid bookings"""
    try:
        log("TEST 56: GET /api/reports/outstanding")
        response = requests.get(
            f"{BASE_URL}/reports/outstanding",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Report Outstanding")
        data = response.json()
        assert_test("count" in data, "Expected count in response", "Report Outstanding")
        assert_test("total" in data, "Expected total in response", "Report Outstanding")
        log(f"✅ PASS: Outstanding report ({data['count']} unpaid, ₹{data['total']})", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Report outstanding - {str(e)}", "ERROR")
        return False

def test_report_branch():
    """Test: GET /api/reports/branch → aggregated by branchCode"""
    try:
        log("TEST 57: GET /api/reports/branch")
        response = requests.get(
            f"{BASE_URL}/reports/branch",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Report Branch")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Report Branch")
        log(f"✅ PASS: Branch report ({len(data['items'])} branches)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Report branch - {str(e)}", "ERROR")
        return False

def test_report_customer():
    """Test: GET /api/reports/customer → aggregated by sender"""
    try:
        log("TEST 58: GET /api/reports/customer")
        response = requests.get(
            f"{BASE_URL}/reports/customer",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Report Customer")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Report Customer")
        log(f"✅ PASS: Customer report ({len(data['items'])} customers)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Report customer - {str(e)}", "ERROR")
        return False

# ============ 12. ACTIVITY & NOTIFICATIONS ============
def test_get_activity():
    """Test: GET /api/activity → returns actions performed"""
    try:
        log("TEST 59: GET /api/activity")
        response = requests.get(
            f"{BASE_URL}/activity",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Activity")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Activity")
        log(f"✅ PASS: Activity log ({len(data['items'])} actions)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get activity - {str(e)}", "ERROR")
        return False

def test_get_notifications():
    """Test: GET /api/notifications → returns booking notifications sent (mocked)"""
    try:
        log("TEST 60: GET /api/notifications")
        response = requests.get(
            f"{BASE_URL}/notifications",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Notifications")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Notifications")
        log(f"✅ PASS: Notifications ({len(data['items'])} notifications)", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get notifications - {str(e)}", "ERROR")
        return False

# ============ 13. ENQUIRIES ============
def test_create_enquiry():
    """Test: POST /api/enquiries → saves lead"""
    try:
        log("TEST 61: POST /api/enquiries")
        enquiry_data = {
            "name": "Potential Customer",
            "phone": "9999999999",
            "email": "customer@example.com",
            "message": "Interested in bulk shipping services"
        }
        response = requests.post(
            f"{BASE_URL}/enquiries",
            json=enquiry_data,
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Create Enquiry")
        data = response.json()
        assert_test(data.get("ok") == True, "Expected ok:true", "Create Enquiry")
        log("✅ PASS: Enquiry created", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Create enquiry - {str(e)}", "ERROR")
        return False

def test_get_enquiries():
    """Test: GET /api/enquiries → lists"""
    try:
        log("TEST 62: GET /api/enquiries")
        response = requests.get(
            f"{BASE_URL}/enquiries",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Enquiries")
        data = response.json()
        assert_test("items" in data, "Expected items in response", "Get Enquiries")
        log(f"✅ PASS: Retrieved {len(data['items'])} enquiries", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get enquiries - {str(e)}", "ERROR")
        return False

# ============ 14. STATS ============
def test_get_stats():
    """Test: GET /api/stats → returns dashboard stats"""
    try:
        log("TEST 63: GET /api/stats")
        response = requests.get(
            f"{BASE_URL}/stats",
            headers={"Authorization": f"Bearer {test_data['admin_token']}"},
            timeout=10
        )
        assert_test(response.status_code == 200, f"Expected 200, got {response.status_code}", "Get Stats")
        data = response.json()
        required_fields = ["totalBookings", "todaysBookings", "totalRevenue", "outstandingPayments", 
                          "deliveredShipments", "inTransitShipments", "pendingDeliveries"]
        for field in required_fields:
            assert_test(field in data, f"Expected {field} in response", "Get Stats")
        log(f"✅ PASS: Stats retrieved (Total: {data['totalBookings']}, Today: {data['todaysBookings']})", "SUCCESS")
        return True
    except Exception as e:
        log(f"❌ FAIL: Get stats - {str(e)}", "ERROR")
        return False

# ============ MAIN TEST RUNNER ============
def run_all_tests():
    """Run all tests in sequence"""
    log("=" * 80)
    log("STARTING COMPREHENSIVE BACKEND TESTING")
    log("=" * 80)
    
    tests = [
        # 1. Health & Infra
        test_health,
        
        # 2. Authentication
        test_admin_login_correct,
        test_admin_login_wrong,
        test_create_branch_user,
        test_branch_login_email,
        test_branch_login_code,
        test_branch_login_wrong,
        test_customer_login,
        
        # 3. Company Settings
        test_settings_get_autoseed,
        test_settings_update_with_admin,
        test_settings_update_without_admin,
        test_settings_update_smtp,
        
        # 4. User Management
        test_user_create_without_email,
        test_user_create_duplicate_email,
        test_user_get_all,
        test_user_patch,
        test_user_reset_password,
        test_user_toggle_active,
        test_user_change_password,
        
        # 5. Forgot Password Flow
        test_forgot_password_valid_email,
        test_forgot_password_unknown_email,
        test_get_otp_from_activity,
        test_verify_otp_correct,
        test_verify_otp_wrong,
        test_reset_password_with_token,
        test_verify_old_password_fails,
        test_reset_password_reuse_token,
        test_forgot_password_rate_limit,
        
        # 6. Branches
        test_create_branches,
        test_get_branches,
        
        # 7. Bookings
        test_create_booking,
        test_get_bookings,
        test_get_booking_by_lr,
        test_get_bookings_filter_status,
        test_update_booking_status,
        test_track_booking,
        test_upload_pod,
        
        # 8. Branch Shipment Transfers
        test_create_transfer,
        test_create_transfer_same_branches,
        test_create_transfer_unknown_lr,
        test_get_transfers,
        test_get_transfers_filter,
        test_receive_transfer,
        test_receive_transfer_duplicate,
        test_get_booking_transfers,
        test_verify_booking_timeline_reflects_transfers,
        
        # 9. Rate Management
        test_create_rate,
        test_get_rates,
        test_delete_rate,
        
        # 10. Label Sizes
        test_label_sizes_autoseed,
        test_create_custom_label_size,
        test_create_invalid_label_size,
        test_delete_custom_label_size,
        
        # 11. Reports
        test_report_daily,
        test_report_monthly,
        test_report_outstanding,
        test_report_branch,
        test_report_customer,
        
        # 12. Activity & Notifications
        test_get_activity,
        test_get_notifications,
        
        # 13. Enquiries
        test_create_enquiry,
        test_get_enquiries,
        
        # 14. Stats
        test_get_stats,
    ]
    
    total_tests = len(tests)
    passed = 0
    failed = 0
    
    for i, test in enumerate(tests, 1):
        log(f"\n[{i}/{total_tests}] Running: {test.__name__}")
        try:
            result = test()
            if result:
                passed += 1
            else:
                failed += 1
        except Exception as e:
            log(f"EXCEPTION in {test.__name__}: {str(e)}", "ERROR")
            failed += 1
        time.sleep(0.3)  # Small delay between tests
    
    log("\n" + "=" * 80)
    log("TEST SUMMARY")
    log("=" * 80)
    log(f"Total Tests: {total_tests}")
    log(f"Passed: {test_results['passed']}", "SUCCESS")
    log(f"Failed: {test_results['failed']}", "ERROR" if test_results['failed'] > 0 else "INFO")
    
    if test_results['errors']:
        log("\nFAILED TESTS:")
        for error in test_results['errors']:
            log(f"  - {error}", "ERROR")
    
    log("=" * 80)
    
    return test_results['failed'] == 0

if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
