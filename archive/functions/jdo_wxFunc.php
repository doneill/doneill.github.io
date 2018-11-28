<?php
/**
 * This is the main include file for wx_conditions.php.
 * 
 *
 * @author Dan O'Neill jdoneill.com
 * @source $URL: ../trunk/jdo/functions/jdo_wxFunc.php $
 */

function jdo_getObs($s_url, $s_station_name, $s_err){
	global $contents;
	global $handle;
	global $date;
	global $temp;
	global $depth;	
	
	if(urlExists($s_url)){
		$seperator = "\n";
		
		if (!isset($contents)) $contents = array();
		
		$contents = splitfile($s_url, $seperator); 	
		// Remove Column Headers
		// Collect most recent data
		$recent = 4;
		$data = explode("       ", $contents[$recent]);
		// format data
		
		if (strcmp($s_station_name, "Independence Mine (3550')") == 0){
			$date = substr($data[0], 0, 16);
			$temp = substr($data[4], 1, 5);
			$depth = substr($data[1], 2, 5);			
		}else{
			$date = substr($data[0], 0, 16);
			$temp = substr($data[2], 1, 5);
			$depth = substr($data[3], 2, 5);					
		}
	
		// create report
		$report = trim($s_station_name) . ";" . trim($depth);
		fwrite($handle, $report . ";");	
	}else{
		$report = $s_err;
		fwrite($handle, $report . ";");	
	}		
}

function jdo_insertDb($s_station, $s_depth, $s_temp, $s_date){
	global $db;
	global $timeStamp;
	// select record from db
	$sql = "SELECT * FROM wx_snowmeta";
	// execute a query and get an empty recordset
	$rs = $db->Execute($sql);
	// initialize an array to hold the record data to insert
	$record = array();
	// set the value of the fields in the record
    $record["snow_station"] = $s_station; 
    $record["snow_depth"] = $s_depth;
    $record["snow_airtemp"] = $s_temp; 
    $record["snow_date"] = $s_date;
	// pass the empty recordset and the array containing the data
	// to insert into the GetInsertSQL function.  
	// the function will process the data and return a fully formatted
	// insert sql statement
	$insertSQL = $db->GetInsertSQL($rs, $record);
	// insert the record into the db
	$db->Execute($insertSQL);		
}
 
?> 