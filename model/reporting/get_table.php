<?php
	include_once '../connectors/db_connect.php';
	include_once '../get_user_groups_info.php';

	//XML data recuperation
	$data = trim(file_get_contents('php://input'));
	$xml = new SimpleXMLElement($data);

	//Get the table name and the user groups
	$table_name = $xml->table_name;
	
	//Get the array of columns needed (authorized for the user); false is used because there's no need for data_type, there
	$columns_table = get_user_groups_info($mysqli, $xml, "WR", false);
	
	//Call the function to get the full sql view (depending on the user rights)  if there where no errors
	if (is_array($columns_table)) {
		$message = get_table($mysqli, $table_name, $columns_table);

		// Encode the result in json and print it
		$json_result = json_encode($message);
		echo $json_result;
	}
	//Else create and send an XML error
	else {
		$xml_response = new SimpleXMLElement('<xml/>');
		$response = $xml_response->addChild('error',$columns_table);
		// Header('Content-type: text/xml; charset=utf-8');
		print($xml_response->asXML());
	}

	
//####################################################################################################
//FUNCTIONS
//####################################################################################################
//Function which return all the content of a table or a view (input) 
//and return a table with the names of the sql column and the values (output)
function get_table($mysqli, $table_name, $columns_table) {
	
	//Get the number of column to retrieve
	$columns_table_number = sizeof($columns_table);

	//String that indicates the columns to return (for the SQL call)
	$column_names_sql = "";
	
	//Generate a part of the SQL with the number of column (and a comma, if needed)
	for($i = 0; $i < $columns_table_number; $i++) {
		$column_name = $columns_table[$i];
		
		if ($i !== 0) {
			$comma = ", ";
		}
		else if ($i == 0) {
			$comma = "";
		}
		$column_names_sql = $column_names_sql . $comma . $column_name;
	}
	
	// Select all the content from the table/view
	$sql = "SELECT $column_names_sql FROM $table_name";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			//If execution isn't working, return an error in a table
			$results["error"] = "ERROR : data_entry view - Problem when trying to select the columns data into the database.";
		}
		else {
			// Get metadata for column names
			$meta = $stmt->result_metadata();

			// Dynamically create an array of variables to use to bind the results (linked with the column name)
			while ($field = $meta->fetch_field()) { 
				$var = $field->name; 
				$$var = null; 
				$fields[$var] = &$$var;
			}

			// bind results (link result with column names)
			call_user_func_array(array($stmt,'bind_result'),$fields);

			// Fetch Results (create an array and, in the first index, insert an array with 
			//column names as index and sql value as value)
			$i = 0;
			while ($stmt->fetch()) {
				$results[$i] = array();
				
				foreach($fields as $k => $v) {
					if($v === null) {
						$v = "";
					}
					
					$results[$i][$k] = $v;
				}
				
				$i++;
			}
			
			// Close the SQL call
			$stmt->close();
		}
	}
	//else,  return an error in a table
	else {
		$results["error"] = "ERROR : data_entry view - Problem when trying to prepare the SQL request.";
	}
	
	//return the table
	return $results;
}
?>