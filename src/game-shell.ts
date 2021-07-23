//import Font from './lib/graphics/font';
import KeyCodes from './lib/keycodes';

const CHAR_MAP =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"\243$%^&' +
    "*()-_=+[{]};:'@#~,<.>/?\\| ";

class Options {
    middleClickCamera: false;
    mouseWheel: false;
    resetCompass: false;
    zoomCamera: false;
    showRoofs: true;
    remainingExperience: false;
    totalExperience: false;
    wordFilter: true;
    accountManagement: true;
    fpsCounter: true;
    retryLoginOnDisconnect: true;
    mobile: false;
}

export default class GameShell {
    options: Options = new Options();
    middleButtonDown: bool;
    mouseScrollDelta: i32;
    mouseActionTimeout: i32;
    mouseX: i32;
    mouseY: i32;
    mouseButtonDown: i32;
    lastMouseButtonDown: i32;
    stopTimeout: i32;
    interlaceTimer: i32;
    loadingProgressPercent: i32;
    appletWidth: i32 = 512;
    appletHeight: i32 = 346;
    targetFPS: i32 = 20;
    maxDrawTime: i32 = 1000;
    loadingStep: i32 = 1;
    hasRefererLogoNotUsed: bool;
    loadingProgessText: string = 'Loading';
    /*fontTimesRoman15: Font = new Font('Times New Roman', 0, 15);
    fontHelvetica13b: Font = new Font('Helvetica', Font.BOLD, 13);
    fontHelvetica12: Font = new Font('Helvetica', 0, 12);*/
    keyLeft: bool;
    keyRight: bool;
    keyUp: bool;
    keyDown: bool;
    keySpace: bool;
    keyHome: bool;
    keyPgUp: bool;
    keyPgDown: bool;
    ctrl: bool;
    threadSleep: i32 = 1;
    interlace: bool;
    inputTextCurrent: string = '';
    inputTextFinal: string = '';
    inputPMCurrent: string = '';
    inputPMFinal: string = '';
    originMouseX: i32;
    originRotation: i32;
    cameraRotation: i32 = 128;
    mobileInputCaret: i32;
    fps: i32;

    handleKeyPress(charCode: i32): void {}

    handleMouseDown(button: i32, x: i32, y: i32): void {}

    keyPressed(code: i32, charCode: i32): void {
        if ([8, 10, 13, 9].includes(code)) {
            charCode = code;
        }

        this.handleKeyPress(charCode);

        if (code == KeyCodes.LeftArrow) {
            this.keyLeft = true;
        } else if (code == KeyCodes.RightArrow) {
            this.keyRight = true;
        } else if (code == KeyCodes.UpArrow) {
            this.keyUp = true;
        } else if (code == KeyCodes.DownArrow) {
            this.keyDown = true;
        } else if (code == KeyCodes.Space) {
            this.keySpace = true;
        } else if (code == KeyCodes.F1) {
            this.interlace = !this.interlace;
        } else if (code == KeyCodes.Home) {
            this.keyHome = true;
        } else if (code == KeyCodes.PageUp) {
            this.keyPgUp = true;
        } else if (code == KeyCodes.PageDown) {
            this.keyPgDown = true;
        } else if (code == KeyCodes.Ctrl) {
            this.ctrl = true;
        }

        let foundText = false;

        for (let i = 0; i < CHAR_MAP.length; i++) {
            if (CHAR_MAP.charCodeAt(i) == charCode) {
                foundText = true;
                break;
            }
        }

        if (foundText) {
            if (this.inputTextCurrent.length < 20) {
                this.inputTextCurrent += String.fromCharCode(charCode);
            }

            if (this.inputPMCurrent.length < 80) {
                this.inputPMCurrent += String.fromCharCode(charCode);
            }
        }

        if (code == KeyCodes.Enter) {
            this.inputTextFinal = this.inputTextCurrent;
            this.inputPMFinal = this.inputPMCurrent;
        } else if (code == KeyCodes.Backspace) {
            if (this.inputTextCurrent.length > 0) {
                this.inputTextCurrent = this.inputTextCurrent.substring(
                    0,
                    this.inputTextCurrent.length - 1
                );
            }

            if (this.inputPMCurrent.length > 0) {
                this.inputPMCurrent = this.inputPMCurrent.substring(
                    0,
                    this.inputPMCurrent.length - 1
                );
            }
        }
    }

    keyReleased(code: i32): void {
        if (code == KeyCodes.LeftArrow) {
            this.keyLeft = false;
        } else if (code == KeyCodes.RightArrow) {
            this.keyRight = false;
        } else if (code == KeyCodes.UpArrow) {
            this.keyUp = false;
        } else if (code == KeyCodes.DownArrow) {
            this.keyDown = false;
        } else if (code == KeyCodes.Space) {
            this.keySpace = false;
        } else if (code == KeyCodes.Home) {
            this.keyHome = false;
        } else if (code == KeyCodes.PageUp) {
            this.keyPgUp = false;
        } else if (code == KeyCodes.PageDown) {
            this.keyPgDown = false;
        } else if (code == KeyCodes.Ctrl) {
            this.ctrl = false;
        }
    }

    mouseMoved(x: i32, y: i32): void {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseActionTimeout = 0;
    }

    mouseReleased(x: i32, y: i32, button: i32): void {
        this.mouseX = x;
        this.mouseY = y;

        this.mouseButtonDown = 0;

        if (button == 1) {
            this.middleButtonDown = false;
        }
    }

    mouseOut(x: i32, y: i32): void {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseButtonDown = 0;
        this.middleButtonDown = false;
    }

    mousePressed(x: i32, y: i32, button: i32, meta: bool = false): void {
        this.mouseX = x;
        this.mouseY = y;

        if (this.options.middleClickCamera && button == 1) {
            this.middleButtonDown = true;
            this.originRotation = this.cameraRotation;
            this.originMouseX = this.mouseX;
            return;
        }

        if (meta || button == 2) {
            this.mouseButtonDown = 2;
        } else {
            this.mouseButtonDown = 1;
        }

        this.lastMouseButtonDown = this.mouseButtonDown;
        this.mouseActionTimeout = 0;

        this.handleMouseDown(this.mouseButtonDown, x, y);
    }

    setTargetFPS(fps: i32): void {
        this.targetFPS = 1000 / fps;
    }

    start(): void {
        if (this.stopTimeout >= 0) {
            this.stopTimeout = 0;
        }
    }

    stop(): void {
        if (this.stopTimeout >= 0) {
            this.stopTimeout = 4000 / this.targetFPS;
        }
    }
}
