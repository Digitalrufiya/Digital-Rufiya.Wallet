import express from 'express'
import http from 'http'
import cors from 'cors'
import { Server } from 'socket.io'
import fs from 'fs'
import jwt from 'jsonwebtoken'
import { login } from './api/auth.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Auth route
app.post('/api/login', login)

// WebSocket Logic
io.on('connection', (socket) => {
  console.log('🟢 Connected:', socket.id)

  socket.on('join-room', (room) => {
    socket.join(room)
    console.log(`📡 Joined room: ${room}`)
  })

  socket.on('update-data', (data) => {
    const { room, key, value } = data

    // Read DB
    const db = JSON.parse(fs.readFileSync('./storage/data.json'))
    db[room] = db[room] || {}
    db[room][key] = value

    // Write DB
    fs.writeFileSync('./storage/data.json', JSON.stringify(db, null, 2))

    // Broadcast to room
    io.to(room).emit('realtime-update', { key, value })
  })

  socket.on('disconnect', () => {
    console.log('🔴 Disconnected:', socket.id)
  })
})

// Start server
server.listen(3000, () => {
  console.log('🚀 DRFChain live on http://localhost:3000')
})
