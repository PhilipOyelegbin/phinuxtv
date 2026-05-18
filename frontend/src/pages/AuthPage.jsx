import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const registerSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
});

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
});

const forgotSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const resetSchema = yup.object({
  password: yup
    .string()
    .min(8, "Use at least 8 characters")
    .required("Password is required"),
});

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [infoMessage, setInfoMessage] = useState("");
  const [generatedResetUrl, setGeneratedResetUrl] = useState("");
  const tokenFromQuery = searchParams.get("token") || "";
  const {
    token,
    login,
    register: registerUser,
    forgotPassword,
    resetPassword,
    isLoading,
    error,
  } = useAuthStore();
  const {
    register: bind,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(
      mode === "register"
        ? registerSchema
        : mode === "forgot"
          ? forgotSchema
          : mode === "reset"
            ? resetSchema
            : loginSchema,
    ),
  });

  useEffect(() => {
    if ((mode === "login" || mode === "register") && token) {
      navigate("/", { replace: true });
    }
  }, [mode, navigate, token]);

  useEffect(() => {
    reset({ email: "", password: "", name: "" });
    setInfoMessage("");
    setGeneratedResetUrl("");
  }, [mode, reset]);

  const onSubmit = async (values) => {
    if (mode === "login") {
      await login(values);
      navigate("/", { replace: true });
      return;
    }

    if (mode === "register") {
      await registerUser(values);
      navigate("/", { replace: true });
      return;
    }

    if (mode === "forgot") {
      const response = await forgotPassword(values);
      setInfoMessage(
        response.message ||
          "If an account exists for this email, a reset link has been generated.",
      );
      setGeneratedResetUrl("");
      return;
    }

    if (!tokenFromQuery) {
      setInfoMessage("Reset token missing from URL. Request a new reset link.");
      return;
    }

    await resetPassword({
      token: tokenFromQuery,
      password: values.password,
    });
    navigate("/login", { replace: true });
  };

  const heading =
    mode === "login"
      ? "Welcome back"
      : mode === "register"
        ? "Create your account"
        : mode === "forgot"
          ? "Forgot password"
          : "Reset password";

  const submitLabel =
    mode === "login"
      ? "Sign in"
      : mode === "register"
        ? "Create account"
        : mode === "forgot"
          ? "Send reset link"
          : "Reset password";

  const panelModeLabel =
    mode === "forgot" ? "recover" : mode === "reset" ? "reset" : mode;

  const showPasswordField =
    mode === "login" || mode === "register" || mode === "reset";
  const showEmailField =
    mode === "login" || mode === "register" || mode === "forgot";

  const helperLine =
    mode === "login"
      ? "No account yet?"
      : mode === "register"
        ? "Already registered?"
        : mode === "forgot"
          ? "Remembered your password?"
          : "Need a new reset link?";

  const helperLinkTo =
    mode === "login"
      ? "/register"
      : mode === "register"
        ? "/login"
        : mode === "forgot"
          ? "/login"
          : "/forgot-password";

  const helperLinkLabel =
    mode === "login"
      ? "Register now"
      : mode === "register"
        ? "Login now"
        : mode === "forgot"
          ? "Back to login"
          : "Request reset";

  return (
    <div className="grid min-h-screen place-items-center px-4 py-12">
      <div className="glass grid w-full max-w-5xl overflow-hidden rounded-[32px] border-white/10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-8 sm:p-12 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 grid-fade opacity-20" />
          <div className="relative space-y-6">
            <div className="inline-flex rounded-full border border-mint-300/20 bg-mint-400/10 px-4 py-2 text-xs uppercase tracking-[0.32em] text-mint-300">
              Watch smarter
            </div>
            <div>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight sm:text-6xl">
                PhinuxTV keeps your movies, taste, and watch history in sync.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                Create an account to save favorites, like films, stream
                instantly, and get recommendations based on what you actually
                watch.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Auth", "JWT + Argon2"],
                ["Library", "Search and save"],
                ["Replay", "Watch history"],
              ].map(([title, subtitle]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-sm font-semibold text-white">
                    {title}
                  </div>
                  <div className="mt-1 text-sm text-white/55">{subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-8 sm:p-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-white/40">
                {panelModeLabel}
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-white">
                {heading}
              </h2>
            </div>
            {mode === "register" && (
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Full name</span>
                <input
                  {...bind("name")}
                  className="w-full rounded-2xl border border-white/10 bg-ink-800/80 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-mint-400/50"
                  placeholder="Avery Stone"
                />
                {errors.name && (
                  <p className="text-sm text-ember-400">
                    {errors.name.message}
                  </p>
                )}
              </label>
            )}
            {showEmailField && (
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Email</span>
                <input
                  {...bind("email")}
                  className="w-full rounded-2xl border border-white/10 bg-ink-800/80 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-mint-400/50"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-ember-400">
                    {errors.email.message}
                  </p>
                )}
              </label>
            )}
            {showPasswordField && (
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Password</span>
                <input
                  type="password"
                  {...bind("password")}
                  className="w-full rounded-2xl border border-white/10 bg-ink-800/80 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-mint-400/50"
                  placeholder="At least 8 characters"
                />
                {errors.password && (
                  <p className="text-sm text-ember-400">
                    {errors.password.message}
                  </p>
                )}
              </label>
            )}
            {mode === "login" && (
              <p className="text-sm text-white/55">
                <Link
                  className="text-mint-300 underline-offset-4 hover:underline"
                  to="/forgot-password"
                >
                  Forgot password?
                </Link>
              </p>
            )}
            {error && (
              <div className="rounded-2xl border border-ember-400/30 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
                {error}
              </div>
            )}
            {infoMessage && (
              <div className="rounded-2xl border border-mint-300/30 bg-mint-400/10 px-4 py-3 text-sm text-mint-200">
                <div>{infoMessage}</div>
                {generatedResetUrl && (
                  <a
                    href={generatedResetUrl}
                    className="mt-2 inline-block text-mint-200 underline underline-offset-4"
                  >
                    Open reset link
                  </a>
                )}
              </div>
            )}
            <button
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-mint-400 to-ember-500 px-5 py-3.5 text-sm font-semibold text-ink-950 transition hover:brightness-110 disabled:opacity-60"
            >
              {isLoading ? "Please wait..." : submitLabel}
            </button>
            <p className="text-sm text-white/55">
              {helperLine}{" "}
              <Link
                className="text-mint-300 underline-offset-4 hover:underline"
                to={helperLinkTo}
              >
                {helperLinkLabel}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
