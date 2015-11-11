var baseUrl = 'http://52.74.21.190/';
var gatewaysCache = null;

$(document).ready(function() {

  	var action = $.urlParam('action');
  	var refresh = localStorage.getItem('refresh');
	gatewaysCache = JSON.parse(localStorage.getItem('gatewaysCache'));
	if (!gatewaysCache || !action || refresh) {
	  localStorage.removeItem('refresh');
	  $.ajax({
	      url: baseUrl + 'api/devicemanager/getAllGatewaysWithLotsInformation',
	      data: {
	          format: 'json'
	      },
	      error: function(e) {
	      },
	      success: function(data) {
	          console.log(data);
	          data = eval(data);
	          gatewaysCache = data;
	          localStorage.setItem('gatewaysCache', JSON.stringify(data));
			  
			  processRequest(action);
	      },
	      type: 'GET'
	  });		
	} else {
		processRequest(action);
	}
});

function processRequest(action) {
  	if (action == 'loadCarparkDetails') {
  		loadCarparkDetails($.urlParam('carparkIndex'));
  	} else if (action == 'loadGateways') {
  		loadGateways();
  	} else if (action == 'loadGatewayDetails') {
  		loadGatewayDetails($.urlParam('carparkIndex'), $.urlParam('keyGateway'));
  	} else if (action == 'loadSensorDetails') {
  		loadSensorDetails($.urlParam('carparkIndex'), $.urlParam('gatwayIndex'), $.urlParam('sensorIndex'));
  	} else {
  		loadCarparks();  	
	}	
}

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function openUrl(url) {
	location.href = url;
}

function loadCarparks() {

  $( ".navlinks" ).removeClass("selected");
  $( "#navlink-carparks" ).addClass("selected");
  $( "#main-container" ).load( "include-carparks.html?" + (new Date()).getTime(), function() {

      var count = 0;
      $.each(gatewaysCache, function(key,value){
          count++;
          if (value._id != null) {
              var dataHtml = "<tr class=\"clickable\" onClick=\"openUrl('index.html?action=loadCarparkDetails&carparkIndex="+key+"')\" data-url=\"activities.html\">";
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

	  /**
	   * Add new carpark
	   */
	  $("#add-carpark-form").submit(function(event) {

	  	event.preventDefault(); //STOP default action

	  	//get the data first
	    var postData = $(this).serializeArray();
		console.log(postData);

		$('.form-control').attr('disabled', 'disabled');
		$('#server-error').css('display', 'none');
        $('#add-carpark-form-btn-close').css('display', 'none');
        $('#add-carpark-form-btn-add').html('<span class="glyphicon glyphicon-refresh spinning"></span> Adding...');

	    $.ajax({
	        url : baseUrl + 'api/devicemanager/addCarpark',
	        type: "POST",
	        data : postData,
	        success:function(data, textStatus, jqXHR) {
		        $('#add-carpark-form-btn-add').html('<span class="glyphicon glyphicon-ok"></span> Added Successfully!');
				refreshAndreload();
	        },
	        error: function(e) {
    			var error = e.responseJSON.error;
				$('#server-error').css('display', 'block');
				$('#server-error').html('Server error: ' + error);
				$('.form-control').removeAttr('disabled');
		        $('#add-carpark-form-btn-close').css('display', 'inline');
		        $('#add-carpark-form-btn-add').html('Add');
	        }
	    });
	  });
  });
}

function loadCarparkDetails(carparkIndex) {

  $( "#main-container" ).load( "include-carparks-details.html?" + (new Date()).getTime(), function() {
	  
	  console.log(gatewaysCache);
	  var carPark = gatewaysCache[carparkIndex];
	  $( "#carparks-details-name" ).html(carPark.name);

	  var gatewayCount = 0;
	  var dataHtml = "";
	  console.log(carPark);
	  $.each(carPark.gatways, function(keyGateway,valueGateway){	
	  	  gatewayCount++;            
	  	  dataHtml += "<tr class=\"clickable\" onClick=\"openUrl('index.html?action=loadGatewayDetails&carparkIndex="+carparkIndex+"&keyGateway="+keyGateway+"')\">" +
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
  $( "#main-container" ).load( "include-gateways.html?" + (new Date()).getTime(), function() {

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
		  	  dataHtml += "<tr class=\"clickable\" onClick=\"openUrl('index.html?action=loadGatewayDetails&carparkIndex="+key+"&keyGateway="+keyGateway+"')\">" +
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

		//get the data
		var postData = $(this).serializeArray();
		console.log(postData);

		$('.form-control').attr('disabled', 'disabled');
		$('#server-error').css('display', 'none');
		$('#add-gateway-form-btn-close').css('display', 'none');
		$('#add-gateway-form-btn-add').html('<span class="glyphicon glyphicon-refresh spinning"></span> Adding...');

		$.ajax({
		    url : baseUrl + 'api/devicemanager/addGatewayToCarpark',
		    type: "POST",
		    data : postData,
		    success:function(data, textStatus, jqXHR) {
		        $('#add-gateway-form-btn-add').html('<span class="glyphicon glyphicon-ok"></span> Added Successfully!');
				refreshAndreload();
		    },
		    error: function(e) {
    			var error = e.responseJSON.error;
				$('#server-error').css('display', 'block');
				$('#server-error').html('Server error: ' + error);
				$('.form-control').removeAttr('disabled');
		        $('#add-gateway-form-btn-close').css('display', 'inline');
		        $('#add-gateway-form-btn-add').html('Add');
		    }
		});
	});
}

function loadGatewayDetails(carparkIndex, gatwayIndex) {

  $( "#main-container" ).load( "include-gateway-details.html?" + (new Date()).getTime(), function() {
	  
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

	  var rebootBtnHtml = "<button id=\"gateway-detail-reboot-all-lots\" type=\"button\" class=\"btn btn-info btn-sm pull-right\" data-toggle=\"modal\" onClick=\"rebootAllLots('"+gateWay.gatewayId+"')\">" +
				            "<span class=\"glyphicon glyphicon-repeat\" aria-hidden=\"true\"></span> Reboot All Lots" +
				          "</button>";
      $( "#gateway-detail-reboot-all-lots-div" ).append(rebootBtnHtml);

	  var addBtnHtml = "<button type=\"button\" class=\"btn btn-info btn-sm pull-right\" data-toggle=\"modal\" onClick=\"showAddLotToGatewayModal("+carparkIndex+", "+gatwayIndex+")\">" +
				            "<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Add New Lot" +
				          "</button>";
      $( "#gateway-details-add-lot" ).append(addBtnHtml);
	  
	  var lotCount = 0;
	  var dataHtml = "";
	  $.each(gateWay.lots, function(keyLots,valueLots){	
	  	  lotCount++;
	  	  dataHtml += "<tr class=\"clickable\" onClick=\"openUrl('index.html?action=loadSensorDetails&carparkIndex="+carparkIndex+"&gatwayIndex="+gatwayIndex+"&sensorIndex="+keyLots+"')\">" +
		                "<td class=\"col-xs-2\">Status: "+valueLots.state+"</td>" +
		                "<td class=\"col-xs-4\">Sensor "+lotCount+"</td>" +
		                "<td class=\"col-xs-4\">"+valueLots.CoordinatorMacID+"</td>" +
		                "<td class=\"col-xs-4\">"+valueLots.lotId+"</td>" +
		              "</tr>";
	  });

      $( "#gateway-details-table" ).append(dataHtml);
  });
}

function showAddLotToGatewayModal(carparkIndex, gatwayIndex) {

	var carPark = gatewaysCache[carparkIndex];
	var gateWay = carPark.gatways[gatwayIndex];

	$('#add-lot-gatewayid').html(gateWay.gatewayId);
	$("#carParkId").val(carPark._id);
	$("#CoordinatorMacID").val(gateWay.gatewayId);

	$('#add-lot-model').modal('show');

	/**
	* Add new gateway to carpark
	*/
	$("#add-lot-form").submit(function(event) {

		event.preventDefault(); //STOP default action

		//get the data
		var postData = $(this).serializeArray();
		console.log(postData);

		$('.form-control').attr('disabled', 'disabled');
		$('#server-error').css('display', 'none');
		$('#add-lot-form-btn-close').css('display', 'none');
		$('#add-lot-form-btn-add').html('<span class="glyphicon glyphicon-refresh spinning"></span> Adding...');

		$.ajax({
		    url : baseUrl + 'api/devicemanager/addLotToCarpark',
		    type: "POST",
		    data : postData,
		    success:function(data, textStatus, jqXHR) {
		        $('#add-lot-form-btn-add').html('<span class="glyphicon glyphicon-ok"></span> Added Successfully!');
				refreshAndreload();
		    },
		    error: function(e) {
    			var error = e.responseJSON.error;
				$('#server-error').css('display', 'block');
				$('#server-error').html('Server error: ' + error);
				$('.form-control').removeAttr('disabled');
		        $('#add-lot-form-btn-close').css('display', 'inline');
		        $('#add-lot-form-btn-add').html('Add');
		    }
		});
	});
}

function rebootAllLots(coordinatorId) {

	console.log(coordinatorId);
	$('#gateway-detail-reboot-all-lots').html('<span class="glyphicon glyphicon-refresh spinning"></span> Rebooting...');
	$('#gateway-detail-reboot-all-lots').attr('disabled', 'disabled');

	/**
	* Reboot all lots
	*/
	$.ajax({
	    url : baseUrl + 'api/command/addNewCommand',
	    type: "POST",
	    data : "coordinatorId="+coordinatorId+"&type=1",
	    success:function(data, textStatus, jqXHR) {
	        $('#gateway-detail-reboot-all-lots').html('<span class="glyphicon glyphicon-ok"></span> Rebooted Successfully!');
			refreshAndreload();
	    },
	    error: function(e) {
	        $('#gateway-detail-reboot-all-lots').html('<span class="glyphicon glyphicon-repeat" aria-hidden="true"></span> Reboot All Lots');
			$('#gateway-detail-reboot-all-lots').removeAttr('disabled');
	    }
	});
}

function rebootLot(coordinatorId, lotId) {

	console.log(coordinatorId);
	console.log(lotId);
	$('#lot-detail-reboot-lot').html('<span class="glyphicon glyphicon-refresh spinning"></span> Rebooting...');
	$('#lot-detail-reboot-lot').attr('disabled', 'disabled');

	/**
	* Reboot all lots
	*/
	$.ajax({
	    url : baseUrl + 'api/command/addNewCommand',
	    type: "POST",
	    data : "coordinatorId="+coordinatorId+"&type=2&lot="+lotId,
	    success:function(data, textStatus, jqXHR) {
	        $('#lot-detail-reboot-lot').html('<span class="glyphicon glyphicon-ok"></span> Rebooted Successfully!');
			refreshAndreload();
	    },
	    error: function(e) {
	        $('#lot-detail-reboot-lot').html('<span class="glyphicon glyphicon-repeat" aria-hidden="true"></span> Reboot Lot');
			$('#lot-detail-reboot-lot').removeAttr('disabled');
	    }
	});
}

function lockLot(coordinatorId, lotId) {

	console.log(coordinatorId);
	console.log(lotId);
	$('#lot-detail-lock-unlock').html('<span class="glyphicon glyphicon-refresh spinning"></span> Locking...');
	$('#lot-detail-lock-unlock').attr('disabled', 'disabled');

	/**
	* Reboot all lots
	*/
	$.ajax({
	    url : baseUrl + 'api/command/addNewCommand',
	    type: "POST",
	    data : "coordinatorId="+coordinatorId+"&type=3&lot="+lotId,
	    success:function(data, textStatus, jqXHR) {
	        $('#lot-detail-reboot-lot').html('<span class="glyphicon glyphicon-ok"></span> Locked Successfully!');
			refreshAndreload();
	    },
	    error: function(e) {
	        $('#lot-detail-lock-unlock').html('<span class="glyphicon glyphicon-lock" aria-hidden="true"></span> Lock');
			$('#lot-detail-lock-unlock').removeAttr('disabled');
	    }
	});
}

function unlockLot(coordinatorId, lotId) {

	console.log(coordinatorId);
	console.log(lotId);
	$('#lot-detail-lock-unlock').html('<span class="glyphicon glyphicon-refresh spinning"></span> Unlocking...');
	$('#lot-detail-lock-unlock').attr('disabled', 'disabled');

	/**
	* Reboot all lots
	*/
	$.ajax({
	    url : baseUrl + 'api/command/addNewCommand',
	    type: "POST",
	    data : "coordinatorId="+coordinatorId+"&type=4&lot="+lotId,
	    success:function(data, textStatus, jqXHR) {
	        $('#lot-detail-lock-unlock').html('<span class="glyphicon glyphicon-ok"></span> Unlocked Successfully!');
			refreshAndreload();
	    },
	    error: function(e) {
	        $('#lot-detail-lock-unlock').html('<span class="glyphicon glyphicon-lock" aria-hidden="true"></span> Unlock');
			$('#lot-detail-lock-unlock').removeAttr('disabled');
	    }
	});
}

function loadSensorDetails(carparkIndex, gatwayIndex, sensorIndex) {

  $( "#main-container" ).load( "include-sensor-details.html?" + (new Date()).getTime(), function() {
	  
	  var carPark = gatewaysCache[carparkIndex];
	  var gateWay = carPark.gatways[gatwayIndex];
	  var sensor = gateWay.lots[sensorIndex];
	  console.log(sensor);

	  $( "#sensor-detail-carpark-name" ).html(carPark.name);
	  $( "#sensor-detail-gateway-no" ).html("Gateway " + (gatwayIndex+1));
	  $( "#sensor-detail-sensor-no" ).html("Sensor " + (sensorIndex+1));
	  $( "#sensor-detail-sensor-lotid" ).html(sensor.lotId);

	  $( "#sensor-detail-gateway-firmware-no" ).html(sensor.firmwareVersion);
	  $( "#sensor-detail-mac-address" ).html(sensor.LotMacID);
	  $( "#sensor-detail-battery" ).html("75%");

	  if (sensor.state == 0) {
	  	$( "#sensor-detail-status" ).html("Free");
	  } else if (sensor.state == 1) {
	  	$( "#sensor-detail-status" ).html("Occupied");
	  } else if (sensor.state == 2) {
	  	$( "#sensor-detail-status" ).html("Locked");
	  } else if (sensor.state == 3) {
	  	$( "#sensor-detail-status" ).html("Unlocked");
	  }

	  $( "#sensor-detail-lock" ).html("Open");

	  var rebootBtnHtml = "<button id=\"lot-detail-reboot-lot\" type=\"button\" class=\"btn btn-info btn-sm pull-right\" data-toggle=\"modal\" onClick=\"rebootLot('"+gateWay.gatewayId+"', '"+sensor.lotId+"')\">" +
				            "<span class=\"glyphicon glyphicon-repeat\" aria-hidden=\"true\"></span> Reboot Lot" +
				          "</button>";
      $( "#lot-detail-reboot-lot-div" ).append(rebootBtnHtml);

      if (sensor.state == 2) {
		  var lockBtnHtml = "<button id=\"lot-detail-lock-unlock\" type=\"button\" class=\"btn btn-info btn-sm pull-right\" data-toggle=\"modal\" onClick=\"unlockLot('"+gateWay.gatewayId+"', '"+sensor.lotId+"')\">" +
					            "<span class=\"glyphicon glyphicon-lock\" aria-hidden=\"true\"></span> Unlock" +
					          "</button>";
	      $( "#lot-detail-lock-unlock-div" ).append(lockBtnHtml);

      } else {
		  var unlockBtnHtml = "<button id=\"lot-detail-lock-unlock\" type=\"button\" class=\"btn btn-info btn-sm pull-right\" data-toggle=\"modal\" onClick=\"lockLot('"+gateWay.gatewayId+"', '"+sensor.lotId+"')\">" +
						            "<span class=\"glyphicon glyphicon-lock\" aria-hidden=\"true\"></span> Lock" +
						          "</button>";
	      $( "#lot-detail-lock-unlock-div" ).append(unlockBtnHtml);      	
      }
  });
}

function refreshAndreload() {
	localStorage.setItem('refresh', true);
	localStorage.removeItem('gatewaysCache');
	setTimeout(function(){
	   window.location.reload(1);
	}, 1500);
}