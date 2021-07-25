case ServerOpcodes.TRADE_OPEN: {
    const playerIndex = getUnsignedShort(data, 1);

    if (this.playerServer[playerIndex]) {
        this.tradeRecipientName = this.playerServer[playerIndex]!.name!;
    }

    this.showDialogTrade = true;
    this.tradeRecipientAccepted = false;
    this.tradeAccepted = false;
    this.tradeItemsCount = 0;
    this.tradeRecipientItemsCount = 0;
    break;
}

case ServerOpcodes.TRADE_CLOSE:
    this.showDialogTrade = false;
    this.showDialogTradeConfirm = false;
    break;

case ServerOpcodes.TRADE_ITEMS: {
    this.tradeRecipientItemsCount = data[1] & 0xff;

    let offset = 2;

    for (let i = 0; i < this.tradeRecipientItemsCount; i++) {
        this.tradeRecipientItems[i] = getUnsignedShort(data, offset);
        offset += 2;

        this.tradeRecipientItemCount[i] = getUnsignedInt(data, offset);
        offset += 4;
    }

    this.tradeRecipientAccepted = false;
    this.tradeAccepted = false;
    break;
}

case ServerOpcodes.TRADE_RECIPIENT_STATUS:
    this.tradeRecipientAccepted = !!data[1];
    break;

case ServerOpcodes.TRADE_STATUS:
    this.tradeAccepted = !!data[1];
    break;

case ServerOpcodes.TRADE_CONFIRM_OPEN: {
    this.showDialogTradeConfirm = true;
    this.tradeConfirmAccepted = false;
    this.showDialogTrade = false;

    let offset = 1;

    this.tradeRecipientConfirmHash = getUnsignedLong(data, offset);
    offset += 8;

    this.tradeRecipientConfirmItemsCount = data[offset++] & 0xff;

    for (let i = 0; i < this.tradeRecipientConfirmItemsCount; i++) {
        this.tradeRecipientConfirmItems[i] = getUnsignedShort(data, offset);
        offset += 2;

        this.tradeRecipientConfirmItemCount[i] = getUnsignedInt(data, offset);
        offset += 4;
    }

    this.tradeConfirmItemsCount = data[offset++] & 0xff;

    for (let i = 0; i < this.tradeConfirmItemsCount; i++) {
        this.tradeConfirmItems[i] = getUnsignedShort(data, offset);
        offset += 2;

        this.tradeConfirmItemCount[i] = getUnsignedInt(data, offset);
        offset += 4;
    }

    break;
}
