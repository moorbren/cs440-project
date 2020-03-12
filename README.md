# cs440-project

  KBB.com:  'npm run kbb'
Normalize:  'npm run normalize'

## Main normalizer (scripts/normalize-all.js)
This combines all the data files listed in data/ into a single file and performs some final update operations. 
Each file should indicate which columns are which in the first line and special operations can be requested on certain columns.
  -EX: Labeling a column 'mileage_km' will convert it to miles and then set mileage based on what the converted value is. 
  
## Uploader (scripts/uploader.js)
What we used to upload our data since the GUI got stuck about ~500000 rows in

