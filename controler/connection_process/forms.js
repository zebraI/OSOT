//-------------------------------------------------------------------------
//Hash of the password and connexion form
function formhash(password) {

	//If the password isn't empty, launch the sha512 hash with the value of the password field and stock the result in the password field
	if (password.value !== '') {
		password.value = hex_sha512(password.value);
	}		
}


//--------------------------------------------------------------------------
//Hash of the password from the registration form (where form is the form, mail is the user mail,
//password is the password and conf is the confirmation of the password)
function regformhash(form, mail, password, conf) {

	//Remove the last hidden password input if existing
	if ($("#p").length) {
		$("#p").remove();
	}

	//Verify that those fields were completed (if yes, return error and false)
	if ($(mail).val() == '' ||
		$(password).val() == '' ||
		$(conf).val() == '') {
		
		var error = "One or more fields are empty. Please, try again.";
		DeleteMessage();
		CreateMessage("red", error, 0.5, 3, 0.5);
		return false;
	}	

	//Checking of the size of the password and that it contains all the wanted information (if yes, return error and false)
	var mask = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
	if (!mask.test($(password).val())) {
		var error = "The password must contain one digit, one capital letter, one lowercase letter, and, at least, 8 characters. Please, try again.";
		DeleteMessage();
		CreateMessage("red", error, 0.5, 3, 0.5);
		return false;
	}

	
	//Verify that the password is identical to its confirmation (if yes, return error and false)
	if ($(password).val() != $(conf).val()) {
		var error = "The two entered passwords don't match. Please, try again.";
		DeleteMessage();
		CreateMessage("red", error, 0.5, 3, 0.5);
		return false;
	}
	
	//Creation of an hidden input to insert the hashed password into the page and send it to the script
	var p = document.createElement("input");
	p.name = "p";
	p.id = "p";
	p.type = "hidden";

	//Add the input to the form page
	form.append(p);

	//Run the hash script on the password
	p.value = hex_sha512($(password).val());
	
	//Empty the password and the confirmation fields (avoid sending clear password)
	password.value = "";
	conf.value = "";
	return true;
}