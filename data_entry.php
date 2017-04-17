<?php

	include_once 'model/connectors/db_connect.php';
	include_once 'model/connection_process/security_functions.php';
	
	//Set the cookie
	sec_session_start();
	

//Check that the user is connected and that it is the right one; if not, get back to the login page
if(login_check($mysqli) !== true) :
	header("Location: index.php?message=You are not allowed to access the page you requested. Please connect again.");

//Else, access the page
else :
?>

<!DOCTYPE HTML>

<html lang="en">

<head>
	<!-- Force latest IE rendering engine or ChromeFrame if installed (to work on old versions of IE and Chrome)-->
	<!--[if IE]>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<![endif]-->
	
	<meta charset="utf-8">
	<title>Data entry module</title>
	
	<!--Bootstrap Definition-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<!--Favicon link-->
	<link rel="shortcut icon" href="pictures/thinxtra_favicon.png" type="image/x-icon">
	
	<!-- CSS------------------------------------------------------------->
	<!-- Bootstrap styles -->
	<link rel="stylesheet" href="plugins/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css">
	
	<!-- Generic page styles -->
	<link rel="stylesheet" href="style/style.css">
</head>

<body>
<?php include 'view/navbar.php'?>

<div class="container">

    <!-- Form in which the field are auto-generated -->
    <form id="data_entry_form" method="POST" enctype="multipart/form-data" novalidate>
		<div id="form_container" class="col-lg-12">
		<div class="row">
            <div class="col-lg-12">
                <span class="btn btn-success" id="submit_button">
                    <i class="glyphicon glyphicon-send"></i>
                    <span>Submit</span>
                </span>
				
                <span class="btn btn-primary fileinput-button" id="reset_button">
                    <i class="glyphicon glyphicon-erase"></i>
                    <span>Reset</span>
                </span>
            </div>
		</div>
    </form>

    <div class="panel panel-default">
    </div>
	
	<!--<div class="panel panel-default">
        <div class="panel-heading">
            <h3 class="panel-title">Notes</h3>
        </div>
		<div class="panel-body">
            <ul>
                <li>Some <strong>text</strong>.</li>
                <li>Some text</li>
            </ul>
        </div>
    </div> -->
</div>


<!--JS plugins-------------------------------------------------------------------------------->
<!-- Jquery -->
<script src="plugins/jquery/jquery-3.1.0.min.js"></script>

<!-- jQuery UI -->
<link rel="stylesheet" href="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.css">
<script src="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.js"></script>

<!-- Bootstrap JS (responsive design) -->
<script src="plugins/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>


<!--Other javascript necessary to access the S_SESSION variable from Javacript side---->
<script type="text/javascript">var user_groups = <?php echo(json_encode($_SESSION['user_groups'])); ?></script>
<script type="text/javascript">var user = "<?php echo($_SESSION['mail']); ?>";</script>

<!--Other javascripts------------------------------------------------------->
<script src="controler/generic_functions/tabs.js"></script>
<script src="controler/generic_functions/url_spliter.js"></script>
<script src="controler/generic_functions/message.js"></script>
<script src="controler/data_entry.js"></script>


</body>
</html>

<?php endif; ?>