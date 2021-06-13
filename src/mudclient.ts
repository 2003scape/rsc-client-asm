import GameShell from './game-shell';

export default class mudclient extends GameShell {
    drawTeleportBubble(
        x: i32,
        y: i32,
        width: i32,
        height: i32,
        id: i32
    ): void {}

    drawNPC(x: i32, y: i32, w: i32, h: i32, id: i32, tx: i32, ty: i32): void {}

    drawItem(x: i32, y: i32, w: i32, h: i32, id: i32): void {}

    drawPlayer(
        x: i32,
        y: i32,
        w: i32,
        h: i32,
        id: i32,
        tx: i32,
        ty: i32
    ): void {}
}
