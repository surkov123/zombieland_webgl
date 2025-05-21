THREE.ShaderLib['tracer'] = {
    uniforms: {
        map: {
            type: "t",
            value: null
        },

        /*end: {
            type: "v3",
            value: null
		},*/

        start: {
            type: "v3",
            value: null
        },

        len: {
            type: "f",
            value: 0
        },

        dist: {
            type: "f",
            value: 0
        },

        opacity: {
            type: "f",
            value: 1
        }
    },

    vertexShader: [

        "uniform vec3 start;",
        //"uniform vec3 end;",
        "varying float start_dist;",
        //"varying float end_dist;",
        "varying vec2 vUv;",

        "void main() {",
        "   vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
        //"	end_dist = length(end - worldPosition.xyz);",
        "	start_dist = length(start - worldPosition.xyz);",
        "	vUv = uv;",
        "	gl_Position = projectionMatrix * mvPosition;",
        "}"


    ].join("\n"),

    fragmentShader: [

        //"varying float cur_dist;",
        "varying vec2 vUv;",
        "uniform float dist;",
        "uniform sampler2D map;",
        "uniform float len;",
        "uniform float opacity;",
        "varying float start_dist;",
        //"varying float end_dist;",

        "void main() {",
        //"discard;",

        "	if(start_dist < len) discard;",
        "	if(start_dist > dist) discard;",

        //"	if(cur_dist < dist) discard;",
        //"	if(cur_dist > 3000.0 || cur_dist < dist) discard;",
        "	vec4 textureColor = texture2D(map, vec2(vUv.s, vUv.t));",
        "   textureColor.a = opacity;",
        "	gl_FragColor = textureColor;",
        "}"

    ].join("\n")

};

THREE.ShaderLib['snipeTracer'] = {
    uniforms: THREE.UniformsUtils.merge([

        THREE.ShaderLib['points'].uniforms,
        {
            from: {
                type: "v3",
                value: null
            },

            dist: {
                type: "f",
                value: 0
            }
        }

    ]),

    vertexShader: [

        "uniform float size;",
        "uniform float scale;",
        "varying float cur_dist;",
        "uniform vec3 from ;",

        THREE.ShaderChunk["common"],
        THREE.ShaderChunk["color_pars_vertex"],
        THREE.ShaderChunk["shadowmap_pars_vertex"],
        THREE.ShaderChunk["logdepthbuf_pars_vertex"],

        "void main() {",

        THREE.ShaderChunk["color_vertex"],




        "	#ifdef USE_SIZEATTENUATION",
        "		gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
        "	#else",
        "		gl_PointSize = size;",
        "	#endif",
        "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "	vec4 worldPos = modelMatrix * vec4( position, 1.0 );",
        "	cur_dist = length(from - worldPos.xyz);",

        "	gl_Position = projectionMatrix * mvPosition;",

        THREE.ShaderChunk["logdepthbuf_vertex"],
        THREE.ShaderChunk["worldpos_vertex"],
        THREE.ShaderChunk["shadowmap_vertex"],

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform vec3 psColor;",
        "uniform float opacity;",
        "varying float cur_dist;",
        "uniform float dist;",
        "uniform float len;",

        THREE.ShaderChunk["common"],
        THREE.ShaderChunk["color_pars_fragment"],
        THREE.ShaderChunk["map_particle_pars_fragment"],
        THREE.ShaderChunk["fog_pars_fragment"],
        THREE.ShaderChunk["shadowmap_pars_fragment"],
        THREE.ShaderChunk["logdepthbuf_pars_fragment"],

        "void main() {",

        "	if(cur_dist > dist) discard;",

        "	vec3 outgoingLight = vec3( 0.0 );", // outgoing light does not have an alpha, the surface does
        "	vec4 diffuseColor = vec4( psColor, opacity );",

        THREE.ShaderChunk["logdepthbuf_fragment"],
        THREE.ShaderChunk["map_particle_fragment"],
        THREE.ShaderChunk["color_fragment"],
        THREE.ShaderChunk["alphatest_fragment"],

        "	outgoingLight = diffuseColor.rgb;", // simple shader

        THREE.ShaderChunk["shadowmap_fragment"],
        THREE.ShaderChunk["fog_fragment"],

        "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", // TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects

        "}"

    ].join("\n")


};


THREE.ShaderLib['arTracer'] = {
    uniforms: THREE.UniformsUtils.merge([

        THREE.ShaderLib['points'].uniforms,
        {
            end: {
                type: "v3",
                value: null
            },

            start: {
                type: "v3",
                value: null
            },

            /*dist: {
                type: "f",
                value: 0
			},*/

            len: {
                type: "f",
                value: 0
            }
        }

    ]),

    vertexShader: [

        "uniform float size;",
        "uniform float scale;",

        //"varying float cur_dist;",
        "uniform vec3 start ;",
        "uniform vec3 end ;",
        "varying float start_dist;",
        "varying float end_dist;",

        THREE.ShaderChunk["common"],
        THREE.ShaderChunk["color_pars_vertex"],
        THREE.ShaderChunk["shadowmap_pars_vertex"],
        THREE.ShaderChunk["logdepthbuf_pars_vertex"],

        "void main() {",

        THREE.ShaderChunk["color_vertex"],




        "	#ifdef USE_SIZEATTENUATION",
        "		gl_PointSize = size * ( scale / length( mvPosition.xyz ) );",
        "	#else",
        "		gl_PointSize = size;",
        "	#endif",
        "	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
        "	vec4 worldPos = modelMatrix * vec4( position, 1.0 );",
        "	end_dist = length(end - worldPos.xyz);",
        "	start_dist = length(end - worldPos.xyz);",

        "	gl_Position = projectionMatrix * mvPosition;",

        THREE.ShaderChunk["logdepthbuf_vertex"],
        THREE.ShaderChunk["worldpos_vertex"],
        THREE.ShaderChunk["shadowmap_vertex"],

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform vec3 psColor;",
        "uniform float opacity;",
        //"varying float cur_dist;",
        "uniform float dist;",
        "varying float start_dist;",
        "varying float end_dist;",
        "uniform float len;",

        THREE.ShaderChunk["common"],
        THREE.ShaderChunk["color_pars_fragment"],
        THREE.ShaderChunk["map_particle_pars_fragment"],
        THREE.ShaderChunk["fog_pars_fragment"],
        THREE.ShaderChunk["shadowmap_pars_fragment"],
        THREE.ShaderChunk["logdepthbuf_pars_fragment"],

        "void main() {",

        //"	if(cur_dist > 3000.0) discard;",
        //"	if(cur_dist < dist) discard;",
        //"	if(cur_dist > 3000.0 || cur_dist < dist) discard;",

        "	vec3 outgoingLight = vec3( 0.0 );", // outgoing light does not have an alpha, the surface does
        "	vec4 diffuseColor = vec4( psColor, opacity );",

        THREE.ShaderChunk["logdepthbuf_fragment"],
        THREE.ShaderChunk["map_particle_fragment"],
        THREE.ShaderChunk["color_fragment"],
        THREE.ShaderChunk["alphatest_fragment"],

        "	outgoingLight = diffuseColor.rgb;", // simple shader

        //THREE.ShaderChunk["shadowmap_fragment"],
        //THREE.ShaderChunk["fog_fragment"],

        "	gl_FragColor = vec4( outgoingLight, diffuseColor.a );", // TODO, this should be pre-multiplied to allow for bright highlights on very transparent objects

        "}"

    ].join("\n")


};