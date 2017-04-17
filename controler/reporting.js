//####################################################################################################
//SELECTPICKER MANAGEMENT + ACTIONS
//####################################################################################################
//Management of the main select fields


//####################################################################################################
//WHEN DOCUMENT IS READY + BUTTONS ACTIONS
//####################################################################################################
//When the page is ready
$(document).ready(function () {
	//Load the loading picture
	load_loading();
	
	var column_ids = [];
	
	//Create the header and the main select. Return a list of options from the select with the matching ids
	generate_table_columns();


	//get the table information
	fill_table();
});




//####################################################################################################
//FUNCTIONS
//####################################################################################################
//Function used for generating the columns and the main select of the table depending on the user rights
function generate_table_columns() {

	var user_right = "WR";

	//XML generation
	var xml =
        '<xml version="1.0">' +
			'<user_right>' + user_right + '</user_right>' + '<user_groups>';

	//Get each user group
	$.each(user_groups, function(key, user_group){
		//For each group, check that it's not admin or bulk_entry and add it to the XML
		if((user_group !== "admin") && (user_group !== "bulk_entry")) {
			xml += '<group>' + user_group + '</group>';
		}
	});

	//Close the XML
	xml +=	'</user_groups>' + '</xml>';

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
		// select.size = 10;

		//Create a bootstrap search button
		var span = document.createElement("span");
		span.className = "btn btn-success col-md-6";
		span.id = "search_button";

		var i = document.createElement("i");
		i.className = "glyphicon glyphicon-plus";

		var span2 = document.createElement("span");
		span2.innerHTML = "Add";

		span.append(i);
		span.append(span2);

		// Create a bootstrap clear filters button
		var span3 = document.createElement("span");
		span3.className = "btn btn-primary col-md-6";
		span3.id = "clear_button";

		var i2 = document.createElement("i");
		i2.className = "glyphicon glyphicon-remove";

		var span4 = document.createElement("span");
		span4.innerHTML = "Clear all";

		//Append the button
		span3.append(i2);
		span3.append(span4);

		// Create a bootstrap save filters button
		var span5 = document.createElement("span");
		span5.className = "btn btn-warning col-md-6";
		span5.id = "save_button";

		var i3 = document.createElement("i");
		i3.className = "glyphicon glyphicon-floppy-disk";

		var span6 = document.createElement("span");
		span6.innerHTML = "Save";

		//Append the button
		span5.append(i3);
		span5.append(span6);

		// Create a bootstrap pre-set filters button
		var span7 = document.createElement("span");
		span7.className = "btn btn-danger col-md-6";
		span7.id = "pre_set_filters_button";

		var i4 = document.createElement("i");
		i4.className = "glyphicon glyphicon-folder-open";

		var span8 = document.createElement("span");
		span8.innerHTML = "Saved filters";

		//Append the button
		span7.append(i4);
		span7.append(span8);

		
		//Create an option table
		var options = [];

		//For each JSON node into data, create a th element (table header),
		//input the JSON as a string (without quotes, underscores and capitalize) and append (Take care of NULL values that appear as nothing)
		//Also create and fill a select field
		$.each(data.column_name, function(key, value){

			//Create the table header and add it
			var th = document.createElement("th");
			
			//Get the column name in text format without quotes
			// column_name = (JSON.stringify(data[key])).replace(/\"/g, "");
			column_name = (JSON.stringify(value).replace(/\"/g, ""));
			
			//Format well the column name
			column_name_formated = column_name.replace(/_/g, ' ');
			column_name_formated = column_name_formated.substr(0,1).toUpperCase() + column_name_formated.substr(1);
			
			//Set the column name
			th.innerHTML = column_name_formated;

			//Append the column header
			$("table#data_table thead tr").append(th);

			//Get the data type of a column
			var data_type_value = data.data_type[key];
			
			//Create an option line and insert it in a table (to fill the select)
			// var option = '<option id="' + key + '" value="' + data_type_value + "|" + key + '">' + column_name_formated + '</option>';
			var option = '<option id="' + key + '" value="' + data_type_value + '">' + column_name_formated + '</option>';
			options.push(option);
			
			// var option = document.createElement("option");
			// option.innerHTML = column_name_formated;
			//The value contain the data_type concatenate with the key
			// option.value = data_type_value + "|" + key;
			// select.append(option);
		});

		//Add the select and the buttons to the page
		$("#overall_select_li").append(select);
		$("#overall_select_li").append(span);
		$("#overall_select_li").append(span3);
		$("#overall_select_li").append(span5);
		$("#overall_select_li").append(span7);
		
		//Set the main select options
		$('#overall_select').selectpicker({
			//Size before apparition of the scrollbar
			size: 18,
			//Activate the search field
			liveSearch: true,
			//Show tick symbol close to the selected option
			showTick: true,
			//Show select all/deselect all
			actionsBox: true,
			//If more than a certain number of selected option --> write the number of selected options into the select
			selectedTextFormat: 'count > 4',
			
			//Set the container as body to avoid selectpicker to be cut by the scroll
			container: 'body'
		});
		
		//Refresh the overall_select to add the new options (the array)
		$("#overall_select").append(options.join('')).selectpicker('refresh');
		

	}

	//Else : error
	function OnError(request, data, status) {
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
}


//------------------------------------------------------------------------------
//Function which return a table with all the data from the view (depending on the user rights)
function fill_table() {
	
	//Display the loading picture
	toggle_loading();

	//The SQL table or view in which we have to search
	var table_name = "data_entry";

	//XML generation
	var xml =
        '<xml version="1.0">' +
			'<table_name>' + table_name + '</table_name>' + '<user_groups>';

	//Get each user group
	$.each(user_groups, function(key, user_group){
		//For each group, check that it's not admin or bulk_entry and add it to the xml
		if((user_group !== "admin") && (user_group !== "bulk_entry")) {
			xml += '<group>' + user_group + '</group>';
		}
	});

	//Close the XML
	xml +=	'</user_groups>' + '</xml>';


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
					{
						extend: 'selectColumns',
						text: 'Highlight columns',
						// collectionLayout: 'four-column'
						
					},
					{
						extend: 'selectRows',
						text: 'Highlight rows',
						// collectionLayout: 'four-column'
						
					},
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
					//Excel export (useful for further use, can freeze with large ammount of data)
					// {
						// extend: 'excel',
						// exportOptions: {
							// columns: ':visible',
						// }
					// },
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

			autoWidth: false,


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
		$('#data_table_length').addClass("col-md-2");

		// Creating new div to put the buttons into
		var div = document.createElement("div");
		div.id = "column_visibility_bar";
		div.className = "col-md-2";
		var div2 = document.createElement("div");
		div2.id = "select_column_row_bar";
		div2.className = "col-md-3";
		var div3 = document.createElement("div");
		div3.id = "export_bar";
		div3.className = "col-md-2";
		var div4 = document.createElement("div");
		div4.id = "bulk_edit_bar";
		div4.className = "col-md-2";

		//Function called to create the bulk edit dropdown and button and attach it to div 4
		create_bulk_edit_dropdown_button(div4);
		
		//Append those divs to the row bar
		$(".top").append(div);
		$(".top").append(div2);
		$(".top").append(div3);
		$(".top").append(div4);
		

		//Move the buttons in the appropriate div
		$('.buttons-colvis').detach().appendTo('#column_visibility_bar')
		$('.buttons-select-columns').detach().appendTo('#select_column_row_bar')
		$('.buttons-select-rows').detach().appendTo('#select_column_row_bar')
		$('.buttons-copy').detach().appendTo('#export_bar')
		$('.buttons-excel').detach().appendTo('#export_bar')
		$('.buttons-csv').detach().appendTo('#export_bar')

		// alert(data_table.api().buttons().buttons.extend);
		
		//Turn the bulk edit fields as a selectpicker
		bulk_edit_selecpicker_parameters();
		
		//Get the content of the bulk edit select
		bulk_edit_display();
		
		// $(document).on("click", "#bulk_edit_button", function() {
			
		// });
		
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
		});

				
		//On click on the second pre-set filters button, call a function to load the filter details (XHR) with the user_name
		$(document).on("click", '#pre_set_filters_button2', function() {
			get_filter(data_table, user);
		});
		
		//Call the function which load the other functionalities (delete, and more) of the pre-set filter buttons
		other_pre_set_filters_buttons_functionalities();
		
		//On click on save button, hide the pre_set_filters inputs, display the hidden input and call a function to save the filters (XHR)
		$("#save_button").click(function(){
		//If the pre-set-filters toggle is on (visible), turn it on (hide)
			
			//Turn on the save input toggle (visible)
			$("#save_input").toggle("slow");
			$("#save_button2").toggle("slow");
		});
		
		//On click on the second save button, call a function to save the filters (XHR)
		$("#save_button2").click(function(){
			create_filter();
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
		//On change of a sub-select
		// $(document).on("change", ".sub-select", function(){
		$(document).on("hidden.bs.select", ".sub-select", function (e) {
			//Call a function which add a field into the AND search (search the value of the field into the table and display it)
			and_search(data_table, $(this));
		});
		
		//Modal selection - 
		$(document).on("hidden.bs.select", "#modal_column_select", function (e) {
			//Call a function which display the values of the all selected columns
			create_modal_fields();
		});
		
		
		
		
		//-----------Create a table which gather the option field name and the related id-----
		//Get the number of options into the select
		var select_option_number = $("#overall_select option").length;
		//Create an empty table column_ids
		var column_ids = [];
		//Create an empty table column_ids
		var column_data_types = [];
		
		//For each option into the select, get the name (format it) and get the related id
		//Insert it into the column_ids_table
		for(var i = 0; i < select_option_number; i++) {
			var option_name = $("#overall_select option").eq(i).text().replace(/ /g, '_').toLowerCase();
			
			//Get the data_type which is the value of the id
			var column_data_type = $("#overall_select option").eq(i).val();
			//Get the column id (id of the option)
			var option_id = $("#overall_select option").eq(i).attr("id");
	
			column_ids[option_name] = option_id;
			column_data_types[option_name] = column_data_type;
		}
		
		//-------------------
		
		//Everytime the visibility of a column is turned on or off, call the function to refresh the overall select (with the options_id and the options_data_types tables)
		$('#data_table').on('column-visibility.dt', function(e, settings, column, state ){	
			refresh_overall_select(column_ids, column_data_types);
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


//############PRESET FILTERS REGISTERING AND LOAD MANAGEMENT###########################
//----------------------------------------------------------------------
//Creation of the pre-set filters toggle content (appears on click) + call to functions to fill the list of preset filters select
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
	i.className = "glyphicon glyphicon-play";

	var span2 = document.createElement("span");
	span2.innerHTML = "Run";

	span.append(i);
	span.append(span2);

	//Create a bootstrap delete button (with pop confirm to get the confirmation)
	var span3 = document.createElement("span");
	span3.className = "btn btn-danger col-md-4 popconfirm";
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
	i3.className = "glyphicon glyphicon-asterisk";

	var span6 = document.createElement("span");
	span6.innerHTML = "More";

	span5.append(i3);
	span5.append(span6);

	
	//Call a function in order to create the select with the list of filters
	//When done, add the public filters in hidden mode
	$.when(create_filter_list_select(select)).done(function() {
		create_more_filter_list_select(data_table, select);
	});
	
	//Append the buttons and the select
	span0.append(select);
	$("#overall_select_li").append(span);
	$("#overall_select_li").append(span3);
	$("#overall_select_li").append(span5);
	$("#overall_select_li").append(span0);
}


//----------------------------------------------------------------------
//Function which is called to create a select with the list of pre-set filters of the user
//(user is a global variable defined in the php page, it's a session variable)
function create_filter_list_select(select) {

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
//Function which get the "public" pre-set filters of other users and add it to the pre-set filter select
//(user is a global variable defined in the php page, it's a session variable)
function create_more_filter_list_select(data_table, select) {

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
					option_separator.innerHTML = "───────PUBLIC FILTERS───────";
					option_separator.disabled = true;
					option_separator.id = "pre_set_filters_option_separator";
					option_separator.className = "public_filters";
					option_separator.style.display = "none";
					select.append(option_separator);
				}

				//Add the new option
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
//Function which turn the "more" filter button as a trigger
function more_filters_button_trigger() {
	if ($("#pre_set_filters_button_more").hasClass("active")) {
		$("#pre_set_filters_button_more").removeClass("active");
	}
	else {
		$("#pre_set_filters_button_more").addClass("active");
	}
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
	i.className = "glyphicon glyphicon-floppy-disk";

	var span2 = document.createElement("span");
	span2.innerHTML = "Save";

	span.append(i);
	span.append(span2);

	$("#overall_select_li").append(span0);
	$("#overall_select_li").append(span);
}


//----------------------------------------------------------------------
//Function called to save the pre-set filter and send it to the PHP script (insert into database)
function create_filter() {

	//If a filter name was entered
	if($("#filter_name").val() !== '') {

		//Get the filter name
		var filter_name = $("#filter_name").val();

		//XML generation
		var xml = '<xml version="1.0"><user>' + user + '</user>' +
					'<filter_name>' + filter_name + '</filter_name>';

		var i = 0;
	
		//For each select (normal case), get the name, the value and the button value
		$("select.sub-select").each(function() {
			
			//Create an empty field option array (to manage multiple values selection)
			var field_values = [];
			
			//For each select, get the selected options values (with quotes to avoid problems) and insert it into the array
			$.each(($("option:selected", this)), function(){
				field_values.push('"' + ($(this).val()) + '"');
			});

			//If the field value array isn't empty, add the filter to the XML
			if (field_values.length !== 0) {
				//Insert the array into XML (and empty button value --> for further use)
				xml += '<filter>' +
						'<field_name>' + (this.id) + '</field_name>' +
						'<field_value>' + field_values + '</field_value>' +
						'<button_value></button_value>' +
						'</filter>';
			}
			
			
			
			//AND/OR button not used at the moment
			//---------
						//Add a button value to the XML  if there are more than a field and except for the 1st field (no button). Then, close the filter.
						// if((i !== 0) && (".label-sub-select")) {
							// xml += '<button_value>' + ($('#and_or_button' + i).bootstrapSwitch('state')) + '</button_value>' +
									// '</filter>';
							// i++;
						// }
						//Else add a "0" button value and close the filter
						// else {
							// xml += '<button_value></button_value>' +
									// '</filter>';
							// i++;
						// }
			//------
		});
		
		//Create an on empty array to not add twice the same data into the XML
		var already_set_input_bundary = [];
		
		//For each boundaries input (date or number cases), get the name, the value(s) and the button value
		$("input.boundary-sub-select").each(function() {
			
			//Get the label id (remove _from or _to)
			label_id = this.id.substring(0, this.id.lastIndexOf("_"));
			
			//If the label_id isn't already in the related table
			if(jQuery.inArray(label_id, already_set_input_bundary) == -1) {
			
			
				//Use the label_id to get the 2 bundaries
				var first_bundary = (($("#" + label_id + "_from").val()));
				var second_bundary = (($("#" + label_id + "_to").val()));
				
				//Add a filter to XML except if the bundaries are empty
				if ((first_bundary !== "") || (second_bundary !== "")) {
					//Add a filter to XML, set the field_name as the label name and insert the 2 bundaries into the value (format : "56.67","98.54")
					xml += '<filter>' +
							'<field_name>' + label_id + '</field_name>' +
							'<field_value>"' + first_bundary + '","' + second_bundary + '"</field_value>' +
							'<button_value></button_value>' +
							'</filter>';
				}	
				
				//Add the label_id to the already_set_input_bundary table
				already_set_input_bundary.push(label_id);
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
				
				//Reload the field
				create_pre_set_filters_toggle_content();
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
			message = "Network problem: XHR didn't work (perhaps, incorrect URL is called). It may be caused by a try to save an empty filter.";
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
//Function which load the details of a filter (XHR) - all the filters from the pre-set filter
function get_filter(data_table, user, user_parameter) {

	//If it's a public filter, set the user as the value attribute of the option (in case of public filters, value = username)
	//else use the actual user (already set in the front_end - session variable)
	if (($('#pre_set_filters_select :selected').attr('class')) == "public_filters") {
		var user = $('#pre_set_filters_select :selected').val();
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
				
				//If the field wasn't already added, add it
				if ($("#" + field_name + "_li").length == 0) {
				
					//Get the formated field name to match the field name into the select (capitalize first letter and remove underscore)
					var field_name_formated = field_name.replace(/_/g, ' ');
					field_name_formated = field_name_formated.substr(0,1).toUpperCase() + field_name_formated.substr(1)
					
					//Search for the field name into the select and get its data_type (value) and column_id (id)
					var field_data_type = $("#overall_select option").filter(function () { return $(this).html() == field_name_formated; }).val();
					var field_column_id = $("#overall_select option").filter(function () { return $(this).html() == field_name_formated; }).attr("id");
					console.log(field_name_formated + " +++ " + field_data_type + " +++ " + field_column_id);
					
					//For further use
					//var button_value = $(request.responseText).find("button_value").eq(i).text();

					//Create the li
					var li = document.createElement("li");
					li.className = "side-select li-sub-select";
					li.id = field_name + "_li";

					//Create a span (remove button)
					var span = document.createElement("span");
					// span.className = "";
					span.id = field_name + "_delete";
					span.style.cursor = "pointer";
					
					var img = document.createElement("i");
					img.className = "glyphicon glyphicon-remove-sign";
					img.style.color = "red";
					span.append(img);
					li.append(span);
					
					
					//Create the label
					var label = document.createElement("label");
					label.setAttribute("for",field_name);
					label.className = "control-label";
					label.innerHTML = field_name_formated;
					label.style.display = "inline-block";
					li.append(label);
					
					//AND/OR -----------For further use
					//Create the bootstrap "or" button (if it's not the first field)
					//Count the number of buttons already existing to create the ID
								// if ($(".li-sub-select").length) {
									// var input = document.createElement("input");
									// input.className = "and_or_button col-sm-2";
									// var buttons_number = $('input.and_or_button').length;
									// input.id = "and_or_button" + (buttons_number + 1);
									// input.type = "checkbox";
									//Set the value registered in database for the checkbox (AND/OR)
									// if (button_value == "true") {
										// input.checked = true;
									// }
									// else if (button_value == "false") {
										// input.checked = false;
									// }
									// li.append(input);

									//add a class to the label if it is not the first field
									// label.className += " label-sub-select";
								// }
					//------------------

					
					
					
					
					
					
					//-----------Generate date fields (boundaries)----------
					if (field_data_type == "date") {
						
						//Get the two bundaries (separate value from the db) and clean it (remove backslashes and quotes)
						field_value_from = field_value.split('\\",\\"')[0].replace(/\\/g, "").replace(/"/g, "");
						field_value_to = field_value.split('\\",\\"')[1].replace(/\\/g, "").replace(/"/g, "");
						
						//Create a first input - from (class datapicker)
						var input_from = document.createElement("input");
						input_from.id = field_name + "_from";
						input_from.type = "text";
						//Set the input name as a gathering of data_type and column id
						input_from.name = field_data_type + "|" + field_column_id;
						input_from.className = "form-control datepicker boundary-sub-select";
						input_from.value = field_value_from;
						
						//Create a first input - to (class datapicker)
						var input_to = document.createElement("input");
						input_to.id = field_name + "_to";
						input_to.type = "text";
						//Set the input name as a gathering of data_type and column id
						input_to.name = field_data_type + "|" + field_column_id;
						input_to.className = "form-control datepicker boundary-sub-select";
						input_to.value = field_value_to;
						
						//Append the two datepickers to the li and append the li
						li.append(input_from);
						li.append(input_to);
						$("div.side-menu-container ul.navbar-nav").append(li);
						
						//Define the datepicker characteristics
						$('.datepicker').datepicker({
							// dateFormat: 'dd/mm/yy',
							dateFormat: 'yy-mm-dd',
							startDate: '-3d',
							
							//Define what to do on select
							onSelect: function() {
								and_search(data_table, $(this));
							}
							
						});
						
						//Lauch the AND search on each field (refresh the table)
						and_search(data_table, ($('#' + field_name + "_from")));
						and_search(data_table, ($('#' + field_name + "_to")));
					}
					
					
					//-----------Generate two number fields (boundaries)----------
					//If the data type is a number
					else if ((field_data_type == "integer") || (field_data_type == "double") || (field_data_type == "float")) {
						
						//Get the two bundaries (separate value from the db) and clean it (remove backslashes and quotes)
						field_value_from = field_value.split('\\",\\"')[0].replace(/\\/g, "").replace(/"/g, "");
						field_value_to = field_value.split('\\",\\"')[1].replace(/\\/g, "").replace(/"/g, "");
						
						//Create a first input - from
						var input_from = document.createElement("input");
						input_from.id = field_name + "_from";
						input_from.type = "number";
						input_from.step = "any";
						//Set the input name as a gathering of data_type and column id
						input_from.name = field_data_type + "|" + field_column_id;
						input_from.className = "form-control boundary-sub-select";
						input_from.value = field_value_from;
						
						//Create a first input - to
						var input_to = document.createElement("input");
						input_to.id = field_name + "_to";
						input_to.type = "number";
						input_to.step = "any";
						//Set the input name as a gathering of data_type and column id
						input_to.name = field_data_type + "|" + field_column_id;
						input_to.className = "form-control boundary-sub-select";
						input_to.value = field_value_to;
						
						//Append the two datepickers to the li and append the li
						li.append(input_from);
						li.append(input_to);
						$("div.side-menu-container ul.navbar-nav").append(li);
						
						//When something is written in "_from", call and search
						$("#" + field_name + "_from").keyup(function() {
							and_search(data_table, $(this));
						});
						
						//When something is written in "_to", call and search
						$("#" + field_name + "_to").keyup(function() {
							and_search(data_table, $(this));
						});
						
						//Lauch the AND search on each field (refresh the table)
						and_search(data_table, ($('#' + field_name + "_from")));
						and_search(data_table, ($('#' + field_name + "_to")));
					}
					
					
					
					
					//-----------Generate a select with the values of the table and check the right values----------
					else {
						//Create a select
						var select = document.createElement("select");
						select.id = field_name;
						select.className = "form-control sub-select";
						select.multiple = true;
						
						//Set the name of the select field as a gathering of data_type and column id
						select.name = field_data_type + "|" + field_column_id;

						var options = [];
						
						//Get all the values of the wanted column (eliminate doubles, sort it) and fill the select
						//api().column is called because the old dataTable call is used (new one is "DataTable" but it doesn't allow fnfilters)
						data_table.api().column(field_column_id).data().unique().sort().each( function ( d, j ) {
									
							//If the value isn't null, create an option with it
							if (d !== "") {
								var option = '<option value="' + d + '">' + d + '</option>';
							}
							//If the value is null, name the value of the option with empty (to avoid null value)
							else {
								var option = '<option value="empty">-Blank-</option>';
							}
							
							//Push the newly created option into the options table
							options.push(option);
						});

						//Add the select to the page
						li.append(select);
						
						$("div.side-menu-container ul.navbar-nav").append(li);
						
							
						//Declare the field as a selectpicker with the following options
						$("#" + field_name).selectpicker({
							
							//Size before apparition of the scrollbar
							size: 18,
							//Activate the search field
							liveSearch: true,
							//Show select all/deselect all
							actionsBox: true,
							//Show tick symbol close to the selected option
							showTick: true,
							
							//If more than a certain number of selected option --> write the number of selected options into the select
							selectedTextFormat: 'count > 4',
							//Set the container as body to avoid selectpicker to be cut by the scroll
							container: 'body'
						});
						
						//Refresh the field to add the new options (the options array)
						$("#" + field_name).append(options.join('')).selectpicker('refresh');
						
						
						//Split the string and get all value inside a table
						field_values = field_value.split('\\",\\"');
						
						//For each value of the table, clean it and replace the old value with the clean one
						$.each(field_values, function(key, value) {
							value = value.replace(/\\/g, "").replace(/"/g, "");
							field_values[key] = value;
						});
						
						//Set the value (array) into the select picker to check the selected options
						$("#" + field_name).selectpicker('val', field_values);

						//Lauch the AND search on each field (refresh the table)
						and_search(data_table, ($('#' + field_name)));
					}
					
					//Call a function when click on delete (one avoid multiple calls in case the same filter is deleting more than once)
					$(document).one("click", "#" + field_name + "_delete", function() {					
						//Get the id of the delete button
						delete_id = $(this).attr("id");
						
						//Call the function to delete the filter
						individual_filter_deletion(delete_id, data_table);
					});
				}
				//Else if a field is already there, don't add it
				else {
					message = "One part of this filter is already existing and wasn't created a second time.";
					DeleteMessage();
					CreateMessage("red", message, 0.5, 3, 0.5);	
				}
			}
			
			//AND/OR filter -----------For further use
						//Style the bootstrap "or/and" button as a switch and define the values
						// $(".and_or_button").bootstrapSwitch({
							// size: "mini",
							// onText: "OR",
							// offText: "AND"
						// });
			//--------------
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

//------------------------------------------------------------------------
//Function which delete an filter individually (parameters : id of the delete button - looking like the one of the field; and data_table
function individual_filter_deletion(delete_id, data_table) {

	//Get the id of the select
	var field_name = delete_id.substring(0, delete_id.lastIndexOf("_"));

	//Remove the field with the related field name
	$("#" + field_name + "_li").remove();
	
	//Get the number of fields which are still existing
	var fields_number = ($('.sub-select').length + $('.boundary-sub-select').length);

	//If there is at least one field left, relaunch the search with it
	if (fields_number > 0) {
		//For each select of class sub-select, launch the search
		$('.sub-select select').each(function(){
			//If the id is different from the field name previously determined, lauch the search
			//(sometimes the deletion of the field append after that)
			if(($(this).attr("id")) !== field_name) {
				reset_table(data_table, false);
				// alert(($(this).attr("id")));
				and_search(data_table, $(this));
			}
		});
		
		//For each sub-select with boundary type (it's not a select), launch the search
		$('.boundary-sub-select').each(function(){

			//Get the label and remove from/to
			label_id = ($(this).attr("id")).substring(0, ($(this).attr("id")).lastIndexOf("_"));
			
			//If the label id is different from the field name previously determined, lauch the search
			//(sometimes the deletion of the field append after that)
			if(label_id !== field_name) {
				reset_table(data_table, false);
				and_search(data_table, $(this));
			}
		});
	}
	//Else call the function to reset the table
	else {
		reset_table(data_table);
	}
}



//----------------------------------------------------------------------
//Function called to make a confirmation box appears when asking for delete a filter
//Call the delete_filter funtion if yes
function delete_confirmation(data_table) {

	//Get the name of the user which the filter belongs to
	var filter_user_type = $('#pre_set_filters_select option:selected').attr("class");

	//If the filter has a type user_filter (it belongs to the user who try to delete it), start the process to make the confirmation panel appears
	if (filter_user_type == "user_filters") {

		//Remove the delete panel if existing
		if ($("#panel_confirm_delete_filter")) {
			$("#panel_confirm_delete_filter").remove();
		}

		//Create a line break div
		var div0 = document.createElement("div");
		div0.className = "clearfix";

		//Create a panel
		var div = document.createElement("div");
		div.className = "panel panel-default";
		div.id = "panel_confirm_delete_filter";

		//Panel header with the question
		var div2 = document.createElement("div");
		div2.className = "panel-heading";
		div2.innerHTML = "Are you sure?";


		//Panel body
		var div3 = document.createElement("div");
		div3.className = "panel-body";

		//Button one : yes
		var span = document.createElement("span");
		span.className = "btn btn-success col-md-6";
		span.id = "confirm_delete_button";

		var i = document.createElement("i");
		i.className = "glyphicon glyphicon-ok";

		var span2 = document.createElement("span");
		span2.innerHTML = "Yes";

		span.append(i);
		span.append(span2);
		div3.append(span);

		//Button 2 : no
		var span3 = document.createElement("span");
		span3.className = "btn btn-danger col-md-6";
		span3.id = "unconfirm_delete_button";

		var i2 = document.createElement("i");
		i2.className = "glyphicon glyphicon-remove";

		var span4 = document.createElement("span");
		span4.innerHTML = "No";

		span3.append(i2);
		span3.append(span4);
		div3.append(span3);

		//Append the buttons the two parts to the pannel
		div.append(div2);
		div.append(div3);

		//Append the line break and the pannel to the button div
		$("#overall_select_li").append(div0);
		$("#overall_select_li").append(div);

		//If yes is clicked, call the delete_filter function and remove the delete filter panel
		$("#confirm_delete_button").click(function(){
			delete_filter(data_table);
			$("#panel_confirm_delete_filter").remove();
		});

		//Else, just remove the delete filter panel
		$("#unconfirm_delete_button").click(function(){
			$("#panel_confirm_delete_filter").remove();
		});
	}
	//Else, warn the user that he hasn't the right to delete other people filters
	else {
		message = "You are not allowed to delete filters from other users.";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}
}


//----------------------------------------------------------------------
//Function called to delete a pre-set filters and remove it from the list
//(user is a global variable defined in the php page, it's a session variable)
function delete_filter(data_table) {


	
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

//--------------------------------------------------------------------------------------
//Function which load the functionalities from the pre-set filters buttons
function other_pre_set_filters_buttons_functionalities() {
	//On click on the delete button, lauch the confirmation box which (if yes) call a funtion to delete the selected pre-set filters and remove it from the list (reload the list)
	$(document).on("click", '#pre_set_filters_button_delete', function() {
		delete_confirmation(data_table);
	});

	//On click on the "more" button, turn the button on or off (function call) and show the public filters
	$(document).on("click", '#pre_set_filters_button_more', function() {
		more_filters_button_trigger();
		$(".public_filters").toggle();
	});
}


//##############################Other function about search and research fields#####################################################"

//----------------------------------------------------------------------
//Function called when removing all the filters to show the whole table (receive the data_table as a parameter, and also a delete filter option)
function reset_table(data_table, delete_filter_option) {
	//If delete_filter_option isn't false, remove all the filters
	if (delete_filter_option !== false) {
		$(".li-sub-select").remove();
	}
	
	//If the table, table info and the pagination is hidden, show it
	if ($("#data_table tbody").is(':hidden')) {
		$("#empty_data_table_info").remove();
		$("#data_table tbody").show();
		$("#data_table_info").show();
		$("#data_table_paginate").show();
	}

	//Clean the table and show all
	//First, get the settings of the table
	var settings = data_table.fnSettings();

	//Get the number of column
	var columns_number = settings.aoPreSearchCols.length

	//Clean the value of the search for each column
	for(i = 0; i < columns_number; i++) {
		settings.aoPreSearchCols[i].sSearch = '';
	}

	//Apply the changes to the filters
	data_table.fnDraw();
}


//----------------------------------------------------------------------
//Function which refresh the overall_select_list (list of filters) and the bulk_edit_select_list
function refresh_overall_select(column_ids, column_data_types) {
	
	//Empty the overall select
	$("#overall_select option").remove();
	
	//Create an option array for the overall select and another for the bulk_edit select
	var options_overall_select = [];
	var options_bulk_edit_select = [];
			
	// Get the number of columns (special calculation to get the good result)
	var table_header_number = ((($("tr th").length)-1)/2);
	
	//For each column of the table, create an option
	for(var i = 0; i < table_header_number; i++) {
		//Get the column name
		var column_name_formated = $("tr th").eq(i).text();
		//format it with underscores and lowercase
		var column_name = column_name_formated.replace(/ /g, '_').toLowerCase();
		
		//Create an option with the column_id and the column data_type (which is value)
		var option_overall_select = '<option id="' + column_ids[column_name] + '" value="' + column_data_types[column_name] + '">' + column_name_formated + '</option>';
		//Push it into the overall select options array
		options_overall_select.push(option_overall_select);
		
		//Create another option option with the column_id and the column data_type (which is value)
		var option_bulk_edit_select = '<option value="' + column_name + '">' + column_name_formated + '</option>';
		//Push it into the bulk edit select options array
		options_bulk_edit_select.push(option_bulk_edit_select);
	}
	
	//Refresh the overall_select to add the new options (the array)
	$("#overall_select").append(options_overall_select.join('')).selectpicker('refresh');
	
	//Refresh the bulk edit select
	$("#bulk_edit_select").append(options_bulk_edit_select.join('')).selectpicker('refresh');
}


//----------------------------------------------------------------------
//Function called to create selects and fill them (and also AND/OR buttons) (receive the data_table as a parameter)
function create_select_filter(data_table) {
	//Get the number of selected option
	var selected_options_number = $("select#overall_select").children(":selected").length;

	//For each option selected, create a select and fill it
	for(var i = 0; i < selected_options_number; i++) {

		//Get the name of the selected option
		var selected_option_formated = $("select#overall_select").children(":selected").eq(i).text();
		//Format it with underscores and lowercase for the id
		var selected_option = selected_option_formated.replace(/ /g, '_').toLowerCase();
		//Get the data_type of the selected option (registered into the value)
		var data_type = $("select#overall_select").children(":selected").eq(i).val();
		//Get the id of the selected option (to link it to the right column)
		var column_id = $("select#overall_select").children(":selected").eq(i).attr("id");

		//If the field wasn't already added, add it
		if ($("#" + selected_option + "_li").length == 0) {
		
			//Create the li
			var li = document.createElement("li");
			li.className = "side-select li-sub-select";
			li.id = selected_option + "_li";

			//Create a span (remove button)
			var span = document.createElement("span");
			// span.className = "";
			span.id = selected_option + "_delete";
			span.style.cursor = "pointer";
			
			var img = document.createElement("i");
			img.className = "glyphicon glyphicon-remove-sign";
			img.style.color = "red";
			span.append(img);
			li.append(span);
			
			//Create the label
			var label = document.createElement("label");
			label.setAttribute("for",selected_option);
			label.className = "control-label";
			label.style.display = "inline-block";
			label.innerHTML = selected_option_formated;

			//AND/OR filters useful for further use--------------
						//Create the bootstrap "or" button (if it's not the first field)
						//Count the number of buttons already existing to create the ID
						// if ($(".li-sub-select").length) {
							// var input = document.createElement("input");
							// input.className = "and_or_button col-sm-2";
							// var buttons_number = $('input.and_or_button').length;
							// input.id = "and_or_button" + (buttons_number + 1);
							// input.type = "checkbox";
							// li.append(input);

							// add a class to the label if it is not the first field
							// label.className += " label-sub-select";
						// }

			//--------------------------------------------
			//Add the label to the page
			li.append(label);

			
			
			//-----------Generate two date fields (boundaries)----------
			if (data_type == "date") {
				//Create a first input - from (class datapicker)
				var input_from = document.createElement("input");
				input_from.id = selected_option + "_from";
				input_from.type = "text";
				//Set the input name as a gathering of data_type and column id
				input_from.name = data_type + "|" + column_id;
				input_from.className = "form-control datepicker boundary-sub-select";
				input_from.placeholder = "From";
				
				//Create a first input - to (class datapicker)
				var input_to = document.createElement("input");
				input_to.id = selected_option + "_to";
				input_to.type = "text";
				//Set the input name as a gathering of data_type and column id
				input_to.name = data_type + "|" + column_id;
				input_to.className = "form-control datepicker boundary-sub-select";
				input_to.placeholder = "To";
				
				//Append the two datepickers to the li and append the li
				li.append(input_from);
				li.append(input_to);
				$("div.side-menu-container ul.navbar-nav").append(li);
				
				//Define the datepicker characteristics
				$('.datepicker').datepicker({
					// dateFormat: 'dd/mm/yy',
					dateFormat: 'yy-mm-dd',
					startDate: '-3d',
					
					//Define what to do on select
					onSelect: function() {
						and_search(data_table, $(this));
					}
					
				});
			}
			
			
			//-----------Generate two number fields (boundaries)----------
			//If the data type is a number
			else if ((data_type == "integer") || (data_type == "double") || (data_type == "float")) {
				//Create a first input - from
				var input_from = document.createElement("input");
				input_from.id = selected_option + "_from";
				input_from.type = "number";
				input_from.step = "any";
				//Set the input name as a gathering of data_type and column id
				input_from.name = data_type + "|" + column_id;
				input_from.className = "form-control boundary-sub-select";
				input_from.placeholder = "Minimum";
				
				//Create a first input - to
				var input_to = document.createElement("input");
				input_to.id = selected_option + "_to";
				input_to.type = "number";
				input_to.step = "any";
				//Set the input name as a gathering of data_type and column id
				input_to.name = data_type + "|" + column_id;
				input_to.className = "form-control boundary-sub-select";
				input_to.placeholder = "Maximum";
				
				//Append the two datepickers to the li and append the li
				li.append(input_from);
				li.append(input_to);
				$("div.side-menu-container ul.navbar-nav").append(li);
				
				//When something is written in "_from", call and search
				$("#" + selected_option + "_from").keyup(function() {
					and_search(data_table, $(this));
				});
				
				//When something is written in "_to", call and search
				$("#" + selected_option + "_to").keyup(function() {
					and_search(data_table, $(this));
				});
			}
			
			
			
			
			//-----------Generate a select with the values of the table----------
			else {
				//Create a select
				var select = document.createElement("select");
				select.id = selected_option;
				select.className = "form-control sub-select";
				select.multiple = true;
				
				//Set the name of the select field as a gathering of data_type and column id
				select.name = data_type + "|" + column_id;

				var options = [];
				
				//Get all the values of the wanted column (eliminate doubles, sort it) and fill the select
				//api().column is called because the old dataTable call is used (new one is "DataTable" but it doesn't allow fnfilters)
				data_table.api().column(column_id).data().unique().sort().each( function ( d, j ) {
							
					//If the value isn't null, create an option with it
					if (d !== "") {
						var option = '<option value="' + d + '">' + d + '</option>';
					}
					//If the value is null, name the value of the option with empty (to avoid null value)
					else {
						var option = '<option value="empty">Blank</option>';
					}
					
					//Push the newly created option into the options table
					options.push(option);
				});

				//Add the select to the page
				li.append(select);
				
				$("div.side-menu-container ul.navbar-nav").append(li);
				
				//Declare the field as a selectpicker with the following options
				$("#" + selected_option).selectpicker({
					
					//Size before apparition of the scrollbar
					size: 18,
					//Activate the search field
					liveSearch: true,
					//Show select all/deselect all
					actionsBox: true,
					//Show tick symbol close to the selected option
					showTick: true,
					
					//If more than a certain number of selected option --> write the number of selected options into the select
					selectedTextFormat: 'count > 4',
					//Set the container as body to avoid selectpicker to be cut by the scroll
					container: 'body'
				});
				
				//Refresh the field to add the new options (the options table)
				$("#" + selected_option).append(options.join('')).selectpicker('refresh');
			}
			
			//Call a function when click on delete (one avoid multiple calls in case the same filter is deleting more than once)
			$(document).one("click", "#" + selected_option + "_delete", function() {					
				//Get the id of the delete button
				delete_id = $(this).attr("id");
				
				//Call the function to delete the filter
				individual_filter_deletion(delete_id, data_table);
			});
		}
		//Else if the field the user tries to create is already there, don't add it
		else {
			message = "One part of this filter is already existing and wasn't created a second time.";
			DeleteMessage();
			CreateMessage("red", message, 0.5, 3, 0.5);	
		}
	}

	//AND/OR filters useful for further use--------------
			//Style the bootstrap "or/and" button as a switch and define the values
			// $(".and_or_button").bootstrapSwitch({
				// size: "mini",
				// onText: "OR",
				// offText: "AND"
			// });
	//-------------------------
}






//----------------------------------------------------------------------
//Function which add a field into the AND search (search the value of the field into the table and display it)
function and_search(data_table, field) {
	
	//Test if the field call is empty; if not, get the column id (by splitting on | to not have data_type)
	if (typeof ($(field).attr("name").split("|")[1]) !== 'undefined') {
		// alert($('input.and_or_button').bootstrapSwitch('state'));
		
		//Get the full field value which gather the data_type and the id
		var full_field_value = $(field).attr("name");
		//Get the id of the selected option (to link it to the right column) by splitting on | and getting the second element
		var column_id = full_field_value.split("|")[1];
		//Same process to get the data type
		var data_type = full_field_value.split("|")[0];
		
		
		//Manage the case of the number and date boundaries
		if ((data_type == "date") || (data_type == "integer") || (data_type == "double") || (data_type == "float")) {
			//Get the id of the field (looking like "id_from" or "id_to", depending on which one was selected)
			field_id = ($(field).attr("id"));
			
			//Get the label id (remove _from or _to)
			label_id = field_id.substring(0, field_id.lastIndexOf("_"));
			
			//Use the label_id to get the 2 bundaries
			var first_bundary = (($("#" + label_id + "_from").val()));
			var second_bundary = (($("#" + label_id + "_to").val()));
			
			//In the case of a number, no empty boundaries possible (otherwise, it reloads the search) - contains_empty is false
			var contains_empty = false; 
			
			//Define an empty searched value string
			var searched_value = "";
			
			//If the 2 boundaries aren't empty
			if ((first_bundary !== "") && (second_bundary !== "")) {				
				//For each value corresponding to the column into the database
				data_table.api().column(column_id).data().unique().sort().each( function ( d, j ) {
					//Check if the value is between the boundaries
					if((d >= first_bundary) && (d <= second_bundary)) {
						//If yes, add it to the searched_value string inserted on a regular expression to not get more results than expected (if to manage the case of the pipe)
						if (searched_value == "") {
							searched_value = "^\\s*" + d + "\\s*$";
						}
						//Else, add a pipe in the string
						else {
							searched_value = searched_value + "|^\\s*" + d + "\\s*$";
						}
					}
				});
			}
			//Else if only the first bundary is null
			else if ((first_bundary == "") && (second_bundary !== "")) {
				//For each value corresponding to the column into the database
				data_table.api().column(column_id).data().unique().sort().each( function ( d, j ) {
					//Check if the value is higher than the only bundary set bundary
					if((d <= second_bundary) && (d !== "")) {
						//If yes, add it to the searched_value string inserted on a regular expression to not get more results than expected (if to manage the case of the pipe)
						if (searched_value == "") {
							searched_value = "^\\s*" + d + "\\s*$";
						}
						//Else, add a pipe in the string
						else {
							searched_value = searched_value + "|^\\s*" + d + "\\s*$";
						}
					}
				});
			}
			//Else if only the second bundary is null
			else if ((first_bundary !== "") && (second_bundary == "")) {
				//For each value corresponding to the column into the database
				data_table.api().column(column_id).data().unique().sort().each( function ( d, j ) {
					//Check if the value is higher than the only bundary set bundary
					if(d >= first_bundary) {
						//If yes, add it to the searched_value string inserted on a regular expression to not get more results than expected (if to manage the case of the pipe)
						if (searched_value == "") {
							searched_value = "^\\s*" + d + "\\s*$";
						}
						//Else, add a pipe in the string
						else {
							searched_value = searched_value + "|^\\s*" + d + "\\s*$";
						}
					}
				});
			}
			//If one empty boundary, reset the search
			else {
				contains_empty = true;
			}
		}
		
		
		
		
		
		//If it is a select, normal search
		else {
			//Create an empty searched_value string
			var searched_value = "";
			
			//Create a boolean variable to register if there are empty results into the search
			var contains_empty = false;
			
			//For each selected value, add it to the string
			$.each($((field).val()), function(){
				//If the selected option is empty, change the value of contains_empty boolean
				if (this == "empty") {
					contains_empty = true;
				}
				
				//Escape the special characters (regexp) of the value (allow to use every characters into the search)
				var clean_value = this.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\\$&");
				
				//If it's the first value, don't add a pipe in the string
				if (searched_value == "") {
					searched_value = "^\\s*" + clean_value + "\\s*$";
				}
				//Else, add a pipe in the string
				else {
					searched_value = searched_value + "|^\\s*" + clean_value + "\\s*$";
				}
			});
		}
		
		//If the search return an empty result, hide the table, table infos and pagination.
		//Create a new table info "empety table..." and append it
		if ((searched_value == "") && ($("#data_table tbody").is(':visible'))) {
			$("#data_table tbody").hide();
			$("#data_table_info").hide();			
			$("#data_table_paginate").hide();
			
			var div = document.createElement("div");
			div.className = "dataTables_info";
			div.id = "empty_data_table_info";
			div.innerHTML = "No results"
			$(".bottom").append(div);
		}
		//If the search doesn't return an empty result and the table is hidden, show table, table infos and pagination (+remove the "empty table" info)
		else if ((searched_value !== "") && ($("#data_table tbody").is(':hidden'))){
			$("#empty_data_table_info").remove();
			$("#data_table tbody").show();
			$("#data_table_info").show();
			$("#data_table_paginate").show();
		}
		
		//Add a backslash to certain characters of the resular expression
			console.log(searched_value);
		
		//If the searched value is fully empty (allow to reset just a field selection from the search) 
		//or if it doesn't contain an empty option value, launch the search on the right column
		//The search contains the variable, true for regular expression seach and false for smart search
		//(allow multiple values). Draw resort the table
		if (contains_empty == false) {
			data_table.api().column(column_id).search(searched_value, true, false).draw();
		}
		//If the search contains an empty value, launch the search with serached_value string and the empty option selector
		else {
			data_table.api().column(column_id).search((searched_value + '|^\s*$'), true, false).draw();
		}
		
	}
	
}


//#####################BULK_EDIT FUNCTIONS####################################

//----------------------------------------------------------------------
//Function which create bulk_edit dropdown and button
function create_bulk_edit_dropdown_button(div) {
	var a = document.createElement("a");
	a.id = "bulk_edit_button";
	a.className = "btn btn-default";
	$(a).attr("data-target", "#bulk_edit_modal");
	$(a).attr("data-toggle", "modal");
	
	var span = document.createElement("span");
	span.innerHTML = "Bulk edit";
	a.append(span);
	
	var select = document.createElement("select");
	select.id = "bulk_edit_select";
	select.className = "form-control";
	select.multiple = true;
	div.append(select);
	div.append(a);
}


//-----------------------------------------------------------------------
//Function which contains and load the parameters of the bulk_entry selectpicker
function bulk_edit_selecpicker_parameters() {
	//Declare the field as a selectpicker with the following options
	$("#bulk_edit_select").selectpicker({
		//Size before apparition of the scrollbar
		size: 18,
		//Activate the search field
		liveSearch: true,
		//Show select all/deselect all
		actionsBox: true,
		//Show tick symbol close to the selected option
		showTick: true,
		
		//If more than a certain number of selected option --> write the number of selected options into the select
		selectedTextFormat: 'count > 4',
		//Set the container as body to avoid selectpicker to be cut by the scroll
		container: 'body',
		
		maxOptions: 10,
		maxOptionsText: "You cannot select more than 10 options."
	});
}


//----------------------------------------------------------------------
//Function which load the bulk edit display
function bulk_edit_display() {
	
	//Create an empty options array
	var options = [];
				
	//Clone all the values the overall select into the option array
	$("#overall_select option").each(function() {
		
		//Get the option, add underscore and lowercase
		var option_unformated = ($(this).text()).replace(/ /g, "_").toLowerCase();
		
		//Create an option
		var option = '<option value="' + option_unformated + '">' + ($(this).text()) + '</option>';

		//Push the newly created option into the options array
		options.push(option);
	});
	
	//Refresh the field to add the new options (the options array)
	$("#bulk_edit_select").append(options.join('')).selectpicker('refresh');
}