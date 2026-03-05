function doGet(e) {
  const targetUrl = e.parameter.q;
  if (!targetUrl) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'no url' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (e.parameter.mode === 'analyze') {
    return analyzeEndpoint(targetUrl);
  }

  try {
    const resp = UrlFetchApp.fetch(targetUrl, {
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: resp.getResponseCode(),
      body: resp.getContentText(),
      headers: resp.getHeaders(),
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function analyzeEndpoint(targetUrl) {
  try {
    const resp = UrlFetchApp.fetch(targetUrl, { muteHttpExceptions: true });
    const html = resp.getContentText();
    const prompt = [
      'Analyze this webapp HTML and return ONLY valid JSON, no markdown:',
      '{',
      '  "framework": "react|vue|angular|vanilla",',
      '  "usesWebSockets": true/false,',
      '  "wsEndpoints": ["gateway.discord.gg"],',
      '  "authType": "cookie|token|oauth",',
      '  "hasPWAManifest": true/false,',
      '  "routingTier": "stateless|stateful|websocket-bridge",',
      '  "notificationSupport": true/false,',
      '  "appName": "Example",',
      '  "iconUrl": "https://..."',
      '}',
      'HTML:',
      html.slice(0, 18000),
    ].join('\n');

    const analysis = callGemini(prompt);
    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      targetUrl: targetUrl,
      analysis: analysis,
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
