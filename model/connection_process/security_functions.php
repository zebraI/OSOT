<?php

//###################################################################################################
//ALL THE SECURITY FUNCTIONS NEEDED TO OPEN A SESSION AND AVOID DIFFERENT TYPES OF ATTACK
//###################################################################################################

//Absolute path to include the connection info
include_once $_SERVER['DOCUMENT_ROOT'] . '/osot/model/connectors/db_connect.php';

//------------------------------------------------------------------------------
//Function which create a secure PHP session
//(Its call at the top of each page allowq access to a PHP session variable
//[Avoid direct access to cookie, cookie steal and XSS attack]

function sec_session_start() {
	
	//Give a name to the session
	$session_name = 'sec_session_id';
	$secure = SECURE;
	
	//Don't allow Javascript to access to the cookie (session ID)
	$httponly = true;
	
	//Force de session to use cookies only (no other ways to authenticate)
	if (ini_set('session.use_only_cookies', 1) === FALSE) {
		header("Location: ../error.php?err=Could not initiate a safe session (ini_set)");
		exit();
	}
	
	//Get the parameters of the cookie
	$cookieParams = session_get_cookie_params();
	session_set_cookie_params($cookieParams["lifetime"],
		$cookieParams["path"],
		$cookieParams["domain"],
		$secure,
		$httponly);
		
	//Give the chosen name to the session
	session_name($session_name);
	
	//Start the session
	session_start();
	
	//Generate the new session and make the last one disappear
	session_regenerate_id();
}


//-----------------------------------------------------------------------------
//Function which compare ID and password with the ones in the database
//(with declarations against SQL injections)
function login($mail, $password, $mysqli) {
	
	//Select the user into the database
	$sql = "SELECT mail, password, salt FROM admin_osot_user WHERE mail = ? LIMIT 1";

	if ($stmt = $mysqli->prepare($sql)) {
		
		//Indicate that the missing parameter is mail and execute the statement
		$stmt->bind_param('s', $mail);
		$stmt->execute();
		$stmt->store_result();
			
		//Link variables to the results returned
		$stmt->bind_result($mail, $db_password, $salt);
		$stmt->fetch();
		
		//Get the number of results returned
		$row_number = $stmt->num_rows;
		
		//Close the call
		$stmt->close();	
		
		//Hash of the tried password with the salt (which come from db)
		$password = hash('sha512', $password . $salt);
		
		//Verification of the number of users returned (and that it exists)
		if ($row_number == 1) {
			//Verification that the number of registered connection tries isn't over the limit (if it is, return, false)
			if (checkbrute($mail, $mysqli) == true) {
				return false;
			}
			//If OK : verify that the passwords match
			else {
				if ($db_password == $password) {
					
					//Register the login attempt with a status equal to successful
					set_log_attempts($mysqli, $mail, "successful");
					
					//-----------
					//Create some parts of the session varianle
					//If password OK : get the browser and OS information of the user
					$user_browser = $_SERVER['HTTP_USER_AGENT'];
					
					//Saving and XSS protection of the user values
					// $mail = preg_replace("/[^a-zA-Z0-9_\-]+/", "", $mail);
					$_SESSION['mail'] = $mail;				

					//Creation of a string with the password, OS and browser infos
					//Then, hash of this string (useful to avoid session stealing)
					$pre_login_string = $password . $user_browser;
					$_SESSION['login_string'] = hash('sha512', $pre_login_string);
					
					
					//---------SQL call to get the user groups and stock it into session variable----------
					//SQL request to extract the user groups in which the user is
					$sql = "SELECT * FROM admin_osot_user_groups WHERE mail = ? LIMIT 1";
					
					//SQL call
					if ($stmt = $mysqli->prepare($sql)) {
						//Indicate that the missing parameter is mail and execute the statement
						$stmt->bind_param('s', $mail);
						$stmt->execute();
						
						// Get metadata for group_names names (db column names)
						$meta = $stmt->result_metadata();
				
						// Dynamically create an array of variables to use to bind the results (linked with the column name)
						while ($field = $meta->fetch_field()) { 
							$var = $field->name; 
							$$var = null; 
							$fields[$var] = &$$var;
						}

						// bind results (link result with column names)
						call_user_func_array(array($stmt,'bind_result'),$fields);

						// Fetch Results (create an array and insert values keys only when value is equal to 1 - to get user groups names related to the user)
						$i = 0;
						while ($stmt->fetch()) {
							$results = array();
							
							foreach($fields as $k => $v) {
								if ($v == 1) {
									$results[$i] = $k;
									$i++;
								}
							}
						}
						
						// Close the SQL call
						$stmt->close();
						
						//Put it into the variable sessions
						$_SESSION['user_groups'] = $results;	
						
						//Connection successfully done
						return true;
					}	
				}
				//If the passwords don't match, register the connection try the database
				else {
					
					//Check which status to set to the log attempt (if more than 4 attempts, status is blocked)
					$status = get_unsuccessful_attempts_status($mysqli, $mail);
					
					//Register the log attempt
					set_log_attempts($mysqli, $mail, $status);
					
					return false;
				}
			}
		}
		//If more than one user line returned : connexion non authorized
		else {
			return false;
		}	
	}
}

//-----------------------------------------------------------------------------------
//Function which register a log attempt into the database table (needs $mail : mail of the user
//which tried to connect, $status, is the status to give to the attempts
function set_log_attempts($mysqli, $mail, $status) {
	//Set the timezone to Sydney
	date_default_timezone_set('Australia/Sydney');
	
	//Get the UNIX timestamp
	$now = time();
	//Format it
	$now_formated = date("Y-m-d H:i:s",$now);
	
	//Get the IPv6 address of the client
	$ip = $_SERVER['REMOTE_ADDR'];
	
	//Prepare SQL call
	$sql = "INSERT INTO admin_login_attempts(mail, ip_address, timestamp, time, status) VALUES ('$mail', '$ip', '$now', '$now_formated', '$status')";

	//SQL call
	if ($stmt_insert = $mysqli->prepare($sql)) {

		$stmt_insert->execute();
		$stmt_insert->close();	
	}
}


//-----------------------------------------------------------------------------------------
//Function which get a status variable depending of the number of unsuccessful attempts
function get_unsuccessful_attempts_status($mysqli, $mail) {

	//Set the timezone to Sydney
	date_default_timezone_set('Australia/Sydney');

	//Get the UNIX timestamp and the timestamp of 2 hours before
	$now = time();
	$valid_attempts = $now - (2 * 60 * 60);
	
	//Prepare the SQL
	$sql = "SELECT mail FROM admin_login_attempts WHERE mail = ? AND timestamp > '$valid_attempts' AND status='unsuccessful'";

	//Get all the (missed) connection tries during the two last hours
	if ($stmt = $mysqli->prepare($sql)) {

		//Indicate that the missing parameter is the mail and execute the statement
		$stmt->bind_param('s', $mail);
		$stmt->execute();
		$stmt->store_result();
		
		//If more than 4 entries : status to set is blocked
		if ($stmt->num_rows > 4) {
			$status = 'blocked';
		}
		//Else status is unsuccessful
		else {
			$status = 'unsuccessful';
		}
		
		//CLose the call
		$stmt->close();
	}
	
	//Return the status
	return $status;
}


//-----------------------------------------------------------------------------------------
//Function which get if there's a blocked status into the database (which means the account is blocked)
function checkbrute($mail, $mysqli) {
	
	//Prepare the SQL
	$sql = "SELECT status FROM admin_login_attempts WHERE mail = ?";

	//Check if there is a "blocked" value into the database
	if ($stmt = $mysqli->prepare($sql)) {

		//Indicate that the missing parameter is the mail and execute the statement
		$stmt->bind_param('s', $mail);
		$stmt->execute();
		$stmt->store_result();

		//Check if it gets at least a line
		if ($stmt->num_rows > 0) {
			//Link variable to the result of the request
			$stmt->bind_result($status);
			
			//While there are results
			while ($stmt->fetch()) {
				//If a status 'blocked' is detected, close the call and return true
				if ($status == 'blocked') {
					$stmt->close();
					return true;
				}
			}
			
			//Else close the call and return false (no blocked value)
			$stmt->close();
			return false;
		}
		//If there are no lines, return false (no blocked)
		else {
			$stmt->close();
			return false;
		}
	}
}


//------------------------------------------------------------------------------------------
//Function which check the session authentication on each page (cookie - avoid session steal)
function login_check($mysqli) {

	if (isset ($_SESSION['mail'],
				$_SESSION['login_string'])) {
		
		//Get the variables registered in _SESSION earlier and OS and browser information
		$login_string = $_SESSION['login_string'];
		$mail = $_SESSION['mail'];
		$user_browser = $_SERVER['HTTP_USER_AGENT'];

		//Prepare SQL to get the password into the database
		$sql = "SELECT password FROM admin_osot_user WHERE mail = ? LIMIT 1";
		
		//SQL call
		if($stmt = $mysqli->prepare($sql)) {

			//Indicate that the missing parameter is mail and execute the statement
			$stmt->bind_param('s', $mail);
			$stmt->execute();
			$stmt->store_result();
			
			//Check if it gets the user
			if ($stmt->num_rows == 1) {
				
				//If yes, link variable to the result of the request
				$stmt->bind_result($db_password);
				$stmt->fetch();
				
				$stmt->close();

				//Hash of the database password with the browser and OS info to get a string
				//to compare with the login_strin set into the cookie
				$login_check = hash('sha512', $db_password . $user_browser);

				//If the two strings match, return true to authorize connection
				if ($login_check == $login_string) {
					return true;
				}
				//Else, return false to not allow connection (if the two srings aren't matching)
				else {
					return false;
				}
			}
			//Else, return false to not allow connection (if user doesn't exist into the database)
			else {
				return false;
			}
		}
		//Else, return false to not allow connection (if the connection to database doesn't work
		else {
			return false;
		}
	}
	//Else, return false to not allow connection (if an element such as mail or login_string) is missing
	else {
		return false;
	}
}


//-------------------------------------------------------------------------------------------
//Function of URL cleaning in order to avoid the correct display of the path to the register script
//Not useful because AJAX is used instead - (NOT USED)
function esc_url($url) {

	//Return URL only if it is empty
	if ('' == $url) {
		return $url;
	}

	//XSS protection of the URL
	$url = preg_replace('|[^a-z0-9-~+_.?#=!&;,/:%@$\|*\'()\\x80-\\xff]|i', '', $url);

	//Choose some URL characters to make disappear
	$strip = array('%0d', '%0a', '%0D', '%0A');
	
	//Convert the URL into a string and create a counter
	$url = (string) $url;
	$count = 1;
	
	//While the counter exists, replace the chosen characters on the string by nothing ('')
	while ($count) {
		$url = str_replace($strip, '', $url, $count);
	}

	//Other subsitutions in the URL + filter to avoid XSS attack
	$url = str_replace(';//', '://', $url);
	$url = htmlentities($url);
	$url = str_replace('&amp', '&#038', $url);
	$url = str_replace("'", '&#039', $url);
	
	//Check if the URL contains relative links; if yes, delete it.
	if ($url[0] !== '/') {
		return '';
	}
	//If no : return URL
	else {
		return $url;
	}
}
	
?>