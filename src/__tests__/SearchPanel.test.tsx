/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchPanel from "../components/SearchPanel";
import "@testing-library/jest-dom";

jest.useFakeTimers();

// ---- Lightweight stubs for child components used by SearchPanel ----
jest.mock("../components/ui/ResponsiveTable", () => () => <div data-testid="ResponsiveTable" />);
jest.mock("../components/PrimaryShipmentCard", () => (props: any) => (
  <div data-testid="PrimaryShipmentCard">{props?.item?.id || "card"}</div>
));
jest.mock("next/image", () => (props: any) => <img {...props} alt={props.alt ?? ""} />);

function toURL(input: RequestInfo | URL): URL {
  if (typeof input === "string") return new URL(input, "http://localhost");
  if (input instanceof URL) return input;
  return new URL((input as Request).url, "http://localhost");
}

function okJson(data: any): Response {
  return { ok: true, status: 200, json: async () => data } as unknown as Response;
}

const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
  const url = toURL(input);
  const params = Object.fromEntries(url.searchParams.entries());
  return okJson({
    success: true,
    total: 1,
    items: [{ id: "shp_1", mode: params.mode, company: params.q || "ACME" }],
    source: "Unified",
  });
});
(global as any).fetch = fetchMock;

function getParam(input: string | URL | Request, key: string) {
  const url = toURL(input);
  return url.searchParams.get(key);
}

describe("SearchPanel unified search", () => {
  beforeEach(() => fetchMock.mockClear());

  it("debounces and calls /api/search with selected filters, then paginates", async () => {
    const user = userEvent.setup({ delay: null });
    render(<SearchPanel />);

    const qInput = screen.getByRole("textbox", { name: /company|search/i });
    const originInput = screen.getByRole("textbox", { name: /origin/i });
    const destInput = screen.getByRole("textbox", { name: /destination/i });

    await user.clear(qInput);      await user.type(qInput, "acme global");
    await user.clear(originInput); await user.type(originInput, "LAX");
    await user.clear(destInput);   await user.type(destInput, "JFK");

    const airToggle =
      screen.queryByRole("button", { name: /air/i }) ??
      screen.queryByRole("radio", { name: /air/i });
    if (airToggle) await user.click(airToggle);

    jest.advanceTimersByTime(350);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [firstCallUrl] = fetchMock.mock.calls[0];

    expect(toURL(firstCallUrl).pathname).toBe("/api/search");
    expect(getParam(firstCallUrl, "q")).toBe("acme global");
    expect(getParam(firstCallUrl, "origin")).toBe("LAX");
    expect(getParam(firstCallUrl, "destination")).toBe("JFK");

    const mode = getParam(firstCallUrl, "mode");
    expect(mode === "air" || mode === "ocean" || mode === "all").toBe(true);
    expect(getParam(firstCallUrl, "limit")).toBeTruthy();
    expect(getParam(firstCallUrl, "offset")).toBe("0");

    // Pagination next → offset increases
    const nextBtn = screen.queryByRole("button", { name: /next/i });
    if (nextBtn) {
      await user.click(nextBtn);
      jest.advanceTimersByTime(10);
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
      const [secondCallUrl] = fetchMock.mock.calls[1];
      const firstOffset = parseInt(getParam(firstCallUrl, "offset") || "0", 10);
      const secondOffset = parseInt(getParam(secondCallUrl, "offset") || "0", 10);
      expect(secondOffset).toBeGreaterThan(firstOffset);
    }
  });
});
