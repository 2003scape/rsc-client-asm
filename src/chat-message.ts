const C_A = 'a'.charCodeAt(0);
const C_AT = '@'.charCodeAt(0);
const C_DOT = '.'.charCodeAt(0);
const C_EXCLAIM = '!'.charCodeAt(0);
const C_PERCENT = '%'.charCodeAt(0);
const C_SPACE = ' '.charCodeAt(0);
const C_Z = 'z'.charCodeAt(0);

const CHAR_MAP =
    ' etaoihnsrdlumwcyfgpbvkxjqz0123456789!?.,:;()-&*\\""@#+=\243$%"[]';

function fromCharArray(a: Uint16Array): string {
    // docs say this should be u16 :shrug:
    const codes = new Array<i32>(a.length);

    for (let i = 0; i < a.length; i += 1) {
        codes[i] = a[i];
    }

    return String.fromCharCodes(codes);
}

export default class ChatMessage {
    static encodedBuffer: Int8Array = new Int8Array(100);
    static decodedBuffer: Uint16Array = new Uint16Array(100);
    static characterMap: Uint16Array = new Uint16Array(CHAR_MAP.length);

    static decode(buffer: Int8Array, offset: i32, length: i32): string {
        let newLength = 0;
        let leftShift = -1;

        for (let i = 0; i < length; i++) {
            const current = buffer[offset++] & 0xff;
            let index = (current >> 4) & 0xf;

            if (leftShift == -1) {
                if (index < 13) {
                    ChatMessage.decodedBuffer[newLength++] =
                        ChatMessage.characterMap[index];
                } else {
                    leftShift = index;
                }
            } else {
                ChatMessage.decodedBuffer[newLength++] =
                    ChatMessage.characterMap[(leftShift << 4) + index - 195];

                leftShift = -1;
            }

            index = current & 0xf;

            if (leftShift == -1) {
                if (index < 13) {
                    ChatMessage.decodedBuffer[newLength++] =
                        ChatMessage.characterMap[index];
                } else {
                    leftShift = index;
                }
            } else {
                ChatMessage.decodedBuffer[newLength++] =
                    ChatMessage.characterMap[(leftShift << 4) + index - 195];

                leftShift = -1;
            }
        }

        let flag = true;

        for (let i = 0; i < newLength; i++) {
            const currentChar = ChatMessage.decodedBuffer[i] as i32;

            if (i > 4 && currentChar == C_AT) {
                ChatMessage.decodedBuffer[i] = C_SPACE;
            }

            if (currentChar == C_PERCENT) {
                ChatMessage.decodedBuffer[i] = C_SPACE;
            }

            if (flag && currentChar >= C_A && currentChar <= C_Z) {
                ChatMessage.decodedBuffer[i] += 65504;
                flag = false;
            }

            if (currentChar == C_DOT || currentChar == C_EXCLAIM) {
                flag = true;
            }
        }

        return fromCharArray(ChatMessage.decodedBuffer.slice(0, newLength));
    }

    static encode(message: string): i32 {
        if (message.length > 80) {
            message = message.slice(0, 80);
        }

        message = message.toLowerCase();

        let offset = 0;
        let leftShift = -1;

        for (let i = 0; i < message.length; i++) {
            const currentChar = message.charCodeAt(i);
            let index = 0;

            for (let j = 0; j < ChatMessage.characterMap.length; j++) {
                if (currentChar == ChatMessage.characterMap[j]) {
                    index = j;
                    break;
                }
            }

            if (index > 12) {
                index += 195;
            }

            if (leftShift == -1) {
                if (index < 13) {
                    leftShift = index;
                } else {
                    ChatMessage.encodedBuffer[offset++] = index & 0xff;
                }
            } else if (index < 13) {
                ChatMessage.encodedBuffer[offset++] =
                    ((leftShift << 4) + index) & 0xff;

                leftShift = -1;
            } else {
                ChatMessage.encodedBuffer[offset++] =
                    ((leftShift << 4) + (index >> 4)) & 0xff;

                leftShift = index & 0xf;
            }
        }

        if (leftShift != -1) {
            ChatMessage.encodedBuffer[offset++] = (leftShift << 4) & 0xff;
        }

        return offset;
    }
}

for (let i = 0; i < CHAR_MAP.length; i += 1) {
    ChatMessage.characterMap[i] = CHAR_MAP.charCodeAt(i);
}
