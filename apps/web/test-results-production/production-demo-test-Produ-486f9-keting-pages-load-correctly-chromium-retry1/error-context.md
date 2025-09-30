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
        - link "Sign In" [ref=e11] [cursor=pointer]:
          - /url: /login
      - link "Request Invitation" [ref=e13] [cursor=pointer]:
        - /url: /apply
        - button "Request Invitation" [ref=e14]
  - generic [ref=e17]:
    - img [ref=e19]
    - heading "Something went wrong" [level=2] [ref=e21]
    - paragraph [ref=e22]: We're experiencing a temporary issue. Please try again.
    - generic [ref=e23]:
      - button "Try again" [ref=e24]
      - button "Go home" [ref=e25]
  - region "Notifications alt+T"
  - alert [ref=e26]
```