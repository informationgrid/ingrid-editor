IGE - NG Server
---------------

# install node js
> sudo apt-get install nodejs

# for compatibility create a symbol link from node -> nodejs
> sudo ln -s /usr/bin/nodejs /usr/bin/node

# install npm
> sudo apt-get install npm

# install mongo db
> sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
> echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
> sudo apt-get update
> sudo apt-get install -y mongodb-org

# setup db (https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04)
> sudo nano /etc/systemd/system/mongodb.service

	[Unit]
	Description=High-performance, schema-free document-oriented database
	After=network.target

	[Service]
	User=mongodb
	ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf

	[Install]
	WantedBy=multi-user.target

# start db
> sudo systemctl start mongodb

# show state of mongo db
> sudo systemctl status mongodb

# start db on system start
> sudo systemctl enable mongodb


# check out project and build
> git clone https://gitlab.wemove.com/wemove/ige-remastered.git
> npm install
> cd server & npm install
> cd ..
> npm run server
> npm run prod

# Keycloak

* Setup Realm InGrid
* Setup Client 'ige-ng' autoomatically with:
** Click on "Master" -> "Add Realm" and import InGrid-Realm file
** Click on "Manage"->"Import" and import user file
** check the following settings:
*** Client protocol: openid-connect
*** accesstype: confidential
*** valid redirect URLs: http://localhost/*
*** Web Origins: * or http://localhost:4200
** Credentials:
*** Client Id and Secret

Use this secret for requests and use public key for verify JWT. The public key can be found under
"Realm Settings->Keys->RSA->Public Key". This one has to be embedded into '-----BEGIN PUBLIC KEY-----' and '-----END PUBLIC KEY-----'.
