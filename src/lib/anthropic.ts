const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-haiku-4-5-20251001'

export async function generateReply(apiKey: string, systemPrompt: string, dmText: string): Promise<string> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: dmText }],
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`)
  }

  const data = await res.json()
  const block = data.content?.find((c: { type: string }) => c.type === 'text')
  return block?.text?.trim() ?? ''
}
