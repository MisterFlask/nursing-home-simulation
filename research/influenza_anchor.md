# Influenza anchor parameters for the nursing-home far-UVC simulation

Compiled 2026-11-18. Scope: seasonal influenza A in a US nursing home (112 residents, 131 staff, 120-day winter season). Companion to `transmission.md` and `far_uvc.md`; this file adds, corrects or upgrades the influenza rows in those files and does not repeat what they already verify.

**Tags.** VERIFIED = I opened a source in this session that states the number, and the URL is given with the source's own figure quoted. INFERRED = my arithmetic on verified inputs, or a judgement. Nothing recalled is tagged VERIFIED.

**Access caveat for this session.** Direct `curl` to cdc.gov, data.cdc.gov, PubMed/PMC, Crossref, medRxiv and europepmc was refused by the egress proxy; everything had to go through the page-fetch tool. PMC pages returned CAPTCHAs. Several pages about influenza virus in air samples, and the two far-UVC influenza papers, could not be retrieved in this session at all (the fetch tool refused them). Those are listed at the end; for far-UVC I therefore rely on the VERIFIED entries already in `far_uvc.md` from the earlier session and flag that I did not re-open them.

---

## 0. Summary table

| Parameter | Central | Low | High | Unit | Source | Status |
|---|---|---|---|---|---|---|
| **Reported resident influenza, peak 17 weeks (seasonal anchor)** | **2.3%** | **2.3%** | **4.0%** | fraction of residents | NHSN RPV dataset `tscn-ryh9` (2025-26 computed; 2024-25 scaled) | V (2025-26) / I (2024-25 scaling) |
| Reported resident influenza, full season Oct–Mar | 2.33% (2025-26) | 2.33% | 4.5% (2024-25, scaled) | fraction | same | V / I |
| Resident influenza incidence, peak-season weekly | 13.5 (2025-26) | — | 20.6 (2024-25 obs.) | per 10,000 resident-weeks | same | V |
| Resident influenza incidence, peak single week | 32.2 (2026-01-11) | — | 43.9 (2025-02-09) | per 10,000 residents | same | V |
| Under-ascertainment multiplier, reported → all infections | 3 | 2 | 5 | × | Reed 2015 (5.2× for ≥65 hospitalisations); testing practice | I |
| True resident infection fraction per 120 d (model target) | 8% | 5% | 15% | fraction | reported × multiplier | I |
| **Hospitalised among reported resident cases** | **20%** | **19.5%** | **20.1%** | fraction | NHSN `tscn-ryh9`, both seasons | V |
| Resident influenza hospitalisation incidence | 2.63 (2025-26) | — | 4.15 (2024-25) | per 10,000 resident-weeks | same | V |
| Resident case-fatality per outbreak | 6.5% | — | — | fraction | Lansbury 2017 (already in transmission.md) | V |
| **Staff influenza incidence per season, all infections** | **13.6%** | **6.4%** | **22.3%** | fraction of staff | Kuster 2011 weighted by NHSN coverage; Bénet 2021 | V inputs / I weighting |
| **Importation interval, infected staff member arriving** | **1 per 8 days** | **1 per 5 d** | **1 per 18 d** | days | derived from the above for 131 staff over 120 d | I |
| Nursing-home HCP influenza vaccination coverage | 40.2% (2025-26) | — | 45.4% (2023-24) | fraction | NHSN SNF HCP report 2025-26; Bell 2026 MMWR | V |
| Resident influenza vaccination coverage | 57–58% (2025-26) | 57.4% | 61.3% (2024-25) | fraction | NHSN `tscn-ryh9`; Bell 2026 MMWR | V |
| VE against influenza A, adults 18–64, outpatient | 35% (2025-26) | 23% | 56% (2024-25) | — | MMWR 75(9) and 74(6) | V |
| VE against influenza A, adults ≥65, outpatient | 30% (2025-26) | 18% | 51% (2024-25) | — | same | V |
| VE in NH residents, screening method (my calc on NHSN) | 22–34% | — | — | — | NHSN `tscn-ryh9` | I (my calculation) |
| Effective immunity at season start, residents | 0.20 | 0.10 | 0.35 | fraction | coverage × VE + prior infection | I |
| Staff worked while ill with ILI | 41.4% | — | — | fraction | Chiu 2017 (CDC) | V |
| Median days worked while ill with ILI | 3 | 0 | 30 | days | Chiu 2017 | V |
| **ER_q, resting oral breathing (recommended)** | **0.035** | **0.0029** | **0.42** | quanta/h | Mikszewski 2022, lognormal log10 SD 0.84 | V |
| ER_q, speaking | 0.17 | 0.015 | 2.1 | quanta/h | Mikszewski 2022 | V |
| ER_q, naturally infected symptomatic population (independent) | 0.17 | 0.10 | 0.27 | quanta/h | Bueno de Mesquita 2020 | V |
| ER_q, EMIT challenge donors (independent) | 0.11 | 0.029 | 0.21 | quanta/h | Bueno de Mesquita 2020 | V |
| ER_q, maximum-shedding individual | — | — | 630 | quanta/h | Bueno de Mesquita 2020 | V |
| ER_q, back-calculated from the Moser airliner outbreak | 79 | 15 | 128 | quanta/h | Rudnick & Milton 2003; Bueno de Mesquita 53 | V |
| **Spread of published ER_q estimates (central to outbreak tail)** | — | 0.03 | 630 | quanta/h | all of the above | V (≈4 orders of magnitude) |
| RNA copies per quantum (dose) | 1.4×10⁵ | 9.9×10⁴ | 1.8×10⁵ | copies/quantum | Bueno de Mesquita 2020 | V |
| Aerosol share of all influenza transmission | 0.50 | 0.25 | 0.85 | fraction | Cowling 2013 | V |
| **Share of NH influenza transmission room-air cleaning cannot reach** | **0.60** | **0.35** | **0.85** | fraction | Cowling, Nicas & Jones, McLean/Tellier | I |
| Latent period | 0.9 | 0.2 | 1.4 | days | Chan 2025 (RVTN-S households) | V |
| Pre-symptomatic infectious period | 0.7 | 0.2 | 1.3 | days | Chan 2025 | V |
| Symptomatic infectious period | 2.0 | 1.7 | 2.4 | days (model-fit) | Chan 2025 | V |
| Share of transmission before symptom onset | 16% | 7% | 25% | fraction | Chan 2025 | V |
| Intrinsic generation time | 3.2 | 2.9 | 3.6 | days | Chan 2025 | V |
| Relative infectiousness, asymptomatic | 0.57 | 0.11 | 1.54 | ratio | Tsang 2023 as used by Chan 2025 | V (as cited) |
| Asymptomatic fraction, adults (household) | 7.2% | — | — | fraction | Chan 2025 | V |
| Asymptomatic fraction, older adults | 0.20 | 0.07 | 0.50 | fraction | no older-adult source found | I |
| Aerosol HID50 (small-particle) | — | 0.6 | 3.0 | TCID50 | Alford as quoted by Tellier 2006 | V (secondary) |
| Intranasal-drop HID50 | — | 127 | 320 | TCID50 | Douglas as quoted by Tellier 2006 | V (secondary) |
| **k, 222 nm, influenza A aerosol** | **5** | **1.8** | **20** | cm²/mJ (base e) | Welch 2018 (1.8); Buonanno 2024 (20.06) | V in `far_uvc.md`; **not re-opened here** |
| Oseltamivir prophylaxis efficacy, frail elderly | 92% | — | — | reduction in lab-confirmed influenza | Peters 2001 | V |
| Oseltamivir prophylaxis use, US NH practice | 1.9–2.6 | — | — | courses per 1,000 resident-weeks | Temte 2023 (control vs intervention) | V |
| LTC influenza outbreaks per season, Minnesota | 135 (2024-25) | 101 (2023-24) | — | count | MDH annual summary | V |

---

## 1. The seasonal anchor

### 1.1 There is no NHSN influenza figure for 2023-24

The Franklin et al. 2024 MMWR (73:339, <https://www.cdc.gov/mmwr/volumes/73/wr/mm7315a3.htm>) that anchors the COVID model **contains no influenza or RSV data at all** — I re-opened it to check. It covers SARS-CoV-2 only (cumulative 109.3 per 10,000 resident-weeks, 95% CI 108.9–109.8; weekly 61.4–133.8; hospitalisation 5.8 per 10,000 resident-weeks; 14,811 facilities, 21,046,590 resident-weeks). VERIFIED.

The reason there is no influenza analogue for 2023-24 is the reporting timeline. The CDC NHSN nursing-home dashboard states: *"Influenza and RSV data collection became required on January 1, 2025."* VERIFIED, <https://www.cdc.gov/nhsn/ltc/ltc-report-overview.html>. The dataset metadata says reporting began 6 October 2024 and became mandatory for all three pathogens on 1 January 2025. VERIFIED, <https://data.cdc.gov/api/views/tscn-ryh9>.

So the earliest influenza season with national nursing-home case data is **2024-25, and only from the week ending 12 January 2025**. The first fully covered season is **2025-26**.

### 1.2 The dataset

**Weekly Respiratory Pathogens and Vaccination (RPV) Metrics for Nursing Home Residents by Jurisdiction, NHSN**, dataset id `tscn-ryh9`, <https://data.cdc.gov/resource/tscn-ryh9.json> (metadata at <https://data.cdc.gov/api/views/tscn-ryh9>). Columns include `numres` (total residents), `numresflupostest` (influenza-positive residents that week), `numresfluhosppos` (hospitalised influenza-positive residents), `faccount`, and the vaccination fields. Only CMS-certified active nursing-home reporters are included. Last updated 24 August 2026; latest week 29 March 2026. All numbers below are VERIFIED reads of the `jurisdiction='USA'` rows.

**Definitions (VERIFIED, <https://www.cdc.gov/nhsn/ltc/ltc-report-overview.html>):** a resident is counted if they *tested positive during the week of data collection*; a hospitalisation is counted if the resident was hospitalised during the week and tested positive within the 10 days before admission. These are **test-positive counts, not clinical case definitions** — directly analogous to the COVID anchor.

### 1.3 Weekly rates, 2024-25 (partial season)

Per 10,000 residents per week, computed as `numresflupostest / numres × 10,000` (my arithmetic on VERIFIED counts):

| Week ending | Flu cases/10k | Flu hosp/10k | COVID cases/10k | RSV cases/10k |
|---|---|---|---|---|
| 2025-01-12 | 22.0 | 4.84 | 65.5 | 5.4 |
| 2025-01-19 | 27.6 | 6.04 | 56.4 | 5.4 |
| 2025-01-26 | 33.7 | 7.38 | 52.3 | 6.1 |
| 2025-02-02 | 43.8 | 8.68 | 48.4 | 7.0 |
| **2025-02-09 (peak)** | **43.9** | **9.20** | 43.1 | 5.7 |
| 2025-02-16 | 42.8 | 7.86 | 37.7 | 5.7 |
| 2025-02-23 | 34.1 | 6.85 | 32.5 | 4.4 |
| 2025-03-02 | 29.6 | 6.33 | 29.7 | 3.9 |
| 2025-03-09 | 21.4 | 3.88 | 27.2 | 3.5 |
| 2025-03-16 | 15.3 | 2.63 | 26.1 | 3.7 |
| 2025-03-23 | 12.2 | 2.35 | 23.3 | 3.1 |
| 2025-03-30 | 8.5 | 1.57 | 22.5 | 2.3 |
| 2025-04-06 | 5.2 | 1.03 | 23.8 | 2.3 |
| 2025-04-13 | 3.5 | 0.59 | 18.7 | 1.7 |
| 2025-04-20 | 2.4 | 0.48 | 18.6 | 1.9 |
| 2025-04-27 | 2.1 | 0.38 | 16.4 | 1.0 |
| 2025-05-04 | 1.0 | 0.21 | 12.9 | 1.0 |

Observed 17-week total, 12 Jan – 4 May 2025: 42,476 cases over 20,624,502 resident-weeks = **20.6 per 10,000 resident-weeks**, i.e. **3.49% of residents reported infected** over 119 days (sum of weekly `cases/numres`). VERIFIED counts, my summation.

### 1.4 Weekly rates, 2025-26 (complete season)

| Week ending | Flu cases/10k | Flu hosp/10k | COVID cases/10k | RSV cases/10k |
|---|---|---|---|---|
| 2025-11-16 | 0.4 | 0.10 | 21.1 | 0.1 |
| 2025-11-23 | 2.4 | 0.31 | 21.2 | 0.2 |
| 2025-11-30 | 2.3 | 0.37 | 21.4 | 0.3 |
| 2025-12-07 | 4.8 | 0.88 | 22.5 | 0.6 |
| 2025-12-14 | 7.1 | 1.55 | 30.5 | 2.1 |
| 2025-12-21 | 14.4 | 2.68 | 36.7 | 1.2 |
| 2025-12-28 | 21.8 | 4.45 | 39.7 | 1.9 |
| 2026-01-04 | 31.1 | 6.08 | 41.6 | 2.2 |
| **2026-01-11 (peak)** | **32.2** | **5.78** | 44.4 | 4.7 |
| 2026-01-18 | 20.8 | 4.13 | 38.2 | 2.8 |
| 2026-01-25 | 17.0 | 2.88 | 32.9 | 2.7 |
| 2026-02-01 | 15.3 | 3.11 | 29.9 | 3.3 |
| 2026-02-08 | 15.7 | 3.38 | 27.6 | 3.5 |
| 2026-02-15 | 14.4 | 2.52 | 26.3 | 4.5 |
| 2026-02-22 | 11.4 | 2.09 | 23.4 | 4.6 |
| 2026-03-01 | 8.0 | 1.90 | 22.6 | 4.5 |
| 2026-03-08 | 6.3 | 1.28 | 19.8 | 4.1 |
| 2026-03-15 | 4.1 | 1.34 | 14.8 | 4.1 |
| 2026-03-22 | 2.8 | 0.77 | 11.9 | 3.4 |
| 2026-03-29 | 1.3 | 0.36 | 12.3 | 2.5 |

(The last two weeks have falling facility counts — 11,015 then 6,743, against ~13,000 earlier — so they are incomplete reporting, not a real census drop. Exclude them.)

**Peak 17-week window, 23 Nov 2025 – 15 Mar 2026** (the maximising 17-week window, i.e. the closest analogue to a 120-day season): 26,336 cases over 19,489,889 resident-weeks = **13.5 per 10,000 resident-weeks**, i.e. **2.29% of residents reported infected**. VERIFIED counts, my summation.

Full season 5 Oct 2025 – 15 Mar 2026 (24 weeks): 26,819 cases, **9.7 per 10,000 resident-weeks**, **2.33% of residents**. Almost all of the season falls inside the 17-week window.

Summer baseline, 1 Jun – 28 Sep 2025 (18 weeks): 1,822 cases, 0.15% cumulative — about 0.08 per 10,000 per week. So the off-season floor is negligible and no baseline subtraction is needed.

### 1.5 How I computed the 120-day anchor, and the 2024-25 correction

2025-26 needs no correction: reporting covered the whole season. **2.29% over 17 weeks.**

2024-25 is truncated — reporting starts 12 January 2025, but the season's rise began in November 2024. To put the two seasons on the same footing I scaled using the national weekly count of confirmed influenza hospital admissions (dataset `ua7e-t2fy`, <https://data.cdc.gov/resource/ua7e-t2fy.csv>, field `totalconfflunewadm`, `jurisdiction='USA'`; VERIFIED read) as the shape of the season:

- National flu admissions, weeks ending 5 Oct 2024 – 11 Jan 2025: 148,049.
- Weeks ending 18 Jan – 3 May 2025: 391,489.
- So 27.4% of the Oct–Apr national burden fell before NHSN resident reporting began.
- Scaling the observed 3.52% (12 Jan – 31 May) by 1.275 gives a **full-season 2024-25 reported figure of about 4.5%**. INFERRED.
- Scaling the observed 3.49% to the *maximising* 17-week window (29 Dec 2024 – 20 Apr 2025, ratio 1.147) gives **about 4.0% over 120 days**. INFERRED.

**Recommendation.** Anchor the reported-infection share to **2.3% of residents over 120 days as the central value, with 4.0% as the high (bad season) and 2.3% as the low.** This is an eight-fold lower anchor than the COVID one (18.7%). Both seasons were H3N2-or-mixed seasons of ordinary-to-high national severity (2024-25 was a high-severity season; 2025-26 was dominated by drifted A(H3N2) subclade K, 88% of subtyped influenza A, 93% subclade K — VERIFIED, MMWR 75(9), <https://cdc.gov/mmwr/volumes/75/wr/mm7509a2.htm>), so neither is an outlier low season.

### 1.6 Completeness of reporting and under-ascertainment

Reporting *coverage* is high: about 13,000–14,000 facilities each week, essentially the whole CMS-certified sector, and mandatory since 1 January 2025. VERIFIED. So the gap is not facility non-reporting, it is **testing**.

What I could verify about the size of the gap:

- **Hospitalisation under-detection by age**, Reed et al. 2015, PLoS ONE, <https://doaj.org/article/e35fb8bca3ac40798925d078b924121c>. VERIFIED: correction factors for under-detection of influenza-associated hospitalisations in 2010-11 were *"2.1 (95%CI 1.7-2.9) for age < 18 years"*, *"3.1 (2.4-4.5) for ages 18-64 years"* and *"5.2 (95%CI 3.8-8.3) for age 65+"*. These are hospital-based, and hospitalised patients are tested more than nursing-home residents with mild illness, so 5.2× is a plausible **lower** bound on under-ascertainment of mild resident infection.
- **Testing is discretionary and threshold-dependent.** Temte et al. 2023, JAMDA (abstract at <https://www.annfammed.org/content/21/Supplement_1/3607>) randomised 20 Wisconsin LTCFs over three pre-COVID seasons to low-threshold, nurse-initiated on-site rapid influenza testing versus usual practice. VERIFIED: oseltamivir prophylaxis 2.6 vs 1.9 courses per 1,000 person-weeks (rate ratio 1.38, 95% CI 1.24–1.54, p<0.001); ED visits 7.6 vs 9.8 per 1,000 person-weeks (RR 0.78, 0.64–0.92); hospitalisations 8.6 vs 11.0 (RR 0.79, 0.67–0.93); length of stay 35.6 vs 55.5 days (RR 0.64, p<0.001). The trial did not publish a case-detection ratio in the abstract, but the fact that merely lowering the testing threshold changed prophylaxis and hospitalisation shows detection under usual practice is incomplete.
- **Asymptomatic infection is essentially never captured.** Nursing homes test residents with symptoms; the asymptomatic fraction (§7) is therefore invisible to NHSN except during an outbreak with facility-wide testing.
- **No published under-ascertainment multiplier specific to influenza in US nursing homes was found.** This is a real gap.

**Recommendation (INFERRED).** Treat the NHSN figure as the *reported* share and use a multiplier of **3× (range 2–5×)** to get all infections: **about 8% of residents truly infected over 120 days, range 5–15%**. The multiplier is lower than one might use for the community because outbreak protocols force testing once two laboratory-confirmed cases occur on a unit within 72 hours (CDC, §7.4), but higher than 1 because mild and asymptomatic infections outside outbreak periods are not tested.

### 1.7 Independent per-season estimates (not per-outbreak)

- **Enserink et al. 2011**, J Am Geriatr Soc 59(12):2301-2305, <https://researchinformation.umcutrecht.nl/en/publications/absence-of-influenza-ah1n1-during-seasonal-and-pandemic-seasons-i/> (abstract). VERIFIED: in a Dutch sentinel nursing-home surveillance network, the 2008/09 season peaked in week 3 of 2009 at *"158 cases per 10,000 resident weeks"*, with a mean epidemic-period incidence of *"73 cases per 10,000 resident weeks"*. These are **influenza-like illness**, not laboratory-confirmed influenza, so they are 3–7× the NHSN laboratory-confirmed rate — consistent in magnitude with a syndromic:confirmed ratio of a few. Also VERIFIED: higher staff vaccination coverage was associated with lower resident ILI incidence, incidence rate ratio 0.3 (95% CI 0.1–0.8).
- **Deguchi et al. 2000**, as tabulated by Childs et al. 2019, BMC Geriatrics 19:210, <https://link.springer.com/content/pdf/10.1186/s12877-019-1236-6.pdf> (opened). VERIFIED: a non-outbreak Japanese LTCF cohort, Nov 1998 – Mar 1999, RCT control group, 694 of 11,723 *unvaccinated* residents infected = **5.9% per season**. This is the single best independent per-season, all-facility figure I could verify, and it sits exactly where the NHSN figure plus a modest under-ascertainment multiplier puts it.
- Childs et al. also tabulate two US outbreak investigations (CDC 1983: 23/27 = 85.2%; Horman 1986: 20.3% or 47.4% depending on case definition). VERIFIED. These are per-outbreak, not per-season, and consistent with Lansbury's median 33%.
- Childs et al. state outright: *"No literature was identified on the outcomes or costs of developing a respiratory infection in LTCFs."* VERIFIED. The per-season literature is thin.
- **Share of facilities with an outbreak per season.** No US national figure found. Minnesota DH annual summary 2024-25, <https://www.health.mn.gov/diseases/flu/stats/2024summary.pdf> (opened). VERIFIED: **135 LTC outbreaks this season, against 101 last season (2023-24)**. The denominator (number of reporting LTC facilities, which in Minnesota includes assisted living, not just nursing homes) is not given in the document, so I cannot convert this to a percentage. Minnesota has on the order of 350 nursing homes plus a larger number of assisted-living settings, so 135 outbreaks is plausibly 15–30% of nursing homes per season — INFERRED and weak.
- **The Clinical Microbiology and Infection 2026 scoping review** ("The impact of respiratory viruses on older adults in long-term care facilities", doi 10.1016/j.cmi.2025.11.002, <https://pubmed.ncbi.nlm.nih.gov/41237896/>) confirms that most LTCF respiratory-virus studies report per-outbreak attack rates; its abstract gives no influenza incidence numbers. VERIFIED (abstract).

**Calibration targets to keep from `transmission.md`:** Lansbury 2017 per-outbreak resident attack rate median 33% (4–94%), staff 23% (3–58%), resident case-fatality median 6.5%. Those remain the right *conditional-on-outbreak* targets. The new NHSN number is the *unconditional, all-facility* target, and the model must hit both: most facility-seasons with few or no cases, a minority with a 30%+ outbreak.

---

## 2. Hospitalisation among residents with a reported infection

Computed from the same NHSN dataset (`numresfluhosppos / numresflupostest`, both VERIFIED counts; the ratio is my arithmetic):

| Season | Window | Reported cases | Hospitalised | Share |
|---|---|---|---|---|
| 2025-26 | 5 Oct 2025 – 15 Mar 2026 | 26,819 | 5,228 | **19.5%** |
| 2024-25 | 12 Jan – 31 May 2025 | 42,825 | 8,623 | **20.1%** |

Remarkably stable across two seasons: **about 20% of nursing-home residents with a laboratory-confirmed influenza infection are hospitalised**, or 2.6–4.2 hospitalisations per 10,000 resident-weeks at the 17-week-season level.

For comparison, the COVID figure from the same dataset structure (Franklin 2024) is 5.8 hospitalisations per 10,000 resident-weeks against 109.3 infections = 5.3%. **Influenza looks roughly four times more likely to lead to hospitalisation per reported case than SARS-CoV-2 did in 2023-24.** Part of this is almost certainly differential ascertainment — far more mild/asymptomatic COVID cases were caught by routine testing — so do not read it as a pure severity ratio. INFERRED caution.

Note the NHSN hospitalisation definition counts a positive test within 10 days *before* admission, so some of these are "hospitalised with influenza" rather than "for influenza".

Case fatality: NHSN has no death field for influenza in this dataset. Keep Lansbury 2017's per-outbreak resident case-fatality median **6.5%** (VERIFIED in `transmission.md`). No newer NHSN-based figure found.

High-dose vaccine and hospitalisation, **Gravenstein et al. 2017**, Lancet Respir Med, summary at <https://www.brown.edu/news/2017-07-20/flu> (opened). VERIFIED (secondary): cluster-randomised across 823 US nursing homes (409 high-dose, 414 standard-dose) and more than 38,000 residents in 2013-14; respiratory hospitalisation 3.4% (high-dose) vs 3.8% (standard-dose) over six months, a 12.7% relative reduction; all-cause hospitalisation also lower, number needed to treat 69. Useful as an all-cause-hospitalisation scale check: ~3.5% of residents per season have a respiratory hospitalisation from all causes.

---

## 3. Importation by staff

### 3.1 Infection incidence in healthcare workers per season

**Kuster et al. 2011**, PLoS ONE 6(10):e26239, <https://doaj.org/article/d150d0f32c4e48e48714b2021e6fdb8b> (abstract opened) and <https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0026239> (full text opened; Tables 1–2 are images and were not readable). VERIFIED, rates per 100 HCWs per influenza season:

| Group | All infections (serology-defined) | Symptomatic infections |
|---|---|---|
| Unvaccinated HCWs | **18.7** (95% CI 15.8–22.1) | **7.5** (4.9–11.7) |
| Vaccinated HCWs | **6.5** (4.6–9.1) | **4.8** (3.2–7.2) |

Definitions, VERIFIED from the full text: "all infection" = *"a four-fold or greater rise in antibody titer over the influenza season"*, regardless of symptoms; "symptomatic infection" = influenza-like illness plus PCR, culture or a four-fold titre rise. 29 studies in total; for non-healthcare adults, 14 studies covering 39 seasons and 41,230 participants. One readable comparison figure: vaccinated working adults, all infections, **1.2% per season (95% CI 0.9–1.7%)** — the low end of the range; and 24.2% (15.1–38.9%) for unvaccinated adults *with exposure to children*. The healthy-adult table rows were not readable.

Note the **internal oddity in Kuster's abstract**: the incidence rate ratio for vaccinated HCWs vs healthy adults (5.4, 2.8–8.0) is *larger* than for unvaccinated HCWs (3.4, 1.2–5.7), which is not interpretable at face value. Use the incidence rates, not the IRRs.

**Bénet et al. 2021**, Clin Infect Dis 72(9):e311-e318, <https://busqueda.bvsalud.org/portal/resource/es/mdl-32750120> (abstract opened). VERIFIED: 289 HCWs enrolled, 278 (96%) completed follow-up, 2016-17 season; *"Cumulative influenza incidence was 22.3% (95% confidence interval [CI]: 17.4%-27.2%)"*; 62 HCWs had evidence of influenza; **46.8% of cases were asymptomatic** (cumulative incidence 5.8%), 41.9% paucisymptomatic (13.7%), 11.3% symptomatic (2.9%). This is a single-season, single-network French hospital cohort, but it is the best prospective per-season HCW figure I found and it sits at the top of Kuster's range.

### 3.2 Vaccination coverage in US nursing-home staff

- **Bell et al. 2026**, MMWR 75(15):195-201, <https://www.cdc.gov/mmwr/volumes/75/wr/mm7515a1.htm> (opened). VERIFIED, 2024-25 season, 1 Oct 2024 – 31 Mar 2025, 13,299 nursing homes in all 50 states and DC:
  - **HCP influenza coverage 42.1% (95% CI 42.1–42.2)**, 884,353 of 2,099,445; facility median 35.1% (IQR 16.8–63.8); state range 18.2% (Oklahoma) to 91.6% (Maine). Employees 41.4%, licensed independent practitioners 44.2%, students/trainees/volunteers 55.4%.
  - **Resident influenza coverage 61.3% (61.2–61.4)**, 718,156 of 1,171,380; facility median 67.0% (IQR 53.0–78.6); state range 33.0–80.6%. Taken from the week of 30 March 2025.
  - Comparisons: HCP coverage was **45.4% in 2023-24**, against **80.7% for acute-care hospital HCP** in 2023-24, and **75.6%** among adults ≥75 in the general population.
  - Reporting history: HCP influenza vaccination has been required since 2022-23; resident coverage was voluntary from October 2023 and required from January 2025, so 2024-25 is the first season with comprehensive national resident data.
- **2025-26 nursing-home HCP coverage, NHSN**, <https://www.cdc.gov/nhsn/pdfs/Report_State-HCP-flu-Vaccination_SNF508c.pdf> (opened). VERIFIED: skilled nursing facilities, 2025-26 season, **United States all healthcare personnel 40.2% (95% CI 40.2–40.3)**, from 13,749 facilities; employees 39.5%, licensed independent practitioners 43.4%, students/trainees/volunteers 53.1%; state range 15.6% (Oklahoma) to 93.0% (Maine).
- For contrast, hospital HCP in 2025-26: **77.2% (77.2–77.3)**, state range 50.5–95.2%. VERIFIED, <https://www.cdc.gov/nhsn/pdfs/Report_State-HCP-Influenza-Vaccination_2025-2026.pdf>.

So nursing-home staff coverage is about **40%** and falling slightly (45.4% → 42.1% → 40.2% across 2023-24, 2024-25, 2025-26), roughly half the hospital figure.

### 3.3 Vaccine effectiveness in working-age adults

**MMWR 75(9), interim 2025-26**, <https://cdc.gov/mmwr/volumes/75/wr/mm7509a2.htm> (opened). VERIFIED, VE against influenza A:

| Age | Setting | VISION | US Flu VE |
|---|---|---|---|
| 18–64 | outpatient (incl. ED/UC) | 35% (30–39) | 23% (−4 to 43), n.s. |
| 18–64 | hospitalisation | 28% (8–43) | — |
| ≥65 | outpatient | 30% (24–36) | 40% (−2 to 64), n.s. |
| ≥65 | hospitalisation | 31% (20–40) | — |

A(H3N2) predominated (88% of subtyped influenza A; 93% of characterised A(H3N2) was subclade K / J.2.4.1, antigenically drifted from the vaccine virus). A(H1N1)pdm09 VE could not be estimated ("small sample sizes precluded estimation"). Enrollment windows ran to late January / early February 2026.

**MMWR 74(6), interim 2024-25**, <https://www.cdc.gov/mmwr/volumes/74/wr/mm7406a2.htm> (opened). VERIFIED: 18–64 outpatient 37% (16–53) US Flu VE and 56% (53–58) VISION; 18–64 hospitalisation 48% (28–63) IVY and 51% (41–59) VISION; ≥65 outpatient 18% (−69 to 60, n.s.) and 51% (47–54); ≥65 hospitalisation 38% (19–52) and 57% (52–61). Subtypes 52% A(H3N2), 47% A(H1N1)pdm09.

So **working-age VE against medically attended influenza was roughly 35% in 2025-26 and 40–55% in 2024-25**. VE against *any* infection (including asymptomatic) is lower; Kuster's own data imply a crude vaccine effect of 1 − 6.5/18.7 = 65% against seroconversion, which is far higher than modern test-negative estimates and reflects old, well-matched seasons plus healthy-vaccinee bias. INFERRED caution: use 30–40%, not 65%, for staff.

### 3.4 Working while ill

**Chiu et al. 2017**, Am J Infect Control (CDC-authored), <https://stacks.cdc.gov/view/cdc/49562> (opened). VERIFIED, 2014-15 season US HCP survey: *"Overall, 414 (21.6%) HCP reported ILI"* and of those *"183 (41.4%) reported working with ILI"*, for a *"median, 3 days; range, 0–30 days"* worked while ill. Pharmacists (67.2%) and physicians (63.2%) had the highest frequency. Among long-term-care HCP specifically, *"the most common reason was inability to afford lost pay"* — the abstract does not give an LTC-specific presenteeism percentage. The commonest reasons overall were still being able to perform duties and not feeling bad enough to miss work.

No source found for the *delay* before staying home (i.e. how many days of symptomatic shedding occur on site before exclusion). The Chiu median of 3 days worked while ill is the closest thing, and since the symptomatic infectious period is only about 2–3 days (§7), **a median of 3 days worked while ill means the typical presenteeist works through essentially the whole of their infectious period.** INFERRED.

### 3.5 Recommended importation rate

Arithmetic (INFERRED, on VERIFIED inputs). Staff infection incidence weighted by NHSN coverage of 0.41:

- All infections, Kuster: 0.41 × 6.5 + 0.59 × 18.7 = **13.7 per 100 staff per season**.
- Symptomatic only, Kuster: 0.41 × 4.8 + 0.59 × 7.5 = **6.4 per 100 staff per season**.
- All infections, Bénet single-season: **22.3 per 100**.

For 131 staff, and taking the 120-day window to hold about 0.8 of a full season's HCW incidence (the NHSN resident curves show roughly 80–90% of season cases inside the peak 17 weeks — VERIFIED shape, INFERRED apportionment):

| Scenario | Staff infections in 120 d | Days between arrivals |
|---|---|---|
| Symptomatic only (Kuster) | 131 × 0.064 × 0.8 = 6.7 | **18** |
| All infections (Kuster, coverage-weighted) | 131 × 0.137 × 0.8 = 14.4 | **8.4** |
| All infections (Bénet) | 131 × 0.223 × 0.8 = 23.4 | **5.1** |

**Recommendation: one infected staff member arrives on average every 8 days (range 5 to 18 days)** over the 120-day season, i.e. 14–15 importations per season centrally. That is slightly *more* frequent than the COVID model's one per week only in the high scenario; centrally it is slightly less frequent. Model all infections, not just symptomatic ones, because asymptomatic and paucisymptomatic staff (Bénet: 46.8% asymptomatic, 41.9% paucisymptomatic — **89% of infections not frankly symptomatic**) will not be excluded from work at all, and 41.4% of frankly symptomatic HCP work anyway for a median 3 days.

A second, independent anchor on staff-driven importation: Enserink 2011's finding that resident ILI incidence was lower where staff vaccination was higher (IRR 0.3, 0.1–0.8; VERIFIED) implies staff importation is a dominant driver. Compare Wilson et al. 2023 (in `transmission.md`): for COVID the first case was staff in 73% of nursing-home outbreaks.

---

## 4. Virus breathed out: influenza quanta emission

### 4.1 The published estimates

| Estimate | Value (quanta/h) | Activity / population | How derived | Source | Status |
|---|---|---|---|---|---|
| Mikszewski et al. 2022 | **0.035** (10th–90th pct 0.0029–0.42) | resting, oral breathing | viral load × droplet volume × inhalation × c_i | medRxiv preprint, <https://medrxiv.org/content/10.1101/2021.01.26.21250580v1.full.pdf> | V |
| Mikszewski et al. 2022 | **0.17** (0.015–2.1) | standing, speaking | as above | same | V |
| Mikszewski et al. 2022 | **3.0** (0.25–35) | light activity, speaking loudly | as above | same | V |
| Bueno de Mesquita et al. 2020 | **0.17** (95% CI 0.10–0.27) | naturally infected symptomatic population | fine-aerosol RNA shedding ÷ measured RNA-per-quantum | <https://eprints.whiterose.ac.uk/161708/14/ina.12701.pdf> | V |
| Bueno de Mesquita et al. 2020 | **0.11** (0.088–0.12) | EMIT challenge donors who shed into fine aerosol (n=11) | fitted to the 1 observed transmission + modelled ventilation | same | V |
| Bueno de Mesquita et al. 2020 | **0.029** (0.027–0.030) | all 42 infected EMIT donors | as above | same | V |
| Bueno de Mesquita et al. 2020 | **0.21** (0.18–0.24) | sensitivity: if 2 transmissions instead of 1 | as above | same | V |
| Bueno de Mesquita et al. 2020 | **0.03** | typical donor (GM 4.7×10³ RNA copies/h) | direct conversion | same | V |
| Bueno de Mesquita et al. 2020 | **630** | an individual shedding at the maximum observed daily rate | direct conversion | same | V |
| Bueno de Mesquita et al. 2020 | **53** | Moser 1979 airliner outbreak, re-estimated | Wells-Riley back-calculation | same | V |
| Rudnick & Milton 2003 | **79** and **128** | Moser 1979 airliner, at 0.1/h and 0.5/h outdoor air exchange | non-steady-state Wells-Riley on a CO₂-rebreathed-fraction formulation | <https://stacks.cdc.gov/view/cdc/192288/cdc_192288_DS1.pdf> | V |
| Rudnick & Milton 2003 | **15** and **77** | same outbreak, steady-state equation | steady-state Wells-Riley (the authors note this underestimates q) | same | V |
| Rudnick & Milton 2003 | **100** | value used in their worked figure for influenza | illustrative | same | V |
| Knibbs, Morawska & Bell 2012 | **67** (range 15–128) | passenger-car risk model | median of Myatt and Wagner estimates; range from Rudnick & Milton | <https://core-prod.cambridgecore.org/core/services/aop-cambridge-core/content/view/91BBDF895E2506A4A9D2185DFB092481/S0950268811000835a.pdf/the-risk-of-airborne-influenza-transmission-in-passenger-cars.pdf> | V |

**Dose per quantum**, Bueno de Mesquita 2020. VERIFIED: *"σ = 1.4E + 5 RNA copies/quantum (95% CI 9.9E + 4, 1.8E + 5)"*, roughly 1.4×10² focus-forming units per quantum.

### 4.2 Why they differ, and what to use

Three distinct derivations, and they do **not** disagree the way they appear to:

1. **Forward, from shedding measurements** (Mikszewski; Bueno de Mesquita). These give **0.03–0.2 quanta/h for an average infected person**. The two independent routes agree closely: Mikszewski's speaking median is 0.17 q/h and Bueno de Mesquita's estimate for a naturally infected symptomatic population is also **0.17 q/h (0.10–0.27)**. That agreement is not a coincidence — Mikszewski's influenza conversion factor was taken from this very paper: VERIFIED from the Mikszewski preprint, *"A conversion factor of 7.1 x 10-6 quanta RNA copies-1 was selected based on Bueno de Mesquita et al."* So **treat these as one estimate, not two.** The influenza viral load behind Mikszewski is 6.7 log₁₀ RNA copies/mL (SD 0.84) from Hirose et al.; the Mikszewski preprint itself flags that the Hirose title concerns faeces and intestine rather than sputum, which is worth checking before relying on it.
2. **Backward, from the Moser airliner outbreak** (Rudnick & Milton; Knibbs). These give **15–128 q/h**, three orders of magnitude higher. This is a single 1979 event: a grounded Boeing 737, 54 people, no mechanical ventilation, a 4.5-hour delay, 25 of the 29 passengers who stayed aboard became ill. Rudnick & Milton themselves say *"independent confirmation is needed"*. Mikszewski places the airliner value (79 q/h) at the **95th percentile of their light-activity, loud-speaking distribution** and calls the case extreme — VERIFIED. So this is the extreme upper tail of the individual-level distribution, not a population mean.
3. **The individual-level tail from shedding data** reconciles the two: Bueno de Mesquita's maximum-shedding individual gives **630 q/h**, higher than the airliner back-calculation. So the forward and backward methods are consistent once individual variation is allowed.

**Recommendation.** Keep the Mikszewski distribution exactly as `transmission.md` has it (resting 0.035, speaking 0.17, loud speaking 3.0; lognormal, log₁₀ SD 0.84), and treat Bueno de Mesquita's 0.17 (0.10–0.27) as the independent confirmation of the central level rather than a second draw. **Do not add the airliner values as an alternative central case** — they are a 95th-percentile event and the model already generates that tail from the lognormal.

**But raise the dispersion.** The log₁₀ SD of 0.84 comes from the viral-load SD alone and is too narrow. From the lognormal, 0.84 puts the 99.9th percentile of resting emission at roughly 0.035 × 10^(3.09×0.84) ≈ 13 q/h, which cannot reach the 630 q/h that Bueno de Mesquita measured in a real shedder, nor the 53–128 q/h of the airliner. Fitting a lognormal that has median 0.17 (speaking) and puts 630 q/h at about the 99.9th percentile requires log₁₀ SD ≈ 1.2 — the same as SARS-CoV-2. INFERRED. **Offer log₁₀ SD 0.84 as the default and 1.2 as a high-dispersion sensitivity**, and report outcome distributions, not means: at SD 1.2 the top 10% of emitters produce 93% of all quanta (per `transmission.md` §1.7).

**Uncertainty, plainly stated.** The *population central* value is better constrained than I expected: two methods converge on 0.03–0.2 q/h for the average infected person, within a factor of about 6. The *individual* range is about **four orders of magnitude**, from 0.03 q/h for a typical shedder to 630 q/h for the heaviest. For a nursing-home simulation the individual spread is what matters, so the practical uncertainty is 2–4 orders of magnitude, as suspected.

Influenza emission is roughly **15× lower** than SARS-CoV-2 at the same activity in the Mikszewski framework (0.035 vs 0.52 resting). That alone predicts a much smaller influenza epidemic than the COVID one, which is consistent with the eight-fold lower NHSN anchor in §1 — an encouraging internal check.

### 4.3 Estimates I looked for and did not find
- **Dai & Zhao** have an influenza value in some of their work; the 2020/2022 papers I could reach via summaries report only SARS-CoV-2 variant quanta (14–48 ancestral, 312–935 Delta, 725–2,345 Omicron), already recorded in `transmission.md`. **No influenza value verified.**
- **Henriques et al. (CARA/CAiMIRA)** — not reachable in this session, as in the earlier one. CARA's published parameterisation is for SARS-CoV-2; I found no influenza quanta value from it.
- **Buonanno/Stabile/Morawska** have no separate influenza paper; their influenza numbers are the Mikszewski ones.
- **No 2023–2026 influenza quanta estimate was found.** A targeted search returned only Chan et al. 2025 (generation time, no quanta — see §7) and the Lavor 2025 humidity work on SARS-CoV-2. The influenza quanta literature appears to have stopped in 2022.

---

## 5. Aerosol vs close-range / contact

### 5.1 Evidence

- **Cowling et al. 2013**, Nat Commun 4:1935, <https://stacks.cdc.gov/view/cdc/19494/cdc_19494_DS1.pdf> (opened). VERIFIED, and more precisely than `transmission.md` has it: randomised trials of hand hygiene and surgical masks in Hong Kong (275 index cases, 822 contacts) and Bangkok (507 index cases, 1,266 contacts), 2008–2011; households randomised to control, control + hand hygiene, or control + hand hygiene + masks. Under the exemplar scenario assuming 50% reductions in contact and droplet transmission, *"aerosol transmission contributed to 51% of secondary infections in Hong Kong"* and *"42% of secondary infections in Bangkok"*. Varying assumed intervention efficacy from 0% to 100% gave **approximately 25% to 85% in Hong Kong and 25% to 75% in Bangkok**. These are sensitivity ranges, **not credible intervals** — the paper reports no CIs for the aerosol share, and the point estimate depends entirely on an assumed intervention efficacy. The 50% figure is therefore much softer than it looks.
- **Nguyen-Van-Tam et al. 2020**, PLoS Pathogens (EMIT), <https://doaj.org/article/a84db8b9e94443d9ab27387eee6bd4e9> (abstract opened). VERIFIED: 52 seronegative donors challenged intranasally; recipients randomised to intervention (n=40, face shields and hand hygiene, blocking droplet and contact but not aerosol) or control (n=35); four days of exposure. *"One transmitted infection was confirmed by serology in a CR"* — 1/35 in controls, 0/40 in the intervention arm, 1.3% overall against about 16% expected. The authors attribute the difference from the earlier proof-of-concept study (1/12, 8.3%) to *"mechanical building ventilation in the follow-on study"*, *"suggesting a possible role for aerosols"*. **This is weak evidence on the route split** (one event cannot separate routes) but strong evidence that **ventilation suppresses influenza transmission**, which is exactly the lever far-UVC pulls.
- **Bueno de Mesquita 2020** on the same trial: observed attack rate 1/75 (1.33%) was significantly below expectation (P < .001), and they attribute it primarily to room ventilation (inferred ventilation of 6.7 L/s and 1.8 L/s in the low-ventilation proof-of-concept rooms, about 0.57 and 0.15 ACH, versus 12.1 L/s / 1 ACH in the controlled environment). VERIFIED. **A roughly 2–7× ventilation increase coincided with a roughly 6× drop in attack rate** — a real-world elasticity for the far-UVC analogue, though confounded and based on one transmission event.
- **McLean 1957-58 Livermore VA upper-air UV study**, as reported by **Tellier 2006**, Emerg Infect Dis 12(11), <https://www.cdc.gov/eid/article/12/11/pdfs/06-0426.pdf> (opened). VERIFIED (secondary): *"The study group consisted of 209 tuberculous patients"* in the UV-irradiated building against 396 in control buildings; seroconversion to influenza A(H2N2) was **19% in the control group and 18% among personnel, but only 2% in the study group**; Tellier concludes *"this step alone achieved near complete protection"*. This is the single most relevant historical datapoint for this model: **upper-room germicidal UV, acting only on room air, cut influenza seroconversion by about 90% in an institutional setting.** It argues strongly that the far-field room-air route carries most institutional influenza transmission. Caveats: non-randomised, 1950s, 254 nm upper-room rather than 222 nm whole-room, and a TB ward is not a nursing home.
- **Infectious dose by route**, Tellier 2006. VERIFIED (secondary): aerosol *"the 50% human infectious dose (HID50) was 0.6–3.0 TCID50"* (Alford, assuming 60% retention), against *"127–320 TCID50"* by intranasal drops (Douglas). **Influenza is 40–500× more efficient per virion by the aerosol route than by nasal deposition.** Tellier also states that *"many, possibly most, natural influenza infections occur by the aerosol route"* and that he found no study showing large-droplet transmission predominant and aerosol negligible. Note the tension flagged in the Mikszewski preprint: an HID50 of 0.6–3.0 TCID50 is far smaller than the 1.4×10⁵ RNA copies (~140 FFU) per quantum fitted from EMIT, and Mikszewski attributes the gap to the difference between natural inhalation and controlled mouthpiece dosing. VERIFIED that both figures exist and conflict.
- **Nicas & Jones 2009** (already in `transmission.md`): hand contact 31% (27–58%), respirable inhalation 17%, droplet spray 52%, under their base dose-response assumptions; 93% to contact if upper- and lower-respiratory doses are equally infectious. VERIFIED previously. Note this study's respirable share (17%) is the lowest in the literature and is explicitly driven by an unknown dose-response ratio.
- **Hospital air-sampling studies** (Blachere 2009; Lindsley; Bischoff 2013) are the obvious further evidence. I was **unable to retrieve any of those pages in this session** — the fetch tool refused them. They are not verified here. From `transmission.md` they were not previously verified either, so they remain a gap.

### 5.2 Recommendation

The quantity the model needs is the share of transmission that **room-air cleaning cannot reach** = close-range airborne + droplet spray + contact.

The evidence bounds it loosely and in opposite directions:
- Cowling's aerosol share of 50% (sensitivity 25–85%) does not split near from far field, so if half of aerosol transmission is within the exhaled jet, the far-field reachable share is only about 25% and the unreachable share is 75%.
- Nicas & Jones put respirable inhalation at 17%, implying an unreachable share above 80%.
- McLean/Tellier imply the opposite extreme: a room-air intervention cut seroconversion by about 90%, implying an unreachable share near 10%. That cannot be reconciled with Nicas & Jones. The most likely explanation (INFERRED) is that a TB ward in 1957, with long shared-air exposure and little close personal care, sat at the far-field end of the spectrum, whereas a nursing home with intensive hands-on care sits further toward the close-range end.

**Recommendation.** Keep the COVID model's structure and its three scenarios (**25% / 40% / 55% face-to-face**) for influenza, and add influenza-specific notes: the low scenario is supported by McLean, the high by Nicas & Jones. A careful reader would accept **35% to 85% as the range for "share of nursing-home influenza transmission that room-air cleaning cannot reach"**, with about **60%** as the central value once contact and droplet spray are added to close-range aerosol. Because this range is wider for influenza than for SARS-CoV-2 (where fomite transmission is better excluded), the far-UVC effect size for influenza is correspondingly less certain — report it as a scenario axis, not a point estimate.

---

## 6. Far-UVC (222 nm) susceptibility of airborne influenza

**I could not re-open either primary source in this session.** Every attempt to fetch the Welch 2018 paper (Nature, DOAJ record, and a news summary) and the Buonanno 2024 paper was refused by the page-fetch tool. A targeted search for 2019–2026 influenza measurements at 222 nm returned only the same two papers plus the 2022 OC43 coronavirus work already in `far_uvc.md`.

So the entries stand **as previously verified in `far_uvc.md`**, with the explicit caveat that they were not independently confirmed today:

| k (cm²/mJ, base e) | Source | Conditions | Status |
|---|---|---|---|
| **1.8** (95% CI 1.5–2.1) | Welch et al. 2018, Sci Rep 8:2752, <https://www.nature.com/articles/s41598-018-21058-w> | influenza A H1N1 in aerosol, ~55% RH; D95 1.6 mJ/cm² | VERIFIED in `far_uvc.md`, **not re-opened here** |
| **20.06 ± 8.04** | Buonanno et al. 2024, Sci Rep 14:6722, <https://link.springer.com/article/10.1038/s41598-024-57441-z> | influenza A H1N1, benchtop aerosol, k₁ of a two-population fit; D90 0.11 mJ/cm² | VERIFIED in `far_uvc.md`, **not re-opened here** |

Consistency checks I can do without the papers (INFERRED arithmetic):
- Welch's D95 of 1.6 mJ/cm² implies k = ln(20)/1.6 = **1.87 cm²/mJ**, matching the reported 1.8 on a natural-log basis. The 1.8 figure is internally coherent.
- Buonanno's D90 of 0.11 mJ/cm² implies k = 2.303/0.11 = **20.9 cm²/mJ**, matching the reported 20.06. Also internally coherent.

So both numbers are arithmetically self-consistent; they genuinely disagree **eleven-fold**, and they come from the same research group. The most likely explanations (INFERRED, since I could not read the methods today) are the difference between a room-sized rotating-drum aerosol chamber and a benchtop aerosol apparatus, the difference between a single-exponential fit and the sensitive-fraction term of a two-population fit (the same distinction that makes OC43 read as 5.6 single-exponential or 12.4 for the sensitive fraction in Welch 2022), and relative humidity.

**No third 222 nm influenza aerosol measurement exists, and no humidity series for influenza at 222 nm exists.** The only direct far-UVC humidity data remain Angel et al. 2025 for SARS-CoV-2 (k 4.4 at 40% RH, 6.8 at 65% RH — about 55% higher at the higher humidity; VERIFIED in `far_uvc.md`). Winter nursing-home air is dry, which by that analogy pushes k toward the **low** end.

**Recommendation.** Keep **k = 5 cm²/mJ central, 1.8 to 20 as the range** as `far_uvc.md` has it, but change the framing: this is not a parameter with an 11-fold uncertainty band around a known centre, it is **two measurements that disagree and one of them is probably methodologically right for a room**. Since the Welch 2018 value was measured in a room-scale aerosol chamber under conditions closer to a real room, and the Buonanno 2024 figure is a benchtop sensitive-fraction term, I would weight the **low end** more heavily than the geometric mean does: consider **k = 3 (1.8 to 20)** as an alternative default, or make k a scenario axis. The far-UVC benefit for influenza scales almost linearly in k at these doses, so this single disagreement spans an order of magnitude in the headline result and deserves to be visible on the website.

---

## 7. Natural history and immunity

### 7.1 Latent, pre-symptomatic and infectious periods — this upgrades `transmission.md` §2.2 from INFERRED to VERIFIED

**Chan et al. 2025**, "Estimating the generation time for influenza transmission using household data in the United States", Epidemics 50:100815, <https://stacks.cdc.gov/view/cdc/261737/cdc_261737_DS1.pdf> (opened). Data: Respiratory Virus Transmission Network – Sentinel (RVTN-S), a 7-site US case-ascertained household study, 2021-22 and 2022-23 seasons, 200+ PCR-confirmed index cases and their household contacts followed for 10 days. VERIFIED:

- Mean intrinsic generation time **3.2 days (95% CrI 2.9–3.6)**; realised household generation time 2.8 (2.7–3.0).
- Mean intrinsic serial interval **3.2 days (2.8–3.5)**.
- Proportion of transmission **before symptom onset: 16% (95% CrI 7–25%)**, with a range of 3% to 76% across incubation-period scenarios.
- **Latent period 0.9 days (0.2–1.4)**.
- **Pre-symptomatic infectious period 0.7 days (0.2–1.3)**.
- **Symptomatic infectious period 2.0 days (1.7–2.4)**.
- Incubation period was fixed as an input: mean 1.55 d, SD 0.66 d, from Lessler et al. 2009 influenza A.
- Asymptomatic fraction in the households: **7.2% (59 of 820 household members)**.
- Relative infectiousness of asymptomatic infections: **0.57**, from Tsang et al. 2023, with sensitivity analyses at 0.11 and 1.54 (that study's 95% CrI bounds).

This settles three things `transmission.md` listed as INFERRED, and two of them differ from the assumed defaults:

| Parameter | `transmission.md` default (INFERRED) | Chan 2025 (VERIFIED) |
|---|---|---|
| Latent period | 1.0 d (0.5–1.5) | **0.9 d (0.2–1.4)** — confirms |
| Pre-symptomatic infectious period | 0.5 d | **0.7 d (0.2–1.3)** — confirms |
| Symptomatic infectious period | 4.5 d (SD 1.5), 6–7 d in frail residents | **2.0 d (1.7–2.4)** — much shorter |
| Relative infectiousness, asymptomatic | 0.5 | **0.57 (0.11–1.54)** — confirms |

**The infectious-period discrepancy matters.** Carrat 2008's 4.80 days (4.31–5.29) is the duration of detectable *viral shedding* in challenge volunteers; Chan 2025's 2.0 days is the duration over which *transmission actually occurs*, fitted to household data. For a transmission model the latter is the right quantity — shedding tails are largely non-infectious. **Recommendation: use a symptomatic infectious period of 2.0 days (1.7–2.4) for staff and community-type adults, extended to 3–4 days for frail residents** (the extension is INFERRED; Carrat explicitly notes there are no data for the elderly, VERIFIED in `transmission.md`). This shortens the influenza generation time relative to the current defaults and will reduce modelled outbreak size.

Also note that Chan 2025's **16% pre-symptomatic transmission** is far lower than SARS-CoV-2's ~44–51% (He 2020; Manica 2022, both VERIFIED in `transmission.md`). Influenza transmission is more concentrated after symptom onset, which makes symptom-triggered measures (testing, isolation, oseltamivir) relatively more effective for influenza and makes always-on engineering controls like far-UVC relatively *less* dominant than they are for COVID. INFERRED implication.

### 7.2 Asymptomatic fraction in older adults

Still **not verified for older adults.** What exists:
- Chan 2025: 7.2% of household members (all ages, US, 2021-23). VERIFIED.
- Bénet 2021 HCWs: 46.8% of infections asymptomatic, 41.9% paucisymptomatic, only 11.3% frankly symptomatic. VERIFIED.
- Leung 2015 (in `transmission.md`): 16% (13–19%) in outbreak investigations; 65–85% in community serology. VERIFIED.
- Carrat 2008: 66.9% of infected volunteers symptomatic, so about 33% asymptomatic. VERIFIED.

The spread (7% to 85%) is entirely about case definition and ascertainment method: serological studies that count any titre rise find most infections asymptomatic; outbreak investigations that start from symptomatic index cases find few. **No study of asymptomatic influenza specifically in nursing-home residents was found.** `transmission.md`'s defaults (0.20 residents, 0.30 staff) remain INFERRED. Given Bénet's HCW figure, I would raise the staff default to **0.35 (0.20–0.50)** and leave residents at **0.20 (0.07–0.50)**, since frail elderly people more often present atypically rather than silently. Both INFERRED.

### 7.3 Vaccine effectiveness in residents and coverage

- Coverage, VERIFIED: residents **61.3% in 2024-25** (Bell 2026 MMWR, §3.2). From the NHSN dataset, resident influenza coverage in **2025-26 plateaued at 57.3–58.5%** (`pct_numresfluvacc`, USA rows, Jan–Mar 2026) against 61.8–62.8% at the same point in 2025. VERIFIED. HCP **40.2% in 2025-26**, 42.1% in 2024-25, 45.4% in 2023-24.
- VE against infection in residents: still poorly measured. `transmission.md` has Moa 2023 (observational VE 7.2% to 89.8%; adjuvanted trivalent RCT 17% relative reduction) and Ferdinands 2021 waning (8–9%/30 days all adults, 10–11% in ≥65). Both VERIFIED previously.
- **New: a screening-method estimate directly from the NHSN resident data** (my calculation, INFERRED, on VERIFIED counts). Using `numresfluposvacc / numresflupostest` as the proportion of cases vaccinated and `pct_numresfluvacc` as population coverage:

| Season | Cases vaccinated | Coverage | Screening-method VE vs infection | VE vs hospitalisation |
|---|---|---|---|---|
| 2024-25 (12 Jan – 6 Apr) | 21,647 / 41,386 = 52.3% | 62.3% | **34%** | **39%** |
| 2025-26 (23 Nov – 29 Mar) | 13,473 / 26,336 = 51.2% | 57.3% | **22%** | **33%** |

These are crude and confounded (no adjustment for age, frailty, facility, or timing; the screening method is biased by any correlation between vaccination and testing or exposure), but they are reassuringly close to the CDC test-negative estimates for ≥65 (30% in 2025-26, 51% in 2024-25 VISION) and they are the only resident-specific, recent-season, infection-endpoint numbers I could construct. **Use VE against infection in residents = 0.30 (0.10–0.50).**
- **Effective immunity at season start, residents (INFERRED):** coverage 0.58 × VE 0.30 ≈ 0.17, plus a small contribution from prior-season infection and residual cross-reactive immunity ≈ 0.03 → **0.20 (0.10–0.35)**. This is slightly below `transmission.md`'s 0.25 because the 2025-26 vaccine was poorly matched to the circulating drifted subclade K (VERIFIED, MMWR 75(9)) and coverage has fallen. For staff: coverage 0.40 × VE 0.35 ≈ 0.14 → **0.15 (0.08–0.30)**.
- High-dose and adjuvanted vaccines: Gravenstein 2017 gives a 12.7% further relative reduction in respiratory hospitalisation over standard dose in nursing homes (§2, VERIFIED secondary). No high-dose VE-against-infection estimate for residents was found.

### 7.4 Oseltamivir prophylaxis in outbreaks

**CDC guidance** (Interim Guidance for Influenza Outbreak Management in Long-Term Care and Post-Acute Care Facilities, last reviewed 17 September 2024), <https://archive.cdc.gov/www_cdc_gov/flu/hcp/infection-control/ltc-facility-guidance.html> (opened). VERIFIED:
- Outbreak trigger: *"When 2 cases of laboratory-confirmed influenza are identified within 72 hours of each other in residents on the same unit"*, control measures should start as soon as possible.
- Chemoprophylaxis recipients: *"all non-ill residents living on the same unit as the resident with laboratory-confirmed influenza"*, regardless of vaccination status. *"Consideration may be given for extending antiviral chemoprophylaxis to residents on other unaffected units."*
- Duration: oseltamivir *"for a minimum of 2 weeks and continuing for at least 7 days after the last known laboratory-confirmed influenza case"* on affected units.
- Staff: chemoprophylaxis *"may be considered for healthcare personnel, regardless of their influenza vaccination status"* in certain circumstances (poorly matched vaccine, short staffing), used judiciously because of resistance.
- Testing: *"influenza testing should occur when any resident has signs and symptoms that could be due to influenza"*, including outside flu season; negative rapid antigen results should be confirmed by molecular assay. Treatment *"should not wait for laboratory confirmation"*.
- Effectiveness statement: *"While highly effective, antiviral chemoprophylaxis is not 100% effective in preventing influenza illness."* The page lists supporting studies but gives no figures.

**Efficacy evidence.** Peters et al. 2001, J Am Geriatr Soc, abstract at <https://acnpsearch.tweb-dev.unibo.it/singlejournalindex/84149915> (opened). VERIFIED: *"Five hundred forty-eight frail older occupants"* of long-term care facilities, oseltamivir *"once daily for 6 weeks"*; laboratory-confirmed clinical influenza *"placebo 12/272 (4.4%), oseltamivir 1/276 (0.4%)"*, a *"92% reduction in the incidence of laboratory-confirmed clinical influenza compared with placebo"*. Note the control incidence of 4.4% over 6 weeks in vaccinated frail residents — another independent check on §1's magnitude.

**Post-exposure prophylaxis in real outbreaks is less impressive.** van der Sande et al. 2014, Emerging Themes in Epidemiology 11:13, <https://link.springer.com/10.1186/1742-7622-11-13> (opened). VERIFIED: a randomised trial across four influenza seasons in Dutch nursing homes, PEP given *"within 48 hours of onset of symptoms in the index patient"* for 10 days; *"17 outbreaks of influenza in 8 of 42 (19%) nursing homes were recruited"*, 15 randomised (6 oseltamivir, 9 placebo). Influenza-positive among tested participants: *"3/32 (9%) in the oseltamivir and 10/47 (21%) in the placebo group"*; units with influenza-positive secondary ILI were 2/6 (33%) on oseltamivir and 2/9 (22%) on placebo, not statistically significant. The trial was badly underpowered (15 of a planned 60 units). Incidentally VERIFIED: **19% of nursing homes had a recruitable influenza outbreak** over that period — the only facility-level outbreak proportion I could verify, and consistent with my rough Minnesota inference.

**Practice, not guidance.** Temte 2023 (§1.6): oseltamivir prophylaxis ran at **1.9 courses per 1,000 resident-weeks under usual practice and 2.6 under a low-threshold testing protocol** (RR 1.38, 1.24–1.54). VERIFIED. At 1.9 per 1,000 resident-weeks, a 112-resident home over 17 weeks receives about 3.6 prophylaxis courses per season — so facility-wide prophylaxis is **not** routine; it happens in a minority of facility-seasons, in line with the ~19% outbreak proportion.

**Recommendation for the model (INFERRED).** Implement outbreak prophylaxis as a conditional, triggered intervention, not a background parameter: when 2 laboratory-confirmed cases occur in the same unit within 72 hours, apply a susceptibility multiplier of **0.2 (range 0.08–0.8)** to unit residents for 14 days or 7 days past the last case. Central value from Peters (92% efficacy in a controlled trial), widened at the high end because the one randomised real-outbreak trial found no significant effect and because real-world detection, start delay and adherence all degrade it. Note that oseltamivir prophylaxis **competes with far-UVC for the same transmission events**, so a model that includes realistic prophylaxis will show a smaller marginal far-UVC benefit than one that omits it — and a model that omits it overstates the lamps.

---

## 8. What I could not verify

**Could not retrieve at all in this session**
1. **Welch et al. 2018 and Buonanno et al. 2024** — the two 222 nm influenza susceptibility measurements. Every route (Nature, Springer, DOAJ, news summary) was refused by the page-fetch tool. The k values stand as verified in the earlier session, not today. **This is the most important thing to re-check**, because the 11-fold disagreement spans an order of magnitude in the headline far-UVC result.
2. **Hospital air-sampling studies of influenza** (Blachere 2009, Lindsley, Bischoff 2013). Pages were refused. The particle-size distribution of influenza-laden aerosol in healthcare settings is therefore unverified here, and the §5 route split rests on Cowling, Nicas & Jones and McLean alone.
3. **Yan et al. 2018 PNAS** full text (exhaled-breath shedding). Not retrieved. Its numbers enter this file only indirectly, through Bueno de Mesquita's conversion of the same dataset, which I did read.
4. **Kuster 2011 Tables 1–2** (healthy-adult incidence rates by vaccination status). The tables are images in the HTML and were not readable; only the HCW rows are in the abstract. The healthy-adult comparator is therefore incomplete.
5. **Temte 2023 JAMDA full text.** Only the conference abstract was reachable, so the number of residents, tests performed and influenza positives — which would give a direct case-detection ratio — are missing.
6. **PMC generally** (CAPTCHA) and **data.cms.gov** (proxy-refused), so the CMS nursing-home data dictionary and several cohort papers were out of reach.

**Numbers that remain INFERRED with no adequate source**
7. **The under-ascertainment multiplier for influenza in US nursing homes (3×, range 2–5).** No study measures it. Reed 2015's 5.2× is for hospitalisations in ≥65s, which is the wrong setting. **This multiplier directly scales the model's true-infection target, so it is as influential as the NHSN anchor itself and far less defensible.**
8. **The 2024-25 full-season figure (4.0–4.5%)** is my scaling of a truncated series by the national hospital-admissions curve. The scaling assumes nursing-home and national seasonal shapes match, which is approximately but not exactly true (nursing-home epidemics lag and are spikier).
9. **Asymptomatic fraction in nursing-home residents.** No older-adult study found. The 7%–85% literature range is a case-definition artefact, not a measurement of the thing the model needs.
10. **Extension of the symptomatic infectious period for frail residents** (3–4 d vs Chan's 2.0 d). Carrat states explicitly there are no data for the elderly.
11. **The log₁₀ SD 1.2 high-dispersion option for influenza emission** is my reconciliation of the Mikszewski distribution with Bueno de Mesquita's 630 q/h maximum shedder, not a published fit.
12. **The share of US nursing homes with an influenza outbreak per season.** Only two weak anchors: Minnesota's 135 outbreaks in 2024-25 (no denominator published) and van der Sande's 8 of 42 (19%) Dutch nursing homes. No US national figure.
13. **Influenza transmission overdispersion (k)** — still not verified, as in `transmission.md`.
14. **Humidity dependence of k at 222 nm for influenza.** No measurement exists for any pathogen but SARS-CoV-2.
15. **The delay before an ill staff member stays home.** Only Chiu's "median 3 days worked while ill" is verified; there is no distribution of days-from-onset-to-exclusion.

**Conflicts worth flagging on the website**
16. **k for influenza at 222 nm: 1.8 versus 20.06**, same research group, eleven-fold. Unresolved.
17. **Influenza infectious period: 4.8 days of shedding (Carrat) versus 2.0 days of transmission (Chan).** Not a contradiction, but using the former in a transmission model overstates infectiousness by more than a factor of two.
18. **Aerosol HID50 0.6–3.0 TCID50 (Alford) versus ~140 FFU per quantum (Bueno de Mesquita).** Two orders of magnitude apart; Mikszewski attributes it to natural inhalation versus mouthpiece dosing.
19. **Route split: Nicas & Jones (respirable inhalation 17%) versus McLean/Tellier (room-air UV cut seroconversion from 19% to 2%).** These cannot both describe the same setting. The resolution is probably setting-dependent, which means the route split is not a transmissible constant and must stay a scenario axis.
20. **Franklin et al. 2024 MMWR has no influenza data**, contrary to what the task assumed. There is no nursing-home influenza incidence figure for 2023-24 or any earlier season, because reporting only began in October 2024 and became mandatory in January 2025.
