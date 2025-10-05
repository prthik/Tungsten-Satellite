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

    # If run with --confirm, update the experiment's status
    if len(sys.argv) > 1 and sys.argv[1] == '--confirm':
        from database import update_experiment_confirmation
        payload = json.load(sys.stdin)
        experiment_id = payload.get('experiment_id')
        status = payload.get('status', 'experiment queued')  # Default to queued if not specified
        notes = payload.get('notes', '')
        rows_updated = update_experiment_confirmation(experiment_id, status, notes)
        print(json.dumps({"ok": True, "updated": rows_updated}))
        return


    payload = json.load(sys.stdin)
    # Save all entities from data.py if present in payload
    # UserData
    if 'user' in payload and payload['user']:
        from database import save_user_data
        from data import UserData
        user = payload['user']
        # Map 'credits' to 'credits_available' if present
        if 'credits' in user:
            user['credits_available'] = user.pop('credits')
        # Filter out any fields that aren't in UserData
        allowed_fields = set(UserData.__dataclass_fields__.keys())
        filtered_user = {k: v for k, v in user.items() if k in allowed_fields}
        user_obj = UserData(**filtered_user)
        save_user_data(user_obj)

    # SubscriptionPlan
    if 'subscription_plan' in payload and payload['subscription_plan']:
        from database import create_subscription_plan
        from data import SubscriptionPlan
        plan = payload['subscription_plan']
        # Only pass fields that exist in SubscriptionPlan
        allowed_fields = set(SubscriptionPlan.__dataclass_fields__.keys())
        filtered_plan = {k: v for k, v in plan.items() if k in allowed_fields}
        # Ensure plan_option_id is set and valid
        if 'plan_option_id' not in filtered_plan or filtered_plan['plan_option_id'] in [None, '', 0]:
            # Default to 1 if not set or invalid (should match your frontend default)
            filtered_plan['plan_option_id'] = 1
        plan_obj = SubscriptionPlan(**filtered_plan)
        create_subscription_plan(plan_obj)

    # UserSubscription
    if 'user_subscription' in payload and payload['user_subscription']:
        from database import create_user_subscription
        from data import UserSubscription
        sub = payload['user_subscription']
        sub_obj = UserSubscription(**sub)
        create_user_subscription(sub_obj)

    # PlanOption
    if 'plan_option' in payload and payload['plan_option']:
        from database import create_plan_option
        from data import PlanOption
        option = payload['plan_option']
        option_obj = PlanOption(**option)
        create_plan_option(option_obj)

    # ModuleType
    if 'module_type' in payload and payload['module_type']:
        # ModuleType is static, but you can add if needed
        pass

    # PayloadBuilderData
    builder_id = None
    if 'payload_builder' in payload and payload['payload_builder']:
        builder = payload['payload_builder']
        builder_obj = {
            'name': builder.get('name'),
            'bay_width': int(builder.get('bay_width') or 0),
            'bay_height': int(builder.get('bay_height') or 0),
            'items_json': json.dumps(builder.get('items') or []),
            'created_at': builder.get('created_at') or None,
        }
        builder_id = save_payload_builder(builder_obj)

    # ExperimentData
    exp = payload.get('experiment')
    files = payload.get('files', [])
    if not exp:
        print(json.dumps({"error": "missing experiment"}))
        sys.exit(2)
    payload_str = json.dumps(payload)
    from data import ExperimentData
    exp_obj = ExperimentData(
        name=exp.get('name', ''),
        description=exp.get('description', ''),
        status=exp.get('status', 'pending approval'),
        payload=payload_str,
        notes=exp.get('notes'),
        user_email=exp.get('user_email'),
        created_at=exp.get('created_at'),
        experimentType=exp.get('experimentType'),
        ModulesNeeded=exp.get('ModulesNeeded')
    )
    exp_id = save_experiment(exp_obj)

    # ExperimentFileData
    from data import ExperimentFileData
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
