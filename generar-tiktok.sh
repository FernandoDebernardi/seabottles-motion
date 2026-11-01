#!/bin/bash
# Genera un video de la serie viral de TikTok: música desde el JSON + render + volumen a -14 LUFS.
# Uso: ./generar-tiktok.sh piezas/tiktok/<pieza>.json [--scale=0.5]
set -e
j="$1"; n=$(basename "$j" .json)
node musica-tiktok.mjs "$j" "public/audio/tiktok-$n.wav"
python3 -c "import json,sys; d=json.load(open('$j')); d['musica_archivo']='audio/tiktok-$n.wav'; json.dump(d,open('out/$n.props.json','w'),ensure_ascii=False)"
CH=${CHROME:-/opt/pw-browsers/chromium-1243/chrome-linux64/chrome}
npx remotion render TikTokSerie "out/$n-raw.mp4" --props="out/$n.props.json" --codec=h264 --crf=18 --log=error --concurrency=2 --browser-executable="$CH" ${2:-}
ffmpeg -loglevel error -y -i "out/$n-raw.mp4" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -movflags +faststart "out/tiktok-$n.mp4"
echo "Listo: out/tiktok-$n.mp4"
