export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  phone?: string;
  category?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RFP {
  id: string;
  title: string;
  rawInput: string;
  status: 'DRAFT' | 'SENT' | 'EVALUATING' | 'AWARDED' | 'CLOSED';
  items: RFPItem[];
  budget: Budget;
  timeline: Timeline;
  terms: Terms;
  requirements: string[];
  createdAt: string;
  updatedAt: string;
  vendors?: RFPVendor[];
  proposals?: Proposal[];
  _count?: {
    proposals: number;
    vendors: number;
  };
}

export interface RFPItem {
  name: string;
  quantity: number;
  specifications: Record<string, any>;
}

export interface Budget {
  amount: number;
  currency: string;
}

export interface Timeline {
  deliveryDeadline: string;
  responseDeadline: string;
}

export interface Terms {
  paymentTerms: string;
  warranty: string;
}

export interface RFPVendor {
  id: string;
  rfpId: string;
  vendorId: string;
  sentAt?: string;
  vendor: Vendor;
}

export interface Proposal {
  id: string;
  rfpId: string;
  vendorId: string;
  rawEmail: string;
  emailSubject?: string;
  receivedAt: string;
  parsedData?: ProposalData;
  score?: number;
  evaluation?: Evaluation;
  status: 'RECEIVED' | 'PARSED' | 'EVALUATED' | 'SELECTED' | 'REJECTED';
  vendor: Partial<Vendor>;
  rfp?: Partial<RFP>;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalData {
  items: ProposalItem[];
  totalPrice: number;
  currency: string;
  deliveryTime: string;
  paymentTerms: string;
  warranty: string;
  additionalNotes: string[];
  confidence: number;
}

export interface ProposalItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  meetsSpecs: boolean;
}

export interface Evaluation {
  score: number;
  priceScore: number;
  deliveryScore: number;
  complianceScore: number;
  termsScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ComparisonResult {
  rankings: Ranking[];
  recommendation: Recommendation;
  summary: string;
}

export interface Ranking {
  vendorId: string;
  vendorName: string;
  score: number;
  priceScore: number;
  deliveryScore: number;
  complianceScore: number;
  termsScore: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Recommendation {
  vendorId: string;
  vendorName: string;
  reasoning: string;
}
