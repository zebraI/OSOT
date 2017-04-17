<?php
include_once '../set_tab_fields_info.php';

function database_upload($file_name, $file_url, $data, $head, $user, $mysqli) {
	
	//Create the error message array
	$messages = array();
	
	//Get the number of line of the csv file
	$lines_number = sizeof($data);
	
	//Get the number of columns of the csv file
	$columns_number = sizeof($head);
	
	//Create the XML, insert user
	$xml_response = new SimpleXMLElement('<xml/>');
	$xml = $xml_response->addChild('user', $user);
	
	
	//-----------1st SQL call to get the data_types of the fields----------------
	//Create the table to fill with the data_type
	$field_data_type = array();
	
	//String that indicates the number of data to select (WHERE back_end_name =  ? AND back_end_name =? AND ...)
	//Already the first one is set to avoid loop to manage first OR case
	$back_end_name_sql = "back_end_name=?";
	//String which countains the number of value types (first one is already set)
	$type = "s";
	//Array with the types of the values to insert
	$types = array();
	
	// Generate the SQL request (based on the number of name to select) (start from 1 to avoid first OR case)
	for ($i = 1; $i < $columns_number; $i++) {
		//Add back_end_name=? to the string
		$back_end_name_sql = $back_end_name_sql . " OR back_end_name=?";
	
		//Add a string type into the type string for every variables (parameters)
		$type = $type . "s";
	}
			
	//Protection against SQL injection
	$back_end_name_sql = mysqli_real_escape_string($mysqli, $back_end_name_sql);
	$type = mysqli_real_escape_string($mysqli, $type);

	//Push the type string into the type array for being able to merge type and values array afterwards
	array_push($types, $type);
	
	//Create a temporary array with the references to the array (necessary to use "call_user_func_array" and use a random number of variables)
	$params = array_merge($types, $head);
	$tmp = array();
	
	foreach($params as $key => $value) {
		$tmp[$key] = &$params[$key];
	}
		
	//Select statement to see the data_type of the uploaded fields
	$sql = "SELECT back_end_name, html_type FROM table_dictionary WHERE $back_end_name_sql";
		
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Insert the array of parameter into the request and execute
		call_user_func_array(array($stmt, 'bind_param'), $tmp);
	
		if (! $stmt->execute()) {
			$message = "ERROR : table_dictionary database - Problem when trying to select html_types";
			array_push($messages, $message);
		}
		else {
			$stmt->store_result();
			$stmt->bind_result($back_end_name, $data_type);
			
			while ($stmt->fetch()) {
				$field_data_type[$back_end_name] = $data_type;
			}
			
			$stmt->close();
		}
	}
	else {
		$message = "ERROR : table_dictionary database - Problem when preparing the request to select html_types.";
		array_push($messages, $message);
	}
	
	
	//-----------2nd SQL call to get the related id of field of type select (list of values)----------------
	//For each column
	for ($i = 0; $i < $columns_number; $i++) {
		//If the data_type of the column is select, 
		if ($field_data_type[$head[$i]] == "select") {
			//Get the related column_name
			$column_name = $head[$i];
			
			//For each row of this column, get the value and check if it match with an id in list_of_velues database
			for ($j = 0; $j < $lines_number; $j++) {
				//Get the related input_value
				$input_value = $data[$j][$head[$i]];
				
				//Select statement to get the corresponding id in list_of_values table
				$sql = "SELECT idValues FROM list_of_values WHERE listName=? AND value=?";
				
				//SQL call
				if ($stmt = $mysqli->prepare($sql)) {
				//Indicate which are the parameters to put into the request (listName=column_name and value=input_value)
				$stmt->bind_param('ss', $column_name, $input_value);
				
					if (! $stmt->execute()) {
						$message = "ERROR : list_of_values database - Problem when trying to select data $input_value in $column_name. Value may not be existing.";
						array_push($messages, $message);
					}
					else {
						$stmt->store_result();
						$stmt->bind_result($id_value);
						$stmt->fetch();
						
						$stmt->close();
						
						//Replace the written value by the related id
						$data[$j][$head[$i]] = $id_value;
					}
				}
				else {
					$message = "ERROR : list_of_values database - Problem when preparing the request to select data $input_value in $column_name.";
					array_push($messages, $message);
				}
			}	
		}
	}
		
	
	//--------------Launch integration into database-----------------------------------
	//For each lines
	for ($i = 0; $i < $lines_number; $i++) {
		//Get the thinxtra site id
		$thinxtra_site_id = $data[$i]["thinxtra_site_id"];
		
		//Generate a new XML, add the user, create a new node and add thinxtra site id node in it
		$xml_response = new SimpleXMLElement('<xml version="1.0"/>');
		$xml = $xml_response->addChild('user', $user);
		$site = $xml_response->addChild('site');
		$sub_site = $site->addChild('thinxtra_site_id', 'new');
		
		//For each column
		for ($j = 0; $j < $columns_number; $j++) {
			//Get the input name (name of the column) and the value of the input
			$input_name = $head[$j];
			$input_value = $data[$i][$head[$j]];
			
			//Add a data not containing the field name and value
			$site_data = $site->addChild('data');
			$sub_site_data = $site_data->addChild('field_name', $input_name);
			$sub_site_data = $site_data->addChild('value', $input_value);
		}
		
		//Call the integration function and get the callback into the error message array
		$message = set_new_tab_fields_info($mysqli, $columns_number, $xml_response);
		
		//If the callback isn't an empty array, push it into the error messages array
		if (!empty($message)) {
			array_push($messages, $message);
		}
	}
		
	
	
	//-------------------File management and callback management------------
	
	//Parameters
	$file_archive_directory = "../../uploaded_files/_archives/";
	$date = date('d-m-Y h-i-s a', time());
	//File log name
	$log_file_name = 'file_integration_log-' . $file_name . '.txt';
	//File log URL
	$log_file_url = "../../uploaded_files/_logs/" . $log_file_name;
	
	//Archive the file
	rename($file_url, $file_archive_directory . $date . " - " . $file_name);

	//Create an XML for the html message callback
	$xml_response_html = new SimpleXMLElement('<xml/>');
	
	//Generate the XML message (in all case) and a text log in case of error
	if (empty($messages)) {
		$message = "Database upload successfully done!";
		$response = $xml_response_html->addChild('success', $message);
	}
	else {
		//Get the number of lines in the CSV file
		$lines_number = sizeof($messages);
		
		//Create an empty log_messge and set an error counter
		$log_message = "";
		$error_counter = 0;
		
		//For each line
		for($i = 0; $i < $lines_number; $i++) {
			//Get the number of errors in aline (count the ammount of data into $messages)
			$errors_number = sizeof($messages[$i]);
			
			//Add the line number to the log message string
			$log_message = "\n" . $log_message . "Line " . $i . " :\n";
			
			//For each error in a line, increment the counter and generate a new line of log message
			for($j = 0; $j < $errors_number; $j++) {
				$error_counter += 1;
				$log_message = $log_message . "Error n" . $j . " : " . $messages[$i][$j] . "\n";
			}
		}

		// Create a new log file or erase the old one if it exists and fill with the log message just created
		$file_save = file_put_contents($log_file_url, $log_message);
		
		//Complete the XML  with a message containing the number of errors and the log file
		$response = $xml_response_html->addChild('error', 'Problem during integration - Error returned : ' . $error_counter . ". To have more details, please download the log file.");
		$response = $xml_response_html->addChild('log_name', $log_file_name);
	}
	
	//Print the XML
	Header('Content-type: text/xml; charset=utf-8');
	print($xml_response_html->asXML());	
}


?>