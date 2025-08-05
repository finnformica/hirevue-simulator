// New structured prompt for generating JSON output
export const structuredAnalysisPrompt = (
  transcription: string,
  question: string
) => {
  return `You are an expert interview coach. Analyze this interview response and provide structured feedback.

The candidate has been asked the following question:
"${question}"

Transcription:
"${transcription}"

Return ONLY a JSON object with the following structure. No explanations, no markdown, no additional text:

{
  "overallScore": [number 1-10],
  "overallStatement": "[Brief summary of overall performance]",
  "grade": "[Excellent/Good/Average/Poor/Failed based on overall score]",
  "metrics": {
    "clarity": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about clarity]",
      "description": "[Brief description of what clarity means]"
    },
    "confidence": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about confidence]",
      "description": "[Brief description of what confidence means]"
    },
    "structure": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about structure]",
      "description": "[Brief description of what structure means]"
    },
    "grammar": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about grammar]",
      "description": "[Brief description of what grammar means]"
    },
    "vocabulary": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about vocabulary]",
      "description": "[Brief description of what vocabulary means]"
    },
    "sentenceComplexity": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about sentence complexity]",
      "description": "[Brief description of what sentence complexity means]"
    },
    "repetition": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about repetition]",
      "description": "[Brief description of what repetition means]"
    },
    "fillerWordsUsed": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about filler words]",
      "description": "[Brief description of what filler words means]"
    },
    "keywords": {
      "score": [number 1-10],
      "feedback": "[Personalized feedback about keyword usage]",
      "description": "[Brief description of what keywords means]"
    }
  },
  "feedback": {
    "strengths": [
      "[Specific strength 1]",
      "[Specific strength 2]",
      "[Specific strength 3]"
    ],
    "areasForImprovement": [
      "[Area for improvement 1]",
      "[Area for improvement 2]",
      "[Area for improvement 3]"
    ],
    "specificSuggestions": [
      "[Specific suggestion 1]",
      "[Specific suggestion 2]",
      "[Specific suggestion 3]",
      "[Specific suggestion 4]"
    ],
    "keyAdvice": "[One paragraph of the most important advice for this candidate]"
  }
}

Guidelines:
- Scores should be 1-10 where 10 is excellent
- For repetition and filler words, lower scores indicate more usage (worse performance)
- Provide specific, actionable feedback for each metric
- Keep feedback constructive and encouraging
- Focus on both content and delivery
- Make feedback personalized to the candidate's specific response`;
};
