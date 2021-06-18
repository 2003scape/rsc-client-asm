panelMessageTabs: Panel | null;

controlTextListAll: i32;
controlTextListChat: i32;
controlTextListQuest: i32;
controlTextListPrivate: i32;

createMessageTabPanel(): void {
    const ALL_MAX_LENGTH = 80;
    const HISTORY_MAX_ENTRIES = 20;

    this.panelMessageTabs = new Panel(this.surface!, 10);

    let y = 269;

    if (this.options.mobile) {
        y = 15;
    }

    this.controlTextListAll = this.panelMessageTabs!.addTextListInput(
        7,
        y + 55 + (this.options.mobile ? 12 : 0),
        498,
        14,
        1,
        ALL_MAX_LENGTH,
        false,
        true
    );

    this.controlTextListChat = this.panelMessageTabs!.addTextList(
        5,
        y,
        502,
        56,
        1,
        HISTORY_MAX_ENTRIES,
        true
    );

    this.controlTextListQuest = this.panelMessageTabs!.addTextList(
        5,
        y,
        502,
        56,
        1,
        HISTORY_MAX_ENTRIES,
        true
    );

    this.controlTextListPrivate = this.panelMessageTabs!.addTextList(
        5,
        y,
        502,
        56,
        1,
        HISTORY_MAX_ENTRIES,
        true
    );

    if (!this.options.mobile) {
        this.panelMessageTabs!.setFocus(this.controlTextListAll);
    }
}

drawChatMessageTabs(): void {
    const HBAR_WIDTH = 512;

    const x = (this.gameWidth / 2 - HBAR_WIDTH / 2) as i32;
    let y = this.gameHeight - 4;

    if (this.options.mobile) {
        y = 8;

        this.surface!.drawMinimapSprite(
            x + HBAR_WIDTH / 2 - 103,
            y,
            this.spriteMedia + 23,
            128,
            128
        );

        this.surface!.drawMinimapSprite(
            x + HBAR_WIDTH / 2 + (404 as i32),
            y,
            this.spriteMedia + 23,
            128,
            128
        );

        y = 10;
    } else {
        this.surface!._drawSprite_from3(x, y, this.spriteMedia + 23);

        y = this.gameHeight + 6;
    }

    let textColour = Colours.ChatPurple;

    if (this.messageTabSelected == 0) {
        textColour = Colours.ChatOrange;
    }

    if (this.messageTabFlashAll % 30 > 15) {
        textColour = Colours.ChatRed;
    }

    this.surface!.drawStringCenter('All messages', x + 54, y, 0, textColour);

    textColour = Colours.ChatPurple;

    if (this.messageTabSelected == 1) {
        textColour = Colours.ChatOrange;
    }

    if (this.messageTabFlashHistory % 30 > 15) {
        textColour = Colours.ChatRed;
    }

    this.surface!.drawStringCenter('Chat history', x + 155, y, 0, textColour);

    textColour = Colours.ChatPurple;

    if (this.messageTabSelected == 2) {
        textColour = Colours.ChatOrange;
    }

    if (this.messageTabFlashQuest % 30 > 15) {
        textColour = Colours.ChatRed;
    }

    this.surface!.drawStringCenter('Quest history', x + 255, y, 0, textColour);

    textColour = Colours.ChatPurple;

    if (this.messageTabSelected == 3) {
        textColour = Colours.ChatOrange;
    }

    if (this.messageTabFlashPrivate % 30 > 15) {
        textColour = Colours.ChatRed;
    }

    this.surface!.drawStringCenter(
        'Private history',
        x + 355,
        y,
        0,
        textColour
    );

    this.surface!.drawStringCenter(
        'Report abuse',
        x + 457,
        y,
        0,
        Colours.White
    );
}

handleMesssageTabsInput_0(): void {
    const HBAR_WIDTH = 512;

    const x = (this.gameWidth / 2 - HBAR_WIDTH / 2) as i32;
    const mouseX = this.mouseX - x;

    if (
        (this.options.mobile && this.mouseY < 15) ||
        (!this.options.mobile && this.mouseY > this.gameHeight - 4)
    ) {
        if (mouseX > 15 && mouseX < 96 && this.lastMouseButtonDown == 1) {
            this.messageTabSelected = 0;
        }

        if (mouseX > 110 && mouseX < 194 && this.lastMouseButtonDown == 1) {
            this.messageTabSelected = 1;

            this.panelMessageTabs!.controlFlashText[
                this.controlTextListChat
            ] = 999999;
        }

        if (mouseX > 215 && mouseX < 295 && this.lastMouseButtonDown == 1) {
            this.messageTabSelected = 2;

            this.panelMessageTabs!.controlFlashText[
                this.controlTextListQuest
            ] = 999999;
        }

        if (mouseX > 315 && mouseX < 395 && this.lastMouseButtonDown == 1) {
            this.messageTabSelected = 3;

            this.panelMessageTabs!.controlFlashText[
                this.controlTextListPrivate
            ] = 999999;
        }

        if (mouseX > 417 && mouseX < 497 && this.lastMouseButtonDown == 1) {
            this.showDialogReportAbuseStep = 1;
            this.reportAbuseOffence = 0;
            this.inputTextCurrent = '';
            this.inputTextFinal = '';
        }

        this.lastMouseButtonDown = 0;
        this.mouseButtonDown = 0;
    }

    if (!(this.options.mobile && this.mouseY >= 72)) {
        this.panelMessageTabs!.handleMouse(
            this.mouseX,
            this.mouseY,
            this.lastMouseButtonDown,
            this.mouseButtonDown,
            this.mouseScrollDelta
        );
    }

    if (
        this.options.mobile &&
        this.lastMouseButtonDown
    ) {
        if (
            !this.panelMessageTabs!.controlText[this.controlTextListAll]!.length
        ) {
            this.panelMessageTabs!.focusControlIndex = -1;
        }
    }

    if (
        this.options.mobile &&
        this.lastMouseButtonDown &&
        this.showUITab < 3 &&
        this.mouseX <= 108 &&
        this.mouseY >= 72 &&
        this.mouseY <= 98
    ) {
        this.panelMessageTabs!.setFocus(this.controlTextListAll);
        this.lastMouseButtonDown = 0;
    }

    // prevent scrollbar clicking from affecting game
    if (
        this.messageTabSelected > 0 &&
        this.mouseX >= 494 &&
        this.mouseY >= this.gameHeight - 66
    ) {
        this.lastMouseButtonDown = 0;
    }

    if (this.panelMessageTabs!.isClicked(this.controlTextListAll)) {
        let message = this.panelMessageTabs!.getText(this.controlTextListAll);

        this.panelMessageTabs!.updateText(this.controlTextListAll, '');

        if (this.options.mobile) {
            this.panelMessageTabs!.focusControlIndex = -1;
        }

        if (message.startsWith('::')) {
            if (message.toLowerCase().startsWith('::closecon')) {
                //this.packetStream!.closeStream();
            } else if (message.toLowerCase().startsWith('::logout')) {
                //this.closeConnection();
            } else if (message.toLowerCase().startsWith('::lostcon')) {
                //await this.lostConnection();
            } else {
                this.sendCommandString(message.substring(2));
            }
        } else {
            const encodedMessage = ChatMessage.encode(message);

            this.sendChatMessage(ChatMessage.encodedBuffer, encodedMessage);

            message = ChatMessage.decode(
                ChatMessage.encodedBuffer,
                0,
                encodedMessage
            );

            /*if (this.options.wordFilter) {
                message = WordFilter.filter(message);
            }*/

            this.localPlayer.messageTimeout = 150;
            this.localPlayer.message = message;

            this.showMessage(`${this.localPlayer.name!}: ${message}`, 2);
        }
    }

    if (this.messageTabSelected == 0) {
        for (let i = 0; i < 5; i++) {
            if (this.messageHistoryTimeout[i] > 0) {
                this.messageHistoryTimeout[i]--;
            }
        }
    }
}

drawChatMessageTabsPanel(): void {
    if (this.messageTabSelected == 0) {
        let y = this.gameHeight - 18;

        if (this.options.mobile) {
            y = 74;
        }

        for (let i = 0; i < 5; i++) {
            if (this.messageHistoryTimeout[i] <= 0) {
                continue;
            }

            this.surface!.drawString(
                this.messageHistory[i]!,
                7,
                y - i * 12,
                1,
                Colours.Yellow
            );
        }
    }

    if (this.options.mobile && this.panelMessageTabs!.focusControlIndex == -1) {
        this.surface!.drawString('[Tap here to chat]', 6, 88, 2, Colours.White);
    }

    this.panelMessageTabs!.hide(this.controlTextListChat);
    this.panelMessageTabs!.hide(this.controlTextListQuest);
    this.panelMessageTabs!.hide(this.controlTextListPrivate);

    if (this.messageTabSelected == 1) {
        this.panelMessageTabs!.show(this.controlTextListChat);
    } else if (this.messageTabSelected == 2) {
        this.panelMessageTabs!.show(this.controlTextListQuest);
    } else if (this.messageTabSelected == 3) {
        this.panelMessageTabs!.show(this.controlTextListPrivate);
    }

    Panel.textListEntryHeightMod = 2;
    this.panelMessageTabs!.drawPanel();
    Panel.textListEntryHeightMod = 0;
}
