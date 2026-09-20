export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { imageBase64, mimeType } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({ success: false, error: 'Image data missing' });
        }

        // आपकी Gemini API Key यहाँ सेट है
        const GEMINI_API_KEY = "AIzaSyCH5pXri5I6Mo8ccCM9tsq2PupHIjxne_I";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        {
                            inline_data: {
                                mime_type: mimeType || "image/jpeg",
                                data: imageBase64
                            }
                        },
                        {
                            text: "Analyze this paddy crop leaf image. Identify if it has blast, blb, borer, bph, or sheath blight. Return ONLY the lowercase keyword for the disease ('blast', 'blb', 'borer', 'bph', or 'sheath'), nothing else."
                        }
                    ]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            let detectedText = data.candidates[0].content.parts[0].text.trim().toLowerCase();
            return res.status(200).json({ success: true, detectedDiseaseKey: detectedText });
        } else {
            return res.status(500).json({ success: false, error: 'Gemini AI response failed' });
        }

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
