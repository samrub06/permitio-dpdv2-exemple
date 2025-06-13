const { Permit } = require('permitio');

const express = require('express');
const app = express();
const port = 4000;

// This line initializes the SDK and connects your Node.js app
// to the Permit.io PDP container you've set up in the previous step.
const permit = new Permit({
  // in production, you might need to change this url to fit your deployment
  pdp: 'http://localhost:7766',
  // your api key
  token:
  'permit_key_j6ymX7k23hjxYEYVY2ZDENLVzPZ2SizcKqf7lIXZx6EmbFQUU9wPzdRsfMqKL8sPSDMQOpLXrMErkswyBwEvcL',
 
  throwOnError: true,
});

const userData = {
  id: 'mariage',
  firstName: 'Samuel',
  lastName: 'CHARBIT',
  email: 'charbit.samuel@gmail.com',
}

// GET users list
app.get('/users', async (req, res) => {
  // check if user is admin
  const user = await permit.api.users.get(userData.id);
  if (user.role === 'admin') {
    const users = await permit.api.users.list();
    res.json(users);
  } else {
    res.status(403).send('Unauthorized');
  }
});


//- `POST /orders` → Customer-only: creates a new order
app.post('/orders', async (req, res) => {
  const user = await permit.api.users.get(userData.id);
  if (user.role === 'customer') {
    const order = await permit.api.orders.create(req.body);
    res.json(order);
  } else {
    res.status(403).send('Unauthorized');
  }
});

//- `GET /orders/:id` → Admin or Customer: view an order
app.get('/orders/:id', async (req, res) => {
  const user = await permit.api.users.get(userData.id);
  if (user.role === 'admin' || user.role === 'customer') {
    const order = await permit.api.orders.get(req.params.id);
    res.json(order);
  } else {

app.listen(port, () => {
  console.log('Example app listening at http://localhost:'+port);
});