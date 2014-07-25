(function ($) {

	var moduleCount,
		black = "#000000", 
		white = "#ffffff",
		rgbToHex = function(r, g, b) {
		    if (r > 255 || g > 255 || b > 255)
		        throw "Invalid color component";
		    return ((r << 16) | (g << 8) | b).toString(16);
		},
		canvasController = function(container){
			return {
				canvas 					: document.getElementById(container).children[0],
				canvasContainer 		: $( "#" + container + " > canvas" ),
				context 				: this.canvas.getContext('2d'),
				canvasModuleLength 		: this.canvas.width / moduleCount,
				containerModuleLength 	: this.canvasContainer.width() / moduleCount,
				ratio 					: this.canvasModuleLength / this.containerModuleLength,

				getMousePos 			: function (evt) {
											var rect = this.canvas.getBoundingClientRect();
											return {
												x: evt.clientX - rect.left,
												y: evt.clientY - rect.top
											};
										},

				invertColor 			: function (mouse) {
											// var context = canvas.getContext('2d');
											// var canvasModuleLength = canvas.width / moduleCount;
											// var containerModuleLength = canvasContainer.width() / moduleCount;
											var xIndex = Math.floor( mouse.x / this.containerModuleLength ),
												yIndex = Math.floor( mouse.y / this.containerModuleLength );

											// console.log( "moduleCount: " + moduleCount );
											// console.log( "canvas.width: " + canvas.width );
											// console.log( "container.width: " + canvasContainer.width() );
											// console.log( "canvasModuleLength: " + canvasModuleLength );
											// console.log( "containerModuleLength: " + containerModuleLength );
											// console.log( "Mouse: " + mouse.x + ", " + mouse.y );
											// console.log( "Index: " + xIndex + ", " + yIndex );

											var mouseData = this.context.getImageData( mouse.x * this.ratio, mouse.y * this.ratio, 1, 1).data; 
							    			var mouseHex = "#" + ("000000" + rgbToHex(mouseData[0], mouseData[1], mouseData[2])).slice(-6);
							    			// console.log( mouseHex );

											this.context.fillStyle = ( mouseHex == white ) ? black : white;
											this.context.fillRect( xIndex * this.canvasModuleLength, yIndex * this.canvasModuleLength, this.canvasModuleLength, this.canvasModuleLength );
										},

				reActivateCanvas 		: function(){
											this.canvas.addEventListener('mousedown', function(evt) {
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
			var modCanvas = canvasController('modifiable'),
				diffCanvas = canvasController('differences');
			console.log('ya');
		};

		reset();
		$("#updateQR").on("click", reset);
		
	});

}(jQuery));
