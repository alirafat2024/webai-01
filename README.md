# Test AI

Test AI is a web application built with **Angular** on the frontend and **NestJS** on the backend. It uses **PostgreSQL** for data storage and **Groq AI** for AI-powered functionality.

## 📁 Project Structure

```text
test-ai/
└── webai/
    ├── Frontend/
    │   └── Angular application
    │
    ├── backend/
    │   └── NestJS application
    │
    ├── builder/
    │   └── projects/
    │
    └── templates/
        └── angular-nest/
```

---

## 🛠️ Technologies

* **Frontend:** Angular
* **Backend:** NestJS
* **Database:** PostgreSQL
* **AI:** Groq API
* **Package Manager:** npm
* **Language:** TypeScript

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone git@github.com:alirafat2024/webai-01.git
```

Navigate into the project:

```bash
cd webai
```

---

## 2. Install Backend Dependencies

Open a terminal and navigate to the backend:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

---

## 3. Install Frontend Dependencies

Open another terminal and navigate to the frontend:

```bash
cd webai/Frontend
```

Install the required packages:

```bash
npm install
```

---

# 🗄️ PostgreSQL Configuration

Test AI requires a PostgreSQL database.

Make sure PostgreSQL is installed and running on your computer.

Create a PostgreSQL database for the project.

Then configure the database connection in:

```text
webai/backend/src/app.module.ts
```

Update the PostgreSQL configuration with your own:

* Database username
* Database password
* Database name
* Host
* Port

For example:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'YOUR_USERNAME',
  password: 'YOUR_PASSWORD',
  database: 'YOUR_DATABASE_NAME',
});
```

> **Important:** Do not commit your real database password to GitHub.

---

# 🤖 Groq AI Configuration

The application uses the **Groq API** for AI functionality.

## 1. Create an Environment File

Inside the backend directory, create:

```text
webai/backend/.env
```

You can use the provided example environment file as a reference:

```text
webai/backend/.example.env
```

Add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Replace `your_groq_api_key_here` with your actual Groq API key.

> **⚠️ Security:** Never commit your real API key to GitHub.

Make sure `.env` is included in `.gitignore`.

---

# ▶️ Running the Application

You need to run the backend and frontend separately.

## Start the Backend

From:

```text
webai/backend
```

run:

```bash
npm run start:dev
```

The backend will start in development mode.

---

## Start the Frontend

From:

```text
webai/Frontend
```

run:

```bash
npm start
```

Then open the URL shown by Angular in your browser.

---

# 🔧 Configuration Checklist

Before running the application, make sure you have:

* [ ] Node.js installed
* [ ] npm installed
* [ ] PostgreSQL installed and running
* [ ] PostgreSQL database created
* [ ] PostgreSQL username configured
* [ ] PostgreSQL password configured
* [ ] Database name configured
* [ ] Groq API key created
* [ ] `.env` file created
* [ ] Backend dependencies installed
* [ ] Frontend dependencies installed

---

# 📌 Quick Start

After cloning the repository:

### Terminal 1 — Backend

```bash
cd webai/backend
npm install
npm run start:dev
```

### Terminal 2 — Frontend

```bash
cd webai/Frontend
npm install
npm start
```

Make sure PostgreSQL is running and your database configuration and Groq API key are correctly configured before starting the application.

---

# 🔐 Environment Variables

Example:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Never upload credentials, API keys, passwords, or other secrets to GitHub.

---

# 🐛 Troubleshooting

## `npm install` fails

Make sure Node.js and npm are installed:

```bash
node --version
npm --version
```

Then try:

```bash
npm install
```

---

## PostgreSQL connection fails

Check that:

1. PostgreSQL is running.
2. The database exists.
3. The username is correct.
4. The password is correct.
5. The database name is correct.
6. The PostgreSQL port is correct, usually `5432`.

---

## Groq API errors

Check that:

1. Your `.env` file exists in the backend directory.
2. `GROQ_API_KEY` is correctly configured.
3. Your API key is valid.
4. The backend has been restarted after changing the environment file.

---

# 👨‍💻 Author

**Ali Rafat**

GitHub: [alirafat2024](https://github.com/alirafat2024)
