#!/usr/local/php5/bin/php

<?php

/**
 * SnoTel data discovery
 * 
 *
 * @author Dan O'Neill jdoneill.com
 * @source $URL: ../trunk/jdo/functions/wx_conditions.php $
 */

	include("debug_functions.php");
	include("myjdo.php");
	include("jdo_functions.php");
	include("jdo_wxFunc.php");

	// create globals used in functions
	global $station;
	global $date;
	global $temp;
	global $depth;
	
	// set the default timezone to Anchorage
	date_default_timezone_set('America/Anchorage');	
	
	$slug = "$doc_root" . "jdoneill.com/media/src/wx.inc";
	$handle = fopen($slug, "w");
	$timeStamp = date("m/d H:i:s");
	$lastMod = "Last updated;" . $timeStamp . " ADT";	
 
 	// INDEPENDENCE Mine
	$file = "http://ambcs.org/pub/current/INDEPENDENCE_M";
	$station_name = "Independence Mine (3550')";
	$err_str = $station_name . ";No Report";
	jdo_getObs($file, $station_name, $err_str);
	$station = "1";
	jdo_insertDb($station, $depth, $temp, $date);
	
	// Indian Pass
	$file = "http://ambcs.org/pub/current/INDIAN_PAS_AAA";
	$station_name = "Indian Pass (2350')";
	$err_str = $station_name . ";No Report";
	jdo_getObs($file, $station_name, $err_str);
	$station = "2";
	jdo_insertDb($station, $depth, $temp, $date);
	
 	// Mt. Alyeska
	//$file = "http://ambcs.org/pub/recent/MT_ALYESKA_BAO";
	$file = "http://ambcs.org/pub/current/MT_ALYESKA_BAO";
	$station_name = "Mt. Alyeska (1540')";
	$err_str = $station_name . ";No Report";
	jdo_getObs($file, $station_name, $err_str);
	$station = "3";
	jdo_insertDb($station, $depth, $temp, $date);
	
	// Turnagain Pass
	$file = "http://ambcs.org/pub/current/TURNAGAIN_ABD";
	$station_name = "Turnagain Pass (1880')";
	$err_str = $station_name . ";No Report";
	jdo_getObs($file, $station_name, $err_str);
	$station = "4";
	jdo_insertDb($station, $depth, $temp, $date);
	
	// close db connection	
	$db->Close();	
	// write last modification to file
	fwrite($handle, $lastMod);	   	
	fclose($handle);	
?>