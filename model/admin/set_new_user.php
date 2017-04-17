<?php
include_once '../connectors/db_connect.php';
include_once '../get_user_groups.php';
include_once '../connection_process/process_registration.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected mail (user id)
$mail = $xml->mail;

//Get the user password
$password = $xml->p;

//Get the user group number
$user_group_number = $xml->user_group->user_group_name->count();
	

//Prepare the first node of the xml response (ready to print in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');


//If the mail and the password aren't empty, check the size and the inexistence of the user
if ((!empty($mail)) && !(empty($password))) {
	$message = check_password_size_and_user_existence($mysqli, $mail, $password);
}
else {
	$message = "11";
}

//If the mail and the password aren't empty and no errors before, insert into the database
if ((!empty($mail) && !empty($password)) && ($message == -1)) {
	$message == "";
	$message = set_user_authentication($mysqli, $mail, $password);
}


//If there were no errors, send the user info to the database
if ($message == -1) {
	$message == "";
	$message = set_new_user($mysqli, $mail, $xml);
}

//If at least one user group is set, extract it and send it to the database (different db)
if (($user_group_number > 0) && ($message == -1)) {
	$message == "";
	$message = set_user_group($mysqli, $mail, $xml, $xml_response);
}


// Manage the errors/success message into the response (regenerate an XML to avoid mistakes)
message_management($message, $xml_response);

	
//Print as XML
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());



//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which update the user information
function set_new_user($mysqli, $mail, $xml) {
	
	//Prepare 1st SQL to insert the user into the list of values
	$sql = "INSERT INTO list_of_values (idListOfValues, listName, value) VALUES ('13', 'site_acquisition_lead', ?)";
	
	//1st SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Parameters to insert into the request
		$stmt->bind_param("s", $mail);
		
		//if it doesn't work, send an error
		if (! $stmt->execute()) {
			$message = "13";
		}
		//Close the call and send a success message
		else {
			$message = "-1";
		}
	}
	//if it doesn't work, send an error
	else {
		$message = "12";
	}
	
	
	//If there were no errors, insert the user info into the related table
	if($message == "-1") {
		//Get the user data
		$name = $xml->name;
		$phone = $xml->phone;
		$address = $xml->address;
		
		//Avoid SQL injection
		$name = mysqli_real_escape_string($mysqli, $name);
		$phone = mysqli_real_escape_string($mysqli, $phone);
		$address = mysqli_real_escape_string($mysqli, $address);
		$mail = mysqli_real_escape_string($mysqli, $mail);
		
		//Prepare 2nd SQL statement to insert the user info
		$sql = "INSERT INTO admin_osot_user_info (mail, name, phone, address) VALUES (?, ?, ?, ?)";

		//2nd SQL call
		if ($stmt = $mysqli->prepare($sql)) {
			//Parameters to insert into the request
			$stmt->bind_param("ssss",  $mail, $name, $phone, $address);
			
			//if it doesn't work, send an error
			if (! $stmt->execute()) {
				$message = "7";
			}
			//Close the call and send a success message
			else {
				$stmt->close();
				
				$message = "-1";
			}
		}
		//if it doesn't work, send an error
		else {
			$message = "8";
		}
	}

	//return the XML
	return $message;
}


//--------------------------------------------------------------------------------
//Function which insert user into the user group table the user group
function set_user_group($mysqli, $mail, $xml, $xml_response) {
	
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
	
	//For each selected user group, get the user group
	for ($i = 0; $i< $user_group_number; $i++) {
		//Get the user group and create it into the db
		$user_group = $xml->user_group->user_group_name[$i];
		
		//For each columns into the table, check if the extracted user group is equal to a column name
		//Then, input 1 in the boolean table(else empty)
		for ($j = 0; $j< $table_size; $j++) {
			if ($user_group == $table[$j]) {
				$boolean_table[$j] = 1;
			}
		}
	}
	
	// for ($i = 0; $i< $table_size; $i++) {
		// if (empty($boolean_table[$i]) === true) {
			// $boolean_table[$i] = 0;
		// }
	// }
	
	//---------------Management of the undefined number of variables into the SQL call
	//String that indicate the list of the column in which data should be inserted
	$column_names_sql = "mail";
	
	//String which contains the number of values to be inserted with the format : ?, ?, ?, ? (already one, for the mail - user id)
	$column_values_sql = "?";
	
	//String which countains the number of value types (already one, for the mail - user id)
	$type = "s";
	
	//Array with the values to insert (already one, for the mail - user id)
	$values = array($mail->__toString());
	
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
		
		//Complete the column_names string with the values of the columns table, create a string with "?, ?"... and another with "sss..."
		$column_names_sql = $column_names_sql . ", " . $table[$i];
		$column_values_sql = $column_values_sql . ", ?";
		$type = $type . "s";
	}
	
	//Avoid SQL injection
	$column_names_sql = mysqli_real_escape_string($mysqli, $column_names_sql);
	$column_values_sql = mysqli_real_escape_string($mysqli, $column_values_sql);
	$type = mysqli_real_escape_string($mysqli, $type);
	
	//Push the type string into the type array for having the parameters
	array_push($types,  $type);
	
	// Generate the XML with the column name variable and the column values
	$sql = "INSERT INTO admin_osot_user_groups ($column_names_sql) VALUES ($column_values_sql)";
	
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
			$response = "9";
		}
		//Close the call and send 1
		else {
			$stmt->close();
			
			$response = "-1";
		}
	}
	//if it doesn't work, send a 0
	else {
		$response = "10";
	}
	
	//return the message or the xml XML
	return $response;
}


//--------------------------------------------------------------------------------
//Function which manage the message (error, success) display
function message_management($message, $xml_response) {
	if ($message == 1) {
		$message = "ERROR : password too long (more than 255 characters).";
	}
	else if ($message == 2) {
		$message = "ERROR : admin_osot_user database - problem when executing select request.";
	}
	else if ($message == 3) {
		$message = "ERROR : admin_osot_user database - problem when preparing select request.";
	}
	else if ($message == 4) {
		$message = "ERROR : user already existing in database.";
	}
	else if ($message == 5) {
		$message = "ERROR : admin_osot_user database - problem when executing insert request.";
	}
	else if ($message == 6) {
		$message = "ERROR : admin_osot_user database - problem when preparing insert request.";
	}
	else if ($message == 7) {
		$message = "ERROR : admin_osot_user_info database - problem when executing insert request.";
	}
	else if ($message == 8) {
		$message = "ERROR : admin_osot_user_info database - problem when preparing insert request.";
	}
	else if ($message == 9) {
		$message = "ERROR : admin_osot_user_groups database - problem when executing insert request.";
	}
	else if ($message == 10) {
		$message = "ERROR : admin_osot_user_groups database - problem when preparing insert request.";
	}
	else if ($message == 11) {
		$message = "ERROR : empty password or mail.";
	}
	else if ($message == 12) {
		$message = "ERROR : list_of_values database - problem when preparing insert request (user creation).";
	}
	else if ($message == 13) {
		$message = "ERROR : list_of_values database - problem when executing insert request (user creation).";
	}
	
	if ($message == -1) {
		$message = "SUCCESS : user_admin databases successfully updated.";
		$response = $xml_response->addChild('success',$message);
	}
	else {
		$response = $xml_response->addChild('error',$message);
	}
	
	return $response;
}

?>