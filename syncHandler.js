let jot = require('json-over-tcp')
let fs = require('fs')
let mkdirp = require('mkdirp')
let rimraf = require('rimraf')
let path = require('path')
let chokidar = require('chokidar')
let argv = require('yargs').argv

const ROOT_DIR = argv.dir || path.resolve(process.cwd())

function newConnectionHandler(socket) {

    chokidar.watch(ROOT_DIR, {
            ignored: /[\/\\]\./
        })
        .on('all', function(event, path) {
            console.log("Event detected by chokidar: " + event + " at path : " + path)
            if (event === 'unlinkDir') {
                socket.write({
                    "action": "deleteDir", // "update" or "delete"
                    "path": path,
                    "type": "dir",
                    "contents": null,
                    "updated": 1427851834642 // time of creation/deletion/update
                })

            } else if (event === 'unlink') {
                socket.write({
                    "action": "deleteFile", // "update" or "delete"
                    "path": path,
                    "type": "file",
                    "contents": null,
                    "updated": 1427851834642 // time of creation/deletion/update
                })

            } else if (event === 'add') {
                fs.readFile(path, "utf8", function(err, fileData) {
                    if (err) {
                        console.error(err)
                        return
                    }
                    socket.write({
                        "action": "create", // "update" or "delete"
                        "path": path,
                        "type": "file",
                        "contents": fileData, // or the base64 encoded file contents
                        "updated": 1427851834642 // time of creation/deletion/update
                    })
                })
            } else if (event === 'addDir') {
                socket.write({
                    "action": "create", // "update" or "delete"
                    "path": path,
                    "type": "dir", // or "file"
                    "contents": null, // or the base64 encoded file contents
                    "updated": 1427851834642 // time of creation/deletion/update
                })
            } else if (event === 'change') {
                fs.readFile(path, "utf8", function(err, fileData) {
                    if (err) {
                        console.error(err)
                        return
                    }
                    socket.write({
                        "action": "update", // "update" or "delete"
                        "path": path,
                        "type": "file",
                        "contents": fileData, // or the base64 encoded file contents
                        "updated": 1427851834642 // time of creation/deletion/update
                    })
                })

            }
        })

    socket.on('data', function(data) {
        if (data.action === 'create') {
            handleCreate(data)
        } else if (data.action === 'update') {
            handleUpdate(data)
        } else if (data.action === 'deleteDir') {
            handleDeleteDir(data)
        } else if (data.action === 'deleteFile') {
            handleDeleteFile(data)
        }

    })
}

function handleCreate(data) {
    let filePath = data.path
    if (isDir(filePath)) {
        mkdirp(filePath, function(err) {
            if (err) console.error(err)
            else console.log('Created Directory :' + filePath)
        })
    } else {
        fs.writeFile(filePath, data.contents, function(err) {
            if (err) console.error(err)
            else console.log('Created file:' + filePath)
        })
    }

}

function handleUpdate(data) {
    fs.readFile(data.path, "utf8", function(err, originalData) {
        if (err) {
            console.error(err)
            return
        }
        if (originalData.length === data.contents.length) {  
            // data is same hence return
            return
        }
        fs.truncate(data.path, 0)
        fs.writeFile(data.path, data.contents, function(err_write) {
             console.log('Updated files:' + data.path)
        })
    })

}

function handleDeleteDir(data) {
    let filePath = data.path
    rimraf(filePath, function(err) {
        if (err) console.error(err)
        else console.log('Deleted directory:' + filePath)
    })
}

function handleDeleteFile(data) {
    let filePath = data.path
    fs.unlink(filePath, function(err) {
        if (err) console.error(err)
        else console.log('Deleted file: ' + filePath)
    })
}

function isDir(filePath) {
    let endsWithSlash = filePath.charAt(filePath.length - 1) === path.seperator
    let hasExt = path.extname(filePath) !== ''
    return (endsWithSlash || !hasExt)
}


module.exports = {
    newConnectionHandler: newConnectionHandler
};
