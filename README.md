Deployment Link: https://front-end-easybuy.vercel.app/

# 🛍️ SV Clothing Store

SV Clothing Store is a full-stack e-commerce web application designed to provide a seamless shopping experience for customers. The platform supports user authentication, product browsing, cart management, and admin control for managing inventory.

---

## 📁 Project Structure

```

SV\_Clothing\_Store/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
├── .gitignore
├── README.md
└── package.json

````

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- Axios
- React Router
- Tailwind CSS / Bootstrap (customize based on your setup)

### Backend:
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing

---

## 🚀 Features

### ✅ User:
- Browse collections and products
- Search and filter products
- User signup/login (JWT-based)
- Add items to cart
- Checkout system

### ✅ Admin:
- Add/edit/delete products
- Manage users and orders
- Dashboard analytics (optional)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Singapranay/SV_Clothing_Store.git
cd SV_Clothing_Store
````

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the **backend** folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the **frontend** folder:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 4. Run the Application

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm start
```

---

## 🔒 Authentication Flow

* User registers/login → JWT generated → stored in localStorage.
* Protected routes verify token before allowing access.

---

## 📦 Deployment

You can deploy this project using:

* **Frontend**: Vercel / Netlify
* **Backend**: Render / Railway / Cyclic / Heroku
* **Database**: MongoDB Atlas



---

## 🙌 Acknowledgements

This project was built as a part of learning full-stack development and applying practical concepts in a real-world scenario.

---

## 📧 Contact

**Developer:** Pranay Singa
**GitHub:** [@Singapranay](https://github.com/Singapranay)

---
