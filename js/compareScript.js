(function ($) {
	
	var updateQRCode = function(container, text, minVer ) {
			var options = {
				ecLevel: $("#eclevel").val(),
				minVersion: minVer,
				text: text,
				background: white,
				color: black,
				size: $(container).width()
			};
			console.log( container );
			$(container).empty().qrcode( options );
		},

		resizeAllQRs = function(){

			if( $( window ).width() >= 768 ){
				$( "canvas" ).each( function( index ) {

					var size = Math.min( 200, $(this).parent().width() );
					$(this).width( size );
					$(this).height( size );

				});

				var size = Math.min( $( "#differences" ).width(), 
							( $(window).height() 
								- $(".col-sm-6 > .panel-group").height()
								- $(".panel-heading").height() 
								- parseInt($( ".panel-body" ).css("padding"))*4 
							) 
						);

				$( "#differences > canvas" ).width( size );
				$( "#differences > canvas" ).height( size );
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

		updateAllQRs = function( minVer ){
			updateQRCode( "#original", $("#text").val(), minVer );
			updateQRCode( "#targetted", $("#desired").val(), minVer);
			updateQRCode( "#differences", $("#text").val(), minVer );

			resizeAllQRs();

		},

		// toggleTop = function(){
		// 	$("#toggleTop").toggleClass("active");

		// 	$( ".topQR" ).each( function( index ) {
		// 		( $( "#toggleTop" ).hasClass("active") ) ? $(this).collapse('show') : $(this).collapse('hide');
		// 	});
		// },

		decodeQR = function( container, textID ){
			// if( $("#text").val().replace(/ /g,'') == '' ){ 
			// 	throw "Cannot decode empty string (even if with whitespace)."; 

			// }
			// else{
				var canvas = document.getElementById( container ).children[0];
				var dataURL = canvas.toDataURL();
				canvas.src = dataURL;

				qrcode.callback = function( data ) { 
					$('#' + container + 'Ver').text( $("#decodedVer").text() );
					$('#' + container + 'EC').text( $("#decodedEC").text() );
					// alert( 'Success! View "Decoded Content" for results!' );
				};

				qrcode.decode(canvas);
			// }

			// return $('#decoded').val( );
		}
		;

	window.onerror = function errorHandler(msg, url, line) {
		// $('#decoded').val( 'ERR: ' + msg);
		window.clearTimeout();
		// Just let default handler run.
		return false;
	};
		
	$(function () {

		// First, initialize the QR codes.
		updateAllQRs( parseInt($("#minversion").val() ) );
		
		// Create the controller, which needs to be done only once when the page loads
		var controller = new CanvasController( 'original', 'differences', 'targetted' );

		// Function Definitions

		var reset = function(){

			updateAllQRs( parseInt($("#minversion").val() ) );
			$('#attackLog').empty();

			decodeQR( 'original' );
			decodeQR( 'targetted' );
			
			$("#decodedVer").text( ( parseInt( $("#originalVer").text() ) > parseInt( $("#targettedVer").text() ) ) ? parseInt( $("#originalVer").text() ) : parseInt( $("#targettedVer").text() ) );
			// $("#decodedEC").text( ecLevel.name );

			updateAllQRs( parseInt( $("#decodedVer").text() ) );

			moduleCount = 21 + (parseInt($("#decodedVer").text()) - 1) * 4;

			controller.resetControllerNoOption( 'original', 'targetted', 'differences' );

			controller.comparator.clearCanvas();
			controller.comparator.showCanvasGrid('#000000');
			controller.compareCanvases();

		};

		var recordIndex = function( x, y ){
			$('#attackLog').text( $('#attackLog').text() + "[" + x + ", " + y + "] " );
		};
		
		$(window).resize(function() {
			resizeAllQRs();
			controller.resetResize( 'original', 'modifiable', 'differences' );
			$("#brushSize").val( controller.modifiable.containerModuleLength );
			$("#brush").text( $("#brushSize").val() );
		});

		// Input Triggers 
		$("#text").on("input change", reset );
		$("#desired").on("input change", reset );

		$("#minversion").on("input change", function(){
			updateAllQRs();
		});

		reset();

	});

}(jQuery));
