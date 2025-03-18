# The Process

## Taxonomy of AI models

We categorise models based on the capabilities into 3 groups:

| **Category**          | **Model Examples**            | **Notable Capabilities**                        |
| --------------------- | ----------------------------- | ----------------------------------------------- |
| Reasoning Models      | o1, DeepSeek-R1, Claude 3.7   | Mathematical reasoning, logical inference       |
| Thinking Models       | o3-mini, Llama 2, Grok3       | General cognitive tasks, creativity             |
| Conversational Models | ChatGPT 4o, Claude 3.5, Grok2 | Dialogue, user intent understanding, lower cost |

## The Phases

There are 6 steps and each step should warrant a different type of model (taxonomy of models above).

Within each step, you can go through the same process of 4 actions:

1. **Iterate:** Share your project idea, requirements or output with AI and build a specification through iterative questioning. You can prompt AI to ask targeted questions to help develop detailed requirements.
2. **Question:** Review AI's requirements summary, identify gaps, and refine the specification through follow-up questions.
3. **Review/Create:** Review the generated code, understand it. When necessary, combine AI insights with your ideas to create a final spec in plain text format. If AI has presented 10 solutions, you come up with the 11th.
4. **Explain:** Present the specification to stakeholders/team members, emphasising its clear foundation and alignment with Unix principles (if applicable).

The phases are:

### 1. Conception

Share your idea with an conversational LLM like 4o or Claude 3.5. Use iterative questioning to develop a detailed specification. Question AI suggestions to ensure goal alignment, then blend AI insights with your ideas for a final spec. Be prepared to explain this foundation to stakeholders.

At the end of the conversation, get 4o to write a detailed spec in markdown, feeding in your additional insights you thought about after the interaction as you reviewed it.

File this into your repo as `SPEC.md`

### 2. Design and Architecture

Use a deep thinking model like o3 or Grok3 to design system architecture, exploring component breakdowns and design patterns. Question choices for scalability, then integrate the best ideas. Consider principles like KISS (Keep It Simple Stupid) and DOTADIW (Do One Thing And Do It Well).

Take some time to review your discussion and make a decision, explain your decision back to the model authoritatively (this is no longer a discussion).

Get the model to generate documentation in an ADR (Architecture Decision Record) in mardown, review it and amend if necessary. File it away in your repo as `ADR.md`

Get the AI to update [`SPEC.md`](SPEC.md) with latest architecture decision.

### 3. Planning

Use a deep thinking model like o3 or Grok3 to prepare an implementation plan, feed in your spec and ADR, explaining your process. Iterate, review and once happy, generate a prompt plan for the implementation. Make sure to tell the LLM that the build should be incremental and each prompt to build on top of the other. The prompts should be detailed and authoritative in tone, adding details like documentation references and function signatures within the prompts is preferable. These will be fed in to carefully considered output code and are not up for discussion. It is also useful to keep the prompts atomic so after each implementation step you can review and iterate without it being too big a step. Review and if necessary iterate over the list of prompts prepared by the AI.

### 4. Implementation

Use a reasoning or thinking model like Claude 3.7 or o3 for coding, feed in the prompts from your prompt plan one by one, iterating and reviewing at each step. Use a CLI tool like Aider or Claude Code, but delve into the code at each step as well and combine this with your own solutions. Generate and refine code through iteration. Question each line to avoid "AI spaghetti." Create final code by combining AI suggestions with your expertise, following the architecture principles you set out in your ADR. If you adapt the architecture through this process, don’t forget to update your ADR.

### 5. Testing

Plan tests with the same model used for implementation, or if you use a different model use a tool like `repomix` or simply use the `/init` command with Claude Code/Aider. Question AI suggestions to ensure comprehensive coverage. Create a final test suite that ensures quality and robustness.

### 6. Deployment

Plan deployment with o3 and generate scripts with o1. Question security aspects before finalising the process. Explain to operations teams (or your own team/colleagues) how it follows the principles you set out in your ADR.

### 7. Maintenance

Address bugs using o1 for reasoning and o3 for code. Question fixes to ensure integrity. Explain updates to stakeholders, highlighting how the workflow maintains control and follows principles set out in your ADR.
