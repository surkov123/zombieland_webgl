const THREE = require('./js/three.min.js');
const fs = require('fs');
const jpeg = require('jpeg-js');
let mapsConfig = fs.readFileSync('gamedata/maps.js', 'utf8');
eval(mapsConfig);
let map = maps[process.argv[2]];

let grounds = new THREE.Group();
let objs = [];
let loader = new THREE.JSONLoader();
for (let i in map.ground) {
    let geofile = fs.readFileSync('gamedata/geometry/' + map.ground[i].geo);
    let geo = loader.parse(JSON.parse(geofile)).geometry;
    //console.log(geo);
    let mesh = new THREE.Mesh(geo);
    mesh.scale.set(map.ground[i].scale, map.ground[i].scale, map.ground[i].scale);
    mesh.rotation.fromArray(map.ground[i].rot);
    grounds.add(mesh);

}

let groundBox = new THREE.Box3();
groundBox.setFromObject(grounds);
let size = new THREE.Vector3();
groundBox.getSize(size);
console.log(size);

//console.log(groundBox);
let mat = new THREE.MeshBasicMaterial({ side: 2 });
for (let i in map.obstacles) {
    let geofile = fs.readFileSync('gamedata/geometry/' + map.obstacles[i].geo);
    let geo = loader.parse(JSON.parse(geofile)).geometry;
    //console.log(geo);
    let mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(map.obstacles[i].scale, map.obstacles[i].scale, map.obstacles[i].scale);
    mesh.rotation.fromArray(map.obstacles[i].rot);
    mesh.updateMatrix();
    mesh.updateMatrixWorld();
    objs.push(mesh);

}

let raycaster = new THREE.Raycaster();
let geodata = {};

let startz = groundBox.min.y;
let maxz = groundBox.max.y + 10;
let minx = groundBox.min.x;
let maxx = groundBox.max.x;
let miny = groundBox.min.z;
let maxy = groundBox.max.z;
//console.log(startz, maxz, minx, maxx, miny, maxy);

for (let z = startz; z < maxz; z += 3) {
    //console.log(z);
    raycaster.ray.direction.set(1, 0, 0);
    for (let y = miny; y < maxy; y += 3) {
        raycaster.ray.origin.set(minx, z, y);
        let intersects = raycaster.intersectObjects(objs);
        if (intersects.length) {
            for (let i in intersects) {
                if (intersects[i].point.x > minx && intersects[i].point.x < maxx && intersects[i].point.z > miny && intersects[i].point.z < maxy) {
                    let pX = Math.floor(intersects[i].point.x / 10);
                    let pY = Math.floor(intersects[i].point.z / 10);
                    if (!geodata[pX]) {
                        geodata[pX] = {};
                    }
                    geodata[pX][pY] = 1;
                }
            }
        }
    }

    raycaster.ray.direction.set(0, 0, 1);
    for (let x = minx; x < maxx; x += 3) {
        raycaster.ray.origin.set(x, z, miny);
        let intersects = raycaster.intersectObjects(objs);
        if (intersects.length) {
            for (let i in intersects) {
                if (intersects[i].point.x > minx && intersects[i].point.x < maxx && intersects[i].point.z > miny && intersects[i].point.z < maxy) {
                    let pX = Math.floor(intersects[i].point.x / 10);
                    let pY = Math.floor(intersects[i].point.z / 10);
                    if (!geodata[pX]) {
                        geodata[pX] = {};
                    }
                    geodata[pX][pY] = 1;
                }
                //console.log(pX, pY);
            }
        }
    }
}

let zdata = {};
raycaster.ray.direction.set(0, -1, 0);

for (let x = minx; x < maxx; x += 3) {
    for (let y = miny; y < maxy; y += 3) {
        raycaster.ray.origin.set(x, 1000, y);
        let intersects = raycaster.intersectObjects(grounds.children);
        if (intersects.length) {

            let px = Math.floor(intersects[0].point.x / 10);
            let py = Math.floor(intersects[0].point.z / 10);
            if (!zdata[px]) {
                zdata[px] = {};
            }
            zdata[px][py] = intersects[0].point.y;
        }
    }
}



fs.writeFileSync('gamedata/geodata/' + process.argv[2] + '.js', JSON.stringify(geodata));
fs.writeFileSync('gamedata/zdata/' + process.argv[2] + '.js', JSON.stringify(zdata));