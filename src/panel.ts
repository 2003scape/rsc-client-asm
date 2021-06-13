import Surface from './surface';

class ControlTypes {
    static readonly Text: i32 = 0;
    static readonly CentreText: i32 = 1;
    static readonly GradientBackground: i32 = 2;
    static readonly HorizontalLine: i32 = 3;
    static readonly TextList: i32 = 4;
    static readonly ListInput: i32 = 5;
    static readonly TextInput: i32 = 6;
    static readonly HorizontalOption: i32 = 7;
    static readonly VerticalOption: i32 = 8;
    static readonly InteractiveTextList: i32 = 9;
    static readonly Button: i32 = 10;
    static readonly RoundBox: i32 = 11;
    static readonly Image: i32 = 12;
    static readonly Checkbox: i32 = 14;
}

const RED_MOD = 114;
const GREEN_MOD = 114;
const BLUE_MOD = 176;

const CHAR_SET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"£$%^&*()' +
    "-_=+[{]};:'@#~,<.>/?\\| ";

export default class Panel {
    static drawBackgroundArrow: bool = true;
    static baseSpriteStart: i32;
    static textListEntryHeightMod: i32;

    controlShown: Int8Array;
    controlListScrollbarHandleDragged: Int8Array;
    controlMaskText: Int8Array;
    controlClicked: Int8Array;
    controlFlashText: Int32Array;
    controlListEntryCount: Int32Array;
    controlListEntryMouseButtonDown: Int32Array;
    controlListEntryMouseOver: Int32Array;
    aBoolean219: bool = true;
    surface: Surface;
    controlCount: i32;
    maxControls: i32;
    controlUseAlternativeColour: Int8Array;
    controlX: Int32Array;
    controlY: Int32Array;
    controlType: Int32Array;
    controlWidth: Int32Array;
    controlHeight: Int32Array;
    controlInputMaxLen: Int32Array;
    controlTextSize: Int32Array;
    controlText: StaticArray<string | null>;
    controlListEntries: StaticArray<StaticArray<string | null> | null>;
    mouseX: i32;
    mouseY: i32;
    mouseLastButtonDown: i32;
    mouseButtonDown: i32;
    mouseMetaButtonHeld: i32;
    mouseScrollDelta: i32;
    colourScrollbarTop: i32;
    colourScrollbarBottom: i32;
    colourScrollbarHandleLeft: i32;
    colourScrollbarHandleMid: i32;
    colourScrollbarHandleRight: i32;
    colourRoundedBoxOut: i32;
    colourRoundedBoxMid: i32;
    colourRoundedBoxIn: i32;
    colourBoxTopNBottom: i32;
    colourBoxTopNBottom2: i32;
    colourBoxLeftNRight2: i32;
    colourBoxLeftNRight: i32;
    focusControlIndex: i32 = -1;

    constructor(surface: Surface, max: i32) {
        this.surface = surface;
        this.maxControls = max;
        this.controlShown = new Int8Array(max);
        this.controlListScrollbarHandleDragged = new Int8Array(max);
        this.controlMaskText = new Int8Array(max);
        this.controlClicked = new Int8Array(max);
        this.controlUseAlternativeColour = new Int8Array(max);
        this.controlFlashText = new Int32Array(max);
        this.controlListEntryCount = new Int32Array(max);
        this.controlListEntryMouseButtonDown = new Int32Array(max);
        this.controlListEntryMouseOver = new Int32Array(max);
        this.controlX = new Int32Array(max);
        this.controlY = new Int32Array(max);
        this.controlType = new Int32Array(max);
        this.controlWidth = new Int32Array(max);
        this.controlHeight = new Int32Array(max);
        this.controlInputMaxLen = new Int32Array(max);
        this.controlTextSize = new Int32Array(max);
        this.controlText = new StaticArray<string | null>(max);

        this.controlListEntries = new StaticArray<StaticArray<
            string | null
        > | null>(max);
    }

    rgbToIntMod(red: i32, green: i32, blue: i32): i32 {
        return Surface.rgbToInt(
            ((RED_MOD * red) / 114) as i32,
            ((GREEN_MOD * green) / 114) as i32,
            ((BLUE_MOD * blue) / 176) as i32
        );
    }

    handleMouse(
        x: i32,
        y: i32,
        lastButton: i32,
        isDown: i32,
        scrollDelta: i32 = 0
    ): void {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseButtonDown = isDown;
        this.mouseScrollDelta = scrollDelta;

        if (lastButton != 0) {
            this.mouseLastButtonDown = lastButton;
        }

        if (lastButton == 1) {
            for (let i = 0; i < this.controlCount; i++) {
                if (
                    this.controlShown[i] &&
                    this.controlType[i] == ControlTypes.Button &&
                    this.mouseX >= this.controlX[i] &&
                    this.mouseY >= this.controlY[i] &&
                    this.mouseX <= this.controlX[i] + this.controlWidth[i] &&
                    this.mouseY <= this.controlY[i] + this.controlHeight[i]
                ) {
                    this.controlClicked[i] = true;
                }

                if (
                    this.controlShown[i] &&
                    this.controlType[i] == ControlTypes.Checkbox &&
                    this.mouseX >= this.controlX[i] &&
                    this.mouseY >= this.controlY[i] &&
                    this.mouseX <= this.controlX[i] + this.controlWidth[i] &&
                    this.mouseY <= this.controlY[i] + this.controlHeight[i]
                ) {
                    this.controlListEntryMouseButtonDown[i] =
                        1 - this.controlListEntryMouseButtonDown[i];
                }
            }
        }

        if (isDown == 1) {
            this.mouseMetaButtonHeld++;
        } else {
            this.mouseMetaButtonHeld = 0;
        }
    }

    isClicked(control: i32): bool {
        if (this.controlShown[control] && this.controlClicked[control]) {
            this.controlClicked[control] = false;
            return true;
        }

        return false;
    }

    keyPress(key: i32): void {
        if (key == 0) {
            return;
        }

        if (
            this.focusControlIndex != -1 &&
            this.controlText[this.focusControlIndex] != null &&
            this.controlShown[this.focusControlIndex]
        ) {
            const inputLength = this.controlText[this.focusControlIndex]!
                .length;

            if (key == 8 && inputLength > 0) {
                this.controlText[this.focusControlIndex] = this.controlText[
                    this.focusControlIndex
                ]!.slice(0, inputLength - 1);
            }

            if ((key == 10 || key == 13) && inputLength > 0) {
                this.controlClicked[this.focusControlIndex] = true;
            }

            if (inputLength < this.controlInputMaxLen[this.focusControlIndex]) {
                for (let i = 0; i < CHAR_SET.length; i++) {
                    if (key == CHAR_SET.charCodeAt(i)) {
                        this.controlText[
                            this.focusControlIndex
                        ] += String.fromCharCode(key);
                    }
                }
            }

            if (key == 9) {
                do {
                    this.focusControlIndex =
                        (this.focusControlIndex + 1) % this.controlCount;
                } while (
                    this.controlType[this.focusControlIndex] != 5 &&
                    this.controlType[this.focusControlIndex] != 6
                );
            }
        }
    }

    drawPanel(): void {
        for (let i = 0; i < this.controlCount; i++) {
            if (this.controlShown[i]) {
                if (this.controlType[i] == ControlTypes.Text) {
                    this.drawText(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlText[i]!,
                        this.controlTextSize[i]
                    );
                } else if (this.controlType[i] == ControlTypes.CentreText) {
                    this.drawText(
                        i,
                        this.controlX[i] -
                            ((this.surface.textWidth(
                                this.controlText[i]!,
                                this.controlTextSize[i]
                            ) / 2) as i32),
                        this.controlY[i],
                        this.controlText[i]!,
                        this.controlTextSize[i]
                    );
                } else if (
                    this.controlType[i] == ControlTypes.GradientBackground
                ) {
                    this.drawBox(
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i],
                        this.controlHeight[i]
                    );
                } else if (this.controlType[i] == ControlTypes.HorizontalLine) {
                    this.drawLineHoriz(
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i]
                    );
                } else if (this.controlType[i] == ControlTypes.TextList) {
                    this.drawTextList(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i],
                        this.controlHeight[i],
                        this.controlTextSize[i],
                        this.controlListEntries[i]!,
                        this.controlListEntryCount[i],
                        this.controlFlashText[i]
                    );
                } else if (
                    this.controlType[i] == ControlTypes.ListInput ||
                    this.controlType[i] == ControlTypes.TextInput
                ) {
                    this.drawTextInput(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i],
                        this.controlHeight[i],
                        this.controlText[i]!,
                        this.controlTextSize[i]
                    );
                } else if (
                    this.controlType[i] == ControlTypes.HorizontalOption
                ) {
                    this.drawOptionListHoriz(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlTextSize[i],
                        this.controlListEntries[i]!
                    );
                } else if (this.controlType[i] == ControlTypes.VerticalOption) {
                    this.drawOptionListVert(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlTextSize[i],
                        this.controlListEntries[i]!
                    );
                } else if (
                    this.controlType[i] == ControlTypes.InteractiveTextList
                ) {
                    this.drawTextListInteractive(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i],
                        this.controlHeight[i],
                        this.controlTextSize[i],
                        this.controlListEntries[i]!,
                        this.controlListEntryCount[i],
                        this.controlFlashText[i]
                    );
                } else if (this.controlType[i] == ControlTypes.RoundBox) {
                    this.drawRoundedBox(
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i],
                        this.controlHeight[i]
                    );
                } else if (this.controlType[i] == ControlTypes.Image) {
                    this.drawPicture(
                        this.controlX[i],
                        this.controlY[i],
                        this.controlTextSize[i]
                    );
                } else if (this.controlType[i] == ControlTypes.Checkbox) {
                    this.drawCheckbox(
                        i,
                        this.controlX[i],
                        this.controlY[i],
                        this.controlWidth[i],
                        this.controlHeight[i]
                    );
                }
            }
        }

        this.mouseLastButtonDown = 0;
    }

    drawCheckbox(control: i32, x: i32, y: i32, width: i32, height: i32): void {
        this.surface.drawBox(x, y, width, height, 0xffffff);
        this.surface.drawLineHoriz(x, y, width, this.colourBoxTopNBottom);
        this.surface.drawLineVert(x, y, height, this.colourBoxTopNBottom);

        this.surface.drawLineHoriz(
            x,
            y + height - 1,
            width,
            this.colourBoxLeftNRight
        );

        this.surface.drawLineVert(
            x + width - 1,
            y,
            height,
            this.colourBoxLeftNRight
        );

        if (this.controlListEntryMouseButtonDown[control] == 1) {
            for (let i = 0; i < height; i++) {
                this.surface.drawLineHoriz(x + i, y + i, 1, 0);
                this.surface.drawLineHoriz(x + width - 1 - i, y + i, 1, 0);
            }
        }
    }

    drawText(control: i32, x: i32, y: i32, text: string, textSize: i32): void {
        const y2 = y + ((this.surface.textHeight(textSize) / 3) as i32);
        this.drawString(control, x, y2, text, textSize);
    }

    drawString(
        control: i32,
        x: i32,
        y: i32,
        text: string,
        textSize: i32
    ): void {
        let textColour: i32;

        if (this.controlUseAlternativeColour[control]) {
            textColour = 0xffffff;
        } else {
            textColour = 0;
        }

        this.surface.drawString(text, x, y, textSize, textColour);
    }

    drawTextInput(
        control: i32,
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        text: string,
        textSize: i32
    ): void {
        let displayText = text;

        if (this.controlMaskText[control]) {
            const length = displayText.length;

            displayText = '';

            for (let i = 0; i < length; i++) {
                displayText += 'X';
            }
        }

        if (this.controlType[control] == ControlTypes.ListInput) {
            if (
                this.mouseLastButtonDown == 1 &&
                this.mouseX >= x &&
                this.mouseY >= y - ((height / 2) as i32) &&
                this.mouseX <= x + width &&
                this.mouseY <= y + ((height / 2) as i32)
            ) {
                this.focusControlIndex = control;
                this.setMobileFocus(control, text);
            }
        } else if (this.controlType[control] == ControlTypes.TextInput) {
            if (
                this.mouseLastButtonDown == 1 &&
                this.mouseX >= x - ((width / 2) as i32) &&
                this.mouseY >= y - ((height / 2) as i32) &&
                this.mouseX <= x + width / 2 &&
                this.mouseY <= y + ((height / 2) as i32)
            ) {
                this.focusControlIndex = control;
                this.setMobileFocus(control, text);
            }

            x -= (this.surface.textWidth(displayText, textSize) / 2) as i32;
        }

        if (this.focusControlIndex == control) {
            const mudclient = this.surface.mudclient;
            const caret = mudclient.mobileInputCaret;

            if (mudclient.options.mobile && caret != -1) {
                displayText =
                    displayText.slice(0, caret) +
                    '*' +
                    displayText.slice(caret);
            } else {
                displayText += '*';
            }
        }

        const y2 = y + ((this.surface.textHeight(textSize) / 3) as i32);
        this.drawString(control, x, y2, displayText, textSize);
    }

    drawBox(x: i32, y: i32, width: i32, height: i32): void {
        this.surface.setBounds(x, y, x + width, y + height);

        this.surface.drawGradient(
            x,
            y,
            width,
            height,
            this.colourBoxLeftNRight,
            this.colourBoxTopNBottom
        );

        if (Panel.drawBackgroundArrow) {
            for (let i1 = x - (y & 0x3f); i1 < x + width; i1 += 128) {
                for (let j1 = y - (y & 0x1f); j1 < y + height; j1 += 128) {
                    this.surface._drawSpriteAlpha_from4(
                        i1,
                        j1,
                        6 + Panel.baseSpriteStart,
                        128
                    );
                }
            }
        }

        this.surface.drawLineHoriz(x, y, width, this.colourBoxTopNBottom);

        this.surface.drawLineHoriz(
            x + 1,
            y + 1,
            width - 2,
            this.colourBoxTopNBottom
        );

        this.surface.drawLineHoriz(
            x + 2,
            y + 2,
            width - 4,
            this.colourBoxTopNBottom2
        );

        this.surface.drawLineVert(x, y, height, this.colourBoxTopNBottom);

        this.surface.drawLineVert(
            x + 1,
            y + 1,
            height - 2,
            this.colourBoxTopNBottom
        );

        this.surface.drawLineVert(
            x + 2,
            y + 2,
            height - 4,
            this.colourBoxTopNBottom2
        );

        this.surface.drawLineHoriz(
            x,
            y + height - 1,
            width,
            this.colourBoxLeftNRight
        );

        this.surface.drawLineHoriz(
            x + 1,
            y + height - 2,
            width - 2,
            this.colourBoxLeftNRight
        );

        this.surface.drawLineHoriz(
            x + 2,
            y + height - 3,
            width - 4,
            this.colourBoxLeftNRight2
        );

        this.surface.drawLineVert(
            x + width - 1,
            y,
            height,
            this.colourBoxLeftNRight
        );

        this.surface.drawLineVert(
            x + width - 2,
            y + 1,
            height - 2,
            this.colourBoxLeftNRight
        );

        this.surface.drawLineVert(
            x + width - 3,
            y + 2,
            height - 4,
            this.colourBoxLeftNRight2
        );

        this.surface.resetBounds();
    }

    drawRoundedBox(x: i32, y: i32, width: i32, height: i32): void {
        this.surface.drawBox(x, y, width, height, 0);
        this.surface.drawBoxEdge(x, y, width, height, this.colourRoundedBoxOut);

        this.surface.drawBoxEdge(
            x + 1,
            y + 1,
            width - 2,
            height - 2,
            this.colourRoundedBoxMid
        );

        this.surface.drawBoxEdge(
            x + 2,
            y + 2,
            width - 4,
            height - 4,
            this.colourRoundedBoxIn
        );

        this.surface._drawSprite_from3(x, y, 2 + Panel.baseSpriteStart);

        this.surface._drawSprite_from3(
            x + width - 7,
            y,
            3 + Panel.baseSpriteStart
        );

        this.surface._drawSprite_from3(
            x,
            y + height - 7,
            4 + Panel.baseSpriteStart
        );

        this.surface._drawSprite_from3(
            x + width - 7,
            y + height - 7,
            5 + Panel.baseSpriteStart
        );
    }

    drawPicture(x: i32, y: i32, spriteID: i32): void {
        this.surface._drawSprite_from3(x, y, spriteID);
    }

    drawLineHoriz(x: i32, y: i32, width: i32): void {
        this.surface.drawLineHoriz(x, y, width, 0xffffff);
    }

    drawTextList(
        control: i32,
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        textSize: i32,
        listEntries: StaticArray<string | null>,
        listEntryCount: i32,
        listEntryPosition: i32
    ): void {
        const displayedEntryCount = (height /
            this.surface.textHeight(textSize)) as i32;

        const maxEntries = listEntryCount - displayedEntryCount;

        if (listEntryPosition > maxEntries) {
            listEntryPosition = maxEntries;
        }

        if (listEntryPosition < 0) {
            listEntryPosition = 0;
        }

        this.controlFlashText[control] = listEntryPosition;

        if (displayedEntryCount < listEntryCount) {
            const cornerTopRight = x + width - 12;
            let cornerBottomLeft = (((height - 27) * displayedEntryCount) /
                listEntryCount) as i32;

            if (cornerBottomLeft < 6) {
                cornerBottomLeft = 6;
            }

            let j3 = (((height - 27 - cornerBottomLeft) * listEntryPosition) /
                maxEntries) as i32;

            if (
                this.mouseScrollDelta != 0 &&
                this.mouseX > x &&
                this.mouseX < x + width &&
                this.mouseY > y &&
                this.mouseY < y + height
            ) {
                listEntryPosition += this.mouseScrollDelta;

                if (listEntryPosition < 0) {
                    listEntryPosition = 0;
                } else if (listEntryPosition > maxEntries) {
                    listEntryPosition = maxEntries;
                }

                this.controlFlashText[control] = listEntryPosition;
            }

            if (
                this.mouseButtonDown == 1 &&
                this.mouseX >= cornerTopRight &&
                this.mouseX <= cornerTopRight + 12
            ) {
                if (
                    this.mouseY > y &&
                    this.mouseY < y + 12 &&
                    listEntryPosition > 0
                ) {
                    listEntryPosition--;
                }

                if (
                    this.mouseY > y + height - 12 &&
                    this.mouseY < y + height &&
                    listEntryPosition < listEntryCount - displayedEntryCount
                ) {
                    listEntryPosition++;
                }

                this.controlFlashText[control] = listEntryPosition;
            }

            if (
                this.mouseButtonDown == 1 &&
                ((this.mouseX >= cornerTopRight &&
                    this.mouseX <= cornerTopRight + 12) ||
                    (this.mouseX >= cornerTopRight - 12 &&
                        this.mouseX <= cornerTopRight + 24 &&
                        this.controlListScrollbarHandleDragged[control]))
            ) {
                if (this.mouseY > y + 12 && this.mouseY < y + height - 12) {
                    this.controlListScrollbarHandleDragged[control] = true;

                    const l3 =
                        this.mouseY - y - 12 - ((cornerBottomLeft / 2) as i32);

                    listEntryPosition = ((l3 * listEntryCount) /
                        (height - 24)) as i32;

                    if (listEntryPosition > maxEntries) {
                        listEntryPosition = maxEntries;
                    }

                    if (listEntryPosition < 0) {
                        listEntryPosition = 0;
                    }

                    this.controlFlashText[control] = listEntryPosition;
                }
            } else {
                this.controlListScrollbarHandleDragged[control] = false;
            }

            j3 = (((height - 27 - cornerBottomLeft) * listEntryPosition) /
                (listEntryCount - displayedEntryCount)) as i32;

            this.drawListContainer(x, y, width, height, j3, cornerBottomLeft);
        }

        const listStartY =
            height - displayedEntryCount * this.surface.textHeight(textSize);

        let listY = (y +
            ((this.surface.textHeight(textSize) * 5) / 6 +
                listStartY / 2)) as i32;

        for (let entry = listEntryPosition; entry < listEntryCount; entry++) {
            this.drawString(
                control,
                x + 2,
                listY,
                listEntries[entry]!,
                textSize
            );

            listY +=
                this.surface.textHeight(textSize) -
                Panel.textListEntryHeightMod;

            if (listY >= y + height) {
                return;
            }
        }
    }

    drawListContainer(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        corner1: i32,
        corner2: i32
    ): void {
        const x2 = x + width - 12;
        this.surface.drawBoxEdge(x2, y, 12, height, 0);

        // up arrow
        this.surface._drawSprite_from3(x2 + 1, y + 1, Panel.baseSpriteStart);

        // down arrow
        this.surface._drawSprite_from3(
            x2 + 1,
            y + height - 12,
            Panel.baseSpriteStart + 1
        );

        this.surface.drawLineHoriz(x2, y + 13, 12, 0);
        this.surface.drawLineHoriz(x2, y + height - 13, 12, 0);

        this.surface.drawGradient(
            x2 + 1,
            y + 14,
            11,
            height - 27,
            this.colourScrollbarTop,
            this.colourScrollbarBottom
        );

        this.surface.drawBox(
            x2 + 3,
            corner1 + y + 14,
            7,
            corner2,
            this.colourScrollbarHandleMid
        );

        this.surface.drawLineVert(
            x2 + 2,
            corner1 + y + 14,
            corner2,
            this.colourScrollbarHandleLeft
        );

        this.surface.drawLineVert(
            x2 + 2 + 8,
            corner1 + y + 14,
            corner2,
            this.colourScrollbarHandleRight
        );
    }

    drawOptionListHoriz(
        control: i32,
        x: i32,
        y: i32,
        textSize: i32,
        listEntries: StaticArray<string | null>
    ): void {
        let listTotalTextWidth = 0;
        const listEntryCount = listEntries.length;

        for (let i = 0; i < listEntryCount; i++) {
            listTotalTextWidth += this.surface.textWidth(
                listEntries[i]!,
                textSize
            );

            if (i < listEntryCount - 1) {
                listTotalTextWidth += this.surface.textWidth('  ', textSize);
            }
        }

        let left = x - ((listTotalTextWidth / 2) as i32);
        const bottom = y + ((this.surface.textHeight(textSize) / 3) as i32);

        for (let i = 0; i < listEntryCount; i++) {
            let textColour: i32;

            if (this.controlUseAlternativeColour[control]) {
                textColour = 0xffffff;
            } else {
                textColour = 0;
            }

            if (
                this.mouseX >= left &&
                this.mouseX <=
                    left + this.surface.textWidth(listEntries[i]!, textSize) &&
                this.mouseY <= bottom &&
                this.mouseY > bottom - this.surface.textHeight(textSize)
            ) {
                if (this.controlUseAlternativeColour[control]) {
                    textColour = 0x808080;
                } else {
                    textColour = 0xffffff;
                }

                if (this.mouseLastButtonDown == 1) {
                    this.controlListEntryMouseButtonDown[control] = i;
                    this.controlClicked[control] = true;
                }
            }

            if (this.controlListEntryMouseButtonDown[control] == i) {
                if (this.controlUseAlternativeColour[control]) {
                    textColour = 0xff0000;
                } else {
                    textColour = 0xc00000;
                }
            }

            this.surface.drawString(
                listEntries[i]!,
                left,
                bottom,
                textSize,
                textColour
            );

            left += this.surface.textWidth(listEntries[i] + '  ', textSize);
        }
    }

    drawOptionListVert(
        control: i32,
        x: i32,
        y: i32,
        textSize: i32,
        listEntries: StaticArray<string|null>
    ): void {
        const listEntryCount = listEntries.length;

        let listTotalTextHeightMid =
            y -
            (((this.surface.textHeight(textSize) * (listEntryCount - 1)) /
                2) as i32);

        for (let i = 0; i < listEntryCount; i++) {
            let textColour: i32;

            if (this.controlUseAlternativeColour[control]) {
                textColour = 0xffffff;
            } else {
                textColour = 0;
            }

            const entryTextWidth = this.surface.textWidth(
                listEntries[i]!,
                textSize
            );

            if (
                this.mouseX >= x - ((entryTextWidth / 2) as i32) &&
                this.mouseX <= x + ((entryTextWidth / 2) as i32) &&
                this.mouseY - 2 <= listTotalTextHeightMid &&
                this.mouseY - 2 >
                    listTotalTextHeightMid - this.surface.textHeight(textSize)
            ) {
                if (this.controlUseAlternativeColour[control]) {
                    textColour = 0x808080;
                } else {
                    textColour = 0xffffff;
                }

                if (this.mouseLastButtonDown == 1) {
                    this.controlListEntryMouseButtonDown[control] = i;
                    this.controlClicked[control] = true;
                }
            }

            if (this.controlListEntryMouseButtonDown[control] == i) {
                if (this.controlUseAlternativeColour[control]) {
                    textColour = 0xff0000;
                } else {
                    textColour = 0xc00000;
                }
            }

            this.surface.drawString(
                listEntries[i]!,
                x - ((entryTextWidth / 2) as i32),
                listTotalTextHeightMid,
                textSize,
                textColour
            );

            listTotalTextHeightMid += this.surface.textHeight(textSize);
        }
    }

    drawTextListInteractive(
        control: i32,
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        textSize: i32,
        listEntries: StaticArray<string|null>,
        listEntryCount: i32,
        listEntryPosition: i32
    ): void {
        const displayedEntryCount = (height /
            this.surface.textHeight(textSize)) as i32;

        const maxEntries = listEntryCount - displayedEntryCount;

        if (displayedEntryCount < listEntryCount) {
            const cornerTopRight = x + width - 12;

            let cornerBottomLeft = (((height - 27) * displayedEntryCount) /
                listEntryCount) as i32;

            if (cornerBottomLeft < 6) {
                cornerBottomLeft = 6;
            }

            let j3 = (((height - 27 - cornerBottomLeft) * listEntryPosition) /
                maxEntries) as i32;

            if (
                this.mouseScrollDelta != 0 &&
                this.mouseX > x &&
                this.mouseX < x + width &&
                this.mouseY > y &&
                this.mouseY < y + height
            ) {
                listEntryPosition += this.mouseScrollDelta;

                if (listEntryPosition < 0) {
                    listEntryPosition = 0;
                } else if (listEntryPosition > maxEntries) {
                    listEntryPosition = maxEntries;
                }

                this.controlFlashText[control] = listEntryPosition;
            }

            // the up and down arrow buttons on the scrollbar
            if (
                this.mouseButtonDown == 1 &&
                this.mouseX >= cornerTopRight &&
                this.mouseX <= cornerTopRight + 12
            ) {
                if (
                    this.mouseY > y &&
                    this.mouseY < y + 12 &&
                    listEntryPosition > 0
                ) {
                    listEntryPosition--;
                }

                if (
                    this.mouseY > y + height - 12 &&
                    this.mouseY < y + height &&
                    listEntryPosition < maxEntries
                ) {
                    listEntryPosition++;
                }

                this.controlFlashText[control] = listEntryPosition;
            }

            // handle the thumb/middle section dragging of the scrollbar
            if (
                this.mouseButtonDown == 1 &&
                ((this.mouseX >= cornerTopRight &&
                    this.mouseX <= cornerTopRight + 12) ||
                    (this.mouseX >= cornerTopRight - 12 &&
                        this.mouseX <= cornerTopRight + 24 &&
                        this.controlListScrollbarHandleDragged[control]))
            ) {
                if (this.mouseY > y + 12 && this.mouseY < y + height - 12) {
                    this.controlListScrollbarHandleDragged[control] = true;

                    const l3 =
                        this.mouseY - y - 12 - ((cornerBottomLeft / 2) as i32);

                    listEntryPosition = ((l3 * listEntryCount) /
                        (height - 24)) as i32;

                    if (listEntryPosition < 0) {
                        listEntryPosition = 0;
                    }

                    if (listEntryPosition > maxEntries) {
                        listEntryPosition = maxEntries;
                    }

                    this.controlFlashText[control] = listEntryPosition;
                }
            } else {
                this.controlListScrollbarHandleDragged[control] = false;
            }

            j3 = (((height - 27 - cornerBottomLeft) * listEntryPosition) /
                maxEntries) as i32;

            this.drawListContainer(x, y, width, height, j3, cornerBottomLeft);
        } else {
            listEntryPosition = 0;
            this.controlFlashText[control] = 0;
        }

        this.controlListEntryMouseOver[control] = -1;

        const listStartY =
            height - displayedEntryCount * this.surface.textHeight(textSize);

        let listY =
            y +
            (((((this.surface.textHeight(textSize) * 5) / 6) as i32) +
                listStartY / 2) as i32);

        for (let k3 = listEntryPosition; k3 < listEntryCount; k3++) {
            let textColour: i32;

            if (this.controlUseAlternativeColour[control]) {
                textColour = 0xffffff;
            } else {
                textColour = 0;
            }

            if (
                this.mouseX >= x + 2 &&
                this.mouseX <=
                    //x + 2 + this.surface.textWidth(listEntries[k3], textSize) &&
                    x + width - 12 &&
                this.mouseY - 2 <= listY &&
                this.mouseY - 2 > listY - this.surface.textHeight(textSize)
            ) {
                if (this.controlUseAlternativeColour[control]) {
                    textColour = 0x808080;
                } else {
                    textColour = 0xffffff;
                }

                this.controlListEntryMouseOver[control] = k3;

                if (this.mouseLastButtonDown == 1) {
                    this.controlListEntryMouseButtonDown[control] = k3;
                    this.controlClicked[control] = true;
                }
            }

            if (
                this.controlListEntryMouseButtonDown[control] == k3 &&
                this.aBoolean219
            ) {
                textColour = 0xff0000;
            }

            this.surface.drawString(
                listEntries[k3]!,
                x + 2,
                listY,
                textSize,
                textColour
            );

            listY += this.surface.textHeight(textSize);

            if (listY >= y + height) {
                return;
            }
        }
    }

    addText(x: i32, y: i32, text: string, size: i32, flag: i32): i32 {
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlTextSize[this.controlCount] = size;
        this.controlUseAlternativeColour[this.controlCount] = flag;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlText[this.controlCount] = text;

        return this.controlCount++;
    }

    addTextCentre(x: i32, y: i32, text: string, size: i32, flag: i32): i32 {
        this.controlType[this.controlCount] = ControlTypes.CentreText;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlTextSize[this.controlCount] = size;
        this.controlUseAlternativeColour[this.controlCount] = flag;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlText[this.controlCount] = text;

        return this.controlCount++;
    }

    addButtonBackground(x: i32, y: i32, width: i32, height: i32): i32 {
        this.controlType[this.controlCount] = ControlTypes.GradientBackground;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlX[this.controlCount] = x - ((width / 2) as i32);
        this.controlY[this.controlCount] = y - ((height / 2) as i32);
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;

        return this.controlCount++;
    }

    addBoxRounded(x: i32, y: i32, width: i32, height: i32): i32 {
        this.controlType[this.controlCount] = ControlTypes.RoundBox;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlX[this.controlCount] = x - ((width / 2) as i32);
        this.controlY[this.controlCount] = y - ((height / 2) as i32);
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;

        return this.controlCount++;
    }

    addSprite(x: i32, y: i32, spriteID: i32): i32 {
        const width = this.surface.spriteWidth[spriteID];
        const height = this.surface.spriteHeight[spriteID];

        this.controlType[this.controlCount] = ControlTypes.Image;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlX[this.controlCount] = x - ((width / 2) as i32);
        this.controlY[this.controlCount] = y - ((height / 2) as i32);
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;
        this.controlTextSize[this.controlCount] = spriteID;

        return this.controlCount++;
    }

    addTextList(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        size: i32,
        maxLength: i32,
        flag: bool
    ): i32 {
        this.controlType[this.controlCount] = ControlTypes.TextList;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;
        this.controlUseAlternativeColour[this.controlCount] = flag;
        this.controlTextSize[this.controlCount] = size;
        this.controlInputMaxLen[this.controlCount] = maxLength;
        this.controlListEntryCount[this.controlCount] = 0;
        this.controlFlashText[this.controlCount] = 0;

        this.controlListEntries[this.controlCount] = new StaticArray<
            string | null
        >(maxLength);

        return this.controlCount++;
    }

    addTextListInput(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        size: i32,
        maxLength: i32,
        flag: bool,
        flag1: bool
    ): i32 {
        this.controlType[this.controlCount] = ControlTypes.ListInput;
        this.controlShown[this.controlCount] = true;
        this.controlMaskText[this.controlCount] = flag;
        this.controlClicked[this.controlCount] = false;
        this.controlTextSize[this.controlCount] = size;
        this.controlUseAlternativeColour[this.controlCount] = flag1;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;
        this.controlInputMaxLen[this.controlCount] = maxLength;
        this.controlText[this.controlCount] = '';

        return this.controlCount++;
    }

    addTextInput(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        size: i32,
        maxLength: i32,
        isPassword: i32,
        flag1: bool
    ): i32 {
        this.controlType[this.controlCount] = ControlTypes.TextInput;
        this.controlShown[this.controlCount] = true;
        this.controlMaskText[this.controlCount] = isPassword;
        this.controlClicked[this.controlCount] = false;
        this.controlTextSize[this.controlCount] = size;
        this.controlUseAlternativeColour[this.controlCount] = flag1;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;
        this.controlInputMaxLen[this.controlCount] = maxLength;
        this.controlText[this.controlCount] = '';

        return this.controlCount++;
    }

    addTextListInteractive(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        textSize: i32,
        maxLength: i32,
        flag: bool
    ): i32 {
        this.controlType[this.controlCount] = ControlTypes.InteractiveTextList;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlTextSize[this.controlCount] = textSize;
        this.controlUseAlternativeColour[this.controlCount] = flag;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;
        this.controlInputMaxLen[this.controlCount] = maxLength;

        this.controlListEntries[this.controlCount] = new StaticArray<
            string | null
        >(maxLength);

        this.controlListEntryCount[this.controlCount] = 0;
        this.controlFlashText[this.controlCount] = 0;
        this.controlListEntryMouseButtonDown[this.controlCount] = -1;
        this.controlListEntryMouseOver[this.controlCount] = -1;

        return this.controlCount++;
    }

    addButton(x: i32, y: i32, width: i32, height: i32): i32 {
        this.controlType[this.controlCount] = ControlTypes.Button;
        this.controlShown[this.controlCount] = true;
        this.controlClicked[this.controlCount] = false;
        this.controlX[this.controlCount] = x - ((width / 2) as i32);
        this.controlY[this.controlCount] = y - ((height / 2) as i32);
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;

        return this.controlCount++;
    }

    addLineHoriz(x: i32, y: i32, width: i32): i32 {
        this.controlType[this.controlCount] = ControlTypes.HorizontalLine;
        this.controlShown[this.controlCount] = true;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlWidth[this.controlCount] = width;

        return this.controlCount++;
    }

    addOptionListHoriz(
        x: i32,
        y: i32,
        textSize: i32,
        maxListCount: i32,
        useAltColour: bool
    ): i32 {
        this.controlType[this.controlCount] = ControlTypes.HorizontalOption;
        this.controlShown[this.controlCount] = true;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlTextSize[this.controlCount] = textSize;

        this.controlListEntries[this.controlCount] = new StaticArray<
            string | null
        >(maxListCount);

        this.controlListEntryCount[this.controlCount] = 0;
        this.controlUseAlternativeColour[this.controlCount] = useAltColour;
        this.controlClicked[this.controlCount] = false;

        return this.controlCount++;
    }

    addOptionListVert(
        x: i32,
        y: i32,
        textSize: i32,
        maxListCount: i32,
        useAltColour: bool
    ): i32 {
        this.controlType[this.controlCount] = ControlTypes.VerticalOption;
        this.controlShown[this.controlCount] = true;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlTextSize[this.controlCount] = textSize;

        this.controlListEntries[this.controlCount] = new StaticArray<
            string | null
        >(maxListCount);

        this.controlListEntryCount[this.controlCount] = 0;
        this.controlUseAlternativeColour[this.controlCount] = useAltColour;
        this.controlClicked[this.controlCount] = false;

        return this.controlCount++;
    }

    addCheckbox(x: i32, y: i32, width: i32, height: i32): i32 {
        this.controlType[this.controlCount] = ControlTypes.Checkbox;
        this.controlShown[this.controlCount] = true;
        this.controlX[this.controlCount] = x;
        this.controlY[this.controlCount] = y;
        this.controlWidth[this.controlCount] = width;
        this.controlHeight[this.controlCount] = height;
        this.controlListEntryMouseButtonDown[this.controlCount] = 0;

        return this.controlCount++;
    }

    toggleCheckbox(control: i32, activated: bool): void {
        this.controlListEntryMouseButtonDown[control] = activated;
    }

    isActivated(control: i32): bool {
        return this.controlListEntryMouseButtonDown[control] != 0;
    }

    clearList(control: i32): void {
        this.controlListEntryCount[control] = 0;
    }

    resetListProps(control: i32): void {
        this.controlFlashText[control] = 0;
        this.controlListEntryMouseOver[control] = -1;
    }

    addListEntry(control: i32, index: i32, text: string): void {
        this.controlListEntries[control]![index] = text;

        if (index + 1 > this.controlListEntryCount[control]) {
            this.controlListEntryCount[control] = index + 1;
        }
    }

    removeListEntry(control: i32, text: string, flag: bool): void {
        let index = this.controlListEntryCount[control]++;

        if (index >= this.controlInputMaxLen[control]) {
            index--;

            this.controlListEntryCount[control]--;

            for (let i = 0; i < index; i++) {
                this.controlListEntries[control]![i] = this.controlListEntries[
                    control
                ]![i + 1];
            }
        }

        this.controlListEntries[control]![index] = text;

        if (flag) {
            this.controlFlashText[control] = 999999;
        }
    }

    updateText(control: i32, text: string): void {
        this.controlText[control] = text;
    }

    getText(control: i32): string {
        if (!this.controlText[control]) {
            return 'null';
        } else {
            return this.controlText[control]!;
        }
    }

    show(control: i32): void {
        this.controlShown[control] = true;
    }

    hide(control: i32): void {
        this.controlShown[control] = false;
    }

    setFocus(control: i32): void {
        this.focusControlIndex = control;
        this.setMobileFocus(control, this.controlText[control]!);
    }

    getListEntryIndex(control: i32): i32 {
        return this.controlListEntryMouseOver[control];
    }

    setMobileFocus(control: i32, text: string): void {
        const mudclient = this.surface.mudclient;

        if (!mudclient.options.mobile) {
            return;
        }

        const isPassword = this.controlMaskText[control];

        const isListInput =
            this.controlType[control] === ControlTypes.ListInput;

        const width = this.controlWidth[control];
        const height = this.controlHeight[control];

        const left = isListInput
            ? this.controlX[control]
            : this.controlX[control] - Math.floor(width / 2);

        /*mudclient.openKeyboard(
            isPassword ? 'password' : 'text',
            text,
            this.controlInputMaxLen[control],
            {
                width: `${width}px`,
                height: `${height}px`,
                top: `${this.controlY[control] - Math.floor(height / 2)}px`,
                left: `${left}px`,
                fontSize: isListInput ? '12px' : '14px',
                textAlign: isListInput ? 'left' : 'center'
            }
        );*/
    }
}
