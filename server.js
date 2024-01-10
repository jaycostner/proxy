const fs = require('fs');
const dgram = require('dgram');

const PORT = 10001;
const MCAST_ADDR = '233.89.188.1';
const REQUEST = Buffer.from([1, 0, 0, 0]);

function getPacketFromFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return Buffer.from(JSON.parse(fileContent));
    } catch (error) {
        console.error('Error reading packet file:', error.message);
        process.exit(1);
    }
}

function createUDPSocket() {
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('message', (msg, rinfo) => {
        console.log(`Received message from ${rinfo.address}:${rinfo.port}`);

        if (!msg.equals(REQUEST)) {
            console.warn('Ignoring non-request packet');
            return;
        }

        socket.send(message, 0, message.length, rinfo.port, rinfo.address, (err) => {
            if (err) {
                console.error('Error sending response packet:', err.message);
                return;
            }
            console.log(`Successfully sent ${message.length} bytes`);
        });
    });

    socket.on('listening', () => {
        const addr = socket.address();
        socket.setBroadcast(true);
        socket.setMulticastLoopback(false);
        socket.addMembership(MCAST_ADDR);
        console.log(`Listening on ${addr.address}:${addr.port}`);
    });

    socket.bind({ port: PORT });

    return socket;
}

const packetFile = process.argv[2];
if (!packetFile) {
    console.error('packet.json file must be specified as the first argument');
    process.exit(1);
}

const message = getPacketFromFile(packetFile);
const socket = createUDPSocket();
