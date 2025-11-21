# 🌱 MkulimaConnect - Farm-to-Table Resilience Platform

[![MERN Stack](https://img.shields.io/badge/MERN-Full%20Stack-green.svg)](https://www.mongodb.com/mern-stack)
[![SDG Support](https://img.shields.io/badge/SDG-2%2C13-green.svg)](https://sdgs.un.org/goals)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Connecting local farmers directly with consumers for sustainable agriculture and climate resilience**

MkulimaConnect is a comprehensive farm-to-table platform that empowers small-scale farmers with predictive analytics, direct market access, and climate-smart agricultural advisory while providing consumers with fresh, locally-sourced produce.

![MkulimaConnect Screenshot](https://via.placeholder.com/800x400/2E7D32/FFFFFF?text=MkulimaConnect+Farm-to-Table+Platform)

## 🎯 Project Overview

MkulimaConnect addresses two critical UN Sustainable Development Goals:
- **SDG 2: Zero Hunger** - By reducing food waste and improving market access
- **SDG 13: Climate Action** - Through climate-smart agricultural practices

### Key Problem Statements Solved
- 🌾 **Market Access Barriers** for small-scale farmers
- 🗑️ **Food Waste** in traditional supply chains
- 🌦️ **Climate Vulnerability** of smallholder farmers
- 💰 **Price Inequality** between farmers and consumers

## ✨ Features

### 🌾 For Farmers
- **Smart Dashboard** - Real-time farm management and analytics
- **Weather Advisory** - Location-specific climate predictions and crop advice
- **Marketplace Access** - Direct connection with consumers and restaurants
- **Crop Planning** - AI-powered planting and harvesting recommendations
- **Sales Analytics** - Revenue tracking and market insights

### 🛒 For Consumers
- **Fresh Produce Marketplace** - Direct access to local farmers
- **Transparent Pricing** - Fair prices with farmer profiles
- **Location-based Search** - Find farmers and products near you
- **Order Tracking** - Real-time order status updates
- **Sustainable Choices** - Climate-impact scoring for products

### 🌍 Climate Resilience
- **Predictive Analytics** - Weather and crop yield predictions
- **Climate-Smart Advisory** - Sustainable farming recommendations
- **Water Management** - Irrigation scheduling based on weather data
- **Pest & Disease Alerts** - Early warning systems

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Material-UI (MUI)** - Component library and design system
- **React Router** - Navigation and routing
- **Chart.js** - Data visualization
- **Leaflet** - Maps and location services
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **Nodemailer** - Email service
- **bcryptjs** - Password hashing

### Mobile
- **React Native** - Cross-platform mobile app

### Deployment
- **Render** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Cloud database

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/mkulimaconnect.git
cd mkulimaconnect
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

4. **Environment Configuration**

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mkulimaconnect
JWT_SECRET=your_super_secret_jwt_key_here
OPENWEATHER_API_KEY=your_openweather_api_key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=MkulimaConnect
```

5. **Start Development Servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/api/health

## 📁 Project Structure

```
mkulimaconnect/
├── backend/
│   ├── config/                 # Database and email configuration
│   ├── controllers/            # Business logic
│   ├── middleware/             # Authentication and validation
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── tests/                  # Test suites
│   └── server.js              # Entry point
├── frontend/
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   ├── utils/             # Helper functions
│   │   └── App.js             # Main app component
├── mobile/                    # React Native app
└── documentation/             # Project documentation
```

## 🗄️ Database Models

### Core Models
- **User** - Authentication and user profiles
- **Farmer** - Extended farmer information and farm details
- **Product** - Agricultural products with pricing and availability
- **Order** - Transaction and delivery management
- **WeatherData** - Climate and weather information

### Sample Data Structure
```javascript
// Farmer Profile Example
{
  farmName: "Green Valley Organic Farm",
  farmType: "organic",
  farmSize: 5, // acres
  crops: [
    {
      name: "Tomatoes",
      variety: "Roma",
      plantingSeason: "March-April",
      harvestTime: 90 // days
    }
  ],
  location: {
    type: "Point",
    coordinates: [36.8219, -1.2921]
  }
}
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Create new product |
| GET | `/api/products/:id` | Get product by ID |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Farmers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farmers` | Get all farmers |
| GET | `/api/farmers/:id` | Get farmer by ID |
| GET | `/api/farmers/location/nearby` | Find nearby farmers |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/my-orders` | Get user orders |
| GET | `/api/orders/farmer-orders` | Get farmer orders |
| PATCH | `/api/orders/:id/status` | Update order status |

### Weather & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weather/:lat/:lon` | Get weather data |
| GET | `/api/weather/advisory/:cropType/:location` | Get crop advisory |
| GET | `/api/analytics/farmer/:farmerId` | Farmer analytics |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact/send` | Send contact message |
| GET | `/api/contact/info` | Get contact information |

## 🎨 UI Components

### Core Components
- **Navbar** - Navigation with user authentication state
- **Footer** - Contact form and company information
- **ProductCard** - Product display component
- **FarmerProfile** - Farmer information card
- **WeatherWidget** - Real-time weather display

### Pages
- **Home** - Landing page with features overview
- **Marketplace** - Product browsing and search
- **FarmerDashboard** - Farmer management interface
- **ConsumerDashboard** - Consumer order management
- **WeatherAdvisory** - Climate and crop recommendations

## 🔒 Authentication & Security

### JWT Implementation
```javascript
// Protected route example
router.get('/profile', authMiddleware, (req, res) => {
  // req.user contains decoded JWT payload
  res.json(req.user);
});
```

### Password Security
- bcryptjs for password hashing
- Salt rounds: 12
- JWT expiration: 7 days

## 📧 Email System

### Contact Form Features
- Sends emails to brianfranco013@gmail.com
- HTML and text templates
- Form validation and spam protection
- Development mode with Ethereal.email

### Email Templates
- Contact form submissions
- Order confirmations
- Weather alerts
- Market updates

## 🌐 Deployment

### Backend (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy from main branch

### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in frontend directory
3. Configure environment variables

### Environment Variables for Production
```env
# Backend (Render)
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_jwt_secret
OPENWEATHER_API_KEY=your_production_key
EMAIL_USER=production-email@gmail.com
EMAIL_PASS=app-password

# Frontend (Vercel)
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test

# Run specific test
npm test -- integration.test.js

# Test with coverage
npm run test:coverage
```

### Frontend Testing
```bash
cd frontend
npm test

# Run in watch mode
npm test -- --watch
```

### API Testing Script
```bash
cd backend
node test-api.js
```

## 📊 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis
- Caching strategies

### Backend
- Database indexing
- Query optimization
- Response compression
- Rate limiting

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Include tests for new features
- Update documentation accordingly

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB service
sudo systemctl start mongod
```

**Port Already in Use**
```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process
kill -9 <PID>
```

**Environment Variables Not Loading**
```bash
# Check if .env file exists
ls -la backend/.env

# Verify variable names match code
grep process.env backend/server.js
```

### Debug Mode
Enable detailed logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 📈 Future Enhancements

### Planned Features
- [ ] Mobile app (React Native)
- [ ] Payment integration (M-Pesa)
- [ ] AI-powered crop disease detection
- [ ] Supply chain tracking
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] IoT sensor integration
- [ ] Carbon footprint calculator

### Integration Opportunities
- Weather data APIs (OpenWeather, IBM Weather)
- Agricultural databases (FAO, USDA)
- Mobile money platforms
- Government agricultural extensions

## 👥 Team

- **Brian Franco** - Project Lead & Full Stack Developer
- **Open Source Contributors** - Community development

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- United Nations Sustainable Development Goals
- OpenWeatherMap for weather data API
- Material-UI for design components
- MongoDB Atlas for database hosting
- Render & Vercel for deployment services

## 📞 Support

For support, email brianfranco595@gmail.com or create an issue in the GitHub repository.

## 🔗 Links

- [Live Demo](https://mkulimaconnect3.vercel.app/)
- [API Documentation](https://mkulimaconnect-3.onrender.com)
- [Frontend Repository](https://github.com/your-username/mkulimaconnect-frontend)
- [Backend Repository](https://github.com/your-username/mkulimaconnect-backend)

---

<div align="center">

**Built with ❤️ for sustainable agriculture in Kenya**

*Empowering farmers, connecting communities, building climate resilience*

</div>
