class PowerUpDrop extends Drop {
    constructor(pos) {
        super();
        let geo = Game.loader.geo.get('gamedata/geometry/powerup.js').clone();
        geo.center();
        geo.rotateX(Math.PI / 2);

        let tex = Game.loader.textures.get('gamedata/textures/powerup.png');
        this.mesh = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({
                map: tex,
                side: 2,
                transparent: true
            })
        );

        this.pivot.position.copy(pos);
        this.pivot.add(this.mesh);
        this.mesh.scale.set(500, 500, 500);
        this.mesh.position.y = 10;


    }

    update(delta) {
        super.update(delta);
        let trigged = this.trigged();
        if (trigged) {
            this.needClean = true;
            //Game.boosters.push(new ShieldBooster(this.trigged()));
            trigged.addBooster(new PowerUpBooster());
            if (trigged.animations.reload.playing) {
                trigged.animations.reload.stop();
                trigged.weapon.reloadDone();
            }
        }
    }
}

class PowerUpBooster extends Booster {
    constructor() {
        super('powerup', 8);
        let canvas = document.createElement("canvas");

        this.ctx = canvas.getContext('2d');
        this.ctx.canvas.width = 128;
        this.ctx.canvas.height = 128;
        this.countTex = new THREE.Texture(canvas);
        this.count = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.countTex }));
        this.count.scale.set(70, 70, 1);
        this.count.position.x = 30;
        Game.aimGroup.add(this.count);

    }

    update(delta) {
        super.update(delta);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
        this.ctx.clearRect(0, 0, 128, 128);
        this.ctx.fillStyle = '#D6FA5A';
        this.ctx.font = "bold 36px Tahoma";
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillText('⇑' + (Math.floor(this.ttl * 10)), 64, 32);
        this.countTex.needsUpdate = true;
        if (this.needClean) {
            this.clean();
        }

    }

    clean() {
        Game.aimGroup.remove(this.count);
    }
}