let jot = require('json-over-tcp')
let fs = require('fs')
let mkdirp = require('mkdirp')
let chokidar = require('chokidar')

function newConnectionHandler(socket) {

        chokidar.watch('.', {
                ignored: /[\/\\]\./
            })
            .on('all', function(event, path) {
                console.log(event, path)
                if (event === 'unlink') {
                     socket.write({
                        "action": "delete", // "update" or "delete"
                        "path": path,
                        "type": "file", 
                        "contents": null, 
                        "updated": 1427851834642 // time of creation/deletion/update
                    })

                } else if (event === 'add') {
                    socket.write({
                        "action": "create", // "update" or "delete"
                        "path": path,
                        "type": "file", // or "file"
                        "contents": null, // or the base64 encoded file contents
                        "updated": 1427851834642 // time of creation/deletion/update
                    })
                }  else if (event === 'addDir') {
                    socket.write({
                        "action": "create", // "update" or "delete"
                        "path": path,
                        "type": "dir", // or "file"
                        "contents": null, // or the base64 encoded file contents
                        "updated": 1427851834642 // time of creation/deletion/update
                    })
                }  else if (event === 'change') {
                    socket.write({
                        "action": "update", // "update" or "delete"
                        "path": path,
                        "type": "file", 
                        "contents": null, // or the base64 encoded file contents
                        "updated": 1427851834642 // time of creation/deletion/update
                    })
                }
            })

        socket.on('data', function(data) {
                console.log("Client's action: " + data.action)
                if (data.action === 'create') {
                    handleCreate(data)
                } else if(data.action === 'update'){
                    handleUpdate(data)
                } else if(data.action === 'delete') {
                    handleDelete(data)
                }

        })
}



function handleCreate(data) {
    mkdirp(data.path, function(err) {
        if (err) console.error(err)
        else console.log('Created file :' + data.path)
    })
}

function handleUpdate(data) {
    fs.truncate(data.path, 0)
    fs.writeFile(data.path, data.contents, function(err) {
        if (err) console.error(err)
        else console.log('updated!')
    })
}


module.exports = {
    newConnectionHandler: newConnectionHandler
};