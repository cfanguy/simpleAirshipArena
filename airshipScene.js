var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 800, 1300));

    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.99;
    camera.lowerRadiusLimit = 150;

    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    // Light
    var spot = new BABYLON.SpotLight("spot", new BABYLON.Vector3(0, 300, 10), new BABYLON.Vector3(0, -1, 0), 17, 1, scene);
    spot.diffuse = new BABYLON.Color3(0.6, 0.5, 0.4);
    spot.specular = new BABYLON.Color3(1, 1, 1);
    spot.intensity = 0.3;

    // Ground
    var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.specularColor = BABYLON.Color3.Black();
    ground.material = groundMaterial;

    // create a material with 20% transparency
    var materialAlpha = new BABYLON.StandardMaterial("texture1", scene);
    materialAlpha.alpha = 0.2;

    // create a red, purple, and blue cylinder
    var redCylinder = BABYLON.Mesh.CreateCylinder("redCylinder", 80, 40, 40, 10, 1, scene, false);
    var redMat = new BABYLON.StandardMaterial("ground", scene);
    redMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    redMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    redMat.emissiveColor = BABYLON.Color3.Red();
    redCylinder.material = redMat;
    redCylinder.position.y = 250;
    redCylinder.position.x += 200;
    redCylinder.position.z += 250;
    redCylinder.rotation.x = Math.PI / 2;

    var purpleCylinder = BABYLON.Mesh.CreateCylinder("purpleCylinder", 80, 40, 40, 10, 1, scene, false);
    var purpleMat = new BABYLON.StandardMaterial("ground", scene);
    purpleMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    purpleMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    purpleMat.emissiveColor = BABYLON.Color3.Purple();
    purpleCylinder.material = purpleMat;
    purpleCylinder.position.y = 250;
    purpleCylinder.position.x -= 200;
    purpleCylinder.position.z += 250;
    purpleCylinder.rotation.x = Math.PI / 2;

    var blueCylinder = BABYLON.Mesh.CreateCylinder("blueCylinder", 80, 40, 40, 10, 1, scene, false);
    var blueMat = new BABYLON.StandardMaterial("ground", scene);
    blueMat.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    blueMat.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    blueMat.emissiveColor = BABYLON.Color3.Blue();
    blueCylinder.material = blueMat;
    blueCylinder.position.y = 50;
    blueCylinder.position.z -= 250;
    blueCylinder.rotation.x = Math.PI / 2;

    // create a plane for each level for low, mid and hi with transparency from the material
    var plane1 = BABYLON.Mesh.CreatePlane("low", 1000.0, scene);
    plane1.rotation.x = Math.PI / 2;
    plane1.position.y = 100;
    plane1.material = materialAlpha;

    var plane2 = BABYLON.Mesh.CreatePlane("mid", 1000.0, scene);
    plane2.rotation.x = Math.PI / 2;
    plane2.position.y = 200;
    plane2.material = materialAlpha;

    var plane3 = BABYLON.Mesh.CreatePlane("hi", 1000.0, scene);
    plane3.rotation.x = Math.PI / 2;
    plane3.position.y = 300;
    plane3.material = materialAlpha;

    // Events
    var canvas = engine.getRenderingCanvas();
    var startingPoint;
    var currentMesh;

    var getGroundPosition = function () {
        // Use a predicate to get position on the ground
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
            return mesh == ground;
        });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }

        return null;
    }

    var onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }

        // check if we are under a mesh and that the current object is not the ground and not one of the planes
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
            return mesh !== ground && mesh !== plane1 && mesh !== plane2 && mesh !== plane3;
        });
        if (pickInfo.hit) {
            currentMesh = pickInfo.pickedMesh;
            startingPoint = getGroundPosition(evt);

            if (startingPoint) { // we need to disconnect camera from canvas
                setTimeout(function () {
                    camera.detachControl(canvas);
                }, 0);
            }
        }
    }

    var onPointerUp = function () {
        if (startingPoint) {
            camera.attachControl(canvas);
            startingPoint = null;
            return;
        }
    }

    var onPointerMove = function (evt) {
        if (!startingPoint) {
            return;
        }

        var current = getGroundPosition(evt);

        if (!current) {
            return;
        }

        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;

    }

    var moveUp = function (name) {
        var obj = scene.getMeshByName(name);

        if (obj.position.y < 200) {
            obj.position.y += 100
        }
    }

    var moveDown = function (name) {
        var obj = scene.getMeshByName(name);

        if (obj.position.y > 100) {
            obj.position.y -= 100
        }
    }

    document.getElementById("upRed").addEventListener("click", function () { moveUp("redCylinder"); });
    document.getElementById("downRed").addEventListener("click", function () { moveDown("redCylinder"); });

    document.getElementById("upPurple").addEventListener("click", function () { moveUp("purpleCylinder"); });
    document.getElementById("downPurple").addEventListener("click", function () { moveDown("purpleCylinder"); });

    document.getElementById("upBlue").addEventListener("click", function () { moveUp("blueCylinder"); });
    document.getElementById("downBlue").addEventListener("click", function () { moveDown("blueCylinder"); });

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);

    scene.onDispose = function () {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointermove", onPointerMove);
    }

    return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});