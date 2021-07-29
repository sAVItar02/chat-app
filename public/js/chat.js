const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageInput = document.querySelector("#message");
const $messageSendBtn = document.querySelector("#send");
const $sendLocationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

socket.on('message', (message) => {
    const html = `
    <div class="message">
        <p>
            <span class="message__name">Some name</span>
            <span class="message__meta">${moment(message.createdAt).format('h:mm a')}</span>
        </p>
        <p>${message.text}</p>
    </div>
    `
    $messages.insertAdjacentHTML('beforeend', html);
})

socket.on('locationMessage', (url) => {
    const html = `
    <div class="message">
        <p>
            <span class="message__name">Some name</span>
            <span class="message__meta">${moment(url.createdAt).format('h:mm a')}</span>
        </p>
        <p><a href="${url.text}" target="_blank">Location</a></p>
    </div>
    `
    $messages.insertAdjacentHTML('beforeend', html);
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