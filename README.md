# Distributed Netcode Engine

![Live Status](https://img.shields.io/badge/Status-Live-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-Node.js%20%7C%20WebSockets%20%7C%20Vanilla%20JS-blue)

**Live Demo:** [Play the Game Here](https://multiplayer-netcode-game.onrender.com)
*(Open in two separate browser windows to see the real-time sync!)*

## Overview
This project is a custom-built, full-stack multiplayer engine designed to handle real-time state synchronization over the web. It demonstrates how to mask network latency using industry-standard techniques typically found in competitive multiplayer games and distributed systems.

## Core Technical Features

* **Authoritative Server:** The backend runs a fixed-timestep loop (60 ticks/second) acting as the absolute source of truth to prevent client manipulation.
* **Client-Side Prediction:** The frontend immediately applies local inputs to the player entity, completely masking network travel time for a responsive user experience.
* **Server Reconciliation:** The client maintains a history of unacknowledged inputs and smoothly corrects its local state when authoritative updates arrive from the server, preventing "rubber-banding".
* **Latency Simulation:** Includes a custom UI toggle to artificially inject a 250ms delay, visually proving the effectiveness of the prediction and reconciliation algorithms (demonstrated via the "Server Ghost").
* **AI Synchronization:** A server-driven AI entity runs on the fixed loop and synchronizes flawlessly across all connected clients.

## Tech Stack
* **Backend:** Node.js, Express, `ws` (WebSockets)
* **Frontend:** Vanilla JavaScript, HTML5 Canvas
* **Deployment:** Render

## How to Run Locally

1. Clone the repository: `git clone https://github.com/your-username/multiplayer-netcode-game-.git`
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. Navigate to `http://localhost:3000` in your browser.
