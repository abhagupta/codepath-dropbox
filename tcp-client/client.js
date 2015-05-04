let jot = require('json-over-tcp')
let syncHandler = require('../syncHandler.js')

let port = 8092
let socket = jot.connect(port)
syncHandler.newConnectionHandler(socket)



