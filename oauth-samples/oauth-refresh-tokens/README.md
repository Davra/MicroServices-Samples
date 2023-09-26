# oauthsampleapp
A sample custom microservice which uses OAuth 2.0 to authenticate Davra users and give tokens to the app

To install this sample in a Custom Service, create a new Service, launch the IDE and open a terminal window in which you must run the following commands:

```
git clone https://github.com/Davra/oauthsampleapp.git
cd oauthsampleapp
rm -rf .git
cp -rf . ..
cd ..
npm upgrade

git add .
git commit -a -m 'sample'
git push
```

You can now create new routes & edit index.js, as describe in the video here:
http://help.davra.com/#/oauthclients
