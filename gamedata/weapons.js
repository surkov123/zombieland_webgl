 var weaponsConfig = {
     pistol: {
         anim: 'pistol',
         geometry: 'DE.js',
         texture: 'DE.jpg',
         shotSound: 'pistol.webm',
         auto: true,
         rate: 4,
         power: 75,
         pos: [0.0, -0.1, 0],
         rot: [-10, -5, -25],
         muzzle: [-0.1, -0.1, -0.5],
         splash: 2,
         minScatter: 0,
         maxScatter: 19,
         incScatter: 6,
         decScatter: 60,
         ammo: 10,
         reload: 0.5,

     },
     ak: {
         anim: 'rifle',
         geometry: 'Akm_6.js',
         texture: 'akm.jpg',
         shotSound: 'ak762.webm',
         auto: true,
         rate: 15,
         power: 75,
         pos: [0.02, -0.08, -0.05],
         rot: [7, -5, -32],
         muzzle: [-0.1, -0.2, -1.2],
         splash: 3,
         minScatter: 0,
         maxScatter: 19,
         incScatter: 6,
         decScatter: 60,
         ammo: 30,
         reload: 0.5,
         dropScale: 1.5

     },

     shotgun: {
         anim: 'rifle',
         geometry: 'mp153.js',
         texture: 'mp153.jpg',
         shotSound: 'shotgun.webm',
         auto: true,
         rate: 2,
         power: 75,
         splash: 3,
         minScatter: 19,
         maxScatter: 19,

         ammo: 7,
         bulletsCount: 12,
         reload: 0.9,
         pos: [0.02, -0.05, -0.05],
         rot: [5, -5, -12],
         muzzle: [-0.1, -0.1, -1.6]

     }
 };