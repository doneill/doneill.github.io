#!/usr/local/php5/bin/php

<?php
/**
 * @author Dan O'Neill jdoneill.com
 * @source $URL: ../trunk/jdo/functions/snowreport.php $
 */
	include("debug_functions.php");
	
	require_once("lib/nusoap/nusoap.php"); 
	$xml_file = "daily.xml";
	$m_filename = "$doc_root" . "jdoneill.com/media/src/report.xml";
	
	if($wsdl="http://www.thecave.com/ws/snowreport.wsdl"){
		$client=new soapclient($wsdl, "wsdl");
		$daily = $client->call('DailyDump', '', '', 'urn:thecave-com:SnowReport/DailyDump');
		
		if($theXML = $client->response){
			// write this response to a file for future pursing
			$fp = fopen($xml_file, "w");
			fwrite($fp, $theXML);
			fclose($fp); 	
			
			// Delete 1st 8 Lines which is not a part of XML file
			//$CONTENTS = file_get_contents($xml_file);
			
			$ch = curl_init();
			$timeout = 5; // set to zero for no timeout
			curl_setopt ($ch, CURLOPT_URL, $xml_file);
			curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
			$CONTENTS = curl_exec($ch);
			curl_close($ch);
			
			
			$fd = fopen($xml_file, "r");
			$m_fd = fopen($m_filename, "w");		

			$query_str="<Resort>";

			while (!feof($fd)){
				$buffer = fgets($fd, 4096);
				$pos = strpos ($buffer, $query_str);
				if($pos == false){
					//
				} else{
					// write new xml file
					fwrite($m_fd,$buffer);
				}
			}

			fclose($fd);
			fclose($m_fd);
			unlink($xml_file);
			
		}
	}
?>