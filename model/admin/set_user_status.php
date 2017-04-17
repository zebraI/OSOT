<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected mail (if "ALL", return all mails)
$mail = $xml->mail;

//Prepare the first node of the xml response (ready to print in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

//Define the new status to set
$new_status = "unblocked";

//Call the function to set the user status
set_user_status($mysqli, $mail, $new_status, $xml_response);

//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------

//Function which set a user status to the user into the login attempts table (needs the user mail and an user status);
function set_user_status($mysqli, $mail, $new_status, $xml) {
	
	//Set the timezone to Sydney
	date_default_timezone_set('Australia/Sydney');

	//Get the timestamp and the timestamp of 2 hours before
	$now = time();
	$valid_attempts = $now - (2 * 60 * 60);
	
	
	//Prepare The SQL statement
	$sql = "UPDATE admin_login_attempts SET status=? WHERE mail = ? AND timestamp > '$valid_attempts' AND status='unsuccessful' OR status='blocked'";

	//SQL call update the status of the lines unsuccessful and blocked of the last 2 hours related to an user to unblocked
	if ($stmt = $mysqli->prepare($sql)) {
		//Indicate that the missing parameters are the new status the user want to set and the mail and execute the statement
		$stmt->bind_param('ss', $new_status, $mail);
	
		//If it doesn't work, send an error
		if (! $stmt->execute()) {
			$message = "ERROR : admin_login_attempts database - Problem when trying to update the data to unblocked into the database.";
			$response = $xml->addChild('error',$message);
		}
		//Close the call and send a success message
		else {
			$stmt->close();
			
			$message = "SUCCESS : user $mail unblocked.";
			$response = $xml->addChild('success',$message);
		}
	}
	//If it doesn't work, send an error
	else {
		$message = "ERROR : admin_login_attempts database - Problem when trying to prepare the update SQL request (to turn data to unblocked).";
		$response = $xml->addChild('error',$message);
	}
}
	
	
	
?>