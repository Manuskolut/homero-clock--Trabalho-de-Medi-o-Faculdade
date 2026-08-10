"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/logout-button";
import { ClockLogoIcon } from "@/components/icons/clock-logo";
import { calcularAngulosRelogio } from "@/lib/format";
import type { Session } from "@/lib/dal";

const NAV_LINKS = [
  { href: "/", label: "Painel" },
  { href: "/clientes", label: "Clientes" },
  { href: "/ordens", label: "Ordens de Serviço" },
  { href: "/oficinas", label: "Oficinas" },
  { href: "/pecas", label: "Peças" },
  { href: "/alertas", label: "Prazos" },
  { href: "/busca", label: "Histórico / Garantia" },
];

// Detecta se há conteúdo além das bordas visíveis de um elemento com rolagem
// horizontal, pra mostrar/esconder o fade indicador nas pontas.
function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function atualizar() {
      if (!el) return;
      setEdges({
        left: el.scrollLeft > 2,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
      });
    }

    atualizar();
    el.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      el.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, []);

  return { ref, ...edges };
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function HeaderNav({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const { ref: navRef, left: temMaisEsquerda, right: temMaisDireita } =
    useScrollEdges<HTMLElement>();

  // "Administração" entra antes do último item (Histórico/Garantia).
  const navLinks = session?.tipo === "ADMIN"
    ? [
        ...NAV_LINKS.slice(0, -1),
        { href: "/admin/contas", label: "Administração" },
        NAV_LINKS[NAV_LINKS.length - 1],
      ]
    : NAV_LINKS;

  // Cabeçalho não aparece na tela de login (layout próprio, sem navegação).
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-30 border-b border-gold-light/50 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20 gap-6">
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 group"
            onClick={() => setMenuAberto(false)}
          >
            <ClockMark className="h-10 w-10 text-gold transition-transform group-hover:rotate-12" />
            <div className="leading-tight">
              <div
                className="font-serif text-xl sm:text-2xl tracking-wide text-gold"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                HOMERO CLOCK
              </div>
              <div className="text-[10px] sm:text-xs tracking-[0.35em] text-gray uppercase -mt-0.5">
                Relojóias
              </div>
            </div>
          </Link>

          {session && (
            <>
              {/* Navegação completa — telas médias/grandes (md+) */}
              <div className="hidden md:block relative min-w-0">
                <nav
                  ref={navRef}
                  className="flex items-center gap-1 overflow-x-auto scrollbar-hide uppercase"
                >
                  {navLinks.map((link) => {
                    const active = isActive(pathname, link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={clsx(
                          "whitespace-nowrap px-3 py-2 rounded-md text-[11.2px] font-medium transition-colors",
                          active
                            ? "bg-gold text-white shadow-sm"
                            : "text-ink/70 hover:text-ink hover:bg-gold-light/30"
                        )}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                {temMaisEsquerda && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-cream to-transparent" />
                )}
                {temMaisDireita && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-cream to-transparent" />
                )}
              </div>

              <div className="hidden md:flex items-center gap-2 shrink-0 pl-2 border-l border-gold-light/40">
                <span className="hidden lg:inline text-xs text-gray whitespace-nowrap">
                  {session.tipo === "ADMIN" ? "Admin" : "Loja"} · {session.nome}
                </span>
                <LogoutButton />
              </div>

              {/* Botão hambúrguer — telas estreitas (abaixo de md) */}
              <button
                type="button"
                onClick={() => setMenuAberto((v) => !v)}
                aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                aria-expanded={menuAberto}
                className="md:hidden inline-flex items-center justify-center h-11 w-11 shrink-0 rounded-lg text-ink hover:bg-gold-light/20 transition-colors"
              >
                {menuAberto ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </>
          )}
        </div>

        {session && menuAberto && (
          <nav className="md:hidden flex flex-col gap-1 pb-4 uppercase">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className={clsx(
                    "px-3 py-3 rounded-md text-[11.2px] font-medium transition-colors",
                    active
                      ? "bg-gold text-white shadow-sm"
                      : "text-ink/70 hover:text-ink hover:bg-gold-light/30"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex items-center justify-between gap-2 mt-2 pt-3 border-t border-gold-light/40">
              <span className="text-xs text-gray">
                {session.tipo === "ADMIN" ? "Admin" : "Loja"} · {session.nome}
              </span>
              <LogoutButton />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

// Pose decorativa usada antes da montagem no cliente (evita divergência de
// hidratação entre servidor e navegador) — depois disso os ponteiros passam a
// refletir a hora real do computador do usuário, atualizando a cada minuto.
const POSE_INICIAL = { hourDeg: 300, minuteDeg: 60 };

function useRelogioAtual() {
  const [angulos, setAngulos] = useState<{ hourDeg: number; minuteDeg: number } | null>(
    null
  );

  useEffect(() => {
    function atualizar() {
      setAngulos(calcularAngulosRelogio());
    }

    atualizar();
    const msAteProximoMinuto = (60 - new Date().getSeconds()) * 1000;
    const timeoutId = setTimeout(() => {
      atualizar();
    }, msAteProximoMinuto);
    const intervalId = setInterval(atualizar, 60_000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  return angulos ?? POSE_INICIAL;
}

function ClockMark({ className }: { className?: string }) {
  const { hourDeg, minuteDeg } = useRelogioAtual();

  return (
    <ClockLogoIcon className={className} hourDeg={hourDeg} minuteDeg={minuteDeg} animado />
  );
}
