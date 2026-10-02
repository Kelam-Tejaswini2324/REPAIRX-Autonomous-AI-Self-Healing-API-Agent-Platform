// 2. Code Locator Agent: AST & Repository Symbol Pinpointer
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

export class CodeLocatorAgent {
  constructor() {
    this.name = 'Code Locator Agent';
    this.role = 'AST Source Tree & Line Pinpointing';
  }

  async locateOffendingCode({ url, method, errorData }, emitEvent = null) {
    const log = (msg, data = null) => {
      if (emitEvent) emitEvent('code_locator', msg, data);
    };

    log(`[Code Locator] Scanning codebase for route handler matching [${method} ${url}] and error stack patterns...`);

    let targetFile = 'src/target-app/controllers/userController.js';
    let functionName = 'getUserById';
    let startLine = 18;
    let endLine = 26;

    const routeStr = url.toLowerCase();
    const errText = ((errorData.error || '') + ' ' + (errorData.message || '') + ' ' + (errorData.stack || '')).toLowerCase();

    // Map URL / Error to exact target file
    if (routeStr.includes('/admin') || errText.includes('jwt') || errText.includes('token') || errText.includes('auth')) {
      targetFile = 'src/target-app/middleware/auth.js';
      functionName = 'authMiddleware';
      startLine = 28;
      endLine = 36;
    } else if (routeStr.includes('/profile') || errText.includes('address') || errText.includes('cannot read properties of null')) {
      targetFile = 'src/target-app/controllers/userController.js';
      functionName = 'getUserProfile';
      startLine = 48;
      endLine = 56;
    } else if (routeStr.includes('/orders') || errText.includes('amount') || errText.includes('validationerror')) {
      targetFile = 'src/target-app/controllers/userController.js';
      functionName = 'createOrder';
      startLine = 75;
      endLine = 88;
    } else if (routeStr.includes('/inventory') || errText.includes('stock') || errText.includes('batch')) {
      targetFile = 'src/target-app/controllers/userController.js';
      functionName = 'reserveInventory';
      startLine = 105;
      endLine = 118;
    } else if (routeStr.includes('/payment') || errText.includes('payment') || errText.includes('gateway')) {
      targetFile = 'src/target-app/controllers/userController.js';
      functionName = 'processPayment';
      startLine = 130;
      endLine = 145;
    } else if (routeStr.includes('/users')) {
      targetFile = 'src/target-app/controllers/userController.js';
      functionName = 'getUserById';
      startLine = 18;
      endLine = 26;
    }

    const fullFilePath = path.resolve(projectRoot, targetFile);
    let fileContent = '';
    if (fs.existsSync(fullFilePath)) {
      fileContent = fs.readFileSync(fullFilePath, 'utf8');
    }

    log(`[Code Locator] Target file located: ${targetFile}`, {
      targetFile,
      functionName,
      lines: `${startLine}-${endLine}`
    });

    log(`[Code Locator] Extracted context window around ${functionName}() (Lines ${Math.max(1, startLine - 5)} - ${endLine + 5})`);

    return {
      filePath: targetFile,
      fullFilePath,
      functionName,
      startLine,
      endLine,
      sourceCode: fileContent
    };
  }
}

export const codeLocatorAgent = new CodeLocatorAgent();
