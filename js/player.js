class Player {
    constructor() {
        this.hp = 100;
        this.maxhp = 100;
        this.animations = {};
        this.overlay_anim = {};
        this.pivot = new THREE.Group();

        this.body = { mesh: null, id: null };
        this.cur_anim = '';
        this.cur_overlay_anim = '';
        this.moveVec = new THREE.Vector3();
        this.lookVec = new THREE.Vector3();
        this._quaternion = new THREE.Quaternion();
        //this.moveSpeed = 150;

        let geometry = Game.loader.geo.get('gamedata/geometry/War_high.js');
        geometry.bones = Game.loader.bones.get('gamedata/skeletons/player.json');
        let anim = Game.loader.anim.get('gamedata/animations/combat.json');
        var material = new THREE.MeshPhongMaterial({ skinning: true, map: Game.loader.textures.get('gamedata/textures/WarMan_Dif.jpg') });
        this.body.mesh = new THREE.SkinnedMesh(geometry, material, false);
        this.shadowMesh = new THREE.Object3D();
        this.body.mesh.castShadow = true;
        this.body.mesh.receiveShadow = true;

        this.pivot.add(this.body.mesh);
        let playerMark = new THREE.Mesh(
            new THREE.CircleGeometry( 3, 32 ),
            new THREE.MeshBasicMaterial( { color: 0xffff00, transparent: true, opacity: 0.1 } )
        );
        playerMark.rotation.x = -Math.PI/2
        playerMark.position.y = 1;
        this.pivot.add(playerMark);

        //console.log(anim);
        Game.scene.add(this.pivot);
        this.skeleton = new THREE.SkeletonController(this.body.mesh);
        this.skeleton.smooth = true;
        this.skeleton.quat_speed = 10;
        console.log(anim);
        this.boosters = [];

        this.animSet = {

            pistol: {
                run: new THREE.animation(this.skeleton, anim['Run-Aim-Pistol'], {
                    loop: true,
                    player: this
                }),

                runBack: new THREE.animation(this.skeleton, anim['Run-Aim-Pistol'], {
                    loop: true,
                    player: this,
                    revers: true
                }),

                stand: new THREE.animation(this.skeleton, anim['stand_pistol'], {
                    loop: true,
                    player: this
                }),

                delay: new THREE.animation(this.skeleton, anim['stand_pistol'], {
                    loop: true,
                    player: this
                }),

                strafeLeft: new THREE.animation(this.skeleton, anim['Strafe-Aimed-Pistol'], {
                    loop: true,
                    player: this,
                    revers: true

                }),

                strafeRight: new THREE.animation(this.skeleton, anim['Strafe-Aimed-Pistol'], {
                    loop: true,
                    player: this

                })
            },

            rifle: {
                run: new THREE.animation(this.skeleton, anim['Run-AimedRifle'], {
                    loop: true,
                    player: this
                }),

                runBack: new THREE.animation(this.skeleton, anim['Run-AimedRifle'], {
                    loop: true,
                    player: this,
                    revers: true
                }),

                stand: new THREE.animation(this.skeleton, anim['Stand_Rifle'], {
                    loop: true,
                    player: this
                }),

                delay: new THREE.animation(this.skeleton, anim['Stand_Rifle'], {
                    loop: true,
                    player: this
                }),

                strafeLeft: new THREE.animation(this.skeleton, anim['Strafe-AimedRifleR'], {
                    loop: true,
                    player: this,
                    revers: true

                }),

                strafeRight: new THREE.animation(this.skeleton, anim['Strafe-AimedRifleR'], {
                    loop: true,
                    player: this

                })
            },

            shotgun: {
                run: new THREE.animation(this.skeleton, anim['Run-AimedRifle'], {
                    loop: true,
                    player: this
                }),

                runBack: new THREE.animation(this.skeleton, anim['Run-AimedRifle'], {
                    loop: true,
                    player: this,
                    revers: true
                }),

                stand: new THREE.animation(this.skeleton, anim['Stand_Rifle'], {
                    loop: true,
                    player: this
                }),

                delay: new THREE.animation(this.skeleton, anim['Stand_Rifle'], {
                    loop: true,
                    player: this
                }),

                strafeLeft: new THREE.animation(this.skeleton, anim['Strafe-AimedRifleR'], {
                    loop: true,
                    player: this,
                    revers: true

                }),

                strafeRight: new THREE.animation(this.skeleton, anim['Strafe-AimedRifleR'], {
                    loop: true,
                    player: this

                })
            }
        };

        //this.overlay_anim['walk'].stop();
        //this.overlay_anim['walk_revers'].stop();
        this.overlay_anim['walk'] = new THREE.animation(this.skeleton, anim['WalkCycle'], {
            loop: true,
            player: this,
            no_motionless: true
        });

        this.overlay_anim['walk_revers'] = new THREE.animation(this.skeleton, anim['WalkCycle'], {
            loop: true,
            revers: true,
            player: this,
            no_motionless: true
        });

        this.overlay_anim['walk_strafe_left'] = new THREE.animation(this.skeleton, anim['aStrafe'], {
            loop: true,
            revers: true,
            player: this,
            no_motionless: true
        });

        this.overlay_anim['walk_strafe_right'] = new THREE.animation(this.skeleton, anim['aStrafe'], {
            loop: true,
            player: this,
            no_motionless: true
        });



        this.death = [];


        this.animations['death1'] = new THREE.animation(this.skeleton, anim['Death_Backward'], {
            loop: false,
            player: this,

        });

        this.death.push(this.animations['death1']);

        this.animations['death2'] = new THREE.animation(this.skeleton, anim['Death_Forward'], {
            loop: false,
            player: this,

        });
        this.death.push(this.animations['death2']);

        this.animations['death3'] = new THREE.animation(this.skeleton, anim['Death_Side'], {
            loop: false,
            player: this,

        });
        this.death.push(this.animations['death3']);

        this.animations.reload = new THREE.animation(this.skeleton, anim['Reload'], {
            loop: false,
            player: this,
            onend: function() {
                this.player.weapon.reloadDone();
                this.player.inReload = false;
            },
            onstop: function() {
                this.player.inReload = false;
            }

        });


        //this.overlay_anim.walk_revers.set_boost(1.5);
        this.back = this.skeleton.get_bone('Bone_spine_2');
        this.left_hand = this.body.mesh.getObjectByName('Weapon_L', true);
        this.right_hand = this.body.mesh.getObjectByName('Weapon_R', true);
        this.head = this.body.mesh.getObjectByName('Bone_head', true);
        /*let ak = new THREE.Mesh(
            Game.loader.geo.get('gamedata/geometry/Akm_6.js'),
            new THREE.MeshBasicMaterial({ map: Game.loader.textures.get('gamedata/textures/akm.jpg') })
        );
        ak.rotation.x = 7 * Math.PI / 180;
        ak.rotation.y = -5 * Math.PI / 180;
        ak.rotation.z = -32 * Math.PI / 180;
        ak.position.set(0.02, -0.05, -0.05);
        this.right_hand.add(ak);*/
        this.setWeapon('pistol');

        //this.pivot.position.y = Game.getZ(this.pivot.position);
        //console.log(this.skeleton);
        this.geoPos = new THREE.Vector2();
        this.sendGeoPos();
        $('#hp').text(parseInt(this.hp) + '/' + this.maxhp);


    }

    get moveSpeed() {
        let speed = 150;
        if (this.getBoosterId('speedup') !== false) {
            speed *= 1.5;
        }
        return speed;
    }

    setWeapon(type) {
        let trigged = false;
        if (this.weapon) {
            this.right_hand.remove(this.weapon.mesh[0]);
            trigged = this.weapon.trigged;
            if (this.weapon.mesh[1]) {
                this.left_hand.remove(this.weapon.mesh[1]);
            }
        }
        this.weapon = new Weapon(type);
        this.weapon.trigged = trigged;
        this.right_hand.add(this.weapon.mesh[0]);
        if (this.weapon.mesh[1]) {
            this.left_hand.add(this.weapon.mesh[1]);
        }
        this.setAnimSet(this.weapon.getAnimType());
    }

    reload(time) {
        this.inReload = true;
        this.animations.reload.play();
        let boost = 2 / time;
        this.animations.reload.set_boost(boost);
        //console.log(this.animations.reload);
    }

    stopAnim() {
        for (var a in this.animations) {
            this.animations[a].stop();
        }
    }

    setAnimSet(type) {
        let set = this.animSet[type];
        for (let i in set) {


            this.animations[i] = set[i];

        }
    }

    animate(delta) {
        let boosters = [];
        for (let i in this.boosters) {
            this.boosters[i].update(delta);
            if (!this.boosters[i].needClean) {
                boosters.push(this.boosters[i]);
            }
        }
        this.boosters = boosters;

        for (let a in this.animations) {
            this.animations[a].update(delta);
        }

        for (let a in this.overlay_anim) {
            this.overlay_anim[a].update(delta);
        }


        if (this.dead) {
            if (this.skeleton) {
                this.skeleton.update(delta);
            }

            this.weapon.update(delta);
            return;
        }


        this.moveVec.set(0, 0, 0);
        let walkPlay = false;

        if (Game.keys.w) {
            this.moveVec.z = -1;
            walkPlay = true;
        }

        if (Game.keys.s) {
            this.moveVec.z = 1;
            walkPlay = true;
        }

        if (Game.keys.a) {
            this.moveVec.x = -1;
            walkPlay = true;
        }

        if (Game.keys.d) {
            this.moveVec.x = 1;
            walkPlay = true;
        }

        this.moveVec.normalize();

        this.lookVec.copy(Game.aimPoint).sub(this.pivot.position).normalize();
        let revers = false;
        let strafe = false;
        let vecDif = new THREE.Vector3().copy(this.lookVec).sub(this.moveVec);
        if (vecDif.length() > 0.9 && vecDif.length() <= 1.75) {
            //console.log('strafe');
            strafe = true;
        } else if (vecDif.length() > 1.75) {
            revers = true;
        }

        //console.log(vecDif.length());

        vecDif.normalize();




        //.applyMatrix4(new THREE.Matrix4().getInverse(this.players[id].body.matrixWorld))
        if (this.moveVec.length() > 0.1) {

            this.pivot.position.y = 0;
            let boneLook = new THREE.Vector3();
            boneLook.copy(vecDif)
                .applyMatrix4(new THREE.Matrix4().getInverse(this.back.matrixWorld));
            boneLook.y = this.back.position.y;
            let lookAngle = Math.atan2(this.lookVec.x, this.lookVec.z);

            if (!revers) {
                //this.body.mesh.lookAt(this.moveVec);
                if (strafe) {
                    let left = new THREE.Vector3();
                    left.x = this.moveVec.x * Math.cos(Math.PI / 2) - this.moveVec.z * Math.sin(Math.PI / 2);
                    left.z = this.moveVec.x * Math.sin(Math.PI / 2) + this.moveVec.z * Math.cos(Math.PI / 2);
                    let right = new THREE.Vector3();
                    right.x = this.moveVec.x * Math.cos(-Math.PI / 2) - this.moveVec.z * Math.sin(-Math.PI / 2);
                    right.z = this.moveVec.x * Math.sin(-Math.PI / 2) + this.moveVec.z * Math.cos(-Math.PI / 2);
                    let leftDif = new THREE.Vector3().copy(this.lookVec).sub(left);
                    let rightDif = new THREE.Vector3().copy(this.lookVec).sub(right);
                    if (leftDif.length() < rightDif.length()) {
                        this.shadowMesh.lookAt(left);
                        strafe = 'left';
                        let baseAngle = Math.atan2(left.x, left.z);
                        this.back.rotation.z -= lookAngle - baseAngle;
                    } else {
                        this.shadowMesh.lookAt(right);
                        strafe = 'right';
                        let baseAngle = Math.atan2(right.x, right.z);
                        this.back.rotation.z -= lookAngle - baseAngle;
                    }

                } else {
                    this.shadowMesh.lookAt(this.moveVec);
                    let baseAngle = Math.atan2(this.moveVec.x, this.moveVec.z);
                    this.back.rotation.z -= lookAngle - baseAngle;
                }
                //this.back.rotation.z -= Math.atan2(vecDif.x, vecDif.z) + Math.PI / 2;
                //console.log(this.back.rotation.z);

            } else {
                let reversMove = new THREE.Vector3().copy(this.moveVec).multiplyScalar(-1);
                //this.body.mesh.lookAt(reversMove);
                this.shadowMesh.lookAt(reversMove);
                let baseAngle = Math.atan2(reversMove.x, reversMove.z);
                this.back.rotation.z -= lookAngle - baseAngle;
                //vecDif.copy(this.lookVec).sub(reversMove).normalize();
                //this.back.rotation.z -= Math.atan2(vecDif.x, vecDif.z) + Math.PI / 2;
            }
            //console.log();
            //this.back.lookAt(boneLook);




            let step = new THREE.Vector3().copy(this.moveVec);
            step.multiplyScalar(delta * this.moveSpeed);
            let nextpos = new THREE.Vector3().copy(this.pivot.position);
            nextpos.add(step);
            if (Game.canMove(nextpos)) {
                this.pivot.position.copy(nextpos);
            } else {

                let angle = 10;
                let shiftVec = new THREE.Vector3();
                while (angle <= 90) {
                    nextpos.copy(this.pivot.position);
                    let x1 = this.moveVec.x * Math.cos(angle) - this.moveVec.z * Math.sin(angle);
                    let y1 = this.moveVec.y * Math.cos(angle) + this.moveVec.x * Math.sin(angle);
                    shiftVec.set(x1, 0, y1).multiplyScalar(delta * this.moveSpeed);
                    nextpos.add(shiftVec);
                    if (Game.canMove(nextpos)) {
                        this.pivot.position.copy(nextpos);
                        break;
                    }
                    nextpos.copy(this.pivot.position);
                    x1 = this.moveVec.x * Math.cos(angle) - this.moveVec.z * Math.sin(angle);
                    y1 = this.moveVec.y * Math.cos(angle) + this.moveVec.x * Math.sin(angle);
                    shiftVec.set(x1, 0, y1).multiplyScalar(delta * this.moveSpeed);
                    nextpos.add(shiftVec);
                    if (Game.canMove(nextpos)) {
                        this.pivot.position.copy(nextpos);
                        break;
                    }
                    angle += 10;

                }
            }

            let shift = new THREE.Vector3();
            let minDist = 100500;
            //console.log(this.pivot.position, Game.chars[0].pos);

            for (let i in Game.chars) {


                Game.chars[i].pos.y = this.pivot.position.y;
                if (this.pivot.position.distanceTo(Game.chars[i].pos) <= 40) {
                    //console.log('mod collision');
                    let vec = new THREE.Vector3()
                        .copy(Game.chars[i].pos)
                        .sub(this.pivot.position);
                    vec.multiplyScalar((1 - this.pivot.position.distanceTo(Game.chars[i].pos) / 40));


                    //.sub(this.pivot.position);
                    shift.x += vec.x;
                    shift.z += vec.z;


                } else {
                    //console.log(this.pivot.position.distanceTo(Game.chars[i].pos));
                }
                minDist = Math.min(this.pivot.position.distanceTo(Game.chars[i].pos), minDist);

            }
            //console.log(minDist);

            if (shift.length() > 0.1) {
                //this.path = null;

                shift.normalize();
                let sStep = delta * this.moveSpeed * -0.4;
                shift.multiplyScalar(sStep);
                //console.log(shift);
                let position = new THREE.Vector3().copy(this.pivot.position);
                //console.log(shift);
                position.add(shift);
                //console.log(shift);
                if (Game.canMove(position)) {
                    //console.log('can move');
                    //this.pivot.position.add(shift);
                    this.pivot.position.copy(position);
                    this.pivot.position.y = Game.getZ(this.pivot.position);
                }
            }




            //console.log(this.pivot.position.y);

        } else {
            //this.body.mesh.lookAt(this.lookVec);
            this.lookVec.y = this.shadowMesh.position.y;
            this.shadowMesh.lookAt(this.lookVec);
        }


        //this.pivot.position.add(step);


        this.pivot.position.x = Math.max(Game.mapbox.min.x, this.pivot.position.x);
        this.pivot.position.x = Math.min(Game.mapbox.max.x, this.pivot.position.x);
        this.pivot.position.z = Math.max(Game.mapbox.min.z, this.pivot.position.z);
        this.pivot.position.z = Math.min(Game.mapbox.max.z, this.pivot.position.z);

        this.pivot.position.y = Game.getZ(this.pivot.position);
        /*let center = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.1, 0.1),
            new THREE.MeshBasicMaterial({ depthTest: false, transparent: true, side: 2 })
        );
        center.position.y = 3;
        this.pivot.add(center);*/
        this.sendGeoPos();

        this._quaternion.setFromEuler(this.shadowMesh.rotation);
        var length = this._quaternion.inverse().multiply(this.body.mesh.quaternion).length();
        this._quaternion.setFromEuler(this.shadowMesh.rotation);
        let rstep = this.skeleton.quat_speed * delta;

        if (rstep >= length) {
            this.body.mesh.quaternion.copy(this._quaternion);
        } else {
            this.body.mesh.quaternion.slerp(this._quaternion, rstep / length);
        }

        if (walkPlay && this.inReload) {

            if (revers) {
                if (this.overlay_anim['walk_strafe_left'].playing) {
                    this.overlay_anim['walk_strafe_left'].stop();
                }

                if (this.overlay_anim['walk_strafe_right'].playing) {
                    this.overlay_anim['walk_strafe_right'].stop();
                }

                if (this.overlay_anim['walk'].playing) {
                    this.overlay_anim['walk'].stop();
                }

                if (!this.overlay_anim['walk_revers'].playing) {
                    this.overlay_anim['walk_revers'].play();
                }

            } else {
                if (strafe) {
                    if (this.overlay_anim['walk_revers'].playing) {
                        this.overlay_anim['walk_revers'].stop();
                    }
                    if (this.overlay_anim['walk'].playing) {
                        this.overlay_anim['walk'].stop();
                    }
                    if (strafe == 'left') {

                        if (this.overlay_anim['walk_strafe_right'].playing) {
                            this.overlay_anim['walk_strafe_right'].stop();
                        }
                        if (!this.overlay_anim['walk_strafe_left'].playing) {
                            this.overlay_anim['walk_strafe_left'].play();
                        }
                    } else {

                        if (!this.overlay_anim['walk_strafe_right'].playing) {
                            this.overlay_anim['walk_strafe_right'].play();
                        }
                        if (this.overlay_anim['walk_strafe_left'].playing) {
                            this.overlay_anim['walk_strafe_left'].stop();
                        }
                    }

                } else {

                    if (this.overlay_anim['walk_strafe_left'].playing) {
                        this.overlay_anim['walk_strafe_left'].stop();
                    }

                    if (this.overlay_anim['walk_strafe_right'].playing) {
                        this.overlay_anim['walk_strafe_right'].stop();
                    }

                    if (!this.overlay_anim['walk'].playing) {
                        this.overlay_anim['walk'].play();
                    }

                    if (this.overlay_anim['walk_revers'].playing) {
                        this.overlay_anim['walk_revers'].stop();
                    }
                }
            }
        } else {
            this.overlay_anim['walk'].stop();
            this.overlay_anim['walk_revers'].stop();
            this.overlay_anim['walk_strafe_left'].stop();
            this.overlay_anim['walk_strafe_right'].stop();

        }

        if (walkPlay) {
            if (this.animations['stand'].playing) {
                this.animations['stand'].stop();
                //console.log('play stand');
            }
            if (this.inReload) {
                if (this.animations['runBack'].playing) {
                    this.animations['runBack'].stop();
                    //console.log('play runBack');
                }
                if (this.animations['run'].playing) {
                    this.animations['run'].stop();
                    //console.log('stop run');
                }
                if (!this.animations['reload'].playing) {
                    this.animations['reload'].play();
                    //console.log('play stand');
                }

                if (this.animations['strafeRight'].playing) {
                    this.animations['strafeRight'].stop();

                }

                if (this.animations['strafeLeft'].playing) {
                    this.animations['strafeLeft'].stop();

                }

            } else {
                if (revers) {
                    if (this.animations['strafeRight'].playing) {
                        this.animations['strafeRight'].stop();

                    }

                    if (this.animations['strafeLeft'].playing) {
                        this.animations['strafeLeft'].stop();

                    }

                    if (this.animations['run'].playing) {
                        this.animations['run'].stop();
                        //console.log('stop run');
                    }

                    if (!this.animations['runBack'].playing) {
                        this.animations['runBack'].play();
                        //console.log('play runBack');
                    }

                } else {
                    if (strafe) {
                        if (this.animations['runBack'].playing) {
                            this.animations['runBack'].stop();

                        }

                        if (this.animations['run'].playing) {
                            this.animations['run'].stop();

                        }

                        if (strafe == 'left') {
                            //console.log('left');
                            if (this.animations['strafeRight'].playing) {
                                this.animations['strafeRight'].stop();

                            }

                            if (!this.animations['strafeLeft'].playing) {
                                this.animations['strafeLeft'].play();

                            }
                        } else {
                            //console.log('right');
                            if (!this.animations['strafeRight'].playing) {
                                this.animations['strafeRight'].play();

                            }

                            if (this.animations['strafeLeft'].playing) {
                                this.animations['strafeLeft'].stop();

                            }
                        }


                    } else {
                        if (this.animations['strafeRight'].playing) {
                            this.animations['strafeRight'].stop();

                        }

                        if (this.animations['strafeLeft'].playing) {
                            this.animations['strafeLeft'].stop();

                        }

                        if (!this.animations['run'].playing) {
                            this.animations['run'].play();
                            //console.log('play run');
                        }

                        if (this.animations['runBack'].playing) {
                            this.animations['runBack'].stop();
                            //console.log('stop runBack');
                        }
                    }
                }
            }
        } else {
            if (this.animations['run'].playing) {
                this.animations['run'].stop();
                //console.log('stop run');
            }
            if (this.animations['runBack'].playing) {
                this.animations['runBack'].stop();
                //console.log('stop runBack');
            }
            if (this.animations['strafeRight'].playing) {
                this.animations['strafeRight'].stop();

            }

            if (this.animations['strafeLeft'].playing) {
                this.animations['strafeLeft'].stop();

            }
            if (this.inReload) {
                if (this.animations['stand'].playing) {
                    this.animations['stand'].stop();
                    //console.log('play stand');
                }

                if (!this.animations['reload'].playing) {
                    this.animations['reload'].play();
                    //console.log('play stand');
                }

            } else {
                if (!this.animations['stand'].playing) {
                    this.animations['stand'].play();
                    //console.log('play stand');
                }

                if (this.animations['reload'].playing) {
                    this.animations['reload'].stop();
                    //console.log('play stand');
                }
            }

        }

        if (this.skeleton) {
            this.skeleton.update(delta);
        }

        this.weapon.update(delta);

    }

    sendGeoPos() {
        let geoX = Math.floor(this.pivot.position.x / 10);
        let geoY = Math.floor(this.pivot.position.z / 10);
        if (geoX != this.geoPos.x || geoY != this.geoPos.y) {
            //console.log(this.pivot.position);
            this.geoPos.x = geoX;
            this.geoPos.y = geoY;

            Game.workers[0].postMessage({
                type: 'playerPos',
                data: this.geoPos.toArray()
            });

            Game.workers[1].postMessage({
                type: 'playerPos',
                data: this.geoPos.toArray()
            });
        }
    }

    hit(power) {
        if (!this.dead) {
            if (this.getBoosterId('shield') === false) {
                this.hp -= power
                if (this.hp <= 0) {
                    this.dead = true;
                    this.hp = 0;
                    this.stopAnim();
                    let rnd = Math.floor(Math.random() * this.death.length);
                    this.death[rnd].play();
                    this.weapon.trigged = false;
                    $('#world').removeClass('hideCursor');
                    Game.sendScore();
                }
                $('#hp').text(this.hp + '/' + this.maxhp);
            }

        }
    }

    hil(hp) {
        this.hp += hp;
        this.hp = Math.min(this.maxhp, this.hp);
        $('#hp').text(parseInt(this.hp) + '/' + this.maxhp);
    }

    getBoosterId(name) {
        for (let i in this.boosters) {
            //console.log(this.boosters[i], name);
            if (this.boosters[i].name == name) {

                return i;
            }
        }
        return false;
    }

    addBooster(obj) {
        let i = this.getBoosterId(obj.name);
        if (i === false) {
            this.boosters.push(obj);
        } else {
            if (obj.name == 'shield') {
                this.boosters[i].clean();
                this.boosters[i] = obj;
            } else {
                this.boosters[i].ttl += obj.ttl;
                obj.clean();
            }
        }
    }


}