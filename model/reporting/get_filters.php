<?php
include_once '../connectors/db_connect.php';


//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the user name
$user = $xml->user;

//Get the filter_name
$filter_name = $xml->parameter;

//Get the user parameter
$user_parameter = $xml->user_parameter;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

if ($filter_name == "") {
	//Call the function which return the filter names list
	$message = get_filter_names($mysqli, $user, $user_parameter, $xml_response);
}
else if ($filter_name !== "") {
	//Call the function which return the content of a filter
	$message = get_filter_details($mysqli, $user, $filter_name, $xml_response);
}

//Set header and print content
Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());


//---------------------------------------------------------------------------------------
//FUNCTIONS
//---------------------------------------------------------------------------------------
//Get list of all the filters names
function get_filter_names($mysqli, $user, $user_parameter, $xml_response) {
	
	if ($user_parameter == "more") {
		//Prepare SQL statement to select the lines where the filters don't belon to the user
		$sql = "SELECT DISTINCT filter_name, user FROM filters WHERE NOT user = '" . $user . "'";
	}
	else if ($user_parameter !== "more") {
		//Avoid SQL injection
		$user = mysqli_real_escape_string($mysqli, $user);
		
		//Prepare SQL statement to select the lines matching username and filter name
		$sql = "SELECT DISTINCT filter_name FROM filters WHERE user = '" . $user . "'";
	}

	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : filters database - Problem when trying to select the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			$stmt->store_result();
			
			//Link variables to the results (names of the filters) - 2 parameters the user_parameter is "more"
			if ($user_parameter == "more") {
				$stmt->bind_result($filter_name, $user);
			}
			else {
				$stmt->bind_result($filter_name);
			}
			
			//While there are results, generate new lines in the xml
			while ($stmt->fetch()) {
				//Add all the data related to the required filter names in the xml
				if (!empty($filter_name)) {
					$response = $xml_response->addChild('filter_name', $filter_name);
					
					//If user_parameter = more, add one more parameter (user_nameà)
					if ($user_parameter == "more") {
						$response = $xml_response->addChild('user', $user);
					}
				}
				//else,  return an error in the xml
				else {
					$message = "ERROR : filters database - User isn't in database.";
					$response = $xml_response->addChild('error',$message);
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error in a table
	else {
		$message = "ERROR : filters database - Problem when trying to prepare the select SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	
	return $xml_response;
}


//---------------------------------------------------------------------------------------
//Get the details of a fiter in the database
function get_filter_details($mysqli, $user, $filter_name, $xml_response) {
	
	//Avoid SQL injection
	$user = mysqli_real_escape_string($mysqli, $user);

	//Prepare SQL statement to select the lines matching username and filter name
	$sql = "SELECT field_name, field_value, button_value FROM filters WHERE user = '" . $user . "' and filter_name = '" . $filter_name . "'";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : filters database - Problem when trying to select the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			$stmt->store_result();
			
			//Link variables to the results (fields names, fields values and buttons values)
			$stmt->bind_result($field_name, $field_value, $button_value);
			
			//While there are results, generate new lines in the xml
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml
				if (!empty($field_name)) {
					$response = $xml_response->addChild('field_name', $field_name);
					$response = $xml_response->addChild('field_value', $field_value);
					$response = $xml_response->addChild('button_value', $button_value);
				}
				//else,  return an error in the xml
				else {
					$message = "ERROR : filters database - There was a problem at the creation of the filter into database.";
					$response = $xml_response->addChild('error',$message);
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error in a table
	else {
		$message = "ERROR : filters database - Problem when trying to prepare the select SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	
	return $xml_response;
}