let jot = require('json-over-tcp')
let path = require('path')
let syncHandler = require('../syncHandler.js')

let server = jot.createServer(port)
let port = 8092

server.on('connection', syncHandler.newConnectionHandler)

// Start listening 
server.listen(port)

