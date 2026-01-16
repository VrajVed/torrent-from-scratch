import fs from "fs";
import crypto from "crypto";
import bencode from "bencode";

// Function to just load the torrent file and then decode the torrent file

export function loadTorrent(torrentPath) {
    const buffer = fs.readFileSync(torrentPath);
    const decoded = bencode.decode(buffer);

    return { buffer, decoded };
}

// Function to compute the infohash of the torrent file 


export function computeInfoHash(torrentPath) {
    const torrent = fs.readFileSync(torrentPath);
    
    const infoKey = Buffer.from("4:info");
    const infoStart = torrent.indexOf(infoKey);

    if (infoStart === -1) {
        throw new Error("Info Dictionary not found");
    }

    // Start of the dictionary will be 4:info ka index + length of "4:info"

    const dictStart = infoStart + infoKey.length;

    let depth = 0;
    let end = dictStart;

    // Byte parsing of dictionary 

    for (; end < torrent.length; end++) {
        const byte = torrent[end];

        if (byte === 0x64) {
            depth++;
        }
        else if (byte === 0x65) {
            depth--;
           
            if (depth === 0) {
                end++;
                break;
            }
        }
    }

    const infoBytes = torrent.slice(dictStart, end);
    
    return crypto.createHash("sha1").update(infoBytes).digest(); // for buffer

}

export function getTotalSize(info) {
    if (info.length) {
        return info.length;
    }

    return info.files.reduce((sum, file) => sum + file.length, 0);
}