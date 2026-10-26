import devices from "../content/garmin-devices.json";

/** The ranges the watches belong to, in alphabetical order. */
const ranges = ["Approach", "D2", "Descent", "Enduro", "epix", "fēnix", "Forerunner", "Instinct", "MARQ", "Venu", "vívoactive"];

/** The device names without the trademark signs. */
const names = devices.map((device) => device.name.replace(/[®™]/g, ""));

// A watch from a new range must not drop off the list unnoticed.
const unsorted = names.filter((name) => !ranges.some((range) => name.startsWith(`${range} `)));
if (unsorted.length > 0) throw new Error(`Garmin watches in no range: ${unsorted.join(", ")}`);

/** Every watch the Connect IQ app runs on, grouped by range. */
export const garminWatches = ranges.map((range) => ({ range, models: names.filter((name) => name.startsWith(`${range} `)) }));

export const garminWatchCount = devices.length;
