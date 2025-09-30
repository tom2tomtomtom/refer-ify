# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link "Refer-ify" [ref=e5] [cursor=pointer]:
          - /url: /
        - generic [ref=e7]:
          - img [ref=e8]
          - text: Founding Circle
      - navigation [ref=e10]:
        - link "Dashboard" [ref=e11] [cursor=pointer]:
          - /url: /founding
        - link "Network Growth" [ref=e12] [cursor=pointer]:
          - /url: /founding/network
        - link "Revenue" [active] [ref=e13] [cursor=pointer]:
          - /url: /founding/revenue
        - link "My Referrals" [ref=e14] [cursor=pointer]:
          - /url: /founding/referrals
        - link "Invite Members" [ref=e15] [cursor=pointer]:
          - /url: /founding/invite
        - link "Advisory" [ref=e16] [cursor=pointer]:
          - /url: /founding/advisory
        - button "Sign Out" [ref=e17]:
          - img [ref=e18]
          - text: Sign Out
      - link "View Network" [ref=e22] [cursor=pointer]:
        - /url: /founding/network
        - button "View Network" [ref=e23]
  - generic [ref=e24]:
    - heading "Revenue Dashboard" [level=1] [ref=e25]
    - paragraph [ref=e26]: Please sign in to view revenue analytics.
  - region "Notifications alt+T"
  - alert [ref=e27]: Refer-ify | Executive Recruitment Network
```