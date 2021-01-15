#!/usr/bin/env python3

import sqlite3
import json

conn = sqlite3.connect('videos.db')

c = conn.cursor()

features = []

for row in c.execute("SELECT id, time, latitude, longitude FROM videos"):
  (id, time, latitude, longitude) = row
  features.append({
    'type': 'Feature',
    'properties': {
      'id': id,
      'time': time
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [latitude, longitude]
    }
  })

data = {
  "type": "geojson",
  "data": {
    "type": "FeatureCollection",
    "features": features
  }
}

print(json.dumps(data))
