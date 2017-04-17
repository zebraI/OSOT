<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected mail (if "ALL", return all mails)
$mail = $xml->mail;

//Prepare the first node of the xml response (ready to print in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

//Call the function to get the last user status and time if it's not blocked
get_user_status($mysqli, $mail, $xml_response);

//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------

//Function which get if there's a blocked status into the database for the user (otherwise, return the last status)
function get_user_status($mysqli, $mail, $xml) {
	
	//Set is blocked to false
	$is_blocked = false;
	
	//Prepare the SQL
	$sql = "SELECT status, time FROM admin_login_attempts WHERE mail = ?";

	//SQL call to check if there is a "blocked" value into the database
	if ($stmt = $mysqli->prepare($sql)) {

		//Indicate that the missing parameter is the mail and execute the statement
		$stmt->bind_param('s', $mail);
		$stmt->execute();
		$stmt->store_result();

		//Check if it gets at least a line
		if ($stmt->num_rows > 0) {
			//Link variable to the result of the request
			$stmt->bind_result($status, $time);
			
			//While there are results
			while ($stmt->fetch()) {
				//If a status 'blocked' is detected, set is _blocked to true
				if ($status == 'blocked') {
					$is_blocked = true;
				}
			}
			
			//Close the call
			$stmt->close();
			
			//If a block was detected, set the status to blocked
			if ($is_blocked == true) {
				$response = $xml->addChild('status','blocked');
			}
			
			//Else set the status and the time to last finded value
			else {
				$response = $xml->addChild('status', $status);
				$response = $xml->addChild('connection_time', $time);
			}
		}
		//If there are no lines, return a secial status
		else {
			$response = $xml->addChild('status', 'never connected');
		}
	}
}
?>