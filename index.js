let fs = require('fs')
let path = require('path')
let express = require('express')
let morgan = require('morgan')
let nodeify = require('bluebird-nodeify')
let mime = require('mime-types')
let rimraf = require('rimraf')
let mkdirp = require('mkdirp')
let net = require('net')
let nssocket = require('nssocket')
let argv = require('yargs').argv

require('songbird')

console.log('argumane :' + argv.dir)

const ROOT_DIR = argv.dir || path.resolve(process.cwd())

console.log(ROOT_DIR)

const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT || 8000
//const ROOT_DIR = path.resolve(process.cwd())

let app = express()

if (NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.listen(PORT, () => console.log(`LISTENING @ http://127.0.0.1:${PORT}`))

let socket = new nssocket.NsSocket({
    reconnect: true,
    type: 'tcp4',
 })

socket.on('start', function () {
    console.dir('start')
  })

socket.connect(`${PORT}`)

app.get('*', setFilePath, sendHeaders, (req, res) => {
    if (res.body) {
        res.json(res.body)
        return
    }
    fs.createReadStream(req.filePath).pipe(res)
})

app.head('*', setFilePath, sendHeaders, (req, res) => res.end())

app.delete('*', setFilePath, (req, res, next) => {
    async() => {
        if (!req.stat) return res.send(400, "Invalid Path")
        if (req.stat.isDirectory()) {
            await rimraf.promise(req.filePath)
        } else await fs.promise.unlink(req.filePath)
        res.end()
    }().catch(next)
})

app.put('*', setFilePath, setDirDetails, (req, res, next) => {
    async() => {
        if (req.stat) return res.send(405, 'File Exists')
        await mkdirp.promise(req.dirPath)
        if (!req.isDir) req.pipe(fs.createWriteStream(req.filePath))
        res.end()

    }().catch(next)
})

app.post('*', setFilePath, setDirDetails, (req, res, next) => {
    async() => {
        if (!req.stat) return res.send(405, 'File does not exists')
        if (req.isDir) return res.send(405, 'Path is a directory')
        await fs.promise.truncate(req.filePath, 0)
        req.pipe(fs.createWriteStream(req.filePath))
        res.end()

    }().catch(next)
})


function setDirDetails(req, res, next) {

    let filePath = req.filePath

    let endsWithSlash = filePath.charAt(filePath.length - 1) === path.seperator
    let hasExt = path.extname(filePath) !== ''
    req.isDir = endsWithSlash || !hasExt
    req.dirPath = req.isDir ? filePath : path.dirname(filePath)
    next()
}

function setFilePath(req, res, next) {
    req.filePath = path.resolve(path.join(ROOT_DIR, req.url))
    if (req.filePath.indexOf(ROOT_DIR) !== 0) {
        res.send("400", "Invalid Path")
        return
    }
    fs.promise.stat(req.filePath)
        .then(stat => req.stat = stat, () => req.stat = null)
        .nodeify(next)
}

function sendHeaders(req, res, next) {
    nodeify(async() => {
        let filePath = req.filePath
        if (filePath.indexOf(ROOT_DIR) !== 0) {
            res.send("400", "Invalid Path")
        }
        if (req.stat.isDirectory()) {
            let files = await fs.promise.readdir(filePath)
            res.body = JSON.stringify(files)
            res.setHeader('Content-Length', res.body.length)
            res.setHeader('Content-type', 'application/json')
            return
        }

        let contentType = mime.contentType(path.extname(filePath))
        res.setHeader('Content-Length', req.stat.size)
        res.setHeader('Content-type', contentType)

    }(), next)
}
