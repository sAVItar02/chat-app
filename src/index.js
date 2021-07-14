const path = require("path");
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { generateMessage } = require('./utils/messages')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port  = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log("New connection");

    socket.emit('message', generateMessage('Welcome!'));

    socket.broadcast.emit('message', generateMessage("A new user has joined!"));

    socket.on('sendMessage', (recievedMessage, callback) => {
        io.emit('message', generateMessage(recievedMessage));
        callback();
    })

    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', generateMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage("A user has left!"));
    })

})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

