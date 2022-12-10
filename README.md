# Personal Chart Project

An Angular project which allows the user to input in their own Personal Charts, and see stats relating to their charts. The CSS is lacking, but the basic functionality is there!

At the moment, it is possible to:
- Upload charts (including multiple 'series' of charts)
- See the chart runs of songs
- See the chart history of artists
- Create leaderboards of cumulative points totals in a period of time

## Setup

Before setting up, ensure MongoDb is installed on your machine.

### UI
In order to run the UI:
- navigate to `/ui`
- run `npm i`
- run `ng serve`
- in your web browser, navigate to `localhost:4200`

### Db API
In order to run the DB API:
- navigate to `/db-api`
- run `npm i`
- run `tsc`
- run `. ./environment-variables.ps1` (Windows) or `. ./environment-variables.sh` (Linux)
- run `node dist/index.js`