import { getPageContent } from './content';

// Agent 1 keeps the original content id ('agent'); the others are 'agent2' to 'agent4'.
export const AGENT_IDS = ['agent', 'agent2', 'agent3', 'agent4'];

// Agents shown on the website. An agent with an empty name is hidden.
export async function getAgents() {
  const list = await Promise.all(AGENT_IDS.map((id) => getPageContent(id)));
  return list
    .map((a, i) => ({ ...a, id: AGENT_IDS[i], number: i + 1, anchor: `agent-${i + 1}` }))
    .filter((a) => a.name);
}

// Licences from every agent, without repeats (FIFA licence listed once, etc.).
export const agencyCredentials = (agents) => [...new Set(agents.flatMap((a) => a.credentials))];

// ["A", "B", "C"] -> "A, B & C"
export const joinNames = (names) => (names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`);
