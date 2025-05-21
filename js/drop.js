class Drop {
    constructor() {
        this.angle = 0;
        this.ttl = 14;
        this.hide = 0.25;
        this.pivot = new THREE.Group();
        let geo = Game.loader.geo.get('gamedata/geometry/booster_effect.js');
        this.linemat = new THREE.MeshBasicMaterial({
            map: Game.loader.textures.get('gamedata/textures/buster_effect.png'),
            transparent: true,
            side: 2,
            opacity: 1.5,
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

        Game.scene.add(this.pivot);
    }

    update(delta) {
        this.ttl -= delta;
        if (this.ttl <= 5 && this.ttl > 1) {
            this.hide -= delta;
            if (this.hide < -0.25) {
                this.hide = 0.25;
            }
            if (this.hide > 0) {
                //this.pivot.visible = false;
                this.linemat.opacity = 0.3;
                this.mesh.material.opacity = 0.3;
            } else {
                //this.pivot.visible = true;
                this.linemat.opacity = 1;
                this.mesh.material.opacity = 1;
            }
        } else if (this.ttl <= 1) {
            //this.pivot.visible = true;
            this.linemat.opacity = 1;
            this.mesh.material.opacity = 1;
            let s = this.pivot.scale.x;
            s -= delta;
            s = Math.max(s, 0.01);
            this.pivot.scale.set(s, s, s);

        }
        //this.mesh.rotation.y -= delta;
        let campos = new THREE.Vector3().copy(Game.camera.position);
        campos.applyMatrix4(new THREE.Matrix4().getInverse(this.pivot.matrixWorld));
        this.mesh.lookAt(campos);
        this.angle += delta * 3;
        this.mesh.position.y = 25 + Math.sin(this.angle) * 5;

        if (this.ttl <= 0) {
            this.needClean = true;
        }
        this.line1.rotation.y -= delta * 10;
        this.line2.rotation.y += delta * 10;
        this.line3.rotation.y -= delta * 7;



    }

    clean() {
        Game.scene.remove(this.pivot);
    }

    trigged() {
        if (this.pivot.position.distanceTo(Game.player.pivot.position) < 50) {
            return Game.player;
        }
        return false;
    }
}