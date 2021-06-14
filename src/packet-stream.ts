const PACKET_MAX_LENGTH = 5000;

function toCharArray(s: string): Int8Array {
    const a = new Int8Array(s.length);

    for (let i = 0; i < s.length; i += 1) {
        unchecked((a[i] = s.charCodeAt(i)));
    }

    return a;
}

export default class PacketStream {
    static anIntArray537: Int32Array = new Int32Array(256);
    static anIntArray541: Int32Array = new Int32Array(256);

    closed: bool;
    closing: bool;
    delay: i32;
    length: i32;
    maxReadTries: i32;
    packet8Check: i32 = 8;
    packetData: Int8Array = new Int8Array(PACKET_MAX_LENGTH);
    packetEnd: i32 = 3;
    packetStart: i32;
    readTries: i32;
    socketException: bool;
    socketExceptionMessage: string = '';

    constructor() {}

    hasPacket(): bool {
        return this.packetStart > 0;
    }

    writePacket(i: i32): i32 {
        if (this.socketException) {
            this.packetStart = 0;
            this.packetEnd = 3;
            this.socketException = false;

            return 1;
        }

        this.delay++;

        if (this.delay < i) {
            return 0;
        }

        if (this.packetStart > 0) {
            this.delay = 0;
            this.writeStreamBytes(this.packetData, 0, this.packetStart);
        }

        this.packetStart = 0;
        this.packetEnd = 3;

        return 0;
    }

    sendPacket(): void {
        // what the fuck is this even for? legacy?
        if (this.packet8Check != 8) {
            this.packetEnd++;
        }

        const length = this.packetEnd - this.packetStart - 2;

        if (length >= 160) {
            unchecked(
                (this.packetData[this.packetStart] =
                    (160 + ((length / 256) as i32)) & 0xff)
            );

            unchecked((this.packetData[this.packetStart + 1] = length & 0xff));
        } else {
            unchecked((this.packetData[this.packetStart] = length & 0xff));
            this.packetEnd--;

            unchecked(
                (this.packetData[this.packetStart + 1] = this.packetData[
                    this.packetEnd
                ])
            );
        }

        // this seems largely useless and doesn't appear to do anything
        if (PACKET_MAX_LENGTH <= 10000) {
            let k = unchecked(this.packetData[this.packetStart + 2]) & 0xff;

            unchecked(PacketStream.anIntArray537[k]++);

            unchecked(
                (PacketStream.anIntArray541[k] +=
                    this.packetEnd - this.packetStart)
            );
        }

        this.packetStart = this.packetEnd;
    }

    putBytes(src: Int8Array, offset: i32, length: i32): void {
        for (let i = 0; i < length; i++) {
            unchecked(
                (this.packetData[this.packetEnd++] = src[offset + i] & 0xff)
            );
        }
    }

    putLong(l: i64): void {
        this.putInt((l >> 32) as i32);
        this.putInt((l & -1) as i32);
    }

    newPacket(opcode: i32): i32 {
        if (this.packetStart > (((PACKET_MAX_LENGTH * 4) / 5) as i32)) {
            if (this.writePacket(0) != 0) {
                return 1;
            }
        }

        unchecked((this.packetData[this.packetStart + 2] = opcode & 0xff));
        unchecked((this.packetData[this.packetStart + 3] = 0));
        this.packetEnd = this.packetStart + 3;
        this.packet8Check = 8;

        return 0;
    }

    putShort(i: i32): void {
        unchecked((this.packetData[this.packetEnd++] = (i >> 8) & 0xff));
        unchecked((this.packetData[this.packetEnd++] = i & 0xff));
    }

    putInt(i: i32): void {
        unchecked((this.packetData[this.packetEnd++] = (i >> 24) & 0xff));
        unchecked((this.packetData[this.packetEnd++] = (i >> 16) & 0xff));
        unchecked((this.packetData[this.packetEnd++] = (i >> 8) & 0xff));
        unchecked((this.packetData[this.packetEnd++] = i & 0xff));
    }

    putString(s: string): void {
        this.putBytes(toCharArray(s), 0, s.length);
    }

    putByte(i: i32): void {
        unchecked((this.packetData[this.packetEnd++] = i & 0xff));
    }

    flushPacket(): i32 {
        this.sendPacket();
        return this.writePacket(0);
    }

    writeStreamBytes(buffer: Int8Array, offset: i32, length: i32): void {}
}
