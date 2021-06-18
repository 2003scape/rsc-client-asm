showDialogSocialInput: i32;

drawDialogSocialInput(): void {
    if (this.mouseButtonClick != 0) {
        this.mouseButtonClick = 0;

        if (
            this.showDialogSocialInput == 1 &&
            (this.mouseX < 106 ||
                this.mouseY < 145 ||
                this.mouseX > 406 ||
                this.mouseY > 215)
        ) {
            this.showDialogSocialInput = 0;
            return;
        }

        if (
            this.showDialogSocialInput == 2 &&
            (this.mouseX < 6 ||
                this.mouseY < 145 ||
                this.mouseX > 506 ||
                this.mouseY > 215)
        ) {
            this.showDialogSocialInput = 0;
            return;
        }

        if (
            this.showDialogSocialInput == 3 &&
            (this.mouseX < 106 ||
                this.mouseY < 145 ||
                this.mouseX > 406 ||
                this.mouseY > 215)
        ) {
            this.showDialogSocialInput = 0;
            return;
        }

        if (
            this.mouseX > 236 &&
            this.mouseX < 276 &&
            this.mouseY > 193 &&
            this.mouseY < 213
        ) {
            this.showDialogSocialInput = 0;
            return;
        }
    }

    let y = 145;

    if (this.showDialogSocialInput == 1) {
        this.surface!.drawBox(106, y, 300, 70, 0);
        this.surface!.drawBoxEdge(106, y, 300, 70, Colours.White);
        y += 20;
        this.surface!.drawStringCenter(
            'Enter name to add to friends list',
            256,
            y,
            4,
            Colours.White
        );

        y += 20;

        this.surface!.drawStringCenter(
            `${this.inputTextCurrent}*`,
            256,
            y,
            4,
            Colours.White
        );

        if (this.inputTextFinal.length > 0) {
            const username = this.inputTextFinal.trim();
            const encodedUsername = encodeUsername(username);

            this.inputTextCurrent = '';
            this.inputTextFinal = '';
            this.showDialogSocialInput = 0;

            if (
                username.length > 0 &&
                encodedUsername != this.localPlayer.hash
            ) {
                this.friendAdd(username);
            }
        }
    } else if (this.showDialogSocialInput == 2) {
        this.surface!.drawBox(6, y, 500, 70, 0);
        this.surface!.drawBoxEdge(6, y, 500, 70, Colours.White);

        y += 20;

        const targetName = decodeUsername(this.privateMessageTarget);

        this.surface!.drawStringCenter(
            `Enter message to send to ${targetName}`,
            256,
            y,
            4,
            Colours.White
        );

        y += 20;

        this.surface!.drawStringCenter(
            `${this.inputPMCurrent}*`,
            256,
            y,
            4,
            Colours.White
        );

        if (this.inputPMFinal.length > 0) {
            let message = this.inputPMFinal;

            this.inputPMCurrent = '';
            this.inputPMFinal = '';
            this.showDialogSocialInput = 0;

            const length = ChatMessage.encode(message);

            this.sendPrivateMessage(
                this.privateMessageTarget,
                ChatMessage.encodedBuffer,
                length
            );

            message = ChatMessage.decode(ChatMessage.encodedBuffer, 0, length);

            if (this.options.wordFilter) {
                //message = WordFilter.filter(message);
            }

            this.showServerMessage(`@pri@You tell ${targetName}: ${message}`);
        }
    } else if (this.showDialogSocialInput == 3) {
        this.surface!.drawBox(106, y, 300, 70, 0);
        this.surface!.drawBoxEdge(106, y, 300, 70, Colours.White);

        y += 20;

        this.surface!.drawStringCenter(
            'Enter name to add to ignore list',
            256,
            y,
            4,
            Colours.White
        );

        y += 20;

        this.surface!.drawStringCenter(
            `${this.inputTextCurrent}*`,
            256,
            y,
            4,
            Colours.White
        );

        if (this.inputTextFinal.length > 0) {
            const username = this.inputTextFinal.trim();
            const encodedUsername = encodeUsername(username);

            this.inputTextCurrent = '';
            this.inputTextFinal = '';
            this.showDialogSocialInput = 0;

            if (
                username.length > 0 &&
                encodedUsername != this.localPlayer.hash
            ) {
                this.ignoreAdd(username);
            }
        }
    }

    let textColour = Colours.White;

    if (
        this.mouseX > 236 &&
        this.mouseX < 276 &&
        this.mouseY > 193 &&
        this.mouseY < 213
    ) {
        textColour = Colours.Yellow;
    }

    this.surface!.drawStringCenter('Cancel', 256, 208, 1, textColour);
}

resetPMText(): void {
    this.inputPMCurrent = '';
    this.inputPMFinal = '';
}
