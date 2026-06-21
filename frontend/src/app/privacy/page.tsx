"use client";

import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="container py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: January 1, 2025</p>
      </motion.div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including your name, email address,
            and profile information when you create an account. We also collect information about
            your usage of the Platform, including tools you view, bookmark, and compare.
          </p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Analyze usage patterns to improve user experience</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Sharing</h2>
          <p>
            We do not sell your personal information to third parties. We may share anonymized,
            aggregate data with partners for analytics purposes. We may disclose your information
            if required by law.
          </p>
        </section>

        <section>
          <h2>4. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our Platform
            and hold certain information. You can instruct your browser to refuse all cookies
            or to indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information.
            However, no method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time.
            You can do this through your account settings or by contacting us directly.
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            For privacy-related inquiries, please contact us at
            <a href="mailto:privacy@aitoolsdirectory.com"> privacy@aitoolsdirectory.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
