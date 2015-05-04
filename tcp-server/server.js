let jot = require('json-over-tcp')
let fs = require('fs')
let nodeify = require('nodeify')
let path = require('path')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
require('songbird')

let server = jot.createServer(port)
let port = 8092
server.on('connection', newConnectionHandler)

const ROOT_DIR = path.resolve(process.cwd())

function newConnectionHandler(socket) {
    socket.on('data', function(data) {
        console.log("Client's action: " + data.action)
        if (data.action === 'create') {
            handleCreate(socket, data)
        }
            socket.write({
                "action": "create", // "update" or "delete"
                "path": "test_server",
                "type": "dir", // or "file"
                "contents": null, // or the base64 encoded file contents
                "updated": 1427851834642 // time of creation/deletion/update
            })
    })
}


// Start listening 
server.listen(port)

function handleCreate(socket, data) {
    mkdirp(data.path, function(err) {
        if (err) console.error(err)
        else console.log('pow!')
    })
}
