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
	  //Show select all/deselect all
	  actionsBox: true,
	  //Show tick symbol close to the selected option
	  showTick: true,
	  
});

//Management of the column select field
$('#column_field').selectpicker({
	title: 'Select the search object here!',
});
//Management of the search select field
$('#search_field').selectpicker({
	//If more than a certain number of selected option --> write the number of selected options into the select
	selectedTextFormat: 'count > 3',
	title: 'Search here!',
});

//When the column select field is getting hidden, get the content of search_field
$('#column_field').on('hidden.bs.select', function (e) {
	get_search_info_field("ALL");
});

//When the search select field is getting hidden, generate the table and save the search
$('#search_field').on('hidden.bs.select', function (e) {
	get_search_info_table()
});


//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//Global variable (first user group for use in url)
if (user_groups[0] == 'admin') {
	first_user_group = user_groups[1];
}
else {
	first_user_group = user_groups[0];
}


//When the page is ready
$(document).ready(function () {
	
	//Get the array with all the saved values
	var field_values_array = load_previous_search();
	
	//Stock the two part of the array into variables to give as parameter to other functions
	first_field_value = field_values_array[0];
	second_field_values = field_values_array[1];

	//Feed the column search (select) with the existing search columns as defined in the db (and the saved value if existing)
	get_column_info(first_field_value);
	
	//Feed the search_info select with all the values (load the ones from the saved field and check the saved ones)
	get_search_info_field("ALL", first_field_value, second_field_values);
});

//On click on reset button, reset the form
$( "#new_site_button" ).click(function() {
	document.location = 'data_entry.php?thinxtra_site_id=new&tab=' + first_user_group;
});



//####################################################################################################
//FUNCTIONS
//####################################################################################################

//Fonction which feed the column field (column field) -> return the columns names available for search
//first_field_value is the saved value of the column field
function get_column_info(first_field_value) {
	//The object that needs to be returned
	var object = "search_search_column";
	
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<object>' + object + '</object>' +
		'</xml>';
		
	var request = $.ajax({
							type: "POST",
							url: "model/get_columns_info.php",
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
			var element_number = $(request.responseText).find("column_name").length;
			var i = 0;
			
			//Create a table which gather all the options
			var options = [];
			
			//Create the options to complete the select
			while (i < element_number) {
				
				//Get the column name from the XML, remove underscores and capitalize first letter
				var column_name = $(request.responseText).find("column_name").eq(i).text();
				column_name = (column_name.replace(/_/g, ' '));
				column_name = column_name.substr(0,1).toUpperCase() + column_name.substr(1)
				
				//Create an option for each column and push it into the table
				var option = '<option id="' + column_name + '" value="' + column_name + '">' + column_name + '</option>';
				options.push(option);
				
				i++;
			}
			
			//Refresh the search field to add the new options
			// $('#column_field').selectpicker('val', 'Thinxtra site id');
			$("#column_field").append(options.join('')).selectpicker('refresh');
			
			//If there is a saved value (not empty), get it and set it
			if (first_field_value !== "") {
				$('#column_field').selectpicker('val', first_field_value);
			}
			//Else use thinxtra site id as the default value
			else {
				$('#column_field').selectpicker('val', 'Thinxtra site id');
			}
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


//--------------------------------------------------------------------------------------------
//Fonction which feed the select field (search field) -> return the content of the searched column
//first field value is the saved values of the column in which we search, second_field_values is the array of the saved values from last search
function get_search_info_field(element_name, first_field_value, second_field_values) {

	//Remove the data (in search field) of the previous selected field and delete the table
	$("#search_field option").remove();
	delete_table("info_table", "head");
	delete_table("info_table", "body");

	//Catch the selected column, replace spaces with underscore and lowercase it.
	var selected_column_name = [];
	$.each($(("#column_field option:selected")), function(){
		selected_column_name.push($(this).val().replace(/ /g, '_').toLowerCase());
	});

	//If the column_name is null and the type of value is undefined, set default option
	if ((selected_column_name == "") && (typeof first_field_value == 'undefined')) {
			selected_column_name = "thinxtra_site_id";
	}
	//Else, if the column value isn't undefined, set the selected column name as the first field value (to load the value of the saved column from last search)
	else if (typeof first_field_value !== 'undefined') {
		selected_column_name = first_field_value.replace(/ /g, "_").toLowerCase();
	}

	
	//The option ALL  is sent in the URL to get back the list of forecast_customer (and no additional data)
	var xml = 
        '<xml version="1.0"><data_format>json</data_format>' +
			'<selected_column_name>' + selected_column_name + '</selected_column_name>' +
			'<element>' +
				'<element_name>' + element_name + '</element_name>' +
			'</element>'+
		'</xml>';
	
	var request = $.ajax({
							type: "POST",
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
		var options = [];
		
		//For each element
		$.each(data, function(key, value){
			//For each couple key-value. If it is not an error, create an option and push it in the array
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
		
		//Refresh the search field to add the new options (the table)
		$("#search_field").append(options.join('')).selectpicker('refresh');
		
		//If the array of saved values isn't empty. Check the values that were saved and launch the search
		if ((typeof second_field_values !== 'undefined') && (second_field_values.length !== 0)) {
			$('#search_field').selectpicker('val', second_field_values);
			get_search_info_table();
		}
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}	
	
}


//----------------------------------------------------------------------
//Fonction which feed the table -> return the content of all the elements related to the searched element (in the column)
// 1rst, get the columns list - 2nd, get the search information to fill the table
function get_search_info_table() {
	//The object that needs to be returned
	var object = "search_table_column";
	
	var xml = 
        '<xml version="1.0"><data_format>xml</data_format>' +
			'<object>' + object + '</object>' +
		'</xml>';
		
	var request = $.ajax({
							type: "POST",
							url: "model/get_columns_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		var error = $(request.responseText).find("error").text();		
		var xml = $(request.responseText).text();		
		
		// If there are no errors, create options and insert it into the page
		if (error == "") {
			var column_number = $(request.responseText).find("column_name").length;
			var i = 0;
			
			//Create the xml with all the column names
			xml = '<xml version="1.0">' +
					'<columns>';
			
			while (i < column_number) {
				column_name = $(request.responseText).find("column_name").eq(i).text();
				xml += '<column_name>' + column_name + '</column_name>';
				i++;
			}
			
			xml += '</columns>'
			
			//Call the second part of the fonction which is going to get the data related to the columns
			get_search_info_table2(xml);
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
	
	
	

//----------------------------------------------------------------------
//Fonction which feed the table -> return the content of all the elements related to the searched element (in the column)
// 1rst, get the columns list - 2nd, get the search information to fill the table
function get_search_info_table2(xml) {
	
	//Catch the list of selected elements
	var element = [];
	$.each($("#search_field option:selected"), function(){
		element.push($(this).val());
	});
	
	// Get the number of selected elements
	var element_number = element.length;	
	
	//If more than one selected, delete the existing table, build the XML and send it
	i = 0;
	
	//Delete the existing table
	delete_table("info_table", "head");
	delete_table("info_table", "body");

	if (element_number > 0) {
		
		//Get the column in which we are searching, replace space by underscore, and lowercase
		selected_column_name = $("#column_field option:selected").val();
		selected_column_name = (selected_column_name.replace(/ /g, '_')).toLowerCase();
		
		//Insert the column name and define the data_type : xml or json
		data_type = 'json';
		 xml += 	'<data_format>' + data_type + '</data_format>' +
					'<selected_column_name>' + selected_column_name + '</selected_column_name>';
		
		//Insert the elements the users is looking for (the list)
		while (i < element_number) {
			xml += '<element>' +
					'<element_name>' + element[i] + '</element_name>' +
				'</element>';
			i++;
		}
		
		//Close the xml string
		xml += '</xml>';
		
		
		//AJAX call to the PHP script (return the data at the XML format)
		var request = $.ajax({
							type: "POST",
							url: "model/get_search_info.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: data_type,
							success: OnSuccess,
							error: OnError
		});
		
		//If success, complete the table with the list of sites or display the error message
		function OnSuccess(data,status,request) {
			
			// var error = $(request.responseText).find("error").text();
		
			//Management of the header of the table (creation of a new html line)
			var title = '<tr>';
			
			//Set a counter to index each columns
			var i = 0;
			
			//Get all the columns and fill the header of the table
			$.each(data.column_name, function(table_key, column_name){
				 
				//Style the column name
				column_name_formated = (column_name.replace(/_/g, ' '));
				column_name_formated = column_name_formated.substr(0,1).toUpperCase() + column_name_formated.substr(1);
					
				//Complete the existing header
				title = title + '<th data_sort="string" id="'+ column_name +'" name="'+ i +'">'+column_name_formated+'</th>';
				
				i++;
				
				// $.each(result_value,function(table_key,table_value){
					// For each row
					// $.each(table_value.result.first(),function(row_key,row_value){
						// column_name_value = (JSON.stringify(row_value.column_name)).replace(/\"/g, "");
						// alert(column_name_value);
					// });
				// });
			});
			
			// Close the html line and insert it in the table
			title = title + '</tr>';
			$("#info_table thead").append(title);
			
			//Get the index of the thinxtra_site_id column
			var index_thinxtra_site_id = $("th#thinxtra_site_id").attr("name");
			
			//Create an array of URLs
			var urls = [];
			
			//-----Create a table of URL
			//For each site, get the thinxtra site id column value to generate the URL and stock it
			$.each(data.site, function(key, value){
				url_value = value[index_thinxtra_site_id];
				url = 'data_entry.php?thinxtra_site_id=' + url_value + '&tab=' + first_user_group;
				urls.push(url);
			});
			
			
			
			//For each row (to fill the body of the table)
			$.each(data.site, function(table_key, table_value){

				//Get the number of value in a row (if to manage the case of a single row){
				var value_number = table_value.length;			
				
				//For each value, fill the table
				$.each(table_value, function(key, value){

					//If the value is empty, don't show "Object"
					if ((JSON.stringify(value) == "{}") || (value == null)) {
						value = "";
					}

					//Insert the begining of the line with the url link (getting from the url table generating previously) into the table
					if (key % value_number == 0) {
						url = 'data_entry.php?thinxtra_site_id=' + value + '&tab=' + first_user_group;
						var row = '<tr id="table_row' + table_key + '" data-href="'+ urls[table_key] +'">';
						$("#info_table tbody").append(row);
					}
					// else if (key % site_number == 0) {
					
					//Insert each value into the html table row (inserted before) 
					var row_content = '<td>'+value+'</td>';
					$("#table_row" + table_key).append(row_content);
					
					//Insert the end of the line when necessary (when the key is equal to the number of element in a line)
					if ((key !== 0) && (key % (value_number - 1) == 0)) {
						row_ending = '</tr>';
						$("#info_table tbody").append(row_ending);
					}
				});
			});
			
			// Activate the links to data-entry page on each rows
			$('tr[data-href]').on("click", function() {
				document.location = $(this).data('href');
			});
			
			// On click on a row, if it is middle or right click, remove the default behaviour and open the link into a new tab (and focus on it)
			$('tr[data-href]').on("mousedown", function(e) {
				if((e.which === 3 ) || (e.which === 2)) {
					e.preventDefault();
					test = window.open(($(this).data('href')), '_blank');
					test.focus();
				}
			});
			
			//Activate the table sorting
			$("#info_table").tablesorter();	
			
			//Save the search
			save_search();
			
			//else display the error
			// else {
				// DeleteMessage();
				// CreateMessage("red", error, 0.5, 3, 0.5);
			// }
		}
		
		//Else : error
		function OnError(request, data, status) {				
			message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);
		}	
	}
}


//----------------------------------------------------------------------
//Function which save the search selection (if new save, overwrite the last one)
function save_search() {
	//Get the value of the first field (column_select)
	var first_field_value = $("#column_field").val();
	
	//Catch the list of selected elements (into the second field - values select) and push it into an array
	var second_field_values = [];
	$.each($("#search_field option:selected"), function(){
		second_field_values.push($(this).val());
	});
	
	//Store it locally (store the array in JSON)
	localStorage.setItem("first_field_value", first_field_value);
	localStorage.setItem("second_field_values", (JSON.stringify(second_field_values)));
}

//----------------------------------------------------------------------
//Function which load the last search selection
function load_previous_search() {
	//Get the 2 stored items (parse the arrey stored in JSON)
	var first_field_value = localStorage.getItem("first_field_value");
	var second_field_values = JSON.parse(localStorage.getItem("second_field_values"));
	
	//Push both into an array to return it
	var field_values_array = [first_field_value, second_field_values];
	return field_values_array;
}
