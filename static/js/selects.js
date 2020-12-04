function load_options(jquery_selector, api_url){
	for (select of $(jquery_selector)){
		$.ajax({url : api_url, 
				success: function(options){
					for (option of options){
						_load_option(jquery_selector, option)
					}
				}	
		})
	}
}

function _load_option(jquery_selector, option){
	for (select of $(jquery_selector)){
		option_element = document.createElement("option")
		option_element.innerText = option
		option_element.value = option
		select.append(option_element)
	}
}

function init_port_select(){
	load_options("#port_select", ports_url)
	$(".com_port_ext").hide()
	
	$("#port_select").change(function(){
		if (this.value == "COM"){
			console.log($(".com_port_ext"))
			$(".com_port_ext").show()
			$(".com_port_ext > input").attr("required", true)
		}
		else {
			$(".com_port_ext").hide()
			$(".com_port_ext > input").attr("required", false)
		}
	})

	$("#com_port").change(function(){
		let port_num = this.value
		$("#com_option")[0].value = "COM" + port_num
	})
}

