# Transmission parameters for the nursing-home far-UVC simulation

Compiled 2026-11-11. Scope: SARS-CoV-2 (Omicron lineages), influenza A and RSV in a ~200-person nursing home (residents, staff, visitors). Two transmission routes: (A) well-mixed room air (Wells-Riley) and (B) a close-range term that room-level air cleaning barely touches.

**How to read the tags**
- **VERIFIED**: I read the number in the source at the URL given. Some reads were of an abstract, an indexing-site record or a reputable summary page, not the full text. In those cases the citation says so.
- **INFERRED**: my own calculation, a modelling judgement, or a number I recall but could not open in this session. Treat every INFERRED number as a placeholder that needs a source before publication.

**Access caveat.** Many primary sources were unreachable from this session. PubMed Central often returned a CAPTCHA, several publishers refused automated access, and the page-reading tool refused some virology pages outright. The "What I could not verify" section lists every gap. Some well-known numbers (for example the lognormal dispersion of the Lessler 2009 incubation periods) therefore appear only as INFERRED, even though they exist in the literature.

---

## 0. Bottom line (recommended defaults)

| Parameter | SARS-CoV-2 (Omicron) | Influenza A | RSV | Status |
|---|---|---|---|---|
| Quanta emission, resting/oral breathing, median (q/h) | 0.5 (low 0.015, high 18 = 10th–90th pct) | 0.035 (0.003–0.42) | 0.035 (0.003–0.4), no published value | SC2 and flu VERIFIED (Mikszewski preprint). RSV INFERRED (set equal to flu) |
| Quanta emission, speaking, median (q/h) | 2.6 (0.07–88) | 0.17 (0.015–2.1) | 0.17 (0.015–2), no published value | as above |
| Quanta emission, loud speaking / light activity, median (q/h) | 44 (1.3–1,500) | 3.0 (0.25–35) | 3 (0.25–35) | as above |
| log10 SD of emission across individuals | 1.2 | 0.84 | 0.84 (assumed) | VERIFIED / INFERRED for RSV |
| Omicron multiplier on ancestral-strain emission | 1 (range 1–3) | n/a | n/a | INFERRED, see §1.4 |
| Latent period (days, mean) | 2.0 (1–3), gamma SD ~1 | 1.0 (0.5–1.5) | 3.0 (2–4) | INFERRED from verified incubation and shedding data |
| Incubation period (days) | 3.4 mean (2.9–4.0); older adults may be longer | 1.4 median | 4.4 median | VERIFIED |
| Pre-symptomatic infectious period (days) | 1.5 (1–2.5) | 0.5 (0.3–1) | 1.0 (0.5–2) | INFERRED |
| Total infectious period (days) | 7 (5–10) | 5 (4–7; older adults likely longer) | 5 (median, healthy adults); 5–10 for frail elderly | SC2: Jang 2022 VERIFIED (~8 d culture). Flu: Carrat 4.8 d VERIFIED. RSV: Schumer 2026 VERIFIED (5 d) |
| Asymptomatic fraction, residents | 0.20 (0.13–0.30) | 0.20 (0.10–0.35) | 0.20 (0.10–0.40) | SC2 VERIFIED (Sah, elderly 19.7%). Flu and RSV INFERRED |
| Asymptomatic fraction, staff | 0.35 (0.25–0.40) | 0.30 (0.16–0.50) | 0.30 (0.2–0.5) | SC2 VERIFIED (Sah 35.1%; Omicron 32.4–32.5%). Flu partly VERIFIED. RSV INFERRED |
| Relative infectiousness of asymptomatic cases | 0.35 (0.16–0.65) | 0.5 (0.3–1) | 0.5 (0.3–1) | SC2 VERIFIED (risk ratio 0.32, CI 0.16–0.64). Others INFERRED |
| Viral decay in aerosol (/h) | 0.63 (0–7+; strongly RH-dependent, see §6) | 0.44 (0.2–1.5) | 0.6 (0.3–3), no data | SC2 and flu VERIFIED. RSV INFERRED |
| Gravitational deposition (/h) | 0.24 (0.1–1.0) | 0.29 (0.1–1.0) | 0.24 (0.1–1.0) | VERIFIED (Buonanno; Nicas & Jones) |
| Inhalation, resident sedentary (m³/h) | 0.29 (0.29–0.43) | same | same | VERIFIED (EPA EFH, 81+ yr) |
| Inhalation, staff working (m³/h) | 1.0 (0.72–1.56) | same | same | endpoints VERIFIED (EPA light and moderate); central INFERRED |
| Effectively immune at season start, residents | 0.30 (0.15–0.50) | 0.25 (0.10–0.40) | 0.15 (0.05–0.30) | INFERRED from verified VE, coverage and prior-infection data |
| Effectively immune at season start, staff | 0.30 (0.15–0.50) | 0.25 (0.10–0.40) | 0.10 (0.05–0.25) | INFERRED |
| Age susceptibility multiplier (resident vs staff adult) | 1.0 vs 0.68 (or 1:1) | 1:1 | 1:1 | SC2 VERIFIED as cited in Bazant & Bush. Others INFERRED |
| Close-range (route B) excess, as a multiple of room concentration, time-averaged over a care episode at ≤1 m | ~3× in a 40 m³ resident room at 3/h total removal (range 0.1× to 30×); proportionally larger in big rooms | same physics | same physics | INFERRED (see §4; the key uncertainty) |
| Share of airborne-route infections that are close-range in care settings | 0.5 (0.2–0.8) | 0.5 (0.2–0.8) | 0.6 (0.3–0.9) | INFERRED, anchored on Azimi 2021 (~50:50 short:long), Jones 2020, Cowling 2013 |
| Share of all transmission not via air (contact/fomite), not modelled | 0.1 (0.05–0.30) | 0.2 (0.1–0.5) | 0.4 (0.2–0.7) | INFERRED, anchored on Azimi (30% fomite, SC2), Jones (8%), Nicas & Jones (flu 31%+), Hall/Goldmann (RSV contact) |
| Surgical mask, source control (fraction removed) | 0.5 (0.3–0.75) | same | same | VERIFIED range (Brooks MMWR 56%; 77% knotted) |
| Surgical mask, wearer protection | 0.3 (0.07–0.5) | same | same | VERIFIED endpoints (Brooks 7.5%; Coffey 2007 SWPF 1.2 at 5th pct) |
| N95, wearer protection as used | 0.8 (0.7–0.97) | same | same | VERIFIED endpoints (Coffey 2007 un-fit-tested 5th pct SWPF 3.3 → 70%; Rengasamy fit PF 29–156 → 97–99%) |

**Calibration targets for the no-lamp baseline** (detail in §9):
- **SARS-CoV-2:** NHSN incidence 109 per 10,000 resident-weeks in winter 2023–24. Omicron outbreak resident attack rate: median 21% (IQR 5–49%), cumulative 25%. Staff cumulative attack rate 11%. Outbreaks usually last over 6 weeks.
- **Influenza:** outbreak resident attack rate median 33% (4–94%). Staff about 23%.
- **RSV:** outbreak resident attack rate median 24% (7–48%). Outbreaks last about 2–3 weeks.

**Biggest uncertainty.** The route-B multiplier depends on two things: the jet dilution at 0.5–1.5 m, and the fraction of close-contact time spent in the exhaled plume. Jet models and isotropic two-zone models disagree by about two orders of magnitude (§4.3). Make both a scenario axis on the website, not a single hidden number.

---

## 1. Quanta emission rates

### 1.1 Buonanno, Stabile & Morawska 2020, Environment International 141:105794
URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC7211635 (opened)
- Emission is built from sputum viral load, a conversion factor c_i (quanta per RNA copy), inhalation rate and droplet volume. VERIFIED.
- c_i was taken as 0.01–0.1 from SARS-CoV-1 data, with 0.02 in the worked example. Viral load 10⁹ copies/mL in the example. VERIFIED.
- Worked example (speaking during light exercise): 142 q/h. A symptomatic person at rest mostly emits under 1 q/h. Vocalising during light activity can exceed 100 q/h. VERIFIED.
- Removal terms used: decay λ = 0.63/h (half-life 1.1 h) and deposition k = 0.24/h (settling about 1×10⁻⁴ m/s over a 1.5 m source height). VERIFIED.
- Inhalation rates: resting 0.49, standing 0.54, light exercise 1.38, moderate 2.35, heavy 3.30 m³/h. VERIFIED.

### 1.2 Buonanno, Morawska & Stabile 2020, Environment International ("Quantitative assessment of the risk of airborne transmission of SARS-CoV-2 infection: prospective and retrospective applications")
Opened as the medRxiv preprint: https://medrxiv.org/content/medrxiv/early/2020/06/02/2020.06.01.20118984.full.pdf. The published Environment International version (PMC7474922) was blocked by a CAPTCHA.
- Emission is lognormal with **log10 SD = 0.71** for all profiles. VERIFIED.
- Mean log10(ER_q) by profile, VERIFIED:

  | Profile | Mean log10(ER_q) | Median (q/h) |
  |---|---|---|
  | Resting, oral breathing | −0.44 | 0.36 |
  | Heavy activity, oral breathing | 0.39 | 2.4 |
  | Light activity, speaking | 0.69 | 4.9 |
  | Light activity, singing or loud speaking | 1.5 | 31 |

- Viral load log10 mean 8, SD 0.7. VERIFIED. The c_i distribution printed in the preprint looks internally inconsistent (mean 0.025, SD 0.125).
- Back-calculated outbreaks, VERIFIED:
  - Guangzhou restaurant: ER_q ≈ 61 q/h (93rd percentile).
  - Skagit choir: ER_q ≈ 341 q/h (92nd percentile).
- Superspreading events therefore sit in the top ~7–8% of the emission distribution.

### 1.3 Mikszewski, Stabile, Buonanno & Morawska, "The airborne contagiousness of respiratory viruses" (published in Geoscience Frontiers 2022)
Opened as the medRxiv preprint: https://medrxiv.org/content/10.1101/2021.01.26.21250580v1.full.pdf. The published version (PMC8622112) was blocked. Values could differ slightly in print.

ER_q median (10th–90th percentile), q/h, Table 2, VERIFIED:

| Pathogen | Resting, oral breathing | Standing, speaking | Light activity, speaking loudly |
|---|---|---|---|
| SARS-CoV-2 | 0.52 (0.015–18) | 2.6 (0.074–88) | 44 (1.3–1,500) |
| Influenza | 0.035 (0.0029–0.42) | 0.17 (0.015–2.1) | 3.0 (0.25–35) |
| Rhinovirus | 0.21 (0.018–2.4) | 1.0 (0.088–12) | 17 (1.5–200) |
| Measles (reference) | 3.1 | 15 | 260 |

- **log10 SD** equals the viral-load SD: SARS-CoV-2 1.2, influenza 0.84, rhinovirus 0.83. The log10 mean equals log10(median). For SARS-CoV-2 speaking the paper states a log10 mean of 0.41 and SD 1.2. VERIFIED.
- Viral load and conversion factor (Table 1), VERIFIED:
  - SARS-CoV-2: log10 5.6 (SD 1.2) copies/mL, c_i 1.4×10⁻³ quanta/copy.
  - Influenza: 6.7 (0.84), c_i 7.1×10⁻⁶.
- **RSV is explicitly excluded** from the paper. VERIFIED. No published RSV quanta rate was found (see §1.6).
- **SARS-CoV-2 values are for the ancestral strain.** There are no variant-specific numbers. VERIFIED.

### 1.4 Newer work and Omicron
- **Aganovic, Cao, Kurnitski & Wargocki 2023**, Building and Environment 228:109924, https://orbit.dtu.dk/en/publications/new-dose-response-model-and-sars-cov-2-quanta-emission-rates-for-/ (abstract opened).
  - Ancestral-strain average emission: breathing 0.13 q/h, speaking 3.8 q/h. VERIFIED.
  - The paper gives variant multipliers, but I could not see their values.
  - A corrigendum exists (doi 10.1016/j.buildenv.2024.111494) that I did not read.
- **Dai & Zhao 2022**, Building Simulation, doi 10.1007/s12273-022-0952-6, via the summary at https://www.news-medical.net/news/20221103/Ventilation-rates-need-increase-substantially-to-bring-down-Omicron-infection-probability.aspx.
  - Quanta generation ranges: ancestral 14–48, Delta 312–935, Omicron 725–2,345 q/h. VERIFIED (secondary summary).
  - **Caution (INFERRED):** I believe these scale ancestral values by reproduction-number ratios. That mixes immune escape and generation-time effects into "emission", so they would double-count if susceptibility is modelled separately. I do not recommend them as defaults.
- **Lavor et al. 2025**, Environment International, doi 10.1016/j.envint.2025.109379, https://orca.cardiff.ac.uk/176900/3/1-s2.0-S0160412025001308-main.pdf (opened).
  - Speaking emission is about 2× higher at 20% RH than at 90% RH. Coughing is about 10× higher. VERIFIED.
  - Prospective medians 2.8–5.9 q/h. VERIFIED.
  - Back-calculated: restaurant 33 q/h, call centre 149 q/h. VERIFIED.
  - Relevance: winter nursing-home air is dry, which pushes emission toward the high end.
- **Recommendation (INFERRED):** use the Mikszewski SARS-CoV-2 distribution with an Omicron multiplier of 1 (sensitivity range 1–3). Model Omicron's higher transmissibility mainly through low effective immunity (§3), then check against the attack rates in §9.

### 1.5 Bazant & Bush 2021, PNAS 118:e2018995118
URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8092463 (opened)
- Infectiousness of exhaled air C_q (quanta per m³ exhaled), VERIFIED:
  - nasal breathing at rest 1–10
  - oral breathing and whispering 5–40
  - loud speech and singing 100–1,000
  - voiced counting 72
  - Skagit choir 970
  - case-study baseline 30
- Breathing rates: 0.5 m³/h at rest, 0.75 speaking, 1.0 singing. VERIFIED.
- Emission = C_q × Q_b. So at rest 0.5–5 q/h, and speaking about 54 q/h at C_q = 72 (INFERRED arithmetic).
- These are higher than the Mikszewski medians. They were back-calculated from outbreaks, so they describe the upper tail. The authors themselves say the C_q values are likely overestimates because other routes contributed. VERIFIED.
- Relative susceptibility cited: over 65 = 100%, 15–64 = 68%, 0–14 = 23%. VERIFIED, as reported by Bazant & Bush. The original source is believed to be Davies et al. 2020, Nature Medicine, which I did not open.

### 1.6 RSV emission: no published quanta rate found
- No Wells-Riley quanta rate for RSV was found in a targeted search. Mikszewski excluded RSV. VERIFIED.
- **Default (INFERRED):** use the influenza distribution (median 0.17 q/h speaking, log10 SD 0.84), then calibrate the overall level to RSV outbreak attack rates (§9).
- Rationale: adults with RSV, especially older adults, are believed to shed less than infants. The evidence also points to contact and close-range spread being relatively more important (§5).

### 1.7 Overdispersion
- Fraction of total emission produced by the top 10% of emitters, from a lognormal with the stated SD (INFERRED, my calculation):

  | Distribution | log10 SD | Top 10% share | Top 20% share | Mean / median |
  |---|---|---|---|---|
  | Mikszewski SARS-CoV-2 | 1.2 | 93% | 97% | 45 |
  | Mikszewski influenza | 0.84 | 74% | 86% | 6.5 |
  | Buonanno 2020b | 0.71 | 64% | — | 3.8 |

- **Implication for the simulation:** if each infector's emission is drawn once from this distribution, the mean is dominated by rare draws. Most no-lamp runs will show small outbreaks and a few will show large ones. Report distributions of outcomes, not just means.
- **Endo et al. 2020**, Wellcome Open Research 5:67 (abstract record at https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-658966): SARS-CoV-2 offspring dispersion k ≈ 0.1 (95% CrI 0.05–0.2), meaning about 80% of secondary cases come from about 10% of infectors. VERIFIED. This is early 2020, pre-Omicron.
- The emission-based top-10% share (93%) and the transmission-based figure (80% from 10%) are broadly consistent. Transmission is less concentrated than emission because infection probability saturates and contacts are limited. INFERRED.
- Influenza: k is generally reported to be much larger (less overdispersed), but I did not open a source. INFERRED.

---

## 2. Natural history

### 2.1 SARS-CoV-2 (Omicron)
- **Incubation**, VERIFIED:
  - Omicron 3.42 days (95% CI 2.88–3.96), from 5 studies. Delta 4.41, Alpha 5.00.
  - Over-60s 7.43 days (5.75–9.11). This age subgroup is mostly pre-Omicron, so it is not an Omicron-in-elderly estimate.
  - Source: Wu Y et al. 2022, JAMA Netw Open, doi 10.1001/jamanetworkopen.2022.28008, https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2795489
- **Generation time and serial interval**, from Xu X et al. 2023, BMC Medicine 21:374, https://link.springer.com/article/10.1186/s12916-023-03070-8. VERIFIED:
  - BA.1 incubation 3.49 days (3.13–4.86)
  - BA.5 serial interval 2.37 days
  - BA.1 realized generation time 2.99 days
  - Intrinsic generation time 6.84 days (5.72–8.60)
- **Pre-symptomatic transmission**, from Manica et al. 2022, Lancet Reg Health Eur 19:100446 (abstract record at https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-1914781; author names were not on that page). VERIFIED:
  - Reggio Emilia households, January 2022: about 51% (45–56%) of transmission from symptomatic cases happened before symptom onset.
  - Household serial interval 2.38 days.
- **Pre-Omicron infectiousness profile**, from He X et al. 2020, Nature Medicine (https://midasnetwork.us/papers/temporal-dynamics-in-viral-shedding-and-transmissibility-of-covid-19/). VERIFIED: infectiousness peaks on or before symptom onset, and 44% (25–69%) of secondary cases were infected pre-symptomatically.
- **Infectious duration**, from Jang Y et al. 2022, OFID 9(7) (summary at https://www.news-medical.net/news/20221003/The-duration-of-the-infectious-stage-of-individuals-infected-with-the-SARS-CoV-2-Omicron-variant.aspx). VERIFIED: culture positivity lasts about 8 days for Omicron, versus 10 for Delta. The article is internally inconsistent (8 vs 9 days).
- **Asymptomatic fraction**, VERIFIED:
  - Sah et al. 2021, PNAS 118(34), https://midasnetwork.us/papers/asymptomatic-sars-cov-2-infection-a-systematic-review-and-meta-analysis/: 35.1% (30.7–39.9) overall; **elderly 19.7% (12.7–29.4)**; children 46.7%.
  - Shang W et al. 2022, Vaccines 10(7), https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-1917863: Omicron 32.4% (25.3–39.5).
  - von Bartheld & Wang 2024, J Infect Dis 229:155, https://academic.oup.com/jid/article/229/1/155/7270436: Omicron 32.5%.
- **Relative infectiousness of asymptomatic cases.** Buitrago-Garcia et al. 2022, PLoS Med 19:e1003987, https://www.eurekalert.org/news-releases/953374: secondary attack rate risk ratio, asymptomatic vs symptomatic, 0.32 (0.16–0.64). VERIFIED.
- **Suggested distributions (INFERRED):**
  - Latent period: gamma, mean 2.0 d, SD 1.0. This equals incubation 3.4 minus a pre-symptomatic infectious period of about 1.5 d, consistent with half of transmission occurring pre-symptomatically.
  - Pre-symptomatic infectious period: gamma, mean 1.5, SD 0.8.
  - Symptomatic infectious period: gamma, mean 5.5, SD 2.
  - Asymptomatic infectious period: about 6 d in total.
  - Simple time-varying profile: relative infectiousness peaking at symptom onset (or day 2–3 of the infectious period for asymptomatic cases), declining roughly exponentially with a halving time of about 1.5–2 days. Alternatively, use a constant within each stage, with the pre-symptomatic stage at 1.0–1.5× the symptomatic level.

### 2.2 Influenza A
- **Incubation**, Lessler et al. 2009, Lancet Infect Dis 9:291 (summary at https://centerforvaccineethicsandpolicy.net/2009/04/27/incubation-periods-of-acute-respiratory-viral-infections-a-systematic-review). VERIFIED:
  - Influenza A median 1.4 d (1.3–1.5).
  - RSV median 4.4 d (3.9–4.9).
  - The lognormal dispersions (about 1.51 for influenza A and 1.24 for RSV) are recalled, not verified. INFERRED.
- **Challenge studies**, Carrat et al. 2008, Am J Epidemiol 167:775, https://agris.fao.org/search/en/records/64776120bc45d9ecdbc32bc1. VERIFIED:
  - Shedding rises sharply 0.5–1 d after inoculation and peaks on day 2.
  - Mean shedding duration 4.80 d (4.31–5.29).
  - 66.9% of infected volunteers were symptomatic, so about 33% were asymptomatic (that subtraction is mine).
  - The authors note there are no data for the elderly.
- **Asymptomatic fraction**, Leung et al. 2015, Epidemiology 26:862, https://hub.hku.hk/handle/10722/211643. VERIFIED:
  - Outbreak investigations: pooled 16% (13–19%).
  - Community serology studies: 65–85% after adjustment.
  - The spread is driven by definitions of infection and of "symptomatic".
- **Defaults (INFERRED):**
  - Latent period: gamma, mean 1.0 d, SD 0.5.
  - Pre-symptomatic infectious period: 0.5 d.
  - Symptomatic infectious period: mean 4.5 d (SD 1.5), extended to 6–7 d for frail residents.
  - Asymptomatic fraction: 0.2 in residents, 0.3 in staff.
  - Relative infectiousness of asymptomatic cases: 0.5.

### 2.3 RSV
- **Incubation:** 4.4 d median (Lessler 2009). VERIFIED.
- **Challenge study**, Schumer et al. 2026, J Infect Dis, doi 10.1093/infdis/jiag206; 225 experimentally infected adults (summary at https://www.emjreviews.com/microbiology-infectious-diseases/news/rsv-infection-window-defined-by-new-viral-data/). VERIFIED:
  - Infectious virus detectable from about day 3 after exposure, typically cleared by about day 8.
  - Median infectious window about 5 days.
  - RNA median clearance 12 days.
  - These are healthy young adults. Frail older adults are thought to shed longer (INFERRED; not verified here).
- **Defaults (INFERRED):**
  - Latent period: gamma, mean 3.0 d, SD 1.
  - Pre-symptomatic infectious period: 1 d.
  - Symptomatic infectious period: mean 5 d (SD 2), up to 8–10 d for residents.
  - Asymptomatic fraction: about 0.2 (no verified older-adult estimate).
  - Relative infectiousness of asymptomatic cases: 0.5.

---

## 3. Susceptibility modifiers

**SARS-CoV-2 vaccination and prior infection**
- **Nursing-home coverage**, Reses et al. 2024, MMWR 73:1052, https://www.cdc.gov/mmwr/volumes/73/wr/mm7346a2.htm. VERIFIED:
  - Residents, November 2024: 2024–25 COVID-19 vaccine 29.7%, influenza 58.4%, RSV 17.9%.
  - Previous season: COVID-19 24.0%, influenza 68.3%, RSV 6.7%.
  - No staff data were given.
- **Vaccine effectiveness, adults ≥65, 2024–25**, Link-Gelles et al. 2025, MMWR 74:73, https://www.cdc.gov/mmwr/volumes/74/wr/mm7406a1.htm. VERIFIED:
  - Against ED/urgent care visits: 36% at 7–59 days, 34% at 60–119 days.
  - Against hospitalization: 45–46%.
  - These endpoints are more severe than infection. VE against any infection is probably lower and wanes faster (INFERRED).
- **Nursing-home residents, infection endpoint**, Khan et al., OFID poster P-1603 (published 2026), https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12791558/. VERIFIED:
  - Unadjusted VE against infection 69.4% (October 2024 to January 2025).
  - Attack rate 2,736 vs 8,930 per 100,000.
  - Authors are Pfizer employees. Unadjusted estimates are prone to healthy-vaccinee and testing biases.
- **Prior infection**, COVID-19 Forecasting Team 2023, Lancet, https://www.healthdata.org/node/10346. VERIFIED:
  - Protection against Omicron BA.1 reinfection: 45.3% pooled, falling to 36.1% at 40 weeks.
  - Protection against severe disease about 89%.
- **Season-start effective immunity (INFERRED):** residents 0.30 (0.15–0.50), staff 0.30 (0.15–0.50).
  - Reasoning: nearly everyone has hybrid immunity, but protection against infection is roughly 30–50% and wanes over months. Recent vaccinees (~30%) contribute an extra 30–60% for 2–4 months.
  - Implement as leaky multipliers if the code allows; that is more realistic than all-or-nothing immunity.

**Influenza**
- **Older adults in aged care**, Moa et al. 2023, Hum Vaccin Immunother, doi 10.1080/21645515.2023.2271304, https://library.kab.ac.ug/Record/doaj-art-5f8ef2842ba445f9ab99d16ab2898e5c/Description. VERIFIED:
  - Observational VE against laboratory-confirmed influenza ranged from 7.2% to 89.8%.
  - In an RCT, the adjuvanted trivalent vaccine gave a 17% relative reduction.
- **Waning**, Ferdinands et al. 2021, Clin Infect Dis, doi 10.1093/cid/ciab045 (summary at https://www.healio.com/news/infectious-disease/20210209/flu-vaccine-effectiveness-declines-around-10-per-month-following-shot). VERIFIED: VE falls about 8–9% per 30 days in all adults and about 10–11% in adults ≥65.
- **Defaults (INFERRED):**
  - Resident VE against infection 0.3 (0.1–0.5) × coverage 0.6, plus about 0.1 from prior immunity, gives 0.25 effectively immune.
  - Staff: similar. Staff coverage was not verified in this session.

**RSV**
- **Vaccine efficacy (RSVPreF3 OA, AReSVi-006)**, Papi et al. 2023, NEJM 388:595, https://www.mcmasteroptimalaging.org/full-article/PLUS/respiratory-syncytial-virus-prefusion-protein-vaccine-older-adults-108214. VERIFIED:
  - Against RSV lower respiratory tract disease: 82.6%.
  - Against severe disease: 94.1%.
  - Against RSV acute respiratory infection: 71.7% (56.2–82.3).
- **Defaults (INFERRED):** coverage 0.18 × about 0.6 (against infection, waning in later seasons), plus a little prior-season immunity, gives 0.15 for residents. Staff about 0.10.

**Age.** Bazant & Bush cite relative susceptibility of 0.68 for ages 15–64 vs 1.0 for over-65s (SARS-CoV-2). VERIFIED. This is an early-pandemic estimate. It can be offered as an option, defaulting to 1:1.

---

## 4. Near-field vs far-field (route B)

### 4.1 Evidence that close-range airborne exposure dominates at ≤1–2 m
- **Chen, Zhang, Wei, Yen & Li 2020**, Building and Environment 176:106859, https://repository.hku.hk/handle/10722/339958 (abstract) and https://medrxiv.org/content/10.1101/2020.03.16.20037291v1.full-text (preprint full text). VERIFIED:
  - Within 2 m, the short-range airborne route dominates at most distances.
  - Large droplets dominate only within about 0.2 m when talking and about 0.5 m when coughing.
  - Beyond 0.3 m, large droplets contribute under 10% of exposure.
  - Talking exposure falls close to zero by about 0.3 m in their (droplet-tracking) metric. This mainly reflects jet dilution.
- **Zhang N et al. 2020**, Indoor Air 30:645, https://pesquisa.bvsalud.org/ses/resource/pt/mdl-32259319. VERIFIED (qualitative):
  - The authors argue short-range airborne may be the most common sub-route of close contact.
  - They note there are few high-resolution data for quantifying it.
- **Jia, Wei, Cheng, Wang & Li 2022**, Building and Environment 219:109166, https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-1837424 (abstract only; the full text was blocked). VERIFIED:
  - Two-stage jet model.
  - Threshold distances beyond which extra distance gains little: 0.59 m (sedentary), 1.1 m (light), 1.7 m (moderate), 2.6 m (intense activity).
  - Matching threshold ventilation rates: 8, 20, 43 and 83 L/s per person.
  - Beyond these, both distance and ventilation show diminishing returns.
  - Implication: a seated resident speaking quietly has a near-field "bubble" of roughly 0.6 m, an aide doing physical work about 1.1 m.
- **Cortellessa et al. 2021**, Science of the Total Environment (arXiv 2104.10934), https://arxiv.org/abs/2104.10934v1 (abstract). VERIFIED:
  - For a speaking emitter, large droplets dominate under 0.6 m.
  - Distances needed to keep risk under 0.1%: about 0.75 m for a 10 s exposure, 1 m for 1 minute, 1.5 m for 15 minutes.
- **Bazant & Bush 2021** (URL above). VERIFIED:
  - Jet entrainment coefficient about 0.1–0.15.
  - Speech jets fall to about 3% of their initial concentration at 2 m.
  - At 6 ft, the jet can be about 30× the well-mixed concentration (they suggest a correction factor of 3–300).
  - Masks largely remove the jet hazard.

### 4.2 Two modelling options (all equations and numbers INFERRED unless marked)

**Option 1: jet dilution model (recommended)**
- Close-range concentration seen by a receiver at distance x who is in the plume:

  C_B(x) = C_room + (C_exh − C_room) / S(x),  where C_exh = ER_q / Q_b (quanta per m³ of exhaled air).

- **Dilution S(x):** Bazant's "about 3% at 2 m" gives S(2 m) ≈ 33. With jet concentration falling roughly as 1/x beyond about 0.2 m, S(x) ≈ 16·x (x in metres): about 8 at 0.5 m, 17 at 1 m, 25 at 1.5 m.
  - This is INFERRED from the VERIFIED 3%-at-2-m figure. CARA/CAiMIRA (CERN), built on Jia 2022, has a published S(x) formula I could not open.
- **Ratio of in-plume excess to room concentration** = V·λ / (Q_b·S). With Q_b = 0.5 m³/h:

  | Room | Volume (m³) | Total removal λ (/h) | Excess at 0.5 m | Excess at 1 m | Excess at 2 m |
  |---|---|---|---|---|---|
  | Resident room | 40 | 3 | 30× | 14× | 7× |
  | Dining or day room | 300 | 3 | 225× | 106× | 55× |

- **Orientation weighting.** The receiver is not in the plume all the time. Multiply the excess by a facing or in-plume fraction f.
  - Personal care such as feeding or washing: f ≈ 0.2–0.5.
  - Side-by-side at a table: f ≈ 0.05–0.2.
  - Mizukoshi et al. used a facing probability of 0.013 for nurse-patient care (VERIFIED, see below), which is much lower.
  - Time-averaged route-B excess in a resident room at 1 m: about 14 × 0.2 ≈ 3× room concentration (range 0.2–15×).
- **Key property:** the jet excess does not depend on room ventilation, far-UVC, HEPA or V. So as room air cleaning improves, the close-range share of infections rises. That is the mechanism by which far-UVC benefit is capped.
- **How far-UVC affects route B (INFERRED):** air travels 1 m in the jet in roughly 1–10 s. At a typical far-UVC equivalent of about 10–30 air changes per hour, inactivation in that time is below 5%. So route B should be reduced by at most a few percent, plus the reduction of the C_room component that sits inside C_B.

**Option 2: Nicas two-zone model**
- C_NF = C_FF + G/β, with C_FF = G/(V·λ) and β = ½ × free surface area × random air speed s.
  - The equations are standard occupational-hygiene practice. I did not open a primary Nicas paper (INFERRED).
  - Arnold, Shao & Ramachandran 2017, J Occup Environ Hyg (abstract at https://read.qxmd.com/read/28609192/evaluation-of-the-well-mixed-room-and-near-field-far-field-models-in-occupational-settings) field-evaluated the NF-FF model. VERIFIED that the evaluation exists. I did not see its numbers.
- Near-field excess over far-field = V·λ/β:

  | Near-field radius r | Air speed s | β | Resident room (40 m³, 3/h) | Large room (300 m³, 3/h) |
  |---|---|---|---|---|
  | 1 m (sphere) | 0.05 m/s | ~1,130 m³/h | 0.11× | 0.8× |
  | 0.5 m | 0.05 m/s | ~280 m³/h | 0.42× | 3.2× |
  | 1 m | 0.2 m/s | — | 0.03× | — |

- The isotropic two-zone model therefore predicts a far smaller close-range excess than the jet model. It ignores the directed exhaled jet.
- **Delmaar, Vermeulen & Schijven 2025**, Indoor Air 2025:5571740, https://research-portal.uu.nl/en/publications/modelling-near-field-aerosol-exposure-for-respiratory-infection-r/ (abstract). VERIFIED:
  - They compared multizone, diffusion and jet models for QMRA.
  - **Diffusion models were judged most suitable.** Multizone models are hard to parameterise because of arbitrary choices. Jet models are complex.
  - The full text, with its eddy-diffusion parameters, was not accessible. **This is the first paper to obtain for parameterising route B.**

### 4.3 Share of infections that are close-range

| Study | Setting | Short-range or close contact | Long-range or room air | Contact / fomite / droplet | Status |
|---|---|---|---|---|---|
| Azimi et al. 2021, PNAS 118(8) | Diamond Princess cruise ship | ~35% | ~35% | fomite ~30%; aerosols under ~10 µm > 50% of all transmission | VERIFIED |
| Jones 2020, J Occup Environ Hyg | Healthcare workers giving patient care, no PPE | inhalation 57% (near + far combined) | — | droplet spray 35%, direct contact 8% | VERIFIED (summary) |
| Mizukoshi et al. 2020, Env Int 147:106338 | Care setting: 0.6 m contact, 22.7 m³ room, 2 ACH | short-range inspirable 4–10% | 5–27% by saliva load | droplet spray and contact make up the remainder | VERIFIED |
| Cowling et al. 2013, Nat Commun 4:1935 | Influenza A in households | — | — | aerosol ≈ 50% of all transmission (did not split short vs long range) | VERIFIED |
| Public Health Ontario 2022 evidence review | SARS-CoV-2, all settings | — | — | concludes the short/long split "cannot be generalized" | VERIFIED |

Further details on the table rows:
- **Azimi:** https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-1066038 and https://www.scimex.org/newsfeed/airborne-transmission-played-an-important-role-in-the-diamond-princess-covid-19-outbreak. The 35:35 split was over the whole outbreak. Droplets were 41% and aerosols 59% in a separate breakdown.
- **Jones:** doi 10.1080/15459624.2020.1784427, summary at https://depts.washington.edu/pandemicalliance/2020/07/10/relative-contributions-of-transmission-routes-for-covid-19-among-healthcare-personnel-providing-patient-care/. The NF/FF split within inhalation was not visible to me.
- **Mizukoshi:** https://pmc.ncbi.nlm.nih.gov/articles/PMC7758024. Long-range respirable 5% at 10⁷ PFU/mL saliva and 18–27% at 10⁸. Droplet spray and contact dominated in their parameterisation.
- **Cowling:** https://ideas.repec.org/a/nat/natcom/v4y2013i1d10.1038_ncomms2922.html.
- **Public Health Ontario:** https://www.publichealthontario.ca/-/media/Documents/nCoV/phm/2022/01/covid-19-respiratory-transmission-range.pdf. It also reports nursing-home outbreaks attributed to long-range spread (§9).

**Recommendation (INFERRED).** Do not hard-code a share. Hard-code the physics (Option 1 with orientation weighting, Option 2 as an alternative) and report the emergent share. Expect a no-lamp share of about 0.5 (plausible range 0.2–0.8) for SARS-CoV-2 and influenza, and higher for RSV. Run three published scenarios:

| Scenario | Close-range share | Settings |
|---|---|---|
| Low | ~20% | two-zone model, or jet with f = 0.05 |
| Central | ~50% | jet with S(1 m) ≈ 17 and f ≈ 0.2 for care, 0.1 at meals |
| High | ~80% | jet with f ≈ 0.5 and longer care contacts |

---

## 5. Fomite and contact share (not modelled)

- **SARS-CoV-2**
  - CDC Science Brief, April 2021, https://archive.cdc.gov/www_cdc_gov/coronavirus/2019-ncov/more/science-and-research/surface-transmission.html. VERIFIED: QMRA studies put the risk per contact with a contaminated surface generally below 1 in 10,000, and surface transmission is not the main route.
  - The Azimi model attributed about 30% to fomites on a cruise ship (VERIFIED), which is likely high for a nursing home.
  - Jones 2020: direct contact 8% (VERIFIED).
  - **Default omitted share (INFERRED): 0.10 (0.05–0.30).**
- **Influenza**
  - Nicas & Jones 2009, Risk Analysis 29:1292, https://stacks.cdc.gov/view/cdc/188458/cdc_188458_DS1.pdf. VERIFIED:
    - Hand contact 31% (range 27–58%) under their base dose-response assumptions, or 93% if upper- and lower-respiratory doses are equally infectious.
    - Respirable inhalation 17%, droplet spray 52%.
    - The authors show the answer depends mostly on an unknown dose-response ratio.
  - Cowling 2013: aerosol about 50% (VERIFIED), leaving about 50% for droplet spray plus contact.
  - **Default omitted share (INFERRED): 0.2 (0.1–0.5).**
- **RSV**
  - Goldmann 2001, Emerg Infect Dis 7(2), https://wwwnc.cdc.gov/eid/article/7/2/70-0249, summarising Hall & Douglas 1981. VERIFIED:
    - Cuddlers (giving care): 5 of 7 infected.
    - Touchers (handling contaminated objects): 4 of 10.
    - Sitters (3 h near the crib without touching anything): 0 of 14.
    - Contact is described as the dominant hospital route.
  - Caveat: Goldmann says the sitters were beside the crib. My recollection of the original is that they sat more than 6 ft away. Check the primary source.
  - Kulkarni 2016 (Clin Infect Dis) reported RSV in aerosols near infants. I could not open it.
  - The evidence is infant-centred. Adult-to-adult RSV routes in nursing homes are poorly characterised.
  - **Default omitted share (INFERRED): 0.4 (0.2–0.7).**
- **Norovirus** (not modelled; state this on the website)
  - Calderwood et al. 2022, Clin Infect Dis 74:113, https://stacks.cdc.gov/view/cdc/116017/cdc_116017_DS1.pdf. VERIFIED:
    - 60.9% of reported US norovirus outbreaks (2009–2018) were in long-term care facilities.
    - 90.4% were person-to-person.
    - Median attack rate: residents 29.0%, staff 10.9%.
    - Median duration 10 days.
    - 2.3 deaths per 1,000 cases.
  - Spread is mainly faecal-oral and via vomitus. Airborne far-UVC would have little expected effect, so a real study's all-cause infection endpoint will be diluted by norovirus. INFERRED.

---

## 6. Other physical removal terms

- **SARS-CoV-2 aerosol decay**
  - 0.63/h, from a 1.1 h half-life (van Doremalen et al. 2020, NEJM 382:1564; half-life as reported by https://www.2minutemedicine.com/initial-data-on-the-viability-of-sars-cov-2-in-aerosol-and-on-surfaces/, and used by Buonanno). VERIFIED.
  - Bazant & Bush: λ_v ≈ 0.6 × RH (/h, RH as a fraction), bounded 0–0.63/h, with 0.3/h used for Skagit. VERIFIED.
  - Conflicting evidence: Oswin et al. 2022 (PNAS, doi 10.1073/pnas.2200109119) reported much faster early loss of infectivity. The press-release title seen in search results says infectivity may fall 90% within 20 minutes of exhalation. I could not open the paper; the page-reading tool refused. If correct, effective decay in the first minutes is above 5/h, and the role of long-range transmission (and of far-UVC) would shrink.
  - **Default 0.63/h. Sensitivity 0.3–7/h.** INFERRED.
- **Influenza aerosol decay:** 0.44/h (7.3×10⁻³/min at 15–40% RH, PR-8 strain; Nicas & Jones 2009). VERIFIED. Influenza survives longer at low RH (INFERRED; not verified here).
- **RSV aerosol decay:** no source opened. **Default 0.6/h, range 0.3–3/h.** INFERRED.
- **Deposition**
  - 0.24/h (Buonanno 2020). VERIFIED.
  - 0.29/h for 3 µm particles (4.9×10⁻³/min; Nicas & Jones 2009). VERIFIED.
  - Bazant: settling depends strongly on size, with a critical radius of 1.3–5.5 µm depending on air-change rate. VERIFIED.
  - **Default 0.24/h, range 0.1–1.0.** INFERRED.
- **Total removal in the model** = ventilation ACH + filtration + decay + deposition + far-UVC equivalent ACH.

---

## 7. Inhalation rates

- **EPA Exposure Factors Handbook, Chapter 6** (2011; highlights document https://19january2021snapshot.epa.gov/sites/static/files/2015-06/documents/efh_highlights_chap6.pdf). VERIFIED, mean (95th percentile):

  | Group | Sedentary/passive | Light | Moderate |
  |---|---|---|---|
  | 81+ yr, m³/min | 4.9×10⁻³ (7.0×10⁻³) | 1.2×10⁻² (1.5×10⁻²) | 2.5×10⁻² |
  | 81+ yr, m³/h | 0.29 (0.42) | 0.72 (0.90) | 1.5 |
  | Adults 31–51 yr, m³/h | — | 0.72–0.78 | 1.6–1.7 |

  Long-term daily rate for 81+: 12.2 m³/day (0.51 m³/h averaged over 24 h).
- **Buonanno:** resting 0.49, standing 0.54, light 1.38 m³/h. VERIFIED.
- **Bazant:** 0.5–1.0 m³/h. VERIFIED.
- **Defaults (INFERRED):**
  - Residents: 0.29 m³/h sedentary; 0.31 m³/h asleep (EPA sleep/nap rate for 81+ is 5.2×10⁻³ m³/min, VERIFIED).
  - Staff working: 1.0 m³/h (0.72–1.56).
  - Visitors: 0.5 m³/h.
- Adams 1993 was not opened.

---

## 8. Masks

- **Brooks et al. 2021**, MMWR 70:254, https://www.cdc.gov/mmwr/volumes/70/wr/mm7007e1.htm. VERIFIED:
  - Source control (cough particles blocked): unknotted medical procedure mask 56.1%, knotted and tucked 77.0%, double mask 85.4%.
  - Receiver exposure reduction with an unknotted medical mask:

    | Who is masked | Reduction |
    |---|---|
    | Receiver only | 7.5% |
    | Source only | 41.3% |
    | Both | 84.3% |

- **Coffey et al. 2007**, J Occup Environ Hyg 4:420, https://stacks.cdc.gov/view/cdc/186230. VERIFIED: 5th-percentile simulated workplace protection factor without fit testing was 3.3 for N95 respirators as a class (≈70% reduction) and 1.2 for surgical masks (≈17%).
- **Rengasamy et al. 2015**, Ann Occup Hyg 59:373, https://stacks.cdc.gov/view/cdc/34632/cdc_34632_DS1.pdf. VERIFIED: fit-tested N95 protection factors, geometric means 29–156 (≈97–99% reduction) in the laboratory.
- **Bazant & Bush** assumed 10% penetration for surgical masks in their nursing-home case study. VERIFIED.
- **Defaults (INFERRED):**
  - Surgical mask: source control 0.5 (0.3–0.75); wearer protection 0.3 (0.07–0.5).
  - N95 as worn in practice (imperfect fit, intermittent use): wearer protection 0.8 (0.7–0.97); source control 0.8 (lower with valves).
  - Apply source control to both routes A and B. Masks are especially effective against the route-B jet (Bazant, VERIFIED).
  - Include a compliance fraction (e.g. 0.5–0.9 of contact time).

---

## 9. Calibration targets

**SARS-CoV-2**
- **NHSN, US nursing homes, October 2023 to February 2024**, Franklin et al. 2024, MMWR 73:339, https://www.cdc.gov/mmwr/volumes/73/wr/mm7315a3.htm. VERIFIED:
  - Cumulative 109.3 infections per 10,000 resident-weeks. Weekly range 61–134.
  - 15–26% of facilities reported at least one infection in a given week.
  - Hospitalization 5.8 per 10,000 resident-weeks.
  - Implied seasonal check (INFERRED): about 1.1% of residents per winter week, so a 200-resident home (~100–120 residents) should see roughly 15–25% of residents infected over about 17 winter weeks. Testing under-ascertains asymptomatic cases.
- **US nursing-home peak in 2023–24:** 7.1 hospitalizations per 10,000 residents per week, and about 5,500 resident cases per week nationally in October 2024 (Reses 2024). VERIFIED.
- **Spain, Omicron period**, Rodríguez Campelo et al. 2023, Bol Epidemiol Sem 31(4):274, https://revista.isciii.es/index.php/bes/article/download/1333/1658. VERIFIED:
  - 206 outbreaks.
  - Cumulative attack rate: residents 25.1%, staff 10.8%.
  - Median resident attack rate 21.1% (IQR 5–49.3).
  - Resident case-fatality 2.7%.
  - The staff median printed in the source is identical to the resident one and may be a typo.
- **UK care homes**, Krutikov et al. 2023, JAMDA, doi 10.1016/j.jamda.2023.10.027, https://discovery.ucl.ac.uk/10183798/1/Krutikov_JAMDA.pdf. VERIFIED, Omicron outbreaks:
  - Mean size 31.2 (SD 24.1): 12.4 residents and 17.8 staff.
  - Mean duration 57.4 days (SD 42.1).
  - Wild-type outbreaks, for comparison: mean duration 29 days.
- **US, Delta vs Omicron**, Wilson et al. 2023, Emerg Infect Dis 29(4) (table at https://wwwnc.cdc.gov/eid/article/29/4/22-1605-t1). VERIFIED, Omicron period:
  - Median 10 residents infected in the first 28 days (IQR 4–20), at a median census of 79.
  - The first case was staff in 73% of outbreaks.
  - 84% of outbreaks lasted more than 42 days.
- **High-attack outbreaks attributed to long-range spread (pre-Omicron)**, Public Health Ontario 2022. VERIFIED:
  - Belgium (Vuylsteke 2021): 78–92% resident attack rate in units that met in one poorly ventilated room, vs 52.5% in a unit that did not.
  - Netherlands: residents 81% (17/21), healthcare workers 50% (17/34).

**Influenza**
- Lansbury, Brown & Nguyen-Van-Tam 2017, Influenza Other Respir Viruses (doi 10.1111/irv.12464), https://core.ac.uk/download/84147596.pdf, summarising 49 outbreaks. VERIFIED:
  - Resident attack rate median 33% (4–94%).
  - Staff 23% (3–58%).
  - Resident case-fatality median 6.5%.

**RSV**
- Osei-Yeboah et al. 2024, Influenza Other Respir Viruses 18:e70008, https://pmc.ncbi.nlm.nih.gov/articles/PMC11405123/. VERIFIED:
  - Resident attack rate median 24% (6.7–47.6%, 7 studies).
  - Annual incidence proportion 0.5–14%.
  - Case-fatality 7.7–23.1%.
- Ferrante, Bancej & Atchessi 2024, CCDR 50(1/2), https://www.canada.ca/en/public-health/services/reports-publications/canada-communicable-disease-report-ccdr/monthly-issue/2024-50/issue-1-2-january-february-2024/disease-burden-attributable-rsv-outbreaks-long-term-care.html. VERIFIED:
  - 4 outbreaks with resident attack rates 12–38%.
  - Duration 13–21 days (mean 17).
  - Staff data are sparse; one outbreak had 0 staff cases.

**Proportion of introductions that become outbreaks.** No verified source was found for any of the three pathogens. A plausible structural check (INFERRED): with k ≈ 0.1 and R in the nursing home near 1–2, most single introductions should fizzle.

**Far-UVC in long-term care (direct comparison)**
- Kristensen et al. 2026, Antimicrob Steward Healthc Epidemiol 6:e165, https://www.cambridge.org/core/product/433F85B6AF94B8EF3097405A3A8C71BA/core-reader. VERIFIED:
  - Design: 12 Danish facilities, 635 residents, November 2024 to April 2025, non-randomized.
  - Far-UVC in common rooms only: adjusted incidence rate ratio 0.12 (0.04–0.34) for hospital-treated infections.
  - Far-UVC in common rooms plus residents' rooms: 0.69 (0.23–2.07).
  - For respiratory infections specifically, the discussion reports IRRs of 0.18 and 0.70.
  - Each arm is a single facility, and the study was funded by the manufacturer. The authors call the results preliminary.
  - The two arms are mutually inconsistent, so the study cannot constrain the route-A/B split. INFERRED.
- PRiVII cluster RCT protocol (NCT05084898; PMC10811883) exists. The protocol and any results were not accessible.

---

## 10. Parameter table

Status column: V = VERIFIED, I = INFERRED.

| Parameter | Pathogen | Low | Central | High | Units | Distribution | Source | Status / notes |
|---|---|---|---|---|---|---|---|---|
| ER_q resting breathing | SC2 | 0.015 | 0.52 | 18 | q/h | lognormal, log10 SD 1.2 | Mikszewski 2021 preprint (GSF 2022), https://medrxiv.org/content/10.1101/2021.01.26.21250580v1.full.pdf | V. Low/high = 10th/90th pct. Ancestral strain |
| ER_q speaking | SC2 | 0.074 | 2.6 | 88 | q/h | lognormal, log10 mean 0.41, SD 1.2 | same | V |
| ER_q loud speaking, light activity | SC2 | 1.3 | 44 | 1,500 | q/h | lognormal, SD 1.2 | same | V |
| ER_q speaking (alternative) | SC2 | — | 4.9 | — | q/h | lognormal, log10 mean 0.69, SD 0.71 | Buonanno, Morawska, Stabile 2020 preprint, https://medrxiv.org/content/medrxiv/early/2020/06/02/2020.06.01.20118984.full.pdf | V |
| ER_q resting breathing | Flu A | 0.0029 | 0.035 | 0.42 | q/h | lognormal, log10 SD 0.84 | Mikszewski | V |
| ER_q speaking | Flu A | 0.015 | 0.17 | 2.1 | q/h | lognormal, SD 0.84 | Mikszewski | V |
| ER_q loud speaking | Flu A | 0.25 | 3.0 | 35 | q/h | lognormal, SD 0.84 | Mikszewski | V |
| ER_q (all activities) | RSV | flu ÷3 | = flu | flu ×3 | q/h | lognormal, SD 0.84 | none found | I. Calibrate to attack rates |
| Omicron emission multiplier | SC2 | 1 | 1 | 3 | × | — | Dai & Zhao 2022 (reports 725–2,345 q/h, likely R-scaled); Aganovic 2023 | I |
| Dispersion k | SC2 | 0.05 | 0.1 | 0.2 | — | negative binomial | Endo 2020, https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-658966 | V. Pre-Omicron |
| Incubation | SC2 | 2.88 | 3.42 | 3.96 | days (mean, 95% CI) | lognormal or gamma | Wu 2022 JAMA Netw Open, https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2795489 | V. Over-60s 7.43 (mostly pre-Omicron) |
| Latent period | SC2 | 1 | 2 | 3 | days | gamma, SD ~1 | derived | I |
| Pre-symptomatic infectious period | SC2 | 1 | 1.5 | 2.5 | days | gamma | Manica 2022 (51% pre-symptomatic) | I |
| Infectious period (total) | SC2 | 5 | 7 | 10 | days | gamma | Jang 2022 OFID (≈8 d culture) | V/I |
| Asymptomatic fraction, elderly | SC2 | 0.127 | 0.197 | 0.294 | fraction | beta | Sah 2021 PNAS, https://midasnetwork.us/papers/asymptomatic-sars-cov-2-infection-a-systematic-review-and-meta-analysis/ | V |
| Asymptomatic fraction, adults | SC2 | 0.25 | 0.33 | 0.40 | fraction | beta | Sah 2021; Shang 2022; von Bartheld 2024 | V |
| Relative infectiousness, asymptomatic | SC2 | 0.16 | 0.32 | 0.64 | ratio | — | Buitrago-Garcia 2022, https://www.eurekalert.org/news-releases/953374 | V |
| Incubation | Flu A | 1.3 | 1.4 | 1.5 | days (median) | lognormal (dispersion ~1.5, I) | Lessler 2009 | V (median) |
| Latent period | Flu A | 0.5 | 1.0 | 1.5 | days | gamma | Carrat 2008 (shedding from 0.5–1 d) | I |
| Infectious period | Flu A | 4 | 5 | 7 | days | gamma | Carrat 2008 (4.8 d shedding) | V/I |
| Asymptomatic fraction | Flu A | 0.16 | 0.25 | 0.50 | fraction | — | Leung 2015 (16% outbreaks; 65–85% serology); Carrat (~33%) | V/I |
| Incubation | RSV | 3.9 | 4.4 | 4.9 | days (median) | lognormal | Lessler 2009 | V |
| Latent period | RSV | 2 | 3 | 4 | days | gamma | Schumer 2026 (infectious from ~day 3) | V/I |
| Infectious period | RSV | 4 | 5 | 10 | days | gamma | Schumer 2026 (median 5 d, young adults) | V/I |
| Decay in aerosol | SC2 | 0.3 | 0.63 | 7 | /h | — | Buonanno 2020; van Doremalen 2020; Bazant 0.6×RH; Oswin 2022 (not opened) | V/I |
| Decay in aerosol | Flu A | 0.2 | 0.44 | 1.5 | /h | — | Nicas & Jones 2009, https://stacks.cdc.gov/view/cdc/188458/cdc_188458_DS1.pdf | V (central) |
| Decay in aerosol | RSV | 0.3 | 0.6 | 3 | /h | — | none | I |
| Deposition | all | 0.1 | 0.24 | 1.0 | /h | — | Buonanno 2020 (0.24); Nicas & Jones (0.29) | V (central) |
| Inhalation, resident | all | 0.29 | 0.29 | 0.42 | m³/h | — | EPA EFH ch. 6, 81+ sedentary mean/95th | V |
| Inhalation, staff | all | 0.72 | 1.0 | 1.56 | m³/h | — | EPA light/moderate | V endpoints |
| Effective immunity at season start, residents | SC2 | 0.15 | 0.30 | 0.50 | fraction | — | Reses 2024 coverage; Link-Gelles 2025 VE; COVID-19 Forecasting Team 2023 | I |
| Effective immunity at season start, residents | Flu A | 0.10 | 0.25 | 0.40 | fraction | — | Reses 2024; Moa 2023; Ferdinands 2021 | I |
| Effective immunity at season start, residents | RSV | 0.05 | 0.15 | 0.30 | fraction | — | Reses 2024 (17.9% coverage); Papi 2023 (71.7% vs ARI) | I |
| Susceptibility, adult vs ≥65 | SC2 | 0.68 | 1.0 | 1.0 | × | — | Bazant & Bush citing Davies 2020 | V (as cited) |
| Jet dilution S at 1 m | all | 8 | 17 | 33 | — | — | derived from Bazant (3% at 2 m) | I |
| In-plume fraction during care | all | 0.05 | 0.2 | 0.5 | — | — | none (Mizukoshi facing probability 0.013) | I |
| Two-zone β (r = 1 m, s = 0.05 m/s) | all | 280 | 1,130 | 4,500 | m³/h | — | standard NF-FF formula | I |
| Close-range share of airborne infections | SC2 / flu | 0.2 | 0.5 | 0.8 | fraction | — | Azimi 2021; Jones 2020; Cowling 2013 | I |
| Omitted contact/fomite share | SC2 | 0.05 | 0.10 | 0.30 | fraction | — | CDC 2021; Jones 2020; Azimi 2021 | I |
| Omitted contact/fomite share | Flu A | 0.1 | 0.2 | 0.5 | fraction | — | Nicas & Jones 2009; Cowling 2013 | I |
| Omitted contact/fomite share | RSV | 0.2 | 0.4 | 0.7 | fraction | — | Goldmann 2001 / Hall 1981 | I |
| Surgical mask, source control | all | 0.3 | 0.5 | 0.77 | fraction removed | — | Brooks 2021 MMWR | V endpoints |
| Surgical mask, wearer protection | all | 0.07 | 0.3 | 0.5 | fraction | — | Brooks 2021; Coffey 2007 | V endpoints |
| N95, wearer protection | all | 0.7 | 0.8 | 0.97 | fraction | — | Coffey 2007; Rengasamy 2015 | V endpoints |
| Resident attack rate per outbreak (target) | SC2 | 0.05 | 0.21 | 0.49 | fraction | — | Rodríguez Campelo 2023 (IQR) | V |
| Staff cumulative attack rate (target) | SC2 | — | 0.108 | — | fraction | — | same | V |
| Resident incidence (target) | SC2 | 61 | 109 | 134 | per 10,000 resident-weeks | — | Franklin 2024 MMWR | V |
| Outbreak duration (target) | SC2 | — | 57 (mean) | — | days | — | Krutikov 2023 | V |
| Resident attack rate per outbreak (target) | Flu A | 0.04 | 0.33 | 0.94 | fraction | — | Lansbury 2017 | V |
| Staff attack rate (target) | Flu A | 0.03 | 0.23 | 0.58 | fraction | — | Lansbury 2017 | V |
| Resident attack rate per outbreak (target) | RSV | 0.067 | 0.24 | 0.476 | fraction | — | Osei-Yeboah 2024 | V |
| Outbreak duration (target) | RSV | 13 | 17 | 21 | days | — | Ferrante 2024 | V |
| Resident attack rate (reference, not modelled) | Noro | — | 0.29 | — | fraction | — | Calderwood 2022 | V |

---

## 11. What I could not verify (inferred, inaccessible or conflicting)

**Sources I could not open**
1. **Near-field parameters.** Not opened: Delmaar 2025 full text, Jia 2022 full text, the CARA/CAiMIRA paper (Henriques 2022, Interface Focus), PMC8447483 and arXiv 2105.10357. The page-reading tool refused several of them and publishers blocked others. So **S(x) ≈ 16·x, the in-plume fraction f and the two-zone β are my own constructions**, anchored only on Bazant's verified "3% at 2 m" and "30× at 6 ft". Getting the CARA S(x) formula and Delmaar's diffusion-model parameters should be the first follow-up.
2. **Published (journal) versions** of Mikszewski 2022 (GSF) and Buonanno, Morawska & Stabile 2020 (Env Int). I used the medRxiv preprints, and values may differ slightly.
3. **Oswin et al. 2022 (PNAS), on rapid early infectivity loss in aerosol.** It could not be opened. The "90% in 20 minutes" figure comes only from a press-release title seen in search results. It conflicts with the 1.1 h half-life (van Doremalen used a rotating drum at fixed conditions).
4. **Adams 1993; van Doremalen 2020 original; Hall & Douglas 1981 original; Kulkarni 2016 (RSV aerosol); Ueki 2020 (mSphere mask study; abstract only, no numbers); PRiVII protocol and results; NCT07511881 registry details; He 2020 full text.**

**Inferred values with no verified source**
5. **No verified quanta emission rate exists for RSV.** All RSV route-A values are inferred and must be set by calibration.
6. **The Omicron emission multiplier is inferred.** Values that scale emission by R (e.g. Dai & Zhao) conflict with keeping immunity separate.
7. **Latent and pre-symptomatic durations** are inferred by subtraction from verified incubation, pre-symptomatic-share and shedding data. **Gamma SDs are all inferred.** The lognormal dispersions for the Lessler incubation periods are from memory.
8. **Asymptomatic fraction and relative infectiousness for influenza and RSV in older adults** are not verified.
9. **"Effectively immune at season start" fractions are my synthesis.** VE against *infection* in frail residents is poorly measured. The 69% NHSN-based figure is unadjusted and industry-authored, while CDC estimates against medically attended illness are about 35%. Staff vaccination coverage was not verified.
10. **Influenza transmission overdispersion (k) was not verified.**
11. **The proportion of introductions that lead to outbreaks** was not found for any pathogen.

**Conflicting evidence**
12. **Short/long-range split.** Estimates range from about 10% short-range inhalation (Mizukoshi, with droplet spray dominating) to about 50:50 (Azimi) to "cannot be generalized" (Public Health Ontario). Jet and two-zone physics differ by about 100× in the implied close-range excess. The Danish far-UVC trial's two arms (88% vs 31% reduction) are mutually inconsistent and cannot settle the split.
13. **Masks.** Bazant's 1–5% "penetration" for surgical masks reflects material filtration. Brooks found only 7.5% wearer protection for an unknotted medical mask. Fit dominates.
14. **Internal inconsistencies noted in sources:**
    - Spain report: the staff median attack rate is identical to the resident one.
    - NHSN MMWR: rates are per 10,000 in the results but per 100,000 in the discussion.
    - Jang 2022: culture positivity given as 8 vs 9 days.
    - Calderwood 2022: deaths given as 2.1 vs 2.3 per 1,000 cases.
    - Buonanno 2020b preprint: the c_i SD looks implausible.
