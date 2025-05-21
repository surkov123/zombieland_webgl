class SpeedUpDrop extends Drop {
    constructor(pos) {
        super();
        let geo = Game.loader.geo.get('gamedata/geometry/speedup.js').clone();
        geo.center();
        //geo.rotateX(Math.PI / 2);

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
        this.mesh.scale.set(50, 50, 50);
        this.mesh.position.y = 10;


    }

    update(delta) {
        super.update(delta);
        let trigged = this.trigged();
        if (trigged) {
            this.needClean = true;

            trigged.addBooster(new SpeedUpBooster(trigged));

        }
    }
}


class SpeedUpBooster extends Booster {
    constructor(player) {
        super('speedup', 8);
        this.player = player;
        let canvas = document.createElement("canvas");

        this.ctx = canvas.getContext('2d');
        this.ctx.canvas.width = 128;
        this.ctx.canvas.height = 128;
        this.countTex = new THREE.Texture(canvas);
        this.count = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.countTex }));
        this.count.scale.set(70, 70, 1);
        this.count.position.x = -50;
        Game.aimGroup.add(this.count);
        this.shlaf = [];
        this.delay = 0;

    }

    update(delta) {
        super.update(delta);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0)";
        this.ctx.clearRect(0, 0, 128, 128);
        this.ctx.fillStyle = '#D6FA5A';
        this.ctx.font = "bold 36px Tahoma";
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
        this.ctx.fillText('«' + (Math.floor(this.ttl * 10)), 64, 32);
        this.countTex.needsUpdate = true;
        this.delay -= delta;

        if (this.needClean) {
            this.clean();

        } else {
            if (this.player.moveVec.length() > 0.1 && this.delay <= 0) {
                this.delay = 0.09;
                let geo = this.player.body.mesh.geometry;

                let mat = this.player.body.mesh.material.clone();
                mat.transparent = true;
                mat.opacity = 0.9;
                //mat.color.set(0x999999);
                let mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(this.player.pivot.position);
                mesh.scale.copy(this.player.pivot.scale);
                mesh.quaternion.copy(this.player.body.mesh.quaternion);
                Game.scene.add(mesh);
                this.shlaf.push(mesh);
                for (let i in this.shlaf) {
                    this.shlaf[i].material.opacity -= delta * 4;
                    if (this.shlaf[i].material.opacity <= 0) {
                        this.shlaf[i].visible = false;
                    }
                }
            }

        }

    }

    clean() {
        Game.aimGroup.remove(this.count);
        for (let i in this.shlaf) {
            Game.scene.remove(this.shlaf[i]);
        }
    }
}