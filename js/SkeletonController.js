THREE.SkeletonController = function(mesh) {
    this.skeletons = [];
    this.bones = [];
    this.uids = {};
    this.add(mesh);
    this.pos_speed = 5;
    this.scale_speed = 5;
    this.quat_speed = 5;
    this._vector3 = new THREE.Vector3();
    this._quat = new THREE.Quaternion();

    this.smooth = false;

    for (var i in this.skeletons[0].bones) {
        this.bones.push(this.skeletons[0].bones[i].clone());
        //console.log(this.skeletons[0].bones[i].quaternion);
    }
    //console.log(this.bones);
};

THREE.SkeletonController.prototype = {
    constructor: THREE.SkeletonController,

    add: function(mesh) {
        if (!(mesh.uuid in this.uids)) {
            this.skeletons.push(mesh.skeleton);
            //console.log(mesh.skeleton);
            this.uids[mesh.uuid] = this.skeletons.length - 1;
        }
    },

    remove: function() {
        var id = this.uids[mesh.uuid];
        if (id || id === 0) {
            delete this.uids[mesh.uuid];
            delete this.skeletons[id];
        }
    },



    update: function(delta) {
        var count = this.bones.length;
        var sk_len = this.skeletons.length;
        var bone1, bone2;
        var axis = ['x', 'y', 'z'];

        var length, step;
        var qx, qy, qz, qw;

        for (var i = 0; i < count; i++) {

            bone2 = this.bones[i];
            for (var s = 0; s < sk_len; s++) {
                bone1 = this.skeletons[s].bones[i];
                if (this.smooth) {


                    this._vector3.subVectors(bone2.position, bone1.position);
                    length = bone1.position.distanceTo(bone2.position);
                    step = this.pos_speed * delta;

                    if (length <= step) {
                        bone1.position.copy(bone2.position);
                    } else {
                        this._vector3.multiplyScalar(step / length);
                        bone1.position.add(this._vector3);

                    }

                    this._vector3.subVectors(bone2.scale, bone1.scale);
                    length = bone1.scale.distanceTo(bone2.scale);
                    step = this.scale_speed * delta;

                    if (length <= step) {
                        bone1.scale.copy(bone2.scale);
                    } else {
                        this._vector3.multiplyScalar(step / length);
                        bone1.scale.add(this._vector3);

                    }


                    length = this._quat.copy(bone1.quaternion).inverse().multiply(bone2.quaternion).length();
                    step = this.quat_speed * delta;

                    if (step >= length) {
                        //console.log(dist);
                        bone1.quaternion.copy(bone2.quaternion);
                    } else {

                        this._quat.copy(bone1.quaternion);
                        this._quat.slerp(bone2.quaternion, step / length);
                        bone1.quaternion.copy(this._quat);
                    }






                } else {

                    bone1.position.copy(bone2.position);
                    bone1.quaternion.copy(bone2.quaternion);
                    bone1.scale.copy(bone2.scale);
                }
            }
        }

    },

    get_bone: function(name) {

        for (var i = 0; i < this.bones.length; i++) {
            if (this.bones[i].name == name) {
                return this.bones[i];
            }
        }

        return false;
    }
};