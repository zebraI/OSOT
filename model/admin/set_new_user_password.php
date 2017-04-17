<?php
include_once '../connectors/db_connect.php';
include_once '../connection_process/process_modification.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected mail (user id)
$mail = $xml->mail;

//Get the user password
$password = $xml->p;

//Prepare the first node of the xml response (ready to print in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

//If the mail and the password aren't empty, check the size and the inexistence of the user
if ((!empty($mail)) && !(empty($password))) {
	$message = check_password_size_and_user_existence($mysqli, $mail, $password);
}
else {
	$message = "7";
}

//If the mail and the password aren't empty and no errors before, insert into the database
if ((!empty($mail) && !empty($password)) && ($message == -1)) {
	$message == "";
	$message = set_user_password($mysqli, $mail, $password);
}

// Manage the errors/success message into the response (regenerate an XML to avoid mistakes)
message_management($message, $xml_response);
	
//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which manage the message (error, success) display
function message_management($message, $xml_response) {
	if ($message == 1) {
		$message = "ERROR : password too long (more than 255 characters).";
	}
	else if ($message == 2) {
		$message = "ERROR : admin_osot_user database - problem when executing select request.";
	}
	else if ($message == 3) {
		$message = "ERROR : admin_osot_user database - problem when preparing select request.";
	}
	else if ($message == 4) {
		$message = "ERROR : user doesn't exist in database.";
	}
	else if ($message == 5) {
		$message = "ERROR : admin_osot_user database - problem when executing insert request.";
	}
	else if ($message == 6) {
		$message = "ERROR : admin_osot_user database - problem when preparing insert request.";
	}
	else if ($message == 7) {
		$message = "ERROR : empty password or mail.";
	}
	
	if ($message == -1) {
		$message = "SUCCESS : user_admin database successfully updated.";
		$response = $xml_response->addChild('success',$message);
	}
	else {
		$response = $xml_response->addChild('error',$message);
	}
	
	return $response;
}

?>