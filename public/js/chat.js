const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = document.querySelector("#message");
const $messageSendBtn = document.querySelector("#send");
const $sendLocationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible Height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    const html = `
    <div class="message">
        <p>
            <span class="message__name">${message.username}</span>
            <span class="message__meta">${moment(message.createdAt).format('h:mm a')}</span>
        </p>
        <p>${message.text}</p>
    </div>
    `
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', (url) => {
    const html = `
    <div class="message">
        <p>
            <span class="message__name">${url.username}</span>
            <span class="message__meta">${moment(url.createdAt).format('h:mm a')}</span>
        </p>
        <p><a href="${url.text}" target="_blank">Location</a></p>
    </div>
    `
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({room, users}) => {
    let html = `
        <h3 class="room-title">${room}</h3>
        <h2 class="list-title">Users</h2>
        <ul class="users">
    `
    users.forEach(user => {
        html += `
            <li>${user.username}</li>
        `
    });

    html += `
        </ul>
    `

    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageSendBtn.setAttribute('disabled', 'disabled');
    let message = $messageInput.value;

    socket.emit('sendMessage', message, (error) => {
        $messageSendBtn.removeAttribute('disabled');
        $messageInput.value = '';
        $messageInput.focus();
    });
})

$sendLocationBtn.addEventListener('click', (e) => {
    e.preventDefault();
    $sendLocationBtn.setAttribute('disabled', 'disabled');

    if(!navigator.geolocation) {
        return alert("Geo Location is not supported by your browser");
    } 

    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        socket.emit('sendLocation', {latitude, longitude}, () => {
            console.log("Location Shared");
            $sendLocationBtn.removeAttribute('disabled');
        });
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
})