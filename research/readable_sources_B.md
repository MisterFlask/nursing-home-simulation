# Readable sources check B (19 November 2026)

Purpose: for six citations on the public nursing-home simulation page that were read only as an abstract or a news/press summary, find a source whose full text could be opened in this session and quote the number.

How the pages were read. This session's shell has no internet access: every host, Europe PMC included, was refused at the proxy with a 403. All pages were therefore opened with the WebFetch tool, which returns the converted page text through a reader model. Quotes below are what that tool returned as verbatim text. Where a quote is in fragments, the tool split a long sentence. "Full text opened" means Methods/Results text or tables were returned, not just an abstract.

Recurring obstacles:
- pmc.ncbi.nlm.nih.gov answered most requests with a reCAPTCHA page. It returned full text once, for Manica.
- Europe PMC REST (www.ebi.ac.uk) returned RATE_LIMIT_EXCEEDED or a server error on every attempt, and europepmc.org returned a client error.
- pnas.org, pubmed.ncbi.nlm.nih.gov and medrxiv.org refused every fetch (client error).
- eutils.ncbi.nlm.nih.gov is disallowed by robots.txt.
- The PMC open-access copies on AWS S3 (pmc-oa-opendata.s3.amazonaws.com) can be listed, but the .txt, .xml and .pdf files came back as "[binary data]". The listings were still useful, to confirm the PMCID for each DOI.

---

## Item 1. Manica et al. 2022: pre-symptomatic transmission of Omicron

**Full text opened: YES.** URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC9246701

Citation: Manica M, et al. (Reggio Emilia COVID-19 Working Group). Intrinsic generation time of the SARS-CoV-2 Omicron variant: an observational study of household transmission. Lancet Reg Health Eur. 2022;19:100446. DOI 10.1016/j.lanepe.2022.100446; PMID 35791373; PMCID PMC9246701. The DOI, PMID and PMCID are as printed on the PMC page.

Data: 8,903 households and 23,122 infections, Reggio Emilia, Italy, January 2022 (Results; Table 1).

| Quantity | Value as stated | Quote | Location |
|---|---|---|---|
| Share of transmission before symptom onset | 51.1% (95% CrI 45.5–55.7%); summary 51% (45–56%) | "with 51.1% (95%CrI: 45.5–55.7%) of transmission episodes being pre-symptomatic" | Results |
| (same, summary form) | | "about 51% (95%CrI 45–56%) of infections caused by symptomatic individuals being generated before symptom onset" | Summary, Findings |
| Mean intrinsic generation time | 6.84 d (95% CrI 5.72–8.60) | "We estimated a mean intrinsic generation time of 6.84 days (95% credible intervals, CrI, 5.72–8.60)" | Summary, Findings |
| Incubation period (estimated, gamma) | mean 3.49 d (SD 1.20; 95% CrI 3.19–3.77) | "we estimated a gamma-distributed incubation period of mean: 3.49 days (standard deviation: 1.20 days, 95%CrI: 3.19–3.77)" | Results; the estimate comes from a Norwegian superspreading event (Methods) |
| Household serial interval | 2.38 d (95% CrI 2.30–2.47) | "The household serial interval was 2.38 days (95%CrI 2.30–2.47)" | Summary, Findings |
| Pre-symptomatic infectious period | **not estimated** | — | The paper does not estimate when infectiousness begins relative to symptom onset |

**Does the page match?** Yes. "About half of Omicron spread in households happened before symptoms" matches 51% (45–56%). Strictly, the share is of infections caused by people who went on to have symptoms. The "only the abstract was read" caveat can now be dropped. The model's 1.5-day pre-symptomatic infectious period is **not a number in this paper**. It is the modeller's inference: incubation 3.49 d, with about half of transmission before onset. The page should present it as derived from these figures, not stated by them.

Side note for whoever maintains `transmission.md`: that file attributes 6.84 d, 3.49 d and the serial interval to Xu et al. 2023 BMC Medicine. In the Manica full text these are Manica's own estimates. Xu may quote them, but I did not open Xu to check. This was not changed (existing files were not modified).

---

## Item 2. Jang et al. 2022: duration of culturable Omicron virus

**Full text opened: YES** (HTML full text on the publisher site; the PDF is subscriber-only). URL: https://academic.oup.com/ofid/article/9/7/ofac237/6582525

Citation: Jang YR, Kim J-M, Rhee JE, Kim D, Lee N-J, Lee H, Kim J-H, Kim E-J, Kim JY. Clinical Features and Duration of Viral Shedding in Individuals With SARS-CoV-2 Omicron Variant Infection. Open Forum Infect Dis. 2022;9(7):ofac237. DOI 10.1093/ofid/ofac237, as printed on the publisher page. I could not confirm the PMID/PMCID, because PMC returned a CAPTCHA.

Sample: "A total of 110 specimens from 11 patients with confirmed SARS-CoV-2 Omicron variant infection were cultured" (Results).

| Quantity | Value | Quote | Location |
|---|---|---|---|
| Maximum duration of culture positivity, Omicron vs Delta | **max 8 days after symptom onset** (Delta 10, from an earlier cited study) | "the Omicron variant had a shorter duration than the Delta variant (maximum, 8 days and 10 days, respectively)" | Results, "Viral Shedding Periods" |
| Last day with any culture positive | none positive at day 9 | "The viral cultures were negative for all samples taken 9 days after symptom onset." | Discussion |
| Culture positivity, days 0–8 | 22% to 100% by day | "ranged from 22% to 100% in unvaccinated patients within 0–8 days after symptom onset" | Results |
| Individual patients | positive until day 5, 6, 8 | e.g. "the virus culture was positive until 8 days after symptom onset" (Patient 6) | Results, "Clinical Course and Culture Positivity" |

The paper gives no median duration and no survival curve.

**Does the page match? NO, in two respects.**
- (a) The paper's 8 days is counted **from symptom onset**, not "in total".
- (b) It is the **maximum** in 11 patients, not a typical duration.

Suggested wording: "In 11 Omicron patients, virus could be grown for at most 8 days after symptoms began, and none at day 9 (Jang et al. 2022)." The model's 5.5 days after onset, as a mean, sits below this maximum, so it is not contradicted. But the paper does not state 5.5 or 7 days.

**Corroboration, full text opened: YES.** Takahashi K, Kanno T, Ishikane M, et al. Duration of Infectious Virus Shedding by SARS-CoV-2 Omicron Variant–Infected Vaccinees. Emerg Infect Dis. 2022;28(5). DOI 10.3201/eid2805.220197, as printed on the EID page. URL: https://wwwnc.cdc.gov/eid/article/28/5/22-0197_article
- 18 vaccinated patients (15 symptomatic, 3 asymptomatic); 10 of 101 samples yielded virus.
- "Vaccinees with mild or asymptomatic infection shed infectious virus 6–9 days after onset or diagnosis, even after symptom resolution." (Abstract)
- "we detected no infectious virus beyond 10 days after symptom onset" (The Study; Figure 2)
- "Infectious virus was detected up to 9 days after diagnosis" (The Study)

Boucau et al. 2022 (NEJM) could not be opened; see the list at the end.

---

## Item 3. Sah et al. 2021: asymptomatic fraction (elderly; adults/staff)

**Full text of Sah opened: NO.** All routes failed (list at the end). Identifiers were verified as follows:
- Crossref record https://api.crossref.org/works/10.1073/pnas.2109229118 gives authors Sah P, Fitzpatrick MC, Zimmer CF, Abdollahi E, Juden-Kelly L, Moghadas SM, Singer BH, Galvani AP; PNAS 118(34):e2109229118, 2021; CC BY 4.0.
- PMID 34376550 appears in the Buitrago-Garcia 2022 reference list (ref. 16).
- PMCID PMC8403749 is confirmed by the PMC S3 listing, which holds the files `pnas.2109229118.sapp.pdf` etc.

The 35.1% overall and 19.7% elderly figures in `transmission.md` come from the MIDAS summary page and the abstract. **They were not verified against the full text here.**

**What could be read in full about Sah's numbers (secondary, in a full text):** Buitrago-Garcia et al. 2022, PLoS Med (full text opened, URL under item 4), Discussion, reports Sah's long-term care subgroup:
- "Sah and colleagues reviewed studies published up to April 2021 … and their subgroup estimate from studies in long-term care facilities … which include many outbreak investigations … was 17.8%, 95% CI 9.7% to 30.3%, 15 studies [16]."
- So: **Sah, long-term care facility subgroup: 17.8% (95% CI 9.7–30.3%), 15 studies**, as quoted by Buitrago-Garcia.

**Alternative primary reviews read in full:**
1. Buitrago-Garcia 2022 (PLoS Med). It gives no overall pooled estimate: "Heterogeneity was high so we did not estimate a mean proportion of asymptomatic infections overall (interquartile range (IQR) 14% to 50%, prediction interval 2% to 90%)" (Abstract).
   - Contact/outbreak studies: "the summary proportion asymptomatic was 19% (95% confidence interval (CI) 15% to 25%, prediction interval 2% to 70%)" (Abstract).
   - Institutional settings: "institutional settings such as nursing homes (43 studies, IQR 26% to 67%, prediction interval 5% to 93%)" (Results). Also "45% (35% to 56%) for screening studies in institutional settings" (Results, factors analysis).
   - On age: "age was poorly reported and could not be examined in detail" (Discussion).
2. Ma Q, Liu J, Liu Q, et al. Global Percentage of Asymptomatic SARS-CoV-2 Infections Among the Tested Population and Individuals With Confirmed COVID-19 Diagnosis. JAMA Netw Open. 2021;4(12):e2137257. DOI 10.1001/jamanetworkopen.2021.37257, as printed on the page. URL opened: https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2787098 (Results and tables returned; Discussion truncated by the tool). Among confirmed cases, Results:
   - Overall: "the pooled percentage of asymptomatic infections among the confirmed population was 40.50% (95% CI, 33.50%-47.50%)"
   - "47.53% (95% CI, 36.36%-58.70%) in nursing home residents or staff"
   - "30.01% (95% CI, 21.13%-38.88%) in health care workers or in-hospital patients"
   - No estimate for older adults among confirmed cases.
   - These are largely cross-sectional, so some "asymptomatic" cases will be pre-symptomatic. That probably explains why they are higher than Sah's and Buitrago-Garcia's.

**Does the page match?**
- Residents ("about one in five infected older people have no symptoms", model 80% symptomatic): **cannot be checked against Sah's full text.** The nearest figure read in a full text is Sah's long-term care subgroup, 17.8% (9.7–30.3%), quoted in Buitrago-Garcia 2022. That supports "about one in five" for long-term care residents. Suggested wording: "About one in five infected long-term-care residents had no symptoms (17.8%, 95% CI 9.7–30.3%; Sah et al. 2021, as reported in Buitrago-Garcia et al. 2022)." Note that nursing-home screening studies give much higher figures (45%, Buitrago-Garcia; 47.5%, Ma), so this parameter is uncertain.
- Staff ("about a third of infected adults", model 67% symptomatic): Sah's full text could not be read. The 35.1% in the summary is Sah's figure for all ages, not for adults. The readable alternative is Ma 2021: 30.0% (21.1–38.9%) in health-care workers or in-hospital patients, which supports "about a third", roughly. Suggested citation: Ma et al. 2021, or Sah via a summary, labelled as such.

---

## Item 4. Buitrago-Garcia et al. 2022: transmission from asymptomatic people

**Full text opened: YES.** URL: https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003987

Citation: Buitrago-Garcia D, Ipekci AM, Heron L, Imeri H, Araujo-Chaveron L, Arevalo-Rodriguez I, et al. Occurrence and transmission potential of asymptomatic and presymptomatic SARS-CoV-2 infections: Update of a living systematic review and meta-analysis. PLoS Med. 2022;19(5):e1003987. DOI 10.1371/journal.pmed.1003987, as printed on the page.

| Quantity | Value | Quote | Location |
|---|---|---|---|
| Secondary attack rate (SAR) risk ratio, asymptomatic vs symptomatic index | **0.32 (95% CI 0.16–0.64; PI 0.11–0.95)** | "was 0.32 (95% CI 0.16 to 0.64, prediction interval 0.11 to 0.95, 8 studies)" | Abstract |
| (same) | | "Seven studies compared the secondary attack rate from asymptomatic with symptomatic index cases (summary risk ratio 0.32 (95% CI 0.16 to 0.64…" | Results, "Infectiousness of people with asymptomatic or presymptomatic SARS-CoV-2" |
| SAR risk ratio, presymptomatic vs symptomatic | **1.00 (95% CI 0.37–2.71; PI 0.11–9.12)**, 4 studies | "4 studies compared presymptomatic with symptomatic index cases (summary risk ratio 1.00 (95% CI 0.37 to 2.71, prediction interval 0.11 to 9.12)" | Results |

**Does the page match? Yes.** 0.32 is "about a third". The "press summary" caveat can be dropped. One small inconsistency in the paper itself: the Abstract says 8 studies and the Results say seven.

---

## Item 5. US nursing home occupancy

**Full text opened: YES** (the CLA report PDF itself). URL: https://www.claconnect.com/-/media/files/white-papers/cla-41st-annual-snf-cost-comparison-and-industry-trends-report.pdf?rev=df235912a4b641c88f6992b820914079 (linked from https://claconnect.com/en/resources/white-papers/snf-cost-comparison-industry-trends-report). It has no DOI (grey literature).

Citation: CliftonLarsonAllen (CLA). 41st SNF Cost Comparison and Industry Trends Report: The Economics of Skilled Nursing. October 2026. The press release is dated 22 October 2026: https://www.claconnect.com/en/media/2026/clas-41st-snf-report

- **2025, median: 84.8%.** "Nearly half of SNFs are now at 85% occupancy or higher, with the national median occupancy at 84.8%." (p. 5, "State of industry")
- Trend, from the chart "Median Occupancy Rate" (p. 6): 72.9% (2021), 76.8% (2022), 81.0% (2023), **83.5% (2024)**, **84.8% (2025)**.
- Spread: "Approximately 32% of SNFs have occupancy below 75%" (p. 6). The chart "Provider Count by Occupancy Group" shows 48.1% of SNFs at or above 85% in 2025.
- Data: "annual SNF cost report data released by the Centers for Medicare & Medicaid Services (CMS) as of July 2026"; "approximately 11,800 cost reports for fiscal years ended 2025", which is more than two-thirds of Medicare-certified facilities (p. 3). The report does not define how occupancy is calculated: "Each SNF's data was ranked numerically and stratified into percentiles" (p. 4). It is a median of facility-level rates.

Second source, full page opened: KFF State Health Facts, "Certified Nursing Facility Occupancy Rate", https://www.kff.org/other/state-indicator/nursing-facility-occupancy-rates/
- United States **0.79 in 2025** (0.77 in 2024, 0.75 in 2023).
- Notes: "Data are as of July of the noted year." Source: "KFF analysis of Nursing Home Compare". The page does not say whether this is a mean, a median or an aggregate rate, and gives no definition.

**Does the page match?** "The national median in 2025 was 85%" is **supported** (84.8%) by the CLA report read in full. Better sentence: "About 87% of beds filled; the national median occupancy in 2025 was 84.8% (CLA, 41st SNF Cost Comparison and Industry Trends Report, from about 11,800 CMS cost reports; KFF's figure from Nursing Home Compare is 79%)." Cite CLA directly rather than Skilled Nursing News. The model's 87% is above the median, but within the band in which nearly half of facilities sit (85% or more).

---

## Item 6a. Tsang et al. 2023: relative infectiousness of asymptomatic influenza

The Chan 2025 full text was opened (CDC stacks PDF): https://stacks.cdc.gov/view/cdc/261737/cdc_261737_DS1.pdf
- Citation: Chan LYH, Morris SE, Stockwell MS, Bowman NM, Asturias E, Rao S, et al. Estimating the generation time for influenza transmission using household data in the United States. Epidemics. 2025;50:100815. DOI 10.1016/j.epidem.2025.100815, as printed in the PDF.
- Section 2.3, influenza-specific parameters: "we assumed a value of 0.57 (i.e., asymptomatic infected individuals were 43 % less infectious" (Tsang et al., 2023).
- Reference entry: Tsang TK, Wang C, Fang VJ, Perera RAPM, So HC, Ip DKM, Leung GM, Peiris JSM, Cauchemez S, Cowling BJ. Reconstructing household transmission dynamics to estimate the infectiousness of asymptomatic influenza virus infections. Proc Natl Acad Sci USA. 2023;120(33):e2304750120. The PubMed number in that entry is 37549267.

**Tsang full text opened: NO, abstract only.**
- DOI 10.1073/pnas.2304750120 verified on Crossref (https://api.crossref.org/works/10.1073/pnas.2304750120): PNAS 120(33):e2304750120, published 7 August 2023, CC BY-NC-ND 4.0.
- PMCID PMC10436695 is confirmed by the PMC S3 listing (files `pnas.2304750120.*`); PMID 37549267 comes from Chan's reference list.
- Abstract, read at the HKU repository record https://repository.hku.hk/handle/10722/339916 ("There are no files associated with this item"): asymptomatic cases have an "estimated relative infectiousness 0.57 (95% CrI: 0.11, 1.54)".

**Does the page match?** Yes: 0.57, with a range of 0.11 to 1.5 (1.54). However, the Tsang figure is verified only against the abstract and Chan's full text, not against Tsang's own full text.

## Item 6b. McLean (1957–58 Livermore VA UV study), via Tellier 2006

**Tellier full text opened: YES.** URL: https://www.cdc.gov/eid/article/12/11/pdfs/06-0426.pdf

Citation: Tellier R. Review of aerosol transmission of influenza A virus. Emerg Infect Dis. 2006;12(11):1657–1662. DOI 10.3201/eid1211.060426, verified on Crossref: https://api.crossref.org/works/10.3201/eid1211.060426

Passage, in fragments as returned:
- "Even more compelling were the observations made at the Livermore Veterans Administration Hospital during the 1957–58 pandemic."
- "The study group consisted of 209 tuberculous patients confined during their hospitalization to a building with ceiling-mounted UV lights;"
- "396 tuberculous patients hospitalized in other buildings that lacked these lights constituted the control group."
- "…the control group and the personnel sustained a robust outbreak … whereas the group in the irradiated building remained symptom free."
- "The seroconversion rate to influenza A (H2N2) was 19% in the control group, 18% in personnel, but only 2% in the study group (27,28)."
- "So in effect in this study only the aerosol route of infection was blocked, and this step alone achieved near complete protection."

Tellier's ref. 27 reads "McLean RL. Discussion after paper: the mechanism of spread of Asian influenza. Am Rev Respir Dis. 1961;83:36–8." Ref. 28 is Riley RL, Airborne infection, Am J Med 1974;57:466 (DOI 10.1016/0002-9343(74)90140-5, per the Crossref record).

**McLean original: NOT opened.**
- It has no record of its own. The OUP table of contents for Am Rev Respir Dis 83(2 Part 2), February 1961 (https://academic.oup.com/ajrccm/issue/83/2_Part_2) lists no McLean discussion. Pages 29–40 are Jordan WS Jr, "The Mechanism of Spread of Asian Influenza", DOI 10.1164/arrd.1961.83.2P2.29. McLean's discussion at pp. 36–38 therefore appears to sit inside that item (INFERRED from the page ranges).
- The Jordan item page (https://academic.oup.com/ajrccm/article/83/2_Part_2/29/4706806) says "You do not currently have access to this article"; the PDF is for subscribers only.

**Does the page match?** It largely matches: 19% vs 2% seroconversion. Two small corrections: the study ran in the **1957–58** pandemic (the second wave), not 1957 alone; and the outcome was **seroconversion** to H2N2, i.e. serologically measured infection. The citation "McLean, in Tellier 2006" is accurate.

---

## Summary table

| Item | Claim on the page | Full text opened? | What the full text says | URL opened | Page needs changing? |
|---|---|---|---|---|---|
| 1 Manica 2022 | About half of Omicron household spread happened before symptoms (abstract only); model 1.5 d pre-symptomatic | yes | 51.1% (95% CrI 45.5–55.7) of transmission pre-symptomatic; generation time 6.84 d (5.72–8.60); incubation 3.49 d (3.19–3.77); serial interval 2.38 d. No pre-symptomatic period estimated | https://pmc.ncbi.nlm.nih.gov/articles/PMC9246701 | Minor: drop "only the abstract was read"; say the 1.5 d is derived, not reported |
| 2 Jang 2022 | Omicron could be grown for about 8 days in total (news summary); model 5.5 d after onset, 7 d total | yes (HTML) | Maximum 8 days **after symptom onset** in 11 patients; all cultures negative at day 9. Takahashi: 6–9 d, none beyond day 10 | https://academic.oup.com/ofid/article/9/7/ofac237/6582525 ; https://wwwnc.cdc.gov/eid/article/28/5/22-0197_article | **Yes**: "8 days in total" is wrong; it is a maximum of 8 days after onset |
| 3 Sah 2021 | About 1 in 5 infected older people have no symptoms; about a third of adults | **no** (Sah). Alternatives yes | Sah LTCF subgroup 17.8% (9.7–30.3), quoted in Buitrago-Garcia's full text. Buitrago-Garcia: nursing-home studies IQR 26–67%. Ma 2021: NH residents or staff 47.5% (36.4–58.7); HCW or in-hospital patients 30.0% (21.1–38.9) | journals.plos.org (item 4 URL); https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2787098 | Yes: cite the LTCF 17.8% via Buitrago-Garcia, or say Sah was read only in summary; staff "about a third" can be cited to Ma 2021 (30%) |
| 4 Buitrago-Garcia 2022 | Contacts of asymptomatic people infected about a third as often (press summary) | yes | SAR RR 0.32 (95% CI 0.16–0.64; PI 0.11–0.95); presymptomatic RR 1.00 (0.37–2.71) | https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.1003987 | Minor: drop "press summary" caveat |
| 5 Occupancy | National median in 2025 was 85% (CLA via SNN); model 87% | yes (CLA report PDF; KFF page) | CLA: median 84.8% in 2025 (83.5% in 2024), about 11,800 FY2025 CMS cost reports. KFF: US 0.79 in 2025 (measure type not stated) | CLA PDF (URL above); https://www.kff.org/other/state-indicator/nursing-facility-occupancy-rates/ | Minor: cite the CLA report directly and give 84.8%; optionally note KFF 79% |
| 6a Tsang 2023 | 0.57 (0.11–1.5), from Tsang via Chan | abstract only (Tsang); yes (Chan) | 0.57 (95% CrI 0.11, 1.54), from the abstract; Chan Sec. 2.3 uses 0.57 | https://repository.hku.hk/handle/10722/339916 ; https://stacks.cdc.gov/view/cdc/261737/cdc_261737_DS1.pdf | No, but label it "Tsang abstract / as used by Chan" |
| 6b McLean / Tellier | 1957 hospital UV study cut influenza infections | yes (Tellier); no (McLean) | Seroconversion 19% control, 18% staff, 2% UV building; 1957–58 pandemic, second wave | https://www.cdc.gov/eid/article/12/11/pdfs/06-0426.pdf | Minor: "1957–58", "seroconversion" |

## DOIs of papers read in full

- Manica 2022: 10.1016/j.lanepe.2022.100446 (PMID 35791373, PMCID PMC9246701; from the PMC page)
- Jang 2022: 10.1093/ofid/ofac237 (from the OUP page)
- Takahashi 2022: 10.3201/eid2805.220197 (from the EID page)
- Buitrago-Garcia 2022: 10.1371/journal.pmed.1003987 (from the PLOS page)
- Ma 2021: 10.1001/jamanetworkopen.2021.37257 (from the JAMA page)
- Chan 2025: 10.1016/j.epidem.2025.100815 (from the CDC stacks PDF)
- Tellier 2006: 10.3201/eid1211.060426 (Crossref)
- CLA 41st SNF report: no DOI. KFF State Health Facts: no DOI.

## Could not be read in full

1. **Sah P, Fitzpatrick MC, Zimmer CF, Abdollahi E, Juden-Kelly L, Moghadas SM, Singer BH, Galvani AP.** Asymptomatic SARS-CoV-2 infection: a systematic review and meta-analysis. PNAS 2021;118(34):e2109229118. DOI 10.1073/pnas.2109229118 (verified, Crossref); PMID 34376550 (from Buitrago-Garcia ref. 16); PMCID PMC8403749 (verified, PMC S3 listing).
   Routes tried:
   - pmc.ncbi.nlm.nih.gov/articles/PMC8403749, with and without a trailing slash, and the www.ncbi.nlm.nih.gov/pmc redirect: reCAPTCHA
   - Europe PMC fullTextXML: rate limit, then server error
   - pnas.org/doi/10.1073/…, /doi/full/, /doi/pdf/, /syndication/: client error
   - pubmed.ncbi.nlm.nih.gov/34376550: client error
   - zendy.io: empty
   - PMC S3 .txt and .pdf: binary, unreadable by the tool
   - search for a medRxiv preprint or repository copy: none found
2. **Tsang TK, Wang C, Fang VJ, Perera RAPM, So HC, Ip DKM, Leung GM, Peiris JSM, Cauchemez S, Cowling BJ.** Reconstructing household transmission dynamics to estimate the infectiousness of asymptomatic influenza virus infections. PNAS 2023;120(33):e2304750120. DOI 10.1073/pnas.2304750120 (verified, Crossref); PMID 37549267 (from Chan's reference list); PMCID PMC10436695 (verified, PMC S3 listing).
   Routes tried: pmc.ncbi.nlm.nih.gov/articles/PMC10436695 (reCAPTCHA); HKU repository (abstract only, no files); PNAS (refused, as above).
3. **Boucau J, Marino C, Regan J, et al.** Duration of shedding of culturable virus in SARS-CoV-2 Omicron (BA.1) infection. N Engl J Med 2022;387(3):275–277. DOI 10.1056/NEJMc2202092 (verified, Crossref); PMCID PMC9258747 (verified, PMC S3 listing, files `NEJMc2202092_*`). Preprint: medRxiv DOI 10.1101/2022.03.01.22271582 (verified, Crossref).
   Routes tried: PMC (reCAPTCHA); Europe PMC fullTextXML (rate limit); europepmc.org (client error); medRxiv full text (client error).
4. **McLean RL.** Discussion after paper: the mechanism of spread of Asian influenza. Am Rev Respir Dis 1961;83(2 Pt 2):36–38. It has no DOI of its own. It appears to sit within Jordan WS Jr, "The Mechanism of Spread of Asian Influenza", Am Rev Respir Dis 1961;83(2 Pt 2):29–40, DOI 10.1164/arrd.1961.83.2P2.29 (verified on the OUP issue page; the McLean placement is INFERRED from page ranges).
   Routes tried: OUP issue table of contents and Jordan item page (subscriber-only); scilit record (no abstract). Read instead via Tellier 2006.
5. **Bouton TC et al. 2023, Clin Infect Dis.** Not attempted, because Jang (primary) and Takahashi (corroboration) were both read in full.
