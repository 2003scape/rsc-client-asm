export class Int82DArray {
    array: Int8Array;
    width: i32;
    height: i32;

    constructor(width: i32, height: i32) {
        this.array = new Int8Array(width * height);
        this.width = width;
        this.height = height;
    }

    get(row: i32, column: i32): i8 {
        return this.array[this.width * row + column];
    }

    set(row: i32, column: i32, value: i8): void {
        this.array[this.width * row + column] = value;
    }
}

export class Int322DArray {
    array: Int32Array;
    width: i32;
    height: i32;

    constructor(width: i32, height: i32) {
        this.array = new Int32Array(width * height);
        this.width = width;
        this.height = height;
    }

    get(row: i32, column: i32): i32 {
        return this.array[this.width * row + column];
    }

    set(row: i32, column: i32, value: i32): void {
        this.array[this.width * row + column] = value;
    }
}
