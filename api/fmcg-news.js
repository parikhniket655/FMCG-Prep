import https from 'https';
import { mockArticles } from './mock-db.js';

// Native Node.js helper to fetch Google News RSS feed
function fetchGoogleNewsRSS() {
  return new Promise((resolve, reject) => {
    const url = 'https://news.google.com/rss/search?q=Tata+Consumer+Products+Limited+FMCG+India&hl=en-IN&gl=IN&ceid=IN:en';
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const items = [];
          const regex = /<item>([\s\S]*?)<\/item>/g;
          let match;
          
          while ((match = regex.exec(data)) !== null) {
            const itemContent = match[1];
            const titleMatch = itemContent.match(/<title>(.*?)<\/title>/);
            const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
            const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
            
            if (titleMatch && linkMatch) {
              let title = titleMatch[1]
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'");
                
              let source = 'Google News';
              const sourceSplit = title.split(' - ');
              if (sourceSplit.length > 1) {
                source = sourceSplit.pop().trim();
                title = sourceSplit.join(' - ').trim();
              }
              
              let dateStr = pubDateMatch ? pubDateMatch[1] : new Date().toUTCString();
              try {
                dateStr = new Date(dateStr).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                });
              } catch (e) {}
              
              const cleanLink = linkMatch[1].trim();
              const lowercaseTitle = title.toLowerCase();
              let category = 'FMCG';
              if (lowercaseTitle.includes('tata') || lowercaseTitle.includes('tcpl') || lowercaseTitle.includes('consumer products')) {
                category = 'Tata Consumer Products';
              } else if (lowercaseTitle.includes('retail') || lowercaseTitle.includes('store') || lowercaseTitle.includes('outlet')) {
                category = 'Retail';
              } else if (lowercaseTitle.includes('commerce') || lowercaseTitle.includes('zepto') || lowercaseTitle.includes('blinkit')) {
                category = 'E-Commerce';
              }

              items.push({
                title,
                url: cleanLink,
                date: dateStr,
                source: source,
                category: category
              });
            }
          }
          resolve(items);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Call Gemini API to summarize and extract metrics for an article
async function enrichArticleWithGemini(article, apiKey) {
  const prompt = `
Analyze the following FMCG/TCPL news article title and source.
Title: "${article.title}"
Source: "${article.source}"

Generate a JSON object matching this structure:
{
  "summary": "A concise 2-3 sentence summary explaining what this news is about, focusing on its implications for FMCG/TCPL, distribution channels, margins, or operations.",
  "category": "FMCG" or "Tata Consumer Products" or "Retail" or "E-Commerce" or "Agri-Business",
  "metrics": [
    { "name": "Short metric name (e.g. Sales Growth, Share Price, Raw Cost)", "value": "Detailed metric value (e.g. +14%, Rs 840, Inflated by 12%)" }
  ]
}

Ensure the metrics list has 2 to 4 items. Do not return any other text, markdown blocks, or commentary. Only return valid JSON.`;

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          const responseText = json.candidates[0].content.parts[0].text;
          const parsed = JSON.parse(responseText);
          resolve({
            ...article,
            summary: parsed.summary || `Live updates on ${article.title}.`,
            category: parsed.category || article.category,
            metrics: parsed.metrics || []
          });
        } catch (e) {
          // Fallback if parsing or Gemini fails
          resolve({
            ...article,
            summary: `Live news coverage from ${article.source} concerning ${article.title}. Learn more by opening the source link.`,
            metrics: [
              { name: "Source Coverage", value: article.source },
              { name: "Published Date", value: article.date }
            ]
          });
        }
      });
    });

    req.on('error', () => {
      resolve({
        ...article,
        summary: `Live news coverage from ${article.source} concerning ${article.title}.`,
        metrics: [
          { name: "Source Coverage", value: article.source }
        ]
      });
    });

    req.write(payload);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = req.body.category || 'All';
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    // 1. Fetch real articles from Google News RSS in real-time
    const liveArticles = await fetchGoogleNewsRSS();
    const topLiveArticles = liveArticles.slice(0, 8); // Limit to top 8 recent articles

    let finalArticles = [];

    if (apiKey) {
      // 2. If API Key is present, enrich the live RSS headlines dynamically using Gemini
      const enriched = await Promise.all(
        topLiveArticles.map(art => enrichArticleWithGemini(art, apiKey))
      );
      finalArticles = [...enriched];
    } else {
      // 3. If no API Key, create clean static summaries/metrics for live RSS headlines,
      // and merge with our high-quality hand-crafted mock DB articles
      const basicLive = topLiveArticles.map((art, idx) => ({
        id: `live_${idx}_${Date.now()}`,
        ...art,
        summary: `Recent reporting on "${art.title}" from ${art.source}. (Connect a Gemini API Key to enable AI-generated deep analysis, S&D metrics, and prep questions).`,
        metrics: [
          { name: "Source Channel", value: art.source },
          { name: "Release Date", value: art.date }
        ]
      }));

      // Merge: Live RSS articles first, then our mock case studies
      finalArticles = [...basicLive, ...mockArticles];
    }

    // Filter by category if requested
    if (category !== 'All') {
      finalArticles = finalArticles.filter(art => art.category === category);
    }

    // Assign unique IDs to ensure no duplicates in React keys
    finalArticles = finalArticles.map((art, idx) => ({
      ...art,
      id: art.id || `scraped_${Date.now()}_${idx}`
    }));

    return res.status(200).json({ articles: finalArticles });
  } catch (err) {
    console.error("Scraper Error:", err);
    // If RSS fetch fails, fall back entirely to our local mock articles
    let fallback = [...mockArticles];
    if (category !== 'All') {
      fallback = fallback.filter(art => art.category === category);
    }
    return res.status(200).json({
      articles: fallback,
      warning: "Live RSS feed unavailable. Displaying offline FMCG preparation cases."
    });
  }
}
