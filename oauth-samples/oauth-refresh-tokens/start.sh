#!/bin/sh

V8_OPTIONS=$V8_OPTIONS
MEMLIM=`cat /sys/fs/cgroup/memory/memory.limit_in_bytes`
MEMLIM_MB=`node -e "console.log(parseInt($MEMLIM*0.5/1024/1024))"`
YOUNG_MEMLIM_MB=`node -e "console.log(parseInt(Math.max($MEMLIM*0.125/1024/1024,1)))"`
echo "Starting process with max_old_space_size: $MEMLIM_MB and max_semi_space_size: $YOUNG_MEMLIM_MB"
node --max_old_space_size=$MEMLIM_MB --max_semi_space_size=$YOUNG_MEMLIM_MB $V8_OPTIONS index.js 2>&1

if [ -f /.davra.debug ] ; then 
    tail -f /dev/null 
fi
