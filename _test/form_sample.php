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
	
	<!-- CSS------------------------------------------------------------->
	<!-- Bootstrap styles -->
	<link rel="stylesheet" href="plugins/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css">
	
	<!-- Generic page styles -->
	<link rel="stylesheet" href="style/style.css">
</head>

<body>
<?php include 'view/navbar.php'?>

<div class="container">
    <h1>Data entry</h1>
    <ul id="tab_bar" class="nav nav-tabs">
        <li class="active"><a href="data_entry.php">Acquisition</a></li>
		<li><a href="installation.php">Installation</a></li>
		<li><a href="rfp.php">RFP</a></li>
        <li><a href="commissionning.php">Commissionning</a></li>
		<li><a href="bulk_entry.php">Bulk entry</a></li>
    </ul>
	
	<div id="alert_message"></div>
	
	
    <!-- The file upload form used as target for the file upload widget -->
    <form id="data_entry_form" method="POST" enctype="multipart/form-data">
		<div class="form-group">
			<label for="site_name">Example label</label>
			<input type="text" class="form-control" id="site_name" placeholder="Example input">
			 <small id="help" class="text-muted">Some help.</small>
		</div>
		<div class="form-group">
			<label for="site_address">Another label</label>
			<input type="text" class="form-control" id="site_address" placeholder="Another input">
		</div>
		<div class="form-group">
			<label for="site_x">Another label</label>
			<input type="text" class="form-control" id="site_x" placeholder="Another input" disabled>
		</div>
		<div class="form-group row">
			<label class="col-sm-2 col-form-label">Site_y</label>
			<div class="col-sm-10">
				<p class="form-control-static" id="site_y"></p>
			</div>
		</div>
		
        <!-- The fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
        <div class="row">
            <div class="col-lg-7">
                <span class="btn btn-success" id="submit_button">
                    <i class="glyphicon glyphicon-upload"></i>
                    <span>Submit</span>
                </span>
				
                <span class="btn btn-primary fileinput-button" id="reset_button">
                    <i class="glyphicon glyphicon-remove"></i>
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
                <li>Some <strong>text</strong>.</li>
                <li>Some text</li>
            </ul>
        </div>
    </div>
</div>


<!--JS plugins-------------------------------------------------------------------------------->
<!-- Jquery -->
<script src="plugins/jquery/jquery-3.1.0.min.js"></script>

<!-- jQuery UI -->
<link rel="stylesheet" href="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.css">
<script src="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.js"></script>

<!-- Bootstrap JS (responsive design) -->
<script src="plugins/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>


<!--Other javascripts------------------------------------------------------->
<script src="controler/data_entry.js"></script>
<script src="controler/generic_functions/message.js"></script>


</body>
</html>