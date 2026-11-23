# @thermal-label/niimbot-web

> **Status: pre-alpha scaffold.**

Browser driver (Web Bluetooth, Web Serial) for NIIMBOT label printers. Not implemented yet: today it re-exports `@thermal-label/niimbot-core`.

See the [repository README](https://github.com/thermal-label/niimbot#readme)
and the [design](https://github.com/thermal-label/niimbot/blob/main/plans/design.md).

## Supported hardware

<!-- HARDWARE_TABLE:START -->
**77 devices** — 0 verified · 0 partial · 0 expected · 0 unsupported · 77 unverified

| Model | Key | Print task | Transports | Status |
| --- | --- | --- | --- | --- |
| [NIIMBOT A1 PRO](https://thermal-label.github.io/hardware/niimbot/a1-pro) | `A1_PRO` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT A8](https://thermal-label.github.io/hardware/niimbot/a8) | `A8` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT A8 P](https://thermal-label.github.io/hardware/niimbot/a8-p) | `A8_P` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT A20](https://thermal-label.github.io/hardware/niimbot/a20) | `A20` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT A63](https://thermal-label.github.io/hardware/niimbot/a63) | `A63` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT A203](https://thermal-label.github.io/hardware/niimbot/a203) | `A203` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B1](https://thermal-label.github.io/hardware/niimbot/b1) | `B1` | B1 | BT LE, Serial | ⏳ unverified |
| [NIIMBOT B1 PRO](https://thermal-label.github.io/hardware/niimbot/b1-pro) | `B1_PRO` | D110M_V4 | BT LE | ⏳ unverified |
| [NIIMBOT B1 SE](https://thermal-label.github.io/hardware/niimbot/b1-se) | `B1_SE` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B2](https://thermal-label.github.io/hardware/niimbot/b2) | `B2` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B2 Pro](https://thermal-label.github.io/hardware/niimbot/b2-pro) | `B2_PRO` | auto (protocol ≥ 4) | BT LE, Serial | ⏳ unverified |
| [NIIMBOT B3](https://thermal-label.github.io/hardware/niimbot/b3) | `B3` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B3S](https://thermal-label.github.io/hardware/niimbot/b3s) | `B3S` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B3S A](https://thermal-label.github.io/hardware/niimbot/b3s-a) | `B3S_A` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B3S P](https://thermal-label.github.io/hardware/niimbot/b3s-p) | `B3S_P` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B4](https://thermal-label.github.io/hardware/niimbot/b4) | `B4` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B4 PRO](https://thermal-label.github.io/hardware/niimbot/b4-pro) | `B4_PRO` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B11](https://thermal-label.github.io/hardware/niimbot/b11) | `B11` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B16](https://thermal-label.github.io/hardware/niimbot/b16) | `B16` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B18](https://thermal-label.github.io/hardware/niimbot/b18) | `B18` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B18S](https://thermal-label.github.io/hardware/niimbot/b18s) | `B18S` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B21](https://thermal-label.github.io/hardware/niimbot/b21) | `B21` | B21_V1 | BT LE | ⏳ unverified |
| [NIIMBOT B21 C2B](https://thermal-label.github.io/hardware/niimbot/b21-c2b) | `B21_C2B` | B1 | BT LE | ⏳ unverified |
| [NIIMBOT B21 L2B](https://thermal-label.github.io/hardware/niimbot/b21-l2b) | `B21_L2B` | B21_L2B | BT LE | ⏳ unverified |
| [NIIMBOT B21 Pro](https://thermal-label.github.io/hardware/niimbot/b21-pro) | `B21_PRO` | D110M_V4 | BT LE | ⏳ unverified |
| [NIIMBOT B21S](https://thermal-label.github.io/hardware/niimbot/b21s) | `B21S` | D110 | BT LE | ⏳ unverified |
| [NIIMBOT B21S C2B](https://thermal-label.github.io/hardware/niimbot/b21s-c2b) | `B21S_C2B` | D110 | BT LE | ⏳ unverified |
| [NIIMBOT B31](https://thermal-label.github.io/hardware/niimbot/b31) | `B31` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B32](https://thermal-label.github.io/hardware/niimbot/b32) | `B32` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B32R](https://thermal-label.github.io/hardware/niimbot/b32r) | `B32R` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B50](https://thermal-label.github.io/hardware/niimbot/b50) | `B50` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B50W](https://thermal-label.github.io/hardware/niimbot/b50w) | `B50W` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT B203](https://thermal-label.github.io/hardware/niimbot/b203) | `B203` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT BETTY](https://thermal-label.github.io/hardware/niimbot/betty) | `BETTY` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT C1](https://thermal-label.github.io/hardware/niimbot/c1) | `C1` | D110M_V4 | BT LE | ⏳ unverified |
| [NIIMBOT D11](https://thermal-label.github.io/hardware/niimbot/d11) | `D11` | D11_V1 | BT LE, Serial | ⏳ unverified |
| [NIIMBOT D11 H](https://thermal-label.github.io/hardware/niimbot/d11-h) | `D11_H` | D110M_V4 | BT LE | ⏳ unverified |
| [NIIMBOT D11 PRO](https://thermal-label.github.io/hardware/niimbot/d11-pro) | `D11_PRO` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT D11S](https://thermal-label.github.io/hardware/niimbot/d11s) | `D11S` | D11_V1 | BT LE | ⏳ unverified |
| [NIIMBOT D101](https://thermal-label.github.io/hardware/niimbot/d101) | `D101` | B1 | BT LE | ⏳ unverified |
| [NIIMBOT D110](https://thermal-label.github.io/hardware/niimbot/d110) | `D110` | D110 | BT LE, Serial | ⏳ unverified |
| [NIIMBOT D110M](https://thermal-label.github.io/hardware/niimbot/d110-m) | `D110_M` | B1 | BT LE, Serial | ⏳ unverified |
| [NIIMBOT EP1C](https://thermal-label.github.io/hardware/niimbot/ep1c) | `EP1C` | D110M_V4 | BT LE | ⏳ unverified |
| [NIIMBOT EP2M H](https://thermal-label.github.io/hardware/niimbot/ep2m-h) | `EP2M_H` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT EP3M](https://thermal-label.github.io/hardware/niimbot/ep3m) | `EP3M` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT ET10](https://thermal-label.github.io/hardware/niimbot/et10) | `ET10` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT FUST](https://thermal-label.github.io/hardware/niimbot/fust) | `FUST` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT H1](https://thermal-label.github.io/hardware/niimbot/h1) | `H1` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT H1S](https://thermal-label.github.io/hardware/niimbot/h1s) | `H1S` | H1S | BT LE | ⏳ unverified |
| [NIIMBOT HI D110](https://thermal-label.github.io/hardware/niimbot/hi-d110) | `HI_D110` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT HI NB D11](https://thermal-label.github.io/hardware/niimbot/hi-nb-d11) | `HI_NB_D11` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT JC M90](https://thermal-label.github.io/hardware/niimbot/jc-m90) | `JC_M90` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT JCB3S](https://thermal-label.github.io/hardware/niimbot/jcb3s) | `JCB3S` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT K2](https://thermal-label.github.io/hardware/niimbot/k2) | `K2` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT K3](https://thermal-label.github.io/hardware/niimbot/k3) | `K3` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT K3 ITD](https://thermal-label.github.io/hardware/niimbot/k3-itd) | `K3_ITD` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT K3 W](https://thermal-label.github.io/hardware/niimbot/k3-w) | `K3_W` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT K4](https://thermal-label.github.io/hardware/niimbot/k4) | `K4` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT M2 H](https://thermal-label.github.io/hardware/niimbot/m2-h) | `M2_H` | B1 | BT LE | ⏳ unverified |
| [NIIMBOT M3](https://thermal-label.github.io/hardware/niimbot/m3) | `M3` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT MP3K](https://thermal-label.github.io/hardware/niimbot/mp3k) | `MP3K` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT MP3K W](https://thermal-label.github.io/hardware/niimbot/mp3k-w) | `MP3K_W` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT N1](https://thermal-label.github.io/hardware/niimbot/n1) | `N1` | B1 | BT LE | ⏳ unverified |
| [NIIMBOT P1](https://thermal-label.github.io/hardware/niimbot/p1) | `P1` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT P1S](https://thermal-label.github.io/hardware/niimbot/p1s) | `P1S` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT P18](https://thermal-label.github.io/hardware/niimbot/p18) | `P18` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT S1](https://thermal-label.github.io/hardware/niimbot/s1) | `S1` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT S3](https://thermal-label.github.io/hardware/niimbot/s3) | `S3` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT S6](https://thermal-label.github.io/hardware/niimbot/s6) | `S6` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT S6 P](https://thermal-label.github.io/hardware/niimbot/s6-p) | `S6_P` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT T2S](https://thermal-label.github.io/hardware/niimbot/t2s) | `T2S` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT T6](https://thermal-label.github.io/hardware/niimbot/t6) | `T6` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT T7](https://thermal-label.github.io/hardware/niimbot/t7) | `T7` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT T8](https://thermal-label.github.io/hardware/niimbot/t8) | `T8` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT T8S](https://thermal-label.github.io/hardware/niimbot/t8s) | `T8S` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT TP2M H](https://thermal-label.github.io/hardware/niimbot/tp2m-h) | `TP2M_H` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |
| [NIIMBOT Z401](https://thermal-label.github.io/hardware/niimbot/z401) | `Z401` | auto (protocol ≥ 4) | BT LE | ⏳ unverified |

Click any model to open its detail page on the docs site, where engines, supported media, and verification reports live. The same data backs the [interactive cross-driver table](https://thermal-label.github.io/hardware/).
<!-- HARDWARE_TABLE:END -->

## License

MIT
