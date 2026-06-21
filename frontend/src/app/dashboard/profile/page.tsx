"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Select } from "@components/ui/select";
import { useAuthStore } from "@stores/auth-store";
import { useUiStore } from "@stores/ui-store";
import { LOCALES, ROUTES } from "@lib/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@components/ui/avatar";
import { getInitials } from "@lib/utils";
import { User, Globe, AtSign, Link2, Trash2, AlertTriangle } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  bio: z.string().max(500).optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  locale: z.string(),
  timezone: z.string(),
});

const emailFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Must be at least 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[a-z]/, "Must contain lowercase").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

const socialSchema = z.object({
  twitter: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileFormSchema>;
type EmailForm = z.infer<typeof emailFormSchema>;
type PasswordForm = z.infer<typeof passwordFormSchema>;
type SocialForm = z.infer<typeof socialSchema>;

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai",
  "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland",
];

export default function ProfilePage() {
  const t = useTranslations();
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUiStore();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileFormSchema), defaultValues: { name: user?.name ?? "", username: "", bio: user?.bio ?? "", website: "", avatar: "", locale: "en", timezone: "UTC" } });
  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailFormSchema), defaultValues: { email: user?.email ?? "", currentPassword: "" } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordFormSchema) });
  const socialForm = useForm<SocialForm>({ resolver: zodResolver(socialSchema) });

  const onProfileSubmit = (data: ProfileForm) => {
    updateUser({ name: data.name, bio: data.bio });
    addToast({ type: "success", title: t("profile.updateSuccess") });
  };

  const onEmailSubmit = (data: EmailForm) => {
    addToast({ type: "success", title: "Email updated successfully" });
    emailForm.reset({ email: data.email, currentPassword: "" });
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    addToast({ type: "success", title: "Password changed successfully" });
    passwordForm.reset();
  };

  const onSocialSubmit = (data: SocialForm) => {
    addToast({ type: "success", title: "Social links updated" });
  };

  const handleDeleteAccount = () => {
    addToast({ type: "error", title: "Account deletion request submitted" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex items-center gap-4 p-6 rounded-lg border bg-card">
        <Avatar size="xl">
          {user?.avatar ? <AvatarImage src={user.avatar} alt={user?.name ?? ""} /> : null}
          <AvatarFallback>{user ? getInitials(user.name ?? "") : "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-semibold">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="text-xs text-muted-foreground mt-1">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
        </div>
      </div>

      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Personal Information</CardTitle>
            <CardDescription>Update your personal details and public profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("profile.name")}</label>
                <Input {...profileForm.register("name")} error={profileForm.formState.errors.name?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><AtSign className="h-3 w-3" /> Username</label>
                <Input {...profileForm.register("username")} error={profileForm.formState.errors.username?.message} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("profile.bio")}</label>
              <Textarea {...profileForm.register("bio")} rows={3} error={profileForm.formState.errors.bio?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Globe className="h-3 w-3" /> {t("profile.website")}</label>
                <Input {...profileForm.register("website")} placeholder="https://example.com" error={profileForm.formState.errors.website?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Link2 className="h-3 w-3" /> {t("profile.avatar")}</label>
                <Input {...profileForm.register("avatar")} placeholder="https://example.com/avatar.png" error={profileForm.formState.errors.avatar?.message} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Language</label>
                <Select {...profileForm.register("locale")} options={LOCALES.map((l) => ({ value: l.code, label: l.label }))} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Timezone</label>
                <Select {...profileForm.register("timezone")} options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))} />
              </div>
            </div>
          </CardContent>
          <CardContent className="border-t pt-6">
            <Button type="submit" disabled={profileForm.formState.isSubmitting}>
              {profileForm.formState.isSubmitting ? t("common.saving") : t("common.save")}
            </Button>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Change your email address. You will need to confirm the new email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input {...emailForm.register("email")} type="email" error={emailForm.formState.errors.email?.message} />
            <div>
              <label className="text-sm font-medium mb-1 block">Current password</label>
              <Input {...emailForm.register("currentPassword")} type="password" error={emailForm.formState.errors.currentPassword?.message} />
            </div>
          </CardContent>
          <CardContent className="border-t pt-6">
            <Button type="submit">{t("common.save")}</Button>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Ensure your account is using a strong password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Current password</label>
              <Input {...passwordForm.register("currentPassword")} type="password" error={passwordForm.formState.errors.currentPassword?.message} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">New password</label>
                <Input {...passwordForm.register("newPassword")} type="password" error={passwordForm.formState.errors.newPassword?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Confirm new password</label>
                <Input {...passwordForm.register("confirmPassword")} type="password" error={passwordForm.formState.errors.confirmPassword?.message} />
              </div>
            </div>
          </CardContent>
          <CardContent className="border-t pt-6">
            <Button type="submit">{t("common.save")}</Button>
          </CardContent>
        </Card>
      </form>

      <form onSubmit={socialForm.handleSubmit(onSocialSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Connect your social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Twitter URL</label>
                <Input {...socialForm.register("twitter")} placeholder="https://twitter.com/username" error={socialForm.formState.errors.twitter?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">GitHub URL</label>
                <Input {...socialForm.register("github")} placeholder="https://github.com/username" error={socialForm.formState.errors.github?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">LinkedIn URL</label>
                <Input {...socialForm.register("linkedin")} placeholder="https://linkedin.com/in/username" error={socialForm.formState.errors.linkedin?.message} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Website</label>
                <Input {...socialForm.register("website")} placeholder="https://example.com" error={socialForm.formState.errors.website?.message} />
              </div>
            </div>
          </CardContent>
          <CardContent className="border-t pt-6">
            <Button type="submit">{t("common.save")}</Button>
          </CardContent>
        </Card>
      </form>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />{t("settings.dangerZone")}</CardTitle>
          <CardDescription>{t("settings.deleteConfirm")}</CardDescription>
        </CardHeader>
        <CardContent>
          {deleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive font-medium">Are you absolutely sure? This action cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />Delete my account
                </Button>
                <Button variant="outline" onClick={() => setDeleteConfirm(false)}>{t("common.cancel")}</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />{t("settings.deleteAccount")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
