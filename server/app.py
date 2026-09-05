import os
import sqlite3
import json
import uuid
from datetime import datetime, timezone

def get_utc_now_iso():
    return datetime.now(timezone.utc).isoformat()
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Base directory for database
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(os.path.dirname(BASE_DIR), "database")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "kalaconnect.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('artisan', 'customer', 'b2b_buyer', 'admin')),
        location TEXT,
        craft_type TEXT,
        avatar TEXT,
        created_at TEXT NOT NULL
    );
    """)

    # 2. Products Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        artisan_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        material TEXT,
        price REAL NOT NULL,
        quantity INTEGER DEFAULT 1,
        image TEXT,
        craft_story TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 3. Orders Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        customer_name TEXT,
        artisan_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'placed',
        created_at TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (artisan_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    """)

    conn.commit()

    # Seed demo users & products if database is completely empty
    cursor.execute("SELECT COUNT(*) as count FROM users")
    user_count = cursor.fetchone()["count"]

    if user_count == 0:
        seed_demo_data(cursor)
        conn.commit()

    conn.close()


def seed_demo_data(cursor):
    now = get_utc_now_iso()

    # Demo Artisan
    artisan_id = "demo-artisan-1"
    cursor.execute("""
    INSERT INTO users (id, name, email, phone, password_hash, role, location, craft_type, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        artisan_id,
        "Kalyani Devi",
        "artisan@demo.com",
        "+91 98480 12345",
        generate_password_hash("artisan123"),
        "artisan",
        "Kondapalli, Andhra Pradesh",
        "Kondapalli Wooden Toys & Dolls",
        "",
        now
    ))

    # Demo Customer
    customer_id = "demo-customer-1"
    cursor.execute("""
    INSERT INTO users (id, name, email, phone, password_hash, role, location, craft_type, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        customer_id,
        "Ananya Sharma",
        "customer@demo.com",
        "+91 98765 43210",
        generate_password_hash("customer123"),
        "customer",
        "Bengaluru, Karnataka",
        None,
        "",
        now
    ))

    # Demo Products for Artisan
    demo_products = [
        (
            "prod-demo-1",
            artisan_id,
            "Handcrafted Kondapalli Dasavatara Set",
            "Woodcraft",
            "Authentic hand-carved Tella Poniki wood depicting the sacred ten incarnations, finished with vegetable dyes.",
            "Tella Poniki Softwood, Natural Dyes",
            1850.0,
            8,
            "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80",
            "Generational craft passed down over 400 years by the Kondapalli artisan community in Andhra Pradesh.",
            now
        ),
        (
            "prod-demo-2",
            artisan_id,
            "Traditional Bull Cart Toy with Moving Wheels",
            "Woodcraft",
            "Vintage folk toy painted in non-toxic traditional colors with movable parts for collectors.",
            "Softwood & Organic Turmeric/Indigo Pigments",
            750.0,
            12,
            "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop&q=80",
            "Inspired by the festive rural bullock carts of south Indian harvest celebrations.",
            now
        ),
        (
            "prod-demo-3",
            artisan_id,
            "Hand-Painted Dancing Village Couple",
            "Home Decor",
            "Exquisite figurine capturing the joyful rural folk dance of coastal Andhra Pradesh.",
            "Carved Wood, Lacquer Gloss",
            1200.0,
            5,
            "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
            "Each figurine takes 3 days of delicate hand-painting with fine squirrel-hair brushes.",
            now
        )
    ]

    for prod in demo_products:
        cursor.execute("""
        INSERT INTO products (id, artisan_id, product_name, category, description, material, price, quantity, image, craft_story, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, prod)


# Initialize DB on module load
init_db()


def get_current_user_from_request():
    auth_header = request.headers.get("Authorization", "")
    user_id = None
    if auth_header.startswith("Bearer "):
        user_id = auth_header.split(" ")[1].strip()
    elif request.headers.get("X-User-Id"):
        user_id = request.headers.get("X-User-Id").strip()

    if not user_id:
        return None

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return user


# =====================================================================
# AUTHENTICATION ENDPOINTS
# =====================================================================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirmPassword") or data.get("confirm_password") or ""
    role = data.get("role", "customer").strip()
    location = data.get("location") or data.get("state") or ""
    craft_type = data.get("craft_type") or data.get("craftType") or ""
    avatar = data.get("avatar") or ""

    # Validations
    if not name:
        return jsonify({"success": False, "message": "Full Name is required."}), 400
    if not email or "@" not in email or "." not in email:
        return jsonify({"success": False, "message": "A valid email address is required."}), 400
    if not password:
        return jsonify({"success": False, "message": "Password is required."}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters."}), 400
    if confirm_password and password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400
    if role not in ["artisan", "customer", "b2b_buyer", "admin"]:
        return jsonify({"success": False, "message": "Invalid role specified."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check duplicate email
    existing = cursor.execute("SELECT id FROM users WHERE LOWER(email) = ?", (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({"success": False, "message": "An account with this email already exists."}), 409

    user_id = f"user-{uuid.uuid4().hex[:12]}"
    password_hash = generate_password_hash(password)
    created_at = get_utc_now_iso()

    cursor.execute("""
    INSERT INTO users (id, name, email, phone, password_hash, role, location, craft_type, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, name, email, phone, password_hash, role, location, craft_type, avatar, created_at))

    conn.commit()
    conn.close()

    user_data = {
        "id": user_id,
        "name": name,
        "email": email,
        "phone": phone,
        "role": role,
        "location": location,
        "craft_type": craft_type,
        "avatar": avatar,
        "created_at": created_at
    }

    return jsonify({
        "success": True,
        "message": f"Welcome to KalaConnect AI, {name}!",
        "user": user_data,
        "token": user_id
    }), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"success": False, "message": "Please provide both email and password."}), 400

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE LOWER(email) = ?", (email,)).fetchone()
    conn.close()

    if not user:
        return jsonify({"success": False, "message": "No account found with this email. Please Sign Up."}), 401

    if not check_password_hash(user["password_hash"], password):
        return jsonify({"success": False, "message": "Incorrect password. Please try again."}), 401

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "location": user["location"],
        "craft_type": user["craft_type"],
        "avatar": user["avatar"],
        "created_at": user["created_at"]
    }

    return jsonify({
        "success": True,
        "message": f"Welcome back, {user['name']}!",
        "user": user_data,
        "token": user["id"]
    })


@app.route("/api/auth/me", methods=["GET"])
def get_me():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    user_data = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "location": user["location"],
        "craft_type": user["craft_type"],
        "avatar": user["avatar"],
        "created_at": user["created_at"]
    }
    return jsonify({"success": True, "user": user_data})


# =====================================================================
# PRODUCTS ENDPOINTS
# =====================================================================

@app.route("/api/products", methods=["GET"])
def get_products():
    category = request.args.get("category")
    location = request.args.get("location")
    artisan_id = request.args.get("artisan_id")
    search = request.args.get("search")

    query = """
    SELECT p.*, u.name as artisan_name, u.location as artisan_location, u.avatar as artisan_avatar
    FROM products p
    JOIN users u ON p.artisan_id = u.id
    WHERE 1=1
    """
    params = []

    if category and category.lower() != "all":
        query += " AND LOWER(p.category) = LOWER(?)"
        params.append(category)

    if location and location.lower() != "all":
        query += " AND LOWER(u.location) LIKE LOWER(?)"
        params.append(f"%{location}%")

    if artisan_id:
        query += " AND p.artisan_id = ?"
        params.append(artisan_id)

    if search:
        query += " AND (LOWER(p.product_name) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?) OR LOWER(p.material) LIKE LOWER(?))"
        params.append(f"%{search}%")

    query += " ORDER BY p.created_at DESC"

    conn = get_db_connection()
    rows = conn.execute(query, params).fetchall()
    conn.close()

    products = [dict(row) for row in rows]
    return jsonify({"success": True, "count": len(products), "products": products})


@app.route("/api/products/<product_id>", methods=["GET"])
def get_product(product_id):
    conn = get_db_connection()
    row = conn.execute("""
    SELECT p.*, u.name as artisan_name, u.location as artisan_location, u.craft_type as artisan_craft, u.avatar as artisan_avatar, u.phone as artisan_phone, u.email as artisan_email
    FROM products p
    JOIN users u ON p.artisan_id = u.id
    WHERE p.id = ?
    """, (product_id,)).fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "message": "Product not found"}), 404

    return jsonify({"success": True, "product": dict(row)})


@app.route("/api/products", methods=["POST"])
def add_product():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"success": False, "message": "Authentication required to add products."}), 401

    if user["role"] not in ["artisan", "admin"]:
        return jsonify({"success": False, "message": "Only artisans can add products."}), 403

    data = request.get_json() or {}
    product_name = data.get("product_name") or data.get("name")
    price = data.get("price") or data.get("publishedPrice")

    if not product_name:
        return jsonify({"success": False, "message": "Product name is required."}), 400
    if price is None:
        return jsonify({"success": False, "message": "Product price is required."}), 400

    try:
        price = float(price)
    except ValueError:
        return jsonify({"success": False, "message": "Invalid price format."}), 400

    product_id = f"prod-{uuid.uuid4().hex[:10]}"
    category = data.get("category", "General Handicrafts")
    description = data.get("description", "")
    material = data.get("material", "Traditional Materials")
    quantity = int(data.get("quantity") or data.get("stock") or 1)
    image = data.get("image") or "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80"
    craft_story = data.get("craft_story") or data.get("craftStory") or ""
    created_at = get_utc_now_iso()

    conn = get_db_connection()
    conn.execute("""
    INSERT INTO products (id, artisan_id, product_name, category, description, material, price, quantity, image, craft_story, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (product_id, user["id"], product_name, category, description, material, price, quantity, image, craft_story, created_at))
    conn.commit()
    conn.close()

    new_product = {
        "id": product_id,
        "artisan_id": user["id"],
        "artisan_name": user["name"],
        "artisan_location": user["location"],
        "product_name": product_name,
        "category": category,
        "description": description,
        "material": material,
        "price": price,
        "quantity": quantity,
        "image": image,
        "craft_story": craft_story,
        "created_at": created_at
    }

    return jsonify({"success": True, "message": "Product added successfully!", "product": new_product}), 201


@app.route("/api/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    user = get_current_user_from_request()
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    conn = get_db_connection()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()

    if not product:
        conn.close()
        return jsonify({"success": False, "message": "Product not found"}), 404

    # Strict ownership check: Artisan A cannot edit Artisan B's products!
    if user["role"] != "admin" and product["artisan_id"] != user["id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden: You do not have permission to edit this product."}), 403

    data = request.get_json() or {}
    product_name = data.get("product_name") or data.get("name") or product["product_name"]
    category = data.get("category", product["category"])
    description = data.get("description", product["description"])
    material = data.get("material", product["material"])
    price = float(data.get("price") or data.get("publishedPrice") or product["price"])
    quantity = int(data.get("quantity") or data.get("stock") or product["quantity"])
    image = data.get("image", product["image"])
    craft_story = data.get("craft_story") or data.get("craftStory") or product["craft_story"]

    conn.execute("""
    UPDATE products
    SET product_name = ?, category = ?, description = ?, material = ?, price = ?, quantity = ?, image = ?, craft_story = ?
    WHERE id = ?
    """, (product_name, category, description, material, price, quantity, image, craft_story, product_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Product updated successfully!"})


@app.route("/api/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    user = get_current_user_from_request()
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    conn = get_db_connection()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()

    if not product:
        conn.close()
        return jsonify({"success": False, "message": "Product not found"}), 404

    # Strict ownership check: Artisan A cannot delete Artisan B's products!
    if user["role"] != "admin" and product["artisan_id"] != user["id"]:
        conn.close()
        return jsonify({"success": False, "message": "Forbidden: You do not have permission to delete this product."}), 403

    conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Product deleted successfully!"})


# =====================================================================
# ARTISANS ENDPOINTS
# =====================================================================

@app.route("/api/artisans", methods=["GET"])
def get_artisans():
    conn = get_db_connection()
    rows = conn.execute("""
    SELECT u.id, u.name, u.email, u.phone, u.location, u.craft_type, u.avatar, u.created_at,
           COUNT(p.id) as product_count
    FROM users u
    LEFT JOIN products p ON u.id = p.artisan_id
    WHERE u.role = 'artisan'
    GROUP BY u.id
    ORDER BY u.created_at DESC
    """).fetchall()
    conn.close()

    artisans = [dict(row) for row in rows]
    return jsonify({"success": True, "artisans": artisans})


@app.route("/api/artisans/<artisan_id>", methods=["GET"])
def get_artisan_detail(artisan_id):
    conn = get_db_connection()
    artisan = conn.execute("""
    SELECT id, name, email, phone, location, craft_type, avatar, created_at
    FROM users
    WHERE id = ? AND role = 'artisan'
    """, (artisan_id,)).fetchone()

    if not artisan:
        conn.close()
        return jsonify({"success": False, "message": "Artisan not found"}), 404

    products = conn.execute("""
    SELECT * FROM products WHERE artisan_id = ? ORDER BY created_at DESC
    """, (artisan_id,)).fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "artisan": dict(artisan),
        "products": [dict(p) for p in products]
    })


# =====================================================================
# ORDERS ENDPOINTS
# =====================================================================

@app.route("/api/orders", methods=["GET"])
def get_orders():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    conn = get_db_connection()
    if user["role"] == "artisan":
        orders = conn.execute("""
        SELECT o.*, p.product_name, p.image as product_image, u.name as customer_name
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.customer_id = u.id
        WHERE o.artisan_id = ?
        ORDER BY o.created_at DESC
        """, (user["id"],)).fetchall()
    else:
        orders = conn.execute("""
        SELECT o.*, p.product_name, p.image as product_image, a.name as artisan_name
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users a ON o.artisan_id = a.id
        WHERE o.customer_id = ?
        ORDER BY o.created_at DESC
        """, (user["id"],)).fetchall()
    conn.close()

    return jsonify({"success": True, "orders": [dict(o) for o in orders]})


@app.route("/api/orders", methods=["POST"])
def create_order():
    user = get_current_user_from_request()
    if not user:
        return jsonify({"success": False, "message": "Authentication required to place orders."}), 401

    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = int(data.get("quantity") or 1)

    if not product_id:
        return jsonify({"success": False, "message": "Product ID is required."}), 400

    conn = get_db_connection()
    product = conn.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    if not product:
        conn.close()
        return jsonify({"success": False, "message": "Product not found."}), 404

    order_id = f"ORD-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    total_price = float(product["price"]) * quantity
    created_at = get_utc_now_iso()

    conn.execute("""
    INSERT INTO orders (id, customer_id, customer_name, artisan_id, product_id, quantity, total_price, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (order_id, user["id"], user["name"], product["artisan_id"], product_id, quantity, total_price, "placed", created_at))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Order placed successfully!",
        "order": {
            "id": order_id,
            "product_name": product["product_name"],
            "quantity": quantity,
            "total_price": total_price,
            "status": "placed",
            "created_at": created_at
        }
    }), 201


# =====================================================================
# SYSTEM & HEALTH
# =====================================================================

@app.route("/api/health", methods=["GET"])
def health():
    conn = get_db_connection()
    user_count = conn.execute("SELECT COUNT(*) as count FROM users").fetchone()["count"]
    product_count = conn.execute("SELECT COUNT(*) as count FROM products").fetchone()["count"]
    conn.close()

    return jsonify({
        "status": "healthy",
        "service": "KalaConnect AI - Backend API",
        "database": "SQLite (kalaconnect.db)",
        "usersCount": user_count,
        "productsCount": product_count,
        "timestamp": get_utc_now_iso()
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting KalaConnect AI Flask server on port {port}...")
    print(f"Database located at: {DB_PATH}")
    app.run(host="0.0.0.0", port=port, debug=True)
