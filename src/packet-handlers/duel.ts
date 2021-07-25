case ServerOpcodes.DUEL_OPEN: {
    const playerIndex = getUnsignedShort(data, 1);

    if (this.playerServer[playerIndex]) {
        this.duelOpponentName = this.playerServer[playerIndex]!.name!;
    }

    this.showDialogDuel = true;
    this.duelOfferItemCount = 0;
    this.duelOfferOpponentItemCount = 0;
    this.duelOfferOpponentAccepted = false;
    this.duelOfferAccepted = false;
    this.duelSettingsRetreat = false;
    this.duelSettingsMagic = false;
    this.duelSettingsPrayer = false;
    this.duelSettingsWeapons = false;
    break;
}

case ServerOpcodes.DUEL_CLOSE:
    this.showDialogDuel = false;
    this.showDialogDuelConfirm = false;
    break;

case ServerOpcodes.DUEL_UPDATE: {
    this.duelOfferOpponentItemCount = data[1] & 0xff;

    let offset = 2;

    for (let i = 0; i < this.duelOfferOpponentItemCount; i++) {
        this.duelOfferOpponentItemId[i] = getUnsignedShort(data, offset);
        offset += 2;

        this.duelOfferOpponentItemStack[i] = getUnsignedInt(data, offset);
        offset += 4;
    }

    this.duelOfferOpponentAccepted = false;
    this.duelOfferAccepted = false;
    break;
}

case ServerOpcodes.DUEL_SETTINGS:
    this.duelSettingsRetreat = !!data[1];
    this.duelSettingsMagic = !!data[2];
    this.duelSettingsPrayer = !!data[3];
    this.duelSettingsWeapons = !!data[4];
    this.duelOfferOpponentAccepted = false;
    this.duelOfferAccepted = false;
    break;

case ServerOpcodes.DUEL_OPPONENT_ACCEPTED:
    this.duelOfferOpponentAccepted = !!data[1];
    break;

case ServerOpcodes.DUEL_ACCEPTED:
    this.duelOfferAccepted = !!data[1];
    break;

case ServerOpcodes.DUEL_CONFIRM_OPEN: {
    this.showDialogDuelConfirm = true;
    this.duelAccepted = false;
    this.showDialogDuel = false;

    let offset = 1;

    this.duelOpponentNameHash = getUnsignedLong(data, offset);
    offset += 8;

    this.duelOpponentItemsCount = data[offset++] & 0xff;

    for (let i = 0; i < this.duelOpponentItemsCount; i++) {
        this.duelOpponentItems[i] = getUnsignedShort(data, offset);
        offset += 2;

        this.duelOpponentItemCount[i] = getUnsignedInt(
            data,
            offset
        );

        offset += 4;
    }

    this.duelItemsCount = data[offset++] & 0xff;

    for (let i = 0; i < this.duelItemsCount; i++) {
        this.duelItems[i] = getUnsignedShort(data, offset);
        offset += 2;

        this.duelItemCount[i] = getUnsignedInt(data, offset);
        offset += 4;
    }

    this.duelOptionRetreat = data[offset++] & 0xff;
    this.duelOptionMagic = data[offset++] & 0xff;
    this.duelOptionPrayer = data[offset++] & 0xff;
    this.duelOptionWeapons = data[offset++] & 0xff;
}
