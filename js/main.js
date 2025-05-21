const Game = {
    data_ver: 1,
    clock: new THREE.Clock(),
    chars: [],
    workers: [],
    matrix: { 0: [], 1: [] },
    skeletons: { 0: [], 1: [] },
    raycaster: new THREE.Raycaster(),
    aimPoint: new THREE.Vector3(),
    colData: {},
    respZones: [{ x1: -2222, x2: -2200, y1: -570, y2: 1280 }, { x1: 2350, x2: 2400, y1: -570, y2: 1280 }],

    effects: [],
    drops: [],
    respTimer: 30,
    score: 0,
    kills: 0,
    paused: false,
    corps: {},
    boosters: {},

    init: function() {
        this.statUid = localStorage.getItem('statUid');
        if (!this.statUid) {
            let d = new Date().getTime();
            this.statUid = 'xxxxxxxx-xxxx'.replace(/[xy]/g, function(c) {
                let r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });

            localStorage.setItem('statUid', this.statUid);
        }
        //console.log(this.statUid);

        this.loader = new ww.loader.group({
            geo: new ww.loader.geometry(function(geometry) {
                Game.loader.geo.done(geometry);
            }, true),
            textures: new ww.loader.texture(function() {
                Game.loader.textures.done();
            }, true),

            anim: new ww.loader.json(function(data) {
                Game.loader.anim.done(data);
            }, true),

            bones: new ww.loader.json(function(data) {
                Game.loader.bones.done(data);
            }, true),

            geodata: new ww.loader.json(function(data) {
                Game.loader.geodata.done(data);
            }, true),

            sprites: new ww.loader.sprite(function(data) {
                Game.loader.sprites.done();
            }, true),



            onready: function() {
                //console.log('ready');
                Game.setMap();
                Game.setChars();
                $('#world').addClass('hideCursor');
                $('#loader_bg').hide();
            }
        });

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = false;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;


        this.scene = new THREE.Scene();
        this.hudScene = new THREE.Scene();

        this.dLight = new THREE.DirectionalLight(0xffffff, 0.6);
        this.dLight.castShadow = true;
        this.dLightShift = new THREE.Vector3(0, 200, 500);
        this.dLightVec = new THREE.Vector3(-300, -1000, -400);
        this.dLight.shadow.mapSize.width = 1024; // default
        this.dLight.shadow.mapSize.height = 1024; // default
        this.dLight.shadow.camera.near = 0.5; // default
        this.dLight.shadow.camera.far = 1500; // default
        this.dLight.shadow.camera.bottom = -1000;
        this.dLight.shadow.camera.top = 1000;
        this.dLight.shadow.camera.left = -1000;
        this.dLight.shadow.camera.right = 1450;
        //console.log(this.dLight.shadow);

        this.scene.add(this.dLight);
        this.scene.add(this.dLight.target);
        this.helper = new THREE.DirectionalLightHelper(this.dLight, 5);

        //this.scene.add(this.helper);

        var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
        this.scene.add(light);

        this.pointLight = new THREE.PointLight(0xffffff, 0, 100, 2);
        this.scene.add(this.pointLight);


        //this.scene.autoUpdate = false;
        this.camWrap = new THREE.Group();

        this.camera = new THREE.PerspectiveCamera(65, ($('#world').width() / $('#world').height()), 10, 1000);
        this.camera.position.set(0, 30, 10);
        let width = $('#world').width();
        let height = $('#world').height();
        this.uiCamera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000);
        this.uiCamera.position.set(width / 2, -height / 2, height / 2);

        //this.camera.scale.set(20, 20, 20);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        //this.uiCamera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
        this.campointer = new THREE.Object3D();
        this.campointer.position.set(0, 30, 10);
        //this.camWrap.add(this.camera);
        this.camWrap.add(this.campointer);

        let ground = new THREE.Mesh(
            new THREE.PlaneGeometry(11000, 10000),
            new THREE.MeshBasicMaterial({ visible: false }));
        ground.rotation.x = -Math.PI / 2;
        this.ground_col = ground;
        this.scene.add(ground);
        this.ground = [];

        $('#world').append(this.renderer.domElement);
        this.stats = new THREE.Stats();
        document.body.appendChild(this.stats.domElement);

        /*this.stats2 = new THREE.Stats();
        this.stats2.domElement.id = 'stats2';
        document.body.appendChild(this.stats2.domElement);

        this.stats3 = new THREE.Stats();
        this.stats3.domElement.id = 'stats3';
        document.body.appendChild(this.stats3.domElement);*/

        this.resize();
        window.addEventListener('resize', this.resize.bind(this), false);
        this.render();

        this.loader.geo.add('gamedata/geometry/male_low.js');
        //this.loader.geo.add('gamedata/geometry/Akm_6.js');
        this.loader.geo.add('gamedata/geometry/axe.js');
        this.loader.textures.add('gamedata/textures/Man_Cit_LP_Dif_Adik.jpg');
        this.loader.textures.add('gamedata/textures/Citizen_low.jpg');
        this.loader.textures.add('gamedata/textures/Alien.jpg');
        this.loader.textures.add('gamedata/textures/Man_War_LP_Dif_gorka.jpg');

        //this.loader.textures.add('gamedata/textures/akm.jpg');
        this.loader.textures.add('gamedata/textures/axe.jpg');
        this.loader.geo.add('gamedata/geometry/War_high.js');
        this.loader.textures.add('gamedata/textures/WarMan_Dif.jpg');
        this.loader.bones.add('gamedata/skeletons/player.json');
        this.loader.anim.add('gamedata/animations/lobby.json');
        this.loader.anim.add('gamedata/animations/combat.json');
        this.loader.geodata.add('gamedata/geodata/0.js');
        this.loader.geodata.add('gamedata/zdata/0.js');

        this.loader.geo.add('gamedata/geometry/tracert_shot.js');
        this.loader.geo.add('gamedata/geometry/tracert_pistol.js');
        this.loader.geo.add('gamedata/geometry/tracert_ar.js');
        this.loader.geo.add('gamedata/geometry/booster_effect.js');
        this.loader.geo.add('gamedata/geometry/shield.js');
        this.loader.geo.add('gamedata/geometry/powerup.js');
        this.loader.geo.add('gamedata/geometry/speedup.js');


        this.loader.textures.add('gamedata/textures/tracert_shotgun.jpg');
        this.loader.textures.add('gamedata/textures/tracert_pistol.jpg');
        this.loader.textures.add('gamedata/textures/traccert_ar.jpg');
        this.loader.sprites.add('gamedata/textures/muzzle_smoke.png');
        this.loader.textures.add('gamedata/textures/dust.png');
        this.loader.textures.add('gamedata/textures/blood.png');
        this.loader.textures.add('gamedata/textures/rangescope.png');
        this.loader.textures.add('gamedata/textures/reddot.png');
        this.loader.textures.add('gamedata/textures/drop_light.png');
        this.loader.textures.add('gamedata/textures/buster_effect.png');
        this.loader.textures.add('gamedata/textures/shield.png');
        this.loader.textures.add('gamedata/textures/powerup.png');


        for (let i in maps[0].ground) {
            this.loader.geo.add('gamedata/geometry/' + maps[0].ground[i].geo);
            if (!this.loader.textures.isset('gamedata/textures/' + maps[0].ground[i].map)) {
                this.loader.textures.add('gamedata/textures/' + maps[0].ground[i].map);
            }

            if (maps[0].ground[i].bumpMap && !this.loader.textures.isset('gamedata/textures/' + maps[0].ground[i].bumpMap)) {
                this.loader.textures.add('gamedata/textures/' + maps[0].ground[i].bumpMap);
            }

        }

        for (let i in maps[0].obstacles) {
            this.loader.geo.add('gamedata/geometry/' + maps[0].obstacles[i].geo);
            if (!this.loader.textures.isset('gamedata/textures/' + maps[0].obstacles[i].map)) {
                this.loader.textures.add('gamedata/textures/' + maps[0].obstacles[i].map);
            }

            if (maps[0].obstacles[i].bumpMap && !this.loader.textures.isset('gamedata/textures/' + maps[0].obstacles[i].bumpMap)) {
                this.loader.textures.add('gamedata/textures/' + maps[0].obstacles[i].bumpMap);
            }
        }

        for (let i in maps[0].etcObj) {
            this.loader.geo.add('gamedata/geometry/' + maps[0].etcObj[i].geo);
            if (this.loader.textures.isset('gamedata/textures/' + maps[0].etcObj[i].map)) {
                this.loader.textures.add('gamedata/textures/' + maps[0].etcObj[i].map);
            }

            if (!maps[0].etcObj[i].bumpMap && this.loader.textures.isset('gamedata/textures/' + maps[0].etcObj[i].bumpMap)) {
                this.loader.textures.add('gamedata/textures/' + maps[0].etcObj[i].bumpMap);
            }
        }

        for (let i in weaponsConfig) {
            this.loader.geo.add('gamedata/geometry/' + weaponsConfig[i].geometry);
            this.loader.textures.add('gamedata/textures/' + weaponsConfig[i].texture);
        }

        for (let i in splashesConfig) {
            for (let n in splashesConfig[i].side) {
                this.loader.textures.add(splashesConfig[i].side[n]);
            }

            for (let n in splashesConfig[i].front) {
                this.loader.textures.add(splashesConfig[i].front[n]);
            }
        }

        this.loader.start();

        this.workers.push(new Worker('js/mob_worker.js'));
        this.workers.push(new Worker('js/mob_worker.js'));
        this.work = [];

        this.workers[0].id = 0;
        this.workers[1].id = 1;
        this.workers[0].onmessage = function(e) {
            Game.fromWorker(e.data);
        }

        this.workers[1].onmessage = function(e) {
            Game.fromWorker(e.data);
        };

        this.corpsMaker = new Worker('js/corpsmaker.js');
        this.corpsMaker.onmessage = function(e) {
            if (this.newdata) {
                switch (this.newdata) {
                    case 1:
                        let pos = new Float32Array(e.data);
                        this.newmesh.geometry.addAttribute('position', new THREE.BufferAttribute(pos, 3));
                        this.newdata++;
                        break;

                    case 2:
                        let norm = new Float32Array(e.data);
                        this.newmesh.geometry.addAttribute('normal', new THREE.BufferAttribute(norm, 3));
                        this.newdata++;
                        break;

                    case 3:
                        let uv = new Float32Array(e.data);
                        this.newmesh.geometry.addAttribute('uv', new THREE.BufferAttribute(uv, 2));
                        this.newdata = 0;
                        Game.scene.add(this.newmesh);
                        this.newmesh = null;
                        //console.log('add new corps mesh');
                        break;
                }
            } else {
                switch (e.data.type) {
                    case 'new':
                        //console.log('newCorpsGeo');
                        this.newdata = 1;
                        let geo = new THREE.BufferGeometry();
                        let texture;
                        switch (e.data.typeid) {
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
                        let newmesh = new THREE.Mesh(geo,
                            new THREE.MeshPhongMaterial({ map: Game.loader.textures.get(texture) }));
                        if (!Game.corps[e.data.typeid]) {
                            Game.corps[e.data.typeid] = [];
                        }
                        Game.corps[e.data.typeid].push(newmesh);
                        newmesh.updateMatrix();
                        newmesh.updateMatrixWorld();
                        newmesh.matrixAutoUpdate = false;
                        newmesh.castShadow = true;
                        newmesh.receiveShadow = true;

                        this.newmesh = newmesh;
                        break;

                    case 'update':
                        //console.log('updateCorpsGeo');
                        let mesh = Game.corps[e.data.typeid][Game.corps[e.data.typeid].length - 1];
                        mesh.geometry.attributes.position.needsUpdate = true;
                        mesh.geometry.attributes.normal.needsUpdate = true;
                        mesh.geometry.attributes.uv.needsUpdate = true;
                        mesh.geometry.computeBoundingBox();
                        mesh.geometry.computeBoundingSphere();
                        break;
                }
            }

        };


    },

    fromWorker: function(packet) {
        switch (packet.type) {
            case 'hit':
                if (this.player) {
                    this.player.hit(packet.power);
                }
                break;

            case 'death':
                let mob = this.getMob(packet.id);
                if (mob) {
                    mob.dead();
                }
                break;
        }
    },

    render: function() {
        requestAnimationFrame(this.render.bind(this));

        let delta = this.clock.getDelta();
        if (this.pause) {
            return;
        }
        this.stats.update();
        this.colData = {};
        for (let i in this.chars) {
            this.chars[i].update(delta);
        }


        if (this.player) {
            this.raycaster.ray.origin.setFromMatrixPosition(this.camera.matrixWorld);
            let vector = new THREE.Vector3((this.mousePos.x / window.innerWidth) * 2 - 1, -(this.mousePos.y / window.innerHeight) * 2 + 1, 0.9);
            vector.unproject(this.camera);
            vector.sub(this.raycaster.ray.origin).normalize();
            this.raycaster.ray.direction = vector;
            let intersects = this.raycaster.intersectObject(this.ground_col);
            if (intersects.length) {
                this.aimPoint.copy(intersects[0].point);
            }
            this.player.animate(delta);
            this.camWrap.position.set(0, 0, 0);
            let minx = this.mapbox.min.x + this.border[0];
            if (this.player.pivot.position.x < minx) {
                this.camWrap.position.x = -(this.player.pivot.position.x - minx) / 20;
            }

            let miny = this.mapbox.min.z + this.border[1];
            if (this.player.pivot.position.z < miny) {
                this.camWrap.position.z = -(this.player.pivot.position.z - miny) / 20;
            }

            let maxx = this.mapbox.max.x - this.border[2];
            if (this.player.pivot.position.x > maxx) {
                this.camWrap.position.x = -(this.player.pivot.position.x - maxx) / 20;
            }

            let maxy = this.mapbox.max.z - this.border[3];
            if (this.player.pivot.position.z > maxy) {
                this.camWrap.position.z = -(this.player.pivot.position.z - maxy) / 20;
            }

            let campos = new THREE.Vector3().setFromMatrixPosition(this.campointer.matrixWorld);
            let cammove = new THREE.Vector3().copy(campos).sub(this.camera.position);
            let dist = cammove.length();

            let speed = this.player.moveSpeed * dist / 100;
            let step = speed * delta;
            if (step < cammove.length()) {
                cammove.normalize().multiplyScalar(step);
                this.camera.position.add(cammove);
            } else {
                this.camera.position.copy(campos);
            }
            this.dLight.position.copy(this.camera.position).add(this.dLightShift);

            this.dLight.target.position.copy(this.dLight.position).add(this.dLightVec);
            //this.helper.update();



            //this.camera.position.copy(campos);
            //console.log(campos);
            if (!this.player.dead) {
                this.aimCenter.visible = true;
                this.ammoCount.visible = true;
                this.ground_col.position.y = this.player.pivot.position.y + 55;
                //let centerDist = this.ground_col.position.distanceTo(this.camera.position);


                //this.aimRange.position.copy(this.player.weapon.getAimPoint());
                //this.aimCenter.position.copy(this.aimRange.position);
                //this.ammoCount.position.copy(this.aimRange.position);
                //console.log();

                this.aimGroup.position.copy(this.player.weapon.getAimPoint());
                let aimPoint = this.toScreenPosition(this.aimGroup, this.camera);
                this.aimGroup.position.x = aimPoint.x;
                //this.aimGroup.position.y = 0;
                this.aimGroup.position.y = -aimPoint.y;
                this.aimGroup.position.z = 100;
                //this.uiCamera.position.copy(this.camera.position);
                /*let cp = new THREE.Vector3().copy(this.camera.position);
                cp.x = this.aimGroup.position.x;
                let aimDist = this.aimGroup.position.distanceTo(cp);
                let scale = aimDist / 650;
                this.aimGroup.scale.set(scale, scale, scale);*/
                //console.log(centerDist, aimDist);

                //this.ammoCount.position.x += 20;
                //this.ammoCount.position.z -= 25;
                let size = this.player.weapon.getAimSize();
                size *= 1.35;
                if (size) {
                    //console.log(size);
                    if (size / 10 < 1) {
                        this.aimRange.visible = false;
                    } else {
                        this.aimRange.visible = true;
                        this.aimRange.scale.set(size, size, 0);
                    }
                } else {
                    this.aimRange.visible = false;
                }
            } else {
                this.aimRange.visible = false;
                this.aimCenter.visible = false;
                this.ammoCount.visible = false;
            }

            this.pointLight.position.setFromMatrixPosition(this.player.weapon.getCurMuzzle().matrixWorld);
            this.pointLight.power -= delta * Math.PI * 400;
            this.pointLight.power = Math.max(this.pointLight.power, 0);

        }

        let effects = [];
        for (let i in this.effects) {

            this.effects[i].update(delta);

        }
        for (let i in this.effects) {
            if (!this.effects[i].needClean) {
                effects.push(this.effects[i]);
            } else {
                //console.log(this.effects[i]);
                this.effects[i].clean();
            }
        }
        this.effects = effects;

        let drops = [];
        for (let i in this.drops) {
            this.drops[i].update(delta);
            if (!this.drops[i].needClean) {
                drops.push(this.drops[i]);
            } else {
                this.drops[i].clean();
            }
        }
        this.drops = drops;




        this.respTimer -= delta;
        if (this.respTimer <= 0) {
            this.respTimer = 30;
            for (let i in this.chars) {
                if (!this.chars[i].col.visible) {
                    this.chars[i].respown();
                }
            }
        }



        this.renderer.render(this.scene, this.camera);
        this.renderer.render(this.hudScene, this.uiCamera);
    },

    resize: function() {
        if (this.width != window.innerWidth || this.height != window.innerHeight) {

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            $('#world canvas').css('width', window.innerWidth + 'px').css('height', window.innerHeight + 'px');

            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.camera.aspect = window.innerWidth / window.innerHeight;
        }
    },

    getRespown: function() {
        let zone = this.respZones[Math.floor(Math.random() * this.respZones.length)];
        let vx = zone.x2 - zone.x1;
        let vy = zone.y2 - zone.y1;
        let x = zone.x1 + Math.random() * vx;
        let y = zone.y1 + Math.random() * vy;
        return [x, y];

    },

    initWorkers: function() {
        this.workers[1].postMessage({
            type: 'geodata',
            data: this.loader.geodata.get('gamedata/geodata/0.js')
        });

        this.workers[1].postMessage({
            type: 'zdata',
            data: this.loader.geodata.get('gamedata/zdata/0.js')
        });

        this.corpsMaker.postMessage({

        });
    },

    setChars: function() {
        //console.log('startdraw');


        this.player = new Player();
        this.player.pivot.position.set(-50, 0, 0);
        this.player.pivot.position.y = this.getZ(this.player.pivot.position);
        //console.log();
        this.player.pivot.scale.set(20, 20, 20);
        this.player.pivot.add(this.camWrap);
        this.controlsOn();

        let maxChars = 90;
        let count = 0;
        let x = 0;
        let y = 0;



        let pos = new THREE.Vector3();
        while (count < maxChars) {
            let type = Math.floor(Math.random() * 4) + 1;
            let mob = new Mob(type);
            //this.workers[0].postMessage([x, y]);
            let resp = this.getRespown();
            //pos.set(x * 20, 0, y * 20);
            pos.set(resp[0], 0, resp[1]);

            pos.y = this.getZ(pos);
            mob.pivot.position.copy(pos.x, pos.y, pos.z);
            mob.pivot.scale.set(20, 20, 20);
            mob.draw();
            mob.setPosition(pos.x, pos.y, pos.z);
            mob.setScale(20, 20, 20);

            this.chars.push(mob);
            count++;
            x++;
            if (x > 10) {
                y++;
                x = 0;
            }
        }
        //console.log('draw end');
        /*let droppos = new THREE.Vector3(200, 0, 0);
        droppos.y = this.getZ(droppos);
        this.drops.push(new HpBooster(droppos));*/
    },
    curWorkerId: 0,

    getWorker: function() {
        this.curWorkerId++;
        if (this.curWorkerId == this.workers.length) {
            this.curWorkerId = 0;
        }
        return this.workers[this.curWorkerId];
    },

    /*linkMatrix: function(mesh, worker) {
        //let list = [];
        let getMatrix = function(m) {
            //list.push(m);
            if (m.type != 'Bone') {
                //let buffer = new SharedArrayBuffer(16 * 4);
                //console.log(m.matrix.elements);
                //m.matrix.elements = new Float32Array(buffer);
                Game.matrix[worker.id].push(m);
            }
            if (m.skeleton) {
                //let buffer = new SharedArrayBuffer(1024 * 4);
                //m.skeleton.boneTexture.image.data = new Float32Array(buffer);
                Game.skeletons[worker.id].push(m.skeleton);
            }
            //m.updateMatrixWorld();
            m.matrixWorldNeedsUpdate = false;

            m.matrixAutoUpdate = false;
            for (let i in m.children) {
                getMatrix(m.children[i]);
            }

        };

        getMatrix(mesh);

        //this.matrix[worker.id][mesh.uuid] = list;
    },*/

    setMap: function() {
        this.scene.updateMatrix();
        this.scene.updateMatrixWorld();

        this.aimGroup = new THREE.Group();
        this.hudScene.add(this.aimGroup);

        this.aimRange = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.loader.textures.get('gamedata/textures/rangescope.png'),
            transparent: true,
            depthTest: false,
            depthWrite: false,
        }));
        this.aimRange.scale.x = 50;
        this.aimRange.scale.y = 50;
        this.aimGroup.add(this.aimRange);

        this.aimCenter = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.loader.textures.get('gamedata/textures/reddot.png'),
            transparent: true,
            depthTest: false,
            depthWrite: false,
        }));
        this.aimCenter.scale.x = 20;
        this.aimCenter.scale.y = 20;
        this.aimGroup.add(this.aimCenter);

        var canvas = document.createElement("canvas");

        this.ammoctx = canvas.getContext('2d');
        this.ammoctx.canvas.width = 128;
        this.ammoctx.canvas.height = 128;
        this.ammoCountTex = new THREE.Texture(canvas);
        this.ammoCount = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.ammoCountTex }));
        this.ammoCount.scale.set(70, 70, 1);
        this.aimGroup.add(this.ammoCount);


        for (let i in maps[0].ground) {
            let geo = this.loader.geo.get('gamedata/geometry/' + maps[0].ground[i].geo);
            let bump;
            if (maps[0].ground[i].bumpMap) {
                bump = this.loader.textures.get('gamedata/textures/' + maps[0].ground[i].bumpMap);
            }
            let mesh = new THREE.Mesh(geo,
                new THREE.MeshPhongMaterial({
                    map: this.loader.textures.get('gamedata/textures/' + maps[0].ground[i].map),
                    bumpMap: bump
                })
            );
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.scale.set(maps[0].ground[i].scale, maps[0].ground[i].scale, maps[0].ground[i].scale);
            this.scene.add(mesh);
            this.ground.push(mesh);
            mesh.rotation.fromArray(maps[0].ground[i].rot);
            mesh.updateMatrix();
            mesh.updateMatrixWorld();
            mesh.matrixAutoUpdate = false;

        }
        let box = new THREE.Box3();
        box.setFromObject(this.ground[0]);
        for (let i in this.ground) {
            box.expandByObject(this.ground[i]);
        }
        let size = new THREE.Vector3();

        box.getSize(size);
        this.mapbox = box;
        this.border = maps[0].border;
        //console.log(size);
        let shiftX = Math.floor(box.min.x / 10) * -1;
        let shiftY = Math.floor(box.min.z / 10) * -1;
        let width = Math.floor(size.x / 10);
        let height = Math.floor(size.z / 10);

        let grid = {
            width: width,
            height: height,
            shiftX: shiftX,
            shiftY: shiftY
        };

        this.workers[0].postMessage({
            type: 'grid',
            data: grid
        });

        this.workers[1].postMessage({
            type: 'grid',
            data: grid
        });

        this.workers[0].postMessage({
            type: 'mapbox',
            data: { min: box.min.toArray(), max: box.max.toArray() }
        });

        this.workers[1].postMessage({
            type: 'mapbox',
            data: { min: box.min.toArray(), max: box.max.toArray() }
        });

        this.workers[0].postMessage({
            type: 'bones',
            data: this.loader.bones.get('gamedata/skeletons/player.json')
        });

        this.workers[1].postMessage({
            type: 'bones',
            data: this.loader.bones.get('gamedata/skeletons/player.json')
        });

        this.workers[0].postMessage({
            type: 'anim',
            data: this.loader.anim.get('gamedata/animations/combat.json')
        });

        this.workers[1].postMessage({
            type: 'anim',
            data: this.loader.anim.get('gamedata/animations/combat.json')
        });

        this.workers[0].postMessage({
            type: 'geodata',
            data: this.loader.geodata.get('gamedata/geodata/0.js')
        });

        this.workers[0].postMessage({
            type: 'zdata',
            data: this.loader.geodata.get('gamedata/zdata/0.js')
        });

        this.workers[1].postMessage({
            type: 'geodata',
            data: this.loader.geodata.get('gamedata/geodata/0.js')
        });

        this.workers[1].postMessage({
            type: 'zdata',
            data: this.loader.geodata.get('gamedata/zdata/0.js')
        });


        //console.log(this.loader.geo.get('gamedata/geometry/male_low.js'));
        let json_geo = this.loader.geo.get('gamedata/geometry/male_low.js').toJSON();
        let srcGeo = this.loader.geo.get('gamedata/geometry/male_low.js');
        let skinIndices = [];
        let skinWeights = [];
        for (let i in srcGeo.skinIndices) {
            skinIndices.push(srcGeo.skinIndices[i].x);
            skinIndices.push(srcGeo.skinIndices[i].y);
            skinIndices.push(srcGeo.skinIndices[i].z);
            skinIndices.push(srcGeo.skinIndices[i].w);

            skinWeights.push(srcGeo.skinWeights[i].x);
            skinWeights.push(srcGeo.skinWeights[i].y);
            skinWeights.push(srcGeo.skinWeights[i].z);
            skinWeights.push(srcGeo.skinWeights[i].w);
        }

        json_geo.data.skinIndices = skinIndices;
        json_geo.data.skinWeights = skinWeights;
        json_geo.data.influencesPerVertex = 4;




        this.corpsMaker.postMessage({
            type: 'geometry',
            data: {
                type: 1,
                geo: json_geo
            }
        });

        this.corpsMaker.postMessage({
            type: 'geometry',
            data: {
                type: 2,
                geo: json_geo
            }
        });

        this.corpsMaker.postMessage({
            type: 'geometry',
            data: {
                type: 3,
                geo: json_geo
            }
        });

        this.corpsMaker.postMessage({
            type: 'geometry',
            data: {
                type: 4,
                geo: json_geo
            }
        });


        for (let i in maps[0].obstacles) {
            let geo = this.loader.geo.get('gamedata/geometry/' + maps[0].obstacles[i].geo);
            let bump;
            if (maps[0].obstacles[i].bumpMap) {
                bump = this.loader.textures.get('gamedata/textures/' + maps[0].obstacles[i].bumpMap);
            }
            let mesh = new THREE.Mesh(
                geo,
                new THREE.MeshPhongMaterial({
                    map: this.loader.textures.get('gamedata/textures/' + maps[0].obstacles[i].map),
                    bumpMap: bump
                })
            );
            mesh.scale.set(maps[0].ground[i].scale, maps[0].ground[i].scale, maps[0].ground[i].scale);
            this.scene.add(mesh);
            mesh.rotation.fromArray(maps[0].obstacles[i].rot);
            mesh.updateMatrix();
            mesh.updateMatrixWorld();
            mesh.matrixAutoUpdate = false;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }

        for (let i in maps[0].etcObj) {
            let geo = this.loader.geo.get('gamedata/geometry/' + maps[0].etcObj[i].geo);
            let bump;
            if (maps[0].etcObj[i].bumpMap) {
                bump = this.loader.textures.get('gamedata/textures/' + maps[0].etcObj[i].bumpMap)
            }
            let mesh = new THREE.Mesh(
                geo,
                new THREE.MeshPhongMaterial({
                    map: this.loader.textures.get('gamedata/textures/' + maps[0].etcObj[i].map),
                    bumpMap: bump
                })
            );
            mesh.scale.set(maps[0].ground[i].scale, maps[0].ground[i].scale, maps[0].ground[i].scale);
            this.scene.add(mesh);
            mesh.rotation.fromArray(maps[0].etcObj[i].rot);
            mesh.updateMatrix();
            mesh.updateMatrixWorld();
            mesh.matrixAutoUpdate = false;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
        this.geodata = this.loader.geodata.get('gamedata/geodata/0.js');
        this.zdata = this.loader.geodata.get('gamedata/zdata/0.js');


    },

    getZ: function(pos) {

        let px = Math.floor(pos.x / 10);
        let py = Math.floor(pos.z / 10);
        if (this.zdata[px] && this.zdata[px][py]) {
            return this.zdata[px][py];
        }
        return 0;
    },

    canMove: function(pos) {
        let px = Math.floor(pos.x / 10);
        let py = Math.floor(pos.z / 10);
        //console.log(px, py);
        if (this.geodata[px] && this.geodata[px][py]) {
            return false;
        }
        if (this.colData[px] && this.colData[px][py]) {
            return false;
        }

        return true;

    },

    geoTrace: function(from, dir, step) {
        let f = new THREE.Vector3().copy(from);
        let t = new THREE.Vector3().copy(dir).multiplyScalar(step).add(f);
        let s = new THREE.Vector3().copy(dir).multiplyScalar(5);
        let cur = 0;

        while (cur < step) {
            f.add(s);
            cur += 5;
            if (cur >= step) {
                return { point: t, canMove: this.canMove(t) };
            }
            if (!this.canMove(f)) {
                return { point: f, canMove: false };
            }

        }
        return { point: f, canMove: true };

    },

    upScore: function(points) {
        points = points || 1;
        this.score += points;
        $('#score').text(this.score);
    },

    getMob: function(uuid) {
        for (let i in this.chars) {
            if (this.chars[i].pivot.uuid == uuid) {
                //console.log('found');
                return this.chars[i];
            }
        }
    },

    toScreenPosition: function(obj, camera) {
        var vector = new THREE.Vector3();

        var widthHalf = 0.5 * this.renderer.context.canvas.width;
        var heightHalf = 0.5 * this.renderer.context.canvas.height;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(camera);

        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;

        return {
            x: vector.x,
            y: vector.y
        };

    },

    sendScore: function() {
        $.post('stat/add_result.php', {
            uid: this.statUid,
            score: this.score,
            kills: this.kills,
            weapon: this.player.weapon.type
        }, function(id) {
            Game.showScore(id);
        });
    },

    showScore: function(id) {
        //console.log('show score');
        $('#result_stat').show();
        $.ajax({
            url: 'stat/get_result.php',

            success: function(result) {
                //console.log(result);
                $('#result_stat .rows').html('');
                if (result && result.length) {
                    for (let i in result) {
                        let row = $('<div/>').addClass('row');
                        if (id == result[i].id) {
                            $(row).addClass('curResult');
                        } else {
                            //console.log(id, result[i].id);
                        }
                        $(row).append('<div>' + result[i].uid + '</div>');
                        //$(row).append('<div>' + result[i].date + '</div>');
                        $(row).append('<div>' + result[i].weapon + '</div>');
                        $(row).append('<div>' + result[i].kills + '</div>');
                        $(row).append('<div>' + result[i].score + '</div>');
                        $('#result_stat .rows').append(row);
                    }
                }
            },
            dataType: ' json'
        });

    },

    setPause: function() {

        if (!this.pause) {
            this.pause = true;
            for (let i in this.workers) {
                this.workers[i].postMessage({
                    type: 'pause',
                    data: true
                });
            }
            $('#world').removeClass('hideCursor');
            $('#pause').show();
        } else {
            this.pause = false;
            for (let i in this.workers) {
                this.workers[i].postMessage({
                    type: 'pause',
                    data: false
                });
            }
            $('#world').addClass('hideCursor');
            $('#pause').hide();
        }
    },

    clean: function() {
        for (let i in this.chars) {
            this.chars[i].clean();
        }
        this.chars = [];
        if (this.player) {
            this.scene.remove(this.player.pivot);
        }
        for (let i in this.effects) {
            this.effects[i].clean();
        }
        this.effects = [];

        for (let i in this.drops) {
            this.drops[i].clean();
        }
        this.drops = [];

        for (let i in this.corps) {
            for (let n in this.corps[i]) {
                this.scene.remove(this.corps[i][n]);
            }
        }
        this.corps = {};
        this.corpsMaker.postMessage({ type: 'reset' });
        this.score = 0;
        this.kills = 0;
        $('#score').text(this.score);
    },

    restart: function() {
        this.clean();
        this.constrolsOff();
        this.setChars();
    }


};

$(document).ready(function() {
    Game.init();

    $('#restart').click(function() {
        $('#result_stat').hide();
        Game.restart();
        $('#world').addClass('hideCursor');
    });

});