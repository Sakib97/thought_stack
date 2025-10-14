import { throttle } from "lodash";
import { showToast } from "../components/layout/CustomToast";

/**
 * Creates a throttled, localStorage-protected action executor.
 * @param {string} actionKey - Unique key per action (e.g., "comment", "like", "saveDraft")
 * @param {number} intervalMs - Minimum interval between actions (default 5000ms)
 * @param {function} actionFn - The actual async action to execute
 * @returns {function} - Throttled wrapper function to use directly
 */
export function createRateLimitedAction(actionKey, intervalMs = 5000, actionFn) {
    const throttledFn = throttle(async (...args) => {
        const now = Date.now();
        const lastActionTime = localStorage.getItem(`last_${actionKey}_time`);
        const diff = now - (lastActionTime ? parseInt(lastActionTime) : 0);

        // Always handle event.preventDefault() if first arg is an event
        if (args.length > 0 && args[0] && typeof args[0].preventDefault === "function") {
            args[0].preventDefault();
        }

        // LocalStorage-based rate limiting, Prevent bypass via manual requests
        if (diff < intervalMs) {
            const waitSec = Math.ceil((intervalMs - diff) / 1000);
            showToast(`You’re performing ${actionKey} too fast. Wait ${waitSec}s.`, "error");
            return;
        }

        try {
            await actionFn(...args);
            localStorage.setItem(`last_${actionKey}_time`, now.toString());
        } catch (err) {
            console.error(`Error during ${actionKey}:`, err);
            showToast(`Failed to ${actionKey}. Please try again.`, "error");
        }
    }, intervalMs, { trailing: false });

    return throttledFn;
}

/**
 * Creates a burst-aware, localStorage-based rate limiter.
 * If more than `maxCalls` occur within `windowMs`, further calls are blocked.
 *
 * @param {string} actionKey - Unique key for the type of action (e.g. "comment", "like")
 * @param {number} windowMs - Time window in milliseconds (e.g. 5000)
 * @param {number} maxCalls - Allowed number of calls within the window (e.g. 10)
 * @param {function} actionFn - The async action function to run
 * @returns {function} - A throttled version of the actionFn
 */
export function createBurstRateLimitedAction(actionKey, windowMs = 10000, maxCalls = 4, actionFn) {
    const throttledFn = throttle(
        async (...args) => {
            //  Handle form events
            if (args.length > 0 && args[0] && typeof args[0].preventDefault === "function") {
                args[0].preventDefault();
            }

            const now = Date.now();
            const historyKey = `rate_limit_${actionKey}_history`;

            // Retrieve call timestamps
            const history = JSON.parse(localStorage.getItem(historyKey) || "[]");

            // Filter timestamps within current window
            // before letting the next call run, we check how 
            // many recent calls happened within your defined time window (e.g., the last 5 seconds).
            const recentCalls = history.filter((t) => now - t < windowMs);

            // recentCalls = all timestamps within the last 5 seconds (your rate window).
            // maxCalls = how many calls you allow in that window (e.g. 10).
            if (recentCalls.length >= maxCalls) {
                // showToast(
                //     `Too many ${actionKey} actions! Please wait a few seconds.`,
                //     "error"
                // );
                // return;

                // Identify when the earliest call in the window happened
                const earliest = recentCalls[0];
                // Compute how long until that earliest call falls outside the window
                const waitMs = windowMs - (now - earliest);
                const waitSec = Math.ceil(waitMs / 1000);
                // showToast(`Too many ${actionKey}s. Try again in ${waitSec}s.`, "error", "rate-limit-toast");
                showToast(`Too many requests. Try again in ${waitSec}s.`, "error", "rate-limit-toast");
                return;
            }

            
            // Every time the user performs an action (like commenting, liking, or saving a draft),
            // we record its timestamp (now) into a local array (in localStorage):
            recentCalls.push(now);
            localStorage.setItem(historyKey, JSON.stringify(recentCalls));

            try {
                await actionFn(...args);
            } catch (err) {
                console.error(`Error during ${actionKey}:`, err);
                showToast(`Failed to ${actionKey}. Please try again.`, "error");
            }
        },
        100, // slight debounce to avoid duplicate rapid events (100ms)
        { trailing: false }
    );

    return throttledFn;
}