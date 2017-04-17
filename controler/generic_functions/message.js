//Create a message in the page (error, success...) with a certain time (in seconds)
//Prerequisite : to have a special div into the html/php page where the message will appear
// DIV code : <div id="alert_message"></div>
function CreateMessage(color, message, entrance_time, fixed_time, exit_time) {
	var new_div = document.createElement("div");
	new_div.id = "alert";
	
	//color management (easier to use)
	if (color == "red") {
		new_div.className = "alert alert-danger fade in";
	}
	else if (color == "yellow") {
		new_div.className = "alert alert-warning fade in";
	}
	else if (color == "green") {
		new_div.className = "alert alert-success fade in";
	}
	else {
		new_div.className = "alert alert-info fade in";
	}
	
	//Create the closing cross (on the top left)
	var new_link = document.createElement("a");
	new_link.id = "close_alert";
	new_link.href = "#";
	new_link.className = "close glyphicon glyphicon-remove";
	new_link.style.fontSize = "small";

		
	$("#alert_message").append(new_div);
	$("#alert").append(new_link);	
	$("#alert").append(message);
	$("#alert").hide();
	
	//Fade in effect duration
	entrance_time = entrance_time*1000;
	//Fade out effect duration
	exit_time = exit_time*1000;
	//Time it stays (needed in case of automatic disappearing) 
	fixed_time = fixed_time*1000;
	
	//Show the message
	$("#alert").slideDown(entrance_time);	
	
	//On click on the closing cross, hide it.
	$( "#close_alert" ).click(function() {
		$("#alert").slideUp(exit_time);
	});
	
	
	//Automatic hiding after a certain time 
	/*setTimeout(function(){
			$("#alert").slideUp(exit_time);
	}, fixed_time);*/
	
}


function DeleteMessage() {
	$("#alert").remove();
}
