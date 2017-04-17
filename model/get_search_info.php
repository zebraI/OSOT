<?php
include_once 'connectors/db_connect.php';

//XML data recuperation (replace the & with &amp)
$data = trim(file_get_contents('php://input'));
$data = preg_replace('/&(?!#?[a-z0-9]+;)/', '&amp;', $data);
$xml = new SimpleXMLElement($data);

//Get the data format needed for the response
$data_format = $xml->data_format;

//Get the column in which we have to search (coming from the column_field)
$selected_column_name = $xml->selected_column_name;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

//Get info at the XML format
$message = get_search_info($mysqli, $selected_column_name, $xml, $xml_response);

//Return it in the format required per the AJAX call (defined in ajax dataType option)
if ($data_format == "xml") {
	Header('Content-type: text/xml; charset=utf-8');
	print($message->asXML());
}
else if ($data_format == "json") {
	$json = json_encode($message, JSON_PRETTY_PRINT);
	echo $json;
}



//----------------------------------------------------------------------------------------------------
//FUNCTIONS
//----------------------------------------------------------------------------------------------------
//Get the info from the element asked in the research field
function get_search_info($mysqli, $selected_column_name, $xml, $xml_response) {
	
	//Keep the first element name (converted to text) into memory (manage the case where there's only 1 element : ALL)
	$element_name_param = $xml->element[0]->element_name->__toString();
	
	//SQL injection protection + keep the element name in memory
	// $element_name = mysqli_real_escape_string($mysqli, $element_name);
	

	//If the element_name isn't ALL, load the data related to the good columns
	if ($element_name_param !== "ALL") {
		
		//Get the number of columns to return
		$columns = $xml->columns->column_name;
		$columns_number = $columns->count();
		
		$i = 0;
		//String that indicates the columns to return (for the SQL call)
		$column_names_sql = "";
		//String that indicates the number of data to select (WHERE selected_column_name=  ? AND $selected_column_name =? AND ...)
		$elements_number_sql = "";
		//Array with the values to insert
		$values = array();
		//String which countains the number of value types
		$type = "";
		//Array with the types of the values to insert
		$types = array();
		
		// Extract the columns names (to generate the SQL request on the columns needed for the array)
		while($i < $columns_number) {
			$column_name = $xml->columns->column_name[$i];
			
			if ($i !== ($columns_number -1)) {
				$column_names_sql = $column_names_sql . $column_name . ", ";
			}
			else if ($i == ($columns_number -1)) {
				$column_names_sql = $column_names_sql . $column_name;
			}
			$i++;
		}
		
		//Get the number of asked elements
		$element = $xml->element;
		$elements_number = $element->count();
		$i = 0;
		
		//Extract the values for the WHERE into the SQL (and get the number of it to have the type)
		while($i < $elements_number) {
			$element_name = $xml->element[$i]->element_name;
			
			//Convert the element names into text and push it in an array
			array_push($values,  $element_name->__toString());
			
			//Add a string type into the type string for every variables (parameters)
			$type = $type . "s";
			
			//Create a string with WHERE values
			if ($i !== ($elements_number -1)) {
				$elements_number_sql = $elements_number_sql . $selected_column_name . "=? OR ";
			}
			else if ($i == ($elements_number -1)) {
				$elements_number_sql = $elements_number_sql . $selected_column_name . "=?";
			}
			$i++;
		}
				
		//Protection against SQL injection
		$column_names_sql = mysqli_real_escape_string($mysqli, $column_names_sql);
		$elements_number_sql = mysqli_real_escape_string($mysqli, $elements_number_sql);
		$type = mysqli_real_escape_string($mysqli, $type);

	
		//Push the type string into the type array for having the parameters
		array_push($types, $type);
		
		//Insert the text elements into the SQL request
		$sql = "SELECT $column_names_sql FROM data_entry WHERE $elements_number_sql";

		//Create a temporary array with the references to the array (necessary to use "call_user_func_array" and use a random number of variables)
		$params = array_merge($types, $values);
		$tmp = array();
			
		foreach($params as $key => $value) {
			$tmp[$key] = &$params[$key];
		}
	}
	
	// If the element is all, get all the element names only (for the content of the search field)
	else if ($element_name_param == "ALL") {
		$sql = "SELECT DISTINCT $selected_column_name FROM data_entry";
	}


	if ($stmt = $mysqli->prepare($sql)) {
		//Indicate which are the parameters to put into the request if the element_name isn't "ALL" (dynamic array of parameters)
		if ($element_name_param !== "ALL") {
			call_user_func_array(array($stmt, 'bind_param'), $tmp);
		}
		
		if (! $stmt->execute()) {
			$message = "ERROR : " . element . " database - Problem when trying to select the data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
											
			//Link variables to the results (if it's all, only one variable is getting returned : element_name)
			// If it's not all : need to manage random number of variables
			if ($element_name_param == "ALL") {
				$stmt->store_result();
				$stmt->bind_result($element_name);
				
				$i = 0;

				//While there are results, generate new lines in the xml response (manage the case where it is empty)
				while ($stmt->fetch()) {
					//If the param is all, add only the element name in the xml response
					if (!empty($element_name)) {
						
						//Add a parent node only if data_format isn't json
						// $response = $xml_response->addChild('element');
						
						//Add the element (special way to handle special characters)
						$elements["element_name"][$i]= $element_name;
						// $xml_response->element_name[$i] = $element_name;
						$i++;
					}
				}
				$xml_response = $elements;
			}
			else {
				// Get metadata for field names (column names)
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
					foreach($fields as $k => $v)
						$results[$i][$k] = $v;
					$i++;
				}
			}
			$stmt->close();
			
			//Send back a table (json response)
			if ($element_name_param !== "ALL") {

				//Get the number of results (number of tables in the result table)
				$results_number = count($results);
				$i = 0;
				
				//Create a site node
				// $site = $xml_response->addChild('site');
									
				//Get each table in the table and insert it into the xml
				while ($i < $results_number) {
					$j = 0;
					
					
					//Add every fields_name in the XML if it is the first site and every value in the XML (and put it in "result")	
					foreach($results[$i] as $key => $value) {
						//If it's the first array of results get the columns of the table and put it into columns
						if ($i == 0) {
							$column["column_name"][$j] = $key;
						}
				
						//Else, create a new record for each site and put all the values in it
						$site["site"][$i][$j]= $value;
						// $site["site"][$i][$key]= $value;

						//Increment the value number
						$j++;
					}
					
					//Increment the result_table and the site number
					$i++;
				}
				$xml_response = array_merge($column, $site);
			}
		}
	}
	//else,  return an error in the xml response
	else {
		$message = "ERROR : database - Problem when trying to prepare the SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	//return the xml response
	return $xml_response;
}




?>