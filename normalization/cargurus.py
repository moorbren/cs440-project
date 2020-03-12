import csv

with open("./cargurus.csv", "rb") as csvfile:
    readCSV = csv.reader(csvfile, delimiter=',')
    count = 0
    feilds = []
    rowsNew = []
    for row in readCSV:
        if (count == 0):
            name = "name"
            feilds.append(name)
            year = "year"
            feilds.append(year)
            price = "price"
            feilds.append(price)
            mileage = "mileage"
            feilds.append(mileage)
            color = "color"
            feilds.append(color)
            count += 1

        else:
            rowNew = []

            name = row[0] + " " + row[1]
            rowNew.append(name)
            year = row[2]
            rowNew.append(year)
            price = row[5]
            rowNew.append(price)
            mileage = row[7]
            rowNew.append(mileage)
            if (mileage == "UNKNOWN"):
                mileage = "NULL"
            color = row[6].lower()
            if (color == "unknown"):
                color = "NULL"
            rowNew.append(color)

            rowsNew.append(rowNew)
            # print(rowsNew)

with open('./cargurus(norm).csv', 'wb') as csvfileNorm: 
    # creating a csv writer object 
    csvwriter = csv.writer(csvfileNorm) 
    # writing the fields 
    csvwriter.writerow(feilds) 
    # writing the data rows 
    csvwriter.writerows(rowsNew)


