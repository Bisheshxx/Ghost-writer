// export const FIRST_SECTION = `Generate a distinct, vivid opening lines suitable for the first sentence(s) of a job application cover letter. It should respond to a user's provided Role and Company, and demonstrate authentic enthusiasm and alignment with the company’s mission.

// Warm & Personal: A genuine, heartfelt sentence that sounds like a real human reaching out—e.g., referencing admiration for the company, a personal connection to its values, or how the role excites them on a lived level.

// Explicitly mention either the Role, the Company, or both.

// Be no longer than 2 sentences.

// Sound natural and human, not generic or robotic.

// Vary clearly from the others in tone and approach.
// `;

export const FIRST_SECTION = `
Write the opening of a tailored cover letter for the role and company described below.

Goal:
- Sound like a thoughtful professional, not a template
- Show real interest in the role, the company, or both
- Make the opening feel specific and human

Requirements:
- 1-2 sentences only
- Explicitly mention the role, the company, or both
- Start with a direct, engaging sentence that feels addressed to this specific role or company
- Do not open by summarising the candidate's recent work history
- Avoid clichés like "I am excited to apply", "I am writing to express", "My recent work has focused on", or exaggerated praise
- Do not invent personal stories or motivations not supported by the provided information
- Do not repeat details that are better saved for the body paragraphs
- Use MatchAnalysis to identify the role and company if available

Output:
- Return only the opening lines
`;

// ^^this uses the role and company

// export const SECOND_SECTION = `
// You are a skilled professional cover letter writer. Read the resume and the job description below, then write a single, compelling summary paragraph suitable for the middle of a cover letter. This paragraph should highlight the candidate's most relevant experience, achievements, or skills, and clearly link them to what the job description is seeking. Focus on demonstrating value, alignment, and readiness for the role. Maintain a confident and professional tone. Do not include greetings, sign-offs, or anything not part of the core summary. If there are any unique achievements, certifications, or standout qualities in the resume, prioritize those. Be concise (4–6 sentences max), precise, and tailored to the job. Here is the resume:
// `;

export const SECOND_SECTION = `
Write the middle paragraph of a tailored cover letter using the candidate details and job description below.

Goal:
- Show why the candidate is a strong match for the role
- Select the most relevant experience instead of summarising everything

Requirements:
- 4-6 sentences
- Focus on the 2-3 most relevant qualifications, achievements, or strengths
- Tie each point directly to what the job description is asking for
- Prioritise measurable impact, scope of work, certifications, or standout achievements when available
- Use MatchAnalysis to prioritise the most relevant experience and achievements
- Focus especially on top_job_requirements, top_candidate_matches, and key_achievements
- Sound confident, professional, and specific
- Do not simply restate the resume in prose form
- Each sentence should add new value, not repeat the same strengths in different words
- Avoid stock phrases like "proven track record", "strong background", or "bring my experience"
- Use concrete examples, tools, outcomes, or responsibilities instead of abstract professional language
- Avoid repeating the opening paragraph
- Avoid generic claims like "hard-working", "team player", or "fast learner" unless backed by evidence

Output:
- Return only one paragraph
`;

// export const THIRD_SECTION = `
// You are a cover letter expert. Write a sincere, specific, and engaging paragraph (3–5 sentences) explaining why the candidate is genuinely excited about working at the company named below. Avoid generic praise—connect the company’s standout qualities directly to what would meaningfully attract a thoughtful, values-driven candidate. Highlight personal resonance, not flattery. Reflect a tone that is grounded, articulate, and warmly professional.
// `;

export const THIRD_SECTION = `
Write a closing-style paragraph explaining why the candidate is genuinely drawn to this company and role.

Goal:
- Make the motivation feel specific and credible
- Connect the company's mission, product, values, or way of working to the candidate's interests and professional direction

Requirements:
- 3-5 sentences
- Use only motivations that can be reasonably inferred from the provided information
- Use company_themes where available to ground the motivation in something specific
- This paragraph must explain why this role and company are appealing, not just why the candidate wants to keep growing
- Avoid generic praise or flattery
- Do not invent deep personal backstory
- Avoid vague phrases like "broader engineering context", "contribute effectively", or "this aligns with my trajectory"
- Ground the paragraph in at least one specific company theme, mission, product area, or engineering focus when available
- Keep the tone warm, thoughtful, and professional
- End with a natural, forward-looking sentence that feels specific rather than generic

Output:
- Return only one paragraph
`;

// export const FINAL_TOUCH_UP = `
// Take the provided passage of corporate language and transform it into a more conversational, genuine, and confident tone. Begin by identifying key points and intentions within the text, then rephrase each section using everyday language that feels approachable and sincere. Maintain the core message while infusing it with warmth and assurance. Consider the audience's perspective, ensuring the rewritten text resonates with them on a personal level.
// `;

export const FINAL_TOUCH_UP = `
Rewrite the provided cover letter sections into one cohesive, polished cover letter.

Goals:
- Make the letter sound natural, confident, and human
- Preserve specificity and substance
- Improve flow between paragraphs
- Remove repetition, stiffness, and corporate jargon

Requirements:
- Keep the structure in 3 paragraphs
- Preserve the meaning of each section
- Use clear, conversational professional language
- Do not add new facts
- Do not use em dashes
- Do not sound overly formal, exaggerated, or robotic
- Remove repeated ideas across paragraphs
- Replace abstract corporate phrasing with plain, natural professional language
- Make sure the opening feels directed to the company or role, not like a resume summary
- Make sure the closing paragraph explains interest in this company and role specifically
- Remove stock phrases such as "proven track record", "bring my experience", "broader engineering context", and "contribute effectively"
- Start directly with the letter content
- Do not include greetings, sign-offs, headings, or commentary

Output:
- Return only the final cover letter
`;

export const MATCH_ANALYSIS = `
Analyse the job description and candidate details.

Return:
- role_title
- company_name
- top_5_job_requirements
- top_5_candidate_matches
- strongest_2_3 achievements to highlight
- company themes or values mentioned in the job description

Rules:
- Use only information present in the inputs
- Be concise
- Return structured JSON only
`;

export const FINAL_TOUCH_UP_MONO = `
Review the content generated in steps 1-3, then combine the corporate language and transform them into a more conversational, genuine, and confident tone. Begin by identifying key points and intentions within the text, then rephrase each section using everyday language that feels approachable and sincere. Maintain the core message while infusing it with warmth and assurance. Consider the audience's perspective, ensuring the rewritten text resonates with them on a personal level. 
`;

export const PROMPT_RULES = `
Rules:
1. Do not use em dashes.
2. Use natural, modern professional language.
3. Avoid generic AI-sounding phrasing, corporate jargon, and hollow enthusiasm.
4. Do not include greetings, sign-offs, headings, or meta commentary.
5. Do not invent facts, achievements, motivations, or company details.
6. Prefer specificity over broad claims.
7. Do not default to resume-summary phrasing. Write like a person making a case for fit.
8. Use New Zealand English conventions (British spelling such as “colour”, “organise”, and “centre”) consistently throughout the response.
`;

export const FINAL_QC = `
Review the cover letter below and rewrite it only if needed.

Check for these problems:
- generic opening
- resume-summary tone
- repeated ideas across paragraphs
- vague closing paragraph
- company-unspecific language
- stock phrases or AI-polished wording

Requirements:
- keep the same meaning
- do not add facts
- improve only where needed
- return only the final revised cover letter
`;

export const MIN_SECTION_LENGTH = 20;
export const MIN_FINAL_LENGTH = 80;
