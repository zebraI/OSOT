$('.datepicker').datepicker({
    format: 'dd/mm/yyyy',
    startDate: '-3d'
});


//####################################################################################################
//LOBAL VARIABLES + WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//Global variables : the url parameters content (without special characters), an empty variable and an array of existing thinxtra_site_id (returned by a function)
var thinxtra_site_id = decodeURIComponent(split_url(0));
var page_name = decodeURIComponent(split_url(1));
var returned_xml;

//After page loading : call to the functions to load the tabs, the fields, the buttons and then, the values into the fields if the site is not new
$(document).ready(function () {
	//Load the tabs depending of the user groups
	generate_tabs(page_name, thinxtra_site_id);
	
	//Load the existing thinxtra_site_ids and store it in local storage
	get_thinxtra_site_id();
	
	//If the site_id is new, get and insert the fields and the buttons in case it is empty (page_name is the same as tab_name)
	if (thinxtra_site_id !== "new") {
		//When the insertion is done, insert values into the fields
		$.when(get_fields_names(page_name)).then(function() {
			get_tab_fields_info(thinxtra_site_id, page_name);
		});
	}
	//Else, just insert the fields (no content)
	else {
		get_fields_names(page_name);
	}
});

//For each key up on the thinxtra_site_id field, check if the thinxtra site id already exists of not
$(document).on("keyup", "#thinxtra_site_id", function() {
	thinxtra_site_id_verification($(this).val());
});

//On click on submit button, submit the form
$( "#submit_button" ).click(function() {
	submit_form(thinxtra_site_id);
});

//On click on reset button, reset the form. If param = new, reset all the fields from the form
$( "#reset_button" ).click(function() {
	if (thinxtra_site_id !== "new") {
		get_tab_fields_info(thinxtra_site_id, page_name);
	}
	else {
		$('#data_entry_form').trigger("reset");
	}
});


//####################################################################################################
//FUNCTIONS
//####################################################################################################
//---------------------------------------------------------------------------------------------------
//Return all the field which need to appear (read the XML parameter tab_name 
//and return the XML with the list of fields name) and stock it in a global variable for further use
function get_fields_names(tab_name) {
	
	//Find active tab name that needs to be returned and return it as a lowercased text
	// tab_name =  $("ul#tab_bar li.active a").text().toLowerCase();
	
	//Create the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<tab_name>' + tab_name + '</tab_name>' +
		'</xml>';
	
		
	var request = $.ajax({
							type: "POST",
							url: "model/get_fields_names.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();		

		// If there are no errors, create options and insert it into the page
		if (error == "") {
			//Get the full xml to return it, it is also use afterwards in other functions			
			var element_number = $(request.responseText).find("field").length;
			var i = 0;
			
			//Create the options to complete the select
			while (i < element_number) {
				
				//Get the column name from the XML
				var field_name = $(request.responseText).find("field").eq(i).find("field_name").text();
				
				//Create a formated version for display
				var field_name_formated = (field_name.replace(/_/g, ' '));
				field_name_formated = field_name_formated.substr(0,1).toUpperCase() + field_name_formated.substr(1)
				
				//Get the importance of the field (to know if it is mandatory)
				var importance = $(request.responseText).find("field").eq(i).find("importance").text();
				
				//Get the data type of the field
				var data_type = $(request.responseText).find("field").eq(i).find("data_type").text();

				//Get the data size of the field (if it exists)
				var data_size = $(request.responseText).find("field").eq(i).find("data_size").text();
								
				//Get the letter R or W (to know if the field should be disabled)
				var write_or_read = $(request.responseText).find("field").eq(i).find(tab_name).text();
				
				// Create the div, label, input and an error div (to display errors messages) and append it in the page
				var div = document.createElement("div");
				div.className = "form-group col-md-4";
				
				//Create and insert the label
				var label = document.createElement("label");
				label.setAttribute("for",field_name);
				label.className = "control-label";
				label.innerHTML = field_name_formated;
				
				div.append(label);
				
				//If it is an input, create and append the input
				if (data_type !== "select") {
					
					//Create the relevant input epending on the data type
					if (data_type == "textarea") {
						var input = document.createElement("textarea");
						input.rows = "1";
					}
					else {
						var input = document.createElement("input");
					}
					
					
					input.className = "form-control";
					input.id = field_name;
					input.type = data_type;
					input.maxLength = data_size;
					input.onkeypress="return isNumberKey(event)" 
					input.placeholder = field_name_formated;
					
					//Manage the case of decimal numbers in Chrome
					if (data_type == "number") {
						input.step = "any";
					}
					
					//Disabled if read only, required if mandatory
					if (write_or_read == "R") {
						input.disabled = true;
					}
					
					if (importance == "mandatory") {
						input.required = true;
					}
					
					if (data_type == "date") {
						input.type = "text";
						input.className += " datepicker";
					}
					
					//Manage the case of thixtra_site_id checking (to add check or cross symbol)
					if (field_name == "thinxtra_site_id") {
						div.className += " inner-addon right-addon";
						
						//If the thinxtra site id (url) isn't "new", set the input as disabled
						if (thinxtra_site_id !== "new") {
							input.disabled = true;
						}
					}
					
					div.append(input);
					
					//Add a div to display error if needed
					var div2 = document.createElement("div");
					div2.className = "help-block with-errors";
					div.append(div2);
				}
				
				
				//If it's a select, call the function to get the values and fill the select with the values
				else if (data_type == "select") {
					get_list_of_values(div, field_name, write_or_read, importance);
				}
				
				//If mandatory add it into the label
				if (importance == "mandatory") {
					label.innerHTML += " *";
					label.style.color = "#843534";
				}
				
				//Insert the div
				$(div).insertBefore("div .row");
				
				i++;
			}
			//Insert the buttons submit and reset at the end
			// get_buttons()
			$('body').on('focus','.datepicker', function(){
				$(this).datepicker({ dateFormat: 'dd/mm/yy' });
			});
		
		}
		//else display the error
		else {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
}


//---------------------------------------------------------------------------------------------------
//Get the list of value and create a select
function get_list_of_values(div, list_name, write_or_read, importance) {
	
	//Create the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<list_name>' + list_name + '</list_name>' +
		'</xml>';
	
		
	var request = $.ajax({
							type: "POST",
							url: "model/get_list_of_values.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		
		var error = $(request.responseText).find("error").text();		

		// If there are no errors, create select, options and insert it into the page
		if (error == "") {
			
			//Create the select
			var select = document.createElement("select");
			select.id = list_name;
			select.className = "form-control";
			
			if (write_or_read == "R") {
				select.disabled = true;
			}
					
			if (importance == "mandatory") {
				select.required = true;
			}
			
			//Create an empty option at the top of the list
			var option = document.createElement("option");
			option.value = "";
			option.id = "";
			option.innerHTML = "";
			// option.selected = true;
			select.append(option)
			
			// Get the nuber of values
			var value_number = $(request.responseText).find("list_of_values").find("value").length;
			var i = 0;
			
			// Get each value and create an option, insert it into the select
			while (i < value_number) {
				var value = $(request.responseText).find("list_of_values").find("value").eq(i).text();
				var id_value = $(request.responseText).find("list_of_values").find("id_value").eq(i).text();
				
				var option = document.createElement("option");
				option.value = value;
				option.id = id_value;
				option.innerHTML = value;
				select.append(option)
				
				i++;
			};
			
			//Insert the select into the page
			div.append(select);
			
			//Add a div to display error if needed
			var div2 = document.createElement("div");
			div2.className = "help-block with-errors";
			div.append(div2);
		}
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
}


//--------------------------------------------------------------------------------
//Create the buttons submit and reset -- Not used anymore
function get_buttons() {
			
	var div = document.createElement("div");
	div.className = "row";
	var div2 = document.createElement("div");
	div2.className = "col-lg-7";
		
	var span_submit = document.createElement("span");
	span_submit.className = "btn btn-success";
	span_submit.id = "submit_button";
		
	var i_submit = document.createElement("i");
	i_submit.className = "glyphicon glyphicon-upload";
		
	var span_submit2 = document.createElement("span");
	span_submit2.innerHTML = "Submit";
		
	var span_reset = document.createElement("span");
	span_reset.className = "btn btn-primary";
	span_reset.id = "reset_button";
		
	var i_reset = document.createElement("i");
	i_reset.className = "glyphicon glyphicon-remove";
		
	var span_reset2 = document.createElement("span");
	span_reset2.innerHTML = "Reset";
		
		
	span_submit.append(i_submit);
	span_submit.append(span_submit2);
	div2.append(span_submit);
		
	span_reset.append(i_reset);
	span_reset.append(span_reset2);
	div2.append(span_reset);
		
	div.append(div2);
	$('#data_entry_form').append(div);
}

//-----------------------------------------------------------------------------
//Get all the list of thinxtra site id, insert it into an array and store it into local storage
function get_thinxtra_site_id() {
		
	//The option ALL  is sent in the URL to get back the list of forecast_customer (and no additional data)
	var xml = 
        '<xml version="1.0"><data_format>json</data_format>' +
			'<selected_column_name>thinxtra_site_id</selected_column_name>' +
			'<element>' +
				'<element_name>ALL</element_name>' +
			'</element>'+
		'</xml>';
	
	var request = $.ajax({
							type: "POST",
							// async: false,
							url: "model/get_search_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		
		//Create an array
		var thinxtra_site_id_array = [];
		
		//For each site_id, push it into the table
		$.each(data, function(key, value){
			thinxtra_site_id_array.push(value);
		});
		
		//Store it locally (store the array in JSON)
		localStorage.setItem("thinxtra_site_id_array", (JSON.stringify(thinxtra_site_id_array)));
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}	
	
}

//-----------------------------------------------------------------------------
//Check if a thinxtra site id is already existing
function check_unique_thinxtra_site_id(value) {
	//Load the thinxtra_site_id array from the local storage (the data is stored in the first cell of the array)
	var thinxtra_site_id_array = JSON.parse(localStorage.getItem("thinxtra_site_id_array"));
	thinxtra_site_id_array = thinxtra_site_id_array[0];
	
	//Create a boolean variable is_existing
	var is_existing = false;
	
	
	//For each data of the table
	for(var i = 0; i < thinxtra_site_id_array.length; i++) {
		if (value == thinxtra_site_id_array[i]) {
			is_existing = true;
		}
	}
	
	return is_existing;
}

//-----------------------------------------------------------------------------
//Check the thinxtra site id and change the display of the input depending of it
function thinxtra_site_id_verification(written_id) {
	
	//Convert the written_id to uppercase
	written_id = written_id.toUpperCase();
	$("#thinxtra_site_id").val(written_id);
	
	//Get if a thinxtra site_id is already existing or not
	var is_existing = check_unique_thinxtra_site_id(written_id);
	
	
	//If is_exiting is true, style the field and insert a cross
	if ((is_existing == true) || (written_id == "")) {
		//Remove the other checks/crosses glyphicons if existing
		$(".thinxtra_site_id_validation").remove();
		
		//Change field border-color
		$("#thinxtra_site_id").css('border-color','rgba(169, 68, 66, 0.8)');
		
		//Create the cross glyphicon and insert it before the select
		var i = document.createElement("i");
		i.id = "thinxtra_site_id_validation_nok";
		i.className = "thinxtra_site_id_validation glyphicon glyphicon-remove";
		i.style.color = "rgba(169, 68, 66, 0.8)";
		$("#thinxtra_site_id").before(i);
	}
	//Else insert a check and turn the border to green
	else {
		//Remove the other checks/crosses glyphicons if existing
		$(".thinxtra_site_id_validation").remove();
		
		$("#thinxtra_site_id").css('border-color','rgba(44, 194, 164, 0.8)');
		
		var i = document.createElement("i");
		i.className = "thinxtra_site_id_validation glyphicon glyphicon-ok";
		i.style.color = "rgba(44, 194, 164, 0.8)";
		$("#thinxtra_site_id").before(i);
	}
}




//---------------------------------------------------------------------------------
//Function to load the values into the fields (1st, get all the fields list, 2nd : call a function to load the value)
function get_tab_fields_info(thinxtra_site_id, tab_name) {

	//Find active tab name that needs to be returned and return it as a lowercased text
	// tab_name =  $("ul#tab_bar li.active a").text().toLowerCase();
	
	//Create the XML
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<tab_name>' + tab_name + '</tab_name>' +
		'</xml>';
	
	// 1rst XHR to get the columns
	var request = $.ajax({
							type: "POST",
							url: "model/get_fields_names.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	function OnSuccess(data,status,request) {
		
		var error = $(request.responseText).find("error").text();
		
		if (error == "") {

			//Create the xml with the thinxtra site id and all the fields
			var field_name_number = $(request.responseText).find("field_name").length;
		
			xml = '<xml version="1.0"><data_format>xml</data_format>'+
					'<site>' +
						'<thinxtra_site_id>' + thinxtra_site_id + '</thinxtra_site_id>' + 
					'</site>' +
					'<fields>';
			
			var i = 0;
			
			while (i < field_name_number) {
				field_name = $(request.responseText).find("field_name").eq(i).text();
				xml += '<field_name>' + field_name + '</field_name>';
				i++;
			}
			
			xml += '</fields>' + '</xml>';
			
			// Call the 2nd function which will get the fields
			get_tab_fields_info2(xml);
		}
		else {
			DeleteMessage();
			CreateMessage("red", error, 0.5, 3, 0.5);
		}
	}
	
	//Else : error
	function OnError(request, data, status) {				
		var message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
}

//-----------------------------------------------------
//Function to load the values into the fields (1st, get all the fields list, 2nd : call a function to load the value)
function get_tab_fields_info2(xml) {
	
	//AJAX sending
	var request = $.ajax({
							type: "POST",
							url: "model/get_tab_fields_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
		


//If success, check if an error if returned. If yes, display the error.
//If not, complete the fields with the data and complete the created field
function OnSuccess(data,status,request) {
	var error = $(request.responseText).find("error").text();
		
	if (error == "") {
		
		var result_number = $(request.responseText).find("result").length;
		
		var i = 0;
		
		//Generate and input the content
		while (i < result_number) {
			//Get the name of the field
			var field_name = $(request.responseText).find("result").eq(i).find("field_name").text();
			
			//Get the value
			var value = $(request.responseText).find("result").eq(i).find("value").text();
			
			//If the field is a select, select the option
			if ($('#' + field_name).is("select")) {
				$('select#'+field_name+' option[value="'+ value +'"]').attr("selected",true);
			}
			//If it's a date picker (date format), change the date format and insert it
			else if ($('#' + field_name).hasClass("datepicker")) {
				//If the date isn't empty
				if (value !== "") {
					var date = value.split('-');
					var new_date = date[2] + "/" + date[1] + "/" + date[0];
					$('#' + field_name).val(new_date);
				}
			}
			//Else (if the site is an input or a textarea), just set the value of the input/textarea
			else {				
				$('#' + field_name).val(value);
			}
			
			i++;
		}
	}
	else {
		DeleteMessage();
		CreateMessage("red", error, 0.5, 3, 0.5);
	}
}

	
	//Else : error
	function OnError(request, data, status) {				
		var message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}	
}

//---------------------------------------------------------------------------------
//Function which verify the validation of the form before submiting it
//Needs the thixtra site id (url) to know if it is modification or creation mode
function validate_form(thinxtra_site_id) {
	
	//Define a is_missing variable to false
	var is_missing = false;
	
	//Define an empty string which will get the name of the first missing field
	var first_missing_field = ["alert_message", 52];
	
	// For each input, textarea or select into the page, get the id, the label, the label name, the related help block and if the field is disabled
	$("#data_entry_form").find('input, textarea, select').each(function(){
		var field_id = ($(this).attr("id"));
		var label = $('label[for="'+$(this).attr('id')+'"]');
		var label_name = $('label[for="'+$(this).attr('id')+'"]').text();
		var help_block = $(this).next('div .with-errors');
		var is_disabled = ($(this).prop('disabled'));
		
		//For inputs and textareas, get the value
		if (($(this).is('input')) || ($(this).is('textarea'))) {
			var field_value = ($(this).val());
		}
		else if ($(this).is('select')) {
			var field_value = ($(this).children(":selected").attr("id"));
		}
		
		//If the value/option id is empty (nothing has been inserted or null option has been selected) and if the field id mandatory
		if((field_value == "") && (label_name.indexOf("*") > 0) && (is_disabled == false)) {
			
			//If missing is false, this is the first missing field, get it
			if (is_missing == false) {
				first_missing_field = [field_id, 76];
			}
			
			//Define is_missing to true
			is_missing = true;
			
			//Change the color of the label and the select border
			label.css({color:"rgb(132, 53, 52)"});
			this.style.borderColor = "rgba(169, 68, 66, 0.8)";
					
			
			//Create the ul and li into help block to show error (remove it if it already exists)
				$("#" + field_id).parent().find("ul").remove();
				var ul = document.createElement("ul");
				ul.className = "list-unstyled";
				var li = document.createElement("li");
				li.innerHTML = "Please fill out this field.";
				li.style.color = "rgb(187, 68, 66)";
				ul.append(li);
			
				//append the help block content
				help_block.append(ul);
				
				//Change the height of it
				$(this).parent().css("height", "69px");
			// }
		}
		//Manage the case of thinxtra_site_id (if the value isn't null and if the thinxtra_site_id is new)
		else if ((field_id == "thinxtra_site_id") && (field_value !== "") && (thinxtra_site_id == "new")){
			//Call a function to know if the thinxtra site id is already existing
			var is_existing = check_unique_thinxtra_site_id(field_value);
			
			//If the thinxtra_site_id is already existing
			if (is_existing == true) {
				
				//If missing is false, this is the first problem field, get it
				if (is_missing == false) {
					first_missing_field = [field_id, 76];
				}
				
				//Define is_missing to true
				is_missing = true;
				
				//Create the ul and li into help block to show error 
				$("#" + field_id).parent().find("ul").remove();
				var ul = document.createElement("ul");
				ul.className = "list-unstyled";
				var li = document.createElement("li");
				li.innerHTML = "A site with the same id already exists.";
				li.style.color = "rgb(187, 68, 66)";
				ul.append(li);
			
				//append the help block content
				help_block.append(ul);
				
				//Change the height of it
				$(this).parent().css("height", "69px");
			}
			//Else if the id is unique, remove the ul (error help block) and turn the border color to green
			else if (is_existing == false) {
				$("#" + field_id).parent().find("ul").remove();
				this.style.borderColor = "rgba(44, 194, 164, 0.8)";
			}
		}
		//Else, if it is ok, remove the ul (error help block) and turn the border color to green
		else {
			$("#" + field_id).parent().find("ul").remove();
			this.style.borderColor = "rgba(44, 194, 164, 0.8)";
		}
	
	});
	

	//If there's at one field missing, go to it. Else go to the message div
	$('html, body').animate({
		//Scroll to a special div (first_missing_field[0]) minus a certain value (first_missing_field[1])
		//to display also the label except in the case of scroll to the message
		scrollTop: $("#" + first_missing_field[0]).offset().top - first_missing_field[1]
	}, 800);
	
	//Return the is_missing boolean value to know if the script should be launched
	return is_missing;
}


//---------------------------------------------------------------------------------
//Function which submit the form and return a message
function submit_form(thinxtra_site_id) {
	
	
	//Call a function to validate the form 
	var is_missing = validate_form(thinxtra_site_id);
		
		
	//If there's no mandatory fields missing, launch the form integration
	if (is_missing == false) {
			
		//Find the number of input into the form
		input_number =  ($("form div.form-group").length);
		i = 0;
		
		//Beginning the xml document
		var xml = '<xml version="1.0">' +
					'<user>' + user + '</user>' +
					'<site>' +
						'<thinxtra_site_id>' + thinxtra_site_id + '</thinxtra_site_id>'
			
		
		// Insert the input names (for attribute of the label) and values of each fields into the XML
		//(If the element type is date, change the format
		while (i < input_number) {
			
			// input_name = input_name.replace(/ /g, '_');
			
			input_name =  $("label.control-label").eq(i).attr("for");
			
			//Get the input type (useful in the case of the select and textarea fields)
			if ($('#' + input_name).is("select")) {
				input_type = "select";
			}
			else if (($('#' + input_name).is("textarea"))) {
				input_type = "textarea";
			}
			else {
				input_type =  $('#' + input_name).attr("type");
			}
			
			input_value = $('#' + input_name).val();
			
			//If it is a date format, convert the value to good format
			if (($('#' + input_name).is(".datepicker")) && (input_value !== '')) {
				var date = input_value.split('/');
				input_value = date[2] + "-" + date[1] + "-" + date[0];
			}
			
			//Get the id of the selected option in case of select field
			if (input_type == 'select') {
				input_value = $('#' + input_name).find(":selected").attr('id');
			}
			
			
			xml += '<data>' +
						'<field_name>' + input_name + '</field_name>' +
						'<value>' + input_value + '</value>' +
						'<input_type>' + input_type + '</input_type>' +
					'</data>';
			
			i++;
		}
		
		xml += '</site>' +
			'</xml>';

		//Ajax call
		$.ajax({
								type: "POST",
								url: "model/_set_tab_fields_info_pipe.php",
								data: xml,
								contentType: "text/xml; charset=utf-8",
								dataType: "xml",
								success: OnSuccess,
								error: OnError
		});
		
		
		//If success, check if an error if returned. If yes, display the error.
		//If not, show success message
		function OnSuccess(data,status,request) {		
			var error = $(request.responseText).find("error").text();
			var success = $(request.responseText).find("success").text();
			
			if ((error == "") && (success !== "")) {
				//Clear the thinxtra_site_id array in the local storage (it is not used anymore in this page)
				localStorage.removeItem("thinxtra_site_id_array");
				
				//Remove the form option
				// $("#form_container").remove();
				
				//Delete old message and create a new one
				DeleteMessage();
				CreateMessage("green", success, 0.5, 3, 0.5);
			}
			else {
				DeleteMessage();
				CreateMessage("red", error, 0.5, 3, 0.5);
			}
		}
		
		//Else : error
		function OnError(request, data, status) {				
			var message = "Network problem: XHR didn't work. Perhaps, incorrect URL is called or thinxtra site id already exists into the database";
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);
		}
	}
}
