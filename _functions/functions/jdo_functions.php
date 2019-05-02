<?php
/**
 * general functions.
 * 
 *
 * @author Dan O'Neill jdoneill.com
 * @source $URL: ../trunk/jdo/functions/jdo_functions.php $
 */

function urlExists($strURL) {
    $resURL = curl_init();
    curl_setopt($resURL, CURLOPT_URL, $strURL);
    curl_setopt($resURL, CURLOPT_BINARYTRANSFER, 1);
    //curl_setopt($resURL, CURLOPT_HEADERFUNCTION, 'curlHeaderCallback');
    curl_setopt($resURL, CURLOPT_FAILONERROR, 1);

    curl_exec ($resURL);

    $intReturnCode = curl_getinfo($resURL, CURLINFO_HTTP_CODE);
    curl_close ($resURL);

    if ($intReturnCode != 200 && $intReturnCode != 302 && $intReturnCode != 304) {
       return false;
    }else{
        return true ;
    }
} 

function splitFile ($filename,$seperator){
	global $splitfile;
	
	if (!isset($splitfile)) $splitfile = array();
	
	$ch = curl_init();
	$timeout = 5; // set to zero for no timeout
	curl_setopt ($ch, CURLOPT_URL, $filename);
	curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$contents = curl_exec($ch);
	curl_close($ch);  
	
	if (!stristr($contents, $seperator)) {
		$splitfile['errors'][] = "Seperator ($seperator) not found
			in file ($filename)";
		return false;
	}
	
	return explode($seperator, $contents);
}

?>