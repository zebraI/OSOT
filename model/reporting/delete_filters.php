<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the user name
$user = $xml->user;

//Get the parameter
$filter_name = $xml->parameter;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

$message = delete_filter($mysqli, $user, $filter_name, $xml_response);

//Set header and print content
Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());


//---------------------------------------------------------------------------------------
//FUNCTIONS
//---------------------------------------------------------------------------------------
//Delete a filter
function delete_filter($mysqli, $user, $filter_name, $xml_response) {
	
	//Avoid SQL injection
	$user = mysqli_real_escape_string($mysqli, $user);
	$filter_name = mysqli_real_escape_string($mysqli, $filter_name);
	
	//Prepare SQL statement to select the lines matching username and filter name
	$sql = "DELETE FROM filters WHERE user = '" . $user . "' AND filter_name = '" . $filter_name . "'";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : filters database - Problem when trying to delete the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			$stmt->store_result();
			
			//Print a success message
			$message = "SUCCESS : Filter successfully deleted.";
			$response = $xml_response->addChild('success',$message);
			
			$stmt->close();
		}
	}
	//else,  return an error in a table
	else {
		$message = "ERROR : filters database - Problem when trying to prepare the delete SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	return $xml_response;
}
?>