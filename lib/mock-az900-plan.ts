import { DayPlan, UserPreferences } from '@/types/study-plan';

export const DOMAIN_METADATA = {
  'cloud-concepts': {
    name: 'Cloud Concepts',
    weight: '25–30%',
    weightNum: 0.275,
    badgeClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    indicatorColor: 'bg-sky-500',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/20',
    icon: 'Cloud',
  },
  'architecture-services': {
    name: 'Architecture & Services',
    weight: '35–40%',
    weightNum: 0.375,
    badgeClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    indicatorColor: 'bg-amber-500',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20',
    icon: 'Server',
    isHighPriority: true,
  },
  'management-governance': {
    name: 'Management & Governance',
    weight: '30–35%',
    weightNum: 0.325,
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    indicatorColor: 'bg-emerald-500',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20',
    icon: 'ShieldCheck',
  },
  'final-review': {
    name: 'Final Review',
    weight: 'Review',
    weightNum: 0.025,
    badgeClass: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    indicatorColor: 'bg-purple-500',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20',
    icon: 'Award',
  },
} as const;

export function formatDayDate(baseDate: Date, dayOffset: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function getDefaultExamDate(): string {
  const target = new Date();
  target.setDate(target.getDate() + 7);
  return target.toISOString().split('T')[0];
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  examDate: getDefaultExamDate(),
  dailyCapacityMins: 30,
  weekendMultiplier: true,
  confidenceLevels: {
    cloudConcepts: 2,
    architectureServices: 1,
    managementGovernance: 2,
  },
  hasCompletedOnboarding: false,
};

export const RAW_7_DAYS_TEMPLATE = [
  {
    dayNumber: 1,
    domain: 'cloud-concepts' as const,
    domainWeight: '25–30%',
    topicTitle: 'Shared Responsibility Model, Cloud Models & CapEx vs. OpEx',
    topicSubtitle: 'Understand why cloud computing transforms operational efficiency and security boundaries.',
    estimatedMinutes: 30,
    learningBlock: {
      title: 'Foundation of Cloud Economics & Security Roles',
      durationMins: 30,
      objective: 'Master who is responsible for what in IaaS, PaaS, and SaaS, plus how OpEx eliminates upfront capital expenses.',
      msLearnSearchTerm: 'AZ-900 Describe cloud concepts shared responsibility IaaS PaaS SaaS CapEx OpEx',
      sandboxExercise: {
        title: 'Responsibility Matrix Mapping Exercise',
        description: 'Map out 4 real-world workloads into IaaS, PaaS, or SaaS, identifying whether the customer or Microsoft manages OS patching.',
        steps: [
          'Review an Azure VM hosting SQL Server (IaaS: Customer manages OS & DB patching).',
          'Review Azure SQL Database (PaaS: Microsoft manages OS and database engine maintenance).',
          'Review Microsoft 365 / Entra ID (SaaS: Pure software consumption by customer).',
          'Memorize the rule: In ALL cloud service models, the customer ALWAYS retains responsibility for their Data & Identities!',
        ],
      },
      activeRecall: {
        question: 'Under the Azure Shared Responsibility Model, which tier leaves the customer responsible for patching the guest operating system?',
        explanation: 'Infrastructure as a Service (IaaS). In IaaS (like Azure Virtual Machines), Microsoft manages physical data centers, networking, and virtualization hosts, while you retain responsibility for OS installation, patching, runtime, and applications.',
        keyTakeaway: 'Always remember: Data, identities, and device access are 100% customer responsibility in ALL models (IaaS, PaaS, SaaS).',
      },
    },
  },
  {
    dayNumber: 2,
    domain: 'architecture-services' as const,
    domainWeight: '35–40%',
    topicTitle: 'Azure Regions, Availability Zones, Region Pairs & Resource Groups',
    topicSubtitle: 'Master physical datacenter redundancy, geo-resiliency, and resource lifecycle boundaries.',
    estimatedMinutes: 30,
    learningBlock: {
      title: 'Geographic Infrastructure & Resiliency Architecture',
      durationMins: 30,
      objective: 'Differentiate between Regions, Availability Zones (physically separate datacenters with independent power/cooling), and Region Pairs.',
      msLearnSearchTerm: 'AZ-900 Describe Azure regions availability zones region pairs resource groups',
      sandboxExercise: {
        title: 'High Availability Boundary Visualizer',
        description: 'Analyze an architecture diagram requiring 99.99% uptime and examine how resource groups organize lifecycle dependencies.',
        steps: [
          'Check that an Availability Zone consists of one or more physical datacenters with independent power, cooling, and networking.',
          'Identify that a minimum of 3 separate Availability Zones exist in all enabled regions.',
          'Note that Region Pairs reside at least 300 miles apart to protect against regional disasters (e.g., East US & West US).',
          'Verify that a Resource can only belong to one Resource Group at a time, but can interact with resources in other groups.',
        ],
      },
      activeRecall: {
        question: 'What is the minimum number of independent Availability Zones present within an Azure region that supports Availability Zones?',
        explanation: 'At least three (3) distinct Availability Zones. Each zone is comprised of one or more datacenters equipped with independent power, cooling, and networking infrastructure to protect against datacenter failures.',
        keyTakeaway: 'Availability Zones protect against datacenter failures; Region Pairs protect against regional geographic catastrophes.',
      },
    },
  },
  {
    dayNumber: 3,
    domain: 'architecture-services' as const,
    domainWeight: '35–40%',
    topicTitle: 'Azure Compute: Virtual Machines, App Services, Functions & Containers',
    topicSubtitle: 'The highest-weight exam section: choose the right compute model from bare VMs to serverless.',
    estimatedMinutes: 35,
    learningBlock: {
      title: 'Core Azure Compute Services Decision Matrix',
      durationMins: 35,
      objective: 'Evaluate trade-offs between Azure VMs (IaaS), VM Scale Sets (auto-scaling), App Services (PaaS web apps), Azure Functions (Event-driven serverless), and ACI vs. AKS.',
      msLearnSearchTerm: 'AZ-900 Describe Azure compute services VMs App Service Functions ACI AKS',
      sandboxExercise: {
        title: 'Azure Compute Selection Walkthrough',
        description: 'Choose the optimal compute option for three common enterprise scenarios tested on the AZ-900 exam.',
        steps: [
          'Scenario A: Legacy Windows app requiring specific OS kernel extensions -> Azure Virtual Machine.',
          'Scenario B: Web API with automated traffic scaling and zero OS maintenance -> Azure App Service.',
          'Scenario C: Event-triggered code that executes in milliseconds without running continuously -> Azure Functions (Serverless).',
          'Scenario D: Microservices requiring container orchestration with Kubernetes -> Azure Kubernetes Service (AKS).',
        ],
      },
      activeRecall: {
        question: 'A company wants to run serverless code in response to timer events or HTTP triggers without managing servers or paying when code is idle. Which Azure service is the best fit?',
        explanation: 'Azure Functions. Azure Functions provides an event-driven, serverless compute experience where you only pay for compute resources during execution time (consumption plan) without managing any underlying infrastructure.',
        keyTakeaway: 'Azure App Service = PaaS web hosting; Azure Functions = Serverless event code; ACI = Fast single containers; AKS = Enterprise container orchestration.',
      },
    },
  },
  {
    dayNumber: 4,
    domain: 'architecture-services' as const,
    domainWeight: '35–40%',
    topicTitle: 'Azure Networking: VNets, Subnets, NSGs, VPN Gateway & ExpressRoute',
    topicSubtitle: 'Secure enterprise isolation, public vs. private endpoints, and dedicated hybrid connectivity.',
    estimatedMinutes: 30,
    learningBlock: {
      title: 'Network Topologies & Boundary Security',
      durationMins: 30,
      objective: 'Understand Virtual Networks (VNets), Network Security Groups (NSGs as stateful packet filters), and ExpressRoute (private fiber connection avoiding the public internet).',
      msLearnSearchTerm: 'AZ-900 Describe Azure networking Virtual Network NSG VPN Gateway ExpressRoute',
      sandboxExercise: {
        title: 'Network Security Group (NSG) Rule Simulator',
        description: 'Trace inbound and outbound packet filtering flow through subnet and NIC-level NSG rules.',
        steps: [
          'Identify that a Virtual Network (VNet) provides isolated private IP communication for Azure resources.',
          'Review how Subnets partition a VNet into logical segments (e.g., Web Subnet, Database Subnet).',
          'Inspect an NSG rule: Lower numerical priority (e.g., 100) takes precedence over higher numerical values (e.g., 500).',
          'Compare VPN Gateway (encrypted over public Internet) vs. ExpressRoute (private direct leased line, highest reliability & speed).',
        ],
      },
      activeRecall: {
        question: 'Which Azure connectivity option provides a dedicated, private, high-speed connection between on-premises datacenters and Azure that does NOT travel over the public internet?',
        explanation: 'Azure ExpressRoute. ExpressRoute creates private fiber connections through a connectivity provider directly to Azure datacenters, providing lower latency, higher security, and bypassing the public internet completely.',
        keyTakeaway: 'VPN Gateway travels over the public internet with encryption; ExpressRoute travels over dedicated private circuits.',
      },
    },
  },
  {
    dayNumber: 5,
    domain: 'architecture-services' as const,
    domainWeight: '35–40%',
    topicTitle: 'Azure Storage Tiers, Redundancy (LRS, ZRS, GRS) & Managed Databases',
    topicSubtitle: 'Hot/Cool/Cold/Archive lifecycle, geo-replication levels, and relational vs. NoSQL choices.',
    estimatedMinutes: 30,
    learningBlock: {
      title: 'Storage Optimization & Resiliency Patterns',
      durationMins: 30,
      objective: 'Select appropriate access tiers (Hot, Cool, Cold, Archive) and redundancy strategies (LRS: 3 copies in 1 DC, ZRS: 3 copies across 3 AZs, GRS: secondary region replication).',
      msLearnSearchTerm: 'AZ-900 Describe Azure storage services Blob tiers LRS ZRS GRS Cosmos DB',
      sandboxExercise: {
        title: 'Storage Cost & Disaster Recovery Calculator',
        description: 'Examine access tier trade-offs and compare Cosmos DB multi-master vs. Azure SQL relational workloads.',
        steps: [
          'Hot Tier: Highest storage cost, lowest access cost (frequently accessed data).',
          'Cool / Cold Tier: Lower storage cost, higher access fee (infrequently accessed for 30–90 days).',
          'Archive Tier: Lowest storage cost, highest access cost, takes hours to rehydrate (offline long-term compliance storage).',
          'Cosmos DB: Globally distributed, multi-model NoSQL database with single-digit millisecond response times.',
        ],
      },
      activeRecall: {
        question: 'Which Azure storage redundancy option provides replication across three availability zones within the primary region, protecting against a datacenter outage without requiring secondary region replication?',
        explanation: 'Zone-Redundant Storage (ZRS). ZRS copies your data synchronously across three Azure availability zones in the primary region. Locally Redundant Storage (LRS) only replicates inside a single datacenter.',
        keyTakeaway: 'LRS = 1 datacenter (3 copies); ZRS = 3 zones in 1 region; GRS = 2 separate regions (6 copies total).',
      },
    },
  },
  {
    dayNumber: 6,
    domain: 'management-governance' as const,
    domainWeight: '30–35%',
    topicTitle: 'Microsoft Entra ID, Zero Trust, RBAC, Azure Policy & Resource Locks',
    topicSubtitle: 'Identity as the primary security perimeter, granular role assignments, and organizational governance.',
    estimatedMinutes: 30,
    learningBlock: {
      title: 'Identity Perimeter & Enterprise Governance Guards',
      durationMins: 30,
      objective: 'Differentiate Entra ID from Windows Server Active Directory, implement Zero Trust principles, apply Role-Based Access Control (RBAC), and prevent accidental deletion using Resource Locks.',
      msLearnSearchTerm: 'AZ-900 Describe Azure identity governance Microsoft Entra ID RBAC Azure Policy Resource Locks',
      sandboxExercise: {
        title: 'Governance & Lock Conflict Resolution',
        description: 'Analyze how Azure Policy enforces rules and how ReadOnly vs. CannotDelete locks behave.',
        steps: [
          'Review the Zero Trust pillars: Explicitly verify, use least privileged access, and assume breach.',
          'Understand RBAC: Assign roles (Owner, Contributor, Reader) to Security Principals at specific scopes (MG -> Sub -> RG -> Resource).',
          'Contrast Azure Policy (evaluates compliance and prevents non-compliant deployments) vs. RBAC (controls who can perform actions).',
          'Resource Locks: `CanNotDelete` allows reading and modifying but blocks deletion; `ReadOnly` blocks modification and deletion.',
        ],
      },
      activeRecall: {
        question: 'An administrator needs to prevent a mission-critical Azure database from being accidentally deleted by anyone, including Owners, while still allowing developers to update tables. Which tool should they apply?',
        explanation: 'A CanNotDelete (Delete) Resource Lock. Resource locks apply to all users and administrators regardless of their RBAC permissions. A CanNotDelete lock allows authorized users to read and modify resources, but prevents anyone from deleting them.',
        keyTakeaway: 'Resource Locks override RBAC permissions. CanNotDelete allows modifications; ReadOnly restricts all changes.',
      },
    },
  },
  {
    dayNumber: 7,
    domain: 'final-review' as const,
    domainWeight: 'Exams & SLA',
    topicTitle: 'Azure Cost Management, Pricing & TCO Calculators, SLAs & Practice Readiness',
    topicSubtitle: 'Total Cost of Ownership, budgets, alerts, Service Level Agreements, and full mock exam recap.',
    estimatedMinutes: 35,
    learningBlock: {
      title: 'Cost Management Tools, SLAs & Final Exam Polish',
      durationMins: 35,
      objective: 'Calculate cost savings using the TCO Calculator vs. Pricing Calculator, understand Composite SLAs, and complete active recall checks for all exam domains.',
      msLearnSearchTerm: 'AZ-900 Describe Azure cost management pricing calculator TCO SLAs practice exam',
      sandboxExercise: {
        title: 'Full Practice Exam Readiness Drill',
        description: 'Review SLA calculation rules and verify final readiness score across all three core exam domains.',
        steps: [
          'Pricing Calculator: Estimates costs for provisioning new Azure services and architectures.',
          'TCO Calculator: Compares costs of running an on-premises physical datacenter vs. migrating to Azure.',
          'Composite SLA formula: When two services with 99.9% SLA are chained in series, composite SLA is 99.9% * 99.9% = 99.8% (always lower than the individual components).',
          'Complete final practice questions with 85%+ target score before booking your exam slot.',
        ],
      },
      activeRecall: {
        question: 'An enterprise wants to compare the ongoing operational and hardware expenditure of their current on-premises datacenter against migrating those workloads to Azure. Which calculator tool is specifically built for this?',
        explanation: 'The Total Cost of Ownership (TCO) Calculator. The TCO calculator is used to analyze current physical datacenter costs (servers, storage, networking, electricity, real estate, and IT staff) and contrast them with savings realized from Azure migration.',
        keyTakeaway: 'TCO Calculator = On-prem vs. Azure migration comparison. Azure Pricing Calculator = Estimating future Azure service consumption bills.',
      },
    },
  },
];

export function generateInitialMockPlan(startDate?: Date): DayPlan[] {
  const base = startDate || new Date();
  return RAW_7_DAYS_TEMPLATE.map((template, idx) => ({
    id: `day-${template.dayNumber}`,
    dayNumber: template.dayNumber,
    scheduledDate: formatDayDate(base, idx),
    domain: template.domain,
    domainWeight: template.domainWeight,
    topicTitle: template.topicTitle,
    topicSubtitle: template.topicSubtitle,
    estimatedMinutes: template.estimatedMinutes,
    status: idx === 0 ? ('up-next' as const) : ('pending' as const),
    learningBlock: template.learningBlock,
    userAnswer: '',
    isAnswerRevealed: false,
  }));
}

/**
 * Creates the "Instant Judge Demo Plan"
 * - Day 1 & Day 2 already completed (progress bars immediately show action)
 * - Day 3 marked as 'up-next'
 * - Days 4-7 marked as 'pending'
 */
export function generateJudgeDemoPlan(startDate?: Date): DayPlan[] {
  const base = startDate || new Date();
  return RAW_7_DAYS_TEMPLATE.map((template, idx) => {
    let status: DayPlan['status'] = 'pending';
    let isAnswerRevealed = false;
    let userAnswer = '';
    let completedAt: string | undefined = undefined;

    if (idx === 0) {
      status = 'completed';
      isAnswerRevealed = true;
      userAnswer = 'In IaaS the customer patches OS. In PaaS and SaaS the vendor patches OS!';
      completedAt = new Date(Date.now() - 86400000 * 2).toISOString();
    } else if (idx === 1) {
      status = 'completed';
      isAnswerRevealed = true;
      userAnswer = 'At least 3 physical availability zones per supported region.';
      completedAt = new Date(Date.now() - 86400000 * 1).toISOString();
    } else if (idx === 2) {
      status = 'up-next';
    }

    return {
      id: `day-${template.dayNumber}`,
      dayNumber: template.dayNumber,
      scheduledDate: formatDayDate(base, idx),
      domain: template.domain,
      domainWeight: template.domainWeight,
      topicTitle: template.topicTitle,
      topicSubtitle: template.topicSubtitle,
      estimatedMinutes: template.estimatedMinutes,
      status,
      learningBlock: template.learningBlock,
      userAnswer,
      isAnswerRevealed,
      completedAt,
    };
  });
}
