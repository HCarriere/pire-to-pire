# pire-to-pire
## Installation
Prerequisites : 
- nodejs (6.11.1+)
- MongoDB
- (optionnal) PM2 http://pm2.keymetrics.io/

Process :
- Pull pire-to-pire
- Open an admin command prompt 
- `npm install`

Configuration :
- edit config.js
- change values if needed. Please verify your database address (database.defaultAddress)

Launching : 
either `node server.js` or `pm2 start server.js`

## Testing
Creating super administrator :
`node tests/init_admin.js`

Populating MongoDB base (warning, will erase database):
`node tests/populate.js`
