// 4. Repair Agent: Surgical Patch Synthesis & Diff Generator
import * as Diff from 'diff';

export class RepairAgent {
  constructor() {
    this.name = 'Repair Agent';
    this.role = 'Surgical Patch Synthesis & Diff Generation';
  }

  async generatePatch({ sourceCode, diagnosis, filePath }, emitEvent = null) {
    const log = (msg, data = null) => {
      if (emitEvent) emitEvent('repair', msg, data);
    };

    log(`[Repair Agent] Synthesizing surgical minimal code patch for ${filePath}...`);

    let patchedCode = diagnosis.fullFixedCode;
    if (!patchedCode) {
      if (diagnosis.originalChunk && diagnosis.replacementChunk && sourceCode.includes(diagnosis.originalChunk)) {
        patchedCode = sourceCode.replace(diagnosis.originalChunk, diagnosis.replacementChunk);
      } else {
        patchedCode = sourceCode;
      }
    }

    // Generate unified diff string
    const patchDiff = Diff.createPatch(
      filePath,
      sourceCode,
      patchedCode,
      'original/' + filePath,
      'healed/' + filePath
    );

    log(`[Repair Agent] ✅ Patch synthesized successfully!`);
    log(`[Repair Agent] Unified Diff calculated:`);
    log(patchDiff);

    return {
      filePath,
      originalCode: sourceCode,
      patchedCode,
      patchDiff,
      originalChunk: diagnosis.originalChunk,
      replacementChunk: diagnosis.replacementChunk,
      affectedFunction: diagnosis.affectedFunction,
      startLine: diagnosis.startLine,
      endLine: diagnosis.endLine,
      explanation: diagnosis.detailedExplanation
    };
  }
}

export const repairAgent = new RepairAgent();
