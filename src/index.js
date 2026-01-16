import crypto from "crypto";
import bencode from "bencode";

import { loadTorrent, computeInfoHash, getTotalSize } from "./torrentMeta.js";
import { announce } from "./trackerClient.js";

// 1. Load torrent
const { decoded } = loadTorrent("test.torrent");

// 2. Decode tracker URL
const trackerUrl = Buffer.from(decoded.announce).toString("utf8");
console.log("Tracker:", trackerUrl);

// 3. Compute infohash (raw bytes)
const infoHash = computeInfoHash("test.torrent");
console.log("Infohash (hex):", infoHash.toString("hex"));

// 4. peer_id (20 bytes)
const peerId =
    "-VC0001-" +
    crypto.randomBytes(12).toString("hex").slice(0, 12);

// 5. Total size
const left = getTotalSize(decoded.info);

// 6. URL-encode info_hash
function urlEncodeBytes(buffer) {
    return [...buffer]
        .map(b => `%${b.toString(16).padStart(2, "0")}`)
        .join("");
}

// 7. Build announce URL
const announceUrl =
    `${trackerUrl}?` +
    `info_hash=${urlEncodeBytes(infoHash)}` +
    `&peer_id=${encodeURIComponent(peerId)}` +
    `&port=6881` +
    `&uploaded=0` +
    `&downloaded=0` +
    `&left=${left}` +
    `&compact=1`;

console.log("\nAnnounce URL:\n", announceUrl);

// 8. Actually send the request
try {
    const response = await announce(trackerUrl, announceUrl);
    console.log("\nRaw tracker response:\n", response);

    const decodedResponse = bencode.decode(response);
    console.log(Buffer.from(decodedResponse["failure reason"]).toString("utf8"))
    console.log("\nDecoded tracker response:\n", decodedResponse);
} catch (err) {
    console.error("Tracker error:", err);
}


