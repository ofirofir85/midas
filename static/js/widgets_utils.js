function change_widget_label(change_label){
	widget_id = change_label.id
	new_label = change_label.value
	$("#" + widget_id + ".widget_label").text(new_label)
}

function range_value_change(slider){
	$("#" +slider.id +".widget_data_form").find("[name='value']").val(slider.value)
	$(slider).siblings(".range_value_label").text(slider.value)
}

midi_success = function(result){
	console.log('success:' + result)
	$(".midi_status").text('success')
	$(".midi_status").removeClass('text-danger')
	$(".midi_status").addClass('text-success')
}

midi_failure = function (xhr, status, error){
	//alert(error + '\n Please refresh to re-establish your midi connection')
	$(".midi_status").text(error)
	$(".midi_status").addClass('text-danger')
	$(".midi_status").removeClass('text-success')
}

function set_widget_values(widget, widget_values){
	for (widget_data of $("#" + $(widget).attr('id') + ".edit_widget_forms").find(".widget_data")){
		value = widget_values[widget_data.name]
		widget_data.setAttribute("value", value) 
		//not using jquery because needed to ba hard-coded in html for state manament of the widget in the setup
	}
}

function reorder_widget(button, steps){
	widget_container = $('#' + button.id +".widget_container")
	console.log(widget_container)
	for (i = 1; i <= 12; i++){ // i == current_order
		if (widget_container.hasClass('order-'+i)){
			widget_container.removeClass('order-'+i)
			
			new_order = steps + i
			if (new_order < 1){new_order = 1};
			if (new_order > $(".widget").length){new_order = $(".widget").length}

			replaced_container = $(".widget_container.order-"+new_order)
			replaced_container.removeClass('order-'+new_order)

			widget_container.addClass('order-'+new_order)
			replaced_container.addClass('order-'+i)
			break;
		}
	}

 	console.log(widget_container)
 	console.log(replaced_container)
}

function change_widget_class(id, new_class, old_class=null, class_prefix='', target_selector='.widget'){
	target = $("#"+id+target_selector)
	console.log(target)
	if (old_class){
		target.removeClass(class_prefix + old_class)
	}
	if (class_prefix != ''){
		for (className of target[0].classList)
			console.log(className)
	}
}