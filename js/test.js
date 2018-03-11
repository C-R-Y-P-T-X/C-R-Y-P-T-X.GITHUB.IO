$(document).ready(function() {

    // Информация о текущем соединении
	get_current_bridge();
	
	$('#status').on('click', '.take-break', function(e){
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: "ajax-action.php?action=pushbutton&status=0",
			dataType: "text",
			success: function(response) {
				
			}
		})
	})
	$('#status').on('click', '.to-work', function(e){
		e.preventDefault();
		$.ajax({
			type: "POST",
			url: "ajax-action.php?action=pushbutton&status=1",
			dataType: "text",
			success: function(response) {
				
			}
		})
	})

});

//*************************************
// Информация о текущем соединении
//*************************************
function get_current_bridge() {
		var $current_bridge = document.getElementById("current_bridge");
		$.ajax({
			type: "POST",
			url: "ajax-action.php?action=get_current_bridge",
			dataType: "text",
			success: function(response) {
						response = JSON.parse(response);
						$current_bridge.innerHTML = response.result.context;
						if (response.result.type==1) {							
							//document.location.href = response.result.context;
							// И останавливаю обновление
							clearTimeout(setVar3);
							get_step_form(null,null,response.result.id_eparty,response.result.id_ringing);
							$('#status').html("");
						} else {
						
						var text_line = '';
						var buttons_line = '';
						switch (response.result.status) {
							case "0":
								text_line = 'Онлайн';
								buttons_line = '<a href="#" class="btn btn-success take-break">Запросить перерыв</a>';
								break;
							case "1":
								text_line = 'На перерыве';
								buttons_line = '<a href="#" class="btn btn-success to-work">Продолжить работу</a>';
								break;
							case "2":
								text_line = 'В ожидании перерыва. <font color="red">Продолжайте работу</font>, пока эта строка не исчезнет!';
								buttons_line = '';
								break;
							case "4":
								text_line = 'Переведен на перерыв из-за бездействия';
								buttons_line = '<a href="#" class="btn btn-success to-work">Продолжить работу</a>';
								break;
						}
						
						var text_line = '<p>Статус: <b>' + text_line + '</b></p>';
						$('#status').html(text_line + buttons_line);
						}
			}
		});
}

// Обновление списка активных операторов
setVar3 = setInterval(get_current_bridge, 1000);

// Получение многошаговой формы
function get_step_form(form, button, id_eparty,id_ringing) {
		var data = "";
		if (form!=null) {
			data = form.serialize();
			if (button.value) {
			 data += "&step_form_button="+button.value;
			}
		} else {
	     //alert( id.value );
		 data += "&id_eparty="+id_eparty;
         data += '&id_ringing='+id_ringing;
		 data += '&cc=1';
		}

		$.ajax({
			type: "POST",
			url: "/adm/eparty/regadmin/ajax-action.php?action=get_step_form",
			async: true,
	    	cache: false,
	    	data: data,
	    
			success: function (response) {
				switch (response.result.type) {
					case "form":
						$("#step_form").html(response.result.content);
						$(".step_form_button").unbind("click");
						$(".step_form_button").on('click', function(e) {
							e.preventDefault();
							var form = $(this).closest("form");
							if ((e.target.value!=2) || ($(".step_form_answer").length && $(".step_form_answer:checked").length!=0)) {
								get_step_form(form, e.target);
							} else {
                        		bootbox.alert('Выберите вариант ответа!');
							}
						});
						break;
					case "message":
					    $("#step_form").html(response.result.content);
						break;
					case "redirect":
						document.location.href = response.result.content;
						break;				
				} // switch
			},
			error: function(request,error){
			}
		});
	
}
