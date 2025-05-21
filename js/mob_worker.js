importScripts('three.min.js', 'SkeletonController.js', 'animation.js', 'easystar-0.4.3.min.js');

var chars = {};
var char_pos = {};
var scene = new THREE.Scene();
var clock = new THREE.Clock();

var matrix = [];
var skeletons = [];
var objCount = 0;

var anim;
var bones;
var zdata;
var geodata;
var grid;
var grid_rough;

var shiftX, shiftY;
var maxX;
var maxY;
var mapbox;
var playerPos = [];
var pause = false;

//var finder = new PF.AStarFinder();
var easystar = new EasyStar.js();
var easystar_rough = new EasyStar.js();

function getZ(pos) {

    let px = Math.floor(pos.x / 10);
    let py = Math.floor(pos.z / 10);
    if (zdata[px] && zdata[px][py]) {
        return zdata[px][py];
    }
    return 0;
}

function isWolkable(pos) {
    let x = Math.floor(pos.x / 10);
    let y = Math.floor(pos.z / 10);
    if (geodata[x] && geodata[x][y]) {
        return false;
    }
    return true;
}

function linkMatrix(mesh) {
    let list = [];
    let getMatrix = function(m) {
        if (m.type != 'Bone') {
            matrix.push(m.matrix);
        }
        if (m.skeleton) {
            skeletons.push(m.skeleton);
        }
        objCount++;
        for (let i in m.children) {
            getMatrix(m.children[i]);
        }

    };

    getMatrix(mesh);
    //matrix[mesh.uuid] = list;
}

class Mob {
    constructor(data) {
        this.name = '';
        this.hitPower = 1;
        this.preset = null;
        this.data = {};
        this.pivot = new THREE.Group();
        this.animations = {};
        this.overlay_anim = {};
        this.body = { mesh: null, id: null };
        this.cur_anim = '';
        this.cur_overlay_anim = '';
        this.draw(data);
        this.ai_timer = Math.random();
        this.moveSpeed = 180;
        this._quaternion = new THREE.Quaternion();
        this.shadowMesh = new THREE.Object3D();
        this.geoPos = new THREE.Vector2();
        this.hitDelay = 0;

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

    stop_overlay_anim() {
        for (var a in this.overlay_anim) {
            this.overlay_anim[a].stop();
        }
        this.cur_overlay_anim = '';
    }

    clear() {
        Game.scene.remove(this.pivot);
        this.animations = {};
        this.overlay_anim = {};

    }

    animate(delta) {

        for (var a in this.animations) {
            this.animations[a].update(delta);
        }



        if (this.skeleton) {
            this.skeleton.update(delta);
        }

        if (this.dead) {
            return;
        }

        if (this.inAttack) {
            return;
        }

        this.ai_timer -= delta;
        //this.hitDelay -= delta;

        if (playerPos.length) {
            let spos = new THREE.Vector2(this.shadowMesh.position.x / 10, this.shadowMesh.position.z / 10);
            let ppos = new THREE.Vector2().fromArray(playerPos);
            if (spos.distanceTo(ppos) < 5) {
                this.path = null;
                if (this.pathId) {
                    easystar.cancelPath(this.pathId);
                    this.pathId = null;
                }
                let pPos3 = new THREE.Vector3(ppos.x * 10, this.shadowMesh.position.y, ppos.y * 10);
                this.shadowMesh.lookAt(pPos3);
                for (var a in this.animations) {
                    this.animations[a].stop();
                }

                this.animations.attack.play();
                this.inAttack = true;
                /*if (this.hitDelay <= 0) {
                    this.hitDelay = 1;
                    postMessage({ type: 'hit', power: 1 });

                }*/
            }
        }

        if (this.ai_timer <= 0 && !this.anticollision) {
            if (playerPos.length) {
                let sx = Math.floor(this.shadowMesh.position.x / 10);
                let sy = Math.floor(this.shadowMesh.position.z / 10);
                if (!this.rnd_angle) {
                    this.rnd_angle = Math.PI * Math.random() * 2;
                }
                let radius = 600;
                let dist = new THREE.Vector2().fromArray(playerPos);
                dist.x -= sx;
                dist.y -= sy;
                sx += shiftX;
                sy += shiftY;
                if (dist.length() < 62) {
                    radius = 300;
                }
                if (dist.length() < 32) {
                    radius = 150;
                }

                if (dist.length() < 17) {
                    radius = 50;
                }
                //console.log(radius);
                //console.log(dist.length());

                let dx = Math.floor(Math.cos(this.rnd_angle) * radius / 10) + playerPos[0];
                let dy = Math.floor(Math.sin(this.rnd_angle) * radius / 10) + playerPos[1];
                let n = 0;
                while (!this.checkPos(dx, dy)) {
                    n++;
                    if (n > 10) {
                        break;
                    }
                    radius += 40;
                    dx = Math.floor(Math.cos(this.rnd_angle) * radius / 10) + playerPos[0];
                    dy = Math.floor(Math.sin(this.rnd_angle) * radius / 10) + playerPos[1];
                }

                let rnd_dist = new THREE.Vector2().set(sx, sy).distanceTo(new THREE.Vector2().set(dx + shiftX, dy + shiftY));
                //console.log(rnd_dist);

                if (rnd_dist < 150) {


                    if (!geodata[dx] || !geodata[dx][dy]) {
                        this.ai_timer = Math.random();
                        dx += shiftX;
                        dy += shiftY;
                        if (dx > 0 && dy > 0 && dx < maxX && dy < maxY) {
                            //console.log(sx, sy, dx, dy);
                            //let path = finder.findPath(sx, sy, dx, dy, grid.clone());
                            if (this.pathId) {
                                easystar.cancelPath(this.pathId);
                                easystar_rough.cancelPath(this.pathId);
                                this.pathId = null;
                            }
                            //console.log(sx, sy, dx, dy);

                            this.pathId = easystar.findPath(sx, sy, dx, dy, this.pathfound.bind(this));
                            easystar.calculate();
                        } else {
                            this.rnd_angle = Math.PI * Math.random() * 2;
                            this.ai_timer = 0;
                        }
                        //console.log(path);

                    } else {
                        this.rnd_angle = Math.PI * Math.random() * 2;
                        this.ai_timer = 0;
                    }
                } else {
                    dx += shiftX;
                    dy += shiftY;
                    if (grid_rough[Math.floor(dy / 10)] && !grid_rough[Math.floor(dy / 10)][Math.floor(dx / 10)]) {
                        this.ai_timer = Math.random();

                        if (dx > 0 && dy > 0 && dx < maxX && dy < maxY) {
                            //console.log(sx, sy, dx, dy);
                            //let path = finder.findPath(sx, sy, dx, dy, grid.clone());
                            if (this.pathId) {
                                easystar.cancelPath(this.pathId);
                                easystar_rough.cancelPath(this.pathId);
                                this.pathId = null;
                            }
                            //console.log(sx, sy, shiftX, shiftY);
                            sx = Math.floor(sx / 10);
                            sy = Math.floor(sy / 10);
                            dx = Math.floor(dx / 10);
                            dy = Math.floor(dy / 10);
                            //console.log(sx, sy, dx, dy);
                            this.pathId = easystar_rough.findPath(sx, sy, dx, dy, this.pathfound_rough.bind(this));
                            easystar_rough.calculate();
                        } else {
                            this.rnd_angle = Math.PI * Math.random() * 2;
                            this.ai_timer = 0;
                        }
                        //console.log(path);

                    } else {
                        this.rnd_angle = Math.PI * Math.random() * 2;
                        this.ai_timer = 0;
                    }

                }
            }


        }

        if (this.path && this.path[this.cur_step]) {

            //console.log(this.path[this.cur_step]);
            let target = new THREE.Vector2().copy(this.path[this.cur_step]);
            //console.log(target);
            target.x -= shiftX;
            target.y -= shiftY;
            target.x *= 10;
            target.y *= 10;

            let pos = new THREE.Vector2();
            pos.x = this.shadowMesh.position.x;
            pos.y = this.shadowMesh.position.z;
            let move = new THREE.Vector2().copy(target).sub(pos).normalize();
            let dist = pos.distanceTo(target);
            let step = delta * this.moveSpeed;
            let look = new THREE.Vector3().copy(this.shadowMesh.position);
            look.x += move.x;
            look.z += move.y;
            //this.shadowMesh.position.copy(this.pivot.position);
            this.shadowMesh.lookAt(look);

            if (step >= dist) {
                this.shadowMesh.position.x = target.x;
                this.shadowMesh.position.z = target.y;
                this.anticollision = null;
                this.cur_step++;
                if (this.cur_step == this.path.length) {
                    this.path = null;
                }

            } else {
                move.multiplyScalar(step);
                pos.add(move);
                this.shadowMesh.position.x = pos.x;
                this.shadowMesh.position.z = pos.y;
            }

            this.shadowMesh.position.y = getZ(this.shadowMesh.position);
            //console.log(target, pos, this.pivot.position.y);
            if (!this.animations['walk'].playing) {
                this.animations['walk'].play();
                this.animations['main'].stop();
            }



        } else {
            if (!this.animations['main'].playing) {
                this.animations['main'].play();
                this.animations['walk'].stop();
                //console.log('stop');
            }
        }

        let shift = new THREE.Vector3();



        let geoPos = new THREE.Vector2(this.shadowMesh.position.x / 10, this.shadowMesh.position.z / 10);
        let pPos = new THREE.Vector2().fromArray(playerPos);
        if (geoPos.distanceTo(pPos) < 4) {

            let vec = new THREE.Vector2()
                .copy(pPos)
                .sub(geoPos);

            vec.multiplyScalar((1 - geoPos.distanceTo(pPos) / 4));

            //.sub(this.pivot.position);
            shift.x += vec.x;
            shift.z += vec.y;


        }

        for (let i in char_pos) {
            if (i != this.pivot.uuid) {
                //console.log(this.pos.distanceTo(Game.chars[i].pos));
                //console.log(geoPos.distanceTo(char_pos[i]));

                if (geoPos.distanceTo(char_pos[i]) < 4) {

                    let vec = new THREE.Vector2()
                        .copy(char_pos[i])
                        .sub(geoPos);
                    vec.multiplyScalar((1 - geoPos.distanceTo(char_pos[i]) / 4));


                    //.sub(this.pivot.position);
                    shift.x += vec.x;
                    shift.z += vec.y;


                }
            }
        }
        if (shift.length() > 0.1) {
            //this.path = null;
            shift.y = 0;
            shift.normalize();
            let sStep = delta * this.moveSpeed * -0.8;
            shift.multiplyScalar(sStep);
            //console.log(shift);
            let position = new THREE.Vector3().copy(this.shadowMesh.position);
            position.add(shift);
            position.x = Math.max(mapbox.min[0], position.x);
            position.x = Math.min(mapbox.max[0], position.x);
            position.z = Math.max(mapbox.min[2], position.z);
            position.z = Math.min(mapbox.max[2], position.z);
            if (isWolkable(position)) {
                //this.pivot.position.add(shift);
                this.shadowMesh.position.copy(position);
                this.shadowMesh.position.y = getZ(this.shadowMesh.position);
            }
        }

        this._quaternion.setFromEuler(this.shadowMesh.rotation);
        var length = this._quaternion.inverse().multiply(this.pivot.quaternion).length();
        this._quaternion.setFromEuler(this.shadowMesh.rotation);
        /*let rstep = this.skeleton.quat_speed * delta * 0.2;

        if (rstep >= length) {
            this.pivot.quaternion.copy(this._quaternion);
        } else {
            this.pivot.quaternion.slerp(this._quaternion, rstep / length);
        }*/
        this.pivot.quaternion.slerp(this._quaternion, delta * 2);

        let sync = new THREE.Vector3().copy(this.shadowMesh.position).sub(this.pivot.position);
        let syncDist = sync.length();
        let syncSpeed = this.moveSpeed * syncDist / 25;

        let syncStep = syncSpeed * delta;



        //console.log(syncDist);

        let posChange = new THREE.Vector3().copy(this.pivot.position);

        if (syncStep < syncDist) {

            sync.normalize();
            sync.multiplyScalar(syncStep);
            this.pivot.position.add(sync);
        } else {
            this.pivot.position.copy(this.shadowMesh.position);
        }
        posChange.sub(this.pivot.position);
        let refstep = this.moveSpeed * delta;
        let boost = posChange.length() / refstep;
        //console.log(boost);
        if (boost) {
            this.animations['walk'].set_boost(boost * this.walkBoost);
        }






    }

    draw(data) {

        var geometry = new THREE.Geometry();


        geometry.bones = bones;
        //console.log(geometry.bones);


        var material = new THREE.MeshBasicMaterial({ skinning: true });

        this.pivot = new THREE.SkinnedMesh(geometry, material, false);
        this.pivot.uuid = data.id;

        if (!this.skeleton) {
            this.skeleton = new THREE.SkeletonController(this.pivot);
            this.skeleton.smooth = true;
            this.skeleton.quat_speed = 10;
        }

        var skeleton = this.pivot.skeleton;
        var size = 16;

        var boneMatrices = new Float32Array(size * size * 4); // 4 floats per RGBA pixel
        boneMatrices.set(skeleton.boneMatrices); // copy current values
        //boneMatrices.set(boneMatrices);

        var boneTexture = new THREE.DataTexture(boneMatrices, size, size, THREE.RGBAFormat, THREE.FloatType);
        boneTexture.needsUpdate = true;
        //console.log(boneTexture);

        skeleton.boneMatrices = boneMatrices;
        skeleton.boneTexture = boneTexture;
        skeleton.boneTextureSize = size;


        scene.add(this.pivot);

        //var anim = data.anim;
        //console.log(data.anim);
        //console.log(anim);
        this.animations['main'] = new THREE.animation(this.skeleton, anim['Stand_Pistol-Idle'], {
            loop: true,

        });
        this.animations['main'].play();

        this.animations['walk'] = new THREE.animation(this.skeleton, anim['Sprint_Pistol'], {
            loop: true,


        });
        this.walkBoost = 1.5;
        this.animations.walk.set_boost(this.walkBoost);
        //console.log('char ready');
        linkMatrix(this.pivot);

        this.animations['attack'] = new THREE.animation(this.skeleton, anim['AxeHit'], {
            loop: false,
            mob: this,
            onend: function() {
                this.mob.inAttack = false;
                let ppos = new THREE.Vector2().fromArray(playerPos);
                let spos = new THREE.Vector2(this.mob.shadowMesh.position.x / 10, this.mob.shadowMesh.position.z / 10);
                if (spos.distanceTo(ppos) < 7) {
                    postMessage({ type: 'hit', power: this.mob.hitPower });
                } else {
                    //console.log('miss');
                }
            }

        });
        this.animations['attack'].set_boost(2);


        this.death = [];

        let onDeathEnd = function() {
            postMessage({ type: 'death', id: this.mob.pivot.uuid });
        };
        this.animations['death1'] = new THREE.animation(this.skeleton, anim['Death_Backward'], {
            loop: false,
            mob: this,
            onend: onDeathEnd

        });

        this.death.push(this.animations['death1']);

        this.animations['death2'] = new THREE.animation(this.skeleton, anim['Death_Forward'], {
            loop: false,
            mob: this,
            onend: onDeathEnd

        });
        this.death.push(this.animations['death2']);

        this.animations['death3'] = new THREE.animation(this.skeleton, anim['Death_Side'], {
            loop: false,
            mob: this,
            onend: onDeathEnd

        });
        this.death.push(this.animations['death3']);


    }

    kill() {
        this.dead = true;
        this.hitPower *= 1.05;
        this.moveSpeed = Math.floor(this.moveSpeed * 1.05);
        for (var a in this.animations) {
            this.animations[a].stop();
        }
        let rnd = Math.floor(Math.random() * this.death.length);
        this.death[rnd].play();
    }
    respawn(pos) {
        this.dead = false;
        this.inAttack = false;
        for (var a in this.animations) {
            this.animations[a].stop();
        }
        this.pivot.position.set(pos[0], 0, pos[1]);
        this.pivot.position.y = getZ(this.pivot.position);
        this.shadowMesh.position.copy(this.pivot.position);

    }

    pathfound(path) {
        //console.log(path);
        //this.path = path;
        let sx = Math.floor(this.shadowMesh.position.x / 10);
        let sy = Math.floor(this.shadowMesh.position.z / 10);
        sx += shiftX;
        sy += shiftY;
        this.path = [];
        for (let i in path) {
            if (path[i].x == sx && path[i].y == sy) {
                continue;
            }
            //if (i > 0) {
            this.path.push(path[i]);
            //}
        }
        if (!this.path.length) {
            this.path = null;
        }
        this.cur_step = 0;
        this.pathId = null;
    }

    pathfound_rough(path_rough) {
        /*if (path_rough) {
            console.log(path_rough);
        }*/
        let path = [];
        this.cur_step = 0;
        let sx = Math.floor(this.shadowMesh.position.x / 10);
        let sy = Math.floor(this.shadowMesh.position.z / 10);
        sx += shiftX;
        sy += shiftY;

        if (path_rough) {
            for (let i in path_rough) {
                //if (i > 0) {
                if (path_rough[i].x * 10 == sx && path_rough[i].y * 10 == sy) {
                    continue;
                }
                path.push({ x: path_rough[i].x * 10, y: path_rough[i].y * 10 });
                //}
            }
        }
        if (path.length) {
            this.path = path;
        } else {
            this.path = null;
        }

        this.pathId = null;
    }

    checkPos(x, y) {
        let pos = new THREE.Vector2(x, y);
        for (let i in char_pos) {
            if (i != this.pivot.uuid) {
                /*if (char_pos[i].x == x && char_pos[i].y == y) {
                    return false;
                }*/
                if (pos.distanceTo(char_pos[i]) < 3) {
                    return false;
                }
            }
        }
        return true;
    }

    shift(shift) {
        let vec = new THREE.Vector3().fromArray(shift);
        vec.y = 0;
        this.pivot.position.add(vec);

    }
}

var newmobid;
var newmatrix;
var newskelet;
onmessage = function(e) {
    //console.log('Message received from main script', e);
    //postMessage('copy');
    if (newmatrix) {
        //console.log('new matrix');

        chars[newmobid].pivot.matrix.elements = new Float32Array(e.data);

        newskelet = true;
        newmatrix = false;
    } else if (newskelet) {
        //console.log('new skelet');
        chars[newmobid].pivot.skeleton.boneMatrices = new Float32Array(e.data);
        chars[newmobid].pivot.skeleton.boneTexture.image.data = chars[newmobid].pivot.skeleton.boneMatrices

        newskelet = false;
    } else {
        let p = e.data;
        switch (p.type) {
            case 'new':

                chars[p.data.id] = new Mob(p.data);
                newmobid = p.data.id;
                newmatrix = true;

                break;

            case 'setPos':
                //console.log('set pos');
                chars[p.data.id].pivot.position.fromArray(p.data.pos);
                chars[p.data.id].shadowMesh.position.fromArray(p.data.pos);
                break;

            case 'setScale':
                //console.log('set scale');
                chars[p.data.id].pivot.scale.set(p.data.scale[0], p.data.scale[1], p.data.scale[2]);
                break;

            case 'bones':
                bones = e.data.data;
                break;

            case 'anim':
                anim = e.data.data;
                break;

            case 'geodata':
                geodata = e.data.data;
                //let maxX = 0;
                //let maxY = 0;
                //console.log(grid);
                for (let x in geodata) {
                    for (let y in geodata[x]) {
                        //console.log(parseInt(x) + shiftX, parseInt(y) + shiftY);
                        //grid.setWalkableAt(parseInt(x) + shiftX, parseInt(y) + shiftY, false);
                        //maxX = Math.max(maxX, parseInt(x) + shiftX);
                        //maxY = Math.max(maxY, parseInt(y) + shiftY);
                        grid[parseInt(y) + shiftY][parseInt(x) + shiftX] = 1;
                        grid_rough[Math.floor((parseInt(y) + shiftY) / 10)][Math.floor((parseInt(x) + shiftX) / 10)] = 1;


                    }
                }
                //console.log(maxX, maxY);
                easystar.setGrid(grid);
                easystar.setAcceptableTiles([0]);
                easystar.enableDiagonals();
                //easystar.enableCornerCutting();
                easystar.setIterationsPerCalculation(300);

                easystar_rough.setGrid(grid_rough);
                easystar_rough.setAcceptableTiles([0]);
                easystar_rough.enableDiagonals();
                //easystar_rough.enableCornerCutting();
                //easystar_rough.setIterationsPerCalculation(300);

                //easystar.setIterationsPerCalculation(1000);

                break;

            case 'zdata':
                zdata = e.data.data;
                break;

            case 'grid':
                /*grid = new PF.Grid(e.data.data.width + 10, e.data.data.height + 10);
                shiftX = e.data.data.shiftX;
                shiftY = e.data.data.shiftY;
                console.log(e.data.data.width, e.data.data.height);*/
                shiftX = e.data.data.shiftX;
                shiftY = e.data.data.shiftY;
                maxX = e.data.data.width + 5;
                maxY = e.data.data.height + 5;
                grid = [];
                for (let y = 0; y < maxY; y++) {
                    //for (let x = 0; x < e.data.data.width + 5; x++) {
                    //grid.push(new Array(e.data.data.height));
                    let col = [];
                    for (let x = 0; x < maxX; x++) {
                        //for (let y = 0; y < e.data.data.height + 5; y++) {
                        col.push(0);
                    }
                    grid.push(col);

                }

                grid_rough = [];
                for (let y = 0; y < maxY; y += 10) {

                    let col = [];
                    for (let x = 0; x < maxX; x += 10) {

                        col.push(0);
                    }
                    grid_rough.push(col);

                }

                break;



            case 'playerPos':
                playerPos = e.data.data;
                break;

            case 'mobPos':
                if (!char_pos[e.data.data.id]) {
                    char_pos[e.data.data.id] = new THREE.Vector2();
                }
                char_pos[e.data.data.id].fromArray(e.data.data.pos)
                break;

            case 'shift':
                chars[e.data.data.id].shift(e.data.data.shift);
                break;

            case 'mapbox':
                mapbox = e.data.data;
                break;

            case 'killed':
                chars[e.data.data.id].kill();
                break;

            case 'respown':
                chars[e.data.data.id].respawn(e.data.data.pos);
                break;

            case 'pause':
                pause = e.data.data;
                break;

            case 'clean':
                let _chars = {};
                for (let i in chars) {
                    if (i != e.data.data.id) {
                        _chars[i] = chars[i];
                    }
                }
                chars = _chars;
                break;
        }
    }

};

setInterval(function() {
    let delta = clock.getDelta();
    if (pause) {
        return;
    }
    for (let i in chars) {
        chars[i].animate(delta);
    }
    //scene.updateMatrix();
    scene.updateMatrixWorld(true);
    //let mList = {};
    /*let mList = new Float32Array(matrix.length * 16);
    let p = 0;
    for (let i in matrix) {
        let a = matrix[i].toArray();
        for (let n in a) {
            mList[p] = a[n];
            p++;
        }


    }*/

    //let sList = new Float32Array(skeletons.length * 1024);
    //let sPos = 0;
    for (let i in skeletons) {
        skeletons[i].update();
        /*let boneTexture = skeletons[i].boneTexture.image.data;
        let texLen = boneTexture.length;
        for (let t = 0; t < texLen; t++) {
            sList[sPos] = boneTexture[t];
            sPos++;
        }*/
    }

    //postMessage(mList);
    //console.log(mList.length);

    //let sBuffer = sList.buffer;
    //let mBuffer = mList.buffer;

    //postMessage(mList);
    //postMessage(sList);
    //postMessage(mBuffer, [mBuffer]);
    //postMessage(sBuffer, [sBuffer]);
    //console.log(sBuffer);
}, 1000 / 60);