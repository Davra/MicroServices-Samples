Convert Workspace to Python
===========================

This script converts NodeJS microservice base to a Python one.

# To Use:

Copy/upload the script into your wrokspace, then run it.

> NOTE: You may need to run `chmod +x convertWorkspace.sh` (make executable)
       and `sed -i -e 's/\r$//' convertWorkspace.sh`  (convert line endings)
       before running as `./convertWorkspace.sh`
       (Especially if uploading from Windows)

> ALSO NOTE: Only run this once obviously, as it's a bit brutal in over-writing some key files...


# Description: 

Installs Python & pip, then anything in requirements.txt
(Typically Flask at least, requests.py for any external API calls.)
Also deletes NodeJS setup, levaes a clean Flask starter pack,
with similar dev & docker image environments.

# Key points are:

* keep the same debian:jessie base
* Docker image for production similar to dev. environment
* this means **Python 3.4**
    - Yeah, unfortunately debian:jessie only officially supports python up to 3.4. Technically, you could bypass apt and build a newer version, but that gets messy. Better, longer term solution would be to update to using debian:buster for these images.
* Flask is installed & used by default
* Dev environment is set to debug with hot reloading
 

# Possible longer term plan...

In the UI when you select new microservice, as well as the default NodeJS option there could be a Python3 one that sets up the environment with all this already in place.
That will require a bit more heavy lifting on the backend, so for now this scipt just short-cuts that and should help in getting actual usage feedback on what people would want from a python service.


