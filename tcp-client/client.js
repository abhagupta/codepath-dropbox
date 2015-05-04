let jot = require('json-over-tcp')
let fs = require('fs')
let nodeify = require('nodeify')
let path = require('path')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')

let port = 8092
    // Creates one connection to the server when the server starts listening 
function createConnection() {
    // Start a connection to the server 
    let socket = jot.connect(port, function() {
        // Send the initial message once connected 
        socket.write({
            "action": "create", // "update" or "delete"
            "path": "test",
            "type": "dir", // or "file"
            "contents": null, // or the base64 encoded file contents
            "updated": 1427851834642 // time of creation/deletion/update
        })
    })

    // Whenever the server sends us an object... 
    socket.on('data', function(data) {
        // Output the answer property of the server's message to the console 
        console.log("Server's action: " + data.action)

        if (data.action === 'create') {
            handleCreate(socket, data)
        }
       
    })

}

createConnection()

function handleCreate(socket, data) {
    mkdirp(data.path, function(err) {
        if (err) console.error(err)
        else console.log('pow!')
    })
}
