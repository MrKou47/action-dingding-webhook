import { createHmac } from 'crypto'
import fetch from 'node-fetch'
import * as core from '@actions/core'

interface IDingDingResponse {
  errcode: number;
  errmsg: string;
}

class DingdingRobot {
  secret: string = ''
  access_token: string = ''

  constructor() {
    if (!process.env['DINGDING_SECRET']) {
      throw new Error('Missing DINGDING_SECRET environment variable')
    }
    if (!process.env['DINGDING_ACCESS_TOKEN']) {
      throw new Error('Missing DINGDING_ACCESS_TOKEN environment variable')
    }

    this.secret = process.env['DINGDING_SECRET'];
    this.access_token = process.env['DINGDING_ACCESS_TOKEN'];
  }

  private genSign() {
    const { secret } = this;
    const timestamp = `${Date.now()}`;
    const mac = createHmac('sha256', secret);
    mac.update(timestamp + '\n' + secret);
    const sign = encodeURIComponent(mac.digest('base64'));
    return {
      timestamp,
      sign,
    }
  }

  private genUrl() {
    const { access_token } = this;
    const { timestamp, sign } = this.genSign();
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
    const inputText = core.getInput('text');
    const message = {
      msgtype: "markdown",
      markdown: {
        title: core.getInput('title') || 'Title',
        text: inputText,
      }
    }
    console.log('message send to dingding', message);
    const stringified = JSON.stringify(message, (k, v) => {
      if (k === 'text') {
        return JSON.parse(v)
      };
      return v;
    })
    console.log('stringified', stringified);
    const formated = this.formatBody(stringified);
    console.log('formated', formated);

    return formated;
  }

  async sendMessage() {
    const message = this.genMessage();
    const url = this.genUrl();
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