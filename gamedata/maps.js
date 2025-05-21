var maps = {
    0: {
        border: [900, 700, 900, 700],
        ground: [{
                geo: 'terr_road.js',
                scale: 0.08,
                rot: [0, Math.PI / 2, 0],
                map: 'Omskaya_Roads.jpg',
                bumpMap: 'Omskaya_Roads.jpg'
            }, {
                geo: 'terr_ground.js',
                scale: 0.08,
                rot: [0, Math.PI / 2, 0],
                map: 'Omskaya_Dirt.jpg',
                bumpMap: 'Omskaya_Dirt.jpg'
            },
            {
                geo: 'terr_poreb.js',
                scale: 0.08,
                rot: [0, Math.PI / 2, 0],
                map: 'Omskaya_Poreb.jpg',
                bumpMap: 'Omskaya_Poreb.jpg'
            },
            {
                geo: 'Terr_Sectr.js',
                scale: 0.08,
                rot: [0, Math.PI / 2, 0],
                map: 'Omskaya_Sector.jpg',
                bumpMap: 'Omskaya_Sector.jpg'
            }
        ],
        obstacles: [{
            geo: 'House_n017.js',
            scale: 0.08,
            rot: [0, Math.PI / 2, 0],
            map: 'uw.jpg',
            bumpMap: 'uw.jpg'
        }, {
            geo: 'Streetlights.js',
            scale: 0.08,
            rot: [0, Math.PI / 2, 0],
            map: 'Fonar_uw.jpg',
            bumpMap: 'Fonar_uw.jpg'
        }],
        etcObj: [],

    }
};