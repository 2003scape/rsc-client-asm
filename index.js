const BZLib = require('./js/bzlib');
const Color = require('./js/lib/graphics/color');
const Font = require('./js/lib/graphics/font');
const FileDownloadStream = require('./js/lib/net/file-download-stream');
const Graphics = require('./js/lib/graphics/graphics');
const TGA = require('tga-js');
const Socket = require('./js/lib/net/socket');
const fs = require('fs');
const loader = require('@assemblyscript/loader');
const version = require('./js/version.json');

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

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 346;

//const ctx = canvas.getContext('2d');

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMousePosition(canvas, e) {
    const boundingRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;

    return {
        x: ((e.clientX - boundingRect.left) * scaleX) | 0,
        y: ((e.clientY - boundingRect.top) * scaleY) | 0
    };
}

(async () => {
    const { exports } = await loader.instantiate(
        // TODO envify
        fs.readFileSync('./dist/untouched.wasm'),
        {
            // imports
        }
    );

    const { Surface, mudclient, loadData, Int8Array_ID } = exports;
    const { __newArray, __getArrayView, __newString } = exports;

    const mud = new mudclient();

    Object.assign(mud, {
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

            console.log('Started application');

            this.appletWidth = width;
            this.appletHeight = height;

            this._canvas.addEventListener('mousedown', function (e) {
                if (e.button === 1 && e.preventDefault) {
                    e.preventDefault();
                }

                const { x, y } = getMousePosition(this._canvas, e);

                this.mousePressed(x, y, e.button, e.metaKey);
            });

            this._canvas.addEventListener('mousemove', function (e) {
                const { x, y } = getMousePosition(this._canvas, e);

                this.mouseMove(x, y);
            });

            this._canvas.addEventListener('mouseup', function (e) {
                const { x, y } = getMousePosition(this._canvas, e);

                this.mouseMove(x, y, e.button);
            });

            this._canvas.addEventListener('mouseout', function (e) {
                const { x, y } = getMousePosition(this._canvas, e);

                this.mouseOut(x, y);
            });

            this._canvas.addEventListener('wheel', function (e) {
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

            this._canvas.addEventListener('keydown', function (e) {
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

            this._canvas.addEventListener('keyup', function (e) {
                this.keyReleased(e.keyCode);
            });

            window.addEventListener('beforeunload', () => this.onClosing());

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

                return decompressed;
            }

            return archiveData;
        },

        parseTGA(tgaBuffer) {
            const tgaImage = new TGA();
            tgaImage.load(new Uint8Array(tgaBuffer.buffer));

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

        async createSocket(server, port) {
            const socket = new Socket(server, port);
            await socket.connect();
            return socket;
        },

        async run() {
            if (this.loadingStep === 1) {
                this.loadingStep = 2;
                //this.graphics = this.getGraphics();
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

    console.log(mud);
})();
