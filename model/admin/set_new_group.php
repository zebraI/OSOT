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
$message = set_new_group_info($mysqli, $user_group, $xml);

//If there are no errors, create a column in the field management table
if ((strpos($message, '0') == false)) {
	$message = set_new_table_columns_column($mysqli, $user_group);
}

//If there are no still errors, create a column in the admin_osot_user_group management table
if ((strpos($message, '0') == false)) {
	$message = set_new_admin_osot_user_groups_column($mysqli, $user_group);
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
function set_new_group_info($mysqli, $user_group, $xml) {
	
	//Get the position
	$position = $xml->position;
	
	//Get the link
	$link = $xml->link;
	
	//Get the index position
	$index_position = $xml->index_position;
	
	//Avoid SQL injection
	$user_group = mysqli_real_escape_string($mysqli, $user_group);
	$position = mysqli_real_escape_string($mysqli, $position);
	$index_position = mysqli_real_escape_string($mysqli, $index_position);
	
	//Prepare the request
	$sql = "INSERT INTO osot_user_groups (user_group, position, link, index_position) VALUES (?, ?, ?, ?)";

	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {	
	
		//Parameters to insert into the request
		$stmt->bind_param("ssss", $user_group, $position, $link, $index_position);
	
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
	// else, return a 0
	else {
		$message = "0";
	}
	//return the message
	return $message;
}


//--------------------------------------------------------------------------------
//Function which create a column in the field management table (table_columns)
function set_new_table_columns_column($mysqli, $user_group) {
	
	//Lowercase the user group
	$user_group = strtolower($user_group);
	
	//Just in case of need to activate mysqli error report
	// mysqli_report(MYSQLI_REPORT_ALL);
	
	//Define the name of the index column to create into the activesites table
	$user_group_index = $user_group . "_index";
	
	//Avoid SQL injection
	$user_group = mysqli_real_escape_string($mysqli, $user_group);
	$user_group_index = mysqli_real_escape_string($mysqli, $user_group_index);
	
	//Prepare the request
	$sql = "ALTER TABLE table_columns ADD $user_group VARCHAR(1) NOT NULL, ADD $user_group_index INT NOT NULL";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {	
	
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
	// else, return a 0
	else {
		$message = "0";
	}
	//return the message
	return $message;
}


//--------------------------------------------------------------------------------
//Function which create a column in the admin_osot_user_groups management table (user and right on groups)
function set_new_admin_osot_user_groups_column($mysqli, $user_group) {
	
	//Just in case of need to activate mysqli error report
	// mysqli_report(MYSQLI_REPORT_ALL);
	
	//Lowercase the user_group
	$user_group = strtolower($user_group);
	
	//Avoid SQL injection
	$user_group = mysqli_real_escape_string($mysqli, $user_group);
	
	//Prepare the request
	$sql = "ALTER TABLE admin_osot_user_groups ADD $user_group BOOLEAN NOT NULL";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {	
	
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
	// else, return a 0
	else {
		$message = "0";
	}
	//return the message
	return $message;
}



?>