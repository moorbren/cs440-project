# cs440-project

## Install/Setup
Install NodeJS
$git clone thisrepoURL
From project root folder:
$npm install

## Website (server/server.js)
From the project root folder:
$npm start
Navigate to localhost:39761

## Uploader (scripts/kbb.js)
We also have other branches for some of the other scrapers we used on other sites. You can run these in a similar way, just change the kbb in the run command to the name of the new script. (Note, cargurus.js in cargurus branch got lost, so there is no way to replicate the code. It used very similar methods as the other scrapers.)

KBB.com:  'npm run kbb'

Normalize:  'npm run normalize'

## Main normalizer (scripts/normalize-all.js)
This combines all the data files listed in data/ into a single file and performs some final update operations. 
Each file should indicate which columns are which in the first line and special operations can be requested on certain columns.

  EX: Labeling a column 'mileage_km' will convert it to miles and then set mileage based on what the converted value is. 
  
## Uploader (scripts/uploader.js)
What we used to upload our data since the GUI got stuck about ~500000 rows in

## Initial Normalizer (normalization/edmunds.py, normalization/cars.py, normalization/cargurus.py)
These were used to take the edmunds, cars.com, and cargurus.com data and remove uneccessary columns and split strings to make new columns.
$ python filename

