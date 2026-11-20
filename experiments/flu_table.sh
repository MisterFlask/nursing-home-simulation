#!/bin/bash
# The influenza fit's table: one row per close-range intensity G (experiments/flu_fit.mjs), two at a time.
# bash experiments/flu_table.sh <target true attack rate> <days between arrivals> <protection> [seasons]
cd "$(dirname "$0")/.."
T=$1; D=$2; P=$3; N=${4:-400}
: > experiments/out_flu_table.txt
for pair in "0.8 1.2" "1.8 2.6" "3.6 5" "7 10" "15 24" "40 70"; do
  for G in $pair; do node experiments/flu_fit.mjs $G $T $D $P $N >> experiments/out_flu_table.txt & done; wait
done
sort -t: -k2 -n experiments/out_flu_table.txt
