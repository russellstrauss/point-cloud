module.exports = function() {
	
	let message = document.querySelector('.message');
	
	var settings = {
		defaultCameraLocation: {
			x: 0,
			y: 75,
			z: 0
		},
		messageDuration: 2000,
		colors: {
			worldColor: new THREE.Color('#000'),
			gridColor: new THREE.Color('#111')
		},
		gridSize: 100
	};
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var stats = new Stats();
	
	return {
		
		init: function() {
			let self = this;
			self.loadFont();
		},
		
		begin: function() {
			
			let self = this;
			scene = gfx.setUpScene();
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			floor = gfx.addGrid(settings.gridSize, settings.colors.worldColor, settings.colors.gridColor);
			controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			gfx.setUpLights();
			gfx.setCameraLocation(camera, settings.defaultCameraLocation);
			self.addStars();
			self.setUpButtons();
			self.addVertexColors();
			
			var animate = function() {
				requestAnimationFrame(animate);
				renderer.render(scene, camera);
				controls.update();
			};
			animate(); 
		},
		
		addStars: function() {
			let geometry = new THREE.BufferGeometry();
			let vertices = [];
			for (let i = 0; i < 10000; i ++ ) {
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // x
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // y
				vertices.push( THREE.MathUtils.randFloatSpread( 2000 ) ); // z
			}
			geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
			let particles = new THREE.Points( geometry, new THREE.PointsMaterial( { color: 0x888888 } ) );
			scene.add( particles );
		},
		
		pointCloud: function(id) {
			
			let self = this;
			let y = gfx.appSettings.zBuffer;
			
			let range = [-10, 10];
			let density = 3;
			
			for (let x = range[0]; x <= range[1]; x += density) {
				
				for (let y = 0; y <= range[1] * 2; y += density) {

					for (let z = range[0]; z <= range[1]; z += density) {
						
						let point = new THREE.Vector3(x, y, z);
					}
				}
			}
		},
		
		reset: function() {
			
			message.textContent = '';
			
			for (let i = scene.children.length - 1; i >= 0; i--) {
				let obj = scene.children[i];
			}
		},
		
		loadFont: function() {
			
			let self = this;
			let loader = new THREE.FontLoader();
			let fontPath = '';
			fontPath = 'assets/vendors/js/three.js/examples/fonts/helvetiker_regular.typeface.json';

			loader.load(fontPath, function(font) { // success event
				
				gfx.appSettings.font.smallFont.font = font;
				gfx.appSettings.font.largeFont.font = font;
				self.begin();
				if (gfx.appSettings.axesHelper.activateAxesHelper) gfx.labelAxesHelper();
			},
			function(event) {}, // in progress event
			function(event) { // error event
				gfx.appSettings.font.enable = false;
				self.begin();
			});
		},
		
		setUpButtons: function() {
			let self = this;
			let message = document.getElementById('message');
			document.addEventListener('keyup', function(event) {
				
				let one = 49;
				let two = 50;
				let three = 51;
				let four = 52;
				let r = 82;
				let space = 32;
				let a = 65;
				
				if (event.keyCode === one) {
					self.reset();
				}
				if (event.keyCode === two) {
					self.reset();
				}
				if (event.keyCode === three) {
					self.reset();
				}
				if (event.keyCode === four) {
					self.reset();
				}
				if (event.keyCode === r) {
					self.reset();
				}
				if (event.keyCode === space) {
					console.log(camera.position);
				}
				if (event.keyCode === a) {
					gfx.toggleAxesHelper();
				}
			});
		},
		
		addVertexColors: function() {
			
			let self = this;
			let loader = new THREE.OBJLoader();
			loader.load('./assets/obj/bunny.obj',
				function (obj) { // loaded
					
					let geometry = obj.children[0].geometry;
					
					let color1 = new THREE.Color(1, 0, 0);
					let color2 = new THREE.Color(0, 1, 0);
					
					let colors = [];
					let vertexCount = geometry.attributes.position.count;
					for (let i = 0; i < vertexCount; i++) {
						let interpolator = (i/(vertexCount - 1));
						// colors[i] = color1.clone().lerp(color2, interpolator);
						colors[i] = self.rgbStringToColor(d3.interpolateYlGnBu(interpolator));
					}
					let reverseColors = true;
					if (reverseColors) colors.reverse();
					
					let arrayBuffer = new ArrayBuffer( vertexCount * 16 ); // create a generic buffer of binary data (a single particle has 16 bytes of data)
					let interleavedFloat32Buffer = new Float32Array( arrayBuffer );// the typed arrays share the same buffer
					let interleavedUint8Buffer = new Uint8Array( arrayBuffer );
					
					let color = new THREE.Color();
					for ( let i = 0; i < interleavedFloat32Buffer.length; i += 4 ) {
						
						let vertex = i/4;
						color = colors[vertex];

						let j = ( i + 3 ) * 4;
						interleavedUint8Buffer[ j + 0 ] = color.r * 255; interleavedUint8Buffer[ j + 1 ] = color.g * 255; interleavedUint8Buffer[ j + 2 ] = color.b * 255;
					}

					let interleavedBuffer32 = new THREE.InterleavedBuffer(interleavedFloat32Buffer, 4), interleavedBuffer8 = new THREE.InterleavedBuffer( interleavedUint8Buffer, 16);
					geometry.setAttribute( 'color', new THREE.InterleavedBufferAttribute( interleavedBuffer8, 3, 12, true));
					
					camera.position.set(-80, 100, 100);
					let material = new THREE.PointsMaterial({size: (1/3), vertexColors: THREE.VertexColors });
					let mesh = new THREE.Points(geometry, material);
					// bunny
					mesh.scale.set(500, 500, 500);
					mesh.position.y -= 16.5;
					scene.add(mesh)
				},
				function (xhr) { // in progress
				},
				function (error) { // on failure
					console.log('Error loadModel(): ', error);
				}
			);
		},
		
		rgbStringToColor: function(rgbString) {
			rgbString = rgbString.replace('rgb(','').replace(')','').replace(' ','').split(',');
			return new THREE.Color(rgbString[0]/255, rgbString[1]/255, rgbString[2]/255);
		},
		
		hexStringToColor: function(hexString) {
			return new THREE.Color().set(hexString);
		}
	}
}