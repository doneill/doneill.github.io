<?php
/**
 * This is the main include file for river_conditions.php.
 * 
 *
 * @author Dan O'Neill jdoneill.com
 * @source $URL: ../trunk/jdo/functions/jdo_riverFunc.php $
 */

function jdo_getObs($s_url, $s_trim, $s_err){
	global $rss;
	global $obs;
	global $obs_time;
	global $title;
	global $handle;
		
	$rss = new rss_parser(); 
	$rss->file = $s_url;
	
	if($rss->parse()){
		if ($rss->error) print $rss->error; 
		
		$desc = $rss->channel['ITEM']['0']['DESCRIPTION'];
		// get data
		$ARRAY1 = explode("< br / >", trim($desc));
		// get latest observation
		$ARRAY2 = explode(":", $ARRAY1[2]);
		$obs = $ARRAY2[1];
		$obs = trim($obs, " ft");
		// get latest observation time
		$ARRAY3 = explode(":", $ARRAY1[3], 2);
		$obs_time = $ARRAY3[1];
		// get guage title
		$title = $rss->channel['TITLE'];
		$title = trim($title, $s_trim);
		// create report
		$report = trim($title) . ";" . trim($obs);
		fwrite($handle, $report . ";");	
	}else{
		$report = $s_err;
		fwrite($handle, $report . ";");	
	}		
}

function jdo_insertDb($s_gauge, $s_title, $s_obs, $s_obs_time){
	global $db;
	global $timeStamp;
	// select record from db
	$sql = "SELECT * FROM rss_rivermeta";
	// execute a query and get an empty recordset
	$rs = $db->Execute($sql);
	// initialize an array to hold the record data to insert
	$record = array();
	// set the value of the fields in the record
	//$record["river_id"] = ""; 
	$record["river_gauge"] = $s_gauge; 
	$record["river_title"] = $s_title;
	$record["river_obs"] = $s_obs; 
	$record["river_obs_time"] = $s_obs_time;
	$record["river_timestamp"] = $timeStamp;
	// pass the empty recordset and the array containing the data
	// to insert into the GetInsertSQL function.  
	// the function will process the data and return a fully formatted
	// insert sql statement
	$insertSQL = $db->GetInsertSQL($rs, $record);
	// insert the record into the db
	$db->Execute($insertSQL);		
}
?>
