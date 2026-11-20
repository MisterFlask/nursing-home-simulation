#!/usr/bin/env python3
"""Reference answers from OSLUV's Illuminate (guv_calcs) for the model's own rooms, for test/illuminate.test.js.

For each room: Aerolamps placed by Illuminate ("edge", or "horizontal" for lamps pointed across), its exposure check
run for the stated hours a day, every lamp dimmed to what the check asks, the room recalculated, and the equivalent
air changes taken from Illuminate's eACH_UV at the model's central constant for coronaviruses. The JavaScript
engine has to reproduce these from its tables.   python3 experiments/illuminate_check.py   (writes test/illuminate-check.json)
"""
import json, math, os, warnings
import numpy as np
import guv_calcs
from guv_calcs import Room, Lamp
from guv_calcs.efficacy import eACH_UV
warnings.filterwarnings('ignore')
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
K = json.load(open(os.path.join(ROOT, 'src', 'illuminate-constants.json')))['k']['covid']['central']
#        name, type, floor m2, ceiling m, lamps, hours a day the limit is met over, placement
ROOMS = [('single bedroom', 'bedroom', 14, 2.4, 1, 20, 'edge'), ('double bedroom', 'bedroom', 24, 2.4, 1, 20, 'edge'), ('double bedroom, 8 hours', 'bedroom', 24, 2.4, 1, 8, 'edge'),
         ('lounge', 'lounge', 25, 2.4, 1, 8, 'edge'), ('lounge, three lamps', 'lounge', 25, 2.4, 3, 8, 'edge'), ('office', 'office', 60, 2.4, 3, 8, 'edge'),
         ('dining room', 'dining', 100, 2.7, 4, 8, 'edge'), ('dining room, eight lamps', 'dining', 100, 2.7, 8, 8, 'edge'), ('dining room, sixteen lamps', 'dining', 100, 2.7, 16, 8, 'edge'),
         ('therapy room', 'therapy', 110, 2.7, 5, 8, 'edge'), ('nurses station', 'station', 134, 2.4, 6, 8, 'edge'), ('lobby', 'lobby', 70, 3.0, 3, 8, 'edge'),
         ('dining room, across', 'dining', 100, 2.7, 4, 8, 'horizontal'), ('lounge, across', 'lounge', 25, 2.4, 1, 8, 'horizontal'), ('single bedroom, across', 'bedroom', 14, 2.4, 1, 20, 'horizontal')]
out = {'source': f'OSLUV Illuminate (guv_calcs {guv_calcs.__version__})', 'k': K, 'rooms': []}
for name, typ, area, h, n, hours, mode in ROOMS:
    x = math.sqrt(area * 1.3); y = area / x
    room = Room(x=x, y=y, z=h)
    for _ in range(n): room.place_lamp(Lamp.from_keyword('aerolamp'), mode=mode)
    room.add_standard_zones()
    for z in ('EyeLimits', 'SkinLimits'): room.zone(z).set_dose_time(hours=hours)
    room.calculate()
    c = room.check_lamps(); dims = [d for d in (c.skin_dimming_for_compliance, c.eye_dimming_for_compliance) if d is not None]
    s = min(1.0, min(dims)) if dims else 1.0
    for lamp in room.lamps.values(): lamp.scale(s)
    room.calculate()
    assert room.check_lamps().skin_dimming_for_compliance is None or room.check_lamps().skin_dimming_for_compliance > 0.995
    e = float(np.asarray(room.zone('WholeRoomFluence').get_values()).mean())
    row = {'name': name, 'type': typ, 'area': area, 'height': h, 'lamps': n, 'hours': hours, 'across': mode == 'horizontal', 'dimmedTo': round(s, 4), 'fluence': round(e, 4), 'each': round(float(eACH_UV(e, K)), 3)}
    out['rooms'].append(row); print(row, flush=True)
json.dump(out, open(os.path.join(ROOT, 'test', 'illuminate-check.json'), 'w'), indent=1)
