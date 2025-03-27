require('dotenv').config();

console.log('Checking environment variables...');
console.log('Process working directory:', process.cwd());
console.log('Environment variables present:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'exists' : 'missing');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'exists' : 'missing');
console.log('NODE_ENV:', process.env.NODE_ENV); 