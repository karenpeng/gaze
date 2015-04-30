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