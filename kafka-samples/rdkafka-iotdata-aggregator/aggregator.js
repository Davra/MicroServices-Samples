"use strict";

const util = require("util");
const request = require("request");
var api = require("@connecthing.io/connecthing-api");


var config = {
    DEBUG: false,
    bucket_size: 60 * 60 * 1000,
    metric_suffix: ".hourly.count",
    bucket_ttl: 24 * 60 * 60 * 1000
};


var agg = {};


function processMessage(message){

    if(config.DEBUG){
        console.log(util.inspect(message));
    }
    try{
        var datum = JSON.parse(message.value);

        if(datum.name != "com.davra.metrics.pressure"){
            return;
        }

        if(!datum.tags){
            return;
        }
        

        var timestamp = datum.timestamp ? datum.timestamp : new Date().valueOf();
        var bucket = timestamp - (timestamp % config.bucket_size);
        var key = extractEntryKey(datum);

        if(!agg[key]){
            agg[key] = {};
        }

        if(!agg[key][bucket]){
            agg[key][bucket] = {};
        }
    
        if(!agg[key][bucket][datum.name]){
            agg[key][bucket][datum.name] = 0;
        }

        agg[key][bucket][datum.name]++;
    }
    catch(err){
        console.error("failed to process datum: ", err);
    }
}

/**This is how you group together your aggregates, in this case we make a separate entry per device uuid and company
it can be any string that gives you a unique tuple. It selects a subset of the tags on the datum and concatenates them
separating each with ':' so they can be extracted later*/
function extractEntryKey(datum){
  return datum.tags.UUID + ":" + datum.tags.Customer;
}

/**This is the reverse of extractEntryKey, which splits the cache key by the ':' character and returns
an object giving the tags to be applied to the aggregated data point*/
function extractTags(key){
    let tags = {};
    let comps = key.split(":");
    tags.UUID = comps[0];
    //tags.Customer = comps[1];
    return tags;
}

function doWriteToStore(){
    return writeToStore(agg);
}

function writeToStore(_agg){
    return new Promise((resolve, reject) => {
        
        let iotdata = [];
        let keys = Object.keys(_agg);
        let k = 0;
        
        if(keys.length === 0){
            resolve();
            return;
        }
        
        let startTime = Date.now();
        
        
        function doKey(){
            
            if(k >= keys.length){
                
                let kdbStart = Date.now();
                
                //Write the aggregates to kairosdb
                uploadAggDataToIoTData(iotdata)
                .then(() => {
                    console.log("Updated %d keys and flushed %d datapoints to iotdata", keys.length, iotdata.length);
                    resolve();
                })
                .catch(err => {
                    console.error("Failed to save agg data to kairosdb", err);
                    reject(err);
                });
                
                return;
            }
            
            let key = keys[k++];
            
            let buckets = _agg[key];
            
            let tags = extractTags(key);
            
            Object.keys(buckets).forEach(bucketIndex => {
                let bucket = buckets[bucketIndex];
                
                Object.keys(bucket).forEach(metricName => {
                    
                    iotdata.push({
                        name: metricName + config.metric_suffix,
                        timestamp: parseInt(bucketIndex),
                        msg_type: "datum",
                        UUID: tags.UUID,
                        value: buckets[bucketIndex][metricName]
                    });
                });
            });
            
            //clear out old buckets
            Object.keys(buckets).forEach(bucketIndex => {
                let expireTime = parseInt(bucketIndex) + parseInt(config.bucket_ttl);
                if(expireTime < Date.now()){
                    console.log("Expiring bucket %d", bucketIndex);
                    delete buckets[bucketIndex];
                }
            });
            
            doKey();
            
        }
        doKey();
    });
}

function uploadAggDataToIoTData(data){
    return new Promise((resolve, reject) => {
        
        console.log("Uploading %s", JSON.stringify(data));
        
        api.request({
            url: "http://api.connecthing/api/v1/iotdata", 
            method: "PUT",
            body: JSON.stringify(data)
        }, (err, res, body) => {
            if(err){
                console.error("Failed to upload aggregated action counters to iotdata", err);
                reject(err);
                return;
            }
            
            if(res.statusCode !== 200){
                console.error("Received status code %d from call to upload data to iotdata for aggregated action data:: %o", res.statusCode, data );
                reject(new Error());
                return;
            }
            
            resolve();
        });
    });
}


module.exports = {
    init: function(_config){
        config = Object.assign(config, _config);
    },
    writeToStore: doWriteToStore,
    processMessage: processMessage
};
