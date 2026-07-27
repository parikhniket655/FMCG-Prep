import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, role, messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const companyName = company || 'TCPL';
  const targetRole = role || 'S&M';
  const apiKey = process.env.GEMINI_API_KEY;

  const isHSBCFin = companyName === 'HSBC' && targetRole === 'Fin';

  // 1. If API Key is present, run dynamic Gemini interview session
  if (apiKey) {
    const interviewerName = isHSBCFin ? 'Sanjay Bhattacharya' : 'Vikram Sen';
    const interviewerTitle = isHSBCFin ? 'Head of Corporate Finance & Global Banking at HSBC India' : 'senior National Sales Manager (NSM) at Tata Consumer Products Limited (TCPL)';
    
    const conceptsTested = isHSBCFin 
      ? 'corporate finance concepts: Debt Service Coverage Ratio (DSCR), Weighted Average Cost of Capital (WACC), credit risk modeling, working capital lending, debt syndication, cross-border treasury management, M&A advisory, and financial covenant stress testing.'
      : 'FMCG concepts: Go-to-Market (GTM) strategy, General Trade vs Modern Trade, Quick Commerce margin management, distributor ROI, beat plans, and portfolio mix (tea, salt, spices, ready-to-eat foods).';

    const systemInstruction = `
You are ${interviewerName}, a senior, highly experienced ${interviewerTitle}.
You are conducting a rigorous, corporate Pre-Placement Interview (PPI) for a candidate applying for the role of ${targetRole} at ${companyName}.
Your goal is to test their understanding of ${conceptsTested}

Follow these rules:
1. Be professional, firm, and corporate.
2. Introduce yourself as ${interviewerName}. Never use placeholders like "[Your Name]" or "[Interviewer Name]".
3. Evaluate their responses critically. If their answer is vague or lacks corporate terms (like ROI, DSCR, WACC, debt syndications, credit analysis, etc. depending on their role), point out the gaps and ask them to refine it.
4. Incorporate metrics or scenarios from recent news articles if mentioned.
5. Keep your responses structured and relatively short (under 250 words) to maintain conversational pacing.
6. Ask ONE challenging question at a time.
7. Start by welcoming them, stating your role, and asking the first question if this is the start of the chat.

Here is the conversation history:
${messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')}

Generate the next Interviewer response in character. Do not wrap in markdown or add metadata.`;

    try {
      const reply = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }]
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
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
              resolve(responseText.trim());
            } catch (e) {
              reject(e);
            }
          });
        });

        request.on('error', reject);
        request.write(payload);
        request.end();
      });

      return res.status(200).json({ reply, isOffline: false });
    } catch (err) {
      console.error("Gemini Interview Error:", err);
      // Fallback on error with diagnostic details
      const errorMsg = err.message || "Unknown error";
      const welcome = isHSBCFin
        ? `Hello! Welcome to your HSBC Corporate Banking & Global Finance Pre-Placement Interview. My name is Sanjay Bhattacharya, and I am the Zonal Head of Corporate Banking for HSBC India. Today we're evaluating you for the Corporate Finance role.

To start off, please introduce yourself and tell me why you want to work with HSBC, specifically within our Global Banking division (covering debt syndications, cross-border treasury, M&A advisory, and corporate credit).`
        : `Hello! Welcome to your Tata Consumer Products Limited (TCPL) Pre-Placement Interview. My name is Vikram Sen, and I am the Zonal Sales Head for TCPL West. Today we're evaluating you for the S&M position.

To start off, please introduce yourself and tell me why you want to work with TCPL, specifically within our integrated Foods & Beverages division (covering tea, salt, spices, Capital Foods, and Organic India).`;

      return res.status(200).json({ 
        reply: welcome, 
        isOffline: true,
        debugError: `Gemini API Call Failed: ${errorMsg}`
      });
    }
  }

  // 2. Smart Offline / Fallback Flow: 5-Stage Structured Interview with Input Validation
  const userMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Welcome response (start of chat)
  if (userMessages.length === 0) {
    const welcome = isHSBCFin
      ? `Hello! Welcome to your HSBC Corporate Banking & Global Finance Pre-Placement Interview. My name is Sanjay Bhattacharya, and I am the Zonal Head of Corporate Banking for HSBC India. Today we're evaluating you for the Corporate Finance role.

To start off, please introduce yourself and tell me why you want to work with HSBC, specifically within our Global Banking division (covering debt syndications, cross-border treasury, M&A advisory, and corporate credit).`
      : `Hello! Welcome to your Tata Consumer Products Limited (TCPL) Pre-Placement Interview. My name is Vikram Sen, and I am the Zonal Sales Head for TCPL West. Today we're evaluating you for the S&M position.

To start off, please introduce yourself and tell me why you want to work with TCPL, specifically within our integrated Foods & Beverages division (covering tea, salt, spices, Capital Foods, and Organic India).`;
    
    return res.status(200).json({ 
      reply: welcome, 
      isOffline: true,
      debugError: "GEMINI_API_KEY is undefined in process.env"
    });
  }

  // Determine stage based on last interviewer question asked
  const lastQuestion = assistantMessages[assistantMessages.length - 1]?.content || '';
  const lastAnswer = userMessages[userMessages.length - 1]?.content || '';
  const cleanAnswer = lastAnswer.trim().toLowerCase();

  // Helper validation rule
  const isInputInvalid = cleanAnswer.length < 15 || 
                         cleanAnswer === 'hello' || 
                         cleanAnswer === 'hi' || 
                         cleanAnswer === 'test' ||
                         cleanAnswer.includes('my name is') && cleanAnswer.length < 30;

  // Stage 0: Welcome -> Waiting for Introduction
  if (lastQuestion.includes('please introduce yourself')) {
    if (isInputInvalid) {
      const clarifyText = isHSBCFin
        ? `Thank you for the greeting, but please share a brief introduction of yourself, your background, and why you'd like to work with HSBC so we can proceed with the corporate banking interview.`
        : `Thank you for the greeting, but please share a brief introduction of yourself, your background, and why you'd like to work with TCPL so we can proceed with the interview.`;
      
      return res.status(200).json({ 
        reply: clarifyText,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }
    
    // Valid: Advance to Stage 1
    if (isHSBCFin) {
      const q1 = `Thank you for sharing your background. Let's dive straight into corporate lending and credit risk scenarios.

Imagine an industrial manufacturing client is requesting a ₹100 Crore Working Capital Term Loan (WCTL) to fund an inventory expansion. However, their debt-to-equity ratio has recently deteriorated to 1.8x, and they have experienced cash flow delays due to raw material import bottlenecks.

As our Senior Risk Relationship Manager, how would you evaluate this credit risk? What financial covenants and security structures would you propose to protect HSBC's capital while supporting the client's working capital needs?`;
      return res.status(200).json({ reply: q1, isOffline: true });
    } else {
      const q1 = `Thank you for sharing your background. Let's jump straight into distribution strategy and operational scenarios.

Assume raw tea leaf crop inflation in Assam has increased our procurement costs by 18%. Our mass-market brand, Tata Tea Agni, is facing severe margin compression. We cannot easily raise the retail price point because our price-sensitive consumers will immediately shift to HUL's value brands or loose tea.

As the Area Sales Manager (ASM) for the region, how would you protect our company's margins and the distributor's ROI under this crop inflation headwind? What variables would you tweak?`;
      return res.status(200).json({ reply: q1, isOffline: true });
    }
  }

  // Stage 1: Credit Risk OR Crop Inflation Case
  if (isHSBCFin && lastQuestion.includes('industrial manufacturing client is requesting')) {
    const hasFinKeywords = cleanAnswer.includes('ratio') || cleanAnswer.includes('debt') || cleanAnswer.includes('equity') || cleanAnswer.includes('dscr') || cleanAnswer.includes('cash') || cleanAnswer.includes('escrow') || cleanAnswer.includes('collateral') || cleanAnswer.includes('security') || cleanAnswer.includes('covenant');
    if (isInputInvalid || !hasFinKeywords) {
      return res.status(200).json({
        reply: `That response lacks financial credit risk frameworks. As a Relationship Manager, you must analyze cash flows (using interest coverage or Debt/EBITDA covenants) and propose security structures (such as asset coverage ratio, inventory margin, or escrow routing). Please elaborate on your credit risk approach.`,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }

    // Valid: Advance to Stage 2 (DCM vs Loan Syndication)
    const q2 = `Excellent risk evaluation. Covenants like DSCR monitoring, raw material inventory margins, and escrow routing are essential to control the cash flows.

Now, let's discuss corporate treasury and syndicated debt. A major telecom client of ours is looking to raise ₹800 Crore to fund a network infrastructure upgrade. They want to issue local bonds but are also open to a syndicated corporate loan.

How would you advise this client on choosing between a direct bond placement in the debt capital markets versus a syndicated consortium loan from HSBC and other lead banks? What are the key financing and relationship tradeoffs for the corporate borrower?`;
    return res.status(200).json({ reply: q2, isOffline: true });
  } 
  
  if (!isHSBCFin && lastQuestion.includes('Assam has increased our procurement')) {
    const hasKeywords = cleanAnswer.includes('price') || cleanAnswer.includes('margin') || cleanAnswer.includes('gram') || cleanAnswer.includes('weight') || cleanAnswer.includes('pack') || cleanAnswer.includes('premium') || cleanAnswer.includes('cost');
    if (isInputInvalid || !hasKeywords) {
      return res.status(200).json({
        reply: `That response is a bit too brief or lacks S&D frameworks. As the Area Sales Manager, you need to propose concrete actions (like adjusting pack weights/grammage calibration, pushing premium brands, or refining trade schemes) to protect margins without losing volume. Please elaborate on your approach.`,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }

    // Valid: Advance to Stage 2 (Q-Commerce Conflict)
    const q2 = `Interesting. You focused on adjusting pack sizing (grammage calibration) and pushing premium brands to balance the mix.

Let's discuss modern trade and quick commerce conflicts. Quick Commerce platforms (like Zepto and Blinkit) are scaling fast in urban metros and demanding a 20% margin to give top display slots to our premium Tata Sampann spices and Capital Foods products. At the same time, our traditional General Trade distributors are complaining that quick commerce is undercutting their retailer prices and stealing their wholesale volume.

How would you handle this channel conflict as a Zonal Sales Head? Propose a structured coordination strategy.`;
    return res.status(200).json({ reply: q2, isOffline: true });
  }

  // Stage 2: Corporate Treasury OR Q-Commerce Conflict
  if (isHSBCFin && lastQuestion.includes('telecom client of ours is looking')) {
    const hasSyndicateKeywords = cleanAnswer.includes('syndicate') || cleanAnswer.includes('bond') || cleanAnswer.includes('market') || cleanAnswer.includes('debt') || cleanAnswer.includes('capital') || cleanAnswer.includes('relation') || cleanAnswer.includes('cost') || cleanAnswer.includes('interest');
    if (isInputInvalid || !hasSyndicateKeywords) {
      return res.status(200).json({
        reply: `Please address the corporate tradeoffs directly. Consider setup costs, fixed versus floating interest rates, regulatory disclosure requirements, and relationship depth. How do direct bond placements and bank syndicated consortiums compare?`,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }

    // Valid: Advance to Stage 3 (WACC Math)
    const q3 = `Good advisory positioning. Syndicated lending indeed provides structured draws, lower regulatory filing hurdles, and critical bank relationships compared to capital market bonds.

Let's test your financial math. Imagine a corporate client is evaluating an infrastructure project requiring an investment of ₹100 Crores. The project's capital structure consists of 60% Debt and 40% Equity (D/E ratio of 1.5x). 
The bank offers debt at an interest rate (Kd) of 10%. The company's required cost of equity (Ke) is 15%. The corporate tax rate is 30%.

1) What is the Weight of Equity (We) and Weight of Debt (Wd)?
2) Calculate the firm's Weighted Average Cost of Capital (WACC %).
3) If WACC increases due to interest rate hikes, what happens to the project's Net Present Value (NPV) and how should the client adjust their capital structure?`;
    return res.status(200).json({ reply: q3, isOffline: true });
  }

  if (!isHSBCFin && lastQuestion.includes('Quick Commerce platforms (like Zepto')) {
    const hasKeywords = cleanAnswer.includes('channel') || cleanAnswer.includes('distributor') || cleanAnswer.includes('separate') || cleanAnswer.includes('sku') || cleanAnswer.includes('pack') || cleanAnswer.includes('price') || cleanAnswer.includes('conflict') || cleanAnswer.includes('portfolio');
    if (isInputInvalid || !hasKeywords) {
      return res.status(200).json({
        reply: `Please address the channel conflict directly. How do you balance traditional GT distributors and modern quick-commerce dark stores? Consider partitioning assortments (SKU mapping) or altering wholesale pricing. What is your coordination strategy?`,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }

    // Valid: Advance to Stage 3 (S&D Math)
    const q3 = `Good structural thinking on separating assortments and product packaging between traditional retail and quick commerce.

Let's test your sales math now. Imagine a TCPL distributor operates in a territory with a monthly secondary sales volume of ₹10 Lakhs. They receive a gross trade margin of 6%. Their monthly operating expense (OpEx) for delivery vans and sales representatives is ₹15,000. 
They maintain 15 days of inventory (worth ₹5 Lakhs) in their warehouse and have 15 days of credit outstanding (₹5 Lakhs) with retailers, meaning their total Working Capital Invested is ₹10 Lakhs.

1) What is their monthly net margin in Rupees?
2) What is their annual ROI %?
3) How would you help them double their annual ROI without increasing their gross margin percentage?`;
    return res.status(200).json({ reply: q3, isOffline: true });
  }

  // Stage 3: WACC Math OR S&D Math
  if (isHSBCFin && lastQuestion.includes('project\'s capital structure consists of 60% Debt')) {
    const hasMathKeywords = cleanAnswer.includes('%') || cleanAnswer.includes('wacc') || cleanAnswer.includes('weight') || cleanAnswer.includes('npv') || cleanAnswer.includes('equity') || cleanAnswer.includes('debt') || /\d+/.test(cleanAnswer);
    if (isInputInvalid || !hasMathKeywords) {
      return res.status(200).json({
        reply: `Please attempt the calculations: 1) Weight of Equity/Debt, 2) WACC %, and 3) WACC impact on NPV. Even rough numbers will help me evaluate your quantitative analytical skills.`,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }

    // Valid: Advance to Stage 4 (Final Feedback)
    const feedback = `Excellent effort. Let's do the math check:
- Weight of Equity (We) = 40% (0.4) | Weight of Debt (Wd) = 60% (0.6).
- Post-tax Cost of Debt = 10% * (1 - 0.3) = 7.0%.
- WACC % = (0.4 * 15%) + (0.6 * 7%) = 6.0% + 4.2% = 10.2%.
- An increase in WACC (hurdle rate) discounts future cash flows at a higher rate, which directly reduces Net Present Value (NPV). To combat this, the corporate client should optimize capital structures by repaying high-interest debt or restructuring debt durations.

This concludes our mock interview. Here is my evaluation of your performance:

- **Corporate Finance Theory**: 8.5 / 10 (Strong understanding of risk structures, debt vs equity tradeoffs, and escrow credit covenants).
- **Advisory & Treasury Relationship**: 8.0 / 10 (Good structuring of consortium lending advantages over DCM).
- **Financial Math**: 9.0 / 10 (Accurate calculation of WACC and capital weights).

Overall, you have demonstrated solid readiness for an HSBC Global Banking role. Keep studying corporate cash flow rotation and capital budgeting frameworks. All the best!`;
    return res.status(200).json({ reply: feedback, isOffline: true });
  }

  if (!isHSBCFin && lastQuestion.includes('monthly secondary sales volume of')) {
    const hasMathKeywords = cleanAnswer.includes('%') || cleanAnswer.includes('roi') || cleanAnswer.includes('rupees') || cleanAnswer.includes('days') || cleanAnswer.includes('capital') || /\d+/.test(cleanAnswer);
    if (isInputInvalid || !hasMathKeywords) {
      return res.status(200).json({
        reply: `Please attempt the calculations: 1) Monthly Net Margin, 2) Annual ROI %, and 3) How to double the ROI (e.g. by rotating capital/velocity). Even rough numbers will help me evaluate your quantitative analytical skills.`,
        isOffline: true,
        isWarning: true,
        debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
      });
    }

    // Valid: Advance to Stage 4 (Final Feedback)
    const feedback = `Excellent attempt. Let's do the math check:
- Monthly Gross Profit = ₹10 Lakhs * 6% = ₹60,000.
- Monthly Net Profit = ₹60,000 - ₹15,000 (OpEx) = ₹45,000.
- Annual Net Profit = ₹45,000 * 12 = ₹5,40,000.
- Total Working Capital Invested = ₹10 Lakhs (inventory + credit).
- Annual ROI % = (₹5.4L / ₹10L) * 100 = 54%.
- To double their ROI, we must accelerate Working Capital Rotation (Velocity). By reducing inventory days from 15 to 8 and outstanding credit days to 7, we halve the working capital to ₹5 Lakhs, which doubles the ROI to 108%!

This concludes our mock interview. Here is my evaluation of your performance:

- **FMCG Concepts & Terminology**: 8.5 / 10 (Good utilization of GTM, grammage calibration, and assortment partitioning).
- **Channel Coordination**: 8.0 / 10 (Strong layout on channel separation, though could address distributor trade schemes).
- **S&D Financial Math**: 9.0 / 10 (Accurate calculation of distributor ROI and working capital rotation velocity).

Overall, you have demonstrated a strong readiness for a TCPL PPI. Study our brand portfolio synergies (Capital Foods integration) and keep practicing these numerical flows. All the best!`;
    return res.status(200).json({ 
      reply: feedback, 
      isOffline: true,
      debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
    });
  }

  // default fallback end
  const end = `Thank you again for participating in this prep session. The mock interview is complete. If you would like to reset and practice again, click the 'Reset Interview' button!`;
  return res.status(200).json({ 
    reply: end, 
    isOffline: true,
    debugError: !apiKey ? "GEMINI_API_KEY is undefined in process.env" : undefined
  });
}
