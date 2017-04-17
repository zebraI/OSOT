<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the user name
$user = $xml->user;
	
//Get the filter name
$filter_name = $xml->filter_name;

//Get the number of fields into the filter
$fields_number = $xml->filter->count();

//Initialize the XML answer
$xml_response = new SimpleXMLElement('<xml/>');

$message = "";

//Function called to check if the filter already exists
$rows_number = check_filter_existence($mysqli, $user, $filter_name, $xml_response);

//If the filter doesn't exist insert each lines
if ($rows_number == 0) {
	//For each field get the field number and the field value; then, send it to the integration function
	for($i = 0; $i < $fields_number; $i++) {
		$field_name = $xml->filter[$i]->field_name;
		$field_value = $xml->filter[$i]->field_value;
		$button_value = $xml->filter[$i]->button_value;
		
		//Create the line
		$message = set_new_filter($mysqli, $user, $filter_name, $field_name, $field_value, $button_value, $xml_response, $i);
	}
}
//Else, insert an error message into the XML (written on a special way because of an XML generation bug)
else {
	$message = new SimpleXMLElement('<xml><error>ERROR : Impossible to save the filter - A filter with the same name already exists.</error></xml>');
}

//Set header and print content
Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());


//---------------------------------------------------------------------------------------
//FUNCTIONS
//---------------------------------------------------------------------------------------
//Check if a filter with the same name already exist for this user
function check_filter_existence($mysqli, $user, $filter_name, $xml_response) {

	//Avoid SQL injection
	$user = mysqli_real_escape_string($mysqli, $user);
	$filter_name = mysqli_real_escape_string($mysqli, $filter_name);

	//Prepare SQL statement to select the lines matching username and filter name
	$sql = "SELECT filter_name FROM filters WHERE user = '" . $user . "' and filter_name = '" . $filter_name . "'";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : filters database - Problem when trying to select the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			$stmt->store_result();
			
			//Get and return the number of lines
			$rows_number = $stmt->num_rows;
			
			// Close the SQL call
			$stmt->close();
			
			return $rows_number;
		}
	}
	//else,  return an error in a table
	else {
		$message = "ERROR : filters database - Problem when trying to prepare the select SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
}

//-----------------------------------------------------------
//Create a new line in the database
function set_new_filter($mysqli, $user, $filter_name, $field_name, $field_value, $button_value, $xml_response){

	//Avoid SQL injection
	$user = mysqli_real_escape_string($mysqli, $user);
	$filter_name = mysqli_real_escape_string($mysqli, $filter_name);
	$field_name = mysqli_real_escape_string($mysqli, $field_name);
	$field_value = mysqli_real_escape_string($mysqli, $field_value);
	$button_value = mysqli_real_escape_string($mysqli, $button_value);

	// SQL request
	$sql = "INSERT INTO filters (user, filter_name, field_name, field_value, button_value) VALUES (?, ?, ?, ?, ?)";	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Parameters to insert into the request
		$stmt->bind_param("sssss", $user, $filter_name, $field_name, $field_value, $button_value);
		
		//if it doesn't work, send an error
		if (! $stmt->execute()) {
			$message = "ERROR : filters database - Problem when trying to insert the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		//Close the call and send a success message
		else {
			$stmt->close();
			
			$message = "SUCCESS : filters database successfully updated - new filter created.";
			$response = $xml_response->addChild('success',$message);
		}
	}
	//if it doesn't work, send an error
	else {
		$message = "ERROR : filters database - Problem when trying to prepare the insert SQL request.";
		$response = $xml_response->addChild('error',$message);
	}

	//return the XML
	return $xml_response;
}


?>