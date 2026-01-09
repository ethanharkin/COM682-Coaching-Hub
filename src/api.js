import { config } from "./config";

async function postJson(url, body) {
    if (!url) throw new Error("Missing API URL in .env");

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);

    // Some Logic Apps return empty body; handle that
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text;
    }
}

export const api = {
    // drills
    getDrills: (filters) => postJson(config.getDrillsUrl, filters),

    // age groups (if yours is POST, keep this; if GET, tell me and I’ll change it)
    getAgeGroups: () => postJson(config.getAgeGroupsUrl, {}),

    // favourites
    saveFavourite: (userId, drillId) => postJson(config.saveFavUrl, { userId, drillId }),
    unsaveFavourite: (userId, drillId) => postJson(config.unsaveFavUrl, { userId, drillId }),
    getFavourites: (userId) => postJson(config.getFavUrl, { userId }),

    // coach
    createDrill: (payload) => postJson(config.createDrillUrl, payload),
    deleteDrill: (coachId, drillId) => postJson(config.deleteDrillUrl, { coachId, drillId }),
    uploadMedia: (payload) => postJson(config.uploadMediaUrl, payload),
    getMediaSas: (container, fileName) => postJson(config.getMediaUrl, { container, fileName }),
    getUploadSas: (payload) => postJson(config.getUploadSasUrl, payload),
    updateDrill: (payload) => postJson(config.updateDrillUrl, payload),


};
