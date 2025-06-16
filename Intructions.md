# 🧪 Permit.io Support Engineer Take-Home Challenge

## 🎯 Goal

Demonstrate your ability to:

- Understand and troubleshoot common Permit.io issues
- Communicate clearly with customers
- Take ownership of problems, including when to escalate
- Present findings and walk through your thinking
- Self-start and set up a minimal Permit.io environment

---

## 📦 What You'll Do

You’ll work from a realistic support scenario. There’s no starter code — just like a real customer, you’ll use Permit.io’s public docs, SDKs, and tools to investigate and resolve the issue.

After completing the challenge, prepare a **10–15 minute presentation** to walk us through your process and findings.

---

## 📁 The Scenario

> A developer posts in Slack:  
> _“I’m using Permit.io with a Node.js Express app. I set up roles and connected the PDP via Docker. When I try calling `GET /users` as an `admin`, I get a 403. I’ve already assigned the user the `admin` role. What gives?”_

You are the first line of support.

---

The app in question is a minimal Node.js API with the following endpoints:

- `GET /users` → Admin-only: returns a list of users
- `POST /orders` → Customer-only: creates a new order
- `GET /orders/:id` → Admin or Customer: view an order

The developer is blocked on accessing `GET /users`, even though the current user has been assigned the `admin` role.

---

## 🔍 Your Tasks

1. **Understand the problem**  
   - What clarifying questions would you ask?
   - What are the possible causes?

2. **Recreate the environment**  
   - Set up a minimal Node.js Express app with Permit.io integrated
   - Use Permit’s documentation and Docker images (e.g., PDP) to get it working locally
   - Set up roles, permissions, and a simple policy

3. **Reproduce & investigate**  
   - Simulate the 403 issue on an `/admin` route
   - Try to understand why the access is denied

4. **Diagnose the issue**  
   - Identify and document the root cause
   - Show what fixed it (or explain what you couldn’t resolve)

5. **Own the conversation**  
   Write:
   - A customer-facing message explaining what happened and how to fix it
   - An internal message you’d send to escalate (if needed)

6. **Present your process**  
   In a 10–15 minute session:
   - Walk us through your setup
   - Explain how you approached and solved the issue
   - Share any roadblocks and how you addressed them
   - Show us how you'd communicate this to a real customer

---

## 🧠 What We’re Evaluating

| Area                 | Looking For                                       |
|----------------------|---------------------------------------------------|
| Problem-solving      | Logical thinking, root cause analysis             |
| Permit understanding | Policies, roles, PDP behavior, SDKs               |
| Initiative           | Can you figure things out with minimal direction |
| Communication        | Clear, friendly, helpful explanations             |
| Ownership            | Sticking with the issue, escalating when needed  |
| Presentation         | Can you explain your process confidently?        |

---

## ⏱️ Time Expectation

- Take-home setup + exploration: ~1–2 hours
- Presentation: 15 mins + 10 mins for Q&A

---

## 📚 Resources

You may use anything public (docs, SDKs, tutorials). This is an open-book challenge — we’re testing how well you can **navigate uncertainty** and **guide customers confidently**.