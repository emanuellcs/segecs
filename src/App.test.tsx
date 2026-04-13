import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";
import { Providers } from "./app/providers";

describe("App Sanity Check", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <Providers>
        <App />
      </Providers>,
    );
    expect(container).toBeTruthy();
  });
});
