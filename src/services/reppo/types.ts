export interface RFDRequest {
  service: string;
  query: string;
  maxResults?: number;
}

export interface RFDResultSource {
  subnet: string;
  document: string;
  uri: string;
}

export interface RFDResult {
  text: string;
  score: number;
  source: RFDResultSource;
  metadata?: Record<string, unknown>;
}

export interface SubnetResponse {
  subnet: string;
  results: RFDResult[];
  responseTime: number;
}

export interface RFDResponse {
  data: RFDResult[];
  subnetResponses: SubnetResponse[];
  confidence: number;
  processingTime: number;
}

export interface ReppoService {
  broadcastRFD(request: RFDRequest): Promise<RFDResponse>;
}
