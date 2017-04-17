//---------------------------------------------------------------------------------
//Split the URL to get the right parameter (ask the searched parameter to return it)
function split_url(parameter_number) {
	parameter = window.location.search.substring(1);
	parameter = (parameter.split("&"))[parameter_number];
	parameter = (parameter.split("="))[1];
	
	return parameter;
}