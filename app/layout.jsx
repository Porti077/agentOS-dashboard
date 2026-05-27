// app/layout.jsx
// Root layout — sets global styles and meta

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.7.0/dist/tabler-icons.min.css"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0a0c10" }}>
        {children}
      </body>
    </html>
  );
}
