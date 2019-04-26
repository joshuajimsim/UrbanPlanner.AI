# Imports the Google Cloud client library
from google.cloud import language
from google.cloud.language import enums
from google.cloud.language import types

import os
import json

# Instantiates a client
client = language.LanguageServiceClient()


hospitalsDict = json.load(open("/Users/NehaWadhwa/UrbanPlanAI/HospitalRatings.txt"))
# print(hospitalsDict)


path = '/Users/NehaWadhwa/UrbanPlanAI/reviews'
for file in os.listdir(path):
    if file.endswith(".json"):
        hospitalName = file[:-5]

        hospitalReview =json.load(open(os.path.join(path, file)))
        # print(hospitalReview['document']['content'])
        text = hospitalReview['document']['content']
        # print hospitalName
        document = types.Document(
                content=text,
                type=enums.Document.Type.PLAIN_TEXT)
        sentiment = client.analyze_sentiment(document=document).document_sentiment
        # print('Sentiment: {}, {}'.format(sentiment.score, sentiment.magnitude))

        hospitalsDict[hospitalName]['Sentiment score'] = sentiment.score
        hospitalsDict[hospitalName]['Sentiment magnitude'] = sentiment.magnitude
        #
        print(hospitalName + ' ' + str(sentiment.score) + ' ' + str(sentiment.magnitude))

# print(hospitalsDict)
with open('HospitalRatings_sentiment.txt', 'w') as outfile:
    json.dump(hospitalsDict, outfile)

print('output to file')



