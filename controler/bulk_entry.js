//####################################################################################################
//FILE UPLOAD TOOL MANAGEMENT
//####################################################################################################
$('#fileupload').fileupload({
		
	//in octets
	minFileSize: 1,
	maxFileSize: 5*1024*1024,
	maxNumberOfFiles: 10,
	acceptFileTypes: /(\.|\/)(csv)$/i,
	// example : acceptFileTypes: /(\.|\/)(xls|xlsx|csv)$/i,
		
	//To define a restrictive charset area
	//formAcceptCharset: 'utf-8',
		
	//To automatize the upload (no click on upload for the user)
	autoUpload: true,
		
	//Set to false to have more than a file per XHR
	singleFileUploads: true,
		
	messages: {
		minFileSize: 'Empty file',
		maxFileSize: 'File exceeds maximum allowed size of 5MB.',
		maxNumberOfFiles: 'Too much files to upload at once (1 max.).',
		acceptFileTypes: 'Wrong format : only CSV is allowed.',
	},
		
	//Script to load upload (default is the plugin upload handler - do not touch)
	//url: 'php/upload2.php',
		
	dataType: 'json',
		
	//---------------------RESPONSE MANAGEMENT---------------------------------------
	//Works like a XHR : when done
	done: function (e, data) {
		
		//Remove the moving strips of the progressbar
		$('div[role="progressbar"]').removeClass("active");
		
		//Get the file_name
		var file_name = data.result.files[0].name;
		
		//If the file has just been uploaded (it wasn't present on the server), print a success message and hide the green progress bar
		if (typeof file_name !== 'undefined') {
			message = "File successfully sent to the server! File checking starts!";
			DeleteMessage();
			CreateMessage("green", message, 0.5, 3, 0.5);
			
			//Hide the progress information if needed
			// $(".progress").hide();
			// $(".progress-extended").hide();
		}
		
		//Send the file name to the file upload function
		file_upload(file_name);
	}
});


//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//After page loading : call to the functions to load the tabs
$(document).ready(function () {
	load_loading();
	
	//Get the tabs and insert it into the page
	generate_tabs("bulk_entry", "");
});

//####################################################################################################
//FUNCTIONS
//####################################################################################################
//------------------------------------------------------------------
//Trigger the verifications and the upload into db and manage callbacks
function file_upload(file_name) {

	//Display the loading picture
	toggle_loading();

	//Generate XML with file name
	var xml = 
        '<xml version="1.0">' +
			'<file_name>' + file_name + '</file_name>' +
			'<user>' + user + '</user>' +
		'</xml>';
	
	//AJAX call to start verifications (4 steps : outter_verifications, CSV_reading, inner_verifications, upload)
	var request = $.ajax({
						type: "POST",
						url: "model/bulk_entry/file_outer_verifications.php",
						data: xml,
						contentType: "text/xml; charset=utf-8",
						dataType: "xml",
						success: OnSuccess,
						error: OnError
	});
	

	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		var log_name = $(request.responseText).find("log_name").text();
		
		//Hide the loading picture
		toggle_loading();
		
		//If success, print the message
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
		}
		//If error, print the message
		else if ((success == "") && (error !== "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
			
			//If a log was generated, add a download button
			if (log_name !== "") {
				get_button(log_name);
			}
		}			
	}
	
	//Else : error
	function OnError(request, data, status) {	
		//Hide the loading picture
		toggle_loading();
	
		message = "Network problem: XHR didn't work. Perhaps, incorrect URL is called or file format isn't good.<br/>Verify that column seperators are commas, line separators are line breaks and there is no empty line at the end.";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
	
}

//--------------------------------------------------------
//Create the download button
function get_button(log_name) {
			
	var span_download = document.createElement("span");
	span_download.className = "btn btn-warning";
	span_download.id = "download_button";
		
	var i_download = document.createElement("i");
	i_download.className = "glyphicon glyphicon-download-alt";
		
	var span_download2 = document.createElement("span");
	span_download2.innerHTML = "Download log";
		
	span_download.append(i_download);
	span_download.append(span_download2);
	$('#button_bar').append(span_download);
	
	$('#button_bar').click(function(){ 
		window.location = "/osot/uploaded_files/_logs/" + log_name;
	});
}