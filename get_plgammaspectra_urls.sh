#!/bin/bash

# this will find all the ID/URL mappings for pl.gammaspectra.live
# they are all in different formats, so this will find the correct URL

wget -r --spider https://pl.gammaspectra.live/video.parler.com/


# TODO: need to actually have the data to know what to do here. it takes a long time
find pl.gammaspectra.live/video.parler.com/ -type f