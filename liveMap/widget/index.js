function createWebSocket( path ){

    var target = null;
    console.dir(window.location.protocol);
    if (window.location.protocol == 'http:') {
        target = 'ws://' + window.location.host + path;
    } else {
        target = 'wss://' + window.location.host + path;
    }
    
    var ws = null;
    if ('WebSocket' in window) {
        ws = new WebSocket(target);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(target);
    } else {
        console.warn('WebSocket is not supported by this browser.');
    }
    return ws;
}

var OCCUPIED_COLOUR = "#aec7e8";
var VACANT_COLOUR = "#0265ff";
var OUT_OF_SERVICE_COLOUR = "#c03b2b";

var map = null;
var bays = {};
var utrs = {};


function loadDevices(cb){
        $.ajax("/api/v1/devices", {
        dataType: "json",
        success: function(data, status, xhr){
            console.dir(data);

            _.each(data.records, function(_device){
                utrs[_device.UUID] = {
                    utr: _device
                };
            });
            
            _.each(data.records, function(_device){
                
                var marker = new google.maps.Marker({
                    map: map,
                    title: _device.name,
                    position: new google.maps.LatLng(_device.latitude, _device.longitude)
                });
            
                
                utrs[_device.UUID].marker = marker;
            });
            cb(null, utrs);
        }
    });

}


// When jQuery has loaded
$(function() {  
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: 47.40216543987909, lng: 8.485813290626595}
      });
      map.addListener("bounds_changed", e => {
          //console.dir(map.getBounds());
          
      });
        
    
    loadDevices((err, devices) => {});
    initFeed();
});


function initFeed(){
    var ws = createWebSocket("/microservices/iotdata-stream");
    ws.onmessage = function(e){
        //console.dir(e);
        var event = JSON.parse(e.data);
        event.UUID = event.tags.UUID || event.UUID;
        

        var utr = null;

        if(event.latitude && event.longitude){
            utr = utrs[event.UUID];
            if(utr && utr.marker){
                utr.utr.latitude = event.latitude;
                utr.utr.longitude = event.longitude;
                utr.marker.setPosition(new google.maps.LatLng(utr.utr.latitude, utr.utr.longitude));
            }
        }
    };
    
    ws.onclose = function(e){
        console.log("Websocket closed... reopening");
        initFeed();
    };
    
    ws.onerror = function(e){
        console.error("Websocket error: ");
        console.dir(e);
    }
}
