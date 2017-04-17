
		// $('#change_password_button').show("fast");
		// $('#modify_user_info_button').hide("fast");


//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//When the page is ready
$(document).ready(function () {
	remove_user_info();
	get_user_info();
	
	//Create hidden buttons
	get_button("modify_user_info", "pencil", "success", "user_button_div", "invisible");
	get_button("change_password", "asterisk", "success", "user_button_div", "visible");
});

//On click on modify_user_info button, user info form appears
$("#user_button_div").on("click", '#modify_user_info_button', function() {
	remove_user_info();
	get_user_info();
	
	$('#change_password_button').show("fast");
	$('#modify_user_info_button').hide("fast");
});

//On click on modify_user_info button, change password form appears
$("#user_button_div").on("click", '#change_password_button', function() {
	remove_user_info();
	create_password_field();
	
	$('#change_password_button').hide("fast");
	$('#modify_user_info_button').show("fast");
});


//On click on submit button, submit the form (manage the different possibilities)
$( "#submit_button" ).click(function() {
	submit_form();
});

//On click on reset button, reset the form
$( "#reset_button" ).click(function() {
	remove_user_info();
	get_user_groups();
	get_user_info();
});


//####################################################################################################
//FUNCTIONS
//####################################################################################################
//---------------------------------------------------------------------
//Fonction which delete the user info fields if it already existsS
function remove_user_info() {
	
	//It the user info class already exists, remove it to not add a new one on top of the other
	if ($(".user_info")) {
		$(".user_info").remove();
	}
}



//---------------------------------------------------------------------
//Function which get the information about the desired user
function get_user_info() {
	
	//If the user name (mail) isn't null, create the XML and send it
	if (mail !== "") {
		//Generate XML
		var xml = 
			'<xml version="1.0"><data_format>json</data_format>' +
				'<mail>' + mail + '</mail>' +
			'</xml>';
	
		//AJAX call
		var request = $.ajax({
								type: "POST",
								url: "model/admin/get_user_info.php",
								data: xml,
								contentType: "text/xml; charset=utf-8",
								dataType: "json",
								success: OnSuccess,
								error: OnError
		});
	}
	
	//If success, complete the form with the fields and the values
	function OnSuccess(data,status,request) {
		
		//Create a div to append
		var div = document.createElement("div");
		div.id = "user_info_div";
		div.className = "form-group user_info";

		//For each element, create a field and fill it
		$.each(data, function(key, value){
			//If the key is the user group, gather the values into a table
			if (key !== "user_group") {
				
				// Remove underscores and capitalize the key
				key_formated = (key.replace(/_/g, ' '));
				key_formated = key_formated.substr(0,1).toUpperCase() + key_formated.substr(1);
				
				//Create a div to append (for styling reasons)
				var div1 = document.createElement("div");
				div1.className = "form-group";
				
				//Create and insert the label
				var label = document.createElement("label");
				label.setAttribute("for",key);
				label.className = "control-label";
				label.innerHTML = key_formated;	
				div1.append(label);
				
				//Create the input and fill it with the value
				var input = document.createElement("input");
				input.id = key;
				input.className = "form-control";
				input.value = value;	
				div1.append(input);
				
				//Append the div with label and input to the global div
				div.append(div1);
			}
		});
		//Append the global div before the user group field div
		$(div).insertBefore("div .row");
	}
}

//---------------------------------------------------------------------
//Fonction which create a password field
function create_password_field() {
	//Create a div to append
	var div = document.createElement("div");
	div.className = "form-group user_info";
	
	//Create a div to append (for styling reasons)
	var div0 = document.createElement("div");
	div0.className = "form-group";
				
	//Create and insert the label
	var label = document.createElement("label");
	label.setAttribute("for","new_password");
	label.className = "control-label";
	label.innerHTML = "New password";	
	div0.append(label);
				
	//Create the input and fill it with the value
	var input = document.createElement("input");
	input.id = "new_password_input";
	input.className = "form-control";	
	input.placeholder = "Password";	
	input.type = "password";
	div0.append(input);
	
	//Creation of the password confirmation field
	//Create a div to append (for styling reasons)
	var div1 = document.createElement("div");
	div1.className = "form-group";
		
	//Create and insert the label
	var label = document.createElement("label");
	label.setAttribute("for","password_confirmation");
	label.className = "control-label";
	label.innerHTML = "Password confirmation";	
	div1.append(label);
	
	//Create the input and fill it with the value
	var input = document.createElement("input");
	input.id = "password_confirmation";
	input.className = "form-control";
	input.type = "password";
	input.placeholder = "Type the password another time!";
	div1.append(input);
	
	div.append(div0);
	div.append(div1);
	
	//Insert the div into the page
	$(div).insertBefore("div .row");
}	

//---------------------------------------------------------------------
//Fonction which submit the form (routing to other functions)
function submit_form() {
	
	//If new password input field exists then call a function to change the password
	if ($("#new_password_input").length > 0) {
		change_user_password(mail);
	}
	//Else call a function to modify user
	else {
		modify_user(mail);
	}
}

//---------------------------------------------------------------------
//Function which submit the "modify user" form
function modify_user(mail) {
	
	//Get the new password
	var name = $("#name").val();
	var phone = $("#phone").val();
	var address = $("#address").val();
	

	
	//Generate the first part of the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<mail>' + mail + '</mail>' +
			'<name>' + name + '</name>' +
			'<phone>' + phone + '</phone>' +
			'<address>' + address + '</address>' +
			'</xml>';
	
	
	//AJAX call
	var request = $.ajax({
							type: "POST",
							url: "model/admin/set_user_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//Display success or error message
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
		}
		else if ((error !== "") && (success == "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}	
}

//---------------------------------------------------------------------
//Fonction which submit the "change password" form
function change_user_password(mail) {

	//Get the new password
	var new_password = $("#new_password_input").val();
	
	//Call a function to verify if the passwords match, if it suits the requirements and which hash it
	//Get true or false as callback
	var form_hash_success = regformhash($("#user_parameters_form"), $("#mail"), $("#new_password_input"), $("#password_confirmation"));
	
	//If it's ok, prepare and make the AJAX call
	if (form_hash_success == true) {
			
		var p = $("#p").val();

		//Generate the first part of the XML
		var xml = 
			'<xml version="1.0"><data_format>xml</data_format>' +
				'<mail>' + mail + '</mail>' +
				'<p>' + p + '</p>' +
			'</xml>';
				
		//AJAX call
		var request = $.ajax({
								type: "POST",
								url: "model/admin/set_new_user_password.php",
								data: xml,
								contentType: "text/xml; charset=utf-8",
								dataType: "xml",
								success: OnSuccess,
								error: OnError
		});		
	}
	
	//If success, display the success message or display the error message
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
		}
		else if ((error !== "") && (success == "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}
}

//----------------------------------------------------------------------------------
//Generic function called on XHR error
function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
}	