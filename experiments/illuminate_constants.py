#!/usr/bin/env python3
"""The lamp-side constants the model takes from OSLUV's Illuminate (its engine, guv_calcs), with their citations.

  k        how easily 222 nm far-UVC inactivates each virus in air, in cm2/mJ. From Illuminate's table of published
           inactivation constants ("UVC Inactivation Constants.csv"): the rows for the species, in aerosol, at the
           lamp's wavelength. Each row's constant is k1(1 - f) + k2 f, as in Illuminate's eACH_UV, so a row with a
           resistant fraction counts at its combined rate. The model's low, central and high are the lowest, median
           and highest row, which is the rule Illuminate applies to a reference organism (efficacy.each_uv_range in
           its source at github.com/jvbelenky/guv-calcs, written after release 0.10.0; checked against it below when
           that source is given as the first argument).
  lamp     the Aerolamp's total output and wavelength, from Illuminate's lamp file, and the 8-hour limits its
           exposure check applies to it (ANSI/IES RP-27.1-22, ACGIH).

python3 experiments/illuminate_constants.py [path/to/guv-calcs/src] [--install]
Writes src/illuminate-constants.json; --install pastes it into src/params.js.   pip install guv-calcs
"""
import json, math, os, re, sys, warnings
import numpy as np
import pandas as pd
import guv_calcs
from guv_calcs import Lamp, Room
from guv_calcs.efficacy import InactivationData, eACH_UV
from guv_calcs.efficacy._kinetics import parse_resistant
warnings.filterwarnings('ignore')
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SPECIES = {'covid': 'Human coronavirus', 'flu': 'Influenza virus'}
lamp = Lamp.from_keyword('aerolamp')
WV = float(lamp.wavelength)

def short(ref):
    """A short citation from the table's Reference text."""
    ref = str(ref).replace('Â', '').replace(' ', ' ').strip()
    known = [('Kitagawa', 'Kitagawa 2023, conference presentation'), ('OSLUV reanalysis', 'OSLUV reanalysis of Welch et al. 2022, unpublished'),
             ('Welch 2022', 'Welch et al. 2022'), ('Buonanno M, Welch D, Shuryak', 'Buonanno et al. 2020'), ('Buonanno, M., Kleiman', 'Buonanno et al. 2024'),
             ('Welch D, Buonanno M, Grilj', 'Welch et al. 2018'), ('Lu, Y. H., X. R. Shi', 'Lu et al. 2025'), ('Romay', 'Romay et al. 2025')]
    for key, name in known:
        if key in ref: return name
    return ref[:60]

df = InactivationData.get_full()
out = {'source': f'OSLUV Illuminate (guv_calcs {guv_calcs.__version__}), table "UVC Inactivation Constants": rows for the species in aerosol at {WV:g} nm; lowest, median and highest of k1(1 - f) + k2 f',
       'wavelength': WV, 'k': {}}
for key, species in SPECIES.items():
    rows = df[(df['Species'] == species) & (df['Medium'] == 'Aerosol') & (df['wavelength [nm]'].round() == round(WV)) & df['k1 [cm2/mJ]'].notna()]
    items = []
    for _, r in rows.iterrows():
        k1 = float(r['k1 [cm2/mJ]']); k2 = 0.0 if pd.isna(r['k2 [cm2/mJ]']) else float(r['k2 [cm2/mJ]']); f = parse_resistant(r['% resistant'])
        k = eACH_UV(1.0, k1, k2, f) / 3.6                                   # Illuminate's own combination of the two rates
        strain = '' if pd.isna(r['Strain']) else str(r['Strain']).strip(); cond = '' if pd.isna(r['Condition']) else str(r['Condition']).strip()
        link = '' if pd.isna(r['Link']) else str(r['Link']).strip()
        items.append({'raw': k, 'k': round(k, 2), 'k1': k1, 'k2': k2, 'resistant': round(f, 4), 'strain': strain, 'condition': cond, 'ref': short(r['Reference']), 'url': link})
    items.sort(key=lambda x: x['raw'])
    ks = [x.pop('raw') for x in items]
    out['k'][key] = {'species': species, 'low': round(min(ks), 2), 'central': round(float(np.median(ks)), 2), 'high': round(max(ks), 2), 'rows': items}
    print(key, species, [x['k'] for x in items], '->', out['k'][key]['low'], out['k'][key]['central'], out['k'][key]['high'])
    for x in items: print('   ', x['k'], '|', x['strain'], '|', x['condition'], '|', x['ref'], '|', x['url'])

room = Room(x=4, y=3, z=2.4)
skin, eye = lamp.get_tlvs(room.standard)
out['lamp'] = {'name': 'Aerolamp', 'outputMw': round(float(lamp.get_total_power()), 1), 'wavelength': WV,
               'skinLimit': round(float(skin), 1), 'eyeLimit': round(float(eye), 1), 'standard': str(room.standard.label) if hasattr(room.standard, 'label') else str(room.standard)}
print('lamp', out['lamp'])

# Check against Illuminate's own range function, from its current source, when given.
src = next((a for a in sys.argv[1:] if not a.startswith('--')), None)
if src:
    import subprocess
    code = ("import json,sys; from guv_calcs.efficacy import each_uv_range; "
            "print(json.dumps({s: [v / 3.6 for v in each_uv_range({%r: 1.0}, s)[0][%r]] for s in %r}))" % (WV, WV, list(SPECIES.values())))
    got = json.loads(subprocess.run([sys.executable, '-c', code], env={**os.environ, 'PYTHONPATH': src}, capture_output=True, text=True, check=True).stdout)
    for key, species in SPECIES.items():
        a = [out['k'][key][e] for e in ('low', 'central', 'high')]; b = got[species]
        assert all(abs(x - y) < 0.006 for x, y in zip(a, b)), (key, a, b)
        print(f'matches each_uv_range for {species}:', [round(v, 3) for v in b])

json.dump(out, open(os.path.join(ROOT, 'src', 'illuminate-constants.json'), 'w'), indent=1)
if '--install' in sys.argv:
    p = os.path.join(ROOT, 'src', 'params.js'); s = open(p).read(); tag = 'illuminate-constants'
    block = f'// <{tag}> generated by experiments/illuminate_constants.py; do not edit by hand\nexport const ILLUMINATE = ' + json.dumps(out) + f';\n// </{tag}>'
    s = re.sub(rf'// <{tag}>.*?// </{tag}>', lambda m: block, s, flags=re.S) if f'// <{tag}>' in s else s + '\n' + block + '\n'
    open(p, 'w').write(s); print('installed in src/params.js')
