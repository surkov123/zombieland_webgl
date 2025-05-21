class Weapon {
    constructor(type) {
        this.type = type;
        this.mesh = [];
        this.muzzle = [];
        let config = weaponsConfig[type];
        this.config = config;
        this.maxAmmo = config.ammo;
        this.ammo = this.maxAmmo;
        this.inReload = false;

        let mesh = new THREE.Mesh(
            Game.loader.geo.get('gamedata/geometry/' + config.geometry),
            new THREE.MeshPhongMaterial({ map: Game.loader.textures.get('gamedata/textures/' + config.texture) })
        );
        let muzzle = new THREE.Object3D();
        this.muzzle.push(muzzle);

        muzzle.position.fromArray(config.muzzle);
        mesh.add(muzzle);
        mesh.rotation.x = config.rot[0] * Math.PI / 180;
        mesh.rotation.y = config.rot[1] * Math.PI / 180;
        mesh.rotation.z = config.rot[2] * Math.PI / 180;
        mesh.position.fromArray(config.pos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.mesh.push(mesh);
        this.delay = 0;
        this.trigged = false;
        switch (this.type) {
            case 'pistol':
            case 'ak':
            case 'shotgun':
                this.curScatter = config.minScatter;
                let side_splash = splashesConfig[config.splash].side;
                let front_splash = splashesConfig[config.splash].front;
                let front_splash_geo = new THREE.PlaneBufferGeometry(1.15, 0.5);
                let side_splash_geo = new THREE.PlaneBufferGeometry(0.7, 0.7);
                let mat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    alphaTest: 0.05,
                    side: THREE.DoubleSide,
                    blending: THREE.AdditiveBlending,
                    flatShading: true,
                    visible: false
                });

                let mat2 = mat.clone();

                let spmesh = new THREE.Mesh(front_splash_geo, mat);
                spmesh.rotation.x = 90 * Math.PI / 180;
                spmesh.rotation.z = -90 * Math.PI / 180;
                spmesh.position.set(0, 0, -0.4);
                spmesh.name = 'splah';
                muzzle.add(spmesh);

                let spmesh2 = new THREE.Mesh(front_splash_geo, mat);
                spmesh2.rotation.y = 90 * Math.PI / 180;
                spmesh2.position.set(0, 0, -0.4);

                muzzle.add(spmesh2);

                let spmesh3 = new THREE.Mesh(side_splash_geo, mat2);
                spmesh3.position.set(0, 0, 0.2);
                muzzle.add(spmesh3);
                this.splashMat = mat;
                this.splashMat2 = mat2;
                this.splashDelay = 0;


                break;
        }
        this.updateAmmoCountTexture()

    }

    getAnimType() {
        return weaponsConfig[this.type].anim;
    }

    update(delta) {
        this.delay -= delta;
        this.delay = Math.max(0, this.delay);
        if (this.splashMat) {
            this.splashDelay -= delta;
            if (this.splashDelay < 0) {
                this.splashMat.visible = false;
                this.splashMat2.visible = false;
            }
        }
        switch (this.type) {
            case 'ak':
            case 'pistol':
                this.curScatter -= this.config.decScatter * delta;
                this.curScatter = Math.max(this.curScatter, this.config.minScatter);
                break;
        }
        if (this.delay == 0 && this.trigged) {
            this.shoot();
        }
    }

    shoot() {
        if (this.config.auto) {
            this.trigged = true;
        }
        if (this.delay != 0) {
            return;
        }
        if (this.inReload) {
            return;
        }
        if (this.ammo <= 0) {
            this.reload();
            return;
        }
        this.ammo--;
        this.updateAmmoCountTexture()
            //console.log('shoot');

        let rate = this.config.rate;
        if (Game.player.getBoosterId('powerup') !== false) {
            rate *= 1.5;
        }
        this.delay = 1 / rate;
        let start = new THREE.Vector3().setFromMatrixPosition(this.muzzle[0].matrixWorld);
        /*let target = new THREE.Vector3().copy(Game.aimPoint);
        target.y = start.y;
        target
            .sub(start)
            .normalize()
            .multiplyScalar(3000)
            .add(start);

        target.y = start.y;*/
        let target = new THREE.Vector3()
            .copy(Game.player.lookVec)
            .multiplyScalar(3000);
        target.y = 0;
        target.add(start);


        switch (this.type) {
            case 'pistol':
            case 'ak':
                if (true) {
                    let bAngle = -Math.atan2(Game.player.lookVec.x, Game.player.lookVec.z) + Math.PI / 2;
                    //let rndAngle = (this.curScatter * Math.random() * 2 - this.curScatter) * Math.PI / 180;
                    let rndAngle = 180;
                    for (let i = 0; i < 3; i++) {
                        rndAngle = Math.min((this.curScatter * Math.random() / 2) * Math.PI / 180, rndAngle);
                    }
                    if (Math.random() > 0.5) {
                        bAngle += rndAngle;
                    } else {
                        bAngle -= rndAngle;
                    }
                    target.x = Math.cos(bAngle) * 3000 + start.x;
                    target.z = Math.sin(bAngle) * 3000 + start.z;
                    //console.log(this.curScatter);

                    let bullet = new FABullet(start, target, 3, this.config.power);
                    Game.effects.push(bullet);
                    let smoke = new MuzzleSmoke(start, target);
                    Game.effects.push(smoke);
                    let side_splash = splashesConfig[this.config.splash].side;
                    let front_splash = splashesConfig[this.config.splash].front;
                    let rnd = THREE.Math.randInt(0, side_splash.length - 1);
                    let rnd2 = THREE.Math.randInt(0, front_splash.length - 1);
                    //console.log(Game.loader.textures.get(side_splash[rnd]));

                    this.splashMat.map = Game.loader.textures.get(side_splash[rnd]);
                    this.splashMat2.map = Game.loader.textures.get(front_splash[rnd2]);
                    this.splashMat.visible = true;
                    this.splashMat2.visible = true;
                    if (this.type == 'pistol') {
                        this.splashDelay = 0.05;
                    } else {
                        this.splashDelay = 0.005;
                    }
                    Game.pointLight.power = 20 * Math.PI;
                    this.curScatter += this.config.incScatter;
                    this.curScatter = Math.min(this.curScatter, this.config.maxScatter);
                }
                break;

            case 'shotgun':
                if (true) {
                    for (let b = 0; b < this.config.bulletsCount; b++) {
                        let bAngle = -Math.atan2(Game.player.lookVec.x, Game.player.lookVec.z) + Math.PI / 2;
                        //let rndAngle = (this.curScatter * Math.random() * 2 - this.curScatter) * Math.PI / 180;

                        let rndAngle = (this.curScatter * Math.random() / 2) * Math.PI / 180;

                        if (Math.random() > 0.5) {
                            bAngle += rndAngle;
                        } else {
                            bAngle -= rndAngle;
                        }
                        target.x = Math.cos(bAngle) * 3000 + start.x;
                        target.z = Math.sin(bAngle) * 3000 + start.z;
                        //console.log(this.curScatter);

                        let bullet = new FABullet(start, target, 3, this.config.power, 1500 + Math.random() * 500);
                        Game.effects.push(bullet);
                    }
                    let shiftVec = new THREE.Vector3();

                    for (let i = 0; i < 10; i++) {
                        shiftVec.copy(Game.player.lookVec).multiplyScalar(i);
                        start.add(shiftVec);
                        target.add(shiftVec);
                        let smoke = new MuzzleSmoke(start, target);
                        Game.effects.push(smoke);

                    }
                    let side_splash = splashesConfig[this.config.splash].side;
                    let front_splash = splashesConfig[this.config.splash].front;
                    let rnd = THREE.Math.randInt(0, side_splash.length - 1);
                    let rnd2 = THREE.Math.randInt(0, front_splash.length - 1);
                    //console.log(Game.loader.textures.get(side_splash[rnd]));

                    this.splashMat.map = Game.loader.textures.get(side_splash[rnd]);
                    this.splashMat2.map = Game.loader.textures.get(front_splash[rnd2]);
                    this.splashMat.visible = true;
                    this.splashMat2.visible = true;
                    this.splashDelay = 0.05;
                    Game.pointLight.power = 20 * Math.PI;
                }
                break;
        }
    }

    getAimSize() {
        switch (this.type) {
            case 'pistol':
            case 'ak':
            case 'shotgun':
                let bAngle = -Math.atan2(Game.player.lookVec.x, Game.player.lookVec.z) + Math.PI / 2;
                let sAngle = this.curScatter * Math.PI / 180;
                let rAngle = bAngle - sAngle / 2;
                let lAngle = bAngle + sAngle / 2;
                let start = new THREE.Vector2();
                start.x = Game.player.pivot.position.x;
                start.y = Game.player.pivot.position.z;
                let end = new THREE.Vector2();
                end.x = Game.aimPoint.x;
                end.y = Game.aimPoint.z;

                let dist = start.distanceTo(end);
                let lPoint = new THREE.Vector2();
                let rPoint = new THREE.Vector2();
                lPoint.x = Math.cos(lAngle) * dist;
                lPoint.y = Math.sin(lAngle) * dist;

                rPoint.x = Math.cos(rAngle) * dist;
                rPoint.y = Math.sin(rAngle) * dist;
                return rPoint.distanceTo(lPoint);

                break;
        }
        return 0;
    }

    getAimPoint() {
        let muzzlePos = new THREE.Vector3().setFromMatrixPosition(this.getCurMuzzle().matrixWorld);
        let muzzleDist = muzzlePos.distanceTo(Game.player.pivot.position);
        let aimDist = Game.player.pivot.position.distanceTo(Game.aimPoint);
        let dist = aimDist - muzzleDist;
        let dir = new THREE.Vector3().copy(Game.player.lookVec);
        dir.y = 0;
        dir.multiplyScalar(dist).add(muzzlePos);
        return dir;

    }

    getCurMuzzle() {
        return this.muzzle[0];
    }

    reload() {
        if (!this.inReload && this.ammo < this.maxAmmo) {
            this.inReload = true;
            if (this.config.reload && Game.player.getBoosterId('powerup') === false) {
                Game.player.reload(this.config.reload);
            } else {
                this.reloadDone();
            }
        }
    }

    reloadDone() {
        this.ammo = this.maxAmmo;
        this.inReload = false;
        this.updateAmmoCountTexture()
    }

    updateAmmoCountTexture() {
        Game.ammoctx.fillStyle = "rgba(255, 255, 255, 0)";
        Game.ammoctx.clearRect(0, 0, 128, 128);
        Game.ammoctx.fillStyle = '#D6FA5A';
        Game.ammoctx.font = "bold 36px Tahoma";
        Game.ammoctx.textBaseline = "middle";
        Game.ammoctx.textAlign = "center";
        Game.ammoctx.fillText(this.ammo, 64, 32);
        Game.ammoCountTex.needsUpdate = true;
    }


}