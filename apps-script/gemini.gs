function callGemini(prompt) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_KEY');
  if (!key) {
    throw new Error('Missing GEMINI_KEY script property');
  }

  const resp = UrlFetchApp.fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key,
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      muteHttpExceptions: true,
    }
  );

  const parsed = JSON.parse(resp.getContentText());
  if (!parsed.candidates || !parsed.candidates[0]) {
    throw new Error('Invalid Gemini response: ' + resp.getContentText());
  }

  return parsed.candidates[0].content.parts[0].text;
}
