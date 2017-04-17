<?php
include_once '../connectors/db_connect.php';

//Prepare the first node of the xml response (ready to rint in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');


$message = get_user_info_fields($mysqli, $xml_response);

	
//Print as json
$json = json_encode($message, JSON_PRETTY_PRINT);
echo $json;



//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which return the list of fields to create
function get_user_info_fields($mysqli, $xml_response) {
	
	// Select the object into the SQL request
	$sql = "SELECT column_name FROM admin_user_fields";
	
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : admin_user_fields database - Problem when trying to select the columns data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (columns_names)
			$stmt->bind_result($column_name);

			
			//While there are results, generate new lines in the xml_response
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml_response
				if (!empty($column_name)) {
					$response = $xml_response->addChild("column_name", $column_name);
				}
				//else,  return an error in the xml_response
				else {
					$message = "ERROR : admin_user_fields database - No columns.";
					$response = $xml_response->addChild('error',$message);
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error in the xml_response
	else {
		$message = "ERROR : admin_user_fields database - Problem when trying to prepare the SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	//return the xml_response
	return $xml_response;
}




?>