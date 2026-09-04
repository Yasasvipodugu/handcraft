-- KalaConnect AI - Artisan Cataloging & Market Linkage Database Schema
-- Database: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS kalaconnect_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kalaconnect_ai;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('artisan', 'customer', 'b2b_buyer', 'admin') NOT NULL DEFAULT 'customer',
  state VARCHAR(128) NOT NULL,
  district VARCHAR(128) NOT NULL,
  language VARCHAR(32) DEFAULT 'en',
  craft_category VARCHAR(128) NULL,
  avatar VARCHAR(512) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_role (role),
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ARTISANS TABLE
CREATE TABLE IF NOT EXISTS artisans (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  craft_name VARCHAR(255) NOT NULL,
  craft_category VARCHAR(128) NOT NULL,
  village VARCHAR(128) NOT NULL,
  district VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  experience_years INT DEFAULT 1,
  bio TEXT,
  cultural_significance TEXT,
  verification_status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMP NULL,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  total_sales DECIMAL(12, 2) DEFAULT 0.00,
  profile_views INT DEFAULT 0,
  phone VARCHAR(32),
  email VARCHAR(255),
  banner_url VARCHAR(512),
  avatar_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_artisan_verification (verification_status),
  INDEX idx_artisan_state (state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL UNIQUE,
  slug VARCHAR(128) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  artisan_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(128) NOT NULL,
  material VARCHAR(255) NOT NULL,
  craft_type VARCHAR(255) NOT NULL,
  dimensions VARCHAR(128),
  minimum_price DECIMAL(10, 2) NOT NULL,
  recommended_price DECIMAL(10, 2) NOT NULL,
  premium_price DECIMAL(10, 2) NOT NULL,
  published_price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(512) NOT NULL,
  original_image VARCHAR(512),
  enhanced_image VARCHAR(512),
  status ENUM('active', 'draft', 'unlisted') DEFAULT 'active',
  stock INT DEFAULT 10,
  views INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  pricing_explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  INDEX idx_product_category (category),
  INDEX idx_product_price (published_price),
  INDEX idx_product_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  pincode VARCHAR(16) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(64) NOT NULL,
  payment_status ENUM('paid', 'pending', 'cod') DEFAULT 'paid',
  status ENUM('placed', 'confirmed', 'processing', 'shipped', 'delivered') DEFAULT 'placed',
  tracking_number VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  artisan_id VARCHAR(64) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(512),
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. CART TABLE
CREATE TABLE IF NOT EXISTS cart (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL,
  artisan_id VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. B2B_REQUIREMENTS TABLE
CREATE TABLE IF NOT EXISTS b2b_requirements (
  id VARCHAR(64) PRIMARY KEY,
  buyer_id VARCHAR(64) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_company VARCHAR(255) NOT NULL,
  category VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  required_quantity INT NOT NULL,
  budget DECIMAL(12, 2) NOT NULL,
  delivery_location VARCHAR(255) NOT NULL,
  required_date DATE NOT NULL,
  status ENUM('open', 'in_progress', 'fulfilled', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. B2B_PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS b2b_proposals (
  id VARCHAR(64) PRIMARY KEY,
  requirement_id VARCHAR(64) NOT NULL,
  artisan_id VARCHAR(64) NOT NULL,
  artisan_name VARCHAR(255) NOT NULL,
  craft VARCHAR(255) NOT NULL,
  proposed_price_per_unit DECIMAL(10, 2) NOT NULL,
  proposed_lead_days INT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('submitted', 'accepted', 'negotiating', 'rejected') DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requirement_id) REFERENCES b2b_requirements(id) ON DELETE CASCADE,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  role VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('order', 'verification', 'b2b', 'product', 'system') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. ARTISAN_VERIFICATION AUDIT TABLE
CREATE TABLE IF NOT EXISTS artisan_verification (
  id VARCHAR(64) PRIMARY KEY,
  artisan_id VARCHAR(64) NOT NULL,
  admin_id VARCHAR(64) NOT NULL,
  previous_status VARCHAR(32),
  new_status VARCHAR(32) NOT NULL,
  verification_notes TEXT,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artisan_id) REFERENCES artisans(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. SAVED_PRODUCTS (WISHLIST) TABLE
CREATE TABLE IF NOT EXISTS saved_products (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
