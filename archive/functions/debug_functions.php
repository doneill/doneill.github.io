<?php
	$DEBUG = false;
	
	if (!$DEBUG) {
		// production settings
		$server = "mysql.jdoneill.com";
		$user = "dopadmin";
		$password = "k2Na1pen";
		$database = "jdoneill";
		$dbdriver = "mysql";
		$doc_root =  "/home/jdoneill/";
	}else {
		// test settings
		$server = "localhost";
		$user = "root";
		$password = "rootadmin";
		$database = "jdoneill";
		$dbdriver = "mysql";
		$doc_root = "../";	
	}
?>
