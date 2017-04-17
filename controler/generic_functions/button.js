//-----------------------------------------------------------------------------------------
//Fonction which create the button (pass the button name with _ and lowercase, the glyphycon, the color, the place in which to append and the visibility)
function get_button(button_name, glyphicon, color, append_place, visibility) {
	var span = document.createElement("span");
	span.className = "btn btn-" + color;
	span.id = button_name + "_button";
	
	if(visibility == "invisible") {
		span.style.display = "none";
	}
		
	var i = document.createElement("i");
	i.className = "glyphicon glyphicon-" + glyphicon;
	
	//Style the button name
	button_name = (button_name.replace(/_/g, ' '));
	button_name = button_name.substr(0,1).toUpperCase() + button_name.substr(1);
	var span2 = document.createElement("span");
	span2.innerHTML = button_name;
	
	span.append(i);
	span.append(span2);
	$('#' + append_place).append(span);
}