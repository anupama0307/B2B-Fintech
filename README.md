# 🛡️ RISKON + VisualPe

**AI-Powered Smart Lending Platform with Financial Dashboard**

An intelligent loan processing system that auto-approves/rejects loans based on ML risk analysis, parses bank statements to verify expenses, and calculates customer scores. 

---

## 🌟 Features

### Customer Portal (VisualPe)
- 📊 **Financial Dashboard** - Income, expenses, investments visualization
- 📄 **Bank Statement Upload** - Auto-parse and categorize spending
- 🎯 **Customer Score** - AI-calculated creditworthiness score (0-900)
- 💰 **Loan Application** - Apply for Personal, Home, Car, Education, Business loans
- 📋 **Loan Tracking** - Real-time application status
- ❓ **Grievance System** - AI-powered rejection explanations

### Admin Portal (RISKON)
- 📈 **Dashboard** - Overview of all loan applications
- 🤖 **Auto-Processing** - Low risk auto-approves, high risk auto-rejects
- 🔍 **Risk Analysis** - Detailed ML-based risk assessment
- 🚨 **Fraud Detection** - Flags expense mismatches
- 💬 **AI Grievance Responses** - Automated explanation generation

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
# or .\venv\Scripts\activate  # Windows

pip install -r requirements.txt
cp .env.example . env
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@riskon.com | admin123 |
| User | user@test.com | user123 |

---

## 📱 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## 🏗️ Tech Stack

- **Frontend**: React. js, TailwindCSS, Recharts
- **Backend**: FastAPI (Python)
- **Database**:  SQLite
- **ML Model**: Scikit-learn Random Forest
- **Auth**: JWT + OTP

---

## 📄 License

MIT License