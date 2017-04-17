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
	<title>Reporting module</title>
	
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
	<link rel="stylesheet" href="style/side_menu.css">
	<link rel="stylesheet" href="style/datatables.css">
</head>

<body>
<?php include 'view/navbar.php'?>

<!-------------------------------------------------------------->
<!--Left side menu---------------------------------------------->
<!-------------------------------------------------------------->
<div class="row">
    
    <!-- Menu -->
    <div class="side-menu">
    
	
	<!-- Title -->
		<nav class="navbar navbar-default" role="navigation">
			<div class="navbar-header">
				<div class="brand-wrapper">
				
					<!-- Title -->
					<div class="brand-name-wrapper">
						<a class="navbar-brand">
							Select filters
						</a>
					</div>
				</div>
			</div>

	
			<!-- Main Menu -->
			<div class="side-menu-container">
				<ul class="nav navbar-nav">

					<li id="overall_select_li" class = "side-select"></li>
								

				</ul>
			</div>
		</nav>
    </div>


		
		
		
		
		
		
		
		
		
		
		
		
		<div id="table_container" class="col-md-8 col-md-offset-2 content">

			<h1>Reporting</h1>
			
			<div id="alert_message"></div>
					
			
			<!--Results table------------------------------------------------->
			<div>
				<table id="data_table" class="table"><!--table-striped-->
					<thead class="thead-inverse">
						<tr>
						</tr>
					</thead>
					<tbody>
					</tbody>
				</table>
			</div>
		</div>
		
		<div class="modal fade" id="bulk_edit_modal" tabindex="-1" role="dialog" aria-labelledby="bulk_edit_modal_label" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div id="bulk_edit_modal_header" class="modal-header">
						<h5 class="modal-title" id="exampleModalLabel">New message</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div id="bulk_edit_modal_body" class="modal-body">
						<li id="modal_column_select_li" class="modal_column_select">  
							<label for="modal_column_select" class="control-label">Columns to modify (10 maximum)</label>
							<select id="modal_column_select" class="form-control" data-max-options="10" multiple></select>S
						</li>
					</div>
					<div id="bulk_edit_modal_footer" class="modal-footer">
						<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
						<button type="button" class="btn btn-primary">Send message</button>
					</div>
			</div>
		</div>
	</div>

<!--JS plugins-------------------------------------------------------------------------------->

<!-- DataTables plugins (already contains a JQuery reference)-->
<link rel="stylesheet" type="text/css" href="plugins/DataTables/datatables.min.css"/>
<script type="text/javascript" src="plugins/DataTables/datatables.min.js"></script>

<!-- Bootstrap JS (responsive design) -->
<script src="plugins/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.js"></script>

<!-- jQuery UI -->
<link rel="stylesheet" href="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.css">
<script src="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.js"></script>

<!-- Bootstrap search and selection module -->
<script src="plugins/bootstrap-select-1.11.2/dist/js/bootstrap-select.min.js"></script>

<!-- Bootstrap switch (to change checkboxes into great style buttons) -->
<link rel="stylesheet" type="text/css" href="plugins/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css"/>
<script type="text/javascript" src="plugins/bootstrap-switch/dist/js/bootstrap-switch.min.js"></script>

<!--Other javascript necessary to access the S_SESSION variable from Javacript side---->
<script type="text/javascript">var user_groups = <?php echo(json_encode($_SESSION['user_groups'])); ?>;</script>
<script type="text/javascript">var user = "<?php echo($_SESSION['mail']); ?>";</script>


<!--Other javascripts------------------------------------------------------->
<script src="controler/generic_functions/message.js"></script>
<script src="controler/generic_functions/table.js"></script>
<script src="controler/generic_functions/loading.js"></script>
<script src="controler/reporting.js"></script>


</body>
</html>

<?php endif; ?>