import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Simple contract ABI for certificate storage
const CERTIFICATE_STORAGE_ABI = [
  'function storeCertificate(string memory certificateHash, string memory metadata) public returns (uint256)',
  'function getCertificate(uint256 index) public view returns (string memory, string memory)',
  'function getCertificateCount() public view returns (uint256)',
  'function verifyCertificate(string memory certificateHash) public view returns (bool exists, uint256 index)',
  'event CertificateStored(uint256 indexed index, string certificateHash, string metadata)',
];

let provider: ethers.JsonRpcProvider | null = null;
let signer: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

export async function initBlockchain() {
  const RPC_URL = process.env.GANACHE_RPC_URL || 'http://localhost:7545';
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    console.warn('PRIVATE_KEY not set. Blockchain features will be disabled.');
    return null;
  }

  try {
    provider = new ethers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(PRIVATE_KEY, provider);
    
    // Contract address - you'll need to deploy this contract first
    const CONTRACT_ADDRESS = process.env.CERTIFICATE_CONTRACT_ADDRESS;
    
    if (CONTRACT_ADDRESS) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CERTIFICATE_STORAGE_ABI, signer);
    }

    return { provider, signer, contract };
  } catch (error) {
    console.error('Blockchain initialization error:', error);
    return null;
  }
}

export async function storeCertificateOnBlockchain(
  certificateHash: string,
  metadata: string
): Promise<{ txHash: string; blockNumber: number } | null> {
  if (!contract || !signer) {
    console.warn('Blockchain not initialized. Certificate hash:', certificateHash);
    return null;
  }

  try {
    const tx = await contract.storeCertificate(certificateHash, metadata);
    const receipt = await tx.wait();
    
    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error storing certificate on blockchain:', error);
    return null;
  }
}

export function generateCertificateHash(filePath: string): string {
  // In production, use a proper hash function like SHA-256
  const crypto = require('crypto');
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

export async function checkCertificateExistsOnBlockchain(certificateHash: string): Promise<boolean> {
  if (!contract) {
    // If blockchain not initialized, we can't check - return false to allow upload
    return false;
  }

  try {
    const result = await contract.verifyCertificate(certificateHash);
    return result.exists || false;
  } catch (error) {
    console.error('Error checking certificate on blockchain:', error);
    // If check fails, we'll rely on database check
    return false;
  }
}

// Steps to implement blockchain:
// 1. Install Ganache and start it (default port 7545)
// 2. Deploy the CertificateStorage contract (see contracts/CertificateStorage.sol)
// 3. Set CERTIFICATE_CONTRACT_ADDRESS in .env
// 4. Set PRIVATE_KEY from Ganache account
// 5. The system will automatically store certificate hashes on blockchain

