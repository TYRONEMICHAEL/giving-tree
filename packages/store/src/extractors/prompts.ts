export interface DefaultPromptTemplate {
  contextStr: string
}

export const defaultJournalMetadataPrompt = (
  { contextStr = '' }: DefaultPromptTemplate = {
    contextStr: ''
  }
): string => `
  Given the detailed entry provided: 
  ---
  ${contextStr}
  ---
  Focus on identifying emotions, overarching themes, activities, reflections, people or places mentioned, 
  key highlights, any questions raised by the author, and interests or hobbies. Organize this information 
  into a JSON object, but feel free to adapt the structure to best represent the entry's content. 
  You may include additional keys if necessary or omit keys that are not applicable.

  Use the following structure as a starting point, but modify it as you see fit based on the content of 
  the entry:

  {
    "emotions": ["productive", "empathetic", "invigorated", "grateful"],
    "activities": ["work", "supporting a friend", "walking", "reading"],
    "locations": ["office", "local park", "café"],
    "weather": ["cold", "gray morning"],
    "key_events": ["project completion", "friend's call", "sunset walk"],
    "self_reflection": ["importance of empathy", "nature's calming effect", "solitude's value"],
    "interactions": ["work-related discussions", "heart-to-heart with a friend"],
    "mood_shifts": ["morning focus", "afternoon empathy", "evening calm"],
    "insights_gained": ["productivity's satisfaction", "empathy's depth", "nature's perspective"],
    "future_goals": ["maintain productivity", "be there for friends", "cherish solitude moments"]
  }
    

  Your goal is to create a JSON object that accurately reflects the entry, paying close attention to 
  its nuances and subtleties. Only include information that is relevant and significant to the entry, and use 
  your judgment to enhance the structure as needed.
`;

export interface DefaultDatePromptTemplate
  extends DefaultPromptTemplate {
  todaysDate?: Date
}

// create a prompt that provides todays data but asks the LLM to first find the data in the entry
export const defaultDateMetadataPrompt = (
  { contextStr = '', todaysDate = new Date() }: DefaultDatePromptTemplate = {
    contextStr: '',
    todaysDate: new Date()
  }
): string => `
  Examine the provided entry, starting with the heading, to identify any specific date mentioned. 
  Use this date as the reference point for interpreting relative terms like 'yesterday' and 'tomorrow' 
  found within the entry. Convert all dates, including those determined by relative terms, into the standard 
  ISO 8601 format (YYYY-MM-DD). If no specific date is found in the heading, use [Today's Date: 
  ${todaysDate.getFullYear()}-${String(todaysDate.getMonth() + 1)
    .padStart(2, '0')}-${String(todaysDate.getDate()).padStart(2, '0')}]  
  as the reference point for calculating relative dates. as the reference. Return all identified dates as an array, 
  or an empty array if no dates are present.
  ---
  ${contextStr}
  ---

  Return the dates in the following format: ["YYYY-MM-DD", "YYYY-MM-DD", ...]
  `
;

export const defaultEmotionalTriggersMetadataPrompt = (
  { contextStr = '' }: DefaultPromptTemplate = {
    contextStr: ''
  }
): string => `

  Given the detailed entry provided: 
  ---
  ${contextStr}
  ---

  Analyze the provided entry to identify emotional triggers. For each trigger, determine 
  if it's positive or negative based on the emotional impact, using the keywords from the provided 
  list of emotional needs. Then, associate each trigger with a brief explanation. Format your output 
  as an object with two lists: 'positive' for positive triggers and 'negative' for negative triggers.

  **Reference List of Emotional Needs:**
  - Acceptance
  - Attention
  - Autonomy
  - Balance
  - Being in control
  - Being liked
  - Being needed
  - Being right
  - Being treated fairly
  - Being understood
  - Being valued
  - Comfort
  - Consistency
  - Feel included
  - Freedom
  - Fun
  - Independence
  - Love
  - New challenges
  - Order
  - Peacefulness
  - Predictability
  - Respect
  - Safety

  **Example 1:**

  - **entry**: "I was thrilled when my idea was accepted during the team meeting, which made me feel 
  respected and valued. However, being assigned extra work at the last minute made me feel a lack of control 
  and balance."

  {
    "positive": [
      {
        triggers: ["respected, valued"],
        citation: "my idea was accepted during the team meeting",
        explanation: "The acceptance of my idea made you feel respected and valued."
      }
    ],
    "negative": [
      {
        triggers: ["lack of control, balance"],
        citation: "being assigned extra work at the last minute",
        explanation: "Being assigned extra work at the last minute made you feel a lack of control and balance."
      }
    ]
  }


  **Example 2:**

  - **entry**: "Winning the photography contest boosted my confidence and gave me a sense of accomplishment. 
  Yet, the critique from one of the judges left me feeling a bit undervalued and misunderstood."

  {
    "positive": [
      {
        triggers: ["confidence, accomplishment],
        text: "Winning the photography contest"
      }
    ],
    "negative": [
      {
        triggers: ["undervalued, misunderstood"],
        text: "the critique from one of the judges"
      }
    ]
  }



  **Instructions**:

  1. Only return the JSON object so it can be correctly parsed using JSON.parse.
  2. You are more than welcome to add additional triggers not present in the list of emotional needs.
  3. If no triggers are found, return an empty object.
  4. There can be multiple triggers in a single sentence, so be sure to capture all of them.
`;
