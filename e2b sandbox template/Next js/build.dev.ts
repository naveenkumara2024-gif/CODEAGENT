import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'
async function main() {
  await Template.build(template, 'coden_agent-dev-2', {
    cpuCount: 2,
    memoryMB: 1024,
    skipCache: true,
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);