# 🚨 AI-Complaint-Management-System

An AI-Powered Smart Campus Complaint Management System with live tracking, location verification, and fake complaint detection.

---

## 🌟 Features

- 📍 **Live Location Tracking** — Real-time tracking of complaint locations on campus
- 🤖 **AI-Powered Fake Complaint Detection** — Automatically flags suspicious or duplicate complaints
- ✅ **Location Verification** — Verifies that complaints are submitted from valid campus locations
- 👤 **User Authentication** — Secure login and registration for students and admins
- 📊 **Admin Dashboard** — Manage, assign, and resolve complaints efficiently
- 🔔 **Real-time Updates** — Live status updates on complaint progress

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB |
| AI/ML | Claude AI (Anthropic) |
| Auth | JWT |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/VinitGng/AI-Complaint-Management-Sysytem.git

# Navigate to the project directory
cd AI-Complaint-Management-Sysytem

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Configure Environment Variables

Open `.env` and fill in your values:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3000
```

### Run the App

```bash
# Development mode
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
├── server/          # Backend Express server
├── src/             # Frontend React app
├── .env.example     # Environment variable template
├── vite.config.ts   # Vite configuration
├── tsconfig.json    # TypeScript configuration
└── package.json     # Project dependencies
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vinit Gangwar** — [@VinitGng](https://github.com/VinitGng)

