# Readable sources, batch A — attempt of 19 Nov 2026

**Outcome: no full text could be opened in this session. Nothing below upgrades any citation on the page.**

This file records only what was attempted and what is still unverified. It contains no
numbers taken from memory, and no numbers taken from abstracts or summaries, because the
task was to confirm numbers against full text and that was not possible here.

## Why nothing could be read

Two independent blocks, both outside my control:

1. **Outbound network.** Every scholarly host I probed was refused by the session's egress
   proxy at the CONNECT stage (`connect_rejected` — host not on the allowlist). Probed, all
   refused: `pmc.ncbi.nlm.nih.gov`, `www.ncbi.nlm.nih.gov`, `eutils.ncbi.nlm.nih.gov`,
   `www.ebi.ac.uk` (Europe PMC REST search and fullTextXML), `europepmc.org`, `doi.org`,
   `api.crossref.org`, `api.openalex.org`, `api.unpaywall.org`, `api.semanticscholar.org`,
   `core.ac.uk`, `www.biorxiv.org`, `www.medrxiv.org`, `api.biorxiv.org`, `arxiv.org`,
   `www.nature.com`, `www.pnas.org`, `www.nejm.org`, `www.sciencedirect.com`,
   `pubs.acs.org`, `www.mdpi.com`, `blueprintbiosecurity.org`, `scholar.archive.org`,
   `web.archive.org`, `www.researchgate.net`. This rules out curl for every route the task
   lists (PMC, Europe PMC XML + search API, medRxiv/bioRxiv `.full`, publisher OA pages,
   repositories, CDC stacks, Unpaywall/Semantic Scholar/CORE PDF links, arXiv, author pages).

2. **The fetch tool.** The one remaining route, the page-fetching tool, returned a safety
   stop on the first request (van Doremalen 2020 in PMC, item 2). A control fetch of an
   unrelated page succeeded, so the tool itself works; the stop was specific to that request.
   I did not re-issue it or reword it, and I did not try to approach the other virus papers
   around it, so items 1 and 3 were not attempted by that route either.

So for every item below the honest status is **not opened — no full text, no abstract either**.

## Item 1 — far-UVC (222 nm) susceptibility of airborne SARS-CoV-2

Page claim: k = 4.4 cm²/mJ (base e) at 40% RH, range 2.6–12.

Nothing verified. Status of each sub-item:

- **1a Angel, Luhung, de Sá & Peccia 2025** — not opened. The existing note
  (`far_uvc.md` line 51) is explicit that 4.4 (40% RH) / 6.8 (65% RH) came from the
  **bioRxiv preprint abstract page only**, with no confidence intervals and without the
  paper's own definition of k or its log base. The published ES&T version was not read.
  **The log base and the D90↔k conversion therefore remain unchecked, which is the single
  most load-bearing unknown on the page**: if those values are log₁₀-based, the base-e k is
  2.303× larger and the page's 4.4 is wrong by that factor.
- **1b Kitagawa 2023** — not opened. `far_uvc.md` line 52 records it as
  VERIFIED (secondary), from the Blueprint compilation only. Which paper it is, whether the
  measurement was aerosol or surface, and which virus, are all still unconfirmed.
- **1c Lu 2025** — not opened. `far_uvc.md` line 56 records OC43 at 65% RH,
  14.26 ± 0.64 cm²/mJ, again from Blueprint only. Note the page's high end is 12, which does
  not match the 14.26 attributed to Lu; the page's 12 is closer to the Welch 2022 OC43
  sensitive-fraction k₁ of 12.4. **The page's attribution of the high end to Lu et al. looks
  wrong on the existing notes' own evidence**, though neither primary was read here.
- **1d Blueprint Biosecurity 2025** — not opened; `blueprintbiosecurity.org` refused.
- **1e Alternative primaries** — none newly read. `far_uvc.md` already records Buonanno 2020
  (229E 4.1, 95% CI 2.5–4.8) and Welch 2022 (OC43) as VERIFIED from earlier sessions, but I
  did not re-open either, so I cannot vouch for them under this task's stricter rule.

## Item 2 — decay of airborne SARS-CoV-2

Page claim: half-life about an hour (van Doremalen 2020); faster early loss in later work.

- **van Doremalen et al. 2020, NEJM 382:1564** — fetch attempted at
  `https://pmc.ncbi.nlm.nih.gov/articles/PMC7121658/`; stopped by a safety classifier before
  any content was returned. Not retried. `transmission.md` line 390 shows the 1.1 h half-life
  on the page came from a **third-party summary site**, not the paper.
- **Oswin et al. 2022, PNAS** — not attempted, for the reason in §2 above.
  `transmission.md` lines 392 and 573 are clear that the "90% within 20 minutes" figure came
  from a **press-release title in search results**. It remains unsourced to the paper.

## Item 3 — virus breathed out (Mikszewski et al.)

Page claims: SARS-CoV-2 0.52 q/h resting oral breathing, log₁₀ SD 1.2; speaking ≈5× breathing;
"top tenth produce about 90%"; influenza 0.035 resting, 0.17 speaking, log₁₀ SD 0.84.

- **Published Geoscience Frontiers version** — not opened. `transmission.md` line 81 states the
  published version (PMC8622112) was blocked in the earlier session too, and that all these
  numbers come from the **medRxiv preprint**. So preprint-vs-published differences are still
  unchecked on every one of them.
- One thing can be settled **without** the paper, from the existing notes:
  **"the top tenth produce about 90%" is not the paper's statement.** `transmission.md` §1.7
  labels it INFERRED — a calculation from a lognormal with log₁₀ SD 1.2. The arithmetic: for
  a lognormal, the top-p share of the total is Φ(Φ⁻¹(p) + σ) with σ the **natural-log** SD.
  σ = 1.2 × ln10 = 2.763. Φ⁻¹(0.10) = −1.2816. Φ(−1.2816 + 2.763) = Φ(1.481) = 0.931, i.e.
  **93%**, which the notes give. The page's "about 90%" is a rounding of that derived figure.
  **The page should attribute it as derived from the paper's distribution, not as something
  the paper says.** (Same formula for influenza, σ = 0.84 × ln10 = 1.934: Φ(0.652) = 74%.)
- Speaking ≈5× breathing is consistent with the preprint table in `transmission.md`
  (2.6 / 0.52 = 5.0), but that is the preprint, not the published version.

## Summary table

| Item | Claim on the page | Full text opened? | What the full text says | URL opened | Page needs changing? |
|---|---|---|---|---|---|
| 1a Angel 2025, k at 40% RH | k = 4.4 cm²/mJ base e | **No** (not abstract either, this session) | Unknown. Log base and k-definition unchecked | none | **Unresolved — treat 4.4 as unconfirmed** |
| 1b Kitagawa 2023, low end | k = 2.6 | **No** | Unknown; paper identity, aerosol-vs-surface, virus all unconfirmed | none | Unresolved |
| 1c Lu 2025, high end | k = 12 | **No** | Unknown; notes attribute 14.26 to Lu, not 12 | none | **Likely yes — attribution of "12" to Lu looks wrong** |
| 1d Blueprint 2025 (secondary) | source of 1b, 1c | **No** | — | none (host refused) | Unresolved |
| 1e Alternative primaries | — | **No** | — | none | Unresolved |
| 2 van Doremalen 2020 half-life | ~1 h | **No** (fetch stopped) | Unknown; page's 1.1 h traces to a summary site | none | Unresolved |
| 2 Oswin 2022 early loss | "much faster loss in first minutes" | **No** | Unknown; traces to a press-release title | none | **Weakly sourced; soften or drop until read** |
| 3 Mikszewski, published version | 0.52 / ×5 / 0.035 / 0.17 / SDs | **No** | Unknown; all values are from the preprint | none | Cite as preprint, or verify |
| 3 "top tenth ≈ 90%" | stated as if from the paper | n/a — settled by arithmetic | Derived, not stated: 93% from log₁₀ SD 1.2 | none | **Yes — label as derived** |

## Could not be read in full

Routes tried are as listed in §"Why nothing could be read": for every paper, the curl routes
(PMC, Europe PMC fullTextXML and search API, medRxiv/bioRxiv `.full`, publisher OA,
repositories, Semantic Scholar / CORE / Unpaywall / OpenAlex, doi.org, Crossref, arXiv,
archive mirrors) were all refused at the proxy, and the page-fetch route was stopped on the
first paper and not pursued for the others.

**DOIs below are as given in the task brief or already recorded in `far_uvc.md` /
`transmission.md`. The coordinator asked that each DOI be confirmed against a resolver —
`doi.org`, Crossref and Europe PMC were all unreachable, so NONE of these has been
confirmed in this session. Treat every identifier here as unverified.**

1. **Angel D, Luhung I, de Sá S, Peccia J (2025).** Far-UVC inactivation of aerosolised
   SARS-CoV-2. *Environmental Science & Technology*. DOI 10.1021/acs.est.5c09275 (unverified).
   Preprint: bioRxiv DOI 10.1101/2025.06.09.658611 (unverified). No PMID/PMCID known.
2. **Kitagawa et al. (2023).** Exact title, journal and authors **not established** — the page
   cites it only through Blueprint. No DOI, PMID or PMCID can be given without guessing, and
   I will not supply one from memory. This needs identifying before it can be cited.
3. **Lu et al. (2025).** Likewise **not established**; no verified identifier.
4. **Blueprint Biosecurity (2025).** *Blueprint for Far-UVC*, v1.0, 22 Sep 2025. No DOI.
   PDF URL on record in `far_uvc.md`:
   `https://blueprintbiosecurity.org/wp-content/uploads/2026/03/Blueprint-for-Far-UVC-V1.0-9.22.25-1-4.pdf`
   (host refused this session).
5. **van Doremalen N, Bushmaker T, Morris DH, et al. (2020).** "Aerosol and Surface Stability
   of SARS-CoV-2 as Compared with SARS-CoV-1." *New England Journal of Medicine*
   382(16):1564–1567. DOI 10.1056/NEJMc2004973 (unverified). PMCID PMC7121658 (unverified;
   taken from the task brief). PMID not confirmed.
6. **Oswin HP, Haddrell AE, Otero-Fernandez M, et al. (2022).** "The dynamics of SARS-CoV-2
   infectivity with changes in aerosol microenvironment." *PNAS* 119(27):e2200109119.
   DOI 10.1073/pnas.2200109119 (unverified, from the task brief). PMID/PMCID not confirmed.
7. **Mikszewski A, Stabile L, Buonanno G, Morawska L (2022).** "The airborne contagiousness of
   respiratory viruses: a comparative analysis and implications for mitigation."
   *Geoscience Frontiers* 13(6):101285. DOI 10.1016/j.gsf.2021.101285 (unverified, from the
   task brief). PMCID PMC8622112 (unverified, from `transmission.md`).
   Preprint: medRxiv DOI 10.1101/2021.01.26.21250580 (unverified).
8. **Buonanno M, Welch D, Shuryak I, Brenner DJ (2020).** *Scientific Reports* 10:10285,
   far-UVC inactivation of airborne HCoV-229E and OC43. DOI believed
   10.1038/s41598-020-67211-2 — **unverified and not to be used until resolved**.
9. **Welch D, et al. (2022).** *Viruses* 14(4):684. DOI not checked this session.

## What would unblock this

Either (a) add these hosts to the session's allowlist — `pmc.ncbi.nlm.nih.gov`,
`www.ebi.ac.uk`, `doi.org`, `api.crossref.org`, `www.biorxiv.org`, `www.medrxiv.org`,
`pubs.acs.org`, `www.pnas.org`, `www.nature.com`, `blueprintbiosecurity.org` — which would
let curl do the whole job; or (b) run the checks in a session where fetching these papers is
not stopped. Nothing on the page should be re-labelled as verified until one of those happens.
