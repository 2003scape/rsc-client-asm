const BITMASK: StaticArray<i32> = [
    0,
    1,
    3,
    7,
    15,
    31,
    63,
    127,
    255,
    511,
    1023,
    2047,
    4095,
    8191,
    16383,
    32767,
    65535,
    0x1ffff,
    0x3ffff,
    0x7ffff,
    0xfffff,
    0x1fffff,
    0x3fffff,
    0x7fffff,
    0xffffff,
    0x1ffffff,
    0x3ffffff,
    0x7ffffff,
    0xfffffff,
    0x1fffffff,
    0x3fffffff,
    0x7fffffff,
    -1
];

const C_0 = '0'.charCodeAt(0);
const C_9 = '9'.charCodeAt(0);
const C_A = 'a'.charCodeAt(0);
const C_BIG_A = 'A'.charCodeAt(0);
const C_BIG_Z = 'Z'.charCodeAt(0);
const C_Z = 'z'.charCodeAt(0);

//@inline
export function getUnsignedByte(i: i8): i32 {
    return i & 0xff;
}

//@inline
export function getUnsignedShort(buffer: Int8Array, offset: i32): i32 {
    return (
        ((unchecked(buffer[offset]) & 0xff) << 8) +
        (unchecked(buffer[offset + 1]) & 0xff)
    );
}

export function getUnsignedInt(buffer: Int8Array, offset: i32): i32 {
    return (
        ((unchecked(buffer[offset]) & 0xff) << 24) +
        ((unchecked(buffer[offset + 1]) & 0xff) << 16) +
        ((unchecked(buffer[offset + 2]) & 0xff) << 8) +
        (unchecked(buffer[offset + 3]) & 0xff)
    );
}

export function getUnsignedLong(buffer: Int8Array, offset: i32): i64 {
    return (
        ((getUnsignedInt(buffer, offset) as i64 & 0xffffffff) << 32) +
        (getUnsignedInt(buffer, offset + 4) as i64 & 0xffffffff)
    );
}

export function getSignedShort(buffer: Int8Array, offset: i32): i32 {
    let i = (getUnsignedByte(unchecked(buffer[offset])) * 256 +
        getUnsignedByte(unchecked(buffer[offset + 1]))) as i32;

    if (i > 32767) {
        i -= 0x10000;
    }

    return i;
}

export function getStackInt(buffer: Int8Array, offset: i32): i32 {
    if ((unchecked(buffer[offset]) & 0xff) < 128) {
        return unchecked(buffer[offset]);
    } else {
        return (
            (((unchecked(buffer[offset]) & 0xff) - 128) << 24) +
            ((unchecked(buffer[offset + 1]) & 0xff) << 16) +
            ((unchecked(buffer[offset + 2]) & 0xff) << 8) +
            (unchecked(buffer[offset + 3]) & 0xff)
        );
    }
}

export function getBitMask(buffer: Int8Array, start: i32, length: i32): i32 {
    let byteOffset = start >> 3;
    let bitOffset = 8 - (start & 7);
    let bits = 0;

    for (; length > bitOffset; bitOffset = 8) {
        bits +=
            (unchecked(buffer[byteOffset++]) & unchecked(BITMASK[bitOffset])) <<
            (length - bitOffset);

        length -= bitOffset;
    }

    if (length == bitOffset) {
        bits += unchecked(buffer[byteOffset]) & unchecked(BITMASK[bitOffset]);
    } else {
        bits +=
            ((unchecked(buffer[byteOffset]) as i32) >> (bitOffset - length)) &
            unchecked(BITMASK[length]);
    }

    return bits;
}

export function formatAuthString(raw: string, maxLength: i32): string {
    let formatted = '';

    for (let i = 0; i < maxLength; i++) {
        if (i >= raw.length) {
            formatted = formatted + ' ';
        } else {
            let charCode = raw.charCodeAt(i);

            if (charCode >= C_A && charCode <= C_Z) {
                formatted = formatted + String.fromCharCode(charCode);
            } else if (charCode >= C_BIG_A && charCode <= C_BIG_Z) {
                formatted = formatted + String.fromCharCode(charCode);
            } else if (charCode >= C_0 && charCode <= C_9) {
                formatted = formatted + String.fromCharCode(charCode);
            } else {
                formatted = formatted + '_';
            }
        }
    }

    return formatted;
}

export function ipToString(ip: i32): string {
    return (
        ((ip >> 24) & 0xff).toString() +
        '.' +
        ((ip >> 16) & 0xff).toString() +
        '.' +
        ((ip >> 8) & 0xff).toString() +
        '.' +
        (ip & 0xff).toString()
    );
}

export function encodeUsername(username: string): i64 {
    let cleaned = '';

    for (let i = 0; i < username.length; i++) {
        let charCode = username.charCodeAt(i);

        if (charCode >= C_A && charCode <= C_Z) {
            cleaned = cleaned + String.fromCharCode(charCode);
        } else if (charCode >= C_BIG_A && charCode <= C_BIG_Z) {
            cleaned = cleaned + String.fromCharCode(charCode + 97 - 65);
        } else if (charCode >= C_0 && charCode <= C_9) {
            cleaned = cleaned + String.fromCharCode(charCode);
        } else {
            cleaned = cleaned + ' ';
        }
    }

    cleaned = cleaned.trim();

    if (cleaned.length > 12) {
        cleaned = cleaned.slice(0, 12);
    }

    let hash: i64 = 0;

    for (let i = 0; i < cleaned.length; i++) {
        let charCode = cleaned.charCodeAt(i);

        hash *= 37;

        if (charCode >= C_A && charCode <= C_Z) {
            hash += 1 + charCode - 97;
        } else if (charCode >= C_0 && charCode <= C_9) {
            hash += 27 + charCode - 48;
        }
    }

    return hash;
}

export function decodeUsername(hash: i64): string {
    if (hash < 0) {
        return 'invalidName';
    }

    let username = '';

    while (hash != 0) {
        let charCode = (hash % 37) as i32;
        hash /= 37;

        if (charCode == 0) {
            username = ' ' + username;
        } else if (charCode < 27) {
            if (hash % 37 == 0) {
                username = String.fromCharCode(charCode + 65 - 1) + username;
            } else {
                username = String.fromCharCode(charCode + 97 - 1) + username;
            }
        } else {
            username = String.fromCharCode(charCode + 48 - 27) + username;
        }
    }

    return username;
}

export function getDataFileOffset(fileName: string, buffer: Int8Array): i32 {
    const numEntries = getUnsignedShort(buffer, 0);
    let wantedHash = 0;

    fileName = fileName.toUpperCase();

    for (let i = 0; i < fileName.length; i++) {
        wantedHash = wantedHash * 61 + fileName.charCodeAt(i) - 32;
    }

    let offset = 2 + numEntries * 10;

    for (let entry = 0; entry < numEntries; entry++) {
        const fileHash: i32 =
            (unchecked(buffer[entry * 10 + 2]) & 0xff) * 0x1000000 +
            (unchecked(buffer[entry * 10 + 3]) & 0xff) * 0x10000 +
            (unchecked(buffer[entry * 10 + 4]) & 0xff) * 256 +
            (unchecked(buffer[entry * 10 + 5]) & 0xff);

        const fileSize: i32 =
            (unchecked(buffer[entry * 10 + 9]) & 0xff) * 0x10000 +
            (unchecked(buffer[entry * 10 + 10]) & 0xff) * 256 +
            (unchecked(buffer[entry * 10 + 11]) & 0xff);

        if (fileHash == wantedHash) {
            return offset;
        }

        offset += fileSize;
    }

    return 0;
}

export function getDataFileLength(fileName: string, buffer: Int8Array): i32 {
    const numEntries = getUnsignedShort(buffer, 0);
    let wantedHash = 0;

    fileName = fileName.toUpperCase();

    for (let i = 0; i < fileName.length; i++) {
        wantedHash = wantedHash * 61 + fileName.charCodeAt(i) - 32;
    }

    for (let i = 0; i < numEntries; i++) {
        let fileHash: i32 =
            (unchecked(buffer[i * 10 + 2]) & 0xff) * 0x1000000 +
            (unchecked(buffer[i * 10 + 3]) & 0xff) * 0x10000 +
            (unchecked(buffer[i * 10 + 4]) & 0xff) * 256 +
            (unchecked(buffer[i * 10 + 5]) & 0xff);

        let fileSize: i32 =
            (unchecked(buffer[i * 10 + 6]) & 0xff) * 0x10000 +
            (unchecked(buffer[i * 10 + 7]) & 0xff) * 256 +
            (unchecked(buffer[i * 10 + 8]) & 0xff);

        if (fileHash == wantedHash) {
            return fileSize;
        }
    }

    return 0;
}

export function unpackData(
    fileName: string,
    extraSize: i32,
    archiveData: Int8Array,
    fileData: Int8Array | null
): Int8Array | null {
    const numEntries: i32 =
        (unchecked(archiveData[0]) & 0xff) * 256 +
        (unchecked(archiveData[1]) & 0xff);

    let wantedHash = 0;

    fileName = fileName.toUpperCase();

    for (let i = 0; i < fileName.length; i++) {
        wantedHash = ((wantedHash * 61) as i32) + fileName.charCodeAt(i) - 32;
    }

    let offset = 2 + numEntries * 10;

    for (let i = 0; i < numEntries; i++) {
        const fileHash: i32 =
            (unchecked(archiveData[i * 10 + 2]) & 0xff) * 0x1000000 +
            (unchecked(archiveData[i * 10 + 3]) & 0xff) * 0x10000 +
            (unchecked(archiveData[i * 10 + 4]) & 0xff) * 256 +
            (unchecked(archiveData[i * 10 + 5]) & 0xff);

        const fileSize: i32 =
            (unchecked(archiveData[i * 10 + 6]) & 0xff) * 0x10000 +
            (unchecked(archiveData[i * 10 + 7]) & 0xff) * 256 +
            (unchecked(archiveData[i * 10 + 8]) & 0xff);

        const fileSizeCompressed: i32 =
            (unchecked(archiveData[i * 10 + 9]) & 0xff) * 0x10000 +
            (unchecked(archiveData[i * 10 + 10]) & 0xff) * 256 +
            (unchecked(archiveData[i * 10 + 11]) & 0xff);

        if (fileHash == wantedHash) {
            if (!fileData) {
                fileData = new Int8Array(fileSize + extraSize);
            }

            if (fileSize != fileSizeCompressed) {
                /*BZLib.decompress(
                    fileData,
                    fileSize,
                    archiveData,
                    fileSizeCompressed,
                    offset
                );*/
            } else {
                for (let j = 0; j < fileSize; j++) {
                    unchecked((fileData[j] = archiveData[offset + j]));
                }
            }

            return fileData;
        }

        offset += fileSizeCompressed;
    }

    return null;
}

export function loadData(
    fileName: string,
    extraSize: i32,
    archiveData: Int8Array | null
): Int8Array | null {
    if (!archiveData) {
        return null;
    }

    return unpackData(fileName, extraSize, archiveData, null);
}

export function formatConfirmAmount(amount: i32): string {
    let formatted = amount.toString();

    for (let i = formatted.length - 3; i > 0; i -= 3) {
        formatted = formatted.slice(0, i) + ',' + formatted.slice(i);
    }

    if (formatted.length > 8) {
        formatted =
            `@gre@${formatted.slice(0, formatted.length - 8)}` +
            ` million @whi@(${formatted})`;
    } else if (formatted.length > 4) {
        formatted =
            `@cya@${formatted.slice(0, formatted.length - 4)}` +
            `K @whi@(${formatted})`;
    }

    return formatted;
}
