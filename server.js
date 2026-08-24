const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

const players = {};
let aiEntity = { x: 400, y: 300, dx: 3, dy: 3 };

wss.on('connection', (ws) => {
    const playerId = Math.random().toString(36).substring(2, 9);
    
    players[playerId] = { x: Math.random() * 700 + 50, y: Math.random() * 500 + 50, lastProcessedInput: 0 };

    ws.send(JSON.stringify({ type: 'init', id: playerId }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'input') {
            const player = players[playerId];
            const speed = 5;

            player.x += data.dx * speed;
            player.y += data.dy * speed;
            
            player.x = Math.max(10, Math.min(770, player.x));
            player.y = Math.max(10, Math.min(570, player.y));

            player.lastProcessedInput = data.sequenceNumber; 
        }
    });

    ws.on('close', () => {
        delete players[playerId];
    });
});

const TICK_RATE = 1000 / 60; 
setInterval(() => {
    aiEntity.x += aiEntity.dx;
    aiEntity.y += aiEntity.dy;

    if (aiEntity.x <= 10 || aiEntity.x >= 770) aiEntity.dx *= -1;
    if (aiEntity.y <= 10 || aiEntity.y >= 570) aiEntity.dy *= -1;

    const gameState = JSON.stringify({ type: 'state', players, ai: aiEntity });
    
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gameState);
        }
    });
}, TICK_RATE);

const PORT = process.env.PORT || 3000;
server.listen(PORT);