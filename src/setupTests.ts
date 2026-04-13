import "@testing-library/jest-dom";
import { vi } from "vitest";

vi.stubEnv("VITE_PUBLIC_SUPABASE_URL", "http://localhost:8000");
vi.stubEnv("VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "dummy-key");
