<?php
include_once 'connectors/db_connect.php';

//XML data post recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);
$thinxtra_site_id = $xml->site->thinxtra_site_id;

$fields = $xml->fields->field_name;
$fields_number = $fields->count();
$i = 0;

//Prepare the first node of the xml response
$xml_response = new SimpleXMLElement('<xml/>');

$message = get_tab_fields_info($mysqli, $thinxtra_site_id, $fields_number, $xml, $xml_response);

Header('Content-type: text/xml; charset=utf-8');
print($message->asXML());



//----------------------------------------------------------------------------------------------------
//FUNCTIONS
//----------------------------------------------------------------------------------------------------
// get_data_info : takes mysqli and the name of the site and return all the sites informations
//or an error message. Goal : feed the tab fields with the correct data
function get_tab_fields_info($mysqli, $thinxtra_site_id, $fields_number, $xml, $xml_response){
	
	// Extract the field names and generate a part of the SQL request
	$i = 0;
	$field_names_sql = "";
	
	while($i < $fields_number) {
		$field_name = $xml->fields->field_name[$i];
		
		if ($i !== ($fields_number -1)) {
			$field_names_sql = $field_names_sql . $field_name . ", ";
		}
		else if ($i == ($fields_number -1)) {
			$field_names_sql = $field_names_sql . $field_name;
		}
		$i++;
	}
	
	//Protection against SQL injection
	$thinxtra_site_id = mysqli_real_escape_string($mysqli, $thinxtra_site_id);
	$field_names_sql = mysqli_real_escape_string($mysqli, $field_names_sql);

	$sql = "SELECT $field_names_sql FROM data_entry WHERE thinxtra_site_id = ?";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Indicate which are the parameters to put into the request
		$stmt->bind_param('s', $thinxtra_site_id);
		if (! $stmt->execute()) {
			$message = "ERROR : site database - Problem when trying to select the data into the database (the thinxtra site id value is probably already existing).";
			$response = $xml_response->addChild('error',$message);
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
			
			// Close the SQL call
			$stmt->close();

			//Create a node on the XML
			$response = $xml_response->addChild('site');
			
			//Add every fields_name (key) and every value in the XML (and put it in "result")	
			foreach($results[0] as $key => $value) {
				//If the value is a date, parse it to the right format
				// if (strtotime($value) !== false) {
					// $value = date('d/m/Y', strtotime($value));
				// }
				
				//Print the value (newly obtained if it's a date)
				$result = $response->addChild('result');
				$data = $result->addChild('field_name', $key);						
				$data = $result->addChild('value', $value);
			}
		}
	}
	else {
		$message = "ERROR : site database - Problem when trying to prepare the SQL request.";
		$response = $xml_response->addChild('error',$message);
	}
	
	return $xml_response;
}


?>