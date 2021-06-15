serverMessageBoxTop: bool;

drawDialogServerMessage(): void {
    const WIDTH = 400;
    let height = 100;

    if (this.serverMessageBoxTop) {
        //height = 450;
        height = 300;
    }

    this.surface.drawBox(
        256 - ((WIDTH / 2) as i32),
        167 - ((height / 2) as i32),
        WIDTH,
        height,
        Colours.black
    );

    this.surface.drawBoxEdge(
        256 - ((WIDTH / 2) as i32),
        167 - ((height / 2) as i32),
        WIDTH,
        height,
        Colours.White
    );

    this.surface.drawParagraph(
        this.serverMessage,
        256,
        167 - ((height / 2) as i32) + 20,
        1,
        Colours.White,
        WIDTH - 40
    );

    const offsetY = 157 + ((height / 2) as i32);
    let textColour = Colours.White;

    if (
        this.mouseY > offsetY - 12 &&
        this.mouseY <= offsetY &&
        this.mouseX > 106 &&
        this.mouseX < 406
    ) {
        textColour = Colours.Red;
    }

    this.surface.drawStringCenter(
        'Click here to close window',
        256,
        offsetY,
        1,
        textColour
    );

    if (this.mouseButtonClick == 1) {
        if (textColour == Colours.Red) {
            this.showDialogServerMessage = false;
        }

        if (
            (this.mouseX < 256 - ((WIDTH / 2) as i32) ||
                this.mouseX > 256 + ((WIDTH / 2) as i32)) &&
            (this.mouseY < 167 - ((height / 2) as i32) ||
                this.mouseY > 167 + ((height / 2) as i32))
        ) {
            this.showDialogServerMessage = false;
        }
    }

    this.mouseButtonClick = 0;
}
