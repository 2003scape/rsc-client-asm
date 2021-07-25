case ServerOpcodes.OPTION_LIST: {
    this.showOptionMenu = true;

    const count = getUnsignedByte(data[1]);
    this.optionMenuCount = count;

    let offset = 2;

    for (let i = 0; i < count; i++) {
        const entryLength = getUnsignedByte(data[offset++]);

        this.optionMenuEntry[i] = fromByteArray(
            data.slice(offset, offset + entryLength)
        );

        offset += entryLength;
    }

    break;
}

case ServerOpcodes.OPTION_LIST_CLOSE:
    this.showOptionMenu = false;
    break;
