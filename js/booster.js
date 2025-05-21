class Booster {
    constructor(name, time) {
        this.name = name;
        this.ttl = time;
    }

    update(delta) {
        this.ttl -= delta;
        if (this.ttl <= 0) {
            this.needClean = true;
        }
    }

    clean() {

    }
}