export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { imageBase64, mimeType } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Image data missing' });
        }

        // आपकी API Key यहाँ सीधे सेट कर दी गई है
        const CLAUDE_API_KEY = "AIzaSyCH5pXri5I6Mo8ccCM9tsq2PupHIjxne_I";

        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 300,
                messages: [{
                    role: "user",
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mimeType || "image/jpeg",
                                data: imageBase64
                            }
                        },
                        {
                            type: "text",
                            text: "Analyze this paddy crop leaf image. Identify if it has Blast, BLB, Borer, BPH, or Sheath Blight. Return ONLY the disease key in lowercase (e.g., 'blast', 'blb', 'borer', 'bph', 'sheath'), nothing else."
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (data.content && data.content[0] && data.content[0].text) {
            let detectedText = data.content[0].text.trim().toLowerCase();
            return res.status(200).json({ success: true, detectedDiseaseKey: detectedText });
        } else {
            return res.status(500).json({ success: false, error: 'AI response failed' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
