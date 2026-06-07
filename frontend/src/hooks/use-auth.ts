import { useEffect, useState, type FormEvent } from "react";

import { getCurrentUser, loginUser, registerUser } from "@/lib/api/auth";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-session";
import { UI_COPY } from "@/lib/copy";
import type { BackendUserDto, User } from "@/types";

function mapBackendUserToUser(user: BackendUserDto): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone ?? "",
    isAdmin: user.is_admin,
  };
}

export function useAuth({
  onNotify,
  onAuthenticated,
  onLogout,
}: {
  onNotify: (message: string) => void;
  onAuthenticated: () => void;
  onLogout: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(() =>
    getAuthToken(),
  );
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(authToken));

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let isMounted = true;
    void Promise.resolve()
      .then(() => {
        if (isMounted) {
          setIsAuthLoading(true);
        }

        return getCurrentUser(authToken);
      })
      .then((backendUser) => {
        if (isMounted) {
          setUser(mapBackendUserToUser(backendUser));
        }
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        clearAuthToken();
        setAuthTokenState(null);
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const hasAcceptedLegalTerms = formData.get("legal_terms") === "on";

    if (!email.includes("@")) {
      onNotify(UI_COPY.toast.invalidEmail);
      return;
    }

    if (password.length < 6) {
      onNotify(UI_COPY.toast.invalidPassword);
      return;
    }

    if (authMode === "register" && !name) {
      onNotify("Введите имя");
      return;
    }

    if (authMode === "register" && !hasAcceptedLegalTerms) {
      onNotify(UI_COPY.legal.registrationAgreementHint);
      return;
    }

    setIsAuthLoading(true);

    try {
      const authResponse =
        authMode === "register"
          ? await registerUser({
              email,
              password,
              name,
              phone: phone || null,
            })
          : await loginUser({
              email,
              password,
            });

      setAuthToken(authResponse.access_token);
      setAuthTokenState(authResponse.access_token);
      setUser(mapBackendUserToUser(authResponse.user));
      onAuthenticated();
      onNotify(
        authMode === "register"
          ? UI_COPY.toast.registered
          : UI_COPY.toast.welcomeBack,
      );
    } catch (error) {
      onNotify(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setAuthTokenState(null);
    setUser(null);
    setIsAuthLoading(false);
    onLogout();
  };

  return {
    user,
    authToken,
    authMode,
    setAuthMode,
    handleAuth,
    logout,
    isAuthLoading,
  };
}
