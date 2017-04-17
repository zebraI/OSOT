//delete the table depending of the parameters : table_name, and the part to remove
// (head, body, both)

function delete_table(table_name, part_to_delete) {
	
	if ((part_to_delete == "head") || (part_to_delete == "both")) {
		$("#" + table_name + " thead tr").remove();
	}
	
	if ((part_to_delete == "body") || (part_to_delete == "both")) {
		$("#" + table_name + " tbody tr").remove();
	}
}