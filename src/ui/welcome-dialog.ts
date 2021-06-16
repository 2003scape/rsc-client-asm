showDialogWelcome: bool;
welcomeLastLoggedInHost: string = '';

drawDialogWelcome(): void {
    const WIDTH = 400;
    let height = 65;

    if (this.welcomeRecoverySetDays != 201) {
        height += 60;
    }

    if (this.welcomeUnreadMessages > 0) {
        height += 60;
    }

    if (this.welcomeLastLoggedInIP != 0) {
        height += 45;
    }

    let y = 167 - ((height / 2) as i32);

    this.surface!.drawBox(56, 167 - ((height / 2) as i32), WIDTH, height, 0);

    this.surface!.drawBoxEdge(
        56,
        167 - ((height / 2) as i32),
        WIDTH,
        height,
        Colours.White
    );

    y += 20;

    this.surface!.drawStringCenter(
        `Welcome to RuneScape ${this.loginUser}`,
        256,
        y,
        4,
        Colours.Yellow
    );

    y += 30;

    let daysAgo: string = '';

    if (this.welcomeLastLoggedInDays == 0) {
        daysAgo = 'earlier today';
    } else if (this.welcomeLastLoggedInDays == 1) {
        daysAgo = 'yesterday';
    } else {
        daysAgo = `${this.welcomeLastLoggedInDays} days ago`;
    }

    if (this.welcomeLastLoggedInIP != 0) {
        this.surface!.drawStringCenter(
            `You last logged in ${daysAgo}`,
            256,
            y,
            1,
            Colours.White
        );

        y += 15;

        if (!this.welcomeLastLoggedInHost) {
            this.welcomeLastLoggedInHost = ipToString(
                this.welcomeLastLoggedInIP
            );
        }

        this.surface!.drawStringCenter(
            'from: ' + this.welcomeLastLoggedInHost,
            256,
            y,
            1,
            Colours.White
        );

        y += 15;
        y += 15;
    }

    if (this.welcomeUnreadMessages > 0) {
        const textColour = Colours.White;

        this.surface!.drawStringCenter(
            'Jagex staff will NEVER email you. We use the',
            256,
            y,
            1,
            textColour
        );

        y += 15;

        this.surface!.drawStringCenter(
            'message-centre on this website instead.',
            256,
            y,
            1,
            textColour
        );

        y += 15;

        if (this.welcomeUnreadMessages == 1) {
            this.surface!.drawStringCenter(
                'You have @yel@0@whi@ unread messages in your message-centre',
                256,
                y,
                1,
                Colours.White
            );
        } else {
            this.surface!.drawStringCenter(
                'You have @gre@' +
                    (this.welcomeUnreadMessages - 1).toString() +
                    ' unread messages @whi@in your message-centre',
                256,
                y,
                1,
                Colours.White
            );
        }

        y += 15;
        y += 15;
    }

    if (this.welcomeRecoverySetDays != 201) {
        if (this.welcomeRecoverySetDays == 200) {
            this.surface!.drawStringCenter(
                'You have not yet set any password recovery questions.',
                256,
                y,
                1,
                Colours.Orange
            );

            y += 15;

            this.surface!.drawStringCenter(
                'We strongly recommend you do so now to secure your account.',
                256,
                y,
                1,
                Colours.Orange
            );

            y += 15;

            this.surface!.drawStringCenter(
                "Do this from the 'account management' area on our front " +
                    'webpage',
                256,
                y,
                1,
                Colours.Orange
            );

            y += 15;
        } else {
            let daysAgo: string = '';

            if (this.welcomeRecoverySetDays == 0) {
                daysAgo = 'Earlier today';
            } else if (this.welcomeRecoverySetDays == 1) {
                daysAgo = 'Yesterday';
            } else {
                daysAgo = `${this.welcomeRecoverySetDays} days ago`;
            }

            this.surface!.drawStringCenter(
                `${daysAgo} you changed your recovery questions`,
                256,
                y,
                1,
                Colours.Orange
            );

            y += 15;

            this.surface!.drawStringCenter(
                'If you do not remember making this change then cancel it ' +
                    'immediately',
                256,
                y,
                1,
                Colours.Orange
            );

            y += 15;

            this.surface!.drawStringCenter(
                "Do this from the 'account management' area on our front " +
                    'webpage',
                256,
                y,
                1,
                Colours.Orange
            );

            y += 15;
        }

        y += 15;
    }

    let textColour = Colours.White;

    if (
        this.mouseY > y - 12 &&
        this.mouseY <= y &&
        this.mouseX > 106 &&
        this.mouseX < 406
    ) {
        textColour = Colours.Red;
    }

    this.surface!.drawStringCenter(
        'Click here to close window',
        256,
        y,
        1,
        textColour
    );

    if (this.mouseButtonClick == 1) {
        if (textColour == Colours.Red) {
            this.showDialogWelcome = false;
        }

        if (
            (this.mouseX < 86 || this.mouseX > 426) &&
            (this.mouseY < 167 - ((height / 2) as i32) ||
                this.mouseY > 167 + ((height / 2) as i32))
        ) {
            this.showDialogWelcome = false;
        }
    }

    this.mouseButtonClick = 0;
}
