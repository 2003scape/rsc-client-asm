combatStyle: i32;

drawDialogCombatStyle(): void {
    const GREY = 0xbebebe;

    const BUTTON_HEIGHT = 20;
    const WIDTH = 175;

    const COMBAT_STYLES = [
        'Controlled (+1 of each)',
        'Aggressive (+3 strength)',
        'Accurate (+3 attack)',
        'Defensive (+3 defense)'
    ];

    const HEIGHT = BUTTON_HEIGHT * (COMBAT_STYLES.length + 1);

    let uiX = 7;
    let uiY = 15;

    if (this.options.mobile) {
        uiX = 48;
        uiY = (this.gameHeight / 2 - HEIGHT / 2) as i32;
    }

    if (this.mouseButtonClick != 0) {
        for (let i = 0; i < COMBAT_STYLES.length + 1; i++) {
            if (
                i <= 0 ||
                this.mouseX <= uiX ||
                this.mouseX >= uiX + WIDTH ||
                this.mouseY <= uiY + i * BUTTON_HEIGHT ||
                this.mouseY >= uiY + i * BUTTON_HEIGHT + BUTTON_HEIGHT
            ) {
                continue;
            }

            this.combatStyle = i - 1;
            this.mouseButtonClick = 0;

            this.packetStream!.newPacket(ClientOpcodes.COMBAT_STYLE);
            this.packetStream!.putByte(this.combatStyle);
            this.packetStream!.sendPacket();
            break;
        }
    }

    for (let i = 0; i < COMBAT_STYLES.length + 1; i++) {
        const boxColour = i == this.combatStyle + 1 ? Colours.Red : GREY;

        this.surface!.drawBoxAlpha(
            uiX,
            uiY + i * BUTTON_HEIGHT,
            WIDTH,
            BUTTON_HEIGHT,
            boxColour,
            128
        );

        this.surface!.drawLineHoriz(
            uiX,
            uiY + i * BUTTON_HEIGHT,
            WIDTH,
            Colours.Black
        );

        this.surface!.drawLineHoriz(
            uiX,
            uiY + i * BUTTON_HEIGHT + BUTTON_HEIGHT,
            WIDTH,
            Colours.Black
        );
    }

    let y = 16;

    this.surface!.drawStringCenter(
        'Select combat style',
        uiX + ((WIDTH / 2) as i32),
        uiY + y,
        3,
        Colours.White
    );

    y += BUTTON_HEIGHT;

    for (let i = 0; i < COMBAT_STYLES.length; i += 1) {
        const combatStyle = COMBAT_STYLES[i];

        this.surface!.drawStringCenter(
            combatStyle,
            uiX + ((WIDTH / 2) as i32),
            uiY + y,
            3,
            Colours.Black
        );

        y += BUTTON_HEIGHT;
    }
}
