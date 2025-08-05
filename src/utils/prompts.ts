export const aiCoachPrompt = (transcription: string, question: string) => {
  return `        
        You are an expert interview coach. Analyze this interview response and provide constructive feedback.

        The candidate has been asked the following question:
        "${question}"

        Transcription:
        "${transcription}"

        Please provide feedback regarding the candidate's response in the following format. Disclaimer, the score out of 10 should be lower for repetition and for filler words where there is more used:

        **Overall Performance:** [Rate 1-10 and brief summary]

        **Strengths:**
        - [List 2-3 specific strengths]

        **Areas for Improvement:**
        - [List 2-3 specific areas to work on]

        **Specific Suggestions:**
        - [Provide 3-4 actionable tips]

        **Communication Quality:**
        - Clarity: [Score/10] [Clarity Summary]
        - Confidence: [Score/10] [Confidence Summary]
        - Structure: [Score/10] [Structure Summary]
        - Grammar: [Score/10] [Grammar Summary]
        - Vocabulary: [Score/10] [Vocabulary Summary]
        - Sentence Complexity: [Score/10] [Sentence Complexity Summary]
        - Repetition: [Score/10] [Repetition Summary]
        - Filler Words Used: [Score/10] [Filler Words Used Summary]
        - Key Words Used: [Score/10] [Key Words Used Summary]
        - Overall: [Score/10] [Overall Summary]

        **Key Advice:**
        [One paragraph of the most important advice for this candidate]

        Keep feedback constructive, specific, and actionable. Focus on both content and delivery.
        `;
};

export const aiStucturedSummaryPrompt = (aiAnalysis: string) => {
    return `Extract and score the following analysis from this text, the key skills scored out of 10.

        An example of the JSON format:
        {
        Clarity: [Score/10]
        Confidence: [Score/10]
        Structure: [Score/10]
        Grammar: [Score/10]
        Vocabulary: [Score/10]
        Pronunciation: [Score/10]
        Sentence Complexity: [Score/10]
        Repetition: [Score/10]
        Filler Words Used: [Score/10]
        Keywords: [Score/10]
        Overall: [Score/10]
        }

        The analysis:
        "${aiAnalysis}"
        `;
};
