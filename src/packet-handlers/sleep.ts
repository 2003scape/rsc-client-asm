case ServerOpcodes.SLEEP_OPEN:
    if (!this.isSleeping) {
        this.fatigueSleeping = this.statFatigue;
    }

    this.isSleeping = true;
    this.inputTextCurrent = '';
    this.inputTextFinal = '';
    this.surface!.readSleepWord(this.spriteTexture + 1, data);
    this.sleepingStatusText = null;
    break;

case ServerOpcodes.SLEEP_CLOSE:
    this.isSleeping = false;
    break;

case ServerOpcodes.SLEEP_INCORRECT:
    this.sleepingStatusText = 'Incorrect - Please wait...';
    break;

case ServerOpcodes.PLAYER_STAT_FATIGUE_ASLEEP:
    this.fatigueSleeping = getUnsignedShort(data, 1);
    break;
