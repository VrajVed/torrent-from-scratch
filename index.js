'use strict';

import fs from 'fs';
import bencode from 'bencode';
import getPeers from './tracker.js';
import torrentParser from './torrent-parser.js';

const torrent = torrentParser.open('puppy.torrent');

// console.log(Array.isArray(torrent.announce)); // true or false 
// Learn more about buffers now because this isn't an array and returns false

const announce = Buffer.from(torrent.announce);
console.log(announce.toString('utf8'));


getPeers(torrent, peers => {
    console.log('list of peers: ', peers);
});