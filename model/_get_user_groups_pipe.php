<?php
include_once 'get_user_groups.php';

//Prepare the first node of the xml response (ready to rint in XML or JSON)
$xml_response = new SimpleXMLElement('<xml/>');

$message = get_user_group_list($mysqli, $xml_response, "json");

//Print as json
$json = json_encode($message, JSON_PRETTY_PRINT);
echo $json;

?>