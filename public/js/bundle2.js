(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/karen/Documents/my_project/gaze/public/js/index2.js":[function(require,module,exports){
require('./vendor/three/CurveExtras.js');

var container, stats;

var camera, scene, renderer, splineCamera, cameraHelper, cameraEye;

var text, plane, spline;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var binormal = new THREE.Vector3();
var normal = new THREE.Vector3();

splines = require('./spline.js');

extrudePath = new THREE.Curves.TrefoilKnot();

var closed2 = true;
var parent;
var tube, tubeMesh;
var animation = false,
  lookAhead = false;
var scale;
var showCameraHelper = false;
var value = 0;
var segments = 100;
var radiusSegments = 4;
var closed2 = true;

function addTube() {

  //console.log('adding tube', value, closed2, radiusSegments);
  if (tubeMesh) parent.remove(tubeMesh);

  extrudePath = splines[value];

  tube = new THREE.TubeGeometry(extrudePath, segments, 2, radiusSegments, closed2);

  addGeometry(tube, 0xff00ff);
  //setScale();

}

function addGeometry(geometry, color) {

  // 3d shape

  tubeMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [
    new THREE.MeshLambertMaterial({
      color: color
    }),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.3,
      wireframe: true,
      transparent: true
    })
  ]);

  parent.add(tubeMesh);

}

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 50, 500);

  scene = new THREE.Scene();

  var light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 1);
  scene.add(light);

  parent = new THREE.Object3D();
  parent.position.y = 100;
  scene.add(parent);

  splineCamera = new THREE.PerspectiveCamera(84, window.innerWidth / window.innerHeight, 0.01, 1000);
  parent.add(splineCamera);

  cameraHelper = new THREE.CameraHelper(splineCamera);
  scene.add(cameraHelper);

  addTube();

  // Debug point

  cameraEye = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({
    color: 0xdddddd
  }));
  parent.add(cameraEye);

  cameraHelper.visible = showCameraHelper;
  cameraEye.visible = showCameraHelper;

  //

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setClearColor(0xf0f0f0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild(stats.domElement);

  renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
  renderer.domElement.addEventListener('touchstart', onDocumentTouchStart, false);
  renderer.domElement.addEventListener('touchmove', onDocumentTouchMove, false);

  //

  window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function onDocumentMouseDown(event) {

  event.preventDefault();

  renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
  renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
  renderer.domElement.addEventListener('mouseout', onDocumentMouseOut, false);

  mouseXOnMouseDown = event.clientX - windowHalfX;
  targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove(event) {

  mouseX = event.clientX - windowHalfX;

  targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

function onDocumentMouseUp(event) {

  renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
  renderer.domElement.removeEventListener('mouseup', onDocumentMouseUp, false);
  renderer.domElement.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentMouseOut(event) {

  renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove, false);
  renderer.domElement.removeEventListener('mouseup', onDocumentMouseUp, false);
  renderer.domElement.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentTouchStart(event) {

  if (event.touches.length == 1) {

    event.preventDefault();

    mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

  }

}

function onDocumentTouchMove(event) {

  if (event.touches.length == 1) {

    event.preventDefault();

    mouseX = event.touches[0].pageX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;

  }

}

//

function animate() {

  requestAnimationFrame(animate);

  render();
  stats.update();

}

function render() {

  // Try Animate Camera Along Spline
  var time = Date.now();
  var looptime = 20 * 1000;
  var t = (time % looptime) / looptime;

  var pos = tube.parameters.path.getPointAt(t);
  pos.multiplyScalar(scale);

  // interpolation
  var segments = tube.tangents.length;
  var pickt = t * segments;
  var pick = Math.floor(pickt);
  var pickNext = (pick + 1) % segments;

  binormal.subVectors(tube.binormals[pickNext], tube.binormals[pick]);
  binormal.multiplyScalar(pickt - pick).add(tube.binormals[pick]);

  var dir = tube.parameters.path.getTangentAt(t);

  var offset = 15;

  normal.copy(binormal).cross(dir);

  // We move on a offset on its binormal
  pos.add(normal.clone().multiplyScalar(offset));

  splineCamera.position.copy(pos);
  cameraEye.position.copy(pos);

  // Camera Orientation 1 - default look at
  // splineCamera.lookAt( lookAt );

  // Using arclength for stablization in look ahead.
  var lookAt = tube.parameters.path.getPointAt((t + 30 / tube.parameters.path.getLength()) % 1).multiplyScalar(scale);

  // Camera Orientation 2 - up orientation via normal
  if (!lookAhead)
    lookAt.copy(pos).add(dir);
  splineCamera.matrix.lookAt(splineCamera.position, lookAt, normal);
  splineCamera.rotation.setFromRotationMatrix(splineCamera.matrix, splineCamera.rotation.order);

  cameraHelper.update();

  parent.rotation.y += (targetRotation - parent.rotation.y) * 0.05;

  renderer.render(scene, animation === true ? splineCamera : camera);

}
},{"./spline.js":"/Users/karen/Documents/my_project/gaze/public/js/spline.js","./vendor/three/CurveExtras.js":"/Users/karen/Documents/my_project/gaze/public/js/vendor/three/CurveExtras.js"}],"/Users/karen/Documents/my_project/gaze/public/js/spline.js":[function(require,module,exports){
module.exports =
  [
    new THREE.Curves.GrannyKnot(),
    new THREE.Curves.HeartCurve(3.5),
    new THREE.Curves.VivianiCurve(70),
    new THREE.Curves.KnotCurve(),
    new THREE.Curves.HelixCurve(),
    new THREE.Curves.TrefoilKnot(),
    new THREE.Curves.TorusKnot(20),
    new THREE.Curves.CinquefoilKnot(20),
    new THREE.Curves.TrefoilPolynomialKnot(14),
    new THREE.Curves.FigureEightPolynomialKnot(),
    new THREE.Curves.DecoratedTorusKnot4a(),
    new THREE.Curves.DecoratedTorusKnot4b(),
    new THREE.Curves.DecoratedTorusKnot5a(),
    new THREE.Curves.DecoratedTorusKnot5c(),
    new THREE.SplineCurve3([
      new THREE.Vector3(0, 10, -10), new THREE.Vector3(10, 0, -10), new THREE.Vector3(20, 0, 0), new THREE.Vector3(30, 0, 10), new THREE.Vector3(30, 0, 20), new THREE.Vector3(20, 0, 30), new THREE.Vector3(10, 0, 30), new THREE.Vector3(0, 0, 30), new THREE.Vector3(-10, 10, 30), new THREE.Vector3(-10, 20, 30), new THREE.Vector3(0, 30, 30), new THREE.Vector3(10, 30, 30), new THREE.Vector3(20, 30, 15), new THREE.Vector3(10, 30, 10), new THREE.Vector3(0, 30, 10), new THREE.Vector3(-10, 20, 10), new THREE.Vector3(-10, 10, 10), new THREE.Vector3(0, 0, 10), new THREE.Vector3(10, -10, 10), new THREE.Vector3(20, -15, 10), new THREE.Vector3(30, -15, 10), new THREE.Vector3(40, -15, 10), new THREE.Vector3(50, -15, 10), new THREE.Vector3(60, 0, 10), new THREE.Vector3(70, 0, 0), new THREE.Vector3(80, 0, 0), new THREE.Vector3(90, 0, 0), new THREE.Vector3(100, 0, 0)
    ]),
    new THREE.ClosedSplineCurve3([
      new THREE.Vector3(0, -40, -40),
      new THREE.Vector3(0, 40, -40),
      new THREE.Vector3(0, 140, -40),
      new THREE.Vector3(0, 40, 40),
      new THREE.Vector3(0, -40, 40),
    ])
  ]
},{}],"/Users/karen/Documents/my_project/gaze/public/js/vendor/three/CurveExtras.js":[function(require,module,exports){
/*
 * A bunch of parametric curves
 * @author zz85
 *
 * Formulas collected from various sources
 *  http://mathworld.wolfram.com/HeartCurve.html
 *  http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page6.html
 *  http://en.wikipedia.org/wiki/Viviani%27s_curve
 *  http://mathdl.maa.org/images/upload_library/23/stemkoski/knots/page4.html
 *  http://www.mi.sanu.ac.rs/vismath/taylorapril2011/Taylor.pdf
 *  http://prideout.net/blog/?p=44
 */

// Lets define some curves
THREE.Curves = {};

THREE.Curves.GrannyKnot = THREE.Curve.create(function () {},

  function (t) {
    t = 2 * Math.PI * t;

    var x = -0.22 * Math.cos(t) - 1.28 * Math.sin(t) - 0.44 * Math.cos(3 * t) - 0.78 * Math.sin(3 * t);
    var y = -0.1 * Math.cos(2 * t) - 0.27 * Math.sin(2 * t) + 0.38 * Math.cos(4 * t) + 0.46 * Math.sin(4 * t);
    var z = 0.7 * Math.cos(3 * t) - 0.4 * Math.sin(3 * t);
    return new THREE.Vector3(x, y, z).multiplyScalar(20);
  }
);

THREE.Curves.HeartCurve = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 5 : s;

  },

  function (t) {

    t *= 2 * Math.PI;

    var tx = 16 * Math.pow(Math.sin(t), 3);
    var ty = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
      tz = 0;

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

  }

);

// Viviani's Curve
THREE.Curves.VivianiCurve = THREE.Curve.create(

  function (radius) {

    this.radius = radius;
  },

  function (t) {

    t = t * 4 * Math.PI; // Normalized to 0..1
    var a = this.radius / 2;
    var tx = a * (1 + Math.cos(t)),
      ty = a * Math.sin(t),
      tz = 2 * a * Math.sin(t / 2);

    return new THREE.Vector3(tx, ty, tz);

  }

);

THREE.Curves.KnotCurve = THREE.Curve.create(

  function () {

  },

  function (t) {

    t *= 2 * Math.PI;

    var R = 10;
    var s = 50;
    var tx = s * Math.sin(t),
      ty = Math.cos(t) * (R + s * Math.cos(t)),
      tz = Math.sin(t) * (R + s * Math.cos(t));

    return new THREE.Vector3(tx, ty, tz);

  }

);

THREE.Curves.HelixCurve = THREE.Curve.create(

  function () {

  },

  function (t) {

    var a = 30; // radius
    var b = 150; //height
    var t2 = 2 * Math.PI * t * b / 30;
    var tx = Math.cos(t2) * a,
      ty = Math.sin(t2) * a,
      tz = b * t;

    return new THREE.Vector3(tx, ty, tz);

  }

);

THREE.Curves.TrefoilKnot = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 10 : s;

  },

  function (t) {

    t *= Math.PI * 2;
    var tx = (2 + Math.cos(3 * t)) * Math.cos(2 * t),
      ty = (2 + Math.cos(3 * t)) * Math.sin(2 * t),
      tz = Math.sin(3 * t);

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

  }

);

THREE.Curves.TorusKnot = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 10 : s;

  },

  function (t) {

    var p = 3,
      q = 4;
    t *= Math.PI * 2;
    var tx = (2 + Math.cos(q * t)) * Math.cos(p * t),
      ty = (2 + Math.cos(q * t)) * Math.sin(p * t),
      tz = Math.sin(q * t);

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

  }

);

THREE.Curves.CinquefoilKnot = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 10 : s;

  },

  function (t) {

    var p = 2,
      q = 5;
    t *= Math.PI * 2;
    var tx = (2 + Math.cos(q * t)) * Math.cos(p * t),
      ty = (2 + Math.cos(q * t)) * Math.sin(p * t),
      tz = Math.sin(q * t);

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

  }

);

THREE.Curves.TrefoilPolynomialKnot = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 10 : s;

  },

  function (t) {

    t = t * 4 - 2;
    var tx = Math.pow(t, 3) - 3 * t,
      ty = Math.pow(t, 4) - 4 * t * t,
      tz = 1 / 5 * Math.pow(t, 5) - 2 * t;

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

  }

);

// var scaleTo = function(x, y) {
//   var r = y - x;
//   return function(t) {
//     t * r + x;
//   };
// }
var scaleTo = function (x, y, t) {

  var r = y - x;
  return t * r + x;

}

THREE.Curves.FigureEightPolynomialKnot = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 1 : s;

  },

  function (t) {

    t = scaleTo(-4, 4, t);
    var tx = 2 / 5 * t * (t * t - 7) * (t * t - 10),
      ty = Math.pow(t, 4) - 13 * t * t,
      tz = 1 / 10 * t * (t * t - 4) * (t * t - 9) * (t * t - 12);

    return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);

  }

);

THREE.Curves.DecoratedTorusKnot4a = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 40 : s;

  },

  function (t) {

    t *= Math.PI * 2;
    var
      x = Math.cos(2 * t) * (1 + 0.6 * (Math.cos(5 * t) + 0.75 * Math.cos(10 * t))),
      y = Math.sin(2 * t) * (1 + 0.6 * (Math.cos(5 * t) + 0.75 * Math.cos(10 * t))),
      z = 0.35 * Math.sin(5 * t);

    return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);

  }

);

THREE.Curves.DecoratedTorusKnot4b = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 40 : s;

  },

  function (t) {
    var fi = t * Math.PI * 2;
    var x = Math.cos(2 * fi) * (1 + 0.45 * Math.cos(3 * fi) + 0.4 * Math.cos(9 * fi)),
      y = Math.sin(2 * fi) * (1 + 0.45 * Math.cos(3 * fi) + 0.4 * Math.cos(9 * fi)),
      z = 0.2 * Math.sin(9 * fi);

    return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);

  }

);

THREE.Curves.DecoratedTorusKnot5a = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 40 : s;

  },

  function (t) {

    var fi = t * Math.PI * 2;
    var x = Math.cos(3 * fi) * (1 + 0.3 * Math.cos(5 * fi) + 0.5 * Math.cos(10 * fi)),
      y = Math.sin(3 * fi) * (1 + 0.3 * Math.cos(5 * fi) + 0.5 * Math.cos(10 * fi)),
      z = 0.2 * Math.sin(20 * fi);

    return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);

  }

);

THREE.Curves.DecoratedTorusKnot5c = THREE.Curve.create(

  function (s) {

    this.scale = (s === undefined) ? 40 : s;

  },

  function (t) {

    var fi = t * Math.PI * 2;
    var x = Math.cos(4 * fi) * (1 + 0.5 * (Math.cos(5 * fi) + 0.4 * Math.cos(20 * fi))),
      y = Math.sin(4 * fi) * (1 + 0.5 * (Math.cos(5 * fi) + 0.4 * Math.cos(20 * fi))),
      z = 0.35 * Math.sin(15 * fi);

    return new THREE.Vector3(x, y, z).multiplyScalar(this.scale);

  }

);
},{}]},{},["/Users/karen/Documents/my_project/gaze/public/js/index2.js"]);
