function keep_alive(){
	tid = setInterval(function(){
		console.log('keep alive')
		$.ajax({
			url: get_command_url(''),
			method : 'POST',
			success : midi_success,
			error : function(xhr, status, error){clearInterval(tid); midi_failure(xhr, status, error)}
		})
	}, 100)
}

function add_widget(){ //add the container, create_widget actually creats it.
	widget_type = $(".widget_select").val()
	if (widget_type != null){
		widget_container = document.createElement("div")
		widget_id = $(".widget_container").length
		while ($("#widget" + widget_id).length > 0){
			widget_id++
		}
		widget_container.id = "widget" + widget_id
		widget_order = widget_id + 1
		widget_container.className = "widget_container col order-"+widget_order
		widget_container.setAttribute("data-widget-type", widget_type)
		$(".setup_container").append(widget_container)
		create_widget(widget_container)
	}
}

function save_setup(){
	num_widgets = $(".widget_container").length
	if (num_widgets > 0){
		setup_name = $("#setup_name").val()
		setup_content = $(".setup_container").first().html()
		$.ajax({
			url: get_setup_url(setup_name),
			data: {'content' : setup_content},
			method: 'POST',
			success: function(){
				alert('Setup Saved!')
			},
			error: function(){
				alert('Save Failed..')
			}
		})
	}
	else{
		alert('Empty Setup..')
	}
}

function load_setup(){
	$(".setup_container").html() == ''
	setup_name = $("#setup_select").val()
	$(".setup_container").load(get_setup_url(setup_name), function(){
		for (widget of $('.widget')){
			enable_widget(widget)
		}
	})
}

function init_controller(){
	init_port_select()
	load_options(".widget_select", widgets_url)
	load_options('.setup_select', setups_url)
	//keep_alive()
}