# giving-tree

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.19. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

Below is a structured TODO list in markdown format, including additional details and specifications for your project involving journal entry processing and metadata extraction with llamaIndex.

---

# Project TODO List

## Pre-Development Setup

- [x] **Environment Setup**
  - Ensure Node.js and npm are installed.
  - Install necessary global npm packages, if any.

- [x] **Project Initialization**
  - Create a new project directory and navigate into it.
  - Run `npm init -y` to initialize a new Node.js project.
  - Install necessary npm packages: Express, axios, and any libraries required for interacting with llamaIndex and the vector database.

- [x] **Familiarize with llamaIndex**
  - Review llamaIndex documentation, focusing on data ingestion, metadata extraction, and querying capabilities.

## Development

### Metadata Extractor Creation

- [ ] **Function for Journal Entry Processing**
  - Develop a main function that accepts a journal entry text and coordinates the processing through various metadata extractors.

- [ ] **Theme, Categories, and Emotions Extractor**
  - Implement a function that prompts the LLM to analyze the text and extract themes, categories, and emotional tones.

- [ ] **Thought-Provoking Questions Generator**
  - Create a function that uses the LLM to generate relevant questions based on the journal entry content.

- [ ] **Trigger Equations Generator**
  - Develop a function that identifies and formulates trigger equations, which could involve extracting key phrases or concepts with action-oriented potential.

- [ ] **Summary and Title Generator**
  - Implement a function that generates a concise summary and an appropriate title for the journal entry.

### Integration with llamaIndex

- [ ] **Ingest Processed Data**
  - Ensure the processed metadata is formatted correctly for llamaIndex ingestion.
  - Ingest the metadata into llamaIndex, ready for storage in the vector database.

- [ ] **Store in Vector Database**
  - Confirm the integration with the vector database, ensuring efficient storage and retrieval of processed metadata.

### API Endpoint Development

- [ ] **Create Express Server**
  - Set up an Express.js server to manage HTTP requests and responses.

- [ ] **Develop Endpoint**
  - Implement an endpoint `/process-journal-entry` that accepts journal entries, processes them, and returns the extracted metadata.

### Deployment Preparation

- [ ] **Prepare for Vercel Deployment**
  - Organize your project structure and configuration files (`vercel.json`) for Vercel compatibility.

### Testing and Validation

- [ ] **Local Testing**
  - Test all components locally to ensure they work individually and together as expected.

- [ ] **Query Evaluation**
  - Test querying the vector database with various questions or keywords to evaluate the relevance and accuracy of the responses.

### Deployment

- [ ] **Deploy to Vercel**
  - Finalize any pre-deployment checks and deploy your application to Vercel.

### Post-Deployment Testing

- [ ] **Endpoint Testing**
  - Verify the functionality of your deployed endpoint, ensuring it behaves as expected in the live environment.

## Additional Details

### Documentation

- Provide detailed API documentation, including endpoint usage, request/response formats, and examples.

### Security Measures

- Implement API key authentication to restrict access.
- Set up rate limiting to prevent abuse.

### Monitoring and Logging

- Integrate monitoring tools to keep track of system performance and usage.
- Set up logging for incoming requests and system errors for troubleshooting and optimization purposes.

## Timeline

- Allocate specific time blocks for each task, considering dependencies.
- Include buffer times for unexpected challenges and extended testing phases.

---

This markdown TODO list and project specification can be used as a roadmap for developing your system. Adjust the tasks and details as needed based on your project's specific requirements and progress.

---

ward streamlining the architecture of "Weave." The types act as a guiding framework for the AI to apply a relevant set of processing patterns. Here's how it could work:

Types as AI Directives:
Type Definitions: Each type corresponds to a particular category of note-taking with an associated purpose and set of actions. Types have clear, descriptive names that make their function obvious.
Type-Pattern Mapping: For each type, there's a predefined collection of Patterns that dictate how notes of that type should be processed. This mapping informs the AI which Patterns to use based on the type it identifies or is provided with.
User-Defined Types: Users can create custom types that are meaningful to their workflows, along with descriptions and associated Patterns.
Type Identification: When a note is submitted, the AI uses the provided descriptions to determine the type of note, either through user specification or AI inference.
Pattern Derivation: Once the type is established, the corresponding Patterns are automatically applied to process the note accordingly.
Workflow with Types:
User Input: The user submits a note and optionally specifies a type.
Type Determination: If no type is specified, the LLM is prompted to infer the type based on the content and context, referencing the set of available types and their descriptions.
Pattern Application: The system retrieves the Patterns associated with the determined type and applies them to process the note.
Processing: The note is cleaned, metadata is extracted, and any type-specific modifications or summaries are applied.
Vector Database Interaction: The processed note, along with its metadata, is stored in the vector database, and the system ensures that the note is searchable and retrievable based on its content and metadata.
Example:
Let's say a user inputs a note about a recent meeting. The user doesn't specify a type. The LLM is then prompted to categorize the note, given the available types. The AI detects terms like "agenda," "minutes," and "action items," and classifies the note as a "Meeting Note."

The "Meeting Note" type has Patterns associated with extracting action items, summarizing decisions, and identifying participants. The AI processes the note accordingly and stores it in the vector database.

By structuring "Weave" to use types as directives for Pattern application, you streamline the process, making it more intuitive for users while maintaining flexibility and power. This approach also keeps the system scalable, as new types and Patterns can be added to evolve with user needs and workflows.
User
Brilliant. So we have a preprocess phase which determines the note type. 
Once we have the note type, we process the note by transforming the note or passing the note as is to the extraction part in the processing phase
Post process takes the note and stores it in a vector database which is all abstracted by llama index. It can also do things like send events like analytics etc.

I assume we would seperate the transformations and the extractions. Both as markdown templats that can then be supplied to the type. For instance if we take your meeting note example:

- Transformation - Re-write the note so it is concise
- Transformation - Restructure into Markdown format
- Extraction - Categorise
- Extraction - Extract people

The raw note is always included together with the transformation. I am trying to think if we need the extraction phase if this can always be done when retrieving the note.

ChatGPT
Your proposed structure for "Weave" is coherent and efficiently delineates the different stages of processing a note. The separation between transformations and extractions serves specific functions within the processing pipeline. Let's explore the roles of each phase and the necessity of extraction:

Preprocess Phase:
Note Type Determination: Analyzes the content to classify the type of note being processed. This phase is critical as it sets the context for how the subsequent phases will handle the note.
Processing Phase (Transformation & Extraction):
Transformation:
This involves modifying the note to enhance readability, coherence, or formatting. The transformations make the note more useful but do not necessarily add new information.
Examples: Rewriting for conciseness, restructuring into Markdown, correcting grammar, or standardizing terminology.
Extraction:
The extraction phase is about pulling structured data from the note. This structured data (metadata) can include categorization tags, named entities like people or dates, action items, and more.
While it's true that some extractions could be deferred until retrieval, having structured metadata stored alongside the raw and transformed notes offers several advantages:
Search Optimization: Metadata can significantly enhance the searchability of notes within the vector database, enabling complex queries.
Immediate Usability: When metadata is pre-extracted, the data is readily available for immediate use in various applications, without the need for on-the-fly extraction during retrieval, which can save time.
Data Relationships: Extracted metadata can help in establishing relationships between different notes, which can be useful for analytics, trend analysis, and recommendation systems.
Postprocess Phase:
Vector Database Storage: Stores the raw note, the transformed note, and the extracted metadata.
Event Triggering: Optionally sends out events like analytic data, update notifications, or triggers for other processes.
Advantages of Keeping the Extraction Phase:
Performance: By extracting metadata during the processing phase, you reduce the load on the retrieval process, which can be critical when dealing with large datasets or when performance is a concern.
User Experience: Users benefit from immediate access to metadata, such as when filtering notes by people mentioned or by categories, without additional processing time during retrieval.
Data Enrichment: Pre-extracted metadata allows for richer data analysis and the ability to feed that data into other systems or for other purposes like reporting, without the need to reprocess the raw notes.
In summary, while it's technically possible to extract metadata on retrieval, doing so during the initial processing phase prepares the notes for a wide range of uses and optimizes both the storage and retrieval processes. The metadata becomes a powerful tool in itself, serving as the foundation for many of the system's capabilities and enhancements.
User
Sorry I meant the Trasnformation phase. Do we need this? will this help with the extraction phase?

ChatGPT
The Transformation phase plays a vital role in the overall architecture of the "Weave" system. While it may seem like an additional step, its benefits contribute significantly to both the Extraction phase and the overall utility of the processed data. Here are a few points to consider:

Benefits of the Transformation Phase:
Improved Data Quality: Transforming the data before extraction ensures that the text is in the best possible form for extracting accurate and clean metadata. This can involve correcting errors, standardizing formats, and enhancing readability, which directly impacts the quality of the data that is extracted.
Efficient Extraction: Clean and well-structured text is easier and more efficient to process for metadata extraction. If the text is disorganized or contains errors, the extraction algorithms may produce less reliable results.
Customization: Transformation allows for the customization of the text to fit the context of its intended use. For example, converting notes into a standard format like Markdown can make it easier for users to understand and for other systems to process.
AI Understanding: AI models, including LLMs, often perform better with text that is well-structured and coherent. The Transformation phase can rearrange the text in a way that aligns with the AI's training, improving the results of both extraction and any AI-generated content.
Consistency: Applying a consistent structure to all notes within a category (e.g., all 'Meeting Notes' follow a specific template) can make it easier for users to find information and for the system to maintain consistency across similar types of notes.
Preparation for Use: Some transformations may be necessary to prepare the text for its end use, such as summarization or translation, which can be critical for users who need the information in a specific form.
Interplay Between Transformation and Extraction:
The relationship between transformation and extraction is symbiotic. Clean and structured text from the Transformation phase leads to more effective extraction of metadata. Conversely, knowing what metadata needs to be extracted can inform how the Transformation phase should structure the text. For instance, if extracting action items is a priority, the Transformation phase can ensure that action items are clearly delineated in the text.

Conclusion:
Although it may appear that the Transformation phase could be bypassed, its inclusion in the "Weave" system design adds value by enhancing the accuracy and utility of the Extraction phase and the overall quality of the stored data. This phase serves as the foundation for creating a standardized and high-quality dataset that can be efficiently indexed, searched, and utilized for various applications. It's an investment in the data lifecycle that pays dividends in the form of better data management and user experience.