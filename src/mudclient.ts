import GameConnection from './game-connection';
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

const ANIMATED_MODELS = [
    'torcha2',
    'torcha3',
    'torcha4',
    'skulltorcha2',
    'skulltorcha3',
    'skulltorcha4',
    'firea2',
    'firea3',
    'fireplacea2',
    'fireplacea3',
    'firespell2',
    'firespell3',
    'lightning2',
    'lightning3',
    'clawspell2',
    'clawspell3',
    'clawspell4',
    'clawspell5',
    'spellcharge2',
    'spellcharge3'
];

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
    npcCombatModelArray1: Int32Array = new Int32Array(8);
    npcCombatModelArray2: Int32Array = new Int32Array(8);
    systemUpdate: i32;
    regionX: i32;
    regionY: i32;
    welcomScreenAlreadyShown: bool;
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
    npcAnimationArray: StaticArray<Int32Array>;

    constructor() {
        super();

        this.npcCombatModelArray1[1] = 1;
        this.npcCombatModelArray1[2] = 2;
        this.npcCombatModelArray1[3] = 1;

        this.npcCombatModelArray2[7] = 1;
        this.npcCombatModelArray1[6] = 2;
        this.npcCombatModelArray1[5] = 1;

        this.npcAnimationArray = Int322DArray.fromArray();
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
}
