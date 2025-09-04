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
      - link "Request Invitation" [ref=e12] [cursor=pointer]:
        - /url: /apply
        - button "Request Invitation" [ref=e13]
  - generic [ref=e15]:
    - heading "404" [level=1] [ref=e16]
    - heading "This page could not be found." [level=2] [ref=e18]
  - region "Notifications alt+T"
  - alert [ref=e19]
```