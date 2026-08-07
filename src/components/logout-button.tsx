"use client";

import { logout } from "@/lib/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium text-ink/70 hover:text-ink hover:bg-gold-light/30 transition-colors"
      >
        Sair
      </button>
    </form>
  );
}
