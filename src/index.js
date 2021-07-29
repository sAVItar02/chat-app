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

        socket.emit('message', generateMessage('admin', 'Welcome!'));
        socket.broadcast.to(room).emit('message', generateMessage('admin', `${username} has joined!`));
        io.to(user.room).emit('roomData', ({
            room: user.room,
            users: getUsersInRoom(user.room),
        }));

        callback();
    })

    socket.on('sendMessage', (recievedMessage, callback) => {
        const user = getUser(socket.id);
        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, recievedMessage));
            callback();
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        if(user) {
            io.to(user.room).emit('locationMessage', generateMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`));
            callback();
        }
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user) {
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', ({
                room: user.room,
                users: getUsersInRoom(user.room),
            }));
        }

    })

})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

