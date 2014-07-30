(function ($) {

	window.onerror = function errorHandler(msg, url, line) {

		$('#decoded').val( 'ERR: Decoding the QR code failed. ' + msg);
		window.clearTimeout();
		// Just let default handler run.
		return false;
	};
	
	var updateQRCode = function(container) {
			var options = {
				ecLevel: $("#eclevel").val(),
				minVersion: parseInt($("#minversion").val(), 10),
				text: $("#text").val(),
				background: white,
				color: black,
				size: $(container).width()
			};

			$(container).empty().qrcode( options );
		},

		resizeAllQRs = function(){

			if( $( window ).width() >= 768 ){
				$( "canvas" ).each( function( index ) {

					var size = Math.min( 300, $(this).parent().width() );
					$(this).width( size );
					$(this).height( size );

				});

				var size = Math.min( $( "#modifiable" ).width(), 
							( $(window).height() 
								- $(".col-sm-6 > .panel-group").height()
								- $(".panel-heading").height() 
								- parseInt($( ".panel-body" ).css("padding"))*4 
							) 
						);

				$( "#modifiable > canvas" ).width( size );
				$( "#modifiable > canvas" ).height( size );
			}
			else{
				$( "canvas" ).each( function( index ) {

					var size = $(this).parent().parent().width()
						- parseInt($( ".panel-body" ).css("padding"))*4;
					$(this).width( size );
					$(this).height( size );

				});
			}

		},

		updateAllQRs = function(){
			updateQRCode( "#original" );
			updateQRCode( "#differences" );
			updateQRCode( "#modifiable" );

			resizeAllQRs();

		},

		toggleTop = function(){
			$("#toggleTop").toggleClass("active");

			$( ".topQR" ).each( function( index ) {
				( $( "#toggleTop" ).hasClass("active") ) ? $(this).collapse('show') : $(this).collapse('hide');
			});
		},

		decodeQR = function(){
			if( $("#text").val().replace(/ /g,'') == '' ){ 
				alert("Cannot decode empty string (even if with whitespace)."); 

			}
			else{
				var canvas = document.getElementById('modifiable').children[0];
				var dataURL = canvas.toDataURL();
				canvas.src = dataURL;

				qrcode.callback = function( data ) { 
					$('#decoded').val( data );
					// alert( 'Success! View "Decoded Content" for results!' );
				};

				qrcode.decode(canvas);
			}

			return $('#decoded').val( );
		};

		
	$(function () {

		updateAllQRs();
		window.clearTimeout();
		
		// Create the controller, which needs to be done only once when the page loads
		var controller = new CanvasController( 'original', 'modifiable', 'differences' );
		
		var reset = function(){

			updateAllQRs();
			window.clearTimeout();

			$('#decoded').val( '' );
			$('#attackLog').empty();

			// Recall: Version 1 has 21 modules. Each higher version number comprises 4 additional modules per side
			moduleCount = 21 + (parseInt($("#finalVer").text()) - 1) * 4;

			// To avoid lag and the over-creation of objects, the controller is reset instead to simply replace the 
			// the objects that need to be reset. 
			controller.resetController( 'original', 'modifiable', 'differences' );

			$("#brushSize").val( Math.floor( controller.modifiable.containerModuleLength ) );
			$("#brush").text( $("#brushSize").val() );

			// Clear the comparator canvas because it's to show differences between two QR codes
			controller.comparator.clearCanvas();
			controller.comparator.showCanvasGrid('#000000');

			$('#decoded').val( '' );

		};

		reset();

		var action = $('#attackMode').val();

		var invertAttack = function( ){
			var index = { 
				x: Math.floor( ( Math.random() * moduleCount ) ), 
				y: Math.floor( ( Math.random() * moduleCount ) )
			};

			controller.invert( index );

			recordIndex( index.x, index.y );

			decodeQR();

			// See the global error catcher at the top of this file
			setTimeout(invertAttack, parseInt( $('#timing').val() ) );

		};

		var colorAttack = function( color ){
			var index = { 
				x: Math.floor( ( Math.random() * moduleCount ) ), 
				y: Math.floor( ( Math.random() * moduleCount ) )
			};

			while ( !controller.targetColor( index, color ) ){
				index = { 
					x: Math.floor( ( Math.random() * moduleCount ) ), 
					y: Math.floor( ( Math.random() * moduleCount ) )
				};
			}

			recordIndex( index.x, index.y );

			decodeQR();

			// See the global error catcher at the top of this file
			setTimeout(colorAttack, parseInt( $('#timing').val() ), color);

		};

		var recordIndex = function( x, y ){
			$('#attackLog').text( $('#attackLog').text() + "[" + x + ", " + y + "] " );
		};

		$("#simulate").on("click", function(){

			action = $('#attackMode').val();

			switch( action ) {
				case 'manual':
					// Have a listener for the modifiable canvas in the case of the bruteforce, manual technique
						controller.modifiable.canvas.addEventListener('mousedown', function(evt) {
							if( action == 'manual' ){
								var index = controller.modifiable.getCanvasIndex( controller.modifiable.getMousePos( evt ) );
								recordIndex( index.x, index.y );
								controller.invert( index );
							}
						}, false);

					break;
				case 'deface':

						controller.modifiable.canvas.addEventListener('mousedown', function(evt) {
							if( action == 'deface' ){
								var mouse = controller.modifiable.getMousePos( evt );
								controller.modifiable.drawMouse(mouse, $('#color').val(), $('#brushSize').val() );
							}
						}, false);

					break;
				case 'invert':

					invertAttack();

					break;
				case 'color':

					colorAttack( $('#color').val() );

					break;
				default:
					throw 'Not a Simulation Option';
					break;
			}
		});

		$("#updateQR").on("click", reset );
		
		$("#toggleTop").on("click", toggleTop );
		$("#decodeQR").on("click", decodeQR );

		$("#text").on("input change", function(){
			console.log($("#textChar").text());
		});

		$("#minversion").on("input change", function(){
			$("#minVer").text( $("#minversion").val() );
		});

		$("#brushSize").on("input change", function(){
			$("#brush").text( $("#brushSize").val() );
		});

		$(window).resize(function() {
			resizeAllQRs();
			controller.resetResize( 'original', 'modifiable', 'differences' );
			$("#brushSize").val( controller.modifiable.containerModuleLength );
			$("#brush").text( $("#brushSize").val() );
		});

	});

}(jQuery));
