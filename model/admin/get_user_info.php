<?php
include_once '../connectors/db_connect.php';
include_once '../get_user_groups.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected mail (if "ALL", return all mails)
$mail = $xml->mail;

//Prepare the first node of the xml response (ready to print in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

if ($mail == "ALL") {
	$message = get_user_list($mysqli, $xml_response);
}
else {
	$message = get_user_info($mysqli, $mail, $xml_response);
}
	
//Print as json
$json = json_encode($message, JSON_PRETTY_PRINT);
echo $json;



//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which return the list of all users (if mail is all)
function get_user_list($mysqli, $xml) {
	
	// Select the object into the SQL request
	$sql = "SELECT mail FROM admin_osot_user";
	
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : admin_osot_user database - Problem when trying to select the columns data into the database.";
			$response = $xml->addChild('error',$message);
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (columns_names)
			$stmt->bind_result($mail);

			
			//While there are results, generate new lines in the xml
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml
				if (!empty($mail)) {
					$response = $xml->addChild('mail', $mail);
				}
				//else,  return an error in the xml
				else {
					$message = "ERROR : admin_osot_user database - No users.";
					$response = $xml->addChild('error',$message);
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error in the xml
	else {
		$message = "ERROR : admin_osot_user database - Problem when trying to prepare the SQL request.";
		$response = $xml->addChild('error',$message);
	}
	//return the xml
	return $xml;
}


//--------------------------------------------------------------------------------
//--------------------------------------------------------------------------------
//Function which return the information linked to an user (if mail is all)
function get_user_info($mysqli, $mail, $xml) {
	
	//---------------GET USER DATA
	// Select all the user data into into the db except user groups
	$sql = "SELECT name, phone, address FROM admin_osot_user_info WHERE mail = '" . $mail . "'";
	
	//SQL call to bring back the user data except the user groups
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : admin_osot_user_info database - Problem when trying to select the columns data into the database.";
			$response[0] = $message;
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (columns_names)
			$stmt->bind_result($name, $phone, $address);
			
			//While there are results, generate new lines in the table
			while ($stmt->fetch()) {
				//Add all the data related to the required object in a table
				$response["name"] = $name;
				$response["phone"] = $phone;
				$response["address"] = $address;
			}
			$stmt->close();
		}
	}
	//else,  return an error in the table
	else {
		$message = "ERROR : admin_osot_user_info database - Problem when trying to prepare the SQL request.";
		$response[0] = $message;
	}
	
	
	
	//---------------GET USER GROUPS
	//Create an empty XML response to be able to access the user_group_list function
	$xml_response = "";
	//Get a table containing all the user groups
	$table = get_user_group_list($mysqli, $xml_response, "table");
	
	//Get the number of columns
	$table_size = count($table);
	
	$column_names_sql = "";
	
	
	//For each existing column
	for ($i = 0; $i< $table_size; $i++) {	

		//Management of the comma in the request
		$comma = ", ";
		if ($i == 0) {
			$comma = "";
		}
		
		//Complete the column_names string with the values of the columns table, create a string with "?, ?"... and another with "sss..."
		$column_names_sql = $column_names_sql . $comma . $table[$i];
	}
	
	//Get the user groups related to the user
	$sql = "SELECT admin, $column_names_sql FROM admin_osot_user_groups WHERE mail = '" . $mail . "'";

	//SQL call to bring back the user groups
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : admin_osot_user_groups database - Problem when trying to select the columns data into the database.";
			$response[0] = $message;
		}
		else {
			
			// Get metadata for column names
			$meta = $stmt->result_metadata();

			// Dynamically create an array of variables to use to bind the results (linked with the column name)
			while ($column = $meta->fetch_field()) { 
				$var = $column->name; 
				$$var = null; 
				$columns[$var] = &$$var;
			}

			
			// bind results (link result with column names)
			call_user_func_array(array($stmt,'bind_result'),$columns);
			
			// Fetch Results 
			$i = 0;
			$j = 0;
			while ($stmt->fetch()) {
				
				//While there are results, for each couple column_name => values
				//If the value is equal to one, insert the key (rfp, installation...) in the $response table
				foreach($columns as $k => $v)
					if ($v == 1) {
						$response["user_group"][$j] = $k;
						$j++;
					}
				$i++;
			}
			$stmt->close();
		}
	}
	//else,  return an error in the table
	else {
		$message = "ERROR : admin_osot_user_groups database - Problem when trying to prepare the SQL request.";
		$response[0] = $message;
	}
	
	
	//return the table
	return $response;
}


?>