var baseUrl = 'http://52.74.21.190/';
var gatewaysCache = null;

$(document).ready(function() {

  loadCarparks();

});

function loadCarparks() {

  $( ".navlinks" ).removeClass("selected");
  $( "#navlink-carparks" ).addClass("selected");
  $( "#main-container" ).load( "include-carparks.html", function() {

	  /**
	   * Show data
	   */
	  $.ajax({
	      url: baseUrl + 'api/devicemanager/getAllGatewaysWithLotsInformation',
	      data: {
	          format: 'json'
	      },
	      error: function(xhr, status, error) {
	          $('#message').html("An error occured");
	       },
	      success: function(data) {
	        console.log(data);
	          var count = 0;
	          data = eval(data);
	          gatewaysCache = data;

	          $.each(data, function(key,value){
	              count++;
	              if (value._id != null) {
		              var dataHtml = "<tr class=\"clickable\" onClick=\"loadCarparkDetails("+key+")\" data-url=\"activities.html\">";
		              dataHtml += "<td>"+value.name+"</td>";
		              dataHtml += "<td>"+value.gatways.length+"</td>";
		              var countGateWays = 0;
		              var countLots = 0;
	      	          $.each(value.gatways, function(key,value){
	      	          	countLots += value.lots.length;
	      	          });
		              dataHtml += "<td>"+countLots+"</td>";
		              dataHtml += "</tr>";
		          }

	              $("#carparks-table > tbody").append(dataHtml);
	          });

	          $('#message').html(count + ' rows fetched successfully');
	      },
	      type: 'GET'
	  });

	  /**
	   * Add new carpark
	   */
	  $("#add-carpark-form").submit(function(event) {

	  	event.preventDefault(); //STOP default action

		$('.form-control').attr('disabled', 'disabled');
        $('#add-carpark-form-btn-close').css('display', 'none');
        $('#add-carpark-form-btn-add').html('<span class="glyphicon glyphicon-refresh spinning"></span> Adding...');

	    var postData = $(this).serializeArray();
	    $.ajax({
	        url : baseUrl + 'api/devicemanager/addCarpark',
	        type: "POST",
	        data : postData,
	        success:function(data, textStatus, jqXHR) {
		        $('#add-carpark-form-btn-add').html('<span class="glyphicon glyphicon-ok"></span> Added Successfully!');
	        },
	        error: function(jqXHR, textStatus, errorThrown) {
				$('.form-control').removeAttr('disabled');
		        $('#add-carpark-form-btn-close').css('display', 'inline');
		        $('#add-carpark-form-btn-add').html('Add');
	        }
	    });
	  });
  });
}

function loadCarparkDetails(carparkIndex) {

  $( "#main-container" ).load( "include-carparks-details.html", function() {
	  
	  var carPark = gatewaysCache[carparkIndex];
	  $( "#carparks-details-name" ).html(carPark.name);

	  var gatewayCount = 0;
	  var dataHtml = "";
	  console.log(carPark);
	  $.each(carPark.gatways, function(keyGateway,valueGateway){	
	  	  gatewayCount++;            
	  	  dataHtml += "<tr class=\"clickable\" onClick=\"loadGatewayDetails("+carparkIndex+", "+keyGateway+")\">" +
		                "<td class=\"col-xs-10\">Gateway "+gatewayCount+"</td>" +
		                "<td class=\"col-xs-2\">"+valueGateway.lots.length+" sensors</td>" +
		              "</tr>";
	  });

      $( "#carparks-details-table" ).append(dataHtml);
  });
}

function loadGateways() {

  $( ".navlinks" ).removeClass("selected");
  $( "#navlink-gateways" ).addClass("selected");
  $( "#main-container" ).load( "include-gateways.html", function() {

	  /**
	   * Show data
	   */
  	  var count = 0;
      $.each(gatewaysCache, function(key,value){
          count++;

          var dataHtml = "<div class=\"row\">" +
			        "<div class=\"col-xs-12\">" +
			          "<div class=\"col-xs-11\">" +
			            "<h4 class=\"blue\">"+value.name+"</h4>" +
			          "</div>";
		  if (value._id != null) {
		  dataHtml += "<div class=\"col-xs-1\">" +
						"<button type=\"button\" class=\"btn btn-info btn-sm\" data-toggle=\"modal\" onClick=\"showAddGatewayToCarkparkModal("+value._id+")\">" +
            			  "<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Add New" +
          				"</button>"+
			          "</div>";
	      }
		  dataHtml += "<div class=\"col-xs-12\">" +
			          "<table class=\"table table-hover\">" +
			            "<tbody>";
      	  var gatewayCount = 0;
		  $.each(value.gatways, function(keyGateway,valueGateway){	
		  	  gatewayCount++;            
		  	  dataHtml += "<tr class=\"clickable\" onClick=\"loadGatewayDetails("+key+", "+keyGateway+")\">" +
			                "<td class=\"col-xs-10\">Gateway "+gatewayCount+"</td>" +
			                "<td class=\"col-xs-2\">"+valueGateway.lots.length+" sensors</td>" +
			              "</tr>";
          });
		  dataHtml += 	"</tbody>" +
			          "</table>" +
			          "</div>" +
			        "</div>" +
			      "</div>" +
			    "</div>" +
			    "<br />";
          
          $("#include-gateway-data").append(dataHtml);
      });

      $('#message').html(count + ' rows fetched successfully');
  });
}

function showAddGatewayToCarkparkModal(carparkId) {
	$('#add-gateway-carparkid').html(carparkId);
	$("#carParkId").val(carparkId);

	$('#add-gateway-model').modal('show');

	/**
	* Add new gateway to carpark
	*/
	$("#add-gateway-form").submit(function(event) {

		event.preventDefault(); //STOP default action

		$('.form-control').attr('disabled', 'disabled');
		$('#add-gateway-form-btn-close').css('display', 'none');
		$('#add-gateway-form-btn-add').html('<span class="glyphicon glyphicon-refresh spinning"></span> Adding...');

		var postData = $(this).serializeArray();
		$.ajax({
		    url : baseUrl + 'api/devicemanager/addGatewayToCarpark',
		    type: "POST",
		    data : postData,
		    success:function(data, textStatus, jqXHR) {
		        $('#add-gateway-form-btn-add').html('<span class="glyphicon glyphicon-ok"></span> Added Successfully!');
		    },
		    error: function(jqXHR, textStatus, errorThrown) {
				$('.form-control').removeAttr('disabled');
		        $('#add-gateway-form-btn-close').css('display', 'inline');
		        $('#add-gateway-form-btn-add').html('Add');
		    }
		});
	});
}

function addGatewayToCarkpark(carparkId) {
}

function loadGatewayDetails(carparkIndex, gatwayIndex) {

  $( "#main-container" ).load( "include-gateway-details.html", function() {
	  
	  var carPark = gatewaysCache[carparkIndex];
	  var gateWay = carPark.gatways[gatwayIndex];
	  var firstLot = gateWay.lots[0];
	  console.log(gateWay);

	  $( "#gateway-detail-carpark-name" ).html(carPark.name);
	  $( "#gateway-detail-gateway-no" ).html("Gateway " + (gatwayIndex+1));
	  $( "#gateway-detail-gateway-firmware-no" ).html(firstLot.firmwareVersion);
	  $( "#gateway-detail-coordinator-firmware-no" ).html(firstLot.CoordinatorMacID);
	  $( "#gateway-detail-ip-address" ).html(firstLot.ip_address);
	  $( "#gateway-detail-mac-address" ).html(firstLot.LotMacID);
	  $( "#gateway-detail-status" ).html("Not connected");
	  
	  var lotCount = 0;
	  var dataHtml = "";
	  $.each(gateWay.lots, function(keyLots,valueLots){	
	  	  lotCount++;            
	  	  dataHtml += "<tr class=\"clickable\" onClick=\"loadSensorDetails("+carparkIndex+", "+gatwayIndex+", "+keyLots+")\">" +
		                "<td class=\"col-xs-2\">Status: "+valueLots.state+"</td>" +
		                "<td class=\"col-xs-4\">Sensor "+lotCount+"</td>" +
		                "<td class=\"col-xs-4\">"+valueLots.CoordinatorMacID+"</td>" +
		                "<td class=\"col-xs-4\">"+valueLots.lot_num+"</td>" +
		              "</tr>";
	  });

      $( "#gateway-details-table" ).append(dataHtml);
  });
}

function loadSensorDetails(carparkIndex, gatwayIndex, sensorIndex) {

  $( "#main-container" ).load( "include-sensor-details.html", function() {
	  
	  var carPark = gatewaysCache[carparkIndex];
	  var gateWay = carPark.gatways[gatwayIndex];
	  var sensor = gateWay.lots[sensorIndex];
	  console.log(sensor);

	  $( "#sensor-detail-carpark-name" ).html(carPark.name);
	  $( "#sensor-detail-gateway-no" ).html("Gateway " + (gatwayIndex+1));
	  $( "#sensor-detail-sensor-no" ).html("Sensor " + (sensorIndex+1));
	  $( "#sensor-detail-sensor-lotid" ).html(sensor.lot_num);

	  $( "#sensor-detail-gateway-firmware-no" ).html(sensor.firmwareVersion);
	  $( "#sensor-detail-mac-address" ).html(sensor.LotMacID);
	  $( "#sensor-detail-battery" ).html("75%");

	  $( "#sensor-detail-status" ).html("Occupied");
	  $( "#sensor-detail-lock" ).html("Open");
  });
}