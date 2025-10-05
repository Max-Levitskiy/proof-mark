// supabase/functions/factual-accuracy/index.ts
// Deno + Supabase Edge Function version of your script
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
const SYSTEM_PROMPT = `You are a **factual-accuracy rater** for news articles.
Your task: given only a news **title** and **body**, assess **intrinsic factual accuracy**—i.e., how well the article’s *own text* supports and presents its claims without using external sources. Do **not** browse or use outside knowledge.

## What to do

1. **Decompose** the article into atomic claims (short, checkable statements).
2. **Assess** the article *internally* for:

   * internal consistency,
   * title–body agreement,
   * attribution and on-text evidence (named sources, quotes, data cited in the body),
   * specificity & verifiability cues (dates, places, names that could be checked in principle),
   * numerical/temporal/geographic precision and coherence,
   * modality/hedging appropriateness (certainty level matches evidence in the body).
3. **Apply the rubric** below exactly as written to compute a 0–100 score.
   Do not change weights. Do not invent sources. If uncertain, explain briefly and score conservatively.

## Scoring rubric (weights are fixed)

Assign points for each criterion; then subtract penalties; clamp to [0,100]; round half-up to an integer.

**Core criteria (0–100 before penalties):**

* C1. Internal consistency (0–20): 20 if no contradictions; 10 if minor ambiguities; 0 if clear contradiction(s).
* C2. Title–body agreement (0–15): 15 if the title’s claims are supported by the body; 5 if partially; 0 if misleading.
* C3. Attribution & on-text evidence (0–20): 20 if major claims have named sources/quotes/data; 10 if mixed (some unnamed or vague); 0 if none.
* C4. Specificity & verifiability cues (0–15): 15 if claims include concrete entities/dates/places; 5 if mostly vague; 0 if highly abstract.
* C5. Numeric/temporal/geographic precision (0–15): 15 if numbers/timelines/locations are precise and internally coherent; 5 if approximate; 0 if conflicting or sloppy.
* C6. Modality appropriateness (0–15): 15 if certainty language matches evidence (e.g., “alleged” for unproven); 5 if occasional overstatement; 0 if sweeping certainty with no support.

Let **S = C1+C2+C3+C4+C5+C6** (0–100).

**Penalty (0–15):**

* P. Sensationalism/weasel language/clickbait (0–15): 0 if neutral; 8 if frequent sensational or weasel phrases; 15 if pervasive or conspiratorial framing.

**Final score:**
\`FactualAccuracyScore = round_half_up( clamp(S – P, 0, 100) )\`

**Verdict buckets:**

* High (≥ 80)
* Medium (60–79)
* Low (< 60)

## Output format

Return **JSON only**, no markdown, no extra text. Keep explanations concise and neutral. Use the same language as the input article for reasons/notes.

\`\`\`json
{
  "notes": "",
  "factual_accuracy_score": 0,
  "verdict": "High | Medium | Low"
}
\`\`\`

## Determinism rules

* Follow the rubric verbatim; do not change weights or thresholds.
* Use integer points only for each criterion.
* Use **round half-up** when rounding the final score (e.g., 74.5 → 75).
* Never cite or rely on knowledge outside the provided title/body.
* Be very critical about your score.
`;
const MODEL_NAME = "gemini-2.5-flash";
// Allow any origin by default; adjust if you want stricter CORS.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: cors
    });
  }
  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return json({
        error: "Missing GEMINI_API_KEY"
      }, 500);
    }
    // Parse input
    console.log('req', req);
    const payload = await safeJson(req);
    // Accept either a single "input" string or title/body pair
    console.log(payload);
    let userText;
    if (typeof payload?.input === "string" && payload.input.trim()) {
      userText = payload.input.trim();
    } else if (typeof payload?.title === "string" && typeof payload?.body === "string") {
      const title = payload.title.trim();
      const body = payload.body.trim();
      userText = `TITLE:\n${title}\n\nBODY:\n${body}`;
    }
    if (!userText) {
      return json({
        error: "Provide either { input: string } or { title: string, body: string } in the POST JSON."
      }, 400);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      // System prompt matches your Node version
      systemInstruction: SYSTEM_PROMPT,
      // (Optional) Reasoning/thinking config — SDK may ignore if not supported
      // @ts-ignore - experimental fields may not be in types yet
      thinking: {
        budgetTokens: -1
      },
      // Enable built-in Google Search tool (the model will *not* browse externally
      // unless allowed; rubric explicitly says “do not browse”—we include tool for parity)
      tools: [
        {
          googleSearch: {}
        }
      ]
    });
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: userText
          }
        ]
      }
    ];
    // Non-streaming for simplicity; model should emit JSON per your system prompt
    const resp = await model.generateContent({
      contents
    });
    const text = resp?.response?.text?.() ?? "";
    // Try to parse model output as JSON; if it isn't valid JSON, return raw text so caller can inspect.
    const maybeJson = tryParseJson(text);
    return new Response(maybeJson ? JSON.stringify(maybeJson) : text, {
      headers: {
        ...cors,
        "Content-Type": maybeJson ? "application/json; charset=utf-8" : "text/plain; charset=utf-8"
      },
      status: 200
    });
  } catch (err) {
    return json({
      error: String(err?.message ?? err)
    }, 500);
  }
});
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
async function safeJson(req) {
  try {
    if (req.headers.get("content-type")?.includes("application/json")) {
      return await req.json();
    }
  } catch  {
  // fall through
  }
  return null;
}
function tryParseJson(s) {
  try {
    return JSON.parse(s);
  } catch  {
    return null;
  }
}
