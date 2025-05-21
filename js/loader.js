if (typeof ww === "undefined") {
    ww = {};
}

THREE.Loader.prototype.initMaterials = function(materials, path) {
    return [];
};

ww.loader = {};
ww.loader.groups_list = [];
ww.loader.bg_groups_list = [];
ww.loader.last_state = true;
ww.loader.bg_ready_count = 0;
ww.loader.locked = false;
ww.loader.status = function() {
    for (var i in this.groups_list) {
        if (!this.groups_list[i].ready()) {

            main_ready = false;
        }
    }
};


ww.loader.base = function() {
    this.data = {};
    this.chain = {};
    this.cur = null;
    this.options = {};


    this.get_length = function(obj) {


        var n = 0;
        for (var i in obj) {
            n++;
        }
        return n;
    };

    this.status = function() {

        var data = this.get_length(this.data);

        var chain = this.get_length(this.chain);
        //console.log('data '+data+' chain '+chain );
        if (data === 0 && chain === 0) {
            //console.log('loader status empty');
            return 'empty';
        } else {
            //console.log('loader status ready ('+chain+' '+data+')');
            if (chain === 0) {
                //console.log('loader status ready ('+chain+' '+data+')');
                return 'ready';
            } else {
                //console.log('loader status loading');
                //console.log(this.chain);
                return 'loading';
            }
        }
    };

    this.get = function(id) {
        if (id in this.data) {
            return this.data[id];
        } else {
            console.log(id + ' not found');
            console.log(this);
            return false;
        }
    };

    this.isset = function(id) {
        if (id in this.data || id in this.chain) return true;
        else return false;
    };

    this.next = function() {
        if (this.cur !== null) {
            delete(this.chain[this.cur]);
        }

        this.cur = null;


        for (var cur in this.chain) {
            this.cur = cur;
            break;
        }

        if (this.cur !== null) {
            this.load();
        }
        //console.log(this.chain);
        ww.loader.status();
    };

    this.add = function(url, ver, options) {
        ver = ver || Game.data_ver;
        this.options[url] = options || {};

        if (url) {

            console.log(url + ' added to chain');
            if (url.indexOf('?')) {
                this.chain[url] = url;
            } else {
                this.chain[url] = url + '?ver=' + ver;
            }
            /*if (this.cur === null) {
                this.next();
            }*/
        } else {
            console.log('!!!! empty url !!!!');
            console.log(this);
        }
    };

    this.done = function(data) {
        //console.log('done');
        //console.log(this.cur+' loaded');
        if (this.cur === null) {
            console.log(data);
        }
        if (data !== undefined) {
            this.onload(data);
        }

        this.next();
    };

    this.clean = function() {
        //console.log('!!!!! clean loaded data !!!!');
        if ('onclean' in this) {
            this.onclean();
        }

        this.data = {};
        this.chain = {};
        this.cur = null;
    };

    this.remove = function(url) {
        if ('url' in this.data) {
            console.log(url + 'removed');
            delete this.data[url];
        } else {
            //console.log(url+' not found for remove');
        }
    };

    this.start = function() {
        if (this.cur === null) {
            this.next();
        }
    };


};

ww.loader.geometry = function(callback, can_be_empty) {
    ww.loader.base.call(this);

    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;

    this.load = function() {
        var url = this.chain[this.cur];


        this.chain[this.cur] = new THREE.JSONLoader();
        this.chain[this.cur].initMaterials = function(materials, path) {
            return [];
        };
        this.chain[this.cur].load(url, this.callback);
    };

    this.callback = callback;
    this.onload = function(data) {
        //console.log(this.cur + ' loaded');
        if (this.options[this.cur] && this.options[this.cur].buffergeometry) {
            //console.log('buf');
            this.data[this.cur] = new THREE.BufferGeometry();
            this.data[this.cur].fromGeometry(data);


        } else {
            this.data[this.cur] = data;
            data.computeBoundingBox();
        }

        this.chain[this.cur] = null;
        delete this.options[this.cur];

    };
};

ww.loader.texture = function(callback, can_be_empty) {
    ww.loader.base.call(this);

    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.load = function(url) {
        if (this.chain[this.cur].indexOf('.pvr') != -1) {
            console.log('set pvr loader', this.chain[this.cur]);
            var loader = new THREE.PVRLoader();
            this.data[this.cur] = loader.load(this.chain[this.cur], callback, function() {}, function() {
                console.log('хуйня')
            });

        } else {
            var image = new Image();
            this.data[this.cur] = new THREE.Texture(image);
            this.data[this.cur].needsUpdate = true;
            this.data[this.cur].sourceFile = this.cur;
            //this.data[this.cur].minFilter = THREE.LinearFilter;
            //this.data[this.cur].magFilter = THREE.LinearFilter;
            //this.data[this.cur].magFilter = THREE.NearestFilter;
            //this.data[this.cur].minFilter = THREE.NearestMipMapNearestFilter;
            this.data[this.cur].anisotropy = 4;

            image.onload = callback;
            image.src = this.chain[this.cur];
        }

    };

};

ww.loader.json = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;

    this.load = function() {
        $.getJSON(this.chain[this.cur], this.callback);
    };

    this.onload = function(data) {
        this.data[this.cur] = data;
    };


    this.callback = callback;
};

ww.loader.sprite = function(callback, can_be_empty) {
    ww.loader.base.call(this);

    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.load = function(url) {
        var texture;
        if (this.chain[this.cur].indexOf('.dds') != -1) {
            var loader = new THREE.DDSLoader();
            texture = loader.load(this.chain[this.cur], this.callback);
        } else {
            var image = new Image();
            texture = new THREE.Texture(image);
            texture.needsUpdate = true;
            texture.sourceFile = this.cur;
            image.onload = this.callback;
            image.src = this.chain[this.cur];
        }
        this.data[this.cur] = new THREE.SpriteMaterial({
            map: texture,

            color: 0xffffff,
            fog: true,
            transparent: true
        });

    };
    this.callback = callback;

};

/*ww.loader.sprite.prototype = Object.create(ww.loader.base.prototype);
ww.loader.sprite.prototype.constructor = ww.loader.sprite;*/

ww.loader.img = function(callback, can_be_empty) {
    ww.loader.base.call(this);

    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;

    this.load = function() {
        this.data[this.cur] = new Image();
        this.data[this.cur].onload = this.callback;
        this.data[this.cur].src = this.chain[this.cur];

    };

    this.callback = callback;
};

ww.loader.obj = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;

    this.load = function() {
        var url = this.chain[this.cur];


        this.chain[this.cur] = new THREE.OBJLoader();

        this.chain[this.cur].load(url, this.callback);

    };

    this.onload = function(data) {
        this.data[this.cur] = data;
        //console.log(data);
    };


    this.callback = callback;
};

ww.loader.mtl = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;

    this.load = function() {
        var url = this.chain[this.cur];


        this.chain[this.cur] = new THREE.MTLLoader();

        this.chain[this.cur].load(url, this.callback);

    };

    this.onload = function(data) {
        this.data[this.cur] = data;
        //console.log(data);
    };


    this.callback = callback;
};



ww.loader.img.prototype.constructor = ww.loader.img;
ww.loader.img.prototype.load = function() {
    this.data[this.cur] = new Image();
    this.data[this.cur].onload = this.callback;
    this.data[this.cur].src = this.chain[this.cur];

};

ww.loader.googlemap = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.callback = callback;

    this.load = function() {
        console.log('MAP LOAD START');
        this.chain[this.cur] = new GSVPANO.PanoLoader();
        this.chain[this.cur].onPanoramaLoad = this.callback;
        this.chain[this.cur].setZoom(!chat3d.mobile_mode ? 4 : 3);
        //Влад - Добавил ID панорамы
        console.log('MAP LOAD START DATA', this.options[this.cur]);
        var Latlng = new google.maps.LatLng(this.options[this.cur].lat, this.options[this.cur].lng);
        this.chain[this.cur].load(Latlng, this.options[this.cur].id);
    };

    this.onload = function(data) {
        if (!chat3d.mobile_mode) {
            var canvas = document.createElement('canvas');
            canvas.width = 4096;
            canvas.height = 2048;

            var context = canvas.getContext('2d');

            context.drawImage(data[0], 0, 0, canvas.width, canvas.height);

            this.data[this.cur] = new THREE.Texture(canvas);
        } else {

            this.data[this.cur] = new THREE.Texture(data);

        }


        console.log('pano', this.chain[this.cur].getPano());
        this.data[this.cur].needsUpdate = true;
        this.total = this.chain[this.cur].get_total();
        this.data[this.cur].googlemap = this.chain[this.cur];
        this.chain[this.cur] = null;
        delete this.options[this.cur];

    };

    this._get_length = this.get_length;
    this.get_length = function(obj) {
        var n = this._get_length(obj);
        var i;
        if (obj === this.data) {
            if (n === 0) {
                for (i in this.chain) {
                    if (this.chain[i] instanceof GSVPANO.PanoLoader) {
                        n += this.chain[i].get_done_count();
                    }
                }

            } else {

                n += this.total;

            }
        }

        if (obj === this.chain) {



            for (i in this.chain) {
                if (this.chain[i] instanceof GSVPANO.PanoLoader) {
                    n += this.chain[i].get_total() - this.chain[i].get_done_count();
                }
            }


        }

        return n;
    };
};

ww.loader.googlemapdepth = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.callback = callback;

    this.load = function() {
        console.log('depth_ load_start');
        this.chain[this.cur] = new GSVPANO.PanoDepthLoader();
        this.chain[this.cur].onDepthLoad = this.callback;

        this.chain[this.cur].load(this.cur);


    };

    this.onload = function(data) {
        this.data[this.cur] = data;

        this.chain[this.cur] = null;
        delete this.options[this.cur];
        console.log('depthmap loaded');
        //console.log(data[0]);
    };

};

ww.loader.gif = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.callback = callback;

    this.load = function() {

        var xhr = new XMLHttpRequest();
        xhr.open("GET", this.chain[this.cur], true);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
        xhr.onload = this.callback;
        xhr.send(null);
        this.chain[this.cur] = xhr;
    };

    this.onload = function(data) {
        this.data[this.cur] = data;
    };


};

ww.loader.font = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.callback = callback;

    this.load = function() {
        var url = this.chain[this.cur];
        this.chain[this.cur] = new THREE.FontLoader();

        this.chain[this.cur].load(url, this.callback);
    };

    this.onload = function(data) {
        this.data[this.cur] = data;
    };



}

ww.loader.script = function(callback, can_be_empty) {
    ww.loader.base.call(this);
    if (can_be_empty !== undefined) this.can_be_empty = can_be_empty;
    this.callback = callback;
    this.load = function() {
        var url = this.chain[this.cur];
        /*$.getScript(url, this.callback);*/
        var script = document.createElement('script');
        script.onload = this.callback
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    this.onload = function(data) {

    };

}

//ww.loader.googlemap.prototype.constructor = ww.loader.googlemap;



ww.loader.group = function(members, background) {
    this.ready_count = 0;
    this.done = false;
    this.can_be_empty = members.can_be_empty || false;
    //console.log(this.can_be_empty);
    this.is_service = function(o) {
        var list = ['ready_count', 'start', 'ready', 'clean', 'onready', 'done', 'total_count', 'done_count', 'is_service', 'onready', 'can_be_empty', 'empty'];
        for (var n in list) {
            if (o === list[n]) return true;
        }
        return false;
    };


    this.ready = function() {
        for (var o in this) {
            if (!this.is_service(o)) {
                if (this[o].status() === 'loading' || (this[o].status() === 'empty' && !this[o].can_be_empty)) {
                    //if(this[o].status()==='empty') console.log(o+'  '+this.can_be_empty+' '+this[o].can_be_empty);
                    //console.log('part '+o+' '+this[o].status()+' '+this[o].can_be_empty);
                    return false;
                }
            }
        }

        if (!this.done && !this.empty()) {
            //console.log('group ready');
            this.done = true;
            //this.ready_count = this.total_count(true);
            //console.log(this.ready_count);
            this.onready();
        }

        return true;
    };

    this.empty = function() {
        for (var o in this) {
            if (!this.is_service(o)) {
                if (this[o].status() !== 'empty') {
                    //console.log('not empty');
                    return false;
                }
            }
        }
        //console.log('empty');
        return true;
    };


    this.clean = function() {
        this.ready_count = 0;
        for (var o in this) {
            if (!this.is_service(o)) {
                this[o].clean();
                this.done = false;
            }
        }
    };

    this.total_count = function() {
        var total = 0;
        for (var o in this) {
            if (!this.is_service(o)) {
                //if (this[o].status() === 'loading') {
                total += this[o].get_length(this[o].chain);
                total += this[o].get_length(this[o].data);
                //console.log(o + ' ' + total);
                //}
            }
        }


        return total;
    };

    this.done_count = function() {
        var done = 0;
        for (var o in this) {
            if (!this.is_service(o)) {
                //if (this[o].status() === 'loading') {
                done += this[o].get_length(this[o].data);

                //}
            }
        }


        return done;
    };

    this.start = function() {
        for (var o in this) {
            if (!this.is_service(o)) {
                this[o].start();
            }
        }

    };



    for (var name in members) {
        this[name] = members[name];
        if (typeof(this[name]) === 'object' && !('can_be_empty' in this[name])) {
            this[name].can_be_empty = this.can_be_empty;

        }

    }
    if (!background) {
        ww.loader.groups_list.push(this);
    } else {
        ww.loader.bg_groups_list.push(this);
    }

};