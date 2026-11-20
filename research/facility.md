# Facility, people and schedules: research for the nursing-home far-UVC simulation

Compiled 2026-11-11. Scope: the "building and people" side of an agent-based model of respiratory transmission in a US skilled nursing facility (SNF) of about 110-130 beds.

**Tags used throughout**
- **VERIFIED**: I read the number in the cited source.
- **INFERRED**: the number is my calculation from verified inputs, my judgment, or my memory. Wherever possible the working is shown.

I opened every source cited below. Where a page was blocked (several PubMed Central pages returned a captcha), I say so in the last section and do not cite its contents.

---

## 0. Recommended default facility

### 0.1 Headline correction to the proposed 120/80 split

| Item | Default | Range | Basis |
|---|---|---|---|
| Licensed beds | 128 (4 units × 32 beds) | 110-140 | INFERRED. AHCA gives an average of 107-109 beds per facility (VERIFIED). The user specified 110-130 beds. |
| Occupancy | 87.5% | 80-90% | National median 84.8% in 2025, from the CLA report via Skilled Nursing News (VERIFIED). AHCA says "around 80%" (VERIFIED). |
| Residents | 112 | 100-125 | INFERRED: 128 × 0.875. |
| Distinct staff in the building per weekday (24 h) | 83 | 65-100 | INFERRED from PBJ HPRD and shift ratios (see 0.2), checked against PBJ unique-employee counts. McGarry et al. 2021 report daily unique employees per facility by size quartile of 27, 46, 64 and 101 (VERIFIED), which is about 0.6 staff per resident nationally (INFERRED). |
| Weekend staff | about 70 | 55-85 | INFERRED. Administration, therapy and activities staff are reduced at weekends. |
| Visitors per day | 28 | 11-56 | INFERRED: 0.25 visits per resident per day (see section 7). |
| **People in building on a typical weekday** | **about 195 (residents + staff), about 223 with visitors** | | INFERRED |

The proposed 120 residents and 80 staff is close. For a 120-130-bed home at current US occupancy, the data point to about 105-115 residents rather than 120. Staffing scales with census at about 0.7-0.75 distinct staff per resident per weekday for a mid-to-large facility.

### 0.2 Default staff roster (weekday; 8-hour shifts: Day 07-15, Evening 15-23, Night 23-07)

Nursing hours come from PBJ national averages for Q2 2026 (VERIFIED, pbj320.com): RN 0.63, LPN 0.86 and CNA 2.29 hours per resident day (HPRD), total 3.79. At a census of 112, that gives the following daily hours (INFERRED): RN 70.6 h, LPN 96.3 h, CNA 256.5 h. These were converted to people at about 7.5 paid productive hours per 8-hour shift. The shift split follows New Jersey's statutory ratios (1 CNA per 8 residents on days, 1 per 10 on evenings, 1 per 14 on nights; VERIFIED). Those ratios happen to reproduce the PBJ CNA hours almost exactly (INFERRED).

| Role | Day | Evening | Night | Total/day | Notes |
|---|---|---|---|---|---|
| CNA / nurse aide (unit-assigned) | 14 | 11 | 8 | 33 | INFERRED. Residents per aide: 8 / 10 / 14 (NJ statute, VERIFIED). |
| CNA, restorative or bath aide (float across units) | 1 | 0 | 0 | 1 | INFERRED |
| LPN, charge or medication nurse (one per unit; plus treatment nurse on days) | 5 | 4 | 3 | 12 | INFERRED. Night: one LPN covers about 2 units. |
| RN supervisor | 1 | 1 | 1 | 3 | INFERRED. Federal rule since Feb 2026: RN on site at least 8 consecutive hours a day, 7 days a week (VERIFIED, 90 FR 2025-21792). |
| RN unit manager | 2 | 1 | 0 | 3 | INFERRED |
| DON, ADON, MDS coordinator / infection preventionist | 3 | 0 | 0 | 3 | INFERRED. Administrative RN hours fall inside PBJ total RN HPRD. |
| **Nursing subtotal** | **26** | **17** | **12** | **55** | INFERRED. Equals 0.49 nursing staff per resident per day. |
| Physical therapist / assistant | 2 | 0 | 0 | 2 | PT 9.5 minutes per resident day (MPRD), from PBJ Q1 2024 (VERIFIED), about 18 h/day (INFERRED) |
| Occupational therapist / assistant | 2 | 0 | 0 | 2 | OT 8.4 MPRD (VERIFIED), about 16 h/day (INFERRED) |
| Speech-language pathologist (part-time) | 1 | 0 | 0 | 1 | INFERRED (no national SLP figure found) |
| Activities | 2 | 1 | 0 | 3 | Activities 9.5 MPRD (VERIFIED), about 18 h/day (INFERRED) |
| Social services | 1 | 0 | 0 | 1 | Social work 5.4 MPRD (VERIFIED), about 10 h/day (INFERRED) |
| Administrator plus office (business office, admissions, HR, reception) | 5 | 0 | 0 | 5 | Administration 3.9 MPRD (VERIFIED) covers only part of this. The rest is INFERRED. |
| Dietary (cook, dietary aides, dietitian) | 5 | 4 | 0 | 9 | INFERRED. No PBJ national figure was read. |
| Housekeeping / laundry | 5 | 1 | 0 | 6 | INFERRED |
| Maintenance | 1 | 0 | 0 | 1 | INFERRED |
| **Non-nursing subtotal** | **24** | **5** | **0** | **29** (about 28 FTE-equivalents present) | |
| **Total distinct staff/day** | **50** | **22** | **12** | **83** | INFERRED |

- **Contract (agency) staff:** 5.4% of nursing hours (VERIFIED, pbj320 Q2 2026). The default is about 3 of the 55 nursing staff per day being agency staff (INFERRED).
- **Visiting clinicians:** a physician or NP and a podiatry or dental visitor attend on about 1-2 days a week each (INFERRED).

### 0.3 Default room list

**Ceiling heights:**
- 2.4 m (7.9 ft) for resident rooms and corridors. INFERRED. The Japanese care home study measured 2.4-2.7 m in rooms (VERIFIED, Ishigaki 2022).
- 2.7-3.0 m for large common rooms (INFERRED).

**How to read the ventilation columns:**
- "Total ACH" is the effective air changes per hour that remove airborne particles: outdoor air plus recirculated air times filter efficiency.
- "OA" is outdoor-air ACH.
- "Design" gives the ASHRAE 170 / FGI nursing-home minimum.
- Defaults are deliberately set *below* design for resident rooms and corridors, because measured values in older US buildings are far lower (section 3).

| Room type | Count | Floor area m² (ft²) | Ceiling m | Volume m³ | Design total / OA ACH | **Default total ACH (low-high)** | Default OA ACH (low-high) |
|---|---|---|---|---|---|---|---|
| Resident room, single | 16 (4 per unit) | 14 (151); range 11-18 | 2.4 | 33.6 | 2 / 2 | **1.5 (0.5-4)** | 1.0 (0.3-2) |
| Resident room, double | 56 (14 per unit) | 24 (258); range 20-30 | 2.4 | 57.6 | 2 / 2 | **1.5 (0.5-4)** | 1.0 (0.3-2) |
| Resident toilet room (optional zone) | 72 | 4.5 (48) | 2.4 | 10.8 | 10 exhaust / NR | 6 (2-10) exhaust | n/a |
| Unit corridor, including nurses' station alcove | 4 | 134 (1,442), 2.44 m × 55 m | 2.4 | 322 | 4 / NR | **2 (1-4)** | 0.5 (0.2-1) |
| Nurses' station (if modelled separately) | 4 | 20 (215) | 2.4 | 48 | as corridor | 2 (1-4) | 0.5 (0.2-1) |
| Unit lounge / day room | 4 | 25 (269) | 2.4 | 60 | 4 / 4 | 3 (1.5-6) | 2 (1-4) |
| Dining room (each serves 2 units, about 56 residents) | 2 | 100 (1,076) | 2.7 | 270 | 4 / 4 | **3 (1.5-6)** | 2 (1-4) |
| Activity room | 1 | 80 (861) | 2.7 | 216 | 4 / 4 | 3 (1.5-6) | 2 (1-4) |
| Therapy gym | 1 | 110 (1,184) | 2.7 | 297 | 6 / 2 | 4 (2-6) | 1.5 (1-2) |
| Staff break room | 1 | 20 (215) | 2.4 | 48 | not in 170 table | **1 (0.5-4)** | 0.7 (0.3-2) |
| Lobby / reception | 1 | 70 (753) | 3.0 | 210 | not in 170 table | 2 (1-4) | 1 (0.5-2) |
| Offices (combined, optional) | 1 | 60 (646) | 2.4 | 144 | not in 170 table | 2 (1-4) | 1 (0.5-2) |

**Sources and checks for the room list:**
- Room counts and areas are INFERRED, anchored on verified minimums:
  - FGI 2018 RES: single at least 120 ft² (11.15 m²) clear; multiple-bed rooms at least 108 ft² (10.03 m²) clear per bed (VERIFIED).
  - 42 CFR 483.90(e): at least 100 ft² single and 80 ft² per resident in multi-bed rooms; at most 4 per room, or at most 2 for homes approved or newly certified after 28 Nov 2016 (VERIFIED).
  - Oregon OAR 411-087-0300: dining + activities + living combined at least 30 ft² per bed (VERIFIED). The default gives 380 m² for 128 beds, which is 32 ft² per bed (INFERRED).
- Single/double mix: 16 of 128 beds (12.5%) are in single rooms. Zhu et al. 2022 found the facility-mean private-room share of Medicare room-and-board days was about 16% (VERIFIED).
- Occupied beds at 112 residents: 16 singles plus 40 full doubles and 16 half-empty doubles (INFERRED).
- Design ACH come from the ASHRAE 170-2021 Table 9-1 nursing-home rows (addendum c text, VERIFIED). Default and range values are INFERRED from the measured studies in section 3.

### 0.4 Default resident daily timetable (hourly blocks)

There are three resident types (INFERRED split):
- **A**, ambulatory or wheelchair, attends communal meals: 60%.
- **B**, room-oriented, eats in room and rarely leaves: 30%.
- **C**, bedbound: 10%.

Short-stay rehab residents (about 10% of census) follow A plus a therapy block.

| Hour | Type A (60%) | Type B (30%) | Type C (10%) | Close contacts |
|---|---|---|---|---|
| 00-06 | Own room (sleep) | Own room | Own room | Night CNA rounds: about 2 checks, 5 min each |
| 06-07 | Own room | Own room | Own room | Night CNA morning care starts (10-15 min) |
| 07-08 | Own room (dressing) | Own room | Own room | Day CNA personal care 15-25 min; shift handover 06:45-07:15 |
| 08-09 | **Dining room, breakfast** (45-60 min) | Own room tray | Own room tray / fed | Tablemates (4 per table); feeding assistance 5-15 min if dependent |
| 09-10 | Own room / unit lounge; rehab residents in **therapy gym** 09-10:30 | Own room | Own room | LPN medication pass 2-5 min |
| 10-11 | **Activity room group** (40% of A attend; 45-60 min) or unit lounge | Own room | Own room | Group of 10-20 |
| 11-12 | Unit lounge / corridor (gathering before lunch) | Own room | Own room | |
| 12-13 | **Dining room, lunch** | Own room tray | Own room | Tablemates; feeding assistance |
| 13-15 | Own room (rest); rehab residents in gym 13:30-14:30 | Own room | Own room | CNA toileting / repositioning 5-10 min |
| 15-16 | Activity room (25% of A) / lounge; **visits** | Own room; visits | Own room; visits | Shift handover 14:45-15:15 |
| 16-17 | Unit lounge / own room; visits | Own room | Own room | |
| 17-18 | **Dining room, dinner** | Own room tray | Own room | Tablemates |
| 18-20 | Unit lounge / TV / own room; visits | Own room | Own room | Evening CNA care 15-20 min |
| 20-24 | Own room | Own room | Own room | Evening CNA bedtime care 15-20 min; handover 22:45-23:15 |

**Resulting in-room time (INFERRED):**
- Type A: about 17 of 24 h in own room. About 7 of 16 waking hours, or 45%, which matches Siette 2022's 45% of observed time in own room (VERIFIED).
- Type B: about 23 h in own room.
- Type C: 24 h in own room.
- Facility average: about 19.5 h/day in own room.

### 0.5 Staff shift and assignment defaults

| Item | Default | Range | Tag |
|---|---|---|---|
| Shift pattern | 8 h (07-15, 15-23, 23-07) | 12 h (07-19, 19-07) at 20-40% of homes | INFERRED |
| CNA residents per aide | 8 day / 10 evening / 14 night | 7-12 / 8-14 / 12-20 | VERIFIED as NJ statutory minimum; INFERRED as national default |
| Consistent assignment (same aide, same residents) | 70% of shifts | 40-85% | INFERRED. The 80% definition and the 77% of homes using some level come from Castle & Harris 2019 (VERIFIED). |
| Aides floating to another unit on a given shift | 15% | 5-30% | INFERRED |
| LPN | 1 per unit on day/evening; 1 per 2 units at night | | INFERRED |
| Staff meal breaks | 30 min per shift, in break room, unmasked | 0-30 min | INFERRED |
| Shift handover | 15-30 min, nurses (and often aides) gathered at the nurses' station | 10-30 min | INFERRED |
| Staff working at a second nursing home | 5% | 3-15% | 5.1% of smartphones seen at least 1 h in one home were also seen at least 1 h in another (Chen et al. 2021; VERIFIED) |

### 0.6 Visitor, importation and turnover defaults (season = respiratory season)

| Item | Default | Range | Tag |
|---|---|---|---|
| Visits per resident per week | 1.75 (0.25/day) | 0.7-3.5 | INFERRED (section 7) |
| Visit duration | 75 min | 30-180 min | INFERRED. A small US family-caregiver sample had a pre-COVID mean of 135 min (VERIFIED, biased high). |
| Visit location | 60% resident room, 30% unit lounge / activity room, 10% lobby | | INFERRED |
| Daily community infection probability, staff and visitors (one pathogen, in season) | 0.10%/day | 0.02-0.30%/day | INFERRED (section 8) |
| New admissions | 4/week | 2-7/week | INFERRED from AHCA, Delaware and MedPAC data (section 9) |
| Admissions arriving infected (in season) | 1% | 0.3-3% | INFERRED (section 9) |

---

## Parameter table

| Parameter | Low | Central | High | Units | Source (author/agency, year, URL) | Notes |
|---|---|---|---|---|---|---|
| Beds per facility (US average) | | 107-109 | | beds | AHCA/NCAL Fast Facts, 2025-26, https://www.ahcancal.org/Data-and-Research/facts/Pages/default.aspx | VERIFIED. The page gives 109 in one section and 107 in another. |
| Occupancy | 75 | 84.8 | 90 | % | CLA 41st SNF Cost Comparison via Skilled Nursing News, 2026, https://skillednursingnews.com/2026/10/as-nursing-home-occupancy-growth-slows-quality-emerges-as-an-economic-flywheel-amid-managed-care-shift-cla-report/ | VERIFIED median 84.8% (2025); about 32% of SNFs below 75%. AHCA says about 80%. |
| Average daily census per facility | | 86 | | residents | pbj320, Q2 2026, https://www.pbj320.com/state/usa | VERIFIED |
| Total nurse HPRD | 3.49 | 3.79 | 4.2 | h/resident-day | pbj320 Q2 2026; LTCCC Q4 2024, https://nursinghome411.org/data/staffing/staffing-q4-2024/ | VERIFIED central 3.79. Q4 2024: 3.75 total including admin, 3.49 excluding. High is INFERRED. |
| RN HPRD | 0.42 | 0.63 | 0.9 | h/res-day | pbj320 Q2 2026; LTCCC Q4 2024 | VERIFIED 0.63; RN care staff excluding admin/DON 0.42 (Q4 2024) |
| LPN HPRD | | 0.86 | | h/res-day | pbj320 Q2 2026 | VERIFIED |
| CNA HPRD | | 2.29 | | h/res-day | pbj320 Q2 2026 | VERIFIED |
| Contract share of nurse hours | | 5.4 | | % | pbj320 Q2 2026 | VERIFIED |
| Non-nurse minutes per resident day | | PT 9.5; OT 8.4; activities 9.5; social work 5.4; admin 3.9; total 45 | | min/res-day | LTCCC Q1 2024, https://nursinghome411.org/?p=21458 | VERIFIED. Dietary and housekeeping not reported. |
| Unique employees on site per day | 27 | 52 | 101 | persons/facility | McGarry et al., Health Affairs 2021, https://escholarship.org/content/qt3fn6j0g3/qt3fn6j0g3.pdf | Quartile means 27.1/45.6/63.5/101.2 VERIFIED (Q4 2019, all PBJ job categories). 52 is my weighted mean (INFERRED). |
| Nursing staff working per week | | 64 | | persons/facility | Shen et al., JAMA Health Forum 2022, https://jamanetwork.com/journals/jama-health-forum/fullarticle/2794538 | VERIFIED "typical facility" |
| Annual staff turnover | | median 94 / mean 128 | | % | Gandhi, Yu, Grabowski, Health Affairs 2021, via https://skillednursingnews.com/2021/03/nursing-homes-have-94-staff-turnover-rate-with-even-higher-churn-at-low-rated-facilities/ | VERIFIED (2017-18 PBJ) |
| CNA residents per aide | 8/10/14 | 8/10/14 | 12/14/20 | residents | NJ Stat. 30:13-18, https://law.justia.com/codes/new-jersey/title-30/section-30-13-18/ | VERIFIED as NJ minimum (day/evening/night). High is INFERRED for understaffed homes. |
| Consistent assignment | 40 | 70 | 85 | % of shifts with same aide | Castle & Harris, Innov Aging 2019, https://rcastoragev2.blob.core.windows.net/3813822346feb6b078afdcbcaba1b827/PMC6846526.pdf | VERIFIED: 80% definition, 77% of homes use some level. Range INFERRED. |
| Aide direct-care share of shift time | | 30.7 | | % | Qian et al., BMC HSR 2012, https://link.springer.com/content/pdf/10.1186/1472-6963-12-305.pdf | VERIFIED (Australian personal care workers; about 148 min per 8-h shift) |
| CNA close-contact minutes per resident per day | 30 | 45 | 80 | min | INFERRED: 2.29 h × 31% direct = 43 min | |
| LPN/RN close-contact minutes per resident per day | 8 | 15 | 30 | min | INFERRED: medication passes plus treatments | |
| Resident-staff contacts per day (sensor, within 1.5 m facing) | | median 9 repeated contacts; 10.9 min cumulative per pair | | | Champredon et al., AIMS Public Health 2018, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6079054/ | VERIFIED (Canadian veterans LTC) |
| Mean distinct contacts | | residents 17.3; staff 3.5 | | persons | Champredon 2018 | VERIFIED (contacts of at least 1 min) |
| Distinct staff with close contact per resident per day | 4 | 7 | 12 | persons | INFERRED: 3 aides + 2-3 nurses + 0-3 others | |
| Staff seen in >1 nursing home | 3 | 5.1 | 15 | % | Chen, Chevalier, Long, NBER w27608 / PNAS 2021, https://www.nber.org/papers/w27608.pdf | VERIFIED 5.1% (during visitor restrictions). Range INFERRED. |
| Homes connected through shared staff | | 7 (6.6) | | facilities | Chen et al. 2021 | VERIFIED |
| Resident cases attributable to staff movement between homes | | 49 | | % | Chen et al. 2021 | VERIFIED (authors' estimate, early 2020) |
| Private-room share (facility mean, Medicare days) | | 16 | | % | Zhu et al., JAMDA 2022, https://rcastoragev2.blob.core.windows.net/be4b6410cda4f8e6e77d670703619960/PMC8702402.pdf | VERIFIED. Proxy from room-and-board claims. |
| Single room minimum clear area | 9.3 (CFR) | 11.15 (FGI) | | m² | FGI 2018 RES IA, https://fgiguidelines.org/wp-content/uploads/2020/08/FGI-2018-RES-Interim-Amendment-ResidentRooms_2020-08-28.pdf ; 42 CFR 483.90, https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.90 | VERIFIED |
| Multi-bed room minimum per bed | 7.4 (CFR) | 10.03 (FGI) | | m²/bed | as above | VERIFIED |
| Beds per nursing unit (MA maximum) | | 41 (Level I/II) or 60 (Level III) | | beds | 105 CMR 150.300, https://www.law.cornell.edu/regulations/massachusetts/105-CMR-150-300 | VERIFIED |
| Dining + activity + living area | | 30 (2.8 m²) | | ft²/bed | OAR 411-087-0300, https://www.law.cornell.edu/regulations/oregon/Or-Admin-Code-SS-411-087-0300 | VERIFIED (Oregon) |
| Design ACH, resident room | | 2 total / 2 OA | | h⁻¹ | ASHRAE 170-2021 Table 9-1 (addendum c), https://www.ashe.org/system/files/media/file/2021/09/170_2021_c_20210730.pdf | VERIFIED |
| Design ACH, living/activity/dining | | 4 / 4 | | h⁻¹ | same | VERIFIED |
| Design ACH, resident corridor | | 4 / NR | | h⁻¹ | same | VERIFIED |
| Design ACH, physical / occupational therapy | | 6 / 2 | | h⁻¹ | same | VERIFIED |
| Minimum filter in nursing-home table | | MERV 14 | | | same | VERIFIED. Informative Appendix D lists MERV 13 for SNF areas and MERV 14 for SNF resident rooms. |
| Washington State minimums | | room 4/2; corridor 2; gathering 4/2; PT 6/2; MERV 15 central | | h⁻¹ | WAC 388-97-4040, https://lawfilesext.leg.wa.gov/Law/WAC/WAC%20388%20%20TITLE/WAC%20388%20-%2097%20%20CHAPTER/WAC%20388%20-%2097%20-4040.htm | VERIFIED (new construction) |
| Measured ACH, resident room, door closed | | 0.67 | | h⁻¹ | Cohen et al., JOEH 2024, https://stacks.cdc.gov/view/cdc/207993 | VERIFIED mean (2 WA SNFs, CO2 tracer, no ducted HVAC to rooms) |
| Measured ACH, resident room, door open | | 3.87 | | h⁻¹ | same | VERIFIED. Mostly exchange with the corridor, not outdoor air (INFERRED). |
| Measured ACH, Japanese care home (windows closed) | 1.99 (shared) | 4.96 (private) | 6.81 (day room) | h⁻¹ | Ishigaki et al., JMIR Form Res 2022, https://formative.jmir.org/2022/12/e37587 | VERIFIED |
| Measured ACH, staff lunch room | | 0.65 | | h⁻¹ | Brass et al., Age Ageing 2022, https://academic.oup.com/ageing/article/51/12/afac316/6964928 | VERIFIED (Australia, 19 m²; 5.3 after adding a fan) |
| Share of meals eaten in dining room | 25 | 60 | 82 | % | Reed et al. 2005 (81.5%), https://healthdesign.org/system/files/Reed_Zimmerman_Sloane_Williams_Boustani-2005-CHD-KPS.pdf ; PMC1361005 Table 3 (25/39/80%), https://pmc.ncbi.nlm.nih.gov/articles/PMC1361005/table/tbl3 | VERIFIED endpoints. Central INFERRED. |
| Meal tray access time | 27 | 32 | 38 | min | PMC1361005 Table 3 | VERIFIED. Use 45-60 min dining-room occupancy, INFERRED (includes gathering and leaving). |
| Residents observed in bed 7 a.m.-7 p.m. | 26 | 40 | 50 | % | PMC1361005 Table 3 | VERIFIED group values |
| Long-stay residents spending most time in bed or chair (bedfast) | | 4.2 | | % | AHRQ NHQR 2007 (MDS 2005), https://webarchive.library.unt.edu/eot2008/20090506191128/http:/www.ahrq.gov/qual/nhqr07/effectiveness/nursinghome/T1.117A.htm | VERIFIED. Old (2005). |
| Daytime share of time in own room | 30 | 45 | 60 | % | Siette & Dodds 2022 (PLOS One, 6 Australian facilities), https://www.westernsydney.edu.au/news-centre/stories/2022/opinion-what-do-aged-care-residents-do-all-day-we-tracked-their-time-use-to-find-out | VERIFIED 45%. Range INFERRED. |
| Relatives visiting at least weekly | | 58 | | % | Weimer et al., JAMDA 2022, via https://skillednursingnews.com/2022/07/travel-time-plays-key-role-in-nursing-home-visitation-rates-amid-looming-closures/ | VERIFIED (4,350 relatives of long-stay residents) |
| Visit duration (engaged-family sample) | | mean 135, median 120 | | min | J Appl Gerontol 2022;41(6):1547, Table 2, https://pmc.ncbi.nlm.nih.gov/articles/PMC9014337/table/table2-07334648221081850 | VERIFIED. n=30, biased toward frequent visitors. |
| Flu symptomatic illnesses, 2023-24 | | 40 million | | US illnesses | CDC, https://www.cdc.gov/flu/whats-new/flu-summary-addendum-2023-2024.html | VERIFIED. About 12% of the US population (INFERRED, using 335M). |
| COVID illnesses per year | 20.2 M | 33.0-43.6 M | 64.0 M | US illnesses | Koumans et al., JAMA IM 2026, via https://www.contagionlive.com/view/cdc-calculates-continuing-burden-from-covid-19-illnesses | VERIFIED (2023-24 and 2022-23 with uncertainty intervals) |
| Influenza infections per season, unvaccinated adults | 3.0 | 5.4 | 9.8 | % per season | Kuster et al., PLoS One 2011, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3196543/ | VERIFIED (serology) |
| Influenza infections per season, unvaccinated HCWs | 15.8 | 18.7 | 22.1 | % per season | same | VERIFIED |
| Nursing-home staff COVID case rate | 6.3 | 10.9 | 21.3 | per 1,000 per week | CDC MMWR 2021;70(2), https://www.cdc.gov/mmwr/volumes/70/wr/mm7002e2.htm | VERIFIED (2020, pre-vaccine). Equals 0.09/0.16/0.30% per day (INFERRED). |
| Daily community infection probability per staff member or visitor | 0.02 | 0.10 | 0.30 | % per day | INFERRED (section 8) | |
| Admissions per licensed bed per year | | 1.69 | | /bed/yr | Delaware DHSS 2023, https://dhss.delaware.gov/wp-content/uploads/sites/4/dhcc/pdf/nursinghomeutilization2023.pdf | VERIFIED inputs (8,193 admissions / 4,859 beds); ratio INFERRED |
| Short-stay share of admissions; length of stay | | 64%; 25 days (long-stay about 3 years) | | | AHCA Fast Facts | VERIFIED |
| Medicare FFS SNF length of stay | | 30.7 | | days | MedPAC Data Book July 2026, https://www.medpac.gov/wp-content/uploads/2026/07/July2026_MedPAC_DataBook_Sec8_SEC.pdf | VERIFIED (2024) |
| New admissions | 2 | 4 | 7 | per week | INFERRED (section 9) | |
| Admission infected on arrival (COVID, Omicron surge) | | 2.1 (community origin) / 0.46 (hospital origin) | | % | RTI model (Adams et al. 2022), https://www.rti.org/insights/new-model-studies-covid-in-nursing-homes | VERIFIED as model inputs/outputs (20.86 and 4.56 per 1,000) |
| Flu outbreak trigger | | 2 lab-confirmed cases within 72 h on one unit | | | CDC interim flu LTC guidance, https://archive.cdc.gov/www_cdc_gov/flu/hcp/infection-control/ltc-facility-guidance.html | VERIFIED |
| Flu droplet precautions | | at least 7 days from onset, or 24 h after fever and symptoms resolve, whichever is longer | | | same | VERIFIED |
| Staff COVID return to work | 7 (with negative test) | 7 | 10 (no test) | days | CDC HCP guidance (archived, updated Mar 2024), https://archive.cdc.gov/www_cdc_gov/covid/hcp/infection-control/guidance-risk-assesment-hcp.html | VERIFIED |
| Exposed-person testing (COVID) | | days 1, 3, 5 | | | same; AHCA blog 2022, https://www.ahcancal.org/News-and-Communications/Blog/Pages/CDC-Releases-Updates-to-COVID-19-Infection-Prevention-and-Control-Guidance-.aspx | VERIFIED |
| Outbreak detection delay | 2 | 5 | 10 | days from first in-home infection | INFERRED | |

---

## 1. Facility composition and staffing

- **Size and occupancy.**
  - AHCA reports about 14,800-15,000 nursing homes, more than 1.3 million residents on a given day, an average of 107-109 beds, about 80% occupancy, and nearly 1.5 million employees (VERIFIED; https://www.ahcancal.org/Data-and-Research/facts/Pages/default.aspx).
  - CLA's 2025 data show a national median occupancy of 84.8%. Nearly half of SNFs are at 85% or higher and about 32% are below 75% (VERIFIED; https://skillednursingnews.com/2026/10/as-nursing-home-occupancy-growth-slows-quality-emerges-as-an-economic-flywheel-amid-managed-care-shift-cla-report/).
  - Average daily census per facility is 86 (VERIFIED; pbj320 Q2 2026, https://www.pbj320.com/state/usa).
  - A 128-bed home at about 85-88% therefore has about 109-112 residents (INFERRED).
- **Nurse staffing, hours per resident day (PBJ).**
  - Q2 2026 national values: total 3.79, RN 0.63, LPN 0.86, CNA 2.29; contract share 5.4% (VERIFIED; pbj320).
  - Q4 2024: total nurse staff 3.75 including admin/DON; care staff 3.49 excluding admin/DON; RN 0.61; RN care staff 0.42 (VERIFIED; https://nursinghome411.org/data/staffing/staffing-q4-2024/).
- **Non-nurse staffing, minutes per resident day (PBJ Q1 2024).** Total 45; activities 9.5; PT 9.5; OT 8.4; social work 5.4; administrative 3.9 (VERIFIED; https://nursinghome411.org/?p=21458). Dietary and housekeeping were not reported on that page, so my counts for them are INFERRED.
- **Federal staffing rule.** The 2024 federal minimums were repealed effective 2 Feb 2026: 3.48 total HPRD, 0.55 RN, 2.45 nurse aide, and 24/7 RN. The 2016 rule was restored: an RN at least 8 consecutive hours a day, 7 days a week, plus a full-time DON (VERIFIED; https://www.federalregister.gov/documents/2025/12/03/2025-21792/medicare-and-medicaid-programs-repeal-of-minimum-staffing-standards-for-long-term-care-facilities). The national average CNA HPRD (2.29) is still below the repealed 2.45, so many homes run leaner than the defaults (INFERRED).
- **Shift distribution.** New Jersey's statute requires 1 CNA per 8 residents on days, 1 direct-care staff per 10 on evenings (at least half CNAs), and 1 per 14 on nights (all acting as CNAs) (VERIFIED; https://law.justia.com/codes/new-jersey/title-30/section-30-13-18/). Applied to 112 residents, that gives 14 + 11 + 8 = 33 aide shifts, about 248 h, close to the PBJ-implied 256 h (INFERRED). No national per-shift PBJ breakdown was found, so the 42/33/25% day/evening/night split is INFERRED from this statute.
- **Distinct people on site per day.**
  - McGarry et al. (Health Affairs 2021) counted unique PBJ employees per day in Q4 2019, covering all job categories including administrative, housekeeping and contract staff. Means by staff-size quartile were 27.1, 45.6, 63.5 and 101.2 (VERIFIED; https://escholarship.org/content/qt3fn6j0g3/qt3fn6j0g3.pdf).
  - Shen et al. found a typical facility had 64 nursing staff working each week (VERIFIED; https://jamanetwork.com/journals/jama-health-forum/fullarticle/2794538). This "per week" figure means a much larger pool of individuals than are present on any one day.
  - My bottom-up roster (83 per weekday for 112 residents) sits between the Q3 and Q4 quartiles, which fits a larger-than-average facility.
- **Turnover.** The median annual turnover was 94% and the mean 128% (2017-18 PBJ). By role (mean): RN 140.7%, CNA 129.1%, LPN 114.1% (VERIFIED; Gandhi, Yu & Grabowski, via https://skillednursingnews.com/2021/03/nursing-homes-have-94-staff-turnover-rate-with-even-higher-churn-at-low-rated-facilities/). For the model, this means the roster of individuals is not stable over weeks. Over a 60-day simulated season, roughly 10-20% of individual staff would be replaced (INFERRED).

## 2. Physical layout

- **Units.**
  - Massachusetts caps nursing units at 41 beds (Level I/II) or 60 beds (Level III) (VERIFIED; https://www.law.cornell.edu/regulations/massachusetts/105-CMR-150-300).
  - An FGI-hosted long-term care design guide describes institutional operational groups of 20-40 residents, often about 20 per unit with two units sharing a central station. It contrasts these with 10-14 per household in small-house models (VERIFIED; https://fgiguidelines.org/wp-content/uploads/2022/10/Design-Guide-for-Long-Term-Care-Homes.pdf; I read only the first part of this long document).
  - Default: 4 units of 32 beds, about 28 residents each (INFERRED).
- **Room occupancy rules.**
  - Federal: at most 4 residents per room, or at most 2 for homes approved or certified after 28 Nov 2016. At least 80 ft² (7.4 m²) per resident in multi-bed rooms and 100 ft² (9.3 m²) in singles. Each room needs a window and direct corridor access (VERIFIED; https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-G/part-483/subpart-B/section-483.90).
  - FGI 2018 RES: at most 2 beds per room; single at least 120 ft² (11.15 m²) clear; multi-bed at least 108 ft² (10.03 m²) clear per bed; floor area excludes toilet, closets and vestibule (VERIFIED; https://fgiguidelines.org/wp-content/uploads/2020/08/FGI-2018-RES-Interim-Amendment-ResidentRooms_2020-08-28.pdf).
  - Defaults of 14 m² (single) and 24 m² (double) are INFERRED to sit just above FGI clear minimums. Older stock is often smaller and some homes still have 3-4-bed rooms.
- **Single vs shared rooms.**
  - Across 7,785 US nursing homes, the facility-mean share of Medicare room-and-board days in private rooms was about 16%, and about 83% in semi-private rooms (VERIFIED; Zhu et al., JAMDA 2022). Each 10% more private rooms was associated with about 2% fewer resident COVID cases.
  - AARP reports that most US residents live in shared rooms of two to four with a shared bathroom (VERIFIED, no figure; https://www.aarp.org/caregiving/health/info-2023/improving-overcrowded-nursing-homes-coronavirus.html).
  - Ontario data (Leece et al., as summarised by Mills & Mody, Lancet Healthy Longevity 2023) show non-COVID respiratory outbreak attack rates of 26.4% in high-crowding homes versus 13.8% in low-crowding homes (VERIFIED; https://pmc.ncbi.nlm.nih.gov/articles/PMC9977301). This is direct evidence that roommate structure matters for the model.
- **Common rooms.** Oregon requires at least 30 ft² per bed for dining, activities, visitor waiting and living combined, with a minimum of 225 ft² (VERIFIED). The federal rule requires only "sufficient space" for dining and activities (VERIFIED, 42 CFR 483.90(h)).
- **Staff break room.** The Australian study's staff lunch room was 19 m², and its two staff meeting rooms were 50 and 20 m² (VERIFIED; Brass et al. 2022).
- **Not found in any source I opened:** therapy gym, nurses' station, corridor and lobby sizes, and typical ceiling heights for US homes. These defaults are INFERRED. Corridor width of 8 ft (2.44 m) is from memory of NFPA 101 healthcare occupancy requirements (INFERRED).

## 3. Ventilation

**Design minima, ASHRAE/ASHE 170-2021 Table 9-1, nursing homes** (VERIFIED from the addendum c text hosted by ASHE: https://www.ashe.org/system/files/media/file/2021/09/170_2021_c_20210730.pdf). Values are min outdoor ACH / min total ACH.

| Space | Outdoor / total ACH | Pressure |
|---|---|---|
| Resident room | 2 / 2 | not specified |
| Resident living/activity/dining | 4 / 4 | not specified |
| Resident corridor | NR / 4 | not specified |
| Physical therapy | 2 / 6 | negative |
| Occupational therapy | 2 / 6 | not specified |
| Toilet/bathing | NR / 10 (exhausted) | negative |
| Airborne infection isolation (AII) room | 2 / 12 | negative |

- **Filters:** MERV 14 for all nursing-home rows. Informative Appendix D lists MERV 13 for SNF areas and MERV 14 for SNF resident rooms.
- **Caveat:** The fetched 2024 addendum p shows only AII, therapy and toilet rows for nursing homes (VERIFIED, OCR-garbled; https://www.ashrae.org/file%20library/technical%20resources/standards%20and%20guidelines/standards%20addenda/170_2021_p_20240830.pdf). I could not open the current consolidated standard.
- **Washington State** (new construction, WAC 388-97-4040): resident room 2 OA / 4 total; corridor 2 total; resident gathering (dining, activity) 2 OA / 4 total; PT/OT 2 OA / 6 total. Central systems need MERV 15 for resident care areas (VERIFIED).
- **These are design values for new construction.** Many US homes were built decades ago under older codes (INFERRED).

**Measured ventilation (real-world)**

| Study | Setting | Finding (VERIFIED) |
|---|---|---|
| Cohen et al., JOEH 2024, https://stacks.cdc.gov/view/cdc/207993 ; summary https://stories.cste.org/wp-content/uploads/2024/03/WA_Improve-ventilation_final.pdf | 2 Washington SNFs; CO2 tracer; 177 trials | Resident rooms averaged **0.67 ACH with the door closed** and 3.87 ACH with the door open. Neither home had ducted HVAC to resident rooms. Bathroom fans were weak or broken. An open window added about 1.5 ACH, and a window plus box fan about 1.9 ACH. |
| Ishigaki et al., JMIR Form Res 2022, https://formative.jmir.org/2022/12/e37587 | Japanese care home with an outbreak; CO2 decay | Windows closed: shared room 1.99, private room 4.96, day room 6.81 ACH. Opening windows multiplied ACH by about 2-6. Ceilings 2.4-2.7 m. |
| Brass et al., Age Ageing 2022, https://academic.oup.com/ageing/article/51/12/afac316/6964928 ; preprint https://medrxiv.org/content/10.1101/2022.05.30.22275789v1.full | 110-bed Australian home; 62 CO2 monitors | None of 45 resident/communal zones was poorly ventilated. The dining room peaked at 830 ppm at lunch. 3 of 17 staff-only rooms exceeded 1,000 ppm for 15 minutes or more. The staff lunch room measured 0.65 ACH (5.3 after adding a fan). |

- **Interpretation (INFERRED).**
  - Where a resident room has no ducted supply (common in older US homes, which often use through-wall PTAC units), outdoor air is about 0.3-1 ACH.
  - Door-open values mostly reflect mixing with the corridor. The model should therefore couple room and corridor air when doors are open rather than count it as removal.
  - Communal rooms on central air handlers are closer to design (3-6 ACH).
  - Staff-only back rooms are the most likely to be badly ventilated.
- **Recirculation and filters (INFERRED).** Central air handlers in these buildings usually recirculate most air, typically 70-85% return air when outdoor air is at the minimum. Filters in existing buildings are commonly MERV 8-13. PTAC and fan-coil units recirculate room air through coarse filters with negligible removal of respiratory aerosol. I found no US survey of filter grades actually installed in nursing homes.

## 4. Resident daily schedule

- **Time in own room.**
  - In six Australian facilities (39 residents, 312 observation hours, daytime), residents spent 45% of observed time in their own room, 47.9% alone and 25.6% inactive. Mornings were typically in lounges or activities and afternoons in their rooms. Social contact peaked at meals (VERIFIED; Siette & Dodds 2022, https://www.westernsydney.edu.au/news-centre/stories/2022/opinion-what-do-aged-care-residents-do-all-day-we-tracked-their-time-use-to-find-out ; also https://medicalxpress.com/news/2022-09-aged-residents-day-tracked.pdf).
  - A US observational table across three home quality groups found 26-50% of residents in bed between 7 a.m. and 7 p.m., and 44-52% engaged in activities (VERIFIED; https://pmc.ncbi.nlm.nih.gov/articles/PMC1361005/table/tbl3). The table page does not show the article title. I believe it is Schnelle et al., Health Services Research 2004 (INFERRED).
- **Bedbound share.** 4.2% of long-stay residents spent most of their time in bed or a chair (MDS 2005) (VERIFIED; AHRQ NHQR 2007). This is old data. The default of 10% bedbound plus 30% room-oriented is INFERRED to reconcile it with the 26-50% observed in bed during the day.
- **Meals.**
  - Share eaten in the dining room: 81.5% of observed nursing-home residents ate in the dining area at the observed meal (Reed et al., Gerontologist 2005; VERIFIED). In the PMC1361005 table, 25%, 39% and 80% of meals were eaten in the dining room across three quality groups (VERIFIED).
  - Tray access time was about 27-38 minutes, and average feeding assistance 2.5-7 minutes per resident (VERIFIED, PMC1361005 table).
  - Meal times of 08:00, 12:00 and 17:00 are INFERRED (typical US practice). No source opened gave exact times.
- **Communal-area use.** A US table comparing household-model and institutional homes (PMC6177048, Table 3; VERIFIED, https://pmc.ncbi.nlm.nih.gov/articles/PMC6177048/table/T3) reports, for observations made in public areas:

  | Location | Share of observed time |
  |---|---|
  | Dining area | 16-40% |
  | Common area | 26-41% |
  | Parked in hallways | 5-21% |
  | TV area | 9-15% |

  These are shares of time spent outside the bedroom, not of the whole day (INFERRED reading). The article title could not be opened.
- **Group activities.**
  - In two Irish dementia units, sitting rooms held on average about 9 and about 12 residents at a time during observed 2-hour sessions (VERIFIED; Morgan-Brown et al. 2011, https://salford-repository.worktribe.com/file/1436173/1/Article_MORGAN-BROWN.pdf).
  - Default sizes of 10-20 people for 45-60 minutes, once or twice a day, are INFERRED.
- **Therapy.** Short-stay rehab residents receive therapy in the gym on most weekdays. A default of 60-90 minutes a day split into two sessions is INFERRED. PBJ PT + OT time of about 18 MPRD across all residents (VERIFIED) is consistent with roughly 10-15% of residents receiving about 2 hours a day of therapist time, including individual and group sessions (INFERRED).

## 5. Care contacts

- **Assignments.** Residents per aide of 8 / 10 / 14 by shift (NJ statute, VERIFIED) are the default. Understaffed homes run 12-20 per aide (INFERRED).
- **Consistent assignment.** Consistent assignment means the same caregivers care for the same residents on about 80% of their shifts. An average of 77% of nursing homes reported using it at some level, some only at low levels (VERIFIED; Castle & Harris 2019).
- **Direct-care time.**
  - Australian personal care workers spent 30.7% of their time on direct care, about 148 minutes per 8-hour shift. At 23 residents per wing, that is about 6.4 minutes per resident per shift (VERIFIED; Qian et al. 2012).
  - US CNA time of 2.29 HPRD × about 31% direct gives about 43 minutes a day of close personal care per resident (INFERRED). This should be skewed: dependent and bedbound residents get 60-90 minutes, independent residents 10-20 minutes (INFERRED).
- **Sensor contact networks.**
  - Champredon et al. (AIMS Public Health 2018) studied a Toronto veterans LTC facility (52 residents, 64 staff; wearable proximity tags; contact = within 1.5 m and facing) (VERIFIED; https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6079054/):
    - Mean distinct contacts were 17.3 for residents and 3.5 for staff.
    - Median repeated contacts per day were 57 resident-resident (80.6 min cumulative), 9 resident-staff (10.9 min) and 5 staff-staff (5.8 min).
    - Mean contact durations were 8, 4.6 and 4.2 minutes respectively.
    - Network clustering fell to 0 overnight.
  - Herman et al. (ICHE 2020 abstract) used badges in an LTC facility. Mean dwell time per location was about 100 seconds. Nursing assistants spent much more time in resident rooms and moved between rooms more often than other roles (VERIFIED; https://www.cambridge.org/core/journals/infection-control-and-hospital-epidemiology/article/portable-easily-deployed-approach-to-measure-healthcare-professional-contact-networks-in-longterm-care-settings/D524677F2F5445043734A6DBB243D3D8).
  - Resident-resident proximity is far more frequent than resident-staff proximity (Champredon). So tablemates and lounge co-location matter as much as care contacts.
- **Distinct staff per resident per day.** About 3 aides (one per shift, more with floats) plus 2-3 nurses, plus therapy, activities and dietary staff. Default 7, range 4-12 (INFERRED).
- **Movement between units.** I found no quantified US source. The default of 15% of aide-shifts floating is INFERRED. Herman et al. confirm aides have the highest room-to-room transition rates.
- **Working at more than one facility.**
  - In smartphone location data after visitor restrictions began (2020), 5.1% of devices that spent at least 1 hour in a nursing home also spent at least 1 hour in another. Homes were connected to about 7 others (mean degree 6.6). The authors estimated 49% of resident cases were attributable to staff movement between facilities (VERIFIED; Chen, Chevalier & Long, https://www.nber.org/papers/w27608.pdf).
  - These staff carry importation risk from other facilities. A simple model choice is to give them a higher daily hazard, for example 2× the community value (INFERRED).

## 6. Staff shared spaces

- **Evidence is thin.**
  - Brass et al. 2022 found the staff lunch room was the worst-ventilated space in the home (0.65 ACH) and repeatedly exceeded 1,000 ppm CO2 at meal breaks for prolonged periods. Two staff meeting rooms also peaked above 1,000 ppm (VERIFIED).
  - Hospital outbreak reports trace staff clusters to break rooms. For example, Holyoke Medical Center (MA) linked a 15-employee cluster to staff eating together in a break room (VERIFIED as a news report, Oct 2020; https://www.beckershospitalreview.com/workforce/massachusetts-hospital-covid-19-outbreak-may-be-tied-to-employees-eating-together/).
  - An Infection Control Today opinion piece argues the break-room risk is underestimated, but it offers no data (VERIFIED; https://infectioncontroltoday.com/view/for-infection-preventionists-battling-covid-beware-of-the-break-room).
  - A CMAJ outbreak report from an Ontario LTC home (staff attack rate 51% of the original 67 staff) noted symptomatic staff working (presenteeism) but did not identify break rooms (VERIFIED; Murti et al. 2021, https://www.cmaj.ca/content/cmaj/193/19/E681.full.pdf).
- **Model defaults (all INFERRED).**
  - Each staff member spends one 30-minute meal break in the break room per 8-hour shift, unmasked.
  - Peak occupancy is 3-6 people on the day shift around 11:30-13:30 and 1-3 people on evening and night shifts.
  - Shift handovers bring 4-8 nursing staff together at each nurses' station for 15-30 minutes at 07:00, 15:00 and 23:00.
  - Staff-staff sensor contacts in Champredon are short: median 5 repeated contacts a day, 5.8 minutes cumulative (VERIFIED). Break rooms add longer shared-air exposure that proximity sensors do not capture.

## 7. Visitors

- In a survey of 4,350 relatives of long-stay residents, 58% visited at least weekly (VERIFIED; Weimer et al., JAMDA 2022, reported by Skilled Nursing News).
- Engaged family caregivers report much more frequent visits:
  - Before the pandemic, 38.7% visited daily and 48.4% more than once a week (n=30) (VERIFIED; Kusmaul et al., J Aging Stud 2022, https://rcastoragev2.blob.core.windows.net/01a2549f787f02569246ede7196e4aef/PMC9283671.pdf).
  - Another sample (n=30) reported a mean visit length of 135 minutes (median 120) before COVID (VERIFIED; PMC9014337 Table 2).
- Port et al. (Gerontologist 2001, 1,441 residents) found family contact roughly halved after admission (VERIFIED, abstract only; https://gerontologist.gerontologyjournals.org/cgi/content/abstract/41/5/589).
- The RTI North Carolina model used about 432,000 community visitors to 427 homes over 30 days (Omicron period) (VERIFIED; https://www.rti.org/insights/new-model-studies-covid-in-nursing-homes). That is about 34 visitors per facility per day (INFERRED).
- **Defaults (INFERRED).**
  - 0.25 visits per resident per day (about 1.75 a week), range 0.1-0.5.
  - Visit length 75 minutes, range 30-180.
  - Visits mostly 14:00-19:00 and at weekends.
  - Visits take place mainly in the resident's room, which exposes roommates.
  - Short-stay rehab residents get more visits than long-stay residents.

## 8. Importation hazard (staff and visitors)

**Verified anchors**

| Measure | Value | Source |
|---|---|---|
| Influenza symptomatic illnesses, 2023-24 (Oct-Apr) | 40 million | CDC |
| COVID illnesses, 2022-23 | 43.6 M (UI 25.3-64.0 M) | Koumans et al. 2026 |
| COVID illnesses, 2023-24 | 33.0 M (UI 20.2-49.0 M) | Koumans et al. 2026 |
| Influenza infections per season, unvaccinated working adults (serology) | 5.4% | Kuster et al. 2011 |
| Influenza infections per season, unvaccinated HCWs (serology) | 18.7% | Kuster et al. 2011 |
| Symptomatic influenza per season, unvaccinated HCWs | 7.5% | Kuster et al. 2011 |
| NH staff COVID cases, 2020 (pre-vaccine) | 6.3-21.3 per 1,000 staff per week | CDC MMWR |

**Daily probabilities derived from those anchors (INFERRED)**
- Flu: 40 M / 335 M is about 12% of the population with symptomatic illness per season. With asymptomatic infections, roughly 15-20% are infected. Concentrated over an effective 10-15-week season, that is about 0.15-0.3% per day at the peak and about 0.1% per day averaged.
- Kuster's 5.4-18.7% per season over about 105 days converts to 0.05-0.2% per day.
- COVID at about 10-13% per year, with a winter wave carrying about half, is about 0.08% per day during the wave.
- The 2020 NHSN staff case rates convert to 0.09-0.30% per day.

**Recommended per-person daily probability of acquiring infection outside the home, for one pathogen in season**

| Level | Probability per day | Scenario |
|---|---|---|
| Low | 0.02% | Off-peak or mild season |
| Central | 0.10% | |
| High | 0.30% | Peak of a severe wave; pre-vaccine 2020 staff rates |

Staff who work at a second facility get 2× this value (INFERRED). With about 83 staff and 28 visitors a day, the central value gives about 0.11 introductions a day, or about one every 9 days (INFERRED).

**Alternative parameterisation (INFERRED).** If the model seeds by prevalence instead (probability a person arriving that day is currently infectious), use prevalence ≈ daily incidence × infectious period (about 5-7 days): 0.1-2% (central 0.6%).

## 9. Resident turnover

- **Admission mix.** 64% of admissions are short-stay (average 25 days) and 36% are long-stay (average stay about 3 years). More than 4.12 million people are served per year against about 1.38 million on a given day (VERIFIED; AHCA).
  - That implies about 2.74 million new admissions a year across about 14,800 facilities, or about 185 per facility per year. Per resident, that is about 2.0 admissions per resident-year, which is about 4.3 a week for 112 residents (INFERRED).
- **Delaware 2023.** 8,193 admissions to 4,859 licensed beds is 1.69 per bed-year. At 128 beds that gives about 4.2 a week (INFERRED from VERIFIED inputs; https://dhss.delaware.gov/wp-content/uploads/sites/4/dhcc/pdf/nursinghomeutilization2023.pdf).
- **Medicare.** MedPAC reports about 1.5 million Medicare fee-for-service SNF stays at 14,400 SNFs in 2024, with an average of 30.7 covered days (VERIFIED). That is about 2 FFS admissions per facility per week before counting Medicare Advantage and other payers (INFERRED).
  - CLA reports 2025 median lengths of stay of 25 days (Medicare Advantage) and 41 days (fee-for-service) (VERIFIED).
- **Defaults (INFERRED).**
  - 4 admissions and 4 discharges or deaths a week (range 2-7).
  - About 10-15 short-stay residents in census at any time.
  - New admissions go into whichever bed is vacant, often in a shared room.
  - Infected-on-arrival probability is 1% in season (range 0.3-3%). The RTI model estimated about 21 per 1,000 community-origin and about 5 per 1,000 hospital-origin admissions arrived with mild or asymptomatic COVID during the Omicron surge (VERIFIED). The same model found admissions are a small importation route compared with staff and visitors.

## 10. Outbreak response ("outbreak control" switch)

**Verified guidance**

- **CDC influenza LTC guidance** (archived; https://archive.cdc.gov/www_cdc_gov/flu/hcp/infection-control/ltc-facility-guidance.html):
  - **Trigger:** 2 lab-confirmed cases within 72 hours on the same unit, or 1 confirmed case alongside other respiratory illness.
  - **Testing:** test ill residents.
  - **Antiviral prophylaxis:** oseltamivir for all non-ill residents on affected units, for at least 2 weeks and at least 7 days after the last case.
  - **Droplet Precautions:** at least 7 days from onset, or until 24 hours after fever and symptoms resolve, whichever is longer.
  - **Cohorting:** suspected cases go to private rooms or are grouped together.
  - **Communal activity:** limit large group activities. Symptomatic residents stay in their rooms and get meals there. If several units are affected, consider serving all meals in rooms.
  - **Ill staff:** excluded until at least 24 hours after fever ends (elsewhere on the page, until illness resolves). Restrict staff movement from affected to unaffected areas.
  - **Surveillance:** daily active surveillance until at least 1 week after the last case.
- **CDC long-term care respiratory virus toolkit** (https://www.cdc.gov/long-term-care-facilities/hcp/respiratory-virus-toolkit): daily or every-shift symptom review, limit communal dining and group activities, consider unit-level quarantine, cohort units with dedicated staff, and minimise staff movement between units.
- **COVID, staff:** return after 7 days with a negative test within 48 hours, or after 10 days without testing (mild/moderate illness, not immunocompromised). Exposed staff are generally not restricted and are tested on days 1, 3 and 5 (VERIFIED; CDC HCP page, archived, last updated Mar 2024).
- **COVID, residents:** routine quarantine of exposed asymptomatic residents is no longer recommended; they wear source control for 10 days (VERIFIED; AHCA summary of the Sept 2022 CDC update).

**What a real outbreak looks like.** In the Ontario outbreak, 12 staff were already symptomatic when the outbreak was declared. Resident attack rate was 94% and staff 51% of the original staff. None of the 26 replacement staff brought in after full measures were in place became infected (VERIFIED; Murti et al. 2021).

**Recommended switch (INFERRED)**

| Element | Setting |
|---|---|
| Trigger | First detected case: resident symptomatic and tested, or staff positive |
| Delay from first in-home infection to detection | Central 5 days, range 2-10 days, because asymptomatic or mild spread precedes testing |
| Delay from detection to measures | 0-1 day |
| Resident isolation | Confirmed or symptomatic residents confined to their room: 10 days for COVID, 7 days for flu. Roommate stays but is quarantined in the room, or cases are moved to free single rooms. |
| Communal activity | Affected unit's dining and group activities suspended (residents eat in their rooms); facility-wide if 2 or more units are affected |
| Testing | Unit or facility testing every 3-7 days until 14 days with no new cases (this cadence is from memory of earlier CDC COVID guidance; I did not re-verify it) |
| Staff | Cohorted to unit (no floating). Symptomatic or positive staff excluded for 7 days (range 5-10). |
| Visitors | Continue, with masking. Federal policy since 2021 does not allow blanket visitation bans; this is from memory and was not re-verified. |
| Masking | Universal masking for staff on affected units |
| End | 14 days after the last case (COVID) or 7 days (flu) |

---

## What I could not verify

1. **PubMed Central full texts** were mostly blocked by a captcha (pmc.ncbi.nlm.nih.gov). Europe PMC was not reachable from my environment. I could not read:
   - Kane/household-model time-use article PMC6177048 (only its Table 3 opened, without title)
   - Gandhi et al. turnover paper PMC7992115
   - Fuertes et al. 2025 (Indoor Air) Spanish nursing-home CO2 study: blocked at Reading's repository and Wiley
   - Health Affairs full texts and supplementary appendices
   - The NHSN-based staffing papers

   The attributions for PMC1361005 (Schnelle et al. 2004) and the PMC6177048 table are my inference from content, not titles shown.
2. **ASHRAE 170.** I verified Table 9-1 values from the ASHE-hosted 2021 addendum c text, not from the current consolidated 170-2024 standard. Values could have been revised since. FGI 2022 RES ventilation is referenced only through ASHRAE 170.
3. **No US national data opened** on:
   - number of units per facility
   - ceiling heights
   - dining, activity, gym, nurses' station, corridor or lobby areas
   - the actual share of private rooms by beds (Zhu's 16% is a facility-mean claims proxy)

   All room areas other than resident-room minimums are INFERRED.
4. **Measured US ventilation** rests on one two-facility Washington study (resident rooms only) plus Japanese and Australian single-facility studies. There are no US measurements of dining or common-room ventilation, and no survey of installed filter MERV grades. Real-world ranges are judgment.
5. **Staff counts by shift and non-nursing headcounts** (dietary, housekeeping, maintenance, office) are INFERRED. PBJ per-shift breakdowns and dietary/housekeeping national HPRD were not read. The roster total (83 per weekday) is higher than the national-average ratio implied by McGarry et al. (about 0.6 per resident, or about 67). It is consistent with a large facility, but the true value for a 128-bed home could be 65-100.
6. **Not found:**
   - time-use studies giving full 24-hour location budgets for US residents
   - a current US bedfast prevalence (the 4.2% figure is from 2005)
   - US meal times and durations
   - group activity sizes (only the Irish 9-12 figure)
7. **Weak or absent quantitative evidence** on:
   - aide float rates and inter-unit movement
   - break-room duration and occupancy
   - shift-handover gatherings
   - staff-to-staff transmission specifically in nursing-home break rooms (only CO2/ventilation evidence and hospital anecdotes)
8. **Visitors.** Population-level frequency comes only as "58% of relatives visit at least weekly". Duration comes from small, biased samples (n=30). Defaults are judgment.
9. **Importation hazards** are my conversions:
   - The US population of about 335 million is from memory.
   - Season length assumptions are judgment.
   - The asymptomatic multiplier is judgment.
   - The 2020 NHSN rates predate vaccination and Omicron.
   - I did not obtain RSV community burden or the 2025-26 CDC in-season flu numbers (they sit in a dashboard).
10. **Outbreak guidance.**
    - CDC's current nursing-home COVID page (cdc.gov/covid/hcp/infection-control) failed to load. The return-to-work criteria come from an archived version last updated March 2024.
    - The COVID resident isolation duration (10 days), outbreak testing cadence (every 3-7 days until 14 days with no cases) and the federal visitation policy are from memory and not re-verified.
    - Detection delay is judgment.
11. **The multi-facility staff share (5.1%)** comes from smartphone data during spring 2020 visitor restrictions. It may not equal the share of PBJ employees on multiple payrolls, which I could not obtain.
