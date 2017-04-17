<?php

require_once 'database_upload.php';

//####################################################################################################
//FUNCTIONS
//####################################################################################################

//Create an array and store it as a global variable
$GLOBALS['error_messages'] = array();

//--------------------------------------------------------------
//Checking of the table that gather the csv data
function file_inner_verifications($data, $head, $file_name, $file_url, $user, $mysqli) {


	//Get the number of arrays into the array
	$line_number = sizeof($data);
	
	//Set the number of errors to 0
	$error_number = 0;
	
	//Create the xml header
	$xml_response = new SimpleXMLElement('<xml/>');
	
	//Call the check header function (to verify if mandatory columns are there)
	$error_number = check_head($mysqli, $head, $xml_response, $error_number, 1);
	
	//For each table in the table (each line)
	for($i = 0; $i < $line_number;$i++) {
		
		//call verification functions (which return the error_number)
		$error_number = check_not_empty_string("", $data, "host_name", $i, $xml_response, $error_number, 100);
		$error_number = check_not_empty_string("", $data, "host_site_code", $i, $xml_response, $error_number, 100);
		// $error_number = check_not_empty($data, "site_acquisition_lead", $i, $xml_response, $error_number, 1);
		//Check that list of value isn't empty and contains right value
		$error_number = check_list_of_values($data, "site_acquisition_lead", $i, $xml_response, $error_number, get_list_of_values($mysqli, 13, ""));
		// $error_number = check_list_of_values($data, "tenure_type", $i, $xml_response, $error_number, get_list_of_values($mysqli, "tenure_type"));
		$error_number = check_not_empty_string($mysqli, $data, "thinxtra_site_id", $i, $xml_response, $error_number, 16);
		$error_number = check_unique($mysqli, "data_entry", $data, "thinxtra_site_id", $i, $xml_response, $error_number);
		$error_number = check_not_empty_string("", $data, "site_name", $i, $xml_response, $error_number, 100);
		// $error_number = check_not_empty_string("", $data, "site_address", $i, $xml_response, $error_number, "");
		// $error_number = check_not_empty_string("", $data, "suburb", $i, $xml_response, $error_number, "");
		// $error_number = check_not_empty_number($data, "postcode", $i, $xml_response, $error_number, "integer", "");
		$error_number = check_state($mysqli, $data, "state", $i, $xml_response, $error_number);
		// $error_number = check_list_of_values($data, "area_class", $i, $xml_response, $error_number, ["CBD", "OUTER", "METRO", "REGIONAL"]);
		$error_number = check_not_empty_number($data, "lat_decimal_degrees", $i, $xml_response, $error_number, "double", "");
		$error_number = check_not_empty_number($data, "lon_decimal_degrees", $i, $xml_response, $error_number, "double", "");
		// $error_number = check_list_of_values($data, "country", $i, $xml_response, $error_number, get_list_of_values($mysqli, 19, ""));
		// $error_number = check_not_empty_number($data, "ant_height_meters_agl", $i, $xml_response, $error_number, "integer", "");
		// $error_number = check_not_empty($data, "user", $i, $xml_response, $error_number, 1);
		// $error_number = check_unique($mysqli, "user", $data, "user", $i, $xml_response, $error_number);
	}
	
	//If errors, convert the XML into a text message and print the message in a log file and send a warning to the user interface
	if ($error_number !== 0) {

		//Delete the file
		unlink($file_url);
		
		//File log name
		$log_file_name = 'file_verifications_log-' . $file_name . '.txt';
		
		//File log URL
		$log_file_url = "../../uploaded_files/_logs/" . $log_file_name;
		
		//Create an empty log string
		$log_string = "";
		
		//For each error (each line into the global table), add it to the log string
		for($i = 0; $i < $error_number; $i++) {
			$log_string = $log_string . $GLOBALS['error_messages'][$i];
		}
		
		//Create an log file and append
		// $xml_save = file_put_contents($log_file_url, $xml_response->asXML().PHP_EOL , FILE_APPEND | LOCK_EX);
		
		// Create a new log file or erase the old one if it exists and fill with the log string
		$xml_save = file_put_contents($log_file_url, $log_string);
		
		//Create a second xml for returning to user interface
		$xml_response_html = new SimpleXMLElement('<xml/>');
		
		$response = $xml_response_html->addChild('error', 'Errors returned : ' . $error_number . ". To have more details, please download the log file.");
		$response = $xml_response_html->addChild('log_name', $log_file_name);
		Header('Content-type: text/xml; charset=utf-8');
		print($xml_response_html->asXML());	
	}
	//Else, send to upload (with the header)
	else {
		database_upload($file_name, $file_url, $data, $head, $user, $mysqli);
	}
}

//------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------
//Function which check the header to verify that the mandatory columns are present
function check_head($mysqli, $head, $xml_response, $error_number, $print_line) {
	
	//Function called to get an array of mandatory fields
	$mandatory_fields = get_mandatory_fields($mysqli);

	//Get the number of columns into the header
	$header_number = sizeof($head);
	
	//For each column of the header
	for($i = 0; $i < $header_number;$i++) {
		//If the name of the header column is a mandatory column name (it is in the array mandatory fields)
		if(in_array($head[$i], $mandatory_fields)) {
			//Remove it from the mandatory fields array
			$mandatory_fields = array_diff($mandatory_fields, array($head[$i]));			
		}
	}	

	//If mandatory fields array isn't empty : some mandatory columns are missing
	if(!(empty($mandatory_fields))) {
		//For each value in the mandatory fields array, create an error message and print it
		foreach ($mandatory_fields as $value) {	
			$error = "A mandatory column is missing -> " . $value;
					
			//Call a function to add the error to the xml and return the number of errors if the parameter print_line = 1	
			$error_number = print_xml(-1, "header", $error, $xml_response, $error_number, $print_line);
		}
	}
	
	//Return the error number
	return($error_number);
}


//------------------------------------------------------------------------------------------
//Function which verify that the column isn't empty and is a string (call one function depending on another)
// String_size is the maximum size the string should be
function check_not_empty_string($mysqli, $data, $column, $line, $xml_response, $error_number, $string_size) {
	
	//Call the function to check if a field isn't empty (return an error_number)
	$new_error_number = check_not_empty($data, $column, $line, $xml_response, $error_number, 1);
	
	//If the field isn't empty (same error number), check if it's a string
	if ($error_number == $new_error_number) {
		$error_number = check_string($data, $column, $line, $xml_response, $error_number, 1);

		// check the size if there is one
		if (($string_size !== "") && ($error_number == $new_error_number)) {
			$error_number = check_size($data, $column, $line, $xml_response, $error_number, 1, $string_size);
		}
	}
	//else put the new error_number into error_number to return it
	else {
		$error_number = $new_error_number;
	}

	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which verify that the column isn't empty and is a number (call one function depending on another)
// Number_size is the maximum size the string should be
function check_not_empty_number($data, $column, $line, $xml_response, $error_number, $number_type, $number_size) {
	
	//Call the function to check if a field isn't empty (return an error_number)
	$new_error_number = check_not_empty($data, $column, $line, $xml_response, $error_number, 1);
	
	//If the field isn't empty (same error number), check if it's a number
	if ($error_number == $new_error_number) {
		$error_number = check_number($data, $column, $line, $xml_response, $error_number, 1, $number_type);
	
		// check the size if there is one
		if (($number_size !== "") && ($error_number == $new_error_number)) {
			$error_number = check_size($data, $column, $line, $xml_response, $error_number, 1, $number_size);
		}
	}
	//else put the new error_number into error_number to return it
	else {
		$error_number = $new_error_number;
	}

	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which verify that the column isn't empty - to use when their is only this to verify (need the table [data], the column name,
//the line number, the xml_response already written, the error number and a parameter to define if it should print a line in XML
function check_not_empty($data, $column, $line, $xml_response, $error_number, $print_line) {
	//Check if the column isn't empty
	if(empty($data[$line][$column])) {
		$error = $column . " column is empty or missing.";
			
		//Call a function to add the error to the xml and return the number of errors if the parameter prin_line = 1	
		$error_number = print_xml($line, $column, $error, $xml_response, $error_number, $print_line);
	}
	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which verify that the column is a string
function check_string($data, $column, $line, $xml_response, $error_number, $print_line) {
	
	//Check if the column is a string
	if(!is_string($data[$line][$column])) {
		$error = $column . " column contains more characters than authorized.";
			
		//Call a function to add the error to the xml
		$error_number = print_xml($line, $column, $error, $xml_response, $error_number, $print_line);
	}
	
	//Return the number of errors
	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which verify that the column contains a number
//------------------------------------------------------------------------------------------
function check_number($data, $column, $line, $xml_response, $error_number, $print_line, $number_type) {
	//Check if the column is a number depending on the number type
	
	if ($number_type == "integer") {
		// If the string an int, call a function to add the error to the xml 
		if(ctype_digit($data[$line][$column]) !== true) {
			$error = $column . " column countains other characters than number or isn't in the right format (" . $number_type . ").";
			$error_number = print_xml($line, $column, $error, $xml_response, $error_number, $print_line);
		}
	}
	else if ($number_type == "double") {
		// If the string isn't numeric (int or float), call a function to add the error to the xml 
		if (is_numeric($data[$line][$column]) !== true) {
			$error = $column . " column contains other characters than number or isn't in the right format (" . $number_type . ").";
			$error_number = print_xml($line, $column, $error, $xml_response, $error_number, $print_line);
		}
	}
	
	//return the number of errors
	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which check the size of a string/number
//------------------------------------------------------------------------------------------
function check_size($data, $column, $line, $xml_response, $error_number, $print_line, $string_size) {
	
	//Check the size of the string
	if((strlen($data[$line][$column])) > $string_size) {
		$error = $column . " column contains more characters than authorized.";
			
		//Call a function to add the error to the xml and return the number of errors
		$error_number = print_xml($line, $column, $error, $xml_response, $error_number, $print_line);
	}
	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which verify that the column countains a value of the list of values
//------------------------------------------------------------------------------------------
function check_list_of_values($data, $column, $line, $xml_response, $error_number, $list_of_values) {

	//Call the function to check if a the field  tenure_type isn't empty (return an error_number)
	$new_error_number = check_not_empty($data, $column, $line, $xml_response, $error_number, 1);
	
	//If it exists, check if it is into the list of values
	if(($new_error_number == $error_number)) {
		
		//Get the number of values and define no_error variable
		$values_number = sizeof($list_of_values);
		$no_error = 0;
		
		//For each table in the table (each line)
		for($i = 0; $i < $values_number;$i++) { 

			if(strtolower($data[$line][$column]) == strtolower($list_of_values[$i])) {
				$no_error = 1;
			}
		}
		
		if ($no_error ==0) {
			
			$error = $column . " column doesn't contain authorized value.";
					
			//Call a function to add the error to the xml and return the number of errors
			$error_number = print_xml($line, $column, $error, $xml_response, $error_number, 1);
		}		
			
	}
	//else put the new error_number into error_number to return it
	else {
		$error_number = $new_error_number;
	}
	
	return($error_number);
}

//------------------------------------------------------------------------------------------
//Function which verify that the thinxtra site id is unique
function check_unique($mysqli, $database_table, $data, $column, $line, $xml_response, $error_number) {

	//Call the function to check if a the required column isn't empty (return an error_number)
	$new_error_number = check_not_empty($data, $column, $line, $xml_response, $error_number, 1);
	
	//If it exists, check if it is into the list of values
	if(($new_error_number == $error_number)) {

		// Select the matching thinxtra site ids into the SQL request
		$sql = "SELECT $column FROM $database_table WHERE $column = '" . $data[$line][$column] . "'";
		
		//SQL call
		if ($stmt = $mysqli->prepare($sql)) {		
			if (! $stmt->execute()) {
				echo "ERROR : list_of_values database - Problem when trying to select the columns data into the database.";
			}
			else {
				$stmt->store_result();
									
				//Link variables to the results (values)
				$stmt->bind_result($result);
				
				$stmt->fetch();
		
				//If a a code already exists
				if ($column == "thinxtra_site_id" && ($stmt->num_rows > 0)) {
					$error = $column . " already exists in database.";
						
					//Call a function to add the error to the xml and return the number of errors
					$error_number = print_xml($line, $column, $error, $xml_response, $error_number, 1);
				}
				
				else if ($column == "user" && ($stmt->num_rows !== 1)) {
					$error = $column . " doesn't exit into the database.";
						
					//Call a function to add the error to the xml and return the number of errors
					$error_number = print_xml($line, $column, $error, $xml_response, $error_number, 1);
				}
			}
		}
		//else, return an error
		else {
			echo "ERROR : list_of_values database - Problem when trying to prepare the SQL request.";
		}
	}
	
	//else put the new error_number into error_number to return it
	else {
		$error_number = $new_error_number;
	}
	
	return($error_number);
}


//------------------------------------------------------------------------------------------
//Function which verify that the column country and state aren't empty and they countain authorized value
function check_state($mysqli, $data, $column, $line, $xml_response, $error_number) {
	
	//Call the function to check if a the field country isn't empty and if it's an authorized value
	//If not, write the error. (always, return an error_number)
	$new_error_number = check_list_of_values($data, "country", $line, $xml_response, $error_number, get_list_of_values($mysqli, 19, ""));

	//If the country field isn't empty, call the function to check if state is an authorize value
	if ($new_error_number == $error_number)	{
		//Get the country name into lowercase (SQL queries are case insensitive)
		$country_name = strtolower($data[$line]["country"]);

		//Get the id of the country (19 is id of list of values "country")
		$parent_id = get_id($mysqli, $country_name, 19);
		
		//Get the list of values of states corresponding to this country (20 is id of list of values "state")
		$state_values = get_list_of_values($mysqli, 20, $parent_id);
		
		//If the list of values exists, check that the state column isn't empty and that it's part of the list of values
		//Else do nothing (just return the error number)
		if (!(empty($state_values))) {
			$old_error_number = $error_number;
			$error_number = check_not_empty($data, $column, $line, $xml_response, $error_number, 1);
			
			if ($old_error_number == $error_number) {
				$error_number = check_list_of_values($data, $column, $line, $xml_response, $error_number, $state_values);
			}
		}	
	}
	
	return($error_number);
}

//-----------------------------------------------------------------------------
//Function which return the list of values wanted (called with the list id and the parent id if existing)
function get_list_of_values($mysqli, $list_id, $parent_id) {

	//SQL injection protection
	$list_id = mysqli_real_escape_string($mysqli, $list_id);

	// Select the object into the SQL request if parent_id is not set
	if($parent_id == "") {
		$sql = "SELECT value FROM list_of_values WHERE idListOfValues = '" . $list_id . "'";
	}
	//Else select the values of the list of values depending of the parent_id
	else {
		$parent_id = mysqli_real_escape_string($mysqli, $parent_id);
		$sql = "SELECT value FROM list_of_values WHERE idListOfValues = '" . $list_id . "' AND parentValue = '" . $parent_id . "'";
	}
		
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			echo "ERROR : list_of_values database - Problem when trying to select the columns data into the database.";
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (values)
			$stmt->bind_result($value);

			//Create the array of values
			$value_array = array();
			
			//While there are results, generate new lines in the array
			while ($stmt->fetch()) {
				//Add all the data related into the array of value
				if (!empty($value)) {
					array_push($value_array, $value);
				}
				//else,  return an error
				else {
					echo "ERROR : list_of_values database - List of values doesn't exist.";
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error
	else {
		echo "ERROR : list_of_values database - Problem when trying to prepare the SQL request.";
	}
	
	//return the array of values
	return $value_array;
}



//------------------------------------------------------------------------------------------
//Function which get the mandatory fields
function get_mandatory_fields($mysqli) {

	//Create an empty array to store results
	$mandatory_fields = array();

	// Select the column_name of the mandatory fields
	$sql = "SELECT column_name FROM table_columns WHERE importance = 'mandatory'";

	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			echo "ERROR : table_columns database - Problem when trying to get the mandatory fields from the database.";
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (id)
			$stmt->bind_result($mandatory_column_name);
			
			while ($stmt->fetch()) {
				array_push($mandatory_fields, $mandatory_column_name);
			}
			
			$stmt->close();
		}
	}
	//else,  return an error
	else {
		echo "ERROR : table_columns database - Problem when trying to prepare the SQL request to get the mandatory fields from the database.";
	}
	
	//return the id
	return $mandatory_fields;
	
}

//------------------------------------------------------------------------------------------
//Function which get the id of a value of the list of values (list_id in input to get sure of the retuned value)
function get_id($mysqli, $value, $list_id) {
	
	//SQL injection protection
	$value = mysqli_real_escape_string($mysqli, $value);
	$list_id = mysqli_real_escape_string($mysqli, $list_id);

	// Select the id of the value
	$sql = "SELECT idValues FROM list_of_values WHERE idListOfValues = '" . $list_id . "' AND value = '" . $value . "'";

	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			echo "ERROR : list_of_values database - Problem when trying to get the id of a value into the database.";
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (id)
			$stmt->bind_result($id_value);
			$stmt->fetch();
			$stmt->close();
		}
	}
	//else,  return an error
	else {
		echo "ERROR : list_of_values database - Problem when trying to prepare the SQL request to get the id of a value into the database.";
	}
	
	//return the id
	return $id_value;
	
}



//------------------------------------------------------------------------------------------
//Function which add xml nodes for each errors (called by all the verification functions)
function print_xml($line, $column, $error, $xml_response, $error_number, $print_line) {
	if ($print_line == 1) {
		
		//Create a log message (text) and push it into the array stored as a global variable
		$log_message = "Line " . ($line+2) .  " - " . $column . " column : " . $error . "\n";
		array_push($GLOBALS['error_messages'], $log_message);
		
		//Add XML nodes and complete information
		$response = $xml_response->addChild('line_'. ($line+2));
		$column = $response->addChild($column . '_column');
		$response = $column->addChild('error',$error);
	}
	
	$error_number += 1;
	
	return($error_number);
}

?>