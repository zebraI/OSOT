<?php
//###################################################################################################
//FUNCTIONS - USEFUL FOR REGISTRATION PROCESS
//###################################################################################################
//--------------------------------------------------------------------------------
//Function which check if an the size of the password and check if an user already exists into the database
function check_password_size_and_user_existence($mysqli, $mail, $password) {

	// The hashed password must be 127 characters long maximum
	if (strlen($password) > 255) {
		$message = '1';
	}
	
	//------------------------------------------------------------------------------
	// Check that the user isn't existing
	
	//Prepare SQL statement to get all the users with the same id
	$sql = "SELECT mail FROM admin_osot_user WHERE mail = ?";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Parameters to insert into the request
		$stmt->bind_param("s",  $mail);
		
		//if it doesn't work, send an error
		if (! $stmt->execute()) {
			$message = "2";
		}
		//Close the call and send a success message
		else {
			$stmt->execute();
			$stmt->store_result();
			
			//If the user already exists, send back an error.
			if($stmt->num_rows >= 1) {
				$message = "4";
			}
			// Else, success
			else {
				$message = "-1";
			}
			
			$stmt->close();
		}
	}
	//if it doesn't work, send an error
	else {
		$message = "3";
	}

	return $message;
}


//--------------------------------------------------------------------------------
//Function which insert user and password into database (with creation of a salt)
function set_user_authentication($mysqli, $mail, $password) {
		
	// Random generation of a salt (16 characters)
	$random_salt = hash('sha512', uniqid(openssl_random_pseudo_bytes(16), TRUE));			
		
	//Gather salt and password; then, hash it to create the crypted password
	$password = hash('sha512', $password . $random_salt);

	
	//Prepare SQL statement
	$sql = "INSERT INTO admin_osot_user (mail, password, salt) VALUES (?, ?, ?)";
	
	//SQL call
	if ($stmt = $mysqli->prepare($sql)) {
		//Parameters to insert into the request
		$stmt->bind_param("sss",  $mail, $password, $random_salt);
		
		//if it doesn't work, send an error
		if (! $stmt->execute()) {
			$message = "5";
		}
		//Close the call and send a success message
		else {
			$stmt->close();
			
			$message = "-1";
		}
	}
	//if it doesn't work, send an error
	else {
		$message = "6";
	}

	//return the message
	return $message;
}
?>