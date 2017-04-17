<?php
include_once 'set_tab_fields_info.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the thinxtra site id
$thinxtra_site_id = $xml->site->thinxtra_site_id;

// Get the number of fields
$fields = $xml->site->data;
$fields_number = $fields->count();



// If there is no line, create one; else update the existing one.
if ($thinxtra_site_id == "new") {
	$message = set_new_tab_fields_info($mysqli, $fields_number, $xml);
}
else {
	$message = set_existing_tab_fields_info($mysqli, $fields_number, $thinxtra_site_id, $xml);
}

//Convert the array into a readable message
$message = implode ("\n", $message);

$xml_response = new SimpleXMLElement('<xml/>');
if($message == "") {
	$response = $xml_response->addChild('success','Data succesfully saved.');
}
else { 
	$response = $xml_response->addChild('error',$message);
}

//Set header and print content
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


?>