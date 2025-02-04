// app/layout.tsx
import '@fontsource-variable/source-sans-3';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { NarrativesProvider } from '@/context/NarrativesContext';
import { ChatProvider } from '@/context/ChatContext';
import { MetricsProvider } from '@/context/MetricsContext';
import { AgentsProvider } from '@/context/AgentsContext';

export const metadata = {
  title: 'Othor AI',
  description: 'Business Analytics Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AgentsProvider>
              <NarrativesProvider>
                <MetricsProvider>
                  <ChatProvider>
                    {children}
                  </ChatProvider>
                </MetricsProvider>
              </NarrativesProvider>
            </AgentsProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}