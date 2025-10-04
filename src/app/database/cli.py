#!/usr/bin/env python3
import sys
import json
from base64 import b64decode
from database import save_experiment, save_experiment_file, create_table
from database import get_all_experiments, save_payload_builder, get_modules
from data import ExperimentData, ExperimentFileData


def main():
    # Ensure tables exist
    create_table()
    # If run with --list, print all experiments
    if len(sys.argv) > 1 and sys.argv[1] == '--list':
        rows = get_all_experiments()
        print(json.dumps(rows))
        return

    # If run with --modules, print available module types
    if len(sys.argv) > 1 and sys.argv[1] == '--modules':
        rows = get_modules()
        print(json.dumps(rows))
        return

    payload = json.load(sys.stdin)
    # payload expected: {"experiment": {user_id, name, description, status}, "files": [{filename, data_b64}]}
    exp = payload.get('experiment')
    files = payload.get('files', [])
    if not exp:
        print(json.dumps({"error": "missing experiment"}))
        sys.exit(2)

    # Save experiment - note: database.save_experiment expects ExperimentData dataclass
    user_id = exp.get('user_id', 0)
    if user_id == 0:
        user_id = None
    # store the original payload JSON as string
    payload_str = json.dumps(payload)
    exp_obj = ExperimentData(user_id=user_id, name=exp.get('name', ''), description=exp.get('description', ''), status=exp.get('status', 'new'), payload=payload_str)
    exp_id = save_experiment(exp_obj)

    # If payload contains payload_builder, save it using save_payload_builder
    builder_id = None
    if 'payload_builder' in payload and payload.get('payload_builder'):
        builder = payload.get('payload_builder')
        # builder expected: {name, bay_width, bay_height, items_json, created_at}
        try:
            builder_obj = {
                'name': builder.get('name'),
                'bay_width': int(builder.get('bay_width') or 0),
                'bay_height': int(builder.get('bay_height') or 0),
                'items_json': json.dumps(builder.get('items') or []),
                'created_at': builder.get('created_at') or None,
            }
            builder_id = save_payload_builder(builder_obj)
        except Exception:
            builder_id = None

    for f in files:
        filename = f.get('filename')
        data_b64 = f.get('data')
        try:
            data = b64decode(data_b64)
        except Exception:
            data = b''
        file_obj = ExperimentFileData(experiment_id=exp_id, filename=filename, file_data=data)
        save_experiment_file(file_obj)

    out = {
        "ok": True,
        "experiment_id": exp_id,
        "experiment": {
            "id": exp_id,
            "name": exp.get('name'),
            "description": exp.get('description'),
            "status": exp.get('status')
        },
        "files_saved": len(files)
    }
    if builder_id:
        out['payload_builder_id'] = builder_id
    print(json.dumps(out))


if __name__ == '__main__':
    main()
