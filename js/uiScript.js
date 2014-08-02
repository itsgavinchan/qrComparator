clearTimeout(function ($) {
	
	var updateQRCode = function(container) {
			$(container).empty().qrcode( 
				{
					ecLevel: $("#eclevel").val(),
					minVersion: parseInt($("#minversion").val(), 10),
					text: $("#text").val(),
					background: white,
					color: black,
					size: $(container).width()
				} );
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
		var attackRunning = null, isAttacking = false;
		var options = {
			versionNumber: parseInt( $('#minVer').text() ),
			finder: $('#targetFinder').prop( 'checked' ),
			separators: $('#targetSeparators').prop( 'checked' ),
			alignment: $('#targetAlignment').prop( 'checked' ),
			timing: $('#targetTiming').prop( 'checked' ),
			versionT: $('#targetVersion').prop( 'checked' ),
			dataT: $('#targetData').prop( 'checked' )
		};

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
		};

		var reset = function(){

			updateAllQRs();
			updateOptions();

			window.clearTimeout();
			attackRunning = null;
			isAttacking = false;

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

			$("#brushSize").val( Math.floor( controller.modifiable.containerModuleLength ) );
			$("#brush").text( $("#brushSize").val() );

			// Clear the comparator canvas because it's to show differences between two QR codes
			controller.comparator.clearCanvas();
			controller.comparator.showCanvasGrid('#000000');

			decodeQR();

		};

		var invertAttack = function( ){
			controller.modifiable.viewPermissibleArea();

			if( !controller.modifiable.attackable ) { throw 'All available targetted areas already attacked.'; }

			isAttacking = true;

			var index = { 
				x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
				y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
			};

			while ( !controller.modifiable.isAttackable( index.x, index.y ) ){
				index.x = Math.floor( ( Math.random() * controller.modifiable.moduleCount ) );
				index.y = Math.floor( ( Math.random() * controller.modifiable.moduleCount ) );
			
			}

			controller.invert( index.x, index.y );

			recordIndex( index.x, index.y );

			decodeQR();

			// See the global error catcher at the top of this file
			attackRunning = setTimeout(invertAttack, parseInt( $('#timing').val() ) );

		};

		var colorAttack = function( color ){
			controller.modifiable.viewPermissibleArea();

			if( !controller.modifiable.attackable ) { throw 'All available targetted areas already attacked.'; }

			isAttacking = true;

			var index = { 
				x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
				y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
			};

			while ( !controller.modifiable.isAttackable( index.x, index.y ) || !controller.targetColor( index.x, index.y, color ) ){
				index.x = Math.floor( ( Math.random() * controller.modifiable.moduleCount ) );
				index.y = Math.floor( ( Math.random() * controller.modifiable.moduleCount ) );
			}
			
			controller.invert( index.x, index.y );

			recordIndex( index.x, index.y );

			decodeQR();

			// See the global error catcher at the top of this file
			attackRunning = setTimeout(colorAttack, parseInt( $('#timing').val() ), color);

		};

		var recordIndex = function( x, y ){
			$('#attackLog').text( $('#attackLog').text() + "[" + x + ", " + y + "] " );
		};

		var showChangesInAttack = function(){
			switch( $("#attackMode").val() ){
				case 'manual':
					$('#log').show();
					$('#target').show();
					$('#brushCtrl').hide();
					$('#colorCtrl').hide();
					break;
				case 'deface':
					$('#log').hide();
					$('#target').hide();
					$('#brushCtrl').show();
					$('#colorCtrl').show();
					break;
				case 'invert':
					$('#log').show();
					$('#target').show();
					$('#brushCtrl').hide();
					$('#colorCtrl').hide();
					break;
				case 'color':
					$('#log').show();
					$('#target').show();
					$('#brushCtrl').hide();
					$('#colorCtrl').show();
					break;
				default:
					throw 'Not a Simulation Option';
					break;
			}
		};

		var showInstructions = function(){
			switch( $("#attackMode").val() ){
				case 'manual':
					alert('Click on modules in the modifiable QR code to invert its color. Once done, press the decode button to decode the new, modified QR code. If it cannot be decoded, an error will display in the decoded content text area. The attacked modules will be displayed in the indicies log. Press the generate button to reset.');
					break;
				case 'deface':
					alert('Select your color and brush size and deface the QR code however you\'d like. Once satisfied, press the decode button to decode the new, modified QR code. If it cannot be decoded, an error will display in the decoded content text area. Press the generate button to reset.');
					break;
				case 'invert':
					alert('This is an automated attack. When you press the simulate button, an attack will occur on the targetted areas of the modifieable QR code (selected in the \'Target Areas\' collapsible) and its changes reflected in the modifications section above. It will only cease when the code can no longer be decoded. The attacked modules will be displayed in the indicies log. Press the generate button to reset.');
					break;
				case 'color':
					alert('This is an automated attack on only the color chosen in the color dropdown. When you press the simulate button, an attack will occur on the targetted areas of the modifieable QR code (selected in the \'Target Areas\' collapsible) and its changes reflected in the modifications section above. It will only cease when the code can no longer be decoded. The attacked modules will be displayed in the indicies log. Press the generate button to reset.');
					break;
				default:
					throw 'Not a Simulation Option';
					break;
			}
		};

		// Button Triggers

		$("#updateQR").on("click", reset );
		$("#toggleTop").on("click", toggleTop );
		$("#decodeQR").on("click", decodeQR );
		$("#instructions").on("click", showInstructions );

		$("#simulate").on("click", function(){

			if( isAttacking && attackRunning != null ){
				isAttacking = false;
				window.clearTimeout( attackRunning ); 
				attackRunning = null;
				return;
			}

			updateOptions();

			action = $('#attackMode').val(); 

			// if ( !controller.modifiable.attackable && action != 'deface' ){ 
			// 	var err = "There are no valid target areas to attack."; 
			// 	alert( err + "Please choose a target area. Remember that an alignment pattern doesn't exist in Version 1 QR codes and version data only exists in QR codes of Version 7 or higher. ");
			// 	throw err;
			// }

			switch( action ) {
				case 'manual':
					if( !controller.modifiable.attackable ) { throw 'All available targetted areas already attacked.'; }

					controller.modifiable.canvas.onmousedown = function(evt) {
			            if( action == 'manual' ){
							var index = controller.modifiable.getCanvasIndex( controller.modifiable.getMousePos( evt ) );
							if ( controller.modifiable.isAttackable( index.x, index.y ) ){
								recordIndex( index.x, index.y );
								controller.invert( index.x, index.y );
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

					controller.modifiable.updatePermissibleAreaByColor( $('#color').val() );
					colorAttack( $('#color').val() );

					break;
				default:
					throw 'Not a Simulation Option';
					break;
			}
		});

		// Input Triggers 
		$("#text").on("input change load", function(){
			$("#textChar").text( $("#text").val().length );
		});

		$("#minversion").on("input change", function(){
			$("#minVer").text( $("#minversion").val() );
		});

		$("#brushSize").on("input change", function(){
			$("#brush").text( $("#brushSize").val() );
		});

		$("#attackMode").on("input change", showChangesInAttack);

		reset();
		$("#attackMode").val('manual');
		$("#textChar").text( $("#text").val().length );

		$(".target").on("input change", function(){
			updateOptions();
			controller.modifiable.resetPermissibleArea(options);
			controller.modifiable.viewPermissibleArea();
		});
	});

}(jQuery));
