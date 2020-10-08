Convert Workspace to Python
===========================

This script converts NodeJS microservice base to a Python one.

# Description: 

Installs Python & pip, then anything in requirements.txt
(Typically Flask at least, requests.py for any external API calls.)
Also deletes NodeJS setup, levaes a clean Flask starter pack,
with similar dev & docker image environments.

# Key points are:

* keep the same debian:jessie base
* Docker image for production similar to dev. environment
* this means Python 3.4
* Flask is installed & used by default
* Dev environment is set to debug with hot reloading

# NOTE: You'll probably need to run `chmod +x convertWorkspace.sh` (make executable)
       and `sed -i -e 's/\r$//' convertWorkspace.sh`  (convert line endings)
       before running as `./convertWorkspace.sh`
 
# ALSO NOTE: Only run this once obviously, as it's a bit brutal in over-writing some key files...