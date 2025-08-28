export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  sessionId: string;
  timestamp: number;
  type: 'user_message' | 'assistant_response' | 'tool_call' | 'tool_result';
  content: string;
  tokens?: number;
  metadata?: Record<string, any>;
}

export interface SessionGroup {
  sessionId: string;
  username: string;
  projectName: string;
  startTime: number;
  endTime: number;
  duration: number;
  totalTokens: number;
  interactionCount: number;
  lastActivity: number;
}

export interface FilterOptions {
  username?: string;
  projectName?: string;
  startDate?: string;
  endDate?: string;
  minTokens?: number;
  maxTokens?: number;
  minDuration?: number;
  maxDuration?: number;
}

export interface SessionDetailInteraction {
  exchange_id: string;
  request_id: string;
  session_id: string;
  user_name: string;
  project_name: string;
  agent_id: string;
  timestamp: number;
  request_type: string;
  request_content: string;
  request_tool_id?: string;
  response_type: string | string[];
  response_content: string | string[];
  response_tool_id?: string | string[];
  response_tool_name?: string | string[];
  response_tool_inputs?: string | string[];
  total_tokens?: number;
  input_tokens?: number;
  output_tokens?: number;
}