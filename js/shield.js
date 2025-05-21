class ShieldDrop extends Drop {
    constructor(pos) {
        super();
        let geo = Game.loader.geo.get('gamedata/geometry/shield.js').clone();
        geo.center();
        geo.rotateX(Math.PI / 2);

        let tex = Game.loader.textures.get('gamedata/textures/shield.png');
        this.mesh = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({
                map: tex,
                side: 2,
                transparent: true,
                blending: THREE.AdditiveBlending
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
            trigged.addBooster(new ShieldBooster(trigged));
        }
    }
}


class ShieldBooster extends Booster {
    constructor(player) {
        super('shield', 6);
        this.player = player;
        this.pivot = new THREE.Group();
        this.pivot.scale.set(0.1, 0.1, 0.1);

        let geo = Game.loader.geo.get('gamedata/geometry/booster_effect.js');
        this.linemat = new THREE.MeshBasicMaterial({
            map: Game.loader.textures.get('gamedata/textures/buster_effect.png'),
            transparent: true,
            side: 2,
            opacity: 1.5,
            color: 0x33ff33,
            blending: THREE.AdditiveBlending
        })
        this.line1Wrap = new THREE.Group();
        this.line1 = new THREE.Mesh(geo, this.linemat);
        this.line1Wrap.position.y = 20;
        this.line1Wrap.rotation.x = Math.PI / 4;
        this.line1Wrap.add(this.line1);
        this.pivot.add(this.line1Wrap);

        this.line2Wrap = new THREE.Group();
        this.line2 = new THREE.Mesh(geo, this.linemat);
        this.line2.scale.x = -1;
        this.line2Wrap.position.y = 20
        this.line2Wrap.rotation.x = -Math.PI / 4;
        this.line2Wrap.add(this.line2);
        this.pivot.add(this.line2Wrap);

        this.line3Wrap = new THREE.Group();
        this.line3 = new THREE.Mesh(geo, this.linemat);
        this.line3Wrap.position.y = 20;
        this.line3Wrap.rotation.z = Math.PI / 4;
        this.line3Wrap.add(this.line3);
        this.pivot.add(this.line3Wrap);

        this.player.pivot.add(this.pivot);
        this.opAngle = 0;

    }

    update(delta) {
        super.update(delta);

        if (this.needClean) {
            this.clean();
        } else {
            this.line1.rotation.y -= delta * 10;
            this.line2.rotation.y += delta * 10;
            this.line3.rotation.y -= delta * 7;
            if (this.ttl < 2.5) {
                //this.linemat.opacity = Math.abs(Math.cos(this.opAngle));
                let op = Math.abs(Math.cos(this.opAngle));
                if (op > 0.5) {
                    this.linemat.opacity = 1;
                } else {
                    this.linemat.opacity = 0.1;
                }
                //console.log(this.linemat.opacity);
                this.opAngle += delta * Math.PI * 2;
            }
        }
    }

    clean() {
        this.player.pivot.remove(this.pivot);
    }

}