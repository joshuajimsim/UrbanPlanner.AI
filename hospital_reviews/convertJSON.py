import json

file = 'hospitalreviews.json'
reviewDict = {}

with open(file) as json_file:
    data = json.load(json_file)



hospitalRatings = {}



#for each clinic
for i in data:
    name = i['name']
    try:
        overallRating = i['rating']
        ratings = []
        data = {
                "document":{
                "type":"PLAIN_TEXT",
                "content":""
                },
                "encodingType": "UTF8"
                }


        #get the text from all reviews
        for review in i['reviews']:
            data["document"]["content"] = data["document"]["content"] + review['text']
            ratings.append(review['rating'])
            # print review['text']

        # print data
        hospitalRatings[name] = {'Overall rating: ': overallRating,
                                'Ratings: ': ratings
                                }

        with open('reviews/'+name +'.json', 'w') as outfile:
            json.dump(data, outfile)

    except:
        hospitalRatings[name] = {'Overall rating: ': 'null',
                                 'Ratings: ': []
                                 }

    print('completed ' + name)

with open('HospitalRatings.txt', 'w') as outfile:
    json.dump(hospitalRatings, outfile)

#get the review 'text'
#concat reviews


    # for p in data['people']:
    #     print('Name: ' + p['name'])
    #     print('Website: ' + p['website'])
    #     print('From: ' + p['from'])
    #     print('')
#
# jsonFile = open('hospitalReviewTrial.json', 'r')
# values = json.load(jsonFile)
# jsonFile.close()
#
#
# print values["name"]