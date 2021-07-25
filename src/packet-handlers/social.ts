case ServerOpcodes.FRIEND_LIST:
    this.friendListCount = getUnsignedByte(data[1]);

    for (let i = 0; i < this.friendListCount; i++) {
        this.friendListHashes[i] = getUnsignedLong(data, 2 + i * 9);

        this.friendListOnline[i] = getUnsignedByte(
            data[10 + i * 9]
        );
    }

    this.sortFriendsList();
    break;

case ServerOpcodes.FRIEND_STATUS_CHANGE: {
    const encodedUsername = getUnsignedLong(data, 1);
    const world = data[9] & 0xff;

    for (let i = 0; i < this.friendListCount; i++) {
        if (this.friendListHashes[i] == encodedUsername) {
            if (this.friendListOnline[i] == 0 && world != 0) {
                this.showServerMessage(
                    `@pri@${decodeUsername(encodedUsername)} ` +
                        'has logged in'
                );
            }

            if (this.friendListOnline[i] != 0 && world == 0) {
                this.showServerMessage(
                    `@pri@${decodeUsername(encodedUsername)} ` +
                        'has logged out'
                );
            }

            this.friendListOnline[i] = world;
            this.sortFriendsList();

            return;
        }
    }

    this.friendListHashes[this.friendListCount] = encodedUsername;
    this.friendListOnline[this.friendListCount] = world;
    this.friendListCount++;

    this.sortFriendsList();
    break;
}

case ServerOpcodes.FRIEND_MESSAGE: {
    const from = getUnsignedLong(data, 1);
    const token = getUnsignedInt(data, 9);

    for (let i = 0; i < GameConnection.maxSocialListSize; i++) {
        if (this.messageTokens[i] == token) {
            return;
        }
    }

    this.messageTokens[this.messageIndex] = token;

    this.messageIndex =
        (this.messageIndex + 1) % GameConnection.maxSocialListSize;

    let message = ChatMessage.decode(data, 13, size - 13);

    /*if (this.options.wordFilter) {
        message = WordFilter.filter(message);
    }*/

    this.showServerMessage(
        `@pri@${decodeUsername(from)}: tells you ${message}`
    );

    break;
}

case ServerOpcodes.IGNORE_LIST:
    this.ignoreListCount = getUnsignedByte(data[1]);

    for (let i = 0; i < this.ignoreListCount; i++) {
        this.ignoreList[i] = getUnsignedLong(data, 2 + i * 8);
    }

    break;
