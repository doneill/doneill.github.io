#!/usr/local/php5/bin/php

<?php

/**
 * National Weather Service Advanced Hydrologic Prediction Service.
 * Observed River Conditions Reader.  
 * 
 *
 * @author Dan O'Neill jdoneill.com
 * @source $URL: ../trunk/jdo/functions/river_conditions.php $
 */

	include("debug_functions.php");
	include("myjdo.php");
	include("jdo_riverFunc.php");
	include("lib/adodb/adodb.inc.php");
	include("rss_parser.php");

	// create globals used in functions
	global $obs;
	global $obs_time;
	global $title;

	// set the default timezone to Anchorage
	date_default_timezone_set('America/Anchorage');	
	
	$slug ="$doc_root" . "jdoneill.com/media/src/river.inc";
	$handle = fopen($slug, "w");
	$timeStamp = date("m/d H:i:s");
	$lastMod = "Last updated;" . $timeStamp . " ADT";
	
	// Glacier Creek (gcga2.rss)
	$url = "http://aprfc.arh.noaa.gov/ahps2/rss/obs/gcga2.rss";
	$trim = "GCGA2\(Alaska)";
	$err_str = "Glacier Creek at Girdwood;No Report";
	jdo_getObs($url, $trim, $err_str);
	// insert into metadata into db
	$river_gauge = "GCGA2";
	$river_title = $title;
	$river_obs = $obs;
	$river_obs_time = $obs_time;
	jdo_insertDb($river_gauge, $river_title, $river_obs, $river_obs_time);

	// SixMile (sixa2.rss)	
	$url = "http://aprfc.arh.noaa.gov/ahps2/rss/obs/sixa2.rss";
	$trim = "SIXA2\(Alaska)";
	$err_str = "Sixmile Creek near Hope;No Report";
	jdo_getObs($url, $trim, $err_str);	
	// insert into metadata into db
	$river_gauge = "SIXA2";
	$river_title = $title;
	$river_obs = $obs;
	$river_obs_time = $obs_time;
	jdo_insertDb($river_gauge, $river_title, $river_obs, $river_obs_time, $timeStamp);	
	
	// Nenana River (hnra2.rss)	
	$url = "http://aprfc.arh.noaa.gov/ahps2/rss/obs/hnra2.rss";
	$trim = "HNRA2\(Alaska)";
	$err_str = "Nenana River at Healy;No Report";
	jdo_getObs($url, $trim, $err_str);		
	// insert into metadata into db
	$river_gauge = "HNRA2";
	$river_title = $title;
	$river_obs = $obs;
	$river_obs_time = $obs_time;
	jdo_insertDb($river_gauge, $river_title, $river_obs, $river_obs_time, $timeStamp);	
		
	// close db connection	
	$db->Close();	
	// write last modification to file
	fwrite($handle, $lastMod);	   	
	fclose($handle);
	
?>
