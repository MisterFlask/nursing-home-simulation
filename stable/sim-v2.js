// ---- src/params.js ----
// Parameter values, sources and metadata for the care-home model.
//
// Every number a user might want to change lives here, as an entry in PARAMS
// with low / central / high values and a source. defaultConfig() assembles a
// full config from BASE (structure, timetables, switches) plus the central
// value of every PARAMS entry for the chosen pathogen.
//
// Sources: research/transmission.md, research/far_uvc.md, research/facility.md
// (compiled 2026-11-11). Where those files tag a value INFERRED, or where a
// research value had to be mapped onto a model parameter by judgment, the
// entry's source is { text: 'Modelling judgment', url: '' } and its note says
// what the judgment rests on. A citation is only given where the cited source
// itself reports the number(s).
//
// transmission.G and emission.median are not set from the literature alone:
// their central values come from CALIBRATION (see below and NOTES.md).
//
// Note for the web build: params.js, engine.js and analysis.js are concatenated
// into one scope, so top-level names must be unique across the three files.

// ---------------------------------------------------------------------------
// Sources (author, year, venue; URL as opened by the research)
// ---------------------------------------------------------------------------
const JUDGMENT = { text: 'Modelling judgment', url: '' };
const SRC = {
  mikszewski: { text: 'Mikszewski, Stabile, Buonanno & Morawska 2022, Geoscience Frontiers (medRxiv preprint, Table 2)', url: 'https://medrxiv.org/content/10.1101/2021.01.26.21250580v1.full.pdf' },
  buonanno2020a: { text: 'Buonanno, Stabile & Morawska 2020, Environment International 141:105794', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7211635' },
  nicasJones: { text: 'Nicas & Jones 2009, Risk Analysis 29:1292', url: 'https://stacks.cdc.gov/view/cdc/188458/cdc_188458_DS1.pdf' },
  vanDoremalen: { text: 'van Doremalen et al. 2020, NEJM 382:1564 (half-life 1.1 h, as reported)', url: 'https://www.2minutemedicine.com/initial-data-on-the-viability-of-sars-cov-2-in-aerosol-and-on-surfaces/' },
  epa: { text: 'US EPA Exposure Factors Handbook 2011, chapter 6 (adults 81+, sedentary)', url: 'https://19january2021snapshot.epa.gov/sites/static/files/2015-06/documents/efh_highlights_chap6.pdf' },
  sah: { text: 'Sah et al. 2021, PNAS 118(34) (asymptomatic share: elderly 19.7%, overall 35.1%)', url: 'https://midasnetwork.us/papers/asymptomatic-sars-cov-2-infection-a-systematic-review-and-meta-analysis/' },
  buitrago: { text: 'Buitrago-Garcia et al. 2022, PLoS Medicine 19:e1003987 (risk ratio 0.32, 0.16-0.64)', url: 'https://www.eurekalert.org/news-releases/953374' },
  cdcHcp: { text: 'CDC, healthcare personnel return-to-work guidance (archived, updated Mar 2024)', url: 'https://archive.cdc.gov/www_cdc_gov/covid/hcp/infection-control/guidance-risk-assesment-hcp.html' },
  cdcFlu: { text: 'CDC, interim influenza guidance for long-term care facilities (archived)', url: 'https://archive.cdc.gov/www_cdc_gov/flu/hcp/infection-control/ltc-facility-guidance.html' },
  brass: { text: 'Brass et al. 2022, Age and Ageing 51(12):afac316 (staff lunch room 19 m², 0.65 ACH)', url: 'https://academic.oup.com/ageing/article/51/12/afac316/6964928' },
  mealAssist: { text: 'Nursing-home mealtime observation table, PMC1361005 Table 3 (feeding assistance 2.5-7 min per resident)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1361005/table/tbl3' },
};

// ---------------------------------------------------------------------------
// CALIBRATION[pathogen] = [{ closeShare, G, emissionMedian, achieved }]
// For each target close-range share (close / (close + room) among infections
// acquired in the building, no lamps), the (G, emission.median) pair at which
// the no-lamp baseline reproduces that share and the pathogen's attack-rate
// target, all other parameters at their defaults. Regenerate with
//   node src/cli.js calibrate --write
// The block between the markers is machine-written.
// ---------------------------------------------------------------------------
// CALIBRATION-BEGIN
// covid: 2026-11-11, 200 season seeds, 300 outbreak seeds; target 0.18737142857142858 (Franklin et al. 2024, MMWR 73:339 (NHSN, Oct 2023-Feb 2024): 109.3 per 10,000 resident-weeks)
// flu: 2026-11-11, 200 season seeds, 300 outbreak seeds; target 0.33 (Lansbury, Brown & Nguyen-Van-Tam 2017, Influenza Other Respir Viruses: median resident attack rate 33% (4-94%), 49 outbreaks)
// rsv: 2026-11-11, 200 season seeds, 300 outbreak seeds; target 0.24 (Osei-Yeboah et al. 2024, Influenza Other Respir Viruses 18:e70008: median resident attack rate 24% (6.7-47.6%))
const CALIBRATION = { "covid": [ { "closeShare": 0.1, "G": 0.16, "emissionMedian": 0.277, "achieved": { "target": 0.1874, "fitted": 0.1868, "closeShare": 0.09424, "seasonAttackRate": 0.1868, "seasonSymptomaticAttackRate": 0.15, "seasonStaffAttackRate": 0.2581, "incidencePer10kResidentWeeks": 109, "seasonCloseShare": 0.09424, "pOutbreak": 0.1067, "outbreaks": 32, "outbreakMedianAR": 0.09375, "outbreakIQR": [ 0.033482142857142856, 0.27901785714285715 ], "outbreakMedianARAll": 0.1116, "outbreakMedianStaffAR": 0.0916, "outbreakMedianDurationDays": 10.17, "outbreakCloseShare": 0.1098 } }, { "closeShare": 0.2, "G": 0.4, "emissionMedian": 0.247, "achieved": { "target": 0.1874, "fitted": 0.1927, "closeShare": 0.1955, "seasonAttackRate": 0.1927, "seasonSymptomaticAttackRate": 0.1553, "seasonStaffAttackRate": 0.2597, "incidencePer10kResidentWeeks": 112.4, "seasonCloseShare": 0.1955, "pOutbreak": 0.1167, "outbreaks": 35, "outbreakMedianAR": 0.08929, "outbreakIQR": [ 0.026785714285714284, 0.30357142857142855 ], "outbreakMedianARAll": 0.09821, "outbreakMedianStaffAR": 0.08397, "outbreakMedianDurationDays": 6.813, "outbreakCloseShare": 0.2195 } }, { "closeShare": 0.3, "G": 0.7953, "emissionMedian": 0.1964, "achieved": { "target": 0.1874, "fitted": 0.192, "closeShare": 0.3045, "seasonAttackRate": 0.192, "seasonSymptomaticAttackRate": 0.1549, "seasonStaffAttackRate": 0.2532, "incidencePer10kResidentWeeks": 112, "seasonCloseShare": 0.3045, "pOutbreak": 0.11, "outbreaks": 33, "outbreakMedianAR": 0.08036, "outbreakIQR": [ 0.03571428571428571, 0.25 ], "outbreakMedianARAll": 0.08929, "outbreakMedianStaffAR": 0.0916, "outbreakMedianDurationDays": 8.854, "outbreakCloseShare": 0.3074 } }, { "closeShare": 0.4, "G": 1.332, "emissionMedian": 0.1562, "achieved": { "target": 0.1874, "fitted": 0.1874, "closeShare": 0.3991, "seasonAttackRate": 0.1874, "seasonSymptomaticAttackRate": 0.1513, "seasonStaffAttackRate": 0.2418, "incidencePer10kResidentWeeks": 109.3, "seasonCloseShare": 0.3991, "pOutbreak": 0.1133, "outbreaks": 34, "outbreakMedianAR": 0.08929, "outbreakIQR": [ 0.03571428571428571, 0.23883928571428573 ], "outbreakMedianARAll": 0.09821, "outbreakMedianStaffAR": 0.0916, "outbreakMedianDurationDays": 7.208, "outbreakCloseShare": 0.4288 } }, { "closeShare": 0.5, "G": 2.106, "emissionMedian": 0.1242, "achieved": { "target": 0.1874, "fitted": 0.1839, "closeShare": 0.4941, "seasonAttackRate": 0.1839, "seasonSymptomaticAttackRate": 0.1478, "seasonStaffAttackRate": 0.2381, "incidencePer10kResidentWeeks": 107.3, "seasonCloseShare": 0.4941, "pOutbreak": 0.1033, "outbreaks": 31, "outbreakMedianAR": 0.09821, "outbreakIQR": [ 0.03571428571428571, 0.27232142857142855 ], "outbreakMedianARAll": 0.1071, "outbreakMedianStaffAR": 0.0916, "outbreakMedianDurationDays": 7.208, "outbreakCloseShare": 0.4925 } }, { "closeShare": 0.6, "G": 3.734, "emissionMedian": 0.0881, "achieved": { "target": 0.1874, "fitted": 0.1819, "closeShare": 0.6025, "seasonAttackRate": 0.1819, "seasonSymptomaticAttackRate": 0.1465, "seasonStaffAttackRate": 0.2344, "incidencePer10kResidentWeeks": 106.1, "seasonCloseShare": 0.6025, "pOutbreak": 0.1133, "outbreaks": 34, "outbreakMedianAR": 0.1027, "outbreakIQR": [ 0.03794642857142857, 0.2767857142857143 ], "outbreakMedianARAll": 0.1161, "outbreakMedianStaffAR": 0.08779, "outbreakMedianDurationDays": 7.302, "outbreakCloseShare": 0.6167 } }, { "closeShare": 0.7, "G": 5.904, "emissionMedian": 0.06616, "achieved": { "target": 0.1874, "fitted": 0.1833, "closeShare": 0.6922, "seasonAttackRate": 0.1833, "seasonSymptomaticAttackRate": 0.1478, "seasonStaffAttackRate": 0.2296, "incidencePer10kResidentWeeks": 107, "seasonCloseShare": 0.6922, "pOutbreak": 0.1233, "outbreaks": 37, "outbreakMedianAR": 0.0625, "outbreakIQR": [ 0.03571428571428571, 0.29464285714285715 ], "outbreakMedianARAll": 0.09821, "outbreakMedianStaffAR": 0.0687, "outbreakMedianDurationDays": 7.021, "outbreakCloseShare": 0.6738 } }, { "closeShare": 0.8, "G": 11.74, "emissionMedian": 0.03952, "achieved": { "target": 0.1874, "fitted": 0.1865, "closeShare": 0.7952, "seasonAttackRate": 0.1865, "seasonSymptomaticAttackRate": 0.1498, "seasonStaffAttackRate": 0.2261, "incidencePer10kResidentWeeks": 108.8, "seasonCloseShare": 0.7952, "pOutbreak": 0.1267, "outbreaks": 38, "outbreakMedianAR": 0.07143, "outbreakIQR": [ 0.03571428571428571, 0.21205357142857142 ], "outbreakMedianARAll": 0.08482, "outbreakMedianStaffAR": 0.08397, "outbreakMedianDurationDays": 7.396, "outbreakCloseShare": 0.8009 } }, { "closeShare": 0.9, "G": 29.35, "emissionMedian": 0.01877, "achieved": { "target": 0.1874, "fitted": 0.1921, "closeShare": 0.8973, "seasonAttackRate": 0.1921, "seasonSymptomaticAttackRate": 0.1538, "seasonStaffAttackRate": 0.2283, "incidencePer10kResidentWeeks": 112.1, "seasonCloseShare": 0.8973, "pOutbreak": 0.1267, "outbreaks": 38, "outbreakMedianAR": 0.07589, "outbreakIQR": [ 0.03571428571428571, 0.22321428571428573 ], "outbreakMedianARAll": 0.08929, "outbreakMedianStaffAR": 0.08397, "outbreakMedianDurationDays": 7.698, "outbreakCloseShare": 0.9004 } } ], "flu": [ { "closeShare": 0.1, "G": 0.16, "emissionMedian": 2.225, "achieved": { "target": 0.33, "fitted": 0.3393, "closeShare": 0.09211, "seasonAttackRate": 0.5862, "seasonSymptomaticAttackRate": 0.4697, "seasonStaffAttackRate": 0.543, "incidencePer10kResidentWeeks": 341.9, "seasonCloseShare": 0.09042, "pOutbreak": 0.29, "outbreaks": 87, "outbreakMedianAR": 0.3393, "outbreakIQR": [ 0.0625, 0.5223214285714286 ], "outbreakMedianARAll": 0.4196, "outbreakMedianStaffAR": 0.2748, "outbreakMedianDurationDays": 12.25, "outbreakCloseShare": 0.09211 } }, { "closeShare": 0.2, "G": 0.4236, "emissionMedian": 2.041, "achieved": { "target": 0.33, "fitted": 0.3393, "closeShare": 0.1979, "seasonAttackRate": 0.6292, "seasonSymptomaticAttackRate": 0.5033, "seasonStaffAttackRate": 0.5758, "incidencePer10kResidentWeeks": 367, "seasonCloseShare": 0.1923, "pOutbreak": 0.31, "outbreaks": 93, "outbreakMedianAR": 0.3393, "outbreakIQR": [ 0.08928571428571429, 0.5357142857142857 ], "outbreakMedianARAll": 0.4286, "outbreakMedianStaffAR": 0.3435, "outbreakMedianDurationDays": 13.29, "outbreakCloseShare": 0.1979 } }, { "closeShare": 0.3, "G": 0.8421, "emissionMedian": 1.583, "achieved": { "target": 0.33, "fitted": 0.3482, "closeShare": 0.2994, "seasonAttackRate": 0.5803, "seasonSymptomaticAttackRate": 0.4631, "seasonStaffAttackRate": 0.536, "incidencePer10kResidentWeeks": 338.5, "seasonCloseShare": 0.2983, "pOutbreak": 0.29, "outbreaks": 87, "outbreakMedianAR": 0.3482, "outbreakIQR": [ 0.08035714285714285, 0.5446428571428571 ], "outbreakMedianARAll": 0.4464, "outbreakMedianStaffAR": 0.3206, "outbreakMedianDurationDays": 15.38, "outbreakCloseShare": 0.2994 } }, { "closeShare": 0.4, "G": 1.332, "emissionMedian": 1.343, "achieved": { "target": 0.33, "fitted": 0.3393, "closeShare": 0.3934, "seasonAttackRate": 0.5802, "seasonSymptomaticAttackRate": 0.4631, "seasonStaffAttackRate": 0.5306, "incidencePer10kResidentWeeks": 338.5, "seasonCloseShare": 0.3838, "pOutbreak": 0.2933, "outbreaks": 88, "outbreakMedianAR": 0.3393, "outbreakIQR": [ 0.08928571428571429, 0.5089285714285714 ], "outbreakMedianARAll": 0.3973, "outbreakMedianStaffAR": 0.2977, "outbreakMedianDurationDays": 14.2, "outbreakCloseShare": 0.3934 } }, { "closeShare": 0.5, "G": 2.361, "emissionMedian": 1.009, "achieved": { "target": 0.33, "fitted": 0.3304, "closeShare": 0.5074, "seasonAttackRate": 0.5678, "seasonSymptomaticAttackRate": 0.4542, "seasonStaffAttackRate": 0.5179, "incidencePer10kResidentWeeks": 331.2, "seasonCloseShare": 0.498, "pOutbreak": 0.2867, "outbreaks": 86, "outbreakMedianAR": 0.3304, "outbreakIQR": [ 0.07366071428571429, 0.5089285714285714 ], "outbreakMedianARAll": 0.3929, "outbreakMedianStaffAR": 0.3015, "outbreakMedianDurationDays": 14.55, "outbreakCloseShare": 0.5074 } }, { "closeShare": 0.6, "G": 3.733, "emissionMedian": 0.8021, "achieved": { "target": 0.33, "fitted": 0.3393, "closeShare": 0.5965, "seasonAttackRate": 0.5779, "seasonSymptomaticAttackRate": 0.4621, "seasonStaffAttackRate": 0.5254, "incidencePer10kResidentWeeks": 337.1, "seasonCloseShare": 0.5888, "pOutbreak": 0.29, "outbreaks": 87, "outbreakMedianAR": 0.3393, "outbreakIQR": [ 0.08482142857142858, 0.5133928571428572 ], "outbreakMedianARAll": 0.4464, "outbreakMedianStaffAR": 0.313, "outbreakMedianDurationDays": 14.04, "outbreakCloseShare": 0.5965 } }, { "closeShare": 0.7, "G": 6.619, "emissionMedian": 0.5372, "achieved": { "target": 0.33, "fitted": 0.3304, "closeShare": 0.7082, "seasonAttackRate": 0.5688, "seasonSymptomaticAttackRate": 0.455, "seasonStaffAttackRate": 0.5085, "incidencePer10kResidentWeeks": 331.8, "seasonCloseShare": 0.7036, "pOutbreak": 0.2967, "outbreaks": 89, "outbreakMedianAR": 0.3304, "outbreakIQR": [ 0.08928571428571429, 0.4642857142857143 ], "outbreakMedianARAll": 0.4196, "outbreakMedianStaffAR": 0.3053, "outbreakMedianDurationDays": 15.71, "outbreakCloseShare": 0.7082 } }, { "closeShare": 0.8, "G": 11.73, "emissionMedian": 0.3611, "achieved": { "target": 0.33, "fitted": 0.3482, "closeShare": 0.8027, "seasonAttackRate": 0.5694, "seasonSymptomaticAttackRate": 0.4551, "seasonStaffAttackRate": 0.5087, "incidencePer10kResidentWeeks": 332.1, "seasonCloseShare": 0.7921, "pOutbreak": 0.3, "outbreaks": 90, "outbreakMedianAR": 0.3482, "outbreakIQR": [ 0.109375, 0.4888392857142857 ], "outbreakMedianARAll": 0.4152, "outbreakMedianStaffAR": 0.3321, "outbreakMedianDurationDays": 16.74, "outbreakCloseShare": 0.8027 } }, { "closeShare": 0.9, "G": 29.34, "emissionMedian": 0.1608, "achieved": { "target": 0.33, "fitted": 0.3393, "closeShare": 0.8978, "seasonAttackRate": 0.5457, "seasonSymptomaticAttackRate": 0.4375, "seasonStaffAttackRate": 0.4824, "incidencePer10kResidentWeeks": 318.3, "seasonCloseShare": 0.8953, "pOutbreak": 0.28, "outbreaks": 84, "outbreakMedianAR": 0.3393, "outbreakIQR": [ 0.13169642857142858, 0.4933035714285714 ], "outbreakMedianARAll": 0.4063, "outbreakMedianStaffAR": 0.2939, "outbreakMedianDurationDays": 16.02, "outbreakCloseShare": 0.8978 } } ], "rsv": [ { "closeShare": 0.1, "G": 0.1794, "emissionMedian": 0.9026, "achieved": { "target": 0.24, "fitted": 0.2455, "closeShare": 0.1021, "seasonAttackRate": 0.3661, "seasonSymptomaticAttackRate": 0.2932, "seasonStaffAttackRate": 0.3769, "incidencePer10kResidentWeeks": 213.6, "seasonCloseShare": 0.09314, "pOutbreak": 0.1867, "outbreaks": 56, "outbreakMedianAR": 0.2455, "outbreakIQR": [ 0.08035714285714286, 0.3526785714285714 ], "outbreakMedianARAll": 0.3125, "outbreakMedianStaffAR": 0.2176, "outbreakMedianDurationDays": 20.22, "outbreakCloseShare": 0.1021 } }, { "closeShare": 0.2, "G": 0.4, "emissionMedian": 0.9026, "achieved": { "target": 0.24, "fitted": 0.2411, "closeShare": 0.1935, "seasonAttackRate": 0.424, "seasonSymptomaticAttackRate": 0.3397, "seasonStaffAttackRate": 0.4126, "incidencePer10kResidentWeeks": 247.3, "seasonCloseShare": 0.1834, "pOutbreak": 0.2167, "outbreaks": 65, "outbreakMedianAR": 0.2411, "outbreakIQR": [ 0.08035714285714286, 0.38392857142857145 ], "outbreakMedianARAll": 0.2857, "outbreakMedianStaffAR": 0.1985, "outbreakMedianDurationDays": 21.85, "outbreakCloseShare": 0.1935 } }, { "closeShare": 0.3, "G": 0.751, "emissionMedian": 0.7166, "achieved": { "target": 0.24, "fitted": 0.2232, "closeShare": 0.2966, "seasonAttackRate": 0.3879, "seasonSymptomaticAttackRate": 0.3107, "seasonStaffAttackRate": 0.3848, "incidencePer10kResidentWeeks": 226.3, "seasonCloseShare": 0.28, "pOutbreak": 0.21, "outbreaks": 63, "outbreakMedianAR": 0.2232, "outbreakIQR": [ 0.07589285714285715, 0.4107142857142857 ], "outbreakMedianARAll": 0.3125, "outbreakMedianStaffAR": 0.2519, "outbreakMedianDurationDays": 20.94, "outbreakCloseShare": 0.2966 } }, { "closeShare": 0.4, "G": 1.332, "emissionMedian": 0.639, "achieved": { "target": 0.24, "fitted": 0.2455, "closeShare": 0.3932, "seasonAttackRate": 0.4294, "seasonSymptomaticAttackRate": 0.3427, "seasonStaffAttackRate": 0.4102, "incidencePer10kResidentWeeks": 250.5, "seasonCloseShare": 0.3989, "pOutbreak": 0.2333, "outbreaks": 70, "outbreakMedianAR": 0.2455, "outbreakIQR": [ 0.07142857142857142, 0.40848214285714285 ], "outbreakMedianARAll": 0.2768, "outbreakMedianStaffAR": 0.2099, "outbreakMedianDurationDays": 21.94, "outbreakCloseShare": 0.3932 } }, { "closeShare": 0.5, "G": 2.105, "emissionMedian": 0.4939, "achieved": { "target": 0.24, "fitted": 0.2411, "closeShare": 0.4922, "seasonAttackRate": 0.4068, "seasonSymptomaticAttackRate": 0.3247, "seasonStaffAttackRate": 0.3891, "incidencePer10kResidentWeeks": 237.3, "seasonCloseShare": 0.4868, "pOutbreak": 0.25, "outbreaks": 75, "outbreakMedianAR": 0.2411, "outbreakIQR": [ 0.07142857142857142, 0.4375 ], "outbreakMedianARAll": 0.2946, "outbreakMedianStaffAR": 0.229, "outbreakMedianDurationDays": 26.25, "outbreakCloseShare": 0.4922 } }, { "closeShare": 0.6, "G": 3.329, "emissionMedian": 0.428, "achieved": { "target": 0.24, "fitted": 0.2411, "closeShare": 0.5917, "seasonAttackRate": 0.4446, "seasonSymptomaticAttackRate": 0.3557, "seasonStaffAttackRate": 0.4186, "incidencePer10kResidentWeeks": 259.3, "seasonCloseShare": 0.5868, "pOutbreak": 0.2667, "outbreaks": 80, "outbreakMedianAR": 0.2411, "outbreakIQR": [ 0.08035714285714286, 0.4174107142857143 ], "outbreakMedianARAll": 0.3036, "outbreakMedianStaffAR": 0.2481, "outbreakMedianDurationDays": 25.73, "outbreakCloseShare": 0.5917 } }, { "closeShare": 0.7, "G": 5.902, "emissionMedian": 0.2971, "achieved": { "target": 0.24, "fitted": 0.2411, "closeShare": 0.6999, "seasonAttackRate": 0.4597, "seasonSymptomaticAttackRate": 0.3687, "seasonStaffAttackRate": 0.4222, "incidencePer10kResidentWeeks": 268.2, "seasonCloseShare": 0.7027, "pOutbreak": 0.2533, "outbreaks": 76, "outbreakMedianAR": 0.2411, "outbreakIQR": [ 0.09598214285714285, 0.41294642857142855 ], "outbreakMedianARAll": 0.2902, "outbreakMedianStaffAR": 0.2252, "outbreakMedianDurationDays": 24.61, "outbreakCloseShare": 0.6999 } }, { "closeShare": 0.8, "G": 11.08, "emissionMedian": 0.1979, "achieved": { "target": 0.24, "fitted": 0.2455, "closeShare": 0.806, "seasonAttackRate": 0.4889, "seasonSymptomaticAttackRate": 0.39, "seasonStaffAttackRate": 0.4385, "incidencePer10kResidentWeeks": 285.2, "seasonCloseShare": 0.807, "pOutbreak": 0.2667, "outbreaks": 80, "outbreakMedianAR": 0.2455, "outbreakIQR": [ 0.08928571428571429, 0.4375 ], "outbreakMedianARAll": 0.3125, "outbreakMedianStaffAR": 0.229, "outbreakMedianDurationDays": 25.74, "outbreakCloseShare": 0.806 } }, { "closeShare": 0.9, "G": 24.71, "emissionMedian": 0.09021, "achieved": { "target": 0.24, "fitted": 0.2411, "closeShare": 0.8964, "seasonAttackRate": 0.4372, "seasonSymptomaticAttackRate": 0.3502, "seasonStaffAttackRate": 0.3911, "incidencePer10kResidentWeeks": 255.1, "seasonCloseShare": 0.892, "pOutbreak": 0.2533, "outbreaks": 76, "outbreakMedianAR": 0.2411, "outbreakIQR": [ 0.06919642857142858, 0.4151785714285714 ], "outbreakMedianARAll": 0.2902, "outbreakMedianStaffAR": 0.229, "outbreakMedianDurationDays": 26.42, "outbreakCloseShare": 0.8964 } } ]
};
// CALIBRATION-END

// Literature central values used when no calibration table is present.
const UNCALIBRATED = { covid: { G: 1, emissionMedian: 0.52 }, flu: { G: 1, emissionMedian: 0.035 }, rsv: { G: 1, emissionMedian: 0.035 } };

// Interpolated { G, emissionMedian } for a pathogen at a close-range share
// (log-linear interpolation; clamped to the table's range).
function calibrated(pathogen = 'covid', closeShare = 0.5) {
  const tab = CALIBRATION[pathogen] || CALIBRATION.covid;
  const fb = UNCALIBRATED[pathogen] || UNCALIBRATED.covid;
  if (!tab || !tab.length) return { G: fb.G, emissionMedian: fb.emissionMedian };
  const t = tab.slice().sort((a, b) => a.closeShare - b.closeShare);
  if (closeShare <= t[0].closeShare) return { G: t[0].G, emissionMedian: t[0].emissionMedian };
  if (closeShare >= t[t.length - 1].closeShare) { const x = t[t.length - 1]; return { G: x.G, emissionMedian: x.emissionMedian }; }
  for (let i = 1; i < t.length; i++) {
    if (closeShare > t[i].closeShare) continue;
    if (closeShare === t[i].closeShare) return { G: t[i].G, emissionMedian: t[i].emissionMedian };
    const a = t[i - 1], b = t[i], f = (closeShare - a.closeShare) / (b.closeShare - a.closeShare);
    const li = (x, y) => Math.exp(Math.log(x) + f * (Math.log(y) - Math.log(x)));
    return { G: li(a.G, b.G), emissionMedian: li(a.emissionMedian, b.emissionMedian) };
  }
  return { G: fb.G, emissionMedian: fb.emissionMedian };
}

// ---------------------------------------------------------------------------
// Structural part of the config: things that are not single tunable numbers.
// Slot = 30 minutes, slot 0 starts at 00:00, 48 slots per day.
// ---------------------------------------------------------------------------
const BASE = {
  pathogen: 'covid',
  days: 120,
  facility: { rooms: {}, ach: {} },
  ventilation: {},
  air: {},
  lamp: {},
  transmission: { beta: {} },
  emission: { activity: { rest: 1 } },
  breathing: {},
  disease: { latent: {}, presymptomatic: {}, infectious: {}, pSymptomatic: {} },
  immune: { share: {} },
  importation: {},
  people: {
    mobility: {},
    // Where residents who do not use the dining room eat: research (facility.md
    // §0.4) has room-oriented residents eating from a tray in their own room.
    limitedMealRoom: 'bedroom',
  },
  staff: {
    staffing: {},
    weekdaysOnly: { therapist: true, admin: true },
    careEpisodesPerShift: {},
  },
  // Timetables, as [startSlot, endSlot) pairs or start slots (facility.md §0.4;
  // meal and activity times are INFERRED there as typical US practice).
  schedule: {
    startWeekday: 0,                       // day 0 is a Monday
    cycleDays: 28,                         // resident routines and staff timetables repeat every 28 days (multiple of 7; ≥ days = no repetition)
    shifts: { day: [14, 16], evening: [30, 16], night: [46, 16] }, // 07-15, 15-23, 23-07
    wake: 14,
    morningCareEnd: 16,                    // 07:00-08:00 in own room (dressing, personal care)
    bed: 40,                               // 20:00 back to own room
    meals: [[16, 18], [24, 26], [34, 36]], // 08:00, 12:00, 17:00, one hour each
    activities: [[20, 22], [30, 32]],      // 10:00-11:00 and 15:00-16:00 group activities
    therapyWindows: [[18, 22], [26, 30]],  // 09:00-11:00, 13:00-15:00, weekdays
    medpass: [16, 24, 34, 42],             // 08:00, 12:00, 17:00, 21:00
    visiting: [28, 38],                    // visitors arrive 14:00-19:00
    roommateSlot: 2,
  },
  control: {
    staffExclusion: { enabled: true },
    residentIsolation: { enabled: true },
    outbreakMode: { enabled: true, outbreakMask: 'surgical', countStaff: true },
    staffMask: 'none',
    masks: { none: { in: 0, out: 0 }, surgical: {}, n95: {} },
  },
};

// ---------------------------------------------------------------------------
// Parameter metadata. P(path, label, group, units, [low, central, high], opts)
// opts: scale, note, source, integer, byPathogen: { flu: {low, central, high, source?, note?}, rsv: ... }
// (covid uses the top-level values).
// ---------------------------------------------------------------------------
function P(path, label, group, units, v, extra = {}) {
  const e = {
    path, label, group, units, low: v[0], central: v[1], high: v[2],
    scale: extra.scale || 'linear',
    source: extra.source || JUDGMENT,
    note: extra.note || '',
  };
  if (extra.integer) e.integer = true;
  if (extra.byPathogen) e.byPathogen = extra.byPathogen;
  return e;
}
const bp = (flu, rsv, fluSrc, rsvSrc) => ({
  flu: { low: flu[0], central: flu[1], high: flu[2], source: fluSrc || JUDGMENT },
  rsv: { low: rsv[0], central: rsv[1], high: rsv[2], source: rsvSrc || JUDGMENT },
});
const CAL = { covid: calibrated('covid', 0.5), flu: calibrated('flu', 0.5), rsv: calibrated('rsv', 0.5) };
const CAL_LO = { covid: calibrated('covid', 0.2), flu: calibrated('flu', 0.2), rsv: calibrated('rsv', 0.2) };
const CAL_HI = { covid: calibrated('covid', 0.8), flu: calibrated('flu', 0.8), rsv: calibrated('rsv', 0.8) };
// Researched range for the median resting emission (quanta/h).
const EMIT_RANGE = { covid: [0.36, 0.52, 1.56], flu: [0.012, 0.035, 0.105], rsv: [0.012, 0.035, 0.105] };
// Slider range: the literature range widened to include the fitted values at close-range shares 0.2-0.8.
const emitRange = (p) => { const r = EMIT_RANGE[p], c = CAL[p].emissionMedian; return [Math.min(r[0], c, CAL_HI[p].emissionMedian, CAL_LO[p].emissionMedian), c, Math.max(r[2], c, CAL_LO[p].emissionMedian, CAL_HI[p].emissionMedian)]; };
const gRange = (p) => { const a = CAL_LO[p].G, b = CAL_HI[p].G, c = CAL[p].G; return [Math.min(a, b, c), c, Math.max(a, b, c)]; };
// Lamp physics (far_uvc.md §5): CADR per lamp = 0.36 · k · P · L (m³/h), with
// P = 100 mW (Aerolamp / Ushio Care222 B1), L = 2.4 m (default ceiling).
// Exposure cap on added air changes: 3.6 · k · E_max (1/h).
const lampCadr = (k) => Math.round(0.36 * k * 100 * 2.4);
const capAch = (k, E) => Math.round(3.6 * k * E * 10) / 10;

const PARAMS = [
  // ===== Transmission =====
  P('transmission.closeShare', 'Share of in-building spread that happens at close range (without lamps)', 'Transmission', 'fraction', [0.2, 0.5, 0.8],
    { note: 'Evidence is thin and conflicting: about 50:50 on the Diamond Princess (Azimi et al. 2021, PNAS), 4-10% short-range in a care-room model (Mizukoshi et al. 2020), "cannot be generalized" (Public Health Ontario 2022); the 0.2-0.8 range is the research judgment. The engine does not read this number: moving it re-fits close-range intensity and emission (CALIBRATION) so that the no-lamp attack rate stays the same. Lamps help less when more spread is close range.' }),
  P('transmission.G', 'How much more infectious it is to be close to someone than to share their room', 'Transmission', 'multiplier', gRange('covid'),
    { scale: 'log', note: 'Not measured. Central value is fitted (CALIBRATION, close-range share 0.5); low and high are the fitted values at close-range shares 0.2 and 0.8. 0 switches off the close-range route. Lamps do not reduce this route.',
      byPathogen: { flu: { low: gRange('flu')[0], central: gRange('flu')[1], high: gRange('flu')[2], source: JUDGMENT }, rsv: { low: gRange('rsv')[0], central: gRange('rsv')[1], high: gRange('rsv')[2], source: JUDGMENT } } }),
  P('emission.median', 'How much virus a typical infected person breathes out while resting', 'Transmission', 'quanta per hour', emitRange('covid'),
    { scale: 'log', source: SRC.mikszewski,
      note: 'Central value is FITTED to the attack-rate target (CALIBRATION, close-range share 0.5), not taken from the literature, and it falls BELOW the literature range: literature median 0.52 q/h at rest for ancestral SARS-CoV-2 (Mikszewski 2022), plausible 0.36 (Buonanno, Morawska & Stabile 2020) to 1.56 (×3 Omicron multiplier, research judgment). The slider range is widened to include the fitted values. A "quantum" is the dose that infects 63% of people who inhale it.',
      byPathogen: {
        flu: { low: emitRange('flu')[0], central: emitRange('flu')[1], high: emitRange('flu')[2], source: SRC.mikszewski, note: 'Central value is FITTED to outbreak attack rates and is about 30× ABOVE the literature median of 0.035 q/h at rest (Mikszewski 2022; ×3 either side is research judgment). The model needs this to reproduce reported outbreak sizes; see NOTES.md.' },
        rsv: { low: emitRange('rsv')[0], central: emitRange('rsv')[1], high: emitRange('rsv')[2], source: JUDGMENT, note: 'No published RSV quanta rate; literature range set equal to influenza (÷3 to ×3). Central value is FITTED to RSV outbreak attack rates and lies far above that range; see NOTES.md.' },
      } }),
  P('emission.gsd', 'How much people differ in how much virus they breathe out', 'Transmission', 'geometric SD', [5.1, 15.8, 15.8],
    { scale: 'log', source: SRC.mikszewski,
      note: 'Lognormal spread across infected people: log10 SD 1.2 for SARS-CoV-2 (GSD 15.8), so the top 10% of infected people emit about 93% of all virus. Low end: log10 SD 0.71 (Buonanno, Morawska & Stabile 2020).',
      byPathogen: { flu: { low: 5.1, central: 6.9, high: 6.9, source: SRC.mikszewski, note: 'log10 SD 0.84 for influenza (GSD 6.9).' }, rsv: { low: 5.1, central: 6.9, high: 6.9, source: JUDGMENT, note: 'No RSV data; influenza value assumed.' } } }),
  P('emission.activity.social', 'Extra virus breathed out while talking (residents out of their room, visitors, staff on break)', 'Transmission', 'times resting', [3, 5, 10],
    { scale: 'log', source: SRC.mikszewski, note: 'Ratio of the "standing, speaking" to "resting, oral breathing" medians: 2.6/0.52 = 5.0 for SARS-CoV-2 and 0.17/0.035 = 4.9 for influenza (Mikszewski 2022). Range is judgment.' }),
  P('emission.activity.work', 'Extra virus breathed out by staff while working', 'Transmission', 'times resting', [5, 10, 30],
    { scale: 'log', note: 'No direct measurement. Judgment between "standing, speaking" (×5) and "light activity, speaking loudly" (×85) in Mikszewski 2022: care work is light activity with talking, often raised voices.' }),
  P('emission.visitorRel', 'Infectiousness of an infected visitor compared with a resident or staff member', 'Transmission', 'ratio', [0.5, 1, 1.5], { note: 'No data; judgment.' }),
  P('breathing.rest', 'Air breathed in by residents in their own room', 'Transmission', 'm³ per hour', [0.29, 0.29, 0.42],
    { source: SRC.epa, note: 'EPA, adults 81+, sedentary/passive: mean 0.29, 95th percentile 0.42 m³/h.' }),
  P('breathing.social', 'Air breathed in while sitting, talking or eating (residents, visitors, staff on break)', 'Transmission', 'm³ per hour', [0.29, 0.35, 0.5],
    { note: 'Judgment: between EPA sedentary for 81+ (0.29) and visitors (0.5, research default).' }),
  P('breathing.work', 'Air breathed in by staff while working', 'Transmission', 'm³ per hour', [0.72, 1.0, 1.56],
    { note: 'Endpoints are EPA light (0.72) and moderate (1.5-1.56) activity for adults (verified); the central 1.0 is a research judgment.' }),
  P('transmission.beta.care', 'Air mixing around a carer and resident during personal care', 'Transmission', 'm³ per hour', [8, 42, 1130],
    { scale: 'log', note: 'No direct source (transmission.md §4). Judgment from the jet-dilution reading: effective β = Q_b·S/f with exhaled flow 0.5 m³/h, dilution S ≈ 17 at 1 m and in-plume fraction f ≈ 0.2 during care → 42. Low: f 0.5, S 8. High: the isotropic two-zone model (r = 1 m, 0.05 m/s → 1,130). Only the ratios between contact types matter at default, because the overall close-range intensity G is fitted.' }),
  P('transmission.beta.table', 'Air mixing around people sharing a table', 'Transmission', 'm³ per hour', [17, 85, 1130],
    { scale: 'log', note: 'Judgment: as care, with in-plume fraction 0.1 side by side at a table (0.5·17/0.1 = 85).' }),
  P('transmission.beta.break', 'Air mixing around staff sharing a break table', 'Transmission', 'm³ per hour', [17, 85, 1130],
    { scale: 'log', note: 'Judgment: same as a dining table.' }),
  P('transmission.beta.therapy', 'Air mixing around a therapist and resident', 'Transmission', 'm³ per hour', [8, 42, 1130],
    { scale: 'log', note: 'Judgment: same as personal care.' }),
  P('transmission.beta.visit', 'Air mixing around a visitor and resident', 'Transmission', 'm³ per hour', [8, 42, 1130],
    { scale: 'log', note: 'Judgment: face-to-face conversation, same as personal care.' }),
  P('transmission.beta.medpass', 'Air mixing around a nurse handing out medicines', 'Transmission', 'm³ per hour', [8, 42, 1130],
    { scale: 'log', note: 'Judgment: same as personal care.' }),
  P('transmission.beta.roommate', 'Air mixing between roommates (only used if roommate contact hours > 0)', 'Transmission', 'm³ per hour', [17, 85, 1130],
    { scale: 'log', note: 'Judgment: same as a table.' }),
  P('transmission.roommateHours', 'Hours a day roommates spend face to face (on top of sharing room air)', 'Transmission', 'hours per day', [0, 0, 2],
    { note: 'Judgment; off by default because roommates already share room air.' }),
  P('air.decay', 'How fast the virus dies in the air', 'Transmission', 'per hour', [0.3, 0.63, 7],
    { scale: 'log', source: SRC.vanDoremalen,
      note: 'SARS-CoV-2 half-life 1.1 h (0.63/h), also used by Buonanno 2020. High end 7/h reflects reports of fast early infectivity loss (Oswin et al. 2022, not opened by the research); low end is judgment.',
      byPathogen: { flu: { low: 0.2, central: 0.44, high: 1.5, source: SRC.nicasJones, note: '0.44/h at 15-40% RH (PR-8 strain); range judgment.' }, rsv: { low: 0.3, central: 0.6, high: 3, source: JUDGMENT, note: 'No RSV aerosol decay data found; judgment.' } } }),
  P('air.deposition', 'How fast virus-laden particles settle out of the air', 'Transmission', 'per hour', [0.1, 0.24, 1.0],
    { source: SRC.buonanno2020a, note: '0.24/h (Buonanno 2020); Nicas & Jones 2009 use 0.29/h for 3 µm particles. Range is judgment.',
      byPathogen: { flu: { low: 0.1, central: 0.29, high: 1.0, source: SRC.nicasJones }, rsv: { low: 0.1, central: 0.24, high: 1.0, source: SRC.buonanno2020a } } }),
  P('importation.staffDailyHazard', 'Chance a staff member catches it outside work on any given day', 'Transmission', 'per day', [0.0002, 0.001, 0.003],
    { scale: 'log', note: 'Research judgment (facility.md §8) from community burden: CDC 40 million flu illnesses 2023-24, Kuster et al. 2011 serology (5.4-18.7% per season), COVID illness estimates (Koumans et al. 2026) and 2020 nursing-home staff case rates (0.09-0.30%/day). Same value for all three pathogens; no RSV community data were obtained.' }),
  P('importation.visitorInfectiousProb', 'Chance a visitor is infectious', 'Transmission', 'probability', [0.001, 0.006, 0.02],
    { scale: 'log', note: 'Research judgment: prevalence ≈ daily incidence (0.1%) × infectious period (5-7 days).' }),

  // ===== Lamps =====
  P('lamp.ecadr', 'Clean air delivered by one lamp, by physics, with perfect air mixing', 'Lamps', 'm³ per hour', [lampCadr(2.6), lampCadr(5), lampCadr(12)],
    { scale: 'log',
      note: 'Calculated, not measured: 0.36 × k × P × L with P = 100 mW (Aerolamp/Ushio Care222 B1, verified), L = 2.4 m path length (≈ ceiling height) and the UV susceptibility k of the virus in air: SARS-CoV-2 2.6 / 5 / 12 cm²/mJ (Angel et al. 2025 measured 4.4-6.8; low and high from Kitagawa 2023 and Welch 2022, research judgment for the central). At a 2.4 m ceiling the maker says to dim this lamp to about 40-70%, which would scale this value down proportionally; not applied here. Room-sized chamber studies report 10-30× more effect than this physics predicts (Eadie et al. 2022; Hiwar et al. 2025; Buonanno et al. 2024); that excess is unexplained and is not used.',
      byPathogen: { flu: { low: lampCadr(1.8), central: lampCadr(5), high: lampCadr(20), source: JUDGMENT, note: 'Same formula with influenza A k = 1.8 / 5 / 20 cm²/mJ (Welch et al. 2018 measured 1.8; Buonanno et al. 2024 measured 20; central is research judgment).' },
        rsv: { low: lampCadr(1.5), central: lampCadr(4), high: lampCadr(15), source: JUDGMENT, note: 'Same formula with k = 1.5 / 4 / 15 cm²/mJ: no 222 nm measurement exists for RSV; proxy from other enveloped viruses.' } } }),
  P('lamp.realWorldFactor', 'Share of the physics effect a lamp achieves in a real room', 'Lamps', 'fraction', [0.5, 1, 1],
    { note: 'Mixing and shadowing efficiency η. No study quantifies it for real rooms; the one occupied-room measurement (dental clinic, Welch et al. 2026, about 6.5 extra air changes at 0.2 µW/cm²) is consistent with η ≈ 1. Low end is research judgment.' }),
  P('lamp.maxEach', 'Most extra air changes lamps can add to a shared room', 'Lamps', 'air changes per hour', [capAch(5, 0.8), capAch(5, 1.5), capAch(12, 1.5)],
    { note: 'Exposure-limit cap: lamps can only raise the room-average UV to about 1.5 µW/cm² while meeting the 2022 ACGIH 8-hour eye limit (typical compliant rooms 0.3-1.5, Peng et al. 2023). Extra air changes = 3.6 × k × E: 3.6 × 5 × 1.5 = 27/h. Low uses E = 0.8 (typical), high uses k = 12. Lamps beyond the cap add nothing.',
      byPathogen: { flu: { low: capAch(5, 0.8), central: capAch(5, 1.5), high: capAch(20, 1.5), source: JUDGMENT }, rsv: { low: capAch(4, 0.8), central: capAch(4, 1.5), high: capAch(15, 1.5), source: JUDGMENT } } }),
  P('lamp.maxEachBedroom', 'Most extra air changes lamps can add to a bedroom', 'Lamps', 'air changes per hour', [capAch(5, 0.1), capAch(5, 0.4), capAch(12, 1.0)],
    { note: 'Bedrooms are occupied around the clock, so the 8-hour limit is divided by 3: room average 0.1-1.0, central 0.4 µW/cm² (research judgment; NHS Assure advises against continuous 24-hour exposure). 3.6 × 5 × 0.4 = 7.2/h.',
      byPathogen: { flu: { low: capAch(5, 0.1), central: capAch(5, 0.4), high: capAch(20, 1.0), source: JUDGMENT }, rsv: { low: capAch(4, 0.1), central: capAch(4, 0.4), high: capAch(15, 1.0), source: JUDGMENT } } }),
  P('transmission.nearFieldUV', 'Share of close-range risk a lamp removes', 'Lamps', 'fraction', [0, 0, 0.05],
    { note: 'Judgment (transmission.md §4.2): exhaled air crosses 1 m in about 1-10 s, so at 10-30 equivalent air changes per hour less than 5% is inactivated on the way.' }),

  // ===== Building =====
  P('ventilation.scale', 'Ventilation compared with typical', 'Building', 'multiplier', [0.5, 1, 2], { scale: 'log', note: 'Scales the clean-air supply of every room at once. Range is judgment.' }),
  P('facility.wings', 'Number of wings (nursing units)', 'Building', 'wings', [2, 4, 5], { integer: true, note: 'Research default 4 units of 32 beds (judgment; units of 20-41 beds per FGI design guide and Massachusetts rules).' }),
  P('facility.residentsPerWing', 'Residents per wing', 'Building', 'residents', [25, 28, 30],
    { integer: true, note: '112 residents in 128 beds (87.5% occupied; national median occupancy 84.8% in 2025, CLA via Skilled Nursing News). At most singles + 2 × doubles.' }),
  P('facility.singlesPerWing', 'Single bedrooms per wing', 'Building', 'rooms', [2, 4, 8],
    { integer: true, note: '16 of 128 beds in single rooms (12.5%); about 16% of Medicare room-and-board days are in private rooms (Zhu et al. 2022).' }),
  P('facility.doublesPerWing', 'Shared (two-bed) bedrooms per wing', 'Building', 'rooms', [10, 14, 16], { integer: true, note: 'Judgment (rest of the 32 beds per wing).' }),
  P('facility.diningRooms', 'Number of dining rooms', 'Building', 'rooms', [1, 2, 4], { integer: true, note: 'Judgment: two dining rooms each serving two units (about 56 residents).' }),
  ...[
    ['bedroomSingle', 'single bedroom', [11, 14, 18], [2.4, 2.4, 2.7], 'Judgment just above the FGI 2018 minimum clear area (11.15 m²).'],
    ['bedroomDouble', 'shared bedroom', [20, 24, 30], [2.4, 2.4, 2.7], 'Judgment just above the FGI 2018 minimum (10.03 m² clear per bed).'],
    ['lounge', 'wing lounge', [15, 25, 40], [2.4, 2.4, 2.7], 'Judgment; no source found for lounge sizes.'],
    ['station', "nurses' station and corridor", [100, 134, 180], [2.4, 2.4, 2.7], 'Judgment: one 2.44 m × 55 m corridor per unit including the station alcove.'],
    ['dining', 'dining room', [70, 100, 140], [2.4, 2.7, 3.0], 'Judgment; together with activity room and lounges about 32 ft² per bed (Oregon minimum 30).'],
    ['activity', 'activity room', [50, 80, 120], [2.4, 2.7, 3.0], 'Judgment.'],
    ['therapy', 'therapy gym', [60, 110, 150], [2.4, 2.7, 3.0], 'Judgment.'],
    ['breakroom', 'staff break room', [12, 20, 35], [2.4, 2.4, 2.7], 'Judgment anchored on a measured 19 m² staff lunch room (Brass et al. 2022).'],
    ['kitchen', 'kitchen', [40, 70, 110], [2.4, 2.7, 3.0], 'Not researched; judgment.'],
    ['office', 'office', [30, 60, 90], [2.4, 2.4, 2.7], 'Judgment (offices combined).'],
    ['lobby', 'lobby', [40, 70, 100], [2.7, 3.0, 4.0], 'Judgment.'],
  ].flatMap(([k, name, a, h, note]) => [
    P(`facility.rooms.${k}.area`, `Floor area of each ${name}`, 'Building', 'm²', a, { note }),
    P(`facility.rooms.${k}.height`, `Ceiling height of each ${name}`, 'Building', 'm', h, { note: 'Research default 2.4 m for resident rooms and corridors (Japanese care home measured 2.4-2.7 m, Ishigaki 2022), 2.7-3.0 m for large common rooms; judgment.' }),
  ]),
  ...[
    ['bedroom', 'bedrooms', [0.5, 1.5, 2], 'Measured: 0.67 with the door closed and 3.87 open (mostly exchange with the corridor) in two Washington homes (Cohen et al. 2024); design minimum 2 (ASHRAE 170-2021). Central 1.5 is research judgment; high end is the design minimum.'],
    ['lounge', 'wing lounges', [1.5, 3, 4], 'Design minimum 4 (ASHRAE 170); no US measurement. Central is research judgment.'],
    ['station', "nurses' stations and corridors", [1, 2, 4], 'Design minimum 4 (ASHRAE 170). Central is research judgment.'],
    ['dining', 'dining rooms', [1.5, 3, 4], 'Design minimum 4 (ASHRAE 170); no US measurement. Central is research judgment.'],
    ['activity', 'the activity room', [1.5, 3, 4], 'Design minimum 4 (ASHRAE 170). Central is research judgment.'],
    ['therapy', 'the therapy gym', [2, 4, 6], 'Design minimum 6 (ASHRAE 170, physical therapy). Central is research judgment.'],
    ['breakroom', 'the staff break room', [0.5, 1, 4], 'Measured 0.65 in an Australian staff lunch room (Brass et al. 2022); not in the ASHRAE 170 table. Central and range are research judgment.'],
    ['kitchen', 'the kitchen', [3, 6, 10], 'Not researched; judgment (kitchens are exhausted).'],
    ['office', 'the office', [1, 2, 4], 'Not in ASHRAE 170 nursing-home table; research judgment.'],
    ['lobby', 'the lobby', [1, 2, 4], 'Not in ASHRAE 170 nursing-home table; research judgment.'],
  ].map(([k, name, v, note]) => P(`facility.ach.${k}`, `Clean air changes per hour in ${name}`, 'Building', 'per hour', v,
    { scale: 'log', note: note + ' Counts outdoor air plus filtered recirculated air.' })),

  // ===== People =====
  P('people.mobility.communal', 'Share of residents who eat in a dining room and join activities', 'People', 'fraction', [0.4, 0.6, 0.8],
    { note: 'Research judgment (facility.md §0.4): 60/30/10 split reconciling 81.5% eating in the dining area at an observed meal (Reed et al. 2005) with 25-80% across homes (PMC1361005) and 26-50% observed in bed during the day. The three shares are rescaled to add up to 1.' }),
  P('people.mobility.limited', 'Share of residents who eat in their room and rarely leave it', 'People', 'fraction', [0.15, 0.3, 0.45], { note: 'Research judgment (see above).' }),
  P('people.mobility.roombound', 'Share of residents who are bedbound', 'People', 'fraction', [0.04, 0.1, 0.2], { note: 'Research judgment; 4.2% of long-stay residents were mostly in bed or chair in 2005 MDS data (AHRQ 2007).' }),
  P('people.tableSize', 'People per dining table', 'People', 'people', [2, 4, 6], { integer: true, note: 'Judgment (research timetable: 4 per table).' }),
  P('people.pActivity', 'Chance a mobile resident joins the morning group activity', 'People', 'probability', [0.2, 0.4, 0.6], { note: 'Research judgment: 40% of mobile residents, groups of 10-20 (Irish units held 9-12 at a time, Morgan-Brown et al. 2011).' }),
  P('people.pActivityPM', 'Chance a mobile resident joins the afternoon group activity', 'People', 'probability', [0.1, 0.25, 0.4], { note: 'Research judgment: 25% of mobile residents.' }),
  P('people.pActivityLimited', 'Chance a room-oriented resident joins a group activity', 'People', 'probability', [0, 0.05, 0.15], { note: 'Judgment ("rarely leaves").' }),
  P('people.activityCapacity', 'Most residents the activity room holds', 'People', 'people', [12, 20, 30], { integer: true, note: 'Judgment: groups of 10-20; extra attendees use their wing lounge.' }),
  P('people.therapyShare', 'Share of residents in daily therapy (short-stay rehab)', 'People', 'fraction', [0.05, 0.12, 0.15], { note: 'Research judgment: about 10% of census is short-stay rehab, consistent with PBJ PT+OT time of about 18 min per resident-day (LTCCC Q1 2024).' }),
  P('people.pTherapy60', 'Share of therapy sessions that last an hour (others 30 minutes)', 'People', 'fraction', [0.5, 1, 1], { note: 'Judgment; research suggests 60-90 minutes a day, the model gives one session of at most an hour.' }),
  P('people.therapyPerTherapist', 'Residents a therapist sees at the same time', 'People', 'people', [1, 2, 3], { integer: true, note: 'Judgment.' }),
  P('people.pLoungeIdle', 'Chance a mobile resident spends a free hour in the wing lounge', 'People', 'probability', [0.2, 0.35, 0.55], { note: 'Judgment chosen so mobile residents spend about 17 of 24 hours in their own room (research default), i.e. about 45% of daytime there (Siette & Dodds 2022 observed 45%).' }),
  P('people.pLoungeIdleLimited', 'Chance a room-oriented resident spends a free hour in the wing lounge', 'People', 'probability', [0, 0.05, 0.15], { note: 'Judgment (about 23 hours a day in their own room).' }),
  P('importation.visitsPerResidentPerDay', 'Visits per resident per day', 'People', 'visits', [0.1, 0.25, 0.5], { note: 'Research judgment (1.75 a week); 58% of relatives visit at least weekly (Weimer et al. 2022).' }),
  P('importation.visitMinutes', 'Length of a visit', 'People', 'minutes', [30, 75, 180], { note: 'Research judgment; a small sample of engaged families reported mean 135 minutes (biased high).' }),
  P('importation.visitLoungeShare', 'Share of visits in the wing lounge', 'People', 'fraction', [0.1, 0.3, 0.5], { note: 'Research judgment (60% in the room, 30% lounge, 10% lobby).' }),
  P('importation.visitLobbyShare', 'Share of visits in the lobby', 'People', 'fraction', [0, 0.1, 0.2], { note: 'Research judgment.' }),
  P('importation.visitCloseShare', 'Share of a visit spent face to face', 'People', 'fraction', [0.2, 0.5, 0.8], { note: 'Judgment.' }),
  ...[
    ['cna', 'Care aides on the units', [14, 11, 8], 'NJ statutory ratios (1 aide per 8 / 10 / 14 residents, verified) applied to 112 residents; these reproduce PBJ CNA hours (2.29 per resident-day, Q2 2026).'],
    ['aideFloat', 'Restorative / bath aides working across all units', [1, 0, 0], 'Research judgment.'],
    ['nurse', 'Licensed practical nurses (charge / medication nurses)', [5, 4, 3], 'Research judgment from PBJ LPN hours (0.86 per resident-day): one per unit, a treatment nurse on days, one per two units at night.'],
    ['rn', 'Registered nurses (supervisor and unit managers)', [3, 2, 1], 'Research judgment: RN supervisor every shift (federal rule requires an RN at least 8 h a day) plus unit managers.'],
    ['therapist', 'Therapists (PT, OT, speech)', [5, 0, 0], 'Research judgment from PBJ PT 9.5 and OT 8.4 minutes per resident-day (LTCCC Q1 2024). Weekdays only.'],
    ['dietary', 'Kitchen and dining staff', [5, 4, 0], 'Research judgment; no national figure found.'],
    ['housekeeping', 'Housekeeping, laundry and maintenance', [6, 1, 0], 'Research judgment.'],
    ['activities', 'Activities staff', [2, 1, 0], 'Research judgment from PBJ activities 9.5 minutes per resident-day.'],
    ['admin', 'Office, administration, director of nursing and social work', [9, 0, 0], 'Research judgment (administrator and office 5, DON/ADON/MDS 3, social services 1). Weekdays only.'],
  ].flatMap(([role, name, n, note]) => ['day', 'evening', 'night'].map((sh, i) =>
    P(`staff.staffing.${role}.${sh}`, `${name} on the ${sh} shift`, 'People', 'people on duty', [Math.max(0, Math.floor(n[i] * 0.7)), n[i], Math.ceil(n[i] * 1.3)],
      { integer: true, note: note + ' Total 85 staff on duty on a weekday and 71 at weekends (the research roster rows sum to 85; its stated total is 83).' }))),
  P('staff.workDaysPerWeek', 'Days a week each staff member works', 'People', 'days', [3, 5, 6], { note: 'Judgment. Fewer days means a bigger pool of staff covering the same shifts.' }),
  P('staff.floatShare', 'Chance a care aide or nurse covers a different unit on a given day', 'People', 'probability', [0.05, 0.15, 0.3], { note: 'Research judgment; no quantified US source found.' }),
  P('staff.breakroomCapacity', 'Most staff on break at the same time', 'People', 'people', [3, 4, 6], { integer: true, note: 'Research judgment: 3-6 people at peak on the day shift.' }),
  P('staff.breakTableSize', 'Staff per break-room table', 'People', 'people', [2, 4, 6], { integer: true, note: 'Judgment.' }),
  P('staff.careEpisodesPerShift.day', 'Personal-care visits per resident, day shift', 'People', 'visits', [1, 2, 3], { integer: true, note: 'Judgment from the research timetable (morning care, toileting/repositioning).' }),
  P('staff.careEpisodesPerShift.evening', 'Personal-care visits per resident, evening shift', 'People', 'visits', [1, 2, 3], { integer: true, note: 'Judgment (evening care, bedtime care).' }),
  P('staff.careEpisodesPerShift.night', 'Personal-care visits per resident, night shift', 'People', 'visits', [1, 1, 2], { integer: true, note: 'Judgment (night checks, early morning care).' }),
  P('staff.careMinutes', 'Length of a personal-care visit', 'People', 'minutes', [6, 10, 16],
    { note: 'Judgment: 5 visits × 10 min ≈ 50 min of close care per resident-day, against a research estimate of 45 (30-80) min = PBJ CNA 2.29 h × 31% direct-care share (Qian et al. 2012).' }),
  P('staff.medpassMinutes', 'Time a nurse spends with each resident on a medicine round', 'People', 'minutes', [2, 3, 5], { note: 'Research judgment (2-5 min per medication pass).' }),
  P('staff.mealAssistMinutes', 'Time a care aide spends helping each resident at a meal', 'People', 'minutes', [2.5, 5, 7],
    { source: SRC.mealAssist, note: 'Average feeding assistance 2.5-7 min per resident (verified); central is the midpoint.' }),

  // ===== Disease =====
  P('disease.latent.mean', 'Days from infection until infectious', 'Disease', 'days', [1, 2, 3],
    { note: 'Research judgment: incubation 3.42 days for Omicron (Wu et al. 2022, verified) minus about 1.5 days of pre-symptomatic infectiousness.',
      byPathogen: bp([0.5, 1.0, 1.5], [2, 3, 4]) }),
  P('disease.latent.shape', 'How consistent that delay is (higher = less variable)', 'Disease', 'gamma shape', [2, 4, 9],
    { scale: 'log', note: 'Judgment: SD ≈ 1 day (covid, RSV), 0.5 day (flu).', byPathogen: bp([2, 4, 9], [4, 9, 16]) }),
  P('disease.presymptomatic.mean', 'Days infectious before symptoms start', 'Disease', 'days', [1, 1.5, 2.5],
    { note: 'Research judgment, consistent with about 51% of transmission before symptoms in Omicron households (Manica et al. 2022).', byPathogen: bp([0.3, 0.5, 1], [0.5, 1, 2]) }),
  P('disease.presymptomatic.shape', 'How consistent that period is', 'Disease', 'gamma shape', [2, 3.5, 8], { scale: 'log', note: 'Judgment (SD ≈ 0.8 day for covid).' }),
  P('disease.infectious.mean', 'Days infectious after symptoms start', 'Disease', 'days', [3.5, 5.5, 8],
    { note: 'Research judgment: total infectious period about 7 days (culture positivity about 8 days for Omicron, Jang et al. 2022).', byPathogen: bp([3.5, 4.5, 6.5], [3, 5, 9]) }),
  P('disease.infectious.shape', 'How consistent that period is', 'Disease', 'gamma shape', [3, 7.6, 12], { scale: 'log', note: 'Judgment (SD ≈ 2 days covid, 1.5 flu).', byPathogen: bp([4, 9, 16], [3, 6.25, 12]) }),
  P('disease.pSymptomatic.resident', 'Share of infected residents who get symptoms', 'Disease', 'fraction', [0.71, 0.8, 0.87],
    { source: SRC.sah, note: '1 − asymptomatic share in the elderly, 19.7% (12.7-29.4%).',
      byPathogen: bp([0.65, 0.8, 0.9], [0.6, 0.8, 0.9]) }),
  P('disease.pSymptomatic.staff', 'Share of infected staff who get symptoms', 'Disease', 'fraction', [0.6, 0.65, 0.75],
    { source: SRC.sah, note: '1 − asymptomatic share in adults, 35% (25-40%; Omicron 32.4-32.5%, Shang 2022, von Bartheld 2024).',
      byPathogen: bp([0.5, 0.7, 0.84], [0.5, 0.7, 0.8]) }),
  P('disease.peakDays', 'Days at full infectiousness after symptoms start', 'Disease', 'days', [0, 1, 2], { note: 'Judgment approximating infectiousness that peaks around onset and halves every 1.5-2 days (transmission.md §2.1).' }),
  P('disease.tailLevel', 'Infectiousness at the end, relative to the peak', 'Disease', 'fraction', [0, 0.1, 0.3], { note: 'Judgment (see above).' }),
  P('disease.asymRelInf', 'Infectiousness of people without symptoms, relative to those with', 'Disease', 'ratio', [0.16, 0.32, 0.64],
    { source: SRC.buitrago, note: 'Secondary attack rate ratio, asymptomatic vs symptomatic.', byPathogen: bp([0.3, 0.5, 1], [0.3, 0.5, 1]) }),
  P('immune.share.resident', 'Share of residents with some protection', 'Disease', 'fraction', [0.5, 1, 1],
    { note: 'Judgment: protection is modelled as leaky (everyone\'s chance of infection cut by the protection value), as the research recommends. Lower this to make protection all-or-nothing for a share of residents.' }),
  P('immune.share.staff', 'Share of staff with some protection', 'Disease', 'fraction', [0.5, 1, 1], { note: 'Judgment (see above).' }),
  P('immune.protection', 'How much existing immunity cuts residents\' chance of infection', 'Disease', 'fraction', [0.15, 0.3, 0.5],
    { note: 'Research judgment of "effectively immune at season start": COVID vaccine coverage 29.7% in residents (Reses et al. 2024), VE against medically attended illness about 35% (Link-Gelles et al. 2025), prior-infection protection 36-45% (COVID-19 Forecasting Team 2023).',
      byPathogen: bp([0.1, 0.25, 0.4], [0.05, 0.15, 0.3]) }),
  P('immune.protectionStaff', 'How much existing immunity cuts staff members\' chance of infection', 'Disease', 'fraction', [0.15, 0.3, 0.5],
    { note: 'Research judgment (as for residents; RSV lower: no staff vaccination).', byPathogen: bp([0.1, 0.25, 0.4], [0.05, 0.1, 0.25]) }),

  // ===== Responses =====
  P('control.staffExclusion.exclusionDays', 'Days a sick staff member stays off work', 'Responses', 'days', [5, 7, 10],
    { source: SRC.cdcHcp, note: 'Return after 7 days with a negative test, or 10 without.',
      byPathogen: bp([3, 5, 7], [3, 5, 7]) }),
  P('control.staffExclusion.staysHomeShare', 'Share of staff who stay home when they have symptoms', 'Responses', 'fraction', [0.4, 0.7, 0.9],
    { note: 'Judgment; working while symptomatic is documented in outbreak reports (Murti et al. 2021) but not quantified.' }),
  P('control.staffExclusion.delayDaysMax', 'Longest delay before a sick staff member stops coming in', 'Responses', 'days', [0, 1, 3], { note: 'Judgment. Each person\'s delay is drawn evenly between 0 and this.' }),
  P('control.residentIsolation.isolationDelayDays', 'Days from a resident\'s first symptoms until they are isolated', 'Responses', 'days', [0.5, 1, 3], { note: 'Judgment (testing and detection delay).' }),
  P('control.residentIsolation.isolationDays', 'Days a sick resident stays isolated in their room', 'Responses', 'days', [7, 10, 14],
    { note: 'Research judgment: 10 days for COVID (from memory of CDC guidance, not re-verified).', byPathogen: { flu: { low: 7, central: 7, high: 10, source: SRC.cdcFlu, note: 'Droplet precautions at least 7 days from onset.' }, rsv: { low: 5, central: 7, high: 10, source: JUDGMENT } } }),
  P('control.outbreakMode.trigger', 'Cases on a unit within a few days that start outbreak measures there', 'Responses', 'cases', [1, 1, 2],
    { integer: true, note: 'Research judgment for COVID: the first detected case (resident with symptoms, or staff member).', byPathogen: { flu: { low: 1, central: 2, high: 3, source: SRC.cdcFlu, note: 'Two lab-confirmed cases within 72 hours on one unit.' }, rsv: { low: 1, central: 2, high: 3, source: JUDGMENT } } }),
  P('control.outbreakMode.windowDays', 'Window for counting those cases', 'Responses', 'days', [1, 3, 7], { source: SRC.cdcFlu, note: '72 hours (CDC influenza guidance), used for all three.' }),
  P('control.outbreakMode.responseDelayDays', 'Days from detection until measures start', 'Responses', 'days', [0, 1, 2], { note: 'Research judgment (0-1 day).' }),
  P('control.outbreakMode.outbreakDays', 'Days outbreak measures last after the latest case', 'Responses', 'days', [7, 14, 28],
    { note: 'Research judgment: 14 days after the last case for COVID, 7 for influenza.', byPathogen: bp([5, 7, 14], [5, 7, 14]) }),
  P('control.outbreakMode.facilityWideWings', 'Units in outbreak before measures go facility-wide', 'Responses', 'units', [1, 2, 4], { integer: true, note: 'Research judgment (CDC: consider all meals in rooms if several units are affected).' }),
  P('control.masks.surgical.in', 'Protection a surgical mask gives its wearer', 'Responses', 'fraction', [0.07, 0.3, 0.5],
    { note: 'Research judgment between verified endpoints: 7.5% receiver-only reduction (Brooks et al. 2021) and simulated workplace protection (Coffey et al. 2007).' }),
  P('control.masks.surgical.out', 'How much a surgical mask stops the wearer spreading it', 'Responses', 'fraction', [0.3, 0.5, 0.77],
    { note: 'Research judgment; Brooks et al. 2021 measured 56% (unknotted) and 77% (knotted and tucked) source control.' }),
  P('control.masks.n95.in', 'Protection an N95 respirator gives its wearer', 'Responses', 'fraction', [0.7, 0.8, 0.97],
    { note: 'Research judgment between verified endpoints: un-fit-tested 5th percentile ≈ 70% (Coffey et al. 2007) and fit-tested 97-99% (Rengasamy et al. 2015).' }),
  P('control.masks.n95.out', 'How much an N95 respirator stops the wearer spreading it', 'Responses', 'fraction', [0.5, 0.8, 0.9], { note: 'Research judgment (lower with exhalation valves).' }),
];

// ---------------------------------------------------------------------------
// Small path helpers (also used by analysis.js and cli.js).
// ---------------------------------------------------------------------------
function getPath(obj, path) {
  let o = obj;
  for (const k of path.split('.')) { if (o == null) return undefined; o = o[k]; }
  return o;
}
function setPath(obj, path, value) {
  const ks = path.split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) {
    if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {};
    o = o[ks[i]];
  }
  o[ks[ks.length - 1]] = value;
}
function cloneJSON(x) { return JSON.parse(JSON.stringify(x)); }
// Deep-merge plain objects (arrays and scalars in `over` replace those in `base`).
function mergeConfig(base, over) {
  const out = cloneJSON(base);
  (function rec(dst, src) {
    for (const k of Object.keys(src || {})) {
      const v = src[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && dst[k] && typeof dst[k] === 'object' && !Array.isArray(dst[k])) rec(dst[k], v);
      else dst[k] = cloneJSON(v);
    }
  })(out, over);
  return out;
}

// Pathogen presets, as nested config overrides built from the byPathogen
// values above (single source of truth).
function buildPathogenPresets() {
  const labels = { covid: 'COVID-19', flu: 'Influenza', rsv: 'RSV' };
  const out = {};
  for (const name of Object.keys(labels)) {
    const overrides = { pathogen: name };
    if (name !== 'covid') for (const p of PARAMS) if (p.byPathogen && p.byPathogen[name]) setPath(overrides, p.path, p.byPathogen[name].central);
    out[name] = { label: labels[name], overrides };
  }
  return out;
}
const PATHOGENS = buildPathogenPresets();

// Full config for a pathogen: BASE + central values + pathogen overrides.
// Unknown pathogen names (e.g. 'custom') fall back to covid values.
function defaultConfig(pathogen = 'covid') {
  const cfg = cloneJSON(BASE);
  for (const p of PARAMS) setPath(cfg, p.path, p.central);
  const preset = PATHOGENS[pathogen] || PATHOGENS.covid;
  const out = mergeConfig(cfg, preset.overrides);
  out.pathogen = pathogen;
  return out;
}

// Range of a parameter for a pathogen: {low, central, high}.
function paramRange(param, pathogen = 'covid') {
  const b = param.byPathogen && param.byPathogen[pathogen];
  return b ? { low: b.low, central: b.central, high: b.high } : { low: param.low, central: param.central, high: param.high };
}

// ---- src/engine.js ----
// Care-home airborne transmission model: simulation engine.
//
// ES module, zero dependencies, no DOM, no Node-only APIs. Runs unchanged in a
// browser Web Worker and in Node 22. All randomness comes from seeded PRNG
// streams created in buildWorld(); runSeason() draws no random numbers at all,
// so two runs on the same world differ only because of the intervention
// (common random numbers).
//
// Units throughout: time in hours (one slot = 0.5 h, 48 slots per day, slot 0
// starts at 00:00), lengths in metres, volumes in m³, emission in quanta/h,
// concentration in quanta/m³, dose in quanta (effective, i.e. after the
// person's susceptibility and masks). A dose of 1 quantum infects with
// probability 1 − e^{−1} ≈ 63%.
//
// A world has two layers:
//   structure — rooms, people, roster, schedules, contacts, tables, visits.
//               Depends only on "structural" config (facility layout, people,
//               staffing, timetables, visit frequency) and the seed.
//   derived   — per-person traits (thresholds, emission, durations, immunity,
//               community-infection day), infectious visitors, room ACH.
//               Depends on everything else.
// buildWorld(config, seed, { reuse: previousWorld }) rebuilds only the derived
// layer when the structural config and seed are unchanged. Both paths run the
// same derive code, so results are bit-identical.
//
// Note for the web build: params.js, engine.js and analysis.js are concatenated
// into one scope, so top-level names must be unique across the three files.

const SLOTS_PER_DAY = 48;
const SLOT_HOURS = 0.5;

const ROOM_TYPES = ['bedroom', 'lounge', 'station', 'dining', 'activity', 'therapy', 'breakroom', 'kitchen', 'office', 'lobby', 'outside'];
const ROLES = ['resident', 'cna', 'nurse', 'therapist', 'dietary', 'housekeeping', 'activities', 'admin', 'rn', 'aideFloat'];
const SHIFT_NAMES = ['day', 'evening', 'night'];
const CONTACT_TYPES = ['care', 'table', 'break', 'therapy', 'visit', 'medpass', 'roommate'];
const ROUTES = ['room', 'close', 'community'];
const STATES = ['S', 'E', 'Ipre', 'Isym', 'Iasym', 'R'];

const RT = {}; ROOM_TYPES.forEach((t, i) => { RT[t] = i; });
const CT = {}; CONTACT_TYPES.forEach((t, i) => { CT[t] = i; });
// Contact types during which the staff member (party a) is briefly in the
// contact's room for tau hours: these double as sub-slot "visits" (§1.4).
const PRESENCE_TYPE = new Uint8Array(CONTACT_TYPES.length); PRESENCE_TYPE[CT.care] = 1; PRESENCE_TYPE[CT.medpass] = 1;
const ROLE_IDX = {}; ROLES.forEach((t, i) => { ROLE_IDX[t] = i; });
// Roles whose posts are tied to a wing (split across wings by the roster).
const WING_ROLES = { cna: true, nurse: true, housekeeping: true };
// Emission/breathing contexts.
const CTX_REST = 0, CTX_SOCIAL = 1, CTX_WORK = 2;
// Disease states.
const ST_S = 0, ST_E = 1, ST_IPRE = 2, ST_ISYM = 3, ST_IASYM = 4, ST_R = 5;
const NEVER = 0x3fffffff; // "slot index that never comes"

// PRNG stream identifiers. Each (seed, stream, index) triple gets its own
// independent generator, so e.g. person 17's traits never depend on how many
// draws anyone else used.
const STREAM_TRAITS = 1, STREAM_RESIDENT_SETUP = 2, STREAM_RESIDENT_DAYS = 3, STREAM_VISITS = 4,
  STREAM_FLOAT = 5, STREAM_TABLES = 6, STREAM_VISIT_OCC = 7;

// Config subtrees / paths that do NOT affect the world structure. Everything
// else is structural (facility geometry, people, staffing, timetables, visits).
const NON_STRUCTURAL = ['pathogen', 'scenario', 'emission', 'disease', 'immune', 'air', 'lamp', 'ventilation', 'breathing', 'control',
  'transmission.G', 'transmission.beta', 'transmission.nearFieldUV', 'transmission.closeShare',
  'facility.ach', 'importation.staffDailyHazard', 'importation.visitorInfectiousProb', 'importation.visitCloseShare'];

// ===========================================================================
// PRNG: sfc32 seeded through a murmur-style hash of (seed, stream, index).
// ===========================================================================
function fmix32(h) {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16; return h >>> 0;
}
function streamSeed(seed, stream, index) {
  let h = fmix32((seed >>> 0) ^ 0x9e3779b9);
  h = fmix32(h ^ Math.imul(stream + 1, 0x27d4eb2f));
  h = fmix32(h ^ Math.imul((index | 0) + 1, 0x165667b1));
  return h;
}
// Returns a function () => uniform in [0, 1). mulberry32: one 32-bit state,
// a few integer operations per draw (the schedule builder draws ~300k numbers
// per world, so speed matters); statistically adequate for this use.
function makeRng(seed32) {
  let a = seed32 >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rngFor = (seed, stream, index) => makeRng(streamSeed(seed, stream, index));
// Standard normal via Box-Muller: always consumes exactly two uniforms.
function randNormal(rng) {
  const u1 = 1 - rng(), u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
// Gamma(shape k, scale θ) by Marsaglia-Tsang. Mean kθ.
function randGamma(rng, k, theta) {
  if (!(k > 0) || !(theta > 0)) return Math.max(0, k * theta) || 0;
  if (k < 1) return randGamma(rng, k + 1, theta) * Math.pow(1 - rng(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let z, v;
    do { z = randNormal(rng); v = 1 + c * z; } while (v <= 0);
    v = v * v * v;
    const u = 1 - rng();
    if (Math.log(u) < 0.5 * z * z + d - d * v + d * Math.log(v)) return d * v * theta;
  }
}
const gammaMeanShape = (rng, mean, shape) => randGamma(rng, shape, mean / shape);
function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  return arr;
}

// ===========================================================================
// 1.1 Facility
// ===========================================================================
const pad2 = (n) => (n < 10 ? '0' : '') + n;

// Returns the flat room list. Room ids are a contract with the UI:
//   w{W}-bed-{NN} (W 0-based, NN 01-based: singles first, then doubles),
//   w{W}-lounge, w{W}-station, dining-{N} (N 1-based), activity, therapy,
//   breakroom, kitchen, office, lobby, outside.
// `ach` is the room type's base clean-air changes per hour; the engine
// multiplies it by config.ventilation.scale.
function buildFacility(fac) {
  const rooms = [];
  const add = (id, type, wing, name, key, extra = {}) => {
    const g = key ? fac.rooms[key] : { area: 0, height: 0 };
    rooms.push({ id, type, wing, name, area: g.area, height: g.height, volume: g.area * g.height, ach: type === 'outside' ? 0 : fac.ach[type], ...extra });
  };
  const wingLetter = (w) => (w < 26 ? String.fromCharCode(65 + w) : 'W' + w);
  for (let w = 0; w < fac.wings; w++) {
    let n = 0;
    for (let i = 0; i < fac.singlesPerWing; i++) { n++; add(`w${w}-bed-${pad2(n)}`, 'bedroom', w, `Wing ${wingLetter(w)} room ${n}`, 'bedroomSingle', { beds: 1 }); }
    for (let i = 0; i < fac.doublesPerWing; i++) { n++; add(`w${w}-bed-${pad2(n)}`, 'bedroom', w, `Wing ${wingLetter(w)} room ${n} (shared)`, 'bedroomDouble', { beds: 2 }); }
    add(`w${w}-lounge`, 'lounge', w, `Wing ${wingLetter(w)} lounge`, 'lounge');
    add(`w${w}-station`, 'station', w, `Wing ${wingLetter(w)} nurses' station and corridor`, 'station');
  }
  for (let i = 1; i <= fac.diningRooms; i++) add(`dining-${i}`, 'dining', -1, `Dining room ${i}`, 'dining');
  add('activity', 'activity', -1, 'Activity room', 'activity');
  add('therapy', 'therapy', -1, 'Therapy room', 'therapy');
  add('breakroom', 'breakroom', -1, 'Staff break room', 'breakroom');
  add('kitchen', 'kitchen', -1, 'Kitchen', 'kitchen');
  add('office', 'office', -1, 'Office', 'office');
  add('lobby', 'lobby', -1, 'Lobby', 'lobby');
  add('outside', 'outside', -1, 'Outside the building', null);
  return rooms;
}

// ===========================================================================
// Column stores (slot-indexed records) packed into CSR by slot
// ===========================================================================
function makeColumns(spec, cap = 1024) {
  cap = Math.max(16, cap | 0);
  const st = { n: 0, cap, spec, g: new Int32Array(cap), cols: {} };
  for (const [name, Ctor] of spec) st.cols[name] = new Ctor(cap);
  return st;
}
function growColumns(st) {
  const cap = st.cap * 2;
  const g = new Int32Array(cap); g.set(st.g); st.g = g;
  for (const [name, Ctor] of st.spec) { const a = new Ctor(cap); a.set(st.cols[name]); st.cols[name] = a; }
  st.cap = cap;
}
// Stable counting sort by slot g.
function packCSR(T, st) {
  const n = st.n, gs = st.g;
  const start = new Int32Array(T + 1);
  for (let i = 0; i < n; i++) start[gs[i] + 1]++;
  for (let g = 0; g < T; g++) start[g + 1] += start[g];
  if (st.sorted) { // already in slot order: no permutation needed
    const out = { start, length: n };
    for (const [name] of st.spec) out[name] = st.cols[name].length === n ? st.cols[name] : st.cols[name].slice(0, n);
    return out;
  }
  const pos = start.slice(0, T);
  const perm = new Int32Array(n);
  for (let i = 0; i < n; i++) perm[pos[gs[i]]++] = i;
  const out = { start, length: n };
  for (const [name, Ctor] of st.spec) {
    const src = st.cols[name], dst = new Ctor(n);
    for (let k = 0; k < n; k++) dst[k] = src[perm[k]];
    out[name] = dst;
  }
  return out;
}
const VISIT_SPEC = [['person', Uint16Array], ['room', Uint16Array], ['frac', Float64Array]];
const CONTACT_SPEC = [['a', Uint16Array], ['b', Uint16Array], ['type', Uint8Array], ['tau', Float32Array], ['room', Uint16Array]]; // tau in hours (Float32: ~1e-7 relative rounding)
const VISITOR_SPEC = [['visitor', Int32Array], ['room', Uint16Array], ['resident', Int32Array], ['tau', Float64Array]];
function pushVisit(st, g, person, room, frac) {
  if (st.n === st.cap) growColumns(st);
  const k = st.n++, c = st.cols;
  st.g[k] = g; c.person[k] = person; c.room[k] = room; c.frac[k] = frac;
}
function pushContact(st, g, a, b, type, tau, room) {
  if (st.n === st.cap) growColumns(st);
  const k = st.n++, c = st.cols;
  st.g[k] = g; c.a[k] = a; c.b[k] = b; c.type[k] = type; c.tau[k] = tau; c.room[k] = room;
}
function pushVisitorEmit(st, g, visitor, room, resident, tau) {
  if (st.n === st.cap) growColumns(st);
  const k = st.n++, c = st.cols;
  st.g[k] = g; c.visitor[k] = visitor; c.room[k] = room; c.resident[k] = resident; c.tau[k] = tau;
}
// For tests / custom worlds: column stores from plain arrays of objects.
function columnsFrom(kind, list) {
  if (kind === 'visits') { const st = makeColumns(VISIT_SPEC); for (const v of list) pushVisit(st, v.g, v.person, v.room, v.frac); return st; }
  if (kind === 'contacts') { const st = makeColumns(CONTACT_SPEC); for (const v of list) pushContact(st, v.g, v.a, v.b, CT[v.type], v.tau, v.room); return st; }
  if (kind === 'visitorEmit') { const st = makeColumns(VISITOR_SPEC); for (const v of list) pushVisitorEmit(st, v.g, v.visitor, v.room, v.resident, v.tau); return st; }
  throw new Error('unknown kind ' + kind);
}

// ===========================================================================
// 1.3 Per-person pre-drawn randomness (derived layer)
// ===========================================================================
// Every person draws the same sequence of uniforms from their own stream, in a
// fixed order, whatever their role. Changing the intervention cannot change
// any of these; changing config values changes the values but not which
// uniform each one is built from.
function drawTraits(config, seed, people) {
  const N = people.length;
  const dis = config.disease, imm = config.immune, em = config.emission;
  const ctl = config.control.staffExclusion;
  const tr = {
    threshold: new Float64Array(N), q: new Float64Array(N),
    latent: new Int32Array(N), presym: new Int32Array(N), infDur: new Int32Array(N),
    symptomatic: new Uint8Array(N), immune: new Uint8Array(N), s: new Float64Array(N),
    routeU: new Float64Array(N), communityDay: new Int32Array(N),
    staysHome: new Uint8Array(N), homeDelaySlots: new Int32Array(N),
  };
  const toSlots = (daysVal) => Math.max(1, Math.round(daysVal * SLOTS_PER_DAY));
  const lnGsd = Math.log(Math.max(1, em.gsd));
  const h = config.importation.staffDailyHazard;
  const logOneMinusH = h > 0 && h < 1 ? Math.log(1 - h) : 0;
  for (let p = 0; p < N; p++) {
    const rng = rngFor(seed, STREAM_TRAITS, p);
    const person = people[p];
    const group = person.role === 'resident' ? 'resident' : 'staff';
    tr.threshold[p] = -Math.log(1 - rng());                     // Exp(1): Sellke threshold
    // Lognormal emission at rest (quanta/h). With log10 SD 1.2 (GSD ≈ 16) a
    // 1-in-a-million draw is ~ 10^5.7 × median: large but finite, and only
    // ever multiplied, never exponentiated, so no overflow.
    tr.q[p] = em.median * Math.exp(lnGsd * randNormal(rng));
    tr.routeU[p] = rng();
    const uSym = rng(), uImm = rng(), uComm = rng(), uHome = rng(), uDelay = rng();
    tr.symptomatic[p] = uSym < dis.pSymptomatic[group] ? 1 : 0;
    const share = imm.share[person.role] != null ? imm.share[person.role] : imm.share[group];
    tr.immune[p] = uImm < share ? 1 : 0;
    const prot = group === 'staff' && imm.protectionStaff != null ? imm.protectionStaff : imm.protection;
    tr.s[p] = tr.immune[p] ? 1 - prot : 1;
    // Community infection day: geometric with daily hazard h (staff only).
    if (group === 'staff' && h > 0) {
      const d = h >= 1 ? 0 : Math.floor(Math.log(1 - uComm) / logOneMinusH);
      tr.communityDay[p] = Math.min(d, NEVER);
    } else tr.communityDay[p] = NEVER;
    tr.staysHome[p] = group === 'staff' && uHome < ctl.staysHomeShare ? 1 : 0;
    tr.homeDelaySlots[p] = Math.round(uDelay * ctl.delayDaysMax * SLOTS_PER_DAY);
    // Durations last (gamma uses a variable number of draws).
    tr.latent[p] = toSlots(gammaMeanShape(rng, dis.latent.mean, dis.latent.shape));
    tr.presym[p] = toSlots(gammaMeanShape(rng, dis.presymptomatic.mean, dis.presymptomatic.shape));
    tr.infDur[p] = toSlots(gammaMeanShape(rng, dis.infectious.mean, dis.infectious.shape));
  }
  return tr;
}

// Structural config fingerprint: config with non-structural paths removed.
function structuralKey(config) {
  const c = JSON.parse(JSON.stringify(config));
  for (const path of NON_STRUCTURAL) {
    const ks = path.split('.');
    let o = c;
    for (let i = 0; i < ks.length - 1 && o; i++) o = o[ks[i]];
    if (o) delete o[ks[ks.length - 1]];
  }
  return JSON.stringify(c);
}

// ===========================================================================
// World assembly: structure + derived layer
// ===========================================================================
// parts = { rooms, people, days, locSlot (index g*N+p), visits, contacts
//           (column stores from columnsFrom), visitorEmit (column store, for
//           tests), tables [{room, members[]}], visitors[], fallbackRoom[] }
// people[i] = { id, role, wing, homeRoomIndex, shift, extra }
function assembleWorld(config, seed, parts) {
  const struct = finishStructure(config, parts);
  struct.achFromConfig = false;
  if (parts.visitorEmit) struct.fixedVisitorEmit = packCSR(struct.T, parts.visitorEmit);
  return deriveWorld(config, seed, struct, null);
}
function finishStructure(config, parts) {
  const { rooms, people, days } = parts;
  const N = people.length, T = days * SLOTS_PER_DAY, nRooms = rooms.length;
  const roomIndex = {}; rooms.forEach((r, i) => { roomIndex[r.id] = i; });
  if (roomIndex.outside == null) throw new Error('facility must contain an "outside" room');
  const isStaff = new Uint8Array(N), roleIdx = new Uint8Array(N), homeRoom = new Uint16Array(N), fallbackRoom = new Uint16Array(N), wingOf = new Int16Array(N);
  for (let p = 0; p < N; p++) {
    const pp = people[p];
    isStaff[p] = pp.role === 'resident' ? 0 : 1;
    roleIdx[p] = ROLE_IDX[pp.role] != null ? ROLE_IDX[pp.role] : 0;
    homeRoom[p] = pp.homeRoomIndex;
    fallbackRoom[p] = parts.fallbackRoom ? parts.fallbackRoom[p] : pp.homeRoomIndex;
    wingOf[p] = pp.wing == null ? -1 : pp.wing;
  }
  const roomType = new Uint8Array(nRooms);
  rooms.forEach((r, i) => { roomType[i] = RT[r.type]; });
  // Tables (static membership; contacts are derived at run time from presence).
  const tl = parts.tables || [];
  const tableStart = new Int32Array(tl.length + 1), tableRoom = new Int32Array(tl.length);
  let nm = 0; tl.forEach((t, i) => { tableStart[i] = nm; nm += t.members.length; tableRoom[i] = t.room; });
  tableStart[tl.length] = nm;
  const tableMembers = new Int32Array(nm);
  nm = 0; for (const t of tl) for (const m of t.members) tableMembers[nm++] = m;
  const mealSlot = new Uint8Array(SLOTS_PER_DAY), groupSlot = new Uint8Array(SLOTS_PER_DAY);
  for (const [a, b] of config.schedule.meals) for (let s = a; s < b; s++) { mealSlot[s] = 1; groupSlot[s] = 1; }
  for (const [a, b] of config.schedule.activities) for (let s = a; s < b; s++) groupSlot[s] = 1;
  const nWings = Math.max(1, ...rooms.map((r) => r.wing + 1));
  return {
    days, T, N, nRooms, rooms, roomIndex, outside: roomIndex.outside, roomType, nWings,
    peopleRaw: people, nResidents: people.filter((p) => p.role === 'resident').length,
    isStaff, roleIdx, homeRoom, fallbackRoom, wingOf,
    locSlot: parts.locSlot,
    visits: packCSR(T, parts.visits || makeColumns(VISIT_SPEC)),
    contacts: parts.contactsCSR || packCSR(T, parts.contacts || makeColumns(CONTACT_SPEC)),
    tables: { start: tableStart, members: tableMembers, room: tableRoom, length: tl.length },
    mealSlot, groupSlot,
    visitors: parts.visitors || [],
    roster: parts.roster || null, stats: parts.stats || {},
  };
}
// Derived layer: traits, infectious visitors, room ACH. Same code for fresh
// builds and reuse, so results are bit-identical.
function deriveWorld(config, seed, struct, key) {
  const { T, N } = struct;
  const rooms = struct.achFromConfig
    ? struct.rooms.map((r) => ({ ...r, ach: r.type === 'outside' ? 0 : config.facility.ach[r.type] }))
    : struct.rooms;
  const traits = drawTraits(config, seed, struct.peopleRaw);
  // Visitors: infectious flag and emission from the pre-drawn uniforms.
  const imp = config.importation, em = config.emission;
  const lnGsd = Math.log(Math.max(1, em.gsd));
  const visitors = struct.visitors;
  const visitorQ = new Float64Array(visitors.length);
  let visitorEmit;
  if (struct.fixedVisitorEmit) visitorEmit = struct.fixedVisitorEmit;
  else {
    const ve = makeColumns(VISITOR_SPEC, 64);
    for (let i = 0; i < visitors.length; i++) {
      const v = visitors[i];
      visitorQ[i] = em.median * Math.exp(lnGsd * v.z) * em.visitorRel; // quanta/h at rest
      if (!(v.uInf < imp.visitorInfectiousProb)) continue;
      for (let k = 0; k < v.slots; k++) {
        const withRes = v.withRes[k] === 1;
        pushVisitorEmit(ve, v.g0 + k, i, v.rooms[k], withRes ? v.resident : -1, withRes ? SLOT_HOURS * imp.visitCloseShare : 0);
      }
    }
    visitorEmit = packCSR(T, ve);
  }
  const world = {
    config, seed, days: struct.days, T, N, nRooms: struct.nRooms, rooms, roomIndex: struct.roomIndex, outside: struct.outside,
    roomType: struct.roomType, nWings: struct.nWings,
    people: struct.peopleRaw.map((p) => ({ id: p.id, role: p.role, wing: p.wing, homeRoom: rooms[p.homeRoomIndex].id, homeRoomIndex: p.homeRoomIndex, shift: p.shift || null, ...(p.extra || {}) })),
    nResidents: struct.nResidents,
    isStaff: struct.isStaff, roleIdx: struct.roleIdx, homeRoom: struct.homeRoom, fallbackRoom: struct.fallbackRoom, wingOf: struct.wingOf,
    locSlot: struct.locSlot, visits: struct.visits, contacts: struct.contacts, tables: struct.tables,
    mealSlot: struct.mealSlot, groupSlot: struct.groupSlot,
    visitorEmit, visitors, visitorQ, traits,
    roster: struct.roster, stats: struct.stats,
    // Planned main room of person p at (day, slot). Pass a result produced with
    // opts.record to get the room after that run's isolation / exclusion /
    // outbreak-mode changes.
    locationAt(person, day, slot, result) {
      const g = day * SLOTS_PER_DAY + slot;
      const base = this.locSlot[g * N + person];
      if (!result || !result.overrides) return base;
      return effectiveRoomFromOverrides(this, result.overrides, person, g, base);
    },
  };
  Object.defineProperty(world, '_struct', { value: struct, enumerable: false });
  Object.defineProperty(world, '_structKey', { value: key, enumerable: false });
  // world.loc[person][day*48 + slot]: person-major view, built on first access.
  let locCache = null;
  Object.defineProperty(world, 'loc', {
    enumerable: false,
    get() {
      if (!locCache) {
        const Ctor = world.locSlot.constructor;
        locCache = [];
        for (let p = 0; p < N; p++) { const a = new Ctor(T); for (let g = 0; g < T; g++) a[g] = world.locSlot[g * N + p]; locCache.push(a); }
      }
      return locCache;
    },
  });
  return world;
}

// ===========================================================================
// buildWorld
// ===========================================================================
// opts.reuse: a world built earlier. If it has the same seed and the same
// structural config, its structure is shared and only the derived layer is
// recomputed (≈ 1 ms instead of a full build).
function buildWorld(config, seed, opts = {}) {
  const key = structuralKey(config);
  const prev = opts.reuse;
  if (prev && prev._struct && prev.seed === seed && prev._structKey === key) return deriveWorld(config, seed, prev._struct, key);
  const struct = buildStructure(config, seed);
  return deriveWorld(config, seed, struct, key);
}

// ===========================================================================
// 1.2 / 1.4 People, roster and schedules for the default facility layout
// ===========================================================================
function buildStructure(config, seed) {
  const fac = config.facility, sch = config.schedule, pc = config.people, sc = config.staff, imp = config.importation;
  const days = config.days;
  const T = days * SLOTS_PER_DAY, S48 = SLOTS_PER_DAY;
  const rooms = buildFacility(fac);
  const nRooms = rooms.length;
  const R = {}; rooms.forEach((r, i) => { R[r.id] = i; });
  const OUT = R.outside;
  const W = fac.wings;
  const stationOf = [], loungeOf = [];
  for (let w = 0; w < W; w++) { stationOf.push(R[`w${w}-station`]); loungeOf.push(R[`w${w}-lounge`]); }
  const diningIdx = []; for (let i = 1; i <= fac.diningRooms; i++) diningIdx.push(R[`dining-${i}`]);
  const diningOfWing = (w) => diningIdx[Math.min(fac.diningRooms - 1, Math.floor(w * fac.diningRooms / W))];
  const stats = { careEpisodesPlanned: 0, careEpisodesUnplaced: 0, breaksSkipped: 0, medpassMissed: 0, activityOverflow: 0 };

  // ---------------- residents ----------------
  const capacity = fac.singlesPerWing + 2 * fac.doublesPerWing;
  if (fac.residentsPerWing > capacity) throw new Error(`residentsPerWing (${fac.residentsPerWing}) exceeds beds per wing (${capacity})`);
  const people = [];
  const residents = [];
  const res = [];
  const mob = pc.mobility, mobSum = mob.communal + mob.limited + mob.roombound;
  const mobCut1 = mob.communal / mobSum, mobCut2 = (mob.communal + mob.limited) / mobSum;
  const limitedInLounge = pc.limitedMealRoom === 'lounge';
  for (let w = 0; w < W; w++) {
    // Bed order: every single, then the first bed of every double, then the
    // second beds. Below capacity this leaves some doubles half-empty, as in
    // real homes (rather than leaving whole double rooms empty).
    const beds = [];
    for (let i = 1; i <= fac.singlesPerWing; i++) beds.push(R[`w${w}-bed-${pad2(i)}`]);
    for (let pass = 0; pass < 2; pass++) for (let i = 1; i <= fac.doublesPerWing; i++) beds.push(R[`w${w}-bed-${pad2(fac.singlesPerWing + i)}`]);
    for (let k = 0; k < fac.residentsPerWing; k++) {
      const p = people.length;
      const rng = rngFor(seed, STREAM_RESIDENT_SETUP, p);
      const u = rng();
      const mobility = u < mobCut1 ? 'communal' : u < mobCut2 ? 'limited' : 'roombound';
      const therapy = mobility !== 'roombound' && rng() < pc.therapyShare;
      const therapySlots = rng() < pc.pTherapy60 ? 2 : 1;
      const mobCode = mobility === 'communal' ? 0 : mobility === 'limited' ? 1 : 2;
      const mealRoom = mobCode === 0 ? diningOfWing(w) : (mobCode === 1 && limitedInLounge ? loungeOf[w] : beds[k]);
      people.push({ id: p, role: 'resident', wing: w, homeRoomIndex: beds[k], shift: null, extra: { mobility } });
      residents.push(p);
      res[p] = { wing: w, bed: beds[k], mobility, mobCode, therapy, therapySlots, mealRoom, lounge: loungeOf[w], table: -1, therapyStart: -1, therapyPost: -1 };
    }
  }
  const nRes = residents.length;
  const byBed = {};
  for (const p of residents) (byBed[res[p].bed] = byBed[res[p].bed] || []).push(p);
  for (const p of residents) { const mates = byBed[res[p].bed].filter((x) => x !== p); res[p].roommate = mates.length ? mates[0] : -1; people[p].extra.roommate = res[p].roommate; }

  // Tables: residents eating in a dining room (or a lounge), per wing,
  // shuffled once and chunked into tables of tableSize.
  const tables = [];
  {
    const rng = rngFor(seed, STREAM_TABLES, 0);
    for (let w = 0; w < W; w++) {
      const groups = new Map();
      for (const p of residents) {
        const r = res[p];
        if (r.wing !== w || r.mealRoom === r.bed) continue;
        if (!groups.has(r.mealRoom)) groups.set(r.mealRoom, []);
        groups.get(r.mealRoom).push(p);
      }
      for (const [room, list0] of groups) {
        const list = shuffleInPlace(list0, rng);
        for (let i = 0; i < list.length; i += pc.tableSize) {
          const t = { room, wing: w, dining: rooms[room].type === 'dining', members: list.slice(i, i + pc.tableSize) };
          for (const m of t.members) { res[m].table = tables.length; people[m].extra.table = tables.length; }
          tables.push(t);
        }
      }
    }
  }

  // ---------------- staff pools and roster ----------------
  // A "group" is a set of identical posts (same role, shift and wing
  // coverage) with c posts and a pool of m members rotating through them so
  // that exactly c are on duty every (working) day.
  const groups = [];
  for (const role of Object.keys(sc.staffing)) {
    if (ROLE_IDX[role] == null) throw new Error(`unknown staff role ${role}`);
    for (let si = 0; si < 3; si++) {
      const n = sc.staffing[role][SHIFT_NAMES[si]] | 0;
      if (n <= 0) continue;
      const wkOnly = !!(sc.weekdaysOnly && sc.weekdaysOnly[role]);
      const coverages = [];
      if (WING_ROLES[role]) {
        if (n >= W) for (let w = 0; w < W; w++) coverages.push({ wings: [w], c: Math.floor(n / W) + (w < n % W ? 1 : 0) });
        else for (let k = 0; k < n; k++) { const ws = []; for (let w = 0; w < W; w++) if (w % n === k) ws.push(w); coverages.push({ wings: ws, c: 1 }); }
      } else coverages.push({ wings: [], c: n });
      for (const cov of coverages) {
        if (cov.c <= 0) continue;
        const m = wkOnly ? cov.c : Math.max(cov.c, Math.ceil(cov.c * 7 / sc.workDaysPerWeek));
        groups.push({ role, shift: SHIFT_NAMES[si], si, wings: cov.wings, c: cov.c, m, weekdaysOnly: wkOnly, members: [] });
      }
    }
  }
  const workplaceOf = (role, wing, postK) => {
    switch (role) {
      case 'cna': case 'nurse': case 'housekeeping': return stationOf[wing];
      case 'rn': case 'aideFloat': return stationOf[0];
      case 'therapist': return R.therapy;
      case 'dietary': return R.kitchen;
      case 'activities': return R.activity;
      case 'admin': return postK === 0 ? R.lobby : R.office;
      default: return R.office;
    }
  };
  const fallbackRoom = [];
  for (const p of residents) fallbackRoom[p] = res[p].bed;
  for (const gr of groups) {
    for (let i = 0; i < gr.m; i++) {
      const p = people.length;
      const wing = gr.wings.length ? gr.wings[0] : -1;
      const home = workplaceOf(gr.role, wing, i % gr.c);
      people.push({ id: p, role: gr.role, wing, homeRoomIndex: home, shift: gr.shift });
      fallbackRoom[p] = gr.role === 'dietary' ? R.kitchen : home; // where staff go when dining rooms close
      gr.members.push(p);
    }
  }
  const N = people.length;
  if (N > 65535) throw new Error('too many people');
  const isWeekday = (d) => ((((d + sch.startWeekday) % 7) + 7) % 7) < 5;

  // Roster for shift-days d = -1 .. days-1 (the night shift of day -1 covers
  // 00:00-07:00 of day 0). roster[d+1][si] = [{ person, role, wings, k }]
  const roster = [];
  for (let d = -1; d < days; d++) {
    const perShift = [[], [], []];
    for (const gr of groups) {
      if (gr.weekdaysOnly && !isWeekday(d)) continue;
      for (let k = 0; k < gr.c; k++) {
        const idx = ((((d * gr.c + k) % gr.m) + gr.m) % gr.m);
        perShift[gr.si].push({ person: gr.members[idx], role: gr.role, wings: gr.wings, k, groupIndex: groups.indexOf(gr) });
      }
    }
    // Floats: a CNA or nurse swaps posts with a same-role colleague on another wing.
    for (let si = 0; si < 3; si++) {
      const posts = perShift[si];
      const rng = rngFor(seed, STREAM_FLOAT, (d + 1) * 3 + si);
      for (let i = 0; i < posts.length; i++) {
        const u1 = rng(), u2 = rng();
        const a = posts[i];
        if (!(a.role === 'cna' || a.role === 'nurse') || !(u1 < sc.floatShare)) continue;
        const cands = [];
        for (let j = 0; j < posts.length; j++) if (j !== i && posts[j].role === a.role && posts[j].wings[0] !== a.wings[0]) cands.push(j);
        if (!cands.length) continue;
        const b = posts[cands[Math.floor(u2 * cands.length)]];
        const t = a.person; a.person = b.person; b.person = t;
      }
    }
    roster.push(perShift);
  }
  const rosterAt = (d) => roster[d + 1];

  // ---------------- schedules ----------------
  const cycleCfg = sch.cycleDays | 0;
  const cycle = cycleCfg > 0 && cycleCfg < days && cycleCfg % 7 === 0 ? cycleCfg : days;
  const LocArr = nRooms > 255 ? Uint16Array : Uint8Array;
  const locSlot = new LocArr(T * N);
  const visitors = [];
  const mealSlot = new Uint8Array(S48);
  for (const [a, b] of sch.meals) for (let s = a; s < b; s++) mealSlot[s] = 1;
  const mealStarts = sch.meals.map(([a]) => a);

  // Therapy timetable: same start slot every weekday, fitted into therapy
  // windows with at most nTherapists × therapyPerTherapist residents per slot.
  const therapists = groups.filter((g) => g.role === 'therapist' && g.si === 0).reduce((a, g) => a + g.c, 0);
  {
    const cap = therapists * pc.therapyPerTherapist;
    const load = new Int32Array(S48);
    const postLoad = []; for (let k = 0; k < therapists; k++) postLoad.push(new Int32Array(S48));
    const starts = [];
    for (const [a, b] of sch.therapyWindows) for (let s = a; s < b; s++) starts.push([s, b]);
    let cursor = 0;
    for (const p of residents) {
      const r = res[p];
      if (!r.therapy || cap <= 0) continue;
      for (let tries = 0; tries < starts.length; tries++) {
        const [s0, end] = starts[(cursor + tries) % starts.length];
        if (s0 + r.therapySlots > end) continue;
        let ok = true;
        for (let s = s0; s < s0 + r.therapySlots; s++) if (load[s] >= cap || mealSlot[s]) ok = false;
        if (!ok) continue;
        let post = -1;
        for (let k = 0; k < therapists && post < 0; k++) {
          let free = true;
          for (let s = s0; s < s0 + r.therapySlots; s++) if (postLoad[k][s] >= pc.therapyPerTherapist) free = false;
          if (free) post = k;
        }
        if (post < 0) continue;
        for (let s = s0; s < s0 + r.therapySlots; s++) { load[s]++; postLoad[post][s]++; }
        r.therapyStart = s0; r.therapyPost = post;
        cursor = (cursor + tries + 1) % starts.length;
        break;
      }
    }
  }
  const therapyLoad = []; for (let k = 0; k < therapists; k++) therapyLoad.push(new Int32Array(S48));
  for (const p of residents) { const r = res[p]; if (r.therapyStart >= 0) for (let s = r.therapyStart; s < r.therapyStart + r.therapySlots; s++) therapyLoad[r.therapyPost][s]++; }

  // ----- resident days (one cycle of cycleDays, then tiled) -----
  // Resident routines are drawn for one cycle (default 28 days, a multiple of
  // 7 so weekdays line up) and repeat every cycle; visitor infectiousness is
  // drawn per occurrence, so infectious visits do not repeat. cycleDays ≥ days
  // means no repetition.
  const C = cycle, Tc = C * S48;
  const kind = new Uint8Array(S48), room = new Int32Array(S48);
  const resRng = residents.map((p) => rngFor(seed, STREAM_RESIDENT_DAYS, p));
  const visRng = residents.map((p) => rngFor(seed, STREAM_VISITS, p));
  const visOccRng = residents.map((p) => rngFor(seed, STREAM_VISIT_OCC, p));
  const nAct = sch.activities.length;
  const actWin = new Int32Array(2 * nAct); sch.activities.forEach(([a, b], i) => { actWin[2 * i] = a; actWin[2 * i + 1] = b; });
  const actPrio = new Float64Array(N), actAttend = new Uint8Array(N * Math.max(1, nAct)), actRoomFor = new Int32Array(N * Math.max(1, nAct));
  const idleHours = []; for (let s = sch.morningCareEnd; s < sch.bed; s += 2) idleHours.push(s);
  const nIdle = idleHours.length;
  const idleDraw = new Float64Array(N * nIdle);
  const visitSlots = Math.max(1, Math.round(imp.visitMinutes / 30));
  const visLoungeCut = 1 - imp.visitLoungeShare - imp.visitLobbyShare, visLobbyCut = 1 - imp.visitLobbyShare;
  const tplKind = [], tplRoom = [];
  for (let i = 0; i < nRes; i++) {
    const r = res[residents[i]];
    const k = new Uint8Array(S48).fill(1), rm = new Int32Array(S48).fill(r.bed);
    if (r.mobCode !== 2) {
      for (let s = sch.morningCareEnd; s < sch.bed; s++) k[s] = 0;
      for (const [a, b] of sch.meals) for (let s = a; s < b; s++) { k[s] = 1; rm[s] = r.mealRoom; }
    }
    tplKind.push(k); tplRoom.push(rm);
  }
  const pAct = (mc, a) => (mc === 0 ? (a === 0 ? pc.pActivity : (pc.pActivityPM != null ? pc.pActivityPM : pc.pActivity)) : mc === 1 ? pc.pActivityLimited : 0);
  const pIdle = [pc.pLoungeIdle, pc.pLoungeIdleLimited != null ? pc.pLoungeIdleLimited : pc.pLoungeIdle, 0];
  const att = [];
  const dayBuf = new LocArr(S48 * N).fill(OUT);
  const bedMask = new Uint8Array(nRes * Tc);          // resident-major, cycle: 1 if in own bedroom (planned)
  const resIdx = new Int32Array(N).fill(-1); residents.forEach((p, i) => { resIdx[p] = i; });
  const visitPattern = []; // per cycle day: [{ p, start, rooms, withRes }]
  for (let cd = 0; cd < C; cd++) {
    const base = cd * S48;
    const weekday = isWeekday(cd);
    for (let i = 0; i < nRes; i++) {
      const p = residents[i], rng = resRng[i], mc = res[p].mobCode;
      actPrio[p] = rng();
      for (let a = 0; a < nAct; a++) actAttend[p * nAct + a] = rng() < pAct(mc, a) ? 1 : 0;
      // Free hours: four hours per uniform, 8 bits each (resolution 1/256).
      for (let h = 0; h < nIdle; h += 4) {
        const x = (rng() * 4294967296) >>> 0;
        for (let b = 0; b < 4 && h + b < nIdle; b++) idleDraw[p * nIdle + h + b] = (((x >>> (8 * b)) & 255) + 0.5) / 256;
      }
    }
    for (let a = 0; a < nAct; a++) {
      const s0 = actWin[2 * a], s1 = actWin[2 * a + 1];
      att.length = 0;
      for (let i = 0; i < nRes; i++) {
        const p = residents[i];
        actRoomFor[p * nAct + a] = -1;
        if (!actAttend[p * nAct + a]) continue;
        const r = res[p];
        if (weekday && r.therapyStart >= 0 && r.therapyStart < s1 && r.therapyStart + r.therapySlots > s0) continue;
        att.push(p);
      }
      att.sort((x, y) => actPrio[x] - actPrio[y]);
      for (let i = 0; i < att.length; i++) {
        const p = att[i];
        if (i < pc.activityCapacity) actRoomFor[p * nAct + a] = R.activity;
        else { actRoomFor[p * nAct + a] = res[p].lounge; stats.activityOverflow++; }
      }
    }
    const vpat = [];
    for (let i = 0; i < nRes; i++) {
      const p = residents[i], r = res[p];
      kind.set(tplKind[i]); room.set(tplRoom[i]);
      if (r.mobCode !== 2) {
        if (weekday && r.therapyStart >= 0) for (let s = r.therapyStart; s < r.therapyStart + r.therapySlots; s++) { kind[s] = 1; room[s] = R.therapy; }
        for (let a = 0; a < nAct; a++) {
          const rm = actRoomFor[p * nAct + a];
          if (rm < 0) continue;
          for (let s = actWin[2 * a]; s < actWin[2 * a + 1]; s++) if (kind[s] === 0) { kind[s] = 1; room[s] = rm; }
        }
      }
      // Visits: three uniforms per resident per cycle day, always.
      {
        const rng = visRng[i];
        const uVisit = rng(), uStart = rng(), uLoc = rng();
        if (uVisit < imp.visitsPerResidentPerDay) {
          const [v0, v1] = sch.visiting;
          const start = v0 + Math.floor(uStart * Math.max(1, v1 - v0 - visitSlots + 1));
          // Where the visit happens; bedbound residents are always visited in their room.
          const target = r.mobCode === 2 || uLoc < visLoungeCut ? r.bed : uLoc < visLobbyCut ? r.lounge : R.lobby;
          const vrooms = [], withRes = [];
          for (let s = start; s < Math.min(S48, start + visitSlots); s++) {
            // Together if the resident is free (or already there); otherwise the visitor waits in the lobby.
            const free = kind[s] === 0 || room[s] === target;
            if (free) { kind[s] = 1; room[s] = target; }
            vrooms.push(free ? target : R.lobby); withRes.push(free ? 1 : 0);
          }
          vpat.push({ p, i, start, rooms: vrooms, withRes });
        }
      }
      const pi = pIdle[r.mobCode];
      if (pi > 0) {
        for (let h = 0; h < nIdle; h++) {
          if (!(idleDraw[p * nIdle + h] < pi)) continue;
          const h0 = idleHours[h], h1 = Math.min(h0 + 2, sch.bed);
          for (let s = h0; s < h1; s++) if (kind[s] === 0) room[s] = r.lounge;
        }
      }
      const bm = i * Tc + base, bed = r.bed;
      for (let s = 0; s < S48; s++) { dayBuf[s * N + p] = room[s]; bedMask[bm + s] = room[s] === bed ? 1 : 0; }
    }
    locSlot.set(dayBuf, base * N); // residents of this day; staff columns are OUT and filled below
    visitPattern.push(vpat);
  }
  // Tile the cycle over the season (residents only; staff are written later).
  for (let d = C; d < days; d++) locSlot.copyWithin(d * S48 * N, (d % C) * S48 * N, (d % C + 1) * S48 * N);
  // Visitors for every actual day; infectiousness and emission drawn per occurrence.
  for (let d = 0; d < days; d++) {
    for (const v of visitPattern[d % C]) {
      const rng = visOccRng[v.i];
      const uInf = rng(), z = randNormal(rng);
      visitors.push({ day: d, slot: v.start, g0: d * S48 + v.start, slots: v.rooms.length, resident: v.p, rooms: v.rooms, withRes: v.withRes, uInf, z });
    }
  }
  const resLocC = (gc, p) => locSlot[(gc % Tc) * N + p]; // planned resident location at cycle slot

  // ----- staff: post-level timetable per cycle day and shift -----
  // A template holds, for each post (not person) of a shift: its main room per
  // slot and its contacts. Posts are identified by position in the roster list,
  // which is the same on every day with the same cycle day. Contact parties are
  // encoded: value ≥ 0 a person (resident), value < 0 post (−1 − index).
  const careFrac = Math.min(1, sc.careMinutes / 30), careCap = Math.max(1, Math.floor(30 / Math.max(1e-9, sc.careMinutes)));
  const careTau = sc.careMinutes / 60, assistTau = sc.mealAssistMinutes / 60;
  const medCap = Math.max(1, Math.floor(30 / Math.max(1e-9, sc.medpassMinutes)));
  void careFrac;
  const wingResidents = []; for (let w = 0; w < W; w++) wingResidents.push(residents.filter((p) => res[p].wing === w));
  const wingTables = []; for (let w = 0; w < W; w++) wingTables.push(tables.filter((t) => t.wing === w && t.dining));
  const hkCursor = new Map();
  let floatCursor = 0;
  const wingRoomList = []; for (let w = 0; w < W; w++) { const l = []; rooms.forEach((r, i) => { if (r.wing === w) l.push(i); }); wingRoomList.push(l); }
  const hkRoomCache = new Map();
  const hkRooms = (wings) => { const key = wings.join(','); if (!hkRoomCache.has(key)) { const l = []; for (const w of wings) l.push(...wingRoomList[w]); hkRoomCache.set(key, l); } return hkRoomCache.get(key); };
  const coverageResidents = new Map();
  const residentsOf = (wings) => { const key = wings.join(','); if (!coverageResidents.has(key)) { const l = []; for (const w of wings) l.push(...wingResidents[w]); coverageResidents.set(key, l); } return coverageResidents.get(key); };
  let Lmax = 1; for (const k of SHIFT_NAMES) Lmax = Math.max(Lmax, sch.shifts[k][1]);
  const busyPool = [], loadPool = [];
  const used = new Uint8Array(Lmax), inBed = new Uint8Array(Lmax), brLoad = new Int32Array(Lmax);
  const breakCands = SHIFT_NAMES.map((nm) => { const L = sch.shifts[nm][1]; const c = []; for (let rel = 2; rel <= L - 3; rel++) c.push(rel); const mid = (L - 1) / 2; c.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b); return c; });
  const who = [];
  const therapyResidents = residents.filter((p) => res[p].therapyStart >= 0);
  const roommatePairs = []; if (config.transmission.roommateHours > 0) for (const p of residents) { const m = res[p].roommate; if (m > p) roommatePairs.push([p, m]); }
  const templates = new Array(C * 3);
  const tc = { cap: 4096, rel: new Int32Array(4096), a: new Int32Array(4096), b: new Int32Array(4096), type: new Int32Array(4096), tau: new Float64Array(4096), room: new Int32Array(4096) }; // scratch
  for (let cd = 0; cd < C; cd++) {
    for (let si = 0; si < 3; si++) {
      const posts = rosterAt(cd)[si];
      const nP = posts.length;
      const [sStart, L] = sch.shifts[SHIFT_NAMES[si]];
      const g0c = cd * S48 + sStart; // cycle slot of the shift start (may run past Tc: wraps)
      let tcN = 0;
      const addC = (rel, a, b, type, tau, rm) => {
        if (tcN === tc.cap) { tc.cap *= 2; for (const k of ['rel', 'a', 'b', 'type', 'room']) { const x = new Int32Array(tc.cap); x.set(tc[k]); tc[k] = x; } const y = new Float64Array(tc.cap); y.set(tc.tau); tc.tau = y; }
        tc.rel[tcN] = rel; tc.a[tcN] = a; tc.b[tcN] = b; tc.type[tcN] = type; tc.tau[tcN] = tau; tc.room[tcN++] = rm;
      };
      const main = new Int32Array(Math.max(1, nP) * L).fill(-1);
      for (let i = 0; i < nP; i++) { if (!busyPool[i]) { busyPool[i] = new Uint8Array(Lmax); loadPool[i] = new Uint8Array(Lmax); } busyPool[i].fill(0); loadPool[i].fill(0); }
      const cnaWing = []; for (let w = 0; w < W; w++) cnaWing.push([]);
      for (let i = 0; i < nP; i++) if (posts[i].role === 'cna') for (const w of posts[i].wings) cnaWing[w].push(i);
      // 1. Fixed duties: handover, meal posts, therapy sessions, medicine rounds.
      for (let i = 0; i < nP; i++) {
        const x = posts[i], busy = busyPool[i], mo = i * L;
        const prim = x.wings.length ? x.wings[0] : -1;
        if (WING_ROLES[x.role]) { main[mo] = stationOf[prim]; busy[0] = 1; } // handover at the wing station
        if (x.role === 'cna') {
          const idxInWing = cnaWing[prim].indexOf(i);
          // Post 0 stays on the wing at meals (trays and feeding in rooms, or the lounge if limited residents eat there).
          const mealRoom = idxInWing === 0 ? (limitedInLounge ? loungeOf[prim] : -1) : diningOfWing(prim);
          if (mealRoom >= 0) for (let rel = 0; rel < L; rel++) if (mealSlot[(sStart + rel) % S48]) { main[mo + rel] = mealRoom; busy[rel] = 1; }
        }
        if (x.role === 'dietary' && x.k < fac.diningRooms) {
          for (let rel = 0; rel < L; rel++) if (mealSlot[(sStart + rel) % S48]) { main[mo + rel] = diningIdx[x.k]; busy[rel] = 1; }
        }
        if (x.role === 'therapist' && si === 0 && isWeekday(cd) && therapyLoad[x.k]) {
          for (let rel = 0; rel < L; rel++) if (therapyLoad[x.k][(sStart + rel) % S48] > 0) busy[rel] = 1;
          for (const p of therapyResidents) {
            const r = res[p];
            if (r.therapyPost !== x.k) continue;
            for (let s = r.therapyStart; s < r.therapyStart + r.therapySlots; s++) addC(s - sStart, -1 - i, p, CT.therapy, SLOT_HOURS / therapyLoad[x.k][s], R.therapy);
          }
        }
        if (x.role === 'nurse') {
          const list = residentsOf(x.wings);
          for (const ms of sch.medpass) {
            let rel = ms - sStart; if (rel < 0) rel += S48;
            if (rel >= L) continue;
            for (let n = 0; n < list.length; n++) {
              const rr = rel + Math.floor(n / medCap);
              if (rr >= L) { stats.medpassMissed++; continue; }
              busy[rr] = 1;
              const rp = list[n];
              addC(rr, -1 - i, rp, CT.medpass, sc.medpassMinutes / 60, resLocC(g0c + rr, rp));
            }
          }
        }
      }
      // Optional roommate contact, in whichever shift covers that slot of the day.
      if (roommatePairs.length) {
        const rel = ((sch.roommateSlot - sStart) % S48 + S48) % S48;
        if (rel < L) for (const [p, m] of roommatePairs) addC(rel, p, m, CT.roommate, config.transmission.roommateHours, res[p].bed);
      }
      // 2. Breaks: one slot each, least-loaded free candidate, never above capacity.
      const cands = breakCands[si];
      brLoad.fill(0);
      for (let i = 0; i < nP; i++) {
        const busy = busyPool[i];
        let best = -1;
        for (let c = 0; c < cands.length; c++) { const rel = cands[c]; if (!busy[rel] && brLoad[rel] < sc.breakroomCapacity && (best < 0 || brLoad[rel] < brLoad[best])) best = rel; }
        if (best < 0) { stats.breaksSkipped++; continue; }
        brLoad[best]++; busy[best] = 1; main[i * L + best] = R.breakroom;
      }
      for (let c = 0; c < cands.length; c++) {
        const rel = cands[c];
        if (brLoad[rel] < 2) continue;
        who.length = 0;
        for (let i = 0; i < nP; i++) if (main[i * L + rel] === R.breakroom) who.push(i);
        for (let t = 0; t < who.length; t += sc.breakTableSize) {
          const te = Math.min(who.length, t + sc.breakTableSize);
          for (let a = t; a < te; a++) for (let b = a + 1; b < te; b++) addC(rel, -1 - who[a], -1 - who[b], CT.break, SLOT_HOURS, R.breakroom);
        }
      }
      // 3. Meal assistance at dining tables (dining-post CNAs ↔ residents at their tables).
      if (sc.mealAssistMinutes > 0) {
        for (let w = 0; w < W; w++) {
          const helpers = cnaWing[w].slice(1).filter((i) => posts[i].wings[0] === w);
          if (!helpers.length) continue;
          const tl = wingTables[w];
          for (let ti = 0; ti < tl.length; ti++) {
            const hp = -1 - helpers[ti % helpers.length];
            for (const ms of mealStarts) {
              let rel = ms - sStart; if (rel < 0) rel += S48;
              if (rel >= L) continue;
              for (const m of tl[ti].members) addC(rel, hp, m, CT.table, assistTau, tl[ti].room);
            }
          }
        }
      }
      // 4. Personal care: each CNA's panel gets careEpisodesPerShift episodes
      // per resident, spread over the shift, in the resident's bedroom, when the
      // resident is there and the CNA is free; post 0 also helps bedbound
      // residents eat in their rooms.
      const E = sc.careEpisodesPerShift[SHIFT_NAMES[si]] | 0;
      for (let w = 0; w < W; w++) {
        const cp = cnaWing[w];
        if (!cp.length) continue;
        const wr = wingResidents[w];
        for (let ri = 0; ri < wr.length; ri++) {
          const rp = wr[ri], bed = res[rp].bed;
          const i = cp[ri % cp.length], ld = loadPool[i], bz = busyPool[i];
          used.fill(0, 0, L);
          let anyBed = false;
          const bm = resIdx[rp] * Tc;
          for (let rel = 0; rel < L; rel++) { inBed[rel] = bedMask[bm + (g0c + rel) % Tc]; if (inBed[rel]) anyBed = true; }
          if (res[rp].mobCode === 2 && sc.mealAssistMinutes > 0) {
            const helper = cp[0], hld = loadPool[helper];
            for (const ms of mealStarts) {
              let rel = ms - sStart; if (rel < 0) rel += S48;
              for (let r2 = rel; r2 < Math.min(L, rel + 2); r2++) {
                if (hld[r2] >= careCap || busyPool[helper][r2]) continue;
                hld[r2]++;
                if (inBed[r2]) addC(r2, -1 - helper, rp, CT.care, assistTau, bed);
                break;
              }
            }
          }
          for (let e = 0; e < E; e++) {
            stats.careEpisodesPlanned++;
            const target = Math.min(L - 1, Math.max(0, Math.floor((e + 0.5) * L / E) + ((ri % 3) - 1)));
            let placed = false;
            for (let n = 0; anyBed && n < 2 * L; n++) {
              const off = (n + 1) >> 1, rel = n & 1 ? target + off : target - off;
              if (rel < 0 || rel >= L || !inBed[rel] || bz[rel] || used[rel] || ld[rel] >= careCap) continue;
              ld[rel]++; used[rel] = 1; placed = true;
              addC(rel, -1 - i, rp, CT.care, careTau, bed);
              break;
            }
            if (!placed) stats.careEpisodesUnplaced++;
          }
        }
      }
      // 5. Main rooms for the rest of the shift; rotating roles.
      for (let i = 0; i < nP; i++) {
        const x = posts[i], busy = busyPool[i], mo = i * L;
        const prim = x.wings.length ? x.wings[0] : -1;
        const def = workplaceOf(x.role, prim, x.k);
        for (let rel = 0; rel < L; rel++) {
          if (main[mo + rel] >= 0) continue;
          if (x.role === 'housekeeping') {
            const key = x.groupIndex * 1000 + x.k;
            const list = hkRooms(x.wings);
            const c = hkCursor.get(key) || 0; hkCursor.set(key, c + 1);
            main[mo + rel] = list[c % list.length];
          } else if (x.role === 'rn') {
            main[mo + rel] = stationOf[(Math.floor(rel / 2) + x.k) % W]; // supervisor rounds: a different wing each hour
          } else if (x.role === 'aideFloat' && !busy[rel]) {
            // Restorative / bath aide: care rounds through all residents of the home.
            let firstWing = -1, k = 0;
            for (let tries = 0; tries < 2 * careCap && k < careCap; tries++) {
              const rp = residents[floatCursor++ % nRes];
              if (!bedMask[resIdx[rp] * Tc + (g0c + rel) % Tc]) continue;
              addC(rel, -1 - i, rp, CT.care, careTau, res[rp].bed);
              if (firstWing < 0) firstWing = res[rp].wing;
              k++;
            }
            main[mo + rel] = stationOf[firstWing >= 0 ? firstWing : 0];
          } else main[mo + rel] = def;
        }
      }
      // Order contacts by slot within the shift (stable counting sort).
      const n = tcN;
      const T2 = { nP, L, sStart, main, n, rel: new Int32Array(n), a: new Int32Array(n), b: new Int32Array(n), type: new Uint8Array(n), tau: new Float64Array(n), room: new Int32Array(n) };
      const cnt = new Int32Array(L + 1);
      for (let k = 0; k < n; k++) cnt[tc.rel[k] + 1]++;
      for (let r = 0; r < L; r++) cnt[r + 1] += cnt[r];
      for (let o = 0; o < n; o++) { const k = cnt[tc.rel[o]]++; T2.rel[k] = tc.rel[o]; T2.a[k] = tc.a[o]; T2.b[k] = tc.b[o]; T2.type[k] = tc.type[o]; T2.tau[k] = tc.tau[o]; T2.room[k] = tc.room[o]; }
      templates[cd * 3 + si] = T2;
    }
  }
  // ----- staff: actual days (roster persons on the cycle timetable) -----
  // Two passes: count contacts, then write them straight into exact-size
  // arrays. Shift-days are visited in time order and each template is sorted
  // by slot, so the contacts come out sorted by slot (checked).
  const shiftDays = [];
  let nC = 0;
  for (let d = -1; d < days; d++) {
    const cd = ((d % C) + C) % C;
    for (let si = 0; si < 3; si++) {
      const posts = rosterAt(d)[si];
      const tp = templates[cd * 3 + si];
      if (!posts.length || !tp || tp.nP !== posts.length) continue;
      const L = tp.L, g0 = d * S48 + tp.sStart;
      if (g0 + L <= 0 || g0 >= T) continue;
      const relLo = Math.max(0, -g0), relHi = Math.min(L, T - g0);
      for (let i = 0; i < posts.length; i++) {
        const person = posts[i].person, mo = i * L;
        for (let rel = relLo; rel < relHi; rel++) locSlot[(g0 + rel) * N + person] = tp.main[mo + rel];
      }
      let k0 = 0; while (k0 < tp.n && tp.rel[k0] < relLo) k0++;
      let k1 = k0; while (k1 < tp.n && tp.rel[k1] < relHi) k1++;
      shiftDays.push(posts, tp, g0, k0, k1);
      nC += k1 - k0;
    }
  }
  const cstart = new Int32Array(T + 1), ca = new Uint16Array(nC), cb = new Uint16Array(nC), ct = new Uint8Array(nC), ctau = new Float32Array(nC), croom = new Uint16Array(nC);
  let kk = 0, lastG = -1, sorted = true;
  for (let q = 0; q < shiftDays.length; q += 5) {
    const posts = shiftDays[q], tp = shiftDays[q + 1], g0 = shiftDays[q + 2], k0 = shiftDays[q + 3], k1 = shiftDays[q + 4];
    for (let k = k0; k < k1; k++, kk++) {
      const a = tp.a[k], b = tp.b[k], g = g0 + tp.rel[k];
      if (g < lastG) sorted = false;
      lastG = g;
      cstart[g + 1]++; ca[kk] = a < 0 ? posts[-1 - a].person : a; cb[kk] = b < 0 ? posts[-1 - b].person : b;
      ct[kk] = tp.type[k]; ctau[kk] = tp.tau[k]; croom[kk] = tp.room[k];
    }
  }
  if (!sorted) throw new Error('shift timetable overlaps: contacts not in slot order (check schedule.shifts)');
  for (let g = 0; g < T; g++) cstart[g + 1] += cstart[g];
  const contactsCSR = { start: cstart, length: nC, a: ca, b: cb, type: ct, tau: ctau, room: croom };

  const struct = finishStructure(config, {
    rooms, people, days, locSlot, contactsCSR, tables, visitors, fallbackRoom, stats,
    roster: makeRosterView(groups.map((g) => ({ role: g.role, shift: g.shift, wings: g.wings, c: g.c, m: g.m, weekdaysOnly: g.weekdaysOnly, members: g.members })),
      roster.map((perShift) => perShift.map((posts) => posts.map((x) => ({ person: x.person, role: x.role, wings: x.wings, k: x.k }))))),
  });
  struct.achFromConfig = true;
  return struct;
}

// Roster view kept on the world. Defined at module level so the world does not
// keep buildStructure's whole scope (templates, scratch buffers) alive.
function makeRosterView(groups, plain) {
  return { groups, onDuty: (d, shift) => plain[d + 1][SHIFT_NAMES.indexOf(shift)].map((x) => ({ ...x })) };
}

// ===========================================================================
// 3.1 Room air: exact solution of the well-mixed box over one slot
// ===========================================================================
// dC/dt = S/V − λC  (C quanta/m³, S quanta/h, V m³, λ 1/h), constant over Δ h.
// Steady state Css = S/(Vλ). Starting from C0:
//   C(t)  = Css + (C0 − Css)·e^{−λt}
//   Cend  = C(Δ)
//   Cbar  = (1/Δ)∫₀^Δ C dt = Css + (C0 − Css)·(1 − e^{−λΔ})/(λΔ)
function roomAirStep(C0, S, V, lambda, dt) {
  const Css = S / (V * lambda);
  const e = Math.exp(-lambda * dt);
  const avgF = (1 - e) / (lambda * dt);
  return { Css, cbar: Css + (C0 - Css) * avgF, cend: Css + (C0 - Css) * e };
}

// Equivalent air changes per hour added by n lamps in a room (1/h):
//   min(n · ecadr / V, cap) × realWorldFactor
// ecadr is the physics CADR per lamp at perfect mixing; cap is the most a room
// can get while staying inside exposure limits (3.6·k·E_max), lower for
// bedrooms (occupied around the clock); realWorldFactor is the mixing /
// shadowing efficiency, applied after the cap because the cap is a limit on
// the UV fluence in the room, not on its effect.
function lampAchFor(config, room, n) {
  if (!(n > 0) || !(room.volume > 0)) return 0;
  const L = config.lamp;
  const cap = room.type === 'bedroom' && L.maxEachBedroom != null ? L.maxEachBedroom : L.maxEach;
  return Math.min(n * L.ecadr / room.volume, cap) * L.realWorldFactor;
}

// Removal rate λ (1/h) of every room for an intervention, and the lamp eACH.
function roomLambdas(world, intervention = {}) {
  const cfg = world.config;
  const lamps = intervention.lamps || {}, cleaners = intervention.cleaners || {};
  for (const id of Object.keys(lamps)) if (world.roomIndex[id] == null) throw new Error(`unknown room id in lamps: ${id}`);
  for (const id of Object.keys(cleaners)) if (world.roomIndex[id] == null) throw new Error(`unknown room id in cleaners: ${id}`);
  const n = world.nRooms;
  const lambda = new Float64Array(n), lampAch = new Float64Array(n), hasLamp = new Uint8Array(n);
  for (let r = 0; r < n; r++) {
    const room = world.rooms[r];
    if (room.type === 'outside' || !(room.volume > 0)) continue;
    const nl = lamps[room.id] || 0;
    if (nl > 0) { lampAch[r] = lampAchFor(cfg, room, nl); hasLamp[r] = 1; }
    const cleanAch = (cleaners[room.id] || 0) / room.volume;
    lambda[r] = room.ach * cfg.ventilation.scale + cfg.air.decay + cfg.air.deposition + lampAch[r] + cleanAch;
  }
  return { lambda, lampAch, hasLamp };
}

// Effective room after behavioural overrides, for playback (slow path).
function effectiveRoomFromOverrides(world, ov, p, g, base) {
  for (const w of ov.excluded) if (w.person === p && g >= w.from && g < w.to) return world.outside;
  if (!world.isStaff[p]) for (const w of ov.isolated) if (w.person === p && g >= w.from && g < w.to) return world.homeRoom[p];
  const sd = g % SLOTS_PER_DAY;
  let nActive = 0, mine = false;
  for (const w of ov.outbreak) if (g >= w.from && g < w.to) { nActive++; if (w.wing === world.wingOf[p]) mine = true; }
  const facilityWide = nActive >= ov.facilityWideWings;
  const t = world.roomType[base];
  if (!world.isStaff[p]) {
    if ((mine || facilityWide) && ov.groupSlot[sd] && (t === RT.dining || t === RT.activity || t === RT.lounge)) return world.homeRoom[p];
  } else if (t === RT.dining && (facilityWide || (mine && world.wingOf[p] >= 0))) return world.fallbackRoom[p];
  return base;
}

// ===========================================================================
// 5. runSeason
// ===========================================================================
// opts: { record: bool, introductions: [{ person, day = 0, slot = 0, stage: 'E' | 'I' }] }
function runSeason(world, intervention = {}, opts = {}) {
  const cfg = world.config;
  const { N, T, nRooms, days, rooms, roomType, isStaff, homeRoom, fallbackRoom, wingOf, locSlot, traits } = world;
  const DT = SLOT_HOURS;
  const S48 = SLOTS_PER_DAY;
  const tx = cfg.transmission, dis = cfg.disease, ctl = cfg.control, obc = ctl.outbreakMode;
  const W = world.nWings;

  // ---- room removal rates (1/h) and one-slot decay factors ----
  const { lambda, hasLamp } = roomLambdas(world, intervention);
  const volume = new Float64Array(nRooms), eDec = new Float64Array(nRooms), avgF = new Float64Array(nRooms), airRoom = new Uint8Array(nRooms);
  const nearF = new Float64Array(nRooms);
  for (let r = 0; r < nRooms; r++) {
    volume[r] = rooms[r].volume;
    airRoom[r] = rooms[r].type !== 'outside' && volume[r] > 0 && lambda[r] > 0 ? 1 : 0;
    if (!airRoom[r]) continue;
    eDec[r] = Math.exp(-lambda[r] * DT);                 // fraction of C left after one slot
    avgF[r] = (1 - eDec[r]) / (lambda[r] * DT);           // slot-average weight of (C0 − Css)
    nearF[r] = hasLamp[r] ? 1 - tx.nearFieldUV : 1;      // near-field excess left after lamp
  }

  // ---- context tables: emission multiplier and breathing rate by (staff?, room type) ----
  const nT = ROOM_TYPES.length;
  const ctxOf = (staff, t) => (staff ? (t === RT.breakroom ? CTX_SOCIAL : CTX_WORK) : (t === RT.bedroom ? CTX_REST : CTX_SOCIAL));
  const actMul = [cfg.emission.activity.rest, cfg.emission.activity.social, cfg.emission.activity.work];
  const brRate = [cfg.breathing.rest, cfg.breathing.social, cfg.breathing.work]; // m³/h
  const emitRT = new Float64Array(2 * nT), breatheRT = new Float64Array(2 * nT);
  for (let st = 0; st < 2; st++) for (let t = 0; t < nT; t++) { const c = ctxOf(st, t); emitRT[st * nT + t] = actMul[c]; breatheRT[st * nT + t] = brRate[c]; }
  // Masks: staff while working (not in the break room); residents and visitors none.
  const maskOf = (name) => ctl.masks[name] || ctl.masks.none || { in: 0, out: 0 };
  const baseMask = maskOf(ctl.staffMask || 'none');
  const obMaskCfg = maskOf(obc.outbreakMask || 'none');
  const obMask = { in: Math.max(baseMask.in, obMaskCfg.in), out: Math.max(baseMask.out, obMaskCfg.out) };
  let mIn = baseMask.in, mOut = baseMask.out; // current staff mask (stronger while any wing is in outbreak mode)
  const maskInOf = (p, t) => (isStaff[p] && t !== RT.breakroom ? mIn : 0);
  const maskOutOf = (p, t) => (isStaff[p] && t !== RT.breakroom ? mOut : 0);

  // ---- state ----
  const state = new Uint8Array(N);
  const tE = new Int32Array(N).fill(NEVER), tInf = new Int32Array(N).fill(NEVER), tSym = new Int32Array(N).fill(NEVER), tEnd = new Int32Array(N).fill(NEVER);
  const isoFrom = new Int32Array(N).fill(NEVER), isoTo = new Int32Array(N).fill(NEVER);
  const exFrom = new Int32Array(N).fill(NEVER), exTo = new Int32Array(N).fill(NEVER);
  const dose = new Float64Array(N);            // cumulative effective dose A_i (quanta)
  const emitBase = new Float64Array(N);        // q_j × profile, quanta/h at rest; 0 if not infectious now
  const active = [];                           // people in E or I states
  const C = new Float64Array(nRooms);          // concentration carried between slots (quanta/m³)
  const Sr = new Float64Array(nRooms), cbar = new Float64Array(nRooms), topSrc = new Int32Array(nRooms).fill(-1), topSrcVal = new Float64Array(nRooms), lastSrc = new Int32Array(nRooms).fill(-1);
  const visFrac = new Float64Array(N);         // Σ sub-slot visit fractions this slot
  let maxPres = 16; for (let g = 0; g < T; g++) maxPres = Math.max(maxPres, world.visits.start[g + 1] - world.visits.start[g] + world.contacts.start[g + 1] - world.contacts.start[g]);
  const presP = new Int32Array(maxPres), presR = new Int32Array(maxPres), presF = new Float64Array(maxPres);
  const stamp = new Int32Array(N).fill(-1), dRoom = new Float64Array(N), dClose = new Float64Array(N);
  const bestRoomR = new Int32Array(N), bestRoomD = new Float64Array(N), bestCloseSrc = new Int32Array(N), bestCloseD = new Float64Array(N), bestCloseR = new Int32Array(N);
  const touched = [];
  const special = new Uint8Array(N);
  const daily = { newResident: new Int16Array(days), newStaff: new Int16Array(days), infectiousResident: new Int16Array(days), infectiousStaff: new Int16Array(days), importations: new Int16Array(days) };
  const roomInf = new Int32Array(nRooms), roomInfRoom = new Int32Array(nRooms), roomInfClose = new Int32Array(nRooms);
  const roomDoseRoom = new Float64Array(nRooms), roomDoseClose = new Float64Array(nRooms), roomInfHours = new Float64Array(nRooms);
  const events = [];
  const totals = { residentInfected: 0, staffInfected: 0, residentSymptomatic: 0, staffSymptomatic: 0, importations: 0, byRoute: { room: 0, close: 0, community: 0 }, outbreaks: 0, largestCluster: 0 };
  // Symptomatic onsets per wing per day (detection for outbreak mode).
  const onsetsWD = new Int32Array(W * (days + 1));
  const residentOnsetDay = new Int32Array(days + 1);
  const record = !!opts.record;
  const conc = record ? new Float32Array(T * nRooms) : null;
  const facilityWideWings = obc.facilityWideWings != null ? obc.facilityWideWings : 2;
  const ov = record ? { excluded: [], isolated: [], outbreak: [], groupSlot: world.groupSlot, facilityWideWings } : null;
  let nAir = 0;
  const C_FLOOR = 1e-12;                        // quanta/m³ below which C is set to 0 (skip test)
  // Outbreak mode per wing: active while obFrom[w] ≤ g < obUntil[w]; facility-wide
  // when facilityWideWings or more wings are active.
  const obFrom = new Int32Array(W).fill(NEVER), obUntil = new Int32Array(W).fill(-1), obEntry = new Int32Array(W).fill(-1);
  const obWing = new Uint8Array(W);             // wing in outbreak mode today (incl. facility-wide)
  let obAny = false, obAll = false;
  const groupSlot = world.groupSlot, mealSlot = world.mealSlot;
  const tbl = world.tables;
  const G = tx.G;
  const betaArr = CONTACT_TYPES.map((c) => tx.beta[c]);

  function infect(p, gInf, route, roomIdx, source, dayIdx, slotIdx) {
    state[p] = ST_E;
    tE[p] = gInf;
    tInf[p] = gInf + traits.latent[p];
    tSym[p] = tInf[p] + traits.presym[p];
    tEnd[p] = tSym[p] + traits.infDur[p];
    active.push(p);
    const staff = isStaff[p] === 1;
    if (staff) { totals.staffInfected++; daily.newStaff[dayIdx]++; } else { totals.residentInfected++; daily.newResident[dayIdx]++; }
    if (traits.symptomatic[p]) {
      if (staff) totals.staffSymptomatic++; else totals.residentSymptomatic++;
      const od = Math.floor(tSym[p] / S48);
      if (od >= 0 && od < days) {
        if (!staff) residentOnsetDay[od]++;
        if (wingOf[p] >= 0 && (!staff || obc.countStaff)) onsetsWD[wingOf[p] * (days + 1) + od]++;
      }
      if (!staff && ctl.residentIsolation.enabled) {
        isoFrom[p] = tSym[p] + Math.round(ctl.residentIsolation.isolationDelayDays * S48);
        isoTo[p] = isoFrom[p] + Math.round(ctl.residentIsolation.isolationDays * S48);
        if (ov) ov.isolated.push({ person: p, from: isoFrom[p], to: isoTo[p] });
      }
      if (staff && ctl.staffExclusion.enabled && traits.staysHome[p]) {
        exFrom[p] = tSym[p] + traits.homeDelaySlots[p];
        exTo[p] = exFrom[p] + Math.round(ctl.staffExclusion.exclusionDays * S48);
        if (ov) ov.excluded.push({ person: p, from: exFrom[p], to: exTo[p] });
      }
      // A window that starts later today must take effect today.
      if (isoFrom[p] < (dayIdx + 1) * S48 || exFrom[p] < (dayIdx + 1) * S48) special[p] = 1;
    }
    totals.byRoute[ROUTES[route]]++;
    const importation = route === 2 || (source >= N);
    if (importation) { totals.importations++; daily.importations[dayIdx]++; }
    roomInf[roomIdx]++;
    if (route === 0) roomInfRoom[roomIdx]++; else if (route === 1) roomInfClose[roomIdx]++;
    events.push({ day: dayIdx, slot: slotIdx, person: p, role: world.people[p].role, wing: world.people[p].wing, route: ROUTES[route], roomId: rooms[roomIdx].id, source });
  }
  function addRoomDose(i, r, dd, g) {
    if (!(dd > 0)) return;
    if (stamp[i] !== g) { stamp[i] = g; dRoom[i] = 0; dClose[i] = 0; bestRoomD[i] = 0; bestCloseD[i] = 0; bestRoomR[i] = r; bestCloseR[i] = r; bestCloseSrc[i] = -1; touched.push(i); }
    dose[i] += dd; dRoom[i] += dd; roomDoseRoom[r] += dd;
    if (dd > bestRoomD[i]) { bestRoomD[i] = dd; bestRoomR[i] = r; }
  }
  function addCloseDose(i, src, r, dd, g) {
    if (!(dd > 0)) return;
    if (stamp[i] !== g) { stamp[i] = g; dRoom[i] = 0; dClose[i] = 0; bestRoomD[i] = 0; bestCloseD[i] = 0; bestRoomR[i] = r; bestCloseR[i] = r; bestCloseSrc[i] = -1; touched.push(i); }
    dose[i] += dd; dClose[i] += dd; roomDoseClose[r] += dd;
    if (dd > bestCloseD[i]) { bestCloseD[i] = dd; bestCloseR[i] = r; bestCloseSrc[i] = src; }
  }

  const intro = (opts.introductions || []).map((x) => ({ person: x.person, g: (x.day || 0) * S48 + (x.slot || 0), stage: x.stage || 'E' })).sort((a, b) => a.g - b.g);
  let introIdx = 0;
  const comm = [];
  for (let p = 0; p < N; p++) if (traits.communityDay[p] < days) comm.push(p);
  comm.sort((a, b) => traits.communityDay[a] - traits.communityDay[b] || a - b);
  let commIdx = 0;

  const vE = world.visitorEmit, vis = world.visits, con = world.contacts;
  const outside = world.outside;

  // Effective main room of person p at slot g (behavioural overrides applied).
  const effRoom = (p, g, base, sd) => {
    if (g >= exFrom[p] && g < exTo[p]) return outside;
    if (!isStaff[p]) {
      if (g >= isoFrom[p] && g < isoTo[p]) return homeRoom[p];
      if (obAny && groupSlot[sd] && obWing[wingOf[p]]) { const t = roomType[base]; if (t === RT.dining || t === RT.activity || t === RT.lounge) return homeRoom[p]; }
    } else if (obAny && roomType[base] === RT.dining && (obAll || (wingOf[p] >= 0 && obWing[wingOf[p]]))) return fallbackRoom[p];
    return base;
  };

  for (let d = 0; d < days; d++) {
    // Outbreak mode for today.
    if (obc.enabled) {
      const g0 = d * S48;
      let nAct = 0;
      for (let w = 0; w < W; w++) { obWing[w] = g0 >= obFrom[w] && g0 < obUntil[w] ? 1 : 0; nAct += obWing[w]; }
      obAll = nAct >= facilityWideWings;
      if (obAll) obWing.fill(1);
      obAny = nAct > 0;
    }
    if (obAny) { mIn = obMask.in; mOut = obMask.out; } else { mIn = baseMask.in; mOut = baseMask.out; }
    // People whose room may differ from the plan today (excluded, isolated, or
    // on a wing in outbreak mode); everyone else skips the override checks.
    {
      const d0 = d * S48, d1 = d0 + S48;
      for (let p = 0; p < N; p++) {
        special[p] = (exFrom[p] < d1 && exTo[p] > d0) || (!isStaff[p] && isoFrom[p] < d1 && isoTo[p] > d0) ||
          (obAny && (isStaff[p] ? (obAll || (wingOf[p] >= 0 && obWing[wingOf[p]] === 1)) : obWing[wingOf[p]] === 1)) ? 1 : 0;
      }
    }
    while (commIdx < comm.length && traits.communityDay[comm[commIdx]] === d) {
      const p = comm[commIdx++];
      if (state[p] === ST_S) infect(p, d * S48, 2, outside, -1, d, 0);
    }
    for (let s = 0; s < S48; s++) {
      const g = d * S48 + s;
      while (introIdx < intro.length && intro[introIdx].g <= g) {
        const x = intro[introIdx++];
        if (state[x.person] !== ST_S) continue;
        infect(x.person, x.stage === 'I' ? g - traits.latent[x.person] : g, 2, outside, -1, d, s);
      }

      // ---- disease progression and current emission (quanta/h at rest) ----
      let nEmit = 0;
      for (let k = active.length - 1; k >= 0; k--) {
        const p = active[k];
        if (g >= tEnd[p]) { state[p] = ST_R; emitBase[p] = 0; active[k] = active[active.length - 1]; active.pop(); continue; }
        if (g < tInf[p]) { emitBase[p] = 0; continue; }
        let prof;
        if (g < tSym[p]) { state[p] = ST_IPRE; prof = 1; }
        else {
          state[p] = traits.symptomatic[p] ? ST_ISYM : ST_IASYM;
          // 1.0 for peakDays after onset, then linear to tailLevel at tEnd.
          const since = (g - tSym[p]) / S48, len = (tEnd[p] - tSym[p]) / S48;
          if (since < dis.peakDays || len <= dis.peakDays) prof = 1;
          else prof = 1 - (1 - dis.tailLevel) * (since - dis.peakDays) / (len - dis.peakDays);
        }
        if (!traits.symptomatic[p]) prof *= dis.asymRelInf;
        emitBase[p] = traits.q[p] * prof;
        nEmit++;
      }
      const v0 = vE.start[g], v1 = vE.start[g + 1];
      if (nEmit === 0 && nAir === 0 && v0 === v1) continue; // nothing infectious, no virus in the air
      const sd = s;
      const base = g * N;
      // Sub-slot presence this slot: explicit visits plus staff in a room for a
      // care or medicine-round contact (fraction τ / Δ of the slot).
      let nPres = 0;
      for (let k = vis.start[g]; k < vis.start[g + 1]; k++) { presP[nPres] = vis.person[k]; presR[nPres] = vis.room[k]; presF[nPres++] = vis.frac[k]; }
      for (let k = con.start[g]; k < con.start[g + 1]; k++) if (PRESENCE_TYPE[con.type[k]]) { presP[nPres] = con.a[k]; presR[nPres] = con.room[k]; presF[nPres++] = Math.min(1, con.tau[k] / DT); }
      for (let k = 0; k < nPres; k++) visFrac[presP[k]] += presF[k];

      // ---- 3.1 sources: S_r = Σ_j f_jr · E_j · (1 − maskOut_j)   [quanta/h] ----
      if (nEmit > 0) {
        for (let k = 0; k < active.length; k++) {
          const j = active[k];
          if (emitBase[j] === 0) continue;
          const r = special[j] ? effRoom(j, g, locSlot[base + j], sd) : locSlot[base + j];
          if (r === outside) continue;
          const f = 1 - visFrac[j];
          if (f > 0) {
            const t = roomType[r];
            const e = f * emitBase[j] * emitRT[isStaff[j] * nT + t] * (1 - maskOutOf(j, t));
            Sr[r] += e; roomInfHours[r] += f * DT;
            if (e > topSrcVal[r]) { topSrcVal[r] = e; topSrc[r] = j; }
          }
        }
        for (let k = 0; k < nPres; k++) {
          const j = presP[k];
          if (emitBase[j] === 0 || (g >= exFrom[j] && g < exTo[j])) continue;
          const r = presR[k], t = roomType[r];
          const e = presF[k] * emitBase[j] * emitRT[isStaff[j] * nT + t] * (1 - maskOutOf(j, t));
          Sr[r] += e; roomInfHours[r] += presF[k] * DT;
          if (e > topSrcVal[r]) { topSrcVal[r] = e; topSrc[r] = j; }
        }
      }
      for (let k = v0; k < v1; k++) {
        // Infectious visitor (q already includes visitorRel); visitors talk.
        const r = vE.room[k];
        const e = world.visitorQ[vE.visitor[k]] * actMul[CTX_SOCIAL];
        Sr[r] += e; roomInfHours[r] += DT;
        if (e > topSrcVal[r]) { topSrcVal[r] = e; topSrc[r] = N + vE.visitor[k]; }
      }

      // ---- 3.1 room update: Cbar (slot average) and Cend ----
      let anyAir = false;
      nAir = 0;
      for (let r = 0; r < nRooms; r++) {
        const c0 = C[r], sr = Sr[r];
        if (c0 === 0 && sr === 0) { cbar[r] = 0; continue; }
        if (!airRoom[r]) { C[r] = 0; Sr[r] = 0; cbar[r] = 0; continue; }
        const Css = sr / (volume[r] * lambda[r]);          // quanta/m³
        cbar[r] = Css + (c0 - Css) * avgF[r];               // slot-average concentration
        let ce = Css + (c0 - Css) * eDec[r];                // end-of-slot concentration
        if (ce < C_FLOOR) ce = 0;
        C[r] = ce;
        if (ce > 0) nAir++;
        if (sr > 0) lastSrc[r] = topSrc[r];
        anyAir = true;
        Sr[r] = 0; topSrcVal[r] = 0; topSrc[r] = -1;
      }
      if (record) for (let r = 0; r < nRooms; r++) conc[g * nRooms + r] = cbar[r];

      // ---- 3.1 room-air dose: dose_i += f_ir · p_i · s_i · (1 − maskIn_i) · Cbar_r · Δ ----
      if (anyAir) {
        for (let i = 0; i < N; i++) {
          if (state[i] !== ST_S) continue;
          const r = special[i] ? effRoom(i, g, locSlot[base + i], sd) : locSlot[base + i];
          const cb = cbar[r];
          if (cb === 0) continue;
          const f = 1 - visFrac[i];
          if (f <= 0) continue;
          const t = roomType[r];
          addRoomDose(i, r, f * breatheRT[isStaff[i] * nT + t] * traits.s[i] * (1 - maskInOf(i, t)) * cb * DT, g);
        }
        for (let k = 0; k < nPres; k++) {
          const i = presP[k];
          if (state[i] !== ST_S || (g >= exFrom[i] && g < exTo[i])) continue;
          const r = presR[k], cb = cbar[r];
          if (cb === 0) continue;
          const t = roomType[r];
          addRoomDose(i, r, presF[k] * breatheRT[isStaff[i] * nT + t] * traits.s[i] * (1 - maskInOf(i, t)) * cb * DT, g);
        }
      }

      // ---- 3.2 close range: dose_i += p_i·s_i·(1−maskIn_i)·(1−maskOut_j)·E_j·τ·G/β_c·(1−nearFieldUV) ----
      // (E_j quanta/h, τ h, β m³/h, p m³/h → quanta)
      if (G > 0) {
        if (nEmit > 0) {
          const c0 = con.start[g], c1 = con.start[g + 1];
          for (let k = c0; k < c1; k++) {
            const a = con.a[k], b = con.b[k];
            const ea = emitBase[a], eb = emitBase[b];
            if (ea === 0 && eb === 0) continue;
            const sa = state[a] === ST_S, sb = state[b] === ST_S;
            if (!((ea > 0 && sb) || (eb > 0 && sa))) continue;
            if (g >= exFrom[a] && g < exTo[a]) continue;
            if (g >= exFrom[b] && g < exTo[b]) continue;
            const type = con.type[k];
            if (type === CT.table || type === CT.therapy || type === CT.break) {
              if (!isStaff[a] && g >= isoFrom[a] && g < isoTo[a]) continue;
              if (!isStaff[b] && g >= isoFrom[b] && g < isoTo[b]) continue;
              if (type === CT.table && obAny && ((!isStaff[a] && obWing[wingOf[a]]) || (!isStaff[b] && obWing[wingOf[b]]))) continue; // group meals stopped
            }
            const r = con.room[k], t = roomType[r];
            const w = con.tau[k] * G / betaArr[type] * nearF[r];
            if (ea > 0 && sb) {
              const e = ea * emitRT[isStaff[a] * nT + t] * (1 - maskOutOf(a, t));
              addCloseDose(b, a, r, breatheRT[isStaff[b] * nT + t] * traits.s[b] * (1 - maskInOf(b, t)) * e * w, g);
            }
            if (eb > 0 && sa) {
              const e = eb * emitRT[isStaff[b] * nT + t] * (1 - maskOutOf(b, t));
              addCloseDose(a, b, r, breatheRT[isStaff[a] * nT + t] * traits.s[a] * (1 - maskInOf(a, t)) * e * w, g);
            }
          }
          // Tablemates at meals: everyone at the same table who is actually there.
          if (mealSlot[sd] && tbl.length) {
            const wT = SLOT_HOURS * G / betaArr[CT.table];
            for (let ti = 0; ti < tbl.length; ti++) {
              const m0 = tbl.start[ti], m1 = tbl.start[ti + 1], r = tbl.room[ti];
              for (let x = m0; x < m1; x++) {
                const j = tbl.members[x];
                if (emitBase[j] === 0 || (special[j] ? effRoom(j, g, locSlot[base + j], sd) : locSlot[base + j]) !== r) continue;
                const t = roomType[r];
                const e = emitBase[j] * emitRT[t] * wT * nearF[r]; // residents: emitRT row 0
                for (let y = m0; y < m1; y++) {
                  const i = tbl.members[y];
                  if (i === j || state[i] !== ST_S || (special[i] ? effRoom(i, g, locSlot[base + i], sd) : locSlot[base + i]) !== r) continue;
                  addCloseDose(i, j, r, breatheRT[t] * traits.s[i] * e, g);
                }
              }
            }
          }
        }
        for (let k = v0; k < v1; k++) {
          const i = vE.resident[k];
          if (i < 0 || state[i] !== ST_S || !(vE.tau[k] > 0)) continue;
          const r = vE.room[k], t = roomType[r];
          const e = world.visitorQ[vE.visitor[k]] * actMul[CTX_SOCIAL];
          addCloseDose(i, N + vE.visitor[k], r, breatheRT[t] * traits.s[i] * e * vE.tau[k] * G / betaArr[CT.visit] * nearF[r], g);
        }
      }

      // ---- 3.3 infection: A_i ≥ threshold_i → E at the end of the slot ----
      for (let k = 0; k < touched.length; k++) {
        const i = touched[k];
        if (state[i] !== ST_S || dose[i] < traits.threshold[i]) continue;
        const tot = dRoom[i] + dClose[i];
        const route = traits.routeU[i] < dRoom[i] / tot ? 0 : 1;
        let r, src;
        if (route === 0) { r = bestRoomR[i]; src = lastSrc[r]; }
        else { r = bestCloseR[i]; src = bestCloseSrc[i]; }
        infect(i, g + 1, route, r, src, d, s);
      }
      touched.length = 0;
      for (let k = 0; k < nPres; k++) visFrac[presP[k]] = 0;
    }

    // ---- end of day: daily prevalence, outbreak detection ----
    let ir = 0, is = 0;
    const gEnd = d * S48 + S48 - 1;
    for (let k = 0; k < active.length; k++) {
      const p = active[k];
      if (gEnd >= tInf[p] && gEnd < tEnd[p]) { if (isStaff[p]) is++; else ir++; }
    }
    daily.infectiousResident[d] = ir; daily.infectiousStaff[d] = is;
    if (obc.enabled) {
      // A wing is detected when ≥ trigger symptomatic onsets occurred there in
      // the last windowDays days. Measures start responseDelayDays later and
      // last until outbreakDays after the latest qualifying case.
      const win = Math.max(1, Math.round(obc.windowDays || 7));
      for (let w = 0; w < W; w++) {
        if (onsetsWD[w * (days + 1) + d] === 0) continue;
        let sum = 0;
        for (let k = Math.max(0, d - win + 1); k <= d; k++) sum += onsetsWD[w * (days + 1) + k];
        if (sum < obc.trigger) continue;
        const start = (d + 1 + Math.round(obc.responseDelayDays || 0)) * S48;
        const until = start + Math.round(obc.outbreakDays * S48);
        if (obUntil[w] < start) {
          // No episode active or pending that reaches the new start: a new activation.
          obFrom[w] = start; obUntil[w] = until; totals.outbreaks++;
          if (ov) { obEntry[w] = ov.outbreak.length; ov.outbreak.push({ wing: w, from: start, to: until }); }
        } else if (until > obUntil[w]) {
          // Extend the current episode: it ends outbreakDays after the latest case.
          obUntil[w] = until;
          if (ov && obEntry[w] >= 0) ov.outbreak[obEntry[w]].to = until;
        }
      }
    }
  }

  let win = 0;
  for (let d = 0; d < days; d++) {
    win += daily.newResident[d];
    if (d >= 14) win -= daily.newResident[d - 14];
    if (win > totals.largestCluster) totals.largestCluster = win;
  }
  const byRoom = {};
  for (let r = 0; r < nRooms; r++) {
    byRoom[rooms[r].id] = { infections: roomInf[r], infectionsRoom: roomInfRoom[r], infectionsClose: roomInfClose[r], doseRoom: roomDoseRoom[r], doseClose: roomDoseClose[r], infectiousHours: roomInfHours[r] };
  }
  const out = { seed: world.seed, daily, totals, byRoom, events };
  if (record) { out.frames = { conc, nRooms }; out.overrides = ov; }
  return out;
}

// ===========================================================================
// Inspection helpers (used by tests and the UI)
// ===========================================================================
// Presence (people, fractional) in each room at global slot g, on the plan (no
// behavioural overrides). Visitors included.
// Sub-slot visits at global slot g: explicit visits plus staff presence
// implied by care and medicine-round contacts. [{ person, room, frac }]
function slotVisits(world, g) {
  const out = [], v = world.visits, c = world.contacts;
  for (let k = v.start[g]; k < v.start[g + 1]; k++) out.push({ person: v.person[k], room: v.room[k], frac: v.frac[k] });
  for (let k = c.start[g]; k < c.start[g + 1]; k++) if (PRESENCE_TYPE[c.type[k]]) out.push({ person: c.a[k], room: c.room[k], frac: Math.min(1, c.tau[k] / SLOT_HOURS) });
  return out;
}
function roomPresence(world, g) {
  const occ = new Float64Array(world.nRooms);
  const N = world.N, base = g * N;
  const vf = new Float64Array(N);
  for (const x of slotVisits(world, g)) { vf[x.person] += x.frac; occ[x.room] += x.frac; }
  for (let p = 0; p < N; p++) occ[world.locSlot[base + p]] += 1 - vf[p];
  for (const vis of world.visitors) if (g >= vis.g0 && g < vis.g0 + vis.slots) occ[vis.rooms[g - vis.g0]] += 1;
  return occ;
}

// ---- src/analysis.js ----
// Analysis layer: paired comparisons, summaries, assumption scenarios, lamp
// placement ranking and cluster-trial power.
//
// Same portability rules as engine.js: ES module, no dependencies, no DOM, no
// Node-only APIs. Long-running functions take an onProgress(done, total)
// callback and accept a seed / trial range, so callers (e.g. a Web Worker) can
// run them in chunks and merge the pieces with the merge* helpers.
//
// Note for the web build: params.js, engine.js and analysis.js are concatenated
// into one scope, so top-level names must be unique across the three files and
// imports must not be renamed.


const STREAM_TRIAL = 101;

// ---------------------------------------------------------------------------
// Seeds: a number n means seeds 1..n; {start, count} a range; or an array.
// ---------------------------------------------------------------------------
function seedList(seeds, defaultStart = 1) {
  if (Array.isArray(seeds)) return seeds.slice();
  if (seeds && typeof seeds === 'object') { const out = []; for (let i = 0; i < seeds.count; i++) out.push(seeds.start + i); return out; }
  const n = seeds == null ? 100 : seeds | 0;
  const out = []; for (let i = 0; i < n; i++) out.push(defaultStart + i);
  return out;
}

// ---------------------------------------------------------------------------
// summarize(values) → mean, sd, median, quantiles (5, 25, 75, 95), P(zero)
// Quantiles use linear interpolation between order statistics (R type 7).
// ---------------------------------------------------------------------------
function quantileSorted(sorted, q) {
  if (!sorted.length) return NaN;
  const h = (sorted.length - 1) * q, lo = Math.floor(h), hi = Math.ceil(h);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (h - lo);
}
function summarize(values) {
  const v = Array.from(values).filter((x) => Number.isFinite(x));
  const n = v.length;
  if (!n) return { n: 0, mean: NaN, sd: NaN, se: NaN, median: NaN, q05: NaN, q25: NaN, q75: NaN, q95: NaN, min: NaN, max: NaN, pZero: NaN };
  const s = v.slice().sort((a, b) => a - b);
  let sum = 0; for (const x of v) sum += x;
  const mean = sum / n;
  let ss = 0; for (const x of v) ss += (x - mean) * (x - mean);
  const sd = n > 1 ? Math.sqrt(ss / (n - 1)) : 0;
  return {
    n, mean, sd, se: sd / Math.sqrt(n),
    median: quantileSorted(s, 0.5), q05: quantileSorted(s, 0.05), q25: quantileSorted(s, 0.25),
    q75: quantileSorted(s, 0.75), q95: quantileSorted(s, 0.95), min: s[0], max: s[n - 1],
    pZero: v.filter((x) => x === 0).length / n,
  };
}

// ---------------------------------------------------------------------------
// compare(config, arms, { seeds, onProgress, runOpts })
// Every arm runs on the same world for each seed (common random numbers).
// arms: [{ name, intervention }] or { name: intervention }. The first arm is
// the reference for paired differences.
// ---------------------------------------------------------------------------
function normArms(arms) {
  if (Array.isArray(arms)) return arms.map((a, i) => ({ name: a.name || `arm${i}`, intervention: a.intervention || a }));
  return Object.keys(arms).map((name) => ({ name, intervention: arms[name] }));
}
function compare(config, arms, opts = {}) {
  const A = normArms(arms);
  const seeds = seedList(opts.seeds);
  const out = {
    seeds,
    arms: A.map((a) => ({ name: a.name, intervention: a.intervention, totals: [], residentInfected: [], staffInfected: [], byRoom: {} })),
  };
  let done = 0;
  for (const seed of seeds) {
    const world = buildWorld(config, seed);
    A.forEach((a, k) => {
      const r = runSeason(world, a.intervention, opts.runOpts || {});
      const o = out.arms[k];
      o.totals.push(r.totals);
      o.residentInfected.push(r.totals.residentInfected);
      o.staffInfected.push(r.totals.staffInfected);
      for (const id in r.byRoom) {
        const b = r.byRoom[id], acc = o.byRoom[id] || (o.byRoom[id] = { infections: 0, infectionsRoom: 0, infectionsClose: 0, doseRoom: 0, doseClose: 0, infectiousHours: 0 });
        acc.infections += b.infections; acc.infectionsRoom += b.infectionsRoom; acc.infectionsClose += b.infectionsClose;
        acc.doseRoom += b.doseRoom; acc.doseClose += b.doseClose; acc.infectiousHours += b.infectiousHours;
      }
    });
    done++;
    if (opts.onProgress) opts.onProgress(done, seeds.length);
  }
  return finishCompare(out);
}
// byRoom in the result holds sums; finishCompare adds per-seed means, paired
// differences and summaries.
function finishCompare(out) {
  const n = out.seeds.length;
  for (const a of out.arms) {
    a.byRoomMean = {};
    for (const id in a.byRoom) { const b = a.byRoom[id]; a.byRoomMean[id] = {}; for (const k in b) a.byRoomMean[id][k] = n ? b[k] / n : 0; }
    a.summary = { residentInfected: summarize(a.residentInfected), staffInfected: summarize(a.staffInfected) };
    a.routes = { room: 0, close: 0, community: 0 };
    for (const t of a.totals) for (const k in a.routes) a.routes[k] += t.byRoute[k];
  }
  const ref = out.arms[0];
  // Paired difference per seed: averted = reference − arm (positive = fewer infections).
  out.paired = out.arms.slice(1).map((a) => {
    const resAv = a.residentInfected.map((v, i) => ref.residentInfected[i] - v);
    const stAv = a.staffInfected.map((v, i) => ref.staffInfected[i] - v);
    const totAv = resAv.map((v, i) => v + stAv[i]);
    const refMean = ref.summary.residentInfected.mean, armMean = a.summary.residentInfected.mean;
    return {
      name: a.name, vs: ref.name,
      residentAverted: resAv, staffAverted: stAv, totalAverted: totAv,
      summary: { residentAverted: summarize(resAv), staffAverted: summarize(stAv), totalAverted: summarize(totAv) },
      relativeReduction: refMean > 0 ? 1 - armMean / refMean : NaN,
      pWorse: resAv.filter((x) => x < 0).length / Math.max(1, resAv.length),
    };
  });
  return out;
}
// Merge two compare() results computed on disjoint seed ranges.
function mergeCompare(a, b) {
  const out = { seeds: a.seeds.concat(b.seeds), arms: a.arms.map((x, k) => {
    const y = b.arms[k];
    const byRoom = {};
    for (const src of [x.byRoom, y.byRoom]) for (const id in src) {
      const acc = byRoom[id] || (byRoom[id] = {});
      for (const f in src[id]) acc[f] = (acc[f] || 0) + src[id][f];
    }
    return { name: x.name, intervention: x.intervention, totals: x.totals.concat(y.totals), residentInfected: x.residentInfected.concat(y.residentInfected), staffInfected: x.staffInfected.concat(y.staffInfected), byRoom };
  }) };
  return finishCompare(out);
}

// ---------------------------------------------------------------------------
// scenarios(config): assumption sets that matter for the lamp, all with
// (approximately) the same no-lamp attack rate.
//   cautious   : close-range share 0.8, lamp ecadr and realWorldFactor at low
//   central    : the config as given
//   favourable : close-range share 0.2, lamp ecadr and realWorldFactor at high
// Close-range share is changed through the calibration table: G and
// emission.median move together so the no-lamp attack rate stays on target.
// If the user has moved G or emission.median away from the calibrated values
// for share 0.5, the same ratio is carried into the other scenarios; lamp
// values are scaled by low/central or high/central of their researched range,
// so a user edit to the lamp carries through proportionally too.
// ---------------------------------------------------------------------------
const SCENARIO_DEFS = {
  cautious: { closeShare: 0.8, lamp: 'low' },
  favourable: { closeShare: 0.2, lamp: 'high' },
};
function scenarios(config) {
  const pathogen = config.pathogen || 'covid';
  const base = calibrated(pathogen, 0.5);
  const rG = base.G > 0 ? config.transmission.G / base.G : 1;
  const rE = base.emissionMedian > 0 ? config.emission.median / base.emissionMedian : 1;
  const make = (name) => {
    const def = SCENARIO_DEFS[name];
    const c = mergeConfig(config, {});
    const cal = calibrated(pathogen, def.closeShare);
    c.transmission.G = cal.G * rG;
    c.emission.median = cal.emissionMedian * rE;
    c.transmission.closeShare = def.closeShare;
    for (const path of ['lamp.ecadr', 'lamp.realWorldFactor']) {
      const rg = paramRange(PARAMS.find((p) => p.path === path), pathogen);
      setPath(c, path, rg.central > 0 ? getPath(config, path) * rg[def.lamp] / rg.central : rg[def.lamp]);
    }
    c.scenario = name;
    return c;
  };
  return { cautious: make('cautious'), central: mergeConfig(config, { scenario: 'central' }), favourable: make('favourable') };
}

// ---------------------------------------------------------------------------
// rankRooms(config, { seeds, lampsAvailable, onProgress, confirm, confirmSeeds })
// 1. Baseline runs (no lamps): mean room-air infections acquired in each room.
// 2. First-order infections averted by the n-th lamp in room r:
//      inf_r × ( λ_r/(λ_r + A(n−1)) − λ_r/(λ_r + A(n)) ),
//    A(n) = air changes added by n lamps (engine.lampAchFor: capped, then ×
//    realWorldFactor). With no cap this is the spec's
//    inf_r × (λ/(λ+(n−1)Δ) − λ/(λ+nΔ)). It assumes room-air
//    infections in r scale with the steady-state concentration ∝ 1/λ_r and
//    ignores onward chains (the confirmation step captures those). Like
//    byRoom, it counts residents and staff together; compare it with the
//    simulated totalAverted, not residentAverted.
// 3. Greedy allocation of the budget.
// 4. Paired simulation of the greedy allocation at the full budget and at
//    half and a quarter of it, on fresh seeds (to avoid selection bias).
// ---------------------------------------------------------------------------
function baselineRoomStats(config, opts = {}) {
  const seeds = seedList(opts.seeds);
  const acc = { n: 0, residentInfected: 0, rooms: {} };
  let done = 0;
  for (const seed of seeds) {
    const world = buildWorld(config, seed);
    const r = runSeason(world, {}, opts.runOpts || {});
    acc.n++; acc.residentInfected += r.totals.residentInfected;
    for (const id in r.byRoom) {
      const b = r.byRoom[id], a = acc.rooms[id] || (acc.rooms[id] = { infections: 0, infectionsRoom: 0, infectionsClose: 0, doseRoom: 0, doseClose: 0 });
      a.infections += b.infections; a.infectionsRoom += b.infectionsRoom; a.infectionsClose += b.infectionsClose; a.doseRoom += b.doseRoom; a.doseClose += b.doseClose;
    }
    done++;
    if (opts.onProgress) opts.onProgress(done, seeds.length);
  }
  return acc;
}
function mergeBaselineRoomStats(a, b) {
  const out = { n: a.n + b.n, residentInfected: a.residentInfected + b.residentInfected, rooms: {} };
  for (const src of [a.rooms, b.rooms]) for (const id in src) { const o = out.rooms[id] || (out.rooms[id] = {}); for (const f in src[id]) o[f] = (o[f] || 0) + src[id][f]; }
  return out;
}
function allocateLamps(config, stats, lampsAvailable) {
  const world = buildWorld(mergeConfig(config, { days: 1 }), 1); // rooms and λ only
  const { lambda } = roomLambdas(world, {});
  const rooms = world.rooms.map((room, r) => {
    const s = stats.rooms[room.id] || { infections: 0, infectionsRoom: 0, infectionsClose: 0 };
    const n = Math.max(1, stats.n);
    return { roomId: room.id, type: room.type, wing: room.wing, volume: room.volume, room, lambda: lambda[r], deltaPerLamp: lampAchFor(config, room, 1),
      infectionsRoom: s.infectionsRoom / n, infectionsClose: s.infectionsClose / n, infections: s.infections / n, lamps: 0 };
  }).filter((x) => x.type !== 'outside' && x.volume > 0);
  const A = (x, n) => lampAchFor(config, x.room, n); // added air changes from n lamps (same function as the engine)
  const gain = (x) => { const n = x.lamps + 1; return x.infectionsRoom * (x.lambda / (x.lambda + A(x, n - 1)) - x.lambda / (x.lambda + A(x, n))); };
  for (const x of rooms) x.firstLampAverted = gain(x);
  const steps = [];
  let cum = 0;
  for (let k = 0; k < lampsAvailable; k++) {
    let best = null, bg = 0;
    for (const x of rooms) { const gx = gain(x); if (gx > bg) { bg = gx; best = x; } }
    if (!best) break;
    best.lamps++; cum += bg;
    steps.push({ n: k + 1, roomId: best.roomId, gain: bg, cumulative: cum });
  }
  const allocation = {};
  for (const x of rooms) if (x.lamps > 0) allocation[x.roomId] = x.lamps;
  rooms.sort((a, b) => b.infectionsRoom - a.infectionsRoom);
  for (const x of rooms) delete x.room;
  return { rooms, steps, allocation, predictedAverted: cum };
}
const allocationFromSteps = (steps, n) => { const a = {}; for (const s of steps.slice(0, n)) a[s.roomId] = (a[s.roomId] || 0) + 1; return a; };
function rankRooms(config, opts = {}) {
  const lampsAvailable = opts.lampsAvailable == null ? 12 : opts.lampsAvailable;
  const seeds = seedList(opts.seeds);
  const confirm = opts.confirm !== false;
  const total = seeds.length + (confirm ? seedList(opts.confirmSeeds || seeds.length).length : 0);
  const stats = baselineRoomStats(config, { seeds, runOpts: opts.runOpts, onProgress: opts.onProgress && ((d) => opts.onProgress(d, total)) });
  const res = allocateLamps(config, stats, lampsAvailable);
  res.baselineMeanResidentInfected = stats.residentInfected / Math.max(1, stats.n);
  res.seeds = seeds.length;
  if (confirm && res.steps.length) {
    // Fresh seeds, after the ranking seeds.
    const maxSeed = Math.max(...seeds);
    const cs = Array.isArray(opts.confirmSeeds) ? opts.confirmSeeds : seedList(opts.confirmSeeds || seeds.length, maxSeed + 1);
    const budgets = [...new Set([res.steps.length, Math.ceil(res.steps.length / 2), Math.ceil(res.steps.length / 4)])].filter((b) => b > 0);
    const arms = [{ name: 'none', intervention: {} }].concat(budgets.map((b) => ({ name: `greedy-${b}`, intervention: { lamps: allocationFromSteps(res.steps, b) } })));
    const cmp = compare(config, arms, { seeds: cs, runOpts: opts.runOpts, onProgress: opts.onProgress && ((d) => opts.onProgress(seeds.length + d, total)) });
    res.confirm = {
      seeds: cs.length,
      none: cmp.arms[0].summary.residentInfected,
      allocations: cmp.paired.map((p, i) => ({
        name: p.name, lamps: budgets[i], allocation: arms[i + 1].intervention.lamps,
        predictedAverted: res.steps[budgets[i] - 1].cumulative,
        residentAverted: p.summary.residentAverted, staffAverted: p.summary.staffAverted, totalAverted: p.summary.totalAverted, relativeReduction: p.relativeReduction,
      })),
    };
  }
  return res;
}

// ---------------------------------------------------------------------------
// simulateTrial(config, design, { trials, trialStart, onProgress, permutations, alpha, seed })
// design = { facilitiesPerArm, seasons, placement, crossover, facilityVariation }
//   placement: intervention for the lamp arm ({ lamps: {...} } or a plain lamps map)
//   facilityVariation: { ventilationGsd, importationGsd, immunitySd } — each
//     facility draws its own ventilation scale and importation hazards
//     (lognormal around the config value) and immune shares (normal, clamped).
// Parallel: 2F facilities, F with lamps; outcome = mean resident infections per
//   facility-season; permutation test on the difference in arm means.
// Crossover: 2F facilities, each observed for `seasons` seasons in each
//   condition (separate seasons, so no shared randomness); outcome per facility
//   = control mean − lamp mean; sign-flip permutation test.
// No common random numbers between arms here: a real trial cannot have them.
// ---------------------------------------------------------------------------
function facilityConfig(config, fv, rng) {
  const ln = (gsd) => Math.log(Math.max(1, gsd || 1));
  const z1 = normal01(rng), z2 = normal01(rng), z3 = normal01(rng);
  const c = mergeConfig(config, {});
  c.ventilation.scale = config.ventilation.scale * Math.exp(ln(fv.ventilationGsd) * z1);
  const imp = Math.exp(ln(fv.importationGsd) * z2);
  c.importation.staffDailyHazard = Math.min(1, config.importation.staffDailyHazard * imp);
  c.importation.visitorInfectiousProb = Math.min(1, config.importation.visitorInfectiousProb * imp);
  // Immunity: shift the protection of residents and staff by sd × z (clamped).
  const sd = fv.immunitySd || 0;
  const cl = (x) => Math.min(0.95, Math.max(0, x));
  c.immune.protection = cl(config.immune.protection + sd * z3);
  if (config.immune.protectionStaff != null) c.immune.protectionStaff = cl(config.immune.protectionStaff + sd * z3);
  return c;
}
function normal01(rng) { const u1 = 1 - rng(), u2 = rng(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
function permutationP(stat, valsA, valsB, nPerm, rng) {
  // Two-sided p-value for difference in means (A − B), label permutation.
  const all = valsA.concat(valsB), nA = valsA.length, n = all.length;
  let total = 0; for (const v of all) total += v;
  let extreme = 0;
  const idx = all.map((_, i) => i);
  for (let k = 0; k < nPerm; k++) {
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    let sA = 0; for (let i = 0; i < nA; i++) sA += all[idx[i]];
    const st = sA / nA - (total - sA) / (n - nA);
    if (Math.abs(st) >= Math.abs(stat) - 1e-12) extreme++;
  }
  return (extreme + 1) / (nPerm + 1);
}
function signFlipP(diffs, nPerm, rng) {
  const n = diffs.length; let obs = 0; for (const d of diffs) obs += d; obs /= n;
  let extreme = 0;
  for (let k = 0; k < nPerm; k++) {
    let s = 0; for (const d of diffs) s += rng() < 0.5 ? -d : d;
    if (Math.abs(s / n) >= Math.abs(obs) - 1e-12) extreme++;
  }
  return (extreme + 1) / (nPerm + 1);
}
function simulateTrial(config, design, opts = {}) {
  const F = design.facilitiesPerArm | 0, seasons = Math.max(1, design.seasons | 0 || 1);
  const fv = design.facilityVariation || {};
  const placement = design.placement && design.placement.lamps ? design.placement : { lamps: design.placement || {} };
  const trials = opts.trials == null ? 100 : opts.trials;
  const t0 = opts.trialStart || 0;
  const nPerm = opts.permutations || 999, alpha = opts.alpha || 0.05;
  const baseSeed = opts.seed == null ? 12345 : opts.seed;
  const out = { design, alpha, permutations: nPerm, trialStart: t0, trials: [], };
  for (let t = t0; t < t0 + trials; t++) {
    const rng = makeRng(streamSeed(baseSeed, STREAM_TRIAL, t));
    const facilities = [];
    for (let f = 0; f < 2 * F; f++) facilities.push(facilityConfig(config, fv, rng));
    const season = (cfg, iv) => {
      const seed = Math.floor(rng() * 4294967296) >>> 0;
      return runSeason(buildWorld(cfg, seed), iv).totals.residentInfected;
    };
    let estimate, p, meanControl, meanTreated;
    if (!design.crossover) {
      const ctrl = [], trt = [];
      facilities.forEach((cfg, f) => {
        let s = 0; for (let k = 0; k < seasons; k++) s += season(cfg, f < F ? placement : {});
        (f < F ? trt : ctrl).push(s / seasons);
      });
      meanControl = ctrl.reduce((a, b) => a + b, 0) / F; meanTreated = trt.reduce((a, b) => a + b, 0) / F;
      estimate = meanControl - meanTreated;
      p = permutationP(estimate, ctrl, trt, nPerm, rng);
    } else {
      const diffs = []; let sc = 0, st = 0;
      for (const cfg of facilities) {
        let c = 0, l = 0;
        for (let k = 0; k < seasons; k++) { c += season(cfg, {}); l += season(cfg, placement); }
        diffs.push((c - l) / seasons); sc += c / seasons; st += l / seasons;
      }
      meanControl = sc / facilities.length; meanTreated = st / facilities.length;
      estimate = meanControl - meanTreated;
      p = signFlipP(diffs, nPerm, rng);
    }
    out.trials.push({ trial: t, estimate, relative: meanControl > 0 ? estimate / meanControl : NaN, p, meanControl, meanTreated });
    if (opts.onProgress) opts.onProgress(t - t0 + 1, trials);
  }
  return finishTrial(out);
}
function finishTrial(out) {
  const tr = out.trials;
  out.n = tr.length;
  out.power = tr.filter((x) => x.p < out.alpha).length / Math.max(1, tr.length);
  out.effect = summarize(tr.map((x) => x.estimate));
  out.relativeEffect = summarize(tr.map((x) => x.relative));
  out.meanControl = tr.reduce((a, x) => a + x.meanControl, 0) / Math.max(1, tr.length);
  out.meanTreated = tr.reduce((a, x) => a + x.meanTreated, 0) / Math.max(1, tr.length);
  return out;
}
// Pool-based power (much cheaper for large designs): simulate poolSize
// facilities once, each with its own facility variation and two independent
// seasons per condition (control and lamps; different seeds, no shared
// randomness), then build trials by resampling facilities from the pool with
// replacement. Each trial: parallel = 2F facilities, F per arm, one season
// each (seasons > 1: mean of that many seasons per facility); crossover =
// 2F facilities each contributing a control season and a lamp season.
function facilityPool(config, design, opts = {}) {
  const fv = design.facilityVariation || {};
  const placement = design.placement && design.placement.lamps ? design.placement : { lamps: design.placement || {} };
  const M = opts.poolSize || 1000, S = Math.max(1, opts.seasonsPerFacility || 2);
  const baseSeed = opts.seed == null ? 777 : opts.seed;
  const ctrl = [], lamp = [];
  for (let f = 0; f < M; f++) {
    const rng = makeRng(streamSeed(baseSeed, STREAM_TRIAL + 1, f));
    const cfg = facilityConfig(config, fv, rng);
    const c = [], l = [];
    for (let k = 0; k < S; k++) {
      c.push(runSeason(buildWorld(cfg, Math.floor(rng() * 4294967296) >>> 0), {}).totals.residentInfected);
      l.push(runSeason(buildWorld(cfg, Math.floor(rng() * 4294967296) >>> 0), placement).totals.residentInfected);
    }
    ctrl.push(c); lamp.push(l);
    if (opts.onProgress) opts.onProgress(f + 1, M);
  }
  return { size: M, seasonsPerFacility: S, ctrl, lamp };
}
function powerFromPool(pool, design, opts = {}) {
  const F = design.facilitiesPerArm | 0, seasons = Math.max(1, design.seasons | 0 || 1);
  const trials = opts.trials || 400, nPerm = opts.permutations || 999, alpha = opts.alpha || 0.05;
  const rng = makeRng(streamSeed(opts.seed == null ? 4242 : opts.seed, STREAM_TRIAL + 2, (design.facilities || F) * 10 + (design.crossover ? 1 : 0)));
  const pick = () => Math.floor(rng() * pool.size);
  const out = { design: { ...design, placement: undefined }, alpha, permutations: nPerm, trialStart: 0, trials: [], poolSize: pool.size };
  for (let t = 0; t < trials; t++) {
    let estimate, p, meanControl, meanTreated;
    if (!design.crossover) {
      // Each facility contributes `seasons` seasons of one condition.
      const ctrl = [], trt = [];
      for (let f = 0; f < F; f++) {
        const a = pick(), b = pick();
        let sc = 0, st = 0;
        for (let k = 0; k < seasons; k++) { sc += pool.ctrl[a][k % pool.seasonsPerFacility]; st += pool.lamp[b][k % pool.seasonsPerFacility]; }
        ctrl.push(sc / seasons); trt.push(st / seasons);
      }
      meanControl = ctrl.reduce((x, y) => x + y, 0) / F; meanTreated = trt.reduce((x, y) => x + y, 0) / F;
      estimate = meanControl - meanTreated;
      p = permutationP(estimate, ctrl, trt, nPerm, rng);
    } else {
      // 2F facilities; over `seasons` seasons each spends half in each condition.
      const diffs = []; let sc = 0, st = 0;
      const per = Math.max(1, Math.floor(seasons / 2));
      const nFac = design.facilities || 2 * F; // crossover: total facilities, each in both conditions
      for (let f = 0; f < nFac; f++) {
        const a = pick();
        let c = 0, l = 0;
        for (let k = 0; k < per; k++) { c += pool.ctrl[a][k % pool.seasonsPerFacility]; l += pool.lamp[a][k % pool.seasonsPerFacility]; }
        diffs.push((c - l) / per); sc += c / per; st += l / per;
      }
      meanControl = sc / nFac; meanTreated = st / nFac;
      estimate = meanControl - meanTreated;
      p = signFlipP(diffs, nPerm, rng);
    }
    out.trials.push({ trial: t, estimate, relative: meanControl > 0 ? estimate / meanControl : NaN, p, meanControl, meanTreated });
  }
  return finishTrial(out);
}
function mergeTrial(a, b) {
  return finishTrial({ design: a.design, alpha: a.alpha, permutations: a.permutations, trialStart: Math.min(a.trialStart, b.trialStart), trials: a.trials.concat(b.trials) });
}

// Convenience: seasons-per-day helper for consumers that only import analysis.
const ANALYSIS_SLOTS_PER_DAY = SLOTS_PER_DAY;

// ---------------------------------------------------------------------------
// Calibration (see NOTES.md)
// ---------------------------------------------------------------------------
// Targets for the no-lamp baseline, from research/transmission.md §9.
//   covid: NHSN surveillance incidence 109.3 infections per 10,000
//          resident-weeks (Franklin et al. 2024, MMWR 73:339), i.e. a mean
//          season attack rate of 0.010930 × (days / 7) over all resident
//          infections. Least biased observable available: facility-wide
//          surveillance, not conditioned on an outbreak being reported.
//   flu:   median resident attack rate in reported outbreaks 0.33 (Lansbury
//          et al. 2017, 49 outbreaks). No surveillance incidence for
//          nursing-home residents was found, so the model is compared on the
//          same footing: single introductions that become a "reported
//          outbreak" (≥ 2 symptomatic resident cases within 72 h, the CDC
//          influenza definition), attack rate counted as symptomatic resident
//          cases (how outbreak reports count cases), median over outbreaks.
//   rsv:   as flu, median 0.24 (Osei-Yeboah et al. 2024, 7 studies).
const CALIBRATION_TARGETS = {
  covid: { kind: 'season', value: 0.010930, perWeek: true, source: 'Franklin et al. 2024, MMWR 73:339 (NHSN, Oct 2023-Feb 2024): 109.3 per 10,000 resident-weeks' },
  flu: { kind: 'outbreak', value: 0.33, source: 'Lansbury, Brown & Nguyen-Van-Tam 2017, Influenza Other Respir Viruses: median resident attack rate 33% (4-94%), 49 outbreaks' },
  rsv: { kind: 'outbreak', value: 0.24, source: 'Osei-Yeboah et al. 2024, Influenza Other Respir Viruses 18:e70008: median resident attack rate 24% (6.7-47.6%)' },
};
const OUTBREAK_MIN_CASES = 2, OUTBREAK_WINDOW_SLOTS = 3 * SLOTS_PER_DAY;

// Season runs (normal importation): mean attack rates and close-range share.
// Outbreak runs (one staff introduction on day 5, no other importation):
// share that become reported outbreaks, median attack rates among those,
// duration, close-range share. worldCache: Map seed → world (structure reuse).
function calibrationMetrics(config, opts = {}) {
  const cache = opts.worldCache || new Map();
  const getWorld = (cfg, seed) => { const w = buildWorld(cfg, seed, { reuse: cache.get(seed) }); cache.set(seed, w); return w; };
  const out = {};
  const nRes = config.facility.wings * config.facility.residentsPerWing;
  if (opts.seasonSeeds) {
    let res = 0, sym = 0, staff = 0, nStaff = 0, close = 0, room = 0, n = 0;
    for (const seed of seedList(opts.seasonSeeds)) {
      const w = getWorld(config, seed);
      const r = runSeason(w, {});
      res += r.totals.residentInfected; sym += r.totals.residentSymptomatic; staff += r.totals.staffInfected; nStaff += w.N - w.nResidents;
      close += r.totals.byRoute.close; room += r.totals.byRoute.room; n++;
    }
    out.season = { n, attackRate: res / (n * nRes), symptomaticAttackRate: sym / (n * nRes), staffAttackRate: staff / nStaff, closeShare: close / Math.max(1, close + room),
      incidencePer10kResidentWeeks: 1e4 * res / (n * nRes * config.days / 7) };
  }
  if (opts.outbreakSeeds) {
    const cfg1 = mergeConfig(config, { importation: { staffDailyHazard: 0, visitorInfectiousProb: 0 } });
    const ars = [], arsAll = [], durations = [], staffARs = [];
    let close = 0, room = 0, n = 0;
    for (const seed of seedList(opts.outbreakSeeds, 100001)) {
      const w = getWorld(cfg1, seed);
      const staffIdx = [];
      for (let p = 0; p < w.N; p++) if (w.isStaff[p]) staffIdx.push(p);
      const index = staffIdx[(Math.imul(seed, 2654435761) >>> 0) % staffIdx.length];
      const r = runSeason(w, {}, { introductions: [{ person: index, day: 5 }] });
      n++;
      close += r.totals.byRoute.close; room += r.totals.byRoute.room;
      // Symptom onset slots of infected residents.
      const onsets = [];
      let first = Infinity, last = -Infinity;
      for (const e of r.events) {
        if (w.isStaff[e.person]) continue;
        const g = e.day * SLOTS_PER_DAY + e.slot + 1;
        first = Math.min(first, g); last = Math.max(last, g);
        if (w.traits.symptomatic[e.person]) onsets.push(g + w.traits.latent[e.person] + w.traits.presym[e.person]);
      }
      onsets.sort((a, b) => a - b);
      let reported = false;
      for (let i = 0; i + OUTBREAK_MIN_CASES - 1 < onsets.length; i++) if (onsets[i + OUTBREAK_MIN_CASES - 1] - onsets[i] <= OUTBREAK_WINDOW_SLOTS) { reported = true; break; }
      if (!reported) continue;
      ars.push(r.totals.residentSymptomatic / nRes); arsAll.push(r.totals.residentInfected / nRes);
      staffARs.push((r.totals.staffInfected - 1) / (w.N - w.nResidents));
      durations.push((last - first) / SLOTS_PER_DAY);
    }
    const sAR = summarize(ars), sAll = summarize(arsAll);
    out.outbreak = { n, outbreaks: ars.length, pOutbreak: ars.length / Math.max(1, n),
      medianAR: sAR.median, q25AR: sAR.q25, q75AR: sAR.q75, medianARAll: sAll.median, meanARAll: sAll.mean,
      medianStaffAR: summarize(staffARs).median, medianDurationDays: summarize(durations).median, meanDurationDays: summarize(durations).mean,
      closeShare: close / Math.max(1, close + room) };
  }
  return out;
}

// Observable used for the fit: { value, share } for a config.
function fitObservable(pathogen, config, opts) {
  const tgt = CALIBRATION_TARGETS[pathogen];
  if (tgt.kind === 'season') {
    const m = calibrationMetrics(config, { seasonSeeds: opts.seasonSeeds, worldCache: opts.worldCache });
    return { value: m.season.attackRate, share: m.season.closeShare, metrics: m };
  }
  const m = calibrationMetrics(config, { outbreakSeeds: opts.outbreakSeeds, worldCache: opts.worldCache });
  return { value: m.outbreak.medianAR, share: m.outbreak.closeShare, metrics: m };
}
function calibrationTargetValue(pathogen, config) {
  const t = CALIBRATION_TARGETS[pathogen];
  return t.perWeek ? t.value * config.days / 7 : t.value;
}

// Find (G, emission.median) for each close-range share. Alternates:
// (1) emission so the attack-rate observable hits the target at the current G
//     (bisection on log emission; the observable rises with emission),
// (2) G so the close-range share hits s at that emission (bisection on log G).
// Common random numbers (the same seeds every evaluation) keep the
// observables smooth in the parameters.
function calibrate(pathogen, opts = {}) {
  const shares = opts.shares || [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  const base = opts.config || (opts.baseConfig ? opts.baseConfig : null);
  if (!base) throw new Error('calibrate: opts.config (the default config for the pathogen) is required');
  const target = calibrationTargetValue(pathogen, base);
  const fitOpts = { seasonSeeds: opts.seasonSeeds || 200, outbreakSeeds: opts.outbreakSeeds || 400, worldCache: new Map() };
  const log = opts.log || (() => {});
  let evals = 0;
  const evalAt = (G, e) => {
    const c = mergeConfig(base, { transmission: { G }, emission: { median: e } });
    evals++;
    return fitObservable(pathogen, c, fitOpts);
  };
  const tolV = opts.tolValue || 0.03, tolS = opts.tolShare || 0.01;
  // Bisection in log space for a monotone increasing function f(x) toward y.
  const solveLog = (f, y, x0, relTol, maxIt = 14) => {
    let lo = x0, hi = x0, flo = f(lo), fhi = flo;
    let k = 0;
    if (flo.v < y) { while (fhi.v < y && k++ < 12) { lo = hi; flo = fhi; hi *= 2.5; fhi = f(hi); } }
    else { while (flo.v > y && k++ < 12) { hi = lo; fhi = flo; lo /= 2.5; flo = f(lo); } }
    let best = Math.abs(flo.v - y) < Math.abs(fhi.v - y) ? { x: lo, r: flo } : { x: hi, r: fhi };
    for (let it = 0; it < maxIt; it++) {
      if (Math.abs(best.r.v - y) <= relTol * Math.max(Math.abs(y), 1e-9)) break;
      const mid = Math.sqrt(lo * hi), fm = f(mid);
      if (Math.abs(fm.v - y) < Math.abs(best.r.v - y)) best = { x: mid, r: fm };
      if (fm.v < y) lo = mid; else hi = mid;
      if (hi / lo < 1.002) break;
    }
    return best;
  };
  const rows = [];
  let G = opts.G0 || 1, e = opts.e0 || base.emission.median;
  for (const s of shares) {
    let last = null;
    for (let round = 0; round < (opts.rounds || 4); round++) {
      const be = solveLog((x) => { const o = evalAt(G, x); return { v: o.value, o }; }, target, e, tolV);
      e = be.x; last = be.r.o;
      log(`  ${pathogen} share ${s}: round ${round} G=${G.toPrecision(4)} e=${e.toPrecision(4)} value=${last.value.toFixed(4)} share=${last.share.toFixed(3)}`);
      if (Math.abs(last.share - s) <= tolS) break;
      const bg = solveLog((x) => { const o = evalAt(x, e); return { v: o.share, o }; }, s, G, tolS / Math.max(s, 0.05), 10);
      G = bg.x; last = bg.r.o;
      if (Math.abs(last.share - s) <= tolS && Math.abs(last.value - target) <= tolV * target) break;
    }
    // Final check with full metrics (season and outbreak) at the solution.
    const c = mergeConfig(base, { transmission: { G }, emission: { median: e } });
    // (Only the fitted kind's worlds are cached, to bound memory.)
    const isSeason = CALIBRATION_TARGETS[pathogen].kind === 'season';
    const m = Object.assign(
      calibrationMetrics(c, { seasonSeeds: fitOpts.seasonSeeds, worldCache: isSeason ? fitOpts.worldCache : undefined }),
      calibrationMetrics(c, { outbreakSeeds: fitOpts.outbreakSeeds, worldCache: isSeason ? undefined : fitOpts.worldCache }));
    const achieved = { target, fitted: last.value, closeShare: last.share };
    if (m.season) Object.assign(achieved, { seasonAttackRate: m.season.attackRate, seasonSymptomaticAttackRate: m.season.symptomaticAttackRate, seasonStaffAttackRate: m.season.staffAttackRate, incidencePer10kResidentWeeks: m.season.incidencePer10kResidentWeeks, seasonCloseShare: m.season.closeShare });
    if (m.outbreak) Object.assign(achieved, { pOutbreak: m.outbreak.pOutbreak, outbreaks: m.outbreak.outbreaks, outbreakMedianAR: m.outbreak.medianAR, outbreakIQR: [m.outbreak.q25AR, m.outbreak.q75AR], outbreakMedianARAll: m.outbreak.medianARAll, outbreakMedianStaffAR: m.outbreak.medianStaffAR, outbreakMedianDurationDays: m.outbreak.medianDurationDays, outbreakCloseShare: m.outbreak.closeShare });
    for (const k in achieved) if (typeof achieved[k] === 'number') achieved[k] = +achieved[k].toPrecision(4);
    rows.push({ closeShare: s, G: +G.toPrecision(5), emissionMedian: +e.toPrecision(5), achieved });
    log(`${pathogen} share ${s}: G=${G.toPrecision(4)} emission=${e.toPrecision(4)} ${JSON.stringify(achieved)} (${evals} evaluations so far)`);
    if (opts.onProgress) opts.onProgress(rows.length, shares.length);
  }
  return { pathogen, target, targetSource: CALIBRATION_TARGETS[pathogen].source, seasonSeeds: fitOpts.seasonSeeds, outbreakSeeds: fitOpts.outbreakSeeds, evaluations: evals, rows };
}

return { CALIBRATION, calibrated, PARAMS, getPath, setPath, mergeConfig, PATHOGENS, defaultConfig, paramRange, SLOTS_PER_DAY, SLOT_HOURS, ROOM_TYPES, ROLES, SHIFT_NAMES, CONTACT_TYPES, ROUTES, STATES, streamSeed, makeRng, buildFacility, columnsFrom, structuralKey, assembleWorld, buildWorld, roomAirStep, lampAchFor, roomLambdas, runSeason, slotVisits, roomPresence, seedList, quantileSorted, summarize, compare, mergeCompare, SCENARIO_DEFS, scenarios, baselineRoomStats, mergeBaselineRoomStats, allocateLamps, rankRooms, simulateTrial, facilityPool, powerFromPool, mergeTrial, ANALYSIS_SLOTS_PER_DAY, CALIBRATION_TARGETS, calibrationMetrics, calibrationTargetValue, calibrate };