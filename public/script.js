const userVideo = document.getElementById('user-video');
const startButton = document.getElementById('start-btn');

const state = { media: null };

const socket = io();

startButton.addEventListener('click', () => {
    if (state.media) {
        const mediaRecorder = new MediaRecorder(state.media, {
            mimeType: 'video/webm; codecs=vp8',
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000
        });

        mediaRecorder.ondataavailable = ev => {
            if (ev.data.size > 0) {
                console.log('Binary Stream Available', ev.data);
                socket.emit('binarystream', ev.data);
            }
        };

        mediaRecorder.start(1000); // Collect 1-second chunks of data
    } else {
        console.error('Media stream is not available.');
    }
});

window.addEventListener('load', async () => {
    try {
        const media = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: { frameRate: { ideal: 25, max: 25 } } 
        });
        state.media = media;
        userVideo.srcObject = media;
        userVideo.onloadedmetadata = () => {
            userVideo.play();
        };
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }
});
