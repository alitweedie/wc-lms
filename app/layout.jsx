export const metadata = {
  title: "WC 2026 Last Man Standing",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LMS 2026",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{height:"100%"}}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="LMS 2026"/>
        <meta name="theme-color" content="#0e0f14"/>
      </head>
      <body style={{margin:0,background:"#0e0f14",height:"100%"}}>
        {children}
      </body>
    </html>
  );
}
