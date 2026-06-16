import { Template, defaultBuildLogger } from 'e2b'
import { template } from './template'

async function main() {
  await Template.build(template, 'coden_agent', {
    cpuCount: 1,
    memoryMB: 1024,
    skipCache: true,
    onBuildLogs: defaultBuildLogger(),
  });
}

main().catch(console.error);