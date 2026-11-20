#!/bin/bash
# The influenza fit's table: one row per close-range intensity G (experiments/flu_fit.mjs), four at a time.
# bash experiments/flu_table.sh <target true attack rate> <days between arrivals> <protection> [seasons]
cd "$(dirname "$0")/.."
T=$1; D=$2; P=$3; N=${4:-400}
: > experiments/out_flu_table.txt
# G spans COVID-19's fitted values (0.23, 0.40 and 1.11 at 20%, 30% and 50% non-room-air spread) and the slider's range.
for pair in "0.1 0.15 0.23 0.3" "0.4 0.55 0.8 1.11" "1.6 2.4 3.6 5" "7 10"; do
  for G in $pair; do node experiments/flu_fit.mjs $G $T $D $P $N >> experiments/out_flu_table.txt & done; wait
done
sort -t: -k2 -n experiments/out_flu_table.txt
