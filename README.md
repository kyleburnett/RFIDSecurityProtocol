RFIDSecurityProtocol
====================

This is a repository for an RFID security protocol for the healthcare environment.

## Setup Instructions ##

1. Clone this repository.
2. Download [node](http://nodejs.org/). This should come with npm.
3. Navigate to the directory where this file resides in a command prompt.
4. Type `npm install`. This will create a directory called node modules.

There are 2 configurations. One is the original algorithm proposed by Picazo-Sanchez. The other contains the existence privacy protocol.

### Run Original Picazo Sanchez Protocol ###

1. Start the tag server with `node tag_server.js`.
2. Start the database server with `node database.js`.
3. Start the reader with `node reader.js`.

### Run Existance Privacy Protocol ###

1. Start the tag server with `node tag_server_modified.js`.
2. Start the database server with `node database.js`.
3. Start the authentication authority server with `node authentication_authority.js`.
4. Start the reader with `node reader_modified.js`.