declare function consoleLog(str: string): void;

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

const SHORT_SKILL_NAMES = [
    'Attack',
    'Defense',
    'Strength',
    'Hits',
    'Ranged',
    'Prayer',
    'Magic',
    'Cooking',
    'Woodcut',
    'Fletching',
    'Fishing',
    'Firemaking',
    'Crafting',
    'Smithing',
    'Mining',
    'Herblaw',
    'Agility',
    'Thieving'
];

const SKILL_NAMES = [
    'Attack',
    'Defense',
    'Strength',
    'Hits',
    'Ranged',
    'Prayer',
    'Magic',
    'Cooking',
    'Woodcutting',
    'Fletching',
    'Fishing',
    'Firemaking',
    'Crafting',
    'Smithing',
    'Mining',
    'Herblaw',
    'Agility',
    'Thieving'
];

const EQUIPMENT_STAT_NAMES = [
    'Armour',
    'WeaponAim',
    'WeaponPower',
    'Magic',
    'Prayer'
];

const EXPERIENCE_ARRAY: StaticArray<i32> = new StaticArray<i32>(100);

let totalExp = 0;

for (let i = 0; i < 99; i++) {
    const level = i + 1;
    const exp = (level + 300 * Math.pow(2, level / 7)) as i32;
    totalExp += exp;
    EXPERIENCE_ARRAY[i] = totalExp & 0xffffffc;
}

const FREE_QUESTS = [
    "Black knight's fortress",
    "Cook's assistant",
    'Demon slayer',
    "Doric's quest",
    'The restless ghost',
    'Goblin diplomacy',
    'Ernest the chicken',
    'Imp catcher',
    "Pirate's treasure",
    'Prince Ali rescue',
    'Romeo & Juliet',
    'Sheep shearer',
    'Shield of Arrav',
    "The knight's sword",
    'Vampire slayer',
    "Witch's potion",
    'Dragon slayer'
];

const MEMBERS_QUESTS = [
    "Witch's house",
    'Lost city',
    "Hero's quest",
    'Druidic ritual',
    "Merlin's crystal",
    'Scorpion catcher',
    'Family crest',
    'Tribal totem',
    'Fishing contest',
    "Monk's friend",
    'Temple of Ikov',
    'Clock tower',
    'The Holy Grail',
    'Fight Arena',
    'Tree Gnome Village',
    'The Hazeel Cult',
    'Sheep Herder',
    'Plague City',
    'Sea Slug',
    'Waterfall quest',
    'Biohazard',
    'Jungle potion',
    'Grand tree',
    'Shilo village',
    'Underground pass',
    'Observatory quest',
    'Tourist trap',
    'Watchtower',
    'Dwarf Cannon',
    'Murder Mystery',
    'Digsite',
    "Gertrude's Cat",
    "Legend's Quest"
].map<string>((questName: string): string => `${questName} (members)`);

const QUEST_NAMES = FREE_QUESTS.concat(MEMBERS_QUESTS);

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

    panelQuestList: Panel | null;
    panelMagic: Panel | null;
    panelSocialList: Panel | null;
    controlListSocialPlayers: i32;

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
                    //this.setActiveMobileUITab();
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
                x + ((width / 2) as i32),
                y + ((height / 2) as i32),
                20 + time * 2,
                colour,
                255 - time * 5
            );
        } else if (type == 1) {
            // red bubble used for telegrab
            const colour = 0xff0000 + time * 5 * 256;

            this.surface!.drawCircle(
                x + ((width / 2) as i32),
                y + ((height / 2) as i32),
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
        //this.resetTimings();
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
                    const type = (gameModel.faceTag![pid] / 10000) as i32;

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

    /* $_uiComponents */
}
