#!/bin/sh

SRC_FILE=${1:-./src/assets/sample-from-adobe.mp4}
DIST_DIR=./src/generated/frames

if [ -d "$DIST_DIR" ]; then
  echo "Removing $DIST_DIR"
  rm -rf $DIST_DIR
  mkdir -p $DIST_DIR
fi

echo "Generating frames from video"
ffmpeg -i $SRC_FILE -r 30 -f image2 $DIST_DIR/frame%05d.png

echo "Generating index.ts"
FILES=$(ls $DIST_DIR | sed 's/.png//g')
echo "import * as THREE from 'three'" > $DIST_DIR/index.ts
for f in $FILES; do
  echo "import $f from './$f.png'" >> $DIST_DIR/index.ts
done
echo "" >> $DIST_DIR/index.ts
echo "const loader = new THREE.TextureLoader()" >> $DIST_DIR/index.ts
echo "const frames = [" >> $DIST_DIR/index.ts
for f in $FILES; do
  echo "  $f," >> $DIST_DIR/index.ts
done
echo "].map(f => loader.load(f))" >> $DIST_DIR/index.ts
echo "" >> $DIST_DIR/index.ts
echo "export default frames" >> $DIST_DIR/index.ts

echo "Done"
