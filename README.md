# AgentVerse - Decentralized AI Agent Marketplace & Bounty Board

A production-grade decentralized platform for AI agents with programmable wallets, pay-per-use monetization, and automated bounty management.

## 🚀 Features

### Core Functionality
- **AI Agent Marketplace**: Deploy, discover, and monetize AI agents
- **Bounty Board**: Create and manage bug bounties with automated analysis
- **Pay-per-Use Monetization**: Real-time billing with Coinbase x402pay
- **Programmable Wallets**: CDP Wallet integration for automated payments
- **Decentralized Storage**: IPFS integration via Pinata
- **Real-time Analytics**: Comprehensive dashboard with usage metrics

### Technical Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, ConnectKit
- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **AI Integration**: OpenAI GPT-4, Anthropic Claude
- **Blockchain**: Ethereum (Sepolia), Polygon (Mumbai), Base (Sepolia)
- **Payments**: Coinbase x402pay, CDP Wallet
- **Storage**: Pinata IPFS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   External      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│ • ConnectKit    │    │ • REST API      │    │ • OpenAI        │
│ • Tailwind UI   │    │ • Prisma ORM    │    │ • Anthropic     │
│ • Wallet Connect│    │ • JWT Auth      │    │ • x402pay       │
│ • Real-time UI  │    │ • AgentKit      │    │ • CDP Wallet    │
└─────────────────┘    └─────────────────┘    │ • Pinata IPFS   │
                                              └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Git
- MetaMask or compatible Web3 wallet
- API keys for:
  - OpenAI
  - Anthropic
  - Coinbase x402pay
  - Coinbase CDP Wallet
  - Pinata IPFS
  - WalletConnect Cloud

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd B-dApp
```

### 2. Backend Setup
```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/agentverse"

# JWT
JWT_SECRET="your-jwt-secret"

# AI APIs
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"

# Coinbase APIs
X402PAY_API_KEY="your-x402pay-key"
CDP_WALLET_API_KEY="your-cdp-wallet-key"

# Pinata
PINATA_API_KEY="your-pinata-key"
PINATA_SECRET_KEY="your-pinata-secret"

# App
PORT=4101
NODE_ENV=development
```

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Frontend Setup
```bash
cd ../agentverse
npm install

# Set up environment variables
cp .env.example .env
```

Configure your `.env` file:
```env
# Backend API
NEXT_PUBLIC_API_URL="http://localhost:4101"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"

# App
NEXT_PUBLIC_APP_NAME="AgentVerse"
```

## 🚀 Running the Application

### Development Mode

1. **Start Backend Server**
```bash
cd backend
npm run start:dev
```
Backend will be available at `http://localhost:4101`

2. **Start Frontend Server**
```bash
cd agentverse
npm run dev
```
Frontend will be available at `http://localhost:9002`

### Production Mode

1. **Build and Start Backend**
```bash
cd backend
npm run build
npm run start:prod
```

2. **Build and Start Frontend**
```bash
cd agentverse
npm run build
npm start
```

## 📱 Usage

### For Users
1. **Connect Wallet**: Use MetaMask or any Web3 wallet
2. **Browse Agents**: Discover AI agents in the marketplace
3. **Execute Tasks**: Pay-per-use execution with real-time billing
4. **Submit Bounties**: Create bug bounties with automated analysis
5. **Track Analytics**: Monitor usage and earnings

### For Agent Developers
1. **Deploy Agents**: Upload agent code and metadata to IPFS
2. **Set Pricing**: Configure pay-per-use rates
3. **Monitor Performance**: Track usage analytics and earnings
4. **Manage Subscriptions**: Handle recurring payments

### For Bounty Hunters
1. **Find Bounties**: Browse available bug bounties
2. **Submit Reports**: Upload vulnerability reports
3. **Get Rewards**: Automated payment processing
4. **Track Status**: Monitor bounty approval/rejection

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - Wallet-based authentication
- `POST /auth/verify` - JWT token verification

### Agents
- `GET /agents` - List all agents
- `POST /agents` - Create new agent
- `GET /agents/:id` - Get agent details
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent
- `POST /agents/:id/execute` - Execute agent task

### Bounties
- `GET /bounties` - List all bounties
- `POST /bounties` - Create new bounty
- `GET /bounties/:id` - Get bounty details
- `POST /bounties/:id/submit` - Submit bounty report
- `PUT /bounties/:id/approve` - Approve bounty submission

### Payments
- `POST /payments/create-subscription` - Create x402pay subscription
- `POST /payments/process-payment` - Process CDP wallet payment
- `GET /payments/history` - Get payment history

### Analytics
- `GET /analytics/dashboard` - Dashboard statistics
- `GET /analytics/user-activity` - User activity metrics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test
npm run test:e2e
```

### Frontend Tests
```bash
cd agentverse
npm run test
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Configure production environment variables
2. Build the application
3. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **API Reference**: [Coming Soon]

## 🙏 Acknowledgments

- Coinbase Developer Products for x402pay and CDP Wallet
- OpenAI and Anthropic for AI capabilities
- Pinata for IPFS storage
- The Web3 community for inspiration

---

**Built with ❤️ for the decentralized future** 
