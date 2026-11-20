#!/usr/bin/env python3
"""Paste the influenza fit's table (experiments/out_flu_table.txt, from flu_table.sh) into src/params.js."""
import json, os, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
rows = sorted((json.loads(l) for l in open(os.path.join(ROOT, 'experiments', 'out_flu_table.txt')) if l.strip()), key=lambda r: r['closeShare'])
body = ',\n'.join('    { closeShare: %s, G: %s, emissionMedian: %s, trueAR: %s, staffAR: %s }' % (r['closeShare'], r['G'], r['emissionMedian'], r['trueAR'], r['staffAR']) for r in rows)
block = '''// <anchored-flu> table rows from experiments/flu_table.sh 0.069 8 0.2 400 (pasted by experiments/flu_install.py)
// Influenza on the same footing as far as the evidence allows:
//   held:    2.3% of residents with a reported infection in a season (CDC NHSN, winter 2025-26, the first complete
//            season of reporting; research/influenza_anchor.md), one infected staff member arriving every 8 days.
//   set:     one infection in three reported (so 6.9% of residents truly infected), speech multipliers as for
//            COVID-19, protection from vaccines and past infection 0.2.
//   fitted:  the virus breathed out, to give that attack rate at each close-range intensity G. The published
//            emission (0.035 quanta/h at rest) gives the model under a third of the reported infections, so it
//            cannot be held as COVID-19's is.
// Influenza has no non-room-air figure of its own. Each case uses the close-range intensity G that COVID-19 has in
// that case (the same non-room-air dose), and influenza's split is whatever the model then gives: shares.low,
// central and high are read off this table at those G, just below.
export const ANCHORED_FLU = {
  social: 2, work: 5, protection: 0.2, arrivalEveryDays: 8, reportedAR: 0.023, underReport: 3, publishedEmission: 0.035,
  shares: { min: @MIN@, max: @MAX@ },
  table: [
@BODY@,
  ],
};
// </anchored-flu>'''.replace('@MIN@', str(round(rows[0]['closeShare'] + 0.005, 2))).replace('@MAX@', str(round(rows[-1]['closeShare'] - 0.005, 2))).replace('@BODY@', body)
p = os.path.join(ROOT, 'src', 'params.js'); s = open(p).read()
s2 = re.sub(r'// <anchored-flu>.*?// </anchored-flu>', lambda m: block, s, flags=re.S); assert s2 != s or block in s
open(p, 'w').write(s2); print(len(rows), 'rows installed;', 'shares', rows[0]['closeShare'], 'to', rows[-1]['closeShare'])
