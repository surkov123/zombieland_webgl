 class WeaponDrop extends Drop {
     constructor(type, pos) {
         super();
         //console.log('drop ' + type, pos);
         this.type = type;
         let config = weaponsConfig[type];
         let geo = Game.loader.geo.get('gamedata/geometry/' + config.geometry).clone();
         geo.center();
         geo.rotateX(Math.PI - Math.PI / 4);
         geo.rotateY(Math.PI / 2);

         this.mesh = new THREE.Mesh(
             geo,
             new THREE.MeshBasicMaterial({
                 /*map: Game.loader.textures.get('gamedata/textures/' + config.texture),*/
                 map: Game.loader.textures.get('gamedata/textures/powerup.png'),
                 transparent: true
             })
         );
         this.mesh.material.color.r = 2.5;
         this.mesh.material.color.g = 2.5;
         this.mesh.material.color.b = 2.5;
         this.pivot.position.copy(pos);

         this.mesh.scale.set(25, 25, 25);
         if (config.dropScale) {
             this.mesh.scale.multiplyScalar(config.dropScale);
         }
         //this.mesh.castShadow = true;
         this.pivot.add(this.mesh)
             //console.log(pos);


         /*let bg = new THREE.Mesh(
             new THREE.PlaneGeometry(50, 50),
             new THREE.MeshBasicMaterial({
                 transparent: true,
                 map: Game.loader.textures.get('gamedata/textures/drop_light.png')
             }));
         bg.position.y += 1;
         bg.rotation.x = -Math.PI / 2;
         this.pivot.add(bg);*/
     }

     update(delta) {
         super.update(delta);

         if (this.trigged()) {
             this.needClean = true;
             Game.player.setWeapon(this.type);
         }
     }


 }