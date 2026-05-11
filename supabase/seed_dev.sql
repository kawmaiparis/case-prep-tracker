-- DEV SEED DATA — generated for development and demo purposes
-- Data is realistic but not real practice sessions
-- All rows associated with my user_id (I will replace placeholder before running)
--
-- Score patterns encoded in this data:
--   • Gradual improvement over 8 weeks (week 1 avg ~3.1 → week 8 avg ~4.0)
--   • Creativity persistently weak (avg ~2.9 across all sessions)
--   • Structure is the strongest dimension (avg ~4.1, reaches 4.5+ by week 8)
--   • Math visibly lower in evening sessions (sessions 6, 13, 17, 21, 28)
--   • Profitability cases score ~0.3 higher on average than market_sizing cases

-- ─── STEP 1: Partners ────────────────────────────────────────────────────────
-- Safe to re-run: unique(user_id, name) constraint means duplicates are skipped.

INSERT INTO partners (user_id, name, is_paid_coach) VALUES
  ('YOUR_USER_UUID_HERE', 'Annika',  true),
  ('YOUR_USER_UUID_HERE', 'Robbie',  false),
  ('YOUR_USER_UUID_HERE', 'Adam',    false),
  ('YOUR_USER_UUID_HERE', 'Mix',     false),
  ('YOUR_USER_UUID_HERE', 'Noon',    false),
  ('YOUR_USER_UUID_HERE', 'Poomer',  false)
ON CONFLICT (user_id, name) DO NOTHING;

-- ─── STEP 2: Sessions ────────────────────────────────────────────────────────
-- Uses a VALUES-based derived table joined to partners and case_types
-- so partner/case_type names are resolved to IDs automatically.

INSERT INTO sessions (
  user_id, date, partner_id, case_type_id, case_name, industry,
  score_structure, score_math, score_creativity, score_communication, score_data_analysis,
  notes
)
SELECT
  'YOUR_USER_UUID_HERE'::uuid,
  d.session_date,
  p.id,
  ct.id,
  d.case_name,
  d.industry,
  d.score_structure,
  d.score_math,
  d.score_creativity,
  d.score_communication,
  d.score_data_analysis,
  d.notes
FROM (VALUES

  -- ── Week 1 (Mar 15–21) · avg ~3.1 ──────────────────────────────────────
  ('2026-03-16'::date,'Annika','profitability',
   'RetailCo Margin Compression','retail',
   4,3,3,3,3,
   'Identified the revenue vs. cost split quickly but got stuck on benchmarking SG&A against industry norms. Need better frameworks for retail cost structure.'),

  ('2026-03-18'::date,'Robbie','market_entry',
   'CloudSpark Market Entry','tech',
   4,3,2,3,3,
   'Missed the competitive response component in the market entry framework — framed it purely as an attractiveness assessment. Need to build in defender dynamics earlier.'),

  ('2026-03-20'::date,'Adam','market_sizing',
   'HealthPath Patient Sizing','healthcare',
   3,3,3,3,3,
   'Top-down and bottom-up estimates diverged by 40% — spent too long reconciling rather than committing to a number. Structure was adequate but math felt slow.'),

  -- ── Week 2 (Mar 22–28) · avg ~3.1 ──────────────────────────────────────
  ('2026-03-23'::date,'Annika','profitability',
   'FinBank Cost Structure','banking',
   4,4,3,3,3,
   'Good revenue decomposition by product line; Annika noted the cost allocation to shared services could have been challenged earlier. Need to push on fixed vs. variable split more aggressively.'),

  ('2026-03-25'::date,'Mix','profitability',
   'FMCG Brand Recovery','consumer goods',
   4,3,2,3,3,
   'Framed the profitability tree correctly but did not explore pricing power as a lever. Creativity score reflects the narrow solution space explored.'),

  -- Evening session #1: math drops to 2
  ('2026-03-27'::date,'Noon','market_sizing',
   'TelecomCo Revenue Sizing','telecom',
   3,2,3,3,3,
   'Evening session — mental math was noticeably slower. Lost ~2 minutes on an ARPU calculation that should have been straightforward. Need to practice numerical estimation under fatigue.'),

  -- ── Week 3 (Mar 29 – Apr 4) · avg ~3.3 ─────────────────────────────────
  ('2026-03-30'::date,'Annika','market_entry',
   'FreshMart Channel Expansion','retail',
   4,3,3,4,3,
   'Improved on competitor response vs. the last market entry session. Communication was strong — Annika said the narrative was easy to follow. Customer segmentation could have been more granular.'),

  ('2026-04-01'::date,'Robbie','profitability',
   'EnergyNow Unit Economics','energy',
   4,3,2,3,4,
   'Good data analysis on the exhibit showing fuel cost per unit — picked out the trend quickly. Creativity was limited; only proposed two levers when four or five were plausible.'),

  ('2026-04-03'::date,'Adam','market_entry',
   'NeoBank Southeast Asia Entry','banking',
   4,4,3,3,3,
   'Stronger math this session — estimated market revenue within 15% of the given figure. Framework was standard but logically consistent; Adam noted the synthesis was clear.'),

  -- ── Week 4 (Apr 5–11) · avg ~3.2 ───────────────────────────────────────
  ('2026-04-07'::date,'Annika','market_sizing',
   'TechCo SaaS Sizing','tech',
   4,4,3,3,3,
   'Chose a bottom-up approach appropriately given the data available. Sanity-checked the output against known industry benchmarks — Annika flagged this as good practice.'),

  ('2026-04-08'::date,'Mix','profitability',
   'MediCo Cost Recovery','healthcare',
   4,3,3,4,3,
   'Segmented the cost base by fixed and variable correctly. Communication improved — Mix said the pacing was better. Math was adequate but not sharp under follow-up questions.'),

  ('2026-04-09'::date,'Poomer','m&a',
   'GlobalBank Merger','banking',
   3,3,3,3,3,
   'Synergy estimation was directionally right but lacked specificity on headcount overlap. Need to build a more systematic approach to cost-side synergies in M&A cases.'),

  -- Evening session #2: math drops to 2
  ('2026-04-11'::date,'Noon','m&a',
   'RetailMerge Synergies','retail',
   4,2,3,3,3,
   'Evening session — struggled with the accretion/dilution math, which is unusual. Qualitative analysis of the strategic rationale was solid. Will revisit this math in isolation.'),

  -- ── Week 5 (Apr 12–18) · avg ~3.4 ──────────────────────────────────────
  ('2026-04-13'::date,'Annika','profitability',
   'FMCG Pricing Recovery','consumer goods',
   4,4,3,4,3,
   'Best communication session to date — Annika said the storyline from diagnosis to recommendation was clean. Math was accurate and fast. Creativity remains the ceiling.'),

  ('2026-04-14'::date,'Robbie','market_entry',
   'NextGen Platform Expansion','tech',
   4,3,3,3,4,
   'Strong data analysis on the competitive landscape exhibit. Framework was solid but the go-to-market recommendation was too generic. Need sharper prioritization on the key risks.'),

  ('2026-04-16'::date,'Adam','market_sizing',
   'RareDisease Market Size','healthcare',
   4,4,3,3,3,
   'Estimate accurate to within 20% using a patient-prevalence approach. Structure score reflects a clean segmentation. Creativity gap shows in the limited range of sizing approaches considered.'),

  -- Evening session #3: math drops to 2
  ('2026-04-18'::date,'Mix','other',
   'TelecomCo NPS Turnaround','telecom',
   4,2,3,3,4,
   'Evening session — data analysis was strong, identified the pricing anomaly in the exhibit immediately. Quantitative portion had calculation errors under pressure, consistent with the evening fatigue pattern.'),

  -- ── Week 6 (Apr 19–25) · avg ~3.7 ──────────────────────────────────────
  ('2026-04-20'::date,'Annika','m&a',
   'TechVentures Acquisition','tech',
   4,4,3,4,4,
   'Comprehensive synergy analysis across revenue and cost dimensions. Annika noted the valuation logic was more disciplined than previous M&A sessions. Communication was structured and confident.'),

  ('2026-04-21'::date,'Robbie','profitability',
   'PetroCo Margin Recovery','energy',
   5,4,3,3,4,
   'Best structure score in eight weeks — issue tree was MECE and prioritized correctly from the start. Data analysis on the unit economics exhibit was clean. Creativity still anchored around cost reduction.'),

  ('2026-04-23'::date,'Adam','market_entry',
   'GourmetMart UK Entry','retail',
   4,4,3,4,4,
   'Timing and communication both strong. Identified the regulatory risk proactively — Adam said it was the key differentiating observation in the case. Framework execution was smooth throughout.'),

  -- Evening session #4: math holds at 3 (improving fatigue management)
  ('2026-04-25'::date,'Noon','market_sizing',
   'RegionalBank Revenue Sizing','banking',
   4,3,3,4,3,
   'Evening session — math held up better than previous evening sessions. Sizing approach was methodical. Communication score reflects clear signposting throughout.'),

  -- ── Week 7 (Apr 26 – May 2) · avg ~3.9 ─────────────────────────────────
  ('2026-04-27'::date,'Annika','profitability',
   'FMCG Portfolio Rationalization','consumer goods',
   5,4,3,4,4,
   'Annika called out the prioritization logic as the strongest seen this prep cycle. Broke the profitability tree into three testable hypotheses and eliminated two within four minutes. Creativity still at floor.'),

  ('2026-04-28'::date,'Robbie','market_entry',
   'MedEquip Distribution Entry','healthcare',
   4,4,3,4,4,
   'Good entry on the customer segmentation — split by payer type rather than geography, which was the right lens. Data analysis and communication both scored well.'),

  ('2026-04-29'::date,'Mix','profitability',
   'FashionCo Profitability Review','retail',
   5,4,3,4,4,
   'Cleanest profitability structure yet. Mix said the hypothesis-led approach made the case feel like a real diagnostic rather than a framework walkthrough. Math was sharp throughout.'),

  ('2026-05-01'::date,'Adam','market_sizing',
   'CloudDevice Market Sizing','tech',
   4,4,3,4,4,
   'Bottom-up estimate from device adoption rates landed within 12% of the given figure. Synthesis was concise — stated the answer and key assumption in one sentence.'),

  ('2026-05-02'::date,'Annika','market_entry',
   'DigiBank Asia Pacific Entry','banking',
   5,4,3,4,4,
   'Annika confirmed this was the most complete market entry framework seen this cycle. Covered addressability, competitive dynamics, regulatory barriers, and phasing in the opening structure.'),

  -- ── Week 8 (May 3–10) · avg ~4.0 ───────────────────────────────────────
  ('2026-05-04'::date,'Annika','profitability',
   'RetailGroup Q1 Recovery','retail',
   5,4,3,4,4,
   'Strong hypothesis-led opening; narrowed from five potential drivers to two within the first four minutes. Math and data analysis both clean. Annika noted improvement in executive presence at the synthesis.'),

  -- Evening session #5: math drops to 3 (pattern persists but improving)
  ('2026-05-06'::date,'Robbie','market_entry',
   'CloudPlatform Growth Entry','tech',
   5,3,3,4,4,
   'Evening session — structure and communication held up well, but math was slower than usual on the TAM estimation. The pattern of math degradation in later sessions is consistent and worth addressing directly.'),

  ('2026-05-08'::date,'Poomer','m&a',
   'BioHealth Strategic Acquisition','healthcare',
   4,4,3,4,4,
   'Valuation bridge was well-structured; distinguished strategic vs. financial synergies clearly. Poomer noted the recommendation was decisive and well-supported.'),

  ('2026-05-10'::date,'Annika','other',
   'FinServ Operating Model','banking',
   5,4,4,4,4,
   'Annika pushed on an unconventional framing early — responded by restructuring the problem from scratch rather than forcing the original tree. Strongest creativity score to date. Communication and structure both at ceiling.')

) AS d(session_date, partner_name, case_type_name, case_name, industry,
       score_structure, score_math, score_creativity, score_communication, score_data_analysis,
       notes)
JOIN partners  p  ON p.name  = d.partner_name    AND p.user_id = 'YOUR_USER_UUID_HERE'::uuid
JOIN case_types ct ON ct.name = d.case_type_name;
