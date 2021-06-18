import ChatMessage from './chat-message';
import ClientOpcodes from './opcodes/client';
import Colours from './ui/colours';
import GameCharacter from './game-character';
import GameConnection from './game-connection';
import GameData from './game-data';
import GameModel from './game-model';
import Panel from './panel'
import Scene from './scene';
import Surface from './surface';
import World from './world';
import { Int322DArray } from './lib/ndarray';

import {
    ipToString,
    encodeUsername,
    decodeUsername,
    formatConfirmAmount
} from './utility';

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
    cameraAngle: i32 = 1;
    members: bool;
    optionSoundDisabled: bool;
    showRightClickMenu: bool;
    cameraRotationYIncrement: i32 = 2;
    objectAlreadyInMenu: Int8Array = new Int8Array(OBJECTS_MAX);

    menuItemText1: StaticArray<string | null> = new StaticArray<string | null>(
        MENU_MAX
    );

    duelOpponentName: string = '';
    lastObjectAnimationNumberFireLightningSpell: i32 = -1;
    lastObjectAnimationNumberTorch: i32 = -1;
    lastObjectAnimationNumberClaw: i32 = -1;
    planeIndex: i32 = -1;
    //cameraRotation: i32 = 128;
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
    isInWild: bool;

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

    handleKeyPress(keyCode: i32): void {
        if (this.loggedIn == 0) {
            if (this.loginScreen == 0 && this.panelLoginWelcome) {
                this.panelLoginWelcome!.keyPress(keyCode);
            }

            if (this.loginScreen == 1 && this.panelLoginNewUser) {
                this.panelLoginNewUser!.keyPress(keyCode);
            }

            if (this.loginScreen == 2 && this.panelLoginExistingUser) {
                this.panelLoginExistingUser!.keyPress(keyCode);
            }

            if (this.loginScreen == 3 && this.panelRecoverUser) {
                this.panelRecoverUser!.keyPress(keyCode);
            }
        }

        if (this.loggedIn == 1) {
            if (this.showAppearanceChange && this.panelAppearance) {
                this.panelAppearance!.keyPress(keyCode);
                return;
            }

            if (
                this.showChangePasswordStep == 0 &&
                this.showDialogSocialInput == 0 &&
                this.showDialogReportAbuseStep == 0 &&
                !this.isSleeping &&
                this.panelMessageTabs
            ) {
                this.panelMessageTabs!.keyPress(keyCode);
            }

            if (
                this.showChangePasswordStep == 3 ||
                this.showChangePasswordStep == 4
            ) {
                this.showChangePasswordStep = 0;
            }
        }
    }

    sendLogout(): void {
        if (this.loggedIn == 0) {
            return;
        }

        if (this.combatTimeout > 450) {
            this.showMessage("@cya@You can't logout during combat!", 3);

            return;
        }

        if (this.combatTimeout > 0) {
            this.showMessage(
                "@cya@You can't logout for 10 seconds after combat",
                3
            );

            return;
        }

        this.packetStream!.newPacket(ClientOpcodes.LOGOUT);
        this.packetStream!.sendPacket();
        this.logoutTimeout = 1000;
    }

    // TODO change to addPlayer
    createPlayer(
        serverIndex: i32,
        x: i32,
        y: i32,
        animation: i32
    ): GameCharacter {
        if (!unchecked(this.playerServer[serverIndex])) {
            const newPlayer = new GameCharacter();
            newPlayer.serverIndex = serverIndex;
            newPlayer.serverId = 0;
            unchecked((this.playerServer[serverIndex] = newPlayer));
        }

        const player = unchecked(this.playerServer[serverIndex])!;
        let flag = false;

        for (let i = 0; i < this.knownPlayerCount; i++) {
            if (this.knownPlayers[i]!.serverIndex != serverIndex) {
                continue;
            }

            flag = true;
            break;
        }

        if (flag) {
            player.animationNext = animation;
            let j1 = player.waypointCurrent;

            if (
                x != unchecked(player.waypointsX[j1]) ||
                y != unchecked(player.waypointsY[j1])
            ) {
                player.waypointCurrent = j1 = (j1 + 1) % 10;
                unchecked((player.waypointsX[j1] = x));
                unchecked((player.waypointsY[j1] = y));
            }
        } else {
            player.serverIndex = serverIndex;
            player.movingStep = 0;
            player.waypointCurrent = 0;
            unchecked((player.waypointsX[0] = player.currentX = x));
            unchecked((player.waypointsY[0] = player.currentY = y));
            player.animationNext = player.animationCurrent = animation;
            player.stepCount = 0;
        }

        this.players[this.playerCount++] = player;

        return player;
    }

    drawItem(x: i32, y: i32, width: i32, height: i32, id: i32): void {
        const picture = unchecked(GameData.itemPicture[id] + this.spriteItem);
        const mask = unchecked(GameData.itemMask[id]);

        this.surface!._spriteClipping_from9(
            x,
            y,
            width,
            height,
            picture,
            mask,
            0,
            0,
            false
        );
    }

    handleGameInput_0(): void {
        if (this.systemUpdate > 1) {
            this.systemUpdate--;
        }
    }

    handleGameInput_1(): void {
        //await this.checkConnection();

        if (this.logoutTimeout > 0) {
            this.logoutTimeout--;
        }

        if (
            this.mouseActionTimeout > 4500 &&
            this.combatTimeout == 0 &&
            this.logoutTimeout == 0
        ) {
            this.mouseActionTimeout -= 500;
            this.sendLogout();
            return;
        }

        if (
            this.localPlayer.animationCurrent == 8 ||
            this.localPlayer.animationCurrent == 9
        ) {
            this.combatTimeout = 500;
        }

        if (this.combatTimeout > 0) {
            this.combatTimeout--;
        }

        if (this.showAppearanceChange) {
            this.handleAppearancePanelInput();
            return;
        }

        for (let i = 0; i < this.playerCount; i++) {
            const player = unchecked(this.players[i]);

            // TODO figure out why this is happening
            if (!player) {
                return;
            }

            let k = (player.waypointCurrent + 1) % 10;

            if (player.movingStep != k) {
                let i1 = -1;
                let l2 = player.movingStep;
                let j4: i32;

                if (l2 < k) {
                    j4 = k - l2;
                } else {
                    j4 = 10 + k - l2;
                }

                let j5 = 4;

                if (j4 > 2) {
                    j5 = (j4 - 1) * 4;
                }

                if (
                    unchecked(player.waypointsX[l2]) - player.currentX >
                        this.magicLoc * 3 ||
                    unchecked(player.waypointsY[l2]) - player.currentY >
                        this.magicLoc * 3 ||
                    unchecked(player.waypointsX[l2]) - player.currentX <
                        -this.magicLoc * 3 ||
                    unchecked(player.waypointsY[l2]) - player.currentY <
                        -this.magicLoc * 3 ||
                    j4 > 8
                ) {
                    unchecked((player.currentX = player.waypointsX[l2]));
                    unchecked((player.currentY = player.waypointsY[l2]));
                } else {
                    if (player.currentX < unchecked(player.waypointsX[l2])) {
                        player.currentX += j5;
                        player.stepCount++;
                        i1 = 2;
                    } else if (
                        player.currentX > unchecked(player.waypointsX[l2])
                    ) {
                        player.currentX -= j5;
                        player.stepCount++;
                        i1 = 6;
                    }

                    if (
                        player.currentX - unchecked(player.waypointsX[l2]) <
                            j5 &&
                        player.currentX - unchecked(player.waypointsX[l2]) > -j5
                    ) {
                        player.currentX = unchecked(player.waypointsX[l2]);
                    }

                    if (player.currentY < unchecked(player.waypointsY[l2])) {
                        player.currentY += j5;
                        player.stepCount++;

                        if (i1 == -1) {
                            i1 = 4;
                        } else if (i1 == 2) {
                            i1 = 3;
                        } else {
                            i1 = 5;
                        }
                    } else if (
                        player.currentY > unchecked(player.waypointsY[l2])
                    ) {
                        player.currentY -= j5;
                        player.stepCount++;

                        if (i1 == -1) {
                            i1 = 0;
                        } else if (i1 == 2) {
                            i1 = 1;
                        } else {
                            i1 = 7;
                        }
                    }

                    if (
                        player.currentY - unchecked(player.waypointsY[l2]) <
                            j5 &&
                        player.currentY - unchecked(player.waypointsY[l2]) > -j5
                    ) {
                        player.currentY = unchecked(player.waypointsY[l2]);
                    }
                }

                if (i1 != -1) {
                    player.animationCurrent = i1;
                }

                if (
                    player.currentX == unchecked(player.waypointsX[l2]) &&
                    player.currentY == unchecked(player.waypointsY[l2])
                ) {
                    player.movingStep = (l2 + 1) % 10;
                }
            } else {
                player.animationCurrent = player.animationNext;
            }

            if (player.messageTimeout > 0) {
                player.messageTimeout--;
            }

            if (player.bubbleTimeout > 0) {
                player.bubbleTimeout--;
            }

            if (player.combatTimer > 0) {
                player.combatTimer--;
            }

            if (this.deathScreenTimeout > 0) {
                this.deathScreenTimeout--;

                if (this.deathScreenTimeout == 0) {
                    this.showMessage(
                        'You have been granted another life. Be more careful this time!',
                        3
                    );

                    this.showMessage(
                        'You retain your skills. Your objects land where you died',
                        3
                    );
                }
            }
        }

        for (let i = 0; i < this.npcCount; i++) {
            const npc = unchecked(this.npcs[i]!);
            let j1 = (npc.waypointCurrent + 1) % 10;

            if (npc.movingStep != j1) {
                let i3 = -1;
                let k4 = npc.movingStep;
                let k5: i32;

                if (k4 < j1) {
                    k5 = j1 - k4;
                } else {
                    k5 = 10 + j1 - k4;
                }

                let l5 = 4;

                if (k5 > 2) {
                    l5 = (k5 - 1) * 4;
                }

                if (
                    unchecked(npc.waypointsX[k4]) - npc.currentX >
                        this.magicLoc * 3 ||
                    unchecked(npc.waypointsY[k4]) - npc.currentY >
                        this.magicLoc * 3 ||
                    unchecked(npc.waypointsX[k4]) - npc.currentX <
                        -this.magicLoc * 3 ||
                    unchecked(npc.waypointsY[k4]) - npc.currentY <
                        -this.magicLoc * 3 ||
                    k5 > 8
                ) {
                    npc.currentX = unchecked(npc.waypointsX[k4]);
                    npc.currentY = unchecked(npc.waypointsY[k4]);
                } else {
                    if (npc.currentX < npc.waypointsX[k4]) {
                        npc.currentX += l5;
                        npc.stepCount++;
                        i3 = 2;
                    } else if (npc.currentX > unchecked(npc.waypointsX[k4])) {
                        npc.currentX -= l5;
                        npc.stepCount++;
                        i3 = 6;
                    }

                    if (
                        npc.currentX - unchecked(npc.waypointsX[k4]) < l5 &&
                        npc.currentX - unchecked(npc.waypointsX[k4]) > -l5
                    ) {
                        npc.currentX = unchecked(npc.waypointsX[k4]);
                    }

                    if (npc.currentY < unchecked(npc.waypointsY[k4])) {
                        npc.currentY += l5;
                        npc.stepCount++;

                        if (i3 == -1) {
                            i3 = 4;
                        } else if (i3 == 2) {
                            i3 = 3;
                        } else {
                            i3 = 5;
                        }
                    } else if (npc.currentY > unchecked(npc.waypointsY[k4])) {
                        npc.currentY -= l5;
                        npc.stepCount++;

                        if (i3 == -1) {
                            i3 = 0;
                        } else if (i3 == 2) {
                            i3 = 1;
                        } else {
                            i3 = 7;
                        }
                    }

                    if (
                        npc.currentY - unchecked(npc.waypointsY[k4]) < l5 &&
                        npc.currentY - unchecked(npc.waypointsY[k4]) > -l5
                    ) {
                        npc.currentY = unchecked(npc.waypointsY[k4]);
                    }
                }

                if (i3 != -1) {
                    npc.animationCurrent = i3;
                }

                if (
                    npc.currentX == unchecked(npc.waypointsX[k4]) &&
                    npc.currentY == unchecked(npc.waypointsY[k4])
                ) {
                    npc.movingStep = (k4 + 1) % 10;
                }
            } else {
                npc.animationCurrent = npc.animationNext;

                if (npc.npcId == 43) {
                    npc.stepCount++;
                }
            }

            if (npc.messageTimeout > 0) {
                npc.messageTimeout--;
            }

            if (npc.bubbleTimeout > 0) {
                npc.bubbleTimeout--;
            }

            if (npc.combatTimer > 0) {
                npc.combatTimer--;
            }
        }

        if (this.showUITab != 2) {
            if (Surface.anInt346 > 0) {
                this.sleepWordDelayTimer++;
            }

            if (Surface.anInt347 > 0) {
                this.sleepWordDelayTimer = 0;
            }

            Surface.anInt346 = 0;
            Surface.anInt347 = 0;
        }

        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i]!;

            if (player.projectileRange > 0) {
                player.projectileRange--;
            }
        }

        if (this.cameraAutoAngleDebug) {
            if (
                this.cameraAutoRotatePlayerX - this.localPlayer.currentX <
                    -500 ||
                this.cameraAutoRotatePlayerX - this.localPlayer.currentX >
                    500 ||
                this.cameraAutoRotatePlayerY - this.localPlayer.currentY <
                    -500 ||
                this.cameraAutoRotatePlayerY - this.localPlayer.currentY > 500
            ) {
                this.cameraAutoRotatePlayerX = this.localPlayer.currentX;
                this.cameraAutoRotatePlayerY = this.localPlayer.currentY;
            }
        } else {
            if (
                this.cameraAutoRotatePlayerX - this.localPlayer.currentX <
                    -500 ||
                this.cameraAutoRotatePlayerX - this.localPlayer.currentX >
                    500 ||
                this.cameraAutoRotatePlayerY - this.localPlayer.currentY <
                    -500 ||
                this.cameraAutoRotatePlayerY - this.localPlayer.currentY > 500
            ) {
                this.cameraAutoRotatePlayerX = this.localPlayer.currentX;
                this.cameraAutoRotatePlayerY = this.localPlayer.currentY;
            }

            if (this.cameraAutoRotatePlayerX != this.localPlayer.currentX) {
                this.cameraAutoRotatePlayerX += ((this.localPlayer.currentX -
                    this.cameraAutoRotatePlayerX) /
                    (16 + (((this.cameraZoom - 500) / 15) as i32))) as i32;
            }

            if (this.cameraAutoRotatePlayerY != this.localPlayer.currentY) {
                this.cameraAutoRotatePlayerY += ((this.localPlayer.currentY -
                    this.cameraAutoRotatePlayerY) /
                    (16 + (((this.cameraZoom - 500) / 15) as i32))) as i32;
            }

            if (this.optionCameraModeAuto) {
                let k1 = this.cameraAngle * 32;
                let j3 = k1 - this.cameraRotation;
                let byte0 = 1;

                if (j3 != 0) {
                    this.anInt707++;

                    if (j3 > 128) {
                        byte0 = -1;
                        j3 = 256 - j3;
                    } else if (j3 > 0) byte0 = 1;
                    else if (j3 < -128) {
                        byte0 = 1;
                        j3 = 256 + j3;
                    } else if (j3 < 0) {
                        byte0 = -1;
                        j3 = -j3;
                    }

                    this.cameraRotation +=
                        (((this.anInt707 * j3 + 255) / 256) as i32) * byte0;

                    this.cameraRotation &= 0xff;
                } else {
                    this.anInt707 = 0;
                }
            }
        }

        if (this.sleepWordDelayTimer > 20) {
            this.sleepWordDelay = false;
            this.sleepWordDelayTimer = 0;
        }

        if (this.isSleeping) {
            this.handleSleepInput();
            return;
        }

        //await this.handleMesssageTabsInput();
    }

    handleGameInput_2(): void {
        if (this.deathScreenTimeout != 0) {
            this.lastMouseButtonDown = 0;
        }

        if (this.showDialogTrade || this.showDialogDuel) {
            if (this.mouseButtonDown != 0) {
                this.mouseButtonDownTime++;
            } else {
                this.mouseButtonDownTime = 0;
            }

            if (this.mouseButtonDownTime > 600) {
                this.mouseButtonItemCountIncrement += 5000;
            } else if (this.mouseButtonDownTime > 450) {
                this.mouseButtonItemCountIncrement += 500;
            } else if (this.mouseButtonDownTime > 300) {
                this.mouseButtonItemCountIncrement += 50;
            } else if (this.mouseButtonDownTime > 150) {
                this.mouseButtonItemCountIncrement += 5;
            } else if (this.mouseButtonDownTime > 50) {
                this.mouseButtonItemCountIncrement++;
            } else if (
                this.mouseButtonDownTime > 20 &&
                (this.mouseButtonDownTime & 5) == 0
            ) {
                this.mouseButtonItemCountIncrement++;
            }
        } else {
            this.mouseButtonDownTime = 0;
            this.mouseButtonItemCountIncrement = 0;
        }

        if (this.lastMouseButtonDown == 1) {
            this.mouseButtonClick = 1;
        } else if (this.lastMouseButtonDown == 2) {
            this.mouseButtonClick = 2;
        }

        this.scene!.setMouseLoc(this.mouseX, this.mouseY);
        this.lastMouseButtonDown = 0;

        if (this.optionCameraModeAuto) {
            if (this.anInt707 == 0 || this.cameraAutoAngleDebug) {
                if (this.keyLeft) {
                    this.cameraAngle = (this.cameraAngle + 1) & 7;
                    this.keyLeft = false;

                    if (!this.fogOfWar) {
                        if ((this.cameraAngle & 1) == 0) {
                            this.cameraAngle = (this.cameraAngle + 1) & 7;
                        }

                        for (let i2 = 0; i2 < 8; i2++) {
                            if (this.isValidCameraAngle(this.cameraAngle)) {
                                break;
                            }

                            this.cameraAngle = (this.cameraAngle + 1) & 7;
                        }
                    }
                }

                if (this.keyRight) {
                    this.cameraAngle = (this.cameraAngle + 7) & 7;
                    this.keyRight = false;

                    if (!this.fogOfWar) {
                        if ((this.cameraAngle & 1) == 0) {
                            this.cameraAngle = (this.cameraAngle + 7) & 7;
                        }

                        for (let j2 = 0; j2 < 8; j2++) {
                            if (this.isValidCameraAngle(this.cameraAngle)) {
                                break;
                            }

                            this.cameraAngle = (this.cameraAngle + 7) & 7;
                        }
                    }
                }
            }
        } else if (this.keyLeft) {
            this.cameraRotation = (this.cameraRotation + 2) & 0xff;
        } else if (this.keyRight) {
            this.cameraRotation = (this.cameraRotation - 2) & 0xff;
        }

        if (
            !this.optionCameraModeAuto &&
            this.options.middleClickCamera &&
            this.middleButtonDown
        ) {
            this.cameraRotation =
                (this.originRotation + (this.mouseX - this.originMouseX) / 2) &
                0xff;
        }

        if (this.options.zoomCamera) {
            this.handleCameraZoom();
        } else {
            if (this.fogOfWar && this.cameraZoom > ZOOM_INDOORS) {
                this.cameraZoom -= 4;
            } else if (!this.fogOfWar && this.cameraZoom < ZOOM_OUTDOORS) {
                this.cameraZoom += 4;
            }
        }

        if (this.mouseClickXStep > 0) {
            this.mouseClickXStep--;
        } else if (this.mouseClickXStep < 0) {
            this.mouseClickXStep++;
        }

        this.scene!.scrollTexture(17);
        this.objectAnimationCount++;

        if (this.objectAnimationCount > 5) {
            this.objectAnimationCount = 0;
            this.objectAnimationNumberFireLightningSpell =
                (this.objectAnimationNumberFireLightningSpell + 1) % 3;
            this.objectAnimationNumberTorch =
                (this.objectAnimationNumberTorch + 1) % 4;
            this.objectAnimationNumberClaw =
                (this.objectAnimationNumberClaw + 1) % 5;
        }

        for (let i = 0; i < this.objectCount; i++) {
            const x = unchecked(this.objectX[i]);
            const y = unchecked(this.objectY[i]);

            if (
                x >= 0 &&
                y >= 0 &&
                x < 96 &&
                y < 96 &&
                unchecked(this.objectId[i]) == 74
            ) {
                unchecked(this.objectModel[i]!).rotate(1, 0, 0);
            }
        }

        for (let i = 0; i < this.teleportBubbleCount; i++) {
            unchecked(this.teleportBubbleTime[i]++);

            if (this.teleportBubbleTime[i] > 50) {
                this.teleportBubbleCount--;

                for (let j = i; j < this.teleportBubbleCount; j++) {
                    unchecked(
                        (this.teleportBubbleX[j] = this.teleportBubbleX[j + 1])
                    );

                    unchecked(
                        (this.teleportBubbleY[j] = this.teleportBubbleY[j + 1])
                    );

                    unchecked(
                        (this.teleportBubbleTime[j] = this.teleportBubbleTime[
                            j + 1
                        ])
                    );

                    unchecked(
                        (this.teleportBubbleType[j] = this.teleportBubbleType[
                            j + 1
                        ])
                    );
                }
            }
        }
    }

    handleCameraZoom(): void {
        if (this.keyUp && !this.ctrl) {
            this.cameraZoom -= 16;
        } else if (this.keyDown && !this.ctrl) {
            this.cameraZoom += 16;
        } else if (this.keyHome) {
            this.cameraZoom = ZOOM_OUTDOORS;
        } else if (this.keyPgUp) {
            this.cameraZoom = ZOOM_MIN;
        } else if (this.keyPgDown) {
            this.cameraZoom = ZOOM_MAX;
        }

        if (
            this.mouseScrollDelta != 0 &&
            (this.showUITab == 2 || this.showUITab == 0)
        ) {
            if (
                this.messageTabSelected != 0 &&
                ((this.options.mobile && this.mouseY < 70) ||
                    (!this.options.mobile &&
                        this.mouseY > this.gameHeight - 64))
            ) {
                return;
            }

            this.cameraZoom += this.mouseScrollDelta * 24;
        }

        if (this.cameraZoom >= ZOOM_MAX) {
            this.cameraZoom = ZOOM_MAX;
        } else if (this.cameraZoom <= ZOOM_MIN) {
            this.cameraZoom = ZOOM_MIN;
        }
    }

    autoRotateCamera(): void {
        if (
            (this.cameraAngle & 1) == 1 &&
            this.isValidCameraAngle(this.cameraAngle)
        ) {
            return;
        }

        if (
            (this.cameraAngle & 1) == 0 &&
            this.isValidCameraAngle(this.cameraAngle)
        ) {
            if (this.isValidCameraAngle((this.cameraAngle + 1) & 7)) {
                this.cameraAngle = (this.cameraAngle + 1) & 7;
                return;
            }

            if (this.isValidCameraAngle((this.cameraAngle + 7) & 7)) {
                this.cameraAngle = (this.cameraAngle + 7) & 7;
            }

            return;
        }

        let ai = new Int32Array(7);
        unchecked((ai[0] = 1));
        unchecked((ai[1] = -1));
        unchecked((ai[2] = 2));
        unchecked((ai[3] = -2));
        unchecked((ai[4] = 3));
        unchecked((ai[5] = -3));
        unchecked((ai[6] = 4));

        for (let i = 0; i < 7; i++) {
            if (!this.isValidCameraAngle((this.cameraAngle + ai[i] + 8) & 7)) {
                continue;
            }

            this.cameraAngle = (this.cameraAngle + ai[i] + 8) & 7;
            break;
        }

        if (
            (this.cameraAngle & 1) == 0 &&
            this.isValidCameraAngle(this.cameraAngle)
        ) {
            if (this.isValidCameraAngle((this.cameraAngle + 1) & 7)) {
                this.cameraAngle = (this.cameraAngle + 1) & 7;
                return;
            }

            if (this.isValidCameraAngle((this.cameraAngle + 7) & 7)) {
                this.cameraAngle = (this.cameraAngle + 7) & 7;
            }
        }
    }

    drawRightClickMenu(): void {
        if (this.mouseButtonClick != 0) {
            for (let i = 0; i < this.menuItemsCount; i++) {
                const entryX = this.menuX + 2;
                const entryY = this.menuY + 27 + i * 15;

                if (
                    this.mouseX <= entryX - 2 ||
                    this.mouseY <= entryY - 12 ||
                    this.mouseY >= entryY + 4 ||
                    this.mouseX >= entryX - 3 + this.menuWidth
                ) {
                    continue;
                }

                this.menuItemClick(unchecked(this.menuIndices[i]));
                break;
            }

            this.mouseButtonClick = 0;
            this.showRightClickMenu = false;
            return;
        }

        if (
            this.mouseX < this.menuX - 10 ||
            this.mouseY < this.menuY - 10 ||
            this.mouseX > this.menuX + this.menuWidth + 10 ||
            this.mouseY > this.menuY + this.menuHeight + 10
        ) {
            this.showRightClickMenu = false;
            return;
        }

        this.surface!.drawBoxAlpha(
            this.menuX,
            this.menuY,
            this.menuWidth,
            this.menuHeight,
            0xd0d0d0,
            160
        );

        this.surface!.drawString(
            'Choose option',
            this.menuX + 2,
            this.menuY + 12,
            1,
            0x00ffff
        );

        for (let i = 0; i < this.menuItemsCount; i++) {
            const entryX = this.menuX + 2;
            const entryY = this.menuY + 27 + i * 15;
            let textColour = 0xffffff;

            if (
                this.mouseX > entryX - 2 &&
                this.mouseY > entryY - 12 &&
                this.mouseY < entryY + 4 &&
                this.mouseX < entryX - 3 + this.menuWidth
            ) {
                textColour = 0xffff00;
            }

            this.surface!.drawString(
                unchecked(this.menuItemText1[this.menuIndices[i]]!) +
                    ' ' +
                    unchecked(this.menuItemText2[this.menuIndices[i]]!),
                entryX,
                entryY,
                1,
                textColour
            );
        }
    }

    drawNPC(x: i32, y: i32, w: i32, h: i32, id: i32, tx: i32, ty: i32): void {
        const npc = unchecked(this.npcs[id]!);
        let l1 = (npc.animationCurrent + (this.cameraRotation + 16) / 32) & 7;
        let flag = false;
        let i2 = l1;

        if (i2 == 5) {
            i2 = 3;
            flag = true;
        } else if (i2 == 6) {
            i2 = 2;
            flag = true;
        } else if (i2 == 7) {
            i2 = 1;
            flag = true;
        }

        let j2 =
            i2 * 3 +
            unchecked(
                this.npcWalkModel[
                    ((npc.stepCount /
                        GameData.npcWalkModel[npc.npcId]) as i32) % 4
                ]
            );

        if (npc.animationCurrent == 8) {
            i2 = 5;
            l1 = 2;
            flag = false;

            x -= ((unchecked(GameData.npcCombatAnimation[npc.npcId]) * ty) /
                100) as i32;

            j2 =
                i2 * 3 +
                unchecked(
                    this.npcCombatModelArray1[
                        (((this.loginTimer /
                            GameData.npcCombatModel[npc.npcId]) as i32) -
                            1) %
                            8
                    ]
                );
        } else if (npc.animationCurrent == 9) {
            i2 = 5;
            l1 = 2;
            flag = true;

            x += ((unchecked(GameData.npcCombatAnimation[npc.npcId]) * ty) /
                100) as i32;

            j2 =
                i2 * 3 +
                unchecked(
                    this.npcCombatModelArray2[
                        ((this.loginTimer /
                            GameData.npcCombatModel[npc.npcId]) as i32) % 8
                    ]
                );
        }

        for (let k2 = 0; k2 < 12; k2++) {
            let l2 = this.npcAnimationArray.get(l1, k2);
            let k3 = GameData.npcSprite.get(npc.npcId, l2);

            if (k3 >= 0) {
                let i4 = 0;
                let j4 = 0;
                let k4 = j2;

                if (
                    flag &&
                    i2 >= 1 &&
                    i2 <= 3 &&
                    unchecked(GameData.animationHasF[k3]) == 1
                ) {
                    k4 += 15;
                }

                if (i2 != 5 || unchecked(GameData.animationHasA[k3]) == 1) {
                    let l4 = k4 + unchecked(GameData.animationNumber[k3]);

                    i4 = ((i4 * w) /
                        unchecked(this.surface!.spriteWidthFull[l4])) as i32;

                    j4 = ((j4 * h) /
                        unchecked(this.surface!.spriteHeightFull[l4])) as i32;

                    let i5 = ((w * this.surface!.spriteWidthFull[l4]) /
                        unchecked(
                            this.surface!.spriteWidthFull[
                                GameData.animationNumber[k3]
                            ]
                        )) as i32;

                    i4 -= ((i5 - w) / 2) as i32;

                    let col = unchecked(GameData.animationCharacterColour[k3]);
                    let skincol = 0;

                    if (col == 1) {
                        col = unchecked(GameData.npcColourHair[npc.npcId]);
                        skincol = unchecked(GameData.npcColourSkin[npc.npcId]);
                    } else if (col == 2) {
                        col = unchecked(GameData.npcColourTop[npc.npcId]);
                        skincol = unchecked(GameData.npcColourSkin[npc.npcId]);
                    } else if (col == 3) {
                        col = unchecked(GameData.npcColorBottom[npc.npcId]);
                        skincol = unchecked(GameData.npcColourSkin[npc.npcId]);
                    }

                    this.surface!._spriteClipping_from9(
                        x + i4,
                        y + j4,
                        i5,
                        h,
                        l4,
                        col,
                        skincol,
                        tx,
                        flag
                    );
                }
            }
        }

        if (npc.messageTimeout > 0) {
            unchecked(
                (this.receivedMessageMidPoint[
                    this.receivedMessagesCount
                ] = (this.surface!.textWidth(npc.message!, 1) / 2) as i32)
            );

            if (
                unchecked(
                    this.receivedMessageMidPoint[this.receivedMessagesCount]
                ) > 150
            ) {
                unchecked(
                    (this.receivedMessageMidPoint[
                        this.receivedMessagesCount
                    ] = 150)
                );
            }

            this.receivedMessageHeight[this.receivedMessagesCount] =
                ((this.surface!.textWidth(npc.message!, 1) / 300) as i32) *
                this.surface!.textHeight(1);

            unchecked(
                (this.receivedMessageX[this.receivedMessagesCount] =
                    x + ((w / 2) as i32))
            );

            unchecked((this.receivedMessageY[this.receivedMessagesCount] = y));

            unchecked(
                (this.receivedMessages[this.receivedMessagesCount++] =
                    npc.message)
            );
        }

        if (
            npc.animationCurrent == 8 ||
            npc.animationCurrent == 9 ||
            npc.combatTimer != 0
        ) {
            if (npc.combatTimer > 0) {
                let i3 = x;

                if (npc.animationCurrent == 8) {
                    i3 -= ((20 * ty) / 100) as i32;
                } else if (npc.animationCurrent == 9) {
                    i3 += ((20 * ty) / 100) as i32;
                }

                let l3 = ((npc.healthCurrent * 30) / npc.healthMax) as i32;

                unchecked(
                    (this.healthBarX[this.healthBarCount] =
                        i3 + ((w / 2) as i32))
                );

                unchecked((this.healthBarY[this.healthBarCount] = y));
                unchecked((this.healthBarMissing[this.healthBarCount++] = l3));
            }

            if (npc.combatTimer > 150) {
                let j3 = x;

                if (npc.animationCurrent == 8) {
                    j3 -= ((10 * ty) / 100) as i32;
                } else if (npc.animationCurrent == 9) {
                    j3 += ((10 * ty) / 100) as i32;
                }

                this.surface!._drawSprite_from3(
                    j3 + ((w / 2) as i32) - 12,
                    y + ((h / 2) as i32) - 12,
                    this.spriteMedia + 12
                );

                this.surface!.drawStringCenter(
                    npc.damageTaken.toString(),
                    j3 + ((w / 2) as i32) - 1,
                    y + ((h / 2) as i32) + 5,
                    3,
                    0xffffff
                );
            }
        }
    }

    walkToWallObject(i: i32, j: i32, k: i32): void {
        if (k == 0) {
            this._walkToActionSource_from8(
                this.localRegionX,
                this.localRegionY,
                i,
                j - 1,
                i,
                j,
                false,
                true
            );
        } else if (k == 1) {
            this._walkToActionSource_from8(
                this.localRegionX,
                this.localRegionY,
                i - 1,
                j,
                i,
                j,
                false,
                true
            );
        } else {
            this._walkToActionSource_from8(
                this.localRegionX,
                this.localRegionY,
                i,
                j,
                i,
                j,
                true,
                true
            );
        }
    }

    addNpc(
        serverIndex: i32,
        x: i32,
        y: i32,
        sprite: i32,
        type: i32
    ): GameCharacter {
        if (!unchecked(this.npcsServer[serverIndex])) {
            unchecked((this.npcsServer[serverIndex] = new GameCharacter()));

            unchecked(
                (this.npcsServer[serverIndex]!.serverIndex = serverIndex)
            );
        }

        const npc = this.npcsServer[serverIndex]!;
        let foundNPC = false;

        for (let i = 0; i < this.npcCacheCount; i++) {
            if (this.npcsCache[i]!.serverIndex != serverIndex) {
                continue;
            }

            foundNPC = true;
            break;
        }

        if (foundNPC) {
            npc.npcId = type;
            npc.animationNext = sprite;
            let waypointIdx = npc.waypointCurrent;

            if (
                x != npc.waypointsX[waypointIdx] ||
                y != npc.waypointsY[waypointIdx]
            ) {
                npc.waypointCurrent = waypointIdx = (waypointIdx + 1) % 10;
                unchecked((npc.waypointsX[waypointIdx] = x));
                unchecked((npc.waypointsY[waypointIdx] = y));
            }
        } else {
            npc.serverIndex = serverIndex;
            npc.movingStep = 0;
            npc.waypointCurrent = 0;
            unchecked((npc.waypointsX[0] = npc.currentX = x));
            unchecked((npc.waypointsY[0] = npc.currentY = y));
            npc.npcId = type;
            npc.animationNext = npc.animationCurrent = sprite;
            npc.stepCount = 0;
        }

        unchecked((this.npcs[this.npcCount++] = npc));

        return npc;
    }

    resetLoginVars(): void {
        this.systemUpdate = 0;
        this.loginScreen = 0;
        this.loggedIn = 0;
        this.logoutTimeout = 0;
    }

    loadNextRegion(lx: i32, ly: i32): bool {
        if (this.deathScreenTimeout != 0) {
            this.world!.playerAlive = false;
            return false;
        }

        this.loadingArea = false;
        lx += this.planeWidth;
        ly += this.planeHeight;

        if (
            this.lastHeightOffset == this.planeIndex &&
            lx > this.localLowerX &&
            lx < this.localUpperX &&
            ly > this.localLowerY &&
            ly < this.localUpperY
        ) {
            this.world!.playerAlive = true;
            return false;
        }

        this.surface!.drawStringCenter(
            'Loading... Please wait',
            256,
            192,
            1,
            0xffffff
        );

        this.drawChatMessageTabs();

        //this.surface.draw(this.graphics, 0, 0);

        let ax = this.regionX;
        let ay = this.regionY;
        let sectionX = ((lx + 24) / 48) as i32;
        let sectionY = ((ly + 24) / 48) as i32;

        this.lastHeightOffset = this.planeIndex;
        this.regionX = sectionX * 48 - 48;
        this.regionY = sectionY * 48 - 48;
        this.localLowerX = sectionX * 48 - 32;
        this.localLowerY = sectionY * 48 - 32;
        this.localUpperX = sectionX * 48 + 32;
        this.localUpperY = sectionY * 48 + 32;

        this.world!._loadSection_from3(lx, ly, this.lastHeightOffset);

        this.regionX -= this.planeWidth;
        this.regionY -= this.planeHeight;

        let offsetX = this.regionX - ax;
        let offsetY = this.regionY - ay;

        for (let objIdx = 0; objIdx < this.objectCount; objIdx++) {
            unchecked((this.objectX[objIdx] -= offsetX));
            unchecked((this.objectY[objIdx] -= offsetY));

            let objx = unchecked(this.objectX[objIdx]);
            let objy = unchecked(this.objectY[objIdx]);
            let objid = unchecked(this.objectId[objIdx]);
            let gameModel = unchecked(this.objectModel[objIdx]!);
            let objType = unchecked(this.objectDirection[objIdx]);
            let objW = 0;
            let objH = 0;

            if (objType == 0 || objType == 4) {
                objW = unchecked(GameData.objectWidth[objid]);
                objH = unchecked(GameData.objectHeight[objid]);
            } else {
                objH = unchecked(GameData.objectWidth[objid]);
                objW = unchecked(GameData.objectHeight[objid]);
            }

            let j6 = (((objx + objx + objW) * this.magicLoc) / 2) as i32;
            let k6 = (((objy + objy + objH) * this.magicLoc) / 2) as i32;

            if (objx >= 0 && objy >= 0 && objx < 96 && objy < 96) {
                this.scene!.addModel(gameModel);
                gameModel.place(j6, -this.world!.getElevation(j6, k6), k6);
                this.world!.removeObject2(objx, objy, objid);

                if (objid == 74) {
                    gameModel.translate(0, -480, 0);
                }
            }
        }

        for (let k2 = 0; k2 < this.wallObjectCount; k2++) {
            unchecked((this.wallObjectX[k2] -= offsetX));
            unchecked((this.wallObjectY[k2] -= offsetY));

            let i3 = unchecked(this.wallObjectX[k2]);
            let l3 = unchecked(this.wallObjectY[k2]);
            let j4 = unchecked(this.wallObjectId[k2]);
            let i5 = unchecked(this.wallObjectDirection[k2]);

            this.world!._setObjectAdjacency_from4(i3, l3, i5, j4);

            let gameModel_1 = this.createModel(i3, l3, i5, j4, k2);
            unchecked((this.wallObjectModel[k2] = gameModel_1));
        }

        for (let j3 = 0; j3 < this.groundItemCount; j3++) {
            unchecked((this.groundItemX[j3] -= offsetX));
            unchecked((this.groundItemY[j3] -= offsetY));
        }

        for (let i4 = 0; i4 < this.playerCount; i4++) {
            const player = unchecked(this.players[i4]!);

            player.currentX -= offsetX * this.magicLoc;
            player.currentY -= offsetY * this.magicLoc;

            for (let j5 = 0; j5 <= player.waypointCurrent; j5++) {
                unchecked((player.waypointsX[j5] -= offsetX * this.magicLoc));
                unchecked((player.waypointsY[j5] -= offsetY * this.magicLoc));
            }
        }

        for (let k4 = 0; k4 < this.npcCount; k4++) {
            const npc = unchecked(this.npcs[k4]!);

            npc.currentX -= offsetX * this.magicLoc;
            npc.currentY -= offsetY * this.magicLoc;

            for (let l5 = 0; l5 <= npc.waypointCurrent; l5++) {
                unchecked((npc.waypointsX[l5] -= offsetX * this.magicLoc));
                unchecked((npc.waypointsY[l5] -= offsetY * this.magicLoc));
            }
        }

        this.world!.playerAlive = true;

        return true;
    }

    drawPlayer(
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        id: i32,
        tx: i32,
        ty: i32
    ): void {
        const player = unchecked(this.players[id]!);

        // this means the character is invisible! MOD!!!
        if (player.colourBottom == 255) {
            return;
        }

        let l1 =
            (player.animationCurrent + (this.cameraRotation + 16) / 32) & 7;
        let flag = false;
        let i2 = l1;

        if (i2 == 5) {
            i2 = 3;
            flag = true;
        } else if (i2 == 6) {
            i2 = 2;
            flag = true;
        } else if (i2 == 7) {
            i2 = 1;
            flag = true;
        }

        let j2 =
            i2 * 3 +
            unchecked(this.npcWalkModel[((player.stepCount / 6) as i32) % 4]);

        if (player.animationCurrent == 8) {
            i2 = 5;
            l1 = 2;
            flag = false;
            x -= ((5 * ty) / 100) as i32;

            j2 =
                i2 * 3 +
                unchecked(
                    this.npcCombatModelArray1[
                        ((this.loginTimer / 5) as i32) % 8
                    ]
                );
        } else if (player.animationCurrent == 9) {
            i2 = 5;
            l1 = 2;
            flag = true;
            x += ((5 * ty) / 100) as i32;

            j2 =
                i2 * 3 +
                unchecked(
                    this.npcCombatModelArray2[
                        ((this.loginTimer / 6) as i32) % 8
                    ]
                );
        }

        for (let k2 = 0; k2 < 12; k2++) {
            let l2 = this.npcAnimationArray.get(l1, k2);
            let l3 = unchecked(player.equippedItem[l2]) - 1;

            if (l3 >= 0) {
                let k4 = 0;
                let i5 = 0;
                let j5 = j2;

                if (flag && i2 >= 1 && i2 <= 3) {
                    if (unchecked(GameData.animationHasF[l3]) == 1) {
                        j5 += 15;
                    } else if (l2 == 4 && i2 == 1) {
                        k4 = -22;
                        i5 = -3;
                        j5 =
                            i2 * 3 +
                            unchecked(
                                this.npcWalkModel[
                                    (2 + ((player.stepCount / 6) as i32)) % 4
                                ]
                            );
                    } else if (l2 == 4 && i2 == 2) {
                        k4 = 0;
                        i5 = -8;
                        j5 =
                            i2 * 3 +
                            unchecked(
                                this.npcWalkModel[
                                    (2 + ((player.stepCount / 6) as i32)) % 4
                                ]
                            );
                    } else if (l2 == 4 && i2 == 3) {
                        k4 = 26;
                        i5 = -5;
                        j5 =
                            i2 * 3 +
                            unchecked(
                                this.npcWalkModel[
                                    (2 + ((player.stepCount / 6) as i32)) % 4
                                ]
                            );
                    } else if (l2 == 3 && i2 == 1) {
                        k4 = 22;
                        i5 = 3;
                        j5 =
                            i2 * 3 +
                            unchecked(
                                this.npcWalkModel[
                                    (2 + ((player.stepCount / 6) as i32)) % 4
                                ]
                            );
                    } else if (l2 == 3 && i2 == 2) {
                        k4 = 0;
                        i5 = 8;
                        j5 =
                            i2 * 3 +
                            unchecked(
                                this.npcWalkModel[
                                    (2 + ((player.stepCount / 6) as i32)) % 4
                                ]
                            );
                    } else if (l2 == 3 && i2 == 3) {
                        k4 = -26;
                        i5 = 5;

                        j5 =
                            i2 * 3 +
                            unchecked(
                                this.npcWalkModel[
                                    (2 + ((player.stepCount / 6) as i32)) % 4
                                ]
                            );
                    }
                }

                if (i2 != 5 || unchecked(GameData.animationHasA[l3]) == 1) {
                    let k5 = j5 + unchecked(GameData.animationNumber[l3]);

                    k4 = ((k4 * w) /
                        unchecked(this.surface!.spriteWidthFull[k5])) as i32;

                    i5 = ((i5 * h) /
                        unchecked(this.surface!.spriteHeightFull[k5])) as i32;

                    let l5 = ((w *
                        unchecked(this.surface!.spriteWidthFull[k5])) /
                        unchecked(
                            this.surface!.spriteWidthFull[
                                GameData.animationNumber[l3]
                            ]
                        )) as i32;

                    k4 -= ((l5 - w) / 2) as i32;

                    let i6 = unchecked(GameData.animationCharacterColour[l3]);

                    const skinColour = unchecked(
                        this.characterSkinColours[player.colourSkin]
                    );

                    if (i6 == 1) {
                        i6 = unchecked(
                            this.characterHairColours[player.colourHair]
                        );
                    } else if (i6 == 2) {
                        i6 = unchecked(
                            this.characterTopBottomColours[player.colourTop]
                        );
                    } else if (i6 == 3) {
                        i6 = unchecked(
                            this.characterTopBottomColours[player.colourBottom]
                        );
                    }

                    this.surface!._spriteClipping_from9(
                        x + k4,
                        y + i5,
                        l5,
                        h,
                        k5,
                        i6,
                        skinColour,
                        tx,
                        flag
                    );
                }
            }
        }

        if (player.messageTimeout > 0) {
            unchecked(
                (this.receivedMessageMidPoint[
                    this.receivedMessagesCount
                ] = (this.surface!.textWidth(player.message!, 1) / 2) as i32)
            );

            if (
                unchecked(
                    this.receivedMessageMidPoint[this.receivedMessagesCount]
                ) > 150
            ) {
                unchecked(
                    (this.receivedMessageMidPoint[
                        this.receivedMessagesCount
                    ] = 150)
                );
            }

            unchecked(
                (this.receivedMessageHeight[this.receivedMessagesCount] =
                    ((this.surface!.textWidth(player.message!, 1) /
                        300) as i32) * this.surface!.textHeight(1))
            );

            unchecked(
                (this.receivedMessageX[this.receivedMessagesCount] =
                    x + ((w / 2) as i32))
            );

            unchecked((this.receivedMessageY[this.receivedMessagesCount] = y));

            unchecked(
                (this.receivedMessages[this.receivedMessagesCount++] =
                    player.message)
            );
        }

        if (player.bubbleTimeout > 0) {
            unchecked(
                (this.actionBubbleX[this.itemsAboveHeadCount] =
                    x + ((w / 2) as i32))
            );

            unchecked((this.actionBubbleY[this.itemsAboveHeadCount] = y));
            unchecked((this.actionBubbleScale[this.itemsAboveHeadCount] = ty));

            unchecked(
                (this.actionBubbleItem[this.itemsAboveHeadCount++] =
                    player.bubbleItem)
            );
        }

        if (
            player.animationCurrent == 8 ||
            player.animationCurrent == 9 ||
            player.combatTimer != 0
        ) {
            if (player.combatTimer > 0) {
                let i3 = x;

                if (player.animationCurrent == 8) {
                    i3 -= ((20 * ty) / 100) as i32;
                } else if (player.animationCurrent == 9) {
                    i3 += ((20 * ty) / 100) as i32;
                }

                let i4 = ((player.healthCurrent * 30) /
                    player.healthMax) as i32;

                unchecked(
                    (this.healthBarX[this.healthBarCount] =
                        i3 + ((w / 2) as i32))
                );

                unchecked((this.healthBarY[this.healthBarCount] = y));
                unchecked((this.healthBarMissing[this.healthBarCount++] = i4));
            }

            if (player.combatTimer > 150) {
                let j3 = x;

                if (player.animationCurrent == 8) {
                    j3 -= ((10 * ty) / 100) as i32;
                } else if (player.animationCurrent == 9) {
                    j3 += ((10 * ty) / 100) as i32;
                }

                this.surface!._drawSprite_from3(
                    j3 + ((w / 2) as i32) - 12,
                    y + ((h / 2) as i32) - 12,
                    this.spriteMedia + 11
                );

                this.surface!.drawStringCenter(
                    player.damageTaken.toString(),
                    j3 + ((w / 2) as i32) - 1,
                    y + ((h / 2) as i32) + 5,
                    3,
                    0xffffff
                );
            }
        }

        if (player.skullVisible == 1 && player.bubbleTimeout == 0) {
            let k3 = tx + x + ((w / 2) as i32);

            if (player.animationCurrent == 8) {
                k3 -= ((20 * ty) / 100) as i32;
            } else if (player.animationCurrent == 9) {
                k3 += ((20 * ty) / 100) as i32;
            }

            let j4 = ((16 * ty) / 100) as i32;
            let l4 = ((16 * ty) / 100) as i32;

            this.surface!._spriteClipping_from5(
                k3 - ((j4 / 2) as i32),
                y - ((l4 / 2) as i32) - (((10 * ty) / 100) as i32),
                j4,
                l4,
                this.spriteMedia + 13
            );
        }
    }

    hasInventoryItems(id: i32, minimum: i32): bool {
        if (
            id == 31 &&
            (this.isItemEquipped(197) ||
                this.isItemEquipped(615) ||
                this.isItemEquipped(682))
        ) {
            return true;
        }

        if (
            id == 32 &&
            (this.isItemEquipped(102) ||
                this.isItemEquipped(616) ||
                this.isItemEquipped(683))
        ) {
            return true;
        }

        if (
            id == 33 &&
            (this.isItemEquipped(101) ||
                this.isItemEquipped(617) ||
                this.isItemEquipped(684))
        ) {
            return true;
        }

        if (
            id == 34 &&
            (this.isItemEquipped(103) ||
                this.isItemEquipped(618) ||
                this.isItemEquipped(685))
        ) {
            return true;
        }

        return this.getInventoryCount(id) >= minimum;
    }

    cantLogout(): void {
        this.logoutTimeout = 0;
        this.showMessage("@cya@Sorry, you can't logout at the moment", 3);
    }

    drawGame(): void {
        if (this.deathScreenTimeout != 0) {
            this.surface!.fadeToBlack();

            this.surface!.drawStringCenter(
                'Oh dear! You are dead...',
                (this.gameWidth / 2) as i32,
                (this.gameHeight / 2) as i32,
                7,
                0xff0000
            );

            this.drawChatMessageTabs();
            //this.surface!.draw(this.graphics, 0, 0);

            return;
        }

        if (this.showAppearanceChange) {
            this.drawAppearancePanelCharacterSprites();
            return;
        }

        if (this.isSleeping) {
            this.drawSleep();
            return;
        }

        if (!this.world!.playerAlive) {
            return;
        }

        for (let i = 0; i < 64; i++) {
            this.scene!.removeModel(
                this.world!.roofModels[this.lastHeightOffset][i]!
            );

            if (this.lastHeightOffset == 0) {
                this.scene!.removeModel(this.world!.wallModels[1][i]!);
                this.scene!.removeModel(this.world!.roofModels[1][i]!);
                this.scene!.removeModel(this.world!.wallModels[2][i]!);
                this.scene!.removeModel(this.world!.roofModels[2][i]!);
            }

            if (this.options.showRoofs) {
                this.fogOfWar = true;

                if (
                    this.lastHeightOffset == 0 &&
                    (this.world!.objectAdjacency.get(
                        (this.localPlayer.currentX / 128) as i32,
                        (this.localPlayer.currentY / 128) as i32
                    ) &
                        128) ==
                        0
                ) {
                    this.scene!.addModel(
                        this.world!.roofModels[this.lastHeightOffset][i]!
                    );

                    if (this.lastHeightOffset == 0) {
                        this.scene!.addModel(this.world!.wallModels[1][i]!);
                        this.scene!.addModel(this.world!.roofModels[1][i]!);
                        this.scene!.addModel(this.world!.wallModels[2][i]!);
                        this.scene!.addModel(this.world!.roofModels[2][i]!);
                    }

                    this.fogOfWar = false;
                }
            }
        }

        if (
            this.objectAnimationNumberFireLightningSpell !=
            this.lastObjectAnimationNumberFireLightningSpell
        ) {
            this.lastObjectAnimationNumberFireLightningSpell = this.objectAnimationNumberFireLightningSpell;

            for (let i = 0; i < this.objectCount; i++) {
                if (this.objectId[i] == 97) {
                    this.updateObjectAnimation(
                        i,
                        'firea' +
                            (
                                this.objectAnimationNumberFireLightningSpell + 1
                            ).toString()
                    );
                }

                if (this.objectId[i] == 274) {
                    this.updateObjectAnimation(
                        i,
                        'fireplacea' +
                            (
                                this.objectAnimationNumberFireLightningSpell + 1
                            ).toString()
                    );
                }

                if (this.objectId[i] == 1031) {
                    this.updateObjectAnimation(
                        i,
                        'lightning' +
                            (
                                this.objectAnimationNumberFireLightningSpell + 1
                            ).toString()
                    );
                }

                if (this.objectId[i] == 1036) {
                    this.updateObjectAnimation(
                        i,
                        'firespell' +
                            (
                                this.objectAnimationNumberFireLightningSpell + 1
                            ).toString()
                    );
                }

                if (this.objectId[i] == 1147) {
                    this.updateObjectAnimation(
                        i,
                        'spellcharge' +
                            (
                                this.objectAnimationNumberFireLightningSpell + 1
                            ).toString()
                    );
                }
            }
        }

        if (
            this.objectAnimationNumberTorch !=
            this.lastObjectAnimationNumberTorch
        ) {
            this.lastObjectAnimationNumberTorch = this.objectAnimationNumberTorch;

            for (let i = 0; i < this.objectCount; i++) {
                if (this.objectId[i] == 51) {
                    this.updateObjectAnimation(
                        i,
                        'torcha' +
                            (this.objectAnimationNumberTorch + 1).toString()
                    );
                }

                if (this.objectId[i] == 143) {
                    this.updateObjectAnimation(
                        i,
                        'skulltorcha' +
                            (this.objectAnimationNumberTorch + 1).toString()
                    );
                }
            }
        }

        if (
            this.objectAnimationNumberClaw != this.lastObjectAnimationNumberClaw
        ) {
            this.lastObjectAnimationNumberClaw = this.objectAnimationNumberClaw;

            for (let i = 0; i < this.objectCount; i++) {
                if (this.objectId[i] == 1142) {
                    this.updateObjectAnimation(
                        i,
                        'clawspell' +
                            (this.objectAnimationNumberClaw + 1).toString()
                    );
                }
            }
        }

        this.scene!.reduceSprites(this.spriteCount);
        this.spriteCount = 0;

        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i]!;

            if (player.colourBottom != 255) {
                const x = player.currentX;
                const y = player.currentY;
                const elevation = -this.world!.getElevation(x, y);
                const id = this.scene!.addSprite(
                    5000 + i,
                    x,
                    elevation,
                    y,
                    145,
                    220,
                    i + 10000
                );

                this.spriteCount++;

                if (player == this.localPlayer) {
                    this.scene!.setLocalPlayer(id);
                }

                if (player.animationCurrent == 8) {
                    this.scene!.setSpriteTranslateX(id, -30);
                }

                if (player.animationCurrent == 9) {
                    this.scene!.setSpriteTranslateX(id, 30);
                }
            }
        }

        for (let i = 0; i < this.playerCount; i++) {
            const player = this.players[i]!;

            if (player.projectileRange > 0) {
                let character: GameCharacter | null = null;

                if (player.attackingNpcServerIndex != -1) {
                    character = this.npcsServer[player.attackingNpcServerIndex];
                } else if (player.attackingPlayerServerIndex != -1) {
                    character = this.playerServer[
                        player.attackingPlayerServerIndex
                    ];
                }

                if (character) {
                    const sx = player.currentX;
                    const sy = player.currentY;
                    const selev = -this.world!.getElevation(sx, sy) - 110;
                    const dx = character.currentX;
                    const dy = character.currentY;
                    const delev = -((this.world!.getElevation(dx, dy) -
                        GameData.npcHeight[character.npcId] / 2) as i32);

                    const rx = ((sx * player.projectileRange +
                        dx *
                            (this.projectileMaxRange -
                                player.projectileRange)) /
                        this.projectileMaxRange) as i32;

                    const rz = ((selev * player.projectileRange +
                        delev *
                            (this.projectileMaxRange -
                                player.projectileRange)) /
                        this.projectileMaxRange) as i32;

                    const ry = ((sy * player.projectileRange +
                        dy *
                            (this.projectileMaxRange -
                                player.projectileRange)) /
                        this.projectileMaxRange) as i32;

                    this.scene!.addSprite(
                        this.spriteProjectile + player.incomingProjectileSprite,
                        rx,
                        rz,
                        ry,
                        32,
                        32,
                        0
                    );
                    this.spriteCount++;
                }
            }
        }

        for (let i = 0; i < this.npcCount; i++) {
            const npc = this.npcs[i]!;
            const i3 = npc.currentX;
            const j4 = npc.currentY;
            const i7 = -this.world!.getElevation(i3, j4);

            const i9 = this.scene!.addSprite(
                20000 + i,
                i3,
                i7,
                j4,
                unchecked(GameData.npcWidth[npc.npcId]),
                unchecked(GameData.npcHeight[npc.npcId]),
                i + 30000
            );

            this.spriteCount++;

            if (npc.animationCurrent == 8) {
                this.scene!.setSpriteTranslateX(i9, -30);
            }

            if (npc.animationCurrent == 9) {
                this.scene!.setSpriteTranslateX(i9, 30);
            }
        }

        for (let i = 0; i < this.groundItemCount; i++) {
            const x = this.groundItemX[i] * this.magicLoc + 64;
            const y = this.groundItemY[i] * this.magicLoc + 64;

            this.scene!.addSprite(
                40000 + this.groundItemID[i],
                x,
                -this.world!.getElevation(x, y) - this.groundItemZ[i],
                y,
                96,
                64,
                i + 20000
            );
            this.spriteCount++;
        }

        for (let i = 0; i < this.teleportBubbleCount; i++) {
            const x = this.teleportBubbleX[i] * this.magicLoc + 64;
            const y = this.teleportBubbleY[i] * this.magicLoc + 64;
            const type = this.teleportBubbleType[i];

            if (type == 0) {
                this.scene!.addSprite(
                    50000 + i,
                    x,
                    -this.world!.getElevation(x, y),
                    y,
                    128,
                    256,
                    i + 50000
                );
                this.spriteCount++;
            }

            if (type == 1) {
                this.scene!.addSprite(
                    50000 + i,
                    x,
                    -this.world!.getElevation(x, y),
                    y,
                    128,
                    64,
                    i + 50000
                );
                this.spriteCount++;
            }
        }

        this.surface!.interlace = false;
        this.surface!.blackScreen();
        this.surface!.interlace = this.interlace;

        if (this.lastHeightOffset == 3) {
            const i5 = 40 + ((Math.random() * 3) as i32);
            const k7 = 40 + ((Math.random() * 7) as i32);

            this.scene!._setLight_from5(i5, k7, -50, -10, -50);
        }

        this.itemsAboveHeadCount = 0;
        this.receivedMessagesCount = 0;
        this.healthBarCount = 0;

        if (this.cameraAutoAngleDebug) {
            if (this.optionCameraModeAuto && !this.fogOfWar) {
                const oldAngle = this.cameraAngle;

                this.autoRotateCamera();

                if (this.cameraAngle != oldAngle) {
                    this.cameraAutoRotatePlayerX = this.localPlayer.currentX;
                    this.cameraAutoRotatePlayerY = this.localPlayer.currentY;
                }
            }

            this.scene!.clipFar3d = 3000;
            this.scene!.clipFar2d = 3000;
            this.scene!.fogZFalloff = 1;
            this.scene!.fogZDistance = 2800;
            this.cameraRotation = this.cameraAngle * 32;

            const x = this.cameraAutoRotatePlayerX + this.cameraRotationX;
            const y = this.cameraAutoRotatePlayerY + this.cameraRotationY;

            this.scene!.setCamera(
                x,
                -this.world!.getElevation(x, y),
                y,
                912,
                this.cameraRotation * 4,
                0,
                2000
            );
        } else {
            if (this.optionCameraModeAuto && !this.fogOfWar) {
                this.autoRotateCamera();
            }

            if (!this.interlace) {
                this.scene!.clipFar3d = 2400;
                this.scene!.clipFar2d = 2400;
                this.scene!.fogZFalloff = 1;
                this.scene!.fogZDistance = 2300;
            } else {
                this.scene!.clipFar3d = 2200;
                this.scene!.clipFar2d = 2200;
                this.scene!.fogZFalloff = 1;
                this.scene!.fogZDistance = 2100;
            }

            if (this.cameraZoom > ZOOM_OUTDOORS) {
                this.scene!.clipFar3d += 1400;
                this.scene!.clipFar2d += 1400;
                this.scene!.fogZDistance += 1400;
            }

            let x = this.cameraAutoRotatePlayerX + this.cameraRotationX;
            let y = this.cameraAutoRotatePlayerY + this.cameraRotationY;

            this.scene!.setCamera(
                x,
                -this.world!.getElevation(x, y),
                y,
                912,
                this.cameraRotation * 4,
                0,
                this.cameraZoom * 2
            );
        }

        this.scene!.render();
        this.drawAboveHeadStuff();

        if (this.mouseClickXStep > 0) {
            this.surface!._drawSprite_from3(
                this.mouseClickXX - 8,
                this.mouseClickXY - 8,
                this.spriteMedia +
                    14 +
                    (((24 - this.mouseClickXStep) / 6) as i32)
            );
        }

        if (this.mouseClickXStep < 0) {
            this.surface!._drawSprite_from3(
                this.mouseClickXX - 8,
                this.mouseClickXY - 8,
                this.spriteMedia +
                    18 +
                    (((24 + this.mouseClickXStep) / 6) as i32)
            );
        }

        // retro fps counter
        if (this.options.fpsCounter) {
            // how much the wilderness skull needs to move for the fps counter
            const offset = this.isInWild ? 70 : 0;

            this.surface!.drawString(
                `Fps: ${this.fps as i32}`,
                this.gameWidth - 62 - offset,
                this.gameHeight - 10,
                1,
                0xffff00
            );
        }

        if (this.systemUpdate != 0) {
            let seconds = (this.systemUpdate / 50) as i32;
            const minutes = (seconds / 60) as i32;

            seconds %= 60;

            if (seconds < 10) {
                this.surface!.drawStringCenter(
                    `System update in: ${minutes}:${seconds}`,
                    256,
                    this.gameHeight - 7,
                    1,
                    0xffff00
                );
            } else {
                this.surface!.drawStringCenter(
                    `System update in: ${minutes}:${seconds}`,
                    256,
                    this.gameHeight - 7,
                    1,
                    0xffff00
                );
            }
        }

        if (!this.loadingArea) {
            let j6 =
                2203 - (this.localRegionY + this.planeHeight + this.regionY);

            if (this.localRegionX + this.planeWidth + this.regionX >= 2640) {
                j6 = -50;
            }

            this.isInWild = j6 > 0;

            if (this.isInWild) {
                // wilderness skull placement made independent of gameWidth
                this.surface!._drawSprite_from3(
                    this.gameWidth - 59,
                    this.gameHeight - 56,
                    this.spriteMedia + 13
                );

                this.surface!.drawStringCenter(
                    'Wilderness',
                    this.gameWidth - 47,
                    this.gameHeight - 20,
                    1,
                    0xffff00
                );

                const wildernessLevel = 1 + ((j6 / 6) as i32);

                this.surface!.drawStringCenter(
                    `Level: ${wildernessLevel}`,
                    this.gameWidth - 47,
                    this.gameHeight - 7,
                    1,
                    0xffff00
                );

                if (this.showUiWildWarn == 0) {
                    this.showUiWildWarn = 2;
                }
            }

            if (this.showUiWildWarn == 0 && j6 > -10 && j6 <= 0) {
                this.showUiWildWarn = 1;
            }
        }

        this.drawChatMessageTabsPanel();

        if (!this.options.mobile) {
            this.surface!._drawSpriteAlpha_from4(
                this.surface!.width2 - 3 - 197,
                3,
                this.spriteMedia,
                128
            );
        }

        this.drawUI();
        this.surface!.loggedIn = false;
        this.drawChatMessageTabs();
        //this.surface!.draw(this.graphics, 0, 0);

        /*if (this.options.mobile) {
            this.drawMobileUI();
        }*/
    }

    isItemEquipped(id: i32): bool {
        for (let i = 0; i < this.inventoryItemsCount; i++) {
            if (
                this.inventoryItemId[i] == id &&
                this.inventoryEquipped[i] == 1
            ) {
                return true;
            }
        }

        return false;
    }

    walkToGroundItem(
        startX: i32,
        startY: i32,
        k: i32,
        l: i32,
        walkToAction: bool
    ): void {
        if (this.walkTo(startX, startY, k, l, k, l, false, walkToAction)) {
            return;
        }

        this._walkToActionSource_from8(
            startX,
            startY,
            k,
            l,
            k,
            l,
            true,
            walkToAction
        );
    }

    showMessage(message: string, type: i32): void {
        if (type == 2 || type == 4 || type == 6) {
            for (
                ;
                message.length > 5 && message[0] == '@' && message[4] == '@';
                message = message.substring(5)
            );

            const colonIndex = message.indexOf(':');

            if (colonIndex != -1) {
                const username = message.substring(0, colonIndex);
                const encodedUsername = encodeUsername(username);

                for (let i1 = 0; i1 < this.ignoreListCount; i1++) {
                    if (this.ignoreList[i1] == encodedUsername) {
                        return;
                    }
                }
            }
        }

        if (type == 2) {
            message = '@yel@' + message;
        } else if (type == 3 || type == 4) {
            message = '@whi@' + message;
        } else if (type == 6) {
            message = '@cya@' + message;
        }

        if (this.messageTabSelected != 0) {
            if (type == 4 || type == 3) {
                this.messageTabFlashAll = 200;
            }

            if (type == 2 && this.messageTabSelected != 1) {
                this.messageTabFlashHistory = 200;
            }

            if (type == 5 && this.messageTabSelected != 2) {
                this.messageTabFlashQuest = 200;
            }

            if (type == 6 && this.messageTabSelected != 3) {
                this.messageTabFlashPrivate = 200;
            }

            if (type == 3 && this.messageTabSelected != 0) {
                this.messageTabSelected = 0;
            }

            if (
                type == 6 &&
                this.messageTabSelected != 3 &&
                this.messageTabSelected != 0
            ) {
                this.messageTabSelected = 0;
            }
        }

        for (let i = 4; i > 0; i--) {
            this.messageHistory[i] = this.messageHistory[i - 1];
            this.messageHistoryTimeout[i] = this.messageHistoryTimeout[i - 1];
        }

        this.messageHistory[0] = message;
        this.messageHistoryTimeout[0] = 300;

        if (type == 2) {
            if (
                this.panelMessageTabs!.controlFlashText[
                    this.controlTextListChat
                ] ==
                this.panelMessageTabs!.controlListEntryCount[
                    this.controlTextListChat
                ] -
                    4
            ) {
                this.panelMessageTabs!.removeListEntry(
                    this.controlTextListChat,
                    message,
                    true
                );
            } else {
                this.panelMessageTabs!.removeListEntry(
                    this.controlTextListChat,
                    message,
                    false
                );
            }
        } else if (type == 5) {
            if (
                this.panelMessageTabs!.controlFlashText[
                    this.controlTextListQuest
                ] ==
                this.panelMessageTabs!.controlListEntryCount[
                    this.controlTextListQuest
                ] -
                    4
            ) {
                this.panelMessageTabs!.removeListEntry(
                    this.controlTextListQuest,
                    message,
                    true
                );
            } else {
                this.panelMessageTabs!.removeListEntry(
                    this.controlTextListQuest,
                    message,
                    false
                );
            }
        } else if (type == 6) {
            if (
                this.panelMessageTabs!.controlFlashText[
                    this.controlTextListPrivate
                ] ==
                this.panelMessageTabs!.controlListEntryCount[
                    this.controlTextListPrivate
                ] -
                    4
            ) {
                this.panelMessageTabs!.removeListEntry(
                    this.controlTextListPrivate,
                    message,
                    true
                );
                return;
            }

            this.panelMessageTabs!.removeListEntry(
                this.controlTextListPrivate,
                message,
                false
            );
        }
    }

    walkToObject(x: i32, y: i32, id: i32, index: i32): void {
        let width = 0;
        let height = 0;

        if (id == 0 || id == 4) {
            width = GameData.objectWidth[index];
            height = GameData.objectHeight[index];
        } else {
            height = GameData.objectWidth[index];
            width = GameData.objectHeight[index];
        }

        if (
            GameData.objectType[index] == 2 ||
            GameData.objectType[index] == 3
        ) {
            if (id == 0) {
                x--;
                width++;
            } else if (id == 2) {
                height++;
            } else if (id == 4) {
                width++;
            } else if (id == 6) {
                y--;
                height++;
            }

            this._walkToActionSource_from8(
                this.localRegionX,
                this.localRegionY,
                x,
                y,
                x + width - 1,
                y + height - 1,
                false,
                true
            );
        } else {
            this._walkToActionSource_from8(
                this.localRegionX,
                this.localRegionY,
                x,
                y,
                x + width - 1,
                y + height - 1,
                true,
                true
            );
        }
    }

    getInventoryCount(id: i32): i32 {
        let count = 0;

        for (let i = 0; i < this.inventoryItemsCount; i++) {
            if (this.inventoryItemId[i] == id) {
                if (GameData.itemStackable[id] == 1) {
                    count++;
                } else {
                    count += this.inventoryItemStackCount[i];
                }
            }
        }

        return count;
    }

    handleMouseDown(_: i32, x: i32, y: i32): void {
        unchecked((this.mouseClickXHistory[this.mouseClickCount] = x));
        unchecked((this.mouseClickYHistory[this.mouseClickCount] = y));
        this.mouseClickCount = (this.mouseClickCount + 1) & 8191;

        for (let i = 10; i < 4000; i++) {
            let i1 = (this.mouseClickCount - i) & 8191;

            if (
                this.mouseClickXHistory[i1] == x &&
                this.mouseClickYHistory[i1] == y
            ) {
                let flag = false;

                for (let j1 = 1; j1 < i; j1++) {
                    let k1 = (this.mouseClickCount - j1) & 8191;
                    let l1 = (i1 - j1) & 8191;

                    if (
                        this.mouseClickXHistory[l1] != x ||
                        this.mouseClickYHistory[l1] != y
                    ) {
                        flag = true;
                    }

                    if (
                        this.mouseClickXHistory[k1] !=
                            this.mouseClickXHistory[l1] ||
                        this.mouseClickYHistory[k1] !=
                            this.mouseClickYHistory[l1]
                    ) {
                        break;
                    }

                    if (
                        j1 == i - 1 &&
                        flag &&
                        this.combatTimeout == 0 &&
                        this.logoutTimeout == 0
                    ) {
                        this.sendLogout();
                        return;
                    }
                }
            }
        }
    }

    drawTeleportBubble(x: i32, y: i32, width: i32, height: i32, id: i32): void {
        const type = this.teleportBubbleType[id];
        const time = this.teleportBubbleTime[id];

        if (type == 0) {
            // blue bubble used for teleports
            const colour = 255 + time * 5 * 256;

            this.surface!.drawCircle(
                x + ((width / 2) | 0),
                y + ((height / 2) | 0),
                20 + time * 2,
                colour,
                255 - time * 5
            );
        } else if (type == 1) {
            // red bubble used for telegrab
            const colour = 0xff0000 + time * 5 * 256;

            this.surface!.drawCircle(
                x + ((width / 2) | 0),
                y + ((height / 2) | 0),
                10 + time,
                colour,
                255 - time * 5
            );
        }
    }

    showServerMessage(message: string): void {
        if (message.toLowerCase().startsWith('@pre@')) {
            this.showMessage(message, 4);
        } else if (message.toLowerCase().startsWith('@pre@')) {
            this.showMessage(`@whi@${message}`, 5);
        } else if (message.toLowerCase().startsWith('@pre@')) {
            this.showMessage(message, 6);
        } else {
            this.showMessage(message, 3);
        }
    }

    updateObjectAnimation(objectIndex: i32, modelName: string): void {
        const objectX = this.objectX[objectIndex];
        const objectY = this.objectY[objectIndex];
        const distanceX = objectX - ((this.localPlayer.currentX / 128) as i32);
        const distanceY = objectY - ((this.localPlayer.currentY / 128) as i32);
        const maxDistance = 7;

        if (
            objectX >= 0 &&
            objectY >= 0 &&
            objectX < 96 &&
            objectY < 96 &&
            distanceX > -maxDistance &&
            distanceX < maxDistance &&
            distanceY > -maxDistance &&
            distanceY < maxDistance
        ) {
            this.scene!.removeModel(this.objectModel[objectIndex]!);

            const modelIndex = GameData.getModelIndex(modelName);
            const gameModel = this.gameModels[modelIndex]!.copy();

            this.scene!.addModel(gameModel);

            gameModel._setLight_from6(true, 48, 48, -50, -10, -50);
            gameModel.copyPosition(this.objectModel[objectIndex]!);
            gameModel.key = objectIndex;

            unchecked((this.objectModel[objectIndex] = gameModel));
        }
    }

    createTopMouseMenu(): void {
        if (this.selectedSpell >= 0 || this.selectedItemInventoryIndex >= 0) {
            unchecked((this.menuItemText1[this.menuItemsCount] = 'Cancel'));
            unchecked((this.menuItemText2[this.menuItemsCount] = ''));
            unchecked((this.menuType[this.menuItemsCount] = 4000));
            this.menuItemsCount++;
        }

        for (let i = 0; i < this.menuItemsCount; i++) {
            this.menuIndices[i] = i;
        }

        for (let flag = false; !flag; ) {
            flag = true;

            for (let j = 0; j < this.menuItemsCount - 1; j++) {
                let l = this.menuIndices[j];
                let j1 = this.menuIndices[j + 1];

                if (this.menuType[l] > this.menuType[j1]) {
                    unchecked((this.menuIndices[j] = j1));
                    unchecked((this.menuIndices[j + 1] = l));
                    flag = false;
                }
            }
        }

        if (this.menuItemsCount > 20) {
            this.menuItemsCount = 20;
        }

        if (this.menuItemsCount > 0) {
            let k = -1;

            for (let i1 = 0; i1 < this.menuItemsCount; i1++) {
                if (
                    !this.menuItemText2[this.menuIndices[i1]] ||
                    this.menuItemText2[this.menuIndices[i1]]!.length <= 0
                ) {
                    continue;
                }

                k = i1;
                break;
            }

            let s: string = '';

            if (
                (this.selectedItemInventoryIndex >= 0 ||
                    this.selectedSpell >= 0) &&
                this.menuItemsCount == 1
            ) {
                s = 'Choose a target';
            } else if (
                (this.selectedItemInventoryIndex >= 0 ||
                    this.selectedSpell >= 0) &&
                this.menuItemsCount > 1
            ) {
                s =
                    '@whi@' +
                    this.menuItemText1[this.menuIndices[0]]! +
                    ' ' +
                    this.menuItemText2[this.menuIndices[0]]!;
            } else if (k != -1) {
                s =
                    this.menuItemText2[this.menuIndices[k]]! +
                    ': @whi@' +
                    this.menuItemText1[this.menuIndices[0]]!;
            }

            if (this.menuItemsCount == 2 && s) {
                s += '@whi@ / 1 more option';
            }

            if (this.menuItemsCount > 2 && s) {
                s += `@whi@ / ${this.menuItemsCount - 1} more options`;
            }

            if (!this.options.mobile && s) {
                this.surface!.drawString(s, 6, 14, 1, 0xffff00);
            }

            if (
                (!this.optionMouseButtonOne && this.mouseButtonClick == 1) ||
                (this.optionMouseButtonOne &&
                    this.mouseButtonClick == 1 &&
                    this.menuItemsCount == 1)
            ) {
                this.menuItemClick(this.menuIndices[0]);
                this.mouseButtonClick = 0;
                return;
            }

            if (
                (!this.optionMouseButtonOne && this.mouseButtonClick == 2) ||
                (this.optionMouseButtonOne && this.mouseButtonClick == 1)
            ) {
                this.menuHeight = (this.menuItemsCount + 1) * 15;
                this.menuWidth =
                    this.surface!.textWidth('Choose option', 1) + 5;

                for (let k1 = 0; k1 < this.menuItemsCount; k1++) {
                    let l1 =
                        this.surface!.textWidth(
                            this.menuItemText1[k1] +
                                ' ' +
                                this.menuItemText2[k1]!,
                            1
                        ) + 5;

                    if (l1 > this.menuWidth) {
                        this.menuWidth = l1;
                    }
                }

                this.menuX = this.mouseX - ((this.menuWidth / 2) as i32);
                this.menuY = this.mouseY - 7;
                this.showRightClickMenu = true;

                if (this.menuX < 0) {
                    this.menuX = 0;
                }

                if (this.menuY < 0) {
                    this.menuY = 0;
                }

                if (this.menuX + this.menuWidth > 510) {
                    this.menuX = 510 - this.menuWidth;
                }

                if (this.menuY + this.menuHeight > 315) {
                    this.menuY = 315 - this.menuHeight;
                }

                this.mouseButtonClick = 0;
            }
        }
    }

    menuItemClick(i: i32): void {
        const menuX = this.menuItemX[i];
        const menuY = this.menuItemY[i];
        const menuIndex = this.menuIndex[i];
        const menuSourceIndex = this.menuSourceIndex[i];
        const menuTargetIndex = this.menuTargetIndex[i];
        const menuType = this.menuType[i];

        /*if (this.options.mobile && this.menuItemText2[i]) {
            this.menuText = `${this.menuItemText1[i]} ${this.menuItemText2[i]}`;
            this.menuTextWidth = this.surface.textWidth(this.menuText, 1);
            this.menuX = this.mouseX;
            this.menuY = this.mouseY;
            this.menuActionTimeout = 60;
            // TODO Math.max() the menuX
        }*/

        switch (menuType) {
            case 200:
                this.walkToGroundItem(
                    this.localRegionX,
                    this.localRegionY,
                    menuX,
                    menuY,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.CAST_GROUNDITEM);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            case 210:
                this.walkToGroundItem(
                    this.localRegionX,
                    this.localRegionY,
                    menuX,
                    menuY,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.USEWITH_GROUNDITEM);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                break;
            case 220:
                this.walkToGroundItem(
                    this.localRegionX,
                    this.localRegionY,
                    menuX,
                    menuY,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.GROUNDITEM_TAKE);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                break;
            case 3200:
                this.showMessage(GameData.itemDescription[menuIndex], 3);
                break;
            case 300:
                this.walkToWallObject(menuX, menuY, menuIndex);
                this.packetStream!.newPacket(ClientOpcodes.CAST_WALLOBJECT);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putByte(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            case 310:
                this.walkToWallObject(menuX, menuY, menuIndex);
                this.packetStream!.newPacket(ClientOpcodes.USEWITH_WALLOBJECT);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putByte(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                break;
            case 320:
                this.walkToWallObject(menuX, menuY, menuIndex);
                this.packetStream!.newPacket(
                    ClientOpcodes.WALL_OBJECT_COMMAND1
                );
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putByte(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 2300:
                this.walkToWallObject(menuX, menuY, menuIndex);

                this.packetStream!.newPacket(
                    ClientOpcodes.WALL_OBJECT_COMMAND2
                );

                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putByte(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 3300:
                this.showMessage(GameData.wallObjectDescription[menuIndex], 3);
                break;
            case 400:
                this.walkToObject(menuX, menuY, menuIndex, menuSourceIndex);
                this.packetStream!.newPacket(ClientOpcodes.CAST_OBJECT);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putShort(menuTargetIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            case 410:
                this.walkToObject(menuX, menuY, menuIndex, menuSourceIndex);
                this.packetStream!.newPacket(ClientOpcodes.USEWITH_OBJECT);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putShort(menuTargetIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                break;
            case 420:
                this.walkToObject(menuX, menuY, menuIndex, menuSourceIndex);
                this.packetStream!.newPacket(ClientOpcodes.OBJECT_CMD1);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.sendPacket();
                break;
            case 2400:
                this.walkToObject(menuX, menuY, menuIndex, menuSourceIndex);
                this.packetStream!.newPacket(ClientOpcodes.OBJECT_CMD2);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.sendPacket();
                break;
            case 3400:
                this.showMessage(GameData.objectDescription[menuIndex], 3);
                break;
            case 600:
                this.packetStream!.newPacket(ClientOpcodes.CAST_INVITEM);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            case 610:
                this.packetStream!.newPacket(ClientOpcodes.USEWITH_INVITEM);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                break;
            case 620:
                this.packetStream!.newPacket(ClientOpcodes.INV_UNEQUIP);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 630:
                this.packetStream!.newPacket(ClientOpcodes.INV_WEAR);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 640:
                this.packetStream!.newPacket(ClientOpcodes.INV_CMD);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 650:
                this.selectedItemInventoryIndex = menuIndex;
                this.showUITab = 0;

                this.selectedItemName =
                    GameData.itemName[
                        this.inventoryItemId[this.selectedItemInventoryIndex]
                    ];
                break;
            case 660:
                this.packetStream!.newPacket(ClientOpcodes.INV_DROP);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                this.showUITab = 0;

                this.showMessage(
                    'Dropping ' +
                        GameData.itemName[this.inventoryItemId[menuIndex]],
                    4
                );
                break;
            case 3600:
                this.showMessage(GameData.itemDescription[menuIndex], 3);
                break;
            case 700: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.CAST_NPC);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            }
            case 710: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.USEWITH_NPC);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                break;
            }
            case 720: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.NPC_TALK);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            }
            case 725: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.NPC_CMD);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            }
            case 715:
            case 2715: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.NPC_ATTACK);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            }
            case 3700:
                this.showMessage(GameData.npcDescription[menuIndex], 3);
                break;
            case 800: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.CAST_PLAYER);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            }
            case 810: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );
                this.packetStream!.newPacket(ClientOpcodes.USEWITH_PLAYER);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.putShort(menuSourceIndex);
                this.packetStream!.sendPacket();
                this.selectedItemInventoryIndex = -1;
                break;
            }
            case 805:
            case 2805: {
                const x = ((menuX - 64) / this.magicLoc) as i32;
                const y = ((menuY - 64) / this.magicLoc) as i32;

                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    x,
                    y,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.PLAYER_ATTACK);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            }
            case 2806:
                this.packetStream!.newPacket(ClientOpcodes.PLAYER_DUEL);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 2810:
                this.packetStream!.newPacket(ClientOpcodes.PLAYER_TRADE);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 2820:
                this.packetStream!.newPacket(ClientOpcodes.PLAYER_FOLLOW);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                break;
            case 900:
                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    menuX,
                    menuY,
                    true
                );

                this.packetStream!.newPacket(ClientOpcodes.CAST_GROUND);
                this.packetStream!.putShort(menuX + this.regionX);
                this.packetStream!.putShort(menuY + this.regionY);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            case 920:
                this._walkToActionSource_from5(
                    this.localRegionX,
                    this.localRegionY,
                    menuX,
                    menuY,
                    false
                );

                if (this.mouseClickXStep == -24) {
                    this.mouseClickXStep = 24;
                }
                break;
            case 1000:
                this.packetStream!.newPacket(ClientOpcodes.CAST_SELF);
                this.packetStream!.putShort(menuIndex);
                this.packetStream!.sendPacket();
                this.selectedSpell = -1;
                break;
            case 4000:
                this.selectedItemInventoryIndex = -1;
                this.selectedSpell = -1;
                break;
        }
    }

    showLoginScreenStatus(s: string, s1: string): void {
        if (this.loginScreen == 1) {
            this.panelLoginNewUser!.updateText(
                this.controlRegisterStatus,
                s + ' ' + s1
            );
        } else if (this.loginScreen == 2) {
            this.panelLoginExistingUser!.updateText(
                this.controlLoginStatus,
                s + ' ' + s1
            );
        }

        this.loginUserDisp = s1;
        this.drawLoginScreens();
        this.resetTimings();
    }

    isValidCameraAngle(angle: i32): bool {
        const x = (this.localPlayer.currentX / 128) as i32;
        const y = (this.localPlayer.currentY / 128) as i32;

        for (let l = 2; l >= 1; l--) {
            if (
                angle == 1 &&
                ((this.world!.objectAdjacency.get(x, y - l) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x - l, y) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x - l, y - l) & 128) ==
                        128)
            ) {
                return false;
            }

            if (
                angle == 3 &&
                ((this.world!.objectAdjacency.get(x, y + l) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x - l, y) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x - l, y + l) & 128) ==
                        128)
            ) {
                return false;
            }

            if (
                angle == 5 &&
                ((this.world!.objectAdjacency.get(x, y + l) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x + l, y) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x + l, y + l) & 128) ==
                        128)
            ) {
                return false;
            }

            if (
                angle == 7 &&
                ((this.world!.objectAdjacency.get(x, y - l) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x + l, y) & 128) == 128 ||
                    (this.world!.objectAdjacency.get(x + l, y - l) & 128) ==
                        128)
            ) {
                return false;
            }

            if (
                angle == 0 &&
                (this.world!.objectAdjacency.get(x, y - l) & 128) == 128
            ) {
                return false;
            }

            if (
                angle == 2 &&
                (this.world!.objectAdjacency.get(x - l, y) & 128) == 128
            ) {
                return false;
            }

            if (
                angle == 4 &&
                (this.world!.objectAdjacency.get(x, y + l) & 128) == 128
            ) {
                return false;
            }

            if (
                angle == 6 &&
                (this.world!.objectAdjacency.get(x + l, y) & 128) == 128
            ) {
                return false;
            }
        }

        return true;
    }

    resetLoginScreenVariables(): void {
        this.loggedIn = 0;
        this.loginScreen = 0;
        this.loginUser = '';
        this.loginPass = '';
        this.loginUserDesc = 'Please enter a username:';
        this.loginUserDisp = `*${this.loginUser}*`;
        this.playerCount = 0;
        this.npcCount = 0;
    }

    createRightClickMenu(): void {
        let i = 2203 - (this.localRegionY + this.planeHeight + this.regionY);

        if (this.localRegionX + this.planeWidth + this.regionX >= 2640) {
            i = -50;
        }

        let j = -1;

        for (let k = 0; k < this.objectCount; k++) {
            unchecked((this.objectAlreadyInMenu[k] = false));
        }

        for (let l = 0; l < this.wallObjectCount; l++) {
            unchecked((this.wallObjectAlreadyInMenu[l] = false));
        }

        let i1 = this.scene!.mousePickedCount;
        let objs = this.scene!.mousePickedModels;
        let plyrs = this.scene!.mousePickedFaces;

        for (let menuIdx = 0; menuIdx < i1; menuIdx++) {
            if (this.menuItemsCount > 200) {
                break;
            }

            let pid = plyrs[menuIdx];
            let gameModel = objs[menuIdx]!;

            if (
                gameModel.faceTag![pid] <= 65535 ||
                (gameModel.faceTag![pid] >= 200000 &&
                    gameModel.faceTag![pid] <= 300000)
            ) {
                if (gameModel == this.scene!.view) {
                    let idx = gameModel.faceTag![pid] % 10000;
                    const type = (gameModel.faceTag![pid] / 10000) | 0;

                    if (type == 1) {
                        let menuText = '';
                        let k3 = 0;

                        if (
                            this.localPlayer.level > 0 &&
                            unchecked(this.players[idx]!).level > 0
                        ) {
                            k3 =
                                this.localPlayer.level -
                                unchecked(this.players[idx]!).level;
                        }

                        if (k3 < 0) {
                            menuText = '@or1@';
                        }

                        if (k3 < -3) {
                            menuText = '@or2@';
                        }

                        if (k3 < -6) {
                            menuText = '@or3@';
                        }

                        if (k3 < -9) {
                            menuText = '@red@';
                        }

                        if (k3 > 0) {
                            menuText = '@gr1@';
                        }

                        if (k3 > 3) {
                            menuText = '@gr2@';
                        }

                        if (k3 > 6) {
                            menuText = '@gr3@';
                        }

                        if (k3 > 9) {
                            menuText = '@gre@';
                        }

                        menuText = ` ${menuText}(level-${
                            this.players[idx]!.level
                        })`;

                        if (this.selectedSpell >= 0) {
                            if (
                                GameData.spellType[this.selectedSpell] == 1 ||
                                GameData.spellType[this.selectedSpell] == 2
                            ) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Cast ' +
                                        GameData.spellName[this.selectedSpell] +
                                        ' on')
                                );

                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@whi@' +
                                        this.players[idx]!.name! +
                                        menuText)
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 800)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.currentX)
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.currentY)
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.serverIndex)
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.selectedSpell)
                                );

                                this.menuItemsCount++;
                            }
                        } else if (this.selectedItemInventoryIndex >= 0) {
                            unchecked(
                                (this.menuItemText1[
                                    this.menuItemsCount
                                ] = `Use ${this.selectedItemName} with`)
                            );

                            unchecked(
                                (this.menuItemText2[
                                    this.menuItemsCount
                                ] = `@whi@${
                                    this.players[idx]!.name!
                                }${menuText}`)
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 810)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.players[idx]!.currentX)
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.players[idx]!.currentY)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.players[idx]!.serverIndex)
                            );

                            unchecked(
                                (this.menuSourceIndex[
                                    this.menuItemsCount
                                ] = this.selectedItemInventoryIndex)
                            );

                            this.menuItemsCount++;
                        } else {
                            if (
                                i > 0 &&
                                (((this.players[idx]!.currentY - 64) /
                                    this.magicLoc +
                                    this.planeHeight +
                                    this.regionY) as i32) < 2203
                            ) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Attack')
                                );

                                unchecked(
                                    (this.menuItemText2[
                                        this.menuItemsCount
                                    ] = `@whi@${this.players[idx]!
                                        .name!}${menuText}`)
                                );

                                if (k3 >= 0 && k3 < 5) {
                                    unchecked(
                                        (this.menuType[
                                            this.menuItemsCount
                                        ] = 805)
                                    );
                                } else {
                                    unchecked(
                                        (this.menuType[
                                            this.menuItemsCount
                                        ] = 2805)
                                    );
                                }

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.currentX)
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.currentY)
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.serverIndex)
                                );

                                this.menuItemsCount++;
                            } else if (this.members) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Duel with')
                                );

                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@whi@' +
                                        this.players[idx]!.name! +
                                        menuText)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.currentX)
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.currentY)
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 2806)
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.players[idx]!.serverIndex)
                                );

                                this.menuItemsCount++;
                            }

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Trade with')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@whi@' +
                                    this.players[idx]!.name! +
                                    menuText)
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 2810)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.players[idx]!.serverIndex)
                            );

                            this.menuItemsCount++;

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Follow')
                            );

                            unchecked(
                                (this.menuItemText2[
                                    this.menuItemsCount
                                ] = `@whi@${this.players[idx]!
                                    .name!}${menuText}`)
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 2820)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.players[idx]!.serverIndex)
                            );

                            this.menuItemsCount++;
                        }
                    } else if (type == 2) {
                        if (this.selectedSpell >= 0) {
                            if (GameData.spellType[this.selectedSpell] == 3) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Cast ' +
                                        GameData.spellName[this.selectedSpell] +
                                        ' on')
                                );

                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@lre@' +
                                        GameData.itemName[
                                            this.groundItemID[idx]
                                        ])
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 200)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.groundItemX[idx])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.groundItemY[idx])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.groundItemID[idx])
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.selectedSpell)
                                );
                                this.menuItemsCount++;
                            }
                        } else if (this.selectedItemInventoryIndex >= 0) {
                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Use ' + this.selectedItemName + ' with')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@lre@' +
                                    GameData.itemName[this.groundItemID[idx]])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 210)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.groundItemX[idx])
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.groundItemY[idx])
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.groundItemID[idx])
                            );

                            unchecked(
                                (this.menuSourceIndex[
                                    this.menuItemsCount
                                ] = this.selectedItemInventoryIndex)
                            );

                            this.menuItemsCount++;
                        } else {
                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Take')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@lre@' +
                                    GameData.itemName[this.groundItemID[idx]])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 220)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.groundItemX[idx])
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.groundItemY[idx])
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.groundItemID[idx])
                            );

                            this.menuItemsCount++;

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Examine')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@lre@' +
                                    GameData.itemName[this.groundItemID[idx]])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 3200)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.groundItemID[idx])
                            );

                            this.menuItemsCount++;
                        }
                    } else if (type == 3) {
                        let menuText = '';
                        let levelDiff = -1;
                        const id = unchecked(this.npcs[idx]!).npcId;

                        if (GameData.npcAttackable[id] > 0) {
                            const npcLevel = ((GameData.npcAttack[id] +
                                GameData.npcDefense[id] +
                                GameData.npcStrength[id] +
                                GameData.npcHits[id]) /
                                4) as i32;
                            const playerLevel = ((this.playerStatBase[0] +
                                this.playerStatBase[1] +
                                this.playerStatBase[2] +
                                this.playerStatBase[3] +
                                27) /
                                4) as i32;

                            levelDiff = playerLevel - npcLevel;
                            menuText = '@yel@';

                            if (levelDiff < 0) {
                                menuText = '@or1@';
                            }

                            if (levelDiff < -3) {
                                menuText = '@or2@';
                            }

                            if (levelDiff < -6) {
                                menuText = '@or3@';
                            }

                            if (levelDiff < -9) {
                                menuText = '@red@';
                            }

                            if (levelDiff > 0) {
                                menuText = '@gr1@';
                            }

                            if (levelDiff > 3) {
                                menuText = '@gr2@';
                            }

                            if (levelDiff > 6) {
                                menuText = '@gr3@';
                            }

                            if (levelDiff > 9) {
                                menuText = '@gre@';
                            }

                            menuText = ` ${menuText}(level-${npcLevel})`;
                        }

                        if (this.selectedSpell >= 0) {
                            if (GameData.spellType[this.selectedSpell] == 2) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Cast ' +
                                        GameData.spellName[this.selectedSpell] +
                                        ' on')
                                );
                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@yel@' +
                                        GameData.npcName[this.npcs[idx]!.npcId])
                                );
                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 700)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.currentX)
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.currentY)
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.serverIndex)
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.selectedSpell)
                                );

                                this.menuItemsCount++;
                            }
                        } else if (this.selectedItemInventoryIndex >= 0) {
                            unchecked(
                                (this.menuItemText1[
                                    this.menuItemsCount
                                ] = `Use ${this.selectedItemName} with`)
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@yel@' +
                                    GameData.npcName[this.npcs[idx]!.npcId])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 710)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.currentX)
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.currentY)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.serverIndex)
                            );

                            unchecked(
                                (this.menuSourceIndex[
                                    this.menuItemsCount
                                ] = this.selectedItemInventoryIndex)
                            );

                            this.menuItemsCount++;
                        } else {
                            if (GameData.npcAttackable[id] > 0) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Attack')
                                );

                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@yel@' +
                                        GameData.npcName[this.npcs[idx]!.npcId])
                                );
                                menuText;

                                if (levelDiff >= 0) {
                                    this.menuType[this.menuItemsCount] = 715;
                                } else {
                                    unchecked(
                                        (this.menuType[
                                            this.menuItemsCount
                                        ] = 2715)
                                    );
                                }

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.currentX)
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.currentY)
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.serverIndex)
                                );

                                this.menuItemsCount++;
                            }

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Talk-to')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@yel@' +
                                    GameData.npcName[this.npcs[idx]!.npcId])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 720)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.currentX)
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.currentY)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.serverIndex)
                            );

                            this.menuItemsCount++;

                            if (GameData.npcCommand[id] != '') {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        GameData.npcCommand[id])
                                );

                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@yel@' +
                                        GameData.npcName[this.npcs[idx]!.npcId])
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 725)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.currentX)
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.currentY)
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.npcs[idx]!.serverIndex)
                                );

                                this.menuItemsCount++;
                            }

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Examine')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@yel@' +
                                    GameData.npcName[this.npcs[idx]!.npcId])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 3700)
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.npcs[idx]!.npcId)
                            );

                            this.menuItemsCount++;
                        }
                    }
                } else if (gameModel && gameModel.key >= 10000) {
                    const index = gameModel.key - 10000;
                    const id = unchecked(this.wallObjectId[index]);

                    if (!this.wallObjectAlreadyInMenu[index]) {
                        if (this.selectedSpell >= 0) {
                            if (GameData.spellType[this.selectedSpell] == 4) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Cast ' +
                                        GameData.spellName[this.selectedSpell] +
                                        ' on')
                                );

                                unchecked(
                                    (this.menuItemText2[
                                        this.menuItemsCount
                                    ] = `@cya@${GameData.wallObjectName[id]}`)
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 300)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.wallObjectX[index])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.wallObjectY[index])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.wallObjectDirection[index])
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.selectedSpell)
                                );

                                this.menuItemsCount++;
                            }
                        } else if (this.selectedItemInventoryIndex >= 0) {
                            unchecked(
                                (this.menuItemText1[
                                    this.menuItemsCount
                                ] = `Use ${this.selectedItemName} with`)
                            );

                            unchecked(
                                (this.menuItemText2[
                                    this.menuItemsCount
                                ] = `@cya@${GameData.wallObjectName[id]}`)
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 310)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.wallObjectX[index])
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.wallObjectY[index])
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.wallObjectDirection[index])
                            );

                            unchecked(
                                (this.menuSourceIndex[
                                    this.menuItemsCount
                                ] = this.selectedItemInventoryIndex)
                            );

                            this.menuItemsCount++;
                        } else {
                            if (
                                unchecked(
                                    GameData.wallObjectCommand1[id]
                                ).toLowerCase() != 'walkto'
                            ) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        GameData.wallObjectCommand1[id])
                                );

                                unchecked(
                                    (this.menuItemText2[
                                        this.menuItemsCount
                                    ] = `@cya@${GameData.wallObjectName[id]}`)
                                );
                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 320)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.wallObjectX[index])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.wallObjectY[index])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.wallObjectDirection[index])
                                );

                                this.menuItemsCount++;
                            }

                            if (
                                unchecked(
                                    GameData.wallObjectCommand2[id]
                                ).toLowerCase() != 'examine'
                            ) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        GameData.wallObjectCommand2[id])
                                );

                                unchecked(
                                    (this.menuItemText2[
                                        this.menuItemsCount
                                    ] = `@cya@${GameData.wallObjectName[id]}`)
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 2300)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.wallObjectX[index])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.wallObjectY[index])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.wallObjectDirection[index])
                                );

                                this.menuItemsCount++;
                            }

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Examine')
                            );

                            unchecked(
                                (this.menuItemText2[
                                    this.menuItemsCount
                                ] = `@cya@${GameData.wallObjectName[id]}`)
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 3300)
                            );

                            unchecked(
                                (this.menuIndex[this.menuItemsCount] = id)
                            );

                            this.menuItemsCount++;
                        }

                        unchecked((this.wallObjectAlreadyInMenu[index] = true));
                    }
                } else if (gameModel && gameModel.key >= 0) {
                    const index = gameModel.key;
                    const id = this.objectId[index];

                    if (!this.objectAlreadyInMenu[index]) {
                        if (this.selectedSpell >= 0) {
                            if (GameData.spellType[this.selectedSpell] == 5) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        'Cast ' +
                                        GameData.spellName[this.selectedSpell] +
                                        ' on')
                                );

                                unchecked(
                                    (this.menuItemText2[
                                        this.menuItemsCount
                                    ] = `@cya@${GameData.objectName[id]}`)
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 400)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.objectX[index])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.objectY[index])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.objectDirection[index])
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.objectId[index])
                                );

                                unchecked(
                                    (this.menuTargetIndex[
                                        this.menuItemsCount
                                    ] = this.selectedSpell)
                                );

                                this.menuItemsCount++;
                            }
                        } else if (this.selectedItemInventoryIndex >= 0) {
                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Use ' + this.selectedItemName + ' with')
                            );

                            unchecked(
                                (this.menuItemText2[this.menuItemsCount] =
                                    '@cya@' + GameData.objectName[id])
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 410)
                            );

                            unchecked(
                                (this.menuItemX[
                                    this.menuItemsCount
                                ] = this.objectX[index])
                            );

                            unchecked(
                                (this.menuItemY[
                                    this.menuItemsCount
                                ] = this.objectY[index])
                            );

                            unchecked(
                                (this.menuIndex[
                                    this.menuItemsCount
                                ] = this.objectDirection[index])
                            );

                            unchecked(
                                (this.menuSourceIndex[
                                    this.menuItemsCount
                                ] = this.objectId[index])
                            );

                            unchecked(
                                (this.menuTargetIndex[
                                    this.menuItemsCount
                                ] = this.selectedItemInventoryIndex)
                            );

                            this.menuItemsCount++;
                        } else {
                            if (
                                GameData.objectCommand1[id].toLowerCase() !=
                                'walkto'
                            ) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        GameData.objectCommand1[id])
                                );

                                unchecked(
                                    (this.menuItemText2[
                                        this.menuItemsCount
                                    ] = `@cya@${GameData.objectName[id]}`)
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 420)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.objectX[index])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.objectY[index])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.objectDirection[index])
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.objectId[index])
                                );

                                this.menuItemsCount++;
                            }

                            if (
                                GameData.objectCommand2[id].toLowerCase() !=
                                'examine'
                            ) {
                                unchecked(
                                    (this.menuItemText1[this.menuItemsCount] =
                                        GameData.objectCommand2[id])
                                );

                                unchecked(
                                    (this.menuItemText2[this.menuItemsCount] =
                                        '@cya@' + GameData.objectName[id])
                                );

                                unchecked(
                                    (this.menuType[this.menuItemsCount] = 2400)
                                );

                                unchecked(
                                    (this.menuItemX[
                                        this.menuItemsCount
                                    ] = this.objectX[index])
                                );

                                unchecked(
                                    (this.menuItemY[
                                        this.menuItemsCount
                                    ] = this.objectY[index])
                                );

                                unchecked(
                                    (this.menuIndex[
                                        this.menuItemsCount
                                    ] = this.objectDirection[index])
                                );

                                unchecked(
                                    (this.menuSourceIndex[
                                        this.menuItemsCount
                                    ] = this.objectId[index])
                                );

                                this.menuItemsCount++;
                            }

                            unchecked(
                                (this.menuItemText1[this.menuItemsCount] =
                                    'Examine')
                            );

                            unchecked(
                                (this.menuItemText2[
                                    this.menuItemsCount
                                ] = `@cya@${GameData.objectName[id]}`)
                            );

                            unchecked(
                                (this.menuType[this.menuItemsCount] = 3400)
                            );

                            unchecked(
                                (this.menuIndex[this.menuItemsCount] = id)
                            );

                            this.menuItemsCount++;
                        }

                        unchecked((this.objectAlreadyInMenu[index] = true));
                    }
                } else {
                    if (pid >= 0) {
                        pid = gameModel.faceTag![pid] - 200000;
                    }

                    if (pid >= 0) {
                        j = pid;
                    }
                }
            }
        }

        if (
            this.selectedSpell >= 0 &&
            unchecked(GameData.spellType[this.selectedSpell]) <= 1
        ) {
            unchecked(
                (this.menuItemText1[this.menuItemsCount] = `Cast ${
                    GameData.spellName[this.selectedSpell]
                } on self`)
            );

            unchecked((this.menuItemText2[this.menuItemsCount] = ''));
            unchecked((this.menuType[this.menuItemsCount] = 1000));

            unchecked(
                (this.menuIndex[this.menuItemsCount] = this.selectedSpell)
            );

            this.menuItemsCount++;
        }

        if (j != -1) {
            if (this.selectedSpell >= 0) {
                if (GameData.spellType[this.selectedSpell] == 6) {
                    unchecked(
                        (this.menuItemText1[this.menuItemsCount] =
                            `Cast ${GameData.spellName[this.selectedSpell]}` +
                            ' on ground')
                    );

                    unchecked((this.menuItemText2[this.menuItemsCount] = ''));
                    unchecked((this.menuType[this.menuItemsCount] = 900));

                    unchecked(
                        (this.menuItemX[
                            this.menuItemsCount
                        ] = this.world!.localX[j])
                    );

                    unchecked(
                        (this.menuItemY[
                            this.menuItemsCount
                        ] = this.world!.localY[j])
                    );

                    unchecked(
                        (this.menuIndex[
                            this.menuItemsCount
                        ] = this.selectedSpell)
                    );

                    this.menuItemsCount++;
                    return;
                }
            } else if (this.selectedItemInventoryIndex < 0) {
                unchecked(
                    (this.menuItemText1[this.menuItemsCount] = 'Walk here')
                );

                unchecked((this.menuItemText2[this.menuItemsCount] = ''));

                unchecked((this.menuType[this.menuItemsCount] = 920));

                unchecked(
                    (this.menuItemX[this.menuItemsCount] = this.world!.localX[
                        j
                    ])
                );

                unchecked(
                    (this.menuItemY[this.menuItemsCount] = this.world!.localY[
                        j
                    ])
                );

                this.menuItemsCount++;
            }
        }
    }

    createModel(
        x: i32,
        y: i32,
        direction: i32,
        id: i32,
        count: i32
    ): GameModel {
        let x1 = x;
        let y1 = y;
        let x2 = x;
        let y2 = y;

        const frontTexture = unchecked(GameData.wallObjectTextureFront[id]);
        const backTexture = unchecked(GameData.wallObjectTextureBack[id]);
        const height = unchecked(GameData.wallObjectHeight[id]);
        const gameModel = GameModel._from2(4, 1);

        if (direction == 0) {
            x2 = x + 1;
        } else if (direction == 1) {
            y2 = y + 1;
        } else if (direction == 2) {
            x1 = x + 1;
            y2 = y + 1;
        } else if (direction == 3) {
            x2 = x + 1;
            y2 = y + 1;
        }

        x1 *= this.magicLoc;
        y1 *= this.magicLoc;
        x2 *= this.magicLoc;
        y2 *= this.magicLoc;

        const vertices = new Int32Array(4);

        unchecked(
            (vertices[0] = gameModel.vertexAt(
                x1,
                -this.world!.getElevation(x1, y1),
                y1
            ))
        );

        unchecked(
            (vertices[1] = gameModel.vertexAt(
                x1,
                -this.world!.getElevation(x1, y1) - height,
                y1
            ))
        );

        unchecked(
            (vertices[2] = gameModel.vertexAt(
                x2,
                -this.world!.getElevation(x2, y2) - height,
                y2
            ))
        );

        unchecked(
            (vertices[3] = gameModel.vertexAt(
                x2,
                -this.world!.getElevation(x2, y2),
                y2
            ))
        );

        gameModel.createFace(4, vertices, frontTexture, backTexture);
        gameModel._setLight_from6(false, 60, 24, -50, -10, -50);

        if (x >= 0 && y >= 0 && x < 96 && y < 96) {
            this.scene!.addModel(gameModel);
        }

        gameModel.key = count + 10000;

        return gameModel;
    }

    panelAppearance: Panel | null;

    controlButtonAppearanceHeadLeft: i32;
    controlButtonAppearanceHeadRight: i32;
    controlButtonAppearanceHairLeft: i32;
    controlButtonAppearanceHairRight: i32;
    controlButtonAppearanceGenderLeft: i32;
    controlButtonAppearanceGenderRight: i32;
    controlButtonAppearanceTopLeft: i32;
    controlButtonAppearanceTopRight: i32;
    controlButtonAppearanceSkinLeft: i32;
    controlButtonAppearanceSkinRight: i32;
    controlButtonAppearanceBottomLeft: i32;
    controlButtonAppearanceBottomRight: i32;
    controlButtonAppearanceAccept: i32;

    drawAppearanceOption(
        panel: Panel,
        type: string,
        x: i32,
        y: i32
    ): Int32Array {
        // size of the -> sprite
        const ARROW_SIZE = 20;

        const BOX_WIDTH = 53;
        const BOX_HEIGHT = 41;

        panel.addBoxRounded(x, y, BOX_WIDTH, BOX_HEIGHT);

        const typeSplit = type.split('\n');

        if (typeSplit.length == 1) {
            panel.addTextCentre(x, y, type, 1, true);
        } else {
            panel.addTextCentre(x, y - 8, typeSplit[0], 1, true);
            panel.addTextCentre(x, y + 8, typeSplit[1], 1, true);
        }

        const leftButton = panel.addButton(x - 40, y, ARROW_SIZE, ARROW_SIZE);
        panel.addSprite(x - 40, y, Panel.baseSpriteStart + 7);

        const rightButton = panel.addButton(x + 40, y, ARROW_SIZE, ARROW_SIZE);
        panel.addSprite(x + 40, y, Panel.baseSpriteStart + 6);

        const buttons = new Int32Array(2);
        unchecked((buttons[0] = leftButton));
        unchecked((buttons[1] = rightButton));

        return buttons;
    }

    createAppearancePanel(): void {
        // the width of each option column including the arrows
        const COLUMN_WIDTH = 54;

        // size of the accept button
        const ACCEPT_WIDTH = 200;
        const ACCEPT_HEIGHT = 30;

        this.panelAppearance = new Panel(this.surface!, 100);

        const x = 256;

        this.panelAppearance!.addTextCentre(
            x,
            10,
            'Please design Your Character',
            4,
            true
        );

        let y = 24;

        this.panelAppearance!.addTextCentre(x - 55, y + 110, 'Front', 3, true);
        this.panelAppearance!.addTextCentre(x, y + 110, 'Side', 3, true);
        this.panelAppearance!.addTextCentre(x + 55, y + 110, 'Back', 3, true);

        y += 145;

        let buttons = this.drawAppearanceOption(
            this.panelAppearance!,
            'Head\nType',
            x - COLUMN_WIDTH,
            y
        );

        this.controlButtonAppearanceHeadLeft = buttons[0];
        this.controlButtonAppearanceHeadRight = buttons[1];

        buttons = this.drawAppearanceOption(
            this.panelAppearance!,
            'Hair\nColor',
            x + COLUMN_WIDTH,
            y
        );

        this.controlButtonAppearanceHairLeft = buttons[0];
        this.controlButtonAppearanceHairRight = buttons[1];

        y += 50;

        buttons = this.drawAppearanceOption(
            this.panelAppearance!,
            'Gender',
            x - COLUMN_WIDTH,
            y
        );

        this.controlButtonAppearanceGenderLeft = buttons[0];
        this.controlButtonAppearanceGenderRight = buttons[1];

        buttons = this.drawAppearanceOption(
            this.panelAppearance!,
            'Top\nColor',
            x + COLUMN_WIDTH,
            y
        );

        this.controlButtonAppearanceTopLeft = buttons[0];
        this.controlButtonAppearanceTopRight = buttons[1];

        y += 50;

        buttons = this.drawAppearanceOption(
            this.panelAppearance!,
            'Skin\nColor',
            x - COLUMN_WIDTH,
            y
        );

        this.controlButtonAppearanceSkinLeft = buttons[0];
        this.controlButtonAppearanceSkinRight = buttons[1];

        buttons = this.drawAppearanceOption(
            this.panelAppearance!,
            'Bottom\nColor',
            x + COLUMN_WIDTH,
            y
        );

        this.controlButtonAppearanceBottomLeft = buttons[0];
        this.controlButtonAppearanceBottomRight = buttons[1];

        y += 47;

        this.panelAppearance!.addButtonBackground(
            x,
            y,
            ACCEPT_WIDTH,
            ACCEPT_HEIGHT
        );

        this.panelAppearance!.addTextCentre(x, y, 'Accept', 4, false);

        this.controlButtonAppearanceAccept = this.panelAppearance!.addButton(
            x,
            y,
            ACCEPT_WIDTH,
            ACCEPT_HEIGHT
        );
    }

    handleAppearancePanelInput(): void {
        this.panelAppearance!.handleMouse(
            this.mouseX,
            this.mouseY,
            this.lastMouseButtonDown,
            this.mouseButtonDown
        );

        if (this.panelAppearance!.isClicked(this.controlButtonAppearanceHeadLeft)) {
            do {
                this.appearanceHeadType =
                    (this.appearanceHeadType - 1 + GameData.animationCount) %
                    GameData.animationCount;
            } while (
                (GameData.animationGender[this.appearanceHeadType] & 3) != 1 ||
                (GameData.animationGender[this.appearanceHeadType] &
                    (4 * this.appearanceHeadGender)) ==
                    0
            );
        }

        if (
            this.panelAppearance!.isClicked(this.controlButtonAppearanceHeadRight)
        ) {
            do {
                this.appearanceHeadType =
                    (this.appearanceHeadType + 1) % GameData.animationCount;
            } while (
                (GameData.animationGender[this.appearanceHeadType] & 3) != 1 ||
                (GameData.animationGender[this.appearanceHeadType] &
                    (4 * this.appearanceHeadGender)) ==
                    0
            );
        }

        if (this.panelAppearance!.isClicked(this.controlButtonAppearanceHairLeft)) {
            this.appearanceHairColour =
                (this.appearanceHairColour - 1 + this.characterHairColours.length) %
                this.characterHairColours.length;
        }

        if (
            this.panelAppearance!.isClicked(this.controlButtonAppearanceHairRight)
        ) {
            this.appearanceHairColour =
                (this.appearanceHairColour + 1) % this.characterHairColours.length;
        }

        if (
            this.panelAppearance!.isClicked(
                this.controlButtonAppearanceGenderLeft
            ) ||
            this.panelAppearance!.isClicked(this.controlButtonAppearanceGenderRight)
        ) {
            for (
                this.appearanceHeadGender = 3 - this.appearanceHeadGender;
                (GameData.animationGender[this.appearanceHeadType] & 3) != 1 ||
                (GameData.animationGender[this.appearanceHeadType] &
                    (4 * this.appearanceHeadGender)) ==
                    0;
                this.appearanceHeadType =
                    (this.appearanceHeadType + 1) % GameData.animationCount
            );

            for (
                ;
                (GameData.animationGender[this.appearanceBodyGender] & 3) != 2 ||
                (GameData.animationGender[this.appearanceBodyGender] &
                    (4 * this.appearanceHeadGender)) ==
                    0;
                this.appearanceBodyGender =
                    (this.appearanceBodyGender + 1) % GameData.animationCount
            );
        }

        if (this.panelAppearance!.isClicked(this.controlButtonAppearanceTopLeft)) {
            this.appearanceTopColour =
                (this.appearanceTopColour -
                    1 +
                    this.characterTopBottomColours.length) %
                this.characterTopBottomColours.length;
        }

        if (this.panelAppearance!.isClicked(this.controlButtonAppearanceTopRight)) {
            this.appearanceTopColour =
                (this.appearanceTopColour + 1) %
                this.characterTopBottomColours.length;
        }

        if (this.panelAppearance!.isClicked(this.controlButtonAppearanceSkinLeft)) {
            this.appearanceSkinColour =
                (this.appearanceSkinColour - 1 + this.characterSkinColours.length) %
                this.characterSkinColours.length;
        }

        if (
            this.panelAppearance!.isClicked(this.controlButtonAppearanceSkinRight)
        ) {
            this.appearanceSkinColour =
                (this.appearanceSkinColour + 1) % this.characterSkinColours.length;
        }

        if (
            this.panelAppearance!.isClicked(this.controlButtonAppearanceBottomLeft)
        ) {
            this.appearanceBottomColour =
                (this.appearanceBottomColour -
                    1 +
                    this.characterTopBottomColours.length) %
                this.characterTopBottomColours.length;
        }

        if (
            this.panelAppearance!.isClicked(this.controlButtonAppearanceBottomRight)
        ) {
            this.appearanceBottomColour =
                (this.appearanceBottomColour + 1) %
                this.characterTopBottomColours.length;
        }

        if (this.panelAppearance!.isClicked(this.controlButtonAppearanceAccept)) {
            this.packetStream!.newPacket(ClientOpcodes.APPEARANCE);
            this.packetStream!.putByte(this.appearanceHeadGender);
            this.packetStream!.putByte(this.appearanceHeadType);
            this.packetStream!.putByte(this.appearanceBodyGender);
            this.packetStream!.putByte(this.appearance2Colour);
            this.packetStream!.putByte(this.appearanceHairColour);
            this.packetStream!.putByte(this.appearanceTopColour);
            this.packetStream!.putByte(this.appearanceBottomColour);
            this.packetStream!.putByte(this.appearanceSkinColour);
            this.packetStream!.sendPacket();

            this.surface!.blackScreen();

            this.showAppearanceChange = false;
        }
    }

    drawAppearancePanelCharacterSprites(): void {
        this.surface!.interlace = false;
        this.surface!.blackScreen();

        this.panelAppearance!.drawPanel();

        const x = 256;
        const y = 25;

        this.surface!._spriteClipping_from6(
            x - 32 - 55,
            y,
            64,
            102,
            GameData.animationNumber[this.appearance2Colour],
            this.characterTopBottomColours[this.appearanceBottomColour]
        );

        this.surface!._spriteClipping_from9(
            x - 32 - 55,
            y,
            64,
            102,
            GameData.animationNumber[this.appearanceBodyGender],
            this.characterTopBottomColours[this.appearanceTopColour],
            this.characterSkinColours[this.appearanceSkinColour],
            0,
            false
        );

        this.surface!._spriteClipping_from9(
            x - 32 - 55,
            y,
            64,
            102,
            GameData.animationNumber[this.appearanceHeadType],
            this.characterHairColours[this.appearanceHairColour],
            this.characterSkinColours[this.appearanceSkinColour],
            0,
            false
        );

        this.surface!._spriteClipping_from6(
            x - 32,
            y,
            64,
            102,
            GameData.animationNumber[this.appearance2Colour] + 6,
            this.characterTopBottomColours[this.appearanceBottomColour]
        );

        this.surface!._spriteClipping_from9(
            x - 32,
            y,
            64,
            102,
            GameData.animationNumber[this.appearanceBodyGender] + 6,
            this.characterTopBottomColours[this.appearanceTopColour],
            this.characterSkinColours[this.appearanceSkinColour],
            0,
            false
        );

        this.surface!._spriteClipping_from9(
            x - 32,
            y,
            64,
            102,
            GameData.animationNumber[this.appearanceHeadType] + 6,
            this.characterHairColours[this.appearanceHairColour],
            this.characterSkinColours[this.appearanceSkinColour],
            0,
            false
        );

        this.surface!._spriteClipping_from6(
            x - 32 + 55,
            y,
            64,
            102,
            GameData.animationNumber[this.appearance2Colour] + 12,
            this.characterTopBottomColours[this.appearanceBottomColour]
        );

        this.surface!._spriteClipping_from9(
            x - 32 + 55,
            y,
            64,
            102,
            GameData.animationNumber[this.appearanceBodyGender] + 12,
            this.characterTopBottomColours[this.appearanceTopColour],
            this.characterSkinColours[this.appearanceSkinColour],
            0,
            false
        );

        this.surface!._spriteClipping_from9(
            x - 32 + 55,
            y,
            64,
            102,
            GameData.animationNumber[this.appearanceHeadType] + 12,
            this.characterHairColours[this.appearanceHairColour],
            this.characterSkinColours[this.appearanceSkinColour],
            0,
            false
        );

        this.surface!._drawSprite_from3(0, this.gameHeight, this.spriteMedia + 22);

        //this.surface!.draw(this.graphics, 0, 0);
    }

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

    combatStyle: i32;

    drawDialogCombatStyle(): void {
        const GREY = 0xbebebe;

        const BUTTON_HEIGHT = 20;
        const WIDTH = 175;

        const COMBAT_STYLES = [
            'Controlled (+1 of each)',
            'Aggressive (+3 strength)',
            'Accurate (+3 attack)',
            'Defensive (+3 defense)'
        ];

        const HEIGHT = BUTTON_HEIGHT * (COMBAT_STYLES.length + 1);

        let uiX = 7;
        let uiY = 15;

        if (this.options.mobile) {
            uiX = 48;
            uiY = (this.gameHeight / 2 - HEIGHT / 2) as i32;
        }

        if (this.mouseButtonClick != 0) {
            for (let i = 0; i < COMBAT_STYLES.length + 1; i++) {
                if (
                    i <= 0 ||
                    this.mouseX <= uiX ||
                    this.mouseX >= uiX + WIDTH ||
                    this.mouseY <= uiY + i * BUTTON_HEIGHT ||
                    this.mouseY >= uiY + i * BUTTON_HEIGHT + BUTTON_HEIGHT
                ) {
                    continue;
                }

                this.combatStyle = i - 1;
                this.mouseButtonClick = 0;

                this.packetStream!.newPacket(ClientOpcodes.COMBAT_STYLE);
                this.packetStream!.putByte(this.combatStyle);
                this.packetStream!.sendPacket();
                break;
            }
        }

        for (let i = 0; i < COMBAT_STYLES.length + 1; i++) {
            const boxColour = i == this.combatStyle + 1 ? Colours.Red : GREY;

            this.surface!.drawBoxAlpha(
                uiX,
                uiY + i * BUTTON_HEIGHT,
                WIDTH,
                BUTTON_HEIGHT,
                boxColour,
                128
            );

            this.surface!.drawLineHoriz(
                uiX,
                uiY + i * BUTTON_HEIGHT,
                WIDTH,
                Colours.Black
            );

            this.surface!.drawLineHoriz(
                uiX,
                uiY + i * BUTTON_HEIGHT + BUTTON_HEIGHT,
                WIDTH,
                Colours.Black
            );
        }

        let y = 16;

        this.surface!.drawStringCenter(
            'Select combat style',
            uiX + ((WIDTH / 2) as i32),
            uiY + y,
            3,
            Colours.White
        );

        y += BUTTON_HEIGHT;

        for (let i = 0; i < COMBAT_STYLES.length; i += 1) {
            const combatStyle = COMBAT_STYLES[i];

            this.surface!.drawStringCenter(
                combatStyle,
                uiX + ((WIDTH / 2) as i32),
                uiY + y,
                3,
                Colours.Black
            );

            y += BUTTON_HEIGHT;
        }
    }

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

    drawUiTabInventory(noMenus: bool): void {
        const MENU_WIDTH = 245;

        const SLOT_WIDTH = 49;
        const SLOT_HEIGHT = 34;

        const WIDTH = SLOT_WIDTH * 5;
        const HEIGHT = SLOT_HEIGHT * 6;

        let uiX = this.gameWidth - WIDTH - 3;
        let uiY = 36;

        if (this.options.mobile) {
            uiX -= 32;
            uiY = this.gameHeight / 2 - HEIGHT / 2;
        } else {
            this.surface!._drawSprite_from3(
                this.gameWidth - MENU_WIDTH - 3,
                3,
                this.spriteMedia + 1
            );
        }

        /*
        this.uiOpenX = uiX;
        this.uiOpenY = uiY;
        this.uiOpenWidth = WIDTH;
        this.uiOpenHeight = HEIGHT;
        */

        for (let i = 0; i < this.inventoryMaxItemCount; i++) {
            const slotX = uiX + (i % 5) * SLOT_WIDTH;
            const slotY = uiY + ((i / 5) as i32) * SLOT_HEIGHT;

            if (i < this.inventoryItemsCount && this.inventoryEquipped[i] == 1) {
                this.surface!.drawBoxAlpha(
                    slotX,
                    slotY,
                    SLOT_WIDTH,
                    SLOT_HEIGHT,
                    Colours.Red,
                    128
                );
            } else {
                this.surface!.drawBoxAlpha(
                    slotX,
                    slotY,
                    SLOT_WIDTH,
                    SLOT_HEIGHT,
                    Colours.DarkGrey,
                    128
                );
            }

            if (i < this.inventoryItemsCount) {
                const spriteID =
                    this.spriteItem + GameData.itemPicture[this.inventoryItemId[i]];

                const spriteMask = GameData.itemMask[this.inventoryItemId[i]];

                this.surface!._spriteClipping_from9(
                    slotX,
                    slotY,
                    SLOT_WIDTH,
                    SLOT_HEIGHT - 2,
                    spriteID,
                    spriteMask,
                    0,
                    0,
                    false
                );

                if (GameData.itemStackable[this.inventoryItemId[i]] == 0) {
                    this.surface!.drawString(
                        this.inventoryItemStackCount[i].toString(),
                        slotX + 1,
                        slotY + 10,
                        1,
                        Colours.Yellow
                    );
                }
            }
        }

        // row and column lines
        for (let i = 1; i <= 4; i++) {
            this.surface!.drawLineVert(
                uiX + i * SLOT_WIDTH,
                uiY,
                ((this.inventoryMaxItemCount / 5) as i32) * SLOT_HEIGHT,
                Colours.Black
            );
        }

        for (let i = 1; i <= ((this.inventoryMaxItemCount / 5) as i32) - 1; i++) {
            this.surface!.drawLineHoriz(
                uiX,
                uiY + i * SLOT_HEIGHT,
                245,
                Colours.Black
            );
        }

        if (!noMenus) {
            return;
        }

        const mouseX = this.mouseX - uiX;
        const mouseY = this.mouseY - uiY;

        if (
            mouseX >= 0 &&
            mouseY >= 0 &&
            mouseX < WIDTH &&
            // asc won't compile with extra parens prettier adds
            mouseY < (this.inventoryMaxItemCount / 5 as i32) * SLOT_HEIGHT
        ) {
            const itemIndex =
                ((mouseX / SLOT_WIDTH) as i32) +
                ((mouseY / SLOT_HEIGHT) as i32) * 5;

            if (itemIndex < this.inventoryItemsCount) {
                const itemID = this.inventoryItemId[itemIndex];
                const itemName = `@lre@${GameData.itemName[itemID]}`;

                if (this.selectedSpell >= 0) {
                    if (GameData.spellType[this.selectedSpell] == 3) {
                        this.menuItemText1[this.menuItemsCount] = `Cast ${
                            GameData.spellName[this.selectedSpell]
                        } on`;

                        this.menuItemText2[this.menuItemsCount] = itemName;
                        this.menuType[this.menuItemsCount] = 600;
                        this.menuIndex[this.menuItemsCount] = itemIndex;

                        this.menuSourceIndex[
                            this.menuItemsCount
                        ] = this.selectedSpell;
                        this.menuItemsCount++;

                        return;
                    }
                } else {
                    if (this.selectedItemInventoryIndex >= 0) {
                        this.menuItemText1[
                            this.menuItemsCount
                        ] = `Use ${this.selectedItemName} with:`;

                        this.menuItemText2[this.menuItemsCount] = itemName;
                        this.menuType[this.menuItemsCount] = 610;
                        this.menuIndex[this.menuItemsCount] = itemIndex;

                        this.menuSourceIndex[
                            this.menuItemsCount
                        ] = this.selectedItemInventoryIndex;
                        this.menuItemsCount++;

                        return;
                    }

                    if (this.inventoryEquipped[itemIndex] == 1) {
                        this.menuItemText1[this.menuItemsCount] = 'Remove';
                        this.menuItemText2[this.menuItemsCount] = itemName;
                        this.menuType[this.menuItemsCount] = 620;
                        this.menuIndex[this.menuItemsCount] = itemIndex;
                        this.menuItemsCount++;
                    } else if (GameData.itemWearable[itemID] != 0) {
                        if ((GameData.itemWearable[itemID] & 24) != 0) {
                            this.menuItemText1[this.menuItemsCount] = 'Wield';
                        } else {
                            this.menuItemText1[this.menuItemsCount] = 'Wear';
                        }

                        this.menuItemText2[this.menuItemsCount] = itemName;
                        this.menuType[this.menuItemsCount] = 630;
                        this.menuIndex[this.menuItemsCount] = itemIndex;
                        this.menuItemsCount++;
                    }

                    if (GameData.itemCommand[itemID] != '') {
                        this.menuItemText1[this.menuItemsCount] =
                            GameData.itemCommand[itemID];

                        this.menuItemText2[this.menuItemsCount] = itemName;
                        this.menuType[this.menuItemsCount] = 640;
                        this.menuIndex[this.menuItemsCount] = itemIndex;
                        this.menuItemsCount++;
                    }

                    this.menuItemText1[this.menuItemsCount] = 'Use';
                    this.menuItemText2[this.menuItemsCount] = itemName;
                    this.menuType[this.menuItemsCount] = 650;
                    this.menuIndex[this.menuItemsCount] = itemIndex;
                    this.menuItemsCount++;

                    this.menuItemText1[this.menuItemsCount] = 'Drop';
                    this.menuItemText2[this.menuItemsCount] = itemName;
                    this.menuType[this.menuItemsCount] = 660;
                    this.menuIndex[this.menuItemsCount] = itemIndex;
                    this.menuItemsCount++;

                    this.menuItemText1[this.menuItemsCount] = 'Examine';
                    this.menuItemText2[this.menuItemsCount] = itemName;
                    this.menuType[this.menuItemsCount] = 3600;
                    this.menuIndex[this.menuItemsCount] = itemID;
                    this.menuItemsCount++;
                }
            }
        }
    }

    panelLoginWelcome: Panel | null;
    panelLoginNewUser: Panel | null;
    panelLoginExistingUser: Panel | null;
    panelRecoverUser: Panel | null;

    controlWelcomeNewUser: i32;
    controlWelcomeExistingUser: i32;
    controlLoginNewOK: i32;
    controlRegisterStatus: i32;
    controlRegisterUser: i32;
    controlRegisterPassword: i32;
    controlRegisterConfirmPassword: i32;
    controlRegisterCheckbox: i32;
    controlRegisterSubmit: i32;
    controlRegisterCancel: i32;
    controlLoginStatus: i32;
    controlLoginUser: i32;
    controlLoginPassword: i32;
    controlLoginOk: i32;
    controlLoginCancel: i32;
    controlLoginRecover: i32;

    loginScreen: i32;
    loginUser: string = '';
    loginPass: string = '';
    registerUser: string = '';
    registerPassword: string = '';

    createLoginPanels(): void {
        this.panelLoginWelcome = new Panel(this.surface!, 50);

        const x = (this.gameWidth / 2) as i32;
        let y = 40;
        const click = this.options.mobile ? 'Tap' : 'Click';

        if (!this.members) {
            this.panelLoginWelcome!.addTextCentre(
                x,
                200 + y,
                `${click} on an option`,
                5,
                true
            );

            this.panelLoginWelcome!.addButtonBackground(x - 100, 240 + y, 120, 35);

            this.panelLoginWelcome!.addTextCentre(
                x - 100,
                240 + y,
                'New User',
                5,
                false
            );

            this.controlWelcomeNewUser = this.panelLoginWelcome!.addButton(
                x - 100,
                240 + y,
                120,
                35
            );

            this.panelLoginWelcome!.addButtonBackground(x + 100, 240 + y, 120, 35);

            this.panelLoginWelcome!.addTextCentre(
                x + 100,
                240 + y,
                'Existing User',
                5,
                false
            );

            this.controlWelcomeExistingUser = this.panelLoginWelcome!.addButton(
                x + 100,
                240 + y,
                120,
                35
            );
        } else {
            this.panelLoginWelcome!.addTextCentre(
                x,
                200 + y,
                'Welcome to RuneScape',
                4,
                true
            );

            this.panelLoginWelcome!.addTextCentre(
                x,
                215 + y,
                'You need a members account to use this server',
                4,
                true
            );

            this.panelLoginWelcome!.addButtonBackground(x, 250 + y, 200, 35);

            this.panelLoginWelcome!.addTextCentre(
                x,
                250 + y,
                `${click} here to login`,
                5,
                false
            );

            this.controlWelcomeExistingUser = this.panelLoginWelcome!.addButton(
                x,
                250 + y,
                200,
                35
            );
        }

        this.panelLoginNewUser = new Panel(this.surface!, 50);

        if (!this.options.accountManagement) {
            y = 230;

            if (this.referID == 0) {
                this.panelLoginNewUser!.addTextCentre(
                    x,
                    y + 8,
                    'To create an account please go back to the',
                    4,
                    true
                );

                y += 20;

                this.panelLoginNewUser!.addTextCentre(
                    x,
                    y + 8,
                    "www.runescape.com front page, and choose 'create account'",
                    4,
                    true
                );
            } else if (this.referID == 1) {
                this.panelLoginNewUser!.addTextCentre(
                    x,
                    y + 8,
                    'To create an account please click on the',
                    4,
                    true
                );

                y += 20;

                this.panelLoginNewUser!.addTextCentre(
                    x,
                    y + 8,
                    "'create account' link below the game window",
                    4,
                    true
                );
            } else {
                this.panelLoginNewUser!.addTextCentre(
                    x,
                    y + 8,
                    'To create an account please go back to the',
                    4,
                    true
                );

                y += 20;

                this.panelLoginNewUser!.addTextCentre(
                    x,
                    y + 8,
                    "runescape front webpage and choose 'create account'",
                    4,
                    true
                );
            }

            y += 30;

            this.panelLoginNewUser!.addButtonBackground(x, y + 17, 150, 34);
            this.panelLoginNewUser!.addTextCentre(x, y + 17, 'Ok', 5, false);

            this.controlLoginNewOK = this.panelLoginNewUser!.addButton(
                x,
                y + 17,
                150,
                34
            );
        } else {
            y = 70;

            this.controlRegisterStatus = this.panelLoginNewUser!.addTextCentre(
                x,
                y + 8,
                'To create an account please enter all the requested details',
                4,
                true
            );

            let offsetY = y + 25;

            this.panelLoginNewUser!.addButtonBackground(x, offsetY + 17, 250, 34);

            this.panelLoginNewUser!.addTextCentre(
                x,
                offsetY + 8,
                'Choose a Username',
                4,
                false
            );

            this.controlRegisterUser = this.panelLoginNewUser!.addTextInput(
                x,
                offsetY + 25,
                200,
                40,
                4,
                12,
                false,
                false
            );

            offsetY += 40;

            this.panelLoginNewUser!.addButtonBackground(
                x - 115,
                offsetY + 17,
                220,
                34
            );

            this.panelLoginNewUser!.addTextCentre(
                x - 115,
                offsetY + 8,
                'Choose a Password',
                4,
                false
            );

            this.controlRegisterPassword = this.panelLoginNewUser!.addTextInput(
                x - 115,
                offsetY + 25,
                220,
                40,
                4,
                20,
                true,
                false
            );

            this.panelLoginNewUser!.addButtonBackground(
                x + 115,
                offsetY + 17,
                220,
                34
            );

            this.panelLoginNewUser!.addTextCentre(
                x + 115,
                offsetY + 8,
                'Confirm Password',
                4,
                false
            );

            this.controlRegisterConfirmPassword = this.panelLoginNewUser!.addTextInput(
                x + 115,
                offsetY + 25,
                220,
                40,
                4,
                20,
                true,
                false
            );

            offsetY += 60;

            this.controlRegisterCheckbox = this.panelLoginNewUser!.addCheckbox(
                x - 196 - 7,
                offsetY - 7,
                14,
                14
            );

            this.panelLoginNewUser!.addText(
                x - 181,
                offsetY,
                'I have read and agreed to the terms and conditions',
                4,
                true
            );

            offsetY += 15;

            this.panelLoginNewUser!.addTextCentre(
                x,
                offsetY,
                '(to view these click the relevant link below this game window)',
                4,
                true
            );

            offsetY += 20;

            this.panelLoginNewUser!.addButtonBackground(
                x - 100,
                offsetY + 17,
                150,
                34
            );

            this.panelLoginNewUser!.addTextCentre(
                x - 100,
                offsetY + 17,
                'Submit',
                5,
                false
            );

            this.controlRegisterSubmit = this.panelLoginNewUser!.addButton(
                x - 100,
                offsetY + 17,
                150,
                34
            );

            this.panelLoginNewUser!.addButtonBackground(
                x + 100,
                offsetY + 17,
                150,
                34
            );

            this.panelLoginNewUser!.addTextCentre(
                x + 100,
                offsetY + 17,
                'Cancel',
                5,
                false
            );

            this.controlRegisterCancel = this.panelLoginNewUser!.addButton(
                x + 100,
                offsetY + 17,
                150,
                34
            );
        }

        this.panelLoginExistingUser = new Panel(this.surface!, 50);

        y = 230;

        this.controlLoginStatus = this.panelLoginExistingUser!.addTextCentre(
            x,
            y - 10,
            'Please enter your username and password',
            4,
            true
        );

        y += 28;

        this.panelLoginExistingUser!.addButtonBackground(x - 116, y, 200, 40);

        this.panelLoginExistingUser!.addTextCentre(
            x - 116,
            y - 10,
            'Username:',
            4,
            false
        );

        this.controlLoginUser = this.panelLoginExistingUser!.addTextInput(
            x - 116,
            y + 10,
            200,
            40,
            4,
            12,
            false,
            false
        );

        y += 47;

        this.panelLoginExistingUser!.addButtonBackground(x - 66, y, 200, 40);

        this.panelLoginExistingUser!.addTextCentre(
            x - 66,
            y - 10,
            'Password:',
            4,
            false
        );

        this.controlLoginPassword = this.panelLoginExistingUser!.addTextInput(
            x - 66,
            y + 10,
            200,
            40,
            4,
            20,
            true,
            false
        );

        y -= 55;

        this.panelLoginExistingUser!.addButtonBackground(x + 154, y, 120, 25);
        this.panelLoginExistingUser!.addTextCentre(x + 154, y, 'Ok', 4, false);

        this.controlLoginOk = this.panelLoginExistingUser!.addButton(
            x + 154,
            y,
            120,
            25
        );

        y += 30;

        this.panelLoginExistingUser!.addButtonBackground(x + 154, y, 120, 25);
        this.panelLoginExistingUser!.addTextCentre(x + 154, y, 'Cancel', 4, false);

        this.controlLoginCancel = this.panelLoginExistingUser!.addButton(
            x + 154,
            y,
            120,
            25
        );

        if (this.options.accountManagement) {
            y += 30;

            this.panelLoginExistingUser!.addButtonBackground(x + 154, y, 160, 25);

            this.panelLoginExistingUser!.addTextCentre(
                x + 154,
                y,
                "I've lost my password",
                4,
                false
            );

            this.controlLoginRecover = this.panelLoginExistingUser!.addButton(
                x + 154,
                y,
                160,
                25
            );
        }

        //this.panelLoginExistingUser!.setFocus(this.controlLoginUser);
    }

    drawLoginScreens(): void {
        this.welcomeScreenAlreadyShown = false;

        this.surface!.interlace = false;
        this.surface!.blackScreen();

        let showBackground: bool;

        if (this.options.accountManagement) {
            showBackground = this.loginScreen == 0 || this.loginScreen == 2;
        } else {
            showBackground = this.loginScreen >= 0 && this.loginScreen <= 3;
        }

        if (showBackground) {
            const cycle = (this.loginTimer * 2) % 3072;

            if (cycle < 1024) {
                this.surface!._drawSprite_from3(0, 10, this.spriteLogo);

                if (cycle > 768) {
                    this.surface!._drawSpriteAlpha_from4(
                        0,
                        10,
                        this.spriteLogo + 1,
                        cycle - 768
                    );
                }
            } else if (cycle < 2048) {
                this.surface!._drawSprite_from3(0, 10, this.spriteLogo + 1);

                if (cycle > 1792) {
                    this.surface!._drawSpriteAlpha_from4(
                        0,
                        10,
                        this.spriteMedia + 10,
                        cycle - 1792
                    );
                }
            } else {
                this.surface!._drawSprite_from3(0, 10, this.spriteMedia + 10);

                if (cycle > 2816) {
                    this.surface!._drawSpriteAlpha_from4(
                        0,
                        10,
                        this.spriteLogo,
                        cycle - 2816
                    );
                }
            }
        }

        if (this.loginScreen == 0) {
            this.panelLoginWelcome!.drawPanel();
        } else if (this.loginScreen == 1) {
            this.panelLoginNewUser!.drawPanel();
        } else if (this.loginScreen == 2) {
            this.panelLoginExistingUser!.drawPanel();
        }

        // blue bar
        this.surface!._drawSprite_from3(
            0,
            this.gameHeight - 4,
            this.spriteMedia + 22
        );

        //this.surface!.draw(this.graphics, 0, 0);
    }

    handleLoginScreenInput_0(): void {
        if (this.worldFullTimeout > 0) {
            this.worldFullTimeout--;
        }

        if (this.loginScreen == 0) {
            this.panelLoginWelcome!.handleMouse(
                this.mouseX,
                this.mouseY,
                this.lastMouseButtonDown,
                this.mouseButtonDown
            );

            if (this.panelLoginWelcome!.isClicked(this.controlWelcomeNewUser)) {
                this.loginScreen = 1;

                if (this.options.accountManagement) {
                    this.panelLoginNewUser!.updateText(this.controlRegisterUser, '');

                    this.panelLoginNewUser!.updateText(
                        this.controlRegisterPassword,
                        ''
                    );

                    this.panelLoginNewUser!.updateText(
                        this.controlRegisterConfirmPassword,
                        ''
                    );

                    this.panelLoginNewUser!.setFocus(this.controlRegisterUser);

                    this.panelLoginNewUser!.toggleCheckbox(
                        this.controlRegisterCheckbox,
                        false
                    );

                    this.panelLoginNewUser!.updateText(
                        this.controlRegisterStatus,
                        'To create an account please enter all the requested ' +
                            'details'
                    );
                }
            }

            if (this.panelLoginWelcome!.isClicked(this.controlWelcomeExistingUser)) {
                this.loginScreen = 2;

                this.panelLoginExistingUser!.updateText(
                    this.controlLoginStatus,
                    'Please enter your username and password'
                );

                this.panelLoginExistingUser!.updateText(this.controlLoginUser, '');

                this.panelLoginExistingUser!.updateText(
                    this.controlLoginPassword,
                    ''
                );

                this.panelLoginExistingUser!.setFocus(this.controlLoginUser);

                return;
            }
        } else if (this.loginScreen == 1) {
            this.panelLoginNewUser!.handleMouse(
                this.mouseX,
                this.mouseY,
                this.lastMouseButtonDown,
                this.mouseButtonDown
            );

            if (this.options.accountManagement) {
                // allow mobile to click the entire text to agree to ToS
                if (
                    this.options.mobile &&
                    this.lastMouseButtonDown == 1 &&
                    this.mouseX >= 74 &&
                    this.mouseX <= 474 &&
                    this.mouseY >= 188 &&
                    this.mouseY <= 216
                ) {
                    this.panelLoginNewUser!.toggleCheckbox(
                        this.controlRegisterCheckbox,
                        !this.panelLoginNewUser!.isActivated(
                            this.controlRegisterCheckbox
                        )
                    );

                    this.lastMouseButtonDown = 0;

                    return;
                }

                if (this.panelLoginNewUser!.isClicked(this.controlRegisterCancel)) {
                    this.loginScreen = 0;
                    return;
                }

                if (this.panelLoginNewUser!.isClicked(this.controlRegisterUser)) {
                    this.panelLoginNewUser!.setFocus(this.controlRegisterPassword);
                    return;
                }

                if (
                    this.panelLoginNewUser!.isClicked(this.controlRegisterPassword)
                ) {
                    this.panelLoginNewUser!.setFocus(
                        this.controlRegisterConfirmPassword
                    );

                    return;
                }

                if (
                    this.panelLoginNewUser!.isClicked(
                        this.controlRegisterConfirmPassword
                    ) ||
                    this.panelLoginNewUser!.isClicked(this.controlRegisterSubmit)
                ) {
                    const username = this.panelLoginNewUser!.getText(
                        this.controlRegisterUser
                    );

                    const password = this.panelLoginNewUser!.getText(
                        this.controlRegisterPassword
                    );

                    const confirmPassword = this.panelLoginNewUser!.getText(
                        this.controlRegisterConfirmPassword
                    );

                    if (
                        !username ||
                        username.length == 0 ||
                        !password ||
                        password.length == 0 ||
                        !confirmPassword ||
                        confirmPassword.length == 0
                    ) {
                        this.panelLoginNewUser!.updateText(
                            this.controlRegisterStatus,
                            '@yel@Please fill in ALL requested information to ' +
                                'continue!'
                        );

                        return;
                    }

                    if (password != confirmPassword) {
                        this.panelLoginNewUser!.updateText(
                            this.controlRegisterStatus,
                            '@yel@The two passwords entered are not the same as ' +
                                'each other!'
                        );

                        return;
                    }

                    if (password.length < 5) {
                        this.panelLoginNewUser!.updateText(
                            this.controlRegisterStatus,
                            '@yel@Your password must be at least 5 letters long'
                        );

                        return;
                    }

                    if (
                        !this.panelLoginNewUser!.isActivated(
                            this.controlRegisterCheckbox
                        )
                    ) {
                        this.panelLoginNewUser!.updateText(
                            this.controlRegisterStatus,
                            '@yel@You must agree to the terms+conditions to ' +
                                'continue'
                        );

                        return;
                    }

                    this.panelLoginNewUser!.updateText(
                        this.controlRegisterStatus,
                        'Please wait... Creating new account'
                    );

                    this.drawLoginScreens();
                    this.resetTimings();

                    this.registerUser = this.panelLoginNewUser!.getText(
                        this.controlRegisterUser
                    );

                    this.registerPassword = this.panelLoginNewUser!.getText(
                        this.controlRegisterPassword
                    );

                    //await this.register(this.registerUser, this.registerPassword);
                }
            } else {
                if (this.panelLoginNewUser!.isClicked(this.controlLoginNewOK)) {
                    this.loginScreen = 0;
                }
            }
        } else if (this.loginScreen == 2) {
            this.panelLoginExistingUser!.handleMouse(
                this.mouseX,
                this.mouseY,
                this.lastMouseButtonDown,
                this.mouseButtonDown
            );

            if (this.panelLoginExistingUser!.isClicked(this.controlLoginCancel)) {
                this.loginScreen = 0;
            } else if (
                this.panelLoginExistingUser!.isClicked(this.controlLoginUser)
            ) {
                this.panelLoginExistingUser!.setFocus(this.controlLoginPassword);
            } else if (
                this.panelLoginExistingUser!.isClicked(this.controlLoginPassword) ||
                this.panelLoginExistingUser!.isClicked(this.controlLoginOk)
            ) {
                this.loginUser = this.panelLoginExistingUser!.getText(
                    this.controlLoginUser
                );

                this.loginPass = this.panelLoginExistingUser!.getText(
                    this.controlLoginPassword
                );

                //await this.login(this.loginUser, this.loginPass, false);
            } else if (
                this.panelLoginExistingUser!.isClicked(this.controlLoginRecover)
            ) {
                this.loginUser = this.panelLoginExistingUser!.getText(
                    this.controlLoginUser
                );

                if (this.loginUser.trim().length == 0) {
                    this.showLoginScreenStatus(
                        'You must enter your username to recover your password',
                        ''
                    );

                    return;
                }

                //await this.recoverAttempt(this.loginUser);
            }
        }
    }

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

    panelMagic: Panel | null;

    uiTabMagicSubTab: i32;

    drawUiTabMagic(noMenus: bool): void {
        const MENU_WIDTH = 245;

        const HEIGHT = 182;
        const WIDTH = 196;
        const HALF_WIDTH = (WIDTH / 2) as i32;

        const TABS: StaticArray<string> = ['Magic', 'Prayers'];
        const TAB_HEIGHT = 24;

        let uiX = this.gameWidth - WIDTH - 3;
        let uiY = 36;

        if (this.options.mobile) {
            uiX = 35;
            uiY = this.gameHeight / 2 - HEIGHT / 2;
        } else {
            this.surface!._drawSprite_from3(
                this.gameWidth - MENU_WIDTH - 3,
                3,
                this.spriteMedia + 4
            );
        }

        this.surface!.drawBoxAlpha(
            uiX,
            uiY + TAB_HEIGHT,
            WIDTH,
            HEIGHT - TAB_HEIGHT,
            Colours.LightGrey,
            128
        );

        this.surface!.drawLineHoriz(uiX, uiY + 113, WIDTH, Colours.Black);

        this.surface!.drawTabs(
            uiX,
            uiY,
            WIDTH,
            TAB_HEIGHT,
            TABS,
            this.uiTabMagicSubTab
        );

        if (this.uiTabMagicSubTab == 0) {
            this.panelMagic!.clearList(this.controlListMagic);

            const magicLevel = this.playerStatCurrent[6];

            for (let i = 0; i < GameData.spellCount; i++) {
                let colourPrefix = '@yel@';

                for (let j = 0; j < GameData.spellRunesRequired[i]; j++) {
                    const runeId = GameData.spellRunesId[i][j];
                    const runeAmount = GameData.spellRunesCount[i][j];

                    if (this.hasInventoryItems(runeId, runeAmount)) {
                        continue;
                    }

                    colourPrefix = '@whi@';
                    break;
                }

                if (GameData.spellLevel[i] > magicLevel) {
                    colourPrefix = '@bla@';
                }

                this.panelMagic!.addListEntry(
                    this.controlListMagic,
                    i,
                    `${colourPrefix}Level ${GameData.spellLevel[i]}: ` +
                        GameData.spellName[i]
                );
            }

            this.panelMagic!.drawPanel();

            const spellIndex = this.panelMagic!.getListEntryIndex(
                this.controlListMagic
            );

            if (spellIndex != -1) {
                this.surface!.drawString(
                    `Level ${GameData.spellLevel[spellIndex]}` +
                        `: ${GameData.spellName[spellIndex]}`,
                    uiX + 2,
                    uiY + 124,
                    1,
                    Colours.Yellow
                );

                this.surface!.drawString(
                    GameData.spellDescription[spellIndex],
                    uiX + 2,
                    uiY + 136,
                    0,
                    Colours.White
                );

                for (let i = 0; i < GameData.spellRunesRequired[spellIndex]; i++) {
                    const runeId = GameData.spellRunesId[spellIndex][i];
                    const inventoryRuneCount = this.getInventoryCount(runeId);
                    const runeCount = GameData.spellRunesCount[spellIndex][i];
                    let colourPrefix = '@Red@';

                    if (this.hasInventoryItems(runeId, runeCount)) {
                        colourPrefix = '@gre@';
                    }

                    this.surface!._drawSprite_from3(
                        uiX + 2 + i * 44,
                        uiY + 150,
                        this.spriteItem + GameData.itemPicture[runeId]
                    );
                    this.surface!.drawString(
                        `${colourPrefix}${inventoryRuneCount}/${runeCount}`,
                        uiX + 2 + i * 44,
                        uiY + 150,
                        1,
                        Colours.White
                    );
                }
            } else {
                this.surface!.drawString(
                    'Point at a spell for a description',
                    uiX + 2,
                    uiY + 124,
                    1,
                    Colours.Black
                );
            }
        } else if (this.uiTabMagicSubTab == 1) {
            this.panelMagic!.clearList(this.controlListMagic);

            for (let i = 0; i < GameData.prayerCount; i++) {
                let colourPrefix = '@whi@';

                if (GameData.prayerLevel[i] > this.playerStatBase[5]) {
                    colourPrefix = '@bla@';
                }

                if (this.prayerOn[i]) {
                    colourPrefix = '@gre@';
                }

                this.panelMagic!.addListEntry(
                    this.controlListMagic,
                    i,
                    `${colourPrefix}Level ${GameData.prayerLevel[i]}: ` +
                        GameData.prayerName[i]
                );
            }

            this.panelMagic!.drawPanel();

            const prayerIndex = this.panelMagic!.getListEntryIndex(
                this.controlListMagic
            );

            if (prayerIndex != -1) {
                this.surface!.drawStringCenter(
                    `Level ${GameData.prayerLevel[prayerIndex]}: ` +
                        GameData.prayerName[prayerIndex],
                    uiX + HALF_WIDTH,
                    uiY + 130,
                    1,
                    Colours.Yellow
                );
                this.surface!.drawStringCenter(
                    GameData.prayerDescription[prayerIndex],
                    uiX + HALF_WIDTH,
                    uiY + 145,
                    0,
                    Colours.White
                );
                this.surface!.drawStringCenter(
                    `Drain rate: ${GameData.prayerDrain[prayerIndex]}`,
                    uiX + HALF_WIDTH,
                    uiY + 160,
                    1,
                    Colours.Black
                );
            } else {
                this.surface!.drawString(
                    'Point at a prayer for a description',
                    uiX + 2,
                    uiY + 124,
                    1,
                    Colours.Black
                );
            }
        }

        if (!noMenus) {
            return;
        }

        const mouseX = this.mouseX - uiX;
        const mouseY = this.mouseY - uiY;

        if (mouseX >= 0 && mouseY >= 0 && mouseX < 196 && mouseY < 182) {
            this.panelMagic!.handleMouse(
                mouseX + uiX,
                mouseY + uiY,
                this.lastMouseButtonDown,
                this.mouseButtonDown,
                this.mouseScrollDelta
            );

            if (mouseY <= TAB_HEIGHT && this.mouseButtonClick == 1) {
                if (mouseX < HALF_WIDTH && this.uiTabMagicSubTab == 1) {
                    this.uiTabMagicSubTab = 0;
                    this.panelMagic!.resetListProps(this.controlListMagic);
                } else if (mouseX > HALF_WIDTH && this.uiTabMagicSubTab == 0) {
                    this.uiTabMagicSubTab = 1;
                    this.panelMagic!.resetListProps(this.controlListMagic);
                }
            }

            if (this.mouseButtonClick == 1 && this.uiTabMagicSubTab == 0) {
                const spellIndex = this.panelMagic!.getListEntryIndex(
                    this.controlListMagic
                );

                if (spellIndex != -1) {
                    const magicLevel = this.playerStatCurrent[6];

                    if (GameData.spellLevel[spellIndex] > magicLevel) {
                        this.showMessage(
                            'Your magic ability is not high enough for this spell',
                            3
                        );
                    } else {
                        let i = 0;

                        for (
                            i = 0;
                            i < GameData.spellRunesRequired[spellIndex];
                            i++
                        ) {
                            const reagantId = GameData.spellRunesId[spellIndex][i];

                            if (
                                this.hasInventoryItems(
                                    reagantId,
                                    GameData.spellRunesCount[spellIndex][i]
                                )
                            ) {
                                continue;
                            }

                            this.showMessage(
                                "You don't have all the reagents you need for " +
                                    'this spell',
                                3
                            );
                            i = -1;
                            break;
                        }

                        if (i == GameData.spellRunesRequired[spellIndex]) {
                            this.selectedSpell = spellIndex;
                            this.selectedItemInventoryIndex = -1;
                        }
                    }
                }
            }

            if (this.mouseButtonClick == 1 && this.uiTabMagicSubTab == 1) {
                const prayerIndex = this.panelMagic!.getListEntryIndex(
                    this.controlListMagic
                );

                if (prayerIndex != -1) {
                    const prayerLevel = this.playerStatBase[5];

                    if (GameData.prayerLevel[prayerIndex] > prayerLevel) {
                        this.showMessage(
                            'Your prayer ability is not high enough for this ' +
                                'prayer',
                            3
                        );
                    } else if (this.playerStatCurrent[5] == 0) {
                        this.showMessage(
                            'You have run out of prayer points. Return to a ' +
                                'church to recharge',
                            3
                        );
                    } else if (this.prayerOn[prayerIndex]) {
                        this.packetStream!.newPacket(ClientOpcodes.PRAYER_OFF);
                        this.packetStream!.putByte(prayerIndex);
                        this.packetStream!.sendPacket();
                        this.prayerOn[prayerIndex] = false;
                        //this.playSoundFile('prayeroff');
                    } else {
                        this.packetStream!.newPacket(ClientOpcodes.PRAYER_ON);
                        this.packetStream!.putByte(prayerIndex);
                        this.packetStream!.sendPacket();
                        this.prayerOn[prayerIndex] = true;
                        //this.playSoundFile('prayeron');
                    }
                }
            }

            this.mouseButtonClick = 0;
        }
    }

    reportAbuseOffence: i32;
    showDialogReportAbuseStep: i32;
    reportAbuseMute: bool;

    drawDialogReportAbuse(): void {
        const DIALOG_X = 56;
        const DIALOG_Y = 35;
        const HEIGHT = 290;
        const LINE_BREAK = 15;
        const WIDTH = 400;

        const RULES: StaticArray<string> = [
            'Offensive language',
            'Item scamming',
            'Password scamming',
            'Bug abuse',
            'Jagex Staff impersonation',
            'Account sharing/trading',
            'Macroing',
            'Mutiple logging in',
            'Encouraging others to break rules',
            'Misuse of customer support',
            'Advertising / website',
            'Real world item trading'
        ];

        this.reportAbuseOffence = 0;

        let y = 135;

        for (let i = 0; i < 12; i++) {
            if (
                this.mouseX > 66 &&
                this.mouseX < 446 &&
                this.mouseY >= y - 12 &&
                this.mouseY < y + 3
            ) {
                this.reportAbuseOffence = i + 1;
            }

            y += 14;
        }

        if (this.mouseButtonClick != 0 && this.reportAbuseOffence != 0) {
            this.mouseButtonClick = 0;
            this.showDialogReportAbuseStep = 2;
            this.inputTextCurrent = '';
            this.inputTextFinal = '';
            return;
        }

        y += LINE_BREAK;

        if (this.mouseButtonClick != 0) {
            this.mouseButtonClick = 0;

            if (
                this.mouseX < DIALOG_X ||
                this.mouseY < DIALOG_Y ||
                this.mouseX > 456 ||
                this.mouseY > 325
            ) {
                this.showDialogReportAbuseStep = 0;
                return;
            }

            if (
                this.mouseX > 66 &&
                this.mouseX < 446 &&
                this.mouseY >= y - 15 &&
                this.mouseY < y + 5
            ) {
                this.showDialogReportAbuseStep = 0;
                return;
            }
        }

        this.surface!.drawBox(DIALOG_X, DIALOG_Y, WIDTH, HEIGHT, Colours.Black);
        this.surface!.drawBoxEdge(DIALOG_X, DIALOG_Y, WIDTH, HEIGHT, Colours.White);

        y = 50;

        this.surface!.drawStringCenter(
            'This form is for reporting players who are breaking our rules',
            256,
            y,
            1,
            Colours.White
        );

        y += LINE_BREAK;

        this.surface!.drawStringCenter(
            'Using it sends a snapshot of the last 60 secs of activity to us',
            256,
            y,
            1,
            Colours.White
        );

        y += LINE_BREAK;

        this.surface!.drawStringCenter(
            'If you misuse this form you will be banned',
            256,
            y,
            1,
            Colours.Orange
        );

        y += 25;

        this.surface!.drawStringCenter(
            'First indicate which of our 12 rules is being broken. For a detailed',
            256,
            y,
            1,
            Colours.Yellow
        );

        y += LINE_BREAK;

        this.surface!.drawStringCenter(
            'explanation of each rule please read the manual on our website.',
            256,
            y,
            1,
            Colours.Yellow
        );

        y += LINE_BREAK;

        for (let i = 1; i < RULES.length + 1; i += 1) {
            let textColour = Colours.Black;

            // draw the box that highlights the string
            if (this.reportAbuseOffence == i) {
                this.surface!.drawBoxEdge(66, y - 12, 380, 15, Colours.White);
                textColour = Colours.Orange;
            } else {
                textColour = Colours.White;
            }

            const rule = RULES[i - 1];
            this.surface!.drawStringCenter(`${i}: ${rule}`, 256, y, 1, textColour);
            y += 14;
        }

        y += LINE_BREAK;

        let textColour = Colours.White;

        if (
            this.mouseX > 196 &&
            this.mouseX < 316 &&
            this.mouseY > y - 15 &&
            this.mouseY < y + 5
        ) {
            textColour = Colours.Yellow;
        }

        this.surface!.drawStringCenter(
            'Click here to cancel',
            256,
            y,
            1,
            textColour
        );
    }

    drawDialogReportAbuseInput(): void {
        const DIALOG_X = 56;
        const DIALOG_Y = 35;

        const INPUT_DIALOG_Y = DIALOG_Y + 95;
        const INPUT_HEIGHT = 100;

        const WIDTH = 400;

        if (this.inputTextFinal.length > 0) {
            const username = this.inputTextFinal.trim();

            this.inputTextCurrent = '';
            this.inputTextFinal = '';

            if (username.length > 0) {
                const encodedUsername = encodeUsername(username);

                this.packetStream!.newPacket(ClientOpcodes.REPORT_ABUSE);
                this.packetStream!.putLong(encodedUsername);
                this.packetStream!.putByte(this.reportAbuseOffence);
                this.packetStream!.putByte(this.reportAbuseMute ? 1 : 0);
                this.packetStream!.sendPacket();
            }

            this.showDialogReportAbuseStep = 0;
            return;
        }

        this.surface!.drawBox(
            DIALOG_X,
            INPUT_DIALOG_Y,
            WIDTH,
            INPUT_HEIGHT,
            Colours.Black
        );

        this.surface!.drawBoxEdge(
            DIALOG_X,
            INPUT_DIALOG_Y,
            WIDTH,
            INPUT_HEIGHT,
            Colours.White
        );

        let y = INPUT_DIALOG_Y + 30;

        this.surface!.drawStringCenter(
            'Now type the name of the offending player, and press enter',
            256,
            y,
            1,
            Colours.Yellow
        );

        y += 18;

        this.surface!.drawStringCenter(
            `Name: ${this.inputTextCurrent}*`,
            256,
            y,
            4,
            Colours.White
        );

        if (this.moderatorLevel > 0) {
            y = INPUT_DIALOG_Y + 77;

            let textColour = Colours.White;
            let toggleText = 'OFF';

            if (this.reportAbuseMute) {
                textColour = Colours.Orange;
                toggleText = 'ON';
            }

            this.surface!.drawStringCenter(
                `Moderator option: Mute player for 48 hours: <${toggleText}>`,
                256,
                y,
                1,
                textColour
            );

            if (
                this.mouseX > 106 &&
                this.mouseX < 406 &&
                this.mouseY > y - 13 &&
                this.mouseY < y + 2 &&
                this.mouseButtonClick == 1
            ) {
                this.mouseButtonClick = 0;
                this.reportAbuseMute = !this.reportAbuseMute;
            }
        }

        y = 222;

        let textColour = Colours.White;

        if (
            this.mouseX > 196 &&
            this.mouseX < 316 &&
            this.mouseY > y - 13 &&
            this.mouseY < y + 2
        ) {
            textColour = Colours.Yellow;

            if (this.mouseButtonClick == 1) {
                this.mouseButtonClick = 0;
                this.showDialogReportAbuseStep = 0;
            }
        }

        this.surface!.drawStringCenter(
            'Click here to cancel',
            256,
            y,
            1,
            textColour
        );

        if (
            this.mouseButtonClick == 1 &&
            (this.mouseX < DIALOG_X ||
                this.mouseX > 456 ||
                this.mouseY < 130 ||
                this.mouseY > 230)
        ) {
            this.mouseButtonClick = 0;
            this.showDialogReportAbuseStep = 0;
        }
    }

    serverMessageBoxTop: bool;

    drawDialogServerMessage(): void {
        const WIDTH = 400;
        let height = 100;

        if (this.serverMessageBoxTop) {
            //height = 450;
            height = 300;
        }

        this.surface!.drawBox(
            256 - ((WIDTH / 2) as i32),
            167 - ((height / 2) as i32),
            WIDTH,
            height,
            Colours.Black
        );

        this.surface!.drawBoxEdge(
            256 - ((WIDTH / 2) as i32),
            167 - ((height / 2) as i32),
            WIDTH,
            height,
            Colours.White
        );

        this.surface!.drawParagraph(
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

        this.surface!.drawStringCenter(
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

    showUiWildWarn: i32;

    drawDialogWildWarn(): void {
        let y = 97;

        this.surface!.drawBox(86, 77, 340, 180, Colours.Black);
        this.surface!.drawBoxEdge(86, 77, 340, 180, Colours.White);

        this.surface!.drawStringCenter(
            'Warning! Proceed with caution',
            256,
            y,
            4,
            Colours.Red
        );

        y += 26;

        this.surface!.drawStringCenter(
            'If you go much further north you will ' + 'enter the',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface!.drawStringCenter(
            'wilderness. This a very dangerous area where',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface!.drawStringCenter(
            'other players can attack you!',
            256,
            y,
            1,
            Colours.White
        );

        y += 22;

        this.surface!.drawStringCenter(
            'The further north you go the more dangerous it',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface!.drawStringCenter(
            'becomes, but the more treasure you will find.',
            256,
            y,
            1,
            Colours.White
        );

        y += 22;

        this.surface!.drawStringCenter(
            'In the wilderness an indicator at the bottom-right',
            256,
            y,
            1,
            Colours.White
        );

        y += 13;

        this.surface!.drawStringCenter(
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

        this.surface!.drawStringCenter(
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

