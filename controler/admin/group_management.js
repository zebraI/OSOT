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
$('#group_select').selectpicker({
	title: 'Select a group here!',
});

//When the user select field is getting hidden
$('#group_select').on('hidden.bs.select', function (e) {
	remove_group_info();
	create_fields_management_form();
	
	//If the selected user isn't null, show the button
	if (($("#group_select option:selected").text()) !== "") {
		$('#manage_group_fields_button').hide("fast");
		$('#modify_group_info_button').show("fast");
	}
});


//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//When the page is ready
$(document).ready(function () {	
	//Create hidden buttons
	get_button("modify_group_info", "pencil", "success", "group_select_div", "invisible");
	get_button("manage_group_fields", "list", "success", "group_select_div", "invisible");

	//Feed the group select with the existing user groups
	get_groups();
});

//On click on modify_group_info button, user info form appears
$("#group_select_div").on("click", '#modify_group_info_button', function() {
	remove_group_info();
	get_group_info();
	
	//If the selected group isn't null, hide the button and show the other one
	if (($("#group_select option:selected").text()) !== "") {
		$('#manage_group_fields_button').show("fast");
		$('#modify_group_info_button').hide("fast");
	}
});

//On click on modify_user_info button, change password form appears
$("#group_select_div").on("click", '#manage_group_fields_button', function() {
	remove_group_info();
	create_fields_management_form();
	
	//If the selected group isn't null, hide the button and show the other one
	if (($("#group_select option:selected").text()) !== "") {
		$('#manage_group_fields_button').hide("fast");
		$('#modify_group_info_button').show("fast");
	}
});




//On click on new group button, create the new group form
$( "#new_group_button" ).click(function() {
	//Remove the information and get the user groups
	remove_group_info();
	
	//Hide the buttons and empty the selectpicker
	$('#modify_group_info_button').hide("fast");
	$('#manage_group_fields_button').hide("fast");
	$('#group_select').selectpicker('val', '');
	
	//Generate the form
	get_new_group_fields();
});

//On submit, submit the form
$( "#submit_button" ).click(function() {
	submit_form();
});

//On click on reset button, reset the form
$( "#reset_button" ).click(function() {
	remove_group_info();
	create_fields_management_form();
});


//####################################################################################################
//FUNCTIONS
//####################################################################################################
//---------------------------------------------------------------------
//Fonction which get the list of the existing groups
function get_groups() {
	
	//Empty the selectpicker
	$('#group_select option').remove();
		
	var request = $.ajax({
							type: "POST",
							url: "../model/_get_user_groups_pipe.php",
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of user groups or display the error message
	function OnSuccess(data,status,request) {
		
		//Create an array
		var options = [];
		
		//For each couple key-value; if it is not an error, create an option with the key (user_groups names) and push it in the array
		$.each(data, function(element_key, element_value){
			
			if (element_key !== "ERROR") {
				//Remove underscores and capitalize
				element_key_formated = (element_key.replace(/_/g, ' '));
				element_key_formated = element_key_formated.substr(0,1).toUpperCase() + element_key_formated.substr(1);
				
				//create an option line and insert it in an array
				var option = '<option id="' + element_key + '" value="' + element_key + '">' + element_key_formated + '</option>';
				options.push(option);
			}
			// else display an error
			else {
				DeleteMessage();
				CreateMessage("red", element_value, 0.5, 3, 0.5);
			}
		});
		
		//Refresh the user group field to add the new options (the array)
		$("#group_select").append(options.join('')).selectpicker('refresh');
	}
}


//---------------------------------------------------------------------
//Fonction which delete the group info fields if it already exists
function remove_group_info() {
	
	//It the group info class already exists, remove it to not add a new one on top of the other
	if ($(".group_info")) {
		$(".group_info").remove();
	}
}


//---------------------------------------------------------------------
//Function which get the information about the desired user group
function get_group_info() {
	var user_group = $("#group_select option:selected").text();
	
	//If the user group isn't null, create the XML and send it
	if (user_group !== "") {
	
		//AJAX call
		var request = $.ajax({
								type: "POST",
								url: "../model/_get_user_groups_pipe.php",
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
		div.id = "group_info_div";
		div.className = "form-group group_info modify_group_info";

		//For each element, create a select and fill it.
		$.each(data, function(key, value){
			
			//If the key is equal to the asked user group (in lowercase and without space), generate the inputs and fill them 
			if ((key.replace(/ /g, '_').toLowerCase()) == (user_group.replace(/ /g, '_').toLowerCase())) {
				
				//Create a div to append (for styling reasons)
				var div1 = document.createElement("div");
				div1.className = "form-group";
				
				//Create and insert the label
				var label = document.createElement("label");
				label.setAttribute("for","position");
				label.className = "control-label";
				label.innerHTML = "Position";	
				div1.append(label);
				
				//Create the input and fill it with the value
				var input = document.createElement("input");
				input.id = "position";
				input.className = "form-control";
				input.value = value[0];	
				div1.append(input);
				
				//Create a div to append (for styling reasons)
				var div2 = document.createElement("div");
				div2.className = "form-group";
				
				//Create and insert the label
				var label2 = document.createElement("label");
				label2.setAttribute("for","link");
				label2.className = "control-label";
				label2.innerHTML = "Link";	
				div2.append(label2);
				
				//Create the input and fill it with the value
				var input2 = document.createElement("input");
				input2.id = "link";
				input2.className = "form-control";
				
				//Manage the case where link is empty
				if(JSON.stringify(value[1]) == "{}") {
					input2.value = "";
				}
				else {
					input2.value = value[1];
				}
				
				div2.append(input2);
				
				//Create a div to append (for styling reasons)
				var div3 = document.createElement("div");
				div3.className = "form-group";
				
				//Create and insert the label
				var label3 = document.createElement("label");
				label3.setAttribute("for","index_position");
				label3.className = "control-label";
				label3.innerHTML = "Index position";	
				div3.append(label3);
				
				//Create the input and fill it with the value
				var input3 = document.createElement("input");
				input3.id = "index_position";
				input3.className = "form-control";
				
				//Manage the case where link is empty
				if(JSON.stringify(value[2]) == "{}") {
					input3.value = "";
				}
				else {
					input3.value = value[2];
				}

				div3.append(input3);
				
				div.append(div1);
				div.append(div2);
				div.append(div3);
			}
		});
		//Append the global div
		$(div).insertBefore(".row");
	}
}


//---------------------------------------------------------------------
//Fonction which create a form with all the fields contained in a tab/user group
function create_fields_management_form() {
	var user_group = $("#group_select option:selected").text().replace(/ /g, '_').toLowerCase();
	
	//If the user group isn't null, create the XML and send it
	if (user_group !== "") {
		//Generate XML
		var xml = 
			'<xml version="1.0"><data_format>json</data_format>' +
				'<user_group>' + user_group + '</user_group>' +
			'</xml>';
	
		//AJAX call
		var request = $.ajax({
								type: "POST",
								url: "../model/admin/get_user_groups_admin_info.php",
								data: xml,
								contentType: "text/xml; charset=utf-8",
								dataType: "json",
								success: OnSuccess,
								error: OnError
		});
	}
	
	//If success, complete the form with the fields and the values
	function OnSuccess(data,status,request) {
		//Create an array for the options
		var options = [];
		
		//Created 2 arrays for the selected written and read values
		var selected_write_values = [];
		var selected_read_values = [];
		
		//For each couple key-value; if it is not an error, create an option with the key (user_groups names) and push it in the array
		$.each(data, function(element_key, element_value){
			
			//Remove underscores and capitalize
			element_key_formated = (element_key.replace(/_/g, ' '));
			element_key_formated = element_key_formated.substr(0,1).toUpperCase() + element_key_formated.substr(1);
			
			//create an option line and insert it in a table
			var option = '<option id="' + element_key + '" value="' + element_key + '">' + element_key_formated + '</option>';
			options.push(option);
			
			//If the element value is "W" (write), put the key into the write list
			if (element_value == "W") {
				selected_write_values.push(element_key);
			}
			//Else if the element value is "R" (read), put the key into the read list
			else if (element_value == "R") {
				selected_read_values.push(element_key);
			}
		});
		
		// Create a div
		var div = document.createElement("div");
		div.id = "user_group_div";
		div.className = "form-group group_info group_management";
		
		// Create a div
		var div2 = document.createElement("div");
		div2.id = "write_right_select_div";
		
		//Create and insert the label
		var label = document.createElement("label");
		label.setAttribute("for","write_right_select");
		label.className = "control-label";
		label.innerHTML = "Write right";	
		div2.append(label);
		
		//Create the select
		var select = document.createElement("select");
		select.id = "write_right_select";
		select.className = "form-control";
		select.multiple = true;
		div2.append(select);
		
		
		// Create a div
		var div3 = document.createElement("div");
		div3.id = "read_right_select_div";
		
		//Create and insert the label
		var label2 = document.createElement("label");
		label2.setAttribute("for","read_right_select");
		label2.className = "control-label";
		label2.innerHTML = "Read right";	
		div3.append(label2);
		
		//Create the select
		var select2 = document.createElement("select");
		select2.id = "read_right_select";
		select2.className = "form-control";
		select2.multiple = true;
		div3.append(select2);
		
		div.append(div2);
		div.append(div3);
		
		//Insert all the selects into the page
		$(div).insertBefore("div .row");
		
		//Refresh and fill all the selects (write and read rights)
		$("#write_right_select").append(options.join('')).selectpicker('refresh');
		$("#read_right_select").append(options.join('')).selectpicker('refresh');
		
		//Check the table content which needs to be checked into the selects (read and write)
		$("#write_right_select").selectpicker('val', selected_write_values);
		$("#read_right_select").selectpicker('val', selected_read_values);
	}
	
}

//---------------------------------------------------------------------
//Create fields for the new groups/tabs button
function get_new_group_fields() {
	
	//Create a div to append
	var div = document.createElement("div");
	div.id = "group_info_div";
	div.className = "form-group group_info new_group_creation";
	
	//Create a div to append (for styling reasons)
	var div0 = document.createElement("div");
	div0.className = "form-group";
	
	//Create and insert the label
	var label = document.createElement("label");
	label.setAttribute("for","name");
	label.className = "control-label";
	label.innerHTML = "Name";	
	div0.append(label);
	
	//Create the input and fill it with the value
	var input = document.createElement("input");
	input.id = "name";
	input.className = "form-control";
	input.placeholder = "Usergroup name";
	div0.append(input);
	
	//Create a div to append (for styling reasons)
	var div1 = document.createElement("div");
	div1.className = "form-group";
	
	//Create and insert the label
	var label1 = document.createElement("label");
	label1.setAttribute("for","position");
	label1.className = "control-label";
	label1.innerHTML = "Position";	
	div1.append(label1);
	
	//Create the input and fill it with the value
	var input1 = document.createElement("input");
	input1.id = "position";
	input1.className = "form-control";
	input1.placeholder = "Position (normal or right)";	
	div1.append(input1);
	
	//Create a div to append (for styling reasons)
	var div2 = document.createElement("div");
	div2.className = "form-group";
	
	//Create and insert the label
	var label2 = document.createElement("label");
	label2.setAttribute("for","link");
	label2.className = "control-label";
	label2.innerHTML = "Link";	
	div2.append(label2);
	
	//Create the input and fill it with the value
	var input2 = document.createElement("input");
	input2.id = "link";
	input2.className = "form-control";
	input2.placeholder = "Link (empty for normal tab)";	
	div2.append(input2);
	
	//Create a div to append (for styling reasons)
	var div3 = document.createElement("div");
	div3.className = "form-group";
	
	//Create and insert the label
	var label3 = document.createElement("label");
	label3.setAttribute("for","index_position");
	label3.className = "control-label";
	label3.innerHTML = "Index position";	
	div3.append(label3);
	
	//Create the input and fill it with the value
	var input3 = document.createElement("input");
	input3.id = "index_position";
	input3.className = "form-control";
	input3.placeholder = "Index position (1, 2, 3... ; 99 or blank for making it appear after the other tabs)";	
	div3.append(input3);
	
	div.append(div0);
	div.append(div1);
	div.append(div2);
	div.append(div3);

	//Append the global div
	$(div).insertBefore(".row");
}

//---------------------------------------------------------------------
//Fonction which submit the form (routing to other functions)
function submit_form() {
	
	//Catch the selected user group in lowercase and without space (underscore instead)
	var user_group = ($("#group_select option:selected").text()).replace(/ /g, '_').toLowerCase();
	
	//If group_management class exists then call a function to change the user group rights
	if ($(".group_management").length > 0) {
		change_user_group_rights(user_group);
	}
	//If modify_group_info class exists then call a function to modify an user group
	else if ($(".modify_group_info").length > 0) {
		modify_user_group(user_group);
	}
	//Else call a function to create a new user group
	else if ($(".new_group_creation").length > 0) {
		create_user_group();
	}
}

//---------------------------------------------------------------------
//Fonction which changes the user group rights
function change_user_group_rights(user_group) {
	
	//Generate XML
	var xml = 
		'<xml version="1.0"><data_format>json</data_format>' +
			'<user_group>' + user_group + '</user_group>' +
			'<write>';
		
	//Catch the write_rights and put all the values into a table
	var write_right = [];
	$.each($(("#write_right_select option:selected")), function(){
		write_right.push($(this).val());
	});			
	
	// Get the number of selected user group(s)
	var write_right_number = write_right.length;	
	
	//If there are at least one write right set, insert it in the XML
	if (write_right_number > 0) {
		//Insert the fields from the table into the xml
		for (var i = 0 ; i < write_right_number ; i++) {
			xml +=  '<write_right>' + write_right[i] + '</write_right>';
		}
	}
	
	//Close the write_right string and open the read one
	xml += '</write><read>';
	
	//Catch the read_rights and put all the values into a table
	var read_right = [];
	$.each($(("#read_right_select option:selected")), function(){
		read_right.push($(this).val());
	});		
	
	// Get the number of selected user group(s)
	var read_right_number = read_right.length;	
	
	//If there are at least one write right set, insert it in the XML
	if (read_right_number > 0) {
		//Insert the fields from the table into the xml
		for (var i = 0 ; i < read_right_number ; i++) {
			xml +=  '<read_right>' + read_right[i] + '</read_right>';
		}
	}
	
	//Close the read_right string and open the empty one
	xml += '</read><empty>';
	
	//Catch the empty_rights for read and put all the values into a table
	var empty_read_right = [];
	$.each($(("#read_right_select option:not(:selected)")), function(){
		empty_read_right.push($(this).val());
	});

	//Get the number of empty read values into the table
	var empty_read_right_number = empty_read_right.length;
	
	//Catch the empty_rights for write and, if it matches one of the values of the empty_read table
	//Put the value into an empty_right table
	var empty_right = [];
	$.each($(("#write_right_select option:not(:selected)")), function(){
		for(var i = 0; i < empty_read_right_number; i++) {
			if(($(this).val()) == empty_read_right[i]) {
				empty_right.push($(this).val());
			}
		}
	});		
	
	// Get the number of empty right values into the table
	var empty_right_number = empty_right.length;	
	
	
	//If there are at least one empty right, insert it in the XML
	if (empty_right_number > 0) {
		//Insert the fields from the table into the xml
		for (var i = 0 ; i < empty_right_number ; i++) {
			xml +=  '<empty_right>' + empty_right[i] + '</empty_right>';
		}
	}

	//Close the empty and the xml string
	xml += '</empty></xml>';		
		
	
	//AJAX call
	var request = $.ajax({
							type: "POST",
							url: "../model/admin/set_user_groups_admin_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the form with the fields and the values
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		//If no error, print the success message
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
			
			//Remove the form and delete the selected option in the selectpicker and hide the button
			remove_group_info();
			// create_fields_management_form();
			$('#group_select').selectpicker('deselectAll');
			$('#modify_group_info_button').hide();
			
		}
		
		//Else, print the error message
		else if ((error !== "") && (success == "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}
}



//---------------------------------------------------------------------
//Fonction which modify an user group
function modify_user_group(user_group) {
	
	//Get the position and the link fields values
	var position = $("#position").val();
	var link = $("#link").val();
	var index_position = $("#index_position").val();
	
	//If index position isn't existing, set the index to 0
	if (index_position == "") {
		index_position = 99;
	}
	
	//Generate XML
	var xml = 
		'<xml version="1.0"><data_format>json</data_format>' +
			'<user_group>' + user_group + '</user_group>' +
			'<position>' + position + '</position>' +
			'<link>' + link + '</link>' +
			'<index_position>' + index_position + '</index_position>' +
		'</xml>';
		
	var request = $.ajax({
							type: "POST",
							url: "../model/admin/set_user_group_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the form with the fields and the values
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		//If no error, print the success message
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
			
			//Remove the form and delete the selected option in the selectpicker and hide the button
			remove_group_info();
			$('#group_select').selectpicker('deselectAll');
			$('#manage_group_fields_button').hide();
		}
		
		//Else, print the error message
		else if ((error !== "") && (success == "")) {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}
}



//---------------------------------------------------------------------
//Fonction which create a new user group
function create_user_group() {

	//Get thename, position and link fields values
	var user_group = $("#name").val();
	var position = $("#position").val();
	var link = $("#link").val();
	var index_position = $("#index_position").val();
	
	//If index position isn't existing, set the index to 0
	if (index_position == "") {
		index_position = 99;
	}
	
	//Generate XML
	var xml = 
		'<xml version="1.0"><data_format>json</data_format>' +
			'<user_group>' + user_group + '</user_group>' +
			'<position>' + position + '</position>' +
			'<link>' + link + '</link>' +
			'<index_position>' + index_position + '</index_position>' +
		'</xml>';
		
	var request = $.ajax({
							type: "POST",
							url: "../model/admin/set_new_group.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the form with the fields and the values
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();
		var success = $(request.responseText).find("success").text();
		
		//If no error, print the success message
		if ((error == "") && (success !== "")) {
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
			
			//Call again the group list in the selectpicker
			get_groups();
			
			//Remove the form
			$("#group_info_div").remove();
		}
		
		//Else, print the error message
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