
var gatewaysCache = null;

$(document).ready(function() {
  $(".clickable").click(function() {
	alert('aa');
    if ($(this).data().url !== undefined) {
      window.location = $(this).data().url;
    }
  });

  loadCarparks();

});

function loadCarparks() {

  $( ".navlinks" ).removeClass("selected");
  $( "#navlink-carparks" ).addClass("selected");
  $( "#main-container" ).load( "include-carparks.html", function() {
	  $.ajax({
	      url: 'http://52.74.21.190/api/devicemanager/getAllGatewaysWithLotsInformation',
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
  	  var count = 0;
      $.each(gatewaysCache, function(key,value){
          count++;

          var dataHtml = "<div class=\"row\">" +
			        "<div class=\"col-xs-12\">" +
			          "<h4 class=\"blue\">"+value.name+"</h4>" +
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
			    "<br />";
          
          $("#main-container").append(dataHtml);
      });

      $('#message').html(count + ' rows fetched successfully');
  });
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