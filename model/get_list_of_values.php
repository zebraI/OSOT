<?php
include_once 'connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the data format needed for the response
$list_name = $xml->list_name;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

$message = get_list_of_values($mysqli, $list_name, $xml_response);

Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());


//Function which return the list of values wanted
function get_list_of_values($mysqli, $list_name, $xml) {

	//SQL injection protection
	$list_name = mysqli_real_escape_string($mysqli, $list_name);

	// Select the object into the SQL request
	$sql = "SELECT value, idValues FROM list_of_values WHERE listName = '" . $list_name . "'";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : list_of_values database - Problem when trying to select the columns data into the database.";
			$response = $xml->addChild('error',$message);
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (values of the list)
			$stmt->bind_result($value, $id_value);

			//Create the XML node
			$node = $xml->addChild('list_of_values');
			
			//While there are results, generate new lines in the xml
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml
				if (!empty($value)) {
					$response = $node->addChild('value', $value);
					$response = $node->addChild('id_value', $id_value);
				}
				//else,  return an error in the xml
				else {
					$message = "ERROR : list_of_values database - List of values doesn't exist.";
					$response = $xml->addChild('error',$message);
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error in the xml
	else {
		$message = "ERROR : list_of_values database - Problem when trying to prepare the SQL request.";
		$response = $xml->addChild('error',$message);
	}
	
	//return the xml
	return $xml;
}
?>