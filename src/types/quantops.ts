// QuantOps Types - GreenBack Trading Automation

export type ApplyResult = 'pending' | 'success' | 'failed' | 'rolled_back';

export type DeployEnvironment = 'demo' | 'paper' | 'canary' | 'live';

export interface QuantOpsPersona {
  id: string;
  siteId: string;
  name: string;
  codename: string;
  role: string;
  description?: string;
  avatarUrl?: string;
  systemPrompt?: string;
  capabilities: string[];
  githubConfig: GitHubConfig;
  lovableConfig: LovableConfig;
  kpiThresholds: Record<string, KPIThreshold>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  defaultBranch: string;
  featureBranchPrefix: string;
  requireSignedCommits: boolean;
  prTemplate?: string;
}

export interface LovableConfig {
  projectId: string;
  projectUrl: string;
  autoDeployDemo: boolean;
  autoDeployPaper: boolean;
  requireApprovalForCanary: boolean;
  requireApprovalForLive: boolean;
}

export interface KPIThreshold {
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  direction: 'above' | 'below';
  autoRollback: boolean;
  notificationChannels: string[];
}

export interface RecommendationCard {
  id: string;
  personaId: string;
  siteId: string;
  cardType: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impactScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'pending' | 'applying' | 'applied' | 'failed' | 'rolled_back' | 'dismissed';
  triggerMetrics: TriggerMetrics;
  proposedChanges: ProposedChange[];
  codePatches: CodePatch[];
  testRequirements: TestRequirement[];
  rollbackPlan: RollbackPlan;
  estimatedImprovement: EstimatedImprovement;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerMetrics {
  rejectRate?: number;
  fillLatencyMs?: number;
  balanceDrift?: number;
  netProfitMin?: number;
  errorCount?: number;
  [key: string]: number | undefined;
}

export interface ProposedChange {
  id: string;
  type: 'code' | 'config' | 'strategy' | 'threshold';
  filePath: string;
  description: string;
  before?: string;
  after?: string;
}

export interface CodePatch {
  id: string;
  filePath: string;
  hunks: PatchHunk[];
  language: string;
}

export interface PatchHunk {
  startLine: number;
  endLine: number;
  content: string;
  type: 'add' | 'remove' | 'modify';
}

export interface TestRequirement {
  id: string;
  type: 'unit' | 'integration' | 'paper_trade' | 'security';
  description: string;
  command: string;
  expectedOutcome: string;
  required: boolean;
}

export interface RollbackPlan {
  strategy: 'revert_commit' | 'feature_flag' | 'manual';
  revertCommitSha?: string;
  featureFlagKey?: string;
  manualSteps?: string[];
  estimatedTime: string;
}

export interface EstimatedImprovement {
  rejectRateReduction?: number;
  latencyReduction?: number;
  profitIncrease?: number;
  riskReduction?: number;
  description: string;
}

export interface ApplyEvent {
  id: string;
  cardId: string;
  personaId: string;
  siteId: string;
  actorUserId?: string;
  actorRole: string;
  commitSha?: string;
  prUrl?: string;
  prNumber?: number;
  buildId?: string;
  environment: DeployEnvironment;
  result: ApplyResult;
  rollbackRef?: string;
  testsPassed?: boolean;
  metricsSnapshot: MetricsSnapshot;
  errorSummary?: string;
  breachedThresholds: BreachedThreshold[];
  durationMs?: number;
  createdAt: string;
}

export interface MetricsSnapshot {
  rejectRate: number;
  fillLatencyMs: number;
  balanceDrift: number;
  netProfitMin: number;
  timestamp: string;
  [key: string]: number | string;
}

export interface BreachedThreshold {
  metric: string;
  value: number;
  threshold: number;
  direction: 'above' | 'below';
  severity: 'warning' | 'critical';
}

// Dashboard view types
export interface TimelineEvent {
  id: string;
  type: 'applied' | 'failed' | 'rolled_back';
  cardId: string;
  cardTitle: string;
  commitSha?: string;
  prUrl?: string;
  buildId?: string;
  environment: DeployEnvironment;
  metrics?: MetricsSnapshot;
  errorSummary?: string;
  timestamp: string;
}

export interface QuantOpsDashboardData {
  persona: QuantOpsPersona;
  pendingCards: RecommendationCard[];
  recentEvents: TimelineEvent[];
  currentMetrics: MetricsSnapshot;
  kpiStatus: KPIStatus[];
}

export interface KPIStatus {
  metric: string;
  currentValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
}
