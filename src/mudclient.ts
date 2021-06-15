import ClientOpcodes from './opcodes/client';
import Colours from './ui/colours';
import GameCharacter from './game-character';
import GameConnection from './game-connection';
import GameData from './game-data';
import GameModel from './game-model';
import Scene from './scene';
import Surface from './surface';
import World from './world';
import { Int322DArray } from './lib/ndarray';

const ZOOM_MIN = 450;
const ZOOM_MAX = 1250;
const ZOOM_INDOORS = 550;
const ZOOM_OUTDOORS = 750;

const MENU_MAX = 250;
const PATH_STEPS_MAX = 8000;
const PLAYERS_MAX = 500;
const NPCS_MAX = 500;
const GAME_OBJECTS_MAX = 1000;
const WALL_OBJECTS_MAX = 500;
const PLAYERS_SERVER_MAX = 4000;
const GROUND_ITEMS_MAX = 5000;
const NPCS_SERVER_MAX = 5000;
const OBJECTS_MAX = 1500;
const PLAYER_STAT_COUNT = 18;
const QUEST_COUNT = 50;
const PLAYER_STAT_EQUIPMENT_COUNT = 5;

function arrayToIntArray(array: Array<i32>): Int32Array {
    const int32Array = new Int32Array(array.length);

    for (let i = 0; i < array.length; i += 1) {
        unchecked((int32Array[i] = array[i]));
    }

    return int32Array;
}

export default class mudclient extends GameConnection {
    localRegionX: i32;
    localRegionY: i32;
    messageTabSelected: i32;
    mouseClickXX: i32;
    mouseClickXY: i32;
    privateMessageTarget: i64;
    controlListQuest: i32;
    controlListMagic: i32;
    packetErrorCount: i32;
    mouseButtonDownTime: i32;
    mouseButtonItemCountIncrement: i32;
    animationIndex: i32;
    cameraRotationX: i32;
    tradeConfirmAccepted: bool;
    appearanceHeadType: i32;
    appearanceSkinColour: i32;
    anInt707: i32;
    deathScreenTimeout: i32;
    cameraRotationY: i32;
    welcomeUnreadMessages: i32;
    logoutTimeout: i32;
    tradeRecipientConfirmHash: i64;
    loginTimer: i32;

    npcCombatModelArray1: Int32Array = arrayToIntArray([
        0,
        1,
        2,
        1,
        0,
        0,
        0,
        0
    ]);

    npcCombatModelArray2: Int32Array = arrayToIntArray([
        0,
        0,
        0,
        0,
        0,
        1,
        2,
        1
    ]);

    systemUpdate: i32;
    regionX: i32;
    regionY: i32;
    welcomeScreenAlreadyShown: bool;
    mouseButtonClick: i32;
    healthBarCount: i32;
    spriteMedia: i32;
    spriteUtil: i32;
    spriteItem: i32;
    spriteProjectile: i32;
    spriteTexture: i32;
    spriteTextureWorld: i32;
    spriteLogo: i32;
    teleportBubbleCount: i32;
    mouseClickCount: i32;
    shopSellPriceMod: i32;
    shopBuyPriceMod: i32;
    duelOptionRetreat: i32;
    duelOptionMagic: i32;
    duelOptionPrayer: i32;
    duelOptionWeapons: i32;
    groundItemCount: i32;
    receivedMessagesCount: i32;
    messageTabFlashAll: i32;
    messageTabFlashHistory: i32;
    messageTabFlashQuest: i32;
    messageTabFlashPrivate: i32;
    bankItemCount: i32;
    objectAnimationNumberFireLightningSpell: i32;
    objectAnimationNumberTorch: i32;
    objectAnimationNumberClaw: i32;
    loggedIn: i32;
    npcCount: i32;
    npcCacheCount: i32;
    objectAnimationCount: i32;
    tradeConfirmItemsCount: i32;
    mouseClickXStep: i32;
    newBankItemCount: i32;
    loginScreen: i32;

    npcAnimationArray: Int322DArray = Int322DArray.fromArray([
        [11, 2, 9, 7, 1, 6, 10, 0, 5, 8, 3, 4],
        [11, 2, 9, 7, 1, 6, 10, 0, 5, 8, 3, 4],
        [11, 3, 2, 9, 7, 1, 6, 10, 0, 5, 8, 4],
        [3, 4, 2, 9, 7, 1, 6, 10, 8, 11, 0, 5],
        [3, 4, 2, 9, 7, 1, 6, 10, 8, 11, 0, 5],
        [4, 3, 2, 9, 7, 1, 6, 10, 8, 11, 0, 5],
        [11, 4, 2, 9, 7, 1, 6, 10, 0, 5, 8, 3],
        [11, 2, 9, 7, 1, 6, 10, 0, 5, 8, 4, 3]
    ]);

    npcWalkModel: Int32Array = arrayToIntArray([0, 1, 2, 1]);

    referID: i32;
    combatTimeout: i32;
    optionMenuCount: i32;
    errorLoadingCodebase: bool;
    cameraRotationTime: i32;
    duelOpponentItemsCount: i32;
    duelItemsCount: i32;
    duelOfferOpponentItemCount: i32;

    characterHairColours: Int32Array = arrayToIntArray([
        0xffc030,
        0xffa040,
        0x805030,
        0x604020,
        0x303030,
        0xff6020,
        0xff4000,
        0xffffff,
        65280,
        65535
    ]);

    characterTopBottomColours: Int32Array = arrayToIntArray([
        0xff0000,
        0xff8000,
        0xffe000,
        0xa0e000,
        0x00e000,
        0x008000,
        0x00a080,
        0x00b0ff,
        0x0080ff,
        0x0030f0,
        0xe000e0,
        0x303030,
        0x604000,
        0x805000,
        0xffffff
    ]);

    characterSkinColours: Int32Array = arrayToIntArray([
        0xecded0,
        0xccb366,
        0xb38c40,
        0x997326,
        0x906020
    ]);

    itemsAboveHeadCount: i32;
    statFatigue: i32;
    fatigueSleeping: i32;
    tradeRecipientConfirmItemsCount: i32;
    tradeRecipientItemsCount: i32;
    showDialogServerMessage: bool;
    menuX: i32;
    menuY: i32;
    menuWidth: i32;
    menuHeight: i32;
    menuItemsCount: i32;
    showUITab: i32;
    tradeItemsCount: i32;
    planeWidth: i32;
    planeHeight: i32;
    planeMultiplier: i32;
    playerQuestPoints: i32;
    welcomeLastLoggedInDays: i32;
    inventoryItemsCount: i32;
    duelOpponentNameHash: i64;
    minimapRandom1: i32;
    minimapRandom2: i32;
    objectCount: i32;
    duelOfferItemCount: i32;
    cameraAutoRotatePlayerX: i32;
    cameraAutoRotatePlayerY: i32;
    playerCount: i32;
    knownPlayerCount: i32;
    spriteCount: i32;
    wallObjectCount: i32;
    welcomeRecoverySetDays: i32;
    localLowerX: i32;
    localLowerY: i32;
    localUpperX: i32;
    localUpperY: i32;
    world: World | null;
    welcomeLastLoggedInIP: i32;
    sleepWordDelayTimer: i32;

    menuIndices: Int32Array = new Int32Array(MENU_MAX);
    cameraAutoAngleDebug: bool;
    wallObjectDirection: Int32Array = new Int32Array(WALL_OBJECTS_MAX);
    wallObjectId: Int32Array = new Int32Array(WALL_OBJECTS_MAX);
    cameraRotationXIncrement: i32 = 2;
    scene: Scene | null;
    inventoryMaxItemCount: i32 = 30;
    bankItemsMax: i32 = 48;

    optionMenuEntry: StaticArray<string | null> = new StaticArray<
        string | null
    >(5);

    newBankItems: Int32Array = new Int32Array(256);
    newBankItemsCount: Int32Array = new Int32Array(256);
    teleportBubbleTime: Int32Array = new Int32Array(50);
    receivedMessageX: Int32Array = new Int32Array(50);
    receivedMessageY: Int32Array = new Int32Array(50);
    receivedMessageMidPoint: Int32Array = new Int32Array(50);
    receivedMessageHeight: Int32Array = new Int32Array(50);
    localPlayer: GameCharacter = new GameCharacter();
    localPlayerServerIndex: i32 = -1;
    menuItemX: Int32Array = new Int32Array(MENU_MAX);
    menuItemY: Int32Array = new Int32Array(MENU_MAX);
    bankItems: Int32Array = new Int32Array(256);
    bankItemsCount: Int32Array = new Int32Array(256);
    appearanceBodyGender: i32 = 1;
    appearance2Colour: i32 = 2;
    appearanceHairColour: i32 = 2;
    appearanceTopColour: i32 = 8;
    appearanceBottomColour: i32 = 14;
    appearanceHeadGender: i32 = 1;
    loginUser: string = '';
    loginPass: string = '';
    cameraAngle: i32 = 1;
    members: bool;
    optionSoundDisabled: bool;
    showRightClickMenu: bool;
    cameraRotationYIncrement: i32 = 2;
    objectAlreadyInMenu: Int8Array = new Int8Array(OBJECTS_MAX);
    combatStyle: i32;

    menuItemText1: StaticArray<string | null> = new StaticArray<string | null>(
        MENU_MAX
    );

    duelOpponentName: string = '';
    lastObjectAnimationNumberFireLightningSpell: i32 = -1;
    lastObjectAnimationNumberTorch: i32 = -1;
    lastObjectAnimationNumberClaw: i32 = -1;
    planeIndex: i32 = -1;
    cameraRotation: i32 = 128;
    teleportBubbleX: Int32Array = new Int32Array(50);
    errorLoadingData: bool;
    playerExperience: Int32Array = new Int32Array(PLAYER_STAT_COUNT);
    tradeRecipientAccepted: bool;
    tradeAccepted: bool;
    mouseClickXHistory: Int32Array = new Int32Array(8192);
    mouseClickYHistory: Int32Array = new Int32Array(8192);
    playerServerIndexes: Int32Array = new Int32Array(PLAYERS_MAX);
    teleportBubbleY: Int32Array = new Int32Array(50);

    receivedMessages: StaticArray<string | null> = new StaticArray<
        string | null
    >(50);

    showDialogDuelConfirm: bool;
    duelAccepted: bool;

    players: StaticArray<GameCharacter | null> = new StaticArray<GameCharacter | null>(
        PLAYERS_MAX
    );

    prayerOn: Int8Array = new Int8Array(50);
    menuIndex: Int32Array = new Int32Array(MENU_MAX);
    menuSourceIndex: Int32Array = new Int32Array(MENU_MAX);
    menuTargetIndex: Int32Array = new Int32Array(MENU_MAX);
    wallObjectAlreadyInMenu: Int8Array = new Int8Array(WALL_OBJECTS_MAX);
    magicLoc: i32 = 128;
    errorLoadingMemory: bool;
    fogOfWar: bool;
    gameWidth: i32 = 512;
    gameHeight: i32 = 334;
    tradeConfirmItems: Int32Array = new Int32Array(14);
    tradeConfirmItemCount: Int32Array = new Int32Array(14);
    tradeRecipientName: string = '';
    selectedSpell: i32 = -1;
    showOptionMenu: bool;
    playerStatCurrent: Int32Array = new Int32Array(PLAYER_STAT_COUNT);
    teleportBubbleType: Int32Array = new Int32Array(50);
    showDialogShop: bool;
    shopItem: Int32Array = new Int32Array(256);
    shopItemCount: Int32Array = new Int32Array(256);
    shopItemPrice: Int32Array = new Int32Array(256);
    duelOfferOpponentAccepted: bool;
    duelOfferAccepted: bool;

    gameModels: StaticArray<GameModel | null> = new StaticArray<GameModel | null>(
        GAME_OBJECTS_MAX
    );

    showDialogDuel: bool;
    serverMessage: string = '';
    duelOpponentItems: Int32Array = new Int32Array(8);
    duelOpponentItemCount: Int32Array = new Int32Array(8);
    duelItems: Int32Array = new Int32Array(8);
    duelItemCount: Int32Array = new Int32Array(8);
    playerStatBase: Int32Array = new Int32Array(PLAYER_STAT_COUNT);

    npcsCache: StaticArray<GameCharacter | null> = new StaticArray<GameCharacter | null>(
        NPCS_MAX
    );

    groundItemX: Int32Array = new Int32Array(GROUND_ITEMS_MAX);
    groundItemY: Int32Array = new Int32Array(GROUND_ITEMS_MAX);
    groundItemID: Int32Array = new Int32Array(GROUND_ITEMS_MAX);
    groundItemZ: Int32Array = new Int32Array(GROUND_ITEMS_MAX);
    bankSelectedItemSlot: i32 = -1;
    bankSelectedItem: i32 = -2;
    duelOfferOpponentItemId: Int32Array = new Int32Array(8);
    duelOfferOpponentItemStack: Int32Array = new Int32Array(8);
    messageHistoryTimeout: Int32Array = new Int32Array(5);
    optionCameraModeAuto: bool = true;
    objectX: Int32Array = new Int32Array(OBJECTS_MAX);
    objectY: Int32Array = new Int32Array(OBJECTS_MAX);
    objectId: Int32Array = new Int32Array(OBJECTS_MAX);
    objectDirection: Int32Array = new Int32Array(OBJECTS_MAX);
    selectedItemInventoryIndex: i32 = -1;
    selectedItemName: string = '';
    loadingArea: bool;
    tradeRecipientConfirmItems: Int32Array = new Int32Array(14);
    tradeRecipientConfirmItemCount: Int32Array = new Int32Array(14);
    tradeRecipientItems: Int32Array = new Int32Array(14);
    tradeRecipientItemCount: Int32Array = new Int32Array(14);
    menuType: Int32Array = new Int32Array(MENU_MAX);
    questComplete: Int8Array = new Int8Array(QUEST_COUNT);

    wallObjectModel: StaticArray<GameModel | null> = new StaticArray<GameModel | null>(
        WALL_OBJECTS_MAX
    );

    actionBubbleX: Int32Array = new Int32Array(50);
    actionBubbleY: Int32Array = new Int32Array(50);
    cameraZoom: i32 = ZOOM_INDOORS; // 400-1250
    tradeItems: Int32Array = new Int32Array(14);
    tradeItemCount: Int32Array = new Int32Array(14);
    lastHeightOffset: i32 = -1;
    duelSettingsRetreat: bool;
    duelSettingsMagic: bool;
    duelSettingsPrayer: bool;
    duelSettingsWeapons: bool;
    showDialogBank: bool;
    loginUserDesc: string = '';
    loginUserDisp: string = '';
    optionMouseButtonOne: bool;
    inventoryItemId: Int32Array = new Int32Array(35);
    inventoryItemStackCount: Int32Array = new Int32Array(35);
    inventoryEquipped: Int32Array = new Int32Array(35);

    knownPlayers: StaticArray<GameCharacter | null> = new StaticArray<GameCharacter | null>(
        PLAYERS_MAX
    );

    messageHistory: StaticArray<string | null> = new StaticArray<string | null>(
        5
    );

    duelOfferItemId: Int32Array = new Int32Array(8);
    duelOfferItemStack: Int32Array = new Int32Array(8);
    actionBubbleScale: Int32Array = new Int32Array(50);
    actionBubbleItem: Int32Array = new Int32Array(50);
    sleepWordDelay: bool = true;
    showAppearanceChange: bool;
    shopSelectedItemIndex: i32 = -1;
    shopSelectedItemType: i32 = -2;
    projectileMaxRange: i32 = 40;

    npcs: StaticArray<GameCharacter | null> = new StaticArray<GameCharacter | null>(
        NPCS_MAX
    );

    experienceArray: Int32Array = new Int32Array(99);
    healthBarX: Int32Array = new Int32Array(50);
    healthBarY: Int32Array = new Int32Array(50);
    healthBarMissing: Int32Array = new Int32Array(50);

    playerServer: StaticArray<GameCharacter | null> = new StaticArray<GameCharacter | null>(
        PLAYERS_SERVER_MAX
    );

    walkPathX: Int32Array = new Int32Array(PATH_STEPS_MAX);
    walkPathY: Int32Array = new Int32Array(PATH_STEPS_MAX);
    wallObjectX: Int32Array = new Int32Array(WALL_OBJECTS_MAX);
    wallObjectY: Int32Array = new Int32Array(WALL_OBJECTS_MAX);
    menuItemText2: StaticArray<string | null> = new StaticArray<string | null>(
        MENU_MAX
    );

    npcsServer: StaticArray<GameCharacter | null> = new StaticArray<GameCharacter | null>(
        NPCS_SERVER_MAX
    );

    playerStatEquipment: Int32Array = new Int32Array(
        PLAYER_STAT_EQUIPMENT_COUNT
    );

    objectModel: StaticArray<GameModel | null> = new StaticArray<GameModel | null>(
        OBJECTS_MAX
    );

    surface: Surface | null;

    constructor() {
        super();
    }

    _walkToActionSource_from8(
        startX: i32,
        startY: i32,
        x1: i32,
        y1: i32,
        x2: i32,
        y2: i32,
        checkObjects: bool,
        walkToAction: bool
    ): bool {
        let steps = this.world!.route(
            startX,
            startY,
            x1,
            y1,
            x2,
            y2,
            this.walkPathX,
            this.walkPathY,
            checkObjects
        );

        if (steps == -1) {
            if (walkToAction) {
                steps = 1;
                unchecked((this.walkPathX[0] = x1));
                unchecked((this.walkPathY[0] = y1));
            } else {
                return false;
            }
        }

        steps--;
        startX = unchecked(this.walkPathX[steps]);
        startY = unchecked(this.walkPathY[steps]);
        steps--;

        if (walkToAction) {
            this.packetStream!.newPacket(ClientOpcodes.WALK_ACTION);
        } else {
            this.packetStream!.newPacket(ClientOpcodes.WALK);
        }

        this.packetStream!.putShort(startX + this.regionX);
        this.packetStream!.putShort(startY + this.regionY);

        if (walkToAction && steps == -1 && (startX + this.regionX) % 5 == 0) {
            steps = 0;
        }

        for (let i = steps; i >= 0 && i > steps - 25; i--) {
            this.packetStream!.putByte(unchecked(this.walkPathX[i]) - startX);
            this.packetStream!.putByte(unchecked(this.walkPathY[i]) - startY);
        }

        this.packetStream!.sendPacket();

        this.mouseClickXStep = -24;
        this.mouseClickXX = this.mouseX;
        this.mouseClickXY = this.mouseY;

        return true;
    }

    walkTo(
        startX: i32,
        startY: i32,
        x1: i32,
        y1: i32,
        x2: i32,
        y2: i32,
        checkObjects: bool,
        walkToAction: bool
    ): bool {
        let steps = this.world!.route(
            startX,
            startY,
            x1,
            y1,
            x2,
            y2,
            this.walkPathX,
            this.walkPathY,
            checkObjects
        );

        if (steps == -1) {
            return false;
        }

        steps--;
        startX = unchecked(this.walkPathX[steps]);
        startY = unchecked(this.walkPathY[steps]);
        steps--;

        if (walkToAction) {
            this.packetStream!.newPacket(ClientOpcodes.WALK_ACTION);
        } else {
            this.packetStream!.newPacket(ClientOpcodes.WALK);
        }

        this.packetStream!.putShort(startX + this.regionX);
        this.packetStream!.putShort(startY + this.regionY);

        if (walkToAction && steps == -1 && (startX + this.regionX) % 5 == 0) {
            steps = 0;
        }

        for (let i = steps; i >= 0 && i > steps - 25; i--) {
            this.packetStream!.putByte(unchecked(this.walkPathX[i]) - startX);
            this.packetStream!.putByte(unchecked(this.walkPathY[i]) - startY);
        }

        this.packetStream!.sendPacket();

        this.mouseClickXStep = -24;
        this.mouseClickXX = this.mouseX;
        this.mouseClickXY = this.mouseY;

        return true;
    }

    updateBankItems(): void {
        this.bankItemCount = this.newBankItemCount;

        for (let i = 0; i < this.newBankItemCount; i++) {
            unchecked((this.bankItems[i] = this.newBankItems[i]));
            unchecked((this.bankItemsCount[i] = this.newBankItemsCount[i]));
        }

        for (let i = 0; i < this.inventoryItemsCount; i++) {
            if (this.bankItemCount >= this.bankItemsMax) {
                break;
            }

            const inventoryID = unchecked(this.inventoryItemId[i]);
            let hasItemInInventory = false;

            for (let i = 0; i < this.bankItemCount; i++) {
                if (unchecked(this.bankItems[i]) == inventoryID) {
                    hasItemInInventory = true;
                    break;
                }
            }

            if (!hasItemInInventory) {
                unchecked((this.bankItems[this.bankItemCount] = inventoryID));
                unchecked((this.bankItemsCount[this.bankItemCount] = 0));
                this.bankItemCount++;
            }
        }
    }

    drawAboveHeadStuff(): void {
        for (let i = 0; i < this.receivedMessagesCount; i++) {
            const textHeight = this.surface!.textHeight(1);
            const x = unchecked(this.receivedMessageX[i]);
            let y = unchecked(this.receivedMessageY[i]);
            const messageMid = unchecked(this.receivedMessageMidPoint[i]);
            const messageHeight = unchecked(this.receivedMessageHeight[i]);
            let flag = true;

            while (flag) {
                flag = false;

                for (let j = 0; j < i; j++) {
                    if (
                        y + messageHeight >
                            unchecked(this.receivedMessageY[j]) - textHeight &&
                        y - textHeight <
                            unchecked(this.receivedMessageY[j]) +
                                unchecked(this.receivedMessageHeight[j]) &&
                        x - messageMid <
                            unchecked(this.receivedMessageX[j]) +
                                unchecked(this.receivedMessageMidPoint[j]) &&
                        x + messageMid >
                            unchecked(this.receivedMessageX[j]) -
                                unchecked(this.receivedMessageMidPoint[j]) &&
                        unchecked(this.receivedMessageY[j]) -
                            textHeight -
                            messageHeight <
                            y
                    ) {
                        y =
                            unchecked(this.receivedMessageY[j]) -
                            textHeight -
                            messageHeight;
                        flag = true;
                    }
                }
            }

            unchecked((this.receivedMessageY[i] = y));

            this.surface!.drawParagraph(
                unchecked(this.receivedMessages[i]!),
                x,
                y,
                1,
                0xffff00,
                300
            );
        }

        for (let i = 0; i < this.itemsAboveHeadCount; i++) {
            const x = unchecked(this.actionBubbleX[i]);
            const y = unchecked(this.actionBubbleY[i]);
            const scale = unchecked(this.actionBubbleScale[i]);
            const id = unchecked(this.actionBubbleItem[i]);
            const scaleX = ((39 * scale) / 100) as i32;
            const scaleY = ((27 * scale) / 100) as i32;

            this.surface!.drawActionBubble(
                x - ((scaleX / 2) as i32),
                y - scaleY,
                scaleX,
                scaleY,
                this.spriteMedia + 9,
                85
            );

            const scaleXClip = ((36 * scale) / 100) as i32;
            const scaleYClip = ((24 * scale) / 100) as i32;

            this.surface!._spriteClipping_from9(
                x - ((scaleXClip / 2) as i32),
                y - scaleY + ((scaleY / 2) as i32) - ((scaleYClip / 2) as i32),
                scaleXClip,
                scaleYClip,
                unchecked(GameData.itemPicture[id]) + this.spriteItem,
                unchecked(GameData.itemMask[id]),
                0,
                0,
                false
            );
        }

        for (let i = 0; i < this.healthBarCount; i++) {
            const x = unchecked(this.healthBarX[i]);
            const y = unchecked(this.healthBarY[i]);
            const missing = unchecked(this.healthBarMissing[i]);

            this.surface!.drawBoxAlpha(x - 15, y - 3, missing, 5, 65280, 192);

            this.surface!.drawBoxAlpha(
                x - 15 + missing,
                y - 3,
                30 - missing,
                5,
                0xff0000,
                192
            );
        }
    }

    _walkToActionSource_from5(
        startX: i32,
        startY: i32,
        destX: i32,
        destY: i32,
        walkAction: bool
    ): void {
        this._walkToActionSource_from8(
            startX,
            startY,
            destX,
            destY,
            destX,
            destY,
            false,
            walkAction
        );
    }

    drawUI(): void {
        if (this.logoutTimeout != 0) {
            this.drawDialogLogout();
        } else if (this.showDialogWelcome) {
            this.drawDialogWelcome();
        } else if (this.showDialogServerMessage) {
            this.drawDialogServerMessage();
        } else if (this.showUiWildWarn == 1) {
            this.drawDialogWildWarn();
        } else if (this.showDialogBank && this.combatTimeout == 0) {
            this.drawDialogBank();
        } else if (this.showDialogShop && this.combatTimeout == 0) {
            this.drawDialogShop();
        } else if (this.showDialogTradeConfirm) {
            this.drawDialogTradeConfirm();
        } else if (this.showDialogTrade) {
            this.drawDialogTrade();
        } else if (this.showDialogDuelConfirm) {
            this.drawDialogDuelConfirm();
        } else if (this.showDialogDuel) {
            this.drawDialogDuel();
        } else if (this.showDialogReportAbuseStep == 1) {
            this.drawDialogReportAbuse();
        } else if (this.showDialogReportAbuseStep == 2) {
            this.drawDialogReportAbuseInput();
        } else if (this.showChangePasswordStep != 0) {
            this.drawDialogChangePassword();
        } else if (this.showDialogSocialInput != 0) {
            this.drawDialogSocialInput();
        } else {
            if (this.showOptionMenu) {
                this.drawOptionMenu();

                if (this.options.mobile) {
                    this.showUITab = 0;
                }
            }

            if (
                this.localPlayer.animationCurrent == 8 ||
                this.localPlayer.animationCurrent == 9
            ) {
                this.drawDialogCombatStyle();
            }

            if (this.options.mobile) {
                if (!this.showOptionMenu) {
                    this.setActiveMobileUITab();
                }
            } else {
                this.setActiveUITab();
            }

            const noMenus = !this.showOptionMenu && !this.showRightClickMenu;

            if (noMenus) {
                this.menuItemsCount = 0;
            }

            if (this.showUITab == 0 && noMenus) {
                this.createRightClickMenu();
            }

            if (this.showUITab == 1) {
                this.drawUiTabInventory(noMenus);
            } else if (this.showUITab == 2) {
                this.drawUiTabMinimap(noMenus);
            } else if (this.showUITab == 3) {
                this.drawUiTabPlayerInfo(noMenus);
            } else if (this.showUITab == 4) {
                this.drawUiTabMagic(noMenus);
            } else if (this.showUITab == 5) {
                this.drawUiTabSocial(noMenus);
            } else if (this.showUITab == 6) {
                this.drawUiTabOptions(noMenus);
            }

            if (!this.showOptionMenu) {
                if (!this.showRightClickMenu) {
                    this.createTopMouseMenu();
                } else {
                    this.drawRightClickMenu();
                }
            }
        }

        this.mouseButtonClick = 0;
    }

    resetGame(): void {
        this.systemUpdate = 0;
        this.combatStyle = 0;
        this.logoutTimeout = 0;
        this.loginScreen = 0;
        this.loggedIn = 1;

        this.resetPMText();
        this.surface!.blackScreen();
        //this.surface!.draw(this.graphics, 0, 0);

        for (let i = 0; i < this.objectCount; i++) {
            this.scene!.removeModel(unchecked(this.objectModel[i]!));

            this.world!.removeObject(
                unchecked(this.objectX[i]),
                unchecked(this.objectY[i]),
                unchecked(this.objectId[i])
            );
        }

        for (let i = 0; i < this.wallObjectCount; i++) {
            this.scene!.removeModel(unchecked(this.wallObjectModel[i]!));

            this.world!.removeWallObject(
                unchecked(this.wallObjectX[i]),
                unchecked(this.wallObjectY[i]),
                unchecked(this.wallObjectDirection[i]),
                unchecked(this.wallObjectId[i])
            );
        }

        this.objectCount = 0;
        this.wallObjectCount = 0;
        this.groundItemCount = 0;
        this.playerCount = 0;

        for (let i = 0; i < PLAYERS_SERVER_MAX; i++) {
            unchecked((this.playerServer[i] = null));
        }

        for (let i = 0; i < PLAYERS_MAX; i++) {
            unchecked((this.players[i] = null));
        }

        this.npcCount = 0;

        for (let i = 0; i < NPCS_SERVER_MAX; i++) {
            unchecked((this.npcsServer[i] = null));
        }

        for (let i = 0; i < NPCS_MAX; i++) {
            unchecked((this.npcs[i] = null));
        }

        for (let i = 0; i < this.prayerOn.length; i++) {
            unchecked((this.prayerOn[i] = false));
        }

        this.mouseButtonClick = 0;
        this.lastMouseButtonDown = 0;
        this.mouseButtonDown = 0;
        this.showDialogShop = false;
        this.showDialogBank = false;
        this.isSleeping = false;
        this.friendListCount = 0;
    }

    drawTeleportBubble(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        id: i32
    ): void {}

    drawNPC(x: i32, y: i32, w: i32, h: i32, id: i32, tx: i32, ty: i32): void {}

    drawItem(x: i32, y: i32, w: i32, h: i32, id: i32): void {}

    drawPlayer(
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        id: i32,
        tx: i32,
        ty: i32
    ): void {}

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
                this.welcomeLastLoggedInHost = this.getHostnameIP(
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
                        (this.welcomeUnreadMessages - 1) +
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

    showUiWildWarn: i32;

    drawDialogWildWarn(): void {
        let y = 97;

        this.surface.drawBox(86, 77, 340, 180, Colours.Black);
        this.surface.drawBoxEdge(86, 77, 340, 180, Colours.White);

        this.surface.drawStringCenter(
            'Warning! Proceed with caution',
            256,
            y,
            4,
            Colours.Red
        );

        y += 26;

        this.surface.drawStringCenter(
            'If you go much further north you will ' + 'enter the',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface.drawStringCenter(
            'wilderness. This a very dangerous area where',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface.drawStringCenter(
            'other players can attack you!',
            256,
            y,
            1,
            Colours.White
        );

        y += 22;

        this.surface.drawStringCenter(
            'The further north you go the more dangerous it',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface.drawStringCenter(
            'becomes, but the more treasure you will find.',
            256,
            y,
            1,
            Colours.White
        );

        y += 22;

        this.surface.drawStringCenter(
            'In the wilderness an indicator at the bottom-right',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface.drawStringCenter(
            'of the screen will show the current level of danger',
            256,
            y,
            1,
            Colours.White
        );

        y += 22;

        let textColour = Colours.White;

        if (
            this.mouseY > y - 12 &&
            this.mouseY <= y &&
            this.mouseX > 181 &&
            this.mouseX < 331
        ) {
            textColour = Colours.Red;
        }

        this.surface.drawStringCenter(
            'Click here to close window',
            256,
            y,
            1,
            textColour
        );

        if (this.mouseButtonClick != 0) {
            if (
                this.mouseY > y - 12 &&
                this.mouseY <= y &&
                this.mouseX > 181 &&
                this.mouseX < 331
            ) {
                this.showUiWildWarn = 2;
            }

            if (
                this.mouseX < 86 ||
                this.mouseX > 426 ||
                this.mouseY < 77 ||
                this.mouseY > 257
            ) {
                this.showUiWildWarn = 2;
            }

            this.mouseButtonClick = 0;
        }
    }

}

