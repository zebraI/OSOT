<?php
include_once 'connectors/db_connect.php';

//----------------------------------------------------------------------------------------------------
//FUNCTIONS
//----------------------------------------------------------------------------------------------------
//Function which return the names of the columns groups(where user group = W or R)
//xml is the xml which gather the information and option is WR (return W and R rights), W or R
//If data_type is set to true, return also the data_type
function get_user_groups_info($mysqli, $xml, $option, $data_type) {
	
	//Get the number of groups in which the user is
	$user_groups_number = sizeof($xml->user_groups->group);
	
	//String that indicate the list of the column in which data should be inserted
	$user_groups_sql = "";
	
	//Generate a part of the SQL with user groups, and "or" if needed
	for($i = 0; $i < $user_groups_number; $i++) {
		$user_group = $xml->user_groups->group[$i];
		
		if ($i !== 0) {
			$or = " or ";
		}
		else if ($i == 0) {
			$or = "";
		}
		
		//Management of the option in order to get the right columns
		if ($option == "WR") {
			$user_groups_sql = $user_groups_sql . $or . $user_group . "= 'W' or " . $user_group . "= 'R'";
		}
		else if ($option == "W") {
			$user_groups_sql = $user_groups_sql . $or . $user_group . "= 'W'";
		}
		else if ($option == "R") {
			$user_groups_sql = $user_groups_sql . $or . $user_group . "= 'R'";
		}
	}
		
	// Select the object into the SQL request (include data_type into the request if asked)
	if($data_type == true) {
		$sql = "SELECT column_name, data_type FROM table_columns WHERE $user_groups_sql AND report_column <> '' ORDER BY report_column ASC";
	}
	else {
		$sql = "SELECT column_name FROM table_columns WHERE $user_groups_sql AND report_column <> '' ORDER BY report_column ASC";
	}
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {		
		if (! $stmt->execute()) {
			$message = "ERROR : table_columns database - Problem when trying to select the columns data into the database.";
		}
		else {
			$stmt->store_result();
								
			//Link variables to the results (columns_names and data_type, if asked)
			if($data_type == true) {
				$stmt->bind_result($column_name, $data_type);
			}
			else {
				$stmt->bind_result($column_name);
			}

			$message = array();
			$i = 0;
			
			//While there are results, generate new lines in the table
			while ($stmt->fetch()) {
				//Add all the data related to the required user group in the table
				if (!empty($column_name)) {
					// If data type is needed, create another table into the $message table
					if($data_type == true) {
						$message["column_name"][$i] = $column_name;
						$message["data_type"][$i] = $data_type;
					}
					//Else, just insert the column_names
					else {
						$message[$i] = $column_name;
					}
					$i++;
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
	//return the xml
	return $message;
}
?>