<?php
include_once 'connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the data format needed for the response
$tab_name = $xml->tab_name;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

$message = get_columns_info($mysqli, $tab_name, $xml_response);

Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());


//Function which return the names of the select object (search_column_names, reports_column_names...)
function get_columns_info($mysqli, $tab_name, $xml) {

	//Generate the name of the index field depending of tha tab name (necessary to SORT the fields)
	$tab_name_index = $tab_name . "_index";

	//SQL injection protection
	$tab_name = mysqli_real_escape_string($mysqli, $tab_name);

	// Select the object into the SQL request
	$sql = "SELECT column_name, importance, data_type_fields, data_size, $tab_name FROM table_columns WHERE $tab_name = 'W' OR $tab_name = 'R' ORDER BY $tab_name_index ASC";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : table_columns database - Problem when trying to select the columns data into the database.";
			$response = $xml->addChild('error',$message);
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (field_names and write_or_read argument)
			$stmt->bind_result($field_name, $importance, $data_type_fields, $data_size, $write_or_read);

			
			//While there are results, generate new lines in the xml
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml
				if (!empty($field_name)) {
					$node = $xml->addChild('field');
					$response = $node->addChild('field_name', $field_name);
					$response = $node->addChild('importance', $importance);
					$response = $node->addChild('data_type', $data_type_fields);
					$response = $node->addChild('data_size', $data_size);
					$response = $node->addChild($tab_name, $write_or_read);
				}
				//else,  return an error in the xml
				else {
					$message = "ERROR : table_columns database - Tab name doesn't exist.";
					$response = $xml->addChild('error',$message);
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error in the xml
	else {
		$message = "ERROR : table_columns database - Problem when trying to prepare the SQL request.";
		$response = $xml->addChild('error',$message);
	}
	
	//return the xml
	return $xml;
}
?>