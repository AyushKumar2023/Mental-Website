// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();


// const authRoutes = require('./routes/auth');
// const appointmentRoutes = require('./routes/appointment');

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/appointments', appointmentRoutes);

// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB Connected'))
//   .catch((err) => console.error(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// //  integrating dataset 

// const fs = require('fs');

// const jsonData = JSON.parse(fs.readFileSync('./assets/project.customers_details.json', 'utf-8'));
// console.log(jsonData);

// const express = require('express');
// const { MongoClient } = require('mongodb');
// const app = express();
// app.use(express.json());

// const uri = 'mongodb://localhost:27017';
// const client = new MongoClient(uri);

// app.post('/api/customers', async (req, res) => {
//   try {
//     await client.connect();
//     const db = client.db('MentalHealthChatbot');
//     const collection = db.collection('Appointments');
//     const customer = req.body;
//     // Validate time slot availability
//     const existing = await collection.findOne({
//       'appointment.doctor_name': customer.appointment.doctor_name,
//       'appointment.time_slot': customer.appointment.time_slot
//     });
//     if (existing) {
//       return res.status(400).json({ error: 'Time slot already booked' });
//     }
//     const result = await collection.insertOne(customer);
//     res.status(201).json({ id: result.insertedId });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to save customer' });
//   }
// });

// app.listen(3000, () => console.log('Server running on port 3000'));



const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db('MentalHealthChatbot');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Validation function
function validateCustomer(customer) {
  const requiredFields = ['name', 'age', 'phone_number', 'email_id', 'gender', 'occupation', 'mental_health_issue', 'solution', 'appointment'];
  const validDoctors = ['Dr. Achal Bhagat', 'Dr. Vasantha Jayaraman', 'Dr. Gorav Gupta'];
  for (const field of requiredFields) {
    if (!customer[field]) return ${field} is required;
  }
  if (!customer.appointment.doctor_name || !customer.appointment.time_slot) {
    return 'Appointment details are incomplete';
  }
  if (!validDoctors.includes(customer.appointment.doctor_name)) {
    return 'Invalid doctor name';
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(customer.appointment.time_slot)) {
    return 'Invalid time slot format';
  }
  if (!/^[0-9]{10}$/.test(customer.phone_number)) {
    return 'Phone number must be 10 digits';
  }
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(customer.email_id)) {
    return 'Invalid email format';
  }
  return null;
}

// Load and insert JSON dataset
async function loadDataset() {
  try {
    const collection = db.collection('Appointments');
    const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'project.customers_details.json'), 'utf-8'));

    for (const customer of jsonData) {
      // Validate each customer
      const validationError = validateCustomer(customer);
      if (validationError) {
        console.warn(Skipping customer ${customer.name}: ${validationError});
        continue;
      }

      // Check for double-booking
      const existing = await collection.findOne({
        'appointment.doctor_name': customer.appointment.doctor_name,
        'appointment.time_slot': customer.appointment.time_slot
      });
      if (existing) {
        console.warn(Skipping customer ${customer.name}: Time slot ${customer.appointment.time_slot} already booked for ${customer.appointment.doctor_name});
        continue;
      }

      // Insert customer
      await collection.insertOne(customer);
      console.log(Inserted customer: ${customer.name});
    }
  } catch (error) {
    console.error('Error loading dataset:', error);
  }
}

// POST: Create a new customer
app.post('/api/customers', async (req, res) => {
  try {
    const collection = db.collection('Appointments');
    const customer = req.body;

    // Validate input
    const validationError = validateCustomer(customer);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check for double-booking
    const existing = await collection.findOne({
      'appointment.doctor_name': customer.appointment.doctor_name,
      'appointment.time_slot': customer.appointment.time_slot
    });
    if (existing) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    // Check for duplicate email
    const emailExists = await collection.findOne({ email_id: customer.email_id });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const result = await collection.insertOne(customer);
    res.status(201).json({ id: result.insertedId, message: 'Customer created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save customer' });
  }
});

// GET: Retrieve all customers
app.get('/api/customers', async (req, res) => {
  try {
    const collection = db.collection('Appointments');
    const customers = await collection.find({}).toArray();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET: Retrieve customer by email
app.get('/api/customers/:email', async (req, res) => {
  try {
    const collection = db.collection('Appointments');
    const customer = await collection.findOne({ email_id: req.params.email });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// PUT: Update customer by email
app.put('/api/customers/:email', async (req, res) => {
  try {
    const collection = db.collection('Appointments');
    const customer = req.body;

    // Validate input
    const validationError = validateCustomer(customer);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    // Check for double-booking (exclude current customer)
    const existing = await collection.findOne({
      'appointment.doctor_name': customer.appointment.doctor_name,
      'appointment.time_slot': customer.appointment.time_slot,
      email_id: { $ne: req.params.email }
    });
    if (existing) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    const result = await collection.updateOne(
      { email_id: req.params.email },
      { $set: customer }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE: Delete customer by email
app.delete('/api/customers/:email', async (req, res) => {
  try {
    const collection = db.collection('Appointments');
    const result = await collection.deleteOne({ email_id: req.params.email });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Start server
async function startServer() {
  try {
    await connectDB();
    await loadDataset(); // Load JSON dataset on startup
    app.listen(process.env.PORT || 3000, () => {
      console.log(Server running on port ${process.env.PORT || 3000});
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();