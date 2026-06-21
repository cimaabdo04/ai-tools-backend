"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, MessageSquare, Send, Loader2, CheckCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { api } from "@lib/api";

export default function ContactPage() {
  const t = useTranslations();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await api.post("/contact", { name, email, subject, message });
      setSuccess(true);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("contact.title")}</h1>
        <p className="text-lg text-muted-foreground">{t("contact.subtitle")}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {success ? (
            <div className="rounded-xl border bg-card p-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t("contact.success")}</h2>
              <p className="text-muted-foreground">{t("contact.successMessage")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t("contact.name")}</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t("contact.email")}</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contact.subject")}</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("contact.message")}</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                {t("contact.send")}
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-5">
            <Mail className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium text-sm mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">hello@aitoolsdirectory.com</p>
          </div>
          <div className="rounded-lg border p-5">
            <MessageSquare className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium text-sm mb-1">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Available 9 AM - 5 PM EST</p>
          </div>
          <div className="rounded-lg border p-5">
            <MapPin className="h-5 w-5 text-primary mb-2" />
            <h3 className="font-medium text-sm mb-1">Location</h3>
            <p className="text-sm text-muted-foreground">San Francisco, CA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
