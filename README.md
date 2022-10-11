# GitHub Action for Dingding Incoming Webhook

## Feature

- Send a message using Incoming Webhooks on Dingding App

## Usage

```yaml
- name: Dingding Notification
  uses: mrkou47/action-dingding-incoming-webhook@main
  env:
    DINGDING_SECRET: ${{ secrets.DINGDING_SECRET }}
    DINGDING_ACCESS_TOKEN: ${{ secrets.DINGDING_ACCESS_TOKEN }}
  with:
    title: Hello
    text: Hello, dingding!
```
