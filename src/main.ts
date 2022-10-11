import * as core from '@actions/core'
import { DingdingRobot } from './robot'

const robot = new DingdingRobot();

async function run(): Promise<void> {
  try {
    const ret = await robot.sendMessage();
    core.setOutput('dinding response', ret);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
