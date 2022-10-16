import { createHmac } from 'crypto'
import fetch from 'node-fetch'
import * as core from '@actions/core'

interface IDingDingResponse {
  errcode: number;
  errmsg: string;
}

type ISecretTokenCouple = Record<string, { secret: string, access_token: string }>;

class DingdingRobot {
  secret = '';
  access_token = '';

  secretTokenCouple: ISecretTokenCouple = {};
  withTitle = false;
  mode: "single" | "multiple" = "single";

  constructor() {
    const DINGDING_SECRET = process.env['DINGDING_SECRET'] as string; 
    const DINGDING_ACCESS_TOKEN = process.env['DINGDING_ACCESS_TOKEN'] as string;
    const DINGDING_SECRET_TOKEN_MAP = process.env['DINGDING_SECRET_TOKEN_MAP'];
    this.withTitle = core.getBooleanInput('withTitle');

    this.secret = DINGDING_SECRET;
    this.access_token = DINGDING_ACCESS_TOKEN;

    try {
      if (DINGDING_SECRET_TOKEN_MAP) {
        this.secretTokenCouple = JSON.parse(DINGDING_SECRET_TOKEN_MAP)
      }
      this.mode = "multiple";
    } catch (error) {
      console.log(error);
      throw new Error('Parse DINGDING_SECRET_TOKEN_MAP failed.')
    }
  }

  private genSign(secret: string) {
    const timestamp = `${Date.now()}`;
    const mac = createHmac('sha256', secret);
    mac.update(timestamp + '\n' + secret);
    const sign = encodeURIComponent(mac.digest('base64'));
    return {
      timestamp,
      sign,
    }
  }

  private genUrl(access_token: string, secret: string) {
    const { timestamp, sign } = this.genSign(secret);
    const url = new URL('https://oapi.dingtalk.com/robot/send');
    url.searchParams.append('access_token', access_token);
    url.searchParams.append('timestamp', `${timestamp}`);
    url.searchParams.append('sign', sign);
    return url.toString();
  }

  private formatBody(body: string) {
    return body.replace('\r\n' , ' \n \n ');
  }


  genMessage() {
    const title = core.getInput('title') || 'Title';
    let text = core.getInput('text');

    const message = {
      msgtype: "markdown",
      markdown: {
        title,
        text,
      }
    }

    const stringified = JSON.stringify(message, (k, v) => {
      if (k === 'text') {
        return `# ${title} \r\n ${JSON.parse(v)}`
      };
      return v;
    })
    const formated = this.formatBody(stringified);

    console.log('formated', formated);

    return formated;
  }

  async sendMessage() {
    const message = this.genMessage();
    const { mode } = this;
    if (mode === 'multiple') {
      const ret = await this.batchSendMessage(message);
      return ret;
    }
    return this.sendSingleMessage(message);
  }

  async sendSingleMessage(message: string) {
    const url = this.genUrl(this.access_token, this.secret);
    return this.request(url, message);
  }

  async batchSendMessage(message: string) {
    const { secretTokenCouple } = this;
    const keys = Object.keys(secretTokenCouple);
    return Promise.all(
      keys.map((k) => this.request(
        this.genUrl(secretTokenCouple[k].access_token, secretTokenCouple[k].secret), 
        message
      ))
    )
  }

  async request(url: string, message: string) {
    const ret = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: message
    })
    const json = await ret.json();
    console.log('json', json);
    core.setOutput('response: ', json);
    return json;
  }

}

export {
  DingdingRobot
};