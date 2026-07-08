import https from 'https';
import { mockArticles } from './mock-db.js';

// Clean title helper to match titles
const cleanString = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const article = req.body;
  if (!article || !article.title) {
    return res.status(400).json({ error: 'Article title is required' });
  }

  // 1. Check if the article is in our pre-calculated mock database
  const cleanedTitle = cleanString(article.title);
  const matchedMock = mockArticles.find(mock => cleanString(mock.title) === cleanedTitle || mock.id === article.id);

  if (matchedMock) {
    return res.status(200).json({ article: { ...article, ...matchedMock } });
  }

  // 2. If it is a new article and we have a Gemini API key, generate dynamic analysis
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    const prompt = `
Analyze the following FMCG/TCPL news article for a Pre-Placement Interview (PPI) preparation dashboard.
Title: "${article.title}"
Source: "${article.source}"
Summary: "${article.summary}"

Generate a JSON object matching this structure:
{
  "insights": [
    "Insight 1 explaining a critical implication of this news for FMCG operations, sales, or margins.",
    "Insight 2 detailing how it impacts distribution channels (General Trade, Modern Trade, or Q-Commerce).",
    "Insight 3 discussing the corporate strategy, portfolio play, or cost mitigation approach."
  ],
  "forces": [
    { "force": "Competitive Rivalry", "rating": "Low" or "Medium" or "High", "description": "Brief description of how this news affects competition." },
    { "force": "Buyer Power", "rating": "Low" or "Medium" or "High", "description": "Brief description of how it affects retail or consumer power." },
    { "force": "Supplier Power", "rating": "Low" or "Medium" or "High", "description": "Brief description of how it affects sourcing and material costs." },
    { "force": "Threat of Substitutes", "rating": "Low" or "Medium" or "High", "description": "Brief description of alternative products." },
    { "force": "Threat of New Entrants", "rating": "Low" or "Medium" or "High", "description": "Brief description of ease of market entry." }
  ],
  "questions": [
    {
      "question": "A tough, challenging TCPL Pre-Placement Interview (PPI) question regarding the strategic issues in this article.",
      "answer": "A detailed model answer outlining structured sales/distribution/operational frameworks (e.g. GTM strategies, margin controls, channel conflict resolution) that a candidate should deliver to impress the interview panel."
    },
    {
      "question": "Another strategic interview question focusing on metrics, ROI, or supply chain dynamics based on the article.",
      "answer": "A detailed model answer showing corporate strategy, synergy extraction, or cost management frameworks."
    }
  ]
}

Only return valid JSON matching the structure. Do not return markdown wrap (like \`\`\`json) or extra text.`;

    try {
      const result = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const request = https.request(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        }, (response) => {
          let body = '';
          response.on('data', chunk => { body += chunk; });
          response.on('end', () => {
            try {
              const json = JSON.parse(body);
              if (json.error) {
                reject(new Error(json.error.message || 'Gemini error'));
                return;
              }
              const responseText = json.candidates[0].content.parts[0].text;
              resolve(JSON.parse(responseText));
            } catch (e) {
              reject(e);
            }
          });
        });

        request.on('error', reject);
        request.write(payload);
        request.end();
      });

      return res.status(200).json({
        article: {
          ...article,
          insights: result.insights || [],
          forces: result.forces || [],
          questions: result.questions || []
        }
      });
    } catch (err) {
      console.error("Gemini Analysis Error:", err);
      // Fallback on error
    }
  }

  // 3. Offline/Fallback analysis generation for live articles (when no API key or on error)
  const category = article.category || 'FMCG';
  const defaultInsights = [
    `The news concerning "${article.title}" points to shifting dynamics in distribution efficiency and SKU velocity across urban and rural markets.`,
    `Managing trade margins (distributor margin at 5-6%, retailer margin at 8-12%) is critical to retain shelf-share in General Trade during this disruption.`,
    `FMCG brands must accelerate secondary sales tracking and digital sales force automation (SFA) to react quickly to competitive stock placements.`
  ];

  const defaultForces = [
    { force: "Competitive Rivalry", rating: "High", description: "Aggressive trade promotions and quick-commerce discounts by direct competitors squeeze shelf placement." },
    { force: "Buyer Power", rating: "Medium", description: "Traditional kirana retailers demand extended credit terms and higher margins under food inflation." },
    { force: "Supplier Power", rating: "Medium", description: "Raw material and packaging costs are volatile, prompting brands to reduce pack weights (grammage calibration)." },
    { force: "Threat of Substitutes", rating: "Low", description: "Standard grocery pantry items have low brand-switching costs, but strong brands retain high pull." },
    { force: "Threat of New Entrants", rating: "Medium", description: "Urban D2C brands can launch easily on quick-commerce, but scaling to 8M General Trade kiranas remains highly difficult." }
  ];

  const defaultQuestions = [
    {
      question: `Given the situation described in "${article.title}", how would you as an Area Sales Manager (ASM) resolve channel conflicts between physical distributors and fast-growing Quick Commerce dark stores?`,
      answer: "This is a classic channel conflict problem. As an ASM, I would handle this by: 1) Assortment Partitioning: Reserving distinct SKUs for different channels (e.g. premium large-packs and multi-packs for Quick Commerce; single-use, low-unit-price-points (LUPPs) like Rs 5/10/20 packs for General Trade kiranas). This prevents direct price comparison. 2) Dedicated Distributors: Appointing distinct sub-distributors specifically tasked with Quick Commerce dark store fulfillment to avoid cross-selling into kirana beats. 3) Promotional Separation: Creating app-exclusive bundles for Q-Commerce while providing traditional trade schemes (e.g., '12+1 free' displays) for General Trade retailers to maintain their ROI."
    },
    {
      question: "How does inflation in raw packaging materials affect an FMCG company's operating margin, and what pricing and sizing strategies can protect EBITDA?",
      answer: "Raw material inflation compresses gross margins. To protect EBITDA without losing volume: 1) Grammage Calibration (Indirect Price Hike): Instead of raising the sticker price, reduce the weight of mass-volume packs (e.g., selling 90g instead of 100g at Rs 10). This maintains the key price barrier. 2) Premiumization Push: Allocate higher marketing and shelf space to premium, high-margin SKUs (e.g. Tata Tea Gold instead of Tata Tea Agni) to lift the overall portfolio margin mix. 3) Logistics Efficiency: Optimize warehouse hub placements and maximize truck-load utilization (increasing drop size per outlet) to lower the distribution cost-to-serve."
    }
  ];

  return res.status(200).json({
    article: {
      ...article,
      insights: defaultInsights,
      forces: defaultForces,
      questions: defaultQuestions,
      warning: "Offline analysis mode active. Showing generic FMCG/TCPL preparation guide."
    }
  });
}
