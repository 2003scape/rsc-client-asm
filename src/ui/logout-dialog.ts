drawDialogLogout(): void {
    this.surface!.drawBox(126, 137, 260, 60, Colours.Black);
    this.surface!.drawBoxEdge(126, 137, 260, 60, Colours.White);

    this.surface!.drawStringCenter(
        'Logging out...',
        256,
        173,
        5,
        Colours.White
    );
}
