const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
const ws = new WebSocket(protocol + window.location.host);
const lagToggle = document.getElementById('lagToggle');

let serverPlayers = {};
let aiEntity = null;
let myId = null;

let localPlayer = { x: 400, y: 300 };
let serverGhost = { x: 400, y: 300 };
let pendingInputs = [];
let inputSequenceNumber = 0;
const speed = 5;

ws.onmessage = (event) => {
    const processMessage = () => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'init') {
            myId = message.id;
        }
        
        if (message.type === 'state') {
            serverPlayers = message.players;
            aiEntity = message.ai;

            if (myId && serverPlayers[myId]) {
                const serverData = serverPlayers[myId];
                
                serverGhost.x = serverData.x;
                serverGhost.y = serverData.y;
                
                localPlayer.x = serverData.x;
                localPlayer.y = serverData.y;

                pendingInputs = pendingInputs.filter((input) => {
                    return input.sequenceNumber > serverData.lastProcessedInput;
                });

                pendingInputs.forEach((input) => {
                    localPlayer.x += input.dx * speed;
                    localPlayer.y += input.dy * speed;
                });
            }
        }
    };

    const lag = lagToggle.checked ? 250 : 0;
    setTimeout(processMessage, lag);
};

const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN || !myId) return;

    let dx = 0;
    let dy = 0;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;

    if (dx !== 0 || dy !== 0) {
        inputSequenceNumber++;
        const input = { type: 'input', dx, dy, sequenceNumber: inputSequenceNumber };
        
        const lag = lagToggle.checked ? 250 : 0;
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(input));
            }
        }, lag);
        
        pendingInputs.push(input);
        
        localPlayer.x += dx * speed;
        localPlayer.y += dy * speed;
        
        localPlayer.x = Math.max(10, Math.min(770, localPlayer.x));
        localPlayer.y = Math.max(10, Math.min(570, localPlayer.y));
    }
}, 1000 / 60);

function drawGrid() {
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    for(let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for(let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    if (aiEntity) {
        ctx.fillStyle = '#a371f7';
        ctx.beginPath();
        ctx.arc(aiEntity.x + 10, aiEntity.y + 10, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    for (const id in serverPlayers) {
        if (id === myId) {
            ctx.strokeStyle = '#8b949e';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.strokeRect(serverGhost.x, serverGhost.y, 20, 20);
            ctx.setLineDash([]);

            ctx.fillStyle = '#3fb950';
            ctx.fillRect(localPlayer.x, localPlayer.y, 20, 20);
        } else {
            const player = serverPlayers[id];
            ctx.fillStyle = '#f85149';
            ctx.fillRect(player.x, player.y, 20, 20);
        }
    }

    requestAnimationFrame(render);
}
render();