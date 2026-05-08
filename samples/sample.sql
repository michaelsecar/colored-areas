--region: #FF6B6B Database Schema
CREATE DATABASE shop;

USE shop;

--region: #4ECDC4 Tables
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    total DECIMAL(10,2),
    created_at DATETIME
);
--endregion

--region: #45B7D1 Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(created_at);
--endregion

--endregion
