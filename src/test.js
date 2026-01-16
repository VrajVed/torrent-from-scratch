import { computeInfoHash, getTotalSize, loadTorrent } from "./torrentMeta.js";


const { buffer, decoded } = loadTorrent("ubuntu-25.10-desktop-amd64.iso.torrent");
const infoHash = computeInfoHash("ubuntu-25.10-desktop-amd64.iso.torrent");


const announceUrl = Buffer.from(decoded.announce).toString("utf8");

console.log("Infohash (hex):", infoHash.toString("hex"));
console.log("Announce:", announceUrl);
console.log("Total size:", getTotalSize(decoded.info));

console.log("Using tracker:", announceUrl);

