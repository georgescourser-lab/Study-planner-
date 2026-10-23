import { GoogleGenAI } from '@google/genai';
import { QuizQuestion, FlashcardItem } from '@/types/study-plan';

const CANDIDATE_GEMINI_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
];

export interface StudyBuddyResponse {
  answer: string;
  examTip: string;
  msLearnQuery?: string;
  relatedTopics: string[];
  source: 'gemini' | 'curriculum-engine';
}

/**
 * Built-in AZ-900 Topic Knowledge Base for high-relevance domain search and offline resiliency.
 */
export const AZ900_TOPICS_CATALOG = [
  {
    domain: 'Cloud Concepts',
    topic: 'Cloud Computing Models & Shared Responsibility',
    keywords: ['shared responsibility', 'iaas', 'paas', 'saas', 'on-premises', 'cloud model', 'data ownership', 'identity'],
    summary: 'The Shared Responsibility Model divides security duties between cloud provider and customer. Regardless of cloud model (IaaS, PaaS, SaaS), the customer ALWAYS retains 100% responsibility for data and identity management.',
    examTip: 'Exam trap: Who manages data in SaaS? The customer ALWAYS manages data and identity across every cloud model.',
    msLearnQuery: 'AZ-900 Describe cloud concepts shared responsibility IaaS PaaS SaaS',
  },
  {
    domain: 'Cloud Concepts',
    topic: 'Cloud Benefits: Scalability, Elasticity, Agility, High Availability & Disaster Recovery',
    keywords: ['scalability', 'elasticity', 'agility', 'high availability', 'disaster recovery', 'fault tolerance'],
    summary: 'Scalability is the ability to add or remove resources (vertical/horizontal). Elasticity is dynamic automatic scaling in response to fluctuating demand. High Availability guarantees uptime, while Disaster Recovery restores operations after major events.',
    examTip: 'Scalability handles growth; elasticity handles fluctuating/bursty spikes automatically.',
    msLearnQuery: 'AZ-900 Describe benefits of cloud computing scalability elasticity',
  },
  {
    domain: 'Cloud Concepts',
    topic: 'CapEx vs. OpEx & Consumption-Based Pricing',
    keywords: ['capex', 'opex', 'capital expenditure', 'operational expenditure', 'consumption', 'pricing', 'pay-as-you-go'],
    summary: 'Capital Expenditure (CapEx) involves high upfront costs for physical hardware with depreciation over time. Operational Expenditure (OpEx) is pay-as-you-go, consumption-based spending on cloud services with no upfront infrastructure purchases.',
    examTip: 'Moving to Azure shifts IT financing model from CapEx to OpEx.',
    msLearnQuery: 'AZ-900 Describe CapEx vs OpEx cloud economics',
  },
  {
    domain: 'Cloud Concepts',
    topic: 'Cloud Deployment Models: Public, Private, Hybrid & Multi-Cloud',
    keywords: ['public cloud', 'private cloud', 'hybrid cloud', 'multi-cloud', 'azure arc', 'azure stack'],
    summary: 'Public Cloud is owned and operated by a third-party provider (Microsoft) offering services over the internet. Private Cloud is used exclusively by a single organization (on-premises datacenter). Hybrid Cloud combines public and private clouds, enabling data and apps to be shared. Multi-Cloud uses services from multiple public cloud providers.',
    examTip: 'Hybrid cloud gives the greatest flexibility for organizations with legacy on-premises compliance requirements.',
    msLearnQuery: 'AZ-900 Describe public private hybrid multi-cloud models',
  },
  {
    domain: 'Azure Architecture & Services',
    topic: 'Azure Core Infrastructure: Regions, Availability Zones & Region Pairs',
    keywords: ['regions', 'availability zones', 'region pairs', 'geographies', 'datacenter', 'redundancy', 'fault isolation'],
    summary: 'Regions contain one or more datacenters connected via low-latency network. Availability Zones are physically separate datacenters within the SAME region with isolated power, cooling, and network. Region Pairs are two regions within the same geography situated at least 300 miles apart.',
    examTip: 'Datacenter failure = Availability Zones. Regional catastrophic weather disaster = Region Pairs.',
    msLearnQuery: 'AZ-900 Describe Azure regions availability zones region pairs',
  },
  {
    domain: 'Azure Architecture & Services',
    topic: 'Azure Management Hierarchy: Management Groups, Subscriptions & Resource Groups',
    keywords: ['management groups', 'subscriptions', 'resource groups', 'hierarchy', 'arm', 'governance scope'],
    summary: 'Azure provides 4 levels of management scope: Management Groups (top container for policies across subscriptions) -> Subscriptions (billing & access boundary) -> Resource Groups (logical lifecycle container for related resources) -> Resources (individual Azure services). Settings flow down via inheritance.',
    examTip: 'Management Groups can manage access, policy, and compliance across multiple subscriptions simultaneously.',
    msLearnQuery: 'AZ-900 Describe Azure management groups subscriptions resource groups',
  },
  {
    domain: 'Azure Architecture & Services',
    topic: 'Azure Compute: VMs, VM Scale Sets, App Services, ACI, AKS & Azure Functions',
    keywords: ['virtual machines', 'vm', 'vmss', 'virtual machine scale sets', 'app service', 'aci', 'aks', 'functions', 'serverless', 'containers', 'iaas', 'paas'],
    summary: 'Virtual Machines are IaaS giving full OS control. VM Scale Sets (VMSS) provide auto-scaling for identical VMs. App Service is PaaS for managed web apps and APIs. Azure Container Instances (ACI) runs isolated containers without cluster orchestration. Azure Kubernetes Service (AKS) orchestrates containerized microservices. Azure Functions is serverless event-driven compute.',
    examTip: 'Run code without managing servers or runtimes = Azure Functions (Serverless). Deploy web app with minimal OS overhead = Azure App Service.',
    msLearnQuery: 'AZ-900 Azure compute services VM App Service ACI AKS Functions',
  },
  {
    domain: 'Azure Architecture & Services',
    topic: 'Azure Storage: Blob, Disk, Files, Queue & Redundancy Tiers',
    keywords: ['blob storage', 'azure files', 'disk storage', 'hot tier', 'cool tier', 'cold tier', 'archive tier', 'lrs', 'zrs', 'grs', 'gzrs'],
    summary: 'Azure Blob Storage offers Hot (frequent), Cool (30d min), Cold (90d min), and Archive (180d min, offline, needs rehydration). Redundancy: LRS (3 copies 1 DC), ZRS (3 copies across 3 Zones in primary region), GRS (3 primary + 3 secondary region 300+ miles away). Azure Files provides fully managed SMB/NFS file shares.',
    examTip: 'Archive tier is the only offline tier and requires rehydration before accessing data.',
    msLearnQuery: 'AZ-900 Azure storage redundancy tiers LRS ZRS GRS hot cool archive',
  },
  {
    domain: 'Azure Architecture & Services',
    topic: 'Azure Networking: VNet, Subnets, Peering, VPN Gateway, ExpressRoute & Bastion',
    keywords: ['vnet', 'virtual network', 'vpn gateway', 'expressroute', 'azure bastion', 'peering', 'nsg', 'subnets', 'dns'],
    summary: 'Virtual Network (VNet) enables private communication. VNet Peering links VNets seamlessly across Microsoft private backbone. VPN Gateway provides encrypted connections over the public Internet. Azure ExpressRoute provides dedicated private fiber connectivity bypassing the public Internet. Azure Bastion provides secure browser-based RDP/SSH to VMs without public IP.',
    examTip: 'ExpressRoute = Private fiber dedicated connection without using public Internet. Azure Bastion = Browser RDP/SSH without public IP.',
    msLearnQuery: 'AZ-900 Azure networking Virtual Network ExpressRoute VPN Gateway Bastion',
  },
  {
    domain: 'Azure Architecture & Services',
    topic: 'Azure Database Offerings: Azure SQL, Cosmos DB & MySQL/PostgreSQL',
    keywords: ['azure sql', 'cosmos db', 'nosql', 'relational', 'mysql', 'postgresql', 'synapse', 'database'],
    summary: 'Azure SQL Database is fully managed relational PaaS. Azure Cosmos DB is globally distributed, multi-model NoSQL database service offering single-digit millisecond response times and 99.999% SLA. Azure Synapse Analytics is enterprise analytics integrating big data and data warehousing.',
    examTip: 'Turnkey global distribution with NoSQL = Azure Cosmos DB. Managed relational SQL = Azure SQL.',
    msLearnQuery: 'AZ-900 Azure database services Cosmos DB Azure SQL Synapse',
  },
  {
    domain: 'Management & Governance',
    topic: 'Azure Resource Manager (ARM), Resource Groups & Resource Locks',
    keywords: ['arm', 'resource manager', 'resource groups', 'resource locks', 'cannotdelete', 'readonly', 'tags', 'lock'],
    summary: 'ARM provides a consistent deployment and management layer. Resource Groups group lifecycle-related resources. Resource Locks prevent accidents: CanNotDelete allows read/modify but blocks deletion; ReadOnly blocks both delete and modify. Locks are inherited from parent to children.',
    examTip: 'CanNotDelete overrides Subscription Owner permissions. Locks are inherited by all child resources.',
    msLearnQuery: 'AZ-900 Azure Resource Manager locks CanNotDelete ReadOnly',
  },
  {
    domain: 'Management & Governance',
    topic: 'Identity & Access: Microsoft Entra ID, RBAC & Zero Trust',
    keywords: ['entra id', 'azure ad', 'rbac', 'role based access control', 'zero trust', 'mfa', 'conditional access', 'single sign-on', 'sso'],
    summary: 'Microsoft Entra ID (formerly Azure AD) is a cloud identity and access management service. Role-Based Access Control (RBAC) grants fine-grained permissions (Owner, Contributor, Reader). Zero Trust model assumes breach and verifies explicitly using least-privileged access and continuous verification.',
    examTip: 'RBAC controls WHO has permission to do WHAT. Azure Policy controls WHAT resource configurations are allowed.',
    msLearnQuery: 'AZ-900 Microsoft Entra ID RBAC Zero Trust conditional access',
  },
  {
    domain: 'Management & Governance',
    topic: 'Governance & Compliance: Azure Policy, Initiatives & Microsoft Purview',
    keywords: ['azure policy', 'initiatives', 'compliance', 'purview', 'governance', 'regulatory'],
    summary: 'Azure Policy enforces organizational standards and assesses compliance (e.g. restrict VMs to specific regions). An Initiative is a collection of policy definitions grouped toward a singular goal (like ISO 27001 compliance). Purview governs unified data governance.',
    examTip: 'Need to prevent deployment of resources in disallowed regions? Deploy an Azure Policy.',
    msLearnQuery: 'AZ-900 Azure Policy Initiatives governance compliance',
  },
  {
    domain: 'Management & Governance',
    topic: 'Monitoring & Optimization: Azure Monitor, Service Health & Cost Management',
    keywords: ['azure monitor', 'service health', 'cost management', 'pricing calculator', 'total cost of ownership', 'tco', 'advisor', 'alerts'],
    summary: 'Azure Monitor collects and analyzes telemetry (metrics and logs). Azure Service Health notifies about outages, planned maintenance, and service advisories. Azure Advisor provides recommendations for cost, security, reliability, operational excellence, and performance. Pricing Calculator estimates future costs; TCO Calculator compares on-premises vs Azure costs.',
    examTip: 'Azure Advisor provides recommendations across 5 pillars (Cost, Security, Reliability, Performance, Operational Excellence).',
    msLearnQuery: 'AZ-900 Azure Monitor Service Health Cost Management Advisor',
  },
  {
    domain: 'Management & Governance',
    topic: 'Service Level Agreements (SLAs), Composite SLAs & Service Lifecycle',
    keywords: ['sla', 'service level agreement', 'composite sla', 'uptime', 'downtime', 'private preview', 'public preview', 'general availability', 'ga'],
    summary: 'Microsoft publishes SLAs defining formal performance and uptime commitments (e.g. 99.9%, 99.99%). Composite SLA is calculated by multiplying individual service SLAs (e.g., 99.9% VM x 99.95% SQL Database = 99.85%). Service Lifecycle flows from Private Preview -> Public Preview -> General Availability (GA). Preview features lack SLAs and should not be used in production.',
    examTip: 'Combining services in series lowers the composite SLA. Never run production workloads on Preview features because they have NO SLA.',
    msLearnQuery: 'AZ-900 Azure Service Level Agreements SLA composite lifecycle preview GA',
  },
];

/**
 * Searches the AZ-900 topic catalog for matching knowledge entries using token and keyword ranking.
 */
export function searchAZ900Topics(query: string) {
  if (!query || query.trim().length === 0) {
    return AZ900_TOPICS_CATALOG;
  }
  const raw = query.toLowerCase().trim();
  const stopWords = new Set([
    'what', 'is', 'the', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'to',
    'how', 'do', 'does', 'tell', 'me', 'about', 'explain', 'between', 'vs',
    'difference', 'azure', 'describe', 'can', 'you', 'give', 'list'
  ]);
  const tokens = raw.split(/[\s,?.!/\\-]+/).filter((t) => t.length > 1 && !stopWords.has(t));

  const scored = AZ900_TOPICS_CATALOG.map((item) => {
    let score = 0;
    const lowerTopic = item.topic.toLowerCase();
    const lowerDomain = item.domain.toLowerCase();
    const lowerSummary = item.summary.toLowerCase();

    // Exact topic match
    if (lowerTopic.includes(raw) || raw.includes(lowerTopic)) score += 60;
    if (lowerDomain.includes(raw)) score += 20;

    // Keyword matches
    for (const kw of item.keywords) {
      const lowerKw = kw.toLowerCase();
      if (raw.includes(lowerKw)) {
        score += 35;
      }
      if (tokens.some((t) => lowerKw.includes(t) || t.includes(lowerKw))) {
        score += 15;
      }
    }

    // Token matches in topic & summary
    for (const t of tokens) {
      if (lowerTopic.includes(t)) score += 20;
      if (lowerSummary.includes(t)) score += 8;
    }

    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).map((s) => s.item);

  return matched.length > 0 ? matched : AZ900_TOPICS_CATALOG.slice(0, 4);
}

/**
 * Helper to call Gemini with automatic model cascading.
 */
async function callGemini(prompt: string, jsonMode = false): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  let lastError: any = null;

  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: jsonMode
          ? {
              responseMimeType: 'application/json',
              temperature: 0.3,
            }
          : {
              temperature: 0.4,
            },
      });

      const text = response.text || '';
      if (text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} failed, attempting next:`, err?.message || err);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed');
}

/**
 * AI Study Buddy: Searches topic knowledge and produces an authoritative AZ-900 explanation.
 */
export async function askStudyBuddyTopic(options: {
  topic?: string;
  question: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<StudyBuddyResponse> {
  const { topic, question, history } = options;
  const matchedCatalog = searchAZ900Topics(`${topic || ''} ${question}`);
  const contextNotes = matchedCatalog
    .slice(0, 3)
    .map(
      (m) =>
        `[Domain: ${m.domain} | Topic: ${m.topic}]\nSummary: ${m.summary}\nExam Tip: ${m.examTip}\nSearch Term: ${m.msLearnQuery}`
    )
    .join('\n\n');

  const systemPrompt = `You are the CloudPrep AI Study Buddy, an authoritative Microsoft Certified Trainer for the AZ-900 (Microsoft Azure Fundamentals) certification exam.
The user is asking a question or asking to explore a topic:
Target Topic Context: "${topic || 'General AZ-900 Syllabus'}"
User Question/Search Query: "${question}"

Official AZ-900 Curriculum Context:
${contextNotes || 'Focus on official Microsoft Azure Fundamentals objectives.'}

Provide a well-structured, engaging response formatted in Markdown:
1. **Core Concept Explained**: Explain the concept clearly and concisely. Use a short, memorable analogy (like Pizza-as-a-Service, real estate, airport security, or electricity grid) to make it intuitive.
2. **Azure Architectural Details**: Highlight key service attributes, boundaries, redundancy, or management features candidates must know.
3. **Official AZ-900 Exam Trap & Key Tip**: Exactly what Microsoft tests on the exam and how to avoid typical trick questions.
4. **Hands-On / Portal Pro-Tip**: 1 practical step on where to see or configure this in the Azure Portal or Azure CLI.
5. **Recommended MS Learn Query**: Exact search keywords for Microsoft Learn documentation.

Keep it encouraging, precise, and directly aligned with the official AZ-900 exam passing score (700/1000).`;

  try {
    const rawAnswer = await callGemini(systemPrompt, false);

    // Extract exam tip from response if present, or use catalog tip
    let examTip = matchedCatalog[0]?.examTip || '700/1000 score required to pass. Architecture & Services is 35-40% of the exam.';
    const tipMatch = rawAnswer.match(/(?:Exam Trap|Exam Tip|Key Tip|Takeaway)[^:\n]*:\s*([^\n]+)/i);
    if (tipMatch && tipMatch[1]) {
      examTip = tipMatch[1].trim().replace(/\*\*/g, '');
    }

    const relatedTopics = matchedCatalog.map((m) => m.topic).slice(0, 4);

    return {
      answer: rawAnswer,
      examTip,
      msLearnQuery: matchedCatalog[0]?.msLearnQuery || `AZ-900 ${topic || question}`,
      relatedTopics: relatedTopics.length > 0 ? relatedTopics : ['Cloud Concepts', 'Azure Compute', 'Resource Locks', 'Blob Storage Tiers'],
      source: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini Study Buddy failed, using expert curriculum fallback engine:', err);

    const primaryMatch = matchedCatalog[0] || AZ900_TOPICS_CATALOG[0];
    const fallbackAnswer = `### 📘 Concept Breakdown: ${primaryMatch.topic}

**Domain:** ${primaryMatch.domain}

${primaryMatch.summary}

#### 💡 How to Think About This Concept:
When approaching Azure Fundamentals, remember that cloud architecture is built for resiliency and clear ownership boundaries. 

#### 🎯 Official AZ-900 Focus Points:
• **Core Definition:** ${primaryMatch.summary}
• **Exam Objective Alignment:** Ensure you understand the differences between PaaS, IaaS, and SaaS, or regional isolation boundaries.
• **Official Microsoft Learn Reference:** Search \`${primaryMatch.msLearnQuery}\` for the interactive sandbox module.`;

    return {
      answer: fallbackAnswer,
      examTip: primaryMatch.examTip,
      msLearnQuery: primaryMatch.msLearnQuery,
      relatedTopics: matchedCatalog.map((m) => m.topic).slice(0, 4),
      source: 'curriculum-engine',
    };
  }
}

/**
 * Safely extracts and parses JSON even if wrapped in markdown code blocks or surrounding text.
 */
function extractAndParseJson<T>(raw: string): T {
  let clean = (raw || '').trim();
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    const sObj = clean.indexOf('{');
    const eObj = clean.lastIndexOf('}');
    if (sObj !== -1 && eObj > sObj) {
      try {
        return JSON.parse(clean.substring(sObj, eObj + 1));
      } catch {}
    }

    const sArr = clean.indexOf('[');
    const eArr = clean.lastIndexOf(']');
    if (sArr !== -1 && eArr > sArr) {
      try {
        return JSON.parse(clean.substring(sArr, eArr + 1));
      } catch {}
    }

    throw new Error('Failed to parse JSON from AI model response');
  }
}

/**
 * AI Practice Quiz Generator: Generates AZ-900 multiple-choice questions with options and explanations.
 */
export async function generatePracticeQuizWithAI(options: {
  topic?: string;
  domain?: string;
  questionCount?: number;
}): Promise<{ questions: QuizQuestion[]; source: 'gemini' | 'curriculum-engine' }> {
  const count = Math.min(Math.max(options.questionCount || 5, 2), 10);
  const targetTopic = options.topic || 'Azure Architecture & Services';
  const targetDomain = options.domain || 'All Domains';

  const prompt = `You are a Microsoft Certified Trainer creating practice questions for the AZ-900 (Microsoft Azure Fundamentals) certification exam.
Generate exactly ${count} high-yield multiple-choice practice questions.
Topic Focus: "${targetTopic}"
Target Domain: "${targetDomain}"

Requirements:
1. Each question must mirror official AZ-900 exam format (scenario-based or direct conceptual inquiry).
2. Exactly 4 plausible options per question. Only ONE correct option.
3. Include clear, in-depth explanation stating why the correct option is right and why the distractors are wrong.
4. Include a concise "examTip" (high-probability exam rule/mnemonic).

Return STRICTLY a JSON object with this exact structure:
{
  "questions": [
    {
      "domain": "Domain Name",
      "topic": "${targetTopic}",
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Detailed explanation...",
      "examTip": "High-yield exam rule..."
    }
  ]
}`;

  try {
    const rawJson = await callGemini(prompt, true);
    const parsed = extractAndParseJson<{ questions: any[] }>(rawJson);

    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      const formattedQuestions: QuizQuestion[] = parsed.questions.map((q: any, i: number) => ({
        id: `q_ai_${Date.now()}_${i + 1}`,
        domain: q.domain || targetDomain,
        topic: q.topic || targetTopic,
        question: q.question,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < 4 ? q.correctIndex : 0,
        explanation: q.explanation || 'Refer to Microsoft Learn for official documentation.',
        examTip: q.examTip || 'Review the official AZ-900 study guide objectives.',
      }));

      return {
        questions: formattedQuestions,
        source: 'gemini',
      };
    }
  } catch (err) {
    console.warn('Gemini Quiz Generation encountered issue, using curriculum engine fallback:', err);
  }

  // Resilient Fallback Quiz Questions
  const fallbackQuestions: QuizQuestion[] = [
    {
      id: `q_fb_${Date.now()}_1`,
      domain: targetDomain === 'All Domains' ? 'Azure Architecture & Services' : targetDomain,
      topic: targetTopic,
      question: `Regarding ${targetTopic}, which cloud computing characteristic guarantees that resources can dynamically and automatically expand or contract to meet workload demands?`,
      options: [
        'High Availability',
        'Elasticity',
        'Disaster Recovery',
        'Geo-Distribution',
      ],
      correctIndex: 1,
      explanation: 'Elasticity is the specific ability to dynamically scale computing resources up or down automatically based on demand fluctuations, ensuring cost-effective resource utilization.',
      examTip: 'Scalability refers to adding capacity; Elasticity refers to automatic, dynamic scaling with demand spikes.',
    },
    {
      id: `q_fb_${Date.now()}_2`,
      domain: targetDomain === 'All Domains' ? 'Cloud Concepts' : targetDomain,
      topic: targetTopic,
      question: 'Under the Azure Shared Responsibility Model, which security layer is the customer ALWAYS 100% responsible for, regardless of whether using IaaS, PaaS, or SaaS?',
      options: [
        'Physical datacenter security',
        'Virtual network routers and switches',
        'Data and identity credentials',
        'Host server operating system updates',
      ],
      correctIndex: 2,
      explanation: 'In every cloud deployment model (IaaS, PaaS, SaaS), the customer ALWAYS maintains sole ownership and responsibility for their data and identity/access management.',
      examTip: 'Customer ALWAYS owns Data and Identities across all models.',
    },
    {
      id: `q_fb_${Date.now()}_3`,
      domain: targetDomain === 'All Domains' ? 'Management & Governance' : targetDomain,
      topic: targetTopic,
      question: 'Which Azure management feature prevents critical production resources from being accidentally deleted, even by users assigned the Subscription Owner role?',
      options: [
        'Azure Role-Based Access Control (RBAC) Reader role',
        'CanNotDelete Resource Lock',
        'Azure Network Security Group (NSG) outbound rule',
        'Azure Service Health Alert',
      ],
      correctIndex: 1,
      explanation: 'A CanNotDelete resource lock prevents any user—including Subscription and Resource Group Owners—from deleting a resource until the lock is explicitly deleted.',
      examTip: 'CanNotDelete allows read and update operations, but blocks deletion completely.',
    },
    {
      id: `q_fb_${Date.now()}_4`,
      domain: targetDomain === 'All Domains' ? 'Azure Architecture & Services' : targetDomain,
      topic: targetTopic,
      question: 'An organization requires dedicated, high-speed fiber connectivity to Microsoft Azure that completely bypasses the public Internet. Which networking service should they deploy?',
      options: [
        'Azure VPN Gateway',
        'Azure ExpressRoute',
        'Azure Virtual Network Peering',
        'Azure Traffic Manager',
      ],
      correctIndex: 1,
      explanation: 'Azure ExpressRoute establishes a direct, private fiber connection through a connectivity provider that does not travel over the public Internet.',
      examTip: 'Private dedicated fiber bypassing public Internet = ExpressRoute.',
    },
    {
      id: `q_fb_${Date.now()}_5`,
      domain: targetDomain === 'All Domains' ? 'Azure Architecture & Services' : targetDomain,
      topic: targetTopic,
      question: 'Which Azure Blob Storage access tier is optimized for data that is rarely accessed, requires at least 180 days of retention, and can tolerate several hours of retrieval latency?',
      options: [
        'Hot tier',
        'Cool tier',
        'Cold tier',
        'Archive tier',
      ],
      correctIndex: 3,
      explanation: 'The Archive tier has the lowest storage cost and highest retrieval cost. Data must remain in Archive for at least 180 days and requires rehydration before it can be read.',
      examTip: 'Archive tier is offline and requires rehydration; minimum retention period is 180 days.',
    },
  ];

  return {
    questions: fallbackQuestions.slice(0, count),
    source: 'curriculum-engine',
  };
}

/**
 * AI Flashcard Generator: Generates active recall flashcard decks for any AZ-900 topic.
 */
export async function generateFlashcardsWithAI(options: {
  topic?: string;
  domain?: string;
  cardCount?: number;
}): Promise<{ cards: FlashcardItem[]; source: 'gemini' | 'curriculum-engine' }> {
  const count = Math.min(Math.max(options.cardCount || 5, 3), 12);
  const targetTopic = options.topic || 'Azure Architecture & Core Services';
  const targetDomain = options.domain || 'Azure Architecture & Services';

  const prompt = `You are a Microsoft Certified Trainer creating high-yield active recall flashcards for students studying for the Microsoft Azure Fundamentals (AZ-900) certification exam.
Generate exactly ${count} flashcards.
Topic: "${targetTopic}"
Domain: "${targetDomain}"

Requirements:
1. "front": Concise prompt, scenario, or question testing a core AZ-900 concept.
2. "back": Authoritative, clear explanation (2-3 concise sentences or bullet points) that directly answers the front.
3. "examHint": 1 punchy exam rule or mnemonic to remember under timed exam pressure.

Return STRICTLY JSON:
{
  "cards": [
    {
      "domain": "${targetDomain}",
      "topic": "${targetTopic}",
      "front": "Prompt text...",
      "back": "Answer explanation...",
      "examHint": "Exam tip..."
    }
  ]
}`;

  try {
    const rawJson = await callGemini(prompt, true);
    const parsed = extractAndParseJson<{ cards: any[] }>(rawJson);

    if (parsed && Array.isArray(parsed.cards) && parsed.cards.length > 0) {
      const formattedCards: FlashcardItem[] = parsed.cards.map((c: any, i: number) => ({
        id: `fc_ai_${Date.now()}_${i + 1}`,
        domain: c.domain || targetDomain,
        topic: c.topic || targetTopic,
        front: c.front,
        back: c.back,
        examHint: c.examHint || 'High-probability question topic on the AZ-900 exam.',
      }));

      return {
        cards: formattedCards,
        source: 'gemini',
      };
    }
  } catch (err) {
    console.warn('Gemini Flashcard generation encountered issue, using curriculum engine fallback:', err);
  }

  // Resilient Fallback Flashcards
  const fallbackCards: FlashcardItem[] = [
    {
      id: `fc_fb_${Date.now()}_1`,
      domain: targetDomain,
      topic: targetTopic,
      front: `What is the key difference between CapEx and OpEx in cloud computing?`,
      back: `CapEx (Capital Expenditure) requires upfront financial investment in physical servers and infrastructure. OpEx (Operational Expenditure) is pay-as-you-go, consumption-based spending on cloud services with zero upfront hardware costs.`,
      examHint: `Cloud computing transforms IT budgeting from CapEx to OpEx.`,
    },
    {
      id: `fc_fb_${Date.now()}_2`,
      domain: targetDomain,
      topic: targetTopic,
      front: `How does an Azure Availability Zone protect workloads against failures?`,
      back: `Availability Zones are physically separate datacenters located within the SAME Azure region. Each zone has independent power, cooling, and networking to safeguard against localized datacenter outages.`,
      examHint: `Datacenter-level failure in same city = Availability Zone. Regional disaster (>300 miles) = Region Pair.`,
    },
    {
      id: `fc_fb_${Date.now()}_3`,
      domain: targetDomain,
      topic: targetTopic,
      front: `What is the inheritance behavior of Azure Resource Locks?`,
      back: `Resource Locks applied at the Subscription or Resource Group level are automatically inherited by all child resources contained inside them. A CanNotDelete lock on a Resource Group prevents deletion of any resource within it.`,
      examHint: `Locks override RBAC permissions and cascade downwards to all child resources.`,
    },
    {
      id: `fc_fb_${Date.now()}_4`,
      domain: targetDomain,
      topic: targetTopic,
      front: `When should an organization choose Azure ExpressRoute instead of a Site-to-Site VPN Gateway?`,
      back: `Choose Azure ExpressRoute when private, dedicated fiber connectivity is required that completely bypasses the public Internet, offering higher reliability, greater speeds, and lower latency.`,
      examHint: `ExpressRoute = Private fiber dedicated connection without using public Internet.`,
    },
    {
      id: `fc_fb_${Date.now()}_5`,
      domain: targetDomain,
      topic: targetTopic,
      front: `What are the minimum retention periods for Azure Blob Storage Hot, Cool, Cold, and Archive tiers?`,
      back: `• Hot: No minimum retention period\n• Cool: 30 days minimum\n• Cold: 90 days minimum\n• Archive: 180 days minimum (offline, requires rehydration to read)`,
      examHint: `Archive tier has lowest storage cost, highest access cost, and requires 180-day minimum retention.`,
    },
  ];

  return {
    cards: fallbackCards.slice(0, count),
    source: 'curriculum-engine',
  };
}
