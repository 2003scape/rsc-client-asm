import ClientOpcodes from './opcodes/client';
import GameShell from './game-shell';
import PacketStream from './packet-stream';
import { encodeUsername, decodeUsername } from './utility';

export default class GameConnection extends GameShell {
    static clientVersion: i32 = 1;
    static maxReadTries: i32 = 0;
    static maxSocialListSize: i32 = 100;

    worldFullTimeout: i32;
    moderatorLevel: i32;
    autoLoginTimeout: i32;
    messageIndex: i32;

    settingsBlockChat: i32;
    settingsBlockPrivate: i32;
    settingsBlockTrade: i32;
    settingsBlockDuel: i32;
    sessionID: i64;

    friendListCount: i32;
    friendListOnline: Int32Array = new Int32Array(200);
    friendListHashes: Int64Array = new Int64Array(200);
    ignoreListCount: i32;
    ignoreList: Int64Array = new Int64Array(200);

    messageTokens: Int32Array = new Int32Array(
        GameConnection.maxSocialListSize
    );

    server: string = '127.0.0.1';
    port: i32 = 43595;

    incomingPacket: Int8Array = new Int8Array(5000);
    packetLastRead: i32;
    packetStream: PacketStream | null;

    constructor() {
        super();
    }

    showServerMessage(_: string): void {}

    sortFriendsList(): void {
        let flag = true;

        while (flag) {
            flag = false;

            for (let i = 0; i < this.friendListCount - 1; i++) {
                if (
                    (unchecked(this.friendListOnline[i]) != 255 &&
                        unchecked(this.friendListOnline[i + 1]) == 255) ||
                    (unchecked(this.friendListOnline[i]) == 0 &&
                        unchecked(this.friendListOnline[i + 1]) != 0)
                ) {
                    const onlineStatus = unchecked(this.friendListOnline[i]);

                    unchecked(
                        (this.friendListOnline[i] = this.friendListOnline[
                            i + 1
                        ])
                    );

                    unchecked((this.friendListOnline[i + 1] = onlineStatus));

                    const encodedUsername = unchecked(this.friendListHashes[i]);

                    unchecked(
                        (this.friendListHashes[i] = this.friendListHashes[
                            i + 1
                        ])
                    );

                    unchecked((this.friendListHashes[i + 1] = encodedUsername));

                    flag = true;
                }
            }
        }
    }

    sendPrivacySettings(
        chat: i32,
        privateChat: i32,
        trade: i32,
        duel: i32
    ): i32 {
        if (this.packetStream!.newPacket(ClientOpcodes.SETTINGS_PRIVACY) != 0) {
            return 1;
        }

        this.packetStream!.putByte(chat);
        this.packetStream!.putByte(privateChat);
        this.packetStream!.putByte(trade);
        this.packetStream!.putByte(duel);
        this.packetStream!.sendPacket();

        return 0;
    }

    ignoreAdd(username: string): i32 {
        const encodedUsername = encodeUsername(username);

        if (this.packetStream!.newPacket(ClientOpcodes.IGNORE_ADD) != 0) {
            return 1;
        }

        this.packetStream!.putLong(encodedUsername);
        this.packetStream!.sendPacket();

        for (let i = 0; i < this.ignoreListCount; i++) {
            if (unchecked(this.ignoreList[i]) == encodedUsername) {
                return 0;
            }
        }

        if (this.ignoreListCount >= GameConnection.maxSocialListSize) {
            return 0;
        }

        unchecked((this.ignoreList[this.ignoreListCount++] = encodedUsername));

        return 0;
    }

    ignoreRemove(encodedUsername: i64): i32 {
        if (this.packetStream!.newPacket(ClientOpcodes.IGNORE_REMOVE) != 0) {
            return 1;
        }

        this.packetStream!.putLong(encodedUsername);
        this.packetStream!.sendPacket();

        for (let i = 0; i < this.ignoreListCount; i++) {
            if (unchecked(this.ignoreList[i]) == encodedUsername) {
                this.ignoreListCount--;

                for (let j = i; j < this.ignoreListCount; j++) {
                    unchecked((this.ignoreList[j] = this.ignoreList[j + 1]));
                }

                return 0;
            }
        }

        return 0;
    }

    friendAdd(username: string): i32 {
        const encodedUsername = encodeUsername(username);

        if (this.packetStream!.newPacket(ClientOpcodes.FRIEND_ADD) != 0) {
            return 1;
        }

        this.packetStream!.putLong(encodedUsername);
        this.packetStream!.sendPacket();

        for (let i = 0; i < this.friendListCount; i++) {
            if (unchecked(this.friendListHashes[i]) == encodedUsername) {
                return 0;
            }
        }

        if (this.friendListCount >= GameConnection.maxSocialListSize) {
            return 0;
        }

        unchecked(
            (this.friendListHashes[this.friendListCount] = encodedUsername)
        );

        unchecked((this.friendListOnline[this.friendListCount] = 0));

        this.friendListCount++;

        return 0;
    }

    friendRemove(encodedUsername: i64): i32 {
        if (this.packetStream!.newPacket(ClientOpcodes.FRIEND_REMOVE) != 0) {
            return 1;
        }

        this.packetStream!.putLong(encodedUsername);
        this.packetStream!.sendPacket();

        for (let i = 0; i < this.friendListCount; i++) {
            if (unchecked(this.friendListHashes[i]) != encodedUsername) {
                continue;
            }

            this.friendListCount--;

            for (let j = i; j < this.friendListCount; j++) {
                unchecked(
                    (this.friendListHashes[j] = this.friendListHashes[j + 1])
                );

                unchecked(
                    (this.friendListOnline[j] = this.friendListOnline[j + 1])
                );
            }

            break;
        }

        this.showServerMessage(
            `@pri@${decodeUsername(encodedUsername)} has been removed from ` +
                'your friends list'
        );

        return 0;
    }

    sendPrivateMessage(
        encodedUsername: i64,
        message: Int8Array,
        length: i32
    ): i32 {
        if (this.packetStream!.newPacket(ClientOpcodes.PM) != 0) {
            return 1;
        }

        this.packetStream!.putLong(encodedUsername);
        this.packetStream!.putBytes(message, 0, length);
        this.packetStream!.sendPacket();

        return 0;
    }

    sendChatMessage(message: Int8Array, length: i32): i32 {
        if (this.packetStream!.newPacket(ClientOpcodes.CHAT) != 0) {
            return 1;
        }

        this.packetStream!.putBytes(message, 0, length);
        this.packetStream!.sendPacket();

        return 0;
    }

    sendCommandString(command: string): i32 {
        if (this.packetStream!.newPacket(ClientOpcodes.COMMAND) != 0) {
            return 1;
        }

        this.packetStream!.putString(command);
        this.packetStream!.sendPacket();

        return 0;
    }
}
