export type Language = "en" | "zh";

export const translations = {
  // ── Navigation ──
  "nav.dashboard": { en: "Dashboard", zh: "仪表盘" },
  "nav.calendar": { en: "Calendar", zh: "日历" },
  "nav.outlook": { en: "Outlook", zh: "展望" },
  "nav.history": { en: "History", zh: "历史" },
  "nav.sectors": { en: "Sectors", zh: "板块" },
  "nav.settings": { en: "Settings", zh: "设置" },
  "nav.home": { en: "Home", zh: "首页" },
  "nav.evaluations": { en: "Evaluations", zh: "股票评估" },

  // ── Header / Brand ──
  "brand.title": { en: "Trading News", zh: "交易资讯" },
  "brand.subtitle": { en: "Economic Calendar", zh: "经济日历" },
  "sidebar.theme": { en: "Theme", zh: "主题" },

  // ── Dashboard ──
  "stats.totalEvents": { en: "Total Events", zh: "总事件" },
  "stats.highImpact": { en: "High Impact", zh: "高影响" },
  "stats.weekSentiment": { en: "Week Sentiment", zh: "周情绪" },
  "stats.nextEvent": { en: "Next Event", zh: "下一事件" },
  "stats.bullish": { en: "Bullish", zh: "看涨" },
  "stats.bearish": { en: "Bearish", zh: "看跌" },
  "stats.neutral": { en: "Neutral", zh: "中性" },
  "stats.pending": { en: "Pending", zh: "待定" },
  "stats.none": { en: "None", zh: "无" },

  // ── Week Navigator ──
  "week.currentWeek": { en: "Current Week", zh: "本周" },
  "week.today": { en: "Today", zh: "今天" },

  // ── Search & Filters ──
  "search.placeholder": { en: "Search events...", zh: "搜索事件..." },
  "search.direction": { en: "Direction", zh: "方向" },
  "search.bullish": { en: "BULLISH", zh: "看涨" },
  "search.bearish": { en: "BEARISH", zh: "看跌" },
  "search.neutral": { en: "NEUTRAL", zh: "中性" },
  "filter.all": { en: "ALL", zh: "全部" },
  "filter.high": { en: "HIGH", zh: "高" },
  "filter.medium": { en: "MEDIUM", zh: "中" },
  "filter.low": { en: "LOW", zh: "低" },

  // ── Countdown ──
  "countdown.nextHighImpact": {
    en: "Next High-Impact Event",
    zh: "下一个高影响事件",
  },
  "countdown.noUpcoming": {
    en: "No upcoming high-impact events",
    zh: "暂无即将发生的高影响事件",
  },
  "countdown.inProgress": {
    en: "Event in progress or completed",
    zh: "事件进行中或已完成",
  },
  "countdown.days": { en: "Days", zh: "天" },
  "countdown.hrs": { en: "Hrs", zh: "时" },
  "countdown.min": { en: "Min", zh: "分" },
  "countdown.sec": { en: "Sec", zh: "秒" },

  // ── Event Data ──
  "data.actual": { en: "Actual", zh: "实际" },
  "data.forecast": { en: "Forecast", zh: "预期" },
  "data.previous": { en: "Previous", zh: "前值" },
  "data.surprise": { en: "Surprise", zh: "意外" },
  "data.date": { en: "Date", zh: "日期" },
  "data.period": { en: "Period", zh: "时期" },

  // ── Categories ──
  "cat.EMPLOYMENT": { en: "Employment", zh: "就业" },
  "cat.INFLATION": { en: "Inflation", zh: "通胀" },
  "cat.GDP": { en: "GDP", zh: "GDP" },
  "cat.MANUFACTURING": { en: "Manufacturing", zh: "制造业" },
  "cat.HOUSING": { en: "Housing", zh: "房地产" },
  "cat.CONSUMER": { en: "Consumer", zh: "消费" },
  "cat.TRADE": { en: "Trade", zh: "贸易" },
  "cat.MONETARY_POLICY": { en: "Monetary Policy", zh: "货币政策" },
  "cat.GOVERNMENT": { en: "Government", zh: "政府" },
  "cat.ENERGY": { en: "Energy", zh: "能源" },
  "cat.OTHER": { en: "Other", zh: "其他" },

  // ── Importance ──
  "importance.HIGH": { en: "HIGH", zh: "高" },
  "importance.MEDIUM": { en: "MEDIUM", zh: "中" },
  "importance.LOW": { en: "LOW", zh: "低" },

  // ── Event Detail ──
  "detail.backToDashboard": { en: "Back to Dashboard", zh: "返回仪表盘" },
  "detail.impact": { en: "IMPACT", zh: "影响" },
  "detail.released": { en: "Released", zh: "已发布" },
  "detail.upcoming": { en: "Upcoming", zh: "即将发布" },
  "detail.aiSummary": { en: "AI Summary", zh: "AI 摘要" },
  "detail.detailedAnalysis": { en: "Detailed Analysis", zh: "详细分析" },
  "detail.sectors": { en: "Sectors", zh: "板块" },
  "detail.assets": { en: "Assets", zh: "资产" },
  "detail.keyLevels": { en: "Key Levels", zh: "关键位" },
  "detail.noLevels": {
    en: "No specific levels identified",
    zh: "暂无具体关键位",
  },
  "detail.tradingImplications": { en: "Trading Implications", zh: "交易影响" },
  "detail.riskFactors": { en: "Risk Factors", zh: "风险因素" },
  "detail.historicalContext": { en: "Historical Context", zh: "历史背景" },
  "detail.marketReview": { en: "Market Review", zh: "市场回顾" },
  "detail.preReleaseForecast": { en: "Pre-Release Forecast", zh: "发布前预测" },
  "detail.postRelease": { en: "Post-Release", zh: "发布后" },
  "detail.preRelease": { en: "Pre-Release", zh: "发布前" },
  "detail.sources": { en: "Sources", zh: "信息来源" },
  "detail.analysisPending": {
    en: "AI analysis pending. Analysis runs automatically after data is scraped.",
    zh: "AI 分析待处理。数据抓取后将自动分析。",
  },

  // ── Calendar ──
  "cal.mon": { en: "Mon", zh: "一" },
  "cal.tue": { en: "Tue", zh: "二" },
  "cal.wed": { en: "Wed", zh: "三" },
  "cal.thu": { en: "Thu", zh: "四" },
  "cal.fri": { en: "Fri", zh: "五" },
  "cal.sat": { en: "Sat", zh: "六" },
  "cal.sun": { en: "Sun", zh: "日" },
  "cal.week": { en: "week", zh: "周" },
  "cal.month": { en: "month", zh: "月" },
  "cal.more": { en: "more", zh: "更多" },

  // ── History ──
  "history.searchPlaceholder": { en: "Search events...", zh: "搜索事件..." },
  "history.historicalComparison": {
    en: "Historical Comparison",
    zh: "历史对比",
  },
  "history.selectEvent": {
    en: "Select an event to compare...",
    zh: "选择一个事件进行对比...",
  },

  // ── Event List ──
  "list.noEvents": {
    en: "No events found for this period.",
    zh: "该时段暂无事件。",
  },
  "list.event": { en: "event", zh: "个事件" },
  "list.events": { en: "events", zh: "个事件" },

  // ── Settings ──
  "settings.appearance": { en: "Appearance", zh: "外观" },
  "settings.darkMode": { en: "Dark Mode", zh: "深色模式" },
  "settings.lightMode": { en: "Light Mode", zh: "浅色模式" },
  "settings.themeDesc": {
    en: "Toggle between light and dark themes",
    zh: "切换浅色和深色主题",
  },
  "settings.notifications": { en: "Notifications", zh: "通知" },
  "settings.browserNotifications": {
    en: "Browser Notifications",
    zh: "浏览器通知",
  },
  "settings.notifDesc": {
    en: "Get alerts for high-impact events and surprise data",
    zh: "获取高影响事件和意外数据的提醒",
  },
  "settings.enable": { en: "Enable", zh: "启用" },
  "settings.enabled": { en: "Enabled", zh: "已启用" },
  "settings.language": { en: "Language", zh: "语言" },
  "settings.languageDesc": {
    en: "Choose your preferred language",
    zh: "选择您的首选语言",
  },
  "settings.watchlist": { en: "Watchlist", zh: "关注列表" },
  "settings.items": { en: "items", zh: "项" },
  "settings.noWatchlist": {
    en: "No events in your watchlist. Click the star icon on events to add them.",
    zh: "关注列表为空。点击事件上的星标图标添加。",
  },
  "settings.about": { en: "About", zh: "关于" },
  "settings.aboutDesc": {
    en: "Trading News Dashboard provides AI-powered analysis of economic calendar events. Data is sourced from MarketWatch and analyzed using Google Gemini AI.",
    zh: "交易资讯仪表盘提供 AI 驱动的经济日历事件分析。数据来源于 MarketWatch，使用 Google Gemini AI 进行分析。",
  },
  "settings.disclaimer": {
    en: "This tool is for informational purposes only. Not financial advice.",
    zh: "本工具仅供参考，不构成投资建议。",
  },

  // ── Chat ──
  "chat.title": { en: "Market Assistant", zh: "市场助手" },
  "chat.placeholder": {
    en: "Ask about economic events...",
    zh: "询问经济事件...",
  },
  "chat.desc": {
    en: "Ask about economic events, market impact, or trading insights",
    zh: "询问经济事件、市场影响或交易洞察",
  },
  "chat.suggested": { en: "Suggested", zh: "推荐问题" },
  "chat.q1": {
    en: "What are the key events this week?",
    zh: "本周有哪些关键事件？",
  },
  "chat.q2": {
    en: "How will CPI data affect the market?",
    zh: "CPI 数据将如何影响市场？",
  },
  "chat.q3": {
    en: "What's the Fed likely to do next?",
    zh: "美联储下一步可能怎么做？",
  },
  "chat.q4": {
    en: "Which sectors look strongest right now?",
    zh: "目前哪些板块最强？",
  },
  "chat.q5": {
    en: "Summarize this week's economic outlook",
    zh: "总结本周经济展望",
  },
  "chat.newConversation": { en: "New conversation", zh: "新对话" },
  "chat.error": {
    en: "Sorry, I encountered an error. Please try again.",
    zh: "抱歉，出现了错误。请重试。",
  },

  // ── Sectors page ──
  "sectors.title": { en: "Sectors", zh: "板块" },
  "sectors.heatmap": { en: "Sector Impact Heatmap", zh: "板块影响热力图" },
  "sectors.overweight": { en: "OVERWEIGHT", zh: "超配" },
  "sectors.underweight": { en: "UNDERWEIGHT", zh: "低配" },

  // ── Outlook page ──
  "outlook.title": { en: "Weekly Outlook", zh: "周度展望" },
  "outlook.noOutlook": {
    en: "No outlook available for this week.",
    zh: "本周暂无展望。",
  },
  "outlook.noOutlookDesc": {
    en: "The outlook is generated automatically every Monday at 7 AM UTC.",
    zh: "展望每周一 UTC 时间早上 7 点自动生成。",
  },
  "outlook.generateOutlook": { en: "Generate Outlook", zh: "生成展望" },
  "outlook.weekOf": { en: "Week of", zh: "周度" },
  "outlook.generatedOn": { en: "Generated", zh: "生成于" },
  "outlook.executiveSummary": { en: "Executive Summary", zh: "执行摘要" },
  "outlook.keyEvents": { en: "Key Events", zh: "关键事件" },
  "outlook.keyThemes": { en: "Key Themes", zh: "关键主题" },
  "outlook.riskAssessment": { en: "Risk Assessment", zh: "风险评估" },
  "outlook.sectorRotation": { en: "Sector Rotation", zh: "板块轮动" },
  "outlook.implication": { en: "Implication", zh: "影响" },
  "outlook.overweight": { en: "Overweight", zh: "超配" },
  "outlook.neutral": { en: "Neutral", zh: "中性" },
  "outlook.underweight": { en: "Underweight", zh: "低配" },
  "outlook.bullish": { en: "Bullish Outlook", zh: "看涨展望" },
  "outlook.bearish": { en: "Bearish Outlook", zh: "看跌展望" },
  "outlook.neutralOutlook": { en: "Neutral Outlook", zh: "中性展望" },
  "outlook.eventsThisWeek": { en: "Events This Week", zh: "本周事件" },
  "outlook.highImpact": { en: "High Impact", zh: "高影响" },
  "outlook.topSector": { en: "Top Sector", zh: "焦点板块" },
  "outlook.riskLevel": { en: "Risk Level", zh: "风险等级" },
  "outlook.impactScore": { en: "Impact", zh: "影响分" },

  // ── Notifications ──
  "notifications.title": { en: "Notifications", zh: "通知" },
  "notifications.markRead": { en: "Mark all read", zh: "全部已读" },
  "notifications.empty": { en: "No notifications yet", zh: "暂无通知" },
  "notifications.countdown": { en: "Event Countdown", zh: "事件倒计时" },
  "notifications.countdownDesc": {
    en: "Alert 15 and 5 minutes before high-impact events",
    zh: "在高影响事件前 15 和 5 分钟提醒",
  },
  "notifications.surprise": { en: "Surprise Alerts", zh: "意外数据提醒" },
  "notifications.surpriseDesc": {
    en: "Alert when actual data significantly deviates from forecast",
    zh: "当实际数据与预期显著偏离时提醒",
  },
  "notifications.outlook": { en: "Weekly Outlook", zh: "周度展望" },
  "notifications.outlookDesc": {
    en: "Alert when the weekly market outlook is ready",
    zh: "当周度市场展望生成完毕时提醒",
  },
  "notifications.watchlist": { en: "Watchlist Alerts", zh: "关注列表提醒" },
  "notifications.watchlistDesc": {
    en: "Alert before any watchlisted event releases",
    zh: "在关注列表中的事件发布前提醒",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Language): string {
  const entry = translations[key];
  return entry?.[lang] ?? entry?.en ?? key;
}
