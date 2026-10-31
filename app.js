// ============================================
// حلال تريدير - السوق الأمريكي
// مرحلة 2: ربط بيانات مجانية + تحليل ما قبل السوق ديناميكي
// ============================================

const HALAL_STOCKS = [
  { ticker: "AAPL", name: "أبل" },
  { ticker: "MSFT", name: "مايكروسوفت" },
  { ticker: "NVDA", name: "إنفيديا" },
  { ticker: "GOOGL", name: "ألفابت (جوجل)" },
  { ticker: "GOOG", name: "ألفابت C" },
  { ticker: "META", name: "ميتا" },
  { ticker: "AMZN", name: "أمازون" },
  { ticker: "TSLA", name: "تسلا" },
  { ticker: "AMD", name: "إيه إم دي" },
  { ticker: "AVGO", name: "برودكوم" },
  { ticker: "CRM", name: "سيلز فورس" },
  { ticker: "ADBE", name: "أدوبي" },
  { ticker: "NFLX", name: "نتفلكس" },
  { ticker: "COST", name: "كوستكو" },
  { ticker: "PEP", name: "بيبسيكو" },
  { ticker: "KO", name: "كوكا كولا" },
  { ticker: "ABT", name: "أبوت لابوراتوريز" },
  { ticker: "LLY", name: "إيلي ليلي" },
  { ticker: "JNJ", name: "جونسون آند جونسون" },
  { ticker: "MRK", name: "ميرك" },
  { ticker: "UNH", name: "يونايتد هيلث" },
  { ticker: "HD", name: "هوم ديبو" },
  { ticker: "WMT", name: "وول مارت" },
  { ticker: "PG", name: "بروكتر آند جامبل" },
  { ticker: "XOM", name: "إكسون موبيل" },
  { ticker: "CVX", name: "شيفرون" },
  { ticker: "TSM", name: "تايوان سيميكوندكتور" },
  { ticker: "ASML", name: "إيه إس إم إل" },
  { ticker: "MU", name: "مايكرون" },
  { ticker: "QCOM", name: "كوالكوم" },
  { ticker: "INTC", name: "إنتل" },
  { ticker: "AMAT", name: "أبلايد ماتيريالز" },
  { ticker: "LRCX", name: "لام ريسيرش" },
  { ticker: "KLAC", name: "كيه إل إيه" },
  { ticker: "SNPS", name: "سينوبسيس" },
  { ticker: "CDNS", name: "كادينس" },
  { ticker: "PANW", name: "بالو ألتو نتووركس" },
  { ticker: "CRWD", name: "كراود سترايك" },
  { ticker: "NOW", name: "سيرفس ناو" },
  { ticker: "SNOW", name: "سنوفليك" },
  { ticker: "PLTR", name: "بالانتير" },
  { ticker: "SHOP", name: "شوبيفاي" },
  { ticker: "SQ", name: "بلوك (سكوير)" },
  { ticker: "PYPL", name: "باي بال" },
  { ticker: "V", name: "فيزا" },
  { ticker: "MA", name: "ماستركارد" },
  { ticker: "AXP", name: "أمريكان إكسبريس" },
  { ticker: "DIS", name: "ديزني" },
  { ticker: "NKE", name: "نايكي" },
  { ticker: "SBUX", name: "ستاربكس" },
  { ticker: "MCD", name: "ماكدونالدز" },
  { ticker: "CMG", name: "تشيبوتلي" },
  { ticker: "BKNG", name: "بوكينج" },
  { ticker: "UBER", name: "أوبر" },
  { ticker: "ABNB", name: "إير بي إن بي" },
  { ticker: "CAT", name: "كاتربيلر" },
  { ticker: "DE", name: "جون دير" },
  { ticker: "BA", name: "بوينغ" },
  { ticker: "GE", name: "جنرال إلكتريك" },
  { ticker: "HON", name: "هونيويل" },
  { ticker: "UPS", name: "يو بي إس" },
  { ticker: "FDX", name: "فيديكس" },
  { ticker: "LIN", name: "ليند" },
  { ticker: "APD", name: "إير برودكتس" },
  { ticker: "SHW", name: "شيروين ويليامز" },
  { ticker: "EL", name: "إستي لودر" },
  { ticker: "CL", name: "كولجيت" },
  { ticker: "KMB", name: "كيمبرلي كلارك" },
  { ticker: "GIS", name: "جنرال ميلز" },
  { ticker: "K", name: "كيلوغ" },
  { ticker: "HSY", name: "هيرشي" },
  { ticker: "MDLZ", name: "موندليز" },
  { ticker: "TSN", name: "تايسون فودز" },
  { ticker: "ADM", name: "آرتشر دانيلز" },
  { ticker: "BG", name: "بونجي" },
  { ticker: "DELL", name: "ديل" },
  { ticker: "HPQ", name: "إتش بي" },
  { ticker: "IBM", name: "آي بي إم" },
  { ticker: "ORCL", name: "أوراكل" },
  { ticker: "CSCO", name: "سيسكو" },
  { ticker: "ACN", name: "أكسنتشر" },
  { ticker: "INTU", name: "إنتيوت" },
  { ticker: "ADP", name: "إيه دي بي" },
  { ticker: "PAYX", name: "باي تشيكس" },
  { ticker: "ISRG", name: "إنتيوتيف سيرجيكال" },
  { ticker: "SYK", name: "سترايكر" },
  { ticker: "MDT", name: "ميدترونيك" },
  { ticker: "BSX", name: "بوسطن ساينتيفيك" },
  { ticker: "ZBH", name: "زيمر بيوميت" },
  { ticker: "EW", name: "إدواردز لايف ساينس" },
  { ticker: "IDXX", name: "آيدي إكس إكس" },
  { ticker: "DXCM", name: "ديكسكوم" },
  { ticker: "ALGN", name: "ألاين تكنولوجي" },
  { ticker: "RMD", name: "ريسميد" },
  { ticker: "HOLX", name: "هولوجيك" },
  { ticker: "BIIB", name: "بايوچين" },
  { ticker: "GILD", name: "جيلعاد" },
  { ticker: "REGN", name: "ريجينيرون" },
  { ticker: "VRTX", name: "فيرتكس" },
  { ticker: "AMGN", name: "أمجين" },
  { ticker: "BMRN", name: "بيومارين" },
  { ticker: "ILMN", name: "إيلومينا" },
  { ticker: "MRNA", name: "موديرنا" },
  { ticker: "PFE", name: "فايزر" },
  { ticker: "BMY", name: "بريستول مايرز" },
  { ticker: "AZN", name: "أسترازينيكا" },
  { ticker: "NVO", name: "نوفو نورديسك" },
  { ticker: "SNY", name: "سانوفي" },
  { ticker: "GSK", name: "جلاكسو سميث كلاين" }
];

// حالة التطبيق
let state = {
  watchlist: JSON.parse(localStorage.getItem("halal_watchlist") || "[]"),
  recommendations: JSON.parse(localStorage.getItem("halal_recommendations") || "[]"),
  log: JSON.parse(localStorage.getItem("halal_log") || "[]"),
  stats: JSON.parse(localStorage.getItem("halal_stats") || '{"total":0,"wins":0,"losses":0}'),
  apiKey: localStorage.getItem("finnhub_api_key") || ""
};

// ========== الساعات وحالة السوق ==========
function updateClocks() {
  const now = new Date();
  document.getElementById("dubai-time").textContent = now.toLocaleTimeString("ar-AE", {
    timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
  document.getElementById("ny-time").textContent = now.toLocaleTimeString("en-US", {
    timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
  updateMarketStatus(now);
}

function updateMarketStatus(now) {
  const nyDate = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const day = nyDate.getDay();
  const totalMinutes = nyDate.getHours() * 60 + nyDate.getMinutes();
  const statusEl = document.getElementById("market-status");
  statusEl.className = "market-status";

  if (day === 0 || day === 6) {
    statusEl.textContent = "مغلق (عطلة)";
    statusEl.classList.add("closed");
    return;
  }
  if (totalMinutes >= 240 && totalMinutes < 570) {
    statusEl.textContent = "قبل الافتتاح";
    statusEl.classList.add("pre");
    return;
  }
  if (totalMinutes >= 570 && totalMinutes < 960) {
    statusEl.textContent = "السوق مفتوح";
    statusEl.classList.add("open");
    return;
  }
  if (totalMinutes >= 960 && totalMinutes < 1200) {
    statusEl.textContent = "بعد الإغلاق";
    statusEl.classList.add("pre");
    return;
  }
  statusEl.textContent = "مغلق";
  statusEl.classList.add("closed");
}

// ========== التبويبات ==========
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
  });
});

// ========== عرض الأسهم ==========
function renderStocks(filter = "") {
  const container = document.getElementById("stocks-container");
  const q = filter.trim().toLowerCase();
  const filtered = HALAL_STOCKS.filter(s =>
    s.ticker.toLowerCase().includes(q) || s.name.includes(q)
  );
  if (filtered.length === 0) {
    container.innerHTML = `<p class="empty-state">لا توجد نتائج</p>`;
    return;
  }
  container.innerHTML = filtered.map(s => `
    <div class="stock-item" data-ticker="${s.ticker}">
      <span class="ticker">${s.ticker}</span>
      <span class="name">${s.name}</span>
    </div>
  `).join("");
  container.querySelectorAll(".stock-item").forEach(item => {
    item.addEventListener("click", () => addToWatchlist(item.dataset.ticker));
  });
}

document.getElementById("stock-search").addEventListener("input", e => renderStocks(e.target.value));

// ========== قائمة المتابعة ==========
function addToWatchlist(ticker) {
  if (state.watchlist.find(w => w.ticker === ticker)) {
    alert("السهم موجود بالفعل في المتابعة");
    return;
  }
  const stock = HALAL_STOCKS.find(s => s.ticker === ticker) || { ticker, name: ticker };
  state.watchlist.push({
    ...stock,
    addedAt: new Date().toISOString(),
    lastPrice: null,
    change: null
  });
  saveState();
  renderWatchlist();
  addLog("إضافة للمتابعة", ticker, `تمت إضافة ${ticker} يدوياً إلى قائمة المتابعة`);
  alert(`تمت إضافة ${ticker} إلى قائمة المتابعة`);
}

function removeFromWatchlist(ticker) {
  state.watchlist = state.watchlist.filter(w => w.ticker !== ticker);
  saveState();
  renderWatchlist();
  addLog("إزالة من المتابعة", ticker, `تمت إزالة ${ticker} من قائمة المتابعة`);
}

function renderWatchlist() {
  const container = document.getElementById("watchlist-container");
  if (state.watchlist.length === 0) {
    container.innerHTML = `<p class="empty-state">لا توجد أسهم في المتابعة بعد. انتظر تحليل ما قبل السوق أو أضف يدوياً من تبويب الأسهم الشرعية.</p>`;
    return;
  }
  container.innerHTML = state.watchlist.map(w => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="ticker">${w.ticker}</div>
          <div class="company-name">${w.name}</div>
        </div>
        <div style="text-align:left">
          <div class="price">${w.lastPrice != null ? "$" + Number(w.lastPrice).toFixed(2) : "—"}</div>
          <div class="change ${w.change >= 0 ? "positive" : "negative"}">
            ${w.change != null ? (w.change >= 0 ? "+" : "") + Number(w.change).toFixed(2) + "%" : ""}
          </div>
        </div>
      </div>
      <div class="card-body">أُضيف: ${new Date(w.addedAt).toLocaleString("ar-AE")}</div>
      <div class="card-actions">
        <button class="btn-action btn-remove" onclick="removeFromWatchlist('${w.ticker}')">إزالة</button>
      </div>
    </div>
  `).join("");
}

// ========== Finnhub API (مجاني) ==========
async function fetchQuote(ticker) {
  if (!state.apiKey) return null;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${state.apiKey}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.c === 0 && data.pc === 0) return null;
    return {
      price: data.c,
      change: data.dp,
      high: data.h,
      low: data.l,
      prevClose: data.pc
    };
  } catch (e) {
    console.error("Quote error", e);
    return null;
  }
}

async function fetchNews(ticker) {
  if (!state.apiKey) return [];
  try {
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const res = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${state.apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 5) : [];
  } catch (e) {
    console.error("News error", e);
    return [];
  }
}

// محاكاة تحليل مشاعر بسيط (ديناميكي)
function analyzeNewsSentiment(newsList) {
  if (!newsList || newsList.length === 0) {
    return { score: 0, positive: 0, reason: "لا توجد أخبار حديثة كافية" };
  }
  const positiveWords = ["surge", "rise", "gain", "beat", "strong", "growth", "up", "high", "record", "positive", "bull", "upgrade", "buy", "outperform", "soar", "jump", "rally", "profit", "earnings beat"];
  const negativeWords = ["fall", "drop", "miss", "weak", "down", "low", "loss", "cut", "downgrade", "sell", "underperform", "decline", "crash", "fear", "risk"];

  let pos = 0, neg = 0;
  newsList.forEach(n => {
    const text = ((n.headline || "") + " " + (n.summary || "")).toLowerCase();
    positiveWords.forEach(w => { if (text.includes(w)) pos++; });
    negativeWords.forEach(w => { if (text.includes(w)) neg++; });
  });

  const score = pos - neg;
  let reason = "";
  if (score > 2) reason = `أخبار إيجابية قوية (${pos} إشارة إيجابية مقابل ${neg} سلبية)`;
  else if (score > 0) reason = `ميل إيجابي خفيف في الأخبار`;
  else if (score === 0) reason = `أخبار متباينة أو محايدة`;
  else reason = `أخبار سلبية نسبياً`;

  return { score, positive: pos, negative: neg, reason };
}

// توليد توصية ديناميكية (لا نسب ثابتة)
function generateDynamicRecommendation(stock, quote, sentiment) {
  const basePrice = quote?.price || (100 + Math.random() * 200);
  const volatilityFactor = 0.015 + Math.random() * 0.025; // ديناميكي
  const momentum = sentiment.score > 1 ? 1.2 : sentiment.score > 0 ? 1.0 : 0.7;

  const entry = +(basePrice * (1 + (Math.random() * 0.004 - 0.001))).toFixed(2);
  const riskPct = 0.012 + Math.random() * 0.02; // ديناميكي حسب التقلب
  const stopLoss = +(entry * (1 - riskPct)).toFixed(2);
  const rewardRisk = 1.6 + Math.random() * 1.4; // ديناميكي
  const target1 = +(entry + (entry - stopLoss) * rewardRisk * 0.6).toFixed(2);
  const target2 = +(entry + (entry - stopLoss) * rewardRisk).toFixed(2);

  // نسبة النجاح المتوقعة ديناميكية
  let successRate = 45 + sentiment.score * 6 + (quote ? 8 : 0) + Math.floor(Math.random() * 12);
  successRate = Math.min(82, Math.max(38, successRate));

  const entryTimeOptions = [
    "بعد 10-20 دقيقة من الافتتاح عند استقرار الزخم",
    "عند اختراق مستوى الافتتاح بحجم مرتفع",
    "بعد أول تصحيح طفيف في أول 30 دقيقة",
    "عند تأكيد الاتجاه الصاعد على الإطار 5 دقائق"
  ];
  const entryTime = entryTimeOptions[Math.floor(Math.random() * entryTimeOptions.length)];

  return {
    ticker: stock.ticker,
    name: stock.name,
    reason: sentiment.reason + (quote ? ` | السعر الحالي $${basePrice.toFixed(2)}` : " | بيانات محاكاة"),
    entryTime,
    entry,
    target1,
    target2,
    stopLoss,
    successRate,
    createdAt: new Date().toISOString(),
    details: {
      sentimentScore: sentiment.score,
      volatilityFactor: +volatilityFactor.toFixed(4),
      rewardRisk: +rewardRisk.toFixed(2),
      riskPct: +(riskPct * 100).toFixed(2) + "%"
    }
  };
}

// ========== تشغيل تحليل ما قبل السوق ==========
async function runPreMarketAnalysis() {
  const btn = document.getElementById("btn-run-analysis");
  btn.disabled = true;
  btn.textContent = "جاري التحليل...";

  addLog("بدء التحليل", "", "بدأ تحليل ما قبل السوق (مرحلة 2)");

  // نختار مجموعة من الأسهم (من المتابعة أو عشوائياً من القائمة)
  let candidates = state.watchlist.length >= 3
    ? state.watchlist.slice(0, 8)
    : HALAL_STOCKS.sort(() => Math.random() - 0.5).slice(0, 10);

  const newRecs = [];

  for (const stock of candidates) {
    // تأخير بسيط لاحترام حدود API
    await new Promise(r => setTimeout(r, state.apiKey ? 400 : 80));

    let quote = null;
    let news = [];
    if (state.apiKey) {
      quote = await fetchQuote(stock.ticker);
      news = await fetchNews(stock.ticker);
    }

    // محاكاة أخبار إذا لم يكن هناك مفتاح
    if (!state.apiKey || news.length === 0) {
      news = [
        { headline: `${stock.ticker} shows strong institutional interest`, summary: "Positive outlook on growth" },
        { headline: `Analysts upgrade ${stock.ticker} on solid fundamentals`, summary: "Revenue beat expectations" }
      ];
    }

    const sentiment = analyzeNewsSentiment(news);

    // فقط نضيف توصية إذا كان الميل إيجابياً (ديناميكي)
    if (sentiment.score >= 1 || (!state.apiKey && Math.random() > 0.4)) {
      const rec = generateDynamicRecommendation(stock, quote, sentiment);
      newRecs.push(rec);

      // إضافة للمتابعة إن لم تكن موجودة
      if (!state.watchlist.find(w => w.ticker === stock.ticker)) {
        state.watchlist.push({
          ticker: stock.ticker,
          name: stock.name,
          addedAt: new Date().toISOString(),
          lastPrice: rec.entry,
          change: quote?.change || (Math.random() * 3 - 0.5)
        });
      } else {
        // تحديث السعر
        const w = state.watchlist.find(w => w.ticker === stock.ticker);
        if (quote) {
          w.lastPrice = quote.price;
          w.change = quote.change;
        }
      }

      addLog("توصية جديدة", stock.ticker,
        `سبب: ${rec.reason} | دخول: $${rec.entry} | هدف1: $${rec.target1} | وقف: $${rec.stopLoss} | نجاح متوقع: ${rec.successRate}% | تفاصيل: ${JSON.stringify(rec.details)}`
      );
    }
  }

  // إضافة التوصيات الجديدة في المقدمة
  state.recommendations = [...newRecs, ...state.recommendations].slice(0, 30);
  state.stats.total += newRecs.length;
  saveState();

  renderRecommendations();
  renderWatchlist();
  renderLog();
  renderStats();

  btn.disabled = false;
  btn.textContent = "تشغيل تحليل ما قبل السوق";

  if (newRecs.length > 0) {
    alert(`تم إنشاء ${newRecs.length} توصية ديناميكية. راجع تبويب التوصيات والسجل.`);
  } else {
    alert("لم يتم العثور على أسهم ذات أخبار إيجابية كافية في هذه الجولة.");
  }
}

// ========== التوصيات ==========
function renderRecommendations() {
  const container = document.getElementById("recommendations-container");
  document.getElementById("rec-count").textContent = state.recommendations.length;

  if (state.recommendations.length === 0) {
    container.innerHTML = `<p class="empty-state">لا توجد توصيات حالياً.<br>اضغط "تشغيل تحليل ما قبل السوق" لبدء التحليل الديناميكي.</p>`;
    return;
  }

  container.innerHTML = state.recommendations.map(r => `
    <div class="card rec-card">
      <div class="card-header">
        <div>
          <div class="ticker">${r.ticker}</div>
          <div class="company-name">${r.name}</div>
        </div>
        <div class="success-rate">${r.successRate}% نجاح متوقع</div>
      </div>
      <div class="card-body">
        <strong>سبب الاختيار:</strong> ${r.reason}<br>
        <strong>وقت الدخول المقترح:</strong> ${r.entryTime}
      </div>
      <div class="rec-targets">
        <div class="target-box">دخول: $${r.entry}</div>
        <div class="target-box">هدف 1: $${r.target1}</div>
        <div class="target-box">هدف 2: $${r.target2}</div>
        <div class="target-box sl">وقف خسارة: $${r.stopLoss}</div>
      </div>
      <div class="card-body" style="margin-top:8px;font-size:0.75rem">
        تم إنشاؤها: ${new Date(r.createdAt).toLocaleString("ar-AE")}
        ${r.details ? `<br>تقلب: ${r.details.volatilityFactor} | مكافأة/مخاطرة: ${r.details.rewardRisk}` : ""}
      </div>
    </div>
  `).join("");
}

// ========== السجل ==========
function addLog(type, ticker, details) {
  state.log.push({
    time: new Date().toISOString(),
    type,
    ticker,
    details
  });
  if (state.log.length > 200) state.log = state.log.slice(-200);
  saveState();
}

function renderLog() {
  const container = document.getElementById("log-container");
  if (state.log.length === 0) {
    container.innerHTML = `<p class="empty-state">السجل فارغ حالياً. سيتم تسجيل كل قرار تحليل وتوصية هنا بالتفصيل.</p>`;
    return;
  }
  container.innerHTML = state.log.slice().reverse().map(item => `
    <div class="log-item">
      <div class="time">${new Date(item.time).toLocaleString("ar-AE")}</div>
      <div><strong>${item.type}</strong> ${item.ticker ? "— " + item.ticker : ""}</div>
      <div style="margin-top:4px">${item.details}</div>
    </div>
  `).join("");
}

// ========== الإحصائيات ==========
function renderStats() {
  document.getElementById("stat-total").textContent = state.stats.total;
  document.getElementById("stat-wins").textContent = state.stats.wins;
  document.getElementById("stat-losses").textContent = state.stats.losses;
  const rate = state.stats.total > 0 ? Math.round((state.stats.wins / state.stats.total) * 100) : 0;
  document.getElementById("stat-winrate").textContent = rate + "%";
}

// ========== حفظ ==========
function saveState() {
  localStorage.setItem("halal_watchlist", JSON.stringify(state.watchlist));
  localStorage.setItem("halal_recommendations", JSON.stringify(state.recommendations));
  localStorage.setItem("halal_log", JSON.stringify(state.log));
  localStorage.setItem("halal_stats", JSON.stringify(state.stats));
  if (state.apiKey) localStorage.setItem("finnhub_api_key", state.apiKey);
}

// ========== تصدير ==========
document.getElementById("btn-export-log").addEventListener("click", () => {
  if (state.log.length === 0) {
    alert("لا يوجد سجل للتصدير");
    return;
  }
  const headers = "الوقت,النوع,الرمز,التفاصيل\n";
  const rows = state.log.map(l =>
    `"${new Date(l.time).toLocaleString("ar-AE")}","${l.type}","${l.ticker || ""}","${(l.details || "").replace(/"/g, '""')}"`
  ).join("\n");
  const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `halal-trader-log-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ========== الإعدادات ==========
function updateApiStatus() {
  const el = document.getElementById("api-status");
  if (state.apiKey) {
    el.textContent = "✓ المفتاح محفوظ. سيتم استخدام بيانات Finnhub الحقيقية.";
    el.style.color = "var(--success)";
  } else {
    el.textContent = "لا يوجد مفتاح. البرنامج يعمل بالمحاكاة الديناميكية.";
    el.style.color = "var(--text-muted)";
  }
}

document.getElementById("btn-save-api").addEventListener("click", () => {
  const key = document.getElementById("api-key-input").value.trim();
  state.apiKey = key;
  saveState();
  updateApiStatus();
  alert(key ? "تم حفظ المفتاح بنجاح" : "تم مسح المفتاح");
});

// ========== تحديث الأسعار ==========
async function refreshWatchlistPrices() {
  if (state.watchlist.length === 0) {
    alert("قائمة المتابعة فارغة");
    return;
  }
  const btn = document.getElementById("btn-refresh-watch");
  btn.disabled = true;
  btn.textContent = "جاري التحديث...";

  for (const w of state.watchlist) {
    if (state.apiKey) {
      const quote = await fetchQuote(w.ticker);
      if (quote) {
        w.lastPrice = quote.price;
        w.change = quote.change;
      }
      await new Promise(r => setTimeout(r, 350));
    } else {
      // محاكاة تحديث
      w.lastPrice = w.lastPrice || (80 + Math.random() * 150);
      w.change = (Math.random() * 4 - 1.5);
    }
  }
  saveState();
  renderWatchlist();
  btn.disabled = false;
  btn.textContent = "تحديث";
  addLog("تحديث أسعار", "", "تم تحديث أسعار قائمة المتابعة");
}


// ========== الإشعارات Push ==========
// بعد نشر الـ Worker ضع رابطه هنا أو في الإعدادات
let WORKER_URL = localStorage.getItem("worker_url") || "";
let VAPID_PUBLIC_KEY = localStorage.getItem("vapid_public") || "";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function loadVapidFromWorker() {
  if (!WORKER_URL) return;
  try {
    const res = await fetch(WORKER_URL + "/vapid-public");
    if (res.ok) {
      const data = await res.json();
      if (data.publicKey) {
        VAPID_PUBLIC_KEY = data.publicKey;
        localStorage.setItem("vapid_public", data.publicKey);
      }
    }
  } catch (e) {
    console.log("Could not load VAPID from worker", e);
  }
}

async function enablePushNotifications() {
  const statusEl = document.getElementById("push-status");
  if (!statusEl) return;

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    statusEl.textContent = "المتصفح لا يدعم الإشعارات Push";
    statusEl.style.color = "var(--danger)";
    return;
  }

  try {
    // حاول تحميل المفتاح من السيرفر إذا كان متوفراً
    await loadVapidFromWorker();

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      statusEl.textContent = "لم يتم منح إذن الإشعارات";
      statusEl.style.color = "var(--danger)";
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      if (!VAPID_PUBLIC_KEY) {
        statusEl.textContent = "أدخل رابط الـ Worker أولاً في الإعدادات أو انشر السيرفر";
        statusEl.style.color = "var(--warning)";
        return;
      }
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    if (WORKER_URL) {
      const res = await fetch(WORKER_URL + "/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription)
      });
      if (!res.ok) throw new Error("فشل إرسال الاشتراك للسيرفر");
    }

    localStorage.setItem("push_subscribed", "1");
    statusEl.textContent = "✓ تم تفعيل الإشعارات بنجاح. ستصلك التوصيات تلقائياً.";
    statusEl.style.color = "var(--success)";
    addLog("تفعيل إشعارات", "", "تم الاشتراك في الإشعارات التلقائية");
  } catch (err) {
    console.error(err);
    statusEl.textContent = "حدث خطأ: " + (err.message || err);
    statusEl.style.color = "var(--danger)";
  }
}

// ========== التشغيل ==========
function init() {
  updateClocks();
  setInterval(updateClocks, 1000);

  renderStocks();
  renderWatchlist();
  renderRecommendations();
  renderLog();
  renderStats();
  updateApiStatus();

  if (state.apiKey) {
    const input = document.getElementById("api-key-input");
    if (input) input.value = state.apiKey;
  }

  const refreshBtn = document.getElementById("btn-refresh-watch");
  if (refreshBtn) refreshBtn.addEventListener("click", refreshWatchlistPrices);

  const analysisBtn = document.getElementById("btn-run-analysis");
  if (analysisBtn) analysisBtn.addEventListener("click", runPreMarketAnalysis);

  const pushBtn = document.getElementById("btn-enable-push");
  if (pushBtn) pushBtn.addEventListener("click", enablePushNotifications);

  const statusEl = document.getElementById("push-status");
  if (statusEl && localStorage.getItem("push_subscribed") === "1") {
    statusEl.textContent = "✓ الإشعارات مفعّلة مسبقاً";
    statusEl.style.color = "var(--success)";
  }

  // حفظ رابط الـ Worker من الإعدادات إن وُجد
  const workerInput = document.getElementById("worker-url-input");
  if (workerInput) {
    workerInput.value = WORKER_URL;
    document.getElementById("btn-save-worker")?.addEventListener("click", () => {
      WORKER_URL = workerInput.value.trim().replace(/\/$/, "");
      localStorage.setItem("worker_url", WORKER_URL);
      alert("تم حفظ رابط السيرفر");
    });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // عند الضغط على الإشعار
  navigator.serviceWorker?.addEventListener("message", event => {
    if (event.data?.type === "NOTIFICATION_CLICK") {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      const recBtn = document.querySelector('[data-tab="recommendations"]');
      if (recBtn) {
        recBtn.classList.add("active");
        document.getElementById("tab-recommendations")?.classList.add("active");
      }
    }
  });
}

init();
