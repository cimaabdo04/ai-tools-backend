"use client";

import { useEffect, useRef } from "react";
import { api } from "@lib/api";

const COOKIE_REF = "affiliate_ref";
const COOKIE_CLICK_ID = "affiliate_click_id";
const COOKIE_TOKEN = "affiliate_token";
const STORAGE_KEY = "affiliate_ref";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60;
const CLICK_DELAY = 5000;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getRefFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

function getTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("token");
}

function removeRefFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("ref");
  url.searchParams.delete("token");
  window.history.replaceState({}, "", url.toString());
}

export function useAffiliateTracker() {
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const refFromUrl = getRefFromUrl();
    const tokenFromUrl = getTokenFromUrl();
    const existingRef = getCookie(COOKIE_REF) || localStorage.getItem(STORAGE_KEY);
    const ref = refFromUrl || existingRef;

    if (!ref) return;

    if (refFromUrl) {
      setCookie(COOKIE_REF, ref, COOKIE_MAX_AGE);
      try { localStorage.setItem(STORAGE_KEY, ref); } catch {}
    }

    let timer: ReturnType<typeof setTimeout>;
    let cleanup: (() => void) | null = null;

    const sendClick = async () => {
      if (timer) clearTimeout(timer);
      try {
        const res = await api.post<any>(`/affiliates/click/${ref}`, { token: tokenFromUrl || undefined });
        const data = res?.data || res;
        if (data?.clickId && data?.token) {
          setCookie(COOKIE_CLICK_ID, data.clickId, COOKIE_MAX_AGE);
          setCookie(COOKIE_TOKEN, data.token, COOKIE_MAX_AGE);
        }
        removeRefFromUrl();
      } catch {}
    };

    const handleScroll = () => {
      if (window.scrollY > 100) {
        sendClick();
        if (cleanup) cleanup();
      }
    };

    timer = setTimeout(() => {
      sendClick();
      if (cleanup) cleanup();
    }, CLICK_DELAY);

    window.addEventListener("scroll", handleScroll, { once: true });
    cleanup = () => window.removeEventListener("scroll", handleScroll);

    return () => {
      if (timer) clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, []);
}
