import pandas
import numpy
import math

class BoundingBox(object):
    """
    A 2D bounding box
    """

    def __init__(self, points):
        if len(points) == 0:
            raise ValueError("Can't compute bounding box of empty list")
        self.minx, self.miny = float("inf"), float("inf")
        self.maxx, self.maxy = float("-inf"), float("-inf")
        for x, y in points:
            # Set min coords
            if x < self.minx:
                self.minx = x
            if y < self.miny:
                self.miny = y
            # Set max coords
            if x > self.maxx:
                self.maxx = x
            elif y > self.maxy:
                self.maxy = y

    @property
    def height(self):
        return self.maxx - self.minx

    @property
    def width(self):
        return self.maxy - self.miny

    def __repr__(self):
        return "BoundingBox({}, {}, {}, {})".format(
            self.minx, self.maxx, self.miny, self.maxy)

# Distance between 2 lat/long coords
def distance(lat1, lon1, lat2, lon2):
    radlat1 = math.pi * lat1/180
    radlat2 = math.pi * lat2/180

    radlon1 = math.pi * lon1/180
    radlon2 = math.pi * lon2/180

    theta = lon1-lon2
    radtheta = math.pi * theta/180

    dist = math.sin(radlat1) * math.sin(radlat2) + math.cos(radlat1) * math.cos(radlat2) * math.cos(radtheta)
    dist = math.acos(dist)
    dist = dist * 180/math.pi
    dist = dist * 60 * 1.1515
    dist = dist * 1.609344  # Converting to km

    return dist

df = pandas.read_excel(r'C:\Users\Chris\Documents\Miscellaneous\KPMG Ideation Challenge\Hospitals\master.xlsx')
df = pandas.DataFrame(df)

# Hospital score calculation
df['SCORE'] = df['Latitude'] + df['Longitude']

# victoria
northPoint = (-34.1, 141.017)
southPoint = (-39.198611111111106, 147.0213888888889)
eastPoint = (-37.500000, 149.966667)
westPoint = (-35.148954, 140.967421)

coords = [northPoint, southPoint, eastPoint, westPoint]

sLat = (math.fabs(northPoint[0]))
sLong = (math.fabs(westPoint[1]))

# Usage example:
bbox = BoundingBox(coords)

degreeWidth = bbox.width
degreeHeight = bbox.height

stepSizeKM = 10  # km

KM_height = math.ceil(2 * math.pi * 6371 * (degreeHeight / 360))  # km
KM_width = math.ceil(2 * math.pi * 6371 * math.cos(math.radians(math.fabs(bbox.maxx))) * (degreeWidth / 360))  # km

# amount of segments across
xSteps = KM_width / stepSizeKM
ySteps = KM_height / stepSizeKM

# degree steps for lat long
longIncrement = degreeWidth / xSteps
latIncrement = degreeHeight / ySteps

scoreList = []

for i in range(0, int(xSteps)):
    for j in range(0, int(ySteps)):
        entryLat = sLat + latIncrement * j
        entryLong = sLong + longIncrement * i

        scoreList.append([entryLat, entryLong, -1.000000000])

for entry in scoreList:
    # Cumulative health score at current point in the grid
    health_score = 0

    for i in range(0, df.shape[0]-2):
        # Distance between current point and hospital i
        d = distance(entry[0], entry[1], df['Latitude'][i], df['Longitude'][i])

        # Scale hospital score, add to cumulative total
        health_score += (df['SCORE'][i])/d

    # Place cumulative score for current point in list
    entry[2] = health_score.item()

scoreList_df = pandas.DataFrame(scoreList)
output_csv = scoreList_df.to_csv(r'C:\Users\Chris\Documents\Miscellaneous\KPMG Ideation Challenge\Hospitals\output.csv', index=None, header=True)
