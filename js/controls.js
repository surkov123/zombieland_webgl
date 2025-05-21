 Game.keys = {
     w: 0,
     s: 0,
     a: 0,
     d: 0,
 };

 Game.controlsOn = function() {
     $('body').bind("keydown", this.keyDown.bind(this));
     $('body').bind("keyup", this.keyUp.bind(this));
     document.addEventListener("mousemove", this.mouseMove.bind(this), false);
     document.addEventListener("mouseup", this.mouseUp.bind(this), false);
     document.addEventListener("mousedown", this.mouseDown.bind(this), false);

 };

 Game.constrolsOff = function() {
     $('body').unbind("keydown");
     $('body').unbind("keyup");
     for (let i in this.keys) {
         this.keys[i] = 0;
     }
     document.removeEventListener("mousemove", this.mouseMove);
 };

 Game.keyDown = function(e) {

     switch (e.keyCode) {
         case 87:
             if (this.keys['w'] != 1) {
                 this.keys['w'] = 1;

             }
             break;

         case 83:
             if (this.keys['s'] != 1) {
                 this.keys['s'] = 1;

             }
             break;

         case 65:
             if (this.keys['a'] != 1) {
                 this.keys['a'] = 1;

             }
             break;

         case 68:
             if (this.keys['d'] != 1) {
                 this.keys['d'] = 1;

             }
             break;
         case 82:
             if (Game.player) {
                 Game.player.weapon.reload();
             }
             break;

         case 27: //esc
             Game.setPause();
             break;



             /* case 49:
                  Game.player.setWeapon('pistol');
                  break;

              case 50:
                  Game.player.setWeapon('ak');
                  break;
              case 51:
                  Game.player.setWeapon('shotgun');
                  break;*/
             /*default:
                 console.log(e.keyCode);
                 break;*/
     }
 };

 Game.keyUp = function(e) {
     switch (e.keyCode) {
         case 87:
             if (this.keys['w'] != 0) {
                 this.keys['w'] = 0;

             }
             break;

         case 83:
             if (this.keys['s'] != 0) {
                 this.keys['s'] = 0;

             }
             break;

         case 65:
             if (this.keys['a'] != 0) {
                 this.keys['a'] = 0;

             }
             break;

         case 68:
             if (this.keys['d'] != 0) {
                 this.keys['d'] = 0;

             }
             break;
     }
 };

 Game.mousePos = new THREE.Vector2();

 Game.mouseMove = function(e) {
     this.mousePos.x = event.clientX;
     this.mousePos.y = event.clientY;
 };

 Game.mouseDown = function(e) {
     //console.log('mouse down');
     if (this.player && !this.player.dead) {
         this.player.weapon.shoot();
     }
 };

 Game.mouseUp = function(e) {
     //console.log('mouse up');
     this.player.weapon.trigged = false;
 };