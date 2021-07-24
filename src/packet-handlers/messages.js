case ServerOpcodes.MESSAGE:
    this.showServerMessage(fromCharArray(data.slice(1, size)));
    break;

case ServerOpcodes.SERVER_MESSAGE:
    this.serverMessage = fromCharArray(data.slice(1, size));
    this.showDialogServerMessage = true;
    this.serverMessageBoxTop = false;
    break;

case ServerOpcodes.SERVER_MESSAGE_ONTOP:
    this.serverMessage = fromCharArray(data.slice(1, size));
    this.showDialogServerMessage = true;
    this.serverMessageBoxTop = true;
    break;

case ServerOpcodes.WELCOME:
    if (this.welcomScreenAlreadyShown) {
        break;
    }

    this.welcomeLastLoggedInIP = getUnsignedInt(data, 1);
    this.welcomeLastLoggedInDays = getUnsignedShort(data, 5);
    this.welcomeRecoverySetDays = data[7] & 0xff;
    this.welcomeUnreadMessages = getUnsignedShort(data, 8);
    this.showDialogWelcome = true;
    this.welcomScreenAlreadyShown = true;
    this.welcomeLastLoggedInHost = null;
    break;

case ServerOpcodes.SYSTEM_UPDATE:
    this.systemUpdate = getUnsignedShort(data, 1) * 32;
    break;
