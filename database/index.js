const pg = require('pg');

const client = new pg.Client({
  user: 'jun',
  host: 'localhost',
  database: 'windswept',
  password: 'sd7763sd',
  port: 5432,
});

client.connect();
// client.query(
//   `CREATE TABLE users(
//     id SERIAL, 
//     username TEXT,
//     password TEXT,
//     equip JSON,
//     inv JSON,
//     PRIMARY KEY (id, username)
//   )`
// )
// client.query(
//   `CREATE TABLE itemlist(
//     itemid SERIAL,
//     itemname TEXT,
//     power INT,
//     protect INT,
//     speed INT,
//     effect1 TEXT,
//     effect2 TEXT,
//     PRIMARY KEY (itemid, itemname)
//   )`
// );

// username, password, equip, inv
// itemname, power, protect, speed, effect1, effect2

let getUserData = (user, cb) => {
  client.query(`SELECT * FROM users WHERE username='${user.username}' AND password='${user.password}';`, (err, res) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, res.rows[0]);
    }
  });
}

let addNewUser = (user, cb) => {
  client.query(`INSERT INTO users (username, password, equip, inv) VALUES ('${user.username}', '${user.password}', '{}', '[]');`, (err, res) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, res);
    }
  });
}

exports.getUserData = getUserData;
exports.addNewUser = addNewUser;

// let getReviews = (productId, cb) => {
//   client.query(`SELECT * FROM products INNER JOIN reviews ON reviews.productId = products.id WHERE id=${productId}`, (err, res) => {
//     if (err) {
//       cb(err, null);
//     }
//     cb(null, res.rows);
//   });
// }

// let incrementHelpfulness = (idd, cb) => {
//   client.query(`SELECT numhelpful FROM reviews WHERE idd = ${idd}`, (err, res) => {
//     client.query(`UPDATE reviews SET numhelpful = ${res.rows[0].numhelpful+1} WHERE idd = ${idd}`, (err, result) => {
//       cb(err, res.rows[0]);
//     });
//   });
// }

// let createReview = (data, cb) => {
//   console.log(data, typeof data.username);
//   client.query(`INSERT INTO reviews (productId, reviewId, username, stars, title, text, timestamp, numHelpful, verifiedPurchase, imageUrl) VALUES (${data.productId}, ${data.reviewId}, '${data.username}', ${data.stars}, '${data.title}', '${data.text}', '${data.timestamp}', ${data.numHelpful}, ${data.verifiedPurchase}, '${data.imageUrl}');`, (err, res) => {
//     console.log(err);
//     cb(err, null);
//   });
// }

// exports.getReviews = getReviews;
// exports.incrementHelpfulness = incrementHelpfulness;
// exports.createReview = createReview;