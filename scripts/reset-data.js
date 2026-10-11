// Wipes data/db.json back to the seed catalogue (quotes, accounts and messages are deleted).
require('../src/db').reset();
console.log('Data reset to seed catalogue.');
