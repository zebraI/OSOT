<?php

require_once '../connectors/db_connect.php';
require_once 'csv_reader.php';

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//Here, file_url can be set. As well as many options to optimize the performance.
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the file name
$file_name = $xml->file_name;

//Get the user name
$user = $xml->user;

//File URL
$file_url = "../../uploaded_files/" . $file_name;

//Create the xml header
$xml_response = new SimpleXMLElement('<xml/>');

//Check the file_name and get a response (error of empty)
$response = check_file_name($file_name, $xml_response);

//If it's not an error, check the document type (only csv are allowed), return an error or empty
if ($response == "") {
	$response = document_type($file_name, $xml_response);
	
	//If no error, send to the csv reader
	if ($response == "") {
		csv_reading($file_name, $file_url, $user, $mysqli);
	}
	//If an error comes back, delete the file and return an error xml
	else {
		unlink($file_url);
		sendXml($response);
	}
}
//If an error comes back, delete the file and return an error xml
else {
	unlink($file_url);
	sendXml($response);
}


//####################################################################################################
//FUNCTIONS
//####################################################################################################
//Automatically format and send XML
function sendXml($message) {
	Header('Content-type: text/xml; charset=utf-8');
	print($message->asXML());
}

//-----------------------------------------------------
//Errors during the file transfer
function check_file_name($file_name, $xml_response) {
	
	$response = "";
	if (!isset($file_name)) {
		$error = "An error occurred during file name transfer.";
		$response = $xml_response->addChild('error',$error);
	}
	else if (empty($file_name)) {
		$error = "Empty file name.";
		$response = $xml_response->addChild('error',$error);
	}
	
	return $response;
}

//File extension extraction
function document_type($file_name, $xml_response) {
	
	$response = "";
	
	$table = explode(".", $file_name);
	$file_extension = strtolower(array_pop($table));
		
	//If the file extension isn't right, send an error and delete the file
	if ($file_extension !== 'csv') {
		unlink($file_url);
		$error = "Wrong file extension.";
		$response = $xml_response->addChild('error',$error);
	}
	
	return $response;
}	


?>