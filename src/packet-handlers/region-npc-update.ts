case ServerOpcodes.REGION_NPC_UPDATE: {
    const length = getUnsignedShort(data, 1);

    let offset = 3;

    for (let i = 0; i < length; i++) {
        const serverIndex = getUnsignedShort(data, offset);
        offset += 2;

        const npc = this.npcsServer[serverIndex]!;
        const updateType = getUnsignedByte(data[offset++]);

        if (updateType == 1) {
            // chat message
            const targetIndex = getUnsignedShort(data, offset);
            offset += 2;

            const encodedLength = data[offset++];

            if (npc != null) {
                const message = ChatMessage.decode(
                    data,
                    offset,
                    encodedLength
                );

                npc.messageTimeout = 150;
                npc.message = message;

                if (targetIndex == this.localPlayer.serverIndex) {
                    this.showMessage(
                        `@yel@${GameData.npcName[npc.npcId]}: ` +
                            npc.message!,
                        5
                    );
                }
            }

            offset += encodedLength;
        } else if (updateType == 2) {
            // damage
            const damageTaken = getUnsignedByte(data[offset++]);
            const currentHealth = getUnsignedByte(data[offset++]);
            const maxHealth = getUnsignedByte(data[offset++]);

            if (npc != null) {
                npc.damageTaken = damageTaken;
                npc.healthCurrent = currentHealth;
                npc.healthMax = maxHealth;
                npc.combatTimer = 200;
            }
        }
    }

    break;
}
