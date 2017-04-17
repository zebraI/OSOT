//Auto generate the tabs of data_entry page
function generate_tabs(page_name, thinxtra_site_id) {
	
	//AJAX call to get the page names
	var request = $.ajax({
							type: "POST",
							url: "model/_get_user_groups_pipe.php",
							contentType: "text/xml; charset=utf-8",
							dataType: "json",
							success: OnSuccess,
							error: OnError
	});
	
	//If success, complete the select with the list of sites or display the error message
	function OnSuccess(data,status,request) {
	
		//Remove the underscore and capitalize the page name
		page_name_formated = page_name.replace(/_/g, ' ');
		page_name_formated = page_name_formated.substr(0,1).toUpperCase() + page_name_formated.substr(1);

		// Created the title and the ul
		var h1 = document.createElement("h1");
		h1.innerHTML = "Data entry - " + page_name_formated;
		
		var ul = document.createElement("ul");
		ul.id = "tab_bar"
		ul.className = "nav nav-tabs";
		
			
		//For each couple key-value, create a tab (li) with the key if the key match the user_groups where the user is in
		$.each(data, function(element_key, element_value){
			//Lowercase the element key (just for the comparison --> tab_to_create
			element_key_lowercased = element_key.toLowerCase();

			//Variable that set if the table should be created or not
			var tab_to_create = false;
			
			//If the name of the element is into the user_groups list of the user; turn the tab_to_create variable to true
			for(var i = 0; i < user_groups.length; i++) {
				if (element_key_lowercased == user_groups[i]) {
					tab_to_create = true;
				}
			}
			

			//If the tab_to_create variable is true, create the tab
			if (tab_to_create == true) {
				//Remove underscores and capitalize
				element_key_formated = (element_key.replace(/_/g, ' '));
				element_key_formated = element_key_formated.substr(0,1).toUpperCase() + element_key_formated.substr(1);
				
				//Create the tab with an empty class
				var li = document.createElement("li");
				li.className = "";
				
				//If the tab name is the same as the page name; set this div as the active one
				if (element_key == page_name) {
					li.className = "active";
				}
				
				//If the site name is empty, open a "create" page
				if (thinxtra_site_id == "") {
					thinxtra_site_id += "new";
				}
				
				//If the position value is "right", put the table on the right (special class)
				if (element_value[0] == "right") {
					li.className += " pull-right";
				}
				
				//Create a link displaying the name of the tab/user group
				var a = document.createElement("a");
				a.innerHTML = element_key_formated;
				
				//Create the link into the tab 
				//manage the special bulk entry case, if link column in db isn't empty
				if (JSON.stringify(element_value[1]) !== "{}") {
					a.href = element_value[1];
				}
				//Manage the normal case
				else {
					a.href = "data_entry.php?thinxtra_site_id=" + thinxtra_site_id + "&page=" + element_key;
				}
				
				
				//Put the link into the li and the li into the ul
				li.append(a);
				ul.append(li);
			}
		});
		
		// Depending on the page name, change the form_id
		if (page_name == "bulk_entry") {
			form_id = "#fileupload";
		}
		else {
			form_id = "#data_entry_form";
		}
		
		//Create the div for inserting the messages
		var div = document.createElement("div");
		div.id = "alert_message";
		
		//Insert all before the form (title, ul with tabs, error message panel)
		$(h1).insertBefore(form_id);
		$(ul).insertBefore(form_id);
		$(div).insertBefore(form_id);
	}
	
	//Print error message
	function OnError(request, data, status) {				
		message = "Network problem: XHR didn't work (perhaps, incorrect URL is called).";
		DeleteMessage();
		CreateMessage("red", message, 0.5, 3, 0.5);
	}	
}