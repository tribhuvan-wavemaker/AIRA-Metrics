export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface LLMRequest {
  type: string;
  toolId?: string;
  content: string;
}

export interface LLMResponse {
  type: string;
  content: string;
  toolId?: string;
  toolName?: string;
  toolInputs?: Record<string, any>;
}

export interface Interaction {
  agentId: string;
  sessionId: string;
  requestId: string;
  exchangeId: string;
  llmRequest: LLMRequest;
  llmResponse: LLMResponse[];
  timestamp: number;
  model: string;
  provider: string;
  exchangeType: string;
  tokenUsage: TokenUsage;
}

export interface ProjectData {
  username: string;
  project_id: string;
  project_name: string;
  project_type: string;
  interaction: Interaction[];
}

export interface SessionGroup {
  sessionId: string;
  interactions: Interaction[];
  totalTokens: number;
  duration: number;
  startTime: number;
  endTime: number;
  username: string;
  projectName: string;
  agentId: string;
  interactionCount?: number;
}

export interface ApiSession {
  first_interaction: string;
  interaction_count: number;
  last_interaction: string;
  project_id: string;
  project_name: string;
  session_id: string;
  user_name: string;
}

export interface SessionsApiResponse {
  count: number;
  data: ApiSession[];
}

export interface FilterOptions {
  users: string[];
  project: string;
  dateRange: 'day' | 'week' | 'month' | 'quarter' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy: 'timestamp' | 'tokens' | 'duration' | 'interactions';
  sortOrder: 'asc' | 'desc';
}
export interface SessionDetailInteraction {
  exchange_id: string;
  interaction_id: number;
  llm_request_id: number;
  llm_response_id: number;
  project_id: string;
  request_content: string;
  request_id: string;
  request_tool_id: string;
  request_type: string;
  response_content: string;
  response_tool_id: string;
  response_tool_inputs: any;
  response_tool_name: string;
  response_type: string;
  session_id: string;
  timestamp: number;
  user_name: string;
}