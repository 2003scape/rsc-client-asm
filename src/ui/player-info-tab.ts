uiTabPlayerInfoSubTab: i32;

drawUiTabPlayerInfo(noMenus: bool): void {
    const MENU_WIDTH = 245;

    const WIDTH = 196;
    const HEIGHT = 275;
    const LINE_BREAK = 12;

    const HALF_WIDTH = (WIDTH / 2) as i32;

    const TABS: StaticArray<string> = ['Stats', 'Quests'];
    const TAB_HEIGHT = 24;

    let uiX = this.gameWidth - WIDTH - 3;
    let uiY = 36;

    if (this.options.mobile) {
        uiX -= 32;
        uiY = (this.gameHeight / 2 - HEIGHT / 2) as i32;
    } else {
        this.surface!._drawSprite_from3(
            this.gameWidth - MENU_WIDTH - 3,
            3,
            this.spriteMedia + 3
        );
    }

    /*
    this.uiOpenX = uiX;
    this.uiOpenY = uiY;
    this.uiOpenWidth = WIDTH;
    this.uiOpenHeight = HEIGHT;
    */

    this.surface!.drawBoxAlpha(
        uiX,
        uiY + TAB_HEIGHT,
        WIDTH,
        HEIGHT - TAB_HEIGHT,
        Colours.LightGrey,
        128
    );

    this.surface!.drawLineHoriz(uiX, uiY + TAB_HEIGHT, WIDTH, Colours.Black);

    this.surface!.drawTabs(
        uiX,
        uiY,
        WIDTH,
        TAB_HEIGHT,
        TABS,
        this.uiTabPlayerInfoSubTab
    );

    // the handler for the Stats tab
    if (this.uiTabPlayerInfoSubTab == 0) {
        let y = uiY + 36;
        let selectedSkill = -1;

        this.surface!.drawString('Skills', uiX + 5, y, 3, Colours.Yellow);

        y += 13;

        // draw two columns with each skill name and current/base levels
        for (let i = 0; i < 9; i++) {
            // left column
            let textColour = Colours.White;

            if (
                this.mouseX > uiX + 3 &&
                this.mouseY >= y - 11 &&
                this.mouseY < y + 2 &&
                this.mouseX < uiX + 90
            ) {
                textColour = Colours.Red;
                selectedSkill = i;
            }

            this.surface!.drawString(
                `${SHORT_SKILL_NAMES[i]}:@yel@${this.playerStatCurrent[i]}/${this.playerStatBase[i]}`,
                uiX + 5,
                y,
                1,
                textColour
            );

            // right column
            textColour = Colours.White;

            if (
                this.mouseX >= uiX + 90 &&
                this.mouseY >= y - 13 - 11 &&
                this.mouseY < y - 13 + 2 &&
                this.mouseX < uiX + 196
            ) {
                textColour = Colours.Red;
                selectedSkill = i + 9;
            }

            this.surface!.drawString(
                `${SHORT_SKILL_NAMES[i + 9]}:@yel@` +
                    `${this.playerStatCurrent[i + 9]}/` +
                    this.playerStatBase[i + 9].toString(),
                uiX + HALF_WIDTH - 5,
                y - 13,
                1,
                textColour
            );

            y += 13;
        }

        this.surface!.drawString(
            `Quest Points:@yel@${this.playerQuestPoints}`,
            uiX + HALF_WIDTH - 5,
            y - 13,
            1,
            Colours.White
        );

        y += LINE_BREAK;

        this.surface!.drawString(
            `Fatigue: @yel@${((this.statFatigue * 100) / 750) as i32}%`,
            uiX + 5,
            y - 13,
            1,
            Colours.White
        );

        y += 8;

        this.surface!.drawString(
            'Equipment Status',
            uiX + 5,
            y,
            3,
            Colours.Yellow
        );

        y += LINE_BREAK;

        for (let i = 0; i < 3; i++) {
            this.surface!.drawString(
                `${EQUIPMENT_STAT_NAMES[i]}:@yel@${this.playerStatEquipment[i]}`,
                uiX + 5,
                y,
                1,
                Colours.White
            );

            if (i < 2) {
                this.surface!.drawString(
                    `${EQUIPMENT_STAT_NAMES[i + 3]}:@yel@${
                        this.playerStatEquipment[i + 3]
                    }`,
                    uiX + HALF_WIDTH + 25,
                    y,
                    1,
                    Colours.White
                );
            }

            y += 13;
        }

        y += 6;

        this.surface!.drawLineHoriz(uiX, y - 15, WIDTH, Colours.Black);

        if (selectedSkill !== -1) {
            this.surface!.drawString(
                `${SKILL_NAMES[selectedSkill]} skill`,
                uiX + 5,
                y,
                1,
                Colours.Yellow
            );

            y += LINE_BREAK;

            let nextLevelAt = EXPERIENCE_ARRAY[0];

            for (let i = 0; i < 98; i++) {
                if (
                    this.playerExperience[selectedSkill] >= EXPERIENCE_ARRAY[i]
                ) {
                    nextLevelAt = EXPERIENCE_ARRAY[i + 1];
                }
            }

            this.surface!.drawString(
                `Total xp: ${
                    (this.playerExperience[selectedSkill] / 4) as i32
                }`,
                uiX + 5,
                y,
                1,
                Colours.White
            );

            y += LINE_BREAK;

            this.surface!.drawString(
                `Next level at: ${(nextLevelAt / 4) as i32}`,
                uiX + 5,
                y,
                1,
                Colours.White
            );
        } else {
            this.surface!.drawString(
                'Overall levels',
                uiX + 5,
                y,
                1,
                Colours.Yellow
            );

            y += LINE_BREAK;

            let totalLevel = 0;

            for (let i = 0; i < SKILL_NAMES.length; i++) {
                totalLevel += this.playerStatBase[i];
            }

            this.surface!.drawString(
                `Skill total: ${totalLevel}`,
                uiX + 5,
                y,
                1,
                Colours.White
            );

            y += LINE_BREAK;

            this.surface!.drawString(
                `Combat level: ${this.localPlayer.level}`,
                uiX + 5,
                y,
                1,
                Colours.White
            );

            y += LINE_BREAK;
        }
    } else if (this.uiTabPlayerInfoSubTab == 1) {
        // the handler for the Quests tab
        this.panelQuestList!.clearList(this.controlListQuest);

        this.panelQuestList!.addListEntry(
            this.controlListQuest,
            0,
            '@whi@Quest-list (green=completed)'
        );

        for (let i = 0; i < QUEST_NAMES.length; i++) {
            this.panelQuestList!.addListEntry(
                this.controlListQuest,
                i + 1,
                (this.questComplete[i] ? '@gre@' : '@red@') + QUEST_NAMES[i]
            );
        }

        this.panelQuestList!.drawPanel();
    }

    if (!noMenus) {
        return;
    }

    const mouseX = this.mouseX - uiX;
    const mouseY = this.mouseY - uiY;

    // handle clicking of Stats and Quest tab, and the scroll wheel for the
    // quest list
    if (mouseX >= 0 && mouseY >= 0 && mouseX < WIDTH && mouseY < HEIGHT) {
        if (this.uiTabPlayerInfoSubTab == 1) {
            this.panelQuestList!.handleMouse(
                mouseX + uiX,
                mouseY + uiY,
                this.lastMouseButtonDown,
                this.mouseButtonDown,
                this.mouseScrollDelta
            );
        }

        if (mouseY <= TAB_HEIGHT && this.mouseButtonClick == 1) {
            if (mouseX < HALF_WIDTH) {
                this.uiTabPlayerInfoSubTab = 0;
            } else if (mouseX > HALF_WIDTH) {
                this.uiTabPlayerInfoSubTab = 1;
            }
        }
    }
}
