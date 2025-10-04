#!/usr/bin/env node

/**
 * HuggingFace & Supabase Script Writer Agent Launcher
 *
 * This script demonstrates how to invoke the specialized agent
 * for writing HuggingFace and Supabase integration scripts.
 *
 * Usage:
 *   node agents/invoke-hf-supabase-agent.ts "Write a script to generate embeddings"
 */

const AGENT_PROMPT = `
You are a specialized HuggingFace & Supabase script writing agent.

Your responsibilities:
1. Use Context7 MCP to fetch latest documentation
2. Write production-ready, type-safe scripts
3. Follow official API patterns and best practices

When writing scripts:
- First resolve library IDs using mcp__context7__resolve-library-id
- Fetch documentation using mcp__context7__get-library-docs
- Write complete scripts with error handling
- Use TypeScript with proper types
- Include usage examples

Libraries you work with:
- @huggingface/inference (HuggingFace Inference API)
- @supabase/supabase-js (Supabase client)

Always fetch documentation FIRST, then write code based on official patterns.
`;

interface AgentRequest {
  task: string;
  context?: Record<string, unknown>;
}

interface AgentResponse {
  success: boolean;
  output?: string;
  error?: string;
}

async function invokeAgent(request: AgentRequest): Promise<AgentResponse> {
  console.log('🤖 Invoking HF-Supabase Script Writer Agent...');
  console.log('📋 Task:', request.task);
  console.log('');

  // In a real implementation, this would:
  // 1. Load the agent configuration from .claude/agents/hf-supabase-script-writer.json
  // 2. Initialize the agent with access to Context7 MCP tools
  // 3. Execute the task using the agent's workflow
  // 4. Return the generated script

  // For now, this is a template showing the agent invocation pattern
  console.log('Agent Prompt:');
  console.log(AGENT_PROMPT);
  console.log('');
  console.log('Task to execute:', request.task);

  return {
    success: true,
    output: 'Agent invocation template - integrate with Claude Code Agent SDK'
  };
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const task = process.argv[2];

  if (!task) {
    console.error('Usage: node invoke-hf-supabase-agent.ts "your task description"');
    console.error('');
    console.error('Examples:');
    console.error('  "Write a script to generate embeddings using HuggingFace"');
    console.error('  "Create a Supabase vector search function"');
    console.error('  "Write a batch embedding processor"');
    process.exit(1);
  }

  invokeAgent({ task })
    .then(response => {
      if (response.success) {
        console.log('\n✅ Success:');
        console.log(response.output);
      } else {
        console.error('\n❌ Error:');
        console.error(response.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

export { invokeAgent, AGENT_PROMPT };
export type { AgentRequest, AgentResponse };
