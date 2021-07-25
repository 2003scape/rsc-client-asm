case ServerOpcodes.REGION_PLAYER_UPDATE: {
    const length = getUnsignedShort(data, 1);
    let offset = 3;

    for (let i = 0; i < length; i++) {
        const playerIndex = getUnsignedShort(data, offset);
        offset += 2;

        const player = this.playerServer[playerIndex];
        const updateType = data[offset++];

        if (updateType == 0) {
            // speech bubble with an item in it
            const itemID = getUnsignedShort(data, offset);
            offset += 2;

            if (player) {
                player.bubbleTimeout = 150;
                player.bubbleItem = itemID;
            }
        } else if (updateType == 1) {
            // chat
            const messageLength = data[offset];
            offset++;

            if (player) {
                let message = ChatMessage.decode(
                    data,
                    offset,
                    messageLength
                );

                /*
                if (this.options.wordFilter) {
                    message = WordFilter.filter(message);
                }*/

                let ignored = false;

                for (let i = 0; i < this.ignoreListCount; i++) {
                    if (this.ignoreList[i] == player.hash) {
                        ignored = true;
                        break;
                    }
                }

                if (!ignored) {
                    player.messageTimeout = 150;
                    player.message = message;
                    this.showMessage(`${player.name!}: ${player.message!}`, 2);
                }
            }

            offset += messageLength;
        } else if (updateType == 2) {
            // combat damage and hp
            const damage = getUnsignedByte(data[offset++]);
            const current = getUnsignedByte(data[offset++]);
            const max = getUnsignedByte(data[offset++]);

            if (player) {
                player.damageTaken = damage;
                player.healthCurrent = current;
                player.healthMax = max;
                player.combatTimer = 200;

                if (player == this.localPlayer) {
                    this.playerStatCurrent[3] = current;
                    this.playerStatBase[3] = max;
                    this.showDialogWelcome = false;
                    this.showDialogServerMessage = false;
                }
            }
        } else if (updateType == 3) {
            // new incoming projectile to npc
            const projectileSprite = getUnsignedShort(data, offset);
            offset += 2;

            const npcIndex = getUnsignedShort(data, offset);
            offset += 2;

            if (player) {
                player.incomingProjectileSprite = projectileSprite;
                player.attackingNpcServerIndex = npcIndex;
                player.attackingPlayerServerIndex = -1;
                player.projectileRange = this.projectileMaxRange;
            }
        } else if (updateType == 4) {
            // new incoming projectile from player
            const projectileSprite = getUnsignedShort(data, offset);
            offset += 2;

            const opponentIndex = getUnsignedShort(data, offset);
            offset += 2;

            if (player) {
                player.incomingProjectileSprite = projectileSprite;
                player.attackingPlayerServerIndex = opponentIndex;
                player.attackingNpcServerIndex = -1;
                player.projectileRange = this.projectileMaxRange;
            }
        } else if (updateType == 5) {
            // player appearance update
            if (player) {
                player.serverId = getUnsignedShort(data, offset);
                offset += 2;

                player.hash = getUnsignedLong(data, offset);
                offset += 8;

                player.name = decodeUsername(player.hash);

                const equippedCount = getUnsignedByte(data[offset]);
                offset++;

                for (let j = 0; j < equippedCount; j++) {
                    player.equippedItem[j] = getUnsignedByte(data[offset]);
                    offset++;
                }

                for (let j = equippedCount; j < 12; j++) {
                    player.equippedItem[j] = 0;
                }

                player.colourHair = data[offset++] & 0xff;
                player.colourTop = data[offset++] & 0xff;
                player.colourBottom = data[offset++] & 0xff;
                player.colourSkin = data[offset++] & 0xff;
                player.level = data[offset++] & 0xff;
                player.skullVisible = data[offset++] & 0xff;
            } else {
                offset += 14;

                const unused = getUnsignedByte(data[offset]);
                offset += unused + 1;
            }
        } else if (updateType == 6) {
            // public chat
            const messageLength = data[offset++];

            if (player != null) {
                const message = ChatMessage.decode(
                    data,
                    offset,
                    messageLength
                );

                player.messageTimeout = 150;
                player.message = message;

                if (player == this.localPlayer) {
                    this.showMessage(`${player.name!}: ${player.message!}`, 5);
                }
            }

            offset += messageLength;
        }
    }

    break;
}
