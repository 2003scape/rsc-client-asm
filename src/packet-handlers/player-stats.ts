case ServerOpcodes.PLAYER_STAT_LIST: {
    let offset = 1;

    for (let i = 0; i < this.playerStatCurrent.length; i++) {
        this.playerStatCurrent[i] = getUnsignedByte(data[offset++]);
    }

    for (let i = 0; i < this.playerStatBase.length; i++) {
        this.playerStatBase[i] = getUnsignedByte(data[offset++]);
    }

    for (let i = 0; i < this.playerExperience.length; i++) {
        this.playerExperience[i] = getUnsignedInt(data, offset);
        offset += 4;
    }

    this.playerQuestPoints = getUnsignedByte(data[offset++]);

    break;
}

case ServerOpcodes.PLAYER_STAT_EQUIPMENT_BONUS:
    for (let i = 0; i < this.playerStatEquipment.length; i++) {
        this.playerStatEquipment[i] = getUnsignedByte(data[1 + i]);
    }

    break;

case ServerOpcodes.PLAYER_STAT_EXPERIENCE_UPDATE: {
    const skillIndex = data[1] & 0xff;
    this.playerExperience[skillIndex] = getUnsignedInt(data, 2);
    break;
}

case ServerOpcodes.PLAYER_STAT_UPDATE: {
    let offset = 1;

    const skillIndex = data[offset++] & 0xff;

    this.playerStatCurrent[skillIndex] = getUnsignedByte(
        data[offset++]
    );

    this.playerStatBase[skillIndex] = getUnsignedByte(
        data[offset++]
    );

    this.playerExperience[skillIndex] = getUnsignedInt(
        data,
        offset
    );

    // TODO probably don't need this
    //offset += 4;
    break;
}

case ServerOpcodes.PLAYER_STAT_FATIGUE:
    this.statFatigue = getUnsignedShort(data, 1);
    break;

case ServerOpcodes.PLAYER_QUEST_LIST:
    for (let i = 0; i < this.questComplete.length; i++) {
        this.questComplete[i] = !!data[i + 1];
    }

    break;
