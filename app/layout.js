export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SolarHues — Coming Soon</title>
        <link rel="preconnect" href="https://googleapis.com" />
        <link href="https://googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --ink: #1e293b;
            --ink-soft: #64748B;
            --paper: #F8FAFC;
            --slate: #1e293b;
            --sun: #facc15;
            --sun-dark: #EAB308;
            --emerald: #059669;
            --line: #E2E8F0;
          }
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; min-height: 100vh; background: var(--slate); color: #fff; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
          body::before {
            content: "";
            position: fixed; inset: -10%;
            background:
              radial-gradient(circle at 15% 20%, rgba(5,150,105,0.35), transparent 45%),
              radial-gradient(circle at 85% 15%, rgba(250,204,21,0.25), transparent 45%),
              radial-gradient(circle at 50% 90%, rgba(5,150,105,0.2), transparent 50%);
            filter: blur(60px);
            z-index: 0;
            pointer-events: none;
          }
          h1, h2, .display { font-family: 'Space Grotesk', sans-serif; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
          p { margin: 0; line-height: 1.6; }
          a { color: inherit; text-decoration: none; }
          .wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
          .top { display: flex; align-items: center; justify-content: space-between; padding: 28px 32px; }
          .brand { display: flex; align-items: center; gap: 9px; font-family: 'Space Grotesk'; font-weight: 700; font-size: 18px; text-decoration: none; }
          .hue-dots { display: flex; gap: 4px; }
          .hue-dots span { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
          .hue-dots span:nth-child(1) { background: var(--sun); }
          .hue-dots span:nth-child(2) { background: #fbbf24; }
          .hue-dots span:nth-child(3) { background: var(--emerald); }
          .pill-status { font-size: 12px; color: #CBD5E1; border: 1px solid rgba(255,255,255,0.18); padding: 5px 12px; border-radius: 20px; }
          .center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 24px; }
          .kicker { font-size: 12.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #94E4C2; margin-bottom: 18px; font-weight: bold; }
          h1 { font-size: 44px; line-height: 1.14; max-width: 640px; color: #fff; }
          h1 .hue { background: linear-gradient(90deg, var(--sun), var(--emerald)); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .sub { font-size: 16px; color: #CBD5E1; max-width: 480px; margin-top: 18px; line-height: 1.65; }
          .waitlist { margin-top: 36px; width: 100%; max-width: 420px; text-left: left; }
          .waitlist-row { display: flex; gap: 8px; }
          .waitlist input[type=email] { flex: 1; padding: 13px 16px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); color: #fff; font-size: 14px; }
          .waitlist input[type=email]::placeholder { color: #8FA0B5; }
          .waitlist input[type=email]:focus { outline: 2px solid var(--sun); outline-offset: 1px; }
          .waitlist button { padding: 13px 20px; border-radius: 9px; background: var(--sun); color: var(--slate); font-weight: 700; font-size: 14px; white-space: nowrap; cursor: pointer; border: none; transition: background 0.2s; }
          .waitlist button:hover { background: var(--sun-dark); }
          .waitlist button:disabled { opacity: 0.6; cursor: default; }
          .waitlist-note { font-size: 12.5px; color: #8FA0B5; margin-top: 10px; text-align: center; width: 100%; }
          .waitlist-msg { font-size: 13.5px; margin-top: 12px; font-weight: bold; text-align: center; }
          .waitlist-msg.ok { color: #6EE7B7; }
          .waitlist-msg.err { color: #FCA5A5; }
          .features { display: flex; gap: 28px; margin-top: 48px; flex-wrap: wrap; justify-content: center; max-width: 560px; }
          .features div { font-size: 13px; color: #94A3B8; display: flex; align-items: center; gap: 7px; font-weight: 500; }
          .features span.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sun); display: inline-block; }
          .bottom { padding: 26px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: #64748B; border-top: 1px solid rgba(255,255,255,0.05); width: 100%; }
          .footer-links { display: flex; gap: 16px; flex-wrap: wrap; }
          .footer-links a:hover { color: #fff; text-decoration: underline; }
          @media (max-width: 640px) {
            h1 { font-size: 30px; }
            .waitlist-row { flex-direction: column; }
            .waitlist button { width: 100%; }
            .features { gap: 16px 22px; }
            .top { padding: 20px; }
            .bottom { flex-direction: column; gap: 12px; padding: 20px; text-align: center; }
            .footer-links { justify-content: center; }
          }
        `}</style>
      </head>
      <body>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
