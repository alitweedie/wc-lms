export const metadata = { title: "WC 2026 Last Man Standing" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}
