qrComparator
============

### Project Description
This project uses a modified [larsung.de's jQuery.qrcode-0.8.0.js](http://larsjung.de/qrcode/) as the QR Code generator in conjunction with [LazarSoft's jsqrcode](https://github.com/LazarSoft/jsqrcode) to decode QR codes. The purpose of this project is to display visual differences between the original QR code and a modified QR code, and will attempt to visually depict a variety of attacks on QR codes. For layout purposes, this page is formatted with [Twitter BootStrap](getbootstrap.com/) and aimed to be mobile-responsive.

### Changelog (Ordered Newest to Oldest)
* **2014.07.28**
  * Modified /js/modifiableScript.js to come before /js/uiScript.js, with /js/modifiableScript.js being the library and /js/modifiableScript.js being the handler.
  * Modified index.html to include the checkbox '#showGrid' to easier differenciate changes.
  * Modified /js/uiScript.js to have a global listener to thrown errors from LazarSoft and alert the user whether the decoding procedure was successful or if an error is thrown.
  * Added to /js/modifiableScript.js to be object-oriented with a hardcoded CanvasController to control the three canvases, 'original,' 'modifiable,' and 'differences', while also displaying the needed module differences on 'differences' canvas. The yellow is to signify a change from the original's black to white. The red signifies a change from the original's white to black.
  * Modified /js/modifiableScript.js's CanvasObject to individually handle getters and setters based in index and mouse coordinates, specifically for inverting the color on that canvas, getting the index and mouse position, and the respective hexcolor values.
* **2014.07.25**
  * Modified /js/modifiableScript.js to work with QR code given the identifier of the canvas element's parent (#original, #modifiable, #differences).
  * Modified /js/modifiableScript.js #modifiable's QR code to receive hexvalue from mouse position and invert the color of that specific pixel module on #modifiable's QR code.
* **2014.07.24**
  * Modified [jsqrcode](https://github.com/LazarSoft/jsqrcode)'s qrcode.js on lines 32 to 40 to alternatively accept a canvas element to decode.
  * Modified [jQuery.qrcode](http://larsjung.de/qrcode/) on lines 57, 58 to update the Version numbers in index.html upon generation.
  * Modified [jsqrcode](https://github.com/LazarSoft/jsqrcode)'s decoder.js on line 61 to update the Version number for #modifiable's QR Code in index.html.
  * Added convertCanvasToImage.php to accept a data URL and over qrcode.png to be decoded in uiScript.js upon #decodeQR button click.
  * Added /js/modifiableScript.js that will handle the drawing in #modifiable's QR code.
  * Added /js/uiScript.js to handle index.html's field input changes and mobile responsiveness.

### To Be Implemented (Order of Importance)
* Implement different simulated attacks on QR codes, beginning with attack on code words now that manual blind-attacks are implemented.
* Make top two QR codes mobile responsive upon browser window change.
* Make sidebar togglable and visible in mobile browser view.