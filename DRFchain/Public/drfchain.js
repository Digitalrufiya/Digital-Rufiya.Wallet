// DRFChain SDK (Frontend)

const DRFchain = {
  socket: null,
  room: null,

  connect(url) {
    this.socket = io(url)
    console.log('✅ DRFChain connected to', url)
  },

  join(room) {
    this.room = room
    this.socket.emit('join-room', room)
    console.log('📡 Joined room:', room)
  },

  push(key, value) {
    this.socket.emit('update-data', {
      room: this.room,
      key,
      value
    })
    console.log(`🚀 Pushed to ${this.room}: ${key} =`, value)
  },

  onUpdate(callback) {
    this.socket.on('realtime-update', callback)
  }
}

window.DRFchain = DRFchain
