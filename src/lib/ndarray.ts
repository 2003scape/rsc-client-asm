export class Int82DArray {
    array: Int8Array;
    width: i32;
    height: i32;

    constructor(height: i32, width: i32) {
        this.array = new Int8Array(width * height);
        this.width = width;
        this.height = height;
    }

    get(row: i32, column: i32): i8 {
        return unchecked(this.array[this.width * row + column]);
    }

    set(row: i32, column: i32, value: i32): void {
        unchecked((this.array[this.width * row + column] = value));
    }
}

export class Int322DArray {
    array: Int32Array;
    width: i32;
    height: i32;

    constructor(height: i32, width: i32) {
        this.array = new Int32Array(width * height);
        this.width = width;
        this.height = height;
    }

    get(row: i32, column: i32): i32 {
        return unchecked(this.array[this.width * row + column]);
    }

    set(row: i32, column: i32, value: i32): void {
        unchecked((this.array[this.width * row + column] = value));
    }

    static fromArray(array: Array<Array<i32>>): Int322DArray {
        const wrap = new Int322DArray(array.length, unchecked(array[0]).length);

        for (let i = 0; i < wrap.width; i += 1) {
            for (let j = 0; j < wrap.height; j += 1) {
                wrap.set(j, i, unchecked(array[j][i]));
            }
        }

        return wrap;
    }
}
