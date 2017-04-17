<?php
include_once '../connectors/db_connect.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the selected user group
$user_group = $xml->user_group;

$message = get_user_group_info($mysqli, $user_group);

//Print as json format
$json = json_encode($message, JSON_PRETTY_PRINT);
echo $json;

//###################################################################################################
//FUNCTIONS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which return the list of rights for an user group
function get_user_group_info($mysqli, $user_group) {
	
	//SQL injection protection
	$user_group = mysqli_real_escape_string($mysqli, $user_group);
	
	// Select the object into the SQL request
	$sql = "SELECT column_name, $user_group FROM table_columns";
	
	if ($stmt = $mysqli->prepare($sql)) {	
		//eturn an error
		if (! $stmt->execute()) {
			$message = "ERROR : table_columns database - Problem when trying to select the columns data into the database.";
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (columns_names)
			$stmt->bind_result($column_name, $user_group_value);

			//$i is necessary for incrementing the result table
			$i =0;
			
			//While there are results, generate new lines in the table
			while ($stmt->fetch()) {
				//Add all the data related to the required object in the table
				if (!empty($column_name)) {
					$message[$column_name] = $user_group_value; 
				}
				//else,  return an error
				else {
					$message = "ERROR : table_columns database - Object doesn't exist.";
				}
			}
			$stmt->close();
		}
	}
	//else,  return an error
	else {
		$message = "ERROR : table_columns database - Problem when trying to prepare the SQL request.";
	}
	//return the message
	return $message;
}




