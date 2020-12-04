function change_slider_size(button_target){
	console.log(button_target)
	new_colspan = button_target.value
	size_buttons = $(".size_buttons")
	id = size_buttons.attr("id")
	widget = $("#"+id+".widget")
	widget_container = $("#"+id+".widget_container")
	old_colspan = widget.attr("data-colspan")

	widget.attr("data-colspan", new_colspan)
	widget_container.removeClass(old_colspan)
	widget_container.addClass(new_colspan)
}