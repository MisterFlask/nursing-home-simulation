# Mock-up sheet: tiny top-down characters and a new lamp mark for the care-home plan.
SK = ['#f1c9a5', '#d9a273', '#a86f47', '#6f4a33']
def pawn(x, y, kind='resident', state='s', skin=0, s=1.0, hair=None, th='l'):
    cloth = {'resident': '#c9b79a', 'aide': '#4f8fd6', 'nurse': '#2f9e8f', 'other': '#8b8fa3'}[kind]
    hair = hair or ('#e9e9ee' if kind == 'resident' else '#3a2e2a')
    edge = '#1d2030' if th == 'l' else '#0b0d13'
    halo = {'s': '', 'e': '<circle r="7.2" cy="0.6" fill="none" stroke="#e39a00" stroke-width="1.6"/>',
            'i': '<circle r="8" cy="0.6" fill="#e0453f" fill-opacity=".28"/><circle r="7.2" cy="0.6" fill="none" stroke="#e0453f" stroke-width="1.6"/>',
            'r': '<circle r="7.2" cy="0.6" fill="none" stroke="#8a8fa3" stroke-width="1" stroke-dasharray="2 2"/>'}[state]
    return f'''<g transform="translate({x},{y}) scale({s})">{halo}
  <path d="M-4.6,1.2 q0,-3.4 4.6,-3.4 q4.6,0 4.6,3.4 v2.2 q0,2.6 -4.6,2.6 q-4.6,0 -4.6,-2.6z" fill="{cloth}" stroke="{edge}" stroke-width=".7"/>
  <circle cy="-2.6" r="3.3" fill="{SK[skin]}" stroke="{edge}" stroke-width=".7"/>
  <path d="M-3.3,-2.9 a3.3,3.3 0 0 1 6.6,0 q-3.3,-1.7 -6.6,0z" fill="{hair}" stroke="{edge}" stroke-width=".5"/></g>'''
def lampA(x, y, s=1.0):   # glow puck
    return f'''<g transform="translate({x},{y}) scale({s})"><circle r="15" fill="url(#glow)"/><circle r="4.2" fill="#2b2f3f"/><circle r="2.6" fill="#b9aefc"/><circle r="1" fill="#fff"/></g>'''
def lampB(x, y, s=1.0):   # ceiling fixture with rays
    rays = ''.join(f'<line x1="0" y1="-7" x2="0" y2="-10.5" transform="rotate({a})" stroke="#7a68e8" stroke-width="1.3" stroke-linecap="round"/>' for a in range(0, 360, 45))
    return f'''<g transform="translate({x},{y}) scale({s})"><circle r="13" fill="url(#glow)"/>{rays}<rect x="-4.5" y="-4.5" width="9" height="9" rx="2" fill="#2b2f3f"/><rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="1" fill="#b9aefc"/></g>'''
def scene(ox, oy, th, lamp):
    bg, room, wall, ink, hair2 = ('#ffffff', '#fbfbfd', '#2b2f3f', '#474c60', '#dcdfe9') if th == 'l' else ('#171a23', '#1b1e29', '#c5c9dc', '#b9bdcc', '#3a3f52')
    o = [f'<g transform="translate({ox},{oy})"><rect x="-10" y="-10" width="330" height="190" fill="{bg}"/>']
    for i in range(5):
        o.append(f'<rect x="{i*31}" y="0" width="31" height="88" fill="{room}" stroke="{wall}" stroke-width="1.4"/><rect x="{i*31+5}" y="8" width="9" height="19" rx="1.5" fill="none" stroke="{hair2}"/>')
        o.append(f'<line x1="{i*31+9.5}" y1="88" x2="{i*31+21.5}" y2="88" stroke="{room}" stroke-width="3.2"/>')
    o.append(f'<rect x="155" y="0" width="155" height="88" fill="{room}" stroke="{wall}" stroke-width="1.4"/><text x="163" y="20" font-family="IBM Plex Mono, monospace" font-size="14" font-weight="500" fill="{ink}">LOUNGE</text>')
    o.append(f'<line x1="226" y1="88" x2="238" y2="88" stroke="{room}" stroke-width="3.2"/>')
    o.append(f'<rect x="0" y="88" width="310" height="54" fill="{room}" stroke="{wall}" stroke-width="1.4"/>')
    o.append(lamp(232, 52))
    P = lambda *a, **k: o.append(pawn(*a, th=th, **k))
    P(9.5, 20, 'resident', 's', 0); P(40.5, 20, 'resident', 'r', 2); P(72, 20, 'resident', 's', 1); P(82, 60, 'aide', 's', 3)
    P(103, 20, 'resident', 'e', 0); P(134.5, 20, 'resident', 's', 1)
    P(182, 46, 'resident', 's', 1); P(200, 62, 'resident', 'i', 0); P(216, 40, 'resident', 's', 2); P(262, 60, 'resident', 's', 0); P(280, 38, 'resident', 'e', 3); P(250, 34, 'aide', 's', 1)
    P(60, 112, 'nurse', 's', 2); P(120, 120, 'aide', 's', 0); P(150, 108, 'other', 's', 1); P(232, 104, 'resident', 's', 1); P(270, 122, 'aide', 'i', 2)
    o.append('</g>'); return ''.join(o)
W, H = 1040, 672
L = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="IBM Plex Sans, system-ui, sans-serif">',
     '<defs><radialGradient id="glow"><stop offset="0" stop-color="#7a68e8" stop-opacity=".45"/><stop offset="1" stop-color="#7a68e8" stop-opacity="0"/></radialGradient></defs>',
     f'<rect width="{W}" height="{H}" fill="#f3f4f8"/>']
T = lambda x, y, t, sz=13, w=400, c='#14161f': L.append(f'<text x="{x}" y="{y}" font-size="{sz}" font-weight="{w}" fill="{c}">{t}</text>')
T(28, 40, 'People', 20, 600); T(28, 60, 'Enlarged six times. Clothing shows the role; the ring shows infection status.', 13, 400, '#474c60')
for i, (k, n) in enumerate([('resident', 'Resident'), ('aide', 'Care aide'), ('nurse', 'Nurse'), ('other', 'Other staff')]):
    L.append(pawn(70 + i * 118, 122, k, 's', i, 6)); T(70 + i * 118, 190, n, 13, 500); L[-1] = L[-1].replace('<text ', '<text text-anchor="middle" ')
for i, (s, n) in enumerate([('s', 'Not infected'), ('e', 'Infected'), ('i', 'Infectious'), ('r', 'Recovered')]):
    L.append(pawn(70 + i * 118, 268, 'resident', s, 1, 6)); T(70 + i * 118, 340, n, 13, 500); L[-1] = L[-1].replace('<text ', '<text text-anchor="middle" ')
T(560, 40, 'Lamp', 20, 600); T(560, 60, 'Two options, enlarged four times. The current mark is a plain purple dot.', 13, 400, '#474c60')
L.append(lampA(640, 150, 4)); T(640, 232, 'A. Glowing disc', 13, 500); L[-1] = L[-1].replace('<text ', '<text text-anchor="middle" ')
L.append(lampB(840, 150, 4)); T(840, 232, 'B. Fixture with rays', 13, 500); L[-1] = L[-1].replace('<text ', '<text text-anchor="middle" ')
T(28, 396, 'On the plan, at about the size you would see it', 20, 600)
L.append(f'<g transform="translate(38,424) scale(1.45)">{scene(0, 0, "l", lampA)}</g>'); L.append(f'<g transform="translate(540,424) scale(1.45)">{scene(0, 0, "d", lampB)}</g>')
T(38, 660, 'Light theme, lamp A', 12, 400, '#474c60'); T(540, 660, 'Dark theme, lamp B', 12, 400, '#474c60')
L.append('</svg>'); open('mock.svg', 'w').write('\n'.join(L))
