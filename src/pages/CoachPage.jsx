import { useEffect, useState } from "react";
import { api } from "../api";

export default function CoachPage({ coachId }) {
    const [ageGroups, setAgeGroups] = useState([]);
    const [myDrills, setMyDrills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // form fields
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Beginner");
    const [ageGroupCode, setAgeGroupCode] = useState("");
    const [description, setDescription] = useState("");

    async function loadAgeGroups() {
        try {
            const data = await api.getAgeGroups();
            setAgeGroups(data?.ResultSets?.Table1 ?? []);
        } catch (e) {
            console.error(e);
            setErr(String(e.message ?? e));
        }
    }

    function resetForm() {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setDifficulty("Beginner");
        setAgeGroupCode("");
        setVideoFile(null);
        setThumbFile(null);
    }

    function startEdit(d) {
        setEditingId(d.id);
        setTitle(d.title ?? "");
        setDescription(d.description ?? "");
        setDifficulty(d.difficulty ?? "Beginner");
        setAgeGroupCode(d.ageGroupCode ?? "");
        setVideoFile(null);
        setThumbFile(null);
    }

    async function loadMyDrills() {
        setLoading(true);
        setErr("");
        try {
            const data = await api.getDrills({ coachId });
            const list = Array.isArray(data) ? data : (data?.documents ?? data?.Documents ?? []);
            setMyDrills(list);
        } catch (e) {
            console.error(e);
            setErr(String(e.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function deleteDrill(drillId) {
        if (!confirm("Delete this drill?")) return;
        try {
            await api.deleteDrill(coachId, drillId);
            await loadMyDrills();
        } catch (e) {
            alert(`Delete failed: ${e.message ?? e}`);
        }
    }

    async function uploadFileToFunction(file, container) {
        const form = new FormData();
        form.append("file", file);

        const base = import.meta.env.VITE_UPLOAD_FUNCTION_URL;
        const url = new URL(base);
        url.searchParams.set("container", container);

        const res = await fetch(url.toString(), { method: "POST", body: form });

        if (!res.ok) {
            const t = await res.text();
            throw new Error(`Upload failed: ${res.status} ${t}`);
        }
        return await res.json();
    }

    async function submitDrill(e) {
        e.preventDefault();
        setErr("");

        try {
            if (editingId) {
                await api.updateDrill({
                    id: editingId,
                    coachID: coachId, // IMPORTANT casing
                    title,
                    description,
                    difficulty,
                    ageGroupCode,
                });
                alert("Updated!");
            } else {
                let mediaUrl = "";
                let thumbUrl = "";

                if (videoFile) {
                    const up = await uploadFileToFunction(videoFile, "drills");
                    mediaUrl = up.mediaUrl;
                }
                if (thumbFile) {
                    const upThumb = await uploadFileToFunction(thumbFile, "drills-thumbs");
                    thumbUrl = upThumb.mediaUrl;
                }

                await api.createDrill({
                    coachId,
                    title,
                    description,
                    difficulty,
                    ageGroupCode,
                    mediaUrl,
                    thumbUrl,
                });

                alert("Created!");
            }

            resetForm();
            await loadMyDrills();
        } catch (e2) {
            console.error(e2);
            setErr(String(e2.message ?? e2));
        }
    }

    useEffect(() => {
        loadAgeGroups();
        loadMyDrills();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coachId]);

    return (
        <div className="stack">
            <div className="pageHeader">
                <div>
                    <h1>Coach tools</h1>
                    <p>Create, edit, and manage your drills.</p>
                </div>

                <button className="btn" onClick={loadMyDrills} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            {err && <div className="alert">Error: {err}</div>}

            <section className="card stack">
                <div className="btnRow" style={{ justifyContent: "space-between" }}>
                    <span className="badge badgeStrong">{editingId ? "Editing mode" : "Create mode"}</span>
                    {editingId && (
                        <button className="btn" type="button" onClick={resetForm}>
                            Cancel edit
                        </button>
                    )}
                </div>

                {editingId && (
                    <div className="card" style={{ borderStyle: "dashed", boxShadow: "none" }}>
                        Editing drill. Video and thumbnail cannot be changed here.
                    </div>
                )}

                <form onSubmit={submitDrill} className="stack" style={{ maxWidth: 720 }}>
                    <input
                        className="control"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />

                    <div className="grid4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <select className="control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>

                        <select className="control" value={ageGroupCode} onChange={(e) => setAgeGroupCode(e.target.value)} required>
                            <option value="">Select age group</option>
                            {ageGroups.map((ag) => (
                                <option key={ag.Code} value={ag.Code}>
                                    {ag.Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <textarea
                        className="control"
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />

                    {!editingId && (
                        <div className="grid4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                            <div className="stack" style={{ gap: 8 }}>
                                <div className="smallMuted">Video (optional)</div>
                                <input
                                    className="control"
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                                />
                            </div>

                            <div className="stack" style={{ gap: 8 }}>
                                <div className="smallMuted">Thumbnail (optional)</div>
                                <input
                                    className="control"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setThumbFile(e.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="btnRow">
                        <button className="btn btnPrimary" type="submit">
                            {editingId ? "Update drill" : "Create drill"}
                        </button>
                        <span className="smallMuted">
                            CoachId: <strong>{coachId}</strong>
                        </span>
                    </div>
                </form>
            </section>

            <section className="stack">
                <h2 style={{ margin: "8px 0 0", fontSize: 16, color: "var(--muted)" }}>My drills</h2>

                {myDrills.map((d) => (
                    <div key={d.id} className="card">
                        <div className="cardHeader">
                            <div>
                                <h3 className="cardTitle">{d.title}</h3>
                                <div className="cardMeta">
                                    Difficulty: {d.difficulty} • Age group: {d.ageGroupCode}
                                </div>
                            </div>

                            <div className="btnRow">
                                <button className="btn" onClick={() => startEdit(d)}>
                                    Edit
                                </button>
                                <button className="btn btnDanger" onClick={() => deleteDrill(d.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && myDrills.length === 0 && <div className="card">No drills created yet.</div>}
            </section>
        </div>
    );
}
