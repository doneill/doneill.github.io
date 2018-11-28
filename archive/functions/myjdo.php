<?php

	include("lib/debug_functions.php");
	include("lib/adodb/adodb.inc.php");

	$db = ADONewConnection($dbdriver);
	$db->debug = $DEBUG;
	$db->Connect($server, $user, $password, $database);	

?>
