import { useEffect, useState } from "react";
import { api } from "../api";

export default function FavouritesPage({ userId }) {
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [favs, setFavs] = useState([]);

    async function loadFavs() {
        setLoading(true);
        setErr("");
        try {
            const data = await api.getFavourites(userId);
            const list = Array.isArray(data) ? data : (data?.documents ?? data?.Documents ?? data?.value ?? []);
            setFavs(list);
        } catch (e) {
            console.error(e);
            setErr(String(e.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function unsave(drillId) {
        try {
            await api.unsaveFavourite(userId, drillId);
            await loadFavs();
        } catch (e) {
            alert(`Unsave failed: ${e.message ?? e}`);
        }
    }

    useEffect(() => {
        loadFavs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="stack">
            <div className="pageHeader">
                <div>
                    <h1>Favourites</h1>
                    <p>Your saved drills in one place.</p>
                </div>

                <button className="btn" onClick={loadFavs} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {err && <div className="alert">Error: {err}</div>}
            {!loading && favs.length === 0 && <div className="card">No favourites yet.</div>}

            <section className="stack">
                {favs.map((d) => (
                    <div key={d.id} className="card stack">
                        <div className="cardHeader">
                            <div>
                                <h3 className="cardTitle">{d.title}</h3>
                                <div className="cardMeta">
                                    Difficulty: {d.difficulty} • Age group: {d.ageGroupCode} • Coach: {d.coachId}
                                </div>
                            </div>

                            <button className="btn btnDanger" onClick={() => unsave(d.id)}>
                                Unsave
                            </button>
                        </div>

                        {d.description && <div className="smallMuted">{d.description}</div>}
                    </div>
                ))}
            </section>
        </div>
    );
}
