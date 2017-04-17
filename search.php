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
	<title>Search module</title>
	
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
</head>

<body>
<?php include 'view/navbar.php'?>


<div class="container">
    <h1>Search</h1>
	
	<div id="alert_message"></div>
	
	<!--Column and search fields + new site button------------------------------------------------->
	<div id="column_field_div" class="col-lg-3">
		<select id="column_field" class="selectpicker" multiple data-max-options="1">
		</select>
	</div>
	<div id="search_field_div" class="col-lg-3">
		<select id="search_field" class="selectpicker" multiple>
		</select>
	</div>
	<div class="col-lg-6">
		<span class="btn btn-success pull-right" id="new_site_button">
			<i class="glyphicon glyphicon-plus"></i>
			<span>New site</span>
		</span>
    </div>
	
	<!--Results table------------------------------------------------->
	<div>
		<table id="info_table" class="table tablesorter"><!--table-striped-->
			<thead class="thead-inverse">
			</thead>
			<tbody>
			</tbody>
		</table>

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

<!-- Jquery Tablesorter (sort table) plugin -->
<script src="plugins/__jquery.tablesorter/jquery.tablesorter.min.js"></script>
<!--Script needed to have no TypeError (no impact on the page) but not activated because in conflict with Boostrap select -->
<!--script src="plugins/__jquery.tablesorter/jquery-latest.min.js"></script>-->

<!--Other javascript necessary to access the S_SESSION variable from Javacript side---->
<script type="text/javascript">var user_groups = <?php echo(json_encode($_SESSION['user_groups'])); ?></script>

<!--Other javascripts------------------------------------------------------->
<script src="controler/generic_functions/message.js"></script>
<script src="controler/generic_functions/table.js"></script>
<script src="controler/search.js"></script>


</body>
</html>

<?php endif; ?>