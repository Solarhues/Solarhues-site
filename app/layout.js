export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SolarHues</title>
        <link rel="preconnect" href="https://googleapis.com" />
        <link href="https://googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <script src="https://tailwindcss.com"></script>
      </head>
      <body className="bg-[#1e293b] antialiased m-0 p-0 text-white">
        {children}
      </body>
    </html>
  );
}
