import GameData from './game-data';
import GameModel from './game-model';
import Scene from './scene';
import Surface from './surface';
import { Int82DArray, Int322DArray } from './lib/ndarray';
import { loadData } from './utility';

const COLOUR_TRANSPARENT = 12345678;
const REGION_WIDTH = 96;
const REGION_HEIGHT = 96;
const AN_INT_585 = 128;

const PLANE_COUNT = 4;
const TILE_COUNT = 2304;

export default class World {
    worldInitialised: bool = true;
    objectAdjacency: Int322DArray = new Int322DArray(
        REGION_WIDTH,
        REGION_HEIGHT
    );

    tileDirection: Int82DArray = new Int82DArray(4, TILE_COUNT);

    wallModels: StaticArray<StaticArray<GameModel | null>> = new StaticArray<
        StaticArray<GameModel | null>
    >(4);

    roofModels: StaticArray<StaticArray<GameModel | null>> = new StaticArray<
        StaticArray<GameModel | null>
    >(4);

    terrainColours: Int32Array = new Int32Array(256);
    wallsNorthSouth: Int82DArray = new Int82DArray(PLANE_COUNT, TILE_COUNT);
    parentModel: GameModel | null;
    wallsRoof: Int82DArray = new Int82DArray(PLANE_COUNT, TILE_COUNT);
    terrainHeight: Int82DArray = new Int82DArray(PLANE_COUNT, TILE_COUNT);
    terrainColour: Int82DArray = new Int82DArray(PLANE_COUNT, TILE_COUNT);
    tileDecoration: Int82DArray = new Int82DArray(PLANE_COUNT, TILE_COUNT);
    routeVia: Int322DArray = new Int322DArray(REGION_WIDTH, REGION_HEIGHT);
    wallsDiagonal: Int322DArray = new Int322DArray(PLANE_COUNT, TILE_COUNT);
    wallsEastWest: Int82DArray = new Int82DArray(PLANE_COUNT, TILE_COUNT);
    aBoolean592: bool;
    playerAlive: bool;

    terrainHeightLocal: Int322DArray = new Int322DArray(
        REGION_WIDTH,
        REGION_HEIGHT
    );

    landscapePack: Int8Array | null;
    mapPack: Int8Array | null;
    surface: Surface;
    scene: Scene;

    terrainModels: StaticArray<GameModel | null> = new StaticArray<GameModel | null>(
        64
    );

    localY: Int32Array = new Int32Array(18432);
    localX: Int32Array = new Int32Array(18432);

    baseMediaSprite: i32 = 750;

    memberLandscapePack: Int8Array | null;
    memberMapPack: Int8Array | null;

    constructor(scene: Scene, surface: Surface) {
        this.scene = scene;
        this.surface = surface;

        for (let i = 0; i < 64; i++) {
            unchecked(
                (this.terrainColours[i] = Scene.rgb(
                    255 - i * 4,
                    255 - ((i * 1.75) as i32),
                    255 - i * 4
                ))
            );
        }

        for (let i = 0; i < 64; i++) {
            unchecked((this.terrainColours[i + 64] = Scene.rgb(i * 3, 144, 0)));
        }

        for (let i = 0; i < 64; i++) {
            unchecked(
                (this.terrainColours[i + 128] = Scene.rgb(
                    192 - ((i * 1.5) as i32),
                    144 - ((i * 1.5) as i32),
                    0
                ))
            );
        }

        for (let i = 0; i < 64; i++) {
            unchecked(
                (this.terrainColours[i + 192] = Scene.rgb(
                    96 - ((i * 1.5) as i32),
                    48 + ((i * 1.5) as i32),
                    0
                ))
            );
        }
    }

    getWallEastWest(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        return this.wallsEastWest.get(h, x * 48 + y) & 0xff;
    }

    setTerrainAmbience(x: i32, y: i32, x2: i32, y2: i32, ambience: i32): void {
        const gameModel = unchecked(this.terrainModels[x + y * 8]!);

        for (let i = 0; i < gameModel.numVertices; i++) {
            if (
                gameModel.vertexX![i] == x2 * AN_INT_585 &&
                gameModel.vertexZ![i] == y2 * AN_INT_585
            ) {
                gameModel.setVertexAmbience(i, ambience);
                return;
            }
        }
    }

    getWallRoof(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        return this.wallsRoof.get(h, x * 48 + y);
    }

    getElevation(x: i32, y: i32): i32 {
        let sX = x >> 7;
        let sY = y >> 7;
        let aX = x & 0x7f;
        let aY = y & 0x7f;

        if (sX < 0 || sY < 0 || sX >= 95 || sY >= 95) {
            return 0;
        }

        let h = 0;
        let hx = 0;
        let hy = 0;

        if (aX <= AN_INT_585 - aY) {
            h = this.getTerrainHeight(sX, sY);
            hx = this.getTerrainHeight(sX + 1, sY) - h;
            hy = this.getTerrainHeight(sX, sY + 1) - h;
        } else {
            h = this.getTerrainHeight(sX + 1, sY + 1);
            hx = this.getTerrainHeight(sX, sY + 1) - h;
            hy = this.getTerrainHeight(sX + 1, sY) - h;
            aX = AN_INT_585 - aX;
            aY = AN_INT_585 - aY;
        }

        let elevation =
            h +
            (((hx * aX) / AN_INT_585) as i32) +
            (((hy * aY) / AN_INT_585) as i32);

        return elevation;
    }

    getWallDiagonal(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        return this.wallsDiagonal.get(h, x * 48 + y);
    }

    removeObject2(x: i32, y: i32, id: i32): void {
        if (x < 0 || y < 0 || x >= 95 || y >= 95) {
            return;
        }

        if (GameData.objectType[id] == 1 || GameData.objectType[id] == 2) {
            let tileDir = this.getTileDirection(x, y);
            let modelWidth = 0;
            let modelHeight = 0;

            if (tileDir == 0 || tileDir == 4) {
                modelWidth = unchecked(GameData.objectWidth[id]);
                modelHeight = unchecked(GameData.objectHeight[id]);
            } else {
                modelHeight = unchecked(GameData.objectWidth[id]);
                modelWidth = unchecked(GameData.objectHeight[id]);
            }

            for (let mx = x; mx < x + modelWidth; mx++) {
                for (let my = y; my < y + modelHeight; my++) {
                    const adjacency = this.objectAdjacency.get(mx, my);

                    if (GameData.objectType[id] == 1) {
                        this.objectAdjacency.set(mx, my, adjacency | 0x40);
                    } else if (tileDir == 0) {
                        this.objectAdjacency.set(mx, my, adjacency | 2);

                        if (mx > 0) {
                            this._setObjectAdjacency_from3(mx - 1, my, 8);
                        }
                    } else if (tileDir == 2) {
                        this.objectAdjacency.set(mx, my, adjacency | 4);

                        if (my < 95) {
                            this._setObjectAdjacency_from3(mx, my + 1, 1);
                        }
                    } else if (tileDir == 4) {
                        this.objectAdjacency.set(mx, my, adjacency | 8);

                        if (mx < 95) {
                            this._setObjectAdjacency_from3(mx + 1, my, 2);
                        }
                    } else if (tileDir == 6) {
                        this.objectAdjacency.set(mx, my, adjacency | 1);

                        if (my > 0) {
                            this._setObjectAdjacency_from3(mx, my - 1, 4);
                        }
                    }
                }
            }

            this.method404(x, y, modelWidth, modelHeight);
        }
    }

    removeWallObject(x: i32, y: i32, k: i32, id: i32): void {
        if (x < 0 || y < 0 || x >= 95 || y >= 95) {
            return;
        }

        if (GameData.wallObjectAdjacent[id] == 1) {
            const adjacency = this.objectAdjacency.get(x, y);

            if (k == 0) {
                this.objectAdjacency.set(x, y, adjacency & 0xfffe);

                if (y > 0) {
                    this.method407(x, y - 1, 4);
                }
            } else if (k == 1) {
                this.objectAdjacency.set(x, y, adjacency & 0xfffd);

                if (x > 0) {
                    this.method407(x - 1, y, 8);
                }
            } else if (k == 2) {
                this.objectAdjacency.set(x, y, adjacency & 0xffef);
            } else if (k == 3) {
                this.objectAdjacency.set(x, y, adjacency & 0xffdf);
            }

            this.method404(x, y, 1, 1);
        }
    }

    method402(i: i32, j: i32, k: i32, l: i32, i1: i32): void {
        let j1 = i * 3;
        let k1 = j * 3;
        let l1 = this.scene.method302(l);
        let i2 = this.scene.method302(i1);

        l1 = (l1 >> 1) & 0x7f7f7f;
        i2 = (i2 >> 1) & 0x7f7f7f;

        if (k == 0) {
            this.surface.drawLineHoriz(j1, k1, 3, l1);
            this.surface.drawLineHoriz(j1, k1 + 1, 2, l1);
            this.surface.drawLineHoriz(j1, k1 + 2, 1, l1);
            this.surface.drawLineHoriz(j1 + 2, k1 + 1, 1, i2);
            this.surface.drawLineHoriz(j1 + 1, k1 + 2, 2, i2);

            return;
        }

        if (k == 1) {
            this.surface.drawLineHoriz(j1, k1, 3, i2);
            this.surface.drawLineHoriz(j1 + 1, k1 + 1, 2, i2);
            this.surface.drawLineHoriz(j1 + 2, k1 + 2, 1, i2);
            this.surface.drawLineHoriz(j1, k1 + 1, 1, l1);
            this.surface.drawLineHoriz(j1, k1 + 2, 2, l1);
        }
    }

    _loadSection_from4I(x: i32, y: i32, plane: i32, chunk: i32): void {
        const mapName =
            'm' +
            plane.toString() +
            ((x / 10) as i32).toString() +
            (x % 10).toString() +
            ((y / 10) as i32).toString() +
            (y % 10).toString();

        if (!this.landscapePack) {
            return;
        }

        let mapData = loadData(mapName + '.hei', 0, this.landscapePack);

        if (!mapData && this.memberLandscapePack) {
            mapData = loadData(mapName + '.hei', 0, this.memberLandscapePack);
        }

        if (mapData && mapData.length) {
            let off = 0;
            let lastVal = 0;

            for (let tile = 0; tile < TILE_COUNT; ) {
                let val = mapData[off++] & 0xff;

                if (val < 128) {
                    this.terrainHeight.set(chunk, tile++, val & 0xff);
                    lastVal = val;
                }

                if (val >= 128) {
                    for (let i = 0; i < val - 128; i++) {
                        this.terrainHeight.set(chunk, tile++, lastVal & 0xff);
                    }
                }
            }

            lastVal = 64;

            for (let tileY = 0; tileY < 48; tileY++) {
                for (let tileX = 0; tileX < 48; tileX++) {
                    lastVal =
                        (this.terrainHeight.get(chunk, tileX * 48 + tileY) +
                            lastVal) &
                        0x7f;
                    this.terrainHeight.set(
                        chunk,
                        tileX * 48 + tileY,
                        (lastVal * 2) & 0xff
                    );
                }
            }

            lastVal = 0;

            for (let tile = 0; tile < TILE_COUNT; ) {
                let val = mapData[off++] & 0xff;

                if (val < 128) {
                    this.terrainColour.set(chunk, tile++, val & 0xff);
                    lastVal = val;
                }

                if (val >= 128) {
                    for (let i = 0; i < val - 128; i++) {
                        this.terrainColour.set(chunk, tile++, lastVal & 0xff);
                    }
                }
            }

            lastVal = 35;

            for (let tileY = 0; tileY < 48; tileY++) {
                for (let tileX = 0; tileX < 48; tileX++) {
                    lastVal =
                        (this.terrainColour.get(chunk, tileX * 48 + tileY) +
                            lastVal) &
                        0x7f;

                    this.terrainColour.set(
                        chunk,
                        tileX * 48 + tileY,
                        (lastVal * 2) & 0xff
                    );
                }
            }
        } else {
            for (let tile = 0; tile < TILE_COUNT; tile++) {
                this.terrainHeight.set(chunk, tile, 0);
                this.terrainColour.set(chunk, tile, 0);
            }
        }

        mapData = loadData(mapName + '.dat', 0, this.mapPack!);

        if (!mapData && this.memberMapPack) {
            mapData = loadData(mapName + '.dat', 0, this.memberMapPack);
        }

        if (mapData && mapData.length) {
            let offset = 0;

            for (let tile = 0; tile < TILE_COUNT; tile++) {
                this.wallsNorthSouth.set(chunk, tile, mapData[offset++]);
            }

            for (let tile = 0; tile < TILE_COUNT; tile++) {
                this.wallsEastWest.set(chunk, tile, mapData[offset++]);
            }

            for (let tile = 0; tile < TILE_COUNT; tile++) {
                this.wallsDiagonal.set(chunk, tile, mapData[offset++] & 0xff);
            }

            for (let tile = 0; tile < TILE_COUNT; tile++) {
                let val = mapData[offset++] & 0xff;

                if (val > 0) {
                    this.wallsDiagonal.set(chunk, tile, val + 12000);
                }
            }

            for (let tile = 0; tile < TILE_COUNT; ) {
                let val = mapData[offset++] & 0xff;

                if (val < 128) {
                    this.wallsRoof.set(chunk, tile++, val & 0xff);
                } else {
                    for (let i = 0; i < val - 128; i++) {
                        this.wallsRoof.set(chunk, tile++, 0);
                    }
                }
            }

            let lastVal = 0;

            for (let tile = 0; tile < TILE_COUNT; ) {
                let val = mapData[offset++] & 0xff;

                if (val < 128) {
                    this.tileDecoration.set(chunk, tile++, val & 0xff);
                    lastVal = val;
                } else {
                    for (let i = 0; i < val - 128; i++) {
                        this.tileDecoration.set(chunk, tile++, lastVal);
                    }
                }
            }

            for (let tile = 0; tile < TILE_COUNT; ) {
                let val = mapData[offset++] & 0xff;

                if (val < 128) {
                    this.tileDirection.set(chunk, tile++, val & 0xff);
                } else {
                    for (let i = 0; i < val - 128; i++) {
                        this.tileDirection.set(chunk, tile++, 0);
                    }
                }
            }

            mapData = loadData(mapName + '.loc', 0, this.mapPack!);

            if (mapData && mapData.length) {
                offset = 0;

                for (let tile = 0; tile < TILE_COUNT; ) {
                    let val = mapData[offset++] & 0xff;

                    if (val < 128) {
                        this.wallsDiagonal.set(chunk, tile++, val + 48000);
                    } else {
                        tile += val - 128;
                    }
                }

                return;
            }
        } else {
            for (let tile = 0; tile < TILE_COUNT; tile++) {
                this.terrainHeight.set(chunk, tile, 0);
                this.terrainColour.set(chunk, tile, 0);
                this.wallsNorthSouth.set(chunk, tile, 0);
                this.wallsEastWest.set(chunk, tile, 0);
                this.wallsDiagonal.set(chunk, tile, 0);
                this.wallsRoof.set(chunk, tile, 0);
                this.tileDecoration.set(chunk, tile, 0);

                if (plane == 0) {
                    this.tileDecoration.set(chunk, tile, -6);
                }

                if (plane == 3) {
                    this.tileDecoration.set(chunk, tile, 8);
                }

                this.tileDirection.set(chunk, tile, 0);
            }
        }
    }

    method404(x: i32, y: i32, k: i32, l: i32): void {
        if (x < 1 || y < 1 || x + k >= REGION_WIDTH || y + l >= REGION_HEIGHT) {
            return;
        }

        for (let xx = x; xx <= x + k; xx++) {
            for (let yy = y; yy <= y + l; yy++) {
                if (
                    (this.getObjectAdjacency(xx, yy) & 0x63) != 0 ||
                    (this.getObjectAdjacency(xx - 1, yy) & 0x59) != 0 ||
                    (this.getObjectAdjacency(xx, yy - 1) & 0x56) != 0 ||
                    (this.getObjectAdjacency(xx - 1, yy - 1) & 0x6c) != 0
                ) {
                    this.method425(xx, yy, 35);
                } else {
                    this.method425(xx, yy, 0);
                }
            }
        }
    }

    getObjectAdjacency(x: i32, y: i32): i32 {
        if (x < 0 || y < 0 || x >= REGION_WIDTH || y >= REGION_HEIGHT) {
            return 0;
        }

        return this.objectAdjacency.get(x, y);
    }

    hasRoof(x: i32, y: i32): bool {
        return (
            this.getWallRoof(x, y) > 0 &&
            this.getWallRoof(x - 1, y) > 0 &&
            this.getWallRoof(x - 1, y - 1) > 0 &&
            this.getWallRoof(x, y - 1) > 0
        );
    }

    method407(i: i32, j: i32, k: i32): void {
        const adjacency = this.objectAdjacency.get(i, j);
        this.objectAdjacency.set(i, j, adjacency & (0xffff - k));
    }

    getTerrainColour(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let byte0: i8 = 0;

        if (x >= 48 && y < 48) {
            byte0 = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            byte0 = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            byte0 = 3;
            x -= 48;
            y -= 48;
        }

        return this.terrainColour.get(byte0, x * 48 + y) & 0xff;
    }

    reset(): void {
        if (this.worldInitialised) {
            this.scene.dispose();
        }

        for (let i = 0; i < 64; i++) {
            //this.terrainModels[i] = null;

            for (let j = 0; j < 4; j++) {
                //this.wallModels[j][i] = null;
            }

            for (let j = 0; j < 4; j++) {
                //this.roofModels[j][i] = null;
            }
        }
    }

    setTiles(): void {
        for (let x = 0; x < REGION_WIDTH; x++) {
            for (let y = 0; y < REGION_HEIGHT; y++) {
                if (this._getTileDecoration_from2(x, y) == 250) {
                    if (
                        x == 47 &&
                        this._getTileDecoration_from2(x + 1, y) != 250 &&
                        this._getTileDecoration_from2(x + 1, y) != 2
                    ) {
                        this.setTileDecoration(x, y, 9);
                    } else if (
                        y == 47 &&
                        this._getTileDecoration_from2(x, y + 1) != 250 &&
                        this._getTileDecoration_from2(x, y + 1) != 2
                    ) {
                        this.setTileDecoration(x, y, 9);
                    } else {
                        this.setTileDecoration(x, y, 2);
                    }
                }
            }
        }
    }

    getWallNorthSouth(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        return this.wallsNorthSouth.get(h, x * 48 + y) & 0xff;
    }

    getTileDirection(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        return this.tileDirection.get(h, x * 48 + y);
    }

    _getTileDecoration_from4(x: i32, y: i32, _: i32, fallback: i32): i32 {
        const decoration = this._getTileDecoration_from2(x, y);

        if (decoration == 0) {
            return fallback;
        } else {
            return GameData.tileDecoration[decoration - 1];
        }
    }

    _getTileDecoration_from2(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        return this.tileDecoration.get(h, x * 48 + y) & 0xff;
    }

    _getTileDecoration_from3(x: i32, y: i32, _: i32): i32 {
        return this._getTileDecoration_from2(x, y);
    }

    setTileDecoration(x: i32, y: i32, value: i32): void {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return;
        }

        let h = 0;

        if (x >= 48 && y < 48) {
            h = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            h = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            h = 3;
            x -= 48;
            y -= 48;
        }

        this.tileDecoration.set(h, x * 48 + y, value & 0xff);
    }

    route(
        startX: i32,
        startY: i32,
        endX1: i32,
        endY1: i32,
        endX2: i32,
        endY2: i32,
        routeX: Int32Array,
        routeY: Int32Array,
        objects: bool
    ): i32 {
        for (let x = 0; x < REGION_WIDTH; x++) {
            for (let y = 0; y < REGION_HEIGHT; y++) {
                this.routeVia.set(x, y, 0);
            }
        }

        let writePtr = 0;
        let readPtr = 0;
        let x = startX;
        let y = startY;

        this.routeVia.set(startX, startY, 99);

        unchecked((routeX[writePtr] = startX));
        unchecked((routeY[writePtr++] = startY));

        let size = routeX.length;
        let reached = false;

        while (readPtr != writePtr) {
            x = unchecked(routeX[readPtr]);
            y = unchecked(routeY[readPtr]);
            readPtr = (readPtr + 1) % size;

            if (x >= endX1 && x <= endX2 && y >= endY1 && y <= endY2) {
                reached = true;
                break;
            }

            if (objects) {
                if (
                    x > 0 &&
                    x - 1 >= endX1 &&
                    x - 1 <= endX2 &&
                    y >= endY1 &&
                    y <= endY2 &&
                    (this.objectAdjacency.get(x - 1, y) & 8) == 0
                ) {
                    reached = true;
                    break;
                }

                if (
                    x < 95 &&
                    x + 1 >= endX1 &&
                    x + 1 <= endX2 &&
                    y >= endY1 &&
                    y <= endY2 &&
                    (this.objectAdjacency.get(x + 1, y) & 2) == 0
                ) {
                    reached = true;
                    break;
                }

                if (
                    y > 0 &&
                    x >= endX1 &&
                    x <= endX2 &&
                    y - 1 >= endY1 &&
                    y - 1 <= endY2 &&
                    (this.objectAdjacency.get(x, y - 1) & 4) == 0
                ) {
                    reached = true;
                    break;
                }

                if (
                    y < 95 &&
                    x >= endX1 &&
                    x <= endX2 &&
                    y + 1 >= endY1 &&
                    y + 1 <= endY2 &&
                    (this.objectAdjacency.get(x, y + 1) & 1) == 0
                ) {
                    reached = true;
                    break;
                }
            }

            if (
                x > 0 &&
                this.routeVia.get(x - 1, y) == 0 &&
                (this.objectAdjacency.get(x - 1, y) & 0x78) == 0
            ) {
                unchecked((routeX[writePtr] = x - 1));
                unchecked((routeY[writePtr] = y));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x - 1, y, 2);
            }

            if (
                x < 95 &&
                this.routeVia.get(x + 1, y) == 0 &&
                (this.objectAdjacency.get(x + 1, y) & 0x72) == 0
            ) {
                unchecked((routeX[writePtr] = x + 1));
                unchecked((routeY[writePtr] = y));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x + 1, y, 8);
            }

            if (
                y > 0 &&
                this.routeVia.get(x, y - 1) == 0 &&
                (this.objectAdjacency.get(x, y - 1) & 0x74) == 0
            ) {
                unchecked((routeX[writePtr] = x));
                unchecked((routeY[writePtr] = y - 1));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x, y - 1, 1);
            }

            if (
                y < 95 &&
                this.routeVia.get(x, y + 1) == 0 &&
                (this.objectAdjacency.get(x, y + 1) & 0x71) == 0
            ) {
                unchecked((routeX[writePtr] = x));
                unchecked((routeY[writePtr] = y + 1));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x, y + 1, 4);
            }

            if (
                x > 0 &&
                y > 0 &&
                (this.objectAdjacency.get(x, y - 1) & 0x74) == 0 &&
                (this.objectAdjacency.get(x - 1, y) & 0x78) == 0 &&
                (this.objectAdjacency.get(x - 1, y - 1) & 0x7c) == 0 &&
                this.routeVia.get(x - 1, y - 1) == 0
            ) {
                unchecked((routeX[writePtr] = x - 1));
                unchecked((routeY[writePtr] = y - 1));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x - 1, y - 1, 3);
            }

            if (
                x < 95 &&
                y > 0 &&
                (this.objectAdjacency.get(x, y - 1) & 0x74) == 0 &&
                (this.objectAdjacency.get(x + 1, y) & 0x72) == 0 &&
                (this.objectAdjacency.get(x + 1, y - 1) & 0x76) == 0 &&
                this.routeVia.get(x + 1, y - 1) == 0
            ) {
                unchecked((routeX[writePtr] = x + 1));
                unchecked((routeY[writePtr] = y - 1));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x + 1, y - 1, 9);
            }

            if (
                x > 0 &&
                y < 95 &&
                (this.objectAdjacency.get(x, y + 1) & 0x71) == 0 &&
                (this.objectAdjacency.get(x - 1, y) & 0x78) == 0 &&
                (this.objectAdjacency.get(x - 1, y + 1) & 0x79) == 0 &&
                this.routeVia.get(x - 1, y + 1) == 0
            ) {
                unchecked((routeX[writePtr] = x - 1));
                unchecked((routeY[writePtr] = y + 1));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x - 1, y + 1, 6);
            }

            if (
                x < 95 &&
                y < 95 &&
                (this.objectAdjacency.get(x, y + 1) & 0x71) == 0 &&
                (this.objectAdjacency.get(x + 1, y) & 0x72) == 0 &&
                (this.objectAdjacency.get(x + 1, y + 1) & 0x73) == 0 &&
                this.routeVia.get(x + 1, y + 1) == 0
            ) {
                unchecked((routeX[writePtr] = x + 1));
                unchecked((routeY[writePtr] = y + 1));
                writePtr = (writePtr + 1) % size;
                this.routeVia.set(x + 1, y + 1, 12);
            }
        }

        if (!reached) {
            return -1;
        }

        readPtr = 0;
        unchecked((routeX[readPtr] = x));
        unchecked((routeY[readPtr++] = y));

        let stride: i32;

        for (
            let step = (stride = this.routeVia.get(x, y));
            x != startX || y != startY;
            step = this.routeVia.get(x, y)
        ) {
            if (step != stride) {
                stride = step;
                unchecked((routeX[readPtr] = x));
                unchecked((routeY[readPtr++] = y));
            }

            if ((step & 2) != 0) {
                x++;
            } else if ((step & 8) != 0) {
                x--;
            }

            if ((step & 1) != 0) {
                y++;
            } else if ((step & 4) != 0) {
                y--;
            }
        }

        return readPtr;
    }

    _setObjectAdjacency_from4(x: i32, y: i32, dir: i32, id: i32): void {
        if (x < 0 || y < 0 || x >= 95 || y >= 95) {
            return;
        }

        if (GameData.wallObjectAdjacent[id] == 1) {
            const adjacency = this.objectAdjacency.get(x, y);

            if (dir == 0) {
                this.objectAdjacency.set(x, y, adjacency | 1);

                if (y > 0) {
                    this._setObjectAdjacency_from3(x, y - 1, 4);
                }
            } else if (dir == 1) {
                this.objectAdjacency.set(x, y, adjacency | 2);

                if (x > 0) {
                    this._setObjectAdjacency_from3(x - 1, y, 8);
                }
            } else if (dir == 2) {
                this.objectAdjacency.set(x, y, adjacency | 0x10);
            } else if (dir == 3) {
                this.objectAdjacency.set(x, y, adjacency | 0x20);
            }

            this.method404(x, y, 1, 1);
        }
    }

    _loadSection_from4(x: i32, y: i32, plane: i32, flag: bool): void {
        let l = ((x + 24) / 48) as i32;
        let i1 = ((y + 24) / 48) as i32;

        this._loadSection_from4I(l - 1, i1 - 1, plane, 0);
        this._loadSection_from4I(l, i1 - 1, plane, 1);
        this._loadSection_from4I(l - 1, i1, plane, 2);
        this._loadSection_from4I(l, i1, plane, 3);

        this.setTiles();

        if (!this.parentModel) {
            this.parentModel = GameModel._from7(
                18688,
                18688,
                true,
                true,
                false,
                false,
                true
            );
        }

        if (flag) {
            this.surface.blackScreen();

            for (let j1 = 0; j1 < REGION_WIDTH; j1++) {
                for (let l1 = 0; l1 < REGION_HEIGHT; l1++) {
                    this.objectAdjacency.set(j1, l1, 0);
                }
            }

            let gameModel = this.parentModel!;
            gameModel.clear();

            for (let j2 = 0; j2 < REGION_WIDTH; j2++) {
                for (let i3 = 0; i3 < REGION_HEIGHT; i3++) {
                    let i4 = -this.getTerrainHeight(j2, i3);

                    if (
                        this._getTileDecoration_from3(j2, i3, plane) > 0 &&
                        GameData.tileType[
                            this._getTileDecoration_from3(j2, i3, plane) - 1
                        ] == 4
                    ) {
                        i4 = 0;
                    }

                    if (
                        this._getTileDecoration_from3(j2 - 1, i3, plane) > 0 &&
                        GameData.tileType[
                            this._getTileDecoration_from3(j2 - 1, i3, plane) - 1
                        ] == 4
                    ) {
                        i4 = 0;
                    }

                    if (
                        this._getTileDecoration_from3(j2, i3 - 1, plane) > 0 &&
                        GameData.tileType[
                            this._getTileDecoration_from3(j2, i3 - 1, plane) - 1
                        ] == 4
                    ) {
                        i4 = 0;
                    }

                    if (
                        this._getTileDecoration_from3(j2 - 1, i3 - 1, plane) >
                            0 &&
                        GameData.tileType[
                            this._getTileDecoration_from3(
                                j2 - 1,
                                i3 - 1,
                                plane
                            ) - 1
                        ] == 4
                    ) {
                        i4 = 0;
                    }

                    let j5 = gameModel.vertexAt(
                        j2 * AN_INT_585,
                        i4,
                        i3 * AN_INT_585
                    );

                    let j7 = ((Math.random() * 10) as i32) - 5;

                    gameModel.setVertexAmbience(j5, j7);
                }
            }

            for (let lx = 0; lx < 95; lx++) {
                for (let ly = 0; ly < 95; ly++) {
                    let colourIndex = this.getTerrainColour(lx, ly);
                    let colour = this.terrainColours[colourIndex];
                    let colour_1 = colour;
                    let colour_2 = colour;
                    let l14 = 0;

                    if (plane == 1 || plane == 2) {
                        colour = COLOUR_TRANSPARENT;
                        colour_1 = COLOUR_TRANSPARENT;
                        colour_2 = COLOUR_TRANSPARENT;
                    }

                    if (this._getTileDecoration_from3(lx, ly, plane) > 0) {
                        let decorationType = this._getTileDecoration_from3(
                            lx,
                            ly,
                            plane
                        );

                        let decorationTileType =
                            GameData.tileType[decorationType - 1];

                        let tileType = this.getTileType(lx, ly, plane);

                        colour = colour_1 =
                            GameData.tileDecoration[decorationType - 1];

                        if (decorationTileType == 4) {
                            colour = 1;
                            colour_1 = 1;

                            if (decorationType == 12) {
                                colour = 31;
                                colour_1 = 31;
                            }
                        }

                        if (decorationTileType == 5) {
                            if (
                                this.getWallDiagonal(lx, ly) > 0 &&
                                this.getWallDiagonal(lx, ly) < 24000
                            ) {
                                if (
                                    this._getTileDecoration_from4(
                                        lx - 1,
                                        ly,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT &&
                                    this._getTileDecoration_from4(
                                        lx,
                                        ly - 1,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT
                                ) {
                                    colour = this._getTileDecoration_from4(
                                        lx - 1,
                                        ly,
                                        plane,
                                        colour_2
                                    );

                                    l14 = 0;
                                } else if (
                                    this._getTileDecoration_from4(
                                        lx + 1,
                                        ly,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT &&
                                    this._getTileDecoration_from4(
                                        lx,
                                        ly + 1,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT
                                ) {
                                    colour_1 = this._getTileDecoration_from4(
                                        lx + 1,
                                        ly,
                                        plane,
                                        colour_2
                                    );

                                    l14 = 0;
                                } else if (
                                    this._getTileDecoration_from4(
                                        lx + 1,
                                        ly,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT &&
                                    this._getTileDecoration_from4(
                                        lx,
                                        ly - 1,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT
                                ) {
                                    colour_1 = this._getTileDecoration_from4(
                                        lx + 1,
                                        ly,
                                        plane,
                                        colour_2
                                    );

                                    l14 = 1;
                                } else if (
                                    this._getTileDecoration_from4(
                                        lx - 1,
                                        ly,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT &&
                                    this._getTileDecoration_from4(
                                        lx,
                                        ly + 1,
                                        plane,
                                        colour_2
                                    ) != COLOUR_TRANSPARENT
                                ) {
                                    colour = this._getTileDecoration_from4(
                                        lx - 1,
                                        ly,
                                        plane,
                                        colour_2
                                    );

                                    l14 = 1;
                                }
                            }
                        } else if (
                            decorationTileType != 2 ||
                            (this.getWallDiagonal(lx, ly) > 0 &&
                                this.getWallDiagonal(lx, ly) < 24000)
                        ) {
                            if (
                                this.getTileType(lx - 1, ly, plane) !=
                                    tileType &&
                                this.getTileType(lx, ly - 1, plane) != tileType
                            ) {
                                colour = colour_2;
                                l14 = 0;
                            } else if (
                                this.getTileType(lx + 1, ly, plane) !=
                                    tileType &&
                                this.getTileType(lx, ly + 1, plane) != tileType
                            ) {
                                colour_1 = colour_2;
                                l14 = 0;
                            } else if (
                                this.getTileType(lx + 1, ly, plane) !=
                                    tileType &&
                                this.getTileType(lx, ly - 1, plane) != tileType
                            ) {
                                colour_1 = colour_2;
                                l14 = 1;
                            } else if (
                                this.getTileType(lx - 1, ly, plane) !=
                                    tileType &&
                                this.getTileType(lx, ly + 1, plane) != tileType
                            ) {
                                colour = colour_2;
                                l14 = 1;
                            }
                        }

                        if (GameData.tileAdjacent[decorationType - 1] != 0) {
                            const adjacency = this.objectAdjacency.get(lx, ly);
                            this.objectAdjacency.set(lx, ly, adjacency | 0x40);
                        }

                        if (GameData.tileType[decorationType - 1] == 2) {
                            const adjacency = this.objectAdjacency.get(lx, ly);
                            this.objectAdjacency.set(lx, ly, adjacency | 0x80);
                        }
                    }

                    this.method402(lx, ly, l14, colour, colour_1);

                    let i17 =
                        this.getTerrainHeight(lx + 1, ly + 1) -
                        this.getTerrainHeight(lx + 1, ly) +
                        this.getTerrainHeight(lx, ly + 1) -
                        this.getTerrainHeight(lx, ly);

                    if (colour != colour_1 || i17 != 0) {
                        let ai = new Int32Array(3);
                        let ai7 = new Int32Array(3);

                        if (l14 == 0) {
                            if (colour != COLOUR_TRANSPARENT) {
                                ai[0] = ly + lx * 96 + 96;
                                ai[1] = ly + lx * 96;
                                ai[2] = ly + lx * 96 + 1;

                                let l21 = gameModel.createFace(
                                    3,
                                    ai,
                                    COLOUR_TRANSPARENT,
                                    colour
                                );

                                this.localX[l21] = lx;
                                this.localY[l21] = ly;

                                gameModel.faceTag![l21] = 0x30d40 + l21;
                            }

                            if (colour_1 != COLOUR_TRANSPARENT) {
                                ai7[0] = ly + lx * 96 + 1;
                                ai7[1] = ly + lx * 96 + 96 + 1;
                                ai7[2] = ly + lx * 96 + 96;

                                let i22 = gameModel.createFace(
                                    3,
                                    ai7,
                                    COLOUR_TRANSPARENT,
                                    colour_1
                                );

                                this.localX[i22] = lx;
                                this.localY[i22] = ly;

                                gameModel.faceTag![i22] = 0x30d40 + i22;
                            }
                        } else {
                            if (colour != COLOUR_TRANSPARENT) {
                                ai[0] = ly + lx * 96 + 1;
                                ai[1] = ly + lx * 96 + 96 + 1;
                                ai[2] = ly + lx * 96;

                                let j22 = gameModel.createFace(
                                    3,
                                    ai,
                                    COLOUR_TRANSPARENT,
                                    colour
                                );

                                this.localX[j22] = lx;
                                this.localY[j22] = ly;

                                gameModel.faceTag![j22] = 0x30d40 + j22;
                            }

                            if (colour_1 != COLOUR_TRANSPARENT) {
                                ai7[0] = ly + lx * 96 + 96;
                                ai7[1] = ly + lx * 96;
                                ai7[2] = ly + lx * 96 + 96 + 1;

                                let k22 = gameModel.createFace(
                                    3,
                                    ai7,
                                    COLOUR_TRANSPARENT,
                                    colour_1
                                );

                                this.localX[k22] = lx;
                                this.localY[k22] = ly;

                                gameModel.faceTag![k22] = 0x30d40 + k22;
                            }
                        }
                    } else if (colour != COLOUR_TRANSPARENT) {
                        let ai1 = new Int32Array(4);
                        ai1[0] = ly + lx * 96 + 96;
                        ai1[1] = ly + lx * 96;
                        ai1[2] = ly + lx * 96 + 1;
                        ai1[3] = ly + lx * 96 + 96 + 1;

                        let l19 = gameModel.createFace(
                            4,
                            ai1,
                            COLOUR_TRANSPARENT,
                            colour
                        );

                        this.localX[l19] = lx;
                        this.localY[l19] = ly;

                        gameModel.faceTag![l19] = 0x30d40 + l19;
                    }
                }
            }

            for (let k4 = 1; k4 < 95; k4++) {
                for (let i6 = 1; i6 < 95; i6++) {
                    if (
                        this._getTileDecoration_from3(k4, i6, plane) > 0 &&
                        GameData.tileType[
                            this._getTileDecoration_from3(k4, i6, plane) - 1
                        ] == 4
                    ) {
                        let l7 =
                            GameData.tileDecoration[
                                this._getTileDecoration_from3(k4, i6, plane) - 1
                            ];

                        let j10 = gameModel.vertexAt(
                            k4 * AN_INT_585,
                            -this.getTerrainHeight(k4, i6),
                            i6 * AN_INT_585
                        );

                        let l12 = gameModel.vertexAt(
                            (k4 + 1) * AN_INT_585,
                            -this.getTerrainHeight(k4 + 1, i6),
                            i6 * AN_INT_585
                        );

                        let i15 = gameModel.vertexAt(
                            (k4 + 1) * AN_INT_585,
                            -this.getTerrainHeight(k4 + 1, i6 + 1),
                            (i6 + 1) * AN_INT_585
                        );

                        let j17 = gameModel.vertexAt(
                            k4 * AN_INT_585,
                            -this.getTerrainHeight(k4, i6 + 1),
                            (i6 + 1) * AN_INT_585
                        );

                        let ai2 = new Int32Array(4);
                        ai2[0] = j10;
                        ai2[1] = l12;
                        ai2[2] = i15;
                        ai2[3] = j17;

                        let i20 = gameModel.createFace(
                            4,
                            ai2,
                            l7,
                            COLOUR_TRANSPARENT
                        );

                        this.localX[i20] = k4;
                        this.localY[i20] = i6;
                        gameModel.faceTag![i20] = 0x30d40 + i20;

                        this.method402(k4, i6, 0, l7, l7);
                    } else if (
                        this._getTileDecoration_from3(k4, i6, plane) == 0 ||
                        GameData.tileType[
                            this._getTileDecoration_from3(k4, i6, plane) - 1
                        ] != 3
                    ) {
                        if (
                            this._getTileDecoration_from3(k4, i6 + 1, plane) >
                                0 &&
                            GameData.tileType[
                                this._getTileDecoration_from3(
                                    k4,
                                    i6 + 1,
                                    plane
                                ) - 1
                            ] == 4
                        ) {
                            let i8 =
                                GameData.tileDecoration[
                                    this._getTileDecoration_from3(
                                        k4,
                                        i6 + 1,
                                        plane
                                    ) - 1
                                ];

                            let k10 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6),
                                i6 * AN_INT_585
                            );

                            let i13 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6),
                                i6 * AN_INT_585
                            );

                            let j15 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let k17 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let ai3 = new Int32Array(4);
                            ai3[0] = k10;
                            ai3[1] = i13;
                            ai3[2] = j15;
                            ai3[3] = k17;

                            let j20 = gameModel.createFace(
                                4,
                                ai3,
                                i8,
                                COLOUR_TRANSPARENT
                            );

                            this.localX[j20] = k4;
                            this.localY[j20] = i6;
                            gameModel.faceTag![j20] = 0x30d40 + j20;

                            this.method402(k4, i6, 0, i8, i8);
                        }

                        if (
                            this._getTileDecoration_from3(k4, i6 - 1, plane) >
                                0 &&
                            GameData.tileType[
                                this._getTileDecoration_from3(
                                    k4,
                                    i6 - 1,
                                    plane
                                ) - 1
                            ] == 4
                        ) {
                            let j8 =
                                GameData.tileDecoration[
                                    this._getTileDecoration_from3(
                                        k4,
                                        i6 - 1,
                                        plane
                                    ) - 1
                                ];

                            let l10 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6),
                                i6 * AN_INT_585
                            );

                            let j13 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6),
                                i6 * AN_INT_585
                            );

                            let k15 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let l17 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let ai4 = new Int32Array(4);
                            ai4[0] = l10;
                            ai4[1] = j13;
                            ai4[2] = k15;
                            ai4[3] = l17;

                            let k20 = gameModel.createFace(
                                4,
                                ai4,
                                j8,
                                COLOUR_TRANSPARENT
                            );

                            this.localX[k20] = k4;
                            this.localY[k20] = i6;
                            gameModel.faceTag![k20] = 0x30d40 + k20;

                            this.method402(k4, i6, 0, j8, j8);
                        }

                        if (
                            this._getTileDecoration_from3(k4 + 1, i6, plane) >
                                0 &&
                            GameData.tileType[
                                this._getTileDecoration_from3(
                                    k4 + 1,
                                    i6,
                                    plane
                                ) - 1
                            ] == 4
                        ) {
                            let k8 =
                                GameData.tileDecoration[
                                    this._getTileDecoration_from3(
                                        k4 + 1,
                                        i6,
                                        plane
                                    ) - 1
                                ];

                            let i11 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6),
                                i6 * AN_INT_585
                            );

                            let k13 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6),
                                i6 * AN_INT_585
                            );

                            let l15 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let i18 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let ai5 = new Int32Array(4);
                            ai5[0] = i11;
                            ai5[1] = k13;
                            ai5[2] = l15;
                            ai5[3] = i18;

                            let l20 = gameModel.createFace(
                                4,
                                ai5,
                                k8,
                                COLOUR_TRANSPARENT
                            );

                            this.localX[l20] = k4;
                            this.localY[l20] = i6;
                            gameModel.faceTag![l20] = 0x30d40 + l20;

                            this.method402(k4, i6, 0, k8, k8);
                        }

                        if (
                            this._getTileDecoration_from3(k4 - 1, i6, plane) >
                                0 &&
                            GameData.tileType[
                                this._getTileDecoration_from3(
                                    k4 - 1,
                                    i6,
                                    plane
                                ) - 1
                            ] == 4
                        ) {
                            let l8 =
                                GameData.tileDecoration[
                                    this._getTileDecoration_from3(
                                        k4 - 1,
                                        i6,
                                        plane
                                    ) - 1
                                ];

                            let j11 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6),
                                i6 * AN_INT_585
                            );

                            let l13 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6),
                                i6 * AN_INT_585
                            );

                            let i16 = gameModel.vertexAt(
                                (k4 + 1) * AN_INT_585,
                                -this.getTerrainHeight(k4 + 1, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let j18 = gameModel.vertexAt(
                                k4 * AN_INT_585,
                                -this.getTerrainHeight(k4, i6 + 1),
                                (i6 + 1) * AN_INT_585
                            );

                            let ai6 = new Int32Array(4);
                            ai6[0] = j11;
                            ai6[1] = l13;
                            ai6[2] = i16;
                            ai6[3] = j18;

                            let i21 = gameModel.createFace(
                                4,
                                ai6,
                                l8,
                                COLOUR_TRANSPARENT
                            );

                            this.localX[i21] = k4;
                            this.localY[i21] = i6;
                            gameModel.faceTag![i21] = 0x30d40 + i21;

                            this.method402(k4, i6, 0, l8, l8);
                        }
                    }
                }
            }

            gameModel._setLight_from6(true, 40, 48, -50, -10, -50);

            this.terrainModels = this.parentModel!.split(
                0,
                0,
                1536,
                1536,
                8,
                64,
                233,
                false
            );

            for (let j6 = 0; j6 < 64; j6++) {
                this.scene.addModel(this.terrainModels[j6]!);
            }

            for (let X = 0; X < REGION_WIDTH; X++) {
                for (let Y = 0; Y < REGION_HEIGHT; Y++) {
                    this.terrainHeightLocal.set(
                        X,
                        Y,
                        this.getTerrainHeight(X, Y)
                    );
                }
            }
        }

        this.parentModel!.clear();

        let k1 = 0x606060;

        for (let i2 = 0; i2 < 95; i2++) {
            for (let k2 = 0; k2 < 95; k2++) {
                let k3 = this.getWallEastWest(i2, k2);

                if (
                    k3 > 0 &&
                    (GameData.wallObjectInvisible[k3 - 1] == 0 ||
                        this.aBoolean592)
                ) {
                    this.method422(
                        this.parentModel!,
                        k3 - 1,
                        i2,
                        k2,
                        i2 + 1,
                        k2
                    );

                    if (flag && GameData.wallObjectAdjacent[k3 - 1] != 0) {
                        const adjacency = this.objectAdjacency.get(i2, k2);
                        this.objectAdjacency.set(i2, k2, adjacency | 1);

                        if (k2 > 0) {
                            this._setObjectAdjacency_from3(i2, k2 - 1, 4);
                        }
                    }

                    if (flag) {
                        this.surface.drawLineHoriz(i2 * 3, k2 * 3, 3, k1);
                    }
                }

                k3 = this.getWallNorthSouth(i2, k2);

                if (
                    k3 > 0 &&
                    (GameData.wallObjectInvisible[k3 - 1] == 0 ||
                        this.aBoolean592)
                ) {
                    this.method422(
                        this.parentModel!,
                        k3 - 1,
                        i2,
                        k2,
                        i2,
                        k2 + 1
                    );

                    if (flag && GameData.wallObjectAdjacent[k3 - 1] != 0) {
                        const adjacency = this.objectAdjacency.get(i2, k2);
                        this.objectAdjacency.set(i2, k2, adjacency | 2);

                        if (i2 > 0) {
                            this._setObjectAdjacency_from3(i2 - 1, k2, 8);
                        }
                    }

                    if (flag) {
                        this.surface.drawLineVert(i2 * 3, k2 * 3, 3, k1);
                    }
                }

                k3 = this.getWallDiagonal(i2, k2);

                if (
                    k3 > 0 &&
                    k3 < 12000 &&
                    (GameData.wallObjectInvisible[k3 - 1] == 0 ||
                        this.aBoolean592)
                ) {
                    this.method422(
                        this.parentModel!,
                        k3 - 1,
                        i2,
                        k2,
                        i2 + 1,
                        k2 + 1
                    );

                    if (flag && GameData.wallObjectAdjacent[k3 - 1] != 0) {
                        const adjacency = this.objectAdjacency.get(i2, k2);
                        this.objectAdjacency.set(i2, k2, adjacency | 0x20);
                    }

                    if (flag) {
                        this.surface.setPixel(i2 * 3, k2 * 3, k1);
                        this.surface.setPixel(i2 * 3 + 1, k2 * 3 + 1, k1);
                        this.surface.setPixel(i2 * 3 + 2, k2 * 3 + 2, k1);
                    }
                }

                if (
                    k3 > 12000 &&
                    k3 < 24000 &&
                    (GameData.wallObjectInvisible[k3 - 12001] == 0 ||
                        this.aBoolean592)
                ) {
                    this.method422(
                        this.parentModel!,
                        k3 - 12001,
                        i2 + 1,
                        k2,
                        i2,
                        k2 + 1
                    );

                    if (flag && GameData.wallObjectAdjacent[k3 - 12001] != 0) {
                        const adjacency = this.objectAdjacency.get(i2, k2);
                        this.objectAdjacency.set(i2, k2, adjacency | 0x10);
                    }

                    if (flag) {
                        this.surface.setPixel(i2 * 3 + 2, k2 * 3, k1);
                        this.surface.setPixel(i2 * 3 + 1, k2 * 3 + 1, k1);
                        this.surface.setPixel(i2 * 3, k2 * 3 + 2, k1);
                    }
                }
            }
        }

        if (flag) {
            this.surface.drawSpriteMinimap(
                this.baseMediaSprite - 1,
                0,
                0,
                285,
                285
            );
        }

        this.parentModel!._setLight_from6(false, 60, 24, -50, -10, -50);

        this.wallModels[plane] = this.parentModel!.split(
            0,
            0,
            1536,
            1536,
            8,
            64,
            338,
            true
        );

        for (let l2 = 0; l2 < 64; l2++) {
            this.scene.addModel(this.wallModels[plane][l2]!);
        }

        for (let l3 = 0; l3 < 95; l3++) {
            for (let l4 = 0; l4 < 95; l4++) {
                let k6 = this.getWallEastWest(l3, l4);

                if (k6 > 0) {
                    this.method428(k6 - 1, l3, l4, l3 + 1, l4);
                }

                k6 = this.getWallNorthSouth(l3, l4);

                if (k6 > 0) {
                    this.method428(k6 - 1, l3, l4, l3, l4 + 1);
                }

                k6 = this.getWallDiagonal(l3, l4);

                if (k6 > 0 && k6 < 12000) {
                    this.method428(k6 - 1, l3, l4, l3 + 1, l4 + 1);
                }

                if (k6 > 12000 && k6 < 24000) {
                    this.method428(k6 - 12001, l3 + 1, l4, l3, l4 + 1);
                }
            }
        }

        for (let i5 = 1; i5 < 95; i5++) {
            for (let l6 = 1; l6 < 95; l6++) {
                let j9 = this.getWallRoof(i5, l6);

                if (j9 > 0) {
                    let l11 = i5;
                    let i14 = l6;
                    let j16 = i5 + 1;
                    let k18 = l6;
                    let j19 = i5 + 1;
                    let j21 = l6 + 1;
                    let l22 = i5;
                    let j23 = l6 + 1;
                    let l23 = 0;
                    let j24 = this.terrainHeightLocal.get(l11, i14);
                    let l24 = this.terrainHeightLocal.get(j16, k18);
                    let j25 = this.terrainHeightLocal.get(j19, j21);
                    let l25 = this.terrainHeightLocal.get(l22, j23);

                    if (j24 > 0x13880) {
                        j24 -= 0x13880;
                    }

                    if (l24 > 0x13880) {
                        l24 -= 0x13880;
                    }

                    if (j25 > 0x13880) {
                        j25 -= 0x13880;
                    }

                    if (l25 > 0x13880) {
                        l25 -= 0x13880;
                    }

                    if (j24 > l23) {
                        l23 = j24;
                    }

                    if (l24 > l23) {
                        l23 = l24;
                    }

                    if (j25 > l23) {
                        l23 = j25;
                    }

                    if (l25 > l23) {
                        l23 = l25;
                    }

                    if (l23 >= 0x13880) {
                        l23 -= 0x13880;
                    }

                    if (j24 < 0x13880) {
                        this.terrainHeightLocal.set(l11, i14, l23);
                    } else {
                        const height = this.terrainHeightLocal.get(l11, i14);
                        this.terrainHeightLocal.set(l11, i14, height - 0x13880);
                    }

                    if (l24 < 0x13880) {
                        this.terrainHeightLocal.set(j16, k18, l23);
                    } else {
                        const height = this.terrainHeightLocal.get(j16, k18);
                        this.terrainHeightLocal.set(j16, k18, height - 0x13880);
                    }

                    if (j25 < 0x13880) {
                        this.terrainHeightLocal.set(j19, j21, l23);
                    } else {
                        const height = this.terrainHeightLocal.get(j19, j21);
                        this.terrainHeightLocal.set(j19, j21, height - 0x13880);
                    }

                    if (l25 < 0x13880) {
                        this.terrainHeightLocal.set(l22, j23, l23);
                    } else {
                        const height = this.terrainHeightLocal.get(l22, j23);
                        this.terrainHeightLocal.set(l22, j23, height - 0x13880);
                    }
                }
            }
        }

        this.parentModel!.clear();

        for (let i7 = 1; i7 < 95; i7++) {
            for (let k9 = 1; k9 < 95; k9++) {
                let roofNvs = this.getWallRoof(i7, k9);

                if (roofNvs > 0) {
                    let j14 = i7;
                    let k16 = k9;
                    let l18 = i7 + 1;
                    let k19 = k9;
                    let k21 = i7 + 1;
                    let i23 = k9 + 1;
                    let k23 = i7;
                    let i24 = k9 + 1;
                    let k24 = i7 * AN_INT_585;
                    let i25 = k9 * AN_INT_585;
                    let k25 = k24 + AN_INT_585;
                    let i26 = i25 + AN_INT_585;
                    let j26 = k24;
                    let k26 = i25;
                    let l26 = k25;
                    let i27 = i26;
                    let j27 = this.terrainHeightLocal.get(j14, k16);
                    let k27 = this.terrainHeightLocal.get(l18, k19);
                    let l27 = this.terrainHeightLocal.get(k21, i23);
                    let i28 = this.terrainHeightLocal.get(k23, i24);
                    let unknown = unchecked(GameData.roofHeight[roofNvs - 1]);

                    if (this.hasRoof(j14, k16) && j27 < 0x13880) {
                        j27 += unknown + 0x13880;
                        this.terrainHeightLocal.set(j14, k16, j27);
                    }

                    if (this.hasRoof(l18, k19) && k27 < 0x13880) {
                        k27 += unknown + 0x13880;
                        this.terrainHeightLocal.set(l18, k19, k27);
                    }

                    if (this.hasRoof(k21, i23) && l27 < 0x13880) {
                        l27 += unknown + 0x13880;
                        this.terrainHeightLocal.set(k21, i23, l27);
                    }

                    if (this.hasRoof(k23, i24) && i28 < 0x13880) {
                        i28 += unknown + 0x13880;
                        this.terrainHeightLocal.set(k23, i24, i28);
                    }

                    if (j27 >= 0x13880) {
                        j27 -= 0x13880;
                    }

                    if (k27 >= 0x13880) {
                        k27 -= 0x13880;
                    }

                    if (l27 >= 0x13880) {
                        l27 -= 0x13880;
                    }

                    if (i28 >= 0x13880) {
                        i28 -= 0x13880;
                    }

                    let byte0 = 16;

                    if (!this.method427(j14 - 1, k16)) {
                        k24 -= byte0;
                    }

                    if (!this.method427(j14 + 1, k16)) {
                        k24 += byte0;
                    }

                    if (!this.method427(j14, k16 - 1)) {
                        i25 -= byte0;
                    }

                    if (!this.method427(j14, k16 + 1)) {
                        i25 += byte0;
                    }

                    if (!this.method427(l18 - 1, k19)) {
                        k25 -= byte0;
                    }

                    if (!this.method427(l18 + 1, k19)) {
                        k25 += byte0;
                    }

                    if (!this.method427(l18, k19 - 1)) {
                        k26 -= byte0;
                    }

                    if (!this.method427(l18, k19 + 1)) {
                        k26 += byte0;
                    }

                    if (!this.method427(k21 - 1, i23)) {
                        l26 -= byte0;
                    }

                    if (!this.method427(k21 + 1, i23)) {
                        l26 += byte0;
                    }

                    if (!this.method427(k21, i23 - 1)) {
                        i26 -= byte0;
                    }

                    if (!this.method427(k21, i23 + 1)) {
                        i26 += byte0;
                    }

                    if (!this.method427(k23 - 1, i24)) {
                        j26 -= byte0;
                    }

                    if (!this.method427(k23 + 1, i24)) {
                        j26 += byte0;
                    }

                    if (!this.method427(k23, i24 - 1)) {
                        i27 -= byte0;
                    }

                    if (!this.method427(k23, i24 + 1)) {
                        i27 += byte0;
                    }

                    roofNvs = unchecked(GameData.roofNumVertices[roofNvs - 1]);
                    j27 = -j27;
                    k27 = -k27;
                    l27 = -l27;
                    i28 = -i28;

                    if (
                        this.getWallDiagonal(i7, k9) > 12000 &&
                        this.getWallDiagonal(i7, k9) < 24000 &&
                        this.getWallRoof(i7 - 1, k9 - 1) == 0
                    ) {
                        let ai8 = new Int32Array(3);

                        unchecked(
                            (ai8[0] = this.parentModel!.vertexAt(l26, l27, i26))
                        );

                        unchecked(
                            (ai8[1] = this.parentModel!.vertexAt(j26, i28, i27))
                        );

                        unchecked(
                            (ai8[2] = this.parentModel!.vertexAt(k25, k27, k26))
                        );

                        this.parentModel!.createFace(
                            3,
                            ai8,
                            roofNvs,
                            COLOUR_TRANSPARENT
                        );
                    } else if (
                        this.getWallDiagonal(i7, k9) > 12000 &&
                        this.getWallDiagonal(i7, k9) < 24000 &&
                        this.getWallRoof(i7 + 1, k9 + 1) == 0
                    ) {
                        let ai9 = new Int32Array(3);

                        unchecked(
                            (ai9[0] = this.parentModel!.vertexAt(k24, j27, i25))
                        );
                        unchecked(
                            (ai9[1] = this.parentModel!.vertexAt(k25, k27, k26))
                        );
                        unchecked(
                            (ai9[2] = this.parentModel!.vertexAt(j26, i28, i27))
                        );

                        this.parentModel!.createFace(
                            3,
                            ai9,
                            roofNvs,
                            COLOUR_TRANSPARENT
                        );
                    } else if (
                        this.getWallDiagonal(i7, k9) > 0 &&
                        this.getWallDiagonal(i7, k9) < 12000 &&
                        this.getWallRoof(i7 + 1, k9 - 1) == 0
                    ) {
                        let ai10 = new Int32Array(3);

                        unchecked(
                            (ai10[0] = this.parentModel!.vertexAt(
                                j26,
                                i28,
                                i27
                            ))
                        );
                        unchecked(
                            (ai10[1] = this.parentModel!.vertexAt(
                                k24,
                                j27,
                                i25
                            ))
                        );
                        unchecked(
                            (ai10[2] = this.parentModel!.vertexAt(
                                l26,
                                l27,
                                i26
                            ))
                        );

                        this.parentModel!.createFace(
                            3,
                            ai10,
                            roofNvs,
                            COLOUR_TRANSPARENT
                        );
                    } else if (
                        this.getWallDiagonal(i7, k9) > 0 &&
                        this.getWallDiagonal(i7, k9) < 12000 &&
                        this.getWallRoof(i7 - 1, k9 + 1) == 0
                    ) {
                        let ai11 = new Int32Array(3);

                        unchecked(
                            (ai11[0] = this.parentModel!.vertexAt(
                                k25,
                                k27,
                                k26
                            ))
                        );
                        unchecked(
                            (ai11[1] = this.parentModel!.vertexAt(
                                l26,
                                l27,
                                i26
                            ))
                        );
                        unchecked(
                            (ai11[2] = this.parentModel!.vertexAt(
                                k24,
                                j27,
                                i25
                            ))
                        );

                        this.parentModel!.createFace(
                            3,
                            ai11,
                            roofNvs,
                            COLOUR_TRANSPARENT
                        );
                    } else if (j27 == k27 && l27 == i28) {
                        let ai12 = new Int32Array(4);

                        unchecked(
                            (ai12[0] = this.parentModel!.vertexAt(
                                k24,
                                j27,
                                i25
                            ))
                        );
                        unchecked(
                            (ai12[1] = this.parentModel!.vertexAt(
                                k25,
                                k27,
                                k26
                            ))
                        );
                        unchecked(
                            (ai12[2] = this.parentModel!.vertexAt(
                                l26,
                                l27,
                                i26
                            ))
                        );
                        unchecked(
                            (ai12[3] = this.parentModel!.vertexAt(
                                j26,
                                i28,
                                i27
                            ))
                        );

                        this.parentModel!.createFace(
                            4,
                            ai12,
                            roofNvs,
                            COLOUR_TRANSPARENT
                        );
                    } else if (j27 == i28 && k27 == l27) {
                        let ai13 = new Int32Array(4);

                        unchecked(
                            (ai13[0] = this.parentModel!.vertexAt(
                                j26,
                                i28,
                                i27
                            ))
                        );
                        unchecked(
                            (ai13[1] = this.parentModel!.vertexAt(
                                k24,
                                j27,
                                i25
                            ))
                        );
                        unchecked(
                            (ai13[2] = this.parentModel!.vertexAt(
                                k25,
                                k27,
                                k26
                            ))
                        );
                        unchecked(
                            (ai13[3] = this.parentModel!.vertexAt(
                                l26,
                                l27,
                                i26
                            ))
                        );

                        this.parentModel!.createFace(
                            4,
                            ai13,
                            roofNvs,
                            COLOUR_TRANSPARENT
                        );
                    } else {
                        let flag1 = true;

                        if (this.getWallRoof(i7 - 1, k9 - 1) > 0) {
                            flag1 = false;
                        }

                        if (this.getWallRoof(i7 + 1, k9 + 1) > 0) {
                            flag1 = false;
                        }

                        if (!flag1) {
                            let ai14 = new Int32Array(3);

                            unchecked(
                                (ai14[0] = this.parentModel!.vertexAt(
                                    k25,
                                    k27,
                                    k26
                                ))
                            );
                            unchecked(
                                (ai14[1] = this.parentModel!.vertexAt(
                                    l26,
                                    l27,
                                    i26
                                ))
                            );
                            unchecked(
                                (ai14[2] = this.parentModel!.vertexAt(
                                    k24,
                                    j27,
                                    i25
                                ))
                            );

                            this.parentModel!.createFace(
                                3,
                                ai14,
                                roofNvs,
                                COLOUR_TRANSPARENT
                            );

                            let ai16 = new Int32Array(3);

                            unchecked(
                                (ai16[0] = this.parentModel!.vertexAt(
                                    j26,
                                    i28,
                                    i27
                                ))
                            );
                            unchecked(
                                (ai16[1] = this.parentModel!.vertexAt(
                                    k24,
                                    j27,
                                    i25
                                ))
                            );
                            unchecked(
                                (ai16[2] = this.parentModel!.vertexAt(
                                    l26,
                                    l27,
                                    i26
                                ))
                            );

                            this.parentModel!.createFace(
                                3,
                                ai16,
                                roofNvs,
                                COLOUR_TRANSPARENT
                            );
                        } else {
                            let ai15 = new Int32Array(3);

                            unchecked(
                                (ai15[0] = this.parentModel!.vertexAt(
                                    k24,
                                    j27,
                                    i25
                                ))
                            );
                            unchecked(
                                (ai15[1] = this.parentModel!.vertexAt(
                                    k25,
                                    k27,
                                    k26
                                ))
                            );
                            unchecked(
                                (ai15[2] = this.parentModel!.vertexAt(
                                    j26,
                                    i28,
                                    i27
                                ))
                            );

                            this.parentModel!.createFace(
                                3,
                                ai15,
                                roofNvs,
                                COLOUR_TRANSPARENT
                            );

                            let ai17 = new Int32Array(3);

                            unchecked(
                                (ai17[0] = this.parentModel!.vertexAt(
                                    l26,
                                    l27,
                                    i26
                                ))
                            );
                            unchecked(
                                (ai17[1] = this.parentModel!.vertexAt(
                                    j26,
                                    i28,
                                    i27
                                ))
                            );
                            unchecked(
                                (ai17[2] = this.parentModel!.vertexAt(
                                    k25,
                                    k27,
                                    k26
                                ))
                            );

                            this.parentModel!.createFace(
                                3,
                                ai17,
                                roofNvs,
                                COLOUR_TRANSPARENT
                            );
                        }
                    }
                }
            }
        }

        this.parentModel!._setLight_from6(true, 50, 50, -50, -10, -50);

        this.roofModels[plane] = this.parentModel!.split(
            0,
            0,
            1536,
            1536,
            8,
            64,
            169,
            true
        );

        for (let l9 = 0; l9 < 64; l9++) {
            this.scene.addModel(this.roofModels[plane][l9]!);
        }

        for (let j12 = 0; j12 < REGION_WIDTH; j12++) {
            for (let k14 = 0; k14 < REGION_HEIGHT; k14++) {
                if (this.terrainHeightLocal.get(j12, k14) >= 0x13880) {
                    const height = this.terrainHeightLocal.get(j12, k14);
                    this.terrainHeightLocal.set(j12, k14, height - 0x13880);
                }
            }
        }
    }

    _setObjectAdjacency_from3(x: i32, y: i32, value: i32): void {
        const adjacency = this.objectAdjacency.get(x, y);
        this.objectAdjacency.set(x, y, adjacency | value);
    }

    getTileType(i: i32, j: i32, k: i32): i32 {
        const decoration = this._getTileDecoration_from3(i, j, k);

        if (decoration == 0) {
            return -1;
        }

        const type = unchecked(GameData.tileType[decoration - 1]);

        return type != 2 ? 0 : 1;
    }

    addModels(models: StaticArray<GameModel|null>): void {
        for (let i = 0; i < 94; i++) {
            for (let j = 0; j < 94; j++) {
                if (
                    this.getWallDiagonal(i, j) > 48000 &&
                    this.getWallDiagonal(i, j) < 60000
                ) {
                    let k = this.getWallDiagonal(i, j) - 48001;
                    let l = this.getTileDirection(i, j);
                    let i1 = 0;
                    let j1 = 0;

                    if (l == 0 || l == 4) {
                        i1 = unchecked(GameData.objectWidth[k]);
                        j1 = unchecked(GameData.objectHeight[k]);
                    } else {
                        j1 = unchecked(GameData.objectWidth[k]);
                        i1 = unchecked(GameData.objectHeight[k]);
                    }

                    this.removeObject2(i, j, k);

                    let gameModel = unchecked(
                        models[GameData.objectModelIndex[k]]!
                    )._copy_from4(false, true, false, false);

                    let k1 = (((i + i + i1) * AN_INT_585) / 2) as i32;
                    let i2 = (((j + j + j1) * AN_INT_585) / 2) as i32;

                    gameModel.translate(k1, -this.getElevation(k1, i2), i2);
                    gameModel.orient(0, this.getTileDirection(i, j) * 32, 0);
                    this.scene.addModel(gameModel);
                    gameModel._setLight_from5(48, 48, -50, -10, -50);

                    if (i1 > 1 || j1 > 1) {
                        for (let k2 = i; k2 < i + i1; k2++) {
                            for (let l2 = j; l2 < j + j1; l2++) {
                                if (
                                    (k2 > i || l2 > j) &&
                                    this.getWallDiagonal(k2, l2) - 48001 == k
                                ) {
                                    let l1 = k2;
                                    let j2 = l2;
                                    let byte0 = 0;

                                    if (l1 >= 48 && j2 < 48) {
                                        byte0 = 1;
                                        l1 -= 48;
                                    } else if (l1 < 48 && j2 >= 48) {
                                        byte0 = 2;
                                        j2 -= 48;
                                    } else if (l1 >= 48 && j2 >= 48) {
                                        byte0 = 3;
                                        l1 -= 48;
                                        j2 -= 48;
                                    }

                                    this.wallsDiagonal.set(
                                        byte0,
                                        l1 * 48 + j2,
                                        0
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    method422(
        gameModel: GameModel,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32
    ): void {
        this.method425(j, k, 40);
        this.method425(l, i1, 40);

        let h = unchecked(GameData.wallObjectHeight[i]);
        let front = unchecked(GameData.wallObjectTextureFront[i]);
        let back = unchecked(GameData.wallObjectTextureBack[i]);
        let i2 = j * AN_INT_585;
        let j2 = k * AN_INT_585;
        let k2 = l * AN_INT_585;
        let l2 = i1 * AN_INT_585;

        let i3 = gameModel.vertexAt(i2, -this.terrainHeightLocal.get(j, k), j2);

        let j3 = gameModel.vertexAt(
            i2,
            -this.terrainHeightLocal.get(j, k) - h,
            j2
        );

        let k3 = gameModel.vertexAt(
            k2,
            -this.terrainHeightLocal.get(l, i1) - h,
            l2
        );

        let l3 = gameModel.vertexAt(
            k2,
            -this.terrainHeightLocal.get(l, i1),
            l2
        );

        let vertices = new Int32Array(4);
        vertices[0] = i3;
        vertices[1] = j3;
        vertices[2] = k3;
        vertices[3] = l3;

        let i4 = gameModel.createFace(4, vertices, front, back);

        if (GameData.wallObjectInvisible[i] == 5) {
            gameModel.faceTag![i4] = 30000 + i;
        } else {
            gameModel.faceTag![i4] = 0;
        }
    }

    getTerrainHeight(x: i32, y: i32): i32 {
        if (x < 0 || x >= REGION_WIDTH || y < 0 || y >= REGION_HEIGHT) {
            return 0;
        }

        let d = 0;

        if (x >= 48 && y < 48) {
            d = 1;
            x -= 48;
        } else if (x < 48 && y >= 48) {
            d = 2;
            y -= 48;
        } else if (x >= 48 && y >= 48) {
            d = 3;
            x -= 48;
            y -= 48;
        }

        return (this.terrainHeight.get(d, x * 48 + y) & 0xff) * 3;
    }

    _loadSection_from3(x: i32, y: i32, plane: i32): void {
        this.reset();

        let l = ((x + 24) / 48) as i32;
        let i1 = ((y + 24) / 48) as i32;

        this._loadSection_from4(x, y, plane, true);

        if (plane == 0) {
            this._loadSection_from4(x, y, 1, false);
            this._loadSection_from4(x, y, 2, false);
            this._loadSection_from4I(l - 1, i1 - 1, plane, 0);
            this._loadSection_from4I(l, i1 - 1, plane, 1);
            this._loadSection_from4I(l - 1, i1, plane, 2);
            this._loadSection_from4I(l, i1, plane, 3);
            this.setTiles();
        }
    }

    method425(i: i32, j: i32, k: i32): void {
        let l = (i / 12) as i32;
        let i1 = (j / 12) as i32;
        let j1 = ((i - 1) / 12) as i32;
        let k1 = ((j - 1) / 12) as i32;

        this.setTerrainAmbience(l, i1, i, j, k);

        if (l != j1) {
            this.setTerrainAmbience(j1, i1, i, j, k);
        }

        if (i1 != k1) {
            this.setTerrainAmbience(l, k1, i, j, k);
        }

        if (l != j1 && i1 != k1) {
            this.setTerrainAmbience(j1, k1, i, j, k);
        }
    }

    removeObject(x: i32, y: i32, id: i32): void {
        if (x < 0 || y < 0 || x >= 95 || y >= 95) {
            return;
        }

        if (GameData.objectType[id] == 1 || GameData.objectType[id] == 2) {
            let l = this.getTileDirection(x, y);
            let i1 = 0;
            let j1 = 0;

            if (l == 0 || l == 4) {
                i1 = GameData.objectWidth[id];
                j1 = GameData.objectHeight[id];
            } else {
                j1 = GameData.objectWidth[id];
                i1 = GameData.objectHeight[id];
            }

            for (let k1 = x; k1 < x + i1; k1++) {
                for (let l1 = y; l1 < y + j1; l1++) {
                    const adjacency = this.objectAdjacency.get(k1, l1);

                    if (GameData.objectType[id] == 1) {
                        this.objectAdjacency.set(k1, l1, adjacency & 0xffbf);
                    } else if (l == 0) {
                        this.objectAdjacency.set(k1, l1, adjacency & 0xfffd);

                        if (k1 > 0) {
                            this.method407(k1 - 1, l1, 8);
                        }
                    } else if (l == 2) {
                        this.objectAdjacency.set(k1, l1, adjacency & 0xfffb);

                        if (l1 < 95) {
                            this.method407(k1, l1 + 1, 1);
                        }
                    } else if (l == 4) {
                        this.objectAdjacency.set(k1, l1, adjacency & 0xfff7);

                        if (k1 < 95) {
                            this.method407(k1 + 1, l1, 2);
                        }
                    } else if (l == 6) {
                        this.objectAdjacency.set(k1, l1, adjacency & 0xfffe);

                        if (l1 > 0) {
                            this.method407(k1, l1 - 1, 4);
                        }
                    }
                }
            }

            this.method404(x, y, i1, j1);
        }
    }

    method427(x: i32, y: i32): bool {
        return (
            this.getWallRoof(x, y) > 0 ||
            this.getWallRoof(x - 1, y) > 0 ||
            this.getWallRoof(x - 1, y - 1) > 0 ||
            this.getWallRoof(x, y - 1) > 0
        );
    }

    method428(i: i32, j: i32, k: i32, l: i32, i1: i32): void {
        let j1 = GameData.wallObjectHeight[i];

        const height = this.terrainHeightLocal.get(j, k);

        if (height < 0x13880) {
            this.terrainHeightLocal.set(j, k, height + 0x13880 + j1);
        }

        const height2 = this.terrainHeightLocal.get(l, i1);

        if (height2 < 0x13880) {
            this.terrainHeightLocal.set(l, i1, height2 + 0x13880 + j1);
        }
    }
}
