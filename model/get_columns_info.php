<?php
include_once 'connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected obeject for the response
$object = $xml->object;


//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

$message = get_columns_info($mysqli, $object, $xml_response);

//Header not used, in this case (exception???)
Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());




//----------------------------------------------------------------------------------------------------
//FUNCTIONS
//----------------------------------------------------------------------------------------------------
//Function which return the names of the select object (search_column_names, reports_column_names...)
function get_columns_info($mysqli, $object, $xml) {
	
	//SQL injection protection
	$object = mysqli_real_escape_string($mysqli, $object);
	
	// Select the object into the SQL request
	$sql = "SELECT column_name FROM table_columns WHERE $object <> '' ORDER BY $object ASC";
	
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : table_columns database - Problem when trying to select the columns data into the database.";
			$response = $xml->addChild('error',$message);
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (columns_names)
			$stmt->bind_result($column_name);

			
			//While there are results, generate new lines in the xml
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml
				if (!empty($column_name)) {
					$response = $xml->addChild('column_name', $column_name);
				}
				//else,  return an error in the xml
				else {
					$message = "ERROR : table_columns database - Object doesn't exist.";
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