<?php
include_once '../connectors/db_connect.php';
include_once '../get_user_groups.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected mail (user id)
$mail = $xml->mail;

//Define a default user group number value equal to 0
$user_group_number = 0;

//Get the user group number if it is set
if (isset ($xml->user_group->user_group_name)) {
	$user_group_number = $xml->user_group->user_group_name->count();
}	

//Prepare the first node of the xml response (ready to rint in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

//Send the user info to the database
$message = set_existing_user($mysqli, $mail, $xml, $xml_response);

//If at least one user group is set, extract it and send it to the database (different db)
if (($user_group_number > 0) && (strpos($message, 'ERROR') == false)) {
	$response = set_existing_user_group($mysqli, $mail, $xml, $xml_response);
	
	//Manage the errors into the response (regenerate an XML to avoid mistakes)
	if (strpos($response, '0') == true) {
		$xml_response = new SimpleXMLElement('<xml><error>ERROR : admin_osot_user_info database - Problem with the SQL request.</error></xml>');
	}
	else {
		$xml_response = new SimpleXMLElement('<xml><success>SUCCESS : user databases successfully updated.</success></xml>');
	}
}
	

// echo($message);
//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which update the user information
function set_existing_user($mysqli, $mail, $xml, $xml_response) {
	
	//Get the user data
	$name = $xml->name;
	$phone = $xml->phone;
	$address = $xml->address;
	
	//Avoid SQL injection
	$name = mysqli_real_escape_string($mysqli, $name);
	$phone = mysqli_real_escape_string($mysqli, $phone);
	$address = mysqli_real_escape_string($mysqli, $address);
	$mail = mysqli_real_escape_string($mysqli, $mail);
	
	//Prepare SQL statement to update the user info
	$sql = "UPDATE admin_osot_user_info SET name=?, phone=?, address=? WHERE mail=?";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Parameters to insert into the request
		$stmt->bind_param("ssss", $name, $phone, $address, $mail);
		
		//if it doesn't work, send an error
		if (! $stmt->execute()) {
			$message = "ERROR : admin_osot_user_info database - Problem when trying to update the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		//Close the call and send a success message
		else {
			$stmt->close();
			
			$message = "SUCCESS : admin_osot_user_info database successfully updated.";
			$response = $xml_response->addChild('success',$message);
		}
	}
	//if it doesn't work, send an error
	else {
		$message = "ERROR : admin_osot_user_info database - Problem when trying to prepare the update SQL request.";
		$response = $xml_response->addChild('error',$message);
	}

	//return the XML
	return $xml_response;
}


//--------------------------------------------------------------------------------
//Function which modify user_groups for an user
function set_existing_user_group($mysqli, $mail, $xml, $xml_response) {

	//Manage the special case of the admin
	$admin_table[0] = "admin";
	
	//Get a table containing all the user groups
	$table = get_user_group_list($mysqli, $xml_response, "table");
	
	//Merge admin table and the table containing all the user groups to add "admin" as user_group into the array
	$table = array_merge($admin_table, $table);

	//--------------Conversion from a name to a boolean int of the user group value
	//Get the number of columns
	$table_size = count($table);
	
	//Create a empty boolean table
	$boolean_table = [];
	
	//Get the user group number
	$user_group_number = $xml->user_group->user_group_name->count();
	
	//For each selected user group, get the user group (in lowercase)
	for ($i = 0; $i< $user_group_number; $i++) {
		//Get the user group and create it into the db
		$user_group = strtolower($xml->user_group->user_group_name[$i]);
		
		//For each columns into the table, check if the extracted user group is equal to a column name
		//Then, input 1 in the boolean table(else empty)
		for ($j = 0; $j< $table_size; $j++) {
			if ($user_group == $table[$j]) {
				$boolean_table[$j] = 1;
			}
		}
	}
	
	//---------------Management of the undefined number of variables into the SQL call
	//String that indicate the list of the column in which data should be inserted
	$column_names_sql = "";
	//String which countains the number of value types (already one, for the mail - user id)
	$type = "s";
	//Array with the values to insert
	$values = array();
	//Array with the types of the values to insert
	$types = array();
	
	//For each existing column
	for ($i = 0; $i< $table_size; $i++) {
		//If the boolean table element is empty, print 0
		if (empty($boolean_table[$i]) === true) {
			array_push($values,  "0");
		}
		//Else, print 1
		else {
			array_push($values,  "1");
		}
		
		//Set if there is a comma or not into the request
		$comma = ", ";
		if ($i == 0) {
			$comma = "";
		}
		
		//Complete the column_names string with the values of the columns table, create a string with "?, ?"... and another with "sss..."
		$column_names_sql = $column_names_sql . $comma . $table[$i] . "=?";
		$type = $type . "s";
	}
	
	//Push the mail into the array of values
	array_push($values, $mail->__toString());
	
	//Avoid SQL injection
	$column_names_sql = mysqli_real_escape_string($mysqli, $column_names_sql);
	$type = mysqli_real_escape_string($mysqli, $type);
	
	//Push the type string into the type array for having the parameters
	array_push($types,  $type);
	
	// Generate the XML with the column name variable and the column values
	$sql = "UPDATE admin_osot_user_groups SET $column_names_sql WHERE mail=?";

	
	//Create a temporary array with the references to the array (necessary to use "call_user_func_array" and use a random number of variables)
	$params = array_merge($types, $values);
	$tmp = array();
		
	foreach($params as $key => $value) {
		$tmp[$key] = &$params[$key];
	}
	
	//---------------SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//"call_user_func_array" is mandatory to manage a number of variables which can change
		call_user_func_array(array($stmt, 'bind_param'), $tmp);

		//if it doesn't work, send a 0
		if (! $stmt->execute()) {
			$response = "0";
		}
		//Close the call and send 1
		else {
			$stmt->close();
			
			$response = "1";
		}
	}
	//if it doesn't work, send a 0
	else {
		$response = "0";
	}
	
	//return the message or the xml XML
	return $response;
}


?>