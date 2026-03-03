// Generate a bcrypt hash for the password
const bcrypt = require('bcryptjs');

const password = 'Admin123!';

bcrypt.hash(password, 10, function(err, hash) {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('\n✅ Password:', password);
    console.log('✅ Hash:', hash);
    console.log('\nRun this SQL in Supabase:\n');
    console.log(`UPDATE admins SET password_hash = '${hash}' WHERE email = 'admin@voidtechsolutions.co.za';`);
    console.log('\n');
  }
});
