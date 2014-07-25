(function ($) {

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
			if( $("#text").val().replace(/ /g,'') == '' ){ alert("Cannot decode empty string (even if with whitespace)."); }
			else{
				var canvas = document.getElementById('modifiable').children[0];
				var dataURL = canvas.toDataURL();
				canvas.src = dataURL;

				qrcode.callback = function(data) { 
					$("#decoded").val( data );
				};

				qrcode.decode(canvas);
			}
		}
		;

	$(function () {
		updateAllQRs();

		$("#toggleTop").on("click", toggleTop );
		$("#updateQR").on("click", updateAllQRs );
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
