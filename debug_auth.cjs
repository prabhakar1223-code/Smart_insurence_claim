// Debug script for authentication issue
const crypto = require('crypto');

// Test the email hash generation
const testEmail = "test@example.com";
const testEmail2 = "TEST@example.com";
const testEmail3 = "Test@Example.com";

console.log('Testing email hash generation:\n');

const hash1 = crypto.createHash('sha256').update(testEmail.toLowerCase()).digest('hex');
const hash2 = crypto.createHash('sha256').update(testEmail2.toLowerCase()).digest('hex');
const hash3 = crypto.createHash('sha256').update(testEmail3.toLowerCase()).digest('hex');

console.log(`Email: ${testEmail}`);
console.log(`Hash: ${hash1}\n`);

console.log(`Email: ${testEmail2} (uppercase)`);
console.log(`Hash: ${hash2}\n`);

console.log(`Email: ${testEmail3} (mixed case)`);
console.log(`Hash: ${hash3}\n`);

console.log(`Hashes match? ${hash1 === hash2 && hash2 === hash3 ? 'YES ✓' : 'NO ✗'}`);

// Check the actual users in the database
console.log('\n\nChecking current users in data/users.json:');
const fs = require('fs');
const users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));

console.log(`Total users: ${users.length}`);
users.forEach((user, i) => {
  console.log(`\nUser ${i+1}:`);
  console.log(`  ID: ${user.id}`);
  console.log(`  Email (encrypted): ${user.email.substring(0, 30)}...`);
  console.log(`  Email Hash: ${user.emailHash}`);
  console.log(`  Password hash: ${user.password.substring(0, 30)}...`);
});

// Test bcrypt comparison
console.log('\n\nTesting bcrypt password comparison:');
const bcrypt = require('bcrypt');

const testPassword = "password123";
const testHash = "$2b$10$ufOtUzTAnlSIRe9Fq04MuOX0B3SEK8U/QPhJSKhsaT7fgb1Wn85Zu"; // From first user

bcrypt.compare(testPassword, testHash, (err, result) => {
  console.log(`Password "password123" matches hash? ${result ? 'YES ✓' : 'NO ✗'}`);
  
  // Test with wrong password
  bcrypt.compare("wrongpassword", testHash, (err, result) => {
    console.log(`Password "wrongpassword" matches hash? ${result ? 'YES ✓' : 'NO ✗'}`);
    
    console.log('\n\n=== DIAGNOSIS ===');
    console.log('Possible issues:');
    console.log('1. Email case sensitivity - should be handled by .toLowerCase()');
    console.log('2. Password hashing mismatch - signup vs login');
    console.log('3. User not being saved to file properly');
    console.log('4. Server restart losing in-memory usersDB');
    console.log('5. Frontend sending wrong email/password format');
  });
});