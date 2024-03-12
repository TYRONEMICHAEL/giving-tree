# Log Action Template

This activity guides you to reflect on a recent task or experience, capturing your actions, feelings, emotions, and insights. The outcome is a structured log entry that includes both your original reflection and a formatted summary with additional details like authors' names and original book titles when mentioned.

## Instructions:

1. **User Input**: Start by providing a brief description of a recent activity or experience, focusing on:
   - **Title of the Activity**: A summarizing title.
   - **Description**: Key actions and milestones.
   - **Feelings and Emotions**: Your emotional journey.
   - **Insights**: New realizations or learnings.
   - **Tags**: Keywords categorizing the experience.

2. **LLM Response**: The LLM will structure your input into a comprehensive log entry, ensuring to:
   - Echo your original message for context.
   - Format the log entry with relevant headings.
   - Include additional details like authors' names and original titles for any books or resources mentioned.

## User Input Example:

"I explored the book 'Essential Discrete Mathematics for Computer Science.' I'm eager to apply its concepts to my work on the Algorithm Design Manual."

## LLM Formatted Log Entry:

```markdown
---
date: "{{currentDate}}"
tags: ["log", "learning", "discrete mathematics", "algorithm design"]
feelings: ["eagerness"]
emotions: ["anticipation"]
title: "Exploring Essential Discrete Mathematics for CS"
---

Today, I delved into 'Essential Discrete Mathematics for Computer Science' by Harry Lewis and Rachel Zax. The exploration fills me with eagerness, anticipating how its principles will enhance my understanding and application in algorithm design for the 'Algorithm Design Manual' by Steven S. Skiena.

Original User Message:
"I explored the book 'Essential Discrete Mathematics for Computer Science.' I'm eager to apply its concepts to my work on the Algorithm Design Manual."
```

When I add a log, it should first query for related log messages so when it formats it, it can use existing tags and context to enrich its response. Maybe also using ToM