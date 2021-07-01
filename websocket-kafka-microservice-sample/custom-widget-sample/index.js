var supercontext;
var chart = null;
var lastTimeStamp;
const deviceUUID = "<Device UUID>";

function connecthingWidgetInit(context) {
    context.filters.subscribe(handleFilterChange);
    supercontext = context; 
    
    var endTime = moment().valueOf(); 
    var startTime = moment().subtract(60, 'minutes').valueOf();
    console.log(endTime); 
    console.log(startTime); 
    supercontext.FilterValues = {}; 
    supercontext.FilterValues.timerange = {};
    supercontext.FilterValues.timerange.startTime = startTime;
    supercontext.FilterValues.timerange.endTime = endTime;
    
    
    widgetUtils.loadWidgetSettings(function(err, widgetConfigData) {
        if(err === undefined || err === null) {
            if(widgetConfigData!==undefined ) {
                //setting loaded configure widget now 
                renderWidget(widgetConfigData) 
                // load initial data 
                queryData(supercontext.FilterValues) 
                
                // set up the web socket 
                 initWebSocket()  
            }
        }
    })
}
 
function initWebSocket() {
        let socket = new WebSocket("wss://<tenant>.davra.com/microservices/<microserice name>/");
        socket.onopen = function(e) {
            console.log("Connection established");
        };
             
        socket.onmessage = function(event) { 
            newEvent = JSON.parse(event.data);  
            
            if(newEvent.UUID === deviceUUID){
             chart.addData([{date:newEvent.timestamp, value:newEvent.value}]); 
            }
        };
            
        socket.onclose = function(event) { 
            console.log(`Connection closed cleanly`);
            // connection closed, discard old websocket and create a new one in 5s
            socket = null
            setTimeout(initWebSocket(), 5000)
            
        };
    }


function handleFilterChange(filters) {
    console.log(filters)
    if(filters){
        //filter have been updated you should maybe query new data 
        queryData(filters)
    }
}


function renderWidget(conf){
    // rendert amchart graph
    am4core.ready(function() {

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end
     
        // Create chart instance
        chart = am4core.create("chartdiv", am4charts.XYChart);
        
        // Add data
        chart.data = [];
        
        // Create axes
        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.minGridDistance = 50;
        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

        
        // Create series
        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueY = "value";
        series.dataFields.dateX = "date";
        series.tensionX = 1;
        series.strokeWidth = 2;
        series.name = "Kafka Topic: Memory"
        
        series.bullets.push(new am4charts.CircleBullet());
        series.tooltipText = "{dateX}: [b]{valueY}[/]";
                
        // Add cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.fullWidthLineX = true;
        chart.cursor.xAxis = dateAxis;
        chart.cursor.lineX.strokeWidth = 0;
        chart.cursor.lineX.fill = am4core.color("#000"); 
        chart.cursor.lineX.fillOpacity = 0.1;
        
        // Add scrollbar
        var scrollbar = new am4charts.XYChartScrollbar();
        scrollbar.series.push(series)
        chart.scrollbarX = scrollbar;
        
        chart.legend = new am4charts.Legend();
    
        }); 
}


function queryData(filters){
    // query data and update the chart 
    
   const query = {
            "metrics": [
                {
                "name": "43040_100",
                "limit": 100,
                "tags": {"UUID":deviceUUID},
                "aggregators" : [{name: "avg", sampling: {value: "10", unit: "seconds"}}]  
                } 
            ], 
            "start_absolute": filters.timerange.startTime,
            "end_absolute": filters.timerange.endTime
        }
        
    if(chart){ 
        fetch('/api/v1/timeseriesData', { 
            method: "POST",
            processData: true,
            body: JSON.stringify(query),
            headers: { 
            "Content-type": "application/json",
            },
        })
        .then( function(response) {return response.json()})
        .then(function(res) {
            console.log({res})
            var data = res.queries[0].results[0].values
            
            var formatedData = data.map( function ( datapoint ) {
              return { 
                  date: datapoint[0],
                  value: datapoint[1] 
              }  
              
            })
            
            chart.data = formatedData;
            chart.invalidateRawData();
        })
        
    }
        
}