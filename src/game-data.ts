export default class GameData {
    static modelName: StaticArray<string | null> = new StaticArray<
        string | null
    >(5000);

    static textureCount: i32;
    static textureName: StaticArray<string | null> | null;
    static textureSubtypeName: StaticArray<string | null> | null;

    static objectCount: i32;
    static objectModelIndex: Int32Array | null;
    static objectWidth: Int32Array | null;
    static objectHeight: Int32Array | null;
    static objectType: Int32Array | null;
    static objectElevation: Int32Array | null;
    static objectName: StaticArray<string | null>;
    static objectDescription: StaticArray<string | null>;
    static objectCommand1: StaticArray<string | null>;
    static objectCommand2: StaticArray<string | null>;

    static wallObjectCount: i32;
    static wallObjectHeight: Int32Array | null;
    static wallObjectTextureFront: Int32Array | null;
    static wallObjectTextureBack: Int32Array | null;
    static wallObjectAdjacent: Int32Array | null;
    static wallObjectInvisible: Int32Array | null;
    static wallObjectName: StaticArray<string | null>;
    static wallObjectDescription: StaticArray<string | null>;
    static wallObjectCommand1: StaticArray<string | null>;
    static wallObjectCommand2: StaticArray<string | null>;

    static npcCount: i32;
    static npcWidth: Int32Array | null;
    static npcHeight: Int32Array | null;
    static npcSprite: StaticArray<Int32Array | null> | null;
    static npcColourHair: Int32Array | null;
    static npcColourTop: Int32Array | null;
    static npcColorBottom: Int32Array | null;
    static npcColourSkin: Int32Array | null;
    static npcAttack: Int32Array | null;
    static npcStrength: Int32Array | null;
    static npcHits: Int32Array | null;
    static npcDefense: Int32Array | null;
    static npcAttackable: Int32Array | null;
    static npcWalkModel: Int32Array | null;
    static npcCombatModel: Int32Array | null;
    static npcCombatAnimation: Int32Array | null;
    static npcName: StaticArray<string | null>;
    static npcDescription: StaticArray<string | null>;
    static npcCommand: StaticArray<string | null>;

    static spellCount: i32;
    static spellLevel: Int32Array | null;
    static spellRunesRequired: Int32Array | null;
    static spellType: Int32Array | null;
    static spellRunesId: StaticArray<Int32Array | null> | null;
    static spellRunesCount: StaticArray<Int32Array | null> | null;
    static spellName: StaticArray<string | null>;
    static spellDescription: StaticArray<string | null>;

    static itemCount: i32;
    static itemSpriteCount: i32;
    static itemName: StaticArray<string | null>;
    static itemDescription: StaticArray<string | null>;
    static itemCommand: StaticArray<string | null>;
    static itemPicture: Int32Array | null;
    static itemBasePrice: Int32Array | null;
    static itemStackable: Int32Array | null;
    static itemUnused: Int32Array | null;
    static itemWearable: Int32Array | null;
    static itemMask: Int32Array | null;
    static itemSpecial: Int32Array | null;
    static itemMembers: Int32Array | null;

    static tileCount: i32;
    static tileDecoration: Int32Array | null;
    static tileType: Int32Array | null;
    static tileAdjacent: Int32Array | null;

    static animationCount: i32;
    static animationCharacterColour: Int32Array | null;
    static animationSomething: Int32Array | null;
    static animationHasA: Int32Array | null;
    static animationHasF: Int32Array | null;
    static animationNumber: Int32Array | null;
    static animationName: StaticArray<string | null>;

    static prayerCount: i32;
    static prayerLevel: Int32Array | null;
    static prayerDrain: Int32Array | null;
    static prayerName: StaticArray<string | null>;
    static prayerDescription: StaticArray<string | null>;

    static roofCount: i32;
    static roofHeight: Int32Array | null;
    static roofNumVertices: Int32Array | null;

    static modelCount: i32;
    static projectileSprite: i32;

    static dataString: Int8Array | null;
    static dataInteger: Int8Array | null;
    static stringOffset: i32;
    static offset: i32;
}
