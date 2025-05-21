THREE.animation = function(skelet, anim, options) {

	this.anim = anim;
	if (!anim) {
		console.log('no animation');
	}

	options = options || {};
	this.options = options;
	this.options.loop = options.loop || false;
	this.options.revers = options.revers || false;
	this.options.no_motionless = options.no_motionless || false;
	this.options.onstart = options.onstart || this._dummy_callback;
	this.options.onloop = options.onloop || this._dummy_callback;
	this.options.onstop = options.onstop || this._dummy_callback;
	this.options.onend = options.onend || this._dummy_callback;
	this.options.onframe = options.onframe || this._dummy_callback;

	this.boost = 1;
	this.playing = false;
	this.end = false;
	this.time = 0.0;
	this.bones = {};

	this.motionless = {};


	this._quat = new THREE.Quaternion();



	for (var i in skelet.bones) {

		if (this.options.no_motionless && this.is_motionless(this.anim.hierarchy[i].keys)) {
			this.motionless[i] = true;
			//console.log('motionless');
		} else {
			this.motionless[i] = false;
			//console.log(this.anim.hierarchy);
			for (var n in this.anim.hierarchy[i].keys) {
				if (!('qrot' in this.anim.hierarchy[i].keys[n])) {
					this.anim.hierarchy[i].keys[n].qrot = new THREE.Quaternion().fromArray(this.anim.hierarchy[i].keys[n].rot);
				}
			}
		}

	}
	this.bones = skelet.bones;

};

THREE.animation.prototype = {
	constructor: THREE.animation,

	types_list: ['pos', 'qrot', 'scl'],
	ref_types_list: ['pos', 'rot', 'scl'],

	is_motionless: function(keys) {
		if (keys.length > 0) {

			for (var k in keys) {
				for (var t in this.ref_types_list) {
					for (var p in keys[k][this.ref_types_list[t]]) {
						if (keys[k][this.ref_types_list[t]][p] !== keys[0][this.ref_types_list[t]][p]) {
							return false;
						}
					}
				}

			}
		}

		return true;
	},

	applykey: function(n, key) {

		this.bones[n].position.set(key.pos[0], key.pos[1], key.pos[2]);
		this.bones[n].quaternion.fromArray(key.qrot);
		this.bones[n].scale.set(key.scl[0], key.scl[1], key.scl[2]);


	},

	get_interp_key: function(key1, key2) {

		var key = {
			pos: [],
			//rot: [],
			scl: [],
			qrot: []
		};
		var rate, n;



		if (!this.options.revers) {
			rate = (this.time - key1.time / this.boost) / (key2.time / this.boost - key1.time / this.boost);
		} else {
			rate = (this.time - (this.anim.length - key1.time) / this.boost) / ((this.anim.length - key2.time) / this.boost - (this.anim.length - key1.time) / this.boost);
		}


		if (rate < 0) rate = 0;
		if (rate > 1) rate = 1;
		var t = '';
		for (var i = 0; i < this.types_list.length; i++) {
			t = this.types_list[i];
			if (t != 'qrot') {

				for (n = 0; n < key1[t].length; n++) {

					key[t][n] = key1[t][n] + (key2[t][n] - key1[t][n]) * rate;
				}


			} else {
				key[t] = this._quat.copy(key1[t]).slerp(key2[t], rate).toArray();


			}
		}


		return key;

	},

	update: function(delta) {

		if (this.playing) {
			this.options.onframe(this);
			var length = this.anim.length / this.boost;
			if (this.time + delta > length) {
				if (this.options.loop) {
					this.options.onloop(this);
					this.time = this.time + delta - length * Math.floor((this.time + delta) / length);

				} else {
					this.time = length;
					if (!this.end) {
						this.end = true;
						//this.playing = false;
						this.options.onend(this);

					}


				}

			} else {
				this.time += delta;
			}

			if (!this.end) {
				var prevkey = null;
				var k, keys;

				for (var i = 0; i < this.bones.length; i++) {

					if (this.motionless[i] === false) {

						keys = this.anim.hierarchy[i].keys;
						if (this.time === 0) {
							if (!this.options.revers) {
								this.applykey(i, keys[0]);
							} else {
								this.applykey(i, keys[keys.length - 1]);
							}
						} else {
							prevkey = null;
							if (!this.options.revers) {

								for (k = 0; k < keys.length; k++) {
									if (prevkey === null || this.time > keys[k].time / this.boost) {
										prevkey = k;
									}
									if (this.time <= keys[k].time / this.boost) {
										this.applykey(i, this.get_interp_key(keys[prevkey], keys[k]));
										break;
									}
								}
								if (k == keys.length) {
									this.applykey(i, this.get_interp_key(keys[prevkey], keys[keys.length - 1]));
								}
							} else {
								for (k = keys.length - 1; k > 0; k--) {
									if (prevkey === null || this.time > (this.anim.length - keys[k].time) / this.boost) {
										prevkey = k;
									}

									if (this.time <= (this.anim.length - keys[k].time) / this.boost) {
										this.applykey(i, this.get_interp_key(keys[prevkey], keys[k]));
										break;
									}

								}

								if (k === 0) {
									this.applykey(i, this.get_interp_key(keys[prevkey], keys[0]));
								}

							}

						}
					}
				}
			}

		}

	},

	play: function() {
		this.playing = true;
		this.time = 0.0;
		this.end = false;
		this.options.onstart(this);
	},

	stop: function() {
		this.playing = false;

		this.options.onstop(this);
	},

	set_boost: function(b) {
		if (!b) {
			console.log(b);
			b = 1;
		}
		this.boost = b;
	},

	_dummy_callback: function() {}

};
