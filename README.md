

## ✅ Diagnostic Possibilities and Explanations

### 🔍 1. **Wrong Project or Environment**

> *"Check the Project/Environment of the SDK vs Permit Console"*

* **Why it's important**: Permit uses a strict hierarchy — the `project` and `environment` are required to match exactly between the SDK config and the Permit.io dashboard.
* **Effect**: If you're checking permissions in one environment, but your user/role was synced to another, Permit will return a `403`.

**Troubleshooting**:

```js
const permit = new Permit({
  project: 'your_project_key',
  environment: 'staging',
});
```

---

### 🔍 2. **Using Cloud PDP (instead of local PDP via Docker)**

> *"Are you using the Cloud PDP or running it locally via Docker?"*

* **Why it matters**: The **Cloud PDP** only supports **RBAC** by default. If you define **ABAC or ReBAC** policies, they won’t be enforced.
* **Effect**: The user will be denied (403) even if the policy seems valid in the console.

**Solution**:
Use **local PDP (via Docker)** when working with ABAC/ReBAC:

```bash
docker run -p 7766:7766 permitio/pdp:latest
```

```js
const permit = new Permit({
  pdp: 'http://localhost:7766', // not cloud PDP
});
```

---

### 🔍 3. **PDP Container is Not Running**

> *"Run `docker ps` to check if your PDP is active"*

* If the PDP is not running or is misconfigured, requests to it will fail or silently return a deny.
* Logs or console will often show connection issues.

---

### 🔍 4. **Use `syncUser()` vs `createUser()`**

> *"Did you use `syncUser()` instead of `createUser()`?"*

* `createUser()` just creates the user **without** assigning roles — which means they’ll be denied access by default.
* `syncUser()` is the recommended method, as it supports syncing roles.

**Better**:

```js
await permit.users.sync({
  key: 'adminUser',
  email: 'admin@example.com',
  role_assignments: [{ role: 'admin', tenant: 'default' }]
});
```

---

### 🔍 5. **Audit Logs → The Single Best Debug Tool**

> *"Check the Audit Log in the Permit.io dashboard"*

* It shows every permission check and **why** it was denied.
* You can confirm:

  * Whether the user was found
  * What policy matched (if any)
  * What tenant/env was used
  * Whether the PDP responded correctly

**Steps**:

* Go to Permit Console → **Audit Logs**
* Filter by user ID or action
* Look at the reason for denial (e.g. "No policy matched", "No such user", etc.)

---

### 🔍 6. **Eventual Consistency – Read Your Own Writes**

> *"Are you syncing a user then immediately calling `check()`?"*

* The permission system is eventually consistent unless configured to **wait** for writes to be committed before reads.
* Permit supports this via:

```js
new Permit({
  proxyFactsViaPdp: true,
});
```

This ensures that any user sync or role assignment is available *immediately* for permission checks.

---

## ✅ Summary of Best Practices / Fixes

| Problem                            | Fix                                       |
| ---------------------------------- | ----------------------------------------- |
| Wrong env/project                  | Double-check SDK config matches dashboard |
| Cloud PDP used with ABAC           | Use local PDP via Docker                  |
| PDP not running                    | Run `docker ps` and check logs            |
| Used `createUser()` only           | Use `syncUser()` with role assignments    |
| User synced but check is immediate | Enable `proxyFactsViaPdp: true`           |
| Unknown cause                      | Use **Audit Logs** to diagnose            |


## Permit SDK + PDP via Docker:

```bash
docker run -p 7766:7766 permitio/pdp:latest
```

## Basic SDK config:

```js
const permit = new Permit({
  pdp: 'http://localhost:7766',
  token: 'your_token_here',
  environment: 'staging',
  project: 'your_project',
});
```

---

# 🧪 **3. Reproducing and Investigating the 403**

### Create a user and assign them a role:

```js
await permit.users.sync({ key: 'adminUser', email: 'admin@example.com' });
await permit.roles.assign('adminUser', 'admin', 'default');
```

### Check permission:

```js
const permitted = await permit.check('adminUser', 'read', 'users');
```

➡️ This will return `false` if:

* The `admin` role has no `read` permission on the `users` resource
* The resource name doesn’t match
* The policy hasn’t been published
* You’re pointing to the wrong tenant or environment

---

# 🧠 **4. Diagnosing and Fixing the Issue**

## 🔎 Most Likely Root Cause:

> The developer assigned the `admin` role to the user, **but did not give that role permission to `read` the `users` resource** in the policy.

### 💡 Fix:

In the Permit Console:

1. Go to **Resources**, create `"users"` with a `read` action
2. Go to **Policies** and add:

   * **IF** role = `admin`
   * **THEN** allow `read` on `users`
3. Save and **publish** the policy

