<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected user group
$user_group = $xml->user_group;

//Get the number of read rights
$read_right_number = $xml->read->read_right->count();

//Get the number of write rights
$write_right_number = $xml->write->write_right->count();

//Get the number of empty rights
$empty_right_number = $xml->empty->empty_right->count();

//For each read right, get the name of the read right and send it to the function with "R" argument
for ($i = 0; $i < $read_right_number; $i++) {
	$read_right = $xml->read->read_right[$i];
	$message = set_user_group_right($mysqli, $user_group, $read_right, "R");
}

//If there are no errors
if ((strpos($message, '0') == false)) {
	//For each write right, get the name of the write right and send it to the function with "W" argument
	for ($i = 0; $i < $write_right_number; $i++) {
		$write_right = $xml->write->write_right[$i];
		$message = set_user_group_right($mysqli, $user_group, $write_right, "W");
	}
}

//If there are no errors
if ((strpos($message, '0') == false)) {
	//For each empty right, get the name of the empty right and send it to the function with "" argument
	for ($i = 0; $i < $empty_right_number; $i++) {
		$empty_right = $xml->empty->empty_right[$i];
		$message = set_user_group_right($mysqli, $user_group, $empty_right, "");
	}
}
	
//Manage the errors into the message (generate an XML)
if (strpos($message, '0') == true) {
	$xml_response = new SimpleXMLElement('<xml><error>ERROR : table_columns database - Problem with the SQL request.</error></xml>');
}
else {
	$xml_response = new SimpleXMLElement('<xml><success>SUCCESS : table_columns database successfully updated.</success></xml>');
}
	
//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which set the list of rights for an user group (needs for the user_group,
//the name of the column in the database and the value of the right : R or W)
function set_user_group_right($mysqli, $user_group, $column_name, $right_value) {
	
	//Avoid SQL injection
	$user_group = mysqli_real_escape_string($mysqli, $user_group);
	$column_name = mysqli_real_escape_string($mysqli, $column_name);
	$right_value = mysqli_real_escape_string($mysqli, $right_value);
	
	//Preapre the request
	$sql = "UPDATE table_columns SET $user_group=? WHERE column_name=?";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {	
	
		//Parameters to insert into the request
		$stmt->bind_param("ss", $right_value, $column_name);
	
		//Return a 0
		if (! $stmt->execute()) {
			$message = "0";
		}
		else {
			//Close the call			
			$stmt->close();
			
			//Return a 1
			$message = "1";
		}
	}
	// else,  return a 0
	else {
		$message = "0";
	}
	//return the message
	return $message;
}

?>