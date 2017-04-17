<?php
//###################################################################################################
//USEFUL FOR LOGOUT
//###################################################################################################
	
//Script which manage logout
include_once 'security_functions.php';

//Start the session (call the session object, cookie)
sec_session_start();

// Destroy the session variables
$_SESSION = array();

//Get the cookie parameters and destroy them
$params = session_get_cookie_params();

setcookie(session_name(), '', time() - 42000,
			$params["path"],
			$params["domain"],
			$params["secure"],
			$params["httponly"]);

//Destroy the session
session_destroy();
header('Location: ../../index.php');
exit;

?>