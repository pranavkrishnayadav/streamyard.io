import { createServer } from 'http';
import { resolve } from 'path';
import { spawn } from 'child_process';
import express from 'express';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const options = [
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-tune', 'zeralatency',
    '-r', '25',
    '-g', '50',
    '-keyint_min', '25',
    '-crf', '25',
    '-pix_fmt', 'yuv420p',
    '-sc_threshold', '0',
    '-profile:v', 'main',
    '-level', '3.1',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-ar', '32000',
    '-f', 'flv',
    'rtmp://a.rtmp.youtube.com/live2/your_stream_key'
];

const ffmpegprocess = spawn('ffmpeg', options);

ffmpegprocess.on('error', (err) => {
    console.error('Failed to start ffmpeg:', err);
});

ffmpegprocess.stdout.on('data', (data) => {
    console.log(`ffmpeg stdout: ${data}`);
});

ffmpegprocess.stderr.on('data', (data) => {
    console.log(`ffmpeg stderr: ${data}`);
});

ffmpegprocess.on('close', (code) => {
    console.log(`ffmpeg process exited with code ${code}`);
});

io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);
    socket.on('binarystream', (stream) => {
        console.log('Binary Stream Incoming...');
        ffmpegprocess.stdin.write(stream, (err) => {
            if (err) {
                console.log('Error writing to ffmpeg stdin:', err);
            }
        });
    });
});

// Middleware
app.use(express.static(resolve('./public')));

server.listen(3000, () => console.log('HTTP Server is Running on Port 3000'));
