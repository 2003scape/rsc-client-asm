import GameModel from './game-model';

export default class Polygon {
    minPlaneX: i32;
    minPlaneY: i32;
    maxPlaneX: i32;
    maxPlaneY: i32;
    minZ: i32;
    maxZ: i32;
    model: GameModel | null;
    face: i32;
    depth: i32;
    normalX: i32;
    normalY: i32;
    normalZ: i32;
    visibility: i32;
    facefill: i32;
    skipSomething: bool = false;
    index: i32;
    index2: i32 = -1;
}
