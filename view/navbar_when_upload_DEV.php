<!DOCTYPE HTML>

<html lang="en">

<head>
	<!-- Force latest IE rendering engine or ChromeFrame if installed (to work on old versions of IE and Chrome)-->
	<!--[if IE]>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<![endif]-->
	
	<meta charset="utf-8">
	
	<!--Bootstrap Definition-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<!-- CSS------------------------------------------------------------->
	<!-- Bootstrap styles -->
	<link rel="stylesheet" href="http://localhost/osot/plugins/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css">
	
	<!-- Generic page styles (written in a this way makes it accessible from every page) -->
	<link rel="stylesheet" href="http://localhost/osot/style/style.css">
</head>

<body>
<div class="navbar navbar-default navbar-fixed-top">
    <div class="container">
        <div class="navbar-header">
			<!--Manage sandwich menus...-->
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-fixed-top .navbar-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
				
            </button>
            <a href="search.php" class="navbar-left"><img src="http://192.168.4.122/pictures/thinxtra_logo.png"></a>
        </div>
        <div class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <li><a href="http://192.168.4.122/search.php">Search</a></li>
                <li><a href="http://192.168.4.122/reporting.php">Reporting</a></li>
				<li><a href="http://192.168.4.122/data_entry.php?thinxtra_site_id=new&tab=
				<?php 
				//Insert the right information into the right tab
				if ($_SESSION['user_groups'][0] == 'admin') {
					echo($_SESSION['user_groups'][1]);
				}
				else {
					echo($_SESSION['user_groups'][0]);
				}
				?>">Data entry</a></li>
				<li><a href="http://192.168.4.122/templates_index.php">Dashboard</a></li>
            </ul>
			<ul class="nav navbar-nav navbar-right">
			
			<?php if ($_SESSION['user_groups'][0] == 'admin') :?>
				<li><a href="http://192.168.4.122/admin.php">Admin</a></li>
			<?php else :?>
				<li><a href="http://192.168.4.122/user_settings.php">Settings</a></li>
			<?php endif;?>
			
				<li><a href="http://192.168.4.122/model/connection_process/process_logout.php">Logout</a></li>
            </ul>
        </div>
    </div>
</div>
</body>
</html>