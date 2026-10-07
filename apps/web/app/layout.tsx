import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PRReviewPilot — Production AI Code Review for GitHub & Bitbucket',
  description: 'Automate code reviews, detect security vulnerabilities, and streamline PR approvals across GitHub and Bitbucket Cloud.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
