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

window.onkeydown = function (e) {
  if (e.which === 32) {
    e.preventDefault();
    animation = !animation;
  }
}

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
    new THREE.MeshNormalMaterial()
  ]);

  parent.add(tubeMesh);

}

init();
animate();

function init() {

  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0, 80, 300);

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