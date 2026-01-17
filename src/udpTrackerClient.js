import dgram from 'dgram';
import crypto from 'crypto';

const PROTOCOL_ID = 0x41727101980n;

function buildConnectRequest(transactionId) {
    const buffer = Buffer.alloc(16);

    buffer.writeBigInt64BE(PROTOCOL_ID, 0); // protocol ID
    buffer.writeUInt32BE(0, 8); // action (0 = connect)
    buffer.writeUInt32BE(transactionId, 12); // transaction ID

    return buffer;
}

function buildANnounceRequest({connectionId, transactionId, infoHash, peerId, left, port}) {
    const buffer = Buffer.alloc(98);

    let offset = 0;

    buffer.writeBigInt64BE(connectionId, offset); // connection ID
    offset += 8;    

    buffer.writeUInt32BE(1, offset); // action (1 = announce)
    offset += 4;    

    buffer.writeUInt32BE(transactionId, offset); // transaction ID
    offset += 4;    

    infoHash.copy(buffer, offset); // info hash
    offset += 20;    

    Buffer.from(peerId).copy(buffer, offset); // peer ID
    offset += 20;    


    buffer.writeBigUInt64BE(0n, offset); offset += 8;    // downloaded
    buffer.writeBigUInt64BE(BigInt(left), offset); offset += 8;    // left
    buffer.writeBigUInt64BE(0n, offset); offset += 8;    // uploaded


    buffer.writeUInt32BE(0, offset); offset += 4;    // event
    buffer.writeUInt32BE(0, offset); offset += 4;    // IP address (0 = default)
    buffer.writeUInt32BE(crypto.randomBytes(4).readUInt32BE(0), offset); offset += 4;    // key
    buffer.writeInt32BE(-1, offset); offset += 4;    // num_want (-1 = default)
    buffer.writeUInt16BE(port, offset);   // port

    return buffer;
}


export async function announceUDP(trackerUrl, infoHash, peerId, left, port = 6881) {
    const url = new URL(trackerUrl);
    const hostname = url.hostname;
    const trackerPort = url.port ? Number(url.port) : 6969;

    const socket = dgram.createSocket("udp4");

    const transactionId = crypto.randomBytes(4).readUInt32BE(0);
    const connectReq = buildConnectRequest(transactionId);

    console.log("UDP tracker host:", hostname);
    console.log("UDP tracker port:", trackerPort);


    return new Promise((resolve, reject) => {
        socket.send(connectReq, trackerPort, hostname);

        socket.once("message", msg => {
            const action = msg.readUInt32BE(0);
            const recvTransactionId = msg.readUInt32BE(4);

            if (action !== 0 || recvTransactionId !== transactionId) {
                socket.close();
                return reject(new Error("Invalid connect response"));
            }

            const connectionId = msg.readBigInt64BE(8);

            const announceTid = crypto.randomBytes(4).readUInt32BE(0);
            const announceReq = buildAnnounceRequest({
                connectionId,
                transactionId: announceTid,
                infoHash,
                peerId,
                left,
                port
            });

            socket.send(announceReq, trackerPort, hostname);

            socket.once("message", res => {
                socket.close();
                resolve(res);
            });
        });

        socket.on("error", reject);
    });
}
