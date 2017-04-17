<?php
include_once 'connectors/db_connect.php';


//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the thinxtra site id
$thinxtra_site_id = $xml->site->thinxtra_site_id;

// Get the number of fields
$fields = $xml->site->data;
$fields_number = $fields->count();



// If there is no line, create one; else update the existing one.
if ($thinxtra_site_id == "new") {
	$message = set_new_tab_fields_info($mysqli, $fields_number, $xml);
}
else {
	$message = set_existing_tab_fields_info($mysqli, $fields_number, $thinxtra_site_id, $xml);
}

//Convert the array into a readable message
$message = implode ("\n", $message);

$xml_response = new SimpleXMLElement('<xml/>');
if($message == "") {
	$response = $xml_response->addChild('success','Data succesfully saved.');
}
else { 
	$response = $xml_response->addChild('error',$message);
}

//Set header and print content
Header('Content-type: text/xml; charset=utf-8');
print($xml_response->asXML());


//--------------------------------------------------------------------------------
//Create a new line in the database
function set_new_tab_fields_info($mysqli, $fields_number, $xml){
	
	//Get the user name (for log purpose)
	$user = $xml->user;
	//Get the UNIX timestamp (for log purpose)
	$now = time();
	//Format it (for log purpose)
	$now_formated = date("Y-m-d H:i:s",$now);
	
	//Create an empty return messages array
	$messages = array();
	
	//Create empty arrays to contain the values and the fields
	$values = array();
	$field_names = array();
	
	//Initialize $j to have a logical table index for fields_table
	$j = 0;
	
	//For each field, get the field_name (front_end) and the value; convert it to text and fill the table if the value isn't empty
	for ($i = 0; $i < $fields_number; $i++) {
		$field_name = $xml->site->data[$i]->field_name->__toString();
		$value = $xml->site->data[$i]->value->__toString();

		//Fill the fields and values table if values isn't empty
		if($value !== "") {
			$values[$field_name] = $value;
			$field_names[$j] = $field_name;
			$j++;
		}
	}
	
	//Get the thinxtra site id (for log purpose)
	$thinxtra_site_id = $values["thinxtra_site_id"];
	

	//----1st SQL call to get the table names and location levels related to a column
	//Get the number of columns in the values table
	$values_number = count($values);
		
	//String that indicates the number of data to select (WHERE back_end_name =  ? AND back_end_name =? AND ...)
	$fields_number_sql = "";
	//String which countains the number of value types
	$type = "";
	//Array with the types of the values to insert
	$types = array();
	
	
	// Extract the fields names (to generate the SQL request)
	for($i = 0; $i < $values_number; $i++) {
		//Get the field names for $i and the value for the related field_name
		$field_name = $field_names[$i];
		
		//Add back_end_name=? to the string and manage the OR case (no more OR at the end)
		if ($i !== ($values_number -1)) {
			$fields_number_sql = $fields_number_sql . "back_end_name=? OR ";
		}
		else if ($i == ($values_number -1)) {
			$fields_number_sql = $fields_number_sql . "back_end_name=?";
		}
		
		//Add a string type into the type string for every variables (parameters)
		$type = $type . "s";
	}
			
	//Protection against SQL injection
	$fields_number_sql = mysqli_real_escape_string($mysqli, $fields_number_sql);
	$type = mysqli_real_escape_string($mysqli, $type);

	
	//Push the type string into the type array for being able to merge type and values array afterwards
	array_push($types, $type);
	
	//Create a temporary array with the references to the array (necessary to use "call_user_func_array" and use a random number of variables)
	$params = array_merge($types, $field_names);
	$tmp = array();
	
	foreach($params as $key => $value) {
		$tmp[$key] = &$params[$key];
	}
	
	//Create the tables to fill
	$table_names = array();
	$field_destinations = array();	
	
	//Insert the text elements into the SQL request
	$sql = "SELECT back_end_name, front_end_name, table_name, database_location_level1,	database_location_level2, database_location_level3, database_location_level4 FROM table_dictionary WHERE $fields_number_sql";

	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Insert the array of parameter into the request and execute
		call_user_func_array(array($stmt, 'bind_param'), $tmp);
		
		if (! $stmt->execute()) {
			$message = "ERROR while executing table_dictionary request!";
			array_push($messages, $message);
		}
		else {
			$stmt->store_result();
			$stmt->bind_result($back_end_name, $front_end_name, $table_name, $database_location_level1, $database_location_level2, $database_location_level3, $database_location_level4);
		
			$i = 0;
		
			//While there are results, generate new lines in the tables
			while ($stmt->fetch()) {
				
				$table_names[$back_end_name] = $table_name;
				$field_destinations["level1"][$back_end_name] = $database_location_level1;
				
				//If there's a level2 of address for the field
				if (!empty($database_location_level2)) {
					//If the table field_detinations["level2"] is empty, add the field and its level2 address in a new row
					if (empty($field_destinations["level2"])) {
						$field_destinations["level2"][$back_end_name] = $database_location_level2;
					}
					//Else, if the field isn't in the array, add it (avoid doubles)
					else if (!in_array($database_location_level2, $field_destinations["level2"])) {
						$field_destinations["level2"][$back_end_name] = $database_location_level2;
					}
				}
				
				//If there's a level3 of address for the field
				if (!empty($database_location_level3)) {
					//If the table field_detinations["level3"] is empty, add the field and its level3 address in a new row
					if (empty($field_destinations["level3"])) {
						$field_destinations["level3"][$back_end_name] = $database_location_level3;
					}
					//Else, if the field isn't in the array, add it (avoid doubles)
					else if (!in_array($database_location_level3, $field_destinations["level3"])) {
						$field_destinations["level3"][$back_end_name] = $database_location_level3;
					}	
				}
				
				$field_names[$i] = $back_end_name;
				
				$i++;
			}
		}
	}
	else {
		$message = "ERROR while preparing table_dictionary request!";
		array_push($messages, $message);
	}
	
	
	//---------INTEGRATION----
	
	//--------INTEGRATION LEVEL 1----------------
	//Creation of an empty table to register the id created
	$ids_created = array();
	
	//For each fields, get the information into the different tables
	for ($i = 0; $i < $values_number; $i++) {
		//Get the field name
		$field_name = $field_names[$i];
		
		//Get the value
		$value = $values[$field_name];
		
		//Get the table name in which the field is
		$related_table_name = $table_names[$field_name];
		
		// echo $field_destinations["level1"][$field_name];
		
		
		//Get the level 1
		$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
		
		//If the table isn't present into the array of the id created insert and store the newly created key
		if(!(array_key_exists($related_table_name, $ids_created))) {
			$sql = "INSERT INTO $related_table_name ($level1) VALUES (?)";

			//1st SQL call to insert and get the value of the id
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request
				$stmt->bind_param('s', $value);
	
				if (! $stmt->execute()) {
					$message = "ERROR : " . $related_table_name . " database - Problem when trying to insert data $value in $field_name.";
					array_push($messages, $message);
				}
				else {
					$ids_created[$related_table_name]["value"] = $stmt->insert_id;
					$stmt->close();
					//Call to the function which fill the log
					$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $field_name, $value, $messages);
				}
			}
			else {
				$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to insert data $value in $field_name.";
				array_push($messages, $message);
			}
			
			//2nd call to get the primary key of the table in which we just insert data
			//SQL request to get the ID name
			$sql = "SHOW KEYS FROM $related_table_name WHERE Key_name = 'PRIMARY'";
			
			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $related_table_name . "- Problem when trying to get key name.";
					array_push($messages, $message);
				}
				else {
					
					//Link variables to the results (values of the list)
					$stmt->bind_result($table, $unique, $key_type, $seq_index, $key_name, $collation, $cardinality, $subpart, $packed, $null, $index_type, $comment, $index_comment);

					$stmt->fetch();
					$stmt->close();
				}
			$ids_created[$related_table_name]["name"] = $key_name;
			}
			else {
				$message = "ERROR : " . $related_table_name . "- Problem when preparing request to get key name.";
				array_push($messages, $message);
			}

		}
		
		//Else get the primary key and update the row
		else if(array_key_exists($related_table_name, $ids_created)) {
			// echo" field id =  " . $field_name . "-----";
			$value_id_to_update = $ids_created[$related_table_name]["value"];
			$name_id_to_update = $ids_created[$related_table_name]["name"];
		
			
			//SQL request to update the line with the new data
			$sql = "UPDATE $related_table_name SET $level1=? WHERE $name_id_to_update=?";

			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request
			$stmt->bind_param('ss', $value, $value_id_to_update);
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $related_table_name . " database - Problem when trying to update data $value in $field_name.";
					array_push($messages, $message);
				}
				else {
					$stmt->close();
					//Call to the function which fill the log
					$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);
				}
			}
			else {
				$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to update data $value in $field_name.";
				array_push($messages, $message);
			}
		}
	}
	
	
	//-----------------INTEGRATION LEVEL 2------------------------
	$field_destinations_level2_number = count($field_destinations["level2"]);

	//Get all the fields which have a level 2 and gather them into an array
	$field_destinations_level2_fields = array_keys($field_destinations["level2"]);
	
	//Create tables to register level2 table names and ids
	$table_names_level2 = array();
	$ids_created_level2 = array();
	
	//For each field which have a level2
	for ($i = 0; $i < $field_destinations_level2_number; $i++) {
		//Get the field name
		$field_name = $field_destinations_level2_fields[$i];
		
		//Get the table name of the field at level 1
		$table_name = $table_names[$field_name];
		
		//Get the id value for the table name of the field at level 1
		$table_name_id = $ids_created[$table_name]["value"];
		
		//Get the level 2 address and split it to get the level2 table and the level2 field (where to insert the id)
		list($table_name_level2, $field_name_level2) = explode(".", $field_destinations["level2"][$field_name]);
	
		//Push the table name level 2 into an array
		//If the array is empty, push the value
		if (empty($table_names_level2)) {
			$table_names_level2[$field_name] = $table_name_level2;
		}
		//Else, if the field isn't in the array, add it (avoid doubles)
		else if (!in_array($table_name_level2, $table_names_level2)) {
			$table_names_level2[$field_name] = $table_name_level2;
		}
		
	
		//2 cases, if an ID exists for the relevant field in the id table, update; else, insert
		if(array_key_exists($table_name_level2, $ids_created)) {
			
			//Get the id and the name of the level 2 table to update to know which row to update
			$value_id_to_update = $ids_created[$table_name_level2]["value"];
			$name_id_to_update = $ids_created[$table_name_level2]["name"];
			
			//SQL request to insert the id into the table
			$sql = "UPDATE $table_name_level2 SET $field_name_level2=? WHERE $name_id_to_update=?";
			
			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request (insert the id in the right column)
			$stmt->bind_param('ss', $table_name_id, $value_id_to_update);
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $table_name_level2 . " database - Problem when trying to update data $table_name_id in $field_name_level2.";
					array_push($messages, $message);
				}
				else {
					$stmt->close();
				}
			}
			else {
				$message = "ERROR : " . $table_name_level2 . " database - Problem when preparing request to update data $table_name_id in $field_name_level2.";
				array_push($messages, $message);
			}
		}
		
		//Else, the id isn't existing, there's no line into the db. Insert one.
		else {
			$sql = "INSERT INTO $table_name_level2 ($field_name_level2) VALUES (?)";

			//1st SQL call to insert and get the value of the id of the newly inserted row
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request
				$stmt->bind_param('s', $table_name_id);
	
				if (! $stmt->execute()) {
					$message = "ERROR : " . $table_name_level2 . " database - Problem when trying to insert data $table_name_id (id) in $field_name_level2.";
					array_push($messages, $message);
				}
				else {
					$ids_created_level2[$table_name_level2]["value"] = $stmt->insert_id;
					$stmt->close();
				}
			}
			else {
				$message = "ERROR : " . $table_name_level2 . " database - Problem when preparing request to insert data $table_name_id (id) in $field_name_level2.";
				array_push($messages, $message);
			}
			
			//2nd call to get the primary key of the table in which we just insert the id
			//SQL request to get the ID name
			$sql = "SHOW KEYS FROM $table_name_level2 WHERE Key_name = 'PRIMARY'";
			
			if ($stmt = $mysqli->prepare($sql)) {
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $table_name_level2 . "- Problem when trying to get key name.";
					array_push($messages, $message);
				}
				else {
					
					//Link variables to the results (values of the list)
					$stmt->bind_result($table, $unique, $key_type, $seq_index, $key_name, $collation, $cardinality, $subpart, $packed, $null, $index_type, $comment, $index_comment);

					$stmt->fetch();
					$stmt->close();
				}
			$ids_created_level2[$table_name_level2]["name"] = $key_name;	
			}
			else {
				$message = "ERROR : " . $table_name_level2 . "- Problem when preparing request to get key name.";
				array_push($messages, $message);
			}
		}
	}
	
	
	
	

	//-----------------INTEGRATION LEVEL 3------------------------
	//If some fields have level3 address
	if (!empty($field_destinations["level3"])) {
		$field_destinations_level3_number = count($field_destinations["level3"]);

		//Get all the fields which have a level 3 and gather them into an array
		$field_destinations_level3_fields = array_keys($field_destinations["level3"]);
		
		//For each field which have a level3
		for ($i = 0; $i < $field_destinations_level3_number; $i++) {
			//Get the field name
			$field_name = $field_destinations_level3_fields[$i];
			
			//Get the table name of the field at level 2
			$table_name_level2 = $table_names_level2[$field_name];
			
			//Get the id value for the table name of the field at level 2
			$table_name_id = $ids_created_level2[$table_name_level2]["value"];

			//Get the level 3 address and split it to get the level3 table and the level3 field (where to insert the id)
			list($table_name_level3, $field_name_level3) = explode(".", $field_destinations["level3"][$field_name]);
		
			//Get the id and the name of the level 3 table to update to know which row to update
			$value_id_to_update = $ids_created_level2[$table_name_level3]["value"];
			$name_id_to_update = $ids_created_level2[$table_name_level3]["name"];
			
			//SQL request to insert the id into the table
			$sql = "UPDATE $table_name_level3 SET $field_name_level3=? WHERE $name_id_to_update=?";
			
			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request (insert the id in the right column)
			$stmt->bind_param('ss', $table_name_id, $value_id_to_update);
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $table_name_level3 . " database - Problem when trying to update data $table_name_id in $field_name_level3.";
					array_push($messages, $message);
				}
				else {
					$stmt->close();
				}
			}
			else {
				$message = "ERROR : " . $table_name_level3 . " database - Problem when preparing the request to update data $table_name_id in $field_name_level3.";
				array_push($messages, $message);
			}
		}	
	}
	
	return($messages);
}


//--------------------------------------------------------------------------------
//Update line in the database
function set_existing_tab_fields_info($mysqli, $fields_number, $thinxtra_site_id, $xml){
	
	//Get the user name (for log purpose)
	$user = $xml->user;
	//Get the UNIX timestamp (for log purpose)
	$now = time();
	//Format it (for log purpose)
	$now_formated = date("Y-m-d H:i:s",$now);
	
	//Create an empty return messages array
	$messages = array();
	
	//Create empty arrays to contain the values and the fields
	$values = array();
	$field_names = array();
	
	//Initialize $j to have a logical table index for fields_table
	$j = 0;
	
	//For each field, get the field_name (front_end) and the value; convert it to text and fill the table if the value isn't empty
	for ($i = 0; $i < $fields_number; $i++) {
		$field_name = $xml->site->data[$i]->field_name->__toString();
		$value = $xml->site->data[$i]->value->__toString();
		// $value = $xml->site->data[$i]->input_type->__toString();

		//Fill the fields and values table if values isn't empty
		if($value !== "") {
			$values[$field_name] = $value;
		}
		else if ($value == "") {
			$values[$field_name] = NULL;
		}
		
		$field_names[$j] = $field_name;
		$j++;
	}
	
	

	//----1st SQL call to get the table names and location levels related to a column
	//Get the number of columns in the values table
	$values_number = count($values);
		
	//String that indicates the number of data to select (WHERE back_end_name =  ? AND back_end_name =? AND ...)
	$fields_number_sql = "";
	//String which countains the number of value types
	$type = "";
	//Array with the types of the values to insert
	$types = array();
	
	
	// Extract the fields names (to generate the SQL request)
	for($i = 0; $i < $values_number; $i++) {
		//Get the field names for $i and the value for the related field_name
		$field_name = $field_names[$i];
		
		//Add back_end_name=? to the string and manage the OR case (no more OR at the end)
		if ($i !== ($values_number -1)) {
			$fields_number_sql = $fields_number_sql . "back_end_name=? OR ";
		}
		else if ($i == ($values_number -1)) {
			$fields_number_sql = $fields_number_sql . "back_end_name=?";
		}
		
		//Add a string type into the type string for every variables (parameters)
		$type = $type . "s";
	}
			
	//Protection against SQL injection
	$fields_number_sql = mysqli_real_escape_string($mysqli, $fields_number_sql);
	$type = mysqli_real_escape_string($mysqli, $type);

	
	//Push the type string into the type array for being able to merge type and values array afterwards
	array_push($types, $type);
	
	//Create a temporary array with the references to the array (necessary to use "call_user_func_array" and use a random number of variables)
	$params = array_merge($types, $field_names);
	$tmp = array();
	
	foreach($params as $key => $value) {
		$tmp[$key] = &$params[$key];
	}
	
	//Create the tables to fill
	$table_names = array();
	$field_destinations = array();	
	$max_levels = array();	
	
	//Insert the text elements into the SQL request
	$sql = "SELECT back_end_name, front_end_name, max_level, table_name, database_location_level1,	database_location_level2, database_location_level3, database_location_level4 FROM table_dictionary WHERE $fields_number_sql";

	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Insert the array of parameter into the request and execute
		call_user_func_array(array($stmt, 'bind_param'), $tmp);
		
		if (! $stmt->execute()) {
			$message = "ERROR while executing table_dictionary request!";
			array_push($messages, $message);
		}
		else {
			$stmt->store_result();
			$stmt->bind_result($back_end_name, $front_end_name, $max_level, $table_name, $database_location_level1, $database_location_level2, $database_location_level3, $database_location_level4);
		
			$i = 0;
		
			//While there are results, generate new lines in the tables
			while ($stmt->fetch()) {
				
				$table_names[$back_end_name] = $table_name;
				$field_destinations["level1"][$back_end_name] = $database_location_level1;
				$max_levels[$back_end_name] = $max_level;
				
				//If there's a level2 of address for the field
				if (!empty($database_location_level2)) {
					$field_destinations["level2"][$back_end_name] = $database_location_level2;
				}
				
				//If there's a level3 of address for the field
				if (!empty($database_location_level3)) {
						$field_destinations["level3"][$back_end_name] = $database_location_level3;
				}
				
				$field_names[$i] = $back_end_name;
				
				$i++;
			}
		}
	}
	else {
		$message = "ERROR while preparing table_dictionary request!";
		array_push($messages, $message);
	}
	
	// print_r($max_levels);
	
	//---------INTEGRATION----
	
	//For each fields, get the information into the different tables
	for ($i = 0; $i < $values_number; $i++) {
		//Get the field name
		$field_name = $field_names[$i];

		//Get the max_level
		$max_level = $max_levels[$field_name];
		
		//Get the table name
		$related_table_name = $table_names[$field_name];
		
		//Get the value
		$value = $values[$field_name];
		
		//If there's only one level
		if ($max_level == 1) {
			
			//Get the level 1
			$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
			
			//SQL request to update the line with the new data (thinxtra_site_id because the table is sites)
			$sql = "UPDATE $related_table_name SET $level1=? WHERE thinxtraId=?";

			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request
			$stmt->bind_param('ss', $value, $thinxtra_site_id);
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $related_table_name . " database - Problem when trying to update data $value in $level1.";
					array_push($messages, $message);
				}
				else {
					$stmt->close();
					//Call to the function which fill the log
					$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);
				}
			}
			else {
				$message = "ERROR : " . $related_table_name . " database - Problem when preparing the request to update data $value in $level1.";
				array_push($messages, $message);
			}
		}
		//Else if the level is 2 check if the field_name is set
		else if ($max_level == 2) {
			
			//Get the level 2
			list($table_name_level2, $field_name_level2) = explode('.', $field_destinations["level2"][$field_name]);
			
			//Reset field_value_level2
			$field_value_level2 = "";
			
			//-----1st SQL call to get the value of the field (id)
			//Select statement to see if the field isn't empty
			$sql = "SELECT $field_name_level2 FROM $table_name_level2 WHERE thinxtraId=?";
			
			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request
			$stmt->bind_param('s', $thinxtra_site_id);
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $table_name_level2. " database - Problem when trying to select data in $table_name_level2.";
					array_push($messages, $message);
				}
				else {
					$stmt->store_result();
					$stmt->bind_result($field_value_level2);
					$stmt->fetch();
					
					$stmt->close();
				}
			}
			else {
				$message = "ERROR : " . $table_name_level2. " database - Problem when preparing the request to select data in $table_name_level2.";
				array_push($messages, $message);
			}
			// echo ("field_name : $field_name &&&& $field_value_level2 ++++");
			
			//If the id is set, update the related field into level 1
			if($field_value_level2 !== null) {
				
				//1st SQL request to get the id name of the level 1 table
				$sql = "SHOW KEYS FROM $related_table_name WHERE Key_name = 'PRIMARY'";
			
				// SQL call
				if ($stmt = $mysqli->prepare($sql)) {
				
					if (! $stmt->execute()) {
						$message = "ERROR : " . $related_table_name . "- Problem when trying to get key name.";
						array_push($messages, $message);
					}
					else {
						
						// Link variables to the results (values of the list)
						$stmt->bind_result($table, $unique, $key_type, $seq_index, $key_name, $collation, $cardinality, $subpart, $packed, $null, $index_type, $comment, $index_comment);

						$stmt->fetch();
						$stmt->close();
					}
				$id_name_level1 = $key_name;
				}
				else {
					$message = "ERROR : " . $related_table_name . "- Problem when preparing request to get key name.";
					array_push($messages, $message);
				}
				
				
				//Get the level 1
				$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
				
				//SQL request to update the line with the new data (related table is level1 table)
				$sql = "UPDATE $related_table_name SET $level1=? WHERE $id_name_level1=?";
				
				
				//SQL call
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
				$stmt->bind_param('ss', $value, $field_value_level2);
				
					if (! $stmt->execute()) {
						$message = "ERROR : " . $related_table_name . " database - Problem when trying to update data $value in $level1 (where id is $field_value_level2).";
						array_push($messages, $message);
					}
					else {
						$stmt->close();
						//Call to the function which fill the log
						$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);

					}
				}
				else {
					$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to update data $value in $level1 (where id is $field_value_level2).";
					array_push($messages, $message);
				}
			}
			//If the id isn't set, create the related field into level 1, get the id and update it into level2
			if($field_value_level2 == null) {

				$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
				
				//SQL to create the level1
				$sql = "INSERT INTO $related_table_name ($level1) VALUES (?)";

				//1st SQL call to insert and get the value of the id
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
					$stmt->bind_param('s', $value);
		
					if (! $stmt->execute()) {
						$message = "ERROR : " . $related_table_name . " database - Problem when trying to insert data $value in $level1.";
						array_push($messages, $message);
					}
					else {
						$id_level1 = $stmt->insert_id;
						$stmt->close();
						//Call to the function which fill the log
						$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);

					}
				}
				else {
					$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to insert data $value in $level1.";
					array_push($messages, $message);
				}
						
				
				list($table_name_level2, $field_name_level2) = explode('.', $field_destinations["level2"][$field_name]);

				//2nd SQL call to insert the id we just created in the level2 table
				$sql = "UPDATE $table_name_level2 SET $field_name_level2=? WHERE thinxtraId=?";
				
				//1st SQL call to insert and get the value of the id
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
					$stmt->bind_param('ss', $id_level1, $thinxtra_site_id);
		
					if (! $stmt->execute()) {
						$message = "ERROR : " . $table_name_level2 . " database - Problem when trying to insert data $id_level1 in $field_name_level2 (id).";
						array_push($messages, $message);
					}
					else {
						$stmt->close();
					}
				}
				else {
					$message = "ERROR : " . $table_name_level2 . " database - Problem when preparing request to insert data $id_level1 in $field_name_level2 (id).";
					array_push($messages, $message);
				}
			}
		}
		//Else if the level is 3, check if the field_name is set
		else if ($max_level == 3) {
			
			//Get the level 3
			list($table_name_level3, $field_name_level3) = explode('.', $field_destinations["level3"][$field_name]);
			
			//-----1st SQL call to get the value of the field (id)
			//Select statement to see if the field isn't empty
			$sql = "SELECT $field_name_level3 FROM $table_name_level3 WHERE thinxtraId=?";
			
			//SQL call
			if ($stmt = $mysqli->prepare($sql)) {
			//Indicate which are the parameters to put into the request
			$stmt->bind_param('s', $thinxtra_site_id);
			
				if (! $stmt->execute()) {
					$message = "ERROR : " . $table_name_level3. " database - Problem when trying to select data in $field_name_level3.";
					array_push($messages, $message);
				}
				else {
					$stmt->store_result();
					$stmt->bind_result($field_value_level3);
					$stmt->fetch();
					
					$stmt->close();
				}
			}
			else {
				$message = "ERROR : " . $table_name_level3. " database - Problem when preparing request to select data in $field_name_level3.";
				array_push($messages, $message);
			}
			
			
			
			//If the id is set, get the id of level 2 and check that it is set
			if($field_value_level3 !== "") {

				//Get the level 2
				list($table_name_level2, $field_name_level2) = explode('.', $field_destinations["level2"][$field_name]);
				
				//----1st SQL request to get the id name of the level 2 table
				$sql = "SHOW KEYS FROM $table_name_level2 WHERE Key_name = 'PRIMARY'";
			
				// SQL call
				if ($stmt = $mysqli->prepare($sql)) {
				
					if (! $stmt->execute()) {
						$message = "ERROR : " . $related_table_name . "- Problem when trying to get key name.";
						array_push($messages, $message);
					}
					else {
						
						// Link variables to the results (values of the list)
						$stmt->bind_result($table, $unique, $key_type, $seq_index, $key_name, $collation, $cardinality, $subpart, $packed, $null, $index_type, $comment, $index_comment);

						$stmt->fetch();
						$stmt->close();
					}
				$id_name_level2 = $key_name;
				}
				else {
					$message = "ERROR : " . $related_table_name . "- Problem when preparing request to get key name.";
					array_push($messages, $message);
				}
				
				
				//-----2nd SQL call to get the value of the field (id)
				//Select statement to see if the field isn't empty
				$sql = "SELECT $field_name_level2 FROM $table_name_level2 WHERE $id_name_level2=?";
				
				//SQL call
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
				$stmt->bind_param('s', $field_value_level3);
				
					if (! $stmt->execute()) {
						$message = "ERROR : " . $table_name_level2. " database - Problem when trying to select data in $field_name_level2.";
						array_push($messages, $message);
					}
					else {
						$stmt->store_result();
						$stmt->bind_result($field_value_level2);
						$stmt->fetch();
						
						$stmt->close();
					}
				}
				else {
					$message = "ERROR : " . $table_name_level2. " database - Problem when preparing request to select data in $field_name_level2.";
					array_push($messages, $message);
				}
				
				
				//If the id is set, update level 1
				if($field_value_level2 !== null) {

					//----1st SQL request to get the id name of the level 1 table
					$sql = "SHOW KEYS FROM $related_table_name WHERE Key_name = 'PRIMARY'";
				
					// SQL call
					if ($stmt = $mysqli->prepare($sql)) {
					
						if (! $stmt->execute()) {
							$message = "ERROR : " . $related_table_name . "- Problem when trying to get key name.";
							array_push($messages, $message);
						}
						else {
							
							// Link variables to the results (values of the list)
							$stmt->bind_result($table, $unique, $key_type, $seq_index, $key_name, $collation, $cardinality, $subpart, $packed, $null, $index_type, $comment, $index_comment);

							$stmt->fetch();
							$stmt->close();
						}
					$id_name_level1 = $key_name;
					}
					else {
						$message = "ERROR : " . $related_table_name . "- Problem when preparing request to get key name.";
						array_push($messages, $message);
					}
				
					//Get the level 1
					$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
					
					//SQL request to update the line with the new data (related table is level1 table)
					$sql = "UPDATE $related_table_name SET $level1=? WHERE $id_name_level1=?";

					//SQL call
					if ($stmt = $mysqli->prepare($sql)) {
					//Indicate which are the parameters to put into the request
					$stmt->bind_param('ss', $value, $field_value_level2);
					
						if (! $stmt->execute()) {
							$message = "ERROR : " . $related_table_name . " database - Problem when trying to update data $value in $level1 (where id is $field_value_level2).";
							array_push($messages, $message);
						}
						else {
							$stmt->close();
							//Call to the function which fill the log
							$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);

						}
					}
					else {
						$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to update data $value in $level1 (where id is $field_value_level2).";
						array_push($messages, $message);
					}
					
				}
				//Else, insert level 1, bring back the id and update it into level 2
				else if($field_value_level2 == null){
					
					$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
				
					//SQL to create the level1
					$sql = "INSERT INTO $related_table_name ($level1) VALUES (?)";
					
					//1st SQL call to insert and get the value of the id
					if ($stmt = $mysqli->prepare($sql)) {
					//Indicate which are the parameters to put into the request
						$stmt->bind_param('s', $value);
			
						if (! $stmt->execute()) {
							$message = "ERROR : " . $related_table_name . " database - Problem when trying to insert data $value in $level1.";
							array_push($messages, $message);
						}
						else {
							$id_level1 = $stmt->insert_id;
							$stmt->close();
							//Call to the function which fill the log
							$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);
						}
					}
					else {
						$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to insert data $value in $level1.";
						array_push($messages, $message);
					}
				
					//2nd SQL request to update the level2 line with the new data
					$sql = "UPDATE $table_name_level2 SET $field_name_level2=? WHERE $id_name_level2=?";

					//SQL call
					if ($stmt = $mysqli->prepare($sql)) {
					//Indicate which are the parameters to put into the request
					$stmt->bind_param('ss', $id_level1, $field_value_level3);
					
						if (! $stmt->execute()) {
							$message = "ERROR : " . $related_table_name . " database - Problem when trying to update data $value in $level1 (where id is $field_value_level2).";
							array_push($messages, $message);
						}
						else {
							$stmt->close();
						}
					}
					else {
						$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to update data $value in $level1 (where id is $field_value_level2).";
						array_push($messages, $message);
					}
				}	
			}
			//Insert the data into level 1, get the id, insert it in level 2 and 3
			else if($field_value_level3 == "") {
				
				$level1 = explode('.', $field_destinations["level1"][$field_name])[1];
				
				//SQL to create the level1
				$sql = "INSERT INTO $related_table_name ($level1) VALUES (?)";
				
				//1st SQL call to insert and get the value of the id
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
					$stmt->bind_param('s', $value);
		
					if (! $stmt->execute()) {
						$message = "ERROR : " . $related_table_name . " database - Problem when trying to insert data $value in $level1.";
						array_push($messages, $message);
					}
					else {
						$id_level1 = $stmt->insert_id;
						$stmt->close();
						//Call to the function which fill the log
						$messages = set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $level1, $value, $messages);
					}
				}
				else {
					$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to insert data $value in $level1.";
					array_push($messages, $message);
				}
			
			
				list($table_name_level2, $field_name_level2) = explode('.', $field_destinations["level2"][$field_name]);
						
				//2nd SQL call to insert the id we just created in the level2 table
				$sql = "INSERT INTO $table_name_level2 ($field_name_level2) VALUES (?)";
				
				//SQL call to insert and get the value of the newly created row id
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
					$stmt->bind_param('s', $id_level1);
		
					if (! $stmt->execute()) {
						$message = "ERROR : " . $related_table_name . " database - Problem when trying to insert data $value in $level1.";
						array_push($messages, $message);
					}
					else {
						$id_level2 = $stmt->insert_id;
						$stmt->close();
					}
				}
				else {
					$message = "ERROR : " . $related_table_name . " database - Problem when preparing request to insert data $value in $level1.";
					array_push($messages, $message);
				}
				
				
				list($table_name_level3, $field_name_level3) = explode('.', $field_destinations["level3"][$field_name]);

				//3rd call to insert the level2 id we just created into level3
				$sql = "UPDATE $table_name_level3 SET $field_name_level3=? WHERE thinxtraId=?";

				//SQL call
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request
				$stmt->bind_param('ss', $id_level2, $thinxtra_site_id);
				
					if (! $stmt->execute()) {
						$message = "ERROR : " . $table_name_level3 . " database - Problem when trying to update data $id_level2 in $field_name_level3 (id).";
						array_push($messages, $message);
					}
					else {
						$stmt->close();
					}
				}
				else {
					$message = "ERROR : " . $table_name_level3 . " database - Problem when preparing request to update data $id_level2 in $field_name_level3 (id).";
					array_push($messages, $message);
				}
			}	
		}
	}
	
	return($messages);
}


//---------------------------------------------------------------------------------------
//Log function (create a log row)
function set_new_log_line($mysqli, $user, $now_formated, $now, $thinxtra_site_id, $field_name, $field_value, $messages) {
	
	$sql = "INSERT INTO admin_log (user, time, timestamp, thinxtra_site_id, field_name, field_value) VALUES (?, ?, ?, ?, ?, ?)";

	//SQL call to insert user_name, timestamp, datetime, site_id, field name and field value into db
	if ($stmt = $mysqli->prepare($sql)) {
	//Indicate which are the parameters to put into the request
		$stmt->bind_param('ssssss', $user, $now_formated, $now, $thinxtra_site_id, $field_name, $field_value);
		
		//If error, push a message into the messages array
		if (! $stmt->execute()) {
			$message = "ERROR : admin_log database - Problem when trying to insert data $field_value for $field_name.";
			array_push($messages, $message);
		}
		else {
			$stmt->close();
		}
	}
	//If error, push a message into the messages array
	else {
		$message = "ERROR : admin_log database - Problem when preparing request to insert data $field_value for $field_name.";
		array_push($messages, $message);
	}
	
	//Return the messages array
	return($messages);
}
