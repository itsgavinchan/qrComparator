(function ($) {
	
	// attackRunning and isAttacking keeps track of the current automated attack running
	// This is necessary for stopping an attack in the middle of its process.

	
	var attackRunning = null, isAttacking = false;

	$("#simulate").on("click", function(){

		if( isAttacking && attackRunning != null ){
			isAttacking = false;
			window.clearTimeout( attackRunning ); 
			attackRunning = null;
			return;
		}
	});

	$("#text").on("input change load", function(){
		$("#textChar").text( $("#text").val().length );
	});

	$("#minversion").on("input change", function(){
		$("#minVer").text( $("#minversion").val() );
	});

	$("#brushSize").on("input change", function(){
		$("#brush").text( $("#brushSize").val() );
	});

	$("#attackMode").val('manual');
	$("#textChar").text( $("#text").val().length );

	var currentValue = $('#text').val(),
		action = $('#attackMode').val();

	// Used to do localized attacks.
	var options = {
		versionNumber: parseInt( $('#minVer').text() ),
		finder: $('#targetFinder').prop( 'checked' ),
		separators: $('#targetSeparators').prop( 'checked' ),
		alignment: $('#targetAlignment').prop( 'checked' ),
		timing: $('#targetTiming').prop( 'checked' ),
		versionT: $('#targetVersion').prop( 'checked' ),
		dataT: $('#targetData').prop( 'checked' )
	};

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

	var generatingOptions = {
		render: 'canvas',
		// This takes value from the slider itself
		minVersion: parseInt($("#minversion").val(), 10),
		maxVersion: 40,
		// This takes value from the dropdown
		ecLevel: $("#eclevel").val(),
		color: '#000000',
		background: '#ffffff',
		// This takes value from the textarea
		text: $("#text").val(),
		// Changing this means that modifiableScript will need to be changed
		quiet: 0
	};

	var updateQRCode = function(container, op) {

		// Empty what is inside the container first, which is the canvas
		// Before generating a new one in its place
		$(container).empty().qrcode( 
			{
				ecLevel: generatingOptions.ecLevel,
				minVersion: generatingOptions.minversion,
				text: generatingOptions.text,
				background: generatingOptions.background,
				color: generatingOptions.color,
				size: $(container).width()
			} 
		);
	};

	var resizeAllQRs = function(){

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

	};

	var updateAllQRs = function(){
		updateQRCode( "#original" );
		updateQRCode( "#differences" );
		updateQRCode( "#modifiable" );

		resizeAllQRs();
	};

	// First, initialize the QR codes.
	updateAllQRs();

	// Create the controller, which needs to be done only once when the page loads
	var controller = new CanvasController( 'original', 'modifiable', 'differences' );

	var decodeQR = function( container ){
		if( $("#text").val().replace(/ /g,'') == '' ){ 
			throw "Cannot decode empty string (even if with whitespace)."; 

		}
		else{
			var canvas = document.getElementById( container ).children[0];
			var dataURL = canvas.toDataURL();
			canvas.src = dataURL;

			qrcode.callback = function( data ) { 
				// eval( data );
				$('#decoded').val( data );
				// alert( 'Success! View "Decoded Content" for results!' );
			};

			qrcode.decode(canvas);
		}

		return $('#decoded').val( );
	};
		
	var reset = function(){

		updateAllQRs();
		updateOptions();
		currentValue = $('#text').val();

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

		decodeQR( 'modifiable' );

	};
	
	reset();

	var recordIndex = function( x, y ){
		$('#attackLog').text( $('#attackLog').text() + "[" + x + ", " + y + "] <br>" );
	};

	var automatedAttack = function (condition ){

		if( !controller.modifiable.attackable ) { throw 'All available targetted areas already attacked.'; }

		isAttacking = true;

		var index = { 
			x: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) ), 
			y: Math.floor( ( Math.random() * controller.modifiable.moduleCount ) )
		};

		while ( condition ){
			index.x = Math.floor( ( Math.random() * controller.modifiable.moduleCount ) );
			index.y = Math.floor( ( Math.random() * controller.modifiable.moduleCount ) );
		
		}

		controller.invert( index.x, index.y );

		recordIndex( index.x, index.y );

		decodeQR( 'modifiable' );

	};

	var invertAttack = function( ){
    
		automatedAttack( ( !controller.modifiable.isAttackable( index.x, index.y ) || !controller.targetColor( index.x, index.y, color ) ) );
		
		// See the global error catcher at the top of this file
		if( currentValue == $('#decoded').val() ) {
			attackRunning = setTimeout(invertAttack, parseInt( $('#timing').val() ) );
		}
	};

	var colorAttack = function( color ){

		automatedAttack( !controller.modifiable.isAttackable( index.x, index.y ) );

		decodeQR( 'modifiable' );

		// See the global error catcher at the top of this file
		if( currentValue == $('#decoded').val() ) {
			attackRunning = setTimeout(colorAttack, parseInt( $('#timing').val() ), color);
		}
	};

	window.onerror = function errorHandler(msg, url, line) {
		$('#decoded').val( 'ERR: ' + msg);
		window.clearTimeout();

		switch( action ) {
			case 'invert':
				reset();
				invertAttack();

				break;
			case 'color':
				reset();
				controller.modifiable.updatePermissibleAreaByColor( $('#color').val() );
				colorAttack( $('#color').val() );

				break;
			default:
				throw 'Not a Simulation Option';
				break;
		}

		// Just let default handler run.
		return false;
	};

	var showChangesInAttack = function(){
		switch( $("#attackMode").val() ){
			case 'manual':
				$('#log').show();
				$('#timingOption').hide();
				$('#target').show();
				$('#brushCtrl').hide();
				$('#colorCtrl').hide();
				break;
			case 'deface':
				$('#log').hide();
				$('#timingOption').hide();
				$('#target').hide();
				$('#brushCtrl').show();
				$('#colorCtrl').show();
				break;
			case 'invert':
				$('#log').show();
				$('#timingOption').show();
				$('#target').show();
				$('#brushCtrl').hide();
				$('#colorCtrl').hide();
				break;
			case 'color':
				$('#log').show();
				$('#timingOption').show();
				$('#target').show();
				$('#brushCtrl').hide();
				$('#colorCtrl').show();
				break;
			default:
				throw 'Not a Simulation Option';
				break;
		}
	};

	showChangesInAttack();

	var showInstructions = function(){
		switch( $("#attackMode").val() ){
			case 'manual':
				alert('Click on modules in the modifiable QR code to invert its color. Once done, press the decode button to decode the new, modified QR code. If it cannot be decoded, an error will display in the decoded content text area. The attacked modules will be displayed in the indicies log. Press the generate button to reset.');
				break;
			case 'deface':
				alert('Select your color and brush size and deface the QR code however you\'d like. Once satisfied, press the decode button to decode the new, modified QR code. If it cannot be decoded, an error will display in the decoded content text area. Press the generate button to reset.');
				break;
			case 'invert':
				alert('This is an automated attack. When you press the simulate button, an attack will occur on the targeted areas of the modifiable QR code (selected in the Target Areas collapsible) and its changes reflected in the modifications section above. It will only cease when the code can no longer be decoded. The attacked modules will be displayed in the indices log. It will end when it generates a QR code with a different message than the generated code or when you click on the simulate button again. Press the generate button to reset.');
				break;
			case 'color':
				alert('This is an automated attack on only the color chosen in the color dropdown. When you press the simulate button, an attack will occur on the targeted areas of the modifiable QR code (selected in the Target Areas collapsible) and its changes reflected in the modifications section above. It will only cease when it generates a QR code with a different message than the generated code or when you click on the simulate button again. The attacked modules will be displayed in the indices log. Press the generate button to reset.');
				break;
			default:
				throw 'Not a Simulation Option';
				break;
		}
	};

	// Button Triggers

	$("#updateQR").on("click", reset );
	$("#decodeQR").on("click", decodeQR, modifiable );
	$("#instructions").on("click", showInstructions );
	$("#collapseGen").collapse('show');
	$("#collapseAttack").collapse('show');

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
	};

	// Input Triggers 

	$("#attackMode").on("input change", showChangesInAttack);

	$(".target").on("input change", function(){
		updateOptions();
		controller.modifiable.resetPermissibleArea(options);
		controller.modifiable.viewPermissibleArea();
	});


}(jQuery));
