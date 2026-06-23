# Debug Session: browser-cannot-open

- Status: OPEN
- Symptom: Browser cannot open the project page.
- Goal: Find whether the failure is caused by dev server status, port binding, network access, proxy/API mismatch, or browser/runtime errors.
- Constraints: No business logic changes before runtime evidence is collected.

## Hypotheses

1. The front-end dev server is not actually running anymore, so the browser has nothing to connect to.
2. The dev server is running, but it is bound or exposed in a way that makes the target URL unreachable from the browser/device.
3. The page shell loads, but startup/runtime errors in the browser prevent rendering, making it look like "cannot open".
4. The front-end page opens, but API or proxy configuration blocks initialization, causing a blank page or request failure.
5. Local firewall or network path blocks access to the LAN address even though the server process started.

## Evidence Plan

- Verify whether front-end and back-end processes are still listening on expected ports.
- Request the target URLs locally and inspect HTTP response status/content.
- Check Vite config and client API base configuration for cross-origin/proxy issues.
- If needed, add minimal instrumentation only after narrowing the failure path.

## Findings

- Confirmed: port `5173` is listening on `0.0.0.0`, and port `4000` is listening for the backend.
- Confirmed: `http://localhost:5173` returns HTTP `200` with the Vite HTML shell.
- Confirmed: `http://192.168.10.231:5173/` also returns HTTP `200` from the same machine.
- Observed: client API base URL is hardcoded fallback `http://localhost:4000/api`, which will fail from other devices unless overridden.
- Pending: whether the user's browser failure is on this machine or another device, and whether the symptom is connection failure, blank page, or API errors.

## User Feedback

- User reported: browser shows local access failure and LAN access returns `HTTP ERROR 502`.

## Additional Evidence

- `Test-NetConnection localhost -Port 5173` succeeded, so the local TCP port is reachable outside the browser.
- WinHTTP proxy is direct, but user Internet Settings proxy is enabled.
- System/browser proxy settings show `ProxyEnable=1` and `ProxyServer=127.0.0.1:10090`.
- Port `10090` is listening and owned by process `mihomo-windows-386`.

## Analysis

- Hypothesis 1 (front-end not running): rejected by listening port and HTTP 200 evidence.
- Hypothesis 2 (binding/exposure issue): rejected for this machine; Vite serves both localhost and LAN address.
- Hypothesis 3 (browser/runtime rendering issue): not supported by current evidence; browser fails before app rendering.
- Hypothesis 4 (API/base URL issue): still relevant for other devices after the page opens, but not the cause of the initial connection failure.
- Hypothesis 5 (proxy/network interception): confirmed as the most likely root cause. Browser traffic is being routed through local proxy `127.0.0.1:10090` (`mihomo-windows-386`), matching the reported refusal/502 symptoms.
