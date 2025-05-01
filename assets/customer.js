const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function insertCustomers() {
  try {
    await client.connect();
    const db = client.db('MentalHealthChatbot');
    const collection = db.collection('Appointments');
    const customers = [
      {
        "name": "KUMAR PIYUSH",
        "age": 23,
        "phone_number": "7888758122",
        "email_id": "kprishabpiyush@gmail.com",
        "gender": "Male",
        "occupation": "Cloud Engineer",
        "mental_health_issue": "Anxiety",
        "solution": "Cognitive Behavioral Therapy",
        "appointment": {
          "doctor_name": "Dr. Achal Bhagat",
          "time_slot": "2025-05-01T10:00:00Z"
        }
      },
      {
        "name": "NIDHI KUMARI",
        "age": 20,
        "phone_number": "7970664221",
        "email_id": "nidhikumari@gmail.com",
        "gender": "Female",
        "occupation": "Software Engineer",
        "mental_health_issue": "Anxiety",
        "solution": "Cognitive Behavioral Therapy",
        "appointment": {
          "doctor_name": "Dr. Achal Bhagat",
          "time_slot": "2025-05-01T10:00:00Z"
        }
      },
      {
        "name": "MAYANK SHARMA",
        "age": 23,
        "phone_number": "8178849575",
        "email_id": "mayanksharma@gmail.com",
        "gender": "Male",
        "occupation": "Machine Learning Engineer",
        "mental_health_issue": "Depression",
        "solution": "Therapy and Medication",
        "appointment": {
          "doctor_name": "Dr. vasantha jayaraman",
          "time_slot": "2025-05-01T11:00:00Z"
        }
      },
      {
        "name": "RISHAB",
        "age": 23,
        "phone_number": "9990756975",
        "email_id": "rishab1234@gmail.com",
        "gender": "Male",
        "occupation": "Graphic Designer",
        "mental_health_issue": "Anxiety",
        "solution": "Cognitive Behavioral Therapy",
        "appointment": {
          "doctor_name": "Dr. Achal Bhagat",
          "time_slot": "2025-05-01T10:00:00Z"
        }
      },
      {
        "name": "UJJWAL",
        "age": 21,
        "phone_number": "9254541982",
        "email_id": "utyagi2003@gmail.com",
        "gender": "Male",
        "occupation": "Freelancer",
        "mental_health_issue": "PTSD",
        "solution": "EMDR Therapy",
        "appointment": {
          "doctor_name": "Dr. Gorav Gupta",
          "time_slot": "2025-05-03T09:00:00Z"
        }
      }
    ];
    const result = await collection.insertMany(customers);
    console.log(`${result.insertedCount} documents inserted`);
  } catch (error) {
    console.error('Error inserting documents:', error);
  } finally {
    await client.close();
  }
}
insertCustomers();



const crypto = require('crypto');
const secret = 'KP';
function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
// Encrypt phone_number before saving
const encryptedPhone = encrypt('7888758122');