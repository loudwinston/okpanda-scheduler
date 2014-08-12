#!/bin/bash

cleanup()
{
  return $?
}
 
control_c()
# run if user hits control-c
{
  echo -en "\n*** Ouch! Exiting ***\n"
  exit 1
}

trap control_c SIGINT


FILES=/Users/winston/Downloads/new_karaoke/avi/*.avi
OUTPUT=/Users/winston/Downloads/new_karaoke/mp4
PROCESSED=/Users/winston/Downloads/new_karaoke/processed




FILECOUNT=0
CURRENT=1

for f in $FILES
do
	((FILECOUNT++))
done

REMAINING=$FILECOUNT
ENCODED=0

for f in $FILES
do
	((REMAINING--))	
	echo "Processing $CURRENT of $FILECOUNT, $REMAINING remaining ($f)" #>> encode.log
	((CURRENT++))

	filename=$(basename "$f")
	output1="$filename.mp4"
	output2="${output1/.avi.mp4/.mp4}"


	
	if [ ! -f "$output1" ];
	then
		if [ ! -f "$output2" ];
		then
			echo "Encoding $f";
			((ENCODED++))
			/Users/winston/HandbrakeCLI -i "$f" -o "$f.mp4" -e x264 -q 30 -B 64 -Y 240 -I -O --loose-anamorphic --crop 0:0:0:0 1>> handbrake.log 2>&1
			mv "$f" "$PROCESSED"
			mv "$f.mp4" "$OUTPUT"
		else
			echo "MP4 exists for $f, skipping ";
			mv "$f" "$PROCESSED"
		fi
	else
		echo "avi.MP4 exists for $f, skipping ";
		mv "$f" "$PROCESSED"
	fi	


	
  	
done