<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected user group
$user_group = $xml->user_group;

//Prepare the first node of the xml response (ready to print in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

//Call the function to modify the info
$message = set_user_group_info($mysqli, $user_group, $xml, $xml_response);
	
//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which set the list of rights for an user group (needs for the user_group,
//the name of the column in the database and the value of the right : R or W)
function set_user_group_info($mysqli, $user_group, $xml, $xml_response) {
	
	//Get the position
	$position = $xml->position;
	
	//Get the link
	$link = $xml->link;
	
	//Get the index position
	$index_position = $xml->index_position;
	
	//Avoid SQL injection
	$user_group = mysqli_real_escape_string($mysqli, $user_group);
	$position = mysqli_real_escape_string($mysqli, $position);
	$link = mysqli_real_escape_string($mysqli, $link);
	$index_position = mysqli_real_escape_string($mysqli, $index_position);
	
	//Prepare the request
	$sql = "UPDATE osot_user_groups SET position=?, link=?, index_position=? WHERE user_group=?";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {	
	
		//Parameters to insert into the request
		$stmt->bind_param("ssss", $position, $link, $index_position, $user_group);
	
		//Return an error message in XML
		if (! $stmt->execute()) {
			$message = "ERROR : osot_user_groups database - Problem when trying to update the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			//Close the call			
			$stmt->close();
			
			//Return a success message in XML
			$message = "SUCCESS : osot_user_groups database - Update successfully done.";
			$response = $xml_response->addChild('success',$message);
		}
	}
	// else, return an error message in XML
	else {
		$message = "ERROR : osot_user_groups database - Problem when trying to update the data into the database.";
		$response = $xml_response->addChild('error',$message);
	}
	//return the message
	return $xml_response;
}

?>