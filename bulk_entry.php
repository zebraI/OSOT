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
	<title>Data entry module - Bulk entry</title>
	
	<!--Bootstrap Definition-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	
	<!--Favicon link-->
	<link rel="shortcut icon" href="pictures/thinxtra_favicon.png" type="image/x-icon">
	
	<!-- CSS------------------------------------------------------------->
	<!-- Bootstrap styles -->
	<link rel="stylesheet" href="plugins/bootstrap/bootstrap-3.3.7-dist/css/bootstrap.min.css">
	
	<!-- Generic page styles -->
	<link rel="stylesheet" href="style/style.css">
	
	<!-- Auto-gen CSS to style the file input field as button and adjust the Bootstrap progress bars -->
	<link rel="stylesheet" href="plugins/jQuery-File-Upload-9.12.5/css/jquery.fileupload.css">
	<link rel="stylesheet" href="plugins/jQuery-File-Upload-9.12.5/css/jquery.fileupload-ui.css">
	
	<!-- CSS adjustments for browsers with JavaScript disabled -->
	<noscript><link rel="stylesheet" href="plugins/jQuery-File-Upload-9.12.5/css/jquery.fileupload-noscript.css"></noscript>
	<noscript><link rel="stylesheet" href="plugins/jQuery-File-Upload-9.12.5/css/jquery.fileupload-ui-noscript.css"></noscript>
</head>

<body>
<?php include 'view/navbar.php'?>

<div class="container">	
	
   <!-- File upload form used as target for the file upload widget -->
    <form id="fileupload" method="POST" enctype="multipart/form-data">
	
        <!-- Fileupload-buttonbar contains buttons to add/delete files and start/cancel the upload -->
        <div class="row fileupload-buttonbar">
            <div id="button_bar" class="col-lg-7">
                <span class="btn btn-success fileinput-button">
                    <i class="glyphicon glyphicon-plus"></i>
                    <span>Add file...</span>
                    <input type="file" >
                </span>
				
                <!-- The general file loading bar -->
                <span class="fileupload-process"></span>
            </div>
			
            <!-- The general progress state -->
            <div class="col-lg-5 fileupload-progress fade">
                <!-- The general progress bar -->
                <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar progress-bar-success" style="width:0%;"></div>
                </div>
                <!-- The extended general progress state -->
                <div class="progress-extended">&nbsp;</div>
            </div>
        </div>
			
        <!-- The table listing the files available for upload/download -->
        <table role="presentation" class="table table-striped"><tbody class="files"></tbody></table>
    </form>

    <div class="panel panel-default">
        <div class="panel-heading">
            <h3 class="panel-title">Rules</h3>
        </div>
		<div class="panel-body">
            <ul>
                <li>Only <strong>commas</strong> are accepted as column separators.</li>
                <li>Only <strong>line breaks</strong> are accepted as line separators.</li>
                <li>Any empty line in the file will return an error.</li>
                <li>The file has to contain <strong>a header line</strong> with the same titles as the template.</li>
                <li>The use of accentuate or special characters such as &, #, |... should be avoided.</li>
            </ul>
        </div>
    </div>
</div>




<!-- Script to display files available for upload (Django Template)------------------------------------->
<script id="template-upload" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-upload fade">
        <td>
            <span class="preview"></span>
        </td>
        <td>
            <p class="name">{%=file.name%}</p>
            <strong class="error text-danger"></strong>
        </td>
        <td>
            <p class="size">Processing...</p>
            <div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-success" style="width:0%;"></div></div>
        </td>
        <td>
            {% if (!i && !o.options.autoUpload) { %}
                <button class="btn btn-primary start" disabled>
                    <i class="glyphicon glyphicon-upload"></i>
                    <span>Start</span>
                </button>
            {% } %}
        </td>
    </tr>
{% } %}
</script>

<!-- Script to display files available for download (Django Template)------------------------------------->
<script id="template-download" type="text/x-tmpl">
{% for (var i=0, file; file=o.files[i]; i++) { %}
    <tr class="template-download fade">
        <td>
            <span class="preview">
                {% if (file.thumbnailUrl) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" data-gallery><img src="{%=file.thumbnailUrl%}"></a>
                {% } %}
            </span>
        </td>
        <td>
            <p class="name">
                {% if (file.url) { %}
                    <a href="{%=file.url%}" title="{%=file.name%}" download="{%=file.name%}" {%=file.thumbnailUrl?'data-gallery':''%}>{%=file.name%}</a>
                {% } else { %}
                    <span>{%=file.name%}</span>
                {% } %}
            </p>
            {% if (file.error) { %}
                <div><span class="label label-danger">Error</span> {%=file.error%}</div>
            {% } %}
        </td>
        <td>
            <span class="size">{%=o.formatFileSize(file.size)%}</span>
        </td>
        <td>
            {% if (file.deleteUrl) { %}
                <button class="btn btn-danger delete" data-type="{%=file.deleteType%}" data-url="{%=file.deleteUrl%}"{% if (file.deleteWithCredentials) { %} data-xhr-fields='{"withCredentials":true}'{% } %}>
                    <i class="glyphicon glyphicon-trash"></i>
                    <span>Delete</span>
                </button>
                <input type="checkbox" name="delete" value="1" class="toggle">
            {% } else { %}
                <button class="btn btn-warning cancel">
                    <i class="glyphicon glyphicon-ban-circle"></i>
                    <span>Cancel</span>
                </button>
            {% } %}
        </td>
    </tr>
{% } %}
</script>



<!--JS plugins-------------------------------------------------------------------------------->
<!-- Jquery -->
<script src="plugins/jquery/jquery-3.1.0.min.js"></script>

<!-- jQuery UI -->
<link rel="stylesheet" href="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.css">
<script src="plugins/jquery/jquery-ui-1.12.0.custom/jquery-ui.min.js"></script>

<!-- Bootstrap JS (responsive design) -->
<script src="plugins/bootstrap/bootstrap-3.3.7-dist/js/bootstrap.min.js"></script>


<!-- File Upload plugins ------------------------------------------------->

<!-- Templates plugin (upload/download listings) -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/tmpl.min.js"></script>

<!-- Load Image plugin is included for the preview images and image resizing functionality (avoid loading symbol) -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/load-image.all.min.js"></script>

<!-- Iframe Transport (XHR file uploads) -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/jquery.iframe-transport.js"></script>

<!-- The File Upload basic plugin -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/jquery.fileupload.js"></script>
<!-- The File Upload processing plugin -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/jquery.fileupload-process.js"></script>
<!-- The File Upload image preview & resize plugin -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/jquery.fileupload-image.js"></script>
<!-- The File Upload validation plugin -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/jquery.fileupload-validate.js"></script>
<!-- The File Upload user interface plugin -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/jquery.fileupload-ui.js"></script>
<!-- The main application script -->
<script src="plugins/jQuery-File-Upload-9.12.5/js/main.js"></script>

<!--Other javascript necessary to access the S_SESSION variable from Javacript side---->
<script type="text/javascript">var user_groups = <?php echo(json_encode($_SESSION['user_groups'])); ?></script>
<script type="text/javascript">var user = "<?php echo($_SESSION['mail']); ?>";</script>


<!--Other javascripts------------------------------------------------------->
<script src="controler/generic_functions/tabs.js"></script>
<script src="controler/generic_functions/loading.js"></script>
<script src="controler/generic_functions/message.js"></script>
<script src="controler/bulk_entry.js"></script>


</body>
</html>

<?php endif; ?>