const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, 'company.db');

(async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log('Database connected successfully');
  } catch (e) {
    console.error(`DB error: ${e.message}`);
    process.exit(1);
  }
})();



app.listen(3000, () => {
    console.log('App is running on http://localhost:3000');
  });

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const jwtToken = authHeader.split(' ')[1];
    jwt.verify(jwtToken, 'secret_string', (error, payload) => {
      if (error) {
        res.status(401).send('Unauthorized');
      } else {
        req.user = payload;
        next();
      }
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};



// Login API
app.post('/user/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.get('SELECT * FROM user WHERE name = ?', [username]);
    if (!user) {
      res.status(404).send('Invalid User');
    } else {
      const isPassMatch = await bcrypt.compare(password, user.password);
      if (isPassMatch) {
        const payload = { username: username };
        const jwtToken = jwt.sign(payload, 'secret_string');
        res.send({ jwtToken });
      } else {
        res.status(400).send('Invalid Password');
      }
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Register API
app.post('/user/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password || !role) {
      return res.status(400).send('All fields are required');
    }

    const existingUser = await db.get('SELECT * FROM user WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    if (password.length < 8) {
      return res.status(400).send('Password must be at least 8 characters long');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
    res.send('User registered successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Get Customers API
app.get('/customers', authenticate, async (req, res) => {
  const {
    offset = 0,
    limit = 10,
    order = 'ASC',
    company = '',
    name = '',
    phone = '',
    email = '',
    order_by = 'created_at',
  } = req.query;

  try {
    const query = `
      SELECT * FROM customers 
      WHERE company LIKE ? 
      OR name LIKE ? 
      OR phone LIKE ? 
      OR email LIKE ? 
      ORDER BY ${order_by} ${order} 
      LIMIT ? OFFSET ?`;
    const customers = await db.all(query, [
      `%${company}%`,
      `%${name}%`,
      `%${phone}%`,
      `%${email}%`,
      parseInt(limit),
      parseInt(offset),
    ]);
    res.send(customers);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Add Customer API
app.post('/customers', authenticate, async (req, res) => {
  const { name, phone, email, company } = req.body;
  try {
    if (!name || !phone || !email || !company) {
      return res.status(400).send('All fields are required');
    }

    const existingCustomer = await db.get('SELECT * FROM customers WHERE email = ?', [email]);
    if (existingCustomer) {
      return res.status(400).send('Customer already exists');
    }

    const result = await db.run(
      'INSERT INTO customers (name, email, phone, company) VALUES (?, ?, ?, ?)',
      [name, email, phone, company]
    );
    res.send({ customerId: result.lastID });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Get Customer by ID API
app.get('/customers/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      res.status(404).send('Customer not found');
    } else {
      res.send(customer);
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Delete Customer API
app.delete('/customers/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM customers WHERE id = ?', [id]);
    if (result.changes === 0) {
      res.status(404).send('Customer not found');
    } else {
      res.send('Customer deleted successfully');
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});





