<!DOCTYPE HTML>

<html lang="en">

<head>
	<!-- Force latest IE rendering engine or ChromeFrame if installed (to work on old versions of IE and Chrome)-->
	<!--[if IE]>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<![endif]-->
	
	<meta charset="utf-8">
	<title>Admin panel - Fields management</title>
	
	<!--Bootstrap Definition-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<!--Favicon link-->
	<link rel="shortcut icon" href="pictures/thinxtra_favicon.png" type="image/x-icon">
	
	<!-- CSS------------------------------------------------------------->
	<!-- Bootstrap styles -->
	<link rel="stylesheet" href="../plugins/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css">
	
	<!-- Bootstrap-select module styles -->
	<link rel="stylesheet" href="../plugins/bootstrap-select-1.11.2/dist/css/bootstrap-select.min.css">
	
	<!-- Generic page styles -->
	<link rel="stylesheet" href="../style/style.css">
	
	<!-- Specific page styles -->
	<link rel="stylesheet" href="../style/admin.css">
</head>

<body>
<?php include '../view/navbar.php'?>

<div class="container">
	<h1>User administration</h1>
	
    <ul id="tab_bar" class="nav nav-tabs">
        <li><a href="../admin.php">User administration</a></li>
		<li class="active"><a href="group_management.php">Groups/Tabs management</a></li>
		<li><a href="field_management.php">Fields management</a></li>
		<li><a href="admin_panel/list_of_values.php">List of values modification</a></li>
		<li><a href="pre_set_filters.php">Pre-set filters management</a></li>
		<li><a href="log_display.php">Log display/rollback</a></li>
    </ul>
	
	<div id="alert_message"></div>

	 <!-- User selection -->	
	<div id="group_select_div" class="col-lg-6">
		<select id="group_select" class="selectpicker" multiple data-max-options="1">
		</select>
	</div>
	<div class="col-lg-6">
		<span class="btn btn-success pull-right" id="new_group_button">
			<i class="glyphicon glyphicon-plus"></i>
			<span>New group</span>
		</span>
    </div>
	
	
    <!-- Form in which the field are auto-generated -->
    <form id="user_admin_form" method="POST" enctype="multipart/form-data">
		<div class="row">
            <div class="col-lg-7">
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
        <div class="panel-heading">
            <h3 class="panel-title">Notes</h3>
        </div>
		<div class="panel-body">
            <ul>
                <li>Position value can be <strong>normal or right</strong>.</li>
                <li>For a normal new tab, <strong>link must be empty</strong>.</li>
            </ul>
        </div>
    </div>
</div>


<!--JS plugins-------------------------------------------------------------------------------->
<!-- Jquery -->
<script src="../plugins/jquery/jquery-3.1.0.min.js"></script>

<!-- jQuery UI -->
<link rel="stylesheet" href="../plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.css">
<script src="../plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.js"></script>

<!-- Bootstrap JS (responsive design) -->
<script src="../plugins/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>

<!-- Bootstrap search and selection module -->
<script src="../plugins/bootstrap-select-1.11.2/dist/js/bootstrap-select.min.js"></script>

<!-- Jquery Bootstrap validator plugin  -->
<script src="../plugins/validator/validator.js"></script>

<!--Other javascripts------------------------------------------------------->
<script src="../controler/generic_functions/url_spliter.js"></script>
<script src="../controler/generic_functions/message.js"></script>
<script src="../controler/generic_functions/button.js"></script>
<script src="../controler/admin/group_management.js"></script>


</body>
</html>