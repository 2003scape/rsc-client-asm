case ServerOpcodes.PRAYER_STATUS:
    for (let i = 0; i < size - 1; i++) {
        const on = data[i + 1] == 1;

        if (!this.prayerOn[i] && on) {
            //this.playSoundFile('prayeron');
        }

        if (this.prayerOn[i] && !on) {
            //this.playSoundFile('prayeroff');
        }

        this.prayerOn[i] = on;
    }
    break;
