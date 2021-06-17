panelAppearance: Panel | null;

controlButtonAppearanceHeadLeft: i32;
controlButtonAppearanceHeadRight: i32;
controlButtonAppearanceHairLeft: i32;
controlButtonAppearanceHairRight: i32;
controlButtonAppearanceGenderLeft: i32;
controlButtonAppearanceGenderRight: i32;
controlButtonAppearanceTopLeft: i32;
controlButtonAppearanceTopRight: i32;
controlButtonAppearanceSkinLeft: i32;
controlButtonAppearanceSkinRight: i32;
controlButtonAppearanceBottomLeft: i32;
controlButtonAppearanceBottomRight: i32;
controlButtonAppearanceAccept: i32;

drawAppearanceOption(
    panel: Panel,
    type: string,
    x: i32,
    y: i32
): Int32Array {
    // size of the -> sprite
    const ARROW_SIZE = 20;

    const BOX_WIDTH = 53;
    const BOX_HEIGHT = 41;

    panel.addBoxRounded(x, y, BOX_WIDTH, BOX_HEIGHT);

    const typeSplit = type.split('\n');

    if (typeSplit.length == 1) {
        panel.addTextCentre(x, y, type, 1, true);
    } else {
        panel.addTextCentre(x, y - 8, typeSplit[0], 1, true);
        panel.addTextCentre(x, y + 8, typeSplit[1], 1, true);
    }

    const leftButton = panel.addButton(x - 40, y, ARROW_SIZE, ARROW_SIZE);
    panel.addSprite(x - 40, y, Panel.baseSpriteStart + 7);

    const rightButton = panel.addButton(x + 40, y, ARROW_SIZE, ARROW_SIZE);
    panel.addSprite(x + 40, y, Panel.baseSpriteStart + 6);

    const buttons = new Int32Array(2);
    unchecked((buttons[0] = leftButton));
    unchecked((buttons[1] = rightButton));

    return buttons;
}

createAppearancePanel(): void {
    // the width of each option column including the arrows
    const COLUMN_WIDTH = 54;

    // size of the accept button
    const ACCEPT_WIDTH = 200;
    const ACCEPT_HEIGHT = 30;

    this.panelAppearance = new Panel(this.surface!, 100);

    const x = 256;

    this.panelAppearance!.addTextCentre(
        x,
        10,
        'Please design Your Character',
        4,
        true
    );

    let y = 24;

    this.panelAppearance!.addTextCentre(x - 55, y + 110, 'Front', 3, true);
    this.panelAppearance!.addTextCentre(x, y + 110, 'Side', 3, true);
    this.panelAppearance!.addTextCentre(x + 55, y + 110, 'Back', 3, true);

    y += 145;

    let buttons = this.drawAppearanceOption(
        this.panelAppearance!,
        'Head\nType',
        x - COLUMN_WIDTH,
        y
    );

    this.controlButtonAppearanceHeadLeft = buttons[0];
    this.controlButtonAppearanceHeadRight = buttons[1];

    buttons = this.drawAppearanceOption(
        this.panelAppearance!,
        'Hair\nColor',
        x + COLUMN_WIDTH,
        y
    );

    this.controlButtonAppearanceHairLeft = buttons[0];
    this.controlButtonAppearanceHairRight = buttons[1];

    y += 50;

    buttons = this.drawAppearanceOption(
        this.panelAppearance!,
        'Gender',
        x - COLUMN_WIDTH,
        y
    );

    this.controlButtonAppearanceGenderLeft = buttons[0];
    this.controlButtonAppearanceGenderRight = buttons[1];

    buttons = this.drawAppearanceOption(
        this.panelAppearance!,
        'Top\nColor',
        x + COLUMN_WIDTH,
        y
    );

    this.controlButtonAppearanceTopLeft = buttons[0];
    this.controlButtonAppearanceTopRight = buttons[1];

    y += 50;

    buttons = this.drawAppearanceOption(
        this.panelAppearance!,
        'Skin\nColor',
        x - COLUMN_WIDTH,
        y
    );

    this.controlButtonAppearanceSkinLeft = buttons[0];
    this.controlButtonAppearanceSkinRight = buttons[1];

    buttons = this.drawAppearanceOption(
        this.panelAppearance!,
        'Bottom\nColor',
        x + COLUMN_WIDTH,
        y
    );

    this.controlButtonAppearanceBottomLeft = buttons[0];
    this.controlButtonAppearanceBottomRight = buttons[1];

    y += 47;

    this.panelAppearance!.addButtonBackground(
        x,
        y,
        ACCEPT_WIDTH,
        ACCEPT_HEIGHT
    );

    this.panelAppearance!.addTextCentre(x, y, 'Accept', 4, false);

    this.controlButtonAppearanceAccept = this.panelAppearance!.addButton(
        x,
        y,
        ACCEPT_WIDTH,
        ACCEPT_HEIGHT
    );
}

handleAppearancePanelInput(): void {
    this.panelAppearance!.handleMouse(
        this.mouseX,
        this.mouseY,
        this.lastMouseButtonDown,
        this.mouseButtonDown
    );

    if (this.panelAppearance!.isClicked(this.controlButtonAppearanceHeadLeft)) {
        do {
            this.appearanceHeadType =
                (this.appearanceHeadType - 1 + GameData.animationCount) %
                GameData.animationCount;
        } while (
            (GameData.animationGender[this.appearanceHeadType] & 3) != 1 ||
            (GameData.animationGender[this.appearanceHeadType] &
                (4 * this.appearanceHeadGender)) ==
                0
        );
    }

    if (
        this.panelAppearance!.isClicked(this.controlButtonAppearanceHeadRight)
    ) {
        do {
            this.appearanceHeadType =
                (this.appearanceHeadType + 1) % GameData.animationCount;
        } while (
            (GameData.animationGender[this.appearanceHeadType] & 3) != 1 ||
            (GameData.animationGender[this.appearanceHeadType] &
                (4 * this.appearanceHeadGender)) ==
                0
        );
    }

    if (this.panelAppearance!.isClicked(this.controlButtonAppearanceHairLeft)) {
        this.appearanceHairColour =
            (this.appearanceHairColour - 1 + this.characterHairColours.length) %
            this.characterHairColours.length;
    }

    if (
        this.panelAppearance!.isClicked(this.controlButtonAppearanceHairRight)
    ) {
        this.appearanceHairColour =
            (this.appearanceHairColour + 1) % this.characterHairColours.length;
    }

    if (
        this.panelAppearance!.isClicked(
            this.controlButtonAppearanceGenderLeft
        ) ||
        this.panelAppearance!.isClicked(this.controlButtonAppearanceGenderRight)
    ) {
        for (
            this.appearanceHeadGender = 3 - this.appearanceHeadGender;
            (GameData.animationGender[this.appearanceHeadType] & 3) != 1 ||
            (GameData.animationGender[this.appearanceHeadType] &
                (4 * this.appearanceHeadGender)) ==
                0;
            this.appearanceHeadType =
                (this.appearanceHeadType + 1) % GameData.animationCount
        );

        for (
            ;
            (GameData.animationGender[this.appearanceBodyGender] & 3) != 2 ||
            (GameData.animationGender[this.appearanceBodyGender] &
                (4 * this.appearanceHeadGender)) ==
                0;
            this.appearanceBodyGender =
                (this.appearanceBodyGender + 1) % GameData.animationCount
        );
    }

    if (this.panelAppearance!.isClicked(this.controlButtonAppearanceTopLeft)) {
        this.appearanceTopColour =
            (this.appearanceTopColour -
                1 +
                this.characterTopBottomColours.length) %
            this.characterTopBottomColours.length;
    }

    if (this.panelAppearance!.isClicked(this.controlButtonAppearanceTopRight)) {
        this.appearanceTopColour =
            (this.appearanceTopColour + 1) %
            this.characterTopBottomColours.length;
    }

    if (this.panelAppearance!.isClicked(this.controlButtonAppearanceSkinLeft)) {
        this.appearanceSkinColour =
            (this.appearanceSkinColour - 1 + this.characterSkinColours.length) %
            this.characterSkinColours.length;
    }

    if (
        this.panelAppearance!.isClicked(this.controlButtonAppearanceSkinRight)
    ) {
        this.appearanceSkinColour =
            (this.appearanceSkinColour + 1) % this.characterSkinColours.length;
    }

    if (
        this.panelAppearance!.isClicked(this.controlButtonAppearanceBottomLeft)
    ) {
        this.appearanceBottomColour =
            (this.appearanceBottomColour -
                1 +
                this.characterTopBottomColours.length) %
            this.characterTopBottomColours.length;
    }

    if (
        this.panelAppearance!.isClicked(this.controlButtonAppearanceBottomRight)
    ) {
        this.appearanceBottomColour =
            (this.appearanceBottomColour + 1) %
            this.characterTopBottomColours.length;
    }

    if (this.panelAppearance!.isClicked(this.controlButtonAppearanceAccept)) {
        this.packetStream!.newPacket(ClientOpcodes.APPEARANCE);
        this.packetStream!.putByte(this.appearanceHeadGender);
        this.packetStream!.putByte(this.appearanceHeadType);
        this.packetStream!.putByte(this.appearanceBodyGender);
        this.packetStream!.putByte(this.appearance2Colour);
        this.packetStream!.putByte(this.appearanceHairColour);
        this.packetStream!.putByte(this.appearanceTopColour);
        this.packetStream!.putByte(this.appearanceBottomColour);
        this.packetStream!.putByte(this.appearanceSkinColour);
        this.packetStream!.sendPacket();

        this.surface!.blackScreen();

        this.showAppearanceChange = false;
    }
}

drawAppearancePanelCharacterSprites(): void {
    this.surface!.interlace = false;
    this.surface!.blackScreen();

    this.panelAppearance!.drawPanel();

    const x = 256;
    const y = 25;

    this.surface!._spriteClipping_from6(
        x - 32 - 55,
        y,
        64,
        102,
        GameData.animationNumber[this.appearance2Colour],
        this.characterTopBottomColours[this.appearanceBottomColour]
    );

    this.surface!._spriteClipping_from9(
        x - 32 - 55,
        y,
        64,
        102,
        GameData.animationNumber[this.appearanceBodyGender],
        this.characterTopBottomColours[this.appearanceTopColour],
        this.characterSkinColours[this.appearanceSkinColour],
        0,
        false
    );

    this.surface!._spriteClipping_from9(
        x - 32 - 55,
        y,
        64,
        102,
        GameData.animationNumber[this.appearanceHeadType],
        this.characterHairColours[this.appearanceHairColour],
        this.characterSkinColours[this.appearanceSkinColour],
        0,
        false
    );

    this.surface!._spriteClipping_from6(
        x - 32,
        y,
        64,
        102,
        GameData.animationNumber[this.appearance2Colour] + 6,
        this.characterTopBottomColours[this.appearanceBottomColour]
    );

    this.surface!._spriteClipping_from9(
        x - 32,
        y,
        64,
        102,
        GameData.animationNumber[this.appearanceBodyGender] + 6,
        this.characterTopBottomColours[this.appearanceTopColour],
        this.characterSkinColours[this.appearanceSkinColour],
        0,
        false
    );

    this.surface!._spriteClipping_from9(
        x - 32,
        y,
        64,
        102,
        GameData.animationNumber[this.appearanceHeadType] + 6,
        this.characterHairColours[this.appearanceHairColour],
        this.characterSkinColours[this.appearanceSkinColour],
        0,
        false
    );

    this.surface!._spriteClipping_from6(
        x - 32 + 55,
        y,
        64,
        102,
        GameData.animationNumber[this.appearance2Colour] + 12,
        this.characterTopBottomColours[this.appearanceBottomColour]
    );

    this.surface!._spriteClipping_from9(
        x - 32 + 55,
        y,
        64,
        102,
        GameData.animationNumber[this.appearanceBodyGender] + 12,
        this.characterTopBottomColours[this.appearanceTopColour],
        this.characterSkinColours[this.appearanceSkinColour],
        0,
        false
    );

    this.surface!._spriteClipping_from9(
        x - 32 + 55,
        y,
        64,
        102,
        GameData.animationNumber[this.appearanceHeadType] + 12,
        this.characterHairColours[this.appearanceHairColour],
        this.characterSkinColours[this.appearanceSkinColour],
        0,
        false
    );

    this.surface!._drawSprite_from3(0, this.gameHeight, this.spriteMedia + 22);

    //this.surface!.draw(this.graphics, 0, 0);
}
