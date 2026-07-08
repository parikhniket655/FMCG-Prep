// Shared mock database of news articles and their pre-calculated analyses for TCPL/FMCG prep.
// This ensures that the app works instantly without an API key.

export const mockArticles = [
  {
    id: "mock_tcpl_1",
    title: "Tata Consumer Products Q3 FY26 Results: Net Profit Rises 12% to Rs 388 Crore, Tata Sampann Scales 26%",
    source: "Economic Times Retail",
    date: "January 29, 2026",
    url: "https://economictimes.indiatimes.com/industry/cons-products/fmcg/tata-consumer-products-q3-results-net-profit-rises-to-rs-388-crore/articleshow/107293845.cms",
    summary: "Tata Consumer Products Limited (TCPL) reported a resilient 12% YoY growth in consolidated net profit to Rs 388 crore for Q3 FY26, driven by strong premiumization in tea and a 26% surge in the Tata Sampann pantry portfolio. The company successfully mitigated severe raw tea leaf inflation in Assam through strategic price hikes and grammage calibration in mass brands.",
    category: "Tata Consumer Products",
    metrics: [
      { name: "Q3 FY26 Net Profit", value: "₹388 Crore (+12%)" },
      { name: "Consolidated Revenue", value: "₹4,291 Crore (+11.8%)" },
      { name: "Tata Sampann Growth", value: "+26% YoY" },
      { name: "Raw Tea Inflation", value: "+18% cost headwind" }
    ],
    insights: [
      "TCPL offset a steep 18% spike in raw tea prices in Assam by executing calibrated price hikes and reducing package grammage in value brands like Agni and Tata Tea Premium.",
      "The modern trade and quick commerce channels witnessed robust growth, now contributing over 16% of total domestic sales, led by premium offerings like Tata Tea Gold and specialty coffees.",
      "Operating margins expanded by 40 bps YoY to 15.1% due to post-merger supply chain synergies from the fully integrated Capital Foods and Organic India units."
    ],
    forces: [
      { force: "Competitive Rivalry", rating: "High", description: "Intense promotional pricing from regional loose-tea players and HUL (Brooke Bond) persists, though TCPL maintains dominant category leadership." },
      { force: "Buyer Power", rating: "Medium", description: "In premium tea and spices, strong brand equity shields TCPL, but mass-market consumers show elastic demand under general food inflation." },
      { force: "Supplier Power", rating: "High", description: "Spot-market tea prices in Assam skyrocketed due to crop shortfalls, giving tea growers temporary bargaining leverage." },
      { force: "Threat of Substitutes", rating: "Low", description: "Tea remains the deeply rooted morning beverage of choice in India; minor shifts occur towards packaged coffee in urban micro-segments." },
      { force: "Threat of New Entrants", rating: "Medium", description: "Modern trade & Q-Commerce enable niche direct-to-consumer (D2C) brands to enter, but scaling physical distribution in General Trade remains a massive entry barrier." }
    ],
    questions: [
      {
        question: "How did Tata Consumer Products manage to protect its EBITDA margins in Q3 FY26 despite severe commodity price inflation in raw tea?",
        answer: "TCPL implemented a multi-pronged margin defense strategy: 1) Executing calibrated price hikes of 4-6% across the premium tea portfolio (Tata Tea Gold, Teaveda), 2) Utilizing grammage reduction (retaining the Rs 10 price point but decreasing net weight from 100g to 90g) in price-sensitive mass brands like Tata Tea Agni to prevent consumer defection, 3) Realizing Rs 120 Crore of pre-planned supply chain and distribution synergies from the Capital Foods and Organic India acquisitions, and 4) Premiumizing its sales mix by driving high-margin Tata Sampann spices and premium coffee variants through high-growth quick commerce channels."
      },
      {
        question: "What is the strategic rationale behind TCPL's modern trade and quick commerce push, and how does it affect their SKU distribution strategy?",
        answer: "Modern trade and quick commerce channels cater to urban, affluent, and convenience-seeking consumers. By prioritizing these channels, TCPL can launch premium, higher-margin SKUs (e.g., Tata Coffee Grand, premium spices, Organic India teas) with instant visibility. This helps test premium innovations before rolling them out to traditional trade. However, it requires a distinct supply chain with high fill rates, smaller pack assortments, and optimized margins to absorb the higher slotting fees and advertising costs of digital platforms."
      }
    ]
  },
  {
    id: "mock_tcpl_2",
    title: "TCPL Integrates Capital Foods and Organic India: Eyeing Margin Synergies of Rs 150 Crore in FY27",
    source: "Business Standard",
    date: "February 14, 2026",
    url: "https://www.business-standard.com/companies/news/tcpl-integrates-capital-foods-and-organic-india-eyeing-synergies-126021400234_1.html",
    summary: "Tata Consumer Products is on track to complete the structural integration of its recent acquisitions, Capital Foods (owner of Ching's Secret and Smith & Jones) and Organic India. By merging sales forces, warehousing, and procurement operations, TCPL expects to unlock Rs 150 Crore in cross-selling and supply chain synergies by FY27.",
    category: "FMCG",
    metrics: [
      { name: "Acquisition Synergy Target", value: "₹150 Crore by FY27" },
      { name: "Acquisition Enterprise Value", value: "₹5,100 Crore total" },
      { name: "Addressable Market Expansion", value: "+20% in foods segment" },
      { name: "Sales Force Integration", value: "100% completed" }
    ],
    insights: [
      "The integration expands TCPL's foods segment from basic staples into high-margin, high-growth pantry products like Chinese condiments, instant noodles, and organic health supplements.",
      "TCPL has leveraged its extensive General Trade network (over 4 million retail outlets) to rapidly place Ching's Secret pocket packs in rural and semi-urban kiranas.",
      "Organic India's high international presence provides TCPL with an established channel to export its premium tea and foods portfolios to North America and Europe."
    ],
    forces: [
      { force: "Competitive Rivalry", rating: "High", description: "Nestle (Maggi) and local condiment brands fiercely defend their shelves, limiting pricing power in the instant noodles and sauces category." },
      { force: "Buyer Power", rating: "Medium", description: "Urban consumers are brand-conscious in the organic and specialty foods category, showing less price sensitivity compared to staples." },
      { force: "Supplier Power", rating: "Low", description: "TCPL's contract farming models for organic herbs and raw materials limit supplier price negotiation." },
      { force: "Threat of Substitutes", rating: "Medium", description: "For snacking, dry fruits, traditional snacks, and street food remain powerful alternatives to instant packaged noodles." },
      { force: "Threat of New Entrants", rating: "High", description: "Low barrier to entry for small, localized organic tea or sauce brands, but they struggle to scale beyond regional markets due to high advertising costs." }
    ],
    questions: [
      {
        question: "Explain the distribution synergies TCPL can leverage from the acquisitions of Capital Foods and Organic India.",
        answer: "TCPL has a distribution reach of over 4 million outlets, with a direct reach of 1.5 million. 1) **Direct Reach Cross-Selling**: TCPL can plug Ching's Secret sauces and Organic India teas directly into its existing direct-reach kirana stores, dramatically increasing their retail distribution without adding new sales beats. 2) **Modern Trade & Q-Commerce Leverage**: Organic India has strong footholds in premium modern trade and organic specialty shops. TCPL can use this shelf space to place its premium food products (like specialty teas and Tata Sampann cold-pressed oils). 3) **International Export Channel**: Organic India's established distribution network in the US and Europe can act as a launchpad for TCPL's premium domestic foods portfolio."
      }
    ]
  },
  {
    id: "mock_tcpl_3",
    title: "FMCG S&D Analysis: Direct Distribution vs Wholesale Play Under inflationary Pressure",
    source: "FMCG Chronicle",
    date: "March 02, 2026",
    url: "https://www.fmcgchronicle.com/sd-analysis-direct-reach-vs-wholesale-inflation-2026",
    summary: "As high rural food inflation squeezes consumer wallets, FMCG companies in India are shifting away from credit-driven wholesale networks toward direct distributor models. By expanding direct distribution, brands like HUL, TCPL, and ITC are improving retail stock freshness, controlling pricing, and collecting real-time secondary sales data.",
    category: "Retail",
    metrics: [
      { name: "Direct Reach Target", value: "1.5 Million Outlets" },
      { name: "Wholesale Channel Contribution", value: "Reduced from 45% to 35%" },
      { name: "Retailer Margin (Mass)", value: "8% to 12%" },
      { name: "Distributor ROI Target", value: "22% to 26% annually" }
    ],
    insights: [
      "Direct distribution reduces reliance on the volatile wholesale market, which is highly sensitive to commodity cycles and credit crunches.",
      "Companies are using mobile-based Sales Force Automation (SFA) apps to allow Distributor Sales Representatives (DSRs) to take direct orders, improving lines-per-bill (LPB) metrics.",
      "Expanding direct reach requires maintaining high warehouse fill rates (over 95%) to prevent stockouts and preserve distributor cash flow."
    ],
    forces: [
      { force: "Competitive Rivalry", rating: "High", description: "Top players are racing to lock up the limited shelf space of the top 20% of premium kirana outlets." },
      { force: "Buyer Power", rating: "High", description: "Kirana store owners are highly ROI-conscious and will replace slow-moving stock with competitor products that offer higher trade margins or credit." },
      { force: "Supplier Power", rating: "Low", description: "FMCG giants hold strong bargaining power over local transport, packaging, and raw material suppliers due to sheer bulk procurement." },
      { force: "Threat of Substitutes", rating: "Low", description: "Physical kirana stores remain the primary point of purchase for 90% of Indian households, despite the rise of digital commerce." },
      { force: "Threat of New Entrants", rating: "Low", description: "Building a nationwide direct distribution network requires decades of capital investment and local relationship building, representing an iron-clad moat." }
    ],
    questions: [
      {
        question: "Why is Distributor ROI (Return on Investment) a critical metric for an FMCG company's Area Sales Manager (ASM), and how can the company help improve it?",
        answer: "Distributors are the financial backbone of an FMCG company's sales network; they purchase stock in advance and extend credit to retailers. If a distributor's ROI drops below 18-20%, they may delay payments, understock high-value SKUs, or exit the business. An ASM can improve Distributor ROI by: 1) **Improving Stock Rotation (Working Capital Velocity)**: Ensuring the distributor rotates inventory at least 2-3 times a month (reducing stock days to under 10-15 days), 2) **Optimizing SKU Mix**: Bundling high-margin slow-movers (e.g. ready-to-eat foods) with fast-moving low-margin staples (e.g. salt), 3) **Streamlining Claims**: Promptly settling promotional claims and damaged goods returns to release locked cash, and 4) **Optimizing Credit Outstandings**: Implementing strict credit terms on retailers to reduce the distributor's outstanding debtors."
      }
    ]
  },
  {
    id: "mock_tcpl_4",
    title: "Quick Commerce vs General Trade: The Margin Battleground for Premium FMCG SKUs",
    source: "LiveMint",
    date: "April 11, 2026",
    url: "https://www.livemint.com/industry/retail/quick-commerce-vs-general-trade-fmcg-margin-battleground-11712836279183.html",
    summary: "Quick Commerce platforms (Zepto, Blinkit, Instamart) are transforming urban distribution, commanding up to 25% sales share in metropolitan areas. FMCG companies are allocating higher promotional budgets and dedicated pack sizes to Q-commerce, despite having to shell out higher listing fees and referral commissions compared to traditional General Trade channels.",
    category: "E-Commerce",
    metrics: [
      { name: "Urban Q-Commerce Share", value: "25% in Metro Cities" },
      { name: "Q-Commerce Commission Rate", value: "15% to 22%" },
      { name: "Premium Coffee/Tea Growth", value: "+35% on platforms" },
      { name: "Average Order Value (AOV)", value: "₹450 to ₹600" }
    ],
    insights: [
      "Q-commerce platforms act as a powerful testbed for launching premium, high-margin products (e.g. cold-pressed oils, premium cookies, gourmet tea bags) that would struggle in general trade.",
      "The channel requires rapid warehouse fulfillment and dark-store stocking, making real-time inventory tracking critical to avoid high penalty rates.",
      "Traditional kirana stores (General Trade) remain the volume driver for mass-market SKUs (₹10 packs) where gross margins are lower but reach is deep."
    ],
    forces: [
      { force: "Competitive Rivalry", rating: "Very High", description: "Competitors pay heavy slotting fees for top banner positions and search-key sponsorships on apps, leading to high cost-per-click (CPC) inflation." },
      { force: "Buyer Power", rating: "High", description: "Q-commerce consumers have zero brand loyalty; they switch brands instantly if their first choice is out-of-stock or if a competitor runs a deep discount." },
      { force: "Supplier Power", rating: "Medium", description: "Platforms hold significant power over FMCG brands regarding shelf space allocation, requiring brands to fund promotions." },
      { force: "Threat of Substitutes", rating: "Medium", description: "Physical supermarket visits or monthly grocery runs on Amazon/BigBasket remain alternatives, though Q-commerce holds the convenience advantage." },
      { force: "Threat of New Entrants", rating: "High", description: "New D2C brands can list on platforms quickly, bypassing the traditional physical distributor hurdle to target affluent urban buyers." }
    ],
    questions: [
      {
        question: "How should an FMCG brand like Tata Consumer balance its product assortment and pricing strategy between General Trade (GT) and Quick Commerce?",
        answer: "FMCG brands must implement **Channel Segmentation**: 1) **Assortment Differentiation**: Sell mass-market, high-volume SKUs (small trial packs, standard ₹10 Salt/Tea/Spices) through GT to cater to daily wage and budget-conscious consumers. Sell premium, large-pack, and specialty SKUs (e.g., Tata Tea Gold Leaf, Tata Sampann organic cold-pressed oils, Capital Foods premium sauces, Organic India infusions) through Q-commerce. 2) **Pricing & Promotion**: Maintain price parity to avoid channel conflict, but bundle products on Q-commerce (e.g., 'Buy 2 Get 1' or custom recipe kits) to increase Average Order Value (AOV) and offset the platform's high commission rates. 3) **Supply Chain Speed**: Dedicate separate warehouse sections and transit lanes for Q-commerce to maintain 99%+ fill rates at dark stores, preventing stockouts that cause instant consumer switching."
      }
    ]
  }
];
