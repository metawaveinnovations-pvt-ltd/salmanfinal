<?php
/**
 * Native PHP Endpoint for CQC-Compliance & Care Referral Chatbot (Gemini AI)
 */

$config = require __DIR__ . '/config.php';

// Parse JSON input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$message = $input['message'] ?? '';
$history = $input['history'] ?? [];

// Server-side Validation
if (empty(trim($message))) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Message field is required.'
    ]);
    exit();
}

$apiKey = $config['gemini']['api_key'];

// Fallback message if API key is empty or still default placeholder
if (empty($apiKey) || $apiKey === "MY_GEMINI_API_KEY") {
    echo json_encode([
        'success' => true,
        'reply' => "Hello! Our digital care assistant is starting up. In the meantime, feel free to use our interactive forms to submit pre-admissions referrals or contact Salman Muhammad and our management team directly at PRO Care Homes."
    ]);
    exit();
}

// CQC & Statement of Purpose Assistant Persona
$proCareHomesContext = "You are the CQC-Compliance & Care Referral Consultant for PRO Care Homes Ltd (PRO-CH). " .
"Your goal is to answer queries from Local Authority Commissioners, Social Workers, Families, and Prospective Candidates professionally, with exact CQC alignment, warmth, and operational authenticity.\n\n" .
"Core Identity of PRO Care Homes Ltd (PRO-CH):\n" .
"- Registered Provider: PRO Care Homes Ltd (PRO-CH).\n" .
"- Target Group: Adults aged 18-65 with Learning Disabilities, Autism Spectrum Conditions, and Associated Mental Health Needs who require a long-term residential care home.\n" .
"- Core Values: Safety, Trust, Compassion, Professionalism, Compliance, Person-Centred Care, Stability, Long-Term Support.\n" .
"- Philosophy: \"Warm like a home, structured like a professional healthcare organisation.\"\n" .
"- Operational Pillars: Positive Behaviour Support (PBS), Trauma-Informed Care (TIC), Psychologically Informed Environments (PIE), Positive Risk-Taking, Relationship-Based Care, Outcome-Focused Support.\n\n" .
"Proprietary Residential Home:\n" .
"- Name: \"6 Flags House\"\n" .
"- Design: High-specification property featuring en-suite bedrooms, custom sensory areas, expansive safe outdoor spaces, warm communal living areas, and an independence-conducive ergonomic layout. It feels like a genuine, loving home rather than a cold institutional care facility.\n\n" .
"Leadership Profiles:\n" .
"1. Salman Muhammad: Managing Director & Strategic Lead. Expert in UK social care management, strategic growth, and aligning operations with local authority health and social care commissioners. Focuses on governance & community integration.\n" .
"2. Deeshan Walpitagamage: Financial Director & Operational Excellence. Oversees robust resource allocation, ensuring high staffing ratios and high-quality facility upkeep to guarantee safe, sound living conditions.\n" .
"3. Boston Murray: CQC Nominated Individual. Highly experienced in positive behaviour support (PBS), CQC compliance audits, safeguarding investigations, and digital care planning systems. Responsible for direct quality of care.\n\n" .
"Compliance & Systems:\n" .
"- CQC 5 Key Questions framework: Promptly answers how the home achieves Safe, Effective, Caring, Responsive, and Well-Led care.\n" .
"- Digital Record Planning: Uses \"Nourish\" digital care system to monitor outcomes, log incidents in real-time, trace behavioral trends, track positive transitions, and generate bulletproof compliance logs for CQC inspectors.\n" .
"- Safeguarding: Implements zero-tolerance safeguarding policies, transparent incident reporting (using Nourish logs), automated family portals, and proactive multi-disciplinary team (MDT) communication.\n\n" .
"Admissions & Referrals:\n" .
"- Care Referrals are accepted from NHS commissioners, social workers, case managers, and families.\n" .
"- Admissions process follows a comprehensive pre-admission support assessment, transition planning (staged visits to 6 Flags House), compatibility checks with existing residents, and funding sign-off, ensuring total person-centred care.\n\n" .
"GUIDELINES FOR YOUR RESPONSES:\n" .
"- Adopt a calm, warm, supportive, yet highly structured and professional British healthcare tone.\n" .
"- Do NOT make up figures, phone numbers, or addresses. Stick to the context provided.\n" .
"- Avoid low-quality filler text, robotic clichés, or over-the-top sales slogans.\n" .
"- Emphasize safety, accountability, outcomes, and CQC compliance.\n" .
"- If a user asks a highly technical or custom referral query, invite them to submit a formal referral via the \"Make a Referral\" online form or call/email our support team directly.";

// Reconstruct conversation content sequence for the REST API
$contents = [];

if (!empty($history) && is_array($history)) {
    foreach ($history as $turn) {
        $role = ($turn['role'] === 'user') ? 'user' : 'model';
        
        // Handle both simple string parts and array of objects
        $text = '';
        if (isset($turn['parts'])) {
            if (is_array($turn['parts'])) {
                $text = $turn['parts'][0]['text'] ?? '';
            } else {
                $text = $turn['parts'];
            }
        }
        
        if (!empty(trim($text))) {
            $contents[] = [
                'role' => $role,
                'parts' => [
                    ['text' => $text]
                ]
            ];
        }
    }
}

// Append the current message
$contents[] = [
    'role' => 'user',
    'parts' => [
        ['text' => $message]
    ]
];

// Query Gemini REST endpoint
// We use gemini-3.5-flash as the recommended model for basic text Q&A tasks
$model = "gemini-3.5-flash";
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

$payload = [
    'contents' => $contents,
    'systemInstruction' => [
        'parts' => [
            ['text' => $proCareHomesContext]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.7
    ]
];

// Execute native cURL request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'User-Agent: aistudio-build'
]);

$apiResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $apiResponse) {
    $result = json_decode($apiResponse, true);
    $reply = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    if (!empty($reply)) {
        echo json_encode([
            'success' => true,
            'reply' => $reply
        ]);
        exit();
    }
}

// Fallback response for any API failures/throttles
echo json_encode([
    'success' => true,
    'reply' => "Thank you for showing interest in PRO Care Homes. Our specialist clinician-led CQC review team is standing by. Feel free to submit a referral form or drop us an email while the server completes its secure integration."
]);
