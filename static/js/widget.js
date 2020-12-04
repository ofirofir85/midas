WIDGET_DEFAULT_VALUES = {
	'value': 64,
	'channel': 0,
	'note': 60,
	'velocity':60,
	'control': 60
}

function get_widget_data(id, to_string=true){
	widget_data = {}
	for (data of $("#" + id + " .widget_data_form").find(".widget_data")){
		widget_data[data.name] = data.value
	}
	if (to_string){
		return JSON.stringify(widget_data)
	}
	else{ 
		return widget_data
	}
}

function edit_widget(target, action){
	target_class = $(target).attr("data-edit-class")
	if (action == 'open'){
		$("#" + target.id + ".edit_widget_bar").hide()
		$("#" + target.id + "." + target_class + "_form").show()
		$("#" + target.id + ".widget").attr("disabled", true)
		$("#" + target.id + ".widget").attr("data-disabled", true)
	}
	else { // action == 'close'
		if (target_class == 'widget_data'){
			widget_data = get_widget_data(target.id, false)
			widget = widget = $("#" + target.id + ".widget")
			widget.val(JSON.stringify(widget_data))	
			set_widget_values(widget, widget_data)
		}
		$("#" + target.id + ".edit_widget_bar").show()
		$("#" + target.id + "." + target_class + "_form").hide()
		$("#" + target.id + ".widget").attr("data-disabled", false)
		$("#" + target.id + ".widget").attr("disabled", false)
	}
}

function create_widget(parent_div){
	widget_type = $(parent_div).data('widget-type')
	widget_id = $(parent_div)[0].id

	$(parent_div).load(
		get_widget_url(widget_type), //url
		{'id': widget_id}, //data
		function(){ //callback 
			$(parent_div).find(".edit_widget_forms > *").hide()
			widget = $(parent_div).find('.widget')
			set_widget_values(widget, WIDGET_DEFAULT_VALUES)
			enable_widget(widget)
			colspan = widget.attr('data-colspan')
			if (colspan == null){colspan = 'col-auto'} //default widget colspan
			$(parent_div).addClass(colspan)
		} 
	)
}

function enable_widget(widget){
	$(widget).attr("data-disabled", false)
	$(widget).on($(widget).data('widget-event'),function() {
		if ($(this).attr('data-disabled') == "false"){
			widget_data = get_widget_data(this.id)
			widget_command = $(this).attr("data-widget-command")
			console.log(widget_command + widget_data)
			$.ajax({
				url : get_command_url(widget_command),
				method : "POST",
				data : widget_data,
				success : midi_success, 
				error: midi_failure
			})
		}
	})
}

function remove_widget(widget){
	$("#" + widget.id + ".widget_container").remove()
}