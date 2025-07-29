# 🐾 PawPal - Pet Adoption Platform

A full-stack web application that connects pets with loving homes through a secure, user-friendly platform. Built with modern technologies to provide a seamless pet adoption experience.

## 🌟 Features

### For Pet Owners
- **Easy Pet Listing**: Create detailed profiles for pets needing homes with multiple images
- **Adoption Request Management**: Review and manage incoming adoption requests
- **Secure Messaging**: Communicate directly with potential adopters Via Whatsapp
- **Profile Management**: Edit personal information and manage listed pets

### For Pet Adopters
- **Browse Available Pets**: Search and filter pets by species, breed, age, and location
- **Adoption Requests**: Submit adoption requests with ease
- **Pet Reviews**: Read and write reviews about adoption experiences
- **User Reviews**: Build trust through community feedback

### For Administrators
- **Comprehensive Dashboard**: Monitor platform statistics and user activity
- **User Management**: Suspend, ban, or delete problematic users
- **Content Moderation**: Review and manage pet listings, reviews, and reports
- **Report Handling**: Address user reports and review reports efficiently
- **Analytics**: View adoption statistics and platform metrics

### Security & Safety
- **Encrypted Messaging**: End-to-end encryption for all communications in backend 
- **Report System**: Report suspicious users or inappropriate content
- **User Verification**: Email verification and password reset functionality
- **Admin Controls**: Comprehensive moderation tools for platform safety

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Multer** for file uploads
- **Cloudinary** for image storage
- **SendGrid** for email services
- **Crypto** for message encryption in backend

### Frontend
- **React 19** with **Vite** build tool
- **React Router DOM** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Chart.js** with **react-chartjs-2** for analytics
- **React Hot Toast** for notifications
- **Axios** for API communication

## 📁 Project Structure

```
PetAdoption-Platform/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Authentication & validation
│   │   ├── utils/           # Helper functions
│   │   └── app.js          # Express app configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── context/        # React context providers
│   │   └── assets/         # Static assets
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account
- SendGrid account

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PetAdoption-Platform/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   SENDGRID_API_KEY=your_sendgrid_api_key
   SENDER_MAIL=your_verified_sender_email
   ENCRYPTION_KEY=your_encryption_key
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/forgot-password` - Password reset request
- `POST /api/v1/users/reset-password` - Password reset

### Pets
- `GET /api/v1/pets` - Get all pets with filters
- `POST /api/v1/pets` - Create new pet listing
- `GET /api/v1/pets/:id` - Get pet details
- `PUT /api/v1/pets/:id` - Update pet listing
- `DELETE /api/v1/pets/:id` - Delete pet listing

### Adoption Requests
- `POST /api/v1/adoptionrequests` - Submit adoption request
- `GET /api/v1/adoptionrequests/incoming` - Get incoming requests
- `GET /api/v1/adoptionrequests/outgoing` - Get outgoing requests
- `PUT /api/v1/adoptionrequests/:id` - Update request status

### Messages
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/:userId` - Get conversation
- `PUT /api/v1/messages/:id/read` - Mark message as read

### Reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/pet/:petId` - Get pet reviews
- `GET /api/v1/reviews/user/:userId` - Get user reviews

### Admin (Protected)
- `GET /api/v1/admin/dashboard` - Dashboard statistics
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id/suspend` - Suspend user
- `PUT /api/v1/admin/users/:id/ban` - Ban user
- `DELETE /api/v1/admin/users/:id` - Delete user

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for user passwords
- **Message Encryption**: AES-256-CBC encryption for private messages
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **File Upload Security**: Secure image upload with Cloudinary

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean, intuitive user interface
- **Real-time Notifications**: Toast notifications for user feedback
- **Interactive Charts**: Admin dashboard with Chart.js visualizations
- **Image Carousel**: Smooth image galleries for pet photos
- **Loading States**: Proper loading indicators throughout the app

## 📊 Database Models

### User Model
- Basic info (name, email, phone)
- Role-based access (User/Admin)
- Account status (active/suspended/banned)
- Password reset functionality

### Pet Model
- Pet details (name, age, breed, species, gender)
- Image gallery support
- Adoption status tracking
- Owner reference

### Adoption Request Model
- User and pet references
- Status tracking (pending/approved/rejected)
- Timestamp management

### Message Model
- Encrypted content storage
- Sender/receiver references
- Read status tracking
- Soft delete functionality

### Review Model
- Rating system (1-5 stars)
- Comment support
- User and pet references

### Report Models
- User and review reporting
- Reason tracking
- Status management (pending/resolved/dismissed)

## 🚀 Deployment

### Backend Deployment
- Configure environment variables
- Set up MongoDB Atlas cluster
- Deploy to platforms like onrender, Railway, or Vercel

### Frontend Deployment
- Build the project: `npm run build`
- Deploy to Vercel, Netlify, or similar platforms
- Configure environment variables for API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Icons provided by Lucide React
- Charts powered by Chart.js
- Image hosting by Cloudinary
- Email services by SendGrid

---

**PawPal** - Making pet adoption simple, safe, and successful! 🐕🐱🐦 