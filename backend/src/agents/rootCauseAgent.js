// 3. Root Cause Agent: Semantic Reasoner & Diagnostic Engine (Gemini / AST)
import { gemini } from '../services/geminiService.js';

export class RootCauseAgent {
  constructor() {
    this.name = 'Root Cause Agent';
    this.role = 'Semantic Failure Reasoning & Diagnosis';
  }

  async analyzeRootCause({ errorData, sourceCode, filePath, targetRoute, method }, emitEvent = null) {
    const log = (msg, data = null) => {
      if (emitEvent) emitEvent('root_cause', msg, data);
    };

    log(`[Root Cause Agent] Performing semantic error parsing and AST dependency analysis on ${filePath}...`);

    const diagnosis = await gemini.analyzeAndRepair({
      errorData,
      sourceCode,
      filePath,
      targetRoute,
      method
    });

    log(`[Root Cause Agent] 🎯 Root Cause Identified (Confidence: ${diagnosis.confidenceScore}%):`, {
      rootCause: diagnosis.rootCause,
      severity: diagnosis.severity,
      blastRadius: diagnosis.blastRadius
    });

    log(`[Root Cause Agent] Impact assessment: Severity=${diagnosis.severity}, BlastRadius=${diagnosis.blastRadius}`);

    return diagnosis;
  }
}

export const rootCauseAgent = new RootCauseAgent();
