# Express API with SQLite Authentication and CRUD Operations

## Overview

This project implements a RESTful API using Express.js and SQLite. The API provides user authentication using JWT and includes endpoints to manage customers. It also supports secure password hashing with bcrypt.

## Features

- **User Authentication**:
  - Login and Registration APIs with JWT-based authentication.
  - Passwords are securely hashed using bcrypt.
- **Customer Management**:
  - CRUD operations for customer data.
  - Pagination, sorting, and filtering for customer records.
- **Secure Access**:
  - JWT-based middleware to protect sensitive routes.

## Installation and Setup

1. **Clone the Repository:**

   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Initialize the Database:**
   Ensure the SQLite database file (`company.db`) exists. Use the following schema to create the required tables:

   ```sql
   -- Table: user
   CREATE TABLE IF NOT EXISTS user (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       email TEXT UNIQUE NOT NULL,
       password TEXT NOT NULL,
       role TEXT NOT NULL
   );

   -- Table: customers
   CREATE TABLE IF NOT EXISTS customers (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       email TEXT UNIQUE NOT NULL,
       phone TEXT NOT NULL,
       company TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Run the Server:**

   ```bash
   node app.js
   ```

   The server will start at `http://localhost:3000`.

## API Endpoints

### **User Authentication**

#### 1. **Login**

**POST** `/user/login`

- Request Body:
  ```json
  {
    "username": "example_user",
    "password": "example_password"
  }
  ```
- Response:
  - `200 OK`: Returns a JWT token.
  - `404 Not Found`: Invalid user.
  - `400 Bad Request`: Invalid password.

#### 2. **Register**

**POST** `/user/register`

- Request Body:
  ```json
  {
    "name": "Example User",
    "email": "example@example.com",
    "password": "securepassword",
    "role": "admin"
  }
  ```
- Response:
  - `200 OK`: User registered successfully.
  - `400 Bad Request`: User already exists or invalid input.

### **Customer Management**

#### 1. **Get All Customers**

**GET** `/customers`

- Query Parameters:
  - `offset` (default: 0)
  - `limit` (default: 10)
  - `order` (default: `ASC`)
  - `order_by` (default: `created_at`)
  - `company`, `name`, `phone`, `email` (optional filters)
- Response:
  - `200 OK`: Returns a list of customers.

#### 2. **Add Customer**

**POST** `/customers`

- Request Body:
  ```json
  {
    "name": "Customer Name",
    "phone": "1234567890",
    "email": "customer@example.com",
    "company": "Example Inc."
  }
  ```
- Response:
  - `200 OK`: Customer added successfully.
  - `400 Bad Request`: Customer already exists or invalid input.

#### 3. **Get Customer by ID**

**GET** `/customers/:id`

- Response:
  - `200 OK`: Returns customer details.
  - `404 Not Found`: Customer not found.

#### 4. **Delete Customer**

**DELETE** `/customers/:id`

- Response:
  - `200 OK`: Customer deleted successfully.
  - `404 Not Found`: Customer not found.

## Error Handling

- `400 Bad Request`: Invalid or missing input data.
- `401 Unauthorized`: Missing or invalid JWT token.
- `404 Not Found`: Resource not found.
- `500 Internal Server Error`: Database or server-related issues.

## Dependencies

- **Express.js**: Web framework for building APIs.
- **SQLite3**: Database driver.
- **bcrypt**: Password hashing.
- **jsonwebtoken**: JWT-based authentication.
- **sqlite**: Promises-based wrapper for SQLite3.

## Future Enhancements

- Add user roles and permissions.
- Implement rate limiting for APIs.
- Add support for bulk customer uploads.

---
