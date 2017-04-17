<?php

require_once 'file_inner_verifications.php';

//####################################################################################################
//FUNCTIONS
//####################################################################################################
//Funtion which read the csv, separate header and body and convert it into an array
function csv_reading($file_name, $file_url, $mysqli) {
	
	//Set time_limit for page loading to one value (avoid php time-out errors)
	set_time_limit(0);
	
	//Options to speed up the process (disable garbage collector and set memory limit to high level)
	ini_set('memory_limit', '2000M');
	//gc_disable();
	
	//Get the rows, the header and gather it
	// $rows = array_map('str_getcsv', file($file_url));
	// $header = array_shift($rows);
		
	// foreach ($rows as $i=>$row) {
		// $rows[$i] = array_combine($header, $row);
	// }
	
	//Open the CSV file; separate each lines and get the header
	$csv = file_get_contents($file_url, FILE_USE_INCLUDE_PATH);
	$lines = explode("\n", $csv);
	//remove the first element from the array
	$head = str_getcsv(array_shift($lines));

	//Create an associative array with associative arrays inside (one per line).
	//Those have the header as index for the data
	$data = array();
	foreach ($lines as $line) {
	  $data[] = array_combine($head, str_getcsv($line));
	}
	
	// print_r(empty($data[0]["head4"]));
	// print_r(($data));
	
	//Launch the checking of the full table
	file_inner_verifications($data, $head, $file_name, $file_url, $mysqli);	
}

?>