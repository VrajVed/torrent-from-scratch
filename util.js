'use strict';

import randomBytes from 'crypto';
import { Buffer } from 'buffer';

let id = null;

const genId = () => {
    if (!id) {
        id = randomBytes(20);
        Buffer.from('-AT0001-').copy(id, 0);
    }
    return id;
};

export default genId