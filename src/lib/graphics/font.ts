export default class Font {
    static BOLD: i32 = 1;

    name: string;
    type: i32;
    size: i32;

    constructor(name: string, type: i32, size: i32) {
        this.name = name;
        this.type = type;
        this.size = size;
    }

    getType(): string {
        switch (this.type) {
            case 1:
                return 'bold';
            case 2:
                return 'italic';
            default:
                return 'normal';
        }
    }

    toCanvasFont(): string {
        return `${this.getType()} ${this.size}px ${this.name}`;
    }
}
