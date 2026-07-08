import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, role, messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const companyName = company || 'Tata Consumer Products (TCPL)';
  const targetRole = role || 'Management Trainee (Sales & Distribution)';
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. If API Key is present, run dynamic Gemini interview session
  if (apiKey) {
    const systemInstruction = `
You are a senior, highly experienced National Sales Manager (NSM) at Tata Consumer Products Limited (TCPL).
You are conducting a rigorous, corporate Pre-Placement Interview (PPI) for a candidate applying for the role of ${targetRole}.
Your goal is to test their understanding of FMCG concepts: Go-to-Market (GTM) strategy, General Trade vs Modern Trade, Quick Commerce margin management, distributor ROI, beat plans, and portfolio mix (tea, salt, spices, ready-to-eat foods).

Follow these rules:
1. Be professional, firm, and corporate.
2. Evaluate their responses critically. If their answer is vague or lacks corporate terms (like ROI, LPB, beating, trade schemes, primary/secondary sales, fill rates), point out the gaps and ask them to refine it.
3. Incorporate metrics or scenarios from recent news articles if mentioned.
4. Keep your responses structured and relatively short (under 250 words) to maintain conversational pacing.
5. Ask ONE challenging question at a time.
6. Start by welcoming them, stating your role, and asking the first question if this is the start of the chat.

Here is the conversation history:
${messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')}

Generate the next Interviewer response in character. Do not wrap in markdown or add metadata.`;

    try {
      const reply = await new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }]
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

      return res.status(200).json({ reply });
    } catch (err) {
      console.error("Gemini Interview Error:", err);
      // Fallback on error to offline flow
    }
  }

  // 2. Offline / Fallback Flow: 5-Stage Structured Interview
  // We count the number of user messages to determine the current stage of the interview
  const userMessages = messages.filter(m => m.role === 'user');
  const stage = userMessages.length;

  let reply = '';
  switch (stage) {
    case 0:
      reply = `Hello! Welcome to your Tata Consumer Products Limited (TCPL) Pre-Placement Interview. My name is Vikram Sen, and I am the Zonal Sales Head for TCPL West. Today we're evaluating you for the ${targetRole} position.

To start off, please introduce yourself and tell me why you want to work with TCPL, specifically within our integrated Foods & Beverages division (covering tea, salt, spices, Capital Foods, and Organic India).`;
      break;

    case 1:
      reply = `Thank you for sharing your background. Let's jump straight into distribution strategy and operational scenarios.

Assume raw tea leaf crop inflation in Assam has increased our procurement costs by 18%. Our mass-market brand, Tata Tea Agni, is facing severe margin compression. We cannot easily raise the retail price point because our price-sensitive consumers will immediately shift to HUL's value brands or loose tea.

As the Area Sales Manager (ASM) for the region, how would you protect our company's margins and the distributor's ROI under this crop inflation headwind? What variables would you tweak?`;
      break;

    case 2:
      reply = `Interesting. You focused on adjusting pack sizing (grammage calibration) and pushing premium brands to balance the mix.

Let's discuss modern trade and quick commerce conflicts. Quick Commerce platforms (like Zepto and Blinkit) are scaling fast in urban metros and demanding a 20% margin to give top display slots to our premium Tata Sampann spices and Capital Foods products. At the same time, our traditional General Trade distributors are complaining that quick commerce is undercutting their retailer prices and stealing their wholesale volume.

How would you handle this channel conflict as a Zonal Sales Head? Propose a structured coordination strategy.`;
      break;

    case 3:
      reply = `Good structural thinking on separating assortments and product packaging between traditional retail and quick commerce.

Let's test your sales math now. Imagine a TCPL distributor operates in a territory with a monthly secondary sales volume of ₹10 Lakhs. They receive a gross trade margin of 6%. Their monthly operating expense (OpEx) for delivery vans and sales representatives is ₹15,000. 
They maintain 15 days of inventory (worth ₹5 Lakhs) in their warehouse and have 15 days of credit outstanding (₹5 Lakhs) with retailers, meaning their total Working Capital Invested is ₹10 Lakhs.

1) What is their monthly net margin in Rupees?
2) What is their annual ROI %?
3) How would you help them double their annual ROI without increasing their gross margin percentage?`;
      break;

    case 4:
      // Let's summarize the candidate's last answer and provide final feedback
      reply = `Excellent attempt. Let's do the math check:
- Monthly Gross Profit = ₹10 Lakhs * 6% = ₹60,000.
- Monthly Net Profit = ₹60,000 - ₹15,000 (OpEx) = ₹45,000.
- Annual Net Profit = ₹45,000 * 12 = ₹5,40,000.
- Total Working Capital Invested = ₹10 Lakhs (inventory + credit).
- Annual ROI % = (₹5.4L / ₹10L) * 100 = 54%.
- To double their ROI, you correctly identified that we must accelerate Working Capital Rotation (Velocity). By reducing inventory days from 15 to 8 and outstanding credit days to 7, we halve the working capital to ₹5 Lakhs, which doubles the ROI to 108%!

This concludes our mock interview. Here is my evaluation of your performance:

- **FMCG Concepts & Terminology**: 8.5 / 10 (Good utilization of GTM, grammage calibration, and assortment partitioning).
- **Channel Coordination**: 8.0 / 10 (Strong layout on channel separation, though could address distributor trade schemes).
- **S&D Financial Math**: 9.0 / 10 (Accurate calculation of distributor ROI and working capital rotation velocity).

Overall, you have demonstrated a strong readiness for a TCPL PPI. Study our brand portfolio synergies (Capital Foods integration) and keep practicing these numerical flows. All the best!`;
      break;

    default:
      reply = `Thank you again for participating in this TCPL PPI prep session. The mock interview is complete. If you would like to reset and practice again, click the 'Reset Interview' button!`;
      break;
  }

  return res.status(200).json({ reply });
}
