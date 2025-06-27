# AgentVerse 

**AgentVerse** is a decentralized, AI-powered bounty board and agent marketplace. It enables users to deploy autonomous AI agents, post and complete bounties, and monetize AI services with real blockchain and payment integrations.

---

## 🚀 Features
- **AI Agent Marketplace**: Deploy, manage, and monetize autonomous AI agents
- **Bounty Board**: Post, fund, and complete bounties with on-chain rewards
- **Wallet Integration**: Connect with Coinbase CDP Wallet, WalletConnect, and testnet wallets
- **Pay-per-use Monetization**: x402pay integration for metered AI agent usage
- **Decentralized Storage**: Pinata/IPFS for agent and submission data
- **Real AI Integrations**: OpenAI, Anthropic for agent intelligence
- **Analytics Dashboard**: Real-time stats, trending bounties, featured agents
- **Production-Ready**: Next.js 15 frontend, NestJS backend, Prisma ORM, TypeScript, Tailwind CSS

---

## 🏗️ Architecture
- **Frontend**: Next.js 15 (TypeScript, Tailwind CSS)
- **Backend**: NestJS (TypeScript, Prisma ORM, REST API)
- **Integrations**:
  - Coinbase CDP Wallet, x402pay, AgentKit
  - OpenAI, Anthropic
  - Pinata (IPFS)
- **Database**: PostgreSQL (via Prisma)

---

## ⚡ Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)
- PostgreSQL (local or cloud)
- Pinata account (for IPFS)
- OpenAI API key
- Anthropic API key
- Coinbase Developer account (for CDP/x402pay)
- **WalletConnect Project ID** (get from [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/))

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/YowaiMo-Koustav/agentverse.git
cd agentverse
```

### 2. Install Dependencies
#### Backend
```bash
cd ../backend
npm install
```
#### Frontend
```bash
cd ../agentverse
npm install
```

### 3. Configure Environment Variables
Create `.env` files in both `backend/` and `agentverse/` directories. Example:

#### `backend/.env`
```
DATABASE_URL=postgresql://user:password@localhost:5432/agentverse
PINATA_API_KEY=your_pinata_key
PINATA_SECRET_API_KEY=your_pinata_secret
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
COINBASE_CLIENT_ID=your_coinbase_client_id
COINBASE_CLIENT_SECRET=your_coinbase_client_secret
X402PAY_API_KEY=your_x402pay_key
JWT_SECRET=your_jwt_secret
```

#### `agentverse/.env`
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_API_URL=http://localhost:4101
```

**Note**: To get your WalletConnect Project ID:
1. Go to [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)
2. Sign up/log in and create a new project
3. Copy the Project ID and use it in your `.env` file

### 4. Set Up the Database
```bash
cd ../backend
npx prisma migrate deploy
npx prisma generate
```

### 5. Start the Backend
```bash
npm run start:dev
# or for production
npm run build && npm run start:prod
```

### 6. Start the Frontend
```bash
cd ../agentverse
npm run dev
# or for production
npm run build && npm start
```

### 7. Access the App
- Frontend: [http://localhost:9002](http://localhost:9002)
- Backend API: [http://localhost:4101](http://localhost:4101)

---

## 🧑‍💻 Contributing
We welcome contributions! To get started:

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies** and set up your environment as above.
3. **Follow code style**: Use Prettier, ESLint, and conventional commits.
4. **Test your changes** locally (both frontend and backend).
5. **Open a Pull Request** with a clear description and link to any relevant issues.
6. For major changes, open an issue first to discuss what you'd like to change.
7. **All code must be reviewed** before merging.

### Code Style
- TypeScript for all code
- Prettier for formatting
- ESLint for linting
- Use descriptive commit messages (conventional commits)

### Reporting Issues
- Use [GitHub Issues](https://github.com/YowaiMo-Koustav/agentverse/issues) for bugs, feature requests, and questions.

---

## 🚢 Deployment
- Use environment variables for all secrets and API keys
- Deploy backend and frontend separately (Vercel, AWS, GCP, etc.)
- Use managed PostgreSQL (Supabase, Neon, Railway, etc.)
- Set up CI/CD for automated testing and deployment

---

## 📄 License
[MIT](LICENSE)

---

## 🙋‍♂️ Contact & Support
- [Open an issue](https://github.com/YowaiMo-Koustav/agentverse/issues)
- [Koustav Mallick (YowaiMo-Koustav)](https://github.com/YowaiMo-Koustav)

---

Happy hacking with AgentVerse! 🚀 
