case ServerOpcodes.INVENTORY_ITEMS: {
    let offset = 1;

    this.inventoryItemsCount = data[offset++] & 0xff;

    for (let i = 0; i < this.inventoryItemsCount; i++) {
        const idEquip = getUnsignedShort(data, offset);
        offset += 2;

        this.inventoryItemId[i] = idEquip & 32767;
        this.inventoryEquipped[i] = (idEquip / 32768) as i32;

        if (GameData.itemStackable[idEquip & 32767] == 0) {
            this.inventoryItemStackCount[i] = getStackInt(
                data,
                offset
            );

            if (this.inventoryItemStackCount[i] >= 128) {
                offset += 4;
            } else {
                offset++;
            }
        } else {
            this.inventoryItemStackCount[i] = 1;
        }
    }

    break;
}

case ServerOpcodes.INVENTORY_ITEM_UPDATE: {
    let offset = 1;
    let stack = 1;

    const index = data[offset++] & 0xff;

    const id = getUnsignedShort(data, offset);
    offset += 2;

    if (GameData.itemStackable[id & 32767] == 0) {
        stack = getStackInt(data, offset);

        if (stack >= 128) {
            offset += 4;
        } else {
            offset++;
        }
    }

    this.inventoryItemId[index] = id & 32767;
    this.inventoryEquipped[index] = (id / 32768) as i32;
    this.inventoryItemStackCount[index] = stack;

    if (index >= this.inventoryItemsCount) {
        this.inventoryItemsCount = index + 1;
    }

    break;
}

case ServerOpcodes.INVENTORY_ITEM_REMOVE: {
    const index = data[1] & 0xff;

    this.inventoryItemsCount--;

    for (let i = index; i < this.inventoryItemsCount; i++) {
        this.inventoryItemId[i] = this.inventoryItemId[i + 1];

        this.inventoryItemStackCount[i] = this.inventoryItemStackCount[
            i + 1
        ];

        this.inventoryEquipped[i] = this.inventoryEquipped[i + 1];
    }
}
