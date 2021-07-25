case ServerOpcodes.WORLD_INFO:
    this.loadingArea = true;
    this.localPlayerServerIndex = getUnsignedShort(data, 1);
    this.planeWidth = getUnsignedShort(data, 3);
    this.planeHeight = getUnsignedShort(data, 5);
    this.planeIndex = getUnsignedShort(data, 7);
    this.planeMultiplier = getUnsignedShort(data, 9);
    this.planeHeight -= this.planeIndex * this.planeMultiplier;
    break;
