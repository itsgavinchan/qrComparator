clearTimeout(function ($) {
	
	var options = {
			versionNumber: parseInt( $('#minVer').text() ),
			finder: $('#targetFinder').prop( 'checked' ),
			separators: $('#targetSeparators').prop( 'checked' ),
			alignment: $('#targetAlignment').prop( 'checked' ),
			timing: $('#targetTiming').prop( 'checked' ),
			versionT: $('#targetVersion').prop( 'checked' ),
			dataT: $('#targetData').prop( 'checked' ),
			isAttackable: false
		},

		updateQRCode = function(container) {
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

					var size = Math.min( 200, $(this).parent().width() );
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
				throw "Cannot decode empty string (even if with whitespace)."; 

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
		}
		;

	window.onerror = function errorHandler(msg, url, line) {
		$('#decoded').val( 'ERR: ' + msg);
		window.clearTimeout();
		// Just let default handler run.
		return false;
	};
		
	$(function () {

		// First, initialize the QR codes.
		updateAllQRs();
		
		// Create the controller, which needs to be done only once when the page loads
		var controller = new CanvasController( 'original', 'modifiable', 'differences' );

		// Function Definitions
		var updateOptions = function(){
			options.versionNumber = parseInt( $('#minVer').text() );
			options.finder = $('#targetFinder').prop( 'checked' );
			options.separators = $('#targetSeparators').prop( 'checked' );
			options.alignment = $('#targetAlignment').prop( 'checked' );
			options.timing = $('#targetTiming').prop( 'checked' );
			options.versionT = $('#targetVersion').prop( 'checked' );
			options.dataT = $('#targetData').prop( 'checked' );

			if(  options.finder || options.separators 
				|| (options.alignment && options.versionNumber > 1) 
				|| options.timing || options.dataT 
				|| (options.versionT && options.versionNumber > 6) ){
				options.isAttackable = true;
			}
			else { options.isAttackable = false; } 

			// console.log( options );
			controller.modifiable.resetPermissibleArea( options );
			controller.modifiable.logPermissibleArea();
		};

		var reset = function(){

			updateAllQRs();
			updateOptions();
			window.clearTimeout();

			$('#decoded').val( '' );
			$('#attackLog').empty();

			// Recall: Version 1 has 21 modules. Each higher version number comprises 4 additional modules per side
			moduleCount = 21 + (parseInt($("#finalVer").text()) - 1) * 4;

			// To avoid lag and the over-creation of objects, the controller is reset instead to simply replace the 
			// the objects that need to be reset. 
			controller.resetController( 
				{ id: 'original', options: options }, 
				{ id: 'modifiable', options: options }, 
				{ id: 'differences', options: options }
			);

			updateOptions();

			$("#brushSize").val( Math.floor( controller.modifiable.containerModuleLength ) );
			$("#brush").text( $("#brushSize").val() );

			// Clear the comparator canvas because it's to show differences between two QR codes
			controller.comparator.clearCanvas();
			controller.comparator.showCanvasGrid('#000000');

			decodeQR();

		};

		var invertAttack = function( ){
			var index = { 
				x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
				y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
			};

			while ( !controller.modifiable.isAttackable( index ) ){
				index = { 
					x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
					y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
				};
			}

			controller.invert( index );

			recordIndex( index.x, index.y );

			decodeQR();

			// See the global error catcher at the top of this file
			setTimeout(invertAttack, parseInt( $('#timing').val() ) );

		};

		var colorAttack = function( color ){

			var index = { 
				x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
				y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
			};

			while ( !controller.targetColor( index, color ) && !controller.modifiable.isAttackable( index ) ){
				index = { 
					x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
					y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
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
		
		$(window).resize(function() {
			resizeAllQRs();
			controller.resetResize( 'original', 'modifiable', 'differences' );
			$("#brushSize").val( controller.modifiable.containerModuleLength );
			$("#brush").text( $("#brushSize").val() );
		});

		// Button Triggers

		$("#updateQR").on("click", reset );
		$("#toggleTop").on("click", toggleTop );
		$("#decodeQR").on("click", decodeQR );

		$("#simulate").on("click", function(){
			window.clearTimeout(); 
			action = $('#attackMode').val(); 

			if ( !controller.modifiable.attackable && action != 'deface' ){ 
				var err = "There are no valid target areas to attack."; 
				alert( err + "Please choose a target area. Remember that an alignment pattern doesn't exist in Version 1 QR codes and version data only exists in QR codes of Version 7 or higher. ");
				throw err;
			}

			switch( action ) {
				case 'manual':

					controller.modifiable.canvas.onmousedown = function(evt) {
			            if( action == 'manual' ){6
							var index = controller.modifiable.getCanvasIndex( controller.modifiable.getMousePos( evt ) );
							if ( controller.modifiable.isAttackable( index ) ){
								recordIndex( index.x, index.y );
								controller.invert( index );
							}
						}
			        };

					break;
				case 'deface':

						controller.modifiable.canvas.onmousemove = function(evt) {
				            if (!controller.modifiable.canvas.isDrawing) {
				               return;
				            }
				            if( action == 'deface' ){
					            mouse = controller.modifiable.getMousePos( evt );
					            controller.modifiable.drawMouse( mouse, $('#color').val(), $('#brushSize').val() );
				            }
				        };

				        controller.modifiable.canvas.onmousedown = function(evt) {
				            controller.modifiable.canvas.isDrawing = true;
				        };

				        controller.modifiable.canvas.onmouseup = function(evt) {
				            controller.modifiable.canvas.isDrawing = false;
				        };

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

		// Input Triggers 
		$("#text").on("input change", function(){
			console.log($("#textChar").text());
		});

		$("#minversion").on("input change", function(){
			$("#minVer").text( $("#minversion").val() );
		});

		$("#brushSize").on("input change", function(){
			$("#brush").text( $("#brushSize").val() );
		});

		$(".target").on("input change", updateOptions );

		$("#attackMode").on("input change", function(){
			switch( $("#attackMode").val() ){
				case 'manual':
					$('#log').show();
					$('#target').show();
					break;
				case 'deface':
					$('#log').hide();
					$('#target').hide();
					break;
				case 'invert':
					$('#log').show();
					$('#target').show();
					break;
				case 'color':
					$('#log').show();
					$('#target').show();
					break;
				default:
					throw 'Not a Simulation Option';
					break;
			}
		});

		reset();
		$("#simulate").trigger('click');

	});

}(jQuery));
