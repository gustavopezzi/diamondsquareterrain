var scale = 4;
var size = Math.pow(2, scale) + 1;
var step = size - 1;
var roughness = 1.0;
var map = [];

var camera, scene, renderer;
var geometry, material, mesh;


function startUp() {
    fillMap();
    seedMap();
    genTerrain();

    threejsInit();
    threejsAnimate();
}


function generate() {
    scale = parseInt(document.getElementById("scale").value);
    size = Math.pow(2, scale) + 1;
    step = size - 1;
    roughness = parseFloat(document.getElementById("roughness").value);
    map = [];

    fillMap();
    seedMap();
    genTerrain();
    threejsReset();
}


function fillMap() {
    for (var i = 0; i < size; i += 1) {
        map.push([]);
        for (var j = 0; j < size; j += 1) {
            map[i].push(0.0);
        }
    }
}


function seedMap() {
    for (var i = size - 1; i >= step; i /= 2) {
        for (var r = 0; r < size; r += i) {
            for (var c = 0; c < size; c += i) {
                setValue(r, c, Math.random());
            }
        }
    }
}


function genTerrain() {
    var randfactor = 1.0;
    s = step;

    while (s > 1) {
        var hs = s / 2;

        // Square.
        for (var r = hs; r < size - 1; r += s) {
            for (var c = hs; c < size - 1; c += s) {
                sampleSquare(r, c, s, randfactor / -2.0, randfactor / 2.0);
            }
        }

        // diamond
        for (var r = 0; r < size; r += s) {
            for (var c = hs; c < size - 1; c += s) {
                sampleDiamond(r, c, s, randfactor / -2.0, randfactor / 2.0);
            }

            if (r + hs < size) {
                for (var c = 0; c < size; c += s) {
                   sampleDiamond(r + hs, c, s, randfactor / -2.0, randfactor / 2.0);
                }
            }
        }

        randfactor *= Math.pow(2, 0 - roughness);
        s /= 2;
    }
}


function sampleSquare(r, c, s, r_min, r_max) {
    var w = getValue(r - s/2, c - s/2);
    var x = getValue(r - s/2, c + s/2);
    var y = getValue(r + s/2, c - s/2);
    var z = getValue(r + s/2, c + s/2);

    var n = -1.0;
    while (n < 0.0 || n > 1.0) {
        n = (w + x + y + z) / 4.0 + Math.random() * (r_max - r_min) + r_min;
    }

    setValue(r, c, n);
}


function sampleDiamond(r, c, s, r_min, r_max) {
    var w = getValue(r - s/2, c);
    var x = getValue(r + s/2, c);
    var y = getValue(r, c - s/2);
    var z = getValue(r, c + s/2);

    var div = 4.0;    
    if (r == 0 || r == size - 1) {
        if (c == 0 || c == size - 1) {
            // this should never happen, but just in case
            div = 2.0;
        }
        else {
            div = 3.0;
        }
    }
    else if (c == 0 || c == size - 1) {
        div = 3.0;
    }

    var n = -1.0;
    while (n < 0.0 || n > 1.0) {
        n = (w + x + y + z) / div + Math.random() * (r_max - r_min) + r_min;
    }

    setValue(r, c, n);
}


function getValue(r, c) {
    if (r < 0 || r >= map.length || c < 0 || c >= map[r].length) {
        return 0.0;
    }
    else {
        return map[r][c];
    }
}


function setValue(r, c, v) {
    map[r][c] = v;
}


function printMap() {
    var out = "";

    for (var i = 0; i < map.length; i += 1) {
        for (var j = 0; j < map[i].length; j += 1) {
            out += Math.floor(map[i][j] * 256.0);
            out += " ";
        }
        out += "\n";
    }

    alert(out);
}


function threejsInit() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 1200, 1200);
    camera.rotation.x = 5.6;

    scene = new THREE.Scene();

    geometry = threejsGetGeometry();
    material = new THREE.MeshBasicMaterial({ color: 0x00FF00, wireframe: true });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);
}


function threejsReset() {
    mesh.geometry = threejsGetGeometry();
}


function threejsAnimate() {
    requestAnimationFrame(threejsAnimate);
    mesh.rotation.y += 0.015;
    renderer.render(scene, camera);
}


function threejsGetGeometry() {
    var out = new THREE.Geometry();

    // add the vertices
    for (var i = 0; i < map.length; i += 1) {
        for (var j = 0; j < map[i].length; j += 1) {
            out.vertices.push(
                new THREE.Vector3(
                    i / size * 1000 - 500,
                    Math.floor(map[i][j] * 500),
                    j / size * 1000 - 500
                )
            );
        }
    }

    // create the faces
    for (var i = 0; i < map.length - 1; i += 1) {
        for (var j = 0; j < map[i].length - 1; j += 1) {
            out.faces.push(
                new THREE.Face3(
                    (i * size + j),
                    (i * size + j + 1),
                    ((i + 1) * size + j)
                )
            );

            // define vertices clockwise
            out.faces.push(
                new THREE.Face3(
                    (i * size + j + 1),
                    ((i + 1) * size + j + 1),
                    ((i + 1) * size + j)
                )
            );
        }
    }

    return out;
}