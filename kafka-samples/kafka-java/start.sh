#!/bin/bash

MAIN_CLASS=${MAIN_CLASS:-com.davra.kafkasample.Main}
PROCESS_ARGS=${PROCESS_ARGS:-1}
MAX_HEAP_MB=${MAX_HEAP_MB:-128}

ls /etc/davra/tls

java -server -Xmx${MAX_HEAP_MB}m -Xdebug -Xrunjdwp:transport=dt_socket,address=5555,server=y,suspend=n -cp target/kafka-sample-1.0.0-jar-with-dependencies.jar:target/kafka-sample-1.0.0-tests.jar $MAIN_CLASS $PROCESS_ARGS

if [ -f /.davra.debug ] ; then 
    tail -f /dev/null 
fi