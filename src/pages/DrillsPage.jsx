import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";

export default function DrillsPage({ userId }) {
    const [ageGroups, setAgeGroups] = useState([]);
    const [drills, setDrills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const PLACEHOLDER_THUMB = "/placeholder-thumb.png";

    // filters
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [ageGroupCode, setAgeGroupCode] = useState("");
    const [coachId, setCoachId] = useState("");

    const filters = useMemo(() => {
        const f = {};
        if (title.trim()) f.title = title.trim();
        if (difficulty) f.difficulty = difficulty;
        if (ageGroupCode) f.ageGroupCode = ageGroupCode;
        if (coachId) f.coachId = Number(coachId);
        return f;
    }, [title, difficulty, ageGroupCode, coachId]);

    async function loadAgeGroups() {
        setErr("");
        try {
            const data = await api.getAgeGroups();
            setAgeGroups(data?.ResultSets?.Table1 ?? []);
        } catch (e) {
            console.error(e);
            setErr(String(e.message ?? e));
        }
    }

    async function loadDrills() {
        setLoading(true);
        setErr("");
        try {
            const data = await api.getDrills(filters);
            setDrills(Array.isArray(data) ? data : (data?.documents ?? data?.Documents ?? []));
        } catch (e) {
            console.error(e);
            setErr(String(e.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function saveFav(drillId) {
        try {
            await api.saveFavourite(userId, drillId);
            alert("Saved!");
        } catch (e) {
            alert(`Save failed: ${e.message ?? e}`);
        }
    }

    useEffect(() => {
        loadAgeGroups();
        loadDrills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="stack">
            <div className="pageHeader">
                <div>
                    <h1>Drills</h1>
                    <p>Search by title, difficulty, age group, or coach.</p>
                </div>

                <span className="badge badgeStrong">{drills.length} results</span>
            </div>

            <section className="card">
                <div className="grid4">
                    <input
                        className="control"
                        placeholder="Search title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <select className="control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="">All difficulties</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>

                    <select className="control" value={ageGroupCode} onChange={(e) => setAgeGroupCode(e.target.value)}>
                        <option value="">All age groups</option>
                        {ageGroups
                            .filter((ag) => (ag.Code ?? "").toLowerCase() !== "all")
                            .map((ag) => (
                                <option key={ag.Code} value={ag.Code}>
                                    {ag.Name}
                                </option>
                            ))}
                    </select>

                    <input
                        className="control"
                        placeholder="CoachId (optional)"
                        value={coachId}
                        onChange={(e) => setCoachId(e.target.value)}
                    />
                </div>

                <div className="btnRow" style={{ marginTop: 12 }}>
                    <button className="btn btnPrimary" onClick={loadDrills} disabled={loading}>
                        {loading ? "Loading..." : "Search"}
                    </button>

                    <span className="smallMuted">Tip: leave fields blank to see everything.</span>
                </div>

                {err && <div className="alert" style={{ marginTop: 12 }}>Error: {err}</div>}
            </section>

            <section className="stack">
                {drills.map((d) => (
                    <div key={d.id} className="card">
                        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                            <Link to={`/drills/${d.id}`} style={{ display: "block" }}>
                                <img
                                    className="thumb"
                                    src={d.thumbUrl || PLACEHOLDER_THUMB}
                                    alt=""
                                    onError={(e) => {
                                        e.currentTarget.src = PLACEHOLDER_THUMB;
                                    }}
                                />
                            </Link>

                            <div style={{ flex: 1, minWidth: 0 }} className="stack">
                                <div className="cardHeader">
                                    <div style={{ minWidth: 0 }}>
                                        <h3 className="cardTitle" style={{ margin: 0 }}>
                                            <Link to={`/drills/${d.id}`}>{d.title}</Link>
                                        </h3>
                                        <div className="cardMeta">
                                            Difficulty: {d.difficulty} • Age group: {d.ageGroupCode} • Coach: {d.coachId}
                                        </div>
                                    </div>

                                    <button className="btn" onClick={() => saveFav(d.id)}>
                                        Save
                                    </button>
                                </div>

                                {d.description && <div className="smallMuted">{d.description}</div>}
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && drills.length === 0 && <div className="card">No drills found.</div>}
            </section>
        </div>
    );
}
