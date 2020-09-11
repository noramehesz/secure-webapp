# Web application for one-way secure data sharing

## Tools:
* Web crypto API
  > Used for generating keys and IV-s
* [CryptoJs]( https://code.google.com/archive/p/crypto-js/)
  > Used for encrytion and decryption (AES256 in CFB mode and HmacSHA1)
* ReactJs
* [Socket.IO](https://socket.io/)
  > Used for the real-time data sharing among the clients

## To try this app run
* `node app.js` on the server side 
* `npm start` on the client side 

***

* open a client (localhost:3000 or localhost:3000/sender)
* click on the _create session_ button
* copy the given link to a new tab
* now you can write your text on the sender side which real time appears on the receiver side
