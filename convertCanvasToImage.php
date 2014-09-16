<?php
	
	define('UPLOAD_DIR', 'img/');
	$data = $_POST['img'];

	list($type, $data) = explode(';', $data);
	list(, $data)      = explode(',', $data);
	$data = base64_decode($data);

	// $file = UPLOAD_DIR . uniqid() . '.png';
	$file = 'qrcode.png';
	$success = file_put_contents($file, $data);

	print $success ? $file : 'Unable to save the file.';
?>