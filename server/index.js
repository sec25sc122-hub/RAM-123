import { createServer } from 'node:http'
import 'dotenv/config'
import mongoose from 'mongoose'

const port = Number(process.env.PORT || 4000)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI

if (!mongoUri) {
  console.error('Missing MongoDB connection string. Set MONGO_URI or MONGODB_URI in server/.env')
  process.exitCode = 1
}

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: String,
    bloodGroup: String,
    phone: String,
    email: String,
    address: String,
    department: String,
    gender: String,
    year: String,
    section: String,
    arrears: { type: Number, required: true },
    companies: { type: [String], required: true },
    registeredAt: { type: Date, required: true },
  },
  { collection: 'Student', versionKey: false },
)

const Student = mongoose.model('Student', studentSchema)

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end(JSON.stringify(payload))
}

const server = createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  if (request.method === 'GET' && request.url === '/') {
    sendJson(response, 200, {
      name: 'CampusPath API',
      status: 'ok',
      endpoints: {
        health: 'GET /api/health',
        registrations: 'GET /api/registrations',
      },
    })
    return
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, {
      status: mongoose.connection.readyState === 1 ? 'ok' : 'disconnected',
    })
    return
  }

  if (request.method === 'GET' && request.url === '/api/registrations') {
    Student.find()
      .sort({ registeredAt: 1 })
      .lean()
      .then((registrations) => sendJson(response, 200, registrations))
      .catch((error) => {
        console.error('Failed to load registrations:', error)
        sendJson(response, 500, { error: 'Failed to load registrations' })
      })
    return
  }

  if (request.method === 'POST' && request.url === '/api/registrations') {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      try {
        const registration = JSON.parse(body)
        if (!registration.name || !Array.isArray(registration.companies)) {
          sendJson(response, 400, { error: 'Invalid registration payload' })
          return
        }
        Student.create(registration)
          .then((savedRegistration) => sendJson(response, 201, savedRegistration.toObject()))
          .catch((error) => {
            console.error('Failed to save registration:', error)
            sendJson(response, 500, { error: 'Failed to save registration' })
          })
      } catch (error) {
        console.error('Invalid registration JSON:', error)
        sendJson(response, 400, { error: 'Request body must be valid JSON' })
      }
    })
    return
  }

  sendJson(response, 404, { error: 'Route not found' })
})

if (mongoUri) {
  mongoose
    .connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
      server.listen(port, () => {
        console.log(`CampusPath server listening on http://localhost:${port}`)
        console.log('Connected to MongoDB Atlas database, collection "Student"')
      })
    })
    .catch((error) => {
      console.error('Unable to connect to MongoDB Atlas. Check the URI, Atlas network access, and database user credentials.')
      console.error(error)
      process.exitCode = 1
    })
}
