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
  //proxyFactsViaPdp: true
});



// Unconsistent user creation test
app.post('/user', async (req, res) => {
  const { user, email, tenant, role } = req.body;
  try {
    // create user
    const userData = await permit.api.users.create({
      key: user,
      email: email,
    });
    console.log(`✅ User created successfully: ${userData.key}`);

    // assign role to user
    const assignedRole = await permit.api.users.assignRole({
      role: role,
      tenant: tenant,
      user: userData.key
    });
    console.log(`✅ Role assigned successfully: ${assignedRole.role}`);

    // Check for permissions right after
    const allowed = await permit.check(userData.key, "read", "Document");
    console.log(allowed ? "✅ Access Authorized" : "❌ Access Denied");
    res.status(200).send(allowed ? "✅ Access Authorized" : "❌ Access Denied");
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).send(`❌ Error creating user: ${error.message}`);
  }
});


// Check permission route 
app.post('/check-permission', async (req, res) => {
  const { user, action, resource, tenant } = req.body;
  let permitted = null;
  console.log('🧪 Start Permit.io tests');
  try {
    // Check permissions
    console.log('🔐 Check permissions...');

    // Check Environment
    console.log('🏢 Check Environment...');

    const environments = await permit?.api?.environments?.list({ projectKey: "project-a" });
    console.log('🏢 Environments:', environments?.map(env => env.name));

    // Check project symbol put in env   
    const project = await permit?.api?.projects?.getByKey(environments[0].project_id);
    console.log(`🔑 Project key : ${project.key} and name : ${project.name}`);


    // Check user
    const userData = await permit?.api?.users?.getByKey(user);
    console.log(`👤 user: ${userData?.email}, action: ${action}, resource: ${resource}`);
    console.log(`👤 user: ${user}, action: ${action}, resource: ${resource}`);


    // Add tenant to resource
    if (tenant) {
      const resourceWithTenant = { type: resource, tenant: tenant };
      permitted = await permit?.check(user, action, resourceWithTenant);
      console.log('✅ Permissions with tenant check result:', permitted);
    } else {
      permitted = await permit?.check(user, action, resource);
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

// check wrong environment
app.post('/check-environment', async (req, res) => {
  try {
    const { user, action, resource, tenant } = req.body;
    const permitted = await permit?.check(user, action, resource, tenant);
    res.status(200).send(permitted ? "✅ Access Authorized" : "❌ Access Denied");
  } catch (error) {
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