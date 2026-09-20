export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { imageBase64, mimeType } = req.body;
        const CLAUDE_API_KEY = "AIzaSyCH5pXri5I6Mo8ccCM9tsq2PupHIjxne_I";

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 100,
                messages: [{
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: { type: "base64", media_type: mimeType || "image/jpeg", data: imageBase64 }
                        },
                        {
                            type: "text",
                            text: "Identify the paddy crop disease from this image. Choose strictly from: blast, blb, borer, bph, sheath. Reply with only the single keyword."
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        const diseaseText = data.content && data.content[0] ? data.content[0].text.trim().toLowerCase() : "unknown";
        
        return res.status(200).json({ success: true, detectedDiseaseKey: diseaseText });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
