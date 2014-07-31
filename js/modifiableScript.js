// (function ($) {

	var moduleCount,
		black = "#000000", 
		white = "#ffffff",
		rgbToHex = function(r, g, b) {
		    if (r > 255 || g > 255 || b > 255)
		        throw "Invalid color component";
		    return ((r << 16) | (g << 8) | b).toString(16);
		};

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
		this.attackable = false;

		// Class Methods

		this.resetCanvas = function(container, options){
			this.canvas = document.getElementById(container).children[0];
			this.canvasContainer = $('#' + container + ' > canvas' );
			this.context = this.canvas.getContext('2d');
			this.resetResize( container );
			this.versionNumber = options.versionNumber;
			this.moduleCount = 21 + (this.versionNumber - 1) * 4;
			this.resetPermissibleArea( options );
			console.log( this );
		};

		this.resetCanvas = function(container){
			this.canvas = document.getElementById(container).children[0];
			this.canvasContainer = $('#' + container + ' > canvas' );
			this.context = this.canvas.getContext('2d');
			this.resetResize( container );
			this.moduleCount = 21 + (moduleCount - 1) * 4;
			this.versionNumber = (this.moduleCount - 21) / 8 + 1;
		};

		this.resetPermissibleArea = function( options ){
			console.log( options );
			this.attackable = options.isAttackable;
			this.permissibleArea = [];

			for( var x = 0; x < moduleCount; x++ ){
				this.permissibleArea[x] = [];
				for( var y = 0; y < moduleCount; y++ ){
					this.permissibleArea[x][y] = 0;

					// DATA
					if( options.dataT ){
						this.permissibleArea[x][y] = 4;
					}

					// TIMING
					if( ( x == 6 && ( y > 7 && y < this.moduleCount - 7 - 1) ) || 
						( y == 6  && ( x > 7 && x < this.moduleCount - 7 - 1) ) ){
						if( options.timing ){ this.permissibleArea[x][y] = 1; }
						else { this.permissibleArea[x][y] = 0; }
					}

					// SEPARATORS
					if( x == 7 && ( y <= 7 || y >= this.moduleCount - 7 - 1 ) ) {
						if( options.separators ){ this.permissibleArea[x][y] = 2; }
						else { this.permissibleArea[x][y] = 0; }
					}
					else if ( x == this.moduleCount - 7 - 1 && y <= 7 ){
						if( options.separators ){ this.permissibleArea[x][y] = 2; }
						else { this.permissibleArea[x][y] = 0; }
					}
					if( y == 7 && ( x <= 7 || x >= this.moduleCount - 7 - 1 ) ) {
						if( options.separators ){ this.permissibleArea[x][y] = 2; }
						else { this.permissibleArea[x][y] = 0; }
					}
					else if ( y == this.moduleCount - 7 - 1 && x <= 7 ){
						if( options.separators ){ this.permissibleArea[x][y] = 2; }
						else { this.permissibleArea[x][y] = 0; }
					}

					// FINDERS
					
					// x < 7: Top finders
					// y < 7: Only top left finder
					// y > this.moduleCount - 7 - 1 : Only top right finder
					if( x < 7 && ( y < 7 || y > this.moduleCount - 7 - 1 ) ){
						if( options.finder ){ this.permissibleArea[x][y] = 3; }
						else { this.permissibleArea[x][y] = 0; }
					}
					// x > this.moduleCount - 7 - 1: Bottom finder
					// y < 7: Only bottom left finder
					else if ( x > this.moduleCount - 7 - 1 && y < 7 ){
						if( options.finder ){ this.permissibleArea[x][y] = 3; }
						else { this.permissibleArea[x][y] = 0; }
					}

					// VERSION
					if ( options.versionNumber >= 7 ){
						// Top Right Version Info Area
						// y < 6: Length from timing pattern up
						// x < this.moduleCount - 7 - 1: Amount away from the right + 3 in width
						if( y < 6 && x < this.moduleCount - 7 - 1 && x > this.moduleCount - 7 - 1 - 4 ){
							if( options.versionT ){ this.permissibleArea[x][y] = 4; }
							else { this.permissibleArea[x][y] = 0; }
						}
						// Bottom Left Version Info Area
						// x < 6: Length from timing pattern left
						// y < this.moduleCount - 7 - 1: Amount away from the bottom + 3 in height
						else if( x < 6 && y < this.moduleCount - 7 - 1 && y > this.moduleCount - 7 - 1 - 4 ){
							if( options.versionT ){ this.permissibleArea[x][y] = 4; }
							else { this.permissibleArea[x][y] = 0; }
						}
					}

					// ALIGNMENT
					if( options.alignment && options.versionNumber > 1 ){

					}

				}
			}

		}

		this.logPermissibleArea = function(){
			var output = "";
			for( var x = 0; x < moduleCount; x++ ){
				for( var y = 0; y < moduleCount; y++ ){
					output += this.permissibleArea[x][y];
				}
				output += "\n";
			}
			console.log(output);
		};

		this.isAttackable = function( index ){
			if( this.permissibleArea[index.x][index.y] != 0 ) { return true; }
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
		this.getHexColorByIndex = function (index) {

			var multValue = this.ratio * this.containerModuleLength;
			var mouseData = this.context.getImageData( index.x * multValue + 5, index.y * multValue + 5, 1, 1 ).data; 
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
		this.clearIndex = function( index ){
			if( this.enableModification ) {

				this.context.clearRect( index.x * this.canvasModuleLength, index.y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
				
				if( this.hasGrid ) { this.showIndexGrid( index.x, index.y, this.defaultGridColor ); }
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
		this.changeColorByIndex = function (index, color) {
			if( this.enableModification ) {
				
				this.context.fillStyle = color;
				this.context.fillRect( index.x * this.canvasModuleLength, index.y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
			
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
			this.original.resetCanvas( original );
			this.modifiable.resetCanvas( modifiable );
			this.comparator.resetCanvas( comparator );
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
		this.compare = function(index){
			var originalColor = this.original.getHexColorByIndex( index );
			var modifiableColor = this.modifiable.getHexColorByIndex( index );

			// If no change is detected, as in if both colors are still the same, then that canvas index is cleared.
			if( originalColor == modifiableColor ){
				this.comparator.clearIndex( index );
				return originalColor;
			}
			// A change on the original QR code from white to black indicates a red color
			else if( originalColor == white && modifiableColor == black ){
				this.comparator.changeColorByIndex( index, '#FF0000' );
				return '#FF0000'
			}
			// A change on the original QR code from black to white indicates a yellow color
			else if( originalColor == black && modifiableColor == white ){
				this.comparator.changeColorByIndex( index, '#FFFF00' );
				return '#FFFF00';
			}

		};

		this.compareCanvases = function(){
			for( var x = 0; x < moduleCount; x++ ){
				for( var y = 0; y < moduleCount; y++ ){
					this.compare( {x:x, y:y} );
				}
			}
		};

		this.invert = function(index){
			if( this.modifiable.getHexColorByIndex(index) == white ){
				this.modifiable.changeColorByIndex( index, black );
			}
			else{
				this.modifiable.changeColorByIndex( index, white );
			}

			this.compare( index );

			return true;
		};

		this.targetColor = function( index, color ){
			if( this.modifiable.getHexColorByIndex(index) != color ){
				this.invert( index );
				return true;
			}

			return false;
		};

		this.deface = function(evt){

		};

	}

// }(jQuery));
