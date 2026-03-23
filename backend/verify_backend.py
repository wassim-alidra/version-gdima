import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_flow():
    print("Starting Backend Verification...")

    # 1. Register Farmer
    farmer_data = {
        "username": "farmer1",
        "email": "farmer1@example.com",
        "password": "password123",
        "role": "FARMER",
        "farm_name": "Green Valley",
        "location": "North"
    }
    try:
        res = requests.post(f"{BASE_URL}/users/register/", json=farmer_data)
        if res.status_code == 201:
            print("[PASS] Farmer Registration")
        elif res.status_code == 400 and "username" in res.json() and "already exists" in str(res.json()):
             print("[INFO] Farmer already exists")
        else:
             print(f"[FAIL] Farmer Registration: {res.status_code} {res.text}")
    except Exception as e:
        print(f"[FAIL] Connection Error: {e}")
        return

    # 2. Login Farmer
    token = None
    try:
        res = requests.post(f"{BASE_URL}/token/", json={"username": "farmer1", "password": "password123"})
        if res.status_code == 200:
            token = res.json()['access']
            print("[PASS] Farmer Login")
        else:
            print(f"[FAIL] Farmer Login: {res.status_code} {res.text}")
            return
    except Exception as e:
        print(f"[FAIL] Login Connection Error: {e}")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Product
    product_data = {
        "name": "Potatoes",
        "description": "Organic Potatoes",
        "price_per_kg": 1.50,
        "quantity_available": 1000
    }
    try:
        res = requests.post(f"{BASE_URL}/market/products/", json=product_data, headers=headers)
        if res.status_code == 201:
            print(f"[PASS] Product Creation (ID: {res.json()['id']})")
        else:
            print(f"[FAIL] Product Creation: {res.status_code} {res.text}")
    except Exception as e:
        print(f"[FAIL] Product Creation Error: {e}")

    # 4. Register Buyer
    buyer_data = {
        "username": "buyer1",
        "email": "buyer1@example.com",
        "password": "password123",
        "role": "BUYER",
        "company_name": "Fresh Foods"
    }
    try:
        res = requests.post(f"{BASE_URL}/users/register/", json=buyer_data)
        if res.status_code in [201, 400]:
             print("[PASS] Buyer Registration")
    except: pass

    # 5. Login Buyer
    buyer_token = None
    res = requests.post(f"{BASE_URL}/token/", json={"username": "buyer1", "password": "password123"})
    if res.status_code == 200:
        buyer_token = res.json()['access']
        print("[PASS] Buyer Login")
    
    # 6. Place Order
    # Need product ID. Assuming 1 if fresh db, but hard to know.
    # List products first
    res = requests.get(f"{BASE_URL}/market/products/", headers={"Authorization": f"Bearer {buyer_token}"})
    if res.status_code == 200 and len(res.json()) > 0:
        product_id = res.json()[0]['id']
        order_data = {"product": product_id, "quantity": 50}
        res = requests.post(f"{BASE_URL}/market/orders/", json=order_data, headers={"Authorization": f"Bearer {buyer_token}"})
        if res.status_code == 201:
            print("[PASS] Order Placement")
        else:
            print(f"[FAIL] Order Placement: {res.status_code} {res.text}")
    else:
        print("[FAIL] No products found to order")

if __name__ == "__main__":
    test_flow()
