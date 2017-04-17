//####################################################################################################
//SELECTPICKER MANAGEMENT + ACTIONS
//####################################################################################################
//Management of all the select fields


//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//When the page is ready
$(document).ready(function () {
	//Load the loading picture
	load_loading();
	
	//Create the header and the main select
	generate_table_columns();
	
	//get the table information
	fill_table();
});




//####################################################################################################
//FUNCTIONS
//####################################################################################################
//Function generating the columns of the table depending on the user rights
function generate_table_columns() {
	// var user_groups = ["finance"];
	var user_group = "finance";
	var user_right = "WR";
	
	//XML generation
	var xml = 
        '<xml version="1.0">' +
			// '<user_groups>' + '<group>' + user_group + '</group>' + '<group>' + "rfp" + '</group>' +'</user_groups>' +
			'<user_groups>' + '<group>' + user_group + '</group>' +'</user_groups>' +
			'<user_right>' + user_right + '</user_right>' +
		'</xml>';
	
	//AJAX call (json callback, here)
	var request = $.ajax({
							type: "POST",
							url: "model/_get_user_groups_info_pipe.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});
	
	function OnSuccess(data,status,request) {
		// var result = JSON.stringify(data);
		
		//Create a select
		var select = document.createElement("select");
		select.id = "overall_select";
		select.className = "form-control";
		select.multiple = true;
		select.size = 5;
		
		//Create a bootstrap search button
		var span = document.createElement("span");
		span.className = "btn btn-success col-md-6";
		span.id = "search_button";
		
		var i = document.createElement("i");
		i.className = "glyphicon glyphicon-search";
		
		var span2 = document.createElement("span");
		span2.innerHTML = "Add filters";
		
		span.append(i);
		span.append(span2);
		
		// Create a bootstrap clear filters button
		var span3 = document.createElement("span");
		span3.className = "btn btn-primary col-md-6";
		span3.id = "clear_button";
				
		var i2 = document.createElement("i");
		i2.className = "glyphicon glyphicon-trash";
				
		var span4 = document.createElement("span");
		span4.innerHTML = "Clear filters";
		
		//Append the button
		span3.append(i2);
		span3.append(span4);
		
		// Create a bootstrap save filters button
		var span5 = document.createElement("span");
		span5.className = "btn btn-warning col-md-6";
		span5.id = "save_button";
				
		var i3 = document.createElement("i");
		i3.className = "glyphicon glyphicon-save";
				
		var span6 = document.createElement("span");
		span6.innerHTML = "Save filters";
		
		//Append the button
		span5.append(i3);
		span5.append(span6);
		
		// Create a bootstrap pre-set filters button
		var span7 = document.createElement("span");
		span7.className = "btn btn-danger col-md-6";
		span7.id = "pre_set_filters_button";
				
		var i4 = document.createElement("i");
		i4.className = "glyphicon glyphicon-filter";
				
		var span8 = document.createElement("span");
		span8.innerHTML = "Pre-set filters";
		
		//Append the button
		span7.append(i4);
		span7.append(span8);
	
	
		//For each JSON node into data, create a th element (table header), 
		//input the JSON as a string (without quotes, underscores and capitalize) and append (Take care of NULL values that appear as nothing)
		//Also create and fill a select field
		$.each(data, function(key, value){
			
			//Create the table header and add it
			var th = document.createElement("th");
			column_name = (JSON.stringify(data[key])).replace(/\"/g, "").replace(/_/g, ' ');
			column_name = column_name.substr(0,1).toUpperCase() + column_name.substr(1);
			th.innerHTML = column_name;
			
			$("table#data_table thead tr").append(th);
			
			//Fill the select
			var option = document.createElement("option");
			option.innerHTML = column_name;
			select.append(option);			
		});
		
		//Add the select and the buttons to the page
		$("#overall_select_li").append(select);
		$("#overall_select_li").append(span);
		$("#overall_select_li").append(span3);
		$("#overall_select_li").append(span5);
		$("#overall_select_li").append(span7);
	
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
}





//Function which return a table with all the data from the view (depending on the user rights)
function fill_table() {
	//Display the loading picture
	toggle_loading();
	
	//The SQL table or view in which we have to search
	var table_name = "data_entry";
	
	// var user_groups = ["finance"];
	var user_group = "finance";
	
	
	
	//XML generation
	var xml = 
        '<xml version="1.0">' +
			'<table_name>' + table_name + '</table_name>' +
			'<user_groups>' + '<group>' + user_group + '</group>' +'</user_groups>' +
			// '<user_groups>' + '<group>' + user_group + '</group>' + '<group>' + "rfp" + '</group>' +'</user_groups>' +
		'</xml>';
	
	//AJAX call (json callback, here)
	var request = $.ajax({
							type: "POST",
							url: "model/reporting/get_table.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
		// var result = JSON.stringify(data);
		// alert(result);
				
		
		//Converting the data to the right format
		var dataSet=[];
		$.each(data,function(i,k){
			  dataSet.push( $.map(data[i], function(el) { return el; }));
		});

		//----------------------------------------------------------------------------------
		//Data table configuration
		//Display and configuration of the table (take care of the table columns order that should be the same as the database view)
		var data_table = $('#data_table').dataTable( {
			aaData: dataSet,

			//XSS attack protection
			render: $.fn.dataTable.render.text(),
			
			
			
			//-----------OPTIONS-------------------
			//Position of the elements in the DOM (each letter is related to an element)
			//B=button bar; l=number of entries displayed, f=search_bar, r=processing display element,
			//t=table, i=information about the number of filtered entries, p=paging		
			dom: '<"top"lB>t<"bottom"ip>',
			
			//Activate the duplication of data in an Excel way
			// autoFill: true,
			//Activate the selection behaviour like an OS
			select: true,
			// Activate the display of the buttons (activate the copy function)
			buttons: [
					//'pdf',
					{  
						extend: 'colvis',
						collectionLayout: 'four-column'
					} ,
					'selectColumns',
					'selectRows',
					{
						extend: 'copy',
						text: 'Copy all',
						key: {
							key: 'c',
							altKey: true
						}
					},
					{
						extend: 'csv',
						exportOptions: {
							columns: ':visible',
						}
					},
					{
						extend: 'excel',
						exportOptions: {
							columns: ':visible',
						}
					},
			],

			//Activate the column drag and drop
			colReorder: true,
			//Activate the row drag and drop
			// rowReorder: true,
			pdfMake: true,
			
			//Horizontal scroll without header
			// scrollY: true,

			//Horizontal scroll with header
			scrollX: true,
			
			//Activate search and make appear a search field (needs to be activated to allow filtering)
			searching: true,
			
			//Activate the fixation of the first column on the left (need to have always the same colum on the left (not movable)
			//Not compatible with row reorder
			fixedColumns: true,
			
			autoWidth: false
			
			
			//Change the size of columns
			// "columnDefs": [
				// { width: 200, targets: [0, 19, 21, 23] },
				// { width: 200, targets: [0, 18, 20, 22] },
				
			// ]
			
			//Activate the fixation of the header on top when  reaching the top of the page - not compatible with scrollX (header non scrollable)
			// fixedHeader: true

			//Activate responsive design on the table (not necessary, already responsive)
			//Not compatible with fixed column and ScrollX; limit the size of the table (activate a + button to see the rest of the content)
			// responsive: true,
			
			//Activate cell selection (and, eventually option on click on cell)
			// keys: true	
			
			//Disactivate paging
			// paging:false,
		
			//Active dat stripped on non-horizontal scrolable tables and non-paging tables
			// scroller: true,
			
			// aoColumns: [
				// {"sWidth": '200px', "mDataProp": "site_name"},
			// ]
		});
		
		
		//Size of the "show xxx entries" button
		$('#data_table_length').addClass("col-md-3");
		
		// Creating new div to put the buttons into
		var div = document.createElement("div");
		div.id = "column_visibility_bar";
		div.className = "col-md-3";
		var div2 = document.createElement("div");
		div2.id = "select_column_row_bar";
		div2.className = "col-md-3";
		var div3 = document.createElement("div");
		div3.id = "export_bar";
		div3.className = "col-md-3";
		
		//Append those divs to the row bar
		$(".top").append(div);
		$(".top").append(div2);
		$(".top").append(div3);
		
		//Move the buttons in the appropriate div
		$('.buttons-colvis').detach().appendTo('#column_visibility_bar')
		$('.buttons-select-columns').detach().appendTo('#select_column_row_bar')
		$('.buttons-select-rows').detach().appendTo('#select_column_row_bar')
		$('.buttons-copy').detach().appendTo('#export_bar')
		$('.buttons-excel').detach().appendTo('#export_bar')
		$('.buttons-csv').detach().appendTo('#export_bar')
		
		// alert(data_table.api().buttons().buttons.extend);
		
		//Create the save filters hidden content
		create_save_filters_toggle_content();
		
		//Create the pre-set-filters hidden content
		create_pre_set_filters_toggle_content();
		
		//On click on pre_set_filters button, show the filters hidden (laready loaded)
		$("#pre_set_filters_button").click(function(){
			//If the save_input toggle is on (visible), turn it on (hide)
			if (($("#save_input").is(":visible")) ) {
				$("#save_input").toggle("slow");
				$("#save_button2").toggle("slow");
			}
			
			//Turn on the save input toggle (visible)
			$("#pre_set_filters_span").toggle("slow");
			$("#pre_set_filters_button2").toggle("slow");
			$("#pre_set_filters_button_delete").toggle("slow");
			$("#pre_set_filters_button_more").toggle("slow");
			
			//On click on the second pre-set filters button, call a funtion to load the filter details (XHR)
			$("#pre_set_filters_button2").click(function(){
				get_filter(data_table);
			});
			
			//On click on the delete button, call a funtion to delete the selected pre-set filters and remove it from the list (reload the list)
			$("#pre_set_filters_button_delete").click(function(){
				delete_filter(data_table);
			});
			
			//On click on the "more" button, show the public filters
			$("#pre_set_filters_button_more").click(function(){
				$(".public_filters").toggle();
			});
		});
		
	
		//On click on save button, hide the pre_set_filters inputs, display the hidden input and call a function to save the filters (XHR)
		$("#save_button").click(function(){	
		//If the pre-set-filters toggle is on (visible), turn it on (hide)
			if (($("#pre_set_filters_span").is(":visible")) ) {
				$("#pre_set_filters_span").toggle("slow");
				$("#pre_set_filters_button2").toggle("slow");
				$("#pre_set_filters_button_delete").toggle("slow");
				$("#pre_set_filters_button_more").toggle("slow");
			}
			
			//Turn on the save input toggle (visible)
			$("#save_input").toggle("slow");
			$("#save_button2").toggle("slow");
				
			//On click on the second save button, call a funtion to save the filters (XHR)
			$("#save_button2").click(function(){
				create_filter();
			});	
		});
			
		//On click on search button, call a function to reset the filters and show the whole table
		$("#clear_button").click(function(){
			reset_table(data_table);
		});

		//On click on search button, call a function to create selects and fill them (and also AND/OR buttons)
		$("#search_button").click(function(){
			create_select_filter(data_table);
		});
		
		
		
		//AND SEARCH
		$(document).on("change", ".sub-select", function(){
			//Call a function which add a field into the AND search (search the value of the field into the table and display it)
			and_search(data_table, this);
		});
		
		
		
		//OR SEARCH
		// $(document).on("change", ".sub-select", function(){
			// alert($('#and_or_button').bootstrapSwitch('state'));
			
			// var all_values = [];
			//Get the number of columns into the table
			// var columns_number = $("table#data_table thead tr th").length;
				
			//Get the list of all ids of all column header
			// for (var i = 0; i < columns_number; i++) {
				// all_values.push(i);
			// }
			
			// var column_ids = [];
			// var searched_values = [];
			//Get the column ids (stocked into name) of the columns the user is looking to filter and populate an arry with it
			//Also get the searched values of each of the field and populate a table with
			// $(".sub-select").each(function () {
				// column_ids.push(this.name);
				// searched_values.push($(this).val());
			// });
		
			//Get the number of and/or buttons appearing
			// var buttons_number = $('input.and_or_button').length;
			
			// var or_index = [];
			//Get the position of all the "or" button values - where the state of the button is true 
			//and populate a table with the index(index corresponding to the select)
			// for(i = 1; i <= buttons_number; i++) {
				// if(($('#and_or_button'+i).bootstrapSwitch('state')) == true) {
					// or_index.push(i);
				// }
			// }
			
			// var test = $(".sub-select").each(function (i, e) {
				// data_table.fnFilter(searched_values[i], column_ids[i]);
				// data_table.fnFilter("test1201"|"test1043", column_ids[0]);
			// });
			
			//Get the settings of the table
			// var settings = data_table.fnSettings();

			/*reset all columns searchable to false*/
			// for(var j = 0; j < all_values.length; j++) {
				// settings.aoColumns[all_values[j]].bSearchable = false;
			// }
			/*set the specify columns searchable to true*/
			// for(var k = 0; k < column_ids.length; k++) {
				// settings.aoColumns[column_ids[k]].bSearchable = true;
			// }
			

			// var search_string = "";
			// var test = $(".sub-select").each(function (i, e) {
				// if(i !== 0) {
					// search_string += "|" + searched_values[i];
				// }
				// else {
					// search_string += searched_values[i];
				// }
			// });
			
			// data_table.fnFilter(search_string, null, true);
		
		// });
		
		
		
		
		
		// setTimeout(
  // function() 
  // {
		// alert("ok");
		// data_table.columns(1).search("test1").draw();
		// data_table.fnFilter("1001", 24);
  // }, 3000);
		

		
		//Hide the loading picture once load
		toggle_loading();
		
		
	}
	
	//Else : error
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}	
}



//----------------------------------------------------------------------
//Creation of the pre-set filters toggle content (apppears on click) + XHR to fill the select
function create_pre_set_filters_toggle_content() {
	
	//If there is already a content, remove it
	if ($("#pre_set_filters_select")) {
		$("#pre_set_filters_button2").remove();
		$("#pre_set_filters_button_delete").remove();
		$("#pre_set_filters_button_more").remove();
		$("#pre_set_filters_span").remove();
	}
	
	var span0 = document.createElement("span");
	span0.className = "col-md-12 created-inputs-span";
	span0.id = "pre_set_filters_span";
	span0.style.display = "none";
	
	//Create a select to choose the filter (inserted into a span to resize it)
	var select = document.createElement("select");
	select.id = "pre_set_filters_select";
	select.className = "form-control";
	
	
	//Create a bootstrap filter button
	var span = document.createElement("span");
	span.className = "btn btn-danger col-md-4";
	span.id = "pre_set_filters_button2";
	span.style.display = "none";
	
	var i = document.createElement("i");
	i.className = "glyphicon glyphicon-filter";
	
	var span2 = document.createElement("span");
	span2.innerHTML = "Filter";
	
	span.append(i);
	span.append(span2);
	
	//Create a bootstrap delete button
	var span3 = document.createElement("span");
	span3.className = "btn btn-danger col-md-4";
	span3.id = "pre_set_filters_button_delete";
	span3.style.display = "none";
	
	var i2 = document.createElement("i");
	i2.className = "glyphicon glyphicon-trash";
	
	var span4 = document.createElement("span");
	span4.innerHTML = "Delete";
	
	span3.append(i2);
	span3.append(span4);
	
	//Create a bootstrap "More filters" button
	var span5 = document.createElement("span");
	span5.className = "btn btn-danger col-md-4";
	span5.id = "pre_set_filters_button_more";
	span5.style.display = "none";
	
	var i3 = document.createElement("i");
	i3.className = "glyphicon glyphicon-plus";
	
	var span6 = document.createElement("span");
	span6.innerHTML = "More";
	
	span5.append(i3);
	span5.append(span6);
	
	//Call a function in order to create the select with the list of filters
	create_filter_list_select(select);	
	
	
	//Append the buttons and the select
	span0.append(select);
	$("#overall_select_li").append(span);	
	$("#overall_select_li").append(span3);	
	$("#overall_select_li").append(span5);	
	$("#overall_select_li").append(span0);
	
	//Add the public filters in hidden mode
	create_more_filter_list_select(data_table);
}

//----------------------------------------------------------------------
//Creation of the save filters toggle content (apppears on click).
function create_save_filters_toggle_content() {
	//Create a link part to enter the name of the filter (inserted into a span to resize it)
	var span0 = document.createElement("span");
	span0.className = "col-md-9 created-inputs-span";
	span0.id = "save_input";
	span0.style.display = "none";
	
	var input = document.createElement("input");
	input.id = "filter_name";
	input.type = "text";
	input.className = "form-control";
	input.placeholder = "Filter name";
	span0.append(input);
	
	//Create a bootstrap save button
	var span = document.createElement("span");
	span.className = "btn btn-warning col-md-3 created-inputs-button";
	span.id = "save_button2";
	span.style.display = "none";
	
	var i = document.createElement("i");
	i.className = "glyphicon glyphicon-save";
	
	var span2 = document.createElement("span");
	span2.innerHTML = "Save";
	
	span.append(i);
	span.append(span2);
	
	$("#overall_select_li").append(span0);
	$("#overall_select_li").append(span);
}


//----------------------------------------------------------------------
//Function called to create the filter and send it to the PHP script (insert into database)
function create_filter() {
	//If a filter name was entered
	if($("#filter_name").val() !== '') {
		
		//Get the user name
		var user = "test_user";	
		var filter_name = $("#filter_name").val();
			
		//XML generation
		var xml = '<xml version="1.0"><user>' + user + '</user>' +
					'<filter_name>' + filter_name + '</filter_name>';
					
		var i = 0;
		//For each selected option, get the name, the value and the button value
		$("select.sub-select").each(function() {
			xml += '<filter>' +
					'<field_name>' + (this.id) + '</field_name>' +
					'<field_value>' + ($(this).val()) + '</field_value>';
			
			//Add a button value to the XML  if there are more than a field and except for the 1st field (no button). Then, close the filter.
			if((i !== 0) && (".label-sub-select")) {
				xml += '<button_value>' + ($('#and_or_button' + i).bootstrapSwitch('state')) + '</button_value>' +
						'</filter>';
				i++;
			}
			//Else add an "0" button value and close the filter
			else {
				xml += '<button_value></button_value>' +
						'</filter>';
				i++;
			}	
		});
		//Close the xml
		xml += '</xml>';

		// AJAX call (json callback, here)
		var request = $.ajax({
								type: "POST",
								url: "model/reporting/set_filters.php",
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
			
			// If there are no errors, print the success message
			if ((error == "") && (success !== "")){
				message = $(request.responseText).find("success").eq(0).text();
				DeleteMessage();
				CreateMessage("green", message, 0.5, 3, 0.5);
			}
			//Else print the error message
			else if ((error !== "") && (success == "")){
				message = $(request.responseText).find("error").eq(0).text();
				DeleteMessage();
				CreateMessage("red", message, 0.5, 3, 0.5);
			}
		}
		
		//Else : error
		function OnError(request, data, status) {				
			message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);
		}	
	}
	//Else : error
	else {				
		message = "Please, enter a filter name.";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}	
}


//----------------------------------------------------------------------
//Funtion which load the details of a filter (XHR) - all the filters from the pre-set filter 
function get_filter(data_table, user_parameter) {


	//If it's a public filter, set the user as the value attribute of the option (in case of public filters, value = username)
	//else get the actual user
	if (($('#pre_set_filters_select :selected').attr('class')) == "public_filters") {
		var user = $('#pre_set_filters_select :selected').val();
	}
	else {
		var user = "test_user";
	}
	
	//Indicates the filter_name to get (if empty, get the list of all the filter names)
	var filter_name = $('#pre_set_filters_select :selected').html();
			
	//XML generation (send the user parameter "" to get the details of a filter)
	var xml = '<xml version="1.0">' +
				'<user>' + user + '</user>' +
				'<parameter>' + filter_name + '</parameter>' +
				'<user_parameter></user_parameter>' +
			'</xml>';

	// AJAX call (json callback, here)
	var request = $.ajax({
							type: "POST",
							url: "model/reporting/get_filters.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});

	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {

		var error = $(request.responseText).find("error").text();	
		
		// If there are no errors, complete the select field
		if (error == ""){
			//Get the number of fields to create
			var fields_number = $(request.responseText).find("field_name").length;			
			
			//Create a select and fill it
			for(var i = 0; i < fields_number; i++) {
				
				//Get the name, the value and the button value of the selected option
				var field_name = $(request.responseText).find("field_name").eq(i).text();
				var field_value = $(request.responseText).find("field_value").eq(i).text();
				var button_value = $(request.responseText).find("button_value").eq(i).text();
				
				//Create the li
				var li = document.createElement("li");
				li.className = "side-select li-sub-select";
				
				//Create the label
				var label = document.createElement("label");
				label.setAttribute("for",field_name);
				label.className = "control-label";
				label.innerHTML = field_name;
				
				//Create the bootstrap "or" button (if it's not the first field)
				//Count the number of buttons already existing to create the ID
				if ($(".li-sub-select").length) {
					var input = document.createElement("input");	
					input.className = "and_or_button col-sm-2";
					var buttons_number = $('input.and_or_button').length;
					input.id = "and_or_button" + (buttons_number + 1);
					input.type = "checkbox";
					//Set the value registered in database for the checkbox (AND/OR)
					if (button_value == "true") {
						input.checked = true;
					}
					else if (button_value == "false") {
						input.checked = false;
					}
					li.append(input);
					
					//add a class to the label if it is not the first field
					label.className += " label-sub-select";
				}
				

				//Create a select
				var select = document.createElement("select");
				select.id = field_name;
				select.className = "form-control sub-select";
				// select.multiple = true;
				// select.size = 5;	
			
				
				//Get the number of columns into the table
				var columns_number = $("table#data_table thead tr th").length;
				
				// Get the id of the column corresponding to the select and fill the select with the content of the column
				for (var j = 0; j < columns_number; j++) {
					if (field_name == ($("table#data_table thead tr th").eq(j).text())) {
						var column_id = j;
					}
				}
				
				//Stock the id of the column into the name of the field
				select.name = column_id;
				
				//Get all the values of the wanted column (eliminate doubles, sort it) and fill the select
				//api().column is called because the old dataTable call is used (new one is "DataTable" but it doesn't allow fnfilters)
				data_table.api().column(column_id).data().unique().sort().each( function ( d, j ) { 
					var option = document.createElement("option");
					option.innerHTML = d;
					option.value = d;
					select.append(option);
				});
				
			
				//Add the labels and the selects to the page
				li.append(label);
				li.append(select);
				$("div.side-menu-container ul.navbar-nav").append(li);
				
				//Set the value registered in database for the filter
				$('#' + field_name + ' option[value="' + field_value + '"]').prop('selected', true);
				
				//Lauch the AND search on each field (refresh the table)
				and_search(data_table, ($('#' + field_name)));
			}
			
			//Style the bootstrap "or/and" button as a switch and define the values
			$(".and_or_button").bootstrapSwitch({
				size: "mini",
				onText: "OR",
				offText: "AND"
			});			
		}
			
			// message = $(request.responseText).find("success").eq(0).text();
			// DeleteMessage();
			// CreateMessage("green", message, 0.5, 3, 0.5);
		//Else print the error message
		else if (error !== ""){
			message = $(request.responseText).find("error").text();
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);
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
//Function called to delete a pre-set filters and remove it from the list
function delete_filter(data_table) {
	//Get the user name
	var user = "test_user";	
	
	//Indicates the filter_name to get (if empty, get the list of all the filter names)
	var filter_name = $('#pre_set_filters_select').val();	
			
	//XML generation
	var xml = '<xml version="1.0">' +
				'<user>' + user + '</user>' +
				'<parameter>' + filter_name + '</parameter>' +
			'</xml>';

	// AJAX call (json callback, here)
	var request = $.ajax({
							type: "POST",
							url: "model/reporting/delete_filters.php",
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
		
		// If there are no errors, print a success message and reload the field
		if ((error == "") && (success !== "")){
			DeleteMessage();
			CreateMessage("green", success, 0.5, 3, 0.5);
			
			//Reload the field
			create_pre_set_filters_toggle_content();
			
		}
		//Else, print an error message
		else if ((error !== "") && (success == "")){
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
//Function called to reset the filters and show the whole table (receive the data_table as a parameter)
function reset_table(data_table) {
	$(".li-sub-select").remove();
				
	//Clean the table and show all
	//First, get the settings of the table
	var settings = data_table.fnSettings();
				
	//Get the number of column
	var columns_number = settings.aoPreSearchCols.length
				
	//Clean the value of the search for each column
	for(i = 0; i < columns_number; i++) {
		settings.aoPreSearchCols[i].sSearch = '';
	}
				
	//Apply the changes to the fn filters
	data_table.fnDraw();
}

//----------------------------------------------------------------------
//Function called to create selects and fill them (and also AND/OR buttons) (receive the data_table as a parameter)
function create_select_filter(data_table) {
	//Get the number of selected option
	var selected_options_number = $("select#overall_select").children(":selected").length;
				
	//For each option selected, create a select and fill it
	for(var i = 0; i < selected_options_number; i++) {
		
		//Get the name of the selected option
		var selected_option = $("select#overall_select").children(":selected").eq(i).text();
		
		
		//Create the li
		var li = document.createElement("li");
		li.className = "side-select li-sub-select";
		
		//Create the label
		var label = document.createElement("label");
		label.setAttribute("for",selected_option);
		label.className = "control-label";
		label.innerHTML = selected_option;
		
		//Create the bootstrap "or" button (if it's not the first field)
		//Count the number of buttons already existing to create the ID
		if ($(".li-sub-select").length) {
			var input = document.createElement("input");	
			input.className = "and_or_button col-sm-2";
			var buttons_number = $('input.and_or_button').length;
			input.id = "and_or_button" + (buttons_number + 1);
			input.type = "checkbox";
			li.append(input);
			
			//add a class to the label if it is not the first field
			label.className += " label-sub-select";
		}
		

		//Create a select
		var select = document.createElement("select");
		select.id = selected_option;
		select.className = "form-control sub-select";
		// select.multiple = true;
		// select.size = 5;	
	
		
		//Get the number of columns into the table
		var columns_number = $("table#data_table thead tr th").length;
		
		// Get the id of the column corresponding to the select and fill the select with the content of the column
		for (var j = 0; j < columns_number; j++) {
			if (selected_option == ($("table#data_table thead tr th").eq(j).text())) {
				var column_id = j;
			}
		}
		
		//Stock the id of the column into the name of the field
		select.name = column_id;
		
		//Get all the values of the wanted column (eliminate doubles, sort it) and fill the select
		//api().column is called because the old dataTable call is used (new one is "DataTable" but it doesn't allow fnfilters)
		data_table.api().column(column_id).data().unique().sort().each( function ( d, j ) { 
			var option = document.createElement("option");
			option.innerHTML = d;
			option.value = d;
			select.append(option);
		});
		
	
		//Add the labels and the selects to the page
		li.append(label);
		li.append(select);
					
		$("div.side-menu-container ul.navbar-nav").append(li);
	}
	
	//Style the bootstrap "or/and" button as a switch and define the values
	$(".and_or_button").bootstrapSwitch({
		size: "mini",
		onText: "OR",
		offText: "AND"
	});	
}


//----------------------------------------------------------------------
//Function which to create a select with the list of filters of the user
function create_filter_list_select(select) {
	
	//Get the user name
	var user = "test_user";	
	
	//Indicates the filter_name to get (if empty, get the list of all the filter names)
	var filter_name = "";	
			
	//XML generation (user parameter = "" to get back to the list the filters of one user only)
	var xml = '<xml version="1.0">' +
				'<user>' + user + '</user>' +
				'<parameter>' + filter_name + '</parameter>' +
				'<user_parameter></user_parameter>' +
			'</xml>';

	// AJAX call (json callback, here)
	var request = $.ajax({
							type: "POST",
							url: "model/reporting/get_filters.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});

	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {

		var error = $(request.responseText).find("error").text();	
		
		// If there are no errors, complete the select field
		if (error == ""){
			//Get the number of filter to include on the list
			var filters_number = $(request.responseText).find("filter_name").length;
			
			//Get each filter name and insert it into an option; then, into a select
			for (i = 0; i < filters_number; i++) {
				var filter_name = $(request.responseText).find("filter_name").eq(i).text()
				var option = document.createElement("option");
				option.innerHTML = filter_name;
				option.value = filter_name;
				option.id = "pre_set_filters_option" + i;
				option.className = "user_filters";
	
				select.append(option);
			}
		}
		//Else print the error message
		else if (error !== ""){
			message = $(request.responseText).find("error").text();
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);
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
//Funtion which get the "public" filters of other users and add it to the select
function create_more_filter_list_select(data_table) {

	//Get the user name
	var user = "test_user";

	//Indicates the filter_name to get (if empty, get the list of all the filter names)
	var filter_name = "";
			
	//XML generation (send the user parameter "more" to get the "public" filters)
	var xml = '<xml version="1.0">' +
				'<user>' + user + '</user>' +
				'<parameter>' + filter_name + '</parameter>' +
				'<user_parameter>more</user_parameter>' +
			'</xml>';

	// AJAX call (json callback, here)
	var request = $.ajax({
							type: "POST",
							url: "model/reporting/get_filters.php",
							data: xml,
							contentType: "text/xml; charset=utf-8",
							dataType: "xml",
							success: OnSuccess,
							error: OnError
	});

	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {

		var error = $(request.responseText).find("error").text();
		
		// If there are no errors, add the new filters to the select field
		if (error == ""){
			
			//Get the number of filter to include on the list
			var filters_number = $(request.responseText).find("filter_name").length;
			
			//Get each public filter name and insert it into an option; then, into the select
			for (i = 0; i < filters_number; i++) {
				//Create an option for each public filter with the user_name of the filter user as value
				var filter_name = $(request.responseText).find("filter_name").eq(i).text()
				var user = $(request.responseText).find("user").eq(i).text()
				var option = document.createElement("option");
				option.innerHTML = filter_name;
				option.value = user;
				option.id = "pre_set_filters_option" + i;
				option.className = "public_filters";
				option.style.display = "none";
				
				//For the first filter, create a separation line
				if (i == "0") {
					var option_separator = document.createElement("option");
					option_separator.value = "";
					option_separator.innerHTML = "─────────────────────────";
					option_separator.disabled = true;
					option_separator.id = "pre_set_filters_option_separator";
					option_separator.className = "public_filters";
					option_separator.style.display = "none";
					$('#pre_set_filters_select').append(option_separator);
				}
				
				//Add the new option
				$('#pre_set_filters_select').append(option);
			}
		}
		//Else print the error message
		else if (error !== ""){
			message = $(request.responseText).find("error").text();
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);
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
//Function which add a field into the AND search (search the value of the field into the table and display it)
function and_search(data_table, field) {
	// alert($('input.and_or_button').bootstrapSwitch('state'));
	
	column_id = $(field).attr("name");
			
	//Get the searched value
	var searched_value = $(field).val();
			
	// var searched_value = "test10 test1000";
			
	//Search the value into the desired column
	data_table.fnFilter(searched_value, column_id);	
}
		
