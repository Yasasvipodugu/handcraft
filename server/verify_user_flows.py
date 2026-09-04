import os
import sys
import unittest
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import app, get_db_connection

class TestCompleteUserFlows(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        self.client.testing = True

    def test_01_artisan_complete_flow(self):
        print("\n--- TEST 1: ARTISAN COMPLETE FLOW ---")
        # 1. Sign Up as Artisan
        email = f"artisan_flow_{os.getpid()}@test.com"
        reg_res = self.client.post('/api/auth/register', json={
            "name": "Suresh Achari",
            "email": email,
            "phone": "+91 94401 23456",
            "password": "artisan_pass_123",
            "confirmPassword": "artisan_pass_123",
            "role": "artisan",
            "location": "Kondapalli, Andhra Pradesh",
            "craftType": "Kondapalli Wooden Dolls"
        })
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.get_json()
        self.assertTrue(reg_data["success"])
        token = reg_data["token"]
        print("[PASS] 1. Artisan Sign Up successful in database")

        # 2. Login
        login_res = self.client.post('/api/auth/login', json={
            "email": email,
            "password": "artisan_pass_123"
        })
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        self.assertEqual(login_data["user"]["role"], "artisan")
        self.assertEqual(login_data["user"]["name"], "Suresh Achari")
        print("[PASS] 2. Artisan Login & Role detection -> Artisan Dashboard")

        # 3. Add Product as Logged-In Artisan
        prod_res = self.client.post('/api/products', json={
            "name": "Handmade Wooden Ambari Elephant",
            "category": "Woodcraft",
            "description": "Sacred temple elephant with ceremonial canopy.",
            "material": "Poniki wood",
            "price": 1250.0,
            "quantity": 15,
            "craftStory": "Hand-carved according to shilpa shastra principles."
        }, headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(prod_res.status_code, 201)
        prod = prod_res.get_json()["product"]
        self.assertEqual(prod["product_name"], "Handmade Wooden Ambari Elephant")
        print("[PASS] 3. Product added and saved to database under artisan")

        # 4. Verify product appears in artisan's products
        my_prods_res = self.client.get(f'/api/products?artisan_id={login_data["user"]["id"]}')
        my_prods = my_prods_res.get_json()["products"]
        self.assertTrue(any(p["id"] == prod["id"] for p in my_prods))
        print("[PASS] 4. Product verified in Artisan's My Products")

    def test_02_customer_complete_flow(self):
        print("\n--- TEST 2: CUSTOMER COMPLETE FLOW ---")
        # 1. Sign Up as Customer
        c_email = f"customer_flow_{os.getpid()}@test.com"
        reg_res = self.client.post('/api/auth/register', json={
            "name": "Meera Nambiar",
            "email": c_email,
            "phone": "+91 98400 55667",
            "password": "customer_pass_123",
            "confirmPassword": "customer_pass_123",
            "role": "customer",
            "location": "Kochi, Kerala"
        })
        self.assertEqual(reg_res.status_code, 201)
        c_token = reg_res.get_json()["token"]
        print("[PASS] 1. Customer Sign Up successful in database")

        # 2. Login
        login_res = self.client.post('/api/auth/login', json={
            "email": c_email,
            "password": "customer_pass_123"
        })
        self.assertEqual(login_res.status_code, 200)
        c_user = login_res.get_json()["user"]
        self.assertEqual(c_user["role"], "customer")
        self.assertEqual(c_user["name"], "Meera Nambiar")
        print("[PASS] 2. Customer Login & Role detection -> Customer Dashboard (Welcome, Meera Nambiar)")

        # 3. Browse Products
        browse_res = self.client.get('/api/products')
        self.assertEqual(browse_res.status_code, 200)
        prods = browse_res.get_json()["products"]
        self.assertGreater(len(prods), 0)
        sample_prod = prods[0]
        print(f"[PASS] 3. Browse products dynamically from database ({len(prods)} products found)")

        # 4. View Product Details & Artisan Details
        prod_detail = self.client.get(f'/api/products/{sample_prod["id"]}')
        self.assertEqual(prod_detail.status_code, 200)
        detail_data = prod_detail.get_json()["product"]
        self.assertEqual(detail_data["id"], sample_prod["id"])
        self.assertTrue("artisan_name" in detail_data)
        print(f"[PASS] 4. Product details & artisan info loaded for: {detail_data['product_name']}")

    def test_03_multiple_artisan_isolation(self):
        print("\n--- TEST 3: MULTIPLE ARTISANS ISOLATION ---")
        # Artisan A
        a_email = f"artisan_a_{os.getpid()}@test.com"
        a_token = self.client.post('/api/auth/register', json={
            "name": "Artisan A",
            "email": a_email,
            "password": "password123",
            "role": "artisan",
            "location": "Jaipur",
            "craftType": "Blue Pottery"
        }).get_json()["token"]

        # Artisan B
        b_email = f"artisan_b_{os.getpid()}@test.com"
        b_token = self.client.post('/api/auth/register', json={
            "name": "Artisan B",
            "email": b_email,
            "password": "password123",
            "role": "artisan",
            "location": "Varanasi",
            "craftType": "Banarasi Weaving"
        }).get_json()["token"]

        # Artisan A adds a product
        a_prod_res = self.client.post('/api/products', json={
            "name": "Artisan A Blue Pottery Vase",
            "price": 999.0
        }, headers={"Authorization": f"Bearer {a_token}"})
        a_prod_id = a_prod_res.get_json()["product"]["id"]

        # Artisan B tries to edit Artisan A's product -> MUST FAIL 403
        b_edit_res = self.client.put(f'/api/products/{a_prod_id}', json={
            "name": "Hacked Title",
            "price": 10.0
        }, headers={"Authorization": f"Bearer {b_token}"})
        self.assertEqual(b_edit_res.status_code, 403)
        print("[PASS] Artisan B cannot edit Artisan A's product (403 Forbidden)")

        # Artisan B tries to delete Artisan A's product -> MUST FAIL 403
        b_del_res = self.client.delete(f'/api/products/{a_prod_id}', headers={"Authorization": f"Bearer {b_token}"})
        self.assertEqual(b_del_res.status_code, 403)
        print("[PASS] Artisan B cannot delete Artisan A's product (403 Forbidden)")

        # Artisan A CAN edit their own product
        a_edit_res = self.client.put(f'/api/products/{a_prod_id}', json={
            "name": "Artisan A Blue Pottery Vase (Updated)",
            "price": 1199.0
        }, headers={"Authorization": f"Bearer {a_token}"})
        self.assertEqual(a_edit_res.status_code, 200)
        print("[PASS] Artisan A can successfully edit their own product")

        # Artisan A CAN delete their own product
        a_del_res = self.client.delete(f'/api/products/{a_prod_id}', headers={"Authorization": f"Bearer {a_token}"})
        self.assertEqual(a_del_res.status_code, 200)
        print("[PASS] Artisan A can successfully delete their own product")

    def test_04_auth_security_and_logout(self):
        print("\n--- TEST 4: AUTH SECURITY & LOGOUT ---")
        # Unauthenticated product creation must fail 401
        unauth_add = self.client.post('/api/products', json={"name": "Ghost item", "price": 100.0})
        self.assertEqual(unauth_add.status_code, 401)
        print("[PASS] Unauthenticated API access rejected (401 Unauthorized)")

        # Unauthenticated me endpoint must fail 401
        unauth_me = self.client.get('/api/auth/me')
        self.assertEqual(unauth_me.status_code, 401)
        print("[PASS] Unauthenticated session check rejected (401 Unauthorized)")

if __name__ == '__main__':
    unittest.main()
