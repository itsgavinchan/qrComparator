(function ($) {

	var moduleCount,
		black = "#000000", 
		white = "#ffffff",
		rgbToHex = function(r, g, b) {
		    if (r > 255 || g > 255 || b > 255)
		        throw "Invalid color component";
		    return ((r << 16) | (g << 8) | b).toString(16);
		};


	function CanvasObject (container){
				this.canvas = document.getElementById(container).children[0];
				this.canvasContainer = $('#' + container + ' > canvas' );
				this.context = this.canvas.getContext('2d');
				this.canvasModuleLength = this.canvas.width / moduleCount;
				this.containerModuleLength = this.canvasContainer.width() / moduleCount;
				// ratio 				: this.canvasModuleLength / this.containerModuleLength,
				this.getMousePos = function (evt) {
											var rect = this.canvas.getBoundingClientRect();
											return {
												x: evt.clientX - rect.left,
												y: evt.clientY - rect.top
											};
										};

				this.invertColor = function (mouse) {
											
											var ratio = this.canvasModuleLength / this.containerModuleLength;

											var index = {
												x: Math.floor( mouse.x / this.containerModuleLength ),
												y: Math.floor( mouse.y / this.containerModuleLength )
											};

											var mouseData = this.context.getImageData( mouse.x * ratio, mouse.y * ratio, 1, 1).data; 
							    			var mouseHex = "#" + ("000000" + rgbToHex(mouseData[0], mouseData[1], mouseData[2])).slice(-6);
							    			// console.log( mouseHex );

											this.context.fillStyle = ( mouseHex == white ) ? black : white;
											this.context.fillRect( index.x * this.canvasModuleLength, index.y * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
										};

				this.reActivateCanvas = function(evt){
												var mousePos = this.getMousePos(evt);
												this.invertColor( mousePos );
										};
			
		};


	$(function () {
		var reset = function(){
			// Recall: Version 1 has 21 modules. Each higher version number comprises 4 additional modules per side
			moduleCount = 21 + (parseInt($("#finalVer").text()) - 1) * 4;

			var modCanvas = new CanvasObject('modifiable');

			modCanvas.canvas.addEventListener('mousedown', function(evt) {
				modCanvas.reActivateCanvas(evt);
			}, false);
		};

		reset();
		$("#updateQR").on("click", reset);
		
	});

}(jQuery));
