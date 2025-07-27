from huggingface_hub import InferenceClient
import os


def generate_ai_feedback(transcription: str, question: str) -> str:
    client = InferenceClient(token=os.getenv('HUGGINGFACE_API_KEY'))

    prompt = f"""
        You are an expert interview coach. Analyze this interview response and provide constructive feedback.

        The candidate has been asked the following question:
        {question}

        Transcription:
        "${transcription}"

        Please provide feedback regarding the candidate's response in the following format:

        **Overall Performance:** [Rate 1-10 and brief summary]

        **Strengths:**
        - [List 2-3 specific strengths]

        **Areas for Improvement:**
        - [List 2-3 specific areas to work on]

        **Specific Suggestions:**
        - [Provide 3-4 actionable tips]

        **Communication Quality:**
        - Clarity: [Score/10]
        - Confidence: [Score/10]
        - Structure: [Score/10]

        **Key Advice:**
        [One paragraph of the most important advice for this candidate]

        Keep feedback constructive, specific, and actionable. Focus on both content and delivery.
        """
    

    try:
        messages = [
            {"role": "user", "content": prompt}
        ]
        
        response = client.chat_completion(
        messages=messages,
        model="meta-llama/Meta-Llama-3-8B-Instruct",
        )
        return response["choices"][0]["message"]["content"]
    except Exception as e:
        return f"Error generating feedback: {e}"
