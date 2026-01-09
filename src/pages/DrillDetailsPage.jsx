import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

export default function DrillDetailsPage() {
    const { id } = useParams();
    const [drill, setDrill] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function load() {
        setLoading(true);
        setErr("");

        try {
            const data = await api.getDrills({ drillId: id });
            const list = Array.isArray(data) ? data : (data?.documents ?? data?.Documents ?? []);
            const d = list[0] ?? null;
            setDrill(d);
        } catch (e) {
            console.error(e);
            setErr(String(e.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    return (
        <div className="stack">
            <div className="btnRow">
                <Link className="btn" to="/drills">
                    ← Back to drills
                </Link>
            </div>

            {loading && <div className="card">Loading...</div>}
            {err && <div className="alert">Error: {err}</div>}
            {!loading && !err && !drill && <div className="card">Drill not found.</div>}

            {drill && (
                <div className="card stack">
                    <div className="pageHeader" style={{ margin: 0 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 22 }}>{drill.title}</h1>
                            <p>
                                Difficulty: <strong>{drill.difficulty}</strong> • Age group: <strong>{drill.ageGroupCode}</strong> • Coach:{" "}
                                <strong>{drill.coachId}</strong>
                            </p>
                        </div>

                        <span className="badge badgeStrong">Drill #{drill.id}</span>
                    </div>

                    {drill.description && <div className="smallMuted">{drill.description}</div>}

                    <div className="stack">
                        <div className="badge">Video</div>

                        {drill.mediaUrl ? (
                            <video
                                controls
                                style={{
                                    width: "100%",
                                    borderRadius: 14,
                                    border: "1px solid var(--border)",
                                    background: "rgba(0,0,0,0.2)",
                                }}
                            >
                                <source src={drill.mediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="card" style={{ borderStyle: "dashed", boxShadow: "none" }}>
                                <strong>Video:</strong> none uploaded yet
                            </div>
                        )}
                    </div>

                    <div className="grid4" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 6 }}>
                        <div className="card" style={{ boxShadow: "none" }}>
                            <div className="smallMuted">Difficulty</div>
                            <div style={{ fontWeight: 700 }}>{drill.difficulty}</div>
                        </div>
                        <div className="card" style={{ boxShadow: "none" }}>
                            <div className="smallMuted">Age group</div>
                            <div style={{ fontWeight: 700 }}>{drill.ageGroupCode}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
