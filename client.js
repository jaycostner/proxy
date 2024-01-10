#!/usr/bin/env node

const dgram = require('dgram');

// UniFi Discovery Information
const PORT = 10001;
const HOST = '255.255.255.255';
const MCAST_ADDR = '233.89.188.1';
const MESSAGE = Buffer.from([1, 0, 0, 0]);

function createUDPSocket() {
    const socket = dgram.createSocket('udp4');

    socket.on('message', (msg, rinfo) => {
        console.log(`\nMessage received from ${rinfo.address}:${rinfo.port}`);
        console.log(JSON.stringify(msg, null, 2));
        console.log();
    });

    socket.on('listening', () => {
        const addr = socket.address();
        socket.addMembership(MCAST_ADDR);
        socket.setBroadcast(true);

        console.log(`Listening on ${addr.address}:${addr.port}`);

        socket.send(MESSAGE, 0, MESSAGE.length, PORT, HOST, (err) => {
            if (err) {
                console.error('Failed to send discovery request:', err.message);
                process.exit(1);
            }

            console.log('Discovery packet sent');
        });
    });

    socket.bind(null, '0.0.0.0');
}

createUDPSocket();
