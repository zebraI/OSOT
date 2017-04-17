<?php
include_once 'get_user_groups_info.php';

//XML data recuperation
$data = trim(file_get_contents('php://input'));
$xml = new SimpleXMLElement($data);

//Get the user rights wanted for the response
$user_right = $xml->user_right;

//Get the array of columns authorized for the user (true to get the data_type of each column)
$columns_table = get_user_groups_info($mysqli, $xml, $user_right, true);

$json_result = json_encode($columns_table);
echo $json_result;

?>