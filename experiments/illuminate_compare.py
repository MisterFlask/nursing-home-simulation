#!/usr/bin/env python3
"""Compare the model's lamp arithmetic with OSLUV's Illuminate (its engine, the guv_calcs package).

For each kind of room in the model, with the page's lamp count (one per 250 sq ft): the whole-room average
fluence rate Illuminate computes for Aerolamps, against the model's (lamp output x ceiling height / volume), and
what each implies in equivalent air changes at the model's susceptibility. Also Illuminate's exposure-limit check
against the model's mounting rule.   pip install guv-calcs
"""
import math, warnings, sys
import numpy as np
from guv_calcs import Room, Lamp
warnings.filterwarnings('ignore')
K, P_MODEL, DELIVERED = 4.4, 100.0, 0.75
MOUNT = [(2.15, 0.2), (2.3, 0.4), (2.45, 0.7), (2.6, 1.0)]
def mount(h):
    if h <= MOUNT[0][0]: return MOUNT[0][1]
    for (h0, f0), (h1, f1) in zip(MOUNT, MOUNT[1:]):
        if h <= h1: return f0 + (f1 - f0) * (h - h0) / (h1 - h0)
    return 1.0
ROOMS = [('bedroom, single', 14, 2.4, 1), ('bedroom, double', 24, 2.4, 1), ('wing lounge', 25, 2.4, 1), ('staff break room', 20, 2.4, 1),
         ('activity room', 80, 2.7, 3), ('dining room', 100, 2.7, 4), ('therapy room', 110, 2.7, 5), ('lobby', 70, 3.0, 3)]
def illuminate(area, h, n, mode, reflect):
    x = math.sqrt(area * 1.3); y = area / x
    room = Room(x=x, y=y, z=h, enable_reflectance=reflect)
    for _ in range(n): room.place_lamp(Lamp.from_keyword('aerolamp'), mode=mode)
    room.add_standard_zones(); room.calculate()
    z = room.zone('WholeRoomFluence'); v = np.asarray(z.get_values() if hasattr(z, 'get_values') else z.values)
    chk = room.check_lamps()
    return float(v.mean()), sum(l.get_total_power() for l in room.lamps.values()), chk
print(f"{'room':18s} {'m2':>4s} {'h':>4s} {'n':>2s} | {'Illuminate uW/cm2':^29s} | {'model uW/cm2':^19s} | {'eACH: Illuminate':^17s} {'model':^13s} | Illuminate limits check (downlight)")
print(f"{'':18s} {'':>4s} {'':>4s} {'':>2s} | {'down':>6s} {'down,':>7s} {'corner':>7s} {'edge':>6s} | {'plain':>6s} {'as used':>8s}    | {'down':>6s} {'corner':>7s}   {'plain':>6s} {'used':>6s} |")
print(f"{'':18s} {'':>4s} {'':>4s} {'':>2s} | {'':>6s} {'no refl':>7s} {'':>7s} {'':>6s} | {'':>6s} {'':>8s}    |")
for name, area, h, n in ROOMS:
    d, pw, chk = illuminate(area, h, n, 'downlight', True); d0, _, _ = illuminate(area, h, n, 'downlight', False)
    c, _, _ = illuminate(area, h, n, 'corner', True); e, _, _ = illuminate(area, h, n, 'edge', True)
    plain = n * P_MODEL / (10 * area); used = plain * mount(h) * DELIVERED
    lim = f"skin {'ok' if chk.is_skin_compliant else 'over'}, eye {'ok' if chk.is_eye_compliant else 'over'}; dim to skin {chk.skin_dimming_for_compliance}, eye {chk.eye_dimming_for_compliance}; max skin {chk.max_skin_dose:.0f}, eye {chk.max_eye_dose:.0f}"
    print(f"{name:18s} {area:4d} {h:4.1f} {n:2d} | {d:6.2f} {d0:7.2f} {c:7.2f} {e:6.2f} | {plain:6.2f} {used:8.2f}    | {3.6 * K * d:6.1f} {3.6 * K * c:7.1f}   {3.6 * K * plain:6.1f} {3.6 * K * used:6.1f} | {lim}")
print('Aerolamp output in Illuminate (mW):', round(pw / n, 1), '| model: 100')
