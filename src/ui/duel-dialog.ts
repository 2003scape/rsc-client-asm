drawDialogDuel(): void {
    if (this.mouseButtonClick != 0 && this.mouseButtonItemCountIncrement == 0) {
        this.mouseButtonItemCountIncrement = 1;
    }

    if (this.mouseButtonItemCountIncrement > 0) {
        let mouseX = this.mouseX - 22;
        let mouseY = this.mouseY - 36;

        if (mouseX >= 0 && mouseY >= 0 && mouseX < 468 && mouseY < 262) {
            if (mouseX > 216 && mouseY > 30 && mouseX < 462 && mouseY < 235) {
                let slot =
                    ((((mouseX - 217) as i32) / 49) as i32) +
                    (((mouseY - 31) / 34) as i32) * 5;
                if (slot >= 0 && slot < this.inventoryItemsCount) {
                    let sendUpdate = false;
                    let l1 = 0;
                    let item = this.inventoryItemId[slot];

                    for (let k3 = 0; k3 < this.duelOfferItemCount; k3++) {
                        if (unchecked(this.duelOfferItemId[k3]) == item) {
                            if (unchecked(GameData.itemStackable[item]) == 0) {
                                for (
                                    let i4 = 0;
                                    i4 < this.mouseButtonItemCountIncrement;
                                    i4++
                                ) {
                                    if (
                                        unchecked(this.duelOfferItemStack[k3]) <
                                        unchecked(
                                            this.inventoryItemStackCount[slot]
                                        )
                                    ) {
                                        unchecked(
                                            this.duelOfferItemStack[k3]++
                                        );
                                    }

                                    sendUpdate = true;
                                }
                            } else {
                                l1++;
                            }
                        }
                    }

                    if (this.getInventoryCount(item) <= l1) {
                        sendUpdate = true;
                    }

                    if (unchecked(GameData.itemSpecial[item]) == 1) {
                        this.showMessage(
                            'This object cannot be added to a duel offer',
                            3
                        );

                        sendUpdate = true;
                    }

                    if (!sendUpdate && this.duelOfferItemCount < 8) {
                        unchecked(
                            (this.duelOfferItemId[
                                this.duelOfferItemCount
                            ] = item)
                        );

                        unchecked(
                            (this.duelOfferItemStack[
                                this.duelOfferItemCount
                            ] = 1)
                        );

                        this.duelOfferItemCount++;
                        sendUpdate = true;
                    }

                    if (sendUpdate) {
                        this.packetStream!.newPacket(
                            ClientOpcodes.DUEL_ITEM_UPDATE
                        );

                        this.packetStream!.putByte(this.duelOfferItemCount);

                        for (let j4 = 0; j4 < this.duelOfferItemCount; j4++) {
                            this.packetStream!.putShort(
                                unchecked(this.duelOfferItemId[j4])
                            );

                            this.packetStream!.putInt(
                                unchecked(this.duelOfferItemStack[j4])
                            );
                        }

                        this.packetStream!.sendPacket();
                        this.duelOfferOpponentAccepted = false;
                        this.duelOfferAccepted = false;
                    }
                }
            }

            if (mouseX > 8 && mouseY > 30 && mouseX < 205 && mouseY < 129) {
                let slot =
                    (((mouseX - 9) / 49) as i32) +
                    (((mouseY - 31) / 34) as i32) * 4;

                if (slot >= 0 && slot < this.duelOfferItemCount) {
                    let j1 = unchecked(this.duelOfferItemId[slot]);

                    for (
                        let i2 = 0;
                        i2 < this.mouseButtonItemCountIncrement;
                        i2++
                    ) {
                        if (
                            unchecked(GameData.itemStackable[j1]) == 0 &&
                            unchecked(this.duelOfferItemStack[slot]) > 1
                        ) {
                            unchecked(this.duelOfferItemStack[slot]--);
                            continue;
                        }

                        this.duelOfferItemCount--;
                        this.mouseButtonDownTime = 0;

                        for (
                            let l2 = slot;
                            l2 < this.duelOfferItemCount;
                            l2++
                        ) {
                            unchecked(
                                (this.duelOfferItemId[
                                    l2
                                ] = this.duelOfferItemId[l2 + 1])
                            );

                            unchecked(
                                (this.duelOfferItemStack[
                                    l2
                                ] = this.duelOfferItemStack[l2 + 1])
                            );
                        }

                        break;
                    }

                    this.packetStream!.newPacket(
                        ClientOpcodes.DUEL_ITEM_UPDATE
                    );

                    this.packetStream!.putByte(this.duelOfferItemCount);

                    for (let i3 = 0; i3 < this.duelOfferItemCount; i3++) {
                        this.packetStream!.putShort(
                            unchecked(this.duelOfferItemId[i3])
                        );

                        this.packetStream!.putInt(
                            unchecked(this.duelOfferItemStack[i3])
                        );
                    }

                    this.packetStream!.sendPacket();
                    this.duelOfferOpponentAccepted = false;
                    this.duelOfferAccepted = false;
                }
            }

            let flag = false;

            if (
                mouseX >= 93 &&
                mouseY >= 221 &&
                mouseX <= 104 &&
                mouseY <= 232
            ) {
                this.duelSettingsRetreat = !this.duelSettingsRetreat;
                flag = true;
            }

            if (
                mouseX >= 93 &&
                mouseY >= 240 &&
                mouseX <= 104 &&
                mouseY <= 251
            ) {
                this.duelSettingsMagic = !this.duelSettingsMagic;
                flag = true;
            }

            if (
                mouseX >= 191 &&
                mouseY >= 221 &&
                mouseX <= 202 &&
                mouseY <= 232
            ) {
                this.duelSettingsPrayer = !this.duelSettingsPrayer;
                flag = true;
            }

            if (
                mouseX >= 191 &&
                mouseY >= 240 &&
                mouseX <= 202 &&
                mouseY <= 251
            ) {
                this.duelSettingsWeapons = !this.duelSettingsWeapons;
                flag = true;
            }

            if (flag) {
                this.packetStream!.newPacket(ClientOpcodes.DUEL_SETTINGS);
                this.packetStream!.putByte(this.duelSettingsRetreat ? 1 : 0);
                this.packetStream!.putByte(this.duelSettingsMagic ? 1 : 0);
                this.packetStream!.putByte(this.duelSettingsPrayer ? 1 : 0);
                this.packetStream!.putByte(this.duelSettingsWeapons ? 1 : 0);
                this.packetStream!.sendPacket();

                this.duelOfferOpponentAccepted = false;
                this.duelOfferAccepted = false;
            }

            if (
                mouseX >= 217 &&
                mouseY >= 238 &&
                mouseX <= 286 &&
                mouseY <= 259
            ) {
                this.duelOfferAccepted = true;
                this.packetStream!.newPacket(ClientOpcodes.DUEL_ACCEPT);
                this.packetStream!.sendPacket();
            }

            if (
                mouseX >= 394 &&
                mouseY >= 238 &&
                mouseX < 463 &&
                mouseY < 259
            ) {
                this.showDialogDuel = false;
                this.packetStream!.newPacket(ClientOpcodes.DUEL_DECLINE);
                this.packetStream!.sendPacket();
            }
        } else if (this.mouseButtonClick != 0) {
            this.showDialogDuel = false;
            this.packetStream!.newPacket(ClientOpcodes.DUEL_DECLINE);
            this.packetStream!.sendPacket();
        }

        this.mouseButtonClick = 0;
        this.mouseButtonItemCountIncrement = 0;
    }

    if (!this.showDialogDuel) {
        return;
    }

    //let dialogX = this.gameWidth / 2 - 468 / 2 + 22;
    //let dialogY = this.gameHeight / 2 - 262 / 2 + 22;
    let dialogX = 22;
    let dialogY = 36;

    this.surface!.drawBox(dialogX, dialogY, 468, 12, 0xc90b1d);
    this.surface!.drawBoxAlpha(dialogX, dialogY + 12, 468, 18, 0x989898, 160);
    this.surface!.drawBoxAlpha(dialogX, dialogY + 30, 8, 248, 0x989898, 160);

    this.surface!.drawBoxAlpha(
        dialogX + 205,
        dialogY + 30,
        11,
        248,
        0x989898,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 462,
        dialogY + 30,
        6,
        248,
        0x989898,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 8,
        dialogY + 99,
        197,
        24,
        0x989898,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 8,
        dialogY + 192,
        197,
        23,
        0x989898,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 8,
        dialogY + 258,
        197,
        20,
        0x989898,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 216,
        dialogY + 235,
        246,
        43,
        0x989898,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 8,
        dialogY + 30,
        197,
        69,
        0xd0d0d0,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 8,
        dialogY + 123,
        197,
        69,
        0xd0d0d0,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 8,
        dialogY + 215,
        197,
        43,
        0xd0d0d0,
        160
    );

    this.surface!.drawBoxAlpha(
        dialogX + 216,
        dialogY + 30,
        246,
        205,
        0xd0d0d0,
        160
    );

    for (let j2 = 0; j2 < 3; j2++) {
        this.surface!.drawLineHoriz(
            dialogX + 8,
            dialogY + 30 + j2 * 34,
            197,
            0
        );
    }

    for (let j3 = 0; j3 < 3; j3++) {
        this.surface!.drawLineHoriz(
            dialogX + 8,
            dialogY + 123 + j3 * 34,
            197,
            0
        );
    }

    for (let l3 = 0; l3 < 7; l3++) {
        this.surface!.drawLineHoriz(
            dialogX + 216,
            dialogY + 30 + l3 * 34,
            246,
            0
        );
    }

    for (let k4 = 0; k4 < 6; k4++) {
        if (k4 < 5) {
            this.surface!.drawLineVert(
                dialogX + 8 + k4 * 49,
                dialogY + 30,
                69,
                0
            );
        }

        if (k4 < 5) {
            this.surface!.drawLineVert(
                dialogX + 8 + k4 * 49,
                dialogY + 123,
                69,
                0
            );
        }

        this.surface!.drawLineVert(
            dialogX + 216 + k4 * 49,
            dialogY + 30,
            205,
            0
        );
    }

    this.surface!.drawLineHoriz(dialogX + 8, dialogY + 215, 197, 0);
    this.surface!.drawLineHoriz(dialogX + 8, dialogY + 257, 197, 0);
    this.surface!.drawLineVert(dialogX + 8, dialogY + 215, 43, 0);
    this.surface!.drawLineVert(dialogX + 204, dialogY + 215, 43, 0);

    this.surface!.drawString(
        'Preparing to duel with: ' + this.duelOpponentName,
        dialogX + 1,
        dialogY + 10,
        1,
        0xffffff
    );

    this.surface!.drawString(
        'Your Stake',
        dialogX + 9,
        dialogY + 27,
        4,
        0xffffff
    );

    this.surface!.drawString(
        "Opponent's Stake",
        dialogX + 9,
        dialogY + 120,
        4,
        0xffffff
    );

    this.surface!.drawString(
        'Duel Options',
        dialogX + 9,
        dialogY + 212,
        4,
        0xffffff
    );

    this.surface!.drawString(
        'Your Inventory',
        dialogX + 216,
        dialogY + 27,
        4,
        0xffffff
    );

    this.surface!.drawString(
        'No retreating',
        dialogX + 8 + 1,
        dialogY + 215 + 16,
        3,
        0xffff00
    );

    this.surface!.drawString(
        'No magic',
        dialogX + 8 + 1,
        dialogY + 215 + 35,
        3,
        0xffff00
    );

    this.surface!.drawString(
        'No prayer',
        dialogX + 8 + 102,
        dialogY + 215 + 16,
        3,
        0xffff00
    );

    this.surface!.drawString(
        'No weapons',
        dialogX + 8 + 102,
        dialogY + 215 + 35,
        3,
        0xffff00
    );

    this.surface!.drawBoxEdge(
        dialogX + 93,
        dialogY + 215 + 6,
        11,
        11,
        0xffff00
    );

    if (this.duelSettingsRetreat) {
        this.surface!.drawBox(dialogX + 95, dialogY + 215 + 8, 7, 7, 0xffff00);
    }

    this.surface!.drawBoxEdge(
        dialogX + 93,
        dialogY + 215 + 25,
        11,
        11,
        0xffff00
    );

    if (this.duelSettingsMagic) {
        this.surface!.drawBox(dialogX + 95, dialogY + 215 + 27, 7, 7, 0xffff00);
    }

    this.surface!.drawBoxEdge(
        dialogX + 191,
        dialogY + 215 + 6,
        11,
        11,
        0xffff00
    );

    if (this.duelSettingsPrayer) {
        this.surface!.drawBox(dialogX + 193, dialogY + 215 + 8, 7, 7, 0xffff00);
    }

    this.surface!.drawBoxEdge(
        dialogX + 191,
        dialogY + 215 + 25,
        11,
        11,
        0xffff00
    );

    if (this.duelSettingsWeapons) {
        this.surface!.drawBox(
            dialogX + 193,
            dialogY + 215 + 27,
            7,
            7,
            0xffff00
        );
    }

    if (!this.duelOfferAccepted) {
        this.surface!._drawSprite_from3(
            dialogX + 217,
            dialogY + 238,
            this.spriteMedia + 25
        );
    }

    this.surface!._drawSprite_from3(
        dialogX + 394,
        dialogY + 238,
        this.spriteMedia + 26
    );

    if (this.duelOfferOpponentAccepted) {
        this.surface!.drawStringCenter(
            'Other player',
            dialogX + 341,
            dialogY + 246,
            1,
            0xffffff
        );

        this.surface!.drawStringCenter(
            'has accepted',
            dialogX + 341,
            dialogY + 256,
            1,
            0xffffff
        );
    }

    if (this.duelOfferAccepted) {
        this.surface!.drawStringCenter(
            'Waiting for',
            dialogX + 217 + 35,
            dialogY + 246,
            1,
            0xffffff
        );

        this.surface!.drawStringCenter(
            'other player',
            dialogX + 217 + 35,
            dialogY + 256,
            1,
            0xffffff
        );
    }

    for (let i = 0; i < this.inventoryItemsCount; i++) {
        let x = 217 + dialogX + (i % 5) * 49;
        let y = 31 + dialogY + ((i / 5) as i32) * 34;
        this.surface!._spriteClipping_from9(
            x,
            y,
            48,
            32,
            this.spriteItem + GameData.itemPicture[this.inventoryItemId[i]],
            GameData.itemMask[this.inventoryItemId[i]],
            0,
            0,
            false
        );

        if (GameData.itemStackable[this.inventoryItemId[i]] == 0) {
            this.surface!.drawString(
                this.inventoryItemStackCount[i].toString(),
                x + 1,
                y + 10,
                1,
                0xffff00
            );
        }
    }

    for (let i = 0; i < this.duelOfferItemCount; i++) {
        let x = 9 + dialogX + (i % 4) * 49;
        let y = 31 + dialogY + ((i / 4) as i32) * 34;

        this.surface!._spriteClipping_from9(
            x,
            y,
            48,
            32,
            this.spriteItem +
                unchecked(GameData.itemPicture[this.duelOfferItemId[i]]),
            unchecked(GameData.itemMask[this.duelOfferItemId[i]]),
            0,
            0,
            false
        );

        if (unchecked(GameData.itemStackable[this.duelOfferItemId[i]]) == 0) {
            this.surface!.drawString(
                this.duelOfferItemStack[i].toString(),
                x + 1,
                y + 10,
                1,
                0xffff00
            );
        }

        if (
            this.mouseX > x &&
            this.mouseX < x + 48 &&
            this.mouseY > y &&
            this.mouseY < y + 32
        ) {
            this.surface!.drawString(
                unchecked(GameData.itemName[this.duelOfferItemId[i]]) +
                    ': @whi@' +
                    unchecked(
                        GameData.itemDescription[this.duelOfferItemId[i]]
                    ),
                dialogX + 8,
                dialogY + 273,
                1,
                0xffff00
            );
        }
    }

    for (let i = 0; i < this.duelOfferOpponentItemCount; i++) {
        let x = 9 + dialogX + (i % 4) * 49;
        let y = 124 + dialogY + ((i / 4) as i32) * 34;

        this.surface!._spriteClipping_from9(
            x,
            y,
            48,
            32,
            this.spriteItem +
                unchecked(
                    GameData.itemPicture[this.duelOfferOpponentItemId[i]]
                ),
            unchecked(GameData.itemMask[this.duelOfferOpponentItemId[i]]),
            0,
            0,
            false
        );

        if (
            unchecked(
                GameData.itemStackable[this.duelOfferOpponentItemId[i]]
            ) == 0
        ) {
            this.surface!.drawString(
                this.duelOfferOpponentItemStack[i].toString(),
                x + 1,
                y + 10,
                1,
                0xffff00
            );
        }

        if (
            this.mouseX > x &&
            this.mouseX < x + 48 &&
            this.mouseY > y &&
            this.mouseY < y + 32
        ) {
            this.surface!.drawString(
                unchecked(GameData.itemName[this.duelOfferOpponentItemId[i]]) +
                    ': @whi@' +
                    unchecked(
                        GameData.itemDescription[
                            this.duelOfferOpponentItemId[i]
                        ]
                    ),
                dialogX + 8,
                dialogY + 273,
                1,
                0xffff00
            );
        }
    }
}

drawDialogDuelConfirm(): void {
    let dialogX = 22;
    let dialogY = 36;

    this.surface!.drawBox(dialogX, dialogY, 468, 16, 192);
    this.surface!.drawBoxAlpha(dialogX, dialogY + 16, 468, 246, 0x989898, 160);

    this.surface!.drawStringCenter(
        'Please confirm your duel with @yel@' +
            decodeUsername(this.duelOpponentNameHash),
        dialogX + 234,
        dialogY + 12,
        1,
        0xffffff
    );

    this.surface!.drawStringCenter(
        'Your stake:',
        dialogX + 117,
        dialogY + 30,
        1,
        0xffff00
    );

    for (let i = 0; i < this.duelItemsCount; i++) {
        let s = unchecked(GameData.itemName[this.duelItems[i]]);

        if (unchecked(GameData.itemStackable[this.duelItems[i]]) == 0) {
            s += ` x ${formatConfirmAmount(this.duelItemCount[i])}`;
        }

        this.surface!.drawStringCenter(
            s,
            dialogX + 117,
            dialogY + 42 + i * 12,
            1,
            0xffffff
        );
    }

    if (this.duelItemsCount == 0) {
        this.surface!.drawStringCenter(
            'Nothing!',
            dialogX + 117,
            dialogY + 42,
            1,
            0xffffff
        );
    }

    this.surface!.drawStringCenter(
        "Your opponent's stake:",
        dialogX + 351,
        dialogY + 30,
        1,
        0xffff00
    );

    for (let i = 0; i < this.duelOpponentItemsCount; i++) {
        let s = unchecked(GameData.itemName[this.duelOpponentItems[i]]);

        if (unchecked(GameData.itemStackable[this.duelOpponentItems[i]]) == 0) {
            s += ` x ${formatConfirmAmount(this.duelOpponentItemCount[i])}`;
        }

        this.surface!.drawStringCenter(
            s,
            dialogX + 351,
            dialogY + 42 + i * 12,
            1,
            0xffffff
        );
    }

    if (this.duelOpponentItemsCount == 0) {
        this.surface!.drawStringCenter(
            'Nothing!',
            dialogX + 351,
            dialogY + 42,
            1,
            0xffffff
        );
    }

    if (this.duelOptionRetreat == 0) {
        this.surface!.drawStringCenter(
            'You can retreat from this duel',
            dialogX + 234,
            dialogY + 180,
            1,
            65280
        );
    } else {
        this.surface!.drawStringCenter(
            'No retreat is possible!',
            dialogX + 234,
            dialogY + 180,
            1,
            0xff0000
        );
    }

    if (this.duelOptionMagic == 0) {
        this.surface!.drawStringCenter(
            'Magic may be used',
            dialogX + 234,
            dialogY + 192,
            1,
            65280
        );
    } else {
        this.surface!.drawStringCenter(
            'Magic cannot be used',
            dialogX + 234,
            dialogY + 192,
            1,
            0xff0000
        );
    }

    if (this.duelOptionPrayer == 0) {
        this.surface!.drawStringCenter(
            'Prayer may be used',
            dialogX + 234,
            dialogY + 204,
            1,
            65280
        );
    } else {
        this.surface!.drawStringCenter(
            'Prayer cannot be used',
            dialogX + 234,
            dialogY + 204,
            1,
            0xff0000
        );
    }

    if (this.duelOptionWeapons == 0) {
        this.surface!.drawStringCenter(
            'Weapons may be used',
            dialogX + 234,
            dialogY + 216,
            1,
            65280
        );
    } else {
        this.surface!.drawStringCenter(
            'Weapons cannot be used',
            dialogX + 234,
            dialogY + 216,
            1,
            0xff0000
        );
    }

    this.surface!.drawStringCenter(
        "If you are sure click 'Accept' to begin the duel",
        dialogX + 234,
        dialogY + 230,
        1,
        0xffffff
    );

    if (!this.duelAccepted) {
        this.surface!._drawSprite_from3(
            dialogX + 118 - 35,
            dialogY + 238,
            this.spriteMedia + 25
        );
        this.surface!._drawSprite_from3(
            dialogX + 352 - 35,
            dialogY + 238,
            this.spriteMedia + 26
        );
    } else {
        this.surface!.drawStringCenter(
            'Waiting for other player...',
            dialogX + 234,
            dialogY + 250,
            1,
            0xffff00
        );
    }

    if (this.mouseButtonClick == 1) {
        if (
            this.mouseX < dialogX ||
            this.mouseY < dialogY ||
            this.mouseX > dialogX + 468 ||
            this.mouseY > dialogY + 262
        ) {
            this.showDialogDuelConfirm = false;
            this.packetStream!.newPacket(ClientOpcodes.TRADE_DECLINE);
            this.packetStream!.sendPacket();
        }

        if (
            this.mouseX >= dialogX + 118 - 35 &&
            this.mouseX <= dialogX + 118 + 70 &&
            this.mouseY >= dialogY + 238 &&
            this.mouseY <= dialogY + 238 + 21
        ) {
            this.duelAccepted = true;
            this.packetStream!.newPacket(ClientOpcodes.DUEL_CONFIRM_ACCEPT);
            this.packetStream!.sendPacket();
        }

        if (
            this.mouseX >= dialogX + 352 - 35 &&
            this.mouseX <= dialogX + 353 + 70 &&
            this.mouseY >= dialogY + 238 &&
            this.mouseY <= dialogY + 238 + 21
        ) {
            this.showDialogDuelConfirm = false;
            this.packetStream!.newPacket(ClientOpcodes.DUEL_DECLINE);
            this.packetStream!.sendPacket();
        }

        this.mouseButtonClick = 0;
    }
}
