class Blood {
    constructor(point) {
        this.texture = Game.loader.textures.get('gamedata/textures/blood.png').clone();
        this.texture.needsUpdate = true;
        this.mesh = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.texture,
            color: 0xffffff,
            transparent: true
        }));
        this.mesh.scale.x = 90;
        this.mesh.scale.y = -90;
        this.mesh.scale.z = 1;
        Game.scene.add(this.mesh);
        this.frameset = new THREE.TextureAnimator(this.texture, 4, 4, 12, 33);
        this.frameset.playing = true;
        this.set(point);
    }

    set(point) {
        //console.log(point);
        this.mesh.position.copy(point);
        this.frameset.playing = true;
        this.ttl = 0.3;
    }

    update(delta) {

        this.frameset.update(delta * 1000);
        this.ttl -= delta;
        if (this.ttl <= 0) {
            this.needClean = true;
        }
    }

    clean() {
        Game.scene.remove(this.mesh);
    }
}