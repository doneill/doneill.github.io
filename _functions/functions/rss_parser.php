<? 
// define hooks to rss_parser class as xml functions do not allow object methods as handlers. 
function rss_start_element($parser, $name, $attributes) { 
  global $rss; 
  $rss->start_element($parser, $name, $attributes); 
} 

function rss_end_element($parser, $name) { 
  global $rss; 
  $rss->end_element($parser, $name); 
} 

function rss_character_data($parser, $data) { 
  global $rss; 
  $rss->character_data($parser, $data); 
} 


class rss_parser { 

// constructor. setup parser options and handlers. 
function rss_parser() { 
  $this->error = ''; 
  $this->file = ''; 
   
  $this->channel = array(); 
  $this->data = ''; 
  $this->stack = array(); 
  $this->num_items = 0; 
   
  $this->xml_parser = xml_parser_create(); 
  xml_set_element_handler($this->xml_parser, "rss_start_element", "rss_end_element"); 
  xml_set_character_data_handler($this->xml_parser, "rss_character_data"); 
} 

function character_data($parser, $data) { 
  if (empty($this->data)) $this->data = trim($data); // concatenate non-parsed data... 
  else $this->data .= ' '.trim($data);               // and get rid of white space. 
} 

function start_element($parser, $name, $attrs) { 
  switch($name) { 
    case 'RSS': 
      break; 
   
    case 'CHANNEL': 
      break; 
   
    case 'IMAGE': 
      array_push($this->stack, $name); 
      break; 
     
    case 'ITEM': 
      array_push($this->stack, $name); 
      array_push($this->stack, $this->num_items); // push item index. 
      $this->item[$this->num_items] = array(); 
      $this->num_items++; 
      break; 
       
    case 'TEXTINPUT': 
      array_push($this->stack, $name); 
      break; 
       
    default: 
      array_push($this->stack, $name); 
      break; 

  }   
} 

function end_element($parser, $name) { 
  switch ($name) { 
    case 'RSS': 
      break; 
       
    case 'CHANNEL': 
      break; 
        
    case 'IMAGE': 
      array_pop($this->stack); 
      break; 
     
    case 'ITEM': 
      array_pop($this->stack); 
      array_pop($this->stack); 
      break; 
       
    case 'TEXTINPUT': 
      array_pop($this->stack); 
      break; 
       
    default: // child element. 
      $element = (implode("']['",$this->stack));      
      eval("\$this->channel['$element']=\$this->data;"); // this does all the hard work. 
      array_pop($this->stack); 
      $this->data = ''; 
      break; 
  } 
}


function parse() { 
	$fp = $this->file;
	$ch = curl_init();
	$timeout = 5; // set to zero for no timeout
	curl_setopt ($ch, CURLOPT_URL, $fp);
	curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt ($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	if (!$fc = curl_exec($ch)) { 
		$this->error = "Could not open RSS source \"$this->file\"."; 
		return false; 
	} 	
	curl_close($ch);	

    if (!xml_parse($this->xml_parser, $fc)) { 
      $this->error = sprintf("XML error: %s at line %d.", 
        xml_error_string(xml_get_error_code($this->xml_parser)), 
        xml_get_current_line_number($this->xml_parser)); 
      return false; 
    } 
	xml_parser_free($this->xml_parser); 
	return true; 
} 



} // class rss_parser. 
?>
