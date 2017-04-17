<?php

require_once 'file_inner_verifications.php';
//Call a special CSV parser (much more complete than fgetcsv)
require_once '../plugins/parsecsv.lib.php';

//####################################################################################################
//FUNCTIONS
//####################################################################################################
//Funtion which read the csv, separate header and body and convert it into an array
function csv_reading($file_name, $file_url, $user, $mysqli) {
	
	//Set time_limit for page loading to one value (avoid php time-out errors)
	set_time_limit(0);
	
	//Options to speed up the process (disable garbage collector and set memory limit to high level)
	ini_set('memory_limit', '2000M');
	//gc_disable();
	
	//Open the CSV file and parse it 
	$csv = new parseCSV($file_url);
	
	//Print it into an array
	$data = $csv->data;
	
	//Get the header (array of keys)
	$head = array_keys($data[0]);	
	
	// print_r(empty($data[0]["head4"]));
	// print_r(($data));
	
	//Launch the checking of the full table
	file_inner_verifications($data, $head, $file_name, $file_url, $user, $mysqli);	
}

?>