# API README

## Overview

The API Package within The Giving Tree framework enables the exposure of agents and the orchestrator's functionalities via HTTP endpoints. It provides a structured approach to defining custom actions and interactions, allowing users and applications to engage with the underlying system through web-based interfaces. This package is essential for integrating The Giving Tree's capabilities into external applications or services, offering a gateway for programmatically managing knowledge and interacting with AI systems.

## Key Features

- **Custom Endpoint Definitions**: Allows for the creation of specific endpoints tailored to the needs of various agents and orchestrator functionalities.
- **Seamless Integration**: Facilitates the integration of The Giving Tree's features into web applications, mobile apps, and other systems that can consume web services.
- **Express.js Framework**: Leverages the Express.js framework for setting up a server and defining routes, ensuring ease of use and flexibility in API design.
- **Environment Configuration**: Supports environment-specific configurations, including API keys and model parameters, ensuring secure and adaptable setup.

## Example Usage

An example of setting up an endpoint to interact with a Prompt Agent might involve:

1. **Initializing the Store**: Set up and initialize the store with the necessary configuration.
2. **Creating the Agent**: Utilize the store to create an instance of the Prompt Agent.
3. **Defining the Endpoint**: Create a route (e.g., `/capabilities`) that handles incoming GET requests and interacts with the agent to perform specific actions, such as retrieving the agent's capabilities.
4. **Starting the Server**: Configure the server to run on a specified port, especially during development, to test and interact with the defined endpoints.

```javascript
const express = require('express');
const app = express();

// Initialize the environment and configurations
const config = {
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL
};

// Example endpoint to interact with a Prompt Agent
app.get('/capabilities', async (req, res) => {
  const store = await initialize<PromptMetadata>('test', config);
  const agent = createPromptAgent(store, config);
  const result = agent.processQuery('Please find the first prompt about summarizing content');
  res.send(result);
});

// Start the server for local development
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
```

## Getting Started

To get started with the API Package:

1. **Familiarize with Express.js**: If you're new to Express.js, go through its documentation to understand the basics of setting up a server and defining routes.
2. **Define Your Endpoints**: Consider the interactions you need to support and define corresponding endpoints, ensuring they align with the capabilities of your agents and orchestrator.
3. **Configure Your Environment**: Set up your environment variables, including API keys and other configuration details, to ensure your API can interact with external services securely.
4. **Test and Iterate**: Run your server, test the defined endpoints, and iterate based on feedback and requirements.

## Using localtunnel for Easy Testing

For developers looking to test Custom GPT actions with real-time interaction without deploying their server, localtunnel offers an efficient solution. localtunnel allows you to expose your local development server to the internet, making it accessible via a public URL. 

You can get started using the following commands:

```
npm run build 
npm run start
npm run localTunnel
```

## Conclusion

The API Package is a pivotal component of The Giving Tree framework, enabling web-based interactions with the core functionalities of agents and the orchestrator. It opens up possibilities for extending and integrating The Giving Tree's capabilities into a wide range of applications, fostering a more connected and interactive AI-enhanced ecosystem.