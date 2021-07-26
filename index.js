const BZLib = require('./js/bzlib');
const Color = require('./js/lib/graphics/color');
const FileDownloadStream = require('./js/lib/net/file-download-stream');
const Font = require('./js/lib/graphics/font');
const Graphics = require('./js/lib/graphics/graphics');
const Socket = require('./js/lib/net/socket');
const TGA = require('tga-js');
const fs = require('fs');
const loader = require('@assemblyscript/loader');
const version = require('./js/version.json');
const wasmmap = require('wasm-sourcemap');

const FONTS = [
    'h11p.jf',
    'h12b.jf',
    'h12p.jf',
    'h13b.jf',
    'h14b.jf',
    'h16b.jf',
    'h20b.jf',
    'h24b.jf'
];

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

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 346;

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(512, 346);

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMousePosition(el, e) {
    const boundingRect = el.getBoundingClientRect();
    const scaleX = el.width / boundingRect.width;
    const scaleY = el.height / boundingRect.height;

    return {
        x: ((e.clientX - boundingRect.left) * scaleX) | 0,
        y: ((e.clientY - boundingRect.top) * scaleY) | 0
    };
}

(async () => {
    let pixelArray = null;
    let writeStreamBytes = null;

    const { exports } = await loader.instantiate(
        fetch('./untouched.wasm'),
        // TODO envify
        {
            surface: {
                draw: () => {
                    //console.log('drawing!');
                    if (!pixelArray) {
                        pixelArray = __getArrayView(
                            Surface.wrap(mc.surface).rgbPixels
                        );
                    }

                    imageData.data.set(pixelArray);
                    ctx.putImageData(imageData, 0, 0);
                },
                consoleLog: (str) => console.log(__getString(str)),
                consoleLogA: (str) => console.log(__getArrayView(str))
            },
            scene: {
                consoleLog: (str) => console.log(__getString(str))
            },
            'packet-stream': {
                writeStreamBytes: (buffer, offset, length) => {
                    writeStreamBytes(buffer, offset, length);
                    //console.log('writing stream bytes', offset, length);
                }
            },
            utility: {
                bzlibDecompress: (out, outSize, input, inputSize, offset) => {
                    BZLib.decompress(
                        __getArrayView(out),
                        outSize,
                        __getArrayView(input),
                        inputSize,
                        offset
                    );
                }
            },
            panel: {
                consoleLog: (str) => console.log(__getString(str))
            },
            'game-model': {
                consoleLog: (str) => console.log(__getString(str)),
                consoleLogA: (str) => console.log(__getArrayView(str))
            },
            mudclient: {
                consoleLog: (str) => console.log(__getString(str)),
                consoleLogA: (str) => console.log(__getArrayView(str))
            }
        }
    );

    const {
        ClientOpcodes,
        GameBuffer,
        GameConnection,
        GameData,
        GameModel,
        PacketStream,
        Panel,
        Scene,
        Surface,
        mudclient,
        World,
        loadData,
        getDataFileOffset,
        formatAuthString,
        encodeUsername,
        Int8Array_ID
    } = exports;

    const {
        __newArray,
        __getArrayView,
        __getUint8ArrayView,
        __newString,
        __getString
    } = exports;

    function newPacketStream(socket) {
        const packetStream = new PacketStream();

        writeStreamBytes = (buffer, offset, length) => {
            socket.write(__getArrayView(buffer), offset, length);
        };

        Object.assign(packetStream, {
            socket,

            availableStream() {
                if (this.closing) {
                    return 0;
                }

                return this.socket.available();
            },

            async readStream() {
                if (this.closing) {
                    return 0;
                }

                return await this.socket.read();
            },

            async readStreamBytes(len, off, buff) {
                if (this.closing) {
                    return;
                }

                await this.socket.readBytes(buff, off, len);
            },

            async getByte() {
                return (await this.readStream()) & 0xff;
            },

            async getShort() {
                const i = await this.getByte();
                const j = await this.getByte();

                return i * 256 + j;
            },

            async getInt() {
                return (
                    ((await this.getShort()) << 16) | (await this.getShort())
                );
            },

            async getLong() {
                return (
                    (BigInt(await this.getInt()) << 32n) |
                    BigInt(await this.getInt())
                );
            },

            async readBytes(length, buffer) {
                await this.readStreamBytes(length, 0, buffer);
            },

            async readPacket(buffer) {
                try {
                    this.readTries++;

                    if (
                        this.maxReadTries > 0 &&
                        this.readTries > this.maxReadTries
                    ) {
                        this.socketException = true;
                        this.socketExceptionMessage = __newString('time-out');
                        this.maxReadTries += this.maxReadTries;

                        return 0;
                    }

                    if (this.length === 0 && this.availableStream() >= 2) {
                        this.length = await this.readStream();

                        if (this.length >= 160) {
                            this.length =
                                (this.length - 160) * 256 +
                                (await this.readStream());
                        }
                    }

                    if (
                        this.length > 0 &&
                        this.availableStream() >= this.length
                    ) {
                        if (this.length >= 160) {
                            await this.readBytes(this.length, buffer);
                        } else {
                            buffer[this.length - 1] =
                                (await this.readStream()) & 0xff;

                            if (this.length > 1) {
                                await this.readBytes(this.length - 1, buffer);
                            }
                        }

                        let i = this.length;

                        this.length = 0;
                        this.readTries = 0;

                        return i;
                    }
                } catch (e) {
                    this.socketException = true;
                    this.socketExceptionMessage = __newString(e.message);
                }

                return 0;
            }
        });

        return packetStream;
    }

    const mc = new mudclient();

    Object.assign(mc, {
        fontTimesRoman15: new Font('Times New Roman', 0, 15),
        fontHelvetica13b: new Font('Helvetica', Font.BOLD, 13),
        fontHelvetica12: new Font('Helvetica', 0, 12),

        _canvas: canvas,
        graphics: new Graphics(canvas),

        timings: [],

        resetTimings() {
            for (let i = 0; i < 10; i += 1) {
                this.timings[i] = 0;
            }
        },

        async startApplication(width, height, title) {
            window.document.title = title;

            this._canvas.tabIndex = 0;
            this._canvas.width = width;
            this._canvas.height = height;

            this.appletWidth = width;
            this.appletHeight = height;

            this._canvas.addEventListener('mousedown', (e) => {
                if (e.button === 1 && e.preventDefault) {
                    e.preventDefault();
                }

                const { x, y } = getMousePosition(this._canvas, e);

                this.mousePressed(x, y, e.button, e.metaKey);
            });

            this._canvas.addEventListener('mousemove', (e) => {
                const { x, y } = getMousePosition(this._canvas, e);

                this.mouseMoved(x, y);
            });

            this._canvas.addEventListener('mouseup', (e) => {
                const { x, y } = getMousePosition(this._canvas, e);

                this.mouseReleased(x, y, e.button);
            });

            this._canvas.addEventListener('mouseout', (e) => {
                const { x, y } = getMousePosition(this._canvas, e);

                this.mouseOut(x, y);
            });

            this._canvas.addEventListener('wheel', (e) => {
                /*if (!this.options.mouseWheel) {
                    return;
                }*/

                e.preventDefault();

                if (e.deltaMode === 0) {
                    // deltaMode === 0 means deltaY/deltaY is given in pixels (chrome)
                    this.mouseScrollDelta = Math.floor(e.deltaY / 14);
                } else if (e.deltaMode === 1) {
                    // deltaMode === 1 means deltaY/deltaY is given in lines (firefox)
                    this.mouseScrollDelta = Math.floor(e.deltaY);
                }

                return false;
            });

            // prevent right clicks
            this._canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                return false;
            });

            this._canvas.addEventListener('keydown', (e) => {
                const code = e.keyCode;

                let charCode =
                    e.key && e.key.length === 1 ? e.key.charCodeAt(0) : 65535;

                if (e.preventDefault) {
                    e.preventDefault();
                }

                if ([8, 10, 13, 9].includes(code)) {
                    charCode = code;
                }

                this.keyPressed(code, charCode);
            });

            this._canvas.addEventListener('keyup', (e) => {
                this.keyReleased(e.keyCode);
            });

            //window.addEventListener('beforeunload', () => this.onClosing());

            this.loadingStep = 1;

            await this.run();
        },

        async readDataFile(file, description, percent) {
            file = `./data204/${file}`;

            this.showLoadingProgress(percent, `Loading ${description} - 0%`);

            const fileDownloadStream = new FileDownloadStream(file);

            const header = new Int8Array(6);
            await fileDownloadStream.readFully(header, 0, 6);

            const archiveSize =
                ((header[0] & 0xff) << 16) +
                ((header[1] & 0xff) << 8) +
                (header[2] & 0xff);

            const archiveSizeCompressed =
                ((header[3] & 0xff) << 16) +
                ((header[4] & 0xff) << 8) +
                (header[5] & 0xff);

            this.showLoadingProgress(percent, `Loading ${description} - 5%`);

            let read = 0;

            const archiveDataPtr = __newArray(Int8Array_ID, {
                length: archiveSizeCompressed
            });

            const archiveData = __getArrayView(archiveDataPtr);

            while (read < archiveSizeCompressed) {
                let length = archiveSizeCompressed - read;

                if (length > 1000) {
                    length = 1000;
                }

                await fileDownloadStream.readFully(archiveData, read, length);
                read += length;

                this.showLoadingProgress(
                    percent,
                    `Loading ${description} - ` +
                        ((5 + (read * 95) / archiveSizeCompressed) | 0) +
                        '%'
                );
            }

            this.showLoadingProgress(percent, `Unpacking ${description}`);

            if (archiveSizeCompressed !== archiveSize) {
                const decompressedPtr = __newArray(Int8Array_ID, {
                    length: archiveSize
                });

                const decompressed = __getArrayView(decompressedPtr);

                BZLib.decompress(
                    decompressed,
                    archiveSize,
                    archiveData,
                    archiveSizeCompressed,
                    0
                );

                return decompressedPtr;
            }

            return archiveDataPtr;
        },

        parseTGA(tgaBuffer) {
            const tgaImage = new TGA();

            tgaImage.load(
                new Uint8Array(
                    tgaBuffer.buffer,
                    tgaBuffer.byteOffset,
                    tgaBuffer.byteLength
                )
            );

            const canvas = tgaImage.getCanvas();
            const ctx = canvas.getContext('2d');

            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            return imageData;
        },

        drawString(graphics, string, font, x, y) {
            graphics.setFont(font);

            const { width, height } = graphics.ctx.measureText(string);

            graphics.drawString(
                string,
                x - ((width / 2) | 0),
                y + ((height / 4) | 0)
            );
        },

        drawLoadingScreen(percent, text) {
            let x = ((this.appletWidth - 281) / 2) | 0;
            let y = ((this.appletHeight - 148) / 2) | 0;

            this.graphics.setColor(Color.black);
            this.graphics.fillRect(0, 0, this.appletWidth, this.appletHeight);

            if (!this.hasRefererLogoNotUsed) {
                this.graphics.drawImage(this.imageLogo, x, y);
            }

            x += 2;
            y += 90;

            this.loadingProgressPercent = percent;
            this.loadingProgessText = text;

            this.graphics.setColor(new Color(132, 132, 132));

            if (this.hasRefererLogoNotUsed) {
                this.graphics.setColor(new Color(220, 0, 0));
            }

            this.graphics.drawRect(x - 2, y - 2, 280, 23);
            this.graphics.fillRect(x, y, ((277 * percent) / 100) | 0, 20);
            this.graphics.setColor(new Color(198, 198, 198));

            if (this.hasRefererLogoNotUsed) {
                this.graphics.setColor(new Color(255, 255, 255));
            }

            this.drawString(
                this.graphics,
                text,
                this.fontTimesRoman15,
                x + 138,
                y + 10
            );

            if (!this.hasRefererLogoNotUsed) {
                this.drawString(
                    this.graphics,
                    'Created by JAGeX - visit www.jagex.com',
                    this.fontHelvetica13b,
                    x + 138,
                    y + 30
                );

                this.drawString(
                    this.graphics,
                    '\u00a92001-2002 Andrew Gower and Jagex Ltd',
                    this.fontHelvetica13b,
                    x + 138,
                    y + 44
                );
            } else {
                this.graphics.setColor(new Color(132, 132, 152));

                this.drawString(
                    this.graphics,
                    '\u00a92001-2002 Andrew Gower and Jagex Ltd',
                    this.fontHelvetica12,
                    x + 138,
                    this.appletHeight - 20
                );
            }

            // not sure where this would have been used. maybe to indicate a
            // special client?
            if (this.logoHeaderText) {
                this.graphics.setColor(Color.white);
                this.drawString(
                    this.graphics,
                    this.logoHeaderText,
                    this.fontHelvetica13b,
                    x + 138,
                    y - 120
                );
            }
        },

        showLoadingProgress(percent, text) {
            const x = (((this.appletWidth - 281) / 2) | 0) + 2;
            const y = (((this.appletHeight - 148) / 2) | 0) + 90;

            this.loadingProgressPercent = percent;
            this.loadingProgessText = text;

            this.graphics.setColor(new Color(132, 132, 132));

            if (this.hasRefererLogoNotUsed) {
                this.graphics.setColor(new Color(220, 0, 0));
            }

            const progressWidth = ((277 * percent) / 100) | 0;

            this.graphics.fillRect(x, y, progressWidth, 20);
            this.graphics.setColor(Color.black);

            this.graphics.fillRect(
                x + progressWidth,
                y,
                277 - progressWidth,
                20
            );

            this.graphics.setColor(new Color(198, 198, 198));

            if (this.hasRefererLogoNotUsed) {
                this.graphics.setColor(new Color(255, 255, 255));
            }

            this.drawString(
                this.graphics,
                text,
                this.fontTimesRoman15,
                x + 138,
                y + 10
            );
        },

        drawTextBox(top, bottom) {
            const font = new Font('Helvetica', 1, 15);
            const width = 512;
            const height = 344;

            this.graphics.setColor(Color.black);

            this.graphics.fillRect(
                ((width / 2) | 0) - 140,
                ((height / 2) | 0) - 25,
                280,
                50
            );

            this.graphics.setColor(Color.white);

            this.graphics.drawRect(
                ((width / 2) | 0) - 140,
                ((height / 2) | 0) - 25,
                280,
                50
            );

            this.drawString(
                this.graphics,
                top,
                font,
                (width / 2) | 0,
                ((height / 2) | 0) - 10
            );

            this.drawString(
                this.graphics,
                bottom,
                font,
                (width / 2) | 0,
                ((height / 2) | 0) + 10
            );
        },

        async loadJagex() {
            this.graphics.setColor(Color.black);
            this.graphics.fillRect(0, 0, this.appletWidth, this.appletHeight);

            const jagexJag = await this.readDataFile(
                'jagex.jag',
                'Jagex library',
                0
            );

            if (jagexJag) {
                const logoTga = __getArrayView(
                    loadData(__newString('logo.tga'), 0, jagexJag)
                );

                this.imageLogo = this.parseTGA(logoTga);
            }

            const fontsJag = await this.readDataFile(
                `fonts${version.FONTS}.jag`,
                'Game fonts',
                5
            );

            if (jagexJag) {
                for (let i = 0; i < FONTS.length; i += 1) {
                    const fontName = __newString(FONTS[i]);
                    Surface.createFont(loadData(fontName, 0, fontsJag), i);
                }
            }
        },

        async loadGameConfig() {
            const configJag = await this.readDataFile(
                `config${version.CONFIG}.jag`,
                'Configuration',
                10
            );

            if (!configJag) {
                this.errorLoadingData = true;
                return;
            }

            GameData.loadData(configJag, this.members);

            const filterJag = await this.readDataFile(
                `filter${version.FILTER}.jag`,
                'Chat system',
                15
            );

            if (!filterJag) {
                this.errorLoadingData = true;
                return;
            }

            const fragments = new GameBuffer(
                loadData(__newString('fragmentsenc.txt'), 0, filterJag)
            );

            const badWords = new GameBuffer(
                loadData(__newString('badenc.txt'), 0, filterJag)
            );

            const hosts = new GameBuffer(
                loadData(__newString('hostenc.txt'), 0, filterJag)
            );

            const tlds = new GameBuffer(
                loadData(__newString('tldlist.txt'), 0, filterJag)
            );

            //WordFilter.loadFilters(fragments, badWords, hosts, tlds);
        },

        async loadMedia() {
            const mediaJag = await this.readDataFile(
                `media${version.MEDIA}.jag`,
                '2d graphics',
                20
            );

            if (!mediaJag) {
                this.errorLoadingData = true;
                return;
            }

            const indexDat = loadData(__newString('index.dat'), 0, mediaJag);
            const surface = Surface.wrap(this.surface);

            surface.parseSprite(
                this.spriteMedia,
                loadData(__newString('inv1.dat'), 0, mediaJag),
                indexDat,
                1
            );

            surface.parseSprite(
                this.spriteMedia + 1,
                loadData(__newString('inv2.dat'), 0, mediaJag),
                indexDat,
                6
            );

            surface.parseSprite(
                this.spriteMedia + 9,
                loadData(__newString('bubble.dat'), 0, mediaJag),
                indexDat,
                1
            );

            surface.parseSprite(
                this.spriteMedia + 10,
                loadData(__newString('runescape.dat'), 0, mediaJag),
                indexDat,
                1
            );

            surface.parseSprite(
                this.spriteMedia + 11,
                loadData(__newString('splat.dat'), 0, mediaJag),
                indexDat,
                3
            );

            surface.parseSprite(
                this.spriteMedia + 14,
                loadData(__newString('icon.dat'), 0, mediaJag),
                indexDat,
                8
            );

            surface.parseSprite(
                this.spriteMedia + 22,
                loadData(__newString('hbar.dat'), 0, mediaJag),
                indexDat,
                1
            );

            surface.parseSprite(
                this.spriteMedia + 23,
                loadData(__newString('hbar2.dat'), 0, mediaJag),
                indexDat,
                1
            );

            surface.parseSprite(
                this.spriteMedia + 24,
                loadData(__newString('compass.dat'), 0, mediaJag),
                indexDat,
                1
            );

            surface.parseSprite(
                this.spriteMedia + 25,
                loadData(__newString('buttons.dat'), 0, mediaJag),
                indexDat,
                2
            );

            surface.parseSprite(
                this.spriteUtil,
                loadData(__newString('scrollbar.dat'), 0, mediaJag),
                indexDat,
                2
            );

            surface.parseSprite(
                this.spriteUtil + 2,
                loadData(__newString('corners.dat'), 0, mediaJag),
                indexDat,
                4
            );

            surface.parseSprite(
                this.spriteUtil + 6,
                loadData(__newString('arrows.dat'), 0, mediaJag),
                indexDat,
                2
            );

            surface.parseSprite(
                this.spriteProjectile,
                loadData(__newString('projectile.dat'), 0, mediaJag),
                indexDat,
                GameData.projectileSprite
            );

            let spriteCount = GameData.itemSpriteCount;

            for (let i = 1; spriteCount > 0; i++) {
                let currentSpriteCount = spriteCount;
                spriteCount -= 30;

                if (currentSpriteCount > 30) {
                    currentSpriteCount = 30;
                }

                surface.parseSprite(
                    this.spriteItem + (i - 1) * 30,
                    loadData(__newString(`objects${i}.dat`), 0, mediaJag),
                    indexDat,
                    currentSpriteCount
                );
            }

            surface.loadSprite(this.spriteMedia);
            surface.loadSprite(this.spriteMedia + 9);

            for (let i = 11; i <= 26; i++) {
                surface.loadSprite(this.spriteMedia + i);
            }

            for (let i = 0; i < GameData.projectileSprite; i++) {
                surface.loadSprite(this.spriteProjectile + i);
            }

            for (let i = 0; i < GameData.itemSpriteCount; i++) {
                surface.loadSprite(this.spriteItem + i);
            }
        },

        async loadEntities() {
            const entityJag = await this.readDataFile(
                `entity${version.ENTITY}.jag`,
                'people and monsters',
                30
            );

            if (!entityJag) {
                this.errorLoadingData = true;
                return;
            }

            const indexDat = loadData(__newString('index.dat'), 0, entityJag);

            let entityJagMem = null;
            let indexDatMem = null;

            if (this.members) {
                entityJagMem = await this.readDataFile(
                    `entity${version.ENTITY}.mem`,
                    'member graphics',
                    45
                );

                if (!entityJagMem) {
                    this.errorLoadingData = true;
                    return;
                }

                indexDatMem = loadData(
                    __newString('index.dat'),
                    0,
                    entityJagMem
                );
            }

            let frameCount = 0;
            this.animationIndex = 0;

            const surface = Surface.wrap(this.surface);
            const animationName = __getArrayView(GameData.animationName);
            const animationNumber = __getArrayView(GameData.animationNumber);
            const animationHasA = __getArrayView(GameData.animationHasA);
            const animationHasF = __getArrayView(GameData.animationHasF);
            const animationGender = __getArrayView(GameData.animationGender);

            label0: for (let i = 0; i < GameData.animationCount; i++) {
                let _animationName = __getString(animationName[i]);

                for (let j = 0; j < i; j++) {
                    if (
                        __getString(animationName[j]).toLowerCase() !==
                        _animationName.toLowerCase()
                    ) {
                        continue;
                    }

                    animationNumber[i] = animationNumber[j];
                    continue label0;
                }

                let animationDat = loadData(
                    __newString(`${_animationName}.dat`),
                    0,
                    entityJag
                );

                let animationIndex = indexDat;

                if (!animationDat && this.members) {
                    animationDat = loadData(
                        __newString(`${_animationName}.dat`),
                        0,
                        entityJagMem
                    );

                    animationIndex = indexDatMem;
                }

                if (animationDat) {
                    surface.parseSprite(
                        this.animationIndex,
                        animationDat,
                        animationIndex,
                        15
                    );

                    frameCount += 15;

                    if (animationHasA[i] === 1) {
                        let aDat = loadData(
                            __newString(`${_animationName}a.dat`),
                            0,
                            entityJag
                        );

                        let aIndex = indexDat;

                        if (!aDat && this.members) {
                            aDat = loadData(
                                __newString(`${_animationName}a.dat`),
                                0,
                                entityJagMem
                            );

                            aIndex = indexDatMem;
                        }

                        surface.parseSprite(
                            this.animationIndex + 15,
                            aDat,
                            aIndex,
                            3
                        );

                        frameCount += 3;
                    }

                    if (animationHasF[i] === 1) {
                        let fDat = loadData(
                            __newString(`${_animationName}f.dat`),
                            0,
                            entityJag
                        );

                        let fIndex = indexDat;

                        if (!fDat && this.members) {
                            fDat = loadData(
                                __newString(`${_animationName}f.dat`),
                                0,
                                entityJagMem
                            );

                            fIndex = indexDatMem;
                        }

                        surface.parseSprite(
                            this.animationIndex + 18,
                            fDat,
                            fIndex,
                            9
                        );

                        frameCount += 9;
                    }

                    if (animationGender[i] !== 0) {
                        for (
                            let l = this.animationIndex;
                            l < this.animationIndex + 27;
                            l++
                        ) {
                            surface.loadSprite(l);
                        }
                    }
                }

                animationNumber[i] = this.animationIndex;

                this.animationIndex += 27;
            }

            console.log(`Loaded: ${frameCount} frames of animation`);
        },

        async loadTextures() {
            const texturesJag = await this.readDataFile(
                `textures${version.TEXTURES}.jag`,
                'Textures',
                50
            );

            if (!texturesJag) {
                this.errorLoadingData = true;
                return;
            }

            const indexDat = loadData(__newString('index.dat'), 0, texturesJag);

            const scene = Scene.wrap(this.scene);
            const surface = Surface.wrap(this.surface);

            scene.allocateTextures(GameData.textureCount, 7, 11);

            for (let i = 0; i < GameData.textureCount; i++) {
                const name = __getString(
                    __getArrayView(GameData.textureName)[i]
                );

                let buff1 = loadData(
                    __newString(`${name}.dat`),
                    0,
                    texturesJag
                );

                surface.parseSprite(this.spriteTexture, buff1, indexDat, 1);
                surface.drawBox(0, 0, 128, 128, 0xff00ff);
                surface._drawSprite_from3(0, 0, this.spriteTexture);

                let wh = __getArrayView(surface.spriteWidthFull)[
                    this.spriteTexture
                ];

                let nameSub = __newString(
                    __getArrayView(GameData.textureSubtypeName)[i]
                );

                if (nameSub && nameSub.length > 0) {
                    let buff2 = loadData(
                        __newString(`${nameSub}.dat`),
                        0,
                        texturesJag
                    );

                    surface.parseSprite(this.spriteTexture, buff2, indexDat, 1);
                    surface._drawSprite_from3(0, 0, this.spriteTexture);
                }

                surface._drawSprite_from5(
                    this.spriteTextureWorld + i,
                    0,
                    0,
                    wh,
                    wh
                );

                const surfacePixels = __getArrayView(surface.surfacePixels);

                for (let j = 0; j < wh * wh; j++) {
                    const texturePixels = __getArrayView(
                        surfacePixels[this.spriteTextureWorld + i]
                    );

                    if (texturePixels[j] === 65280) {
                        texturePixels[j] = 0xff00ff;
                    }
                }

                surface.drawWorld(this.spriteTextureWorld + i);

                scene.defineTexture(
                    i,
                    __getArrayView(surface.spriteColoursUsed)[
                        this.spriteTextureWorld + i
                    ],
                    __getArrayView(surface.spriteColourList)[
                        this.spriteTextureWorld + i
                    ],
                    ((wh / 64) | 0) - 1
                );
            }
        },

        async loadModels() {
            for (const modelName of ANIMATED_MODELS) {
                GameData.getModelIndex(__newString(modelName));
            }

            const modelsJag = await this.readDataFile(
                `models${version.MODELS}.jag`,
                '3d models',
                60
            );

            if (!modelsJag) {
                this.errorLoadingData = true;
                return;
            }

            const gameModels = __getArrayView(this.gameModels);
            const modelNames = __getArrayView(GameData.modelName);

            for (let i = 0; i < GameData.modelCount; i++) {
                const offset = getDataFileOffset(
                    __newString(`${__getString(modelNames[i])}.ob3`),
                    modelsJag
                );

                if (offset !== 0) {
                    gameModels[i] = GameModel.fromBytes(modelsJag, offset);
                } else {
                    gameModels[i] = GameModel._from2(1, 1);
                }

                if (
                    __getString(
                        __getArrayView(GameData.modelName)[i]
                    ).toLowerCase() === 'giantcrystal'
                ) {
                    gameModels[i].transparent = true;
                }
            }
        },

        async loadMaps() {
            const world = World.wrap(this.world);

            world.mapPack = await this.readDataFile(
                `maps${version.MAPS}.jag`,
                'map',
                70
            );

            if (this.members) {
                world.memberMapPack = await this.readDataFile(
                    `maps${version.MAPS}.mem`,
                    'members map',
                    75
                );
            }

            world.landscapePack = await this.readDataFile(
                `land${version.MAPS}.jag`,
                'landscape',
                80
            );

            if (this.members) {
                world.memberLandscapePack = await this.readDataFile(
                    `land${version.MAPS}.mem`,
                    'members landscape',
                    85
                );
            }
        },

        async createSocket(server, port) {
            const socket = new Socket(__getString(server), port);
            await socket.connect();
            return socket;
        },

        async startGame() {
            this.port = this.port || 43595;
            this.maxReadTries = 1000;

            GameConnection.clientVersion = version.CLIENT;

            await this.loadGameConfig();

            if (this.errorLoadingData) {
                return;
            }

            this.spriteMedia = 2000;
            this.spriteUtil = this.spriteMedia + 100;
            this.spriteItem = this.spriteUtil + 50;
            this.spriteLogo = this.spriteItem + 1000;
            this.spriteProjectile = this.spriteLogo + 10;
            this.spriteTexture = this.spriteProjectile + 50;
            this.spriteTextureWorld = this.spriteTexture + 10;

            //this.graphics = this.getGraphics();

            this.setTargetFPS(50);

            const surface = new Surface(
                this.gameWidth,
                this.gameHeight + 12,
                4000,
                this
            );

            surface.setBounds(0, 0, this.gameWidth, this.gameHeight + 12);

            this.surface = surface;

            Panel.drawBackgroundArrow = false;
            Panel.baseSpriteStart = this.spriteUtil;

            let x = surface.width2 - 199;
            let y = 36;

            /*if (this.options.mobile) {
                x -= 32;
                y = (this.gameHeight / 2 - 275 / 2) | 0;
            }*/

            const panelQuestList = new Panel(this.surface, 5);

            this.controlListQuest = panelQuestList.addTextListInteractive(
                x,
                y + 24,
                196,
                251,
                1,
                500,
                true
            );

            this.panelQuestList = panelQuestList;

            /*if (this.options.mobile) {
                x = 35;
                y = (this.gameHeight / 2 - 182 / 2) | 0;
            }*/

            const panelMagic = new Panel(this.surface, 5);

            this.controlListMagic = panelMagic.addTextListInteractive(
                x,
                y + 24,
                196,
                90,
                1,
                500,
                true
            );

            this.panelMagic = panelMagic;

            const panelSocialList = new Panel(this.surface, 5);

            this.controlListSocialPlayers = panelSocialList.addTextListInteractive(
                x,
                y + 40,
                196,
                126,
                1,
                500,
                true
            );

            this.panelSocialList = panelSocialList;

            await this.loadMedia();

            if (this.errorLoadingData) {
                return;
            }

            await this.loadEntities();

            if (this.errorLoadingData) {
                return;
            }

            const scene = new Scene(this.surface, 15000, 15000, 1000);

            scene.view = GameModel._from2(1000 * 1000, 1000);

            scene.setBounds(
                (this.gameWidth / 2) | 0,
                (this.gameHeight / 2) | 0,
                (this.gameWidth / 2) | 0,
                (this.gameHeight / 2) | 0,
                this.gameWidth,
                9
            );

            scene.clipFar3d = 2400;
            scene.clipFar2d = 2400;
            scene.fogZFalloff = 1;
            scene.fogZDistance = 2300;
            scene._setLight_from3(-50, -10, -50);

            this.scene = scene;

            const world = new World(this.scene, this.surface);
            world.baseMediaSprite = this.spriteMedia;

            this.world = world;

            await this.loadTextures();

            if (this.errorLoadingData) {
                return;
            }

            await this.loadModels();

            if (this.errorLoadingData) {
                return;
            }

            await this.loadMaps();

            if (this.errorLoadingData) {
                return;
            }

            if (this.members) {
                await this.loadSounds();
            }

            if (!this.errorLoadingData) {
                this.showLoadingProgress(100, 'Starting game...');
                this.createMessageTabPanel();
                this.createLoginPanels();
                this.createAppearancePanel();
                this.resetLoginScreenVariables();
                this.renderLoginScreenViewports();
            }
        },

        async login(username, password, reconnecting) {
            if (this.worldFullTimeout > 0) {
                this.showLoginScreenStatus(
                    __newString('Please wait...'),
                    __newString('Connecting to server')
                );

                await sleep(2000);

                this.showLoginScreenStatus(
                    __newString('Sorry! The server is currently full.'),
                    __newString('Please try again later')
                );

                return;
            }

            try {
                this.username = username;
                username = formatAuthString(username, 20);

                this.password = password;
                password = formatAuthString(password, 20);

                if (__getString(username).trim().length === 0) {
                    this.showLoginScreenStatus(
                        __newString('You must enter both a username'),
                        __newString('and a password - Please try again')
                    );

                    return;
                }

                if (reconnecting) {
                    this.drawTextBox(
                        __newString('Connection lost! Please wait...'),
                        __newString('Attempting to re-establish')
                    );
                } else {
                    this.showLoginScreenStatus(
                        __newString('Please wait...'),
                        __newString('Connecting to server')
                    );
                }

                this._packetStream = newPacketStream(
                    await this.createSocket(this.server, this.port)
                );

                this.packetStream = this._packetStream;

                this._packetStream.maxReadTries = GameConnection.maxReadTries;

                this._packetStream.newPacket(ClientOpcodes.SESSION);
                const encodedUsername = encodeUsername(username);

                this._packetStream.putByte(
                    Number((encodedUsername >> 16n) & 31n) & 0xff
                );

                this._packetStream.flushPacket();

                const sessionID = await this._packetStream.getLong();
                this.sessionID = sessionID;

                if (sessionID === 0n) {
                    this.showLoginScreenStatus(
                        __newString('Login server offline.'),
                        __newString('Please try again in a few mins')
                    );

                    return;
                }

                console.log('Verb: Session id: ' + sessionID);

                const keys = new Int32Array(4);
                keys[0] = (Math.random() * 99999999) | 0;
                keys[1] = (Math.random() * 99999999) | 0;
                keys[2] = Number(sessionID >> 32n) | 0;
                keys[3] = Number(sessionID) | 0;
                //keys[2] = sessionID.shiftRight(32).toInt();
                //keys[3] = sessionID.toInt();

                this._packetStream.newPacket(ClientOpcodes.LOGIN);

                this._packetStream.putByte(+reconnecting);
                this._packetStream.putShort(GameConnection.clientVersion);
                this._packetStream.putByte(0); // limit30

                this._packetStream.putByte(10);
                this._packetStream.putInt(keys[0]);
                this._packetStream.putInt(keys[1]);
                this._packetStream.putInt(keys[2]);
                this._packetStream.putInt(keys[3]);
                this._packetStream.putInt(0); // uuid
                this._packetStream.putString(username);
                this._packetStream.putString(password);

                this._packetStream.flushPacket();
                //this._packetStream.seedIsaac(ai);

                const response = await this._packetStream.readStream();
                console.log('login response:' + response);

                if (response === 25) {
                    this.moderatorLevel = 1;
                    this.autoLoginTimeout = 0;
                    this.resetGame();
                    return;
                } else if (response === 0) {
                    this.moderatorLevel = 0;
                    this.autoLoginTimeout = 0;
                    this.resetGame();
                    return;
                } else if (response === 1) {
                    this.autoLoginTimeout = 0;
                    return;
                }

                if (reconnecting) {
                    username = '';
                    password = '';
                    this.resetLoginVars();
                    return;
                }

                switch (response) {
                    case -1:
                        this.showLoginScreenStatus(
                            __newString('Error unable to login.'),
                            __newString('Server timed out')
                        );
                        return;
                    case 3:
                        this.showLoginScreenStatus(
                            __newString('Invalid username or password.'),
                            __newString('Try again, or create a new account')
                        );
                        return;
                    case 4:
                        this.showLoginScreenStatus(
                            __newString('That username is already logged in.'),
                            __newString('Wait 60 seconds then retry')
                        );
                        return;
                    case 5:
                        this.showLoginScreenStatus(
                            __newString('The client has been updated.'),
                            __newString('Please reload this page')
                        );
                        return;
                    case 6:
                        this.showLoginScreenStatus(
                            __newString(
                                'You may only use 1 character at once.'
                            ),
                            __newString('Your ip-address is already in use')
                        );
                        return;
                    case 7:
                        this.showLoginScreenStatus(
                            __newString('Login attempts exceeded!'),
                            __newString('Please try again in 5 minutes')
                        );
                        return;
                    case 8:
                        this.showLoginScreenStatus(
                            __newString('Error unable to login.'),
                            __newString('Server rejected session')
                        );
                        return;
                    case 9:
                        this.showLoginScreenStatus(
                            __newString('Error unable to login.'),
                            __newString('Loginserver rejected session')
                        );
                        return;
                    case 10:
                        this.showLoginScreenStatus(
                            __newString('That username is already in use.'),
                            __newString('Wait 60 seconds then retry')
                        );
                        return;
                    case 11:
                        this.showLoginScreenStatus(
                            __newString('Account temporarily disabled.'),
                            __newString('Check your message inbox for details')
                        );
                        return;
                    case 12:
                        this.showLoginScreenStatus(
                            __newString('Account permanently disabled.'),
                            __newString('Check your message inbox for details')
                        );
                        return;
                    case 14:
                        this.showLoginScreenStatus(
                            __newString('Sorry! This world is currently full.'),
                            __newString('Please try a different world')
                        );

                        this.worldFullTimeout = 1500;
                        return;
                    case 15:
                        this.showLoginScreenStatus(
                            __newString('You need a members account'),
                            __newString('to login to this world')
                        );
                        return;
                    case 16:
                        this.showLoginScreenStatus(
                            __newString('Error - no reply from loginserver.'),
                            __newString('Please try again')
                        );
                        return;
                    case 17:
                        this.showLoginScreenStatus(
                            __newString('Error - failed to decode profile.'),
                            __newString('Contact customer support')
                        );
                        return;
                    case 18:
                        this.showLoginScreenStatus(
                            __newString('Account suspected stolen.'),
                            __newString(
                                "Press 'recover a locked account' on front page."
                            )
                        );
                        return;
                    case 20:
                        this.showLoginScreenStatus(
                            __newString('Error - loginserver mismatch'),
                            __newString('Please try a different world')
                        );
                        return;
                    case 21:
                        this.showLoginScreenStatus(
                            __newString('Unable to login.'),
                            __newString('That is not an RS-Classic account')
                        );
                        return;
                    case 22:
                        this.showLoginScreenStatus(
                            __newString('Password suspected stolen.'),
                            __newString(
                                "Press 'change your password' on front page."
                            )
                        );
                        return;
                    default:
                        this.showLoginScreenStatus(
                            __newString('Error unable to login.'),
                            __newString('Unrecognised response code')
                        );
                        return;
                }
            } catch (e) {
                console.error(e);
            }

            if (this.autoLoginTimeout > 0) {
                await sleep(5000);
                this.autoLoginTimeout--;
                await this.login(this.username, this.password, reconnecting);
            }

            if (reconnecting) {
                this.username = '';
                this.password = '';
                this.resetLoginVars();
            } else {
                this.showLoginScreenStatus(
                    __newString('Sorry! Unable to connect.'),
                    __newString('Check internet settings or try another world')
                );
            }
        },

        async lostConnection() {
            try {
                throw new Error('');
            } catch (e) {
                console.error(e);
            }

            this.autoLoginTimeout = 10;

            /*if (this.options.retryLoginOnDisconnect) {
                this.autoLoginTimeout = 10;
            }*/

            await this.login(this.username, this.password, true);
        },

        async checkConnection() {
            // packetTick?
            const timestamp = Date.now();

            if (this._packetStream.hasPacket()) {
                this.packetLastRead = timestamp;
            }

            if (timestamp - this.packetLastRead > 5000) {
                this._packetLastRead = timestamp;
                this._packetStream.newPacket(ClientOpcodes.PING);
                this._packetStream.sendPacket();
            }

            try {
                this._packetStream.writePacket(20);
            } catch (e) {
                await this.lostConnection();
                return;
            }

            const incomingPacket = __getArrayView(this.incomingPacket);
            const length = await this._packetStream.readPacket(incomingPacket);

            if (length > 0) {
                /*const opcode = this._packetStream.isaacCommand(
                    this.incomingPacket[0] & 0xff
                );*/

                const opcode = incomingPacket[0] & 0xff;

                //console.log('opcode:' + opcode + ' psize:' + length);
                this.handleIncomingPacket(opcode, length, this.incomingPacket);
            }
        },

        async handleMesssageTabsInput() {
            this.handleMesssageTabsInput_0();
        },

        async handleGameInput() {
            this.handleGameInput_0();
            await this.checkConnection();
            this.handleGameInput_1();
            await this.handleMesssageTabsInput();
            this.handleGameInput_2();
        },

        async handleInputs() {
            if (
                this.errorLoadingCodebase ||
                this.errorLoadingMemory ||
                this.errorLoadingData
            ) {
                return;
            }

            try {
                this.loginTimer++;

                if (this.loggedIn === 0) {
                    this.mouseActionTimeout = 0;
                    const ret = this.handleLoginScreenInput_0();

                    if (ret === 1) {
                        await this.login(this.loginUser, this.loginPass, false);
                    }
                } else if (this.loggedIn === 1) {
                    this.mouseActionTimeout++;
                    await this.handleGameInput();
                }

                this.lastMouseButtonDown = 0;
                this.cameraRotationTime++;

                if (this.cameraRotationTime > 500) {
                    this.cameraRotationTime = 0;

                    const roll = (Math.random() * 4) | 0;

                    if ((roll & 1) === 1) {
                        this.cameraRotationX += this.cameraRotationXIncrement;
                    }

                    if ((roll & 2) === 2) {
                        this.cameraRotationY += this.cameraRotationYIncrement;
                    }
                }

                if (this.cameraRotationX < -50) {
                    this.cameraRotationXIncrement = 2;
                } else if (this.cameraRotationX > 50) {
                    this.cameraRotationXIncrement = -2;
                }

                if (this.cameraRotationY < -50) {
                    this.cameraRotationYIncrement = 2;
                } else if (this.cameraRotationY > 50) {
                    this.cameraRotationYIncrement = -2;
                }

                if (this.messageTabFlashAll > 0) {
                    this.messageTabFlashAll--;
                }

                if (this.messageTabFlashHistory > 0) {
                    this.messageTabFlashHistory--;
                }

                if (this.messageTabFlashQuest > 0) {
                    this.messageTabFlashQuest--;
                }

                if (this.messageTabFlashPrivate > 0) {
                    this.messageTabFlashPrivate--;
                    return;
                }
            } catch (e) {
                // OutOfMemory
                console.error(e);
                this.disposeAndCollect();
                this.errorLoadingMemory = true;
            }
        },

        draw() {
            if (this.errorLoadingData) {
                const g = this.graphics;

                g.setColor(Color.black);
                g.fillRect(0, 0, 512, 356);
                g.setFont(new Font('Helvetica', 1, 16));
                g.setColor(Color.yellow);

                let y = 35;

                g.drawString(
                    'Sorry, an error has occured whilst loading RuneScape',
                    30,
                    y
                );

                y += 50;

                g.setColor(Color.white);

                g.drawString(
                    'To fix this try the following (in order):',
                    30,
                    y
                );

                y += 50;

                g.setColor(Color.white);

                g.setFont(new Font('Helvetica', 1, 12));

                g.drawString(
                    '1: Try closing ALL open web-browser windows, and reloading',
                    30,
                    y
                );

                y += 30;

                g.drawString(
                    '2: Try clearing your web-browsers cache from tools->internet options',
                    30,
                    y
                );
                y += 30;

                g.drawString('3: Try using a different game-world', 30, y);

                y += 30;

                g.drawString('4: Try rebooting your computer', 30, y);

                y += 30;

                g.drawString(
                    '5: Try selecting a different version of Java from the play-game menu',
                    30,
                    y
                );

                this.setTargetFps(1);

                return;
            }

            if (this.errorLoadingCodebase) {
                const g = this.graphics;

                g.setColor(Color.black);
                g.fillRect(0, 0, 512, 356);
                g.setFont(new Font('Helvetica', 1, 20));
                g.setColor(Color.white);
                g.drawString('Error - unable to load game!', 50, 50);

                g.drawString(
                    'To play RuneScape make sure you play from',
                    50,
                    100
                );

                g.drawString('http://www.runescape.com', 50, 150);

                this.setTargetFps(1);

                return;
            }

            if (this.errorLoadingMemory) {
                const g = this.graphics;

                g.setColor(Color.black);
                g.fillRect(0, 0, 512, 356);
                g.setFont(new Font('Helvetica', 1, 20));
                g.setColor(Color.white);
                g.drawString('Error - out of memory!', 50, 50);
                g.drawString('Close ALL unnecessary programs', 50, 100);
                g.drawString('and windows before loading the game', 50, 150);
                g.drawString(
                    'RuneScape needs about 48meg of spare RAM',
                    50,
                    200
                );

                this.setTargetFps(1);

                return;
            }

            try {
                if (this.loggedIn === 0) {
                    this.drawLoginScreens();
                } else if (this.loggedIn === 1) {
                    this.drawGame();
                }
            } catch (e) {
                // OutOfMemory
                console.error(e);
                this.disposeAndCollect();
                this.errorLoadingMemory = true;
            }
        },

        async run() {
            if (this.loadingStep === 1) {
                this.loadingStep = 2;
                await this.loadJagex();
                this.drawLoadingScreen(0, 'Loading...');
                await this.startGame();
                this.loadingStep = 0;
            }

            let i = 0;
            let j = 256;
            let delay = 1;
            let i1 = 0;

            for (let j1 = 0; j1 < 10; j1++) {
                this.timings[j1] = Date.now();
            }

            while (this.stopTimeout >= 0) {
                if (this.stopTimeout > 0) {
                    this.stopTimeout--;

                    if (this.stopTimeout === 0) {
                        this.onClosing();
                        return;
                    }
                }

                const k1 = j;
                const lastDelay = delay;

                j = 300;
                delay = 1;

                const time = Date.now();

                if (this.timings[i] === 0) {
                    j = k1;
                    delay = lastDelay;
                } else if (time > this.timings[i]) {
                    j =
                        ((2560 * this.targetFPS) / (time - this.timings[i])) |
                        0;
                }

                if (j < 25) {
                    j = 25;
                }

                if (j > 256) {
                    j = 256;

                    delay =
                        (this.targetFPS - (time - this.timings[i]) / 10) | 0;

                    if (delay < this.threadSleep) {
                        delay = this.threadSleep;
                    }
                }

                await sleep(delay);

                this.timings[i] = time;
                i = (i + 1) % 10;

                if (delay > 1) {
                    for (let j2 = 0; j2 < 10; j2++) {
                        if (this.timings[j2] !== 0) {
                            this.timings[j2] += delay;
                        }
                    }
                }

                let k2 = 0;

                while (i1 < 256) {
                    await this.handleInputs();

                    i1 += j;

                    if (++k2 > this.maxDrawTime) {
                        i1 = 0;

                        this.interlaceTimer += 6;

                        if (this.interlaceTimer > 25) {
                            this.interlaceTimer = 0;
                            this.interlace = true;
                        }

                        break;
                    }
                }

                this.interlaceTimer--;
                i1 &= 0xff;

                this.draw();

                // calculate fps
                this.fps = (1000 * j) / (this.targetFPS * 256);

                this.mouseScrollDelta = 0;
            }
        }
    });

    await mc.startApplication(512, 346, 'Runescape by Andrew Gower');
})();
