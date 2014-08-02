// (function ($) {

	var moduleCount,
		black = "#000000", 
		white = "#ffffff",
		rgbToHex = function(r, g, b) {
		    if (r > 255 || g > 255 || b > 255)
		        throw "Invalid color component";
		    return ((r << 16) | (g << 8) | b).toString(16);
		},
		alignmentTable = {
			1: [],
			2: [6, 18],
			3: [6, 22],
			4: [6, 26],
			5: [6, 30],
			6: [6, 34],
			7: [6, 22, 38],
			8: [6, 24, 42],
			9: [6, 26, 46],
			10: [6, 28, 50],
			11: [6, 30, 54],
			12: [6, 32, 58],
			13: [6, 34, 62],
			14: [6, 26, 46, 66],
			15: [6, 26, 48, 70],
			16: [6, 26, 50, 74],
			17: [6, 30, 54, 78],
			18: [6, 30, 56, 82],
			19: [6, 30, 58, 86],
			20: [6, 34, 62, 90],
			21: [6, 28, 50, 72, 94],
			22: [6, 26, 50, 74, 98],
			23: [6, 30, 54, 74, 102],
			24: [6, 28, 54, 80, 106],
			25: [6, 32, 58, 84, 110],
			26: [6, 30, 58, 86, 114],
			27: [6, 34, 62, 90, 118],
			28: [6, 26, 50, 74, 98, 122],
			29: [6, 30, 54, 78, 102, 126],
			30: [6, 26, 52, 78, 104, 130],
			31: [6, 30, 56, 82, 108, 134],
			32: [6, 34, 60, 86, 112, 138],
			33: [6, 30, 58, 86, 114, 142],
			34: [6, 34, 62, 90, 118, 146],
			35: [6, 30, 54, 78, 102, 126, 150],
			36: [6, 24, 50, 76, 102, 128, 154],
			37: [6, 28, 54, 80, 106, 132, 158],
			38: [6, 32, 58, 84, 110, 136, 162],
			39: [6, 26, 54, 82, 110, 138, 166],
			40: [6, 30, 58, 86, 114, 142, 170]
		}
		;

	function CanvasObject(container, enableModification) {

		// Class Variables

		this.canvas = document.getElementById(container).children[0];
		this.canvasContainer = $('#' + container + ' > canvas' );
		this.context = this.canvas.getContext('2d');
		this.canvasModuleLength = this.canvas.width / moduleCount;
		this.containerModuleLength = this.canvasContainer.width() / moduleCount;
		this.ratio = this.canvasModuleLength / this.containerModuleLength;
		this.enableModification = enableModification;
		this.hasGrid = true;
		this.defaultGridColor = black;
		this.permissibleArea = [];
		this.versionNumber = 0;
		this.moduleCount = 0;
		this.attackable = true;

		// Class Methods

		this.resetCanvas = function(container, options){
			this.canvas = document.getElementById(container).children[0];
			this.canvasContainer = $('#' + container + ' > canvas' );
			this.context = this.canvas.getContext('2d');
			this.resetResize( container );
			this.versionNumber = options.versionNumber;
			this.moduleCount = 21 + (this.versionNumber - 1) * 4;
			this.resetPermissibleArea( options );
			// console.log( options );
		};

		this.resetCanvasNoOptions = function(container){
			this.canvas = document.getElementById(container).children[0];
			this.canvasContainer = $('#' + container + ' > canvas' );
			this.context = this.canvas.getContext('2d');
			this.resetResize( container );
			this.moduleCount = 21 + (moduleCount - 1) * 4;
			this.versionNumber = (this.moduleCount - 21) / 8 + 1;
		};

		this.setPermission = function( x, y, check, value ){

			if( check) { this.permissibleArea[x][y] = value;  }
			else { this.permissibleArea[x][y] = 0; }
		};

		this.resetPermissibleArea = function( options ){
			this.permissibleArea = [];

			var indicies = alignmentTable[options.versionNumber];

			for( var x = 0; x < moduleCount; x++ ){
				this.permissibleArea[x] = [];
				for( var y = 0; y < moduleCount; y++ ){
					this.permissibleArea[x][y] = 0;
					// console.log( this.permissibleArea[x][y] );

					// DATA
					if( options.dataT ){
						console.log( options.dataT );
						this.permissibleArea[x][y] = 4;
					}

					// TIMING
					if( ( x == 6 && ( y > 7 && y < this.moduleCount - 7 - 1) ) || 
						( y == 6  && ( x > 7 && x < this.moduleCount - 7 - 1) ) ){
						this.setPermission( x, y, options.timing, 1);
					}

					// SEPARATORS
					if( x == 7 && ( y <= 7 || y >= this.moduleCount - 7 - 1 ) ) {
						this.setPermission( x, y, options.separators, 2);
					}
					else if ( x == this.moduleCount - 7 - 1 && y <= 7 ){
						this.setPermission( x, y, options.separators, 2);
					}
					if( y == 7 && ( x <= 7 || x >= this.moduleCount - 7 - 1 ) ) {
						this.setPermission( x, y, options.separators, 2);
					}
					else if ( y == this.moduleCount - 7 - 1 && x <= 7 ){
						this.setPermission( x, y, options.separators, 2);
					}

					// FINDERS
					
					// x < 7: Top finders
					// y < 7: Only top left finder
					// y > this.moduleCount - 7 - 1 : Only top right finder
					if( x < 7 && ( y < 7 || y > this.moduleCount - 7 - 1 ) ){
						this.setPermission( x, y, options.finder, 3);
					}
					// x > this.moduleCount - 7 - 1: Bottom finder
					// y < 7: Only bottom left finder
					else if ( x > this.moduleCount - 7 - 1 && y < 7 ){
						this.setPermission( x, y, options.finder, 3);
					}

					// VERSION
					if ( options.versionNumber >= 7 ){
						// Top Right Version Info Area
						// y < 6: Length from timing pattern up
						// x < this.moduleCount - 7 - 1: Amount away from the right + 3 in width
						if( y < 6 && x < this.moduleCount - 7 - 1 && x > this.moduleCount - 7 - 1 - 4 ){
							this.setPermission( x, y, options.versionT, 3);
						}
						// Bottom Left Version Info Area
						// x < 6: Length from timing pattern left
						// y < this.moduleCount - 7 - 1: Amount away from the bottom + 3 in height
						else if( x < 6 && y < this.moduleCount - 7 - 1 && y > this.moduleCount - 7 - 1 - 4 ){
							this.setPermission( x, y, options.versionT, 3);
						}
					}

				}
			
			}

			var draw = true;
			// ALIGNMENT
			if( options.versionNumber > 1 ){
				for( var i = 0; i < indicies.length; i++ ){
					for( var j = 0; j < indicies.length; j++ ){
						var x1 = indicies[i];
						var y1 = indicies[j];
						// Left
						
						draw = true; 

						if( x1 <= 7 ){
							if ( y1 <= 7 ){
								draw = false;
							}
							if (  y1 >= this.moduleCount - 7 - 1 ){
								draw = false;
							}
						}
						// Top
						if( x1 >= this.moduleCount - 7 - 1 &&  y1 <= 7 ){
							draw = false;
						}
						
						console.log( "x, y: " + x1 + ", " + y1 + "(" + draw + ")");

						if( draw ){
							var a = x1, b = y1;
							// console.log( "i, j: " + i + ", " + j );
							this.setPermission( a-1, b-1, options.alignment, 6);
							this.setPermission( a-1, b, options.alignment, 6);
							this.setPermission( a-1, b+1, options.alignment, 6);
							this.setPermission( a, b-1, options.alignment, 6);
							this.setPermission( a, b, options.alignment, 6);
							this.setPermission( a, b+1, options.alignment, 6);
							this.setPermission( a+1, b-1, options.alignment, 6);
							this.setPermission( a+1, b, options.alignment, 6);
							this.setPermission( a+1, b+1, options.alignment, 6);
						}
					}
				}
			}

			this.attackable = this.logPermissibleArea();

		};

		this.updatePermissibleAreaByColor = function( color ){
			if( !this.attackable ){ return; }

			for( var x = 0; x < moduleCount; x++ ){
				for( var y = 0; y < moduleCount; y++ ){

					if( this.getHexColorByIndex( {x:x, y:y} ) != color ) { 
						this.permissibleArea[x][y] = 0;
					}

				}
			}

			this.attackable = this.logPermissibleArea();

		};

		this.logPermissibleArea = function( ){

			// if( !this.attackable ) { return false; }

			for( var x = 0; x < moduleCount; x++ ){
				for( var y = 0; y < moduleCount; y++ ){

					if( this.permissibleArea[x][y] != 0) { return true; }

				}
			}

			return false;
		};

		this.viewPermissibleArea = function(){
			var output = "";
			for( var x = 0; x < moduleCount; x++ ){
				for( var y = 0; y < moduleCount; y++ ){

					output += this.permissibleArea[x][y];

				}
				output += "\n";
			}
			console.log( output );
		};

		this.isAttackable = function( x, y ){
			if( !this.attackable ) { return false; }
			if( this.permissibleArea[x][y] != 0 ) { return true; }
			else{ return false; }
		};

		this.resetResize =  function(container){
			this.canvasModuleLength = this.canvas.width / moduleCount;
			this.containerModuleLength = this.canvasContainer.width() / moduleCount;
			this.ratio = this.canvasModuleLength / this.containerModuleLength;
		};

		// Get the position of the mouse relative to the container
		this.getMousePos = function (evt) {
			var rect = this.canvas.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		};

		// Get the position of the mouse relative to the canvas
		this.getMouseRatio = function (evt) {
			var rect = this.canvas.getBoundingClientRect();
			return {
				x: (evt.clientX - rect.left) / this.canvas.width,
				y: (evt.clientY - rect.top) / this.canvas.width
			};
		};

		// Get the index of the mouse's location relative to the canvas
		this.getCanvasIndex = function (mouse) {
			return {
				x: Math.floor( mouse.x / this.containerModuleLength ),
				y: Math.floor( mouse.y / this.containerModuleLength )
			};
		};

		// Get the hexcolor of the pixel module of the provided mouse coordinates
		this.getHexColorByMouse = function (mouse) {

			var mouseData = this.context.getImageData( mouse.x * ratio, mouse.y * ratio, 1, 1).data; 
			return ( "#" + ("000000" + rgbToHex( mouseData[0], mouseData[1], mouseData[2]) ).slice( -6 ) );

		}

		// Get the hexcolor of the pixel module of the specified index
		this.getHexColorByIndex = function (x, y) {

			var multValue = this.ratio * this.containerModuleLength;
			var mouseData = this.context.getImageData( x * multValue + 5, y * multValue + 5, 1, 1 ).data; 
			return ( "#" + ("000000" + rgbToHex( mouseData[0], mouseData[1], mouseData[2]) ).slice( -6 ) );

		};

		// Clears the entire canvas, if this canvas can be modified
		this.clearCanvas = function(){
			if( this.enableModification ) {

				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

				if( this.hasGrid ){ this.showCanvasGrid( this.defaultGridColor ); }
			}
		};

		// Clears this specfic index's pixel module, if this canvas can be modified
		this.clearIndex = function( x, y ){
			if( this.enableModification ) {

				this.context.clearRect( x * this.canvasModuleLength, y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
				
				if( this.hasGrid ) { this.showIndexGrid( x, y, this.defaultGridColor ); }
			}
		};

		// Create the grid for this specified index
		this.showIndexGrid = function( x, y, color ){

			this.context.strokeStyle = color;
			this.context.strokeRect( x * this.canvasModuleLength, y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength  );
		
		};

		this.showCanvasGrid = function( color ){
			if( this.hasGrid ){
				for (var y = 0; y < moduleCount; y++) {
					for (var x = 0; x < moduleCount; x++) {
						this.showIndexGrid( x, y, color );
					}
				}
			}
		};

		// Change the color of the pixel module the provided mouse coordinates are over
		this.changeColorByMouse = function (mouse, color) {

			if( this.enableModification ) {
				var index = getCanvasIndex( mouse );
				this.context.fillStyle = color;
				this.context.fillRect( index.x * this.canvasModuleLength, index.y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
			
			}
			else {
				throw "You've no permission to invert the color of this canvas";
			}
		};

		// Change the color of the provided index's pixel module 
		this.changeColorByIndex = function (x, y, color) {
			if( this.enableModification ) {
				
				this.context.fillStyle = color;
				this.context.fillRect( x * this.canvasModuleLength, y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
			
			}
			else {
				throw "You've no permission to invert the color of this canvas";
			}
		};

		this.drawMouse = function( mouse, color, brushDiameter ){
			if( this.enableModification ) {

				this.context.beginPath();
				this.context.moveTo(mouse.x * this.ratio, mouse.y * this.ratio);
				this.context.arc( mouse.x * this.ratio, mouse.y * this.ratio, brushDiameter * this.ratio / 2, 0, 2 * Math.PI);
				this.context.fillStyle = color;
				this.context.fill();
				
			}
			else {
				throw 'You have no permission to draw.';
			}
		};

	};

	function CanvasController( original, modifiable, comparator ){

		// Class Variables
		this.original = new CanvasObject(original, false);
		this.modifiable = new CanvasObject(modifiable, true);
		this.comparator = new CanvasObject(comparator, true);

		// Class Methods

		// Resets the CanvasObjects
		this.resetController = function( original, modifiable, comparator ){
			this.original.resetCanvas( original.id, original.options );
			this.modifiable.resetCanvas( modifiable.id, modifiable.options );
			this.comparator.resetCanvas( comparator.id, comparator.options );
		};

		this.resetControllerNoOption = function( original, modifiable, comparator ){
			this.original.resetCanvasNoOptions( original );
			this.modifiable.resetCanvasNoOptions( modifiable );
			this.comparator.resetCanvasNoOptions( comparator );
		};

		this.resetResize =  function(container){
			this.original.resetResize( original );
			this.modifiable.resetResize( modifiable );
			this.comparator.resetResize( comparator );
		};

		// this.logCanvases = function(){
		// 	// console.log( 'Original' );
		// 	// this.original.logPermissibleArea();	
		// 	// console.log( 'Modifiable' );
		// 	this.modifiable.logPermissibleArea();	
		// 	// console.log( 'Comparator' );
		// 	// this.comparator.logPermissibleArea();			
		// }

		// this.resetPermissibleAreas = function( options ){
		// 	this.modifiable.resetPermissibleArea( options );	
		// 	this.logCanvases();		
		// }

		// Compares the color of the modified QR code and the original QR code based on index count
		// This implies that the original and the modifiable must have the same module count
		this.compare = function(x, y){
			var originalColor = this.original.getHexColorByIndex( x, y );
			var modifiableColor = this.modifiable.getHexColorByIndex( x, y );

			// If no change is detected, as in if both colors are still the same, then that canvas index is cleared.
			if( originalColor == modifiableColor ){
				this.comparator.clearIndex( x, y );
				return originalColor;
			}
			// A change on the original QR code from white to black indicates a red color
			else if( originalColor == white && modifiableColor == black ){
				this.comparator.changeColorByIndex( x, y, '#FF0000' );
				return '#FF0000'
			}
			// A change on the original QR code from black to white indicates a yellow color
			else if( originalColor == black && modifiableColor == white ){
				this.comparator.changeColorByIndex( x, y, '#FFFF00' );
				return '#FFFF00';
			}

		};

		this.compareCanvases = function(){
			for( var x = 0; x < moduleCount; x++ ){
				for( var y = 0; y < moduleCount; y++ ){
					this.compare( x, y );
				}
			}
		};

		this.invert = function(x, y){
			if( !this.modifiable.attackable ) { return; }
			if( this.modifiable.getHexColorByIndex(x, y) == white ){
				this.modifiable.changeColorByIndex( x, y, black );
			}
			else{
				this.modifiable.changeColorByIndex( x, y, white );
			}

			this.compare( x, y);

			// this.modifiable.permissibleArea[index.x][index.y] = 0;
			this.modifiable.attackable = this.modifiable.logPermissibleArea();

			return true;
		};

		this.targetColor = function( x, y, color ){
			if( this.modifiable.getHexColorByIndex(x, y) == color ){
				return true;
			}

			return false;
		};

	}

// }(jQuery));
