import type { ReactNode } from "react";
import { getCurrentUserId } from "@/lib/apiClient";

function parseHashTokens() {
    const hash = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const refresh = params.get("refresh");
    if (!token) return;

    localStorage.setItem("uf_token", token);
    if (refresh) localStorage.setItem("uf_refresh", refresh);
    window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
    );
}

interface Props {
    children: ReactNode;
}

export function AuthGuard({ children }: Props) {
    parseHashTokens();

    if (import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true') {
        return <>{children}</>;
    }

    if (!getCurrentUserId()) {
        const redirect = encodeURIComponent(window.location.href);
        window.location.href = `https://auth.urbanflow.lazyy.fr/login?app=incident&redirect=${redirect}`;
        return null;
    }
    return <>{children}</>;
}
