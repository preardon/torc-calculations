import { useState, useEffect } from 'react';
import mondaySdk from 'monday-sdk-js';

const monday = mondaySdk();

interface Column {
    id: string;
    title: string;
    type: string;
}

export default function FormulaEditor() {
    const [formula, setFormula] = useState("");
    const [columns, setColumns] = useState<Column[]>([]);
    const [targetColumn, setTargetColumn] = useState("");

    useEffect(() => {
        // 1. Get Context to find Board ID
        monday.get("context").then((res: any) => {
            const boardId = res.data?.boardId || res.data?.boardIds?.[0];
            if (boardId) {
                fetchColumns(boardId);
            }
        });
    }, []);

    const fetchColumns = async (boardId: number) => {
        try {
            const query = `query {
        boards (ids: [${boardId}]) {
          columns {
            id
            title
            type
          }
        }
      }`;
            const res = await monday.api(query);
            if (res.data?.boards?.[0]?.columns) {
                setColumns(res.data.boards[0].columns);
            }
        } catch (err) {
            console.error("Failed to fetch columns", err);
        }
    };

    const insertColumn = (colId: string) => {
        setFormula(prev => prev + ` {${colId}} `);
    };

    const saveConfiguration = async () => {
        // Save to Monday Integration Settings
        // For a Custom Action, we usually map input fields.
        // Monday SDK 'set' settings might not be enough for Custom Actions which use the recipe configuration.
        // BUT, usually the app just provides the UI, and the user copies values OR the app uses monday.execute('closeWebhookAppWindow', ...) if it's a modal.
        // For an Integration Recipe configuration field (Custom Field), we use:
        // monday.set("settings", { ... }); - this updates the widget settings, but for Integrations it updates the configuration.

        await monday.set("settings", { formula, targetColumnId: targetColumn });
        monday.execute("notice", {
            message: "Configuration Saved!",
            type: "success",
            timeout: 2000,
        });
    };

    return (
        <div style={{ padding: '20px', textAlign: 'left' }}>
            <h3>Formula Configuration</h3>

            <div style={{ marginBottom: '15px' }}>
                <label>Target Column (Save Result To):</label>
                <select
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value)}
                    style={{ display: 'block', margin: '5px 0', padding: '5px', width: '100%' }}
                >
                    <option value="">Select a column...</option>
                    {columns.map(c => (
                        <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Formula:</label>
                <textarea
                    rows={4}
                    value={formula}
                    onChange={(e) => setFormula(e.target.value)}
                    style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                    placeholder="e.g. {numbers} * 2"
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h4>Insert Column:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {columns.map(c => (
                        <button
                            key={c.id}
                            onClick={() => insertColumn(c.id)}
                            style={{ padding: '5px 10px', cursor: 'pointer' }}
                        >
                            {c.title}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={saveConfiguration}
                style={{ padding: '10px 20px', background: '#0073ea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Save Configuration
            </button>
        </div>
    );
}
