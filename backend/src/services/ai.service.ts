import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.3,
    responseMimeType: 'application/json',
  },
});

// Schemas for validation
const RFPStructureSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    specifications: z.record(z.string(), z.any()),
  })),
  budget: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
  timeline: z.object({
    deliveryDeadline: z.string(),
    responseDeadline: z.string().nullable().default("TBD"),
  }),
  terms: z.object({
    paymentTerms: z.string().nullable().default("To be negotiated"),
    warranty: z.string().nullable().default("Standard warranty"),
  }),
  requirements: z.array(z.string()).default([]),
});

const ProposalStructureSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    totalPrice: z.number(),
    meetsSpecs: z.boolean(),
  })),
  totalPrice: z.number().nullish().transform(val => val ?? 0),
  currency: z.string().nullish().transform(val => val ?? "USD"),
  deliveryTime: z.string().nullish().transform(val => val ?? "Not specified"),
  paymentTerms: z.string().nullish().transform(val => val ?? "To be negotiated"),
  warranty: z.string().nullish().transform(val => val ?? "Standard warranty"),
  additionalNotes: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).nullish().transform(val => val ?? 0.5),
});

export class AIService {
  /**
   * Parse natural language input into structured RFP data
   */
  static async parseRFPFromNaturalLanguage(input: string) {
    const prompt = `You are an AI assistant that converts natural language procurement requests into structured RFP data.

Given a user's description of what they want to procure, extract the following information:

1. title: A short title for the RFP
2. items: Array of items with name, quantity, and specifications
3. budget: Total budget amount and currency
4. timeline: Delivery deadline, response deadline
5. terms: Payment terms, warranty requirements
6. requirements: Any additional requirements

Respond ONLY with valid JSON in this exact format:
{
  "title": "string",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "specifications": { "key": "value" }
    }
  ],
  "budget": {
    "amount": number,
    "currency": "USD"
  },
  "timeline": {
    "deliveryDeadline": "YYYY-MM-DD",
    "responseDeadline": "YYYY-MM-DD"
  },
  "terms": {
    "paymentTerms": "string",
    "warranty": "string"
  },
  "requirements": ["string"]
}

If any field is not mentioned, use reasonable defaults or null.

User Input: ${input}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      if (!text) {
        throw new Error('No response from AI');
      }

      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsed = JSON.parse(text);
      return RFPStructureSchema.parse(parsed);
    } catch (error) {
      console.error('Error parsing RFP:', error);
      throw new Error(`Failed to parse RFP: ${error}`);
    }
  }

  /**
   * Parse vendor email response into structured proposal data
   */
  static async parseProposalFromEmail(rfpContext: any, vendorEmail: string) {
    const prompt = `You are an AI that extracts structured data from vendor proposal emails.

Given an RFP context and a vendor's email response, extract:

1. items: What they're offering (name, quantity, unit price, total)
2. totalPrice: Total quoted price (MUST be a number, use 0 if not found)
3. deliveryTime: When they can deliver (MUST be a string, use "Not specified" if not found)
4. paymentTerms: Their payment terms (MUST be a string, use "To be negotiated" if not found)
5. warranty: Warranty offered (MUST be a string, use "Standard warranty" if not found)
6. additionalNotes: Any other important terms

IMPORTANT: All fields MUST have values. Never use null. Use default values if information is missing.

RFP Context:
${JSON.stringify(rfpContext, null, 2)}

Vendor Email:
${vendorEmail}

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "meetsSpecs": true/false
    }
  ],
  "totalPrice": number,
  "currency": "USD",
  "deliveryTime": "string",
  "paymentTerms": "string",
  "warranty": "string",
  "additionalNotes": ["string"],
  "confidence": 0.0-1.0
}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      let text = response.text();

      if (!text) {
        throw new Error('No response from AI');
      }

      // Remove markdown code blocks if present
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const parsed = JSON.parse(text);

      // Apply defaults for null values before validation
      const sanitized = {
        ...parsed,
        totalPrice: parsed.totalPrice ?? 0,
        currency: parsed.currency ?? "USD",
        deliveryTime: parsed.deliveryTime ?? "Not specified",
        paymentTerms: parsed.paymentTerms ?? "To be negotiated",
        warranty: parsed.warranty ?? "Standard warranty",
        additionalNotes: parsed.additionalNotes ?? [],
        confidence: parsed.confidence ?? 0.5,
      };

      return ProposalStructureSchema.parse(sanitized);
    } catch (error) {
      console.error('Error parsing proposal:', error);
      throw new Error(`Failed to parse proposal: ${error}`);
    }
  }

  /**
   * Compare proposals and provide AI recommendation
   */
  static async compareProposals(rfpData: any, proposals: any[]) {
    const prompt = `You are a procurement analyst AI. Compare vendor proposals for an RFP.

RFP Requirements:
${JSON.stringify(rfpData, null, 2)}

Proposals:
${JSON.stringify(proposals, null, 2)}

Analyze and score each proposal (0-100) based on:
- Price competitiveness (30%)
- Delivery timeline (20%)
- Specification compliance (25%)
- Terms and warranty (15%)
- Overall value (10%)

Respond with JSON:
{
  "rankings": [
    {
      "vendorId": "string",
      "vendorName": "string",
      "score": number,
      "priceScore": number,
      "deliveryScore": number,
      "complianceScore": number,
      "termsScore": number,
      "strengths": ["string"],
      "weaknesses": ["string"]
    }
  ],
  "recommendation": {
    "vendorId": "string",
    "vendorName": "string",
    "reasoning": "string"
  },
  "summary": "string"
}`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response from AI');
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('Error comparing proposals:', error);
      throw new Error(`Failed to compare proposals: ${error}`);
    }
  }
}
