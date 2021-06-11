import GameModel from './game-model';

export function add(a: i32, b: i32): i32 {
    return a + b;
}

const test = new GameModel();
test.project(1,2,3,4,5,6,7,7);
