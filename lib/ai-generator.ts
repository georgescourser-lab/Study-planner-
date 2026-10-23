import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export interface ConfidenceScores {
  cloud_concepts: number; // 1-5
  architecture_services: number; // 1-5
  management_governance: number; // 1-5
}

export interface GeneratePlanOptions {
  daysRemaining: number;
  dailyMinutes: number;
  confidenceScores: ConfidenceScores;
  weekendMultiplier?: boolean;
}

export interface GeneratedTask {
  day_number: number;
  domain: 'Cloud Concepts' | 'Azure Architecture & Services' | 'Management & Governance' | 'Final Review';
  topic_title: string;
  topic_subtitle?: string;
  action_item: string;
  sandbox_task: string;
  sandbox_steps?: string[];
  ms_learn_search_term: string;
  checkpoint_question: string;
  checkpoint_answer: string;
  key_takeaway?: string;
}

export interface GeneratedPlanOutput {
  tasks: GeneratedTask[];
  source: 'gemini' | 'openai' | 'expert-curriculum-engine';
}

/**
 * Builds the official AZ-900 syllabus prompt with strict JSON requirements.
 */
function buildSystemPrompt(options: GeneratePlanOptions): string {
  const { daysRemaining, dailyMinutes, confidenceScores } = options;
  return `You are an expert Microsoft Certified Trainer specializing in the AZ-900 (Microsoft Azure Fundamentals) exam.
Generate a personalized, day-by-day study plan in strict JSON format based on the user's inputs:
● Days until exam: ${daysRemaining}
● Daily study time: ${dailyMinutes} minutes
● Confidence levels (1-5):
  ○ Cloud Concepts (25-30% exam weight): ${confidenceScores.cloud_concepts}
  ○ Azure Architecture & Services (35-40% exam weight): ${confidenceScores.architecture_services}
  ○ Management & Governance (30-35% exam weight): ${confidenceScores.management_governance}

Rules:
1. Allocate more days to high-weight domains (especially Architecture & Services which is 35-40%) and domains where user confidence is low (1 or 2).
2. Reserve the final 1 or 2 days strictly for full-length practice exams and weak-area review.
3. Keep daily tasks realistic for ${dailyMinutes} minutes of study.
4. Return strictly a JSON object with a "tasks" array containing exactly ${daysRemaining} items where each item contains:
  ○ "day_number": integer (1 to ${daysRemaining})
  ○ "domain": string ("Cloud Concepts", "Azure Architecture & Services", "Management & Governance", or "Final Review")
  ○ "topic_title": specific AZ-900 subtopic (e.g., "Azure Virtual Machines vs App Services vs Container Instances")
  ○ "topic_subtitle": 1 short clarifying phrase
  ○ "action_item": concrete 1-sentence reading/watching goal
  ○ "sandbox_task": a quick 5-10 minute hands-on or conceptual comparison exercise
  ○ "ms_learn_search_term": exact keyword to search on Microsoft Learn
  ○ "checkpoint_question": 1 conceptual check-in question to verify mastery
  ○ "checkpoint_answer": concise 1-2 sentence explanation of the answer
  ○ "key_takeaway": 1 high-yield exam tip`;
}

/**
 * Deterministic syllabus bank of official AZ-900 exam objectives.
 * Used when API keys are not set or when external LLM requests encounter rate limits.
 */
const AZ900_CURRICULUM_BANK: Record<string, GeneratedTask[]> = {
  'Cloud Concepts': [
    {
      day_number: 1,
      domain: 'Cloud Concepts',
      topic_title: 'Cloud Computing Models & Shared Responsibility',
      topic_subtitle: 'IaaS vs PaaS vs SaaS & Security Boundaries',
      action_item: 'Read the Microsoft Learn guide on IaaS, PaaS, SaaS, and the shared responsibility matrix.',
      sandbox_task: 'Compare Azure VM (IaaS) vs Azure App Service (PaaS) in the Azure Portal architecture diagram.',
      sandbox_steps: [
        'Open Azure Portal or Learn sandbox.',
        'Locate Virtual Machines and identify OS management requirements (IaaS).',
        'Compare with App Service where runtime is managed by Microsoft (PaaS).',
        'Remember: Customer ALWAYS owns data and identity in all cloud models.',
      ],
      ms_learn_search_term: 'AZ-900 Describe cloud concepts shared responsibility IaaS PaaS SaaS',
      checkpoint_question: 'Under the Shared Responsibility Model, which party is always responsible for protecting data and identity?',
      checkpoint_answer: 'The customer is always responsible for data and identity management regardless of whether using IaaS, PaaS, or SaaS.',
      key_takeaway: 'In SaaS, Microsoft manages physical hosts up to application; customer manages data & access.',
    },
    {
      day_number: 2,
      domain: 'Cloud Concepts',
      topic_title: 'Cloud Economics, CapEx vs. OpEx & Cloud Benefits',
      topic_subtitle: 'High Availability, Scalability, Elasticity, Agility, and Disaster Recovery',
      action_item: 'Study capital expenditure (CapEx) vs operational expenditure (OpEx) and the consumption-based pricing model.',
      sandbox_task: 'Use Azure Pricing Calculator to model cost savings between on-premise servers and pay-as-you-go VMs.',
      sandbox_steps: [
        'Navigate to azure.microsoft.com/pricing/calculator/.',
        'Add a standard B2s virtual machine and adjust hours.',
        'Observe how consumption-based pricing eliminates upfront CapEx.',
      ],
      ms_learn_search_term: 'AZ-900 Describe benefits of cloud computing CapEx OpEx elasticity',
      checkpoint_question: 'What is the key difference between scalability and elasticity in Azure?',
      checkpoint_answer: 'Scalability is the ability to add resources (scale up/out) to handle increased load; elasticity is the ability to automatically add AND remove resources dynamically as load fluctuates.',
      key_takeaway: 'Cloud computing shifts IT budgeting from CapEx (upfront hardware) to OpEx (operating expenses).',
    },
  ],
  'Azure Architecture & Services': [
    {
      day_number: 3,
      domain: 'Azure Architecture & Services',
      topic_title: 'Azure Core Infrastructure: Regions, Availability Zones & Region Pairs',
      topic_subtitle: 'Geographies, Datacenters, Fault Isolation & Data Sovereignty',
      action_item: 'Review the geographical hierarchy of Azure: Data centers → Availability Zones → Regions → Region Pairs.',
      sandbox_task: 'Inspect Azure Regions and Availability Zone options when configuring a new virtual network or VM.',
      sandbox_steps: [
        'In the Azure Portal, click Create a resource -> Virtual Machine.',
        'Check the Availability options dropdown and note Zone 1, 2, and 3 selections.',
        'Verify how availability zones provide fault-isolation within the same region with independent power and cooling.',
      ],
      ms_learn_search_term: 'AZ-900 Describe Azure architecture regions availability zones region pairs',
      checkpoint_question: 'How many separate data centers make up an Azure Availability Zone, and what guarantees their isolation?',
      checkpoint_answer: 'An Availability Zone consists of one or more physical datacenters equipped with independent power, cooling, and networking within an Azure region.',
      key_takeaway: 'Availability Zones protect against datacenter failures; Region Pairs protect against regional disasters (>300 miles apart).',
    },
    {
      day_number: 4,
      domain: 'Azure Architecture & Services',
      topic_title: 'Azure Compute: Virtual Machines, App Services, ACI & AKS',
      topic_subtitle: 'Serverless Functions, Containerization & Virtual Desktop (AVD)',
      action_item: 'Contrast Virtual Machines (IaaS), Azure App Service (PaaS), Azure Container Instances (ACI), and Azure Kubernetes Service (AKS).',
      sandbox_task: 'Deploy a quick Azure App Service or explore Azure Container Instances in Azure Cloud Shell.',
      sandbox_steps: [
        'Open Cloud Shell (Bash or PowerShell).',
        'Review the difference between running an OS image (VM) vs containerized microservices (ACI/AKS).',
        'Inspect Azure Functions for event-driven serverless code execution.',
      ],
      ms_learn_search_term: 'AZ-900 Describe Azure compute services VM App Service ACI AKS Functions',
      checkpoint_question: 'When should an organization choose Azure Functions over Azure Virtual Machines?',
      checkpoint_answer: 'Choose Azure Functions for event-driven, short-lived serverless tasks where you only pay for execution time without managing servers or runtimes.',
      key_takeaway: 'ACI is for fast single containers without orchestration; AKS is for complex multi-container orchestration.',
    },
    {
      day_number: 5,
      domain: 'Azure Architecture & Services',
      topic_title: 'Azure Networking & Storage: VNets, ExpressRoute, VPN & Blob Tiers',
      topic_subtitle: 'Public vs Private Endpoints, NSGs, Hot, Cool, Cold & Archive Storage',
      action_item: 'Learn Azure Virtual Networks (VNet), Network Security Groups (NSG), VPN Gateway vs ExpressRoute, and Azure Storage redundancy.',
      sandbox_task: 'Configure a virtual network with two subnets and explore blob storage access tiers (Hot, Cool, Cold, Archive).',
      sandbox_steps: [
        'In Portal, create a Storage Account.',
        'Navigate to Containers and create a test container.',
        'Review access tier options: Hot (frequently accessed), Cool (30 days), Cold (90 days), Archive (180 days, offline).',
      ],
      ms_learn_search_term: 'AZ-900 Describe Azure storage services Blob Files access tiers Virtual Network',
      checkpoint_question: 'Which Azure networking service provides a dedicated, private fiber connection bypassing the public Internet?',
      checkpoint_answer: 'Azure ExpressRoute provides dedicated private connections directly between on-premises infrastructure and Microsoft Azure datacenters.',
      key_takeaway: 'ExpressRoute does NOT traverse public internet; VPN Gateway uses encrypted tunnels over public internet.',
    },
  ],
  'Management & Governance': [
    {
      day_number: 6,
      domain: 'Management & Governance',
      topic_title: 'Cost Management, Azure Policy, RBAC & Resource Locks',
      topic_subtitle: 'Budgets, Tags, Governance, Compliance & Microsoft Purview',
      action_item: 'Study Azure Role-Based Access Control (RBAC), Azure Policy for compliance enforcement, and CanNotDelete vs ReadOnly resource locks.',
      sandbox_task: 'Create a sample Resource Lock (CanNotDelete) on a resource group and test delete prevention.',
      sandbox_steps: [
        'Navigate to any Resource Group in Azure Portal.',
        'Select "Locks" under Settings.',
        'Add a "CanNotDelete" lock and observe how it prevents accidental deletion even by Owners.',
        'Review RBAC roles: Owner, Contributor, Reader.',
      ],
      ms_learn_search_term: 'AZ-900 Describe Azure management and governance cost policy RBAC locks',
      checkpoint_question: 'If a resource group has a CanNotDelete lock, what is the effect on inherited child resources?',
      checkpoint_answer: 'All child resources inside the resource group inherit the CanNotDelete lock and cannot be deleted until the parent lock is removed.',
      key_takeaway: 'Azure Policy enforces rules (e.g. allowed regions); RBAC manages who has permissions to perform actions.',
    },
    {
      day_number: 7,
      domain: 'Management & Governance',
      topic_title: 'Azure Monitor, Service Health, Microsoft Defender & Entra ID',
      topic_subtitle: 'Authentication, MFA, Conditional Access & SLA Guarantees',
      action_item: 'Review Microsoft Entra ID (authentication vs authorization), MFA, Conditional Access, and Azure Service Health.',
      sandbox_task: 'Explore Azure Service Health dashboard and check Microsoft Entra ID user blade.',
      sandbox_steps: [
        'In Azure Portal search bar, type "Service Health".',
        'Inspect Service issues, Planned maintenance, and Health advisories.',
        'Navigate to Microsoft Entra ID and check Conditional Access policies overview.',
      ],
      ms_learn_search_term: 'AZ-900 Describe Azure identity security monitor service health SLA',
      checkpoint_question: 'What is the main difference between Azure Service Health and Azure Monitor?',
      checkpoint_answer: 'Azure Service Health provides status on global Microsoft Azure infrastructure health, while Azure Monitor collects metrics and logs from your specific deployed resources.',
      key_takeaway: 'Entra ID is identity & access management; Azure Monitor is telemetry for your application resources.',
    },
  ],
  'Final Review': [
    {
      day_number: 8,
      domain: 'Final Review',
      topic_title: 'Full-Length AZ-900 Timed Practice Exam & Weak-Area Mastery',
      topic_subtitle: '45-Question Simulation, SLA Formulas & Last-Mile Confidence Drills',
      action_item: 'Complete an official 45-question timed practice test covering all 3 domains, focusing on composite SLA calculations and governance.',
      sandbox_task: 'Review composite SLA calculation: If Web App has 99.95% SLA and SQL DB has 99.99% SLA, composite is 99.95% * 99.99% = 99.94%.',
      sandbox_steps: [
        'Take the Microsoft Learn official practice assessment for AZ-900.',
        'Flag questions where confidence is below 100%.',
        'Review the official AZ-900 Exam Study Guide changes and score 85%+.',
      ],
      ms_learn_search_term: 'AZ-900 Microsoft Azure Fundamentals official practice assessment exam',
      checkpoint_question: 'To pass the AZ-900 Microsoft Azure Fundamentals exam, what is the minimum required passing score?',
      checkpoint_answer: 'A minimum scaled score of 700 out of 1000 is required to pass the AZ-900 exam.',
      key_takeaway: 'Read every question carefully; there is no penalty for guessing, so answer all questions!',
    },
  ],
};

/**
 * Deterministically constructs a plan tailored to the user's specific days and confidence levels.
 */
function generateDeterministicPlan(options: GeneratePlanOptions): GeneratedTask[] {
  const { daysRemaining, confidenceScores } = options;
  const days = Math.min(Math.max(daysRemaining, 3), 30);

  // Pool of candidate topics
  const conceptsPool = [...AZ900_CURRICULUM_BANK['Cloud Concepts']];
  const archPool = [...AZ900_CURRICULUM_BANK['Azure Architecture & Services']];
  const mgmtPool = [...AZ900_CURRICULUM_BANK['Management & Governance']];
  const reviewTask = AZ900_CURRICULUM_BANK['Final Review'][0];

  // Additional topics for longer plans (> 7 days)
  const extendedArchTopics: GeneratedTask[] = [
    {
      day_number: 0,
      domain: 'Azure Architecture & Services',
      topic_title: 'Azure Virtual Desktop (AVD) & Azure Virtual Networks Peering',
      topic_subtitle: 'VNet Peering, Gateway Transit & Remote Workspaces',
      action_item: 'Understand VNet peering benefits (traffic stays on Microsoft private backbone) and Azure Virtual Desktop use cases.',
      sandbox_task: 'In Portal, examine Virtual Network Peering settings and non-overlapping IP address spaces.',
      ms_learn_search_term: 'AZ-900 Describe Azure virtual desktop VNet peering',
      checkpoint_question: 'Does traffic between peered virtual networks traverse the public internet?',
      checkpoint_answer: 'No, virtual network peering traffic routes directly across Microsoft private global backbone network.',
      key_takeaway: 'VNet peering links networks seamlessly without gateways or public IP exposure.',
    },
    {
      day_number: 0,
      domain: 'Azure Architecture & Services',
      topic_title: 'Azure Database Services: Azure SQL vs Cosmos DB vs Synapse',
      topic_subtitle: 'Relational vs NoSQL, High Availability & Global Distribution',
      action_item: 'Compare Azure SQL Database, Azure Database for PostgreSQL/MySQL, Azure Cosmos DB, and Azure Synapse Analytics.',
      sandbox_task: 'Review Cosmos DB multi-master write replication models and 99.999% SLA tier.',
      ms_learn_search_term: 'AZ-900 Describe Azure database services Cosmos SQL Synapse',
      checkpoint_question: 'Which Azure database service is designed for globally distributed, multi-model NoSQL workloads with single-digit millisecond latency?',
      checkpoint_answer: 'Azure Cosmos DB is Microsoft globally distributed, multi-model NoSQL database service.',
      key_takeaway: 'Cosmos DB is NoSQL with turnkey global distribution; Azure SQL is fully managed relational PaaS.',
    },
    {
      day_number: 0,
      domain: 'Azure Architecture & Services',
      topic_title: 'Azure Storage Redundancy: LRS, ZRS, GRS & GZRS',
      topic_subtitle: 'Locally Redundant vs Zone-Redundant vs Geo-Redundant Storage',
      action_item: 'Memorize the replication copies and disaster recovery protection for LRS (3 copies in 1 datacenter), ZRS (3 zones), GRS (secondary region).',
      sandbox_task: 'In Storage Account creation blade, toggle between LRS and GRS to see failover replication settings.',
      ms_learn_search_term: 'AZ-900 Describe Azure storage redundancy LRS ZRS GRS',
      checkpoint_question: 'How many data copies does Locally Redundant Storage (LRS) maintain within a single primary datacenter?',
      checkpoint_answer: 'LRS replicates your data three times within a single physical datacenter in the primary region.',
      key_takeaway: 'LRS = 3 copies in 1 DC; ZRS = 3 zones in primary region; GRS = 3 copies primary + 3 copies secondary region.',
    },
  ];

  const extendedMgmtTopics: GeneratedTask[] = [
    {
      day_number: 0,
      domain: 'Management & Governance',
      topic_title: 'Azure Management Tools: Portal, CLI, PowerShell, Cloud Shell & ARM/Bicep',
      topic_subtitle: 'Infrastructure as Code (IaC) & Automation Tools',
      action_item: 'Compare Azure Portal, Azure CLI (cross-platform), Azure PowerShell (cmdlets), and declarative ARM templates / Bicep.',
      sandbox_task: 'Open Azure Cloud Shell in browser and run "az --version" or "Get-AzResource".',
      ms_learn_search_term: 'AZ-900 Describe Azure management tools portal CLI PowerShell Cloud Shell ARM Bicep',
      checkpoint_question: 'Which tool allows running both Azure CLI and Azure PowerShell directly inside a web browser without local installation?',
      checkpoint_answer: 'Azure Cloud Shell is an interactive, authenticated, browser-accessible terminal for managing Azure resources.',
      key_takeaway: 'ARM templates and Bicep use declarative syntax; CLI and PowerShell are imperative scripting tools.',
    },
    {
      day_number: 0,
      domain: 'Management & Governance',
      topic_title: 'Defense in Depth & Zero Trust Security Methodology',
      topic_subtitle: 'Physical Security, Identity, Perimeter, Compute & Data Layers',
      action_item: 'Study the 7 layers of Defense in Depth and the 3 core principles of Zero Trust (Verify explicitly, Least privilege, Assume breach).',
      sandbox_task: 'Review the Azure Security Center / Microsoft Defender for Cloud security score dashboard.',
      ms_learn_search_term: 'AZ-900 Describe security defense in depth zero trust principles',
      checkpoint_question: 'What are the three core principles of the Microsoft Zero Trust security model?',
      checkpoint_answer: '1) Verify explicitly, 2) Use least privileged access, and 3) Assume breach.',
      key_takeaway: 'Defense in depth uses concentric layers of security so breach of one layer does not compromise data.',
    },
  ];

  // Distribute days according to AZ-900 weights and user confidence
  // Reserve 1 or 2 days for review
  const reviewDaysCount = days >= 6 ? 2 : 1;
  const learningDays = days - reviewDaysCount;

  // Domain weighting base: Architecture (40%), Governance (32%), Concepts (28%)
  // Modulate based on confidence: lower confidence gets more days
  let confArchWeight = 40 + (5 - confidenceScores.architecture_services) * 5;
  let confMgmtWeight = 32 + (5 - confidenceScores.management_governance) * 4;
  let confConceptsWeight = 28 + (5 - confidenceScores.cloud_concepts) * 3;
  const totalWeight = confArchWeight + confMgmtWeight + confConceptsWeight;

  let archDaysCount = Math.max(1, Math.round((confArchWeight / totalWeight) * learningDays));
  let mgmtDaysCount = Math.max(1, Math.round((confMgmtWeight / totalWeight) * learningDays));
  let conceptsDaysCount = Math.max(1, learningDays - archDaysCount - mgmtDaysCount);

  // Combine topics
  const fullArchPool = [...archPool, ...extendedArchTopics];
  const fullMgmtPool = [...mgmtPool, ...extendedMgmtTopics];

  const selectedTasks: GeneratedTask[] = [];

  // 1. Cloud Concepts Days
  for (let i = 0; i < conceptsDaysCount; i++) {
    const template = conceptsPool[i % conceptsPool.length];
    selectedTasks.push({ ...template, day_number: selectedTasks.length + 1 });
  }

  // 2. Azure Architecture & Services Days (Prioritized)
  for (let i = 0; i < archDaysCount; i++) {
    const template = fullArchPool[i % fullArchPool.length];
    selectedTasks.push({ ...template, day_number: selectedTasks.length + 1 });
  }

  // 3. Azure Management & Governance Days
  for (let i = 0; i < mgmtDaysCount; i++) {
    const template = fullMgmtPool[i % fullMgmtPool.length];
    selectedTasks.push({ ...template, day_number: selectedTasks.length + 1 });
  }

  // 4. Final Review & Readiness Days (Final 1 or 2 days)
  if (reviewDaysCount === 2) {
    selectedTasks.push({
      day_number: selectedTasks.length + 1,
      domain: 'Final Review',
      topic_title: 'AZ-900 Weak-Area Rapid Drill & SLA Composite Formulas',
      topic_subtitle: 'Deep-dive review of lowest-confidence topics before exam simulation',
      action_item: `Targeted review of domains scored lowest in confidence (${
        confidenceScores.architecture_services <= confidenceScores.management_governance
          ? 'Azure Architecture & Services'
          : 'Management & Governance'
      }).`,
      sandbox_task: 'Review composite SLA scenarios (Multi-tier architectures) and calculate downtime tolerances.',
      sandbox_steps: [
        'Practice calculating composite availability: 99.9% * 99.95% = 99.85%.',
        'Review Service Credits policy when SLA is breached.',
        'Review Public Preview vs General Availability (GA) support rules.',
      ],
      ms_learn_search_term: 'AZ-900 SLA composite service credits preview features general availability',
      checkpoint_question: 'Are Azure features in "Public Preview" covered by standard Service Level Agreements (SLAs)?',
      checkpoint_answer: 'No, features in preview are excluded from SLAs and should not be used for production workloads.',
      key_takeaway: 'Never run production workloads on Azure Preview features as they lack SLA guarantees.',
    });
  }

  selectedTasks.push({
    ...reviewTask,
    day_number: selectedTasks.length + 1,
  });

  // Re-index days 1..days
  return selectedTasks.slice(0, days).map((t, idx) => ({
    ...t,
    day_number: idx + 1,
  }));
}

/**
 * Primary AI Study Plan Generator with Multi-Provider Fallback.
 * Attempts Google Gemini -> OpenAI -> Deterministic AZ-900 Curriculum Engine.
 */
export async function generateStudyPlanWithAI(options: GeneratePlanOptions): Promise<GeneratedPlanOutput> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const prompt = buildSystemPrompt(options);

  // 1. Try Google Gemini SDK if key provided
  if (geminiApiKey) {
    const candidateModels = ['gemini-3-flash-preview', 'gemini-3.8-flash', 'gemini-3.5-flash'];
    for (const modelName of candidateModels) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const responseText = response.text || '';
        let cleanText = responseText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        let parsed: any = null;
        try {
          parsed = JSON.parse(cleanText);
        } catch {
          const s = cleanText.indexOf('{');
          const e = cleanText.lastIndexOf('}');
          if (s !== -1 && e > s) {
            parsed = JSON.parse(cleanText.substring(s, e + 1));
          }
        }

        if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          return {
            tasks: parsed.tasks,
            source: 'gemini',
          };
        }
      } catch (err) {
        console.warn(`Google Gemini (${modelName}) issue, trying next:`, err);
      }
    }
  }

  // 2. Try OpenAI SDK if key provided
  if (openaiApiKey) {
    try {
      const openai = new OpenAI({ apiKey: openaiApiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{"tasks": []}');
      if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        return {
          tasks: parsed.tasks,
          source: 'openai',
        };
      }
    } catch (err) {
      console.warn('OpenAI generation encountered an issue, attempting fallback:', err);
    }
  }

  // 3. Fallback: Expert Curriculum Engine (100% resilient & zero downtime)
  const fallbackTasks = generateDeterministicPlan(options);
  return {
    tasks: fallbackTasks,
    source: 'expert-curriculum-engine',
  };
}
