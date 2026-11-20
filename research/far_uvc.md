# Far-UVC (222 nm) parameters for the nursing-home transmission model

Compiled 2026-11-11. Each number is tagged **VERIFIED** (I read it in the cited source) or **INFERRED** (my own calculation, unit conversion, judgement, or a figure I know from memory and did not re-read). Where a value was read in a secondary compilation rather than the primary paper, it is tagged **VERIFIED (secondary)** and the compilation is named. All sources listed were opened during this research. Text is paraphrased.

Model term: the lamp adds a first-order removal rate for infectious airborne virus in a well-mixed room, expressed as equivalent air changes per hour (eACH).

---

## Bottom line

### (a) eACH per lamp as a function of room volume

The recommended rule follows from physics. It agrees with one real occupied-room measurement. It does **not** use the much larger figures from room-sized chambers (see §1).

> **eACH_lamp(V) = CADR_lamp / V**, with **CADR_lamp [m³/h] = 0.36 × k × P × L × η**
>
> - k = susceptibility constant (natural-log basis, cm²/mJ)
> - P = lamp far-UVC optical output actually emitted (mW)
> - L = mean photon path length through room air before absorption (m); about equal to ceiling height for ceiling or high-wall mounting
> - η = delivery/mixing efficiency (dimensionless)
> - V = room volume (m³)
>
> The result is capped so that the room-average fluence rate E = P·L/(10·V) [µW/cm²] stays at or below about 1.5 µW/cm². That is about the most a room can hold while meeting the ACGIH 8-h limits (§3).
>
> All terms are INFERRED. The P/(10·A) part is the Blueprint "10 mW per m² floor ≈ 1 µW/cm²" rule (VERIFIED (secondary), §5).

For an **Aerolamp** at 2.4 to 2.6 m ceilings, against SARS-CoV-2 (all INFERRED):

| | P (mW) | L (m) | k (cm²/mJ) | η | CADR per lamp (m³/h) | eACH in a 40 m³ resident room | eACH in a 250 m³ lounge, 1 lamp |
|---|---|---|---|---|---|---|---|
| Low | 40 (dimmed for a low ceiling) | 2.0 | 2.6 | 0.5 | ≈37 | ≈0.9 | ≈0.15 |
| **Default** | **70** | **2.5** | **5** | **1.0** | **≈315** | **≈7.9** | **≈1.3** |
| High | 100 | 3.0 | 12 | 1.0 | ≈1,300 | ≈32 | ≈5.2 |

**Confidence: low.** The range is about 35-fold. The one occupied-room measurement (dental clinic, eACH ≈ 6.5 at ≈0.2 µW/cm²) fits the physics. Room-sized chambers report eACH 10 to 30 times higher than the physics predicts, and no one has explained why. Read that gap as unresolved, not as support for the high end.

### (b) k by pathogen (222 nm, airborne, natural-log basis, cm²/mJ)

| Pathogen | Low | Central | High | Confidence |
|---|---|---|---|---|
| SARS-CoV-2 / human coronaviruses | 2.6 | 5 | 12 | Moderate. Several aerosol studies, including a 2025 study on SARS-CoV-2 itself, fall between 2.6 and 7. The high end comes from fitting a two-population model to the most sensitive fraction. |
| Influenza A | 1.8 | 5 | 20 | Low. There are only two aerosol measurements (k = 1.8 and k = 20, both from the Columbia group), and they differ 11-fold. The central value is my judgement. |
| RSV | 1.5 | 4 | 15 | Very low. I found **no** 222 nm measurement for RSV. The values are a proxy from other enveloped respiratory viruses (INFERRED). |

---

## Parameter table

| Parameter | Low | Central | High | Units | Source | Notes |
|---|---|---|---|---|---|---|
| k, SARS-CoV-2 aerosol | 4.4 (40% RH) | — | 6.8 (65% RH) | cm²/mJ | Angel, Luhung, de Sá, Peccia 2025, bioRxiv 10.1101/2025.06.09.658611, published in Environ. Sci. Technol. (DOI 10.1021/acs.est.5c09275). https://www.biorxiv.org/content/10.1101/2025.06.09.658611v1 ; https://www.nature.com/nature-index/article/10.1021/acs.est.5c09275 | VERIFIED from the preprint abstract page. No CIs in the text I could read. The only aerosol study of SARS-CoV-2 itself that I could open. |
| k, SARS-CoV-2 aerosol (most-susceptible ~90%) | 2.6 ± 0.2 | | | cm²/mJ | Kitagawa 2023, as tabulated in Blueprint Biosecurity, *Blueprint for Far-UVC* v1.0 (2025). https://blueprintbiosecurity.org/wp-content/uploads/2026/03/Blueprint-for-Far-UVC-V1.0-9.22.25-1-4.pdf | VERIFIED (secondary). Primary not opened; the PMC abstract was blocked. |
| k, HCoV-229E aerosol | 4.1 (95% CI 2.5–4.8) | | | cm²/mJ | Buonanno et al. 2020, Sci Rep (preprint version read). https://www.prevencionintegral.com/sites/default/files/noticia/72272/field_adjuntos/manuscript1.pdf | VERIFIED. 24 °C, mean RH 66%. D90 0.56 mJ/cm². |
| k, HCoV-OC43 aerosol | 5.9 (95% CI 3.8–7.1) | | | cm²/mJ | Same as above | VERIFIED. D90 0.39 mJ/cm². |
| k, HCoV-OC43 aerosol, two-population fit | k₁ 12.4 ± 0.4 (sensitive 99.7%); k₂ 1.6 ± 0.1 (resistant 0.31%) | single-exponential 5.6 ± 0.9 | | cm²/mJ | Welch et al. 2022, Viruses 14:684. https://www.mdpi.com/1999-4915/14/4/684 | VERIFIED. RH 60–70%. The resistant tail stops mattering below about 2.5 log reduction, so k₁ is the relevant value at room doses. |
| k, HCoV-OC43 aerosol, 65% RH | 14.26 ± 0.64 | | | cm²/mJ | Lu et al. 2025, via Blueprint 2025 (URL above) | VERIFIED (secondary). Primary not opened. |
| k, influenza A H1N1 aerosol | 1.8 (95% CI 1.5–2.1) | | | cm²/mJ | Welch et al. 2018, Sci Rep 8:2752. https://www.nature.com/articles/s41598-018-21058-w | VERIFIED. About 55% RH. D95 1.6 mJ/cm². |
| k₁, influenza A H1N1 aerosol (benchtop) | | | 20.06 ± 8.04 | cm²/mJ | Buonanno et al. 2024, Sci Rep 14:6722. https://link.springer.com/article/10.1038/s41598-024-57441-z | VERIFIED. A new measurement in that paper. D90 0.11 mJ/cm². Conflicts 11-fold with Welch 2018. |
| k, SARS-CoV-2 in liquid | 1.48 (ln basis); 0.64 (log₁₀ basis) | | | cm²/mJ | KrCl excilamp aqueous study, medRxiv 2021. https://www.medrxiv.org/content/10.1101/2021.02.19.21252101.full.pdf | VERIFIED. D90 1.6 mJ/cm². Liquid suspensions shield the virus, so this is **not** suitable for aerosol. Blueprint gives a liquid range of 1.4–3.8 (VERIFIED (secondary)). |
| k, RSV | 1.5 | 4 | 15 | cm²/mJ | none found | INFERRED proxy. |
| Humidity effect on k (SARS-CoV-2) | ×1.0 at 40% RH | | ×1.55 at 65% RH | — | Angel et al. 2025 (above) | VERIFIED. Blueprint (Sept 2025) says no published far-UVC humidity data existed (VERIFIED (secondary)), so the two sources conflict. Winter nursing-home RH of 30–45% (INFERRED) argues for the lower k. |
| ACGIH TLV at 222 nm, eye | 161 | | | mJ/cm² per 8 h | Blueprint 2025 Table 4.1 (160.7); Buonanno 2024 (160); vendor page https://uvmedico.com/knowledge-base/what-is-the-current-tlv (161) | VERIFIED. Adopted in 2022. Equivalent to 5.6 µW/cm² continuous for 8 h (INFERRED: 161/28,800 s). |
| ACGIH TLV at 222 nm, skin | 479 | | | mJ/cm² per 8 h | Same as above | VERIFIED. Equivalent to 16.6 µW/cm² for 8 h (INFERRED). |
| ICNIRP / pre-2022 limit at 222 nm | 23 | | | mJ/cm² per 8 h | Eadie et al. 2022 (URL below); Blueprint Table 4.1; NHS Assure report | VERIFIED. Equivalent to 0.80 µW/cm² for 8 h (INFERRED). |
| Room-average fluence rate, ACGIH-compliant installation | 0.3 | 0.8 | 1.5 | µW/cm² | Peng et al. 2023, ES&T Lett 10:668. https://repository.library.noaa.gov/view/noaa/59397/noaa_59397_DS1.pdf ; Buonanno 2024 (0.82 modelled); Kristensen et al. 2026 (0.93–1.27) | VERIFIED: Peng's stated typical range is 0.3–1.5. The central value is INFERRED. |
| Room-average fluence rate, room occupied ~24 h/day (resident bedroom) | 0.1 | 0.4 | 1.0 | µW/cm² | INFERRED | TLVs are 8-h occupational limits. NHS Assure advises against continuous 24 h exposure of the same person (VERIFIED). Scaling the 8-h limit to 24 h divides the fluence by 3. |
| Delivery / mixing efficiency η | 0.5 | 1.0 | 1.0 | — | INFERRED | No study quantifies this for real rooms. The dental clinic result is consistent with η ≈ 1 (§1). |
| Mean path length L | 2.0 | 2.5 | 3.0 | m | INFERRED from the Blueprint 10 mW/m² rule | Wall reflectance at 222 nm and furniture shading are not quantified. |
| Optical output, Aerolamp (Ushio Care222 B1) | | 100 | | mW | https://aerolamp.net/products/devkit | VERIFIED. Input 12.9 W. Mount at least 2.6 m at 100% output; 2.45 m at 70%; 2.3 m at 40%; 2.15 m at 20%. |
| Aerolamp rated coverage | | 1 lamp per 250 ft² (23 m²), "800 CFM" | | — | Same | VERIFIED claim. 800 CFM is about 1,360 m³/h. At L = 2.5 m that implies k ≈ 15 (INFERRED), at or above my high value. |
| Measured eACH, occupied real room (dental clinic, culturable bacteria) | | 6.5 | | h⁻¹ | Welch et al. 2026, J Hosp Infect 168:105–113. https://www.sciencedirect.com/science/article/pii/S019567012500372X | VERIFIED. Simulated average irradiance at 1.8 m: 0.20 µW/cm². Reduction 39.5% (95% CI 19–60%). |
| Measured eACH, room-sized chamber (S. aureus) | 35 (Medium, 5 lamps) | 184 (High, 5 lamps) | 128–322 (1 SD band) | h⁻¹ | Eadie et al. 2022, Sci Rep 12:4373. https://eprints.whiterose.ac.uk/185628/1/s41598-022-08462-z.pdf | VERIFIED. 32 m³. Exceeds the physics prediction 10- to 30-fold (§1). |
| Ozone production per unit fluence (filtered KrCl) | 7 | ~10 | 10.5 | ppb/h per µW/cm² | Blueprint 2025 §6 (compiling Peng, Link, others) | VERIFIED (secondary). Consistent with Peng: 22 ppb/h at ~2.1 µW/cm² in a 21 m³ chamber (VERIFIED). |
| Ozone surface loss rate | 0.5 | 2 | 3.9 | h⁻¹ | Blueprint 2025 §6 | VERIFIED (secondary) |
| Steady-state ozone increase at 1 µW/cm², 1 ACH | | ~3.5 | | ppb | Blueprint 2025 Table 6.2 | VERIFIED (secondary). Measured increases in real rooms were 2.7–9.5 ppb. |
| Infection-rate ratio from a far-UVC care-home trial | 0.12 (common-room arm) | — | 0.69 (0.23–2.07) (common + resident-room arm) | aIRR | Kristensen et al. 2026, Antimicrob Steward Healthc Epidemiol 6:e165. https://www.cambridge.org/core/product/433F85B6AF94B8EF3097405A3A8C71BA/core-reader | VERIFIED. Nonrandomized, industry-funded, registered retrospectively. Not usable as an effect size. |
| Infection IRR, germicidal UV appliances in LTC (RCT) | | 0.91 (0.77–1.09) | | IRR | Shoubridge et al. 2025, JAMA Intern Med 185:1128. https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2836586 | VERIFIED. Primary outcome null. Not far-UVC; wavelength not stated. |

---

## 1. Measured eACH: chambers and real rooms

### 1a. Room-sized chambers

**Eadie et al. 2022, Sci Rep 12:4373** (University of Leeds chamber). Source: https://eprints.whiterose.ac.uk/185628/1/s41598-022-08462-z.pdf. All VERIFIED unless marked.

- **Room and conditions:** 4.26 × 3.35 × 2.26 m, about 32 m³. Ventilation 3 ACH, HEPA supply and extract, no mixing fan. 28 °C, 50% RH.
- **Lamps:** five filtered KrCl lamps with diffusers, mounted at 2.12 m in a quincunx. The manufacturer and power are not reported. Settings were "High", "Medium" (about 10%) and "Low" (about 1%).
- **Pathogen:** nebulised *S. aureus*, MMAD 2.5 µm.
- **Results:**

| Setting | Lamps | Avg irradiance at 1.7 m (µW/cm²) | Peak at 1.7 m (µW/cm²) | Reduction | eACH |
|---|---|---|---|---|---|
| High | 5 | 2.73 (2.01 at 1 m) | 14.4 | 98.4% | 184 (1 SD band 128–322) |
| High | 1 | 0.57 | | 93.7% | 33–66 |
| Medium | 5 | 0.14 | | 92.0% | 35 (27–46) |

- **Compliance:** the authors compared the High peak 8-h dose (415 mJ/cm²) with the skin TLV only. That dose is about 2.6 times the 2022 ACGIH **eye** TLV of 161 mJ/cm² (INFERRED). So the High setting is not an eye-compliant installation for an 8-h occupant at the point under the lamp.

**Hiwar et al. 2025, Building and Environment 274:112734** (same chamber, Ushio U3 lamps). Source: https://eprints.whiterose.ac.uk/id/eprint/224120/1/Clean%20Version%20-%20FarUVC-31%20Jan.pdf. VERIFIED unless marked.

- **Setup:** 86 mW luminous flux per lamp. Room-average fluence 0.56 µW/cm² with one lamp and 2.54 with five. The paper prints the unit as W/cm², almost certainly a typo for µW/cm². 22 °C, 48% RH, unoccupied.
- **Steady-state reductions in S. aureus:**

| Ventilation | 1 lamp | 5 lamps |
|---|---|---|
| 3 ACH | 95.5% | 97.8% |
| 6 ACH | 92.8% | 97.4% |
| 9 ACH | 66.3% | 91.9% |

- **eACH (my conversion, INFERRED):** using eACH = ACH × R/(1−R), at 3 ACH this gives about 64 (1 lamp) and 133 (5 lamps). Blueprint also lists 133 (VERIFIED (secondary)).
- **Short range:** with one lamp between source and sampler, reduction fell from 88.5% at 2.87 m separation to 57.4% at 2 m (VERIFIED). This shows the well-mixed assumption breaks down near an infectious person.
- **Ozone (estimated):** 4 ppb/h with one lamp and 18 ppb/h with five (VERIFIED).
- The authors say the experiments were not designed to represent real-life situations (VERIFIED).

**NHS Assure final report** on the same programme (Wood, Eadie, Noakes et al.). Source: https://www.nss.nhs.scot/media/4634/assureresearch21-001-far-uvc-finalv2.pdf.

- Medium intensity gave about 27 additional equivalent ACH at 3 ACH base ventilation (VERIFIED).
- No real-world evidence was gathered. The bacteriophage virus surrogate could not be measured reliably (VERIFIED).
- The authors advise against use where the same person is exposed continuously for 24 h or more (VERIFIED).

**Ratliff et al. 2025, ACS ES&T Air** (US EPA, MS2 phage). Source: https://figshare.com/collections/Factors_Affecting_Reduction_of_Infectious_Aerosols_by_Far-UVC_and_Portable_HEPA_Air_Cleaners/7682405.

- Simulated saliva roughly doubled log reductions and CADR compared with deionised water (VERIFIED).
- Decay was not first-order, so the chosen time window changed the reported efficacy (VERIFIED).
- Blueprint lists eACH 1.24 (water) and 2.06 (saliva) at about 1.3 µW/cm² (VERIFIED (secondary)). This is far lower than the Leeds results. MS2 is a resistant surrogate.

### 1b. Real rooms

**Buonanno et al. 2024, Sci Rep 14:6722**, an occupied mouse-cage-washing room. Sources: https://www.nature.com/articles/s41598-024-57441-z.pdf and https://link.springer.com/article/10.1038/s41598-024-57441-z. VERIFIED unless marked.

- **Room:** about 96 m³ (38 m², 2.5 m ceiling). 36 ACH nominal; tracer measurement 49 ± 20 ACH. 21 °C, 41% RH. Staff present.
- **Lamps:** 4 R-Zero Vive fixtures (3 KrCl bulbs each). Average horizontal irradiance at 1.8 m was 0.464 µW/cm² measured, with a modelled room-average fluence of 0.82 µW/cm².
- **Result:** infectious airborne murine norovirus fell 99.8% (95% CI 98.2–99.9%). Reported eACH was 14,800 (95% CI 2,000–36,000) assuming a well-mixed room, and 1,480–2,960 with mixing factors of 10 or 5.
- **Implausibility:** the authors note that their benchtop k (2.36 cm²/mJ for MNV) would require an average irradiance of about 1,700 µW/cm² to explain this. They call the discrepancy unexplained.
- **INFERRED:** physics with k = 2.36 and E = 0.82 gives eACH ≈ 3.6 × 2.36 × 0.82 ≈ 7. **I do not recommend using this study's eACH in the model.** The room was poorly mixed, the aerosol source is unknown, and the result disagrees with radiometry by orders of magnitude.

**Welch et al. 2026 (online Nov 2025), J Hosp Infect 168:105–113**, an occupied dental clinic. Source: https://www.sciencedirect.com/science/article/pii/S019567012500372X. VERIFIED unless marked.

- **Space:** about 400 m², 3 m ceiling, about 1,200 m³ (INFERRED volume). The space is open to adjacent areas. VAV HVAC at about 10 ACH with MERV14 filters. 24 treatment chairs.
- **Lamps:** 16 Vive fixtures at 2.9 m. Maximum horizontal irradiance at 1.8 m was 3.98 µW/cm² measured. Simulated average at 1.8 m was 0.20 µW/cm².
- **Result:** culturable airborne bacteria fell 39.5% (95% CI 19–60%). This corresponds to about 6.5 additional eACH.
- The authors back-calculate airborne susceptibility of 3.6–5.9 cm²/mJ, depending on the volume and fluence assumed.
- Several authors have ties to far-UVC companies.
- **INFERRED:** this is the closest available analogue to a care-home deployment. Its eACH is consistent with eACH = 3.6·k·E for k of a few cm²/mJ, and it does **not** show the chamber "excess".

**Danish LTC trial (Kristensen et al. 2026).** Lamp layouts are reported with average fluence rates (VERIFIED):

- 1.27 µW/cm²: 5 lamps per 78 m² common room
- 1.05 µW/cm²: 9 lamps in 226 m²
- 0.93 µW/cm²: 1 lamp per resident room

The lamps were sized to a 23 mJ/cm² per day limit with duty cycling. No eACH was measured.

### 1c. Why chamber and real-room results differ

The direction of the discrepancy is the opposite of intuition. Chamber eACH **exceeds** what radiometry plus benchtop k predicts:

- **Eadie 2022:** implied k is about 19–25 cm²/mJ at High and about 70 at Medium (INFERRED: eACH ÷ (3.6 × E)). Blueprint reports a directly measured S. aureus k of about 0.9 (VERIFIED (secondary)). It also reports implied/direct discrepancies of about 20× for S. aureus and about 30× for MNV, with no current explanation (VERIFIED (secondary)).

Candidate explanations offered by Buonanno 2024 (VERIFIED):

- turbulent tumbling flow versus laminar benchtop flow
- airflow uncertainty
- aerosol-generation differences

Unresolved possibilities (INFERRED):

- measured horizontal irradiance understates spherical fluence rate
- bacteria being lost to processes other than UV that are correlated with lamp operation
- sampler placement

Expected real-world penalties that are not quantified by any study I found:

- **Imperfect mixing and short range:** Hiwar's 57% versus 88% at 2 m versus 2.87 m.
- **Shading by furniture and occupants:** the Aerolamp planner models furniture as shading the air below it (VERIFIED, https://aerolamp.net/pages/room-planner).
- **Low ceilings:** these force dimming.
- **Real respiratory aerosol:** Ratliff found saliva matrix changes the results; Blueprint Recommendation 1.1 calls for data on human respiratory aerosol (VERIFIED (secondary)).

**Recommendation (INFERRED):** parameterise from k × E with η ≤ 1. Present the chamber eACH as an unexplained upper outlier. Do not use it as a calibration.

---

## 2. 222 nm susceptibility constants

All k values below use the natural-log basis (S = e^(−kD)), so D90 = 2.303/k. Some papers use log₁₀ (e.g., 0.64 versus 1.48 for the liquid SARS-CoV-2 study). Check the basis before using any published k.

### SARS-CoV-2 and human coronaviruses (aerosol)

| Value | Source | Status |
|---|---|---|
| 4.4 (40% RH), 6.8 (65% RH) | Angel et al. 2025 (SARS-CoV-2) | VERIFIED |
| ≈2.6 ± 0.2 (most-susceptible fraction) | Kitagawa 2023 (SARS-CoV-2) | VERIFIED (secondary) |
| 4.1 (229E), 5.9 (OC43) | Buonanno 2020 | VERIFIED |
| 12.4 (OC43 sensitive fraction; single-exponential 5.6) | Welch 2022 | VERIFIED |
| 14.26 (OC43, 65% RH) | Lu 2025 | VERIFIED (secondary) |
| 1.4–3.8 (liquid / surface) | various | VERIFIED (secondary); not applicable to air |

- Angel et al. also report a natural decay without UV of 5.4 ± 1.1 h⁻¹, and far-UVC eACH above 62 h⁻¹ at 25% of the "maximum safe human exposure limit" at 65% RH (VERIFIED). I could not see which limit or fluence that refers to (see "What I could not verify").
- **Low/central/high: 2.6 / 5 / 12** (INFERRED). The central value sits near the SARS-CoV-2 measurement at indoor-winter humidity.

### Influenza A (aerosol)

| Value | Source | Status |
|---|---|---|
| 1.8 (CI 1.5–2.1), at ~55% RH | Welch 2018 | VERIFIED |
| 20.06 ± 8.04 (benchtop, two-population sensitive fraction) | Buonanno 2024 | VERIFIED |

- **Low/central/high: 1.8 / 5 / 20** (INFERRED). Both values come from the same group, and neither is a field strain in human respiratory aerosol.

### RSV

- No 222 nm measurement was found in any source I opened, including Blueprint's tables.
- **Low/central/high: 1.5 / 4 / 15** (INFERRED proxy).

### Humidity

- **Far-UVC:** the only direct data are Angel et al., with k about 55% higher at 65% than at 40% RH (VERIFIED).
- **Older evidence:** for upper-room 254 nm UV, Blueprint notes kill rates fell sharply above about 60–70% RH (Riley & Kaufman 1972, VERIFIED (secondary)). Different wavelength and direction.
- **Model treatment:** apply humidity as an uncertainty, not a known modifier.

### Aerosol vs liquid/surface

- Liquid suspensions give lower k: 1.48 for SARS-CoV-2 in medium (VERIFIED).
- Matrix effects matter: MS2 in artificial saliva has k 0.37 (VERIFIED (secondary)).
- Use only aerosol values for the airborne removal term.

---

## 3. Exposure limits and the fluence a compliant room can hold

### Limits

- **ACGIH (2022):** at 222 nm the 8-h TLV is 161 mJ/cm² for eye and 479 mJ/cm² for skin (VERIFIED: Blueprint Table 4.1, Buonanno 2024, UV Medico page).
  - These correspond to continuous 8-h irradiance of 5.6 and 16.6 µW/cm² (INFERRED).
  - The ACGIH Spring 2026 Notice of Intended Changes lists **no** physical-agents changes, so these remain current (VERIFIED, https://www.acgih.org/notice-of-intended-changes-list/).
- **ICNIRP:** 23 mJ/cm² per 8 h at 222 nm, the same for eye and skin (VERIFIED: Blueprint Table 4.1; Eadie 2022), or 0.80 µW/cm² for 8 h (INFERRED). ICNIRP's 2025 annual report shows work on long-term UV guidance and far-UV gaps in the laser guidelines, but no revised far-UVC limit (VERIFIED, https://www.icnirp.org/cms/upload/doc/Annual_Report2025.pdf).
- **UL 8802:** a voluntary US standard that requires permanent mounting and uses ACGIH limits (VERIFIED (secondary), Blueprint).
  - Undiffused high-power fixtures can mount flush only at ceilings of at least 2.7 m. Diffused fixtures can go down to about 2.3 m (VERIFIED (secondary)).
  - Miller, Eadie et al. 2024 propose a lamp-specific exposure limit (HLEL) to set exposure time and the minimum ceiling height for UL 8802 compliance. They warn that a radiometer reading plus a single 222 nm limit can lead to overexposure for imperfectly filtered lamps (VERIFIED, https://www.nist.gov/node/1859341).
- **IEC 62471:** I could not open the text (paywalled). Manufacturers cite it as an alternative compliance route: Ushio says filtered modules can be used within ACGIH 2022 or IEC 62471 requirements, and Far UV Technologies says it is designed to meet IEC/EN 62471 (VERIFIED, product sheets below). In practice IEC 62471 applies the ICNIRP-type limit (INFERRED from memory).
- **Filtering:** unfiltered KrCl lamps can cause erythema even within the 2022 ACGIH limits. Filtering above about 235 nm is recommended (VERIFIED: O'Mahoney et al. 2022, J Radiol Prot 42:043501, https://discovery.dundee.ac.uk/ws/files/89587456/O_Mahoney_2022_J._Radiol._Prot._42_043501.pdf).

### From limits to room-average fluence

Limits cap the **peak** exposure at about 1.8 m (or wherever an eye can be). The room average is a fraction of that peak:

| Study | Average | Peak | Average ÷ peak |
|---|---|---|---|
| Eadie 2022 | 2.73 | 14.4 | 0.19 |
| Buonanno 2024 | 0.46 | 2.76 | 0.17 |
| Dental clinic (simulated) | 0.20 | 2.81 | 0.07 |

Ratios are INFERRED from VERIFIED values. Volume-average fluence rate is somewhat above horizontal irradiance: Buonanno modelled 0.82 fluence against 0.6 horizontal (VERIFIED).

Peng et al. 2023 state typical room-average fluence for installations meeting the ACGIH eye limit as **0.3–1.5 µW/cm²** (VERIFIED). Use **0.3 / 0.8 / 1.5** for 8-h occupancy.

**Nursing-home caveats (INFERRED):**

1. Residents may be in their room close to 24 h a day. Scaling the 8-h TLV to 24 h divides the allowed average by 3, giving about 0.1–0.5 µW/cm². NHS Assure advises against continuous 24-h exposure (VERIFIED).
2. A resident lying in bed facing the ceiling puts the eye in a different geometry from the standing-worker assumption. Standard calculations may not cover this.
3. An ICNIRP-based installation run without duty cycling would sit near 0.1–0.2 µW/cm². The Danish trial reached about 1 µW/cm² under a 23 mJ/cm² per day limit by modelling exposure and duty cycling (VERIFIED fluence; the method details were not fully read).

---

## 4. Conversion and implied eACH

**eACH [h⁻¹] = k [cm²/mJ] × E [µW/cm²] × 10⁻³ [mJ/µJ] × 3600 [s/h] = 3.6 × k × E**

Unit check: (cm²/mJ) × (mJ·s⁻¹·cm⁻²) = s⁻¹, then × 3600 gives h⁻¹ (INFERRED). E must be the volume-average **fluence rate**, not horizontal irradiance.

Implied eACH for an ACGIH-compliant room with E of 0.3 / 0.8 / 1.5 µW/cm² (INFERRED):

| Pathogen | Low (k_low, E 0.3) | Central (k_c, E 0.8) | High (k_high, E 1.5) |
|---|---|---|---|
| SARS-CoV-2 | 2.8 | 14 | 65 |
| Influenza A | 1.9 | 14 | 108 |
| RSV (proxy) | 1.6 | 11.5 | 81 |

Multiply by η (0.5–1) for imperfect mixing. For 24-h-occupied bedrooms, use E of 0.1–1.0.

Comparison with the measurements in §1:

- **Dental clinic:** 6.5 eACH at 0.2 µW/cm² irradiance. This sits at or slightly above the physics band for its fluence; for comparison, 3.6 × 5 × 0.2 ≈ 3.6 (INFERRED).
- **Leeds chamber:** 35–184 eACH at 0.14–2.7 µW/cm², 2.5 to 25 times above the band.
- **Mouse room:** 1,480–14,800 eACH, orders of magnitude above the band.
- **Angel et al.:** reported >62 eACH at 25% of an exposure limit (unverified fluence).

**INFERRED:** the physics-plus-real-room evidence supports single-digit to low-tens of eACH for a well-designed compliant installation. Values of hundreds rest only on chambers, which have not been reproduced in occupied buildings.

---

## 5. Coverage per commercial fixture and the per-lamp rule

### Product specifications (all VERIFIED from manufacturer pages)

- **Aerolamp DevKit** (https://aerolamp.net/products/devkit):
  - Ushio Care222 filtered B1 module, 100 mW far-UVC, 12.9 W input.
  - Rated 1 lamp per 250 ft² (23 m²) in a well-mixed room, said to deliver "800 CFM" of clean air.
  - Mount at least 2.6 m at full output; dimmed versions need 2.45 m at 70%, 2.3 m at 40% and 2.15 m at 20%.
  - Price $500, listed as sold out.
  - Its Room Planner uses OSLUV's guv-calcs/Illuminate engine with averaged airborne k data, ACGIH 8-h limits checked at 1.8 m, lamps fixed at 30° below horizontal, and furniture modelled as shading (VERIFIED, https://aerolamp.net/pages/room-planner).
  - The planner page does not publish its k values or ozone generation rate.
- **Ushio Care222 module datasheet** (https://www.ushio.com/files/specifications/care222-filtered-far-uv-c-excimer-lamp-module-technical-data-sheet.pdf):
  - B1: 60° beam, 11 W, peak 11.2 µW/cm² at 1 m, 5.0 at 1.5 m, 1.8 at 2.5 m.
  - B1.5: 110° beam with diffuser, 1.6 µW/cm² at 1 m.
  - No mW output is given.
- **UV Medico UV222** (https://uvmedico.com/hubfs/Manuals/Manual%20-%20UV222%20-%2006-24/UV222%20-%20one-pager%20v24.02.pdf):
  - 115 mW at 60° beam or 70 mW at 100° beam, 20 W maximum. No coverage claim.
  - The Danish trial protocol gives 13.7 µW/cm² at 1 m (VERIFIED, https://cdn.clinicaltrials.gov/large-docs/81/NCT07511881/Prot_SAP_000.pdf).
- **Far UV Technologies Krypton-36** (https://cdn.shopify.com/s/files/1/0835/4145/files/faruvtech-krypton36-specsheet.pdf):
  - 320 mW peak, 12 W nominal, 40° half-angle.
  - For ceilings of 11–35 ft, covering up to 1,000 ft².
- **R-Zero Vive** (https://rzero.com/spec-sheet-vive/):
  - 3 KrCl bulbs, 60 W, 116° distribution, minimum 8 ft mounting.
  - Covers 200 ft². No optical output stated.

### The rule

Blueprint states that a ceiling-mounted fixture needs about 10 mW of far-UVC per m² of floor to reach about 1 µW/cm² room average (VERIFIED (secondary), Blueprint ch. 8; it says Illuminate simulations give values 5–10% lower). Blueprint's own example gives a CADR of 250 L/s for a 100 mW device at k = 10 with a 2.5 m ray length (VERIFIED (secondary)). That equals 900 m³/h and matches 0.36 × 10 × 100 × 2.5 (INFERRED check).

Generalising (INFERRED):

- E ≈ P·L/(10·V)
- CADR_lamp = 0.36·k·P·L·η (m³/h)
- eACH_lamp = CADR_lamp / V

Two consequences:

- **CADR per lamp is roughly independent of room size.** eACH therefore scales as 1/V, and lamps add linearly.
- **The cap still applies.** E must stay within the compliant band (≤1.5 µW/cm² for 8-h occupancy, ≤0.5 for 24-h). Low ceilings force dimming (lower P). Small rooms shorten L.

The Aerolamp "800 CFM per lamp" claim implies k ≈ 14–15 at L = 2.5 m (INFERRED), which is at the optimistic end of §2. Treat it as an upper bound.

---

## 6. Side effects and epidemiological evidence

### Ozone and secondary chemistry

- **Peng et al. 2023, ES&T Lett 10:668** (https://repository.library.noaa.gov/view/noaa/59397/noaa_59397_DS1.pdf). VERIFIED.
  - Tested 8 lamps from 5 makers. Ozone was about an order of magnitude higher than earlier reports.
  - The Ushio B1 produced about 22 ppb/h in a 21 m³ chamber at about 2.1 µW/cm², and about 8.6 ppb/h in a 33 m³ office.
  - With the filter removed it produced about 100 ppb/h. One unit had an internal electrical discharge that produced far more ozone.
  - In the office at 0.6–1.0 ACH, steady-state ozone rose by about 6.5 ppb.
  - The authors recommend lower fluence where possible, especially at low ventilation, and CO₂ monitoring.
- **Barber et al. 2023, ES&T 57:15990** (https://krollgroup.mit.edu/papers/Barber_2023.pdf). VERIFIED.
  - Ozone production was 324 ppb/h at about 45 µW/cm² in a 150 L chamber. Steady state was inversely proportional to ventilation.
  - Secondary organic aerosol in realistic indoor scenarios was estimated at a few µg/m³.
  - At more than 25 µW/cm² and less than 1 ACH, indoor ozone could exceed outdoor levels.
  - The authors say 222 nm UV is not a safe substitute for ventilation and should run at the lowest effective level.
- **Carter et al. 2025, ES&T** (https://eprints.whiterose.ac.uk/id/eprint/229886/1/carter-et-al-2025-the-impact-of-uvc-light-on-indoor-air-chemistry-a-modeling-study.pdf). VERIFIED.
  - Modelled a classroom at 0.5 ACH: ozone rose about 1.4 ppb at 1 µW/cm² and about 5.5 ppb at 3 µW/cm².
  - Ozone-skin-oil products (nonanal, decanal, 4-oxopentanal) dominate the secondary products, and formaldehyde rises.
  - Raising ventilation from 0.5 to 2 ACH roughly halved ozone.
  - The authors recommend never reducing ventilation because UV is installed.
- **Blueprint 2025 §6** (VERIFIED (secondary)):
  - 7–10.5 ppb/h per µW/cm²; surface loss about 2 h⁻¹; about 3.5 ppb steady-state increase at 1 µW/cm² and 1 ACH.
  - SOA about 0.56 µg/m³ per µW/cm² (Link 2024) and 1–5 µg/m³ in poorly ventilated rooms.
  - ASHRAE regards any indoor ozone emission as undesirable.
- **Conflicts:** the NHS Assure report says 222 nm lamps are not known to produce ozone, but it did not measure it (VERIFIED). This conflicts with Peng, Barber and Link.
- **Buonanno 2024:** found no ozone effect, but the room had 36 ACH (VERIFIED).
- **Model formula (INFERRED):** ΔO₃,ss ≈ (≈10 ppb/h × E) / (ACH + k_surface). Care-home bedrooms at 0.5–2 ACH with E of 0.5–1 µW/cm² give roughly 1.5–4 ppb added ozone.

### Clinical and epidemiological evidence

**No completed randomized controlled trial has shown that far-UVC reduces infections.**

1. **Kristensen et al. 2026, Antimicrob Steward Healthc Epidemiol 6:e165** (Vejle, Denmark). Source: https://www.cambridge.org/core/product/433F85B6AF94B8EF3097405A3A8C71BA/core-reader. VERIFIED unless marked.
   - **Design:** nonrandomized, open-label, 6 months, 12 LTC facilities, 635 residents, allocated 10:1:1. Funded by UV Medico; registered retrospectively as NCT07511881.
   - **Infections:** hospital-treated infections had aIRR 0.12 (0.04–0.34) in the common-room arm and 0.69 (0.23–2.07) in the common + resident-room arm.
   - **Antibiotics:** prescriptions had aIRR 0.52 (0.29–0.96) and 0.83 (0.50–1.37) in the same arms.
   - **Inconsistent pattern:** more far-UVC gave a weaker effect (INFERRED reading).
   - The authors call the results preliminary pending an RCT.
2. **PRiVII, NCT05084898** (Nova Scotia). Double-blind, placebo-controlled cluster RCT of far-UVC in LTC common areas, run 24 h a day.
   - The protocol assumed HR 0.7. Phase 1 devices were tuned to 23 mJ/cm² per 8 h (VERIFIED, https://link.springer.com/article/10.1186/s13063-024-07909-0).
   - Registry status: completed May 2025, 550 enrolled (VERIFIED, registry mirror https://api.ai-analytics.org/clinical/NCT05084898.md).
   - **I found no published results.**
3. **NCT06569160** (France, 12 nursing homes, upper-room UVGI, cluster crossover). Listed as completed; results were expected mid-2026; wavelength not specified (VERIFIED, https://decentrialz.com/clinical-trials/NCT06569160/efficacy-of-ultraviolet-germicidal-irradiation-devices-to-reduce-respiratory-infections-in-nursing-homes-cluster-randomized-crossover-trial). No results found.
4. **ELUCIDAR, ACTRN12624000791538** (Victoria, Australia; 254 nm upper-room UV; about 60 aged-care facilities). Primary outcome is confirmed COVID-19. "Not yet recruiting" as of the June 2024 registry entry (VERIFIED, https://anzctr.org.au/ACTRN12624000791538.aspx).
5. **PETRA, Shoubridge et al. 2025, JAMA Intern Med 185:1128.** Germicidal UV air appliances (fan/flow units; wavelength not stated, not far-UVC) in 4 South Australian LTC facilities. Source: https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2836586. VERIFIED unless marked.
   - **Primary outcome:** IRR 0.91 (0.77–1.09), null.
   - **Secondary:** an a posteriori time-series analysis showed 12.2% fewer cumulative infections.
   - **Commentary:** Klompas's accompanying commentary judges the impact limited and the outcome definition loose (VERIFIED via https://www.facilitiesdive.com/news/jury-is-still-out-on-widespread-use-of-uv-lights-in-cutting-infections/758634/).
6. **Historical upper-room 254 nm studies** (Wells measles in schools, Navy barracks, McLean influenza in TB wards) are summarised in Blueprint (VERIFIED (secondary)). Blueprint notes the classroom results failed to replicate and that there are not yet large-scale far-UVC trials showing real-world effect.

---

## What I could not verify

**Blocked or inaccessible sources**

- PMC pages were blocked by a captcha. I read Eadie 2022 and Buonanno 2024 from the publisher or repository PDFs instead.
- Some tool fetches of Angel et al. full text, Kitagawa 2023, and a bioRxiv/ScienceCast summary were refused. For Angel et al. I could not confirm which exposure limit "25%" refers to or the fluence used for the eACH > 62 figure. Their k values come from the abstract page only, with no CIs.
- Kitagawa 2023 (SARS-CoV-2 aerosol k ≈ 2.6) and Lu 2025 (OC43 k 14.26) are taken from the Blueprint compilation; I did not open the primaries.
- The UL 8802 and IEC 62471 texts are paywalled.
  - My statements on UL 8802 come from Blueprint and the NIST abstract.
  - That IEC 62471 applies ICNIRP-type limits is from memory (INFERRED).
  - The UL 8802 measurement height and ozone requirement are unverified.
- I did not open Sliney & Stuck 2021 (the basis of the 2022 ACGIH revision); the Wiley and T&F pages failed.

**Authorship and attribution**

- The medRxiv liquid SARS-CoV-2 study's author list was not visible in the fetched text. I believe it is Ma, Linden et al. (INFERRED from memory).
- Buonanno 2024 attributes the OC43 k₁ = 12.4 to Buonanno 2020. That value actually appears in Welch 2022; Buonanno 2020 reports 5.9.

**Values that are my own judgement or calculation (all INFERRED)**

- The physics rule (L ≈ ceiling height, η range).
- Central k for influenza and all RSV values.
- The 24-h fluence scaling.
- Hiwar eACH conversions.
- The k implied by the Aerolamp 800 CFM claim.
- Wall reflectance at 222 nm and occupant/furniture shading. No measurement found.

**Conflicts and unexplained results**

- **Influenza k:** 1.8 (Welch 2018) versus 20 (Buonanno 2024).
- **Humidity:** Angel 2025 shows higher k at higher RH, while Blueprint (Sept 2025) says no far-UVC humidity data existed.
- **Ozone:** Peng, Barber and Link measured ozone production, while the NHS Assure report says these lamps are not known to produce ozone.
- **Chamber versus physics:** the 10–30× (chamber) and roughly 1,000× (mouse room) excess eACH over radiometry-based predictions is unexplained by the authors themselves.
- **Hiwar 2025:** the abstract and Table 2 disagree at 1.5 ACH, and the fluence units are misprinted.
- **Danish trial:** total resident-days are given as 94,325 in one place and 94,235 in another. Ozone results were promised in a separate report that I did not find.

**Missing results and settings data**

- PRiVII and the French NCT06569160 trial are listed as completed, but I found no results. Results may exist that I did not find.
- Real nursing-home ventilation and relative-humidity data were not researched here.
