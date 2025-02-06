// See your keys here: https://dashboard.stripe.com/account/apikeys

const keyPublishable = 'pk_test_XXXXX'; // Enter the key here
const keySecret = 'sk_test_XXXXX'; // enter the secret here
const davraToken = 'XXXXX';
const API_HOST = 'https://YOUR_TENANT_HOST';


const request = require('request');
const api = require("@connecthing.io/connecthing-api");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.send('davra.com node microservice for stripe');
});


const stripe = require('stripe')(keySecret);

var cacheCustomers = null;



// --------       Just for Checkout-Client
app.get('/checkout-client-success', function (req, res) {
  res.send('Success, thank you');
});
app.get('/checkout-client-fail', function (req, res) {
  res.send('Failed.');
});

/*
async function updateStripeQuantityForSubscription(newQuantity, subscriptionId) {
    console.log(Date.now(), 'Adjusting subscription quantity ' + subscriptionId + " to " + newQuantity);
    const subscription = await stripe.subscriptions.update(
        subscriptionId, {
            "quantity": newQuantity
        },
    );
    console.log(Date.now(), 'Adjusted subscription quantity.');
    return;
}
*/

// -----   General
app.get('/balance', function (req, res) {
    console.log('retrieving balance');
    stripe.balance.retrieve(function(err, balance) {
        if(err) {
            res.status(500).send('Error during balance ' + err + balance);
        } else {
            res.send(balance);
        }
    });
});

app.get('/customers', function (req, res) {
    updateCacheCustomers(function(err, customers) {
        res.send(customers);
      }
    );
});
// Get a Stripe user object using davra user UUID from customer objects in Stripe
app.get('/customers/:userUuid', function (req, res) {
    updateCacheCustomers(function(err, customers) {
        var customerObj = {};
        for(var tmpIndex = 0; tmpIndex < customers.data.length; tmpIndex++) {
            if(customers.data[tmpIndex].metadata.UUID == req.params.userUuid) {
                customerObj = customers.data[tmpIndex];
            }
        }   
        res.send(customerObj);
      }
    );
});

// Get details for a Stripe subscription
app.get('/subscriptions/:subscriptionId', function (req, res) {
    stripe.subscriptions.retrieve(
        req.params.subscriptionId,
        function(err, subscription) {
            if(err) {
                console.log('Error after retrieving subscription ', err);
            }
            res.send(subscription);
        }
    ); 
});


// Get details for a Stripe payment method
app.get('/paymentMethods/:paymentMethodId', function (req, res) {
    stripe.paymentMethods.retrieve(
        req.params.paymentMethodId,
        function(err, paymentMethod) {
            if(err) {
                console.log('Error after retrieving paymentMethod ', err);
            }
            res.send(paymentMethod);
        }
    ); 
});


// Get all invoices
app.get('/invoices', function (req, res) {
    stripe.invoices.list(
        { limit: 100 },
        function(err, invoices) {
            if(err) {
                console.log('Error after retrieving invoices ', err);
            }
            res.send(invoices);
        }
    ); 
});

// Get single invoice
app.get('/invoices/:invoiceId', function (req, res) {
    stripe.invoices.retrieve(
        req.params.invoiceId,
        function(err, invoice) {
            if(err) {
                console.log('Error after retrieving invoice ', err);
            }
            res.send(invoice);
        }
    ); 
});

// Get invoices for a Stripe customer
app.get('/invoicesByCustomer/:customerId', function (req, res) {
    stripe.invoices.list(
        { 
            "limit": 100,
            "customer": req.params.customerId
        },
        function(err, invoices) {
            if(err) {
                console.log('Error after retrieving invoices ', err);
            }
            res.send(invoices);
        }
    ); 
});

var updateCacheCustomers = function(callback) {
    stripe.customers.list(
      { limit: 100 },
      function(err, customers) {
        callback(err, customers);
      }
    );
}




// Update all Stripe customers with the number of devices they own
app.get('/updateCustomerQuantities', function (req, res) {
    updateCustomerQuantities(function(response) {
        res.send(response);    
    });
});
    
    
    
var updateCustomerQuantities = function(callback) {
    request({
        url: API_HOST+"/api/v1/devices",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + davraToken
        },
        method: "GET",
        callback: function(err, response, body){
            console.log('Http call was made to /api/v1/devices and got back: ', err, body);
            var allDevices = JSON.parse(body).records.slice();
            console.log('Http call was made to /api/v1/devices and got back: ', allDevices.length);
    
            updateCacheCustomers(function(err, customers) {
                console.log('Http call was made to stripe for customers and got back', customers.data.length);
                
                for(var tmpIndex = 0; tmpIndex < customers.data.length; tmpIndex++) {
                    var customerObj = customers.data[tmpIndex];
                    console.log('Syncing stripe customer ', customerObj.metadata);
                    var davraDevicesFoundForStripeCustomer = 0;
                    
                    for(var deviceIndex = 0; deviceIndex < allDevices.length; deviceIndex++) {
                        if(allDevices[deviceIndex].owner && allDevices[deviceIndex].owner == customerObj.metadata.UUID) {
                            console.log('Found device owned by stripe customer ', allDevices[deviceIndex].UUID);
                            davraDevicesFoundForStripeCustomer++;
                        }
                    }
                    
                    if(customerObj.subscriptions && customerObj.subscriptions.data && customerObj.metadata.UUID) {
                        console.log('Stripe customer ', customerObj.metadata.UUID, ' has davra devices ', davraDevicesFoundForStripeCustomer);
                        console.log('Stripe subscription count (should be 1) ', customerObj.subscriptions.data.length);
                        console.log('Stripe subscription ', customerObj.subscriptions.data[0].id);
                        console.log('Stripe quantity ', customerObj.subscriptions.data[0].quantity);
                        if(customerObj.subscriptions.data[0].quantity != davraDevicesFoundForStripeCustomer) {
                            console.log('Would like to update Stripe for user ', customerObj.metadata.UUID);
                            
                            stripe.subscriptions.update(
                                customerObj.subscriptions.data[0].id,
                                {
                                    quantity: davraDevicesFoundForStripeCustomer
                                },
                                function(err, subscriptionItem) {
                                     console.log('Stripe callback after updated subscription ');
                                }
                            );
                        } else {
                            console.log('Stripe user has correct quantity in subscription: ', customerObj.subscriptions.data[0].quantity);
                        }
                    } else {
                        if(davraDevicesFoundForStripeCustomer > 0) {
                            console.log('Stripe user has no subscription and devices ', davraDevicesFoundForStripeCustomer);
                        }
                    }
                }   
                if(callback) {
                    callback('completed');
                }
                
            });
        }
    });
};


// Periodically update stripe with the quantity of devices owned by each user
setInterval(updateCustomerQuantities, 300000);








// -------------           Just for Stripe Elements
app.post("/pay", function(req, res) {
    console.log('Incoming post for stripe processing ', req.body);
    let amount = 1*100;
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    // create a customer
    stripe.customers.create({
        email: req.body.stripeData.email, // customer email
        source: req.body.stripeData.id // token for the card
    })
    .then(customer =>
        stripe.charges.create({ // charge the customer
            amount,
            description: "Sample Charge",
            currency: "usd",
            customer: customer.id,
            statement_descriptor: 'Custom descriptor'
            
        })
    )
    .then(charge => res.send(JSON.stringify(
        {
            "status": "paid"
        }
    ))); // render the payment successful page after payment
     
});



app.post("/subscribe", function(req, res) {
    console.log('Incoming post for stripe processing to subscribe a davra user to a plan ', req.body);
    var stripePlan = req.body.stripePlan;
    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    // create a customer
    stripe.customers.create({
        email: req.body.stripeData.email, // customer email
        source: req.body.stripeData.id, // token for the card
        metadata: {
            "UUID": req.body.userUuid
        }
    })
    .then(customer =>
        stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    plan: stripePlan
                }
            ]
        }, function(err, subscription) {
            console.log('After asking microservice to subscribe this user to plan: ', err, subscription);
            setTimeout(updateCustomerQuantities, 1000);
        })
    )
    .then(newSubscription => res.send(JSON.stringify(
        {
            "status": "subscribed",
            "newSubscription": newSubscription
        }
    ))); 
     
});



app.post("/changeSubscription", function(req, res) {
    console.log('Incoming post for stripe processing to changeSubscription ', req.body);
    var stripePlan = req.body.stripePlan;
    var oldPlan = req.body.oldPlan
    var stripeCustomer = req.body.stripeCustomer;
    stripe.subscriptions.del(
        oldPlan,
        function(err, confirmation) {
            // asynchronously called
        }   
    ).then(customer =>
        stripe.subscriptions.create({
            "customer": stripeCustomer,
            "items": [
                {
                    "plan": stripePlan
                }
            ]
        }, function(err, subscription) {
            console.log('After asking microservice to subscribe this user to plan: ', err, subscription);
        })
    )
    .then(newSubscription => res.send(JSON.stringify(
        {
            "status": "subscribed",
            "newSubscription": newSubscription
        }
    ))); 
});











// Leave this at the end
request({
    url: API_HOST+"/api/v1/devices",
    contentType: "application/json",
    headers: {
        "Authorization": "Bearer " + davraToken
    },
    method: "GET",
    callback: function(err, response, body){
        console.log('Http call was made to /api/v1/devices and got back bytes: ', body.length);
    }
});
const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
  console.log('davra.com node microservice for stripe listening on port ' + SERVER_PORT + '!');
})
