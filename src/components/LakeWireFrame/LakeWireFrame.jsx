import { useEffect, useRef } from "react";
import * as THREE from 'three';
import WebGL from "./WebGL.js"
import "./LakeWireFrame.css";

const bathymetry = require('./bathymetry.json');
const dx = 200;
    
let rows = bathymetry.length;
let cols = bathymetry[0].length;
let biggest_depth = 0;
for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
        bathymetry[j][i] = Math.max(bathymetry[j][i], 0);
        biggest_depth = Math.max(biggest_depth, bathymetry[j][i]);
    }
}

const lake_height = rows * dx;
const lake_width = cols * dx;


function LakeWireFrame() {
    const previous_time_ref = useRef();
    const request_ref = useRef();
    const canvas_ref = useRef();

    useEffect(() => {
        if ( !WebGL.isWebGLAvailable() ) {
            alert("This browser is not WebGL compatible, some animations may not show.");
            return;
        }

        // Set up canvas
        const canvas = canvas_ref.current;
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, canvas: canvas });
        renderer.setClearColor( 0xffffff, 0);

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const near = 100;
        const far = 100000;
        const frustumSize = 20000;
        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.OrthographicCamera( -frustumSize * aspect, frustumSize * aspect, frustumSize, -frustumSize, near, far);
        // const camera = new THREE.PerspectiveCamera(100, aspect, near, far);
        camera.position.y = 12000;
        scene.add(camera)

        // Lights
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.PointLight(color, intensity);
        light.position.set(0, 10000, 0)
        scene.add(light);

        const boxSide = dx;
        // Lines for each row
        for (let j = 0; j < rows; j++) {
            const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
            const points = [];
            for (let i = 0; i < cols; i++) {
                let depth = bathymetry[j][i];
                points.push(new THREE.Vector3(
                    i * dx - lake_width / 2,
                    -depth,
                    j * dx - lake_height / 2
                ))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry, material );
            scene.add( line );
        }

        // Lines for each column
        for (let i = 0; i < cols; i++) {
            const material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
            const points = [];
            for (let j = 0; j < rows; j++) {
                let depth = bathymetry[j][i];
                points.push(new THREE.Vector3(
                    i * dx - lake_width / 2,
                    -depth,
                    j * dx - lake_height / 2
                ))
            }
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry, material );
            scene.add( line );
        }
        
        // Resizes renderer to canvas size if needed
        function resizeRendererToDisplaySize(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
                renderer.setSize(width, height, false);
            }
            return needResize;
        }

        function animate(time) {
            // Update aspect ratio in case browser is stretched
            if (resizeRendererToDisplaySize(renderer)) {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
            
            // Update camera x, z
            const camera_radius = 20000;
            const camera_f = 0.0001;  // rev / sec
            camera.position.x = Math.cos(time * camera_f) * camera_radius
            camera.position.z = Math.sin(time * camera_f) * camera_radius
            camera.lookAt(0, 0, 0);
            
            renderer.render( scene, camera );
            previous_time_ref.current = time;
            request_ref.current = requestAnimationFrame(animate);
        };
        
        request_ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(request_ref.current)
    }, []);
    
    return (
        <div className="lake-wire-frame-container">
            <div className="lake-wire-frame-description-container"> 
                <div className="lake-wire-frame-title"> Lake Tahoe Bathymetry </div>
                <div className="lake-wire-frame-description">
                    The maximum-recorded depth of Tahoe is 1,645 ft. or 501 meters.  In North America, two other lakes are deeper than Tahoe; one is Crater Lake in Oregon at 1,945 feet or 593 meters in depth.  In Canada, Great Slave Lake is 2,015 ft. or 614 meters in depth.
                    <br></br>
                    <br></br>
                    The deepest, largest and oldest of all lakes is Lake Baikal in Siberia, at 5,400 ft. or 1,637 meters in depth.  Lake Baikal at 25 million years old is the largest fresh water lake, containing over 20% of all surface fresh water on Earth.
                    <br></br>
                    <br></br>
                    Although Tahoe is not the largest, deepest or oldest, it is one of the clearest and most beautiful lakes in the world, and is regarded as the Jewel of the Sierra.
                </div> 
            </div>

            <div className="lake-wire-frame-canvas-container">
                <canvas ref={canvas_ref} className="lake-wire-frame"></canvas>
            </div>
        </div>
    );
}

export default LakeWireFrame;