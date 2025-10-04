"use client";

import React, { useState, useRef} from 'react';

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
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        alert('Experiment Created!');
    }
    return (
        <form className="flex flex-col gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div className="flex flex-col">
                <label htmlFor="experimentName" className="mb-2 font-semibold">Experiment Name</label>
                <input type="text" id="experimentName" name="experimentName" className="p-2 border border-neutral-300 rounded" required />
            </div>
            <div className="flex flex-col">
                <label htmlFor="description" className="mb-2 font-semibold">Description</label>
                <textarea id="description" name="description" rows="4" className="p-2 border border-neutral-300 rounded" required></textarea>
            </div>
            <FileUpload files={files} setFiles={setFiles} />
            <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">Create Experiment</button>
        </form>
    )
}