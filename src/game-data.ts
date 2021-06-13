import { Int322DArray } from './lib/ndarray';
import { getUnsignedShort, getUnsignedInt, loadData } from './utility';

export default class GameData {
    static modelName: StaticArray<string | null> = new StaticArray<
        string | null
    >(5000);

    static textureCount: i32;
    static textureName: StaticArray<string>;
    static textureSubtypeName: StaticArray<string>;

    static objectCount: i32;
    static objectModelIndex: Int32Array;
    static objectWidth: Int32Array;
    static objectHeight: Int32Array;
    static objectType: Int32Array;
    static objectElevation: Int32Array;
    static objectName: StaticArray<string>;
    static objectDescription: StaticArray<string>;
    static objectCommand1: StaticArray<string>;
    static objectCommand2: StaticArray<string>;

    static wallObjectCount: i32;
    static wallObjectHeight: Int32Array;
    static wallObjectTextureFront: Int32Array;
    static wallObjectTextureBack: Int32Array;
    static wallObjectAdjacent: Int32Array;
    static wallObjectInvisible: Int32Array;
    static wallObjectName: StaticArray<string>;
    static wallObjectDescription: StaticArray<string>;
    static wallObjectCommand1: StaticArray<string>;
    static wallObjectCommand2: StaticArray<string>;

    static npcCount: i32;
    static npcName: StaticArray<string>;
    static npcDescription: StaticArray<string>;
    static npcCommand: StaticArray<string>;
    static npcWidth: Int32Array;
    static npcHeight: Int32Array;
    static npcSprite: Int322DArray;
    static npcColourHair: Int32Array;
    static npcColourTop: Int32Array;
    static npcColorBottom: Int32Array;
    static npcColourSkin: Int32Array;
    static npcAttack: Int32Array;
    static npcStrength: Int32Array;
    static npcHits: Int32Array;
    static npcDefense: Int32Array;
    static npcAttackable: Int32Array;
    static npcWalkModel: Int32Array;
    static npcCombatModel: Int32Array;
    static npcCombatAnimation: Int32Array;

    static spellCount: i32;
    static spellLevel: Int32Array;
    static spellRunesRequired: Int32Array;
    static spellType: Int32Array;
    static spellRunesId: StaticArray<Int32Array>;
    static spellRunesCount: StaticArray<Int32Array>;
    static spellName: StaticArray<string>;
    static spellDescription: StaticArray<string>;

    static itemCount: i32;
    static itemSpriteCount: i32;
    static itemName: StaticArray<string>;
    static itemDescription: StaticArray<string>;
    static itemCommand: StaticArray<string>;
    static itemPicture: Int32Array;
    static itemBasePrice: Int32Array;
    static itemStackable: Int32Array;
    static itemUnused: Int32Array;
    static itemWearable: Int32Array;
    static itemMask: Int32Array;
    static itemSpecial: Int32Array;
    static itemMembers: Int32Array;

    static tileCount: i32;
    static tileDecoration: Int32Array;
    static tileType: Int32Array;
    static tileAdjacent: Int32Array;

    static animationCount: i32;
    static animationCharacterColour: Int32Array;
    static animationGender: Int32Array;
    static animationHasA: Int32Array;
    static animationHasF: Int32Array;
    static animationNumber: Int32Array;
    static animationName: StaticArray<string>;

    static prayerCount: i32;
    static prayerLevel: Int32Array;
    static prayerDrain: Int32Array;
    static prayerName: StaticArray<string>;
    static prayerDescription: StaticArray<string>;

    static roofCount: i32;
    static roofHeight: Int32Array;
    static roofNumVertices: Int32Array;

    static modelCount: i32;
    static projectileSprite: i32;

    static dataString: Int8Array;
    static dataInteger: Int8Array;
    static stringOffset: i32;
    static offset: i32;

    static getModelIndex(modelName: string): i32 {
        const lowerName = modelName.toLowerCase();

        if (lowerName.startsWith('na')) {
            return 0;
        }

        for (let i = 0; i < GameData.modelCount; i++) {
            if (GameData.modelName[i]!.toLowerCase() == lowerName) {
                return i;
            }
        }

        GameData.modelName[GameData.modelCount++] = modelName;

        return GameData.modelCount - 1;
    }

    static getUnsignedByte(): i32 {
        const byte = GameData.dataInteger[GameData.offset] & 0xff;
        GameData.offset++;

        return byte;
    }

    static getUnsignedShort(): i32 {
        const short = getUnsignedShort(GameData.dataInteger, GameData.offset);
        GameData.offset += 2;

        return short;
    }

    static getUnsignedInt(): i32 {
        let int = getUnsignedInt(GameData.dataInteger, GameData.offset);
        GameData.offset += 4;

        if (int > 99999999) {
            int = 99999999 - int;
        }

        return int;
    }

    static getString(): string {
        let string = '';

        for (
            string = '';
            GameData.dataString[GameData.stringOffset] != 0;
            string += String.fromCharCode(
                GameData.dataString[GameData.stringOffset++]
            )
        );

        GameData.stringOffset++;

        return string;
    }

    static loadData(buffer: Int8Array, isMembers: bool): void {
        GameData.dataString = loadData('string.dat', 0, buffer)!;
        GameData.stringOffset = 0;
        GameData.dataInteger = loadData('integer.dat', 0, buffer)!;
        GameData.offset = 0;

        let i = 0;

        GameData.itemCount = GameData.getUnsignedShort();
        GameData.itemName = new StaticArray<string>(GameData.itemCount);
        GameData.itemDescription = new StaticArray<string>(GameData.itemCount);
        GameData.itemCommand = new StaticArray<string>(GameData.itemCount);
        GameData.itemPicture = new Int32Array(GameData.itemCount);
        GameData.itemBasePrice = new Int32Array(GameData.itemCount);
        GameData.itemStackable = new Int32Array(GameData.itemCount);
        GameData.itemUnused = new Int32Array(GameData.itemCount);
        GameData.itemWearable = new Int32Array(GameData.itemCount);
        GameData.itemMask = new Int32Array(GameData.itemCount);
        GameData.itemSpecial = new Int32Array(GameData.itemCount);
        GameData.itemMembers = new Int32Array(GameData.itemCount);

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemDescription[i] = GameData.getString();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemCommand[i] = GameData.getString();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemPicture[i] = GameData.getUnsignedShort();

            if (GameData.itemPicture[i] + 1 > GameData.itemSpriteCount) {
                GameData.itemSpriteCount = GameData.itemPicture[i] + 1;
            }
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemBasePrice[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemStackable[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemUnused[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemWearable[i] = GameData.getUnsignedShort();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemMask[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemSpecial[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            GameData.itemMembers[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.itemCount; i++) {
            if (!isMembers && GameData.itemMembers[i] == 1) {
                GameData.itemName[i] = 'Members object';

                GameData.itemDescription[i] =
                    'You need to be a member to use this object';

                GameData.itemBasePrice[i] = 0;
                GameData.itemCommand[i] = '';
                GameData.itemUnused[0] = 0;
                GameData.itemWearable[i] = 0;
                GameData.itemSpecial[i] = 1;
            }
        }

        GameData.npcCount = GameData.getUnsignedShort();
        GameData.npcName = new StaticArray<string>(GameData.npcCount);
        GameData.npcDescription = new StaticArray<string>(GameData.npcCount);
        GameData.npcCommand = new StaticArray<string>(GameData.npcCount);
        GameData.npcAttack = new Int32Array(GameData.npcCount);
        GameData.npcStrength = new Int32Array(GameData.npcCount);
        GameData.npcHits = new Int32Array(GameData.npcCount);
        GameData.npcDefense = new Int32Array(GameData.npcCount);
        GameData.npcAttackable = new Int32Array(GameData.npcCount);
        GameData.npcSprite = new Int322DArray(GameData.npcCount, 12);
        GameData.npcColourHair = new Int32Array(GameData.npcCount);
        GameData.npcColourTop = new Int32Array(GameData.npcCount);
        GameData.npcColorBottom = new Int32Array(GameData.npcCount);
        GameData.npcColourSkin = new Int32Array(GameData.npcCount);
        GameData.npcWidth = new Int32Array(GameData.npcCount);
        GameData.npcHeight = new Int32Array(GameData.npcCount);
        GameData.npcWalkModel = new Int32Array(GameData.npcCount);
        GameData.npcCombatModel = new Int32Array(GameData.npcCount);
        GameData.npcCombatAnimation = new Int32Array(GameData.npcCount);

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcDescription[i] = GameData.getString();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcAttack[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcStrength[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcHits[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcDefense[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcAttackable[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            for (let i5 = 0; i5 < 12; i5++) {
                GameData.npcSprite.set(i, i5, GameData.getUnsignedByte());

                if (GameData.npcSprite.get(i, i5) == 255) {
                    GameData.npcSprite.set(i, i5, -1);
                }
            }
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcColourHair[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcColourTop[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcColorBottom[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcColourSkin[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcWidth[i] = GameData.getUnsignedShort();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcHeight[i] = GameData.getUnsignedShort();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcWalkModel[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcCombatModel[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcCombatAnimation[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.npcCount; i++) {
            GameData.npcCommand[i] = GameData.getString();
        }

        GameData.textureCount = GameData.getUnsignedShort();
        GameData.textureName = new StaticArray<string>(GameData.textureCount);
        GameData.textureSubtypeName = new StaticArray<string>(
            GameData.textureCount
        );

        for (i = 0; i < GameData.textureCount; i++) {
            GameData.textureName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.textureCount; i++) {
            GameData.textureSubtypeName[i] = GameData.getString();
        }

        GameData.animationCount = GameData.getUnsignedShort();
        GameData.animationName = new StaticArray<string>(
            GameData.animationCount
        );

        GameData.animationCharacterColour = new Int32Array(
            GameData.animationCount
        );

        GameData.animationGender = new Int32Array(GameData.animationCount);
        GameData.animationHasA = new Int32Array(GameData.animationCount);
        GameData.animationHasF = new Int32Array(GameData.animationCount);
        GameData.animationNumber = new Int32Array(GameData.animationCount);

        for (i = 0; i < GameData.animationCount; i++) {
            GameData.animationName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.animationCount; i++) {
            GameData.animationCharacterColour[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.animationCount; i++) {
            GameData.animationGender[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.animationCount; i++) {
            GameData.animationHasA[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.animationCount; i++) {
            GameData.animationHasF[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.animationCount; i++) {
            GameData.animationNumber[i] = GameData.getUnsignedByte();
        }

        GameData.objectCount = GameData.getUnsignedShort();
        GameData.objectName = new StaticArray<string>(GameData.objectCount);
        GameData.objectDescription = new StaticArray<string>(
            GameData.objectCount
        );
        GameData.objectCommand1 = new StaticArray<string>(GameData.objectCount);
        GameData.objectCommand2 = new StaticArray<string>(GameData.objectCount);
        GameData.objectModelIndex = new Int32Array(GameData.objectCount);
        GameData.objectWidth = new Int32Array(GameData.objectCount);
        GameData.objectHeight = new Int32Array(GameData.objectCount);
        GameData.objectType = new Int32Array(GameData.objectCount);
        GameData.objectElevation = new Int32Array(GameData.objectCount);

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectDescription[i] = GameData.getString();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectCommand1[i] = GameData.getString();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectCommand2[i] = GameData.getString();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectModelIndex[i] = GameData.getModelIndex(
                GameData.getString()
            );
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectWidth[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectHeight[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectType[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.objectCount; i++) {
            GameData.objectElevation[i] = GameData.getUnsignedByte();
        }

        GameData.wallObjectCount = GameData.getUnsignedShort();
        GameData.wallObjectName = new StaticArray<string>(
            GameData.wallObjectCount
        );
        GameData.wallObjectDescription = new StaticArray<string>(
            GameData.wallObjectCount
        );
        GameData.wallObjectCommand1 = new StaticArray<string>(
            GameData.wallObjectCount
        );
        GameData.wallObjectCommand2 = new StaticArray<string>(
            GameData.wallObjectCount
        );
        GameData.wallObjectHeight = new Int32Array(GameData.wallObjectCount);

        GameData.wallObjectTextureFront = new Int32Array(
            GameData.wallObjectCount
        );

        GameData.wallObjectTextureBack = new Int32Array(
            GameData.wallObjectCount
        );

        GameData.wallObjectAdjacent = new Int32Array(GameData.wallObjectCount);
        GameData.wallObjectInvisible = new Int32Array(GameData.wallObjectCount);

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectDescription[i] = GameData.getString();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectCommand1[i] = GameData.getString();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectCommand2[i] = GameData.getString();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectHeight[i] = GameData.getUnsignedShort();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectTextureFront[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            GameData.wallObjectTextureBack[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            // what's this?
            GameData.wallObjectAdjacent[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.wallObjectCount; i++) {
            // value is 0 if visible
            GameData.wallObjectInvisible[i] = GameData.getUnsignedByte();
        }

        // the World class does something with these
        GameData.roofCount = GameData.getUnsignedShort();
        GameData.roofHeight = new Int32Array(GameData.roofCount);
        GameData.roofNumVertices = new Int32Array(GameData.roofCount);

        for (i = 0; i < GameData.roofCount; i++) {
            GameData.roofHeight[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.roofCount; i++) {
            GameData.roofNumVertices[i] = GameData.getUnsignedByte();
        }

        GameData.tileCount = GameData.getUnsignedShort(); // and these
        GameData.tileDecoration = new Int32Array(GameData.tileCount);
        GameData.tileType = new Int32Array(GameData.tileCount);
        GameData.tileAdjacent = new Int32Array(GameData.tileCount);

        for (i = 0; i < GameData.tileCount; i++) {
            GameData.tileDecoration[i] = GameData.getUnsignedInt();
        }

        for (i = 0; i < GameData.tileCount; i++) {
            GameData.tileType[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.tileCount; i++) {
            GameData.tileAdjacent[i] = GameData.getUnsignedByte();
        }

        GameData.projectileSprite = GameData.getUnsignedShort();
        GameData.spellCount = GameData.getUnsignedShort();
        GameData.spellName = new StaticArray<string>(GameData.spellCount);
        GameData.spellDescription = new StaticArray<string>(
            GameData.spellCount
        );
        GameData.spellLevel = new Int32Array(GameData.spellCount);
        GameData.spellRunesRequired = new Int32Array(GameData.spellCount);
        GameData.spellType = new Int32Array(GameData.spellCount);
        GameData.spellRunesId = new StaticArray<Int32Array>(
            GameData.spellCount
        );
        GameData.spellRunesCount = new StaticArray<Int32Array>(
            GameData.spellCount
        );

        for (i = 0; i < GameData.spellCount; i++) {
            GameData.spellName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.spellCount; i++) {
            GameData.spellDescription[i] = GameData.getString();
        }

        for (i = 0; i < GameData.spellCount; i++) {
            GameData.spellLevel[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.spellCount; i++) {
            GameData.spellRunesRequired[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.spellCount; i++) {
            GameData.spellType[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.spellCount; i++) {
            const runeAmount = GameData.getUnsignedByte();

            GameData.spellRunesId[i] = new Int32Array(runeAmount);

            for (let j = 0; j < runeAmount; j++) {
                GameData.spellRunesId[i][j] = GameData.getUnsignedShort();
            }
        }

        for (i = 0; i < GameData.spellCount; i++) {
            let runeAmount = GameData.getUnsignedByte();

            GameData.spellRunesCount[i] = new Int32Array(runeAmount);

            for (let j = 0; j < runeAmount; j++) {
                GameData.spellRunesCount[i][j] = GameData.getUnsignedByte();
            }
        }

        GameData.prayerCount = GameData.getUnsignedShort();
        GameData.prayerName = new StaticArray<string>(GameData.prayerCount);

        GameData.prayerDescription = new StaticArray<string>(
            GameData.prayerCount
        );

        GameData.prayerLevel = new Int32Array(GameData.prayerCount);
        GameData.prayerDrain = new Int32Array(GameData.prayerCount);

        for (i = 0; i < GameData.prayerCount; i++) {
            GameData.prayerName[i] = GameData.getString();
        }

        for (i = 0; i < GameData.prayerCount; i++) {
            GameData.prayerDescription[i] = GameData.getString();
        }

        for (i = 0; i < GameData.prayerCount; i++) {
            GameData.prayerLevel[i] = GameData.getUnsignedByte();
        }

        for (i = 0; i < GameData.prayerCount; i++) {
            GameData.prayerDrain[i] = GameData.getUnsignedByte();
        }

        //GameData.dataString = null;
        //GameData.dataInteger = null;
    }
}
