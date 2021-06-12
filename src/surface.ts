import mudclient from './mudclient';
import { getUnsignedShort } from './utility';

const SLEEP_WIDTH = 255;
const SLEEP_HEIGHT = 40;

const C_0 = '0'.charCodeAt(0);
const C_9 = '9'.charCodeAt(0);
const C_AT = '@'.charCodeAt(0);
const C_TILDE = '~'.charCodeAt(0);
const C_SPACE = ' '.charCodeAt(0);
const C_PERCENT = '%'.charCodeAt(0);

const BLACK = 0;
const DARK_GREY = 0xa0a0a0;
const LIGHT_GREY = 0xdcdcdc;

export default class Surface {
    static anInt346: i32 = 0;
    static anInt347: i32 = 0;
    static anInt348: i32 = 0;
    static gameFonts: StaticArray<Int8Array> = new StaticArray<Int8Array>(50);
    static characterWidth: Int32Array = new Int32Array(256);

    width2: i32;
    height2: i32;
    area: i32;
    width1: i32;
    height1: i32;
    pixels: Int32Array;
    rgbPixels: Uint8Array;
    surfacePixels: StaticArray<Int32Array | null>;
    spriteColoursUsed: StaticArray<Int8Array | null>;
    spriteColourList: StaticArray<Int32Array | null>;
    spriteWidth: Int32Array;
    spriteHeight: Int32Array;
    spriteTranslateX: Int32Array;
    spriteTranslateY: Int32Array;
    spriteWidthFull: Int32Array;
    spriteHeightFull: Int32Array;
    spriteTranslate: Int8Array;
    interlace: bool;
    loggedIn: bool;
    sinCosCache: Int32Array | null;
    anIntArray340: Int32Array | null;
    anIntArray341: Int32Array | null;
    anIntArray342: Int32Array | null;
    anIntArray343: Int32Array | null;
    anIntArray344: Int32Array | null;
    anIntArray345: Int32Array | null;
    boundsTopY: i32;
    boundsBottomY: i32;
    boundsTopX: i32;
    boundsBottomX: i32;
    mudclientref: mudclient;

    static rgbToInt(red: i32, green: i32, blue: i32): i32 {
        return (red << 16) + (green << 8) + blue;
    }

    static createFont(buffer: Int8Array, id: i32): void {
        Surface.gameFonts[id] = buffer;
    }

    constructor(width: i32, height: i32, limit: i32, mudclientref: mudclient) {
        this.boundsBottomY = height;
        this.boundsBottomX = width;
        this.width1 = this.width2 = width;
        this.height1 = this.height2 = height;
        this.area = width * height;
        this.pixels = new Int32Array(width * height);
        this.rgbPixels = Uint8Array.wrap(this.pixels.buffer);
        this.surfacePixels = new StaticArray<Int32Array | null>(limit);
        this.spriteTranslate = new Int8Array(limit);
        this.spriteColoursUsed = new StaticArray<Int8Array | null>(limit);
        this.spriteColourList = new StaticArray<Int32Array | null>(limit);
        this.spriteWidth = new Int32Array(limit);
        this.spriteHeight = new Int32Array(limit);
        this.spriteWidthFull = new Int32Array(limit);
        this.spriteHeightFull = new Int32Array(limit);
        this.spriteTranslateX = new Int32Array(limit);
        this.spriteTranslateY = new Int32Array(limit);
        this.mudclientref = mudclientref;

        this.setComplete();
    }

    setComplete(): void {
        for (let i = 0; i < this.area * 4; i += 4) {
            // TODO see if bit reverse works here?
            const blue = this.rgbPixels[i];

            this.rgbPixels[i] = this.rgbPixels[i + 2];
            this.rgbPixels[i + 2] = blue;
            this.rgbPixels[i + 3] = 255;
        }
    }

    setBounds(x1: i32, y1: i32, x2: i32, y2: i32): void {
        if (x1 < 0) {
            x1 = 0;
        }

        if (y1 < 0) {
            y1 = 0;
        }

        if (x2 > this.width2) {
            x2 = this.width2;
        }

        if (y2 > this.height2) {
            y2 = this.height2;
        }

        this.boundsTopX = x1;
        this.boundsTopY = y1;
        this.boundsBottomX = x2;
        this.boundsBottomY = y2;
    }

    resetBounds(): void {
        this.boundsTopX = 0;
        this.boundsTopY = 0;
        this.boundsBottomX = this.width2;
        this.boundsBottomY = this.height2;
    }

    /*draw(graphics: Graphics, x: i32, y: i32): void {
        this.setComplete();
        graphics.drawImage(this.imageData, x, y);
    }*/

    blackScreen(): void {
        const area = this.width2 * this.height2;

        if (!this.interlace) {
            for (let i = 0; i < area; i++) {
                this.pixels[i] = 0;
            }

            return;
        }

        let pixelidx = 0;

        for (let y = -this.height2; y < 0; y += 2) {
            for (let x = -this.width2; x < 0; x++) {
                this.pixels[pixelidx++] = 0;
            }

            pixelidx += this.width2;
        }
    }

    drawCircle(x: i32, y: i32, radius: i32, colour: i32, alpha: i32): void {
        const bgAlpha = 256 - alpha;
        const red = ((colour >> 16) & 0xff) * alpha;
        const green = ((colour >> 8) & 0xff) * alpha;
        const blue = (colour & 0xff) * alpha;

        let top = y - radius;

        if (top < 0) {
            top = 0;
        }

        let bottom = y + radius;

        if (bottom >= this.height2) {
            bottom = this.height2 - 1;
        }

        let vertInc = 1;

        if (this.interlace) {
            vertInc = 2;

            if ((top & 1) != 0) {
                top++;
            }
        }

        for (let yy = top; yy <= bottom; yy += vertInc) {
            const l3 = yy - y;
            const i4 = Math.sqrt(radius * radius - l3 * l3) as i32;
            let j4 = x - i4;

            if (j4 < 0) {
                j4 = 0;
            }

            let k4 = x + i4;

            if (k4 >= this.width2) {
                k4 = this.width2 - 1;
            }

            let index = j4 + yy * this.width2;

            for (let i = j4; i <= k4; i++) {
                const bgRed = ((this.pixels[index] >> 16) & 0xff) * bgAlpha;
                const bgGreen = ((this.pixels[index] >> 8) & 0xff) * bgAlpha;
                const bgBlue = (this.pixels[index] & 0xff) * bgAlpha;

                const newColour =
                    (((red + bgRed) >> 8) << 16) +
                    (((green + bgGreen) >> 8) << 8) +
                    ((blue + bgBlue) >> 8);

                this.pixels[index++] = newColour;
            }
        }
    }

    drawBoxAlpha(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        colour: i32,
        alpha: i32
    ): void {
        if (x < this.boundsTopX) {
            width -= this.boundsTopX - x;
            x = this.boundsTopX;
        }

        if (y < this.boundsTopY) {
            height -= this.boundsTopY - y;
            y = this.boundsTopY;
        }

        if (x + width > this.boundsBottomX) {
            width = this.boundsBottomX - x;
        }

        if (y + height > this.boundsBottomY) {
            height = this.boundsBottomY - y;
        }

        const backgroundAlpha = 256 - alpha;
        const red = ((colour >> 16) & 0xff) * alpha;
        const green = ((colour >> 8) & 0xff) * alpha;
        const blue = (colour & 0xff) * alpha;

        let j3 = this.width2 - width; // wat
        let vertInc = 1;

        if (this.interlace) {
            vertInc = 2;
            j3 += this.width2;

            if ((y & 1) != 0) {
                y++;
                height--;
            }
        }

        let pixelIdx = x + y * this.width2;

        for (let i = 0; i < height; i += vertInc) {
            for (let j = -width; j < 0; j++) {
                const backgroundRed =
                    ((this.pixels[pixelIdx] >> 16) & 0xff) * backgroundAlpha;

                const backgroundGreen =
                    ((this.pixels[pixelIdx] >> 8) & 0xff) * backgroundAlpha;

                const backgroundBlue =
                    (this.pixels[pixelIdx] & 0xff) * backgroundAlpha;

                const newColour =
                    (((red + backgroundRed) >> 8) << 16) +
                    (((green + backgroundGreen) >> 8) << 8) +
                    ((blue + backgroundBlue) >> 8);

                this.pixels[pixelIdx++] = newColour;
            }

            pixelIdx += j3;
        }
    }

    drawGradient(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        colourTop: i32,
        colourBottom: i32
    ): void {
        if (x < this.boundsTopX) {
            width -= this.boundsTopX - x;
            x = this.boundsTopX;
        }

        if (x + width > this.boundsBottomX) {
            width = this.boundsBottomX - x;
        }

        const bottomRed = (colourBottom >> 16) & 0xff;
        const bottomGreen = (colourBottom >> 8) & 0xff;
        const bottomBlue = colourBottom & 0xff;
        const topRed = (colourTop >> 16) & 0xff;
        const topGreen = (colourTop >> 8) & 0xff;
        const topBlue = colourTop & 0xff;

        let i3 = this.width2 - width; // wat
        let vertInc = 1;

        if (this.interlace) {
            vertInc = 2;
            i3 += this.width2;

            if ((y & 1) != 0) {
                y++;
                height--;
            }
        }

        let pixelIdx = x + y * this.width2;

        for (let i = 0; i < height; i += vertInc) {
            if (i + y >= this.boundsTopY && i + y < this.boundsBottomY) {
                const newColour =
                    (((bottomRed * i + topRed * (height - i)) / height) << 16) +
                    (((bottomGreen * i + topGreen * (height - i)) / height) <<
                        8) +
                    (((bottomBlue * i + topBlue * (height - i)) /
                        height) as i32);

                for (let j = -width; j < 0; j++) {
                    this.pixels[pixelIdx++] = newColour;
                }

                pixelIdx += i3;
            } else {
                pixelIdx += this.width2;
            }
        }
    }

    drawBox(x: i32, y: i32, width: i32, height: i32, colour: i32): void {
        if (x < this.boundsTopX) {
            width -= this.boundsTopX - x;
            x = this.boundsTopX;
        }

        if (y < this.boundsTopY) {
            height -= this.boundsTopY - y;
            y = this.boundsTopY;
        }

        if (x + width > this.boundsBottomX) {
            width = this.boundsBottomX - x;
        }

        if (y + height > this.boundsBottomY) {
            height = this.boundsBottomY - y;
        }

        let j1 = this.width2 - width; // wat
        let vertInc = 1;

        if (this.interlace) {
            vertInc = 2;
            j1 += this.width2;

            if ((y & 1) != 0) {
                y++;
                height--;
            }
        }

        let pixelIdx = x + y * this.width2;

        for (let i = -height; i < 0; i += vertInc) {
            for (let j = -width; j < 0; j++) {
                this.pixels[pixelIdx++] = colour;
            }

            pixelIdx += j1;
        }
    }

    drawLineHoriz(x: i32, y: i32, width: i32, colour: i32): void {
        if (y < this.boundsTopY || y >= this.boundsBottomY) {
            return;
        }

        if (x < this.boundsTopX) {
            width -= this.boundsTopX - x;
            x = this.boundsTopX;
        }

        if (x + width > this.boundsBottomX) {
            width = this.boundsBottomX - x;
        }

        const start = x + y * this.width2;

        for (let i = 0; i < width; i++) {
            this.pixels[start + i] = colour;
        }
    }

    drawLineVert(x: i32, y: i32, height: i32, colour: i32): void {
        if (x < this.boundsTopX || x >= this.boundsBottomX) {
            return;
        }

        if (y < this.boundsTopY) {
            height -= this.boundsTopY - y;
            y = this.boundsTopY;
        }

        if (y + height > this.boundsBottomX) {
            height = this.boundsBottomY - y;
        }

        const start = x + y * this.width2;

        for (let i = 0; i < height; i++) {
            this.pixels[start + i * this.width2] = colour;
        }
    }

    drawBoxEdge(x: i32, y: i32, width: i32, height: i32, colour: i32): void {
        this.drawLineHoriz(x, y, width, colour);
        this.drawLineHoriz(x, y + height - 1, width, colour);
        this.drawLineVert(x, y, height, colour);
        this.drawLineVert(x + width - 1, y, height, colour);
    }

    setPixel(x: i32, y: i32, colour: i32): void {
        if (
            x < this.boundsTopX ||
            y < this.boundsTopY ||
            x >= this.boundsBottomX ||
            y >= this.boundsBottomY
        ) {
            return;
        }

        this.pixels[x + y * this.width2] = colour;
    }

    fadeToBlack(): void {
        const area = this.width2 * this.height2;

        for (let j = 0; j < area; j++) {
            let i = this.pixels[j] & 0xffffff;

            this.pixels[j] =
                ((i >>> 1) & 0x7f7f7f) +
                ((i >>> 2) & 0x3f3f3f) +
                ((i >>> 3) & 0x1f1f1f) +
                ((i >>> 4) & 0xf0f0f);
        }
    }

    drawLineAlpha(
        i: i32,
        j: i32,
        x: i32,
        y: i32,
        width: i32,
        height: i32
    ): void {
        for (let xx = x; xx < x + width; xx++) {
            for (let yy = y; yy < y + height; yy++) {
                let i2 = 0;
                let j2 = 0;
                let k2 = 0;
                let l2 = 0;

                for (let i3 = xx - i; i3 <= xx + i; i3++)
                    if (i3 >= 0 && i3 < this.width2) {
                        for (let j3 = yy - j; j3 <= yy + j; j3++) {
                            if (j3 >= 0 && j3 < this.height2) {
                                let k3 = this.pixels[i3 + this.width2 * j3];
                                i2 += (k3 >> 16) & 0xff;
                                j2 += (k3 >> 8) & 0xff;
                                k2 += k3 & 0xff;
                                l2++;
                            }
                        }
                    }

                this.pixels[xx + this.width2 * yy] =
                    ((i2 / l2) << 16) + ((j2 / l2) << 8) + ((k2 / l2) as i32);
            }
        }
    }

    clear(): void {
        for (let i = 0; i < this.surfacePixels.length; i++) {
            this.surfacePixels[i] = null;
            this.spriteWidth[i] = 0;
            this.spriteHeight[i] = 0;
            this.spriteColoursUsed[i] = null;
            this.spriteColourList[i] = null;
        }
    }

    parseSprite(
        spriteID: i32,
        spriteData: Int8Array,
        indexData: Int8Array,
        frameCount: i32
    ): void {
        let indexOffset = getUnsignedShort(spriteData, 0);

        const fullWidth = getUnsignedShort(indexData, indexOffset);
        indexOffset += 2;

        const fullHeight = getUnsignedShort(indexData, indexOffset);
        indexOffset += 2;

        const colourCount = indexData[indexOffset++] & 0xff;

        const colours = new Int32Array(colourCount);
        colours[0] = 0xff00ff;

        for (let i = 0; i < colourCount - 1; i++) {
            colours[i + 1] =
                ((indexData[indexOffset] & 0xff) << 16) +
                ((indexData[indexOffset + 1] & 0xff) << 8) +
                (indexData[indexOffset + 2] & 0xff);

            indexOffset += 3;
        }

        let spriteOffset = 2;

        for (let i = spriteID; i < spriteID + frameCount; i++) {
            this.spriteTranslateX[i] = indexData[indexOffset++] & 0xff;
            this.spriteTranslateY[i] = indexData[indexOffset++] & 0xff;

            this.spriteWidth[i] = getUnsignedShort(indexData, indexOffset);
            indexOffset += 2;

            this.spriteHeight[i] = getUnsignedShort(indexData, indexOffset);
            indexOffset += 2;

            const unknown = indexData[indexOffset++] & 0xff;
            const area = this.spriteWidth[i] * this.spriteHeight[i];

            this.spriteColoursUsed[i] = new Int8Array(area);
            this.spriteColourList[i] = colours;
            this.spriteWidthFull[i] = fullWidth;
            this.spriteHeightFull[i] = fullHeight;
            this.surfacePixels[i] = null;
            this.spriteTranslate[i] = false;

            if (
                this.spriteTranslateX[i] != 0 ||
                this.spriteTranslateY[i] != 0
            ) {
                this.spriteTranslate[i] = true;
            }

            if (unknown == 0) {
                for (let pixel = 0; pixel < area; pixel++) {
                    this.spriteColoursUsed[i]![pixel] =
                        spriteData[spriteOffset++];

                    if (this.spriteColoursUsed[i]![pixel] == 0) {
                        this.spriteTranslate[i] = true;
                    }
                }
            } else if (unknown == 1) {
                for (let x = 0; x < this.spriteWidth[i]; x++) {
                    for (let y = 0; y < this.spriteHeight[i]; y++) {
                        this.spriteColoursUsed[i]![
                            x + y * this.spriteWidth[i]
                        ] = spriteData[spriteOffset++];

                        if (
                            this.spriteColoursUsed[i]![
                                x + y * this.spriteWidth[i]
                            ] == 0
                        ) {
                            this.spriteTranslate[i] = true;
                        }
                    }
                }
            }
        }
    }

    readSleepWord(spriteID: i32, spriteData: Int8Array): void {
        const pixels = new Int32Array(SLEEP_WIDTH * SLEEP_HEIGHT);

        this.surfacePixels[spriteID] = pixels;
        this.spriteWidth[spriteID] = SLEEP_WIDTH;
        this.spriteHeight[spriteID] = SLEEP_HEIGHT;
        this.spriteTranslateX[spriteID] = 0;
        this.spriteTranslateY[spriteID] = 0;
        this.spriteWidthFull[spriteID] = SLEEP_WIDTH;
        this.spriteHeightFull[spriteID] = SLEEP_HEIGHT;
        this.spriteTranslate[spriteID] = false;

        let colour = 0;
        let packetOffset = 1;
        let pixelOffset = 0;

        for (pixelOffset = 0; pixelOffset < 255; ) {
            const length = spriteData[packetOffset++] & 0xff;

            for (let i = 0; i < length; i++) {
                pixels[pixelOffset++] = colour;
            }

            // alternate between black and white
            colour = 0xffffff - colour;
        }

        for (let y = 1; y < 40; y++) {
            for (let x = 0; x < 255; ) {
                const length = spriteData[packetOffset++] & 0xff;

                for (let i = 0; i < length; i++) {
                    pixels[pixelOffset] = pixels[pixelOffset - 255];
                    pixelOffset++;
                    x++;
                }

                if (x < 255) {
                    pixels[pixelOffset] = 0xffffff - pixels[pixelOffset - 255];
                    pixelOffset++;
                    x++;
                }
            }
        }
    }

    drawWorld(spriteID: i32): void {
        const area = this.spriteWidth[spriteID] * this.spriteHeight[spriteID];
        const spritePixels = this.surfacePixels[spriteID]!;
        const ai1 = new Int32Array(32768);

        for (let i = 0; i < area; i++) {
            let l = spritePixels[i];

            ai1[
                ((l & 0xf80000) >> 9) + ((l & 0xf800) >> 6) + ((l & 0xf8) >> 3)
            ]++;
        }

        const ai2 = new Int32Array(256);
        ai2[0] = 0xff00ff;

        const ai3 = new Int32Array(256);

        for (let i1 = 0; i1 < 32768; i1++) {
            let j1 = ai1[i1];

            if (j1 > ai3[255]) {
                for (let k1 = 1; k1 < 256; k1++) {
                    if (j1 <= ai3[k1]) {
                        continue;
                    }

                    for (let i2 = 255; i2 > k1; i2--) {
                        ai2[i2] = ai2[i2 - 1];
                        ai3[i2] = ai3[i2 - 1];
                    }

                    ai2[k1] =
                        ((i1 & 0x7c00) << 9) +
                        ((i1 & 0x3e0) << 6) +
                        ((i1 & 0x1f) << 3) +
                        0x40404;
                    ai3[k1] = j1;
                    break;
                }
            }

            ai1[i1] = -1;
        }

        const abyte0 = new Int8Array(area);

        for (let l1 = 0; l1 < area; l1++) {
            let j2 = spritePixels[l1];
            let k2 =
                ((j2 & 0xf80000) >> 9) +
                ((j2 & 0xf800) >> 6) +
                ((j2 & 0xf8) >> 3);
            let l2 = ai1[k2];

            if (l2 == -1) {
                let i3 = 999999999;
                let j3 = (j2 >> 16) & 0xff;
                let k3 = (j2 >> 8) & 0xff;
                let l3 = j2 & 0xff;

                for (let i4 = 0; i4 < 256; i4++) {
                    let j4 = ai2[i4];
                    let k4 = (j4 >> 16) & 0xff;
                    let l4 = (j4 >> 8) & 0xff;
                    let i5 = j4 & 0xff;
                    let j5 =
                        (j3 - k4) * (j3 - k4) +
                        (k3 - l4) * (k3 - l4) +
                        (l3 - i5) * (l3 - i5);

                    if (j5 < i3) {
                        i3 = j5;
                        l2 = i4;
                    }
                }

                ai1[k2] = l2;
            }

            abyte0[l1] = l2 & 0xff; // << 24 >> 24
        }

        this.spriteColoursUsed[spriteID] = abyte0;
        this.spriteColourList[spriteID] = ai2;
        this.surfacePixels[spriteID] = null;
    }

    loadSprite(spriteID: i32): void {
        if (!this.spriteColoursUsed[spriteID]) {
            return;
        }

        const area = this.spriteWidth[spriteID] * this.spriteHeight[spriteID];
        const idx = this.spriteColoursUsed[spriteID]!;
        const cols = this.spriteColourList[spriteID]!;
        const pixels = new Int32Array(area);

        for (let i = 0; i < area; i++) {
            let colour = cols[idx[i] & 0xff];

            if (colour == 0) {
                colour = 1;
            } else if (colour == 0xff00ff) {
                colour = 0;
            }

            pixels[i] = colour;
        }

        this.surfacePixels[spriteID] = pixels;
        this.spriteColoursUsed[spriteID] = null;
        this.spriteColourList[spriteID] = null;
    }

    drawSpriteMinimap(
        spriteID: i32,
        x: i32,
        y: i32,
        width: i32,
        height: i32
    ): void {
        this.spriteWidth[spriteID] = width;
        this.spriteHeight[spriteID] = height;
        this.spriteTranslate[spriteID] = false;
        this.spriteTranslateX[spriteID] = 0;
        this.spriteTranslateY[spriteID] = 0;
        this.spriteWidthFull[spriteID] = width;
        this.spriteHeightFull[spriteID] = height;
        this.surfacePixels[spriteID] = new Int32Array(width * height);

        let pixel = 0;

        for (let xx = x; xx < x + width; xx++) {
            for (let yy = y; yy < y + height; yy++) {
                this.surfacePixels[spriteID]![pixel++] = this.pixels[
                    xx + yy * this.width2
                ];
            }
        }
    }

    _drawSprite_from5(
        spriteID: i32,
        x: i32,
        y: i32,
        width: i32,
        height: i32
    ): void {
        this.spriteWidth[spriteID] = width;
        this.spriteHeight[spriteID] = height;
        this.spriteTranslate[spriteID] = false;
        this.spriteTranslateX[spriteID] = 0;
        this.spriteTranslateY[spriteID] = 0;
        this.spriteWidthFull[spriteID] = width;
        this.spriteHeightFull[spriteID] = height;
        this.surfacePixels[spriteID] = new Int32Array(width * height);

        let pixel = 0;

        for (let yy = y; yy < y + height; yy++) {
            for (let xx = x; xx < x + width; xx++) {
                this.surfacePixels[spriteID]![pixel++] = this.pixels[
                    xx + yy * this.width2
                ];
            }
        }
    }

    _drawSprite_from3(x: i32, y: i32, spriteID: i32): void {
        if (this.spriteTranslate[spriteID]) {
            x += this.spriteTranslateX[spriteID];
            y += this.spriteTranslateY[spriteID];
        }

        let rY = x + y * this.width2;
        let rX = 0;
        let height = this.spriteHeight[spriteID];
        let width = this.spriteWidth[spriteID];
        let w2 = this.width2 - width;
        let h2 = 0;

        if (y < this.boundsTopY) {
            let j2 = this.boundsTopY - y;
            height -= j2;
            y = this.boundsTopY;
            rX += j2 * width;
            rY += j2 * this.width2;
        }

        if (y + height >= this.boundsBottomY) {
            height -= y + height - this.boundsBottomY + 1;
        }

        if (x < this.boundsTopX) {
            let k2 = this.boundsTopX - x;
            width -= k2;
            x = this.boundsTopX;
            rX += k2;
            rY += k2;
            h2 += k2;
            w2 += k2;
        }

        if (x + width >= this.boundsBottomX) {
            let l2 = x + width - this.boundsBottomX + 1;
            width -= l2;
            h2 += l2;
            w2 += l2;
        }

        if (width <= 0 || height <= 0) {
            return;
        }

        let inc = 1;

        if (this.interlace) {
            inc = 2;
            w2 += this.width2;
            h2 += this.spriteWidth[spriteID];

            if ((y & 1) != 0) {
                rY += this.width2;
                height--;
            }
        }

        if (!this.surfacePixels[spriteID]) {
            this._drawSprite_from10A(
                this.pixels,
                this.spriteColoursUsed[spriteID],
                this.spriteColourList[spriteID],
                rX,
                rY,
                width,
                height,
                w2,
                h2,
                inc
            );
        } else {
            this._drawSprite_from10(
                this.pixels,
                this.surfacePixels[spriteID],
                0,
                rX,
                rY,
                width,
                height,
                w2,
                h2,
                inc
            );
        }
    }

    _spriteClipping_from5(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        spriteID: i32
    ): void {
        const spriteWidth = this.spriteWidth[spriteID];
        const spriteHeight = this.spriteHeight[spriteID];
        let l1 = 0;
        let i2 = 0;
        let j2 = ((spriteWidth << 16) / width) as i32;
        let k2 = ((spriteHeight << 16) / height) as i32;

        if (this.spriteTranslate[spriteID]) {
            const widthFull = this.spriteWidthFull[spriteID];
            const heightFull = this.spriteHeightFull[spriteID];

            j2 = ((widthFull << 16) / width) as i32;
            k2 = ((heightFull << 16) / height) as i32;

            x += ((this.spriteTranslateX[spriteID] * width + widthFull - 1) /
                widthFull) as i32;

            y += ((this.spriteTranslateY[spriteID] * height + heightFull - 1) /
                heightFull) as i32;

            if ((this.spriteTranslateX[spriteID] * width) % widthFull != 0) {
                l1 = (((widthFull -
                    ((this.spriteTranslateX[spriteID] * width) % widthFull)) <<
                    16) /
                    width) as i32;
            }

            if ((this.spriteTranslateY[spriteID] * height) % heightFull != 0) {
                i2 = (((heightFull -
                    ((this.spriteTranslateY[spriteID] * height) %
                        heightFull)) <<
                    16) /
                    height) as i32;
            }

            width = ((width * (this.spriteWidth[spriteID] - (l1 >> 16))) /
                widthFull) as i32;

            height = ((height * (this.spriteHeight[spriteID] - (i2 >> 16))) /
                heightFull) as i32;
        }

        let i3 = x + y * this.width2;
        let k3 = this.width2 - width;

        if (y < this.boundsTopY) {
            let l3 = this.boundsTopY - y;
            height -= l3;
            y = 0;
            i3 += l3 * this.width2;
            i2 += k2 * l3;
        }

        if (y + height >= this.boundsBottomY) {
            height -= y + height - this.boundsBottomY + 1;
        }

        if (x < this.boundsTopX) {
            let i4 = this.boundsTopX - x;
            width -= i4;
            x = 0;
            i3 += i4;
            l1 += j2 * i4;
            k3 += i4;
        }

        if (x + width >= this.boundsBottomX) {
            let j4 = x + width - this.boundsBottomX + 1;
            width -= j4;
            k3 += j4;
        }

        let yInc = 1;

        if (this.interlace) {
            yInc = 2;
            k3 += this.width2;
            k2 += k2;

            if ((y & 1) != 0) {
                i3 += this.width2;
                height--;
            }
        }

        this._plotScale_from13(
            this.pixels,
            this.surfacePixels[spriteID],
            0,
            l1,
            i2,
            i3,
            k3,
            width,
            height,
            j2,
            k2,
            spriteWidth,
            yInc
        );
    }

    _spriteClipping_from7(
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        id: i32,
        tx: i32,
        ty: i32
    ): void {
        if (id >= 50000) {
            this.mudclientref.drawTeleportBubble(x, y, w, h, id - 50000);
            return;
        }

        if (id >= 40000) {
            this.mudclientref.drawItem(x, y, w, h, id - 40000);
            return;
        }

        if (id >= 20000) {
            this.mudclientref.drawNPC(x, y, w, h, id - 20000, tx, ty);
            return;
        }

        if (id >= 5000) {
            this.mudclientref.drawPlayer(x, y, w, h, id - 5000, tx, ty);
            return;
        }

        this._spriteClipping_from5(x, y, w, h, id);
    }

    _drawSpriteAlpha_from4(x: i32, y: i32, spriteID: i32, alpha: i32): void {
        if (this.spriteTranslate[spriteID]) {
            x += this.spriteTranslateX[spriteID];
            y += this.spriteTranslateY[spriteID];
        }

        let size = x + y * this.width2;
        let j1 = 0;
        let height = this.spriteHeight[spriteID];
        let width = this.spriteWidth[spriteID];
        let extraXSpace = this.width2 - width;
        let j2 = 0;

        if (y < this.boundsTopY) {
            let k2 = this.boundsTopY - y;
            height -= k2;
            y = this.boundsTopY;
            j1 += k2 * width;
            size += k2 * this.width2;
        }

        if (y + height >= this.boundsBottomY) {
            height -= y + height - this.boundsBottomY + 1;
        }

        if (x < this.boundsTopX) {
            let l2 = this.boundsTopX - x;
            width -= l2;
            x = this.boundsTopX;
            j1 += l2;
            size += l2;
            j2 += l2;
            extraXSpace += l2;
        }

        if (x + width >= this.boundsBottomX) {
            let i3 = x + width - this.boundsBottomX + 1;
            width -= i3;
            j2 += i3;
            extraXSpace += i3;
        }

        if (width <= 0 || height <= 0) {
            return;
        }

        let yInc = 1;

        if (this.interlace) {
            yInc = 2;
            extraXSpace += this.width2;
            j2 += this.spriteWidth[spriteID];

            if ((y & 1) != 0) {
                size += this.width2;
                height--;
            }
        }

        if (!this.surfacePixels[spriteID]) {
            this._drawSpriteAlpha_from11A(
                this.pixels,
                this.spriteColoursUsed[spriteID],
                this.spriteColourList[spriteID],
                j1,
                size,
                width,
                height,
                extraXSpace,
                j2,
                yInc,
                alpha
            );
        } else {
            this._drawSpriteAlpha_from11(
                this.pixels,
                this.surfacePixels[spriteID],
                0,
                j1,
                size,
                width,
                height,
                extraXSpace,
                j2,
                yInc,
                alpha
            );
        }
    }

    drawActionBubble(
        x: i32,
        y: i32,
        scaleX: i32,
        scaleY: i32,
        spriteID: i32,
        alpha: i32
    ): void {
        const spriteWidth = this.spriteWidth[spriteID];
        const spriteHeight = this.spriteHeight[spriteID];
        let i2 = 0;
        let j2 = 0;
        let k2 = ((spriteWidth << 16) / scaleX) as i32;
        let l2 = ((spriteHeight << 16) / scaleY) as i32;

        if (this.spriteTranslate[spriteID]) {
            const widthFull = this.spriteWidthFull[spriteID];
            const heightFull = this.spriteHeightFull[spriteID];

            k2 = ((widthFull << 16) / scaleX) as i32;
            l2 = ((heightFull << 16) / scaleY) as i32;

            x += ((this.spriteTranslateX[spriteID] * scaleX + widthFull - 1) /
                widthFull) as i32;

            y += ((this.spriteTranslateY[spriteID] * scaleY + heightFull - 1) /
                heightFull) as i32;

            if ((this.spriteTranslateX[spriteID] * scaleX) % widthFull != 0) {
                i2 = (((widthFull -
                    ((this.spriteTranslateX[spriteID] * scaleX) % widthFull)) <<
                    16) /
                    scaleX) as i32;
            }

            if ((this.spriteTranslateY[spriteID] * scaleY) % heightFull != 0) {
                j2 = (((heightFull -
                    ((this.spriteTranslateY[spriteID] * scaleY) %
                        heightFull)) <<
                    16) /
                    scaleY) as i32;
            }

            scaleX = ((scaleX * (this.spriteWidth[spriteID] - (i2 >> 16))) /
                widthFull) as i32;

            scaleY = ((scaleY * (this.spriteHeight[spriteID] - (j2 >> 16))) /
                heightFull) as i32;
        }

        let j3 = x + y * this.width2;
        let l3 = this.width2 - scaleX;

        if (y < this.boundsTopY) {
            let i4 = this.boundsTopY - y;
            scaleY -= i4;
            y = 0;
            j3 += i4 * this.width2;
            j2 += l2 * i4;
        }

        if (y + scaleY >= this.boundsBottomY)
            scaleY -= y + scaleY - this.boundsBottomY + 1;

        if (x < this.boundsTopX) {
            let j4 = this.boundsTopX - x;
            scaleX -= j4;
            x = 0;
            j3 += j4;
            i2 += k2 * j4;
            l3 += j4;
        }

        if (x + scaleX >= this.boundsBottomX) {
            let k4 = x + scaleX - this.boundsBottomX + 1;
            scaleX -= k4;
            l3 += k4;
        }

        let yInc = 1;

        if (this.interlace) {
            yInc = 2;
            l3 += this.width2;
            l2 += l2;

            if ((y & 1) != 0) {
                j3 += this.width2;
                scaleY--;
            }
        }

        this.transparentScale(
            this.pixels,
            this.surfacePixels[spriteID],
            0,
            i2,
            j2,
            j3,
            l3,
            scaleX,
            scaleY,
            k2,
            l2,
            spriteWidth,
            yInc,
            alpha
        );
    }

    _spriteClipping_from6(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        spriteID: i32,
        colour: i32
    ): void {
        let k1 = this.spriteWidth[spriteID];
        let l1 = this.spriteHeight[spriteID];
        let i2 = 0;
        let j2 = 0;
        let k2 = ((k1 << 16) / width) as i32;
        let l2 = ((l1 << 16) / height) as i32;

        if (this.spriteTranslate[spriteID]) {
            const widthFull = this.spriteWidthFull[spriteID];
            const heightFull = this.spriteHeightFull[spriteID];

            k2 = ((widthFull << 16) / width) as i32;
            l2 = ((heightFull << 16) / height) as i32;

            x += ((this.spriteTranslateX[spriteID] * width + widthFull - 1) /
                widthFull) as i32;

            y += ((this.spriteTranslateY[spriteID] * height + heightFull - 1) /
                heightFull) as i32;

            if ((this.spriteTranslateX[spriteID] * width) % widthFull != 0) {
                i2 = (((widthFull -
                    ((this.spriteTranslateX[spriteID] * width) % widthFull)) <<
                    16) /
                    width) as i32;
            }

            if ((this.spriteTranslateY[spriteID] * height) % heightFull != 0) {
                j2 = (((heightFull -
                    ((this.spriteTranslateY[spriteID] * height) %
                        heightFull)) <<
                    16) /
                    height) as i32;
            }

            width = ((width * (this.spriteWidth[spriteID] - (i2 >> 16))) /
                widthFull) as i32;

            height = ((height * (this.spriteHeight[spriteID] - (j2 >> 16))) /
                heightFull) as i32;
        }

        let j3 = x + y * this.width2;
        let l3 = this.width2 - width;

        if (y < this.boundsTopY) {
            let i4 = this.boundsTopY - y;
            height -= i4;
            y = 0;
            j3 += i4 * this.width2;
            j2 += l2 * i4;
        }

        if (y + height >= this.boundsBottomY) {
            height -= y + height - this.boundsBottomY + 1;
        }

        if (x < this.boundsTopX) {
            let j4 = this.boundsTopX - x;
            width -= j4;
            x = 0;
            j3 += j4;
            i2 += k2 * j4;
            l3 += j4;
        }

        if (x + width >= this.boundsBottomX) {
            let k4 = x + width - this.boundsBottomX + 1;
            width -= k4;
            l3 += k4;
        }

        let yInc = 1;

        if (this.interlace) {
            yInc = 2;
            l3 += this.width2;
            l2 += l2;

            if ((y & 1) != 0) {
                j3 += this.width2;
                height--;
            }
        }

        this._plotScale_from14(
            this.pixels,
            this.surfacePixels[spriteID],
            0,
            i2,
            j2,
            j3,
            l3,
            width,
            height,
            k2,
            l2,
            k1,
            yInc,
            colour
        );
    }

    _drawSprite_from10(
        dest: Int32Array,
        src: Int32Array | null,
        i: i32,
        srcPos: i32,
        destPos: i32,
        width: i32,
        height: i32,
        j1: i32,
        k1: i32,
        yInc: i32
    ): void {
        let i2 = -(width >> 2);
        width = -(width & 3);

        for (let j2 = -height; j2 < 0; j2 += yInc) {
            for (let k2 = i2; k2 < 0; k2++) {
                i = src![srcPos++];

                if (i != 0) {
                    dest[destPos++] = i;
                } else {
                    destPos++;
                }

                i = src![srcPos++];

                if (i != 0) {
                    dest[destPos++] = i;
                } else {
                    destPos++;
                }

                i = src![srcPos++];

                if (i != 0) {
                    dest[destPos++] = i;
                } else {
                    destPos++;
                }

                i = src![srcPos++];

                if (i != 0) {
                    dest[destPos++] = i;
                } else {
                    destPos++;
                }
            }

            for (let l2 = width; l2 < 0; l2++) {
                i = src![srcPos++];

                if (i != 0) {
                    dest[destPos++] = i;
                } else {
                    destPos++;
                }
            }

            destPos += j1;
            srcPos += k1;
        }
    }

    _drawSprite_from10A(
        target: Int32Array,
        colourIdx: Int8Array | null,
        colours: Int32Array | null,
        srcPos: i32,
        destPos: i32,
        width: i32,
        height: i32,
        w2: i32,
        h2: i32,
        rowInc: i32
    ): void {
        let l1 = -(width >> 2);
        width = -(width & 3);

        for (let i2 = -height; i2 < 0; i2 += rowInc) {
            for (let j2 = l1; j2 < 0; j2++) {
                let byte0 = colourIdx![srcPos++];

                if (byte0 != 0) {
                    target[destPos++] = colours![byte0 & 0xff];
                } else {
                    destPos++;
                }

                byte0 = colourIdx![srcPos++];

                if (byte0 != 0) {
                    target[destPos++] = colours![byte0 & 0xff];
                } else {
                    destPos++;
                }

                byte0 = colourIdx![srcPos++];

                if (byte0 != 0) {
                    target[destPos++] = colours![byte0 & 0xff];
                } else {
                    destPos++;
                }

                byte0 = colourIdx![srcPos++];

                if (byte0 != 0) {
                    target[destPos++] = colours![byte0 & 0xff];
                } else {
                    destPos++;
                }
            }

            for (let k2 = width; k2 < 0; k2++) {
                let byte1 = colourIdx![srcPos++];

                if (byte1 != 0) {
                    target[destPos++] = colours![byte1 & 0xff];
                } else {
                    destPos++;
                }
            }

            destPos += w2;
            srcPos += h2;
        }
    }

    _plotScale_from13(
        dest: Int32Array,
        src: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        destPos: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        k2: i32
    ): void {
        let l2 = j;

        for (let i3 = -k1; i3 < 0; i3 += k2) {
            let j3 = (k >> 16) * j2;

            for (let k3 = -j1; k3 < 0; k3++) {
                i = src![(j >> 16) + j3];

                if (i != 0) {
                    dest[destPos++] = i;
                } else {
                    destPos++;
                }

                j += l1;
            }

            k += i2;
            j = l2;
            destPos += i1;
        }
    }

    _drawSpriteAlpha_from11(
        dest: Int32Array,
        src: Int32Array | null,
        i: i32,
        srcPos: i32,
        size: i32,
        width: i32,
        height: i32,
        extraXSpace: i32,
        k1: i32,
        yInc: i32,
        alpha: i32
    ): void {
        let j2 = 256 - alpha;

        for (let k2 = -height; k2 < 0; k2 += yInc) {
            for (let l2 = -width; l2 < 0; l2++) {
                i = src![srcPos++];

                if (i != 0) {
                    const i3 = dest[size];

                    dest[size++] =
                        ((((i & 0xff00ff) * alpha + (i3 & 0xff00ff) * j2) &
                            -16711936) +
                            (((i & 0xff00) * alpha + (i3 & 0xff00) * j2) &
                                0xff0000)) >>
                        8;
                } else {
                    size++;
                }
            }

            size += extraXSpace;
            srcPos += k1;
        }
    }

    _drawSpriteAlpha_from11A(
        dest: Int32Array,
        coloursUsed: Int8Array | null,
        colourList: Int32Array | null,
        listPos: i32,
        size: i32,
        width: i32,
        height: i32,
        extraXSpace: i32,
        j1: i32,
        yInc: i32,
        alpha: i32
    ): void {
        let i2 = 256 - alpha;

        for (let j2 = -height; j2 < 0; j2 += yInc) {
            for (let k2 = -width; k2 < 0; k2++) {
                let l2: i32 = coloursUsed![listPos++];

                if (l2 != 0) {
                    l2 = colourList![l2 & 0xff];
                    const i3 = dest[size];

                    dest[size++] =
                        ((((l2 & 0xff00ff) * alpha + (i3 & 0xff00ff) * i2) &
                            -0xff0100) +
                            (((l2 & 0xff00) * alpha + (i3 & 0xff00) * i2) &
                                0xff0000)) >>
                        8;
                } else {
                    size++;
                }
            }

            size += extraXSpace;
            listPos += j1;
        }
    }

    transparentScale(
        dest: Int32Array,
        src: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        destPos: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        yInc: i32,
        alpha: i32
    ): void {
        let i3 = 256 - alpha;
        let j3 = j;

        for (let k3 = -k1; k3 < 0; k3 += yInc) {
            let l3 = (k >> 16) * j2;

            for (let i4 = -j1; i4 < 0; i4++) {
                i = src![(j >> 16) + l3];

                if (i != 0) {
                    let j4 = dest[destPos];

                    dest[destPos++] =
                        ((((i & 0xff00ff) * alpha + (j4 & 0xff00ff) * i3) &
                            -0xff0100) +
                            (((i & 0xff00) * alpha + (j4 & 0xff00) * i3) &
                                0xff0000)) >>
                        8;
                } else {
                    destPos++;
                }

                j += l1;
            }

            k += i2;
            j = j3;
            destPos += i1;
        }
    }

    _plotScale_from14(
        dest: Int32Array,
        pixels: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32,
        width: i32,
        height: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        yInc: i32,
        colour: i32
    ): void {
        let i3 = (colour >> 16) & 0xff;
        let j3 = (colour >> 8) & 0xff;
        let k3 = colour & 0xff;

        const l3 = j;

        for (let i4 = -height; i4 < 0; i4 += yInc) {
            const j4 = (k >> 16) * j2;

            for (let k4 = -width; k4 < 0; k4++) {
                i = pixels![(j >> 16) + j4];

                if (i != 0) {
                    const l4 = (i >> 16) & 0xff;
                    const i5 = (i >> 8) & 0xff;
                    const j5 = i & 0xff;

                    if (l4 == i5 && i5 == j5) {
                        dest[l++] =
                            (((l4 * i3) >> 8) << 16) +
                            (((i5 * j3) >> 8) << 8) +
                            ((j5 * k3) >> 8);
                    } else {
                        dest[l++] = i;
                    }
                } else {
                    l++;
                }

                j += l1;
            }

            k += i2;
            j = l3;
            l += i1;
        }
    }

    drawMinimapSprite(
        x: i32,
        y: i32,
        sprite: i32,
        rotation: i32,
        scale: i32
    ): void {
        let j1 = this.width2;
        let k1 = this.height2;

        if (!this.sinCosCache) {
            this.sinCosCache = new Int32Array(512);

            for (let i = 0; i < 256; i++) {
                this.sinCosCache![i] = (Math.sin(i * 0.02454369) *
                    32768) as i32;

                this.sinCosCache![i + 256] = (Math.cos(i * 0.02454369) *
                    32768) as i32;
            }
        }

        let i2 = -((this.spriteWidthFull[sprite] / 2) as i32);
        let j2 = -((this.spriteHeightFull[sprite] / 2) as i32);

        if (this.spriteTranslate[sprite]) {
            i2 += this.spriteTranslateX[sprite];
            j2 += this.spriteTranslateY[sprite];
        }

        let k2 = i2 + this.spriteWidth[sprite];
        let l2 = j2 + this.spriteHeight[sprite];
        let i3 = k2;
        let j3 = j2;
        let k3 = i2;
        let l3 = l2;

        rotation &= 0xff;

        let i4 = this.sinCosCache![rotation] * scale;
        let j4 = this.sinCosCache![rotation + 256] * scale;
        let k4 = x + ((j2 * i4 + i2 * j4) >> 22);
        let l4 = y + ((j2 * j4 - i2 * i4) >> 22);
        let i5 = x + ((j3 * i4 + i3 * j4) >> 22);
        let j5 = y + ((j3 * j4 - i3 * i4) >> 22);
        let k5 = x + ((l2 * i4 + k2 * j4) >> 22);
        let l5 = y + ((l2 * j4 - k2 * i4) >> 22);
        let i6 = x + ((l3 * i4 + k3 * j4) >> 22);
        let j6 = y + ((l3 * j4 - k3 * i4) >> 22);

        if (scale == 192 && (rotation & 0x3f) == (Surface.anInt348 & 0x3f)) {
            Surface.anInt346++;
        } else if (scale == 128) {
            Surface.anInt348 = rotation;
        } else {
            Surface.anInt347++;
        }

        let k6 = l4;
        let l6 = l4;

        if (j5 < k6) {
            k6 = j5;
        } else if (j5 > l6) {
            l6 = j5;
        }

        if (l5 < k6) {
            k6 = l5;
        } else if (l5 > l6) {
            l6 = l5;
        }

        if (j6 < k6) {
            k6 = j6;
        } else if (j6 > l6) {
            l6 = j6;
        }

        if (k6 < this.boundsTopY) {
            k6 = this.boundsTopY;
        }

        if (l6 > this.boundsBottomY) {
            l6 = this.boundsBottomY;
        }

        if (!this.anIntArray340 || this.anIntArray340!.length != k1 + 1) {
            this.anIntArray340 = new Int32Array(k1 + 1);
            this.anIntArray341 = new Int32Array(k1 + 1);
            this.anIntArray342 = new Int32Array(k1 + 1);
            this.anIntArray343 = new Int32Array(k1 + 1);
            this.anIntArray344 = new Int32Array(k1 + 1);
            this.anIntArray345 = new Int32Array(k1 + 1);
        }

        for (let i7 = k6; i7 <= l6; i7++) {
            this.anIntArray340![i7] = 99999999;
            this.anIntArray341![i7] = -99999999;
        }

        let i8 = 0;
        let k8 = 0;
        let i9 = 0;
        let j9 = this.spriteWidth[sprite];
        let k9 = this.spriteHeight[sprite];

        i2 = 0;
        j2 = 0;
        i3 = j9 - 1;
        j3 = 0;
        k2 = j9 - 1;
        l2 = k9 - 1;
        k3 = 0;
        l3 = k9 - 1;

        if (j6 != l4) {
            i8 = (((i6 - k4) << 8) / (j6 - l4)) as i32;
            i9 = (((l3 - j2) << 8) / (j6 - l4)) as i32;
        }

        let j7 = 0;
        let k7 = 0;
        let l7 = 0;
        let l8 = 0;

        if (l4 > j6) {
            l7 = i6 << 8;
            l8 = l3 << 8;
            j7 = j6;
            k7 = l4;
        } else {
            l7 = k4 << 8;
            l8 = j2 << 8;
            j7 = l4;
            k7 = j6;
        }

        if (j7 < 0) {
            l7 -= i8 * j7;
            l8 -= i9 * j7;
            j7 = 0;
        }

        if (k7 > k1 - 1) {
            k7 = k1 - 1;
        }

        for (let i = j7; i <= k7; i++) {
            this.anIntArray340![i] = this.anIntArray341![i] = l7;

            l7 += i8;

            this.anIntArray342![i] = this.anIntArray343![i] = 0;
            this.anIntArray344![i] = this.anIntArray345![i] = l8;

            l8 += i9;
        }

        if (j5 != l4) {
            i8 = (((i5 - k4) << 8) / (j5 - l4)) as i32;
            k8 = (((i3 - i2) << 8) / (j5 - l4)) as i32;
        }

        let j8 = 0;

        if (l4 > j5) {
            l7 = i5 << 8;
            j8 = i3 << 8;
            j7 = j5;
            k7 = l4;
        } else {
            l7 = k4 << 8;
            j8 = i2 << 8;
            j7 = l4;
            k7 = j5;
        }

        if (j7 < 0) {
            l7 -= i8 * j7;
            j8 -= k8 * j7;
            j7 = 0;
        }

        if (k7 > k1 - 1) {
            k7 = k1 - 1;
        }

        for (let i = j7; i <= k7; i++) {
            if (l7 < this.anIntArray340![i]) {
                this.anIntArray340![i] = l7;
                this.anIntArray342![i] = j8;
                this.anIntArray344![i] = 0;
            }

            if (l7 > this.anIntArray341![i]) {
                this.anIntArray341![i] = l7;
                this.anIntArray343![i] = j8;
                this.anIntArray345![i] = 0;
            }

            l7 += i8;
            j8 += k8;
        }

        if (l5 != j5) {
            i8 = (((k5 - i5) << 8) / (l5 - j5)) as i32;
            i9 = (((l2 - j3) << 8) / (l5 - j5)) as i32;
        }

        if (j5 > l5) {
            l7 = k5 << 8;
            j8 = k2 << 8;
            l8 = l2 << 8;
            j7 = l5;
            k7 = j5;
        } else {
            l7 = i5 << 8;
            j8 = i3 << 8;
            l8 = j3 << 8;
            j7 = j5;
            k7 = l5;
        }

        if (j7 < 0) {
            l7 -= i8 * j7;
            l8 -= i9 * j7;
            j7 = 0;
        }

        if (k7 > k1 - 1) {
            k7 = k1 - 1;
        }

        for (let i = j7; i <= k7; i++) {
            if (l7 < this.anIntArray340![i]) {
                this.anIntArray340![i] = l7;
                this.anIntArray342![i] = j8;
                this.anIntArray344![i] = l8;
            }

            if (l7 > this.anIntArray341![i]) {
                this.anIntArray341![i] = l7;
                this.anIntArray343![i] = j8;
                this.anIntArray345![i] = l8;
            }

            l7 += i8;
            l8 += i9;
        }

        if (j6 != l5) {
            i8 = (((i6 - k5) << 8) / (j6 - l5)) as i32;
            k8 = (((k3 - k2) << 8) / (j6 - l5)) as i32;
        }

        if (l5 > j6) {
            l7 = i6 << 8;
            j8 = k3 << 8;
            l8 = l3 << 8;
            j7 = j6;
            k7 = l5;
        } else {
            l7 = k5 << 8;
            j8 = k2 << 8;
            l8 = l2 << 8;
            j7 = l5;
            k7 = j6;
        }

        if (j7 < 0) {
            l7 -= i8 * j7;
            j8 -= k8 * j7;
            j7 = 0;
        }

        if (k7 > k1 - 1) {
            k7 = k1 - 1;
        }

        for (let i = j7; i <= k7; i++) {
            if (l7 < this.anIntArray340![i]) {
                this.anIntArray340![i] = l7;
                this.anIntArray342![i] = j8;
                this.anIntArray344![i] = l8;
            }

            if (l7 > this.anIntArray341![i]) {
                this.anIntArray341![i] = l7;
                this.anIntArray343![i] = j8;
                this.anIntArray345![i] = l8;
            }

            l7 += i8;
            j8 += k8;
        }

        let l10 = k6 * j1;
        let ai = this.surfacePixels[sprite];

        for (let i = k6; i < l6; i++) {
            let j11 = this.anIntArray340![i] >> 8;
            let k11 = this.anIntArray341![i] >> 8;

            if (k11 - j11 <= 0) {
                l10 += j1;
            } else {
                let l11 = this.anIntArray342![i] << 9;

                let i12 = (((this.anIntArray343![i] << 9) - l11) /
                    (k11 - j11)) as i32;

                let j12 = this.anIntArray344![i] << 9;

                let k12 = (((this.anIntArray345![i] << 9) - j12) /
                    (k11 - j11)) as i32;

                if (j11 < this.boundsTopX) {
                    l11 += (this.boundsTopX - j11) * i12;
                    j12 += (this.boundsTopX - j11) * k12;
                    j11 = this.boundsTopX;
                }

                if (k11 > this.boundsBottomX) {
                    k11 = this.boundsBottomX;
                }

                if (!this.interlace || (i & 1) == 0) {
                    if (!this.spriteTranslate[sprite]) {
                        this.drawMinimap(
                            this.pixels,
                            ai,
                            0,
                            l10 + j11,
                            l11,
                            j12,
                            i12,
                            k12,
                            j11 - k11,
                            j9
                        );
                    } else {
                        this.drawMinimapTranslate(
                            this.pixels,
                            ai,
                            0,
                            l10 + j11,
                            l11,
                            j12,
                            i12,
                            k12,
                            j11 - k11,
                            j9
                        );
                    }
                }

                l10 += j1;
            }
        }
    }

    drawMinimap(
        ai: Int32Array,
        src: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32
    ): void {
        for (i = k1; i < 0; i++) {
            this.pixels[j++] = src![(k >> 17) + (l >> 17) * l1];
            k += i1;
            l += j1;
        }
    }

    drawMinimapTranslate(
        ai: Int32Array,
        src: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32
    ): void {
        for (let i2 = k1; i2 < 0; i2++) {
            i = src![(k >> 17) + (l >> 17) * l1];

            if (i != 0) {
                this.pixels[j++] = i;
            } else {
                j++;
            }

            k += i1;
            l += j1;
        }
    }

    _spriteClipping_from9(
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        sprite: i32,
        colour1: i32,
        colour2: i32,
        l1: i32,
        flag: bool
    ): void {
        if (colour1 == 0) {
            colour1 = 0xffffff;
        }

        if (colour2 == 0) {
            colour2 = 0xffffff;
        }

        const width = this.spriteWidth[sprite];
        const height = this.spriteHeight[sprite];
        let k2 = 0;
        let l2 = 0;
        let i3 = l1 << 16;
        let j3 = ((width << 16) / w) as i32;
        let k3 = ((height << 16) / h) as i32;
        let l3 = -(((l1 << 16) / h) as i32);

        if (this.spriteTranslate[sprite]) {
            const fullWidth = this.spriteWidthFull[sprite];
            const fullHeight = this.spriteHeightFull[sprite];

            j3 = ((fullWidth << 16) / w) as i32;
            k3 = ((fullHeight << 16) / h) as i32;

            let j5 = this.spriteTranslateX[sprite];
            let k5 = this.spriteTranslateY[sprite];

            if (flag) {
                j5 = fullWidth - this.spriteWidth[sprite] - j5;
            }

            x += ((j5 * w + fullWidth - 1) / fullWidth) as i32;

            let l5 = ((k5 * h + fullHeight - 1) / fullHeight) as i32;

            y += l5;
            i3 += l5 * l3;

            if ((j5 * w) % fullWidth != 0) {
                k2 = (((fullWidth - ((j5 * w) % fullWidth)) << 16) / w) as i32;
            }

            if ((k5 * h) % fullHeight != 0) {
                l2 = (((fullHeight - ((k5 * h) % fullHeight)) << 16) /
                    h) as i32;
            }

            w = (((this.spriteWidth[sprite] << 16) - k2 + j3 - 1) / j3) as i32;
            h = (((this.spriteHeight[sprite] << 16) - l2 + k3 - 1) / k3) as i32;
        }

        let j4 = y * this.width2;
        i3 += x << 16;

        if (y < this.boundsTopY) {
            let l4 = this.boundsTopY - y;
            h -= l4;
            y = this.boundsTopY;
            j4 += l4 * this.width2;
            l2 += k3 * l4;
            i3 += l3 * l4;
        }

        if (y + h >= this.boundsBottomY) {
            h -= y + h - this.boundsBottomY + 1;
        }

        let i5 = (j4 / this.width2) & 1;

        if (!this.interlace) {
            i5 = 2;
        }

        if (colour2 == 0xffffff) {
            if (this.surfacePixels[sprite] != null) {
                if (!flag) {
                    this._transparentSpritePlot_from15(
                        this.pixels,
                        this.surfacePixels[sprite],
                        0,
                        k2,
                        l2,
                        j4,
                        w,
                        h,
                        j3,
                        k3,
                        width,
                        colour1,
                        i3,
                        l3,
                        i5
                    );

                    return;
                } else {
                    this._transparentSpritePlot_from15(
                        this.pixels,
                        this.surfacePixels[sprite],
                        0,
                        (this.spriteWidth[sprite] << 16) - k2 - 1,
                        l2,
                        j4,
                        w,
                        h,
                        -j3,
                        k3,
                        width,
                        colour1,
                        i3,
                        l3,
                        i5
                    );

                    return;
                }
            }

            if (!flag) {
                this._transparentSpritePlot_from16A(
                    this.pixels,
                    this.spriteColoursUsed[sprite],
                    this.spriteColourList[sprite],
                    0,
                    k2,
                    l2,
                    j4,
                    w,
                    h,
                    j3,
                    k3,
                    width,
                    colour1,
                    i3,
                    l3,
                    i5
                );

                return;
            } else {
                this._transparentSpritePlot_from16A(
                    this.pixels,
                    this.spriteColoursUsed[sprite],
                    this.spriteColourList[sprite],
                    0,
                    (this.spriteWidth[sprite] << 16) - k2 - 1,
                    l2,
                    j4,
                    w,
                    h,
                    -j3,
                    k3,
                    width,
                    colour1,
                    i3,
                    l3,
                    i5
                );

                return;
            }
        }

        if (this.surfacePixels[sprite]) {
            if (!flag) {
                this._transparentSpritePlot_from16(
                    this.pixels,
                    this.surfacePixels[sprite],
                    0,
                    k2,
                    l2,
                    j4,
                    w,
                    h,
                    j3,
                    k3,
                    width,
                    colour1,
                    colour2,
                    i3,
                    l3,
                    i5
                );

                return;
            } else {
                this._transparentSpritePlot_from16(
                    this.pixels,
                    this.surfacePixels[sprite],
                    0,
                    (this.spriteWidth[sprite] << 16) - k2 - 1,
                    l2,
                    j4,
                    w,
                    h,
                    -j3,
                    k3,
                    width,
                    colour1,
                    colour2,
                    i3,
                    l3,
                    i5
                );

                return;
            }
        }

        if (!flag) {
            this._transparentSpritePlot_from17(
                this.pixels,
                this.spriteColoursUsed[sprite],
                this.spriteColourList[sprite],
                0,
                k2,
                l2,
                j4,
                w,
                h,
                j3,
                k3,
                width,
                colour1,
                colour2,
                i3,
                l3,
                i5
            );
        } else {
            this._transparentSpritePlot_from17(
                this.pixels,
                this.spriteColoursUsed[sprite],
                this.spriteColourList[sprite],
                0,
                (this.spriteWidth[sprite] << 16) - k2 - 1,
                l2,
                j4,
                w,
                h,
                -j3,
                k3,
                width,
                colour1,
                colour2,
                i3,
                l3,
                i5
            );
        }
    }

    _transparentSpritePlot_from15(
        dest: Int32Array,
        src: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        destPos: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        k2: i32,
        l2: i32,
        i3: i32
    ): void {
        let i4 = (j2 >> 16) & 0xff;
        let j4 = (j2 >> 8) & 0xff;
        let k4 = j2 & 0xff;
        let l4 = j;

        for (let i5 = -j1; i5 < 0; i5++) {
            let j5 = (k >> 16) * i2;
            let k5 = k2 >> 16;
            let l5 = i1;

            if (k5 < this.boundsTopX) {
                let i6 = this.boundsTopX - k5;

                l5 -= i6;
                k5 = this.boundsTopX;
                j += k1 * i6;
            }

            if (k5 + l5 >= this.boundsBottomX) {
                let j6 = k5 + l5 - this.boundsBottomX;

                l5 -= j6;
            }

            i3 = 1 - i3;

            if (i3 != 0) {
                for (let k6 = k5; k6 < k5 + l5; k6++) {
                    i = src![(j >> 16) + j5];

                    if (i != 0) {
                        let j3 = (i >> 16) & 0xff;
                        let k3 = (i >> 8) & 0xff;
                        let l3 = i & 0xff;

                        if (j3 == k3 && k3 == l3) {
                            dest[k6 + destPos] =
                                (((j3 * i4) >> 8) << 16) +
                                (((k3 * j4) >> 8) << 8) +
                                ((l3 * k4) >> 8);
                        } else {
                            dest[k6 + destPos] = i;
                        }
                    }

                    j += k1;
                }
            }

            k += l1;
            j = l4;
            destPos += this.width2;
            k2 += l2;
        }
    }

    _transparentSpritePlot_from16(
        dest: Int32Array,
        src: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        destPos: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        k2: i32,
        l2: i32,
        i3: i32,
        j3: i32
    ): void {
        const j4 = (j2 >> 16) & 0xff;
        const k4 = (j2 >> 8) & 0xff;
        const l4 = j2 & 0xff;
        const i5 = (k2 >> 16) & 0xff;
        const j5 = (k2 >> 8) & 0xff;
        const k5 = k2 & 0xff;
        const l5 = j;

        for (let i6 = -j1; i6 < 0; i6++) {
            let j6 = (k >> 16) * i2;
            let k6 = l2 >> 16;
            let l6 = i1;

            if (k6 < this.boundsTopX) {
                let i7 = this.boundsTopX - k6;
                l6 -= i7;
                k6 = this.boundsTopX;
                j += k1 * i7;
            }

            if (k6 + l6 >= this.boundsBottomX) {
                let j7 = k6 + l6 - this.boundsBottomX;
                l6 -= j7;
            }

            j3 = 1 - j3;

            if (j3 != 0) {
                for (let k7 = k6; k7 < k6 + l6; k7++) {
                    i = src![(j >> 16) + j6];

                    if (i != 0) {
                        let k3 = (i >> 16) & 0xff;
                        let l3 = (i >> 8) & 0xff;
                        let i4 = i & 0xff;

                        if (k3 == l3 && l3 == i4) {
                            dest[k7 + destPos] =
                                (((k3 * j4) >> 8) << 16) +
                                (((l3 * k4) >> 8) << 8) +
                                ((i4 * l4) >> 8);
                        } else if (k3 == 255 && l3 == i4) {
                            dest[k7 + destPos] =
                                (((k3 * i5) >> 8) << 16) +
                                (((l3 * j5) >> 8) << 8) +
                                ((i4 * k5) >> 8);
                        } else {
                            dest[k7 + destPos] = i;
                        }
                    }

                    j += k1;
                }
            }

            k += l1;
            j = l5;
            destPos += this.width2;
            l2 += i3;
        }
    }

    _transparentSpritePlot_from16A(
        dest: Int32Array,
        coloursUsed: Int8Array | null,
        colourList: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        k2: i32,
        l2: i32,
        i3: i32
    ): void {
        const i4 = (j2 >> 16) & 0xff;
        const j4 = (j2 >> 8) & 0xff;
        const k4 = j2 & 0xff;
        const l4 = j;

        for (let i5 = -j1; i5 < 0; i5++) {
            let j5 = (k >> 16) * i2;
            let k5 = k2 >> 16;
            let l5 = i1;

            if (k5 < this.boundsTopX) {
                let i6 = this.boundsTopX - k5;
                l5 -= i6;
                k5 = this.boundsTopX;
                j += k1 * i6;
            }

            if (k5 + l5 >= this.boundsBottomX) {
                let j6 = k5 + l5 - this.boundsBottomX;
                l5 -= j6;
            }

            i3 = 1 - i3;

            if (i3 != 0) {
                for (let k6 = k5; k6 < k5 + l5; k6++) {
                    i = coloursUsed![(j >> 16) + j5] & 0xff;

                    if (i != 0) {
                        i = colourList![i];

                        let j3 = (i >> 16) & 0xff;
                        let k3 = (i >> 8) & 0xff;
                        let l3 = i & 0xff;

                        if (j3 == k3 && k3 == l3) {
                            dest[k6 + l] =
                                (((j3 * i4) >> 8) << 16) +
                                (((k3 * j4) >> 8) << 8) +
                                ((l3 * k4) >> 8);
                        } else {
                            dest[k6 + l] = i;
                        }
                    }

                    j += k1;
                }
            }

            k += l1;
            j = l4;
            l += this.width2;
            k2 += l2;
        }
    }

    _transparentSpritePlot_from17(
        dest: Int32Array,
        coloursUsed: Int8Array | null,
        colourList: Int32Array | null,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32,
        j1: i32,
        k1: i32,
        l1: i32,
        i2: i32,
        j2: i32,
        k2: i32,
        l2: i32,
        i3: i32,
        j3: i32
    ): void {
        const j4 = (j2 >> 16) & 0xff;
        const k4 = (j2 >> 8) & 0xff;
        const l4 = j2 & 0xff;
        const i5 = (k2 >> 16) & 0xff;
        const j5 = (k2 >> 8) & 0xff;
        const k5 = k2 & 0xff;
        const l5 = j;

        for (let i6 = -j1; i6 < 0; i6++) {
            let j6 = (k >> 16) * i2;
            let k6 = l2 >> 16;
            let l6 = i1;

            if (k6 < this.boundsTopX) {
                let i7 = this.boundsTopX - k6;
                l6 -= i7;
                k6 = this.boundsTopX;
                j += k1 * i7;
            }

            if (k6 + l6 >= this.boundsBottomX) {
                let j7 = k6 + l6 - this.boundsBottomX;
                l6 -= j7;
            }

            j3 = 1 - j3;

            if (j3 != 0) {
                for (let k7 = k6; k7 < k6 + l6; k7++) {
                    i = coloursUsed![(j >> 16) + j6] & 0xff;

                    if (i != 0) {
                        i = colourList![i];

                        const k3 = (i >> 16) & 0xff;
                        const l3 = (i >> 8) & 0xff;
                        const i4 = i & 0xff;

                        if (k3 == l3 && l3 == i4) {
                            dest[k7 + l] =
                                (((k3 * j4) >> 8) << 16) +
                                (((l3 * k4) >> 8) << 8) +
                                ((i4 * l4) >> 8);
                        } else if (k3 == 255 && l3 == i4) {
                            dest[k7 + l] =
                                (((k3 * i5) >> 8) << 16) +
                                (((l3 * j5) >> 8) << 8) +
                                ((i4 * k5) >> 8);
                        } else {
                            dest[k7 + l] = i;
                        }
                    }

                    j += k1;
                }
            }

            k += l1;
            j = l5;
            l += this.width2;
            l2 += i3;
        }
    }

    drawStringRight(
        text: string,
        x: i32,
        y: i32,
        font: i32,
        colour: i32
    ): void {
        this.drawString(text, x - this.textWidth(text, font), y, font, colour);
    }

    drawStringCenter(
        text: string,
        x: i32,
        y: i32,
        font: i32,
        colour: i32
    ): void {
        this.drawString(
            text,
            x - ((this.textWidth(text, font) / 2) as i32),
            y,
            font,
            colour
        );
    }

    drawParagraph(
        text: string,
        x: i32,
        y: i32,
        font: i32,
        colour: i32,
        max: i32
    ): void {
        let width = 0;
        const fontData = Surface.gameFonts[font];
        let start = 0;
        let end = 0;

        for (let index = 0; index < text.length; index++) {
            if (
                text.charCodeAt(index) == C_AT &&
                index + 4 < text.length &&
                text.charCodeAt(index + 4) == C_AT
            ) {
                index += 4;
            } else if (
                text.charCodeAt(index) == C_TILDE &&
                index + 4 < text.length &&
                text.charCodeAt(index + 4) == C_TILDE
            ) {
                index += 4;
            } else {
                width +=
                    fontData[
                        Surface.characterWidth[text.charCodeAt(index)] + 7
                    ];
            }

            if (text.charCodeAt(index) == C_SPACE) {
                end = index;
            }

            if (text.charCodeAt(index) == C_PERCENT) {
                end = index;
                width = 1000;
            }

            if (width > max) {
                if (end <= start) {
                    end = index;
                }

                this.drawStringCenter(
                    text.slice(start, end),
                    x,
                    y,
                    font,
                    colour
                );

                width = 0;
                start = index = end + 1;

                y += this.textHeight(font);
            }
        }

        if (width > 0) {
            this.drawStringCenter(text.slice(start), x, y, font, colour);
        }
    }

    drawString(text: string, x: i32, y: i32, font: i32, colour: i32): void {
        const fontData = Surface.gameFonts[font];

        for (let i = 0; i < text.length; i++) {
            if (
                text.charCodeAt(i) == C_AT &&
                i + 4 < text.length &&
                text.charCodeAt(i + 4) == C_AT
            ) {
                if (text.slice(i + 1, i + 4).toLowerCase() == 'red') {
                    colour = 0xff0000;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'lre') {
                    colour = 0xff9040;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'yel') {
                    colour = 0xffff00;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'gre') {
                    colour = 0x00ff00;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'blu') {
                    colour = 0x0000ff;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'cya') {
                    colour = 0x00ffff;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'mag') {
                    colour = 0xff00ff;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'whi') {
                    colour = 0xffffff;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'bla') {
                    colour = 0;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'dre') {
                    colour = 0xc00000;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'ora') {
                    colour = 0xff9040;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'ran') {
                    colour = (Math.random() * 0xffffff) as i32;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'or1') {
                    colour = 0xffb000;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'or2') {
                    colour = 0xff7000;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'or3') {
                    colour = 0xff3000;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'gr1') {
                    colour = 0xc0ff00;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'gr2') {
                    colour = 0x80ff00;
                } else if (text.slice(i + 1, i + 4).toLowerCase() == 'gr3') {
                    colour = 0x40ff00;
                }

                i += 4;
            } else if (
                text.charCodeAt(i) == C_TILDE &&
                i + 4 < text.length &&
                text.charCodeAt(i + 4) == C_TILDE
            ) {
                let c = text.charCodeAt(i + 1);
                let c1 = text.charCodeAt(i + 2);
                let c2 = text.charCodeAt(i + 3);

                if (
                    c >= C_0 &&
                    c <= C_9 &&
                    c1 >= C_0 &&
                    c1 <= C_9 &&
                    c2 >= C_0 &&
                    c2 <= C_9
                ) {
                    x = I32.parseInt(text.substring(i + 1, i + 4));
                }

                i += 4;
            } else {
                const width = Surface.characterWidth[text.charCodeAt(i)];

                if (this.loggedIn && colour != 0) {
                    this.drawCharacter(width, x + 1, y, 0, fontData);
                    this.drawCharacter(width, x, y + 1, 0, fontData);
                }

                this.drawCharacter(width, x, y, colour, fontData);

                x += fontData[width + 7];
            }
        }
    }

    drawCharacter(
        width: i32,
        x: i32,
        y: i32,
        colour: i32,
        fontData: Int8Array
    ): void {
        let i1: i32 = x + fontData[width + 5];
        let j1: i32 = y - fontData[width + 6];
        let k1: i32 = fontData[width + 3];
        let l1: i32 = fontData[width + 4];

        let i2: i32 =
            fontData[width] * 16384 +
            fontData[width + 1] * 128 +
            fontData[width + 2];

        let j2 = i1 + j1 * this.width2;
        let k2 = this.width2 - k1;
        let l2 = 0;

        if (j1 < this.boundsTopY) {
            let i3 = this.boundsTopY - j1;
            l1 -= i3;
            j1 = this.boundsTopY;
            i2 += i3 * k1;
            j2 += i3 * this.width2;
        }

        if (j1 + l1 >= this.boundsBottomY) {
            l1 -= j1 + l1 - this.boundsBottomY + 1;
        }

        if (i1 < this.boundsTopX) {
            let j3 = this.boundsTopX - i1;
            k1 -= j3;
            i1 = this.boundsTopX;
            i2 += j3;
            j2 += j3;
            l2 += j3;
            k2 += j3;
        }

        if (i1 + k1 >= this.boundsBottomX) {
            let k3 = i1 + k1 - this.boundsBottomX + 1;
            k1 -= k3;
            l2 += k3;
            k2 += k3;
        }

        if (k1 > 0 && l1 > 0) {
            this.plotLetter(
                this.pixels,
                fontData,
                colour,
                i2,
                j2,
                k1,
                l1,
                k2,
                l2
            );
        }
    }

    plotLetter(
        dest: Int32Array,
        fontData: Int8Array,
        i: i32,
        j: i32,
        k: i32,
        l: i32,
        i1: i32,
        j1: i32,
        k1: i32
    ): void {
        const l1 = -(l >> 2);

        l = -(l & 3);

        for (let i2 = -i1; i2 < 0; i2++) {
            for (let j2 = l1; j2 < 0; j2++) {
                if (fontData[j++] != 0) {
                    dest[k++] = i;
                } else {
                    k++;
                }

                if (fontData[j++] != 0) {
                    dest[k++] = i;
                } else {
                    k++;
                }

                if (fontData[j++] != 0) {
                    dest[k++] = i;
                } else {
                    k++;
                }

                if (fontData[j++] != 0) {
                    dest[k++] = i;
                } else {
                    k++;
                }
            }

            for (let k2 = l; k2 < 0; k2++) {
                if (fontData[j++] != 0) {
                    dest[k++] = i;
                } else {
                    k++;
                }
            }

            k += j1;
            j += k1;
        }
    }

    textHeight(fontID: i32): i32 {
        switch (fontID) {
            case 0:
                return 12;
            case 1:
                return 14;
            case 2:
                return 14;
            case 3:
                return 15;
            case 4:
                return 15;
            case 5:
                return 19;
            case 6:
                return 24;
            case 7:
                return 29;
            default:
                return this.textHeightFont(fontID);
        }
    }

    textHeightFont(fontID: i32): i32 {
        if (fontID == 0) {
            return Surface.gameFonts[fontID][8] - 2;
        }

        return Surface.gameFonts[fontID][8] - 1;
    }

    textWidth(text: string, fontID: i32): i32 {
        let total = 0;
        const font = Surface.gameFonts[fontID];

        for (let i = 0; i < text.length; i++) {
            if (
                text.charCodeAt(i) == C_AT &&
                i + 4 < text.length &&
                text.charCodeAt(i + 4) == C_AT
            ) {
                i += 4;
            } else if (
                text.charCodeAt(i) == C_TILDE &&
                i + 4 < text.length &&
                text.charCodeAt(i + 4) == C_TILDE
            ) {
                i += 4;
            } else {
                total += font[Surface.characterWidth[text.charCodeAt(i)] + 7];
            }
        }

        return total;
    }

    drawTabs(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        tabs: StaticArray<string>,
        selected: i32
    ): void {
        const tabWidth = (width / tabs.length) as i32;
        let offsetX = 0;

        for (let i = 0; i < tabs.length; i += 1) {
            const tabColour = selected == i ? LIGHT_GREY : DARK_GREY;

            this.drawBoxAlpha(x + offsetX, y, tabWidth, height, tabColour, 128);

            this.drawStringCenter(
                tabs[i],
                x + offsetX + ((tabWidth / 2) as i32),
                y + 16,
                4,
                BLACK
            );

            if (i > 0) {
                this.drawLineVert(x + offsetX, y, height, BLACK);
            }

            offsetX += tabWidth;
        }

        this.drawLineHoriz(x, y + height, width, BLACK);
    }
}

const CHAR_SET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"£$%^&*()' +
    "-_=+[{]};:'@#~,<.>/?\\| ";

for (let i = 0; i < Surface.characterWidth.length; i++) {
    let charCode = CHAR_SET.indexOf(String.fromCharCode(i));

    if (charCode == -1) {
        charCode = 74;
    }

    Surface.characterWidth[i] = charCode * 9;
}
