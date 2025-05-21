class HpBooster extends Drop {
    constructor(pos) {
        super();
        let geo = new THREE.BoxGeometry(30, 10, 10);
        geo.merge(new THREE.BoxGeometry(10, 30, 10));

        this.mesh = new THREE.Mesh(
            geo,
            new THREE.MeshPhongMaterial({ color: 0xff0000, transparent: true })
        );

        this.pivot.position.copy(pos);
        this.pivot.add(this.mesh);



    }

    update(delta) {
        super.update(delta);

        if (this.trigged()) {
            this.needClean = true;
            Game.player.hil(15);
        }
    }


}