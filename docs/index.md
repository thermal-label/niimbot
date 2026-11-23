---
layout: home

hero:
  name: '@thermal-label/niimbot'
  text: NIIMBOT label printing, built on niimbluelib
  tagline: D11, D110, B1, B21, B2 Pro and the rest of the NIIMBOT range — over Bluetooth LE and USB serial, from Node.js or the browser, in TypeScript. Pre-alpha.
  actions:
    - theme: brand
      text: Get started
      link: /getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/thermal-label/niimbot

features:
  - icon: 🧩
    title: Built on niimbluelib
    details: niimbluelib speaks the NIIMBOT protocol. This driver adds the thermal-label adapter, connections, device registry, media catalog and preview.
    link: /protocol/
    linkText: About the protocol
  - icon: 🌐
    title: Browser first
    details: Web Bluetooth and Web Serial through @thermal-label/transport. One requestPrinters() call, identification from the printer's own model ID.
    link: /web
    linkText: Web guide
  - icon: 🟢
    title: Node.js
    details: USB serial at 115200 baud through @thermal-label/transport.
    link: /node
    linkText: Node.js guide
---
