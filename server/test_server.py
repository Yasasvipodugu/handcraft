import os
import sys
import unittest
import json

# Add server directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, init_db, get_db_connection

class TestKalaConnectBackend(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_01_health(self):
        res = self.app.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('SQLite', data['database'])
        print("[PASS] Health endpoint OK")

    def test_02_artisan_registration_and_login(self):
        # Register new artisan
        unique_email = f"artisan_test_{os.getpid()}@example.com"
        reg_payload = {
            "name": "Ramesh Kumar",
            "email": unique_email,
            "phone": "+91 91234 56789",
            "password": "securepassword123",
            "confirmPassword": "securepassword123",
            "role": "artisan",
            "location": "Warangal, Telangana",
            "craftType": "Brass Metal Crafts & Dhokra"
        }
        reg_res = self.app.post('/api/auth/register', json=reg_payload)
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.get_json()
        self.assertTrue(reg_data['success'])
        self.assertEqual(reg_data['user']['role'], 'artisan')
        self.assertEqual(reg_data['user']['craft_type'], 'Brass Metal Crafts & Dhokra')
        artisan_token = reg_data['token']
        print("[PASS] Artisan Registration OK")

        # Login with wrong password
        login_fail = self.app.post('/api/auth/login', json={"email": unique_email, "password": "wrong"})
        self.assertEqual(login_fail.status_code, 401)
        print("[PASS] Wrong Password Rejection OK")

        # Login with correct password
        login_res = self.app.post('/api/auth/login', json={"email": unique_email, "password": "securepassword123"})
        self.assertEqual(login_res.status_code, 200)
        login_data = login_res.get_json()
        self.assertTrue(login_data['success'])
        self.assertEqual(login_data['user']['name'], 'Ramesh Kumar')
        print("[PASS] Artisan Login OK")

        # Add Product as this Artisan
        prod_payload = {
            "name": "Hand-Cast Dhokra Brass Peacock",
            "category": "Metalcraft",
            "description": "Lost-wax cast brass figurine crafted by traditional tribal artisans.",
            "material": "Bell Metal / Brass",
            "price": 1450.0,
            "quantity": 10,
            "craftStory": "Ancient non-ferrous casting practiced for centuries."
        }
        add_res = self.app.post('/api/products', json=prod_payload, headers={"Authorization": f"Bearer {artisan_token}"})
        self.assertEqual(add_res.status_code, 201)
        prod_data = add_res.get_json()
        self.assertTrue(prod_data['success'])
        prod_id = prod_data['product']['id']
        print("[PASS] Product Creation OK")

        # Register another artisan
        other_email = f"other_artisan_{os.getpid()}@example.com"
        other_reg = self.app.post('/api/auth/register', json={
            "name": "Sunita Devi",
            "email": other_email,
            "password": "password123",
            "role": "artisan",
            "location": "Jaipur, Rajasthan",
            "craftType": "Blue Pottery"
        })
        other_token = other_reg.get_json()['token']

        # Other artisan tries to delete first artisan's product (should fail 403)
        del_fail = self.app.delete(f'/api/products/{prod_id}', headers={"Authorization": f"Bearer {other_token}"})
        self.assertEqual(del_fail.status_code, 403)
        print("[PASS] Unauthorized Product Edit/Delete Prevention (403 Forbidden) OK")

        # Original artisan deletes product (should succeed)
        del_ok = self.app.delete(f'/api/products/{prod_id}', headers={"Authorization": f"Bearer {artisan_token}"})
        self.assertEqual(del_ok.status_code, 200)
        print("[PASS] Authorized Product Deletion OK")

if __name__ == '__main__':
    unittest.main()
