<?php

function database_upload($file_name, $file_url, $head, $mysqli) {

	$column_order = "";
	//Read the header and transform it into string
	for ($i = 0; $i < count($head); $i++) {
		
		//Comma management
		$comma = ", ";
		if ($i == 0) {
			$comma = "";
		}
		
		$column_order = $column_order . $comma . $head[$i];
	}

	//Parameters
	$database_table = "data_entry"; 
	$field_separator = ","; 
	$line_separator = "\\r\\n";
	$xml_response = new SimpleXMLElement('<xml/>');
	$file_archive_directory = "../../uploaded_files/_archives/";
	
	$sql = "LOAD DATA LOCAL INFILE '" . $file_url . "' INTO TABLE " . $database_table .
        " FIELDS TERMINATED BY '" . $field_separator . "'
        LINES TERMINATED BY '" . $line_separator . "'
        IGNORE 1 LINES (" . $column_order .")";
		
	if (!($stmt = $mysqli->query($sql))) {
		$message = "\nQuery execute failed: ERRNO: (" . $mysqli->errno . ") " . $mysqli->error;
		$response = $xml_response->addChild('error', $message);
	}
	else {
		$message = "Database upload successfully done!";
		$response = $xml_response->addChild('success', $message);
	}
	
	//Archive the file
	$date = date('d-m-Y h-i-s a', time());
	rename($file_url, $file_archive_directory . $date . " - " . $file_name);
	
	Header('Content-type: text/xml; charset=utf-8');
	print($xml_response->asXML());	
}


?>