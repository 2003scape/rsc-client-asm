case ServerOpcodes.PRIVACY_SETTINGS:
    this.settingsBlockChat = !!data[1];
    this.settingsBlockPrivate = !!data[2];
    this.settingsBlockTrade = !!data[3];
    this.settingsBlockDuel = !!data[4];
    break;

case ServerOpcodes.GAME_SETTINGS:
    this.optionCameraModeAuto = !!data[1];
    this.optionMouseButtonOne = !!data[2];
    this.optionSoundDisabled = !!data[3];
    break;
