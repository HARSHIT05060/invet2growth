// Sample news and education articles (development only — see README).
// Content is general and educational: no guaranteed returns, no personalised
// buy/sell calls. Anything that could be read as advice needs compliance review.

export const ARTICLE_CATEGORIES = [
  { id: "stock-market-news", label: "Stock Market News", color: "market" },
  { id: "investment-tips", label: "Investment Tips", color: "tips" },
  { id: "real-estate-news", label: "Real Estate News", color: "property" },
  { id: "property-investment", label: "Property Investment", color: "property" },
  { id: "mutual-funds", label: "Mutual Funds", color: "tips" },
  { id: "ipo-updates", label: "IPO Updates", color: "market" },
  { id: "financial-education", label: "Financial Education", color: "tips" },
  { id: "business-news", label: "Business News", color: "news" },
  { id: "economy-updates", label: "Economy Updates", color: "news" },
  { id: "market-analysis", label: "Market Analysis", color: "market" },
];

export const ARTICLE_TAGS = [
  "NIFTY", "SENSEX", "RBI", "Repo rate", "Home loans", "RERA", "SIP", "Index funds", "IPO", "GST",
  "Budget", "Inflation", "Rental yield", "Tier-2 cities", "Tax", "Emergency fund", "Banking", "IT sector",
];

const IMG = {
  market: "/images/hero.webp",
  city: "/images/listings/kolkata.webp",
  flats: "/images/categories/flats.webp",
  plots: "/images/categories/plots.webp",
  shops: "/images/categories/shops.webp",
  pune: "/images/listings/pune.webp",
  jaipur: "/images/listings/jaipur.webp",
  agri: "/images/categories/agricultural.webp",
  houses: "/images/categories/houses.webp",
};

const a = (o) => ({
  status: "published",
  featured: false,
  trending: false,
  likes: 0,
  views: 0,
  author: "invest2growth Desk",
  compliance: "not-required",
  seoTitle: "",
  metaDescription: "",
  scheduledAt: null,
  deletedAt: null,
  ...o,
});

export const ARTICLES = [
  a({
    id: "ar1", slug: "nifty-weekly-wrap-banks-lead", category: "stock-market-news", title: "Weekly wrap: Banks lead as NIFTY ends the week higher",
    excerpt: "Private lenders and PSU banks did most of the lifting this week while IT stayed range-bound. Here is what moved the indices.",
    image: IMG.market, tags: ["NIFTY", "Banking", "SENSEX"], publishedAt: "2026-11-15T18:30:00+05:30", readMins: 4,
    featured: true, trending: true, likes: 342, views: 12840, author: "Ishaan Kulkarni",
    body: `<p>Indian equities closed the week on a firmer footing, with the banking index outperforming the broader market for a third straight week. Heavyweight private lenders gained on steady loan growth commentary, while public-sector banks extended their rally on improving asset quality.</p>
<h2>What moved</h2>
<ul><li><strong>Banks:</strong> credit growth data and stable net interest margins supported sentiment.</li><li><strong>IT:</strong> stayed range-bound as investors waited for clarity on global tech spending.</li><li><strong>Auto:</strong> festive-season dispatch numbers were mixed across two-wheelers and passenger vehicles.</li></ul>
<h2>What to watch next week</h2>
<p>Monthly inflation data, foreign portfolio flows and global bond yields are the key variables. Market moves over a single week say little about long-term outcomes; investors with long horizons usually focus on asset allocation rather than weekly swings.</p>`,
  }),
  a({
    id: "ar2", slug: "how-sip-step-up-works", category: "investment-tips", title: "How a step-up SIP works, and when it makes sense",
    excerpt: "Raising your SIP amount every year can align investing with salary growth. We explain the mechanics with a simple illustration.",
    image: IMG.pune, tags: ["SIP", "Index funds"], publishedAt: "2026-11-14T09:00:00+05:30", readMins: 6, trending: true,
    likes: 518, views: 9320, author: "Ananya Rao", compliance: "approved",
    body: `<p>A systematic investment plan (SIP) invests a fixed amount at regular intervals. A <strong>step-up SIP</strong> increases that amount by a set percentage or rupee value each year.</p>
<h2>The idea in one line</h2>
<p>If your income rises over time, a step-up lets your savings rate keep pace without a big jump in any single month.</p>
<h2>An illustration, not a projection</h2>
<p>Suppose you start at ₹10,000 a month and step up by 10% each year. In year two you invest ₹11,000 a month, in year three ₹12,100, and so on. The total invested grows faster than a flat SIP. Market-linked returns are not guaranteed and can be negative over short periods.</p>
<h2>Things to check</h2>
<ul><li>Is your emergency fund in place before you commit to higher contributions?</li><li>Does the scheme's risk level match your goal and time horizon?</li><li>Can you sustain the step-up if your income stalls?</li></ul>
<p>This is general education. Talk to a SEBI-registered investment adviser for advice specific to you.</p>`,
  }),
  a({
    id: "ar3", slug: "repo-rate-home-loan-emi", category: "real-estate-news", title: "What a repo rate change means for your home loan EMI",
    excerpt: "Most new home loans are linked to an external benchmark. Here is how a policy move flows through to your monthly payment.",
    image: IMG.flats, tags: ["RBI", "Repo rate", "Home loans"], publishedAt: "2026-11-13T11:15:00+05:30", readMins: 5,
    featured: true, likes: 276, views: 8740, author: "Ishaan Kulkarni",
    body: `<p>Since 2019, most floating-rate home loans in India are linked to an external benchmark, usually the RBI repo rate. When the repo rate changes, lenders reset the loan rate at the next reset date defined in your agreement.</p>
<h2>EMI or tenure?</h2>
<p>When rates rise, many lenders extend the tenure by default instead of raising the EMI. That keeps your monthly outflow steady but increases total interest paid. You can usually ask your lender to raise the EMI instead.</p>
<h2>Quick checklist</h2>
<ul><li>Find your benchmark and spread in the sanction letter.</li><li>Check your reset frequency (quarterly or half-yearly).</li><li>Compare your spread with current offers before considering a balance transfer.</li></ul>`,
  }),
  a({
    id: "ar4", slug: "rental-yield-explained", category: "property-investment", title: "Rental yield explained: gross vs net, with a worked example",
    excerpt: "Yield is the simplest way to compare a property's income with its price, as long as you count the costs too.",
    image: IMG.jaipur, tags: ["Rental yield", "Tier-2 cities"], publishedAt: "2026-11-12T08:00:00+05:30", readMins: 7,
    likes: 190, views: 5410, author: "Meher Bhatt", compliance: "approved",
    body: `<p><strong>Gross rental yield</strong> is annual rent divided by property price. A flat bought for ₹50 lakh that rents for ₹15,000 a month earns ₹1.8 lakh a year, a gross yield of 3.6%.</p>
<h2>Net yield is what you keep</h2>
<p>Subtract maintenance, property tax, insurance, vacancy and repairs. If those add up to ₹30,000 a year, the net yield is (₹1.8 lakh − ₹0.3 lakh) ÷ ₹50 lakh = 3.0%.</p>
<h2>Why it matters</h2>
<p>Yield helps compare properties across cities and against other options. It ignores capital appreciation, which is uncertain and varies widely by micro-market.</p>`,
  }),
  a({
    id: "ar5", slug: "index-funds-vs-active-funds", category: "mutual-funds", title: "Index funds vs active funds: a plain-language comparison",
    excerpt: "Costs, tracking error and manager risk: what really separates the two, and the questions to ask before choosing.",
    image: IMG.market, tags: ["Index funds", "SIP"], publishedAt: "2026-11-11T10:00:00+05:30", readMins: 6,
    likes: 402, views: 7650, author: "Ananya Rao", compliance: "approved",
    body: `<p>An <strong>index fund</strong> holds the stocks in an index such as the NIFTY 50 in the same proportions. An <strong>active fund</strong> lets a manager pick stocks in an attempt to beat a benchmark.</p>
<h2>Key differences</h2>
<ul><li><strong>Cost:</strong> index funds usually have lower expense ratios.</li><li><strong>Tracking error:</strong> how closely an index fund follows its index.</li><li><strong>Manager risk:</strong> active returns depend on decisions that may or may not work.</li></ul>
<p>Past performance does not guarantee future returns. Read the scheme information document before investing.</p>`,
  }),
  a({
    id: "ar6", slug: "upcoming-ipo-checklist", category: "ipo-updates", title: "IPO season: a checklist before you apply",
    excerpt: "Reading the red herring prospectus, understanding the price band and knowing the allotment process.",
    image: IMG.shops, tags: ["IPO"], publishedAt: "2026-11-10T15:00:00+05:30", readMins: 5, trending: true,
    likes: 233, views: 6610, author: "Ishaan Kulkarni", compliance: "approved",
    body: `<p>Several companies have filed offer documents with SEBI this quarter. Before applying to any IPO, read the red herring prospectus (RHP), not just headlines about grey-market premiums.</p>
<h2>Checklist</h2>
<ul><li>What will the money raised be used for: growth, debt repayment, or existing shareholders selling?</li><li>How does the valuation compare with listed peers?</li><li>What risks does the company itself list in the RHP?</li></ul>
<p>Applications are made through ASBA or UPI via your broker or bank. Allotment is not guaranteed in oversubscribed issues.</p>`,
  }),
  a({
    id: "ar7", slug: "emergency-fund-basics", category: "financial-education", title: "Emergency fund basics: how much, and where to keep it",
    excerpt: "Before investing for growth, build a cushion. A simple framework for sizing and parking an emergency fund.",
    image: IMG.houses, tags: ["Emergency fund"], publishedAt: "2026-11-09T09:30:00+05:30", readMins: 4,
    likes: 610, views: 11200, author: "Meher Bhatt",
    body: `<p>An emergency fund covers essential expenses if income stops or a large unexpected bill arrives. A common rule of thumb is three to six months of essential expenses, more if your income is variable.</p>
<h2>Where to keep it</h2>
<p>Liquidity and safety matter more than return: a savings account, sweep-in fixed deposit or liquid fund are common choices. Avoid locking it in assets that can fall sharply in value.</p>`,
  }),
  a({
    id: "ar8", slug: "gst-collections-november", category: "economy-updates", title: "GST collections hold steady as festive demand lifts consumption",
    excerpt: "Monthly GST mop-up stayed strong, pointing to resilient consumption through the festive quarter.",
    image: IMG.city, tags: ["GST", "Inflation"], publishedAt: "2026-11-08T12:00:00+05:30", readMins: 3,
    likes: 98, views: 3120,
    body: `<p>Goods and Services Tax collections remained robust in the latest monthly release, helped by festive-season spending and better compliance. Economists track GST data as a timely signal of consumption trends.</p>
<p>Inflation, rural demand and government capital expenditure remain the other indicators to watch in the coming months.</p>`,
  }),
  a({
    id: "ar9", slug: "rera-what-buyers-should-check", category: "real-estate-news", title: "RERA for home buyers: five things to check before booking",
    excerpt: "Project registration, carpet area, timelines and complaint routes. A practical guide for buyers of under-construction homes.",
    image: IMG.flats, tags: ["RERA", "Home loans"], publishedAt: "2026-11-07T10:30:00+05:30", readMins: 6, featured: true,
    likes: 445, views: 9980, author: "Meher Bhatt",
    body: `<p>The Real Estate (Regulation and Development) Act requires most projects to be registered with the state RERA authority before marketing.</p>
<h2>Five checks</h2>
<ol><li>Search the project's RERA number on the state RERA website.</li><li>Confirm the promised carpet area in the agreement.</li><li>Note the declared completion date and quarterly progress updates.</li><li>Check the approved plans and any litigation disclosed.</li><li>Understand how to file a complaint if timelines slip.</li></ol>`,
  }),
  a({
    id: "ar10", slug: "it-sector-earnings-preview", category: "market-analysis", title: "IT sector: what the latest earnings season told us",
    excerpt: "Deal wins were healthy but revenue guidance stayed cautious. A look at the themes, not a stock recommendation.",
    image: IMG.market, tags: ["IT sector", "NIFTY"], publishedAt: "2026-11-06T16:00:00+05:30", readMins: 7,
    likes: 154, views: 4300, author: "Ishaan Kulkarni", compliance: "approved",
    body: `<p>Large-cap IT services companies reported steady deal wins this quarter, led by cost-optimisation and AI-related engagements, while discretionary spending stayed soft.</p>
<h2>Themes</h2>
<ul><li>Margins held up thanks to utilisation gains and lower attrition.</li><li>Guidance remained cautious given uncertain global demand.</li><li>Mid-tier companies continued to grow faster than the largest players.</li></ul>
<p>This analysis is for information only and is not a recommendation to buy or sell any security.</p>`,
  }),
  a({
    id: "ar11", slug: "tier-2-cities-housing-demand", category: "property-investment", title: "Why housing demand is spreading to tier-2 cities",
    excerpt: "Better connectivity, hybrid work and lower prices are drawing buyers to Jaipur, Lucknow, Surat and beyond.",
    image: IMG.jaipur, tags: ["Tier-2 cities", "Rental yield"], publishedAt: "2026-11-05T09:00:00+05:30", readMins: 5, trending: true,
    likes: 287, views: 7020, author: "Meher Bhatt",
    body: `<p>Expressways, new airports and hybrid work have widened the map for home buyers. Developers report rising enquiries from cities like Jaipur, Lucknow, Surat and Indore.</p>
<p>Buyers should still compare local rental demand, infrastructure timelines and resale liquidity, which can be thinner than in metros.</p>`,
  }),
  a({
    id: "ar12", slug: "business-capex-cycle", category: "business-news", title: "Corporate capex picks up in manufacturing and power",
    excerpt: "Order books at capital goods makers point to a broadening investment cycle.",
    image: IMG.shops, tags: ["Budget"], publishedAt: "2026-11-04T13:00:00+05:30", readMins: 4,
    likes: 76, views: 2210,
    body: `<p>Capital goods companies reported healthy order inflows, led by power transmission, defence and railways. Private capex announcements also rose in sectors covered by production-linked incentive schemes.</p>`,
  }),
  a({
    id: "ar13", slug: "tax-saving-without-rushing", category: "financial-education", title: "Tax planning without the March rush",
    excerpt: "Spreading tax-saving investments through the year is calmer and often better aligned with your goals.",
    image: IMG.pune, tags: ["Tax"], publishedAt: "2026-11-03T10:00:00+05:30", readMins: 5,
    likes: 221, views: 5100, author: "Ananya Rao",
    body: `<p>Many taxpayers make rushed investment decisions in the last weeks of the financial year. Planning early lets you choose products that fit your goals, not just your deadline.</p>
<p>Check which tax regime you are using, since deductions differ between the old and new regimes.</p>`,
  }),
  a({
    id: "ar14", slug: "draft-commercial-real-estate-outlook", category: "real-estate-news", title: "Office leasing outlook for 2027",
    excerpt: "Global capability centres continue to drive demand for Grade A office space.",
    image: IMG.shops, tags: ["Rental yield"], status: "draft", publishedAt: null, readMins: 5, author: "Meher Bhatt",
    body: `<p>Draft: GCC-led demand, flex space growth and supply pipeline by city.</p>`,
  }),
  a({
    id: "ar15", slug: "scheduled-budget-explainer", category: "economy-updates", title: "Budget explainer: what to watch for salaried taxpayers",
    excerpt: "A guide to the announcements that usually matter most for households.",
    image: IMG.city, tags: ["Budget", "Tax"], status: "scheduled", publishedAt: null, scheduledAt: "2026-11-20T08:00:00+05:30",
    readMins: 6, author: "Ananya Rao",
    body: `<p>Scheduled explainer covering slabs, standard deduction and capital gains.</p>`,
  }),
  a({
    id: "ar16", slug: "smallcap-tips-pending-review", category: "investment-tips", title: "Understanding small-cap risk before you invest",
    excerpt: "Small-cap stocks can be volatile and less liquid. What investors should understand first.",
    image: IMG.agri, tags: ["Index funds"], status: "draft", compliance: "pending", publishedAt: null, readMins: 5, author: "Ishaan Kulkarni",
    body: `<p>Draft awaiting compliance review: liquidity risk, volatility, and portfolio sizing.</p>`,
  }),
];
