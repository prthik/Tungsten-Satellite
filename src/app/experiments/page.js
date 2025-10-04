import React from 'react';
import ExperimentForm from "./components/experimentform";

export default function ExperimentsPage() {
    return (
    <main className="container">
      <h1 className="page-title">Create Experiment</h1>
      <ExperimentForm />
    </main>
    )
}