//Global variable : message in the URL if existing
var url_message = decodeURIComponent(split_url(0));

//####################################################################################################
//WHEN DOCUMENT IS READY
//####################################################################################################
$(document).ready(function() {
	
	if (url_message !== "undefined") {
		DeleteMessage();
		CreateMessage("red", url_message, 0.5, 3, 0.5);
	}
	
	
	// On click on the login button, send the form, the id and the password to a function
	// which will create an hidden input and insert the hashed password in it
	//This function will also send the form to the server for being processed
	$('#login_button').click(function() {
		formhash(this.form.user_pwd);
		
		//Call a function which send the form with the hashed password
		submit_login_form();
	});	
});


//####################################################################################################
//Keyboard and mouse event
//####################################################################################################
$(document).keypress(function(e) {
	//If the pressed key is "enter", simulate a click on the login_button to trigger the normal process
    if(e.which == 13) {
        $('#login_button').trigger('click');
    }
});


//####################################################################################################
//FUNCTIONS
//####################################################################################################
//-----------------------------------------------------------------
//Function which send the form with the hashed password and get the answer
function submit_login_form() {
	var mail = $("#mail").val();
	var p = $("#user_pwd").val();
	
	//Generate XML with file name
	var xml = 
        '<xml version="1.0">' +
			'<mail>' + mail + '</mail>' +
			'<p>' + p + '</p>' +
		'</xml>';
	
	//AJAX call to start verifications (4 steps : outter_verifications, CSV_reading, inner_verifications, upload)
	var request = $.ajax({
						type: "POST",
						url: "model/connection_process/process_login.php",
						data: xml,
						contentType: "text/xml; charset=utf-8",
						dataType: "xml",
						success: OnSuccess,
						error: OnError
	});
	
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		//If success, print the message
		if ((error == "") && (success !== "")) {
			$('#user_connection_form').submit();
			var url = $(request.responseText).find("url").text();
			window.location = url;
		}
		//If error, print the message
		else if ((success == "") && (error !== "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
			$("#user_pwd").val("");
		}			
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work. Perhaps, incorrect URL is called or file format isn't good.<br/>Verify that column seperators are commas, line separators are line breaks and there is no empty line at the end.";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
		$("#user_pwd").val() = "";
	}
}