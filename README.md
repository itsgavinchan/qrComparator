qrComparator
============

### Project Description
This project uses a modified [larsung.de's jQuery.qrcode-0.8.0.js](http://larsjung.de/qrcode/) as the QR Code generator in conjunction with [LazarSoft's jsqrcode](https://github.com/LazarSoft/jsqrcode) to decode QR codes. The purpose of this project is to display visual differences between the original QR code and a modified QR code, and will attempt to visually depict a variety of attacks on QR codes. For layout purposes, this page is formatted with [Twitter BootStrap](getbootstrap.com/) and aimed to be mobile-responsive.

### Changelog (Ordered Newest to Oldest)
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
* Implement visual comparison changes in #differences to display the pixel module differences between #original's QR code and #modifiable's QR code.
* Make top two QR codes mobile responsive upon browser window change.
* Make sidebar togglable and visible in mobile browser view.