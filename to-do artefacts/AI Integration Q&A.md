# **AI Integration Documentation \- Todo App (BMAD Project)**

**Date:** March 2026 

**Project:** Full-Stack Todo Application using BMAD v6

---

## **Overview**

For context the approach followed was to take the least technical approach as possible, reflecting my own experience and to understand how feasible it would be to utilise BMAD in this approach. This was done by staying entirely within the Claude ecosystem, using Claude Chat for all planning phases and Claude Code for implementation. The only step that required leaving the Claude ecosystem was downloading Docker Desktop.

This approach was deliberately chosen as a non-technical user with next to no recent coding experience. The goal was to validate whether a complete, tested, and deployable application could be built using AI assistance alone, without requiring deep technical knowledge at any stage.

---

## **1\. Agent Usage: Which tasks were completed with AI assistance? What prompts worked best?**

Where possible I attempted to keep as much of the flow in Claude Chat:

**Planning Phase \- Claude Chat:**

* PRD refinement using the PM persona (John)  
* UX specification using the UX Designer persona (Sally)  
* Technical architecture using the Architect persona (Winston)  
* Epics and stories creation using the PM persona  
* Implementation Readiness Check using the Architect persona

**Build Phase \-  Claude Code:**

* Development  
* Testing

During the Claude Code parts I frequently switch back to Claude Chat to validate the questions being asked or steps that were being take. 

ThClaude Chat produced a large volume of output — arguably too much for a simple Todo app. The quantity of text made it harder to validate quickly, particularly for a non-technical user. A more concise output mode for smaller projects would be beneficial.

---

## **2\. MCP Server Usage: Which MCP servers did you use? How did they help?**

No MCP servers were used during this project. This was consistent with the overall approach of staying entirely within the Claude ecosystem and minimising external tooling.

My understanding of where these might have been useful were during the validation and testing. I discussed this with Claude Code to understand if the requirements and acceptance criteria could be emt with Claude Code, which it informed me it would be possible. 

---

## **3\. Test Generation: How did AI assist in generating test cases? What did it miss?**

From a non-technical perspective, it is difficult to assess whether the tests themselves were the *right* tests or whether edge cases were missed. Some stats from Claude:

102 tests created across unit, integration and E2E

* 80.86% backend statement coverage (threshold: 70%)  
* 83.91% frontend statement coverage (threshold: 70%)  
* 12 Playwright E2E tests (minimum required: 5\)

I followed up on Accessibility testing to validate (as best I could) on whether it had done it correctly. The first round was passed by Claude Code, I returned to Claude Chat to identify a more extensive round of accessibility testing, which it provided me a prompt for, ran that in Claude Code an it passed. I appreciate this is like Claude marking it’s own homework, but

---

## **4\. Debugging with AI: Document cases where AI helped debug issues.**

Manual testing of the running application was carried out alongside the automated test suite. This confirmed the app functioned correctly from a user perspective. One visual spacing issue was identified through manual testing that automated tests had not caught, whereby the margin between the to do tasks and the section where you type in the new tasks was minimal to non-existent. Potentially this was fine, it was more of my preference to increase the gap.

---

## **5\. Limitations Encountered: What couldn't the AI do well? Where was human expertise critical?**

As a non-technical user, the most significant limitation encountered was the inability to critically evaluate the AI's output, really at any technical level. The Claude Code implementation phase was largely a series of acceptances, code was being written and tests were passing, but there was limited ability to assess whether the code was well written, whether the tests were meaningful, or whether anything important was being missed.

The AI's technical limitations are therefore difficult for me to have a valid stance on. 

I expect this falls into the wider limitations of AI-assisted development, like giving a gun to a child :D. 

That being said, the parts in Claude Chat are very useful to help validate my own thoughts and suggestions in terms of refining the scope and validating what is being replayed. It’s far more comprehensive then say using bolt loveable. 

### **No Multi-Agent Implementation in Claude Code**

By keeping entirely within the Claude ecosystem, the implementation phase ran as a single continuous process rather than using distinct specialised agents. This meant the full BMAD multi-agent vision, where separate Developer, QA, and DevOps agents hand off work between each other with genuine specialist insight,  was not realised in the build phase.

The planning phase did achieve BMAD agent handoffs through separate Claude Chat conversations for each persona. But the build phase collapsed multiple roles into one agent, losing the adversarial quality checking and specialist perspective that true multi-agent handoffs are designed to provide.

My understanding is this is possible if I was to use Cursor or something similar, however, given my focus of keeping it within Claude this was a notable limitation. 

