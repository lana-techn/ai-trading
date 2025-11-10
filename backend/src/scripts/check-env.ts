/**
 * Check environment variables
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend folder
const envPath = path.join(__dirname, '../../../backend/.env');
console.log(`Loading .env from: ${envPath}\n`);

dotenv.config({ path: envPath });

console.log('🔐 Environment Variables Check:\n');
console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set (' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : '✗ Not set'}`);
console.log(`OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✓ Set (' + process.env.OPENROUTER_API_KEY.substring(0, 10) + '...)' : '✗ Not set'}`);
console.log(`ALPHA_VANTAGE_API_KEY: ${process.env.ALPHA_VANTAGE_API_KEY ? '✓ Set' : '✗ Not set'}`);
console.log(`\nNODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set'}`);
