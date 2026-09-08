import { Article } from "@/types/article";

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: "sovereign-compute-2026",
    kicker: "COMPUTE ARCHITECTURE",
    title: "The Sovereign Compute Dilemma: Why Europe Cannot Buy Its Way Out of the AI Stack",
    subtitle: "Subsidies cannot substitute for proprietary silicon fabrication. An investigation into the struggle to decouple critical infrastructure from foreign hyperscalers.",
    author: {
      name: "Dr. Helena Von Berg",
      role: "Technology Editor",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "Sept 8, 2026",
    sourceUrl: "https://resonance.editorial/analysis/sovereign-compute-2026",
    readTimeMinutes: 6,
    wordCount: 1420,
    heroImage: {
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      caption: "Lithography cleanroom stage inside an advanced semiconductor fabrication facility.",
      credit: "Keystone",
    },
    tags: ["Semiconductors", "Infrastructure"],
    sections: [
      {
        id: "s1",
        type: "lead",
        content: "Ministers across the continent repeat a comforting thesis: with enough public capital and domestic data centers, autonomy over artificial intelligence is within reach. The reality on factory floors tells a different story.",
      },
      {
        id: "s2",
        type: "data-callout",
        content: "AI Hardware Dependency",
        dataMetric: {
          label: "Foreign Silicon Exposure",
          value: "92.4%",
          change: "+3.1%",
          context: "Proportion of frontier model training dependent on imported hardware clusters.",
        },
      },
      {
        id: "s3",
        type: "heading",
        content: "The Silicon Bottleneck",
      },
      {
        id: "s4",
        type: "paragraph",
        content: "True sovereignty begins at the nanometer level. Advanced pipelines require EUV optics and high-bandwidth packaging that cannot simply be re-engineered through directives.",
      },
      {
        id: "s5",
        type: "quote",
        content: "You can mandate that data resides locally, but if the processing units are subject to foreign export controls, sovereignty is a fiction.",
        quoteAuthor: "Laurent Mercier",
        quoteRole: "ETH Zurich",
      },
    ],
  },
  {
    id: "alpine-water-battery",
    kicker: "ENERGY RESILIENCE",
    title: "The Alpine Water Battery: How Caverns Stabilize the Continental Grid",
    subtitle: "Six hundred meters beneath granite peaks, subterranean pumped-storage facilities have become Europe's most indispensable renewable energy shock absorbers.",
    author: {
      name: "Marcus Tanner",
      role: "Climate Correspondent",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "Sept 6, 2026",
    sourceUrl: "https://resonance.editorial/investigations/alpine-water-battery",
    readTimeMinutes: 4,
    wordCount: 980,
    heroImage: {
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80",
      caption: "The high-altitude reservoir of Nant de Drance surrounded by the Valais Alps.",
      credit: "Alpiq",
    },
    tags: ["Hydropower", "Grid"],
    sections: [
      {
        id: "ab-1",
        type: "lead",
        content: "Inside the mountain rock above Martigny, the roar of six reversible pump-turbines vibrates through the bedrock. This is Nant de Drance: capable of storing potential energy for four hundred thousand households within minutes.",
      },
      {
        id: "ab-2",
        type: "data-callout",
        content: "Response Time",
        dataMetric: {
          label: "Full Ramp to 900MW",
          value: "< 5 Mins",
          change: "98% uptime",
          context: "Rapid stabilization when intermittent wind or solar drops off.",
        },
      },
      {
        id: "ab-3",
        type: "quote",
        content: "The transition is not merely about producing green electrons; it is about storing them until humanity needs them.",
        quoteAuthor: "Béatrice Graber",
        quoteRole: "Chief Engineer",
      },
    ],
  },
  {
    id: "drought-grain-resilience",
    kicker: "AGRICULTURE & BIOTECH",
    title: "Drought-Resistant Grain in the Po Valley: Field Trials Exceed Yield Forecasts",
    subtitle: "CRISPR-edited wheat variants demonstrate a forty percent reduction in transpiration during southern European heatwaves.",
    author: {
      name: "Chiara Rossi",
      role: "Agronomy Editor",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
    publishedAt: "Sept 4, 2026",
    sourceUrl: "https://resonance.editorial/science/drought-grain-po-valley",
    readTimeMinutes: 5,
    wordCount: 1100,
    heroImage: {
      url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80",
      caption: "Agronomy test plots under solar canopy monitoring in northern Italy.",
      credit: "AgroLab",
    },
    tags: ["Biotech", "Agriculture"],
    sections: [
      {
        id: "dg-1",
        type: "lead",
        content: "After three consecutive record-dry summers across Lombardy, harvest data from experimental cereal fields has delivered rare optimism for Mediterranean food security.",
      },
      {
        id: "dg-2",
        type: "quote",
        content: "Targeted stomatal regulation allowed the plants to sustain photosynthetic output even through 39-degree afternoon peaks.",
        quoteAuthor: "Prof. Alberto Rossi",
        quoteRole: "Bologna Agricultural Institute",
      },
    ],
  },
];
