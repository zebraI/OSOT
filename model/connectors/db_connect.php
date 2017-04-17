<?php
	
	//Connexion à la base de données pour authentification
	include_once 'config.php';
	
	$mysqli = new mysqli(HOST, USER, PASSWORD, DATABASE);
	$mysqli->set_charset("utf8");
?>