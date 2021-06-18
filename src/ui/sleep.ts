isSleeping: bool;
sleepingStatusText: string | null;

drawSleep(): void {
    this.surface!.fadeToBlack();

    if (Math.random() <= 0.15) {
        this.surface!.drawStringCenter(
            'ZZZ',
            (Math.random() * 80) as i32,
            (Math.random() * this.gameHeight) as i32,
            5,
            (Math.random() * Colours.White) as i32
        );
    }

    if (Math.random() <= 0.15) {
        this.surface!.drawStringCenter(
            'ZZZ',
            this.gameWidth - ((Math.random() * 80) as i32),
            (Math.random() * this.gameHeight) as i32,
            5,
            (Math.random() * Colours.White) as i32
        );
    }

    this.surface!.drawBox(
        ((this.gameWidth / 2) as i32) - 100,
        160,
        200,
        40,
        Colours.Black
    );

    this.surface!.drawStringCenter(
        'You are sleeping',
        (this.gameWidth / 2) as i32,
        50,
        7,
        Colours.Yellow
    );

    this.surface!.drawStringCenter(
        `Fatigue: ${((this.fatigueSleeping * 100) / 750) as i32}%`,
        (this.gameWidth / 2) as i32,
        90,
        7,
        Colours.Yellow
    );

    this.surface!.drawStringCenter(
        'When you want to wake up just use your',
        (this.gameWidth / 2) as i32,
        140,
        5,
        Colours.White
    );

    this.surface!.drawStringCenter(
        'keyboard to type the word in the box below',
        (this.gameWidth / 2) as i32,
        160,
        5,
        Colours.White
    );

    this.surface!.drawStringCenter(
        `${this.inputTextCurrent}*`,
        (this.gameWidth / 2) as i32,
        180,
        5,
        Colours.Cyan
    );

    if (!this.sleepingStatusText) {
        this.surface!._drawSprite_from3(
            ((this.gameWidth / 2) as i32) - 127,
            230,
            this.spriteTexture + 1
        );
    } else {
        this.surface!.drawStringCenter(
            this.sleepingStatusText!,
            (this.gameWidth / 2) as i32,
            260,
            5,
            Colours.Red
        );
    }

    this.surface!.drawBoxEdge(
        ((this.gameWidth / 2) as i32) - 128,
        229,
        257,
        42,
        Colours.White
    );

    this.drawChatMessageTabs();

    this.surface!.drawStringCenter(
        "If you can't read the word",
        (this.gameWidth / 2) as i32,
        290,
        1,
        Colours.White
    );

    this.surface!.drawStringCenter(
        `@yel@${
            this.options.mobile ? 'tap' : 'click'
        } here@whi@ to get a different one`,
        (this.gameWidth / 2) as i32,
        305,
        1,
        Colours.White
    );

    //this.surface!.draw(this.graphics, 0, 0);
}

handleSleepInput(): void {
    if (this.inputTextFinal.length > 0) {
        if (this.inputTextFinal.toLowerCase().startsWith('::lostcon')) {
            //this.packetStream!.closeStream();
        } else if (this.inputTextFinal.toLowerCase().startsWith('::closecon')) {
            //this.closeConnection();
        } else {
            this.packetStream!.newPacket(ClientOpcodes.SLEEP_WORD);
            this.packetStream!.putString(this.inputTextFinal);

            if (!this.sleepWordDelay) {
                this.packetStream!.putByte(0);
                this.sleepWordDelay = true;
            }

            this.packetStream!.sendPacket();

            this.inputTextCurrent = '';
            this.inputTextFinal = '';
            this.sleepingStatusText = 'Please wait...';
        }
    }

    if (
        this.lastMouseButtonDown == 1 &&
        this.mouseY > 275 &&
        this.mouseY < 310 &&
        this.mouseX > 56 &&
        this.mouseX < 456
    ) {
        this.packetStream!.newPacket(ClientOpcodes.SLEEP_WORD);
        this.packetStream!.putString('-null-');

        if (!this.sleepWordDelay) {
            this.packetStream!.putByte(0);
            this.sleepWordDelay = true;
        }

        this.packetStream!.sendPacket();

        this.inputTextCurrent = '';
        this.inputTextFinal = '';
        this.sleepingStatusText = 'Please wait...';
    }

    this.lastMouseButtonDown = 0;
}
