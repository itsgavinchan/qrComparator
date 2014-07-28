(function ($) {

	window.onerror = function errorHandler(msg, url, line) {

		alert( 'Decoding the QR code failed. Error: ' + msg);

		// Just let default handler run.
		return false;
	};
	
	var updateQRCode = function(container) {
			var options = {
				ecLevel: $("#eclevel").val(),
				minVersion: parseInt($("#minversion").val(), 10),
				text: $("#text").val(),
				background: '#FFFFFF',
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
					alert( 'Success! View "Decoded Content" for results!' );
				};

				qrcode.decode(canvas);
			}
		},

		reset = function(){

			// Recall: Version 1 has 21 modules. Each higher version number comprises 4 additional modules per side
			moduleCount = 21 + (parseInt($("#finalVer").text()) - 1) * 4;

			// Create the controller, which needs to be done at each new QR code generated
			var controller = new CanvasController( 'original', 'modifiable', 'differences' );

			// Clear the comparator canvas because it's to show differences between two QR codes
			controller.comparator.clearCanvas();
			controller.comparator.showCanvasGrid('#000000');

			// Have a listener for the modifiable canvas in the case of the bruteforce, manual technique
			controller.modifiable.canvas.addEventListener('mousedown', function(evt) {

				var index = controller.modifiable.getCanvasIndex( controller.modifiable.getMousePos( evt ) );
				console.log( controller.modifiable.getHexColorByIndex(index) );
				
				if( controller.modifiable.getHexColorByIndex(index) == white ){
					controller.modifiable.changeColorByIndex( index, black );
				}
				else{
					controller.modifiable.changeColorByIndex( index, white );
				}
				
				controller.compare( index );

			}, false);

			$("#showGrid").on("input change", function(){
				controller.comparator.hasGrid = $('#showGrid').prop('checked');
				controller.comparator.clearCanvas();
			});
		};

	$(function () {

		updateAllQRs();

		reset();
		$("#updateQR").on("click", function(){ updateAllQRs(); reset(); } );
		
		$("#toggleTop").on("click", toggleTop );
		$("#decodeQR").on("click", decodeQR );

		$("#text").on("input change", function(){
			console.log($("#textChar").text());
		});

		$("#minversion").on("input change", function(){
			$("#minVer").text( $("#minversion").val() );
		});

	});

	
	$(window).resize(function() {
		resizeAllQRs();
	});
}(jQuery));
