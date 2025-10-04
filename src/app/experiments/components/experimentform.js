"use client";

import React, { useState, useRef, useEffect } from 'react';

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;



function FileUpload({ files, setFiles }) {
    const fileInputRef = useRef();
    const [error, setError] = useState('');

    const handleFiles = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > MAX_FILES) {
            setError(`You can upload up to ${MAX_FILES} files.`);
            return;
        }
        for (let file of selectedFiles) {
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`Each file must be less than ${MAX_SIZE_MB} MB.`);
                return;
            }
        }
        setFiles([...files, ...selectedFiles]);
        setError('');
    };

    const removeFile = (index) => {
        const newFiles = files.slice();
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    return (
        <div className="flex flex-col">
            <label className="mb-2 font-semibold">Upload Files</label>
            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFiles}
                className="block w-fit cursor-pointer rounded bg-gray-100 px-4 py-2 text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-200 transition"
            />
            {error && <div className="text-red-600 mt-2">{error}</div>}
            <ul className="mt-2">
                {files.map((file, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <button
                            type="button"
                            className="text-red-500 ml-2"
                            onClick={() => removeFile(idx)}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
            <div className="text-sm text-neutral-500 mt-1">
                Max {MAX_FILES} files, each ≤ {MAX_SIZE_MB}MB
            </div>
        </div>
    );
}

export default function ExperimentForm() {
    const [files, setFiles] = useState([]);
    const [modules, setModules] = useState([]);
    const [useBuilder, setUseBuilder] = useState(false);
    const [builder, setBuilder] = useState({ name: '', bay_width: 4, bay_height: 4, items: [] });
    const [success, setSuccess] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.experimentName.value;
        const description = form.description.value;

        // Convert files to base64
        const readFileAsBase64 = (file) => new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result.split(',')[1]);
            reader.onerror = rej;
            reader.readAsDataURL(file);
        });

        const filesPayload = await Promise.all(files.map(async (f) => ({
            filename: f.name,
            data: await readFileAsBase64(f),
        })));

        const payload = {
            experiment: {
                // send null for user_id when not authenticated to avoid FK failures
                user_id: null,
                name,
                description,
                status: 'new'
            },
            payload_builder: useBuilder ? builder : null,
            files: filesPayload
        };

        try {
            const res = await fetch('/api/experiments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            console.log('API response status:', res.status, 'body:', data);
            if (data.ok) {
                // show inline success with returned data
                setSuccess(data);
                setShowModal(true);
                form.reset();
                setFiles([]);
                // refresh list of submissions
                fetchSubmissions()
            } else {
                alert('Failed: ' + (data.error || 'unknown'));
            }
        } catch (err) {
            alert('Error: ' + String(err));
        }
    }

    // debug: log success changes and auto-close modal after 5s
    useEffect(() => {
        if (!success) return;
        console.log('Saved experiment:', success);
    }, [success]);

    useEffect(() => {
        if (!showModal) return;
        const t = setTimeout(() => setShowModal(false), 5000);
        return () => clearTimeout(t);
    }, [showModal]);

    async function fetchSubmissions() {
        try {
            const res = await fetch('/api/experiments');
            const data = await res.json();
            setSubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch submissions', err);
        }
    }

    async function fetchModules() {
        try {
            const res = await fetch('/api/modules');
            const data = await res.json();
            setModules(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch modules', err);
        }
    }

    useEffect(() => { fetchSubmissions(); fetchModules(); }, []);

    function addBuilderItem() {
        setBuilder(b => ({ ...b, items: [...(b.items||[]), { module_id: modules[0]?.id || null, x: 0, y: 0, label: '' }] }))
    }

    function updateBuilderItem(idx, changes) {
        setBuilder(b => {
            const items = (b.items||[]).slice();
            items[idx] = { ...items[idx], ...changes };
            return { ...b, items };
        })
    }

    function removeBuilderItem(idx) {
        setBuilder(b => {
            const items = (b.items||[]).slice();
            items.splice(idx, 1);
            return { ...b, items };
        })
    }
    
}