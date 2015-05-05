# codepath-dropbox


This is a basic Dropbox clone to sync files across multiple remote folders.

###Time spent: 7 hrs

###Features 

#####Required

- [X] Client can make GET requests to get file or directory contents
- [X] Client can make HEAD request to get just the GET headers
- [X] Client can make PUT requests to create new directories and files with content
- [X] Client can make POST requests to update the contents of a file
- [X] Client can make DELETE requests to delete files and folders
- [X] Server will serve from --dir or cwd as root
- [X] Client will sync from server over TCP to cwd or CLI dir argument
#####Optional
- [ ] Client and User will be redirected from HTTP to HTTPS
- [X] Server will sync from client over TCP
- [ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits
- [ ] Client can stream and scrub video files (e.g., on iOS)
- [ ] Client can download a directory as an archive
- [ ] Client can create a directory with an archive
- [ ] User can connect to the server using an FTP client
- [X] Watch the directory on both server and client using `chokidar` to sync server and client sides

##### Walkthrough
Attached in repo workspace


##Instructions to run
- `git clone https://github.com/abhagupta/codepath-dropbox`
- `npm install`
###Part 1 Create the HTTP Server which can handle CRUD operations : `GET`, `PUT`, `POST` and `DELETE`
- from root directory run `npm start` . This will start the nodemon server
- from another terminal run 
- Open a terminal shell 1 and `cd tcp-server`
- Open another teminal shell 2 and `cd tcp-client`
- On terminal 1, run `babel-node server.js --dir files`
- On terminal 2, run `babel-node client.js --dir files`

At this point, the server and client will be talking to each other using a TCP connection. 
Any changes in the 'files' folder will be watched by `chokidar` node module. As soon as any change is done in
the files system, `chokidar` event is fired for `add`, `addDir`, `change` , `unlink` , `unlinkDir`. I capture
this event and handle the operation on either side. A utility/handler file `syncHandler.js` is used to share the code
 
## Technology Stack : 
`express`
`json-over-tcp`
`mkdirp`
`chokidar`
`yargs`



