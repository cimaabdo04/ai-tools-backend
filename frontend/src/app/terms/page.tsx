"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="container py-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: January 1, 2025</p>
      </motion.div>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using AI Tools Directory (&ldquo;the Platform&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, please do not use the Platform.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            AI Tools Directory is a platform that allows users to discover, compare, and review AI tools.
            Users can browse tools, submit new tools, write reviews, bookmark favorites, and compare
            tools side by side.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>As a user of the Platform, you agree to:</p>
          <ul>
            <li>Provide accurate and truthful information when creating an account</li>
            <li>Not submit false or misleading reviews or tool listings</li>
            <li>Not engage in spam, harassment, or other abusive behavior</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2>4. Content Ownership</h2>
          <p>
            Users retain ownership of the content they submit. By submitting content, you grant
            AI Tools Directory a non-exclusive, royalty-free license to display and distribute
            your content on the Platform.
          </p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>
            AI Tools Directory provides the Platform &ldquo;as is&rdquo; without any warranty.
            We are not responsible for the accuracy of tool listings or reviews submitted by users.
            We shall not be liable for any damages arising from your use of the Platform.
          </p>
        </section>

        <section>
          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Users will be notified of
            material changes via email or through the Platform.
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            For questions about these terms, please contact us at
            <a href="mailto:legal@aitoolsdirectory.com"> legal@aitoolsdirectory.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
