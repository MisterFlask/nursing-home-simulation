#!/usr/bin/env python3
"""How much far-UV can a room's air average while Illuminate's exposure check still passes, as lamps are added?

For a few of the model's rooms: Aerolamps on the walls ("edge" placement, or "horizontal" with 'across'), 1x, 2x, 3x and 4x
the page's density, every lamp dimmed by the share Illuminate's check asks for (ANSI/IES RP-27.1-22, ACGIH limits, 8 hours).
Prints the whole-room average fluence rate left after dimming.   python3 experiments/illuminate_density.py [across]
"""
import math, sys, time, warnings
import numpy as np
from guv_calcs import Room, Lamp
warnings.filterwarnings('ignore')
MODE = 'horizontal' if 'across' in sys.argv else 'edge'
ROOMS = [('single bedroom', 14, 2.4), ('double bedroom', 24, 2.4), ('lounge', 25, 2.4), ('office', 60, 2.4), ('dining room', 100, 2.7), ('nurses station', 134, 2.4), ('lobby', 70, 3.0)]
for name, area, h in ROOMS:
    x = math.sqrt(area * 1.3); y = area / x; base = max(1, round(area / 23.2258)); out = []
    for mult in (1, 2, 3, 4):
        t = time.time(); room = Room(x=x, y=y, z=h)
        for _ in range(base * mult): room.place_lamp(Lamp.from_keyword('aerolamp'), mode=MODE)
        room.add_standard_zones(); room.calculate()
        e = float(np.asarray(room.zone('WholeRoomFluence').get_values()).mean())
        c = room.check_lamps(); dims = [d for d in (c.skin_dimming_for_compliance, c.eye_dimming_for_compliance) if d is not None]
        s = min(1.0, min(dims)) if dims else 1.0
        out.append(f'{base * mult} lamps: {e * s:.2f} uW/cm2 (dimmed to {s:.0%}, {time.time() - t:.0f}s)')
    print(f'{name} {area} m2 x {h} m | ' + ' | '.join(out), flush=True)
