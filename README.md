# LexConnect
# LexConnect - Legal Services Platform

A comprehensive platform connecting clients with verified lawyers, featuring blockchain-based certificate storage, booking system, and admin verification.

## Features

### For Clients
- Browse verified lawyers with profiles
- Search lawyers by name or specialization
- Book lawyers with case description
- Receive email notifications when booking is accepted
- View booking status

### For Lawyers
- Register with bar council number and certificates
- Upload certificates (stored on blockchain)
- Manage booking requests (accept/reject)
- Calendar/schedule management
- View client booking requests

### For Admins
- Review and approve lawyer registrations
- Verify certificates and background
- Grant verification badges to approved lawyers

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Blockchain**: Ethereum (Ganache for testing), Web3.js/Ethers.js
- **Authentication**: JWT
- **Email**: Nodemailer
- **UI/UX**: Framer Motion, Lucide Icons, React Hot Toast
- **Calendar**: FullCalendar

## 🚀 Quick Start (Already Set Up!)

### Run the Project

```bash
cd Lexconnect
npm run dev
```

Open: **http://localhost:3000**

**That's it!** Your MongoDB is already configured and permanent - no need to set it up again!

---

## 📋 First-Time Setup (One-Time Only)

### 1. Create Admin Account

```bash
node scripts/create-admin.js
```

**Default credentials:**
- Email: `admin@lexconnect.com`
- Password: `admin123`

### 2. Login and Start Using

1. Go to: http://localhost:3000/login
2. Login as admin, client, or lawyer
3. Start using the platform!

---

## ⚙️ Environment Variables

Your `.env` file is already configured! It should have:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lexconnect

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Blockchain (Ganache)
GANACHE_RPC_URL=http://localhost:7545
PRIVATE_KEY=your-ganache-private-key
CERTIFICATE_CONTRACT_ADDRESS=your-deployed-contract-address

# Email Configuration
ADMIN_EMAIL=admin@lexconnect.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=5242880
```

### 3. Database Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 4. Blockchain Setup (Ganache)

#### Step 1: Install Ganache
Download and install Ganache from [https://www.trufflesuite.com/ganache](https://www.trufflesuite.com/ganache)

#### Step 2: Start Ganache
1. Open Ganache
2. Create a new workspace
3. Note the RPC URL (usually `http://localhost:7545`)
4. Copy a private key from one of the accounts

#### Step 3: Deploy Smart Contract

```bash
# Install Truffle globally
npm install -g truffle

# Navigate to contracts directory
cd contracts

# Initialize Truffle (if not already done)
truffle init

# Compile contract
truffle compile

# Deploy to Ganache
truffle migrate --network ganache
```

#### Step 4: Configure Contract Address
After deployment, copy the contract address from the migration output and add it to your `.env` file as `CERTIFICATE_CONTRACT_ADDRESS`.

#### Step 5: Update Environment Variables
Add the private key from Ganache to your `.env` file as `PRIVATE_KEY`.

### 5. Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the app password in `EMAIL_PASS`

### 6. Create Uploads Directory

```bash
mkdir -p public/uploads/certificates
```

### 7. Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000)

## Blockchain Implementation Steps

### Detailed Steps for Blockchain Integration:

1. **Install Ganache**
   - Download from official website
   - Create a new workspace
   - Note the RPC URL and port

2. **Deploy Smart Contract**
   - The contract is in `contracts/CertificateStorage.sol`
   - Use Truffle to compile and deploy
   - Copy the deployed contract address

3. **Configure Environment**
   - Set `GANACHE_RPC_URL` in `.env`
   - Set `PRIVATE_KEY` from Ganache account
   - Set `CERTIFICATE_CONTRACT_ADDRESS` after deployment

4. **How It Works**
   - When a lawyer uploads a certificate:
     - File is saved to server
     - SHA-256 hash is generated
     - Hash is stored on blockchain via smart contract
     - Transaction hash is saved to database
   - This provides:
     - Immutability
     - Transparency
     - Verification capability

5. **Verification**
   - Anyone can verify a certificate by checking the blockchain
   - The hash stored on-chain matches the file hash
   - Timestamp proves when it was uploaded

## Project Structure

```
Lexconnect/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── client/            # Client dashboard
│   ├── lawyer/            # Lawyer dashboard
│   └── admin/             # Admin panel
├── components/            # React components
├── contexts/              # React contexts (Auth, Theme)
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── blockchain.ts     # Blockchain integration
│   ├── db.ts             # Database connection
│   └── email.ts          # Email utilities
├── models/                # MongoDB models
│   ├── User.ts
│   ├── Lawyer.ts
│   ├── Booking.ts
│   ├── Certificate.ts
│   └── Schedule.ts
├── pages/api/             # API routes
│   ├── auth/             # Authentication endpoints
│   ├── lawyers/           # Lawyer endpoints
│   ├── bookings/         # Booking endpoints
│   ├── certificates/     # Certificate endpoints
│   ├── schedule/         # Schedule endpoints
│   └── admin/            # Admin endpoints
└── contracts/             # Smart contracts
    └── CertificateStorage.sol
```

## Usage

### Register as Client
1. Go to `/register?role=client`
2. Fill in details
3. Start browsing lawyers

### Register as Lawyer
1. Go to `/register?role=lawyer`
2. Fill in all details including bar council number
3. Upload certificates (will be stored on blockchain)
4. Wait for admin approval

### Admin Approval
1. Login as admin
2. Review pending lawyer applications
3. Check certificates and background
4. Approve or reject

### Book a Lawyer
1. Client browses lawyers
2. Clicks "Book Lawyer"
3. Optionally adds case description
4. Lawyer receives request
5. Lawyer accepts/rejects
6. Client receives email notification

## Security Notes

- Change all default secrets in production
- Use strong JWT secrets
- Implement rate limiting
- Add input validation
- Use HTTPS in production
- Secure file uploads
- Validate blockchain transactions

## Future Enhancements

- Video consultation integration
- Payment gateway
- Document sharing
- Rating and review system
- Advanced search filters
- Mobile app
- Multi-language support
