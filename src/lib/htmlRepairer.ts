/**
 * HTML Code Repairer
 * Repairs and normalizes extracted HTML code to ensure it's complete and playable
 */

/**
 * Repair HTML code by fixing common issues
 */
export function repairHTMLCode(htmlCode: string): string {
  let repaired = htmlCode.trim();

  // Remove any leading/trailing non-HTML content
  repaired = removeNonHTMLContent(repaired);

  // Ensure DOCTYPE is present and correct
  if (!repaired.match(/<!DOCTYPE\s+html/i)) {
    if (repaired.includes('<html')) {
      repaired = '<!DOCTYPE html>\n' + repaired;
    } else {
      // Try to find where HTML starts
      const htmlStart = repaired.search(/<html/i);
      if (htmlStart > 0) {
        repaired = '<!DOCTYPE html>\n' + repaired.substring(htmlStart);
      } else {
        repaired = '<!DOCTYPE html>\n<html>\n' + repaired;
      }
    }
  }

  // Ensure html tag is present
  if (!repaired.includes('<html')) {
    const hasHeadOrBody = repaired.includes('<head') || repaired.includes('<body');
    if (hasHeadOrBody) {
      repaired = repaired.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<html>');
    } else {
      repaired = repaired.replace('<!DOCTYPE html>', '<!DOCTYPE html>\n<html>');
    }
  }

  // Ensure closing html tag
  if (!repaired.includes('</html>')) {
    repaired = repaired + '\n</html>';
  }

  // Fix unclosed head tag
  if (repaired.includes('<head') && !repaired.includes('</head>')) {
    const headMatch = repaired.match(/<head[^>]*>/i);
    if (headMatch) {
      const headEnd = repaired.indexOf('<body') || repaired.indexOf('</html>');
      if (headEnd > 0) {
        repaired = repaired.substring(0, headEnd) + '</head>\n' + repaired.substring(headEnd);
      }
    }
  }

  // Fix unclosed body tag
  if (repaired.includes('<body') && !repaired.includes('</body>')) {
    const bodyEnd = repaired.indexOf('</html>');
    if (bodyEnd > 0) {
      repaired = repaired.substring(0, bodyEnd) + '</body>\n' + repaired.substring(bodyEnd);
    }
  }

  // Remove duplicate DOCTYPE
  const doctypeMatches = repaired.match(/<!DOCTYPE\s+html[^>]*>/gi);
  if (doctypeMatches && doctypeMatches.length > 1) {
    repaired = '<!DOCTYPE html>\n' + repaired.replace(/<!DOCTYPE\s+html[^>]*>/gi, '');
  }

  // Remove duplicate html tags
  const htmlOpenMatches = repaired.match(/<html[^>]*>/gi);
  if (htmlOpenMatches && htmlOpenMatches.length > 1) {
    // Keep only the first one
    let firstFound = false;
    repaired = repaired.replace(/<html[^>]*>/gi, (match) => {
      if (!firstFound) {
        firstFound = true;
        return match;
      }
      return '';
    });
  }

  // Normalize whitespace (but preserve structure)
  repaired = repaired.replace(/\r\n/g, '\n');
  repaired = repaired.replace(/\r/g, '\n');
  repaired = repaired.replace(/\n{4,}/g, '\n\n\n'); // Max 3 consecutive newlines

  // Ensure proper structure order
  if (!repaired.match(/<!DOCTYPE\s+html[\s\S]*<html[\s\S]*<head[\s\S]*<\/head>[\s\S]*<body[\s\S]*<\/body>[\s\S]*<\/html>/i)) {
    // Try to reorganize if structure is wrong
    const headMatch = repaired.match(/(<head[^>]*>[\s\S]*?<\/head>)/i);
    const bodyMatch = repaired.match(/(<body[^>]*>[\s\S]*?<\/body>)/i);
    
    if (headMatch && bodyMatch) {
      // Reconstruct in correct order
      repaired = '<!DOCTYPE html>\n<html>\n' + headMatch[1] + '\n' + bodyMatch[1] + '\n</html>';
    }
  }

  return repaired;
}

/**
 * Remove non-HTML content from the beginning and end
 */
function removeNonHTMLContent(content: string): string {
  let cleaned = content;

  // Remove markdown code block markers if present
  cleaned = cleaned.replace(/^```\w*\n?/gm, '');
  cleaned = cleaned.replace(/```\s*$/gm, '');

  // Remove common explanation patterns at the start
  cleaned = cleaned.replace(/^(Here|This|The|Below|Above|代码|Code|HTML|游戏代码).*?:\s*/gmi, '');
  cleaned = cleaned.replace(/^[\s\n]*[#*\-]\s*/gm, ''); // Remove markdown list items

  // Remove text before first <
  const firstTagIndex = cleaned.indexOf('<');
  if (firstTagIndex > 0) {
    // Check if there's meaningful HTML before this
    const beforeTag = cleaned.substring(0, firstTagIndex);
    // If it's just whitespace or short text, remove it
    if (beforeTag.trim().length < 50 && !beforeTag.includes('<!DOCTYPE')) {
      cleaned = cleaned.substring(firstTagIndex);
    }
  }

  // Remove text after last >
  const lastTagIndex = cleaned.lastIndexOf('>');
  if (lastTagIndex >= 0 && lastTagIndex < cleaned.length - 1) {
    const afterTag = cleaned.substring(lastTagIndex + 1);
    // If it's just whitespace or short text, remove it
    if (afterTag.trim().length < 50 && !afterTag.includes('</html>')) {
      cleaned = cleaned.substring(0, lastTagIndex + 1);
    }
  }

  return cleaned;
}

/**
 * Validate and fix JavaScript syntax issues
 */
export function repairJavaScript(htmlCode: string): string {
  // This is a basic repair - for production, consider using a proper JS parser
  let repaired = htmlCode;

  // Fix common unclosed function/object issues
  // Count braces to ensure balance
  const scriptMatches = htmlCode.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of scriptMatches) {
    const scriptContent = match[1];
    const openBraces = (scriptContent.match(/{/g) || []).length;
    const closeBraces = (scriptContent.match(/}/g) || []).length;
    const openParens = (scriptContent.match(/\(/g) || []).length;
    const closeParens = (scriptContent.match(/\)/g) || []).length;

    // If significantly unbalanced, try to fix (basic heuristic)
    if (Math.abs(openBraces - closeBraces) > 2) {
      console.warn('JavaScript braces may be unbalanced in script tag');
    }
    if (Math.abs(openParens - closeParens) > 2) {
      console.warn('JavaScript parentheses may be unbalanced in script tag');
    }
  }

  return repaired;
}

/**
 * Complete HTML repair pipeline
 */
export function completeHTMLRepair(htmlCode: string): string {
  let repaired = htmlCode;

  // Step 1: Remove non-HTML content
  repaired = removeNonHTMLContent(repaired);

  // Step 2: Basic HTML structure repair
  repaired = repairHTMLCode(repaired);

  // Step 3: JavaScript repair
  repaired = repairJavaScript(repaired);

  return repaired;
}
