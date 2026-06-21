"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogContent } from "@components/ui/dialog";
import { EmptyState } from "@components/common/empty-state";
import { cn, formatRelativeDate } from "@lib/utils";
import { MessageSquare, Send, Plus, Search, ArrowLeft } from "lucide-react";

const messageSchema = z.object({
  subject: z.string().min(3, "Subject is required").max(200),
  content: z.string().min(1, "Message is required").max(5000),
});

type MessageForm = z.infer<typeof messageSchema>;

interface Conversation {
  id: string;
  withUser: string;
  withUserAvatar: string | null;
  lastMessage: string;
  lastMessageDate: string;
  unread: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const mockConversations: Conversation[] = [
  {
    id: "conv-1", withUser: "Admin Team", withUserAvatar: null,
    lastMessage: "Your tool has been reviewed and approved. Congratulations!", lastMessageDate: new Date(Date.now() - 3600000).toISOString(),
    unread: true,
    messages: [
      { id: "m1", senderId: "them", content: "Thank you for submitting your tool to our directory.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: "m2", senderId: "me", content: "Thank you! I'm excited to have it listed.", createdAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString() },
      { id: "m3", senderId: "them", content: "Your tool has been reviewed and approved. Congratulations!", createdAt: new Date(Date.now() - 3600000).toISOString() },
    ],
  },
  {
    id: "conv-2", withUser: "Sarah Chen", withUserAvatar: null,
    lastMessage: "Thanks for the recommendation! I'll check it out.", lastMessageDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    unread: false,
    messages: [
      { id: "m4", senderId: "them", content: "Hey! Have you tried any good AI writing tools lately?", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: "m5", senderId: "me", content: "Yes! I highly recommend Jasper AI for content creation.", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: "m6", senderId: "them", content: "Thanks for the recommendation! I'll check it out.", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
  },
];

export default function MessagesPage() {
  const t = useTranslations();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newMessageDialog, setNewMessageDialog] = useState(false);
  const [replyText, setReplyText] = useState("");

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: { subject: "", content: "" },
  });

  const selected = conversations.find((c) => c.id === selectedConv);
  const filtered = conversations.filter((c) =>
    (c.withUser ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedConv) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== selectedConv) return c;
        const newMsg: Message = {
          id: `m${Date.now()}`,
          senderId: "me",
          content: replyText.trim(),
          createdAt: new Date().toISOString(),
        };
        return {
          ...c,
          lastMessage: replyText.trim(),
          lastMessageDate: new Date().toISOString(),
          unread: false,
          messages: [...c.messages, newMsg],
        };
      })
    );
    setReplyText("");
  };

  const handleNewMessage = (data: MessageForm) => {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      withUser: "Support",
      withUserAvatar: null,
      lastMessage: data.content,
      lastMessageDate: new Date().toISOString(),
      unread: false,
      messages: [{ id: `m${Date.now()}`, senderId: "me", content: data.content, createdAt: new Date().toISOString() }],
    };
    setConversations((prev) => [newConv, ...prev]);
    setNewMessageDialog(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with other users and admins</p>
        </div>
        <Button onClick={() => setNewMessageDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />New Message
        </Button>
      </div>

      <Dialog open={newMessageDialog} onOpenChange={setNewMessageDialog}>
        <DialogContent title="New Message">
          <form onSubmit={form.handleSubmit(handleNewMessage)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">To</label>
              <Input placeholder="Search users..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Input {...form.register("subject")} error={form.formState.errors.subject?.message} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message</label>
              <Textarea {...form.register("content")} rows={5} error={form.formState.errors.content?.message} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setNewMessageDialog(false)}>Cancel</Button>
              <Button type="submit"><Send className="h-4 w-4 mr-2" />Send</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-0 lg:grid-cols-3 border rounded-lg overflow-hidden min-h-[500px]">
        <div className="lg:col-span-1 border-r bg-card">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" placeholder="Search conversations..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm"
              />
            </div>
          </div>
          <div className="divide-y overflow-y-auto max-h-[600px]">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">No conversations</div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { setSelectedConv(conv.id); setConversations((prev) => prev.map((c) => c.id === conv.id ? { ...c, unread: false } : c)); }}
                  className={cn(
                    "w-full text-left p-3 hover:bg-accent transition-colors",
                    selectedConv === conv.id && "bg-accent",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                      {conv.withUser.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm truncate", conv.unread && "font-semibold")}>{conv.withUser}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{formatRelativeDate(conv.lastMessageDate)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                    {conv.unread && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Select a conversation</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose a conversation from the left to start reading</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setSelectedConv(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {selected.withUser.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{selected.withUser}</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.senderId === "me" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                        msg.senderId === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className={cn("text-xs mt-1", msg.senderId === "me" ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                        {formatRelativeDate(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                  placeholder="Type a message..."
                  className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button size="icon" onClick={handleSendReply} disabled={!replyText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
