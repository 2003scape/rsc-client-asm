const COLOUR_TRANSPARENT: i32 = 12345678;

export default class GameModel {
    static sine9: Int32Array = new Int32Array(512);
    static sine11: Int32Array = new Int32Array(2048);
    static base64Alphabet: Int32Array = new Int32Array(256);

    numVertices: i32;
    projectVertexX: Int32Array | null;
    projectVertexY: Int32Array | null;
    projectVertexZ: Int32Array | null;
    vertexViewX: Int32Array | null;
    vertexViewY: Int32Array | null;
    vertexIntensity: Int32Array | null;
    vertexAmbience: Int8Array | null;
    numFaces: i32;
    faceNumVertices: Int32Array | null;
    faceVertices: StaticArray<Int32Array> | null;
    faceFillFront: Int32Array | null;
    faceFillBack: Int32Array | null;
    normalMagnitude: Int32Array | null;
    normalScale: Int32Array | null;
    faceIntensity: Int32Array | null;
    faceNormalX: Int32Array | null;
    faceNormalY: Int32Array | null;
    faceNormalZ: Int32Array | null;
    depth: i32;
    transformState: i32 = 1;
    visible: bool = true;
    x1: i32;
    x2: i32;
    y1: i32;
    y2: i32;
    z1: i32;
    z2: i32;
    textureTranslucent: bool;
    transparent: bool;
    key: i32 = -1;
    faceTag: Int32Array | null;
    isLocalPlayer: Int8Array | null;
    isolated: bool;
    unlit: bool;
    unpickable: bool;
    projected: bool;
    maxVerts: i32;
    vertexX: Int32Array | null;
    vertexY: Int32Array | null;
    vertexZ: Int32Array | null;
    vertexTransformedX: Int32Array | null;
    vertexTransformedY: Int32Array | null;
    vertexTransformedZ: Int32Array | null;
    lightDiffuse: i32 = 512;
    lightAmbience: i32 = 32;
    autocommit: bool;
    magic: i32 = COLOUR_TRANSPARENT;
    maxFaces: i32;
    faceTransStateThing: StaticArray<Int32Array> | null;
    faceBoundLeft: Int32Array | null;
    faceBoundRight: Int32Array | null;
    faceBoundBottom: Int32Array | null;
    faceBoundTop: Int32Array | null;
    faceBoundNear: Int32Array | null;
    faceBoundFar: Int32Array | null;
    baseX: i32;
    baseY: i32;
    baseZ: i32;
    orientationYaw: i32;
    orientationPitch: i32;
    orientationRoll: i32;
    scaleFx: i32;
    scaleFy: i32;
    scaleFz: i32;
    shearXy: i32;
    shearXz: i32;
    shearYx: i32;
    shearYz: i32;
    shearZx: i32;
    shearZy: i32;
    transformKind: i32;
    diameter: i32 = COLOUR_TRANSPARENT;
    lightDirectionX: i32 = 180;
    lightDirectionY: i32 = 155;
    lightDirectionZ: i32 = 95;
    lightDirectionMagnitude: i32 = 256;
    dataPtr: i32;

    constructor() {}

    static _from2(numVertices: i32, numFaces: i32): GameModel {
        const gameModel = new GameModel();

        gameModel.allocate(numVertices, numFaces);

        gameModel.faceTransStateThing = new StaticArray<Int32Array>(numFaces);

        for (let i = 0; i < numFaces; i++) {
            gameModel.faceTransStateThing![i] = new Int32Array(1);
        }

        return gameModel;
    }

    static _from2A(pieces: StaticArray<GameModel>, count: i32): GameModel {
        const gameModel = new GameModel();

        gameModel.merge(pieces, count, true);

        return gameModel;
    }

    static _from6(
        pieces: StaticArray<GameModel>,
        count: i32,
        autocommit: bool,
        isolated: bool,
        unlit: bool,
        unpickable: bool
    ): GameModel {
        const gameModel = new GameModel();

        gameModel.autocommit = autocommit;
        gameModel.isolated = isolated;
        gameModel.unlit = unlit;
        gameModel.unpickable = unpickable;

        gameModel.merge(pieces, count, false);

        return gameModel;
    }

    static _from7(
        numVertices: i32,
        numFaces: i32,
        autocommit: bool,
        isolated: bool,
        unlit: bool,
        unpickable: bool,
        projected: bool
    ): GameModel {
        const gameModel = new GameModel();

        gameModel.autocommit = autocommit;
        gameModel.isolated = isolated;
        gameModel.unlit = unlit;
        gameModel.unpickable = unpickable;
        gameModel.projected = projected;

        gameModel.allocate(numVertices, numFaces);

        return gameModel;
    }

    static fromBytes(data: Int8Array, offset: i32): GameModel {
        const gameModel = new GameModel();

        const numVertices = Utility.getUnsignedShort(data, offset);
        offset += 2;

        const numFaces = Utility.getUnsignedShort(data, offset);
        offset += 2;

        gameModel.allocate(numVertices, numFaces);
        gameModel.faceTransStateThing = new StaticArray<Int32Array>(numFaces);

        for (let i = 0; i < numVertices; i++) {
            gameModel.vertexX![i] = Utility.getSignedShort(data, offset);
            offset += 2;
        }

        for (let i = 0; i < numVertices; i++) {
            gameModel.vertexY![i] = Utility.getSignedShort(data, offset);
            offset += 2;
        }

        for (let i = 0; i < numVertices; i++) {
            gameModel.vertexZ![i] = Utility.getSignedShort(data, offset);
            offset += 2;
        }

        gameModel.numVertices = numVertices;

        for (let i = 0; i < numFaces; i++) {
            gameModel.faceNumVertices![i] = data[offset++] & 0xff;
        }

        for (let i = 0; i < numFaces; i++) {
            gameModel.faceFillFront![i] = Utility.getSignedShort(data, offset);
            offset += 2;

            if (gameModel.faceFillFront![i] == 32767) {
                gameModel.faceFillFront![i] = gameModel.magic;
            }
        }

        for (let i = 0; i < numFaces; i++) {
            gameModel.faceFillBack![i] = Utility.getSignedShort(data, offset);
            offset += 2;

            if (gameModel.faceFillBack![i] == 32767) {
                gameModel.faceFillBack![i] = gameModel.magic;
            }
        }

        for (let i = 0; i < numFaces; i++) {
            const isIntense = data[offset++] & 0xff;
            gameModel.faceIntensity![i] = isIntense == 0 ? 0 : gameModel.magic;
        }

        for (let i = 0; i < numFaces; i++) {
            gameModel.faceVertices![i] = new Int32Array(
                gameModel.faceNumVertices![i]
            );

            for (let j = 0; j < gameModel.faceNumVertices![i]; j++) {
                if (j < 256) {
                    gameModel.faceVertices![i][j] = data[offset++] & 0xff;
                } else {
                    gameModel.faceVertices![i][j] = Utility.getUnsignedShort(
                        data,
                        offset
                    );

                    offset += 2;
                }
            }
        }

        gameModel.numFaces = numFaces;

        return gameModel;
    }

    allocate(numVertices: i32, numFaces: i32): void {
        this.vertexX = new Int32Array(numVertices);
        this.vertexY = new Int32Array(numVertices);
        this.vertexZ = new Int32Array(numVertices);
        this.vertexIntensity = new Int32Array(numVertices);
        this.vertexAmbience = new Int8Array(numVertices);
        this.faceNumVertices = new Int32Array(numFaces);
        this.faceVertices = new StaticArray<Int32Array>(numFaces);
        this.faceFillFront = new Int32Array(numFaces);
        this.faceFillBack = new Int32Array(numFaces);
        this.faceIntensity = new Int32Array(numFaces);
        this.normalScale = new Int32Array(numFaces);
        this.normalMagnitude = new Int32Array(numFaces);

        if (!this.projected) {
            this.projectVertexX = new Int32Array(numVertices);
            this.projectVertexY = new Int32Array(numVertices);
            this.projectVertexZ = new Int32Array(numVertices);
            this.vertexViewX = new Int32Array(numVertices);
            this.vertexViewY = new Int32Array(numVertices);
        }

        if (!this.unpickable) {
            this.isLocalPlayer = new Int8Array(numFaces);
            this.faceTag = new Int32Array(numFaces);
        }

        if (this.autocommit) {
            this.vertexTransformedX = this.vertexX;
            this.vertexTransformedY = this.vertexY;
            this.vertexTransformedZ = this.vertexZ;
        } else {
            this.vertexTransformedX = new Int32Array(numVertices);
            this.vertexTransformedY = new Int32Array(numVertices);
            this.vertexTransformedZ = new Int32Array(numVertices);
        }

        if (!this.unlit || !this.isolated) {
            this.faceNormalX = new Int32Array(numFaces);
            this.faceNormalY = new Int32Array(numFaces);
            this.faceNormalZ = new Int32Array(numFaces);
        }

        if (!this.isolated) {
            this.faceBoundLeft = new Int32Array(numFaces);
            this.faceBoundRight = new Int32Array(numFaces);
            this.faceBoundBottom = new Int32Array(numFaces);
            this.faceBoundTop = new Int32Array(numFaces);
            this.faceBoundNear = new Int32Array(numFaces);
            this.faceBoundFar = new Int32Array(numFaces);
        }

        this.numFaces = 0;
        this.numVertices = 0;
        this.maxVerts = numVertices;
        this.maxFaces = numFaces;
        this.baseX = this.baseY = this.baseZ = 0;
        this.orientationYaw = this.orientationPitch = this.orientationRoll = 0;
        this.scaleFx = this.scaleFy = this.scaleFz = 256;
        this.shearXy = this.shearXz = this.shearYx = this.shearYz = this.shearZx = this.shearZy = 256;
        this.transformKind = 0;
    }

    projectionPrepare(): void {
        this.projectVertexX = new Int32Array(this.numVertices);
        this.projectVertexY = new Int32Array(this.numVertices);
        this.projectVertexZ = new Int32Array(this.numVertices);
        this.vertexViewX = new Int32Array(this.numVertices);
        this.vertexViewY = new Int32Array(this.numVertices);
    }

    clear(): void {
        this.numFaces = 0;
        this.numVertices = 0;
    }

    reduce(detlaFaces: i32, deltaVertices: i32): void {
        this.numFaces -= detlaFaces;

        if (this.numFaces < 0) {
            this.numFaces = 0;
        }

        this.numVertices -= deltaVertices;

        if (this.numVertices < 0) {
            this.numVertices = 0;
        }
    }

    merge(pieces: StaticArray<GameModel>, count: i32, transState: bool): void {
        let numFaces = 0;
        let numVertices = 0;

        for (let i = 0; i < count; i++) {
            numFaces += pieces[i].numFaces;
            numVertices += pieces[i].numVertices;
        }

        this.allocate(numVertices, numFaces);

        if (transState) {
            this.faceTransStateThing = new StaticArray<Int32Array>(numFaces);
        }

        for (let i = 0; i < count; i++) {
            let source = pieces[i];
            source.commit();

            this.lightAmbience = source.lightAmbience;
            this.lightDiffuse = source.lightDiffuse;
            this.lightDirectionX = source.lightDirectionX;
            this.lightDirectionY = source.lightDirectionY;
            this.lightDirectionZ = source.lightDirectionZ;
            this.lightDirectionMagnitude = source.lightDirectionMagnitude;

            for (let srcF = 0; srcF < source.numFaces; srcF++) {
                let dstVs = new Int32Array(source.faceNumVertices![srcF]);
                let srcVs = source.faceVertices![srcF];

                for (let v = 0; v < source.faceNumVertices![srcF]; v++) {
                    dstVs[v] = this.vertexAt(
                        source.vertexX![srcVs[v]],
                        source.vertexY![srcVs[v]],
                        source.vertexZ![srcVs[v]]
                    );
                }

                let dstF = this.createFace(
                    source.faceNumVertices![srcF],
                    dstVs,
                    source.faceFillFront![srcF],
                    source.faceFillBack![srcF]
                );

                this.faceIntensity![dstF] = source.faceIntensity![srcF];
                this.normalScale![dstF] = source.normalScale![srcF];
                this.normalMagnitude![dstF] = source.normalMagnitude![srcF];

                if (transState) {
                    if (count > 1) {
                        this.faceTransStateThing![dstF] = new Int32Array(
                            source.faceTransStateThing![srcF].length + 1
                        );

                        this.faceTransStateThing![dstF][0] = i;

                        for (
                            let j = 0;
                            j < source.faceTransStateThing![srcF].length;
                            j++
                        ) {
                            this.faceTransStateThing![dstF][
                                j + 1
                            ] = source.faceTransStateThing![srcF][j];
                        }
                    } else {
                        this.faceTransStateThing![dstF] = new Int32Array(
                            source.faceTransStateThing![srcF].length
                        );

                        for (
                            let j = 0;
                            j < source.faceTransStateThing![srcF].length;
                            j++
                        ) {
                            this.faceTransStateThing![dstF][
                                j
                            ] = source.faceTransStateThing![srcF][j];
                        }
                    }
                }
            }
        }

        this.transformState = 1;
    }

    vertexAt(x: i32, y: i32, z: i32): i32 {
        for (let i = 0; i < this.numVertices; i++) {
            if (
                this.vertexX![i] == x &&
                this.vertexY![i] == y &&
                this.vertexZ![i] == z
            ) {
                return i;
            }
        }

        if (this.numVertices >= this.maxVerts) {
            return -1;
        } else {
            this.vertexX![this.numVertices] = x;
            this.vertexY![this.numVertices] = y;
            this.vertexZ![this.numVertices] = z;

            return this.numVertices++;
        }
    }

    createVertex(x: i32, y: i32, z: i32): i32 {
        if (this.numVertices >= this.maxVerts) {
            return -1;
        } else {
            this.vertexX![this.numVertices] = x;
            this.vertexY![this.numVertices] = y;
            this.vertexZ![this.numVertices] = z;

            return this.numVertices++;
        }
    }

    createFace(number: i32, vertices: Int32Array, front: i32, back: i32): i32 {
        if (this.numFaces >= this.maxFaces) {
            return -1;
        } else {
            this.faceNumVertices![this.numFaces] = number;
            this.faceVertices![this.numFaces] = vertices;
            this.faceFillFront![this.numFaces] = front;
            this.faceFillBack![this.numFaces] = back;
            this.transformState = 1;

            return this.numFaces++;
        }
    }

    split(
        unused1: i32,
        unused2: i32,
        pieceDx: i32,
        pieceDz: i32,
        rows: i32,
        count: i32,
        pieceMaxVertices: i32,
        pickable: bool
    ): Array<GameModel> {
        this.commit();

        let pieceNV = new Int32Array(count);
        let pieceNF = new Int32Array(count);

        for (let i = 0; i < count; i++) {
            pieceNV[i] = 0;
            pieceNF[i] = 0;
        }

        for (let f = 0; f < this.numFaces; f++) {
            let sumX = 0;
            let sumZ = 0;
            let n = this.faceNumVertices![f];
            let vertices = this.faceVertices![f];

            for (let i = 0; i < n; i++) {
                sumX += this.vertexX![vertices[i]];
                sumZ += this.vertexZ![vertices[i]];
            }

            let p =
                ((sumX / (n * pieceDx)) as i32) +
                ((sumZ / (n * pieceDz)) as i32) * rows;

            pieceNV[p] += n;
            pieceNF[p]++;
        }

        let pieces = new Array<GameModel>();

        for (let i = 0; i < count; i++) {
            if (pieceNV[i] > pieceMaxVertices) {
                pieceNV[i] = pieceMaxVertices;
            }

            pieces.push(
                GameModel._from7(
                    pieceNV[i],
                    pieceNF[i],
                    true,
                    true,
                    true,
                    pickable,
                    true
                )
            );

            pieces[i].lightDiffuse = this.lightDiffuse;
            pieces[i].lightAmbience = this.lightAmbience;
        }

        for (let f = 0; f < this.numFaces; f++) {
            let sumX = 0;
            let sumZ = 0;
            let n = this.faceNumVertices![f];
            let vertices = this.faceVertices![f];

            for (let i = 0; i < n; i++) {
                sumX += this.vertexX![vertices[i]];
                sumZ += this.vertexZ![vertices[i]];
            }

            let p =
                ((sumX / (n * pieceDx)) as i32) +
                ((sumZ / (n * pieceDz)) as i32) * rows;

            this.copyLighting(pieces[p], vertices, n, f);
        }

        for (let p = 0; p < count; p++) {
            pieces[p].projectionPrepare();
        }

        return pieces;
    }

    copyLighting(
        model: GameModel,
        srcVertices: Int32Array,
        numVertices: i32,
        inFace: i32
    ): void {
        let destVertices = new Int32Array(numVertices);

        for (let inV = 0; inV < numVertices; inV++) {
            let outV = (destVertices![inV] = model.vertexAt(
                this.vertexX![srcVertices![inV]],
                this.vertexY![srcVertices![inV]],
                this.vertexZ![srcVertices![inV]]
            ));

            model.vertexIntensity![outV] = this.vertexIntensity![
                srcVertices![inV]
            ];

            model.vertexAmbience![outV] = this.vertexAmbience![
                srcVertices![inV]
            ];
        }

        let outFace = model.createFace(
            numVertices,
            destVertices,
            this.faceFillFront![inFace],
            this.faceFillBack![inFace]
        );

        if (!model.unpickable && !this.unpickable) {
            model.faceTag![outFace] = this.faceTag![inFace];
        }

        model.faceIntensity![outFace] = this.faceIntensity![inFace];
        model.normalScale![outFace] = this.normalScale![inFace];
        model.normalMagnitude![outFace] = this.normalMagnitude![inFace];
    }

    _setLight_from5(ambience: i32, diffuse: i32, x: i32, y: i32, z: i32): void {
        this.lightAmbience = 256 - ambience * 4;
        this.lightDiffuse = (64 - diffuse) * 16 + 128;

        if (!this.unlit) {
            this.lightDirectionX = x;
            this.lightDirectionY = y;
            this.lightDirectionZ = z;
            this.lightDirectionMagnitude = Math.sqrt(x * x + y * y + z * z);

            this.light();
        }
    }

    _setLight_from6(
        gouraud: i32,
        ambient: i32,
        diffuse: i32,
        x: i32,
        y: i32,
        z: i32
    ): void {
        this.lightAmbience = 256 - ambient * 4;
        this.lightDiffuse = (64 - diffuse) * 16 + 128;

        if (this.unlit) {
            return;
        }

        for (let i = 0; i < this.numFaces; i++) {
            if (gouraud) {
                this.faceIntensity![i] = this.magic;
            } else {
                this.faceIntensity![i] = 0;
            }
        }

        this.lightDirectionX = x;
        this.lightDirectionY = y;
        this.lightDirectionZ = z;
        this.lightDirectionMagnitude = Math.sqrt(x * x + y * y + z * z);

        this.light();
    }

    _setLight_from3(x: i32, y: i32, z: i32): void {
        if (!this.unlit) {
            this.lightDirectionX = x;
            this.lightDirectionY = y;
            this.lightDirectionZ = z;
            this.lightDirectionMagnitude = Math.sqrt(x * x + y * y + z * z);

            this.light();
        }
    }

    setVertexAmbience(v: i32, ambience: i32): void {
        this.vertexAmbience![v] = ambience & 0xff;
    }

    rotate(yaw: i32, pitch: i32, roll: i32): void {
        this.orientationYaw = (this.orientationYaw + yaw) & 0xff;
        this.orientationPitch = (this.orientationPitch + pitch) & 0xff;
        this.orientationRoll = (this.orientationRoll + roll) & 0xff;
        this.determineTransformKind();
        this.transformState = 1;
    }

    orient(yaw: i32, pitch: i32, roll: i32): void {
        this.orientationYaw = yaw & 0xff;
        this.orientationPitch = pitch & 0xff;
        this.orientationRoll = roll & 0xff;
        this.determineTransformKind();
        this.transformState = 1;
    }

    translate(x: i32, y: i32, z: i32): void {
        this.baseX += x;
        this.baseY += y;
        this.baseZ += z;
        this.determineTransformKind();
        this.transformState = 1;
    }

    place(x: i32, y: i32, z: i32): void {
        this.baseX = x;
        this.baseY = y;
        this.baseZ = z;
        this.determineTransformKind();
        this.transformState = 1;
    }

    determineTransformKind(): void {
        if (
            this.shearXy != 256 ||
            this.shearXz != 256 ||
            this.shearYx != 256 ||
            this.shearYz != 256 ||
            this.shearZx != 256 ||
            this.shearZy != 256
        ) {
            this.transformKind = 4;
        } else if (
            this.scaleFx != 256 ||
            this.scaleFy != 256 ||
            this.scaleFz != 256
        ) {
            this.transformKind = 3;
        } else if (
            this.orientationYaw != 0 ||
            this.orientationPitch != 0 ||
            this.orientationRoll != 0
        ) {
            this.transformKind = 2;
        } else if (this.baseX != 0 || this.baseY != 0 || this.baseZ != 0) {
            this.transformKind = 1;
        } else {
            this.transformKind = 0;
        }
    }

    applyTranslate(dx: i32, dy: i32, dz: i32): void {
        for (let i = 0; i < this.numVertices; i++) {
            this.vertexTransformedX![i] += dx;
            this.vertexTransformedY![i] += dy;
            this.vertexTransformedZ![i] += dz;
        }
    }

    applyRotation(yaw: i32, roll: i32, pitch: i32): void {
        for (let i = 0; i < this.numVertices; i++) {
            if (pitch != 0) {
                let sin = GameModel.sine9[pitch];
                let cos = GameModel.sine9[pitch + 256];

                let x =
                    (this.vertexTransformedY![i] * sin +
                        this.vertexTransformedX![i] * cos) >>
                    15;

                this.vertexTransformedY![i] =
                    (this.vertexTransformedY![i] * cos -
                        this.vertexTransformedX![i] * sin) >>
                    15;

                this.vertexTransformedX![i] = x;
            }

            if (yaw != 0) {
                let sin = GameModel.sine9[yaw];
                let cos = GameModel.sine9[yaw + 256];

                let y =
                    (this.vertexTransformedY![i] * cos -
                        this.vertexTransformedZ![i] * sin) >>
                    15;

                this.vertexTransformedZ![i] =
                    (this.vertexTransformedY![i] * sin +
                        this.vertexTransformedZ![i] * cos) >>
                    15;

                this.vertexTransformedY![i] = y;
            }

            if (roll != 0) {
                let sin = GameModel.sine9[roll];
                let cos = GameModel.sine9[roll + 256];

                let x =
                    (this.vertexTransformedZ![i] * sin +
                        this.vertexTransformedX![i] * cos) >>
                    15;

                this.vertexTransformedZ![i] =
                    (this.vertexTransformedZ![i] * cos -
                        this.vertexTransformedX![i] * sin) >>
                    15;

                this.vertexTransformedX![i] = x;
            }
        }
    }

    applyShear(xy: i32, xz: i32, yx: i32, yz: i32, zx: i32, zy: i32): void {
        for (let i = 0; i < this.numVertices; i++) {
            if (xy != 0) {
                this.vertexTransformedX![i] +=
                    (this.vertexTransformedY![i] * xy) >> 8;
            }

            if (xz != 0) {
                this.vertexTransformedZ![i] +=
                    (this.vertexTransformedY![i] * xz) >> 8;
            }

            if (yx != 0) {
                this.vertexTransformedX![i] +=
                    (this.vertexTransformedZ![i] * yx) >> 8;
            }

            if (yz != 0) {
                this.vertexTransformedY![i] +=
                    (this.vertexTransformedZ![i] * yz) >> 8;
            }

            if (zx != 0) {
                this.vertexTransformedZ![i] +=
                    (this.vertexTransformedX![i] * zx) >> 8;
            }

            if (zy != 0) {
                this.vertexTransformedY![i] +=
                    (this.vertexTransformedX![i] * zy) >> 8;
            }
        }
    }

    applyScale(fx: i32, fy: i32, fz: i32): void {
        for (let i = 0; i < this.numVertices; i++) {
            this.vertexTransformedX![i] =
                (this.vertexTransformedX![i] * fx) >> 8;

            this.vertexTransformedY![i] =
                (this.vertexTransformedY![i] * fy) >> 8;

            this.vertexTransformedZ![i] =
                (this.vertexTransformedZ![i] * fz) >> 8;
        }
    }

    computeBounds(): void {
        this.x1 = this.y1 = this.z1 = 999999;
        this.diameter = this.x2 = this.y2 = this.z2 = -999999;

        for (let face = 0; face < this.numFaces; face++) {
            let vs = this.faceVertices![face];
            let v = vs[0];
            let n = this.faceNumVertices![face];
            let x1 = 0;
            let x2 = (x1 = this.vertexTransformedX![v]);
            let y1 = 0;
            let y2 = (y1 = this.vertexTransformedY![v]);
            let z1 = 0;
            let z2 = (z1 = this.vertexTransformedZ![v]);

            for (let i = 0; i < n; i++) {
                v = vs[i];

                if (this.vertexTransformedX![v] < x1) {
                    x1 = this.vertexTransformedX![v];
                } else if (this.vertexTransformedX![v] > x2) {
                    x2 = this.vertexTransformedX![v];
                }

                if (this.vertexTransformedY![v] < y1) {
                    y1 = this.vertexTransformedY![v];
                } else if (this.vertexTransformedY![v] > y2) {
                    y2 = this.vertexTransformedY![v];
                }

                if (this.vertexTransformedZ![v] < z1) {
                    z1 = this.vertexTransformedZ![v];
                } else if (this.vertexTransformedZ![v] > z2) {
                    z2 = this.vertexTransformedZ![v];
                }
            }

            if (!this.isolated) {
                this.faceBoundLeft![face] = x1;
                this.faceBoundRight![face] = x2;
                this.faceBoundBottom![face] = y1;
                this.faceBoundTop![face] = y2;
                this.faceBoundNear![face] = z1;
                this.faceBoundFar![face] = z2;
            }

            if (x2 - x1 > this.diameter) {
                this.diameter = x2 - x1;
            }

            if (y2 - y1 > this.diameter) {
                this.diameter = y2 - y1;
            }

            if (z2 - z1 > this.diameter) {
                this.diameter = z2 - z1;
            }

            if (x1 < this.x1) {
                this.x1 = x1;
            }

            if (x2 > this.x2) {
                this.x2 = x2;
            }

            if (y1 < this.y1) {
                this.y1 = y1;
            }

            if (y2 > this.y2) {
                this.y2 = y2;
            }

            if (z1 < this.z1) {
                this.z1 = z1;
            }

            if (z2 > this.z2) {
                this.z2 = z2;
            }
        }
    }

    light(): void {
        if (this.unlit) {
            return;
        }

        let divisor = (this.lightDiffuse * this.lightDirectionMagnitude) >> 8;

        for (let i = 0; i < this.numFaces; i++) {
            if (this.faceIntensity![i] != this.magic) {
                this.faceIntensity![i] = ((this.faceNormalX![i] *
                    this.lightDirectionX +
                    this.faceNormalY![i] * this.lightDirectionY +
                    this.faceNormalZ![i] * this.lightDirectionZ) /
                    divisor) as i32;
            }
        }

        let normalX = new Int32Array(this.numVertices);
        let normalY = new Int32Array(this.numVertices);
        let normalZ = new Int32Array(this.numVertices);
        let normalMagnitude = new Int32Array(this.numVertices);

        for (let i = 0; i < this.numVertices; i++) {
            normalX[i] = 0;
            normalY[i] = 0;
            normalZ[i] = 0;
            normalMagnitude[i] = 0;
        }

        for (let i = 0; i < this.numFaces; i++) {
            if (this.faceIntensity![i] == this.magic) {
                for (let v = 0; v < this.faceNumVertices![i]; v++) {
                    let k1 = this.faceVertices![i][v];

                    normalX[k1] += this.faceNormalX![i];
                    normalY[k1] += this.faceNormalY![i];
                    normalZ[k1] += this.faceNormalZ![i];

                    normalMagnitude[k1]++;
                }
            }
        }

        for (let i = 0; i < this.numVertices; i++) {
            if (normalMagnitude[i] > 0) {
                this.vertexIntensity![i] = ((normalX[i] * this.lightDirectionX +
                    normalY[i] * this.lightDirectionY +
                    normalZ[i] * this.lightDirectionZ) /
                    (divisor * normalMagnitude[i])) as i32;
            }
        }
    }

    relight(): void {
        if (this.unlit && this.isolated) {
            return;
        }

        for (let i = 0; i < this.numFaces; i++) {
            let verts = this.faceVertices![i];

            let aX = this.vertexTransformedX![verts[0]];
            let aY = this.vertexTransformedY![verts[0]];
            let aZ = this.vertexTransformedZ![verts[0]];
            let bX = this.vertexTransformedX![verts[1]] - aX;
            let bY = this.vertexTransformedY![verts[1]] - aY;
            let bZ = this.vertexTransformedZ![verts[1]] - aZ;
            let cX = this.vertexTransformedX![verts[2]] - aX;
            let cY = this.vertexTransformedY![verts[2]] - aY;
            let cZ = this.vertexTransformedZ![verts[2]] - aZ;

            let normX = bY * cZ - cY * bZ;
            let normY = bZ * cX - cZ * bX;
            let normZ: i32;

            for (
                normZ = bX * cY - cX * bY;
                normX > 8192 ||
                normY > 8192 ||
                normZ > 8192 ||
                normX < -8192 ||
                normY < -8192 ||
                normZ < -8192;
                normZ >>= 1
            ) {
                normX >>= 1;
                normY >>= 1;
            }

            let normMag =
                256 * Math.sqrt(normX * normX + normY * normY + normZ * normZ);

            if (normMag <= 0) {
                normMag = 1;
            }

            this.faceNormalX![i] = ((normX * 0x10000) / normMag) as i32;
            this.faceNormalY![i] = ((normY * 0x10000) / normMag) as i32;
            this.faceNormalZ![i] = ((normZ * 0xffff) / normMag) as i32;
            this.normalScale![i] = -1;
        }

        this.light();
    }

    apply(): void {
        if (this.transformState == 2) {
            this.transformState = 0;

            for (let i = 0; i < this.numVertices; i++) {
                this.vertexTransformedX![i] = this.vertexX![i];
                this.vertexTransformedY![i] = this.vertexY![i];
                this.vertexTransformedZ![i] = this.vertexZ![i];
            }

            this.x1 = this.y1 = this.z1 = -9999999;
            this.diameter = this.x2 = this.y2 = this.z2 = 9999999;

            return;
        }

        if (this.transformState == 1) {
            this.transformState = 0;

            for (let i = 0; i < this.numVertices; i++) {
                this.vertexTransformedX![i] = this.vertexX![i];
                this.vertexTransformedY![i] = this.vertexY![i];
                this.vertexTransformedZ![i] = this.vertexZ![i];
            }

            if (this.transformKind >= 2) {
                this.applyRotation(
                    this.orientationYaw,
                    this.orientationPitch,
                    this.orientationRoll
                );
            }

            if (this.transformKind >= 3) {
                this.applyScale(this.scaleFx, this.scaleFy, this.scaleFz);
            }

            if (this.transformKind >= 4) {
                this.applyShear(
                    this.shearXy,
                    this.shearXz,
                    this.shearYx,
                    this.shearYz,
                    this.shearZx,
                    this.shearZy
                );
            }

            if (this.transformKind >= 1) {
                this.applyTranslate(this.baseX, this.baseY, this.baseZ);
            }

            this.computeBounds();
            this.relight();
        }
    }

    project(
        cameraX: i32,
        cameraY: i32,
        cameraZ: i32,
        cameraPitch: i32,
        cameraRoll: i32,
        cameraYaw: i32,
        viewDist: i32,
        clipNear: i32
    ): void {
        this.apply();

        if (
            this.z1 > Scene.frustumNearZ ||
            this.z2 < Scene.frustumFarZ ||
            this.x1 > Scene.frustumMinX ||
            this.x2 < Scene.frustumMaxX ||
            this.y1 > Scene.frustumMinY ||
            this.y2 < Scene.frustumMaxY
        ) {
            this.visible = false;
            return;
        }

        this.visible = true;

        let yawSin = 0;
        let yawCos = 0;
        let pitchSin = 0;
        let pitchCos = 0;
        let rollSin = 0;
        let rollCos = 0;

        if (cameraYaw != 0) {
            yawSin = GameModel.sine11[cameraYaw];
            yawCos = GameModel.sine11[cameraYaw + 1024];
        }

        if (cameraRoll != 0) {
            rollSin = GameModel.sine11[cameraRoll];
            rollCos = GameModel.sine11[cameraRoll + 1024];
        }

        if (cameraPitch != 0) {
            pitchSin = GameModel.sine11[cameraPitch];
            pitchCos = GameModel.sine11[cameraPitch + 1024];
        }

        for (let i = 0; i < this.numVertices; i++) {
            let x = this.vertexTransformedX![i] - cameraX;
            let y = this.vertexTransformedY![i] - cameraY;
            let z = this.vertexTransformedZ![i] - cameraZ;

            if (cameraYaw != 0) {
                let X = (y * yawSin + x * yawCos) >> 15;
                y = (y * yawCos - x * yawSin) >> 15;
                x = X;
            }

            if (cameraRoll != 0) {
                let X = (z * rollSin + x * rollCos) >> 15;
                z = (z * rollCos - x * rollSin) >> 15;
                x = X;
            }

            if (cameraPitch != 0) {
                let Y = (y * pitchCos - z * pitchSin) >> 15;
                z = (y * pitchSin + z * pitchCos) >> 15;
                y = Y;
            }

            if (z >= clipNear) {
                this.vertexViewX![i] = ((x << viewDist) / z) as i32;
            } else {
                this.vertexViewX![i] = x << viewDist;
            }

            if (z >= clipNear) {
                this.vertexViewY![i] = ((y << viewDist) / z) as i32;
            } else {
                this.vertexViewY![i] = y << viewDist;
            }

            this.projectVertexX![i] = x;
            this.projectVertexY![i] = y;
            this.projectVertexZ![i] = z;
        }
    }

    commit(): void {
        this.apply();

        for (let i = 0; i < this.numVertices; i++) {
            this.vertexX![i] = this.vertexTransformedX![i];
            this.vertexY![i] = this.vertexTransformedY![i];
            this.vertexZ![i] = this.vertexTransformedZ![i];
        }

        this.baseX = this.baseY = this.baseZ = 0;
        this.orientationYaw = this.orientationPitch = this.orientationRoll = 0;
        this.scaleFx = this.scaleFy = this.scaleFz = 256;
        this.shearXy = this.shearXz = this.shearYx = this.shearYz = this.shearZx = this.shearZy = 256;
        this.transformKind = 0;
    }

    copy(): GameModel {
        const pieces = new StaticArray<GameModel>(1);
        pieces[0] = this;

        const gameModel = GameModel._from2A(pieces, 1);
        gameModel.depth = this.depth;
        gameModel.transparent = this.transparent;

        return gameModel;
    }

    copy_from4(
        autocommit: bool,
        isolated: bool,
        unlit: bool,
        pickable: bool
    ): GameModel {
        const pieces = new StaticArray<GameModel>(1);
        pieces[0] = this;

        const gameModel = GameModel._from6(
            [this],
            1,
            autocommit,
            isolated,
            unlit,
            pickable
        );

        gameModel.depth = this.depth;

        return gameModel;
    }

    copyPosition(model: GameModel): void {
        this.orientationYaw = model.orientationYaw;
        this.orientationPitch = model.orientationPitch;
        this.orientationRoll = model.orientationRoll;
        this.baseX = model.baseX;
        this.baseY = model.baseY;
        this.baseZ = model.baseZ;
        this.determineTransformKind();
        this.transformState = 1;
    }

    readBase64(buffer: Int8Array): i32 {
        for (
            ;
            buffer[this.dataPtr] === 10 || buffer[this.dataPtr] === 13;
            this.dataPtr++
        );

        let hi = GameModel.base64Alphabet[buffer[this.dataPtr++] & 0xff];
        let mid = GameModel.base64Alphabet[buffer[this.dataPtr++] & 0xff];
        let lo = GameModel.base64Alphabet[buffer[this.dataPtr++] & 0xff];
        let val = (hi * 4096 + mid * 64 + lo - 0x20000) as i32;

        if (val === 123456) {
            val = this.magic;
        }

        return val;
    }
}

for (let i = 0; i < 256; i++) {
    GameModel.sine9[i] = (Math.sin(i * 0.02454369) * 32768) as i32;
    GameModel.sine9[i + 256] = (Math.cos(i * 0.02454369) * 32768) as i32;
}

for (let i = 0; i < 1024; i++) {
    GameModel.sine11[i] = (Math.sin(i * 0.00613592315) * 32768) as i32;
    GameModel.sine11[i + 1024] = (Math.cos(i * 0.00613592315) * 32768) as i32;
}

for (let i = 0; i < 10; i++) {
    GameModel.base64Alphabet[48 + i] = i;
}

for (let i = 0; i < 26; i++) {
    GameModel.base64Alphabet[65 + i] = i + 10;
}

for (let i = 0; i < 26; i++) {
    GameModel.base64Alphabet[97 + i] = i + 36;
}

GameModel.base64Alphabet[163] = 62;
GameModel.base64Alphabet[36] = 63;
