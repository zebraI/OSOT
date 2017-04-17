<?php
//###################################################################################################
//USEFUL FOR LOGIN
//###################################################################################################

//Script which is call when a connection occurs

include_once '../connectors/db_connect.php';
//Call the security functions
include_once 'security_functions.php';

//Call a function to start the session (call an instance of session object)
sec_session_start();

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the data format needed for the response
$mail = $xml->mail;
$password = $xml->p;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');


//Verify that an ID and a password have been provided
if (!empty($mail) && !empty($password)) {

	//Call a function to check that the hashed password match the hashed password into the database
	if (login($mail, $password, $mysqli) == true) {
		//If it's true, success message and url where the browser should go
		$message = "SUCCESS : connection ok.";
		$url = "search.php";
		$response = $xml_response->addChild('success', $message);
		$response = $xml_response->addChild('url',$url);
	}
	//Else error page
	else {
		$message = "Connection not allowed : incorrect ID or password. Or too much connection in the last 2 hours.";
		$response = $xml_response->addChild('error',$message);
		// header('Location: ../error.php?erreur=Incorrect id or password.');
	}
}	
//If the password or the ID are missing, print an error message in the XML
else {
	$message = "Missing ID or password.";
	$response = $xml_response->addChild('error',$message);
}

//Print the XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());

?>