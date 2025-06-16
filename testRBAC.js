const express = require('express');
const app = express();
const port = 4000;
const { Permit } = require('permitio');
require('dotenv').config();

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


async function syncUser() {
  const userData = {
    key: "user|12345678910",
    email: "john@smith.com",
    first_name: "John",
    last_name: "Smith",
    role_assignments: [{ role: "admin", tenant: "default" }]
  };

  try {
    const result = await permit.api.users.sync(userData);
    return result;
  } catch (error) {
    console.error("Error syncing user:", error.message);
    return null;
  }
}

// Test route for Permit.io
app.post('/test-permit', async (req, res) => {
  const { user, action, resource, tenant } = req.query;
  let permitted = null;
  console.log('🧪 Start Permit.io tests');
  try {
    // Check permissions
    console.log('🔐 Check permissions...');

    // Check Environment
    console.log('🏢 Check Environment...');

    const environments = await permit.api.environments.list({ projectKey: "default" });
    console.log('🏢 Environments:', environments.map(env => env.name));

    // Check project symbol put in env   
    const project = await permit.api.projects.getByKey(environments[0].project_id);
    console.log(`🔑 Project key : ${project.key} and name : ${project.name}`);

    console.log(`👤 user: ${user}, action: ${action}, resource: ${resource}`);

    
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
});

app.listen(port, () => {
  console.log('Example app listening at http://localhost:' + port);
});