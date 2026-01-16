export interface RFDRequest {
  service: string;
  query: string;
  maxResults?: number;
}

export interface RFDResult {
  text: string;
  score: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface RFDResponse {
  data: RFDResult[];
  sources: string[];
  confidence: number;
  processingTime: number;
}

export interface ReppoService {
  broadcastRFD(request: RFDRequest): Promise<RFDResponse>;
}
