# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "Refer-ify" [ref=e5] [cursor=pointer]:
        - /url: /
      - navigation [ref=e6]:
        - link "How It Works" [ref=e7] [cursor=pointer]:
          - /url: /how-it-works
        - link "For Companies" [ref=e8] [cursor=pointer]:
          - /url: /for-companies
        - link "Join Network" [ref=e9] [cursor=pointer]:
          - /url: /join-network
        - link "About" [ref=e10] [cursor=pointer]:
          - /url: /about
        - button "Sign Out" [ref=e11]:
          - img [ref=e12]
          - text: Sign Out
      - link "Request Invitation" [ref=e17] [cursor=pointer]:
        - /url: /apply
        - button "Request Invitation" [ref=e18]
  - generic [ref=e20]:
    - heading "404" [level=1] [ref=e21]
    - heading "This page could not be found." [level=2] [ref=e23]
  - button "DEV" [ref=e25]
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e31] [cursor=pointer]:
    - img [ref=e32] [cursor=pointer]
  - alert [ref=e36]
```