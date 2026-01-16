import http from 'http';
import https from 'https';

// Decide client to use

function getClient (url) {
    return url.startsWith('https') ? https : http;
}

export function announce(trackerUrl, announceUrl){

    const client = getClient(trackerUrl);

    return new Promise((resolve, reject) => {
        client.get(announceUrl, res => {
            const chunks = [];

            res.on('data', data => {
                chunks.push(data);
            });

            res.on('end', () => {
                const response = Buffer.concat(chunks);
                resolve(response);
            });
        }).on('error', err => {
            reject(err);
        });
    });
}