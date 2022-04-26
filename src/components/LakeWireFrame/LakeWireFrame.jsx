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
            camera.position.x = Math.cos(time * camera_f) * camera_radius;
            camera.position.z = Math.sin(time * camera_f) * camera_radius;
            camera.lookAt(0, 0, 0);
            
            renderer.render( scene, camera );
            previous_time_ref.current = time;
            request_ref.current = requestAnimationFrame(animate);
        };
        
        request_ref.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(request_ref.current);
    }, []);
    
    return (
        <div className="lake-wire-frame-container">
            <div className="lake-wire-frame-description-container"> 
                <div className="lake-wire-frame-title"> Lake Tahoe Bathymetry </div>
                <div className="lake-wire-frame-description">
                Lake levels and depth vary only slightly today. The deepest recorded depth of Lake Tahoe is 1,645 feet. 
                To visualize this depth, imagine the bottom of Tahoe reaching down 100 feet lower than Carson City, Nevada, 
                sitting in the basin far below Tahoe to the east.

                <br/><br/>

                What we see as "normal" Lake Tahoe depth is only our perspective. Over its history, the lake level has been 
                much lower or much higher than today. We can see clear evidence of lower lake levels in the past lasting 
                hundreds of years. Many locations around the lake have submerged mature tree stumps twenty feet below 
                current lake levels. By examining and dating the tree rings of these underwater stumps, we can see that 
                shoreline forests have repeatedly been drowned by ups and downs in the historic lake levels of Tahoe.
                    
                <br/><br/>

                <a href="https://www.fs.usda.gov/main/ltbmu/about-forest/about-area"> Source: USDA Forest Service </a>

                </div> 
            </div>

            <div className="lake-wire-frame-canvas-container">
                <canvas ref={canvas_ref} className="lake-wire-frame"></canvas>
            </div>
        </div>
    );
}

export default LakeWireFrame;