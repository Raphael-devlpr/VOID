const bcrypt = require('bcryptjs');

// To generate a client password hash, run: node generate-client-hash.js "password"

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-client-hash.js "password"');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n=== Client Password Hash Generated ===\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this SQL to create a client:');
  console.log(`
INSERT INTO clients (email, password_hash, name, company, phone, is_active)
VALUES (
  'client@example.com',
  '${hash}',
  'Client Name',
  'Company Name',
  '+1234567890',
  true
);
  `);
  console.log('\nOr update an existing client password:');
  console.log(`
UPDATE clients 
SET password_hash = '${hash}'
WHERE email = 'client@example.com';
  `);
});
