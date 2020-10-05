module.exports = function() {
	
	let message = document.querySelector('.message');
	var pastData;
	var settings = {
		defaultCameraLocation: {
			x: -90,
			y: 110,
			z: 80
		},
		messageDuration: 2000,
		colors: {
			worldColor: new THREE.Color('#000'),
			gridColor: new THREE.Color('#111')
		},
		gridSize: 100,
		axes: {
			color: 0xffffff,
			count: 20,
			tickLength: 1
		}
	};
	
	var renderer, scene, camera, controls, floor;
	var raycaster = new THREE.Raycaster();
	var black = new THREE.Color('black'), white = new THREE.Color('white'), green = new THREE.Color(0x00ff00), red = new THREE.Color('#ED0000');
	var stats = new Stats();
	
	return {
		
		init: function() {
			let self = this;
			self.loadFont();
			self.loadData();
		},
		
		begin: function() {
			
			let self = this;
			scene = gfx.setUpScene();
			renderer = gfx.setUpRenderer(renderer);
			camera = gfx.setUpCamera(camera);
			floor = self.addGrid(settings.gridSize, settings.colors.worldColor, settings.colors.gridColor);
			controls = gfx.enableControls(controls, renderer, camera);
			gfx.resizeRendererOnWindowResize(renderer, camera);
			gfx.setUpLights();
			gfx.setCameraLocation(camera, settings.defaultCameraLocation);
			self.addStars();
			self.setUpButtons();
			// self.addVertexColors();
			
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
					console.log(camera);
				}
				if (event.keyCode === a) {
					gfx.toggleAxesHelper();
				}
			});
		},
		
		addVertexColors: function() {
			
			let self = this;
			let loader = new THREE.OBJLoader();
			let file = './assets/obj/bunny.obj';
			loader.load(file,
				function (obj) { // loaded
					
					let geometry = obj.children[0].geometry;
					let material = new THREE.PointsMaterial({size: (1/3), vertexColors: THREE.VertexColors });
					let mesh = new THREE.Points(geometry, material);
					let colors = [];
					let color1 = new THREE.Color(0, 0, 1);
					let color2 = new THREE.Color(1, 1, 0);
					let interps = [d3.interpolateRainbow, d3.interpolateSinebow, d3.interpolateYlOrRd, d3.interpolateYlGnBu,d3.interpolateRdPu, d3.interpolatePuBu, d3.interpolateGnBu, d3.interpolateBuPu, d3.interpolateCubehelixDefault, d3.interpolateCool, d3.interpolateWarm, d3.interpolateCividis, d3.interpolatePlasma, d3.interpolateMagma, d3.interpolateInferno, d3.interpolateViridis, d3.interpolateTurbo, d3.interpolatePurples, d3.interpolateReds, d3.interpolateOranges, d3.interpolateGreys, d3.interpolateGreens, d3.interpolateBlues, d3.interpolateSpectral, d3.interpolateRdYlBu, d3.interpolateRdBu, d3.interpolatePuOr, d3.interpolatePiYG, d3.interpolatePRGn]
					let colorSchemes = [d3.schemeCategory10, d3.schemeAccent, d3.schemeDark2, d3.schemePaired, d3.schemePastel1, d3.schemePastel2, d3.schemeSet1, d3.schemeSet2, d3.schemeSet3, d3.schemeTableau10];
					switch (file) {
						case './assets/obj/teapot.obj':
							mesh.scale.set(15, 15, 15);
							// colors = self.interpolateColors(geometry, color1, color2);
							// colors = self.interpolateD3Colors(geometry, color1, color2, interps[10], true);
							colors = self.d3Stripes(geometry, colorSchemes[9]);
							break;
						case './assets/obj/bunny.obj':
							mesh.scale.set(500, 500, 500);
							mesh.position.y -= 16.5; mesh.position.x += 10;
							// colors = self.interpolateD3Colors(geometry, color1, color2, d3.interpolateYlGnBu, true);
							// colors = self.interpolateD3Colors(geometry, color1, color2, interps[1], true);
							colors = self.d3Stripes(geometry, colorSchemes[6]);
							break;
					}
					
					
					let vertexCount = geometry.attributes.position.count;
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
					
					scene.add(mesh)
				},
				function (xhr) { // in progress
				},
				function (error) { // on failure
					console.log('Error loadModel(): ', error);
				}
			);
		},
		
		d3Stripes: function(geometry, colorScheme) {
			let self = this;
			let colors = [];
			let vertexCount = geometry.attributes.position.count;
			for (let i = 0; i < vertexCount; i++) {
				let interpolator = (i/(vertexCount - 1));
				// console.log(Math.floor(interpolator*10), colorScheme[Math.floor(interpolator*10)]);
				colors[i] = self.hexStringToColor(colorScheme[i%colorScheme.length]);
			}
			return colors;
		},
		
		interpolateD3Colors: function(geometry, color1, color2, interpolatorFunc, reverse) {
			let self = this;
			reverse = reverse || false;
			let colors = [];
			let vertexCount = geometry.attributes.position.count;
			for (let i = 0; i < vertexCount; i++) {
				let interpolator = (i/(vertexCount - 1));
				// colors[i] = color1.clone().lerp(color2, interpolator);
				colors[i] = self.rgbStringToColor(interpolatorFunc(interpolator));
			}
			if (reverse) colors.reverse();
			return colors;
		},
		
		interpolateColors: function(geometry, color1, color2, reverse) {
			let self = this;
			reverse = reverse || false;
			let colors = [];
			let vertexCount = geometry.attributes.position.count;
			for (let i = 0; i < vertexCount; i++) {
				let interpolator = (i/(vertexCount - 1));
				colors[i] = color1.clone().lerp(color2, interpolator);
			}
			if (reverse) colors.reverse();
			return colors;
		},
		
		rgbStringToColor: function(rgbString) {
			rgbString = rgbString.replace('rgb(','').replace(')','').replace(' ','').split(',');
			return new THREE.Color(rgbString[0]/255, rgbString[1]/255, rgbString[2]/255);
		},
		
		hexStringToColor: function(hexString) {
			return new THREE.Color().set(hexString);
		},
		
		addGrid: function(size, worldColor, gridColor) {
				
			let zBuff = gfx.appSettings.zBuffer;
			var planeGeometry = new THREE.PlaneBufferGeometry(size, size);
			planeGeometry.rotateX(-Math.PI / 2);
			var planeMaterial = new THREE.ShadowMaterial();

			var plane = new THREE.Mesh(planeGeometry, planeMaterial);
			plane.position.y = -1;
			plane.receiveShadow = true;
			scene.add(plane);
			var helper = new THREE.GridHelper(size, 20, gridColor, gridColor);
			helper.material.opacity = .75;
			helper.material.transparent = true;
			helper.position.set(zBuff, 0, -zBuff);
			scene.add(helper);
			
			let wall = new THREE.GridHelper(size, 20, gridColor, gridColor);
			wall.material.opacity = .75;
			wall.material.transparent = true;
			
			let left = wall.clone();
			left.rotation.x = Math.PI/2;
			left.position.set(0, size/2, -size/2 - zBuff);
			scene.add(left);
			let right = helper.clone();
			right.rotation.set(Math.PI/2, 0, Math.PI/2);
			right.position.set(size/2, size/2, -zBuff);
			scene.add(right);
			
			let white = 0xffffff;
			let bottomLeft = new THREE.Vector3(-size/2, 0, -size/2), nearestCorner = new THREE.Vector3(-size/2, 0, size/2);
			gfx.drawLineFromPoints(bottomLeft, new THREE.Vector3(-size/2, size, -size/2), white, .5);
			gfx.drawLineFromPoints(bottomLeft, new THREE.Vector3(-size/2, 0, size/2), white, .5);
			gfx.drawLineFromPoints(new THREE.Vector3(-size/2, 0, size/2), new THREE.Vector3(size/2, 0, size/2), white, .5);

			scene.background = worldColor;
			//scene.fog = new THREE.FogExp2(new THREE.Color('black'), 0.002);
			
			let axisScaleLabelColor = 0xffffff;
			let count = settings.axes.count;
			let length = settings.gridSize;
			let interval = length/count;
			let tickLength = settings.axes.tickLength;
			let tick = new THREE.Vector3(-tickLength, 0, 0), tickRight = new THREE.Vector3(0, 0, tickLength);
			
			for (let i = 2; i < count+ 1; i+=2) { // z-axis ticks
				let tickOrigin = gfx.movePoint(bottomLeft, new THREE.Vector3(0, 0, i*interval));
				gfx.drawLine(tickOrigin, tick);
				let label = (i).toString();
				let offset = new THREE.Vector3(-(interval/8)*(label.length+1) - 2, -1, 0);
				gfx.labelPoint(gfx.movePoint(tickOrigin, offset), label, settings.axes.color);
			}
			for (let i = 0; i < count+ 1; i+=2) { // x-axis ticks
				let tickOrigin = gfx.movePoint(nearestCorner, new THREE.Vector3(i*interval, 0, 0));
				gfx.drawLine(tickOrigin, tickRight);
				let label = (i).toString();
				let offset = new THREE.Vector3(0, -1, (interval/100)*(label.length) + 2);
				gfx.labelPoint(gfx.movePoint(tickOrigin, offset), label, settings.axes.color, new THREE.Vector3(0, 0, 0));
			}
			gfx.labelLarge(new THREE.Vector3(-size/2 - size/20, -size/20, -5), "z-axis", settings.axes.color, new THREE.Vector3(0, -Math.PI / 2, 0));
			gfx.labelLarge(new THREE.Vector3(-("x-axis".length/2 * size/40), -size/20, size/2 + size/20), "x-axis", settings.axes.color);
			
			return plane;
		},
		
		loadData: function() {
				
			let self = this;
			let dataset = pastData;
			
			let preparePast = function(d, i) {
				let row = {};
				row.year = d['Year'];
				row.amount = d['Global plastics production (million tons)'];
				return row;
			};
				
			d3.csv('./assets/data/global-plastics-production.csv', preparePast).then(function(data1) {
				pastData = data1;
				self.lineChart();
				let length = settings.gridSize;
				let size = settings.gridSize;
				let interval = length/settings.axes.count;
				let bottomLeft = new THREE.Vector3(-size/2, 0, -size/2), nearestCorner = new THREE.Vector3(-size/2, 0, size/2);
				let axisScaleLabelColor = 0xffffff;
				let count = settings.axes.count;
				let tickLength = settings.axes.tickLength;
				let tick = new THREE.Vector3(-tickLength, 0, 0), tickRight = new THREE.Vector3(0, 0, tickLength);
				let maxValue = d3.max(data1, function (d) { return +d.amount; });
				var yScale = d3.scaleLinear().domain([0, maxValue]).range([0, settings.gridSize]);
				
				let label = "production";
				let charWidth = size/50;
				gfx.labelLarge(new THREE.Vector3(-size/2 - (label.length * charWidth) - (maxValue.toString().length * charWidth) - 3, size/2, -size/2), label, 0xffffff);
				
				for (let i = 0; i < count+ 1; i+=2) { // y-axis ticks
					let tickOrigin = gfx.movePoint(bottomLeft, new THREE.Vector3(0, i*interval, 0));
					gfx.drawLine(tickOrigin, tick);
					let label = ((maxValue/20) * i);
					if (label > 1000000) label = label.toExponential();
					label = label.toString();
					let offset = new THREE.Vector3(-(interval/4)*(label.length+1) , -1, 0);
					gfx.labelPoint(gfx.movePoint(tickOrigin, offset), label, settings.axes.color);
				}
			});
		},
		
		lineChart: function() {
			
			let self = this;
			let dataset = pastData;
			let offset = settings.gridSize/2;
			var xScale = d3.scaleLinear().domain([1950, 2015]).range([-offset, settings.gridSize - offset]); 
			
			let maxValue = d3.max(dataset, function (d) { return +d.amount; });
			var yScale = d3.scaleLinear().domain([0, maxValue]).range([0, settings.gridSize]);
			
			let prevPoint = null;
			dataset.forEach(function(row, index) {
				let currentPoint = gfx.showPoint(new THREE.Vector3(xScale(row.year), yScale(row.amount), xScale(row.year)), red, 4, .5);
				if (prevPoint !== null) gfx.drawLineFromPoints(prevPoint, currentPoint, white, .75);
				prevPoint = currentPoint;
				
				gfx.drawLineFromPoints(new THREE.Vector3(currentPoint.x, 0, currentPoint.z), currentPoint, white, .15); // add pretty vertical lines
			});
		}
	}
}