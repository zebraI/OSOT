<!DOCTYPE HTML>

<html lang="en">

<head>
	<!-- Force latest IE rendering engine or ChromeFrame if installed (to work on old versions of IE and Chrome)-->
	<!--[if IE]>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<![endif]-->
	
	<meta charset="utf-8">
	<title>OSOT - Login</title>
	
	<!--Bootstrap Definition-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<!--Favicon link-->
	<link rel="shortcut icon" href="pictures/thinxtra_favicon.png" type="image/x-icon">
	
	<!-- CSS------------------------------------------------------------->
	<!-- Bootstrap styles -->
	<link rel="stylesheet" href="plugins/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css">
	
	<!-- Bootstrap-select module styles -->
	<link rel="stylesheet" href="plugins/bootstrap-select-1.11.2/dist/css/bootstrap-select.min.css">
	
	<!-- Generic page styles -->
	<link rel="stylesheet" href="style/style.css">
	
	<!-- Generic page styles -->
	<link rel="stylesheet" href="style/index.css">
	
</head>

<body>

<div class="container">

<!-- Form to login -->
    <form id="user_connection_form" method="POST" enctype="multipart/form-data" class="form-signin">
		<p class="center">
			<img src="pictures/osot_logo.png">
		</p>
		<p class="center">
			<img src="pictures/thinxtra_logo.png">
		</p>

		<div id="alert_message"></div>
	
		<label for="mail" class="control-label">Email</label>
		<input class="form-control" id="mail" type="email" maxlength="75" placeholder="Enter your email" required autofocus></input>
		
		<label for="user_pwd" class="control-label">Password</label>
		<input class="form-control" id="user_pwd" type="password" maxlength="75" placeholder="Enter your password" required></input>

		<div class="row">
            <div class="col-lg-12">
				<button class="btn btn-lg btn-primary btn-block"  id="login_button" value="login" type="button">Login</button>  	
            </div>
		</div>
    </form>
</div>

<!--JS plugins-------------------------------------------------------------------------------->
<!-- Jquery -->
<script src="plugins/jquery/jquery-3.1.0.min.js"></script>

<!-- jQuery UI -->
<link rel="stylesheet" href="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.css">
<script src="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.js"></script>

<!-- Bootstrap JS (responsive design) -->
<script src="plugins/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>

<!-- Bootstrap search and selection module -->
<script src="plugins/bootstrap-select-1.11.2/dist/js/bootstrap-select.min.js"></script>

<!--Other javascripts------------------------------------------------------->
<script src="controler/generic_functions/url_spliter.js"></script>
<script src="controler/generic_functions/message.js"></script>
<script src="controler/generic_functions/button.js"></script>
<script src="controler/connection_process/sha512.js"></script>
<script src="controler/connection_process/forms.js"></script>
<script src="controler/index.js"></script>


</body>
</html>