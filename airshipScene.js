var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    BABYLON.SceneLoader.ImportMesh("", "assets/", "airship.babylon", scene, function (newMeshes) {
        var playerShip = newMeshes[0];

        // player/character ship
        playerShip.id = "player";
        playerShip.name = "player";
        playerShip.position.y = 20;
        playerShip.position.z = -250;

        playerShip.scaling.x = 15;
        playerShip.scaling.y = 15;
        playerShip.scaling.z = 15;

        playerShip.rotation.y = -1 * Math.PI / 2;
    }, null, onError);

    BABYLON.SceneLoader.ImportMesh("", "assets/", "airship_enemy.babylon", scene, function (newMeshes) {
        var enemy1 = newMeshes[0];
        var enemy2 = enemy1.clone();

        // enemy1 ship
        enemy1.id = "enemy1";
        enemy1.name = "enemy1";
        enemy1.position.x = 200;
        enemy1.position.y = 220;
        enemy1.position.z = 250;

        enemy1.scaling.x = 15;
        enemy1.scaling.y = 15;
        enemy1.scaling.z = 15;

        var en1Mat = new BABYLON.StandardMaterial("en1Mat", scene);
        en1Mat.emissiveColor = new BABYLON.Color3(1, 0, 0);
        enemy1.material = en1Mat;

        enemy1.rotation.y = -1 * Math.PI / 2;

        // enemy2 ship
        enemy2.id = "enemy2";
        enemy2.name = "enemy2";
        enemy2.position.x = -200;
        enemy2.position.y = 220;
        enemy2.position.z = 250;

        enemy2.scaling.x = 15;
        enemy2.scaling.y = 15;
        enemy2.scaling.z = 15;

        var en2Mat = new BABYLON.StandardMaterial("en2Mat", scene);
        en2Mat.emissiveColor = new BABYLON.Color3(1, 0, 1);
        enemy2.material = en2Mat;

        enemy2.rotation.y = -1 * Math.PI / 2;
    }, null, onError);

    function onError(err) {
        console.log(err);
    }

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.setPosition(new BABYLON.Vector3(0, 800, 1300));


    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.99;
    camera.lowerRadiusLimit = 150;

    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    // Light
    var spot = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 500, 10), scene);
    spot.diffuse = new BABYLON.Color3(0.6, 0.5, 0.4);
    spot.specular = new BABYLON.Color3(1, 1, 1);
    spot.intensity = 1;

    // Ground
    var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    ground.material = groundMaterial;

    // create a material with 20% transparency
    var materialAlpha = new BABYLON.StandardMaterial("texture1", scene);
    materialAlpha.emissiveColor = new BABYLON.Color3(1, 1, 1);
    materialAlpha.alpha = 0.1;

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

    spot.excludedMeshes.push(plane1, plane2, plane3);

    // Events
    var canvas = engine.getRenderingCanvas();
    camera.attachControl(canvas);
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

    document.getElementById("upRed").addEventListener("click", function () { moveUp("enemy1"); });
    document.getElementById("downRed").addEventListener("click", function () { moveDown("enemy1"); });

    document.getElementById("upPurple").addEventListener("click", function () { moveUp("enemy2"); });
    document.getElementById("downPurple").addEventListener("click", function () { moveDown("enemy2"); });

    document.getElementById("upBlue").addEventListener("click", function () { moveUp("player"); });
    document.getElementById("downBlue").addEventListener("click", function () { moveDown("player"); });

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