export default class GameBuffer {
    buffer: Int8Array;
    offset: i32;

    constructor(buffer: Int8Array) {
        this.buffer = buffer;
    }

    putByte(i: i32): void {
        unchecked((this.buffer[this.offset++] = i));
    }

    putInt(i: i32): void {
        unchecked((this.buffer[this.offset++] = i >> 24));
        unchecked((this.buffer[this.offset++] = i >> 16));
        unchecked((this.buffer[this.offset++] = i >> 8));
        unchecked((this.buffer[this.offset++] = i));
    }

    putString(s: string): void {
        for (let i = 0; i < s.length; i++) {
            unchecked((this.buffer[this.offset++] = s.charCodeAt(i)));
        }

        unchecked((this.buffer[this.offset++] = 10));
    }

    putBytes(src: Int8Array, offset: i32, length: i32): void {
        for (let i = offset; i < length; i++) {
            unchecked((this.buffer[this.offset++] = src[i]));
        }
    }

    getUnsignedByte(): i32 {
        return unchecked(this.buffer[this.offset++]) & 0xff;
    }

    getUnsignedShort(): i32 {
        this.offset += 2;

        return (
            ((unchecked(this.buffer[this.offset - 2]) & 0xff) << 8) +
            (unchecked(this.buffer[this.offset - 1]) & 0xff)
        );
    }

    getUnsignedInt(): i32 {
        this.offset += 4;

        return (
            ((unchecked(this.buffer[this.offset - 4]) & 0xff) << 24) +
            ((unchecked(this.buffer[this.offset - 3]) & 0xff) << 16) +
            ((unchecked(this.buffer[this.offset - 2]) & 0xff) << 8) +
            (unchecked(this.buffer[this.offset - 1]) & 0xff)
        );
    }

    getBytes(dest: Int8Array, offset: i32, length: i32): void {
        for (let i = offset; i < length; i++) {
            unchecked((dest[offset + i] = this.buffer[this.offset++]));
        }
    }
}
