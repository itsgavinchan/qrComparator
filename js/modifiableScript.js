(function ($) {

	// Recall: Version 1 has 21 modules. Each higher version number comprises 4 additional modules per side.	
	var moduleCount;

	$(function () {

		var writeMessage = function (canvas, container, mouseX, mouseY) {
				var context = canvas.getContext('2d');
				var canvasModuleLength = canvas.width / moduleCount;
				var containerModuleLength = container.width() / moduleCount;
				var xIndex = Math.floor( mouseX  / containerModuleLength ),
					yIndex = Math.floor( mouseY  / containerModuleLength );

				console.log( "canvas.width: " + canvas.width );
				// console.log( "container.width: " + container.css("width") );
				console.log( "canvasModuleLength: " + canvasModuleLength );
				console.log( "Mouse: " + mouseX + ", " + mouseY );
				console.log( "Index: " + xIndex + ", " + yIndex );

				// context.clearRect(0, 0, canvas.width, canvas.height);
				// for (var y = 0; y < moduleCount; y++) {
				// 	for (var x = 0; x < moduleCount; x++) {
				// 		context.strokeRect( x*canvasModuleLength , y*canvasModuleLength, canvasModuleLength, canvasModuleLength);
				// 	};
				// };

				context.fillStyle = "#FF0000";
				context.fillRect( xIndex * canvasModuleLength, yIndex * canvasModuleLength, canvasModuleLength, canvasModuleLength );
			},

			getMousePos = function (canvas, evt) {
				var rect = canvas.getBoundingClientRect();
				return {
					x: evt.clientX - rect.left + 0.484375,
					y: evt.clientY - rect.top
				};
			},
			reActivateCanvas = function(){
				moduleCount = 21 + (parseInt($("#finalVer").text()) - 1)*4;

				var canvas = document.getElementById('modifiable').children[0];
				var container = $("#modifiable > canvas");
				var context = canvas.getContext('2d');

				canvas.addEventListener('click', function(evt) {
					var mousePos = getMousePos(canvas, evt);
					var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
					writeMessage(canvas, container, mousePos.x, mousePos.y );
				}, false);
			}
		;

		reActivateCanvas();
		$("#updateQR").on("click", reActivateCanvas);
		
	});

}(jQuery));
