#!/usr/local/php5/bin/php

<?php
	include("debug_functions.php");
	include("rss_parser.php");
	
	$slug = "$doc_root" .  "jdoneill.com/media/src/weather.inc";
	
	$rss = new rss_parser(); 
	$rss->file = 'http://www.nws.noaa.gov/data/current_obs/PATO.rss'; 
	$rss->parse() or die($rss->error); 
	if ($rss->error) print $rss->error; 
	
	$title = $rss->channel['ITEM']['0']['TITLE'];
	
	$handle=fopen($slug, "w");
	$ARRAY1 = explode("degrees", trim($title));
	$FAHRENHEIT=preg_replace("/[^0-9]/","",$ARRAY1[0]);
	$CELSIUS=round(($FAHRENHEIT-32)*(5/9));
	$report = trim($ARRAY1[0]) . "ºF / " . $CELSIUS . "ºC";
	fwrite($handle, $report);
	fclose($handle);
?>
