import React, { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, 
  BookOpen, 
  MessageSquare, 
  Calculator, 
  Award, 
  RefreshCw, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  TrendingDown, 
  Award as PrizeIcon, 
  HelpCircle, 
  Coins, 
  Scale, 
  Layers, 
  GitMerge, 
  Search, 
  AlertTriangle,
  Send,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [savedArticleIds, setSavedArticleIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [scraperError, setScraperError] = useState(null);
  
  // Chat simulator state
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // S&D Math Calculator state
  const [salesVal, setSalesVal] = useState(1000000); // 10 Lakhs
  const [grossMargin, setGrossMargin] = useState(6); // 6%
  const [opexVal, setOpexVal] = useState(15000); // 15,000
  const [inventoryDays, setInventoryDays] = useState(15); // 15 days
  const [creditDays, setCreditDays] = useState(15); // 15 days

  // Fetch initial articles on mount
  useEffect(() => {
    fetchArticles();
    // Initialize interview chat
    resetInterview();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchArticles = async () => {
    setIsLoading(true);
    setScraperError(null);
    try {
      const response = await fetch('/api/fmcg-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'All' })
      });
      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
        // Default to select first article if none selected
        if (data.articles.length > 0 && !selectedArticle) {
          setSelectedArticle(data.articles[0]);
        }
      }
      if (data.warning) {
        setScraperError(data.warning);
      }
    } catch (err) {
      console.error(err);
      setScraperError("Could not connect to scraping engine. Showing offline prep studies.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectArticle = async (article) => {
    // If it has insights/questions, it's already analyzed. If not, trigger API analysis.
    if (article.insights && article.questions) {
      setSelectedArticle(article);
      setActiveTab('analysis');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article)
      });
      const data = await response.json();
      if (data.article) {
        // Update article in list and select it
        setArticles(prev => prev.map(a => a.title === article.title ? data.article : a));
        setSelectedArticle(data.article);
        setActiveTab('analysis');
      }
    } catch (err) {
      console.error(err);
      // Fallback: select the article as is
      setSelectedArticle(article);
      setActiveTab('analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveArticle = (articleId) => {
    setSavedArticleIds(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId) 
        : [...prev, articleId]
    );
  };

  // Interview simulator handlers
  const resetInterview = async () => {
    setChatMessages([]);
    setIsChatLoading(true);
    try {
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: "Tata Consumer Products",
          role: "Management Trainee (Sales & Distribution)",
          messages: []
        })
      });
      const data = await response.json();
      setChatMessages([{ role: 'assistant', content: data.reply }]);
    } catch (e) {
      setChatMessages([{ role: 'assistant', content: "Hello! Welcome to your Tata Consumer Products Pre-Placement Interview. Let's start with your background and interest in joining TCPL's foods and beverages divisions." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;

    const newMessages = [...chatMessages, { role: 'user', content: userInput }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: "Tata Consumer Products",
          role: "Management Trainee (Sales & Distribution)",
          messages: newMessages
        })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I apologize, I lost connection to the interview server. Please try resetting the interview." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Math calculations
  const monthlyGrossProfit = salesVal * (grossMargin / 100);
  const monthlyNetProfit = monthlyGrossProfit - opexVal;
  const annualNetProfit = monthlyNetProfit * 12;
  
  // Working capital calculations
  const inventoryValue = salesVal * (inventoryDays / 30);
  const creditValue = salesVal * (creditDays / 30);
  const workingCapitalInvested = inventoryValue + creditValue;
  
  const annualROI = workingCapitalInvested > 0 
    ? ((annualNetProfit / workingCapitalInvested) * 100).toFixed(1) 
    : 0;

  // Filter lists for tabs
  const savedArticles = articles.filter(a => savedArticleIds.includes(a.id));

  return (
    <div className="min-h-screen bg-[#080C14] text-gray-200 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0B0F19] border-b md:border-b-0 md:border-r border-gray-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-extrabold text-white text-lg tracking-wider">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-widest text-white uppercase">TCPL Prep</h1>
              <p className="text-[10px] text-gray-500 font-mono">PPI Portal v2.0</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-red-600/10 text-red-500 border border-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`}
            >
              <Newspaper className="w-4 h-4" />
              Live Intelligence
            </button>

            <button 
              onClick={() => {
                if (selectedArticle) setActiveTab('analysis');
                else setActiveTab('dashboard');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'analysis' 
                  ? 'bg-red-600/10 text-red-500 border border-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Case Analysis Deck
            </button>

            <button 
              onClick={() => setActiveTab('interview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'interview' 
                  ? 'bg-red-600/10 text-red-500 border border-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Mock Interview
            </button>

            <button 
              onClick={() => setActiveTab('math')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'math' 
                  ? 'bg-red-600/10 text-red-500 border border-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`}
            >
              <Calculator className="w-4 h-4" />
              S&D Math Lab
            </button>

            <button 
              onClick={() => setActiveTab('deepdive')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'deepdive' 
                  ? 'bg-red-600/10 text-red-500 border border-red-900/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border border-transparent'
              }`}
            >
              <Award className="w-4 h-4" />
              TCPL Masterclass
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-gray-800 bg-[#090D17]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-xs text-gray-300">
              KP
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Ketan Parikh</p>
              <p className="text-[9px] text-gray-500 font-mono truncate">TCPL PPI Prep Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#080C14]">
        
        {/* Top Header */}
        <header className="p-6 bg-[#0B0F19]/60 backdrop-blur-md border-b border-gray-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-900/30 text-red-400 border border-red-800/50">
              TCPL TARGET
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white hidden sm:block">
              {activeTab === 'dashboard' && 'FMCG & Consumption Intelligence Hub'}
              {activeTab === 'analysis' && 'Structured Case Analysis Deck'}
              {activeTab === 'interview' && 'Interactive Mock Interviewer'}
              {activeTab === 'math' && 'Sales & Distribution Calculator'}
              {activeTab === 'deepdive' && 'Tata Consumer Products Masterclass'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Scraping state trigger */}
            {activeTab === 'dashboard' && (
              <button 
                onClick={fetchArticles}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scraping Live News...' : 'Scrape Live News'}
              </button>
            )}
            
            {/* Saved Deck Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121724] border border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <Bookmark className="w-3.5 h-3.5 text-red-500" />
              Saved Cases: <span className="text-white ml-0.5">{savedArticleIds.length}</span>
            </div>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            
            {/* 1. Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Warning message from local proxy */}
                {scraperError && (
                  <div className="p-4 bg-yellow-950/20 border border-yellow-800/40 rounded-xl text-xs text-yellow-400 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Scraper Notification: </span>
                      {scraperError}
                    </div>
                  </div>
                )}

                {/* Hero Dashboard Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wider">Strategic S&D Case Modeling</h3>
                      <p className="text-xs text-gray-400 mt-2 max-w-lg leading-relaxed">
                        Prepare for Tata Consumer Products PPI by analyzing recent news. Select any news article below to unlock its Porter's Five Forces impact study, margin metric cards, and strategic Q&A.
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-red-400 font-bold uppercase tracking-wider cursor-pointer hover:text-red-300" onClick={() => {if (selectedArticle) setActiveTab('analysis')}}>
                      View Active Case Breakdown <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#0B0F19] border border-gray-800 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Deck Analysis</h4>
                      {selectedArticle ? (
                        <div className="mt-3">
                          <p className="text-sm font-extrabold text-white line-clamp-2 uppercase tracking-wide leading-snug">{selectedArticle.title}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">{selectedArticle.source} • {selectedArticle.date}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 mt-4">No case study selected. Scrape live news to begin.</p>
                      )}
                    </div>
                    {selectedArticle && (
                      <button 
                        onClick={() => setActiveTab('analysis')}
                        className="w-full mt-4 py-2 rounded-lg bg-[#1E2538] hover:bg-gray-800 text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer"
                      >
                        Open Case Study
                      </button>
                    )}
                  </div>
                </div>

                {/* News Lists Grid */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Intelligence Articles Feed</h3>
                  
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-[#121724]/40 rounded-2xl border border-gray-800 space-y-4">
                      <div className="w-10 h-10 border-4 border-red-900/30 border-t-red-600 rounded-full animate-spin"></div>
                      <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Grounding Search Engaged...</p>
                    </div>
                  ) : articles.length === 0 ? (
                    <div className="text-center py-16 bg-[#121724]/40 rounded-2xl border border-gray-800">
                      <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="font-bold text-white text-xs uppercase tracking-widest">No Articles Loaded</p>
                      <p className="text-xs text-gray-500 mt-1">Click "Scrape Live News" above to search the web for the latest updates.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {articles.map((art) => {
                        const isSaved = savedArticleIds.includes(art.id);
                        const isSelected = selectedArticle && selectedArticle.title === art.title;
                        
                        return (
                          <div 
                            key={art.id}
                            className={`p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 ${
                              isSelected 
                                ? 'bg-[#181D2D] border border-red-600/30 shadow-xl' 
                                : 'bg-[#121724]/60 hover:bg-[#121724]/80 border border-gray-800/80 hover:border-gray-700'
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-start gap-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                  art.category === 'Tata Consumer Products'
                                    ? 'bg-red-950/40 text-red-400 border border-red-900/30'
                                    : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                                }`}>
                                  {art.category || 'FMCG'}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSaveArticle(art.id);
                                    }}
                                    className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                  >
                                    {isSaved ? (
                                      <BookmarkCheck className="w-4 h-4 text-red-500" />
                                    ) : (
                                      <Bookmark className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 
                                  onClick={() => handleSelectArticle(art)}
                                  className="text-sm font-extrabold text-white hover:text-red-400 transition-colors cursor-pointer leading-snug uppercase tracking-wide line-clamp-2"
                                >
                                  {art.title}
                                </h4>
                                <p className="text-[10px] text-gray-500 font-mono">{art.source} • {art.date}</p>
                              </div>

                              <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                                {art.summary}
                              </p>
                            </div>

                            {/* Metrics snippet */}
                            {art.metrics && art.metrics.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gray-800/60 grid grid-cols-2 gap-2">
                                {art.metrics.slice(0, 2).map((m, idx) => (
                                  <div key={idx} className="bg-[#0B0F19]/60 px-2.5 py-1.5 rounded-lg border border-gray-800/60">
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest truncate">{m.name}</p>
                                    <p className="text-xs font-bold text-white truncate mt-0.5">{m.value}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-[10px] text-gray-500 font-mono">
                                {art.insights ? '✓ Analyzed' : '○ Ready to analyze'}
                              </span>
                              
                              <button 
                                onClick={() => handleSelectArticle(art)}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                              >
                                View Case Analysis <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 2. Analysis Deck Tab */}
            {activeTab === 'analysis' && selectedArticle && (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Article Header Card */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-950/40 text-red-400 border border-red-900/30">
                        {selectedArticle.category}
                      </span>
                      <h3 className="text-lg md:text-xl font-extrabold text-white leading-snug uppercase tracking-wide mt-3">{selectedArticle.title}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">{selectedArticle.source} • {selectedArticle.date}</p>
                    </div>
                    {selectedArticle.url && (
                      <a 
                        href={selectedArticle.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E2538] hover:bg-gray-800 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                      >
                        Read Original Article
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed mt-4 border-t border-gray-800/60 pt-4">
                    <span className="font-bold text-white">Summary:</span> {selectedArticle.summary}
                  </p>
                </div>

                {/* Grid Layout: Left column (Insights & Forces), Right column (Q&A) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Metrics & Porter's Forces */}
                  <div className="lg:col-span-1 space-y-6">
                    
                    {/* Financial/Operational Metrics Card */}
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        Key Margin & GTM Metrics
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedArticle.metrics && selectedArticle.metrics.length > 0 ? (
                          selectedArticle.metrics.map((m, idx) => (
                            <div key={idx} className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80 flex items-center justify-between">
                              <span className="text-xs text-gray-400 truncate pr-2">{m.name}</span>
                              <span className="text-xs font-bold text-white shrink-0 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30 font-mono">{m.value}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">No operational metrics available.</p>
                        )}
                      </div>
                    </div>

                    {/* Strategic Insights */}
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Executive Implications
                      </h4>
                      <ul className="space-y-3">
                        {selectedArticle.insights && selectedArticle.insights.map((insight, idx) => (
                          <li key={idx} className="text-xs text-gray-400 leading-relaxed flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5"></span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Porter's 5 Forces Card */}
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-500" />
                        Porter's Five Forces Scorecard
                      </h4>
                      <div className="space-y-4 pt-2">
                        {selectedArticle.forces ? (
                          selectedArticle.forces.map((f, idx) => {
                            const colorMap = {
                              'High': 'bg-red-950/40 text-red-400 border border-red-900/30',
                              'Medium': 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30',
                              'Low': 'bg-green-950/40 text-green-400 border border-green-900/30'
                            };
                            return (
                              <div key={idx} className="space-y-1.5 pb-3 border-b border-gray-800/60 last:border-b-0 last:pb-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-white">{f.force}</span>
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${colorMap[f.rating] || 'bg-gray-800 text-gray-400'}`}>
                                    {f.rating}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{f.description}</p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-xs text-gray-500">Porter's 5 forces analysis not available.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: PPI Prep Questions & Answers */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-6">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-red-500" />
                        TCPL PPI Mock Prep Q&As
                      </h4>
                      
                      <div className="space-y-6">
                        {selectedArticle.questions && selectedArticle.questions.length > 0 ? (
                          selectedArticle.questions.map((q, idx) => (
                            <div key={idx} className="p-5 rounded-xl bg-[#0B0F19]/80 border border-gray-800 space-y-3">
                              <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-red-600/10 border border-red-900/30 flex items-center justify-center font-bold text-xs text-red-500 shrink-0">
                                  Q{idx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-white leading-snug font-mono uppercase tracking-wide mt-1">
                                  {q.question}
                                </h5>
                              </div>
                              
                              <div className="pl-9 space-y-2 border-l border-gray-800/80 ml-3">
                                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                                  <span className="font-bold text-white text-[10px] uppercase tracking-wider block mb-1">Model Answer Framework:</span>
                                  {q.answer}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500">Study questions not generated. Connect a Gemini API Key to enable structured corporate Q&A.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. Mock Interview Tab */}
            {activeTab === 'interview' && (
              <motion.div 
                key="interview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 h-[calc(100vh-170px)] flex flex-col justify-between"
              >
                {/* Simulator Header */}
                <div className="p-4 rounded-xl bg-[#0B0F19] border border-gray-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-600/15 border border-red-900/30 flex items-center justify-center text-red-500">
                      <PrizeIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest">Interviewer: Vikram Sen</h4>
                      <p className="text-[9px] text-gray-500 font-mono">Zonal Sales Head, TCPL West</p>
                    </div>
                  </div>
                  <button 
                    onClick={resetInterview}
                    className="px-3 py-1.5 rounded bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-900/30 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Reset Interview
                  </button>
                </div>

                {/* Message display container */}
                <div className="flex-1 min-h-0 bg-[#121724]/40 border border-gray-800 rounded-2xl p-6 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white rounded-br-none'
                          : 'bg-[#0B0F19] border border-gray-800 text-gray-300 rounded-bl-none'
                      }`}>
                        {/* Interviewer prefix banner */}
                        {msg.role === 'assistant' && (
                          <span className="text-[8px] font-bold uppercase tracking-widest text-red-500 block mb-1">
                            TCPL PANEL
                          </span>
                        )}
                        <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="p-4 rounded-2xl bg-[#0B0F19] border border-gray-800 text-gray-500 rounded-bl-none flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce delay-150"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}></div>
                </div>

                {/* Chat input box */}
                <form 
                  onSubmit={handleSendChatMessage}
                  className="flex gap-3 bg-[#0B0F19] p-3 rounded-2xl border border-gray-800 shrink-0"
                >
                  <input 
                    type="text" 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Formulate your structured Sales / Distribution GTM response..."
                    disabled={isChatLoading}
                    className="flex-1 bg-transparent px-3 text-xs focus:outline-none text-white disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={isChatLoading || !userInput.trim()}
                    className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* 4. S&D Math Tab */}
            {activeTab === 'math' && (
              <motion.div 
                key="math"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Math Lab Header */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-gray-800">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-5 h-5 text-red-500" />
                    Distributor Return on Investment (ROI) Lab
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-2xl">
                    FMCG Area Sales Managers must defend distributor profitability. Use the sliders below to simulate a territory financial model and see how working capital velocity (inventory/credit days) drives the distributor's annual ROI.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Form Sliders */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-5">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800/60 pb-2">
                        Variables Controls
                      </h4>
                      
                      {/* 1. Territory Sales */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Monthly Sales (Secondary)</span>
                          <span className="font-bold text-white font-mono">₹{(salesVal/100000).toFixed(1)} Lakhs</span>
                        </div>
                        <input 
                          type="range" 
                          min="100000" 
                          max="5000000" 
                          step="50000" 
                          value={salesVal}
                          onChange={(e) => setSalesVal(Number(e.target.value))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                      </div>

                      {/* 2. Gross Margin */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Distributor Gross Margin</span>
                          <span className="font-bold text-white font-mono">{grossMargin}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="3" 
                          max="12" 
                          step="0.5" 
                          value={grossMargin}
                          onChange={(e) => setGrossMargin(Number(e.target.value))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <p className="text-[9px] text-gray-500 leading-normal">Typically 5-6% for tea/staples; 8-10% for gourmet/sauces.</p>
                      </div>

                      {/* 3. Monthly OpEx */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Monthly OpEx (Vans, Salesmen)</span>
                          <span className="font-bold text-white font-mono">₹{opexVal.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range" 
                          min="5000" 
                          max="100000" 
                          step="1000" 
                          value={opexVal}
                          onChange={(e) => setOpexVal(Number(e.target.value))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                      </div>

                      {/* 4. Stock Days */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Inventory Stock Days</span>
                          <span className="font-bold text-white font-mono">{inventoryDays} Days</span>
                        </div>
                        <input 
                          type="range" 
                          min="5" 
                          max="45" 
                          step="1" 
                          value={inventoryDays}
                          onChange={(e) => setInventoryDays(Number(e.target.value))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                      </div>

                      {/* 5. Retailer Credit Days */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Retailer Credit Days</span>
                          <span className="font-bold text-white font-mono">{creditDays} Days</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="45" 
                          step="1" 
                          value={creditDays}
                          onChange={(e) => setCreditDays(Number(e.target.value))}
                          className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Right Column: Output Financial Statement & ROI */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Profit Metrics */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800/60 pb-2">
                          Monthly Profit & Loss
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Monthly Gross Profit:</span>
                            <span className="font-bold text-white font-mono">₹{monthlyGrossProfit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Monthly Operating Costs (OpEx):</span>
                            <span className="font-bold text-red-400 font-mono">- ₹{opexVal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-gray-850 pt-2 font-semibold">
                            <span className="text-white">Monthly Net Profit:</span>
                            <span className={`font-mono ${monthlyNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ₹{monthlyNetProfit.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs font-semibold pt-1">
                            <span className="text-gray-400">Annualized Net Profit:</span>
                            <span className="text-white font-mono">₹{annualNetProfit.toLocaleString()}</span>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800/60 pb-2 pt-4">
                          Working Capital Invested
                        </h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Warehouse Inventory Value:</span>
                            <span className="font-bold text-white font-mono">₹{Math.round(inventoryValue).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Outstanding Retailer Debtors:</span>
                            <span className="font-bold text-white font-mono">₹{Math.round(creditValue).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-gray-850 pt-2 font-bold">
                            <span className="text-white">Total Capital Locked:</span>
                            <span className="text-red-500 font-mono">₹{Math.round(workingCapitalInvested).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* ROI Dashboard Panel */}
                      <div className="bg-[#0B0F19] rounded-2xl border border-gray-800 p-6 flex flex-col justify-between items-center text-center">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            Annualized Return On Investment
                          </h4>
                          <p className="text-xs text-gray-400">Formula: (Annual Net Profit / Capital Locked) × 100</p>
                        </div>

                        <div className="my-6">
                          <div className="text-4xl md:text-5xl font-black font-mono text-red-500 tracking-tight">
                            {annualROI}%
                          </div>
                          <span className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                            annualROI >= 24
                              ? 'bg-green-950/40 text-green-400 border-green-900/30'
                              : annualROI >= 15
                                ? 'bg-yellow-950/40 text-yellow-400 border-yellow-900/30'
                                : 'bg-red-950/40 text-red-400 border-red-900/30'
                          }`}>
                            {annualROI >= 24 ? 'Highly Lucrative' : annualROI >= 15 ? 'Sustainable' : 'Critical ROI Deficit'}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-400 leading-relaxed font-sans max-w-[220px]">
                          <Info className="w-3.5 h-3.5 text-red-500 inline mr-1 mb-0.5" />
                          <span className="font-bold text-white">ASM Takeaway:</span> Reducing credit/stock days speeds up rotation velocity, allowing the distributor to earn the same profit with less capital locked up, skyrocketing ROI.
                        </div>
                      </div>

                    </div>

                    {/* Step-by-Step Explanation Accordion */}
                    <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                        Distributor Financial Equations Sheet
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                          <p className="font-bold text-red-400 mb-1">1. Capital Locked</p>
                          <p className="text-gray-400 leading-normal">
                            Inventory + Debtors. Reducing warehouse holding days or shortening retailer credit terms instantly frees up distributor capital.
                          </p>
                        </div>
                        <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                          <p className="font-bold text-red-400 mb-1">2. Rotation Velocity</p>
                          <p className="text-gray-400 leading-normal">
                            If sales are ₹10L and stock days is 15, stock rotates 2x a month. Rotating 4x a month halves capital requirements.
                          </p>
                        </div>
                        <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                          <p className="font-bold text-red-400 mb-1">3. Net Margin defense</p>
                          <p className="text-gray-400 leading-normal">
                            During inflation, prioritize high-margin premium coffee/spices in the sales mix to offset static margins on salt.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 5. TCPL Deep Dive Tab */}
            {activeTab === 'deepdive' && (
              <motion.div 
                key="deepdive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Masterclass Header */}
                <div className="p-6 rounded-2xl bg-[#0B0F19] border border-gray-800 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl"></div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-5 h-5 text-red-500" />
                    Tata Consumer Products Limited (TCPL) Corporate Intelligence Deck
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-3xl">
                    A comprehensive technical repository summarizing TCPL's corporate identity, strategic growth pillars, leadership team, brand matrix, and physical distribution hierarchy. 
                  </p>
                </div>

                {/* 1. Vision, Mission & Values Block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Vision Card */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                      <span>👁️</span> Core Vision
                    </h4>
                    <p className="text-sm font-extrabold text-white leading-snug">
                      "To build better lives and thriving communities."
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed pt-1">
                      Roots TCPL's commercial operations back to the core Tata Group philosophy of community enrichment, shared trust, and long-term societal value.
                    </p>
                  </div>

                  {/* Mission Card */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                      <span>🚀</span> Company Mission
                    </h4>
                    <p className="text-sm font-extrabold text-white leading-snug">
                      "To keep passionately growing and innovating every day."
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed pt-1">
                      Drives the aggressive transformation from a traditional plantation/bulk commodity business (Tata Tea/Tata Coffee) to a fast-moving, high-margin consumer staples and products giant.
                    </p>
                  </div>

                  {/* Core Values Card */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2 font-mono">
                      <span>🛡️</span> Five Core Values
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-white font-mono">
                      <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-800">🤝 EMPATHY</div>
                      <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-800">⚖️ INTEGRITY</div>
                      <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-800">⚡ AGILITY</div>
                      <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-800">🏆 EXCELLENCE</div>
                      <div className="bg-[#0B0F19] col-span-2 px-2.5 py-1.5 rounded border border-gray-800 text-center">🎯 OWNERSHIP</div>
                    </div>
                  </div>

                </div>

                {/* 2. Leadership and Governance Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Executive Management */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800/60 pb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-red-500" />
                      Executive Leadership Team
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-gray-850 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-white uppercase tracking-wider">Sunil D'Souza</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Managing Director & Chief Executive Officer (MD & CEO)</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/30">Head</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-gray-850 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-white uppercase tracking-wider">Ajit Krishnakumar</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Executive Director & Chief Operating Officer (ED & COO)</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-850">Operations</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-gray-850 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-white uppercase tracking-wider">Ashish Goenka</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">Group Chief Financial Officer (CFO)</p>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-850">Finance</span>
                      </div>
                    </div>
                  </div>

                  {/* Board of Directors */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800/60 pb-2 flex items-center gap-2">
                      <Info className="w-4 h-4 text-red-500" />
                      Board of Directors
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#0B0F19]/60 border border-gray-850">
                        <p className="text-xs font-extrabold text-white uppercase tracking-wider">Mr. N. Chandrasekaran</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Chairman (Non-Executive Director) • Also Chairman of Tata Sons</p>
                      </div>
                      
                      <div>
                        <span className="font-bold text-white text-[10px] uppercase tracking-wider block mb-1">Key Independent Directors</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 font-mono">
                          <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-850">👨‍⚖️ Dr. K. P. Krishnan</div>
                          <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-850">🛒 Mr. Bharat Puri</div>
                          <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-850">💼 Ms. Shikha Sharma</div>
                          <div className="bg-[#0B0F19] px-2.5 py-1.5 rounded border border-gray-850">🔬 Mr. David Crean</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. Strategic Framework (6 Pillars) & Sustainability */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* The Six Strategic Pillars */}
                  <div className="md:col-span-2 p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800/60 pb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      The Six Growth Pillars ("How We Win")
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-850">
                        <p className="font-bold text-white mb-1">1. Strengthen Core & Scale Growth</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Protect tea/salt market share while aggressively scaling high-growth businesses (Tata Sampann, Tata Coffee).</p>
                      </div>
                      <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-850">
                        <p className="font-bold text-white mb-1">2. Build on New Opportunities</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Expand portfolio organically and inorganically (acquisitions of Capital Foods and Organic India) to target premium segments.</p>
                      </div>
                      <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-850">
                        <p className="font-bold text-white mb-1">3. Drive Execution Excellence</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Focus on premiumization, cost optimization, expanding rural coverage, and optimizing distributor fill rates.</p>
                      </div>
                      <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-850">
                        <p className="font-bold text-white mb-1">4. Digital & Innovation Acceleration</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Use SFA (Sales Force Automation) systems, digital supply chain tracking, and launching digital-first premium offerings.</p>
                      </div>
                      <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-850">
                        <p className="font-bold text-white mb-1">5. Future-Ready Organization</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Build strong cross-functional sales/marketing capabilities and integrate post-merger operations.</p>
                      </div>
                      <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-850">
                        <p className="font-bold text-white mb-1">6. Embed Sustainability</p>
                        <p className="text-gray-400 text-[11px] leading-relaxed">Integrate environmental responsibility and social impact across sourcing, packaging, and community relations.</p>
                      </div>
                    </div>
                  </div>

                  {/* Sustainability Commitment */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-gray-800/60 pb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-green-500" />
                      #ForBetter Sustainability Focus
                    </h4>
                    <div className="space-y-3 text-xs text-gray-400">
                      <div className="pb-2 border-b border-gray-850">
                        <span className="font-bold text-white block">For Better Sourcing</span>
                        <p className="text-[11px] mt-0.5">100% sustainable agricultural raw materials, supporting tea and coffee growers.</p>
                      </div>
                      <div className="pb-2 border-b border-gray-850">
                        <span className="font-bold text-white block">For a Better Planet</span>
                        <p className="text-[11px] mt-0.5">Zero-waste to landfills, water-neutral manufacturing, and circular packaging transitions.</p>
                      </div>
                      <div className="pb-2 border-b border-gray-850">
                        <span className="font-bold text-white block">For Better Communities</span>
                        <p className="text-[11px] mt-0.5">Empowering small tea growers, providing clean water access, and community healthcare.</p>
                      </div>
                      <div>
                        <span className="font-bold text-white block">For Better Nutrition</span>
                        <p className="text-[11px] mt-0.5">Tata Sampann unpolished staples and Organic India health products delivering clean food.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4. Brand Matrix & Sales Hierarchy Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* House of Brands */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-gray-800/60 pb-2">
                      <GitMerge className="w-4 h-4 text-red-500" />
                      Integrated Brand Portfolio
                    </h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Beverages Division</span>
                        <p className="text-gray-400 leading-normal mt-0.5">
                          Tata Tea (Agni, Premium, Gold, Chakra Gold), Tetley (green/infusion teas), Tata Coffee (Grand, premium beans), Starbucks JV (Tata Starbucks India).
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Foods & Staples Division</span>
                        <p className="text-gray-400 leading-normal mt-0.5">
                          Tata Salt (Lite, SuperLite, Rock Salt), Tata Sampann (pulses, spices, dry fruits, unpolished rice, ready-to-cook mixes).
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider block">Acquisitions & Growth Vehicles</span>
                        <p className="text-gray-400 leading-normal mt-0.5">
                          <span className="font-bold text-white">Capital Foods:</span> Ching's Secret (condiments, instant Chinese noodles) and Smith & Jones (pastes, ginger garlic, aids). 
                          <span className="font-bold text-white block mt-0.5">Organic India:</span> Organic herbal tea infusions, wellness capsules, and healthy groceries.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* GTM Sales Hierarchy */}
                  <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-gray-800/60 pb-2">
                      <Layers className="w-4 h-4 text-red-500" />
                      Traditional General Trade Sales Hierarchy
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="relative pl-6 border-l border-red-500/20 space-y-3">
                        <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-red-600"></div>
                        <div>
                          <span className="font-bold text-white text-[11px] uppercase tracking-wider block">1. National Sales Manager (NSM)</span>
                          <p className="text-[10px] text-gray-500 font-mono">Macro Channel Strategy & National Revenue</p>
                        </div>

                        <div className="absolute -left-1.5 top-[52px] w-3 h-3 rounded-full bg-red-600/70"></div>
                        <div className="pt-2">
                          <span className="font-bold text-white text-[11px] uppercase tracking-wider block">2. Regional Sales Manager (RSM)</span>
                          <p className="text-[10px] text-gray-500 font-mono">Zonal Head (Zonal profit & loss, C&F Agent efficiency)</p>
                        </div>

                        <div className="absolute -left-1.5 top-[108px] w-3 h-3 rounded-full bg-red-600/50"></div>
                        <div className="pt-2">
                          <span className="font-bold text-white text-[11px] uppercase tracking-wider block">3. Area Sales Manager (ASM)</span>
                          <p className="text-[10px] text-gray-500 font-mono">District/State cluster control (Primary target, distributor ROI)</p>
                        </div>

                        <div className="absolute -left-1.5 top-[164px] w-3 h-3 rounded-full bg-red-600/30"></div>
                        <div className="pt-2">
                          <span className="font-bold text-white text-[11px] uppercase tracking-wider block">4. Territory Sales Executive (TSE) / SO</span>
                          <p className="text-[10px] text-gray-500 font-mono">Secondary sales target, distributor liquidity, beat planning</p>
                        </div>

                        <div className="absolute -left-1.5 top-[220px] w-3 h-3 rounded-full bg-red-600/20"></div>
                        <div className="pt-2">
                          <span className="font-bold text-white text-[11px] uppercase tracking-wider block">5. Distributor Sales Representative (DSR)</span>
                          <p className="text-[10px] text-gray-500 font-mono">Frontline beat walker (Daily strike rate, LPC, LPB)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* S&D Jargon Cheat Sheet */}
                <div className="p-6 rounded-2xl bg-[#121724]/70 border border-gray-800 space-y-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                    Essential S&D Terminologies for the PPI Room
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                      <p className="font-bold text-red-500 mb-1">Primary vs Secondary</p>
                      <p className="text-gray-400 leading-normal font-sans">
                        <span className="font-bold text-white">Primary:</span> Company to Distributor. 
                        <span className="font-bold text-white block">Secondary:</span> Distributor to Retailer (Kirana). ASMs track secondary as it represents real market demand.
                      </p>
                    </div>

                    <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                      <p className="font-bold text-red-500 mb-1">Beat Plan / PJP</p>
                      <p className="text-gray-400 leading-normal font-sans">
                        Permanent Journey Plan. The fixed physical route a DSR walks on specific days (e.g. Monday: Sector 1 beat) to maintain high retail touchpoints.
                      </p>
                    </div>

                    <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                      <p className="font-bold text-red-500 mb-1">LPC & LPB</p>
                      <p className="text-gray-400 leading-normal font-sans">
                        <span className="font-bold text-white">LPC (Lines Per Call):</span> Number of distinct SKUs sold in a visit. 
                        <span className="font-bold text-white block">LPB (Lines Per Bill):</span> Focuses on increasing assortment breadth on retailer shelves.
                      </p>
                    </div>

                    <div className="bg-[#0B0F19]/60 p-3 rounded-xl border border-gray-800/80">
                      <p className="font-bold text-red-500 mb-1">Strike Rate</p>
                      <p className="text-gray-400 leading-normal font-sans">
                        (Productive Outlets Visited / Total Outlets Visited) × 100. A primary indicator of frontline DSR efficiency and beat layout health.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
