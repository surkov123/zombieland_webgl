class FABullet {
    constructor(from, to, type, power, speed) {
        this.power = power;
        this.group = new THREE.Group();
        this.uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib['tracer'].uniforms);
        //this.uniforms.end.value = new THREE.Vector3();
        this.uniforms.start.value = new THREE.Vector3();
        this.mat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: THREE.ShaderLib['tracer'].vertexShader,
            fragmentShader: THREE.ShaderLib['tracer'].fragmentShader,
            transparent: true,

        });
        var loader = Game.loader;
        this.maps = [];
        let tex_path = 'gamedata/textures/';
        this.maps[0] = loader.textures.get(tex_path + 'tracert_shotgun.jpg');
        this.maps[1] = loader.textures.get(tex_path + 'tracert_pistol.jpg');
        this.maps[2] = loader.textures.get(tex_path + 'traccert_ar.jpg');

        let geo_path = 'gamedata/geometry/';
        this.meshs = [];
        this.meshs[0] = new THREE.Mesh(loader.geo.get(geo_path + 'tracert_shot.js'), this.mat);
        this.meshs[1] = new THREE.Mesh(loader.geo.get(geo_path + 'tracert_pistol.js'), this.mat);
        this.meshs[2] = new THREE.Mesh(loader.geo.get(geo_path + 'tracert_ar.js'), this.mat);
        this.meshs[2].scale.set(1, 1, 2);
        //this.meshs[2].scale.set(0.7, 0.7, 0.7);


        this.ar_tail_mat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(THREE.ShaderLib['arTracer'].uniforms),
            vertexShader: THREE.ShaderLib['arTracer'].vertexShader,
            fragmentShader: THREE.ShaderLib['arTracer'].fragmentShader,
            fog: true,
            transparent: true
        });
        //this.ar_tail_mat.uniforms.end.value = this.uniforms.end.value;
        this.ar_tail_mat.uniforms.start.value = this.uniforms.start.value;
        this.ar_tail_mat.uniforms.dist = this.uniforms.dist;
        this.ar_tail_mat.uniforms.len = this.uniforms.len;

        this.ar_tail_mat.uniforms.opacity.value = 0.2;



        for (var i = 0; i < this.meshs.length; i++) {
            this.meshs[i].rotation.y = Math.PI / 2;
            let box = new THREE.Box3();
            box.setFromObject(this.meshs[i]);
            //console.log(i, box);
            this.meshs[i].position.z = box.min.z;
            this.group.add(this.meshs[i]);
        }

        Game.scene.add(this.group);
        this.to = new THREE.Vector3();
        this.rc = new THREE.Raycaster();
        this.size = new THREE.Vector3();

        this.set(from, to, type, speed);

    }

    set(from, to, type, speed) {


        this.group.position.copy(from);
        this.group.lookAt(to);
        this.vec = new THREE.Vector3().copy(to).sub(from).normalize();
        this.cur_dist = 0;
        let box = new THREE.Box3();

        switch (type) {
            case 1:
                this.meshs[0].visible = true;
                box.setFromObject(this.meshs[0]);



                this.mat.uniforms.map.value = this.maps[0];
                this.speed = speed || 2000;
                //this.end_dist = dist + 50;
                break;

            case 2:
                this.meshs[1].visible = true;
                box.setFromObject(this.meshs[1]);

                this.mat.uniforms.map.value = this.maps[1];
                this.speed = speed || 1000;
                //this.end_dist = dist + 100;
                break;

            case 3:
                this.meshs[2].visible = true;
                box.setFromObject(this.meshs[2]);
                this.mat.uniforms.map.value = this.maps[2];
                this.speed = speed || 1500;
                //console.log(speed);
                //this.end_dist = dist + 100;
                break;

            case 4:

                this.cur_dist = 3000;
                break;

            case 99:
                break;

            default:
                this.meshs[2].visible = true;
                box.setFromObject(this.meshs[0]);
                this.mat.uniforms.map.value = this.maps[2];
                this.speed = 3000;
                //this.end_dist = dist + 100;
                break;

        }
        box.getSize(this.size);
        //console.log(this.size);
        let start = new THREE.Vector3()
            .copy(this.vec)
            .multiplyScalar(-1 * this.size.z)
            .add(this.group.position);

        /*let end = new THREE.Vector3().copy(this.vec)
            .multiplyScalar(3000 + this.size.z).add(this.group.position);*/

        //this.uniforms.end.value.copy(end);
        this.uniforms.start.value.copy(start);
        this.uniforms.len.value = this.size.z;
        this.uniforms.dist.value = 2000;

    }

    update(delta) {
        if (this.cur_dist < 2000) {
            let step = this.speed * delta;
            this.rc.far = step;

            if (!this.over) {
                let dust = false;
                let geo = Game.geoTrace(this.group.position, this.vec, step);
                if (!geo.canMove) {

                    //step = this.group.position.distanceTo(geo.point);
                    this.rc.far = this.group.position.distanceTo(geo.point);
                    /*let end = new THREE.Vector3().copy(this.vec)
                        .multiplyScalar(this.size.z).add(geo.point);*/
                    //console.log(end.distanceTo(this.group.position));

                    //this.uniforms.end.value.copy(end);
                    this.over = true;
                    dust = geo.point;
                    //this.needClean = true;
                    this.uniforms.dist.value = this.cur_dist + this.group.position.distanceTo(geo.point);
                    //console.log(this.uniforms.dist.value, this.uniforms.start.value);
                }
                let cols = [];
                for (let i in Game.chars) {
                    cols.push(Game.chars[i].col);
                }
                this.rc.ray.origin.copy(this.group.position);


                this.rc.ray.direction.copy(this.vec);
                let intersects = this.rc.intersectObjects(cols);
                for (let i in intersects) {

                    let kill = intersects[i].object.mob.hit(this.power);
                    let blood = new Blood(intersects[i].point);
                    Game.effects.push(blood);
                    //console.log();
                    //if (!kill) {

                    //console.log(step, intersects[i].distance);
                    this.over = true;
                    /*let end = new THREE.Vector3().copy(this.vec)
                        .multiplyScalar(this.size.z).add(geo.point);

                    this.uniforms.end.value.copy(end);*/
                    //step = intersects[i].distance;
                    this.needClean = true;
                    this.uniforms.dist.value = this.cur_dist + intersects[i].distance;
                    dust = false;
                    break;
                    //}
                }
                if (dust) {
                    Game.effects.push(new Dust(dust));
                }
            }
            let vecStep = new THREE.Vector3().copy(this.vec).multiplyScalar(step);
            this.group.position.add(vecStep);
            this.cur_dist += step;
            //let scale = this.uniforms.len.value / step;
            let maxScale = 2000 / this.uniforms.len.value;
            let curSR = this.cur_dist / 2000;
            let scale = curSR * maxScale;
            this.uniforms.opacity.value = 1 - curSR;
            this.group.scale.z = scale;
            if (this.cur_dist > 2000) {
                //this.clean();
                this.needClean = true;
            }




        } else {
            this.needClean = true;
        }
    }

    clean() {
        Game.scene.remove(this.group);
    }
}