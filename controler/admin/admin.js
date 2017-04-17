//####################################################################################################
//SELECTPICKER MANAGEMENT + ACTIONS
//####################################################################################################
//Management of all the select fields
$('.selectpicker').selectpicker({
	  //Colour
	  style: 'btn-primary',
	  //Size before apparition of the scrollbar
	  size: 10,
	  //Activate the search field
	  liveSearch: true,
	  //Show tick symbol close to the selected option
	  showTick: true,  
});

//Management of the user select
$('#user_select').selectpicker({
	title: 'Select an user here!',
});

//When the user select field is getting hidden (remove the fields, the unblock user button,  get the user groups, the user informationa and the status (if blocked)
$('#user_select').on('hidden.bs.select', function (e) {
	remove_user_info();
	$("#unblock_user_button").remove();
	get_user_groups();
	get_user_info();
	get_user_status();
	
	//If the selected user isn't null, show the button
	if (($("#user_select option:selected").text()) !== "") {
		$('#change_password_button').show("fast");
		$('#modify_user_info_button').hide("fast");
	}
});

//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//When the page is ready
$(document).ready(function () {
	//Create hidden buttons
	get_button("modify_user_info", "pencil", "success", "user_select_div", "invisible");
	get_button("change_password", "asterisk", "success", "user_select_div", "invisible");
	
	//Feed the user select with the existing users
	get_users();
});

//On click on modify_user_info button, user info form appears
$("#user_select_div").on("click", '#modify_user_info_button', function() {
	remove_user_info();
	get_user_groups();
	get_user_info();
	
	//If the selected user isn't null, hide the button and show the other one
	if (($("#user_select option:selected").text()) !== "") {
		$('#change_password_button').show("fast");
		$('#modify_user_info_button').hide("fast");
	}
});

//On click on modify_user_info button, change password form appears
$("#user_select_div").on("click", '#change_password_button', function() {
	remove_user_info();
	create_password_field();
	
	//If the selected user isn't null, hide the button and show the other one
	if (($("#user_select option:selected").text()) !== "") {
		$('#change_password_button').hide("fast");
		$('#modify_user_info_button').show("fast");
	}
});

//On click on new user button, create the new user form
$( "#new_user_button" ).click(function() {
	//Remove the information and get the user groups
	remove_user_info();
	//Remove the last connection span if it exists and the unblock user button
	$("#last_connection_time").remove();
	$("#unblock_user_button").remove();
	
	get_user_groups("new");	
	
	//Hide the buttons and empty the selectpicker
	$('#change_password_button').hide("fast");
	$('#modify_user_info_button').hide("fast");
	$('#user_select').selectpicker('val', '');
	
	//Generate the form
	get_new_user_fields();

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

//On click on the unblock_user_button, launch the function to unblock user account
$("#user_select_div").on("click", '#unblock_user_button', function() {
	unblock_user();
});

//####################################################################################################
//FUNCTIONS
//####################################################################################################
//---------------------------------------------------------------------
//Fonction which get the list of the existing users (mail addresses)
function get_users() {
	var mail = "ALL";
	
	var xml = 
        '<xml version="1.0"><data_format>json</data_format>' +
			'<mail>' + mail + '</mail>' +
		'</xml>';
		
	var request = $.ajax({
							type: "POST",
							url: "model/admin/get_user_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites (JSON format) or display the error message
	function OnSuccess(data,status,request) {
		
		//Create an array
		var options = [];
		
		//For each element
		$.each(data, function(key, value){
			//For each couple key-value; if it is not an error, create an option and push it in the array
			$.each(value,function(element_key,element_value){
	
				if (element_value !== "ERROR") {
					var option = '<option id="' + element_value + '" value="' + element_value + '">' + element_value + '</option>';
					options.push(option);
				}
				// else display an error
				else {
					DeleteMessage();
					CreateMessage("red", element_value, 0.5, 3, 0.5);
				}
			});
		});
		
		//Refresh the user field to add the new options (the table)
		$("#user_select").append(options.join('')).selectpicker('refresh');
	}
	
	
}


//---------------------------------------------------------------------
//Fonction which delete the user info fields if it already existsS
function remove_user_info() {
	
	//It the user info class already exists, remove it to not add a new one on top of the other
	if ($(".user_info")) {
		$(".user_info").remove();
	}
}


//---------------------------------------------------------------------
//Fonction which get the list of user groups and generate a select (parameter created to manage the case of new users)
function get_user_groups(parameter) {

	//If the user name (mail) selected isn't null or if we want to create a new user, create the XML and send it
	if ((($("#user_select option:selected").text()) !== "") || (parameter == "new")) {
		//AJAX call
		var request = $.ajax({
								type: "POST",
								url: "model/_get_user_groups_pipe.php",
								contentType: "text/xml; charset=utf-8",
								dataType: "json",
								success: OnSuccess,
								error: OnError
		});
	}
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		
		//Create an array with a first option "Admin" (the option admin is not in the returned list as it's not a tab)
		var options = ['<option id="admin" value="admin">Admin</option>'];
		
		//For each couple key-value; if it is not an error, create an option with the key (user_groups names) and push it in the array
		$.each(data, function(element_key, element_value){
			
			if (element_key !== "ERROR") {				
				//Remove underscores and capitalize
				element_key_formated = (element_key.replace(/_/g, ' '));
				element_key_formated = element_key_formated.substr(0,1).toUpperCase() + element_key_formated.substr(1);
				
				//Lowercase element_key
				element_key = element_key.toLowerCase();
				
				//create an option line and insert it in a table
				var option = '<option id="' + element_key + '" value="' + element_key + '">' + element_key_formated + '</option>';
				options.push(option);
			}
			// else display an error
			else {
				DeleteMessage();
				CreateMessage("red", element_value, 0.5, 3, 0.5);
			}
		});
		
		// Create a div
		var div = document.createElement("div");
		div.id = "user_group_div";
		div.className = "form-group user_info";
				
		//Create and insert the label
		var label = document.createElement("label");
		label.setAttribute("for","user_group");
		label.className = "control-label";
		label.innerHTML = "User group";	
		div.append(label);
		
		//Create the select
		var select = document.createElement("select");
		select.id = "user_group";
		select.className = "form-control";
		select.multiple = true;
		div.append(select);
		
		//Insert the whole into the page
		$(div).insertBefore("div .row");
		
		//Refresh the user group field to add the new options (the table)
		$("#user_group").append(options.join('')).selectpicker('refresh');
	}

}



//---------------------------------------------------------------------
//Function which get the information about the desired user
function get_user_info() {
	var mail = $("#user_select option:selected").text();
	
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
		//Create a table for the user_group values
		var selected_values = [];
		
		//Create a div to append
		var div = document.createElement("div");
		div.id = "user_info_div";
		div.className = "form-group user_info";

		//For each element, create a select and fill it.
		$.each(data, function(key, value){
			//If the key is the user group, gather the values into a table
			if (key == "user_group") {
				$.each(value, function(element_key, element_value){
					selected_values.push(element_value);
				});
			}
			//Else, Create inputs and fill them
			else {
				
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
		$(div).insertBefore("div #user_group_div");
		
		//Check the table content (1st row) into the field
		$("#user_group").selectpicker('val', selected_values);
	}
}


//---------------------------------------------------------------------
//Function which get the user status and show if it is blocked
function get_user_status() {
	
	//Remove the last connection span if it already exists
	$("#last_connection_time").remove();
	
	//Catch the selected user id (mail)
	var mail = [];
	$.each($(("#user_select option:selected")), function(){
		mail.push($(this).val());
	});
	
	//Generate the first part of the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<mail>' + mail + '</mail>' +
		'</xml>';
	
	//AJAX call
	var request = $.ajax({
							type: "POST",
							url: "model/admin/get_user_status.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the form with the fields
	function OnSuccess(data,status,request) {
		//Get the connection status
		var status = $(request.responseText).find("status").text();
		
		//Create a div
		var div = document.createElement("div");
		div.className = "col-lg-12";
		div.id = "last_connection_time";
		div.style.paddingLeft = "0px";
		
		//Create a span to append
		var span = document.createElement("span");
		span.className = "label label-default";
		
		//If the status is blocked create a button and  print a message into the span
		if (status == "blocked") {
			get_button("unblock_user", "user", "warning", "user_select_div", "visible");
			
			//Insert a message into the span
			span.innerHTML = "User account blocked.";
		}
		//If the status is "never connected" and insert a message into the span
		else if (status == "never connected") {
			//Insert a message into the span
			span.innerHTML = "User never connected.";
		}
		//Else, get the connection time, convert to the right date format and insert it into the span
		else {
			//Get connection time
			var connection_time = $(request.responseText).find("connection_time").text();
			
			//Convert the date tot right format
			var year = connection_time.split(' ')[0].split('-');
			var new_year = year[2] + "/" + year[1] + "/" + year[0];
			var new_connection_time = new_year + " " + connection_time.split(' ')[1];

			//Insert the whole into the span
			span.innerHTML = "Last connection time: " + new_connection_time;
		}
		
		//Append the span
		div.append(span);
		$("#user_select_div").append(div);
	}
	
}


//---------------------------------------------------------------------
//Function which change user status to unblock him
function unblock_user() {
	
	//Catch the selected user id (mail)
	var mail = [];
	$.each($(("#user_select option:selected")), function(){
		mail.push($(this).val());
	});
	
	//Generate the first part of the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<mail>' + mail + '</mail>' +
		'</xml>';
	
	//AJAX call
	var request = $.ajax({
							type: "POST",
							url: "model/admin/set_user_status.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	
	//If success, display the success message or display the error message
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
			
			//Remove the unblock user button
			$("#unblock_user_button").remove();
			
			//Refresh the user status
			get_user_status()
		}
		//Else, print the error in a message
		else if ((error !== "") && (success == "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}
}


//---------------------------------------------------------------------
//Fonction which create a password field
function create_password_field() {
	//Create a div to append
	var div = document.createElement("div");
	div.className = "form-group user_info";
	div.id = "password_user_info"
	
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
	
	//Catch the selected user id (mail)
	var mail = [];
	$.each($(("#user_select option:selected")), function(){
		mail.push($(this).val());
	});
	
	//If new password input field exists then call a function to change the password
	if ($("#new_password_input").length > 0) {
		change_user_password(mail);
	}
	//If new_user class exists then call a function to create an user
	else if ($(".new_user").length > 0) {
		create_user();
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
	
	//Catch the selected user group(s)
	var user_group = [];
	$.each($(("#user_group option:selected")), function(){
		user_group.push($(this).val());
	});
	
	//Generate the first part of the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<mail>' + mail + '</mail>' +
			'<name>' + name + '</name>' +
			'<phone>' + phone + '</phone>' +
			'<address>' + address + '</address>' +
			'<user_group>';
				
	
	// Get the number of selected user group(s)
	var user_group_number = user_group.length;	
	
	if (user_group_number > 0) {

		//Insert the user_groups from the table into the xml
		for (var i = 0 ; i < user_group_number ; i++) {
			xml +=  '<user_group_name>' + user_group[i] + '</user_group_name>';
		}
	}
	
	//Close the xml string
	xml += '</user_group>' + '</xml>';
	
	
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
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
			
			//Remove the form and delete the selected option in the selectpicker and hide the button
			$("#user_info_div").remove();
			$("#user_group_div").remove();
			$('#user_select').selectpicker('deselectAll');
			$('#modify_user_info_button').hide();
		}
		else if ((error !== "") && (success == "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}	
}

//---------------------------------------------------------------------
//Function which get the user fields and create the fields
function get_new_user_fields() {
	
	//AJAX call
	var request = $.ajax({
							type: "POST",
							url: "model/admin/get_user_info_fields.php",
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});

	//If success, complete the form with the fields
	function OnSuccess(data,status,request) {
		
		//Create a div to append
		var div = document.createElement("div");
		div.id = "user_info_div";
		div.className = "form-group user_info new_user";
		
		//For each element, create a select and fill it.
		$.each(data.column_name, function(key, value){
			// Remove underscores and capitalize the value
				value_formated = (value.replace(/_/g, ' '));
				value_formated = value_formated.substr(0,1).toUpperCase() + value_formated.substr(1);
				
				//Create a div to append (for styling reasons)
				var div1 = document.createElement("div");
				div1.className = "form-group";
				
				//Create and insert the label
				var label = document.createElement("label");
				label.setAttribute("for",value);
				label.className = "control-label";
				label.innerHTML = value_formated;	
				div1.append(label);
				
				//Create the input and fill it with the value
				var input = document.createElement("input");
				input.id = value;
				input.className = "form-control";
				input.placeholder = value_formated;
				
				//Manage the mail case
				if (value == "mail") {
					input.type = "email";
				}
				
				//Manage the password case
				if (value == "password") {
					div1.id = "password_div";
					input.type = "password";
				}
				
				div1.append(input);
				
				//Append the div with label and input to the global div
				div.append(div1);
		});
		
		//Append the global div before the user group field div
		$(div).insertBefore("div #user_group_div");
		
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
		
		//Add the password confirmation field to the page
		$(div1).insertAfter("div #password_div");
	}
}

//---------------------------------------------------------------------
//Function which create an user
function create_user() {
	
	//Call a function to verify if the passwords match, if it suits the requirements and which hash it
	//Get true or false as callback
	var form_hash_success = regformhash($("#user_admin_form"), $("#mail"), $("#password"), $("#password_confirmation"));
	
	//If it's ok, prepare and makke the AJAX call
	if (form_hash_success == true) {
		
		var name = $("#name").val();
		var phone = $("#phone").val();
		var address = $("#address").val();
		var mail = $("#mail").val();
		var p = $("#p").val();
			
		//Catch the selected user group(s)
		var user_group = [];
		$.each($(("#user_group option:selected")), function(){
			user_group.push($(this).val());
		});
		
		//Generate the first part of the XML
		var xml = 
			'<xml version="1.0"><data_format>xml</data_format>' +
				'<mail>' + mail + '</mail>' +
				'<name>' + name + '</name>' +
				'<phone>' + phone + '</phone>' +
				'<address>' + address + '</address>' +
				'<p>' + p + '</p>' +
				'<user_group>';
					
		
		// Get the number of selected user group(s)
		var user_group_number = user_group.length;	
		
		if (user_group_number > 0) {

			//Insert the user_groups (with underscore and lowercase) from the table into the xml
			for (var i = 0 ; i < user_group_number ; i++) {
				xml +=  '<user_group_name>' + user_group[i].replace(/ /g, '_').toLowerCase() + '</user_group_name>';
			}
		}
		
		//Close the xml string
		xml += '</user_group>' + '</xml>';
		
		

		
		//AJAX call
		var request = $.ajax({
								type: "POST",
								url: "model/admin/set_new_user.php",
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
			
			//Remove the form
			$("#user_info_div").remove();
			$("#user_group_div").remove();
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
	var form_hash_success = regformhash($("#user_admin_form"), $("#mail"), $("#new_password_input"), $("#password_confirmation"));
	
	//If it's ok, prepare and make the AJAX call
	if (form_hash_success == true) {
			
		var mail = $("#user_select option:selected").text();
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
			
			//Remove the form and delete the selected option in the selectpicker and hide the button
			$("#password_user_info").remove();
			$('#user_select').selectpicker('deselectAll');
			$('#manage_user_info_button').hide();
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