# Chatbot Platform

A full-stack chatbot platform built with **React** (frontend), **Node/Express** (backend), **MongoDB** (database), and **OpenRouter** (LLM integration).  
This README is a complete, step-by-step, user-friendly guide to get the project running locally, understand the API, and extend the system.

---

## Table of Contents

1. [Quick Overview](#quick-overview)  
2. [Features](#features)  
3. [Tech Stack](#tech-stack)  
4. [Prerequisites](#prerequisites)  
5. [Quickstart](#quickstart)  

---

## Quick Overview

This project provides a minimal but extendable chatbot platform that allows users to:
- Register / log in (JWT authentication).
- Create projects and prompts.
- Send messages to an AI agent (via OpenRouter) and receive replies.
- Persist chat history and prompts in MongoDB.

---

## Features

- User authentication (register/login) with JWT.
- Project management (create/list projects).
- Prompt management per project.
- Chat endpoint that forwards user messages to OpenRouter (LLM) and returns model replies.
- Clean React UI for interacting with the chatbot (create projects, add prompts, chat).

---

## Tech Stack

- Frontend: React (Create React App)  
- Backend: Node.js + Express  
- Database: MongoDB (Atlas)  
- Auth: JSON Web Tokens (JWT)  
- LLM integration: OpenRouter (server-side; API key stored in backend `.env`)  
- Dev tooling: nodemon (backend), npm

---

## Prerequisites

- Node.js (v16+ recommended) and npm 
- MongoDB (Atlas connection string or local MongoDB instance)  
- OpenRouter API key (sign up at the OpenRouter provider you use)  
- Git (to clone)  
- (Optional) Docker & Docker Compose for containerized setups

---

## Quickstart

```bash
# 1) Clone
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# 2) Install backend deps
cd server
npm install

# 3) Create server/.env and add your secrets
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/chatbot?retryWrites=true&w=majority
JWT_SECRET=jwt_secret
OPENROUTER_API_KEY=or_XXXXXXXXXXXXX
FRONTEND_URL=http://localhost:3000

Replace the MONGO_URI, with your MongoDB Atlas credentials.
Replace <YOUR_JWT_SECRET> with a strong random string.
Replace <YOUR_OPENROUTER_API_KEY> with your actual OpenRouter API key.

# 4) Start backend
npm run dev

# 5) In a new terminal: start frontend
cd ../client
npm install
npm start

# 6) Open browser
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000 (API)
