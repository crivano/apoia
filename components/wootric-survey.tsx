"use client"

import { useEffect } from "react"

export default function WootricSurvey( {user}:  {user: any}) {
    useEffect(() => {
        // Load the script dynamically
        const script = document.createElement("script");
        script.src = "https://cdn.wootric.com/wootric-sdk.js";
        script.async = true;
        script.onload = () => {
            if (window.wootric) {
                window.wootric_survey_immediately = true
                window.wootricSettings = {
                    account_token: process.env.NEXT_PUBLIC_WOOTRIC_ACCOUNT_TOKEN, 
                    email: user.email, 
                    // created_at: 1234567890,
                    // Other optional settings:
                    // language: 'en',
                    // product_name: 'ApoIA',
                    // custom_questions: [{ question: 'What can we improve?', type: 'open-ended' }]
                }
                console.log('wootric',  window.wootricSettings)
                window.wootric('run');
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null; // No UI, just inject the script
}