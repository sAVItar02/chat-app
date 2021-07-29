const path = require("path");
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const { generateMessage } = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port  = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log("New connection");

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room })
        
        if(error) {
            return callback(error);
        }

        socket.join(room)

        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`));

        callback();
    })

    socket.on('sendMessage', (recievedMessage, callback) => {
        io.emit('message', generateMessage(recievedMessage));
        callback();
    })

    socket.on('sendLocation', (location, callback) => {
        io.emit('locationMessage', generateMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
        }

    })

})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

