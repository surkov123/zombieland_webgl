class Mob {
    constructor(type) {
        this.name = '';
        this.type = type;
        this.hp = 100;
        this.maxhp = 100;
        this.preset = null;
        this.data = {};
        this.pivot = new THREE.Group();
        this.animations = {};
        this.overlay_anim = {};
        this.body = { mesh: null, id: null };
        this.cur_anim = '';
        this.cur_overlay_anim = '';
        this.pos = new THREE.Vector3();
        this.col = [];
        this.col_string = '';
        this.colNeedsUpdate = false;
        this.geoPos = new THREE.Vector2();

    }

    stop_all_anim() {
        this.stop_main_anim();
        this.stop_overlay_anim();
    }

    stop_main_anim() {
        for (var a in this.animations) {
            this.animations[a].stop();
        }
        this.cur_anim = '';
    }


    clean() {
        Game.scene.remove(this.pivot);

        this.worker.postMessage({
            type: 'clean',
            data: {
                id: this.pivot.uuid
            }
        });

        Game.corpsMaker.postMessage({
            type: 'clean',
            data: {
                id: this.pivot.uuid
            }
        });

    }

    update(delta) {
        /*let col = [];
        let col_string = '';

        let pos;
        this.pos.setFromMatrixPosition(this.pivot.matrix);
        for (let r = 0; r < 10; r += 5) {
            for (let a = 0; a < 360; a += 10) {
                let angle = a * Math.PI / 180;
                let x = Math.floor((Math.cos(angle) * r + this.pos.x - 5) / 10);
                let y = Math.floor((Math.sin(angle) * r + this.pos.z - 5) / 10);
                if (!pos || pos.x != x || pos.y != y) {
                    pos = { x: x, y: y };
                    col.push(pos);
                    col_string += x + '_' + y + '_';
                }
            }
        }
        if (this.col_string != col_string) {
            this.colNeedsUpdate = true;
            this.col_string = col_string;
            this.col = col;
            
        }*/
        //this.pivot.updateMatrixWorld(true);
        this.pos.setFromMatrixPosition(this.pivot.matrix);
        this.col.position.copy(this.pos);
        this.col.position.y += 45;
        //console.log(this.col.position);


        let geoX = Math.floor(this.pos.x / 10);
        let geoY = Math.floor(this.pos.z / 10);
        if (geoX != this.geoPos.x || geoY != this.geoPos.y) {
            this.geoPos.x = geoX;
            this.geoPos.y = geoY;

            Game.workers[0].postMessage({
                type: 'mobPos',
                data: {
                    pos: this.geoPos.toArray(),
                    id: this.pivot.uuid
                }
            });

            Game.workers[1].postMessage({
                type: 'mobPos',
                data: {
                    pos: this.geoPos.toArray(),
                    id: this.pivot.uuid
                }
            });
        }
        //console.log(this.pos);
        this.pivot.skeleton.boneTexture.needsUpdate = true;

    }

    draw() {

        var geometry = Game.loader.geo.get('gamedata/geometry/male_low.js');
        //console.log(geometry);



        geometry.bones = Game.loader.bones.get('gamedata/skeletons/player.json');

        let texture = '';
        switch (this.type) {
            case 1:
                texture = 'gamedata/textures/Man_Cit_LP_Dif_Adik.jpg';
                break;

            case 2:
                texture = 'gamedata/textures/Citizen_low.jpg';
                break;

            case 3:
                texture = 'gamedata/textures/Alien.jpg';
                break;

            case 4:
                texture = 'gamedata/textures/Man_War_LP_Dif_gorka.jpg';
                break;
        }
        var material = new THREE.MeshPhongMaterial({
            skinning: true,
            map: Game.loader.textures.get(texture)
        });

        this.pivot = new THREE.SkinnedMesh(geometry, material, false);

        /*if (!this.skeleton) {
            this.skeleton = new THREE.SkeletonController(this.body.mesh);
            this.skeleton.smooth = false;
            this.skeleton.quat_speed = 10;
        }*/

        //console.log(this.pivot.skeleton);

        //this.pivot.add(this.body.mesh);
        this.pivot.matrixAutoUpdate = false;
        //console.log(this.body.mesh.skeleton);
        this.pivot.skeleton.update = function() {};
        var skeleton = this.pivot.skeleton;
        var size = 16;
        let skeletBuffer = new SharedArrayBuffer(1024 * 4);
        let boneMatrices = new Float32Array(skeletBuffer);
        //var boneMatrices = new Float32Array(size * size * 4); // 4 floats per RGBA pixel
        boneMatrices.set(skeleton.boneMatrices); // copy current values
        //boneMatrices.set(boneMatrices);
        //console.log(skeleton.boneMatrices.length);

        var boneTexture = new THREE.DataTexture(boneMatrices, size, size, THREE.RGBAFormat, THREE.FloatType);
        boneTexture.needsUpdate = true;

        //console.log(boneTexture);

        skeleton.boneMatrices = boneMatrices;
        skeleton.boneTexture = boneTexture;
        skeleton.boneTextureSize = size;
        skeleton.boneTexture.image.data = boneMatrices;
        for (let i in this.pivot.children) {
            this.pivot.remove(this.pivot.children[i]);
        }


        Game.scene.add(this.pivot);

        /*var anim = Game.loader.anim.get('gamedata/animations/lobby.json');

        this.animations['test'] = new THREE.animation(this.skeleton, anim['LStand_Mgun-Aim'], {
            loop: true,
            player: this

        });
        this.animations['test'].play();*/


        this.worker = Game.getWorker();
        //Game.linkMatrix(this.pivot, this.worker);
        this.pivot.matrixWorldNeedsUpdate = false;
        this.pivot.matrixAutoUpdate = false;
        this.pivot.castShadow = true;
        this.pivot.receiveShadow = true;

        this.worker.postMessage({
            type: 'new',
            data: {
                //anim: Game.loader.anim.get('gamedata/animations/lobby.json'),
                //bones: geometry.bones,
                id: this.pivot.uuid
            }
        });
        let matrixBuffer = new SharedArrayBuffer(16 * 4);
        let elements = this.pivot.matrix.elements;
        this.pivot.matrix.elements = new Float32Array(matrixBuffer);
        for (let i in elements) {
            this.pivot.matrix.elements[i] = elements[i];
        }

        this.worker.postMessage(matrixBuffer);
        this.worker.postMessage(skeletBuffer);
        Game.corpsMaker.postMessage({
            type: 'skelet',
            data: this.pivot.uuid
        });
        Game.corpsMaker.postMessage(skeletBuffer);

        this.col = new THREE.Mesh(new THREE.BoxGeometry(25, 100, 25), new THREE.MeshBasicMaterial({ visible: false, wireframe: true }));
        Game.scene.add(this.col);
        this.col.mob = this;
        //console.log(this.pivot);



    }





    setPosition(x, y, z) {
        this.worker.postMessage({
            type: 'setPos',
            data: {
                pos: [x, y, z],
                id: this.pivot.uuid
            }
        });
    }

    setScale(x, y, z) {
        this.worker.postMessage({
            type: 'setScale',
            data: {
                scale: [x, y, z],
                id: this.pivot.uuid
            }
        });
    }

    respown() {
        let pos = Game.getRespown();
        this.col.visible = true;
        this.worker.postMessage({
            type: 'respown',
            data: {
                id: this.pivot.uuid,
                pos: pos
            }
        });
        this.hp = this.maxhp;
    }



    separation() {
        /*let vecs = [];
        let shift = new THREE.Vector3();
        for (let i in Game.chars) {
            if (Game.chars[i].pivot.uuid != this.pivot.uuid) {
                //console.log(this.pos.distanceTo(Game.chars[i].pos));
                if (this.pos.distanceTo(Game.chars[i].pos) < 25) {

                    let vec = new THREE.Vector3()
                        .copy(Game.chars[i].pos)
                        .sub(this.pivot.position);
                    shift.add(vec);

                }
            }
        }
        if (shift.length() > 0.1) {
            shift.normalize();
            this.worker.postMessage({
                type: 'shift',
                data: {
                    shift: shift.toArray(),
                    id: this.pivot.uuid
                }
            });
        }*/


    }

    hit(power) {
        if (this.hp > 0) {
            this.hp -= power;
            if (this.hp <= 0) {


                //this.col.visible = false;
                Game.upScore(this.maxhp);
                this.maxhp = Math.floor(this.maxhp * 1.05);

                this.worker.postMessage({
                    type: 'killed',
                    data: {
                        id: this.pivot.uuid
                    }
                });

                Game.workers[0].postMessage({
                    type: 'mobPos',
                    data: {
                        pos: [-100500, -100500],
                        id: this.pivot.uuid
                    }
                });

                Game.workers[1].postMessage({
                    type: 'mobPos',
                    data: {
                        pos: [-100500, -100500],
                        id: this.pivot.uuid
                    }
                });
                this.drop();
                Game.kills++;

                return true;
            }
        } else {
            return true;
        }
        return false;
    }

    dead() {
        this.col.visible = false;
        Game.corpsMaker.postMessage({
            type: 'corps',
            data: {
                type: this.type,
                id: this.pivot.uuid
            }
        });
        /*console.log(this.pivot);
        let corpsGeo = this.pivot.geometry.clone();
        let scope = this;

        function getBoneMatrix(i) {
            let texture = scope.pivot.skeleton.boneTexture.image.data;
            let matrix = new THREE.Matrix4();
            let m = 0;
            for (let t = 16 * i; t < 16 * i + 16; t++) {
                matrix.elements[m] = texture[t];
                m++;
            }
            return matrix;
        }

        let boneMat = [];

        for (let i in corpsGeo.vertices) {
            let vertex = corpsGeo.vertices[i];
            let skinIndex = corpsGeo.skinIndices[i];
            let skinWeight = corpsGeo.skinWeights[i];

            let boneMatX = getBoneMatrix(skinIndex.x);
            let boneMatY = getBoneMatrix(skinIndex.y);
            let boneMatZ = getBoneMatrix(skinIndex.z);
            let boneMatW = getBoneMatrix(skinIndex.w);
            boneMat.push([boneMatX, boneMatY, boneMatZ, boneMatW]);

            let skinned = new THREE.Vector3();
            let skinX = new THREE.Vector3().copy(vertex).applyMatrix4(boneMatX).multiplyScalar(skinWeight.x);
            skinned.add(skinX);

            let skinY = new THREE.Vector3().copy(vertex).applyMatrix4(boneMatY).multiplyScalar(skinWeight.y);
            skinned.add(skinY);

            let skinZ = new THREE.Vector3().copy(vertex).applyMatrix4(boneMatZ).multiplyScalar(skinWeight.z);
            skinned.add(skinZ);

            let skinW = new THREE.Vector3().copy(vertex).applyMatrix4(boneMatW).multiplyScalar(skinWeight.w);
            skinned.add(skinW);

            corpsGeo.vertices[i] = skinned;

        }


        corpsGeo.computeVertexNormals();

        corpsGeo.computeBoundingSphere();
        corpsGeo.computeBoundingBox();

        let mesh = new THREE.Mesh(corpsGeo, new THREE.MeshPhongMaterial({ map: this.pivot.material.map }));
        mesh.updateMatrix();
        mesh.updateMatrixWorld();
        mesh.matrixAutoUpdate = false;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        Game.scene.add(mesh);*/
        //Game.addCorps(corpsGeo, this.type, this.pos);

    }

    drop() {
        let dropWeaponChance = 0;
        let wTypes = [];

        function isDropeed(i) {
            for (let i in Game.drops) {
                if (Game.drops[i] instanceof WeaponDrop) {
                    if (Game.drops[i].type == i) {
                        return true;
                    }
                }
            }
            return false;
        }
        for (let i in weaponsConfig) {
            if (i != Game.player.weapon.type && !isDropeed(i) && i != 'pistol') {
                wTypes.push(i);
            }
        }

        if (Game.player.weapon.type == 'pistol') {
            dropWeaponChance = 0.8;
            for (let i in Game.drops) {
                if (Game.drops[i] instanceof WeaponDrop) {
                    dropWeaponChance = 0.01;
                    break;
                }
            }
        } else {
            dropWeaponChance = 0.01;
        }

        if (wTypes.length && dropWeaponChance > Math.random()) {
            let rnd = Math.floor(Math.random() * wTypes.length);
            let pos = new THREE.Vector3().copy(this.pos);
            pos.y = Game.getZ(pos);
            //console.log(pos);
            Game.drops.push(new WeaponDrop(wTypes[rnd], pos));

        } else {
            if (Math.random() < 0.07) {
                let pos = new THREE.Vector3().copy(this.pos);
                pos.y = Game.getZ(pos);
                let list = ['hp', 'powerup', 'shield', 'speedup'];
                let rnd = Math.floor(Math.random() * list.length);
                switch (list[rnd]) {
                    case 'hp':
                        Game.drops.push(new HpBooster(pos));
                        break;

                    case 'shield':
                        Game.drops.push(new ShieldDrop(pos));
                        break;

                    case 'powerup':
                        Game.drops.push(new PowerUpDrop(pos));
                        break;

                    case 'speedup':
                        Game.drops.push(new SpeedUpDrop(pos));
                        break;
                }

            }
        }
    }
}