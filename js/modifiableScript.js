(function ($) {

	var moduleCount,
		black = "#000000", 
		white = "#ffffff",
		rgbToHex = function(r, g, b) {
		    if (r > 255 || g > 255 || b > 255)
		        throw "Invalid color component";
		    return ((r << 16) | (g << 8) | b).toString(16);
		};
	function CanvasObject (canvas, container){
			return {
				context 				: canvas.getContext('2d'),
				canvasModuleLength 		: canvas.width / moduleCount,
				containerModuleLength 	: container.width() / moduleCount,
				// ratio 				: this.canvasModuleLength / this.containerModuleLength,
				getMousePos 			: function (evt) {
											var rect = canvas.getBoundingClientRect();
											return {
												x: evt.clientX - rect.left,
												y: evt.clientY - rect.top
											};
										},

				invertColor 			: function (mouse) {
											
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
										},

				reActivateCanvas 		: function(){
											canvas.addEventListener('mousedown', function(evt) {
												var mousePos = this.getMousePos(evt);
												this.invertColor( mousePos );
											}, false);
										}
			};
		};

	$(function () {
		var reset = function(){
			// Recall: Version 1 has 21 modules. Each higher version number comprises 4 additional modules per side
			moduleCount = 21 + (parseInt($("#finalVer").text()) - 1) * 4;
			var canvas = document.getElementById('modifiable').children[0];
			var modCanvas = CanvasObject(canvas, $('#modifiable > canvas' ));
			console.log(modCanvas);
			canvas.addEventListener('mousedown', function(evt) {
												var mousePos = modCanvas.getMousePos(evt);
												modCanvas.invertColor( mousePos );
											}, false);
		};

		reset();
		$("#updateQR").on("click", reset);
		
	});

}(jQuery));
