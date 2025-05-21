class MuzzleSmoke {
    constructor(from, to) {
        this.mat = Game.loader.sprites.get('gamedata/textures/muzzle_smoke.png').clone();
        this.mesh = new THREE.Sprite(this.mat);
        this.mat.opacity = 1;
        this.cur_dist = 100;
        Game.scene.add(this.mesh);
        this.set(from, to);
    }

    set(from, to) {
        this.from = from;
        this.to = to;
        this.vec = new THREE.Vector3().copy(to).sub(from).normalize();
        this.cur_dist = 0;
        this.mesh.scale.set(15, 15, 1);
        this.mesh.position.copy(from);
        this.mat.opacity = 0.3;

    }

    update(delta) {
        if (this.cur_dist < 100) {
            this.cur_dist += 1000 * delta;
            if (this.cur_dist > 100) {
                this.needClean = true;
            } else {
                let step = new THREE.Vector3().copy(this.vec).multiplyScalar(delta * 1000);
                this.mesh.position.add(step);
                this.mat.opacity = (1 - this.cur_dist / 100) * 0.2;
                this.mesh.scale.x = this.mesh.scale.y = 15 + this.cur_dist / 3;


            }

        }
    }

    clean() {
        Game.scene.remove(this.mesh);
    }
}