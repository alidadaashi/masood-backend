# itg-nbk-vsrm

##### Prerequisites
    1- nodejs v16.15.0,
    
    2- postgres vsql 14.5
    
    3- redis-server 6.0.16
    
    4- Linux. Ubuntu 22.04.1 LTS (preferred)
    
    5- Nginx
    
    
##### Setup
* Place itg-nbk-vsrm project folder and itg-nfe-vsrm project folder side by side. ie the parent folder of both should be same. Both are sibling folders.
* In postgresql, create database, user and give access to that user.
* then `\c <database name>`
* then `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
* then `CREATE EXTENSION IF NOT EXISTS tablefunc;`
* If in production server: Paste this in `/etc/nginx/sites-available/itg.conf` , `server_name` value, save, add symlink in sites-enabled folder, restart nginx.
```
server {
    server_name vsrmfe1.vsrm.net; ## frontend
    root /tmp/vsrm;
    location / {
        proxy_pass http://127.0.0.1:5321;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}

server {
    server_name vsrmbk1.vsrm.net;  ## backend
    root /tmp/vsrm;
    location / {
        proxy_pass http://127.0.0.1:4321;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
* It is implied that dns records were created already.

##### How to deploy on live production server (NOT for development environment)
* `npm i`
* `npm run dbReset` (**CAUTION** : Only run for the first time. Never again. Else it will erase existing records)
* `npm run inception` <-- to be run in standalone terminal (keep it running)
* `npm run prod` <-- to be run in a new standalone terminal (keep it running)

# Campaign - Production
### Setup

* Copy `src/env/cfgProductionEnv.ts-sample` to `src/env/cfgProductionEnv.ts` and enter(fill) new vsrm and old vsrm database (vedi) credentials, user, password, database name, host, port. Change `secret` in `session` object.
* Fill `allowedOrigins`. This is the domain name of the frontend website where users login.
* Also fill mailgun API key, sending email address and domain.
* Then provide vendor IDs (in old database vedi) for which you want to run campaign and database syncing/ migration. This might be koctas in the start but you can add multiple vendors like `[40000, 40999, 50000, 50007, 50162, 99992]`. Suppliers related to these will also be synced.
* Then update syncing interval (in minutes value from 1 to 9999999)



### How to add campaigns
 
### Adding External Campaigns
- To add an external campaign:
     - Hit api and get token by providing auth credentials of an instance/vendor admin at `http://<backend url>/api/external/auth`
     - Add the token in authorization and send put request at `http://<backend url>/api/external/campaigns` by prividing campaign data json in body
- login as a vendor or supplier admin to view campaign on vendor or supplier side respectively



### How to run the project for development (for local ongoing developers)
    1- npm i
    
    2- npm run dbReset 
    
    3- npm run dev
    
### How to create and run migration files (for local ongoing developers)
    1- npm i -g knex
    
    2- knex migrate:make created_table_mig_filename
    
    3- npm run dbMigrations 
    
    4- npm run dbSeeds
