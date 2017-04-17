<?php 
include_once 'connectors/db_connect.php';

//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which return the list of all user groups. If data_type isn't json, send back a table
function get_user_group_list($mysqli, $xml_response, $data_type) {
	
	// Select the user_group and the tab position
	$sql = "SELECT user_group, position, link, index_position FROM osot_user_groups ORDER BY index_position ASC";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : osot_user_groups database - Problem when trying to select the columns data into the database.";
			$response = $xml_response->addChild('error',$message);
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (user_groups)
			$stmt->bind_result($user_group, $position, $link, $index_position);

			//£i is useful in case a table is asked as result
			$i = 0;
			
			//While there are results, generate new lines in the xml_response
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the xml_response (if data_type is json or xml)
				if ((!empty($user_group)) && (($data_type == "json") || ($data_type == "xml"))) {
					$response = $xml_response->addChild($user_group, $position);
					$response = $xml_response->addChild($user_group, $link);
					$response = $xml_response->addChild($user_group, $index_position);
				}
				//If the asked type is table, add all the data (lowercased) to a table	
				else if ((!empty($user_group)) && ($data_type == "table")) {
					$response[$i] = strtolower($user_group);
				}
				//else,  return an error in the xml_response
				else {
					$message = "ERROR : osot_user_groups database - No user groups.";
					$response = $xml_response->addChild('error',$message);
				}
				$i++;
			}
			$stmt->close();
		}
	}
	//else,  return an error in the xml_response
	else {
		$message = "ERROR : osot_user_groups database - Problem when trying to prepare the SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	//return the xml_response if the data_type asked isn't a table
	if ($data_type !== "table") {
		return $xml_response;
	}
	else {
		return $response;
	}
}

?>