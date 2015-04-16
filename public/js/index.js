var track = require('./track.js');
var blinkL = track.blinkL;
var blinkR = track.blinkR;

var container, stats;

var camera, scene, renderer;

var controls;

var group, plane;

var speed = 50;

var pointLight;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var delta = 1, clock = new THREE.Clock();

var heartShape, particleCloud, sparksEmitter, emitterPos;
var _rotation = 0;
var timeOnShapePath = 0;

var composer;
var effectBlurX, effectBlurY, hblur, vblur;

var sparksEmitter1, sparksEmitter2;

var eyeL, eyeR;

var rawL, rawR;

var w = document.getElementById('videoel').width;
var h = document.getElementById('videoel').height;

var nothing, goToHell, onParticleCreatedL, onParticleCreatedR;

init();
animate();

function viewport(pos){
  var x =  ((w - pos[0]) / w * 2 - 1) *  windowHalfX;
  var y =  (-pos[1] / h * 2 + 1) *  windowHalfY;
  return [x, y];
}

function init() {

  // rawL = require('./track.js').posL;
  // rawR = require('./track.js').posR;

  // eyeL = viewport(rawL);
  // eyeR = viewport(rawR);
  eyeL = [0, 0];
  eyeR = [0, 0];

  container = document.getElementById('container');
  // CAMERA

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 0, 150, 400 );

  // SCENE

  scene = new THREE.Scene();

  // CONTROLS
  // controls = new THREE.OrbitControls(camera);
  // controls.damping = 0.2;

  // LIGHTS

  var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
  directionalLight.position.set( 0, -1, 1 );
  directionalLight.position.normalize();
  scene.add( directionalLight );

  pointLight = new THREE.PointLight( 0xffffff, 2, 300 );
  pointLight.position.set( 0, 0, 0 );
  scene.add( pointLight );

  group = new THREE.Group();
  scene.add( group );

  // Create particle objects for Three.js

  var particlesLength = 10000;

  var particles = new THREE.Geometry();

  function newpos( x, y, z ) {

    return new THREE.Vector3( x, y, z );

  }


  var Pool = {

    __pools: [],

    // Get a new Vector

    get: function() {

      if ( this.__pools.length > 0 ) {

        return this.__pools.pop();

      }

      console.log( "pool ran out!" )
      return null;

    },

    // Release a vector back into the pool

    add: function( v ) {

      this.__pools.push( v );

    }

  };


  for ( i = 0; i < particlesLength; i ++ ) {

    particles.vertices.push( newpos( Math.random() * 200 - 100, Math.random() * 100 + 150, Math.random() * 50 ) );
    Pool.add( i );

  }


  // Create pools of vectors

  attributes = {

    size:  { type: 'f', value: [] },
    pcolor: { type: 'c', value: [] }

  };

  var sprite = generateSprite() ;
  //document.body.appendChild(sprite);

  texture = new THREE.Texture( sprite );
  texture.needsUpdate = true;

  uniforms = {

    texture:   { type: "t", value: texture }

  };

  // PARAMETERS

  // Steadycounter
  // Life
  // Opacity
  // Hue Speed
  // Movement Speed

  function generateSprite() {

    var canvas = document.createElement( 'canvas' );
    canvas.width = 128;
    canvas.height = 128;

    var context = canvas.getContext( '2d' );

    context.beginPath();
    context.arc( 64, 64, 60, 0, Math.PI * 2, false) ;

    context.lineWidth = 0.5; //0.05
    context.stroke();
    context.restore();

    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );

    gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.2, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.4, 'rgba(200,200,200,1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

    context.fillStyle = gradient;

    context.fill();

    return canvas;

  }


  var shaderMaterial = new THREE.ShaderMaterial( {

    uniforms: uniforms,
    attributes: attributes,

    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true

  });

  particleCloud = new THREE.PointCloud( particles, shaderMaterial );

  var vertices = particleCloud.geometry.vertices;
  var values_size = attributes.size.value;
  var values_color = attributes.pcolor.value;

  for( var v = 0; v < vertices.length; v ++ ) {

    values_size[ v ] = 50;

    values_color[ v ] = new THREE.Color( 0x000000 );

    particles.vertices[ v ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );

  }

  group.add( particleCloud );
  particleCloud.y = 800;


  var hue = 0;

  var setTargetParticle = function() {

    var target = Pool.get();
    values_size[ target ] = Math.random() * 200 + 100;

    return target;

  };

  onParticleCreatedL = function( p ) {

    var position = p.position;
    p.target.position = position;

    var target = p.target;

    if ( target ) {

      // console.log(target,particles.vertices[target]);
      // values_size[target]
      // values_color[target]

      hue += 0.0003 * delta;
      if ( hue < 0.6 ) hue += 0.6;
      if ( hue > 0.7 ) hue -= 0.7;

      // TODO Create a PointOnShape Action/Zone in the particle engine

      timeOnShapePath += 0.00035 * delta;
      if ( timeOnShapePath > 1 ) timeOnShapePath -= 1;

      emitterpos.x = eyeL[0];
      emitterpos.y = eyeL[1];

      // pointLight.position.copy( emitterpos );
      pointLight.position.x = emitterpos.x;
      pointLight.position.y = emitterpos.y;
      pointLight.position.z = 100;

      particles.vertices[ target ] = p.position;

      values_color[ target ].setHSL( hue, 0.6, 0.1 );

      pointLight.color.setHSL( hue, 0.5, 0.8 );


    };

  };


  onParticleCreatedR = function( p ) {

    var position = p.position;
    p.target.position = position;

    var target = p.target;

    if ( target ) {

      // console.log(target,particles.vertices[target]);
      // values_size[target]
      // values_color[target]

      hue += 0.0003 * delta;
      if ( hue < 0.6 ) hue += 0.6;
      if ( hue > 0.7 ) hue -= 0.7;

      // TODO Create a PointOnShape Action/Zone in the particle engine

      timeOnShapePath += 0.00035 * delta;
      if ( timeOnShapePath > 1 ) timeOnShapePath -= 1;

      emitterpos.x = eyeR[0];
      emitterpos.y = eyeR[1];

      // pointLight.position.copy( emitterpos );
      pointLight.position.x = emitterpos.x;
      pointLight.position.y = emitterpos.y;
      pointLight.position.z = 100;

      particles.vertices[ target ] = p.position;

      values_color[ target ].setHSL( hue, 0.6, 0.1 );

      pointLight.color.setHSL( hue, 0.5, 0.8 );


    };

  };

  var onParticleDead = function( particle ) {

    var target = particle.target;

    if ( target ) {

      // Hide the particle

      values_color[ target ].setRGB( 0, 0, 0 );
      particles.vertices[ target ].set( Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY );

      // Mark particle system as available by returning to pool

      Pool.add( particle.target );

    }

  };

  var engineLoopUpdate = function() {

  };


  sparksEmitter1 = new SPARKS.Emitter( new SPARKS.SteadyCounter( 50 ) );

  emitterpos = new THREE.Vector3( 0, 0, 0 );

  sparksEmitter1.addInitializer( new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
  sparksEmitter1.addInitializer( new SPARKS.Lifetime( 0, 3 ));
  sparksEmitter1.addInitializer( new SPARKS.Target( null, setTargetParticle ) );


  sparksEmitter1.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 0, -5, 1 ) ) ) );

  sparksEmitter1.addAction( new SPARKS.Age(TWEEN.Easing.Quartic.In) );
  //sparksEmitter.addAction( new SPARKS.Age() );
  sparksEmitter1.addAction( new SPARKS.Accelerate( Math.random() * -(10), 0, -20 ) );
  sparksEmitter1.addAction( new SPARKS.Move() );
  sparksEmitter1.addAction( new SPARKS.RandomDrift( 200, 10, 300 ) );

  sparksEmitter1.addCallback( "created", onParticleCreatedR );
  sparksEmitter1.addCallback( "dead", onParticleDead );

  sparksEmitter1.start();

  sparksEmitter2 = new SPARKS.Emitter( new SPARKS.SteadyCounter( 50 ) );
  sparksEmitter2.addInitializer( new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
  sparksEmitter2.addInitializer( new SPARKS.Lifetime( 0, 3 ));
  sparksEmitter2.addInitializer( new SPARKS.Target( null, setTargetParticle ) );


  sparksEmitter2.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( new THREE.Vector3( 0, -5, 1 ) ) ) );

  sparksEmitter2.addAction( new SPARKS.Age(TWEEN.Easing.Quartic.In) );
  //sparksEmitter.addAction( new SPARKS.Age() );
  sparksEmitter2.addAction( new SPARKS.Accelerate( Math.random() * 10, 0, -20 ) );
  sparksEmitter2.addAction( new SPARKS.Move() );
  sparksEmitter2.addAction( new SPARKS.RandomDrift( 200, 10, 300 ) );

  sparksEmitter2.addCallback( "created", onParticleCreatedL );
  sparksEmitter2.addCallback( "dead", onParticleDead );

  sparksEmitter2.start();


  blinkL.on('Lblink', function(){
    //console.log('left blink!');
    sparksEmitter2.addCallback( "created", nothing );
    sparksEmitter2.addCallback( "updated", goToHell );
    setTimeout(function(){
      sparksEmitter2.addCallback( "updated", nothing);
      sparksEmitter2.addCallback( "created", onParticleCreatedL );
    }, Math.random()*100 + 200);
  });

  blinkR.on('Rblink', function(){
    //console.log('right blink!');
    sparksEmitter1.addCallback( "created", nothing );
    sparksEmitter1.addCallback( "updated", goToHell );
    setTimeout(function(){
      sparksEmitter1.addCallback( "updated", nothing);
      sparksEmitter1.addCallback( "created", onParticleCreatedR );
    }, Math.random()*100 + 200);
  });


  nothing = function(){
    //do nothing
  }

  goToHell = function(particle){
    particle.age += 1;
  };

  // End Particles

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.left = '0px';
  container.appendChild( stats.domElement );

  // POST PROCESSING

  var effectFocus = new THREE.ShaderPass( THREE.FocusShader );

  var effectCopy = new THREE.ShaderPass( THREE.CopyShader );
  effectFilm = new THREE.FilmPass( 0.5, 0.25, 2048, false );

  var shaderBlur = THREE.TriangleBlurShader;
  effectBlurX = new THREE.ShaderPass( shaderBlur, 'texture' );
  effectBlurY = new THREE.ShaderPass( shaderBlur, 'texture' );

  var radius = 15;
  var blurAmountX = radius / window.innerWidth;
  var blurAmountY = radius / window.innerHeight;

  hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
  vblur = new THREE.ShaderPass( THREE.VerticalBlurShader);

  hblur.uniforms[ 'h' ].value =  1 / window.innerWidth;
  vblur.uniforms[ 'v' ].value =  1 / window.innerHeight;

  effectBlurX.uniforms[ 'delta' ].value = new THREE.Vector2( blurAmountX, 0 );
  effectBlurY.uniforms[ 'delta' ].value = new THREE.Vector2( 0, blurAmountY );

  effectFocus.uniforms[ 'sampleDistance' ].value = 0.99; //0.94
  effectFocus.uniforms[ 'waveFactor' ].value = 0.003;  //0.00125

  var renderScene = new THREE.RenderPass( scene, camera );

  composer = new THREE.EffectComposer( renderer );
  composer.addPass( renderScene );
  composer.addPass( hblur );
  composer.addPass( vblur );
  // composer.addPass( effectBlurX );
  // composer.addPass( effectBlurY );
  // composer.addPass( effectCopy );
  // composer.addPass( effectFocus );
  // composer.addPass( effectFilm );

  vblur.renderToScreen = true;
  effectBlurY.renderToScreen = true;
  effectFocus.renderToScreen = true;
  effectCopy.renderToScreen = true;
  effectFilm.renderToScreen = true;

  // document.addEventListener( 'mousedown', onDocumentMouseDown, false );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  //

  hblur.uniforms[ 'h' ].value =  1 / window.innerWidth;
  vblur.uniforms[ 'v' ].value =  1 / window.innerHeight;

  var radius = 15;
  var blurAmountX = radius / window.innerWidth;
  var blurAmountY = radius / window.innerHeight;

  effectBlurX.uniforms[ 'delta' ].value = new THREE.Vector2( blurAmountX, 0 );
  effectBlurY.uniforms[ 'delta' ].value = new THREE.Vector2( 0, blurAmountY );

  composer.reset();

}

//

// document.addEventListener( 'mousemove', onDocumentMouseMove, false );


function onDocumentMouseDown( event ) {

  event.preventDefault();

  mouseXOnMouseDown = event.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;

  if ( sparksEmitter1.isRunning() ) {

    sparksEmitter1.stop();

  } else {

    sparksEmitter1.start();

  }

  if ( sparksEmitter2.isRunning() ) {

    sparksEmitter2.stop();

  } else {

    sparksEmitter2.start();

  }

}

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

//
var frameCount = 0;
function animate() {

  requestAnimationFrame( animate );
  frameCount ++;

  if(frameCount % 2 === 0){
    render();
  }

  //controls.update();
  stats.update();

}

var records = [];
var recordCountDown = 0;
var progress = document.getElementById('progress');

function render() {

  delta = speed * clock.getDelta();

  particleCloud.geometry.verticesNeedUpdate = true;

  attributes.size.needsUpdate = true;
  attributes.pcolor.needsUpdate = true;

  // Pretty cool effect if you enable this
  // particleCloud.rotation.y += 0.05;

  //group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;

  rawL = require('./track.js').posL;
  rawR = require('./track.js').posR;
  var largeMove = require('./track.js').largeMove;

  // if(largeMove){
  //   sparksEmitter1.addCallback( "created", nothing );
  //   sparksEmitter1.addCallback( "updated", goToHell );
  //   sparksEmitter2.addCallback( "created", nothing );
  //   sparksEmitter2.addCallback( "updated", goToHell );
  // }else{
  //   sparksEmitter1.addCallback( "updated", nothing);
  //   sparksEmitter1.addCallback( "created", onParticleCreatedL );
  //   sparksEmitter2.addCallback( "updated", nothing);
  //   sparksEmitter2.addCallback( "created", onParticleCreatedL );
  // }

  if(rawL !== undefined && rawR !== undefined){
    recordCountDown ++;
  }

  if(recordCountDown > 100 && recordCountDown <= 1000 ){
    records.push([rawL, rawR]);
    var w = window.innerWidth * (recordCountDown - 100) / 800;
    document.getElementById('progress').setAttribute('style', 'width:'+  w + 'px;');
  }

  if(rawL !== undefined){
    eyeL = viewport(rawL);
  }
  if(rawR !== undefined){
   eyeR = viewport(rawR);
  }

  renderer.clear();

  // renderer.render( scene, camera );
  composer.render( 0.1 );

}
