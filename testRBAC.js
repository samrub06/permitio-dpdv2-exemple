const express = require('express');
const app = express();
const port = 4000;
const { Permit } = require('permitio');
require('dotenv').config();

app.use(express.json());

// Check env variables
if (!process.env.PERMIT_API_KEY) {
  console.error('❌ ERROR: PERMIT_API_KEY is not defined in the .env file');
  process.exit(1);
}

const permit = new Permit({
  pdp: process.env.PERMIT_PDP_URL || 'https://cloudpdp.api.permit.io',
  token: process.env.PERMIT_API_KEY,
  // proxyFactsViaPdp: true
});
 
// middleware to give the info of environment ... 
app.use(async (req, res, next) => {
  // Get parameters based on HTTP method
  const params = req.method === 'GET' ? req.query : req.body;
  const { user, action, resource } = params;
  
  try {
    // Check Environment
    console.log('🏢 Check Environment...');

    const environments = await permit.api.environments.list({ projectKey: "default" });
    console.log('🏢 Environments:', environments.map(env => env.name));

    // Check project symbol put in env   
    const project = await permit.api.projects.getByKey(environments[0].project_id);
    console.log(`🔑 Project key : ${project.key} and name : ${project.name}`);

    console.log(`👤 user: ${user}, action: ${action}, resource: ${resource}`);
    next();
  } catch (error) {
    throw new Error('❌ Error', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
  }
});

// `GET /users` → Admin-only: returns a list of users
app.get('/users', async (req, res) => {
  try {
    const { user, action, resource, tenant } = req.query;
    let permitted = null;
    if (tenant) {
      const resourceWithTenant = {type: resource, tenant: tenant};
      permitted = await permit.check(user, action, resourceWithTenant);
    } else {
      permitted = await permit.check(user, action, resource);
    }
    console.log(permitted ? "✅ Access Authorized" : "❌ Access Denied");
    res.status(200).send(permitted ? "✅ Access Authorized" : "❌ Access Denied");
  } catch (error) {
    throw new Error('❌ Error', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
  }
});

// `POST /orders` → Customer-only: creates a new order
app.post('/orders', async (req, res) => {
  try {
    const { user, action, resource } = req.body;
    const permitted = await permit.check(user, action, resource);
    res.status(200).send(permitted ? "✅ Access Authorized" : "❌ Access Denied");
  } catch (error) {
    throw new Error('❌ Error', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
  }
});

// `GET /orders/:id` → Admin or Customer: view an order
app.get('/orders/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const { user, action, resource } = req.query;
    console.log(`👤 user: ${user}, action: ${action} with id: ${id}, resource: ${resource}`);
    const permitted = await permit.check(user, action, resource);
    res.status(200).send(permitted ? "✅ Access Authorized" : "❌ Access Denied");
  } catch (error) {
    throw new Error('❌ Error', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
  }
});



/* // Test route for Permit.io
app.post('/test-permit', async (req, res) => {
  const { user, action, resource, tenant } = req.query;
  let permitted = null;
  console.log('🧪 Start Permit.io tests');
  try {


    
    // Add tenant to resource
    if (tenant) {
      const resourceWithTenant = {type: resource, tenant: tenant};
       permitted = await permit.check(user, action, resourceWithTenant);
      console.log('✅ Permissions with tenant check result:', permitted);
    } else {
      permitted = await permit.check(user, action, resource);
      console.log('✅ Permissions check result:', permitted);
    }
  

 
    if (permitted) {
      res.status(200).send(` ✅ ${user} is PERMITTED to '${action}' '${resource}' !`);
    } else {
      res.status(403).send(` ❌ ${user} is NOT PERMITTED to '${action}' '${resource}' !`);
    }
  } catch (error) {
    console.error('❌ Error', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status
    });
    res.status(500).json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        status: error.status
      }
    });
  }
}); */

app.listen(port, () => {
  console.log('Example app listening at http://localhost:' + port);
});