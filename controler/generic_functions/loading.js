//---------------------------------------------------------
//Automatic adding of the loading div into the page in hidden mode (to load before loading)
function load_loading() {
	
	var loading_div = document.createElement("div");
	loading_div.id = "loading";
	loading_div.style.display = "none";
	loading_div.style.position = "fixed";
	loading_div.style.zIndex = "1000";
	loading_div.style.top = "0%";
	loading_div.style.left = "0%";
	loading_div.style.height = "100%";
	loading_div.style.width = "100%";
	loading_div.style.background = "rgba(255, 255, 255, .8) url('pictures/loading.gif') 50% 50% no-repeat";

	$(document.body).append(loading_div);
}


//Start/Stop_loading
function toggle_loading() {
        $("#loading").toggle();
}