import csv

with open("./cars.csv", "rb") as csvfile:
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
            title = row[0].split()

            name = title[1:]
            strName = ""
            cnt = 0
            for x in name:
                strName += x
                if (len(name)-1 == cnt):
                    continue
                strName += " "
                cnt += 1
            rowNew.append(strName)
            year = title[0]
            rowNew.append(year)
            price = row[3]
            rowNew.append(price)
            mileage = row[6]
            if (mileage == "undefined"):
                mileage = "NULL"
            rowNew.append(mileage)
            color = row[4]
            rowNew.append(color)

            rowsNew.append(rowNew)
            # print(rowsNew)

with open('./cars(norm).csv', 'wb') as csvfileNorm: 
    # creating a csv writer object 
    csvwriter = csv.writer(csvfileNorm) 
    # writing the fields 
    csvwriter.writerow(feilds) 
    # writing the data rows 
    csvwriter.writerows(rowsNew)


