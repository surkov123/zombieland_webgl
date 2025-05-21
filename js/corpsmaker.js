importScripts('three.min.js');

var skeletons = {};
var geo = {};
var corps = {};
var corpsCount = {};
var newskelet;
const maxCorps = 10;
const maxVert = 59001;

onmessage = function(e) {

    if (newskelet) {
        skeletons[newskelet] = new Float32Array(e.data);
        newskelet = null;
    } else {
        let p = e.data;
        switch (p.type) {
            case 'geometry':
                let loader = new THREE.JSONLoader();
                geo[p.data.type] = loader.parse(p.data.geo.data).geometry;

                break;
            case 'skelet':
                newskelet = p.data;
                break;

            case 'corps':

                let corpsGeo = geo[p.data.type].clone();


                function getBoneMatrix(i) {
                    let texture = skeletons[p.data.id];
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

                let newgeo = new THREE.BufferGeometry();
                newgeo.fromGeometry(corpsGeo);
                let commonGeo, count;
                if (!corpsCount[p.data.type] || corpsCount[p.data.type][corpsCount[p.data.type].length - 1] == maxCorps) {
                    if (!corpsCount[p.data.type]) {
                        corpsCount[p.data.type] = [];
                        corps[p.data.type] = [];
                    }
                    corpsCount[p.data.type].push(0);
                    commonGeo = new THREE.BufferGeometry();

                    let posBuf = new SharedArrayBuffer(maxVert * 4 * 3);
                    let pos = new Float32Array(posBuf);
                    commonGeo.addAttribute('position', new THREE.BufferAttribute(pos, 3));

                    let normBuf = new SharedArrayBuffer(maxVert * 4 * 3);
                    let norm = new Float32Array(normBuf);
                    commonGeo.addAttribute('normal', new THREE.BufferAttribute(norm, 3));

                    let uvBuf = new SharedArrayBuffer(maxVert * 4 * 2);
                    let uv = new Float32Array(uvBuf);
                    commonGeo.addAttribute('uv', new THREE.BufferAttribute(uv, 2));
                    count = 0;
                    postMessage({
                        type: 'new',
                        typeid: p.data.type
                    });

                    postMessage(posBuf);
                    postMessage(normBuf);
                    postMessage(uvBuf);
                    corps[p.data.type].push(commonGeo);

                } else {
                    //console.log(corps[p.data.type]);
                    commonGeo = corps[p.data.type][corps[p.data.type].length - 1];
                    count = corpsCount[p.data.type][corpsCount[p.data.type].length - 1];
                    //console.log(count, corpsCount[p.data.type].length);
                }

                let minX, minY;
                let n = 0;
                for (let i in newgeo.attributes.position.array) {
                    commonGeo.attributes.position.array[parseInt(i) + count * newgeo.attributes.position.array.length] = newgeo.attributes.position.array[i];
                    commonGeo.attributes.normal.array[parseInt(i) + count * newgeo.attributes.normal.array.length] = newgeo.attributes.normal.array[i];
                    if (n === 0) {
                        if (minX == undefined || minX > newgeo.attributes.position.array[i]) {
                            minX = newgeo.attributes.position.array[i];
                        }
                    }

                    if (n === 2) {
                        if (minY == undefined || minY > newgeo.attributes.position.array[i]) {
                            minY = newgeo.attributes.position.array[i];
                        }
                    }
                    n++;
                    if (n == 3) {
                        n = 0;
                    }
                }

                for (let i in newgeo.attributes.uv.array) {
                    commonGeo.attributes.uv.array[parseInt(i) + count * newgeo.attributes.uv.array.length] = newgeo.attributes.uv.array[i]
                }

                for (let i = newgeo.attributes.position.array * (count + 1); i < commonGeo.attributes.position.array.length; i += 3) {
                    commonGeo.attributes.position.array[i] = minX;
                    commonGeo.attributes.position.array[i + 2] = minY;
                }
                corpsCount[p.data.type][corpsCount[p.data.type].length - 1]++;
                postMessage({ type: 'update', typeid: p.data.type })


                break;

            case 'clean':
                let _skeletons = {};
                for (let i in skeletons) {
                    if (i != p.data.id) {
                        _skeletons[i] = skeletons[i];
                    }
                }
                skeletons = _skeletons;
                break;

            case 'reset':
                skeletons = {};
                corps = {};
                corpsCount = {};
                break;
        }
    }
};