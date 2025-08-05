# Logistic Intel - Admin Portal

A comprehensive admin dashboard for managing the Logistic Intel platform, built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Admin Functionality
- **🔐 Secure Authentication** - Role-based access control with Supabase Auth
- **📊 Real-time Dashboard** - Live platform statistics and analytics
- **👥 User Management** - Complete CRUD operations for platform users
- **📧 Campaign Monitoring** - Track and manage user campaigns
- **🔧 Widget Analytics** - Monitor widget usage and performance
- **📬 Email Activity Feed** - Comprehensive email tracking and analytics
- **🌐 API Health Monitoring** - Real-time external API status tracking
- **🎫 Feedback & Bug Tracker** - Integrated ticket management system

### Technical Features
- **📱 Responsive Design** - Mobile-first responsive interface
- **📈 Interactive Charts** - Beautiful data visualizations with Chart.js
- **🔍 Advanced Filtering** - Search, sort, and filter across all data
- **📤 Data Export** - CSV export functionality for all datasets
- **⚡ Real-time Updates** - Live data refresh every 30 seconds
- **🎨 Modern UI** - Clean, professional interface with Tailwind CSS

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd logistic-intel-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   # ... other variables
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin portal routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── users/         # User management
│   │   ├── campaigns/     # Campaign monitoring
│   │   ├── widgets/       # Widget analytics
│   │   ├── emails/        # Email activity
│   │   ├── api-status/    # API health monitoring
│   │   ├── feedback/      # Feedback & bug tracker
│   │   └── login/         # Admin authentication
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── AdminLayout.tsx    # Main admin layout
│   ├── charts/           # Chart components
│   └── UserManagement/   # User management components
├── lib/                  # Utility functions
│   └── supabase.ts      # Supabase client & mock data
└── types/               # TypeScript type definitions
    └── admin.ts         # Admin portal types
```

## 🔑 Authentication

The admin portal uses Supabase Auth with role-based access control:

### Demo Credentials
- **Email**: `admin@logisticintel.com`
- **Password**: `demo123`

### Setting Up Authentication

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key

2. **Set up Admin Users Table**
   ```sql
   CREATE TABLE admin_users (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     email TEXT NOT NULL,
     role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     last_login TIMESTAMP WITH TIME ZONE
   );
   ```

3. **Create Admin User**
   ```sql
   -- First create user in auth.users via Supabase Auth
   -- Then add to admin_users table
   INSERT INTO admin_users (id, email, role)
   VALUES ('user-uuid', 'admin@logisticintel.com', 'admin');
   ```

## 📊 Dashboard Features

### Main Dashboard
- **Platform Overview**: Total users, campaigns, widgets in use
- **Real-time Metrics**: Live updates every 30 seconds
- **Interactive Charts**: User growth, widget usage, campaign performance
- **Top Users**: Most active platform users

### User Management
- **User CRUD**: Create, read, update, delete users
- **Role Management**: Trial, Pro, Enterprise tiers
- **Bulk Operations**: Select and perform actions on multiple users
- **Advanced Filtering**: Search by email, company, role, status
- **Data Export**: CSV export of user data

### Campaign Monitor
- **Campaign Analytics**: Open rates, click rates, reply rates
- **Status Management**: Pause, resume, delete campaigns
- **Performance Metrics**: Detailed campaign statistics
- **Filtering & Search**: Find campaigns by user, company, type

### Widget Analytics
- **Usage Statistics**: Track widget interactions
- **Performance Monitoring**: Response times, error rates
- **User Engagement**: Active users per widget
- **Health Status**: Widget operational status

### Email Activity Feed
- **Email Tracking**: All platform email communications
- **Status Monitoring**: Sent, delivered, opened, clicked, bounced
- **Domain Analytics**: Performance by recipient domain
- **Advanced Filtering**: Date range, status, domain filters

### API Health Monitor
- **Real-time Status**: Live API endpoint monitoring
- **Uptime Tracking**: Historical uptime percentages
- **Response Times**: Average response time monitoring
- **Incident Management**: Recent incidents and resolutions
- **SLO Tracking**: Service Level Objective monitoring

### Feedback & Bug Tracker
- **Ticket Management**: Bug reports, feature requests, support
- **Priority Assignment**: Urgent, high, medium, low priorities
- **Team Assignment**: Assign tickets to development teams
- **Status Tracking**: New, in progress, resolved, closed
- **Analytics**: Ticket type and status distribution

## 🎨 UI Components

### Reusable Components
- **StatsCard**: Metric display cards with trend indicators
- **UsageChart**: Chart.js wrapper for line, bar, and doughnut charts
- **UserTable**: Advanced data table with sorting and filtering
- **AdminLayout**: Main layout with navigation and authentication

### Design System
- **Colors**: Professional blue, green, purple, orange color palette
- **Typography**: Inter font family for modern readability
- **Spacing**: Consistent 6px grid system
- **Components**: Tailwind CSS utility classes

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional (for production)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
COMTRADE_API_KEY=your-comtrade-api-key
US_CENSUS_API_KEY=your-us-census-api-key
DATAFORSEO_API_KEY=your-dataforseo-api-key
```

### Mock Data
The application includes comprehensive mock data for demonstration:
- 1000+ users across different tiers
- Campaign performance metrics
- Widget usage statistics
- Email activity logs
- API endpoint status
- Feedback and bug reports

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect Repository**
   - Import project to Vercel
   - Connect your Git repository

2. **Configure Environment Variables**
   - Add all required environment variables
   - Set `NODE_ENV=production`

3. **Deploy**
   - Vercel will automatically build and deploy
   - Get your production URL

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- **Netlify**: Static site generation support
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform deployment

## 🔒 Security

### Authentication Security
- JWT-based authentication with Supabase
- Role-based access control (RBAC)
- Secure session management
- Protected API routes

### Data Security
- All API calls authenticated
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📈 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js image optimization
- **Caching**: Static generation where possible
- **Bundle Analysis**: Optimized bundle sizes

### Monitoring
- Real-time performance metrics
- Error tracking and logging
- User activity monitoring
- API response time tracking

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write descriptive commit messages
- Add JSDoc comments for functions
- Test all functionality before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Email**: Contact the development team

## 🎯 Roadmap

### Upcoming Features
- [ ] Real-time notifications system
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] API rate limiting dashboard
- [ ] Automated reporting system
- [ ] Mobile app for admin tasks

### Version History
- **v1.0.0**: Initial release with core admin functionality
- **v1.1.0**: Enhanced charts and analytics (planned)
- **v1.2.0**: Real-time notifications (planned)

---

**Built with ❤️ for Logistic Intel Platform Management**