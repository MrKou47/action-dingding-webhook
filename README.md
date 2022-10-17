# GitHub Action for Dingding Incoming Webhook

## Feature

- Send a message using Incoming Webhooks on Dingding App

## Usage

### 1. Create a custom Dingding robot

Before all, we should get `secret` and `access_token`

![image](https://user-images.githubusercontent.com/13513747/196043144-250709b6-c6cb-45b8-9ef0-263d2a371ae1.png)

![image](https://user-images.githubusercontent.com/13513747/196043245-06279722-0266-45e4-b848-61233eddfa1d.png)

### 2. Create Github Action Secret

Second, create action secret in `Settings > Secrets > Actions` page.

**If you just want push message to one group:**

create `DINGDING_SECRET` and `DINGDING_ACCESS_TOKEN` secret.

**If you want push message to multiple groups:**

create `DINGDING_SECRET_TOKEN_MAP` like this:

```json
{
  "group1": {
    "secret": "GROUP1_SECRET_FROM_DINGDING",
    "access_token": "GROUP1_ACCESS_TOKEN_FROM_DINGDING"
  },
  "group2": {
    "secret": "GROUP2_SECRET_FROM_DINGDING",
    "access_token": "GROUP2_ACCESS_TOKEN_FROM_DINGDING"
  }
}
```

### 3. Use this action in github action.yml

```yaml
- name: Dingding Notification
  uses: mrkou47/action-dingding-incoming-webhook@main
  env:
    DINGDING_SECRET: ${{ secrets.DINGDING_SECRET }}
    DINGDING_ACCESS_TOKEN: ${{ secrets.DINGDING_ACCESS_TOKEN }}
    DINGDING_SECRET_TOKEN_MAP: ${{ secrets.DINGDING_SECRET_TOKEN_MAP }}
  with:
    title: Hello
    text: Hello, dingding!
```
